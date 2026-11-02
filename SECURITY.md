# Seguridad — Por la Anarquía

Sitio estático (GitHub Pages) sin backend ni base de datos. El contenido se
edita por JSON con Pages CMS.

## Cómo reportar

Escribe a **contacto-porlaanarquia@riseup.net** indicando:

- la URL afectada;
- qué ocurre y cómo reproducirlo;
- el navegador usado, si aplica.

Si el fallo permite ejecutar código en el navegador de otra persona, no abras un
issue público: manda el correo primero.

## Medidas vigentes

- Todo el contenido se escapa antes de insertarse en el DOM (`esc()` en `app.js`).
- Cabecera **CSP** en `index.html`: solo se permite código y recursos del propio
  dominio; no hay CDN, ni fuentes de Google, ni peticiones a terceros.
- Las fuentes se sirven desde `assets/fonts/` (SIL OFL 1.1).
- Los datos se validan con `node scripts/validar.mjs` y en CI.

## Alcance

Entra: XSS, inyección en los JSON, dependencias comprometidas.
No entra: contenido editorial incorrecto, spam al correo de contacto, ataques
que requieran control del dispositivo de la víctima.
