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
- [x] Configuración de Pages CMS (`.pages.yml`) y script de validación (`scripts/validar.mjs`).
- [x] Workflow de CI en `.github/workflows/ci.yml`: valida los JSON, el HTML y escanea secretos.
- [ ] Subir el workflow: el token de `gh` no tiene el scope `workflow`.
      Ejecutar `gh auth refresh -s workflow` y luego `git push`.
- [x] Fuentes auto-hospedadas en `assets/fonts/` (se quitó Google Fonts).
- [x] CSP y `Referrer-Policy` en `index.html`; escapado completo de todo el contenido en `app.js`.
- [x] Imágenes en el CMS: portada editable (`datos/portada.json`) e imagen opcional por nota.

## Contenido real (antes de publicar)

- [ ] Reemplazar las 9 notas de ejemplo por notas reales (6 de 2026 y 3 de archivo).
- [ ] Reemplazar agenda, efemérides y comunicados de ejemplo.
- [ ] Quitar la nota al pie del lector («Texto de ejemplo escrito para la maqueta…»).
- [ ] Probar Pages CMS de punta a punta: subir una imagen, editar una nota y
      confirmar commit + deploy.

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
