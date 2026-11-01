// Valida los archivos de datos antes de publicar.
// Uso: node scripts/validar.mjs
import { readFileSync } from 'node:fs';

const base = new URL('../datos/', import.meta.url);
const errores = [];

const leer = nombre => {
  try {
    const data = JSON.parse(readFileSync(new URL(nombre, base), 'utf8'));
    if (!Array.isArray(data)) errores.push(`${nombre}: debe ser una lista ([ ... ])`);
    return data;
  } catch (e) {
    errores.push(`${nombre}: no es JSON válido (${e.message})`);
    return [];
  }
};

const texto = (v) => typeof v === 'string' && v.trim().length > 0;
const fecha = (v) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v || '')) return false;
  const d = new Date(v + 'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
};
const hora = (v) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v || '');
const entero = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;

const unicos = (lista, campo, archivo) => {
  const vistos = new Set();
  lista.forEach((item, i) => {
    const v = item[campo];
    if (!texto(v)) return;
    if (vistos.has(v)) errores.push(`${archivo}[${i}]: ${campo} repetido («${v}»)`);
    vistos.add(v);
  });
};

// Noticias
const noticias = leer('noticias.json');
noticias.forEach((n, i) => {
  const donde = `noticias.json[${i}]`;
  ['categoria', 'titulo', 'fecha', 'lugar', 'bajada', 'cuerpo'].forEach(c => {
    if (!texto(n[c])) errores.push(`${donde}: falta «${c}»`);
  });
  if (texto(n.fecha) && !fecha(n.fecha)) errores.push(`${donde}: fecha inválida («${n.fecha}»)`);
});
unicos(noticias, 'id', 'noticias.json');

// Agenda
const agenda = leer('agenda.json');
agenda.forEach((e, i) => {
  const donde = `agenda.json[${i}]`;
  ['titulo', 'fecha', 'hora', 'lugar', 'ciudad'].forEach(c => {
    if (!texto(e[c])) errores.push(`${donde}: falta «${c}»`);
  });
  if (texto(e.fecha) && !fecha(e.fecha)) errores.push(`${donde}: fecha inválida («${e.fecha}»)`);
  if (texto(e.hora) && !hora(e.hora)) errores.push(`${donde}: hora inválida («${e.hora}»), usa HH:MM`);
});
unicos(agenda, 'id', 'agenda.json');

// Efemérides
const efemerides = leer('efemerides.json');
efemerides.forEach((e, i) => {
  const donde = `efemerides.json[${i}]`;
  ['titulo', 'texto'].forEach(c => {
    if (!texto(e[c])) errores.push(`${donde}: falta «${c}»`);
  });
  if (!entero(e.dia, 1, 31)) errores.push(`${donde}: día inválido («${e.dia}»)`);
  if (!entero(e.mes, 1, 12)) errores.push(`${donde}: mes inválido («${e.mes}»)`);
  if (!entero(e.anio, 1000, 2200)) errores.push(`${donde}: año inválido («${e.anio}»)`);
});

// Comunicados
const comunicados = leer('comunicados.json');
comunicados.forEach((c, i) => {
  const donde = `comunicados.json[${i}]`;
  ['titulo', 'fecha', 'texto'].forEach(campo => {
    if (!texto(c[campo])) errores.push(`${donde}: falta «${campo}»`);
  });
  if (texto(c.fecha) && !fecha(c.fecha)) errores.push(`${donde}: fecha inválida («${c.fecha}»)`);
});
unicos(comunicados, 'id', 'comunicados.json');

if (errores.length) {
  console.error(`\n✗ ${errores.length} problema(s) en los datos:\n`);
  errores.forEach(e => console.error('  - ' + e));
  process.exit(1);
}

console.log(`✓ Datos válidos: ${noticias.length} notas, ${agenda.length} actividades, ${efemerides.length} efemérides, ${comunicados.length} comunicados.`);
