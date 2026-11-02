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

## Correos

- [ ] Crear en Riseup el alias `contacto-porlaanarquia@riseup.net` (entrega en
      `antarquia@riseup.net`) y probar un envío real.

## Contenido real (antes de publicar)

- [ ] Terminar de cargar las notas rescatadas del blog viejo (ya hay 2 desde el CMS).
- [ ] Reemplazar el recorte, las 3 actividades y los 2 comunicados de ejemplo.
- [x] Quitar la nota al pie del lector: ya no queda ningún aviso de maqueta en el código. Todo el texto de ejemplo vive en `datos/*.json` y se puede borrar desde Pages CMS.
- [x] Probar Pages CMS de punta a punta: se subió `assets/1.png`, se editó una
      efeméride y se agregó la actividad «Comedor Vegano»; los commits del CMS
      (`b121380`, `b3d6779`, `ed4bd33`, `7125ba6`) y el deploy salieron bien.

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
