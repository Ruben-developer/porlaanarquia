# Por la Anarquía

Portal de noticias, difusión y articulación anarquista.

Dominio final: `porlaanarquia.antarquia.cl`

Sitio publicado: **https://ruben-developer.github.io/porlaanarquia/**

## Estructura

- `index.html` — portada y secciones (noticias, agenda, efemérides, comunicados, contacto).
- `styles.css` — estética de prensa libertaria: papel envejecido, tinta negra y acento rojo, con edición diurna y nocturna.
- `app.js` — lógica: carga los datos, filtros, búsqueda, agenda guardada y navegación por hash.
- `datos/` — contenido editable: `noticias.json`, `agenda.json`, `efemerides.json`, `comunicados.json`.
- `.pages.yml` — configuración de Pages CMS para editar los JSON con formularios.
- `scripts/validar.mjs` — revisa los datos antes de publicar (`node scripts/validar.mjs`).
- `favicon.svg` — sello de la publicación.
- `assets/portada-la-protesta.jpg` — imagen de portada.

## Contenido

El contenido vive en `datos/*.json`, no dentro del código. Para publicar:

1. Edita el JSON en `github.dev` (tecla `.` en el repo) o con **Pages CMS**
   (`app.pagescms.org`, login con GitHub).
2. Ejecuta `node scripts/validar.mjs` antes de publicar.
3. Commit y push: GitHub Pages publica solo.

Las noticias se archivan solas por año y mes a partir de la fecha: no hay
índice que mantener.

## Contacto

`por-la-anarquia@riseup.net` (alias de Riseup que entrega en `antarquia@riseup.net`).

## Ver en local

```bash
cd /home/nbk/Repositorios/porlaanarquia
python3 -m http.server 8001
```

Luego abrir `http://localhost:8001`.

## Estado

Maqueta funcional con contenido de ejemplo. Antes de publicar hay que reemplazar
los textos y las fechas por información real. El correo de contacto ya es el
definitivo.
