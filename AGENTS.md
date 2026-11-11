# AGENTS.md — Por la Anarquía

## Qué es

Portal de noticias, lecturas, agenda, efemérides y comunicados de los colectivos,
bibliotecas y sindicatos libertarios de Chile.

- **Producción:** <https://porlaanarquia.antarquia.cl/> (`main`)
- **Beta:** <https://porlaanarquia-beta.antarquia.cl/> (`develop`)

## Stack

HTML, CSS y JavaScript vanilla, más `markdown.js` para el render de Markdown.
Sin CDNs ni fuentes externas. El contenido vive en `datos/*.json`.

## Comandos

```bash
node scripts/validar.mjs
node --check app.js && node --check markdown.js
npx html-validate@9 index.html
node scripts/build.mjs
npm run dev
npm run deploy:beta
npm run deploy       # solo con OK
```

## Flujo

1. Trabaja en `develop` y valida los JSON.
2. Push a `develop` → CI + beta.
3. `main` solo con decisión explícita.

## Reglas

- No rompas el esquema de `datos/*.json` ni el render de `markdown.js`.
- `bandeja.yml` y `sincronizar.yml` automatizan contenido: revisa que tus
  cambios no los bloqueen.
- Sin CDNs, sin imágenes externas y sin HTML crudo en los campos de texto.
- Las noticias y efemérides llevan fuente y fecha verificables.
- Actualiza `README.md` y `PENDIENTES.md` si cambia el contenido o el deploy.

## Agentes y skills

- Skill `antarquia-sitios`: convenciones, Workers y verificación.
- Skill `antarquia-contenido`: esquemas de `datos/` y licencias.
- `antarquia-qa` para revisar; `antarquia-ops` para desplegar.
