# Por la Anarquía

Portal de noticias, difusión y articulación anarquista.

Dominio final: `porlaanarquia.antarquia.cl`

Sitio publicado: **https://ruben-developer.github.io/porlaanarquia/**

## Estructura

- `index.html` — portada y secciones (noticias, recortes, agenda, efemérides, comunicados, contacto).
- `styles.css` — estética de prensa libertaria: papel envejecido, tinta negra y acento rojo, con edición diurna y nocturna.
- `app.js` — lógica: carga los datos, filtros, búsqueda, agenda guardada y navegación por hash.
- `datos/` — contenido editable: `noticias.json`, `recortes.json`, `agenda.json`, `efemerides.json`, `comunicados.json` y `portada.json` (imagen de cabecera).
- `assets/` — portada de la cabecera, fuentes autoalojadas e imágenes subidas desde el CMS.
- `.pages.yml` — configuración de Pages CMS para editar los JSON con formularios.
- `scripts/validar.mjs` — revisa los datos antes de publicar (`node scripts/validar.mjs`).
- `favicon.svg` — sello de la publicación.
- `assets/portada-la-protesta.jpg` — imagen de portada.
- `assets/fonts/` + `assets/fonts.css` — tipografías auto-hospedadas (SIL OFL 1.1), sin CDN.
- `LICENSE`, `SECURITY.md`, `robots.txt` — licencia, política de reporte y rastreo.

## Contenido

El contenido vive en `datos/*.json`, no dentro del código. Para publicar:

1. Edita el JSON en `github.dev` (tecla `.` en el repo) o con **Pages CMS**
   (`app.pagescms.org`, login con GitHub).
2. Ejecuta `node scripts/validar.mjs` antes de publicar.
3. Commit y push: GitHub Pages publica solo.

Las noticias se archivan solas por año y mes a partir de la fecha: no hay
índice que mantener. Las **categorías** también se generan solas: si una nota
dice `Cultura`, `Solidaridad` o cualquier otra palabra, el filtro aparece sin
tocar código. Solo hay que guardar la nota; Pages reconstruye el sitio.

**Recortes** es la sección para lo que no es noticia: extractos de libros o
artículos, frases célebres e historias, incluidas las que alcanzan para un
cuadernillo. Cada entrada lleva un `tipo` (`Extracto`, `Frase` o `Historia`), un
`titulo`, el `texto` y, si corresponde, `autor` y `fuente`. Los filtros por tipo
se generan desde los datos.

La tarjeta muestra solo el primer párrafo de `texto`. Si hay más (más párrafos
en `texto` o el campo opcional `cuerpo`), aparece **Leer completo**, que abre el
recorte en su propia vista de lectura (`#recorte`). `cuerpo` es la continuación
del texto: se lee después del primer párrafo y sus párrafos se separan con una
línea en blanco. Las frases de un solo párrafo no muestran el botón.

En **Agenda** las actividades se ordenan por cercanía: primero las que vienen y,
al final, las que ya pasaron. Cada fila muestra día, mes y año. Las pasadas van
apagadas, con la marca **«Ya pasó»** y bajo el separador **«Ya pasaron»**; las
que vienen llevan el botón **Guardar**.

En **Agenda** y **Efemérides** la lista va sin imágenes. El campo
`descripcion` (Agenda) y `detalle` (Efemérides) se muestran al abrir
**«Leer más»**. En Agenda se puede sumar un `afiche` opcional y en Efemérides una
`imagen` opcional: ambas aparecen solo dentro del detalle.

### Imágenes

Se suben desde Pages CMS (sección **Portada**, campo **Imagen** de una nota o de
una efeméride, o **Afiche** de una actividad) y quedan en `assets/`:

- `datos/portada.json` — grabado de la cabecera (`imagen` + `alt`).
- Campo `imagen` de una nota — opcional; se muestra al abrirla, en blanco y
  negro y con marco, para no romper la estética de imprenta.
- Campo `afiche` de una actividad — opcional; se muestra solo dentro de
  **«Leer más»**, nunca en la lista de Agenda.
- Campo `imagen` de una efeméride — opcional; se muestra solo dentro de
  **«Leer más»**, nunca en la lista.

Fuera del CMS también se pueden copiar a mano a `assets/` y escribir la ruta
(`assets/mi-foto.jpg`). El validador avisa si la imagen no existe.

## Contacto

`por-la-anarquia@riseup.net` (alias de Riseup que entrega en `antarquia@riseup.net`).

## Ver en local

```bash
cd /home/nbk/Repositorios/porlaanarquia
python3 -m http.server 8001
```

Luego abrir `http://localhost:8001`.

## Estado

El contenido se carga desde Pages CMS: hoy hay 2 notas, 1 recorte, 3
actividades, 4 efemérides y 2 comunicados, aún con material de ejemplo. Antes de
publicar hay que reemplazar los textos y las fechas por información real. El
correo de contacto ya es el definitivo.
