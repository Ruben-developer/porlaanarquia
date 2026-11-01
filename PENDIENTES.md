# Pendientes — Por la Anarquía

Portal de noticias y difusión anarquista.
Dominio final: `porlaanarquia.antarquia.cl`

## Hecho

- [x] Base del repositorio (git, README, `.gitignore`).
- [x] Maqueta de portada tipo prensa libertaria integrada: `index.html`, `styles.css`, `app.js`, `favicon.svg`.
- [x] Secciones navegables: Portada, Noticias, Agenda, Efemérides, Comunicados, Contacto.
- [x] Modo diurno / nocturno, buscador y filtros, agenda guardada en `localStorage`.

## Contenido real (antes de publicar)

- [ ] Reemplazar las 6 noticias de ejemplo por notas reales.
- [ ] Reemplazar agenda, efemérides y comunicados de ejemplo.
- [ ] Definir el correo de contacto (hoy es `contacto@porlaanarquia.example`).
- [ ] Quitar el aviso "Maqueta de rediseño" de la barra superior y la nota del pie.
- [ ] Definir si el formulario de contacto envía a algún servicio (hoy no envía nada).

## Publicar en GitHub Pages

1. Crear repo público `porlaanarquia` en github.com (cuenta `Ruben-developer`).
   - El remote ya está configurado en este repo.
2. Subir:
   ```bash
   cd /home/nbk/Repositorios/porlaanarquia
   git push -u origin main
   ```
3. Activar Pages: Settings → Pages → Deploy from a branch → `main` / `(root)`.
4. URL provisional: `https://ruben-developer.github.io/porlaanarquia/`

## Después

- [ ] Conectar Cloudflare Pages y dominio `porlaanarquia.antarquia.cl`.
- [ ] (Opcional) Dejar aviso en el WordPress viejo apuntando al nuevo sitio.
