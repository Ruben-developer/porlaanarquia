// Valida los archivos de datos antes de publicar.
// Uso: node scripts/validar.mjs
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const base = new URL('../datos/', import.meta.url);
const raiz = new URL('../', import.meta.url);
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

const leerObjeto = nombre => {
  try {
    const data = JSON.parse(readFileSync(new URL(nombre, base), 'utf8'));
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      errores.push(`${nombre}: debe ser un objeto ({ ... })`);
      return {};
    }
    return data;
  } catch (e) {
    errores.push(`${nombre}: no es JSON válido (${e.message})`);
    return {};
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

// Una imagen local debe existir en el repo; una URL absoluta se acepta tal cual.
const imagen = (v, donde, campo = 'imagen') => {
  if (v === undefined || v === null || v === '') return;
  if (typeof v !== 'string') { errores.push(`${donde}: «${campo}» debe ser texto`); return; }
  const ruta = v.replace(/^\/+/, '');
  if (/^https?:\/\//i.test(ruta)) return;
  if (!ruta) { errores.push(`${donde}: «${campo}» está vacío`); return; }
  if (ruta.split('/').includes('..')) {
    errores.push(`${donde}: «${campo}» debe ser una ruta dentro del repo («${v}»)`);
    return;
  }
  if (!existsSync(fileURLToPath(new URL(ruta, raiz)))) {
    errores.push(`${donde}: la imagen «${v}» no existe en el repo`);
  }
};

/* Una galería es una lista de rutas o de objetos { imagen, alt }. */
const galeria = (v, donde) => {
  if (v == null) return;
  if (!Array.isArray(v)) { errores.push(`${donde}: «galeria» debe ser una lista`); return; }
  v.forEach((g, j) => {
    const src = typeof g === 'string' ? g : g && (g.imagen || g.src || g.archivo);
    if (!texto(src)) { errores.push(`${donde}: galeria[${j}] no tiene imagen`); return; }
    imagen(src, `${donde} galeria[${j}]`, 'imagen');
    if (g && typeof g === 'object' && g.alt != null && typeof g.alt !== 'string') {
      errores.push(`${donde}: galeria[${j}] «alt» debe ser texto`);
    }
  });
};

/* Lista de fechas sueltas o de excepciones: acepta strings u objetos { fecha }. */
const listaFechas = (v, donde, campo) => {
  if (v == null) return [];
  if (!Array.isArray(v)) { errores.push(`${donde}: «${campo}» debe ser una lista de fechas`); return []; }
  return v.map((f, j) => {
    const valor = typeof f === 'string' ? f : f && (f.fecha || f.inicio);
    if (!fecha(valor)) errores.push(`${donde}: ${campo}[${j}] no es una fecha válida («${valor}»)`);
    return valor;
  });
};

const DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const FRECUENCIAS = ['semanal', 'quincenal', 'mensual'];

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
  ['categoria', 'titulo', 'fecha', 'lugar'].forEach(c => {
    if (!texto(n[c])) errores.push(`${donde}: falta «${c}»`);
  });
  ['bajada', 'cuerpo'].forEach(c => {
    if (n[c] != null && typeof n[c] !== 'string') errores.push(`${donde}: «${c}» debe ser texto`);
  });
  // Una nota puede ser solo imagen (un afiche) o solo texto; lo que no puede
  // quedar es una ficha sin cuerpo y sin ninguna imagen.
  const tieneGaleria = Array.isArray(n.galeria) && n.galeria.length > 0;
  if (!texto(n.cuerpo) && !texto(n.imagen) && !tieneGaleria) {
    errores.push(`${donde}: falta «cuerpo», «imagen» o «galeria» (la nota quedaría vacía)`);
  }
  if (texto(n.fecha) && !fecha(n.fecha)) errores.push(`${donde}: fecha inválida («${n.fecha}»)`);
  imagen(n.imagen, donde);
  galeria(n.galeria, donde);
});
unicos(noticias, 'id', 'noticias.json');

// Agenda
const agenda = leer('agenda.json');
agenda.forEach((e, i) => {
  const donde = `agenda.json[${i}]`;
  ['titulo', 'lugar', 'ciudad'].forEach(c => {
    if (!texto(e[c])) errores.push(`${donde}: falta «${c}»`);
  });

  const inicio = e.inicio || e.fecha;
  if (!texto(inicio)) errores.push(`${donde}: falta «inicio» (o «fecha»)`)
  else if (!fecha(inicio)) errores.push(`${donde}: fecha de inicio inválida («${inicio}»)`);
  if (e.inicio && e.fecha) errores.push(`${donde}: usa «inicio», no las dos («inicio» y «fecha»)`);

  if (texto(e.hora) && !hora(e.hora)) errores.push(`${donde}: hora inválida («${e.hora}»), usa HH:MM`);
  if (texto(e.hora_fin) && !hora(e.hora_fin)) errores.push(`${donde}: hora de término inválida («${e.hora_fin}»), usa HH:MM`);

  if (e.fin != null) {
    if (!fecha(e.fin)) errores.push(`${donde}: fecha de fin inválida («${e.fin}»)`);
    else if (texto(inicio) && e.fin < inicio) errores.push(`${donde}: «fin» no puede ser anterior a «inicio»`);
  }

  const sueltas = listaFechas(e.fechas, donde, 'fechas');
  const excepciones = listaFechas(e.excepciones, donde, 'excepciones');

  // La repetición puede venir vacía ({}); solo se valida si tiene frecuencia.
  if (e.repeticion != null) {
    if (typeof e.repeticion !== 'object' || Array.isArray(e.repeticion)) {
      errores.push(`${donde}: «repeticion» debe ser un objeto`);
    } else {
      const r = e.repeticion;
      if (r.cada != null && r.cada !== '') {
        if (!FRECUENCIAS.includes(r.cada)) {
          errores.push(`${donde}: frecuencia inválida («${r.cada}»); usa semanal, quincenal o mensual`);
        }
        if (!texto(r.hasta)) {
          errores.push(`${donde}: «repeticion.hasta» es obligatoria cuando hay repetición`);
        }
        if (r.dia != null && r.dia !== '' && !DIAS.includes(String(r.dia).toLowerCase())) {
          errores.push(`${donde}: día inválido («${r.dia}»)`);
        }
        if (texto(r.hasta) && !fecha(r.hasta)) {
          errores.push(`${donde}: «repeticion.hasta» no es una fecha válida («${r.hasta}»)`);
        } else if (texto(r.hasta) && texto(inicio) && r.hasta < inicio) {
          errores.push(`${donde}: «repeticion.hasta» no puede ser anterior a «inicio»`);
        }
      }
    }
  }

  if (e.descripcion != null && typeof e.descripcion !== 'string') {
    errores.push(`${donde}: «descripcion» debe ser texto`);
  }
  imagen(e.afiche, donde, 'afiche');
  galeria(e.galeria, donde);
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
  if (e.detalle != null && typeof e.detalle !== 'string') {
    errores.push(`${donde}: «detalle» debe ser texto`);
  }
  imagen(e.imagen, donde, 'imagen');
  galeria(e.galeria, donde);
});

// Comunicados
const comunicados = leer('comunicados.json');
comunicados.forEach((c, i) => {
  const donde = `comunicados.json[${i}]`;
  ['titulo', 'fecha', 'texto'].forEach(campo => {
    if (!texto(c[campo])) errores.push(`${donde}: falta «${campo}»`);
  });
  if (texto(c.fecha) && !fecha(c.fecha)) errores.push(`${donde}: fecha inválida («${c.fecha}»)`);
  imagen(c.imagen, donde);
  galeria(c.galeria, donde);
});
unicos(comunicados, 'id', 'comunicados.json');

// Recortes
const recortes = leer('recortes.json');
recortes.forEach((r, i) => {
  const donde = `recortes.json[${i}]`;
  ['tipo', 'titulo', 'texto'].forEach(c => {
    if (!texto(r[c])) errores.push(`${donde}: falta «${c}»`);
  });
  ['autor', 'fuente', 'cuerpo'].forEach(c => {
    if (r[c] != null && typeof r[c] !== 'string') errores.push(`${donde}: «${c}» debe ser texto`);
  });
  imagen(r.imagen, donde);
  galeria(r.galeria, donde);
});
unicos(recortes, 'id', 'recortes.json');

// Fuentes de la bandeja de prensa
const fuentes = leerObjeto('fuentes.json');
if (!Array.isArray(fuentes.fuentes) || !fuentes.fuentes.length) {
  errores.push('fuentes.json: falta la lista «fuentes»');
} else {
  fuentes.fuentes.forEach((f, i) => {
    const donde = `fuentes.json[${i}]`;
    if (!texto(f.nombre)) errores.push(`${donde}: falta «nombre»`);
    if (!texto(f.url) || !/^https:\/\//.test(f.url)) errores.push(`${donde}: «url» debe empezar con https://`);
    if (f.sitio != null && !/^https:\/\//.test(f.sitio)) errores.push(`${donde}: «sitio» debe empezar con https://`);
    ['activa', 'filtrar'].forEach(c => {
      if (f[c] != null && typeof f[c] !== 'boolean') errores.push(`${donde}: «${c}» debe ser true o false`);
    });
  });
  unicos(fuentes.fuentes, 'nombre', 'fuentes.json');
}
if (fuentes.palabras != null && (!Array.isArray(fuentes.palabras) || fuentes.palabras.some(p => !texto(p)))) {
  errores.push('fuentes.json: «palabras» debe ser una lista de textos');
}

// Portada
const portada = leerObjeto('portada.json');
if (!texto(portada.imagen)) errores.push('portada.json: falta «imagen»');
else imagen(portada.imagen, 'portada.json');
if (!texto(portada.alt)) errores.push('portada.json: falta «alt» (descripción de la imagen)');

if (errores.length) {
  console.error(`\n✗ ${errores.length} problema(s) en los datos:\n`);
  errores.forEach(e => console.error('  - ' + e));
  process.exit(1);
}

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
console.log(`✓ Datos válidos: ${plural(noticias.length, 'nota', 'notas')}, ${plural(recortes.length, 'recorte', 'recortes')}, ${plural(agenda.length, 'actividad', 'actividades')}, ${plural(efemerides.length, 'efeméride', 'efemérides')}, ${plural(comunicados.length, 'comunicado', 'comunicados')} y ${plural(fuentes.fuentes.length, 'fuente', 'fuentes')}.`);
