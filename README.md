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
artículos, frases célebres e historias anarquistas breves. Cada entrada lleva un
`tipo` (`Extracto`, `Frase` o `Historia`), un `titulo`, el `texto` y, si
corresponde, `autor` y `fuente`. Los filtros por tipo se generan desde los datos.

En **Agenda** y **Efemérides** la lista va sin imágenes. El campo
`descripcion` (Agenda) y `detalle` (Efemérides) se muestran al abrir
**«Leer más»**. En Agenda se puede sumar un `afiche` opcional, que aparece solo
dentro del detalle; **Efemérides no admite imágenes en ningún caso**.

### Imágenes

Se suben desde Pages CMS (sección **Portada**, campo **Imagen** de una nota o
**Afiche** de una actividad) y quedan en `assets/`:

- `datos/portada.json` — grabado de la cabecera (`imagen` + `alt`).
- Campo `imagen` de una nota — opcional; se muestra al abrirla, en blanco y
  negro y con marco, para no romper la estética de imprenta.
- Campo `afiche` de una actividad — opcional; se muestra solo dentro de
  **«Leer más»**, nunca en la lista de Agenda.
- **Efemérides** no tiene campo de imagen: su detalle es solo texto.

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

Maqueta funcional con contenido de ejemplo: 2 notas, 3 recortes, 2 actividades,
2 efemérides y 2 comunicados. Antes de publicar hay que reemplazar los textos y
las fechas por información real. El correo de contacto ya es el definitivo.
