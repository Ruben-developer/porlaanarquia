# Por la Anarquía

Portal de noticias, difusión y articulación anarquista.

Dominio final: `porlaanarquia.antarquia.cl`

Sitio publicado: **https://ruben-developer.github.io/porlaanarquia/**

## Estructura

- `index.html` — portada y secciones (noticias, agenda, efemérides, comunicados, contacto).
- `styles.css` — estética de prensa libertaria: papel envejecido, tinta negra y acento rojo, con edición diurna y nocturna.
- `app.js` — datos de ejemplo, filtros, búsqueda, agenda guardada, formulario de contacto (`mailto:`) y navegación por hash.
- `favicon.svg` — sello de la publicación.
- `assets/portada-la-protesta.jpg` — imagen de portada.

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
