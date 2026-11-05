# Por la Anarquía (PLA)

Portal de noticias, difusión y articulación anarquista.

Dominio final: `porlaanarquia.antarquia.cl`

Sitio publicado: **https://porlaanarquia.antarquia.cl/**

## Estructura

- `index.html` — portada y secciones (noticias, lecturas, eventos, efemérides, comunicados, contacto).
- `styles.css` — estética de prensa libertaria: papel envejecido, tinta negra y acento rojo, con edición diurna y nocturna.
- `app.js` — lógica: carga los datos, filtros, búsqueda, agenda guardada y navegación por rutas reales.
- `datos/` — contenido editable: `noticias.json`, `recortes.json`, `agenda.json`, `efemerides.json`, `comunicados.json`, `portada.json` (imagen de cabecera) y `fuentes.json` (medios de la bandeja).
- `assets/` — portada de la cabecera, fuentes autoalojadas e imágenes subidas desde el CMS.
- `.pages.yml` — configuración de Pages CMS para editar los JSON con formularios.
- `scripts/validar.mjs` — revisa los datos antes de publicar (`node scripts/validar.mjs`).
- `scripts/publicar.sh` — valida, abre el PR, espera el CI y publica en un paso.
- `scripts/bandeja.py` — arma la bandeja de prensa del día desde `datos/fuentes.json` (sin dependencias ni IA).
- `scripts/bandeja-diaria.sh` — guarda esa bandeja en la bóveda local.
- `datos/fuentes.json` — lista de medios y palabras clave de la bandeja.
- `favicon.svg` — sello de la publicación.
- `assets/portada-la-protesta.jpg` — imagen de portada.
- `assets/fonts/` + `assets/fonts.css` — tipografías auto-hospedadas (SIL OFL 1.1), sin CDN.
- `LICENSE`, `SECURITY.md`, `robots.txt` — licencia, política de reporte y rastreo.

## Contenido

El contenido vive en `datos/*.json`, no dentro del código. Para publicar:

1. Edita el JSON en `github.dev` (tecla `.` en el repo) o con **Pages CMS**
   (`app.pagescms.org`, login con GitHub).
2. Ejecuta `node scripts/validar.mjs` antes de publicar.
3. Commit y push: el workflow publica en Cloudflare Workers.

Las noticias se archivan solas por año y mes a partir de la fecha: no hay
índice que mantener. Las **categorías** también se generan solas: si una nota
dice `Cultura`, `Solidaridad` o cualquier otra palabra, el filtro aparece sin
tocar código. Solo hay que guardar la nota; Pages reconstruye el sitio.

### Portada

La portada se arma sola con los datos, sin tocar HTML:

- **Últimas noticias**: las 3 más recientes, justo bajo el grabado.
- **Del archivo**: el título de una lectura, rotando uno por día.
- **Bienvenida** (2/3) y **Últimos comunicados** (1/3, máximo 3).
- **Eventos del mes**: los próximos eventos (hasta 3) y **Efeméride**: la fecha
  siguiente con cuenta regresiva.

Dos nombres visibles no coinciden con los archivos internos, que se conservan
para no romper enlaces ni el CMS: `agenda.json` se muestra como **Eventos** (con
«agenda» como alias en el texto y la ruta `#agenda`) y `recortes.json` se
muestra como **Lecturas** (con la ruta `#recortes`).

## Formato de los textos

Los campos largos del CMS (cuerpo de Noticias, texto y resto de Lecturas,
descripción de Eventos, glosa y detalle de Efemérides, texto de Comunicados) son
**rich-text** de Pages CMS y guardan **Markdown**. La barra del editor permite
negrita, cursiva, títulos, listas, citas y enlaces. El sitio lo convierte a HTML
con `markdown.js`, un render mínimo y sin dependencias que escapa todo el texto:
no se acepta HTML pegado en el CMS.

Lo que se puede escribir:

- `**negrita**`, `*cursiva*`, `~~tachado~~` y `` `código` ``.
- Enlaces: `[texto](https://ejemplo.cl)`. Las URL sueltas también quedan como enlace.
- Listas con `- ` o `1. `, citas con `> `, títulos con `## ` y separadores con `---`.
- Los párrafos se separan con una línea en blanco.

En **Lecturas**, la tarjeta muestra el primer párrafo de `texto`; el resto se lee
con **Leer completo**.

**Lecturas** es la sección para lo que no es noticia: extractos de libros o
artículos, frases célebres e historias, incluidas las que alcanzan para un
cuadernillo. Cada entrada lleva un `tipo` (`Extracto`, `Frase` o `Historia`), un
`titulo`, el `texto` y, si corresponde, `autor` y `fuente`. Los filtros por tipo
se generan desde los datos.

La tarjeta muestra solo el primer párrafo de `texto`. Si hay más (más párrafos
en `texto` o el campo opcional `cuerpo`), aparece **Leer completo**, que abre el
recorte en su propia vista de lectura (`#recorte`). `cuerpo` es la continuación
del texto: se lee después del primer párrafo y sus párrafos se separan con una
línea en blanco. Las frases de un solo párrafo no muestran el botón.

En **Eventos** (la agenda) las actividades se ordenan por cercanía: primero las
que vienen y, al final, las que ya pasaron. Cada fila muestra día, mes y año. Las
pasadas van apagadas, con la marca **«Ya pasó»** y bajo el separador
**«Ya pasaron»**; las que vienen llevan el botón **Guardar**.

En **Eventos** y **Efemérides** la lista va sin imágenes. El campo
`descripcion` (Eventos) y `detalle` (Efemérides) se muestran al abrir
**«Leer más»**. En Eventos se puede sumar un `afiche` opcional y en Efemérides
una `imagen` opcional: ambas aparecen solo dentro del detalle.

### Imágenes

Se suben desde Pages CMS (sección **Portada**, campo **Imagen** de una nota o de
una efeméride, o **Afiche** de una actividad) y quedan en `assets/`:

- `datos/portada.json` — grabado de la cabecera (`imagen` + `alt`).
- Campo `imagen` de una nota — opcional; se muestra al abrirla, en blanco y
  negro y con marco, para no romper la estética de imprenta.
- Campo `afiche` de una actividad — opcional; se muestra solo dentro de
  **«Leer más»**, nunca en la lista de Eventos.
- Campo `imagen` de una efeméride — opcional; se muestra solo dentro de
  **«Leer más»**, nunca en la lista.

Fuera del CMS también se pueden copiar a mano a `assets/` y escribir la ruta
(`assets/mi-foto.jpg`). El validador avisa si la imagen no existe.

## Contacto

`contacto-porlaanarquia@riseup.net` (alias de Riseup que entrega en
`antarquia@riseup.net`; hay que crearlo en Riseup antes de usarlo).

## Publicar

Un solo comando hace todo:

```bash
scripts/publicar.sh "feat: título corto

Detalle opcional del cambio."
```

El script valida los datos, el JavaScript y el HTML; commitea en `develop`;
sube; abre el PR a `main` (o reutiliza el que esté abierto); espera el CI;
mergea; espera el deploy de Cloudflare Workers y comprueba que `develop` vuelva a contener
`main`. Si algo falla, se detiene sin mergear.

Con `--solo-pr` deja el PR abierto y validado, sin mergear.

Dos Actions completan el circuito:

- **Sincronizar main en develop** devuelve a `develop` lo que Pages CMS escribe
  directo en `main`, sin PRs manuales.
- **CI** corre también en `main`, para que un cambio del CMS quede validado
  aunque haya entrado sin pasar por un PR.

## Bandeja de prensa

`scripts/bandeja.py` lee los RSS/Atom de `datos/fuentes.json`, se queda con lo
publicado en las últimas 36 horas y arma un Markdown con titulares, fecha,
resumen corto y enlace. No usa IA: filtra por fuente y por palabras clave
(`palabras`), descarta duplicados y **no publica nada** en el portal.

```bash
python3 scripts/bandeja.py                    # ver en pantalla
python3 scripts/bandeja.py --horas 72         # ventana más amplia
python3 scripts/bandeja.py --pais CL          # solo fuentes chilenas
python3 scripts/bandeja.py --salida bandeja.md
```

**En local (privado).** `scripts/bandeja-diaria.sh` guarda el resumen en
`~/Documentos/Antarquia/PorLaAnarquia/Bandeja/AAAA-MM-DD.md` y actualiza
«Última bandeja.md». Para que corra solo cada mañana:

```cron
17 8 * * * cd ~/Repositorios/porlaanarquia && scripts/bandeja-diaria.sh
```

**En GitHub (cómodo, pero público).** El Action **Bandeja de prensa** corre a
las 08:00 de Chile y deja el resumen en un issue con casillas para marcar. Como
el repositorio es público, esos issues también lo son: solo llevan titulares y
enlaces de medios públicos. También se puede lanzar a mano desde la pestaña
Actions.

Para sumar un medio, agrega su feed a `datos/fuentes.json` con `nombre`, `url`,
`sitio`, `pais`, `tipo`, `filtrar` y `activa`, y corre el validador. Para un
medio generalista conviene `filtrar: true`, así solo aparecen titulares que
tocan los temas de `palabras`.

## Ver en local

```bash
cd /home/nbk/Repositorios/porlaanarquia
python3 -m http.server 8001
```

Luego abrir `http://localhost:8001`.

## Estado

El contenido se carga desde Pages CMS: hoy hay 9 notas, 8 lecturas, 7 eventos,
4 efemérides y 5 comunicados, todavía con parte del material de ejemplo. Antes
de publicar hay que reemplazar los textos y las fechas por información real. El
correo de contacto ya es el definitivo.
