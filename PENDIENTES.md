# Pendientes — Por la Anarquía

Portal de noticias y difusión anarquista.
Dominio final: `porlaanarquia.antarquia.cl`

## Hecho

- [x] Base del repositorio (git, README, `.gitignore`).
- [x] Maqueta de portada tipo prensa libertaria integrada: `index.html`, `styles.css`, `app.js`, `favicon.svg`.
- [x] Secciones navegables: Portada, Noticias, Recortes, Agenda, Efemérides, Comunicados, Contacto.
- [x] Modo diurno / nocturno, buscador y filtros, agenda guardada en `localStorage`.
- [x] Portada ajustada: nuevo lema, «Año I» dinámico, fecha a la derecha, imagen de *La Protesta* y título sin línea.
- [x] Eliminado el aviso «Maqueta de rediseño» de la barra superior.
- [x] Portada a dos columnas (bienvenida 2/3, últimos comunicados 1/3) y textos de bienvenida nuevos.
- [x] Correo de contacto real: `contacto-porlaanarquia@riseup.net`.
- [x] Formulario de contacto funcional sin backend: arma un `mailto:` con asunto y cuerpo.
- [x] Contenido sacado de `app.js` a `datos/*.json` y cargado con `fetch`.
- [x] Archivo de noticias por año y mes (chips «Por año» y «Por mes»).
- [x] Configuración de Pages CMS (`.pages.yml`) y script de validación (`scripts/validar.mjs`).
- [x] Workflow de CI en `.github/workflows/ci.yml`: valida los JSON, el HTML y escanea secretos.
- [x] Workflow subido: el token de `gh` ya tiene el scope `workflow`.
- [x] Fuentes auto-hospedadas en `assets/fonts/` (se quitó Google Fonts).
- [x] CSP y `Referrer-Policy` en `index.html`; escapado completo de todo el contenido en `app.js`.
- [x] Imágenes en el CMS: portada editable (`datos/portada.json`), imagen opcional por nota, afiche en el detalle de Agenda e imagen en el detalle de Efemérides.
- [x] Sección **Recortes**: extractos, frases e historias, con filtros por `tipo`.
- [x] Formato en los textos del CMS: campos largos como `rich-text` (Markdown) y
      render propio (`markdown.js`) con negrita, cursiva, listas, citas, títulos y
      enlaces; se escapa el HTML. Sin dependencias.
- [x] Recortes largos: la tarjeta muestra el primer párrafo y «Leer completo»
      abre la historia en una vista de lectura propia (`#recorte`); el resto va
      en el campo opcional `cuerpo` o en los párrafos siguientes de `texto`.
- [x] «Leer más» en Agenda y Efemérides, con el detalle desplegable; las listas van sin imágenes.
- [x] Agenda: próximas primero y pasadas agrupadas al final, apagadas y marcadas «Ya pasó»; año visible en la fecha de cada actividad.
- [x] Categorías de Noticias dinámicas: los chips salen de las categorías escritas en las notas.
- [x] Contenido de ejemplo reducido; hoy hay 2 notas, 2 recortes (uno largo), 5 actividades, 4 efemérides y 2 comunicados.
- [x] Portada con «Últimas noticias» bajo el grabado, «Del archivo», eventos del mes y efeméride.
- [x] **Recortes → Lecturas** y **Agenda → Eventos** en la interfaz, conservando rutas y archivos.
- [x] **Publicación en un paso**: `scripts/publicar.sh` valida, abre el PR, espera el CI, mergea y verifica el deploy de Workers.
- [x] **Sincronización automática** `main → develop` y CI también en `main` (commits de Pages CMS).
- [x] **Bandeja de prensa** sin IA: `scripts/bandeja.py` lee RSS/Atom de `datos/fuentes.json`; versión local y Action diario.

## Correos

- [ ] Crear en Riseup el alias `contacto-porlaanarquia@riseup.net` (entrega en
      `antarquia@riseup.net`) y probar un envío real.

## Nombres

- [x] **Recortes → Lecturas** en la navegación, la sección y el CMS; la ruta
      `#recortes` y `datos/recortes.json` no cambian.
- [x] **Agenda → Eventos** en la navegación y la sección; «agenda» queda como
      alias en los textos y la ruta `#agenda` no cambia.

## Contenido real (antes de publicar)

- [ ] Terminar de cargar las notas rescatadas del blog viejo.
- [ ] Reemplazar las lecturas, actividades y comunicados que sigan siendo de ejemplo.
- [x] Quitar la nota al pie del lector: ya no queda ningún aviso de maqueta en el código. Todo el texto de ejemplo vive en `datos/*.json` y se puede borrar desde Pages CMS.
- [x] Probar Pages CMS de punta a punta: se subió `assets/1.png`, se editó una
      efeméride y se agregó la actividad «Comedor Vegano»; los commits del CMS
      (`b121380`, `b3d6779`, `ed4bd33`, `7125ba6`) y el deploy salieron bien.

## Publicado en Cloudflare Workers

- [x] Repo público: https://github.com/Ruben-developer/porlaanarquia
- [x] Producción: `main` → **https://porlaanarquia.antarquia.cl/**
- [x] Beta: `develop` → **https://porlaanarquia-beta.antarquia.cl/**
- [x] Rutas reales (`/noticias`, `/agenda`...) con fallback SPA.
- [x] GitHub Pages retirado.

Para publicar:
```bash
cd /home/nbk/Repositorios/porlaanarquia
scripts/publicar.sh "feat: qué cambia"
```

## Archivo del WordPress (2016–2019)

- [x] Inventario de las 103 entradas de `porlaanarquia.wordpress.com` y de sus
      149 imágenes.
- [x] 111 imágenes pasadas por el filtro de grabado de `utils.antarquia.cl`;
      las 71 que quedaron en uso se guardan en `assets/` como WebP.
- [x] Triaje: 57 entradas conservadas y 17 descartadas (duplicados, avisos
      vencidos o entradas sin contenido propio). 29 ya estaban migradas.
- [x] Reparto: 25 notas en `datos/noticias.json`, 31 lecturas en
      `datos/recortes.json` y 1 comunicado en `datos/comunicados.json`.
- [x] Tipos nuevos en `.pages.yml` para Lecturas: Artículo, Biografía,
      Entrevista y Documento.
- [ ] 38 imágenes del WordPress viejo no se pudieron recuperar (403/410 en
      `fbcdn.net`, `editorialgatonegro` y otros). Quedan 15 entradas sin imagen.
- [ ] (Opcional) Revisar los textos migrados uno por uno: se limpió el HTML y se
      corrigieron acentos y mayúsculas de los títulos, pero no se reescribió el
      contenido.

## Bandeja de prensa

- [ ] Revisar la lista inicial de `datos/fuentes.json` (9 medios) y sacar o sumar
      fuentes. Anarkismo quedó fuera porque su feed devolvía 503 y el certificado
      no coincide con el dominio.
- [ ] Decidir el destino diario: bóveda local (`scripts/bandeja-diaria.sh`) o
      issue del repositorio (público). Instalar el cron o dejar el Action.
- [ ] Ajustar `palabras` después de una semana, viendo qué titulares sobran.
- [ ] (Opcional) Resumen de una línea por titular con un modelo local pequeño;
      hoy el filtro es por fuente y palabras, sin IA, para que sea predecible.

## Después

- [ ] Desactivar Web Analytics en Cloudflare: el CSP bloquea su script y deja
      un error en la consola. El sitio no usa analítica a propósito.
- [ ] (Opcional) Dejar aviso en el WordPress viejo apuntando al nuevo sitio.
