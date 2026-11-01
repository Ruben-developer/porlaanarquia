# Pendientes — Por la Anarquía

Portal de noticias y difusión anarquista.
Dominio final: `porlaanarquia.antarquia.cl`

## Hecho

- [x] Base del repositorio (git, README, `.gitignore`).
- [x] Maqueta de portada tipo prensa libertaria integrada: `index.html`, `styles.css`, `app.js`, `favicon.svg`.
- [x] Secciones navegables: Portada, Noticias, Agenda, Efemérides, Comunicados, Contacto.
- [x] Modo diurno / nocturno, buscador y filtros, agenda guardada en `localStorage`.
- [x] Portada ajustada: nuevo lema, «Año I» dinámico, fecha a la derecha, imagen de *La Protesta* y título sin línea.
- [x] Eliminado el aviso «Maqueta de rediseño» de la barra superior.
- [x] Portada a dos columnas (bienvenida 2/3, últimos comunicados 1/3) y textos de bienvenida nuevos.
- [x] Correo de contacto real: `por-la-anarquia@riseup.net`.
- [x] Formulario de contacto funcional sin backend: arma un `mailto:` con asunto y cuerpo.
- [x] Contenido sacado de `app.js` a `datos/*.json` y cargado con `fetch`.
- [x] Archivo de noticias por año y mes (chips «Por año» y «Por mes»).
- [x] Configuración de Pages CMS (`.pages.yml`) y validación de datos en GitHub Actions.

## Contenido real (antes de publicar)

- [ ] Reemplazar las 6 noticias de ejemplo por notas reales.
- [ ] Reemplazar agenda, efemérides y comunicados de ejemplo.
- [ ] Quitar la nota del pie sobre textos inventados.

## Publicado en GitHub Pages

- [x] Repo público: https://github.com/Ruben-developer/porlaanarquia
- [x] Pages activo desde `main` / `(root)`.
- [x] URL: **https://ruben-developer.github.io/porlaanarquia/**

Para actualizar el sitio basta con:
```bash
cd /home/nbk/Repositorios/porlaanarquia
git add -A && git commit -m "..." && git push
```

## Después

- [ ] Conectar Cloudflare Pages y dominio `porlaanarquia.antarquia.cl`.
- [ ] (Opcional) Dejar aviso en el WordPress viejo apuntando al nuevo sitio.
