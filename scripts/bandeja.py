#!/usr/bin/env python3
"""Bandeja de prensa de Por la Anarquía.

Lee los RSS/Atom de `datos/fuentes.json`, se queda con lo publicado en las
últimas horas y arma un Markdown con enlaces para revisar. No publica nada en
el portal: solo junta material.

    python3 scripts/bandeja.py                      # imprime en pantalla
    python3 scripts/bandeja.py --salida bandeja.md  # escribe un archivo
    python3 scripts/bandeja.py --horas 72 --pais CL # ventana y filtro

Sin dependencias: solo la biblioteca estándar.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
import unicodedata
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
FUENTES = RAIZ / "datos" / "fuentes.json"
UA = "Mozilla/5.0 (compatible; PorLaAnarquia/1.0; +https://porlaanarquia.antarquia.cl)"
MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
MESES_LARGOS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
                "agosto", "septiembre", "octubre", "noviembre", "diciembre"]

NS = {"atom": "http://www.w3.org/2005/Atom", "dc": "http://purl.org/dc/elements/1.1/"}
ETIQUETAS = {
    "anarquista": "anarquista",
    "anarcosindicalista": "anarcosindicalista",
    "pueblo mapuche": "pueblo mapuche",
    "contrainformación": "contrainformación",
    "investigación": "investigación",
}


def sin_tildes(texto: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFD", texto.lower())
        if unicodedata.category(c) != "Mn"
    )


def limpiar(texto: str, limite: int = 240) -> str:
    """Quita HTML, entidades y espacios repetidos; recorta en palabra."""
    texto = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", texto or "", flags=re.S | re.I)
    texto = re.sub(r"<[^>]+>", " ", texto)
    texto = html.unescape(texto)
    texto = re.sub(r"\s+", " ", texto).strip()
    if len(texto) <= limite:
        return texto
    corte = texto[:limite].rsplit(" ", 1)[0].rstrip(" ,.;:")
    return corte + "…"


def fecha_de(texto: str | None) -> datetime | None:
    if not texto:
        return None
    texto = texto.strip()
    try:
        return parsedate_to_datetime(texto)
    except (TypeError, ValueError):
        pass
    for formato in ("%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%d"):
        try:
            return datetime.strptime(texto.replace("Z", "+0000"), formato)
        except ValueError:
            continue
    try:
        return datetime.fromisoformat(texto.replace("Z", "+00:00"))
    except ValueError:
        return None


def canonical(url: str) -> str:
    """Sin parámetros de campaña, para no duplicar el mismo enlace."""
    url = url.split("#", 1)[0]
    if "?" not in url:
        return url
    base, consulta = url.split("?", 1)
    pares = [
        p for p in consulta.split("&")
        if p and not re.match(r"^(utm_|fbclid|gclid|mc_|ref=)", p)
    ]
    return base + ("?" + "&".join(pares) if pares else "")


def descargar(url: str, timeout: int = 25) -> bytes:
    peticion = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml"})
    with urllib.request.urlopen(peticion, timeout=timeout) as respuesta:
        return respuesta.read()


def leer_feed(contenido: bytes) -> list[dict]:
    raiz = ET.fromstring(contenido)
    if raiz.tag.endswith("feed"):
        entradas = raiz.findall("atom:entry", NS)
        tipo = "atom"
    else:
        entradas = raiz.findall(".//item")
        tipo = "rss"

    salida = []
    for entrada in entradas:
        if tipo == "atom":
            titulo = entrada.findtext("atom:title", default="", namespaces=NS)
            enlace = ""
            for link in entrada.findall("atom:link", NS):
                if link.get("rel", "alternate") == "alternate":
                    enlace = link.get("href", "")
                    break
            resumen = (
                entrada.findtext("atom:summary", default="", namespaces=NS)
                or entrada.findtext("atom:content", default="", namespaces=NS)
            )
            fecha = (
                entrada.findtext("atom:published", default="", namespaces=NS)
                or entrada.findtext("atom:updated", default="", namespaces=NS)
            )
        else:
            titulo = entrada.findtext("title", default="")
            enlace = entrada.findtext("link", default="") or entrada.findtext("guid", default="")
            resumen = (
                entrada.findtext("description", default="")
                or entrada.findtext("{%s}encoded" % "http://purl.org/rss/1.0/modules/content/", default="")
            )
            fecha = (
                entrada.findtext("pubDate", default="")
                or entrada.findtext("dc:date", default="", namespaces=NS)
            )
        salida.append({
            "titulo": limpiar(titulo, 200),
            "enlace": canonical(enlace.strip()),
            "resumen": limpiar(resumen),
            "fecha": fecha_de(fecha),
        })
    return salida


def carga_fuentes(ruta: Path) -> tuple[list[str], list[dict]]:
    datos = json.loads(ruta.read_text(encoding="utf-8"))
    if isinstance(datos, list):
        return [], datos
    return datos.get("palabras", []), datos.get("fuentes", [])


def relevante(texto: str, palabras: list[str]) -> bool:
    plano = sin_tildes(texto)
    return any(sin_tildes(p) in plano for p in palabras)


def formato_fecha(fecha: datetime | None) -> str:
    if not fecha:
        return "sin fecha"
    return f"{fecha.day} {MESES[fecha.month - 1]}"


def armar(horas: int, solo_pais: str | None, maximo: int) -> str:
    palabras, fuentes = carga_fuentes(FUENTES)
    limite = datetime.now(timezone.utc) - timedelta(hours=horas)
    bloques, vacias, errores = [], [], []
    vistos_enlaces, vistos_titulos, total = set(), set(), 0

    for fuente in fuentes:
        if not fuente.get("activa", True):
            continue
        if solo_pais and fuente.get("pais") != solo_pais:
            continue
        try:
            entradas = leer_feed(descargar(fuente["url"]))
        except (urllib.error.URLError, ET.ParseError, TimeoutError, OSError) as error:
            errores.append((fuente["nombre"], str(error)[:120]))
            continue

        elegidas = []
        for entrada in entradas:
            if not entrada["titulo"] or not entrada["enlace"]:
                continue
            fecha = entrada["fecha"]
            if fecha is None:
                continue
            if fecha.tzinfo is None:
                fecha = fecha.replace(tzinfo=timezone.utc)
            if fecha < limite:
                continue
            if fuente.get("filtrar") and not relevante(entrada["titulo"] + " " + entrada["resumen"], palabras):
                continue
            llave_titulo = re.sub(r"\W+", " ", sin_tildes(entrada["titulo"])).strip()
            if entrada["enlace"] in vistos_enlaces or llave_titulo in vistos_titulos:
                continue
            vistos_enlaces.add(entrada["enlace"])
            vistos_titulos.add(llave_titulo)
            entrada["fecha"] = fecha
            elegidas.append(entrada)

        if not elegidas:
            vacias.append(fuente["nombre"])
            continue

        elegidas.sort(key=lambda e: e["fecha"], reverse=True)
        elegidas = elegidas[:maximo]
        total += len(elegidas)
        filas = []
        for entrada in elegidas:
            resumen = ""
        if entrada["resumen"]:
            texto = entrada["resumen"]
            prefijo = fuente["nombre"].split(".")[0]
            if texto.lower().startswith(prefijo.lower()):
                texto = texto[len(prefijo):].lstrip(" :-–—")
            resumen = f" — {texto}" if texto else ""
            filas.append(
                f"- [ ] [{entrada['titulo']}]({entrada['enlace']})"
                f" · {formato_fecha(entrada['fecha'])}{resumen}"
            )
        tipo = ETIQUETAS.get(fuente.get("tipo", ""), fuente.get("tipo", ""))
        bloques.append(
            f"## {fuente['nombre']}\n"
            f"`{fuente.get('pais', '??')}` · {tipo} · "
            f"[sitio]({fuente.get('sitio', fuente['url'])})\n\n"
            + "\n".join(filas)
        )

    hoy = datetime.now().astimezone()
    lineas = [
        f"# Bandeja de prensa — {hoy.day} de {MESES_LARGOS[hoy.month - 1]} de {hoy.year}",
        "",
        f"**{len(bloques)} fuentes con novedades** · **{total} titulares** · "
        f"ventana de {horas} h · [portal](https://ruben-developer.github.io/porlaanarquia/)",
        "",
        "Marca lo que te sirva. Para publicarlo, escribe una bajada propia y enlaza "
        "la fuente: no copies el artículo completo.",
        "",
        "---",
        "",
    ]
    lineas.append("\n\n".join(bloques) if bloques else "_No hay titulares nuevos en la ventana._")
    if vacias:
        lineas += ["", "---", "", f"Sin novedades: {', '.join(vacias)}."]
    if errores:
        lineas += ["", "**Feeds con problemas:**", ""]
        lineas += [f"- {nombre}: {detalle}" for nombre, detalle in errores]
    return "\n".join(lineas) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Arma la bandeja de prensa del día.")
    parser.add_argument("--horas", type=int, default=36, help="ventana en horas (por defecto 36)")
    parser.add_argument("--pais", help="filtrar por país, por ejemplo CL")
    parser.add_argument("--maximo", type=int, default=8, help="titulares por fuente (por defecto 8)")
    parser.add_argument("--salida", help="archivo donde escribir el Markdown")
    args = parser.parse_args()

    texto = armar(args.horas, args.pais, args.maximo)
    if args.salida:
        Path(args.salida).write_text(texto, encoding="utf-8")
        print(f"Bandeja escrita en {args.salida} ({len(texto)} caracteres)", file=sys.stderr)
    else:
        sys.stdout.write(texto)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
