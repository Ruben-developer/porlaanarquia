// Copia a dist/ solo los archivos que deben publicarse.
// El repositorio también contiene CI, scripts y documentación que no se sirven.
import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const entries = [
  'index.html',
  'app.js',
  'markdown.js',
  'styles.css',
  'favicon.svg',
  'datos',
  'assets',
  'robots.txt',
  'sitemap.xml',
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const entry of entries) {
  const from = path.join(root, entry);
  if (!existsSync(from)) continue;
  await cp(from, path.join(dist, entry), { recursive: true });
}

console.log(`dist/ listo (${entries.length} entradas)`);
