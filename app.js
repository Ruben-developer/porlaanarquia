/* Por la anarquía — lógica del portal.
   Los datos viven en datos/*.json; este archivo solo los carga y los pinta. */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const MES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MES3 = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const DIAS = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const fmt = iso => { const [y, m, d] = iso.split('-').map(Number); return `${d} de ${MES[m - 1]} de ${y}`; };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const MAIL = 'contacto-porlaanarquia@riseup.net';

/* Los datos se llenan desde los JSON */
let ARTS = [], AGENDA = [], EFEM = [], COMS = [], RECORTES = [];
let CATS = ['Todas'], CITIES = ['Todas'], REC_TIPOS = ['Todos'];

const parrafos = s => String(s || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
// Une autoría y fuente sin repetir el mismo texto («Bandera Social · Bandera Social»).
const credito = (...partes) => {
  const vistos = new Set();
  return partes.map(p => String(p || '').trim()).filter(p => {
    const k = p.toLowerCase();
    if (!p || vistos.has(k)) return false;
    vistos.add(k); return true;
  }).join(' · ');
};
const porFecha = (a, b) => b.date.localeCompare(a.date);
const slug = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const idDe = (item, campoFecha, campoTitulo) =>
  item.id || `${item[campoFecha]}-${slug(item[campoTitulo])}`;

/* --- Imágenes de una entrada -------------------------------------------
   `imagen`/`afiche` es la portada y `galeria` suma más fotos. Cada foto puede
   ser una ruta suelta o un objeto { imagen, alt } para no perder el alt. */
const rutaImg = v => (typeof v === 'string' && v.trim() ? v.replace(/^\/+/, '') : null);
const imgsDe = (item, campo) => {
  const out = [];
  const add = (src, alt) => { const s = rutaImg(src); if (s) out.push({ src: s, alt: String(alt || '').trim() }); };
  add(item[campo], item.alt);
  (Array.isArray(item.galeria) ? item.galeria : []).forEach(g => {
    if (typeof g === 'string') add(g, '');
    else if (g && typeof g === 'object') add(g.imagen || g.src || g.archivo, g.alt);
  });
  return out;
};
const figura = (im, titulo, clase = 'foto') =>
  `<figure class="${clase}"><img src="${esc(im.src)}" alt="${esc(im.alt || titulo)}" loading="lazy">` +
  (clase === 'foto' && im.alt ? `<figcaption>${esc(im.alt)}</figcaption>` : '') + '</figure>';
const galeriaHTML = (imgs, titulo) => imgs.length ? `<div class="galeria">${imgs.map((im, i) => `
  <figure><img src="${esc(im.src)}" alt="${esc(im.alt || `Imagen ${i + 1} de ${titulo}`)}" loading="lazy">` +
  (im.alt ? `<figcaption>${esc(im.alt)}</figcaption>` : '') + '</figure>').join('')}</div>` : '';

/* --- Fechas de eventos: día, rango y recurrencia -----------------------
   Todo se maneja como ISO local (YYYY-MM-DD) para no depender de la zona
   horaria del navegador. Una recurrencia sin `hasta` se corta a 12 meses. */
const pad2 = n => String(n).padStart(2, '0');
const isoHoy = () => { const n = new Date(); return `${n.getFullYear()}-${pad2(n.getMonth() + 1)}-${pad2(n.getDate())}`; };
const sumarDias = (iso, n) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};
const sumarMeses = (iso, n) => {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1 + n, 1));
  const ultimo = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
  t.setUTCDate(Math.min(d, ultimo));
  return t.toISOString().slice(0, 10);
};
const DIAS_SEMANA = { domingo: 0, lunes: 1, martes: 2, miercoles: 3, 'miércoles': 3, jueves: 4, viernes: 5, sabado: 6, 'sábado': 6 };
const NOMBRE_DIA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const fechaDe = f => (typeof f === 'string' ? f : f && (f.fecha || f.inicio));

const fechasDeEvento = e => {
  const set = new Set();
  const add = v => { if (/^\d{4}-\d{2}-\d{2}$/.test(v || '')) set.add(v); };
  const inicio = e.inicio || e.fecha;
  const r = e.repeticion;
  const recurrente = !!(inicio && r && r.cada);
  // Con repetición, la primera fecha la pone el cálculo: si se pidió «jueves» y
  // el inicio cae lunes, el lunes no debe aparecer como ocurrencia.
  if (!recurrente) add(inicio);
  (Array.isArray(e.fechas) ? e.fechas : []).forEach(f => add(fechaDe(f)));
  if (recurrente) {
    let desde = inicio;
    const dia = r.dia ? DIAS_SEMANA[String(r.dia).toLowerCase()] : null;
    if (dia != null) {
      let guarda = 0;
      while (new Date(desde + 'T00:00:00Z').getUTCDay() !== dia && guarda++ < 7) desde = sumarDias(desde, 1);
    }
    const hasta = r.hasta || sumarMeses(desde, 12);
    if (r.cada === 'mensual') {
      // Se calcula desde el día original para no arrastrar el recorte de febrero.
      let i = 0, cur = desde;
      while (cur <= hasta && i < 400) { add(cur); i++; cur = sumarMeses(desde, i); }
    } else {
      let cur = desde, guarda = 0;
      while (cur <= hasta && guarda++ < 400) {
        add(cur);
        cur = sumarDias(cur, r.cada === 'quincenal' ? 14 : 7);
      }
    }
  }
  const exc = new Set((Array.isArray(e.excepciones) ? e.excepciones : []).map(fechaDe).filter(Boolean));
  return [...set].filter(f => !exc.has(f)).sort();
};

const textoFechas = (e, inicio) => {
  const r = e.repeticion;
  if (r && r.cada) {
    const dia = r.dia ? NOMBRE_DIA[DIAS_SEMANA[String(r.dia).toLowerCase()]] : '';
    const base = r.cada === 'quincenal' ? 'Cada 15 días'
      : r.cada === 'mensual' ? 'Una vez al mes'
        : dia ? `Todos los ${dia}` : 'Todas las semanas';
    return r.hasta ? `${base} · hasta el ${fmt(r.hasta)}` : base;
  }
  if (e.fin && e.fin > inicio) {
    const [yi, mi, di] = inicio.split('-').map(Number);
    const [yf, mf, df] = e.fin.split('-').map(Number);
    if (yi === yf && mi === mf) return `Del ${di} al ${df} de ${MES[mi - 1]} de ${yi}`;
    return `Del ${fmt(inicio)} al ${fmt(e.fin)}`;
  }
  const extra = (Array.isArray(e.fechas) ? e.fechas : []).map(fechaDe).filter(f => f && f !== inicio);
  if (extra.length) return `${fmt(inicio)} y ${extra.length} ${extra.length === 1 ? 'fecha más' : 'fechas más'}`;
  return '';
};


async function getJSON(url) {
  const r = await fetch(url, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return r.json();
}

async function cargarDatos() {
  const [noticias, agenda, efem, coms, recortes, portada] = await Promise.all([
    getJSON('datos/noticias.json'),
    getJSON('datos/agenda.json'),
    getJSON('datos/efemerides.json'),
    getJSON('datos/comunicados.json'),
    getJSON('datos/recortes.json'),
    getJSON('datos/portada.json').catch(() => null)
  ]);

  ARTS = noticias.map(n => {
    const body = mdBlocks(n.cuerpo);
    const deck = mdInline(n.bajada || '');
    return {
      id: idDe(n, 'fecha', 'titulo'), cat: n.categoria, t: n.titulo, deck,
      deckTxt: mdPlano(deck),
      date: n.fecha, place: n.lugar, body, plain: mdPlano(body),
      imgs: imgsDe(n, 'imagen')
    };
  }).sort(porFecha);
  CATS = ['Todas', ...new Set(ARTS.map(a => a.cat))];

  const hoy = isoHoy();
  AGENDA = agenda.map(e => {
    const inicio = e.inicio || e.fecha;
    const fin = e.fin && e.fin > inicio ? e.fin : null;
    const fechas = fechasDeEvento({ ...e, inicio });
    const enCurso = !!fin && hoy >= inicio && hoy <= fin;
    const proximo = enCurso ? (hoy > inicio ? hoy : inicio) : (fechas.find(f => f >= hoy) || null);
    const ultimo = fin && fin > (fechas[fechas.length - 1] || inicio) ? fin : (fechas[fechas.length - 1] || inicio);
    return {
      id: idDe({ fecha: inicio, titulo: e.titulo }, 'fecha', 'titulo'),
      inicio, fin, fechas, hora: e.hora, horaFin: e.hora_fin || '',
      t: e.titulo, place: e.lugar, city: e.ciudad,
      desc: mdBlocks(e.descripcion),
      imgs: imgsDe(e, 'afiche'),
      fechaTexto: textoFechas({ ...e, inicio, fin }, inicio),
      enCurso, proximo, ultimo,
      mostrar: enCurso ? inicio : (proximo || ultimo || inicio),
      orden: enCurso ? '0000-00-00' : (proximo || '9999-12-31')
    };
  }).sort((a, b) => a.orden.localeCompare(b.orden) || a.mostrar.localeCompare(b.mostrar));
  CITIES = ['Todas', ...new Set(AGENDA.map(a => a.city))];

  EFEM = efem.map(e => ({
    m: e.mes, d: e.dia, y: e.anio, t: e.titulo, x: mdInline(e.texto), det: mdBlocks(e.detalle),
    imgs: imgsDe(e, 'imagen')
  }));

  // Recortes: el primer párrafo de `texto` es la entrada de la tarjeta; el resto
  // de `texto` y `cuerpo` se leen en la vista completa.
  RECORTES = recortes.map(r => {
    const completo = [r.texto, r.cuerpo].filter(Boolean).join('\n\n');
    return {
      id: idDe(r, 'tipo', 'titulo'), tipo: r.tipo, t: r.titulo,
      lead: parrafos(r.texto)[0] || '', body: mdBlocks(completo),
      more: parrafos(completo).length > 1,
      src: credito(r.autor, r.fuente),
      imgs: imgsDe(r, 'imagen')
    };
  });
  REC_TIPOS = ['Todos', ...new Set(RECORTES.map(r => r.tipo))];

  COMS = coms.map(c => ({ id: idDe(c, 'fecha', 'titulo'), iso: c.fecha, t: c.titulo, x: c.texto, imgs: imgsDe(c, 'imagen') }))
    .sort((a, b) => b.iso.localeCompare(a.iso));

  // Imagen de portada: si el JSON falla o viene vacío, queda la del HTML.
  const banner = $('.banner img');
  if (banner && portada && portada.imagen) {
    banner.src = String(portada.imagen).replace(/^\/+/, '');
    if (portada.alt) banner.alt = portada.alt;
  }
}

/* Utilidades de estado */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const S = {
  cat: 'Todas', q: '', open: null, openRec: null, city: 'Todas', rec: 'Todos',
  year: 'Todos', month: 0,
  saved: new Set(store.get('pla-saved', []))
};

/* Fecha y año de la cabecera */
(() => {
  const n = new Date();
  const roman = num => {
    const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
    let out = '';
    vals.forEach((v, i) => { while (num >= v) { out += syms[i]; num -= v; } });
    return out;
  };
  const year = n.getFullYear();
  $('#year').textContent = `Año ${roman(Math.max(1, year - 2025))} - Región chilena, Santiago`;
  $('#dateline').textContent = `${DIAS[n.getDay()]} ${n.getDate()} de ${MES[n.getMonth()]} de ${year}`;
})();

/* Render: portada */
function renderPortada() {
  $('#boxcoms').innerHTML = COMS.slice(0, 3).map(c => `<li><button type="button" data-go="comunicados">${esc(c.t)}<small>${fmt(c.iso)}</small></button></li>`).join('');

  // Recorte del día: rota el archivo para que la portada no muestre siempre el mismo.
  const hoy = new Date();
  const dia = Math.floor((hoy - new Date(hoy.getFullYear(), 0, 0)) / 864e5);
  const rec = RECORTES.length ? RECORTES[dia % RECORTES.length] : null;
  const banda = $('#homeRecorte');
  banda.innerHTML = rec ? `
    <span class="kick">Del archivo</span>
    <p class="quote-title">${esc(rec.t)}</p>
    ${rec.src ? `<p class="quote-src">${esc(rec.src)}</p>` : ''}
    <button class="linkbtn" type="button" data-openrec="${esc(rec.id)}">Leer completo</button>` : '';
  banda.hidden = !rec;

  // Últimas tres noticias (ARTS viene de la más nueva a la más vieja).
  $('#homeNews').innerHTML = ARTS.slice(0, 3).map(a => `
    <article class="home-new">
      <span class="kick">${esc(a.cat)}</span>
      <h4><button type="button" data-open="${esc(a.id)}">${esc(a.t)}</button></h4>
      <p class="meta">${fmt(a.date)}</p>
    </article>`).join('') || '<p class="empty">Todavía no hay notas.</p>';

  // Eventos próximos, hasta tres; el título se ajusta si el primero ya no es de este mes.
  const iso = isoHoy();
  const proximos = AGENDA.filter(e => e.enCurso || e.proximo)
    .sort((a, b) => String(a.proximo || a.inicio).localeCompare(String(b.proximo || b.inicio)))
    .slice(0, 3);
  $('#homeEventsTitle').textContent = proximos.length && String(proximos[0].mostrar).slice(0, 7) === iso.slice(0, 7)
    ? 'Eventos del mes' : 'Próximos eventos';
  $('#homeEvents').innerHTML = proximos.map(e => {
    const [y, m, d] = e.mostrar.split('-').map(Number);
    const h = e.hora ? e.hora + (e.horaFin ? '–' + e.horaFin : '') + ' h · ' : '';
    return `<li class="mini-ag">
      <div class="mini-date"><span class="mini-day">${d}</span><span class="mini-mon">${MES3[m - 1]}</span><span class="mini-year">${y}</span></div>
      <div>
        <h4><button type="button" data-go="agenda">${esc(e.t)}</button></h4>
        <p class="meta">${esc(h)}${esc(e.place)} · ${esc(e.city)}</p>
        ${e.fechaTexto ? `<p class="meta mini-when">${esc(e.fechaTexto)}</p>` : ''}
      </div>
    </li>`;
  }).join('') || '<li class="empty">No hay eventos próximos.</li>';

  // Efeméride siguiente, con cuenta regresiva.
  const t0 = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const efem = EFEM.map(e => {
    let n = new Date(t0.getFullYear(), e.m - 1, e.d);
    if (n < t0) n = new Date(t0.getFullYear() + 1, e.m - 1, e.d);
    return { ...e, left: Math.round((n - t0) / 864e5) };
  }).sort((a, b) => a.left - b.left)[0];
  const caja = $('#homeEfem');
  caja.innerHTML = efem ? `
    <div class="efem-mini">
      <div class="efem-mini-date"><span>${efem.d}</span><small>${MES3[efem.m - 1]}</small><small>${efem.y}</small></div>
      <p class="efem-left">${efem.left === 0 ? 'Hoy' : efem.left === 1 ? 'Mañana' : `Faltan ${efem.left} días`}</p>
      <h4>${esc(efem.t)}</h4>
      <button class="linkbtn" type="button" data-go="efemerides">Ver efemérides</button>
    </div>` : '';
  caja.closest('.home-efem').hidden = !efem;
}

/* Render: noticias con archivo por año y mes */
function renderNews() {
  const years = [...new Set(ARTS.map(a => a.date.slice(0, 4)))].sort().reverse();
  if (S.year !== 'Todos' && !years.includes(S.year)) { S.year = 'Todos'; S.month = 0; }

  $('#yearChips').innerHTML = ['Todos', ...years].map(y => `
    <button class="chip" type="button" data-year="${y}" aria-pressed="${S.year === y}">${y === 'Todos' ? 'Todos' : y}</button>`).join('');

  const months = S.year === 'Todos' ? [] :
    [...new Set(ARTS.filter(a => a.date.startsWith(S.year)).map(a => +a.date.slice(5, 7)))].sort((a, b) => a - b);
  if (S.month && !months.includes(S.month)) S.month = 0;

  const row = $('#monthRow');
  row.hidden = months.length < 2;
  $('#monthChips').innerHTML = months.map(m => `
    <button class="chip" type="button" data-month="${m}" aria-pressed="${S.month === m}">${MES[m - 1]}</button>`).join('');

  $('#catChips').innerHTML = CATS.map(c => `<button class="chip" type="button" data-cat="${esc(c)}" aria-pressed="${S.cat === c}">${esc(c)}</button>`).join('');

  const q = S.q.trim().toLowerCase();
  const list = ARTS.filter(a =>
    (S.cat === 'Todas' || a.cat === S.cat) &&
    (S.year === 'Todos' || a.date.startsWith(S.year)) &&
    (!S.month || +a.date.slice(5, 7) === S.month) &&
    (!q || (a.t + ' ' + a.deckTxt + ' ' + a.plain).toLowerCase().includes(q))
  );

  const periodo = S.year === 'Todos' ? '' : (S.month ? ` · ${MES[S.month - 1]} ${S.year}` : ` · ${S.year}`);
  $('#newsCount').textContent = `${list.length} ${list.length === 1 ? 'nota' : 'notas'}${periodo}`;

  const filtros = S.year !== 'Todos' || S.month || S.cat !== 'Todas' || q;
  $('#newsGrid').innerHTML = list.length ? list.map(a => `
    <div class="item">
      <span class="kick">${esc(a.cat)}</span>
      <h3>${esc(a.t)}</h3>
      <p class="meta">${esc(a.place)} · ${fmt(a.date)}</p>
      ${a.deck ? `<p class="deck">${a.deck}</p>` : ''}
      <button class="linkbtn" data-open="${esc(a.id)}" type="button">Leer nota</button>
    </div>`).join('')
    : `<p class="empty" style="grid-column:1/-1">${filtros ? 'No hay notas en ese período.' : 'Todavía no hay notas publicadas.'}</p>`;
}

function renderReader() {
  const a = ARTS.find(x => x.id === S.open);
  const list = $('#newsList'), rd = $('#reader');
  if (!a) { list.hidden = false; rd.hidden = true; return; }
  list.hidden = true; rd.hidden = false;
  rd.innerHTML = `
    <button class="linkbtn back" data-close type="button">Volver a las notas</button>
    <span class="kick">${esc(a.cat)}</span>
    <h2>${esc(a.t)}</h2>
    ${a.deck ? `<p class="deck">${a.deck}</p>` : ''}
    <p class="meta">${esc(a.place)} · ${fmt(a.date)}</p>
    ${a.imgs.length ? figura(a.imgs[0], a.t) : ''}
    ${a.body ? `<div class="body">${a.body.replace(/^<p>/, '<p class="dropcap">')}</div>` : ''}
    ${galeriaHTML(a.imgs.slice(1), a.t)}`;
}

/* Render: agenda */
function renderAgenda() {
  $('#cityChips').innerHTML = CITIES.map(c => `<button class="chip" type="button" data-city="${esc(c)}" aria-pressed="${S.city === c}">${esc(c)}</button>`).join('')
    + `<button class="chip" type="button" data-city="__saved" aria-pressed="${S.city === '__saved'}">Guardados (${S.saved.size})</button>`;
  const list = AGENDA.filter(e => S.city === 'Todas' || (S.city === '__saved' ? S.saved.has(e.id) : e.city === S.city));

  // Lo que está en curso va primero; después lo próximo; al final lo que ya pasó.
  const proximas = list.filter(e => e.enCurso || e.proximo)
    .sort((a, b) => String(a.proximo || a.inicio).localeCompare(String(b.proximo || b.inicio)));
  const pasadas = list.filter(e => !e.enCurso && !e.proximo)
    .sort((a, b) => String(b.ultimo || b.inicio).localeCompare(String(a.ultimo || a.inicio)));

  $('#agCount').textContent = `${list.length} ${list.length === 1 ? 'actividad' : 'actividades'}`
    + (pasadas.length ? ` · ${pasadas.length} ${pasadas.length === 1 ? 'pasada' : 'pasadas'}` : '');

  const fila = (e, paso) => {
    const fecha = e.mostrar || e.inicio;
    const [y, m, d] = fecha.split('-').map(Number), on = S.saved.has(e.id);
    const imgs = e.imgs || [];
    const extra = e.desc || imgs.length;
    const h = e.hora ? e.hora + (e.horaFin ? '–' + e.horaFin : '') + ' h · ' : '';
    const accion = paso
      ? (on
        ? `<button class="btn alt" type="button" data-save="${esc(e.id)}" aria-pressed="true">Quitar</button>`
        : '<span class="ag-flag">Ya pasó</span>')
      : `<button class="btn${on ? '' : ' alt'}" type="button" data-save="${esc(e.id)}" aria-pressed="${on}">${on ? 'Guardado' : 'Guardar'}</button>`;
    return `<div class="ag${paso ? ' pasada' : ''}">
      <div class="ag-date"><span class="ag-day">${d}</span><span class="ag-mon">${MES3[m - 1]}</span><span class="ag-year">${y}</span></div>
      <div class="ag-body">
        ${e.enCurso ? '<span class="ag-flag">En curso</span>' : ''}
        <h3>${esc(e.t)}</h3>
        <p class="meta">${esc(h)}${esc(e.place)} · ${esc(e.city)}</p>
        ${e.fechaTexto ? `<p class="meta ag-when">${esc(e.fechaTexto)}</p>` : ''}
        ${extra ? `<details class="more">
          <summary class="linkbtn"><span class="more-open">Leer más</span><span class="more-close">Leer menos</span></summary>
          ${imgs[0] ? figura(imgs[0], 'Afiche: ' + e.t, 'afiche') : ''}
          ${galeriaHTML(imgs.slice(1), e.t)}
          ${e.desc}
        </details>` : ''}
      </div>
      ${accion}
    </div>`;
  };

  const bloques = [];
  if (proximas.length) bloques.push(proximas.map(e => fila(e, false)).join(''));
  if (pasadas.length) {
    bloques.push(`<h3 class="ag-sep"><span>Ya pasaron (${pasadas.length})</span></h3>`);
    bloques.push(pasadas.map(e => fila(e, true)).join(''));
  }
  $('#agList').innerHTML = list.length ? bloques.join('') : '<p class="empty">No hay actividades para este filtro.</p>';
}

/* Render: efemérides */
function renderEfem() {
  const now = new Date(), t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const items = EFEM.map(e => {
    let n = new Date(t0.getFullYear(), e.m - 1, e.d); if (n < t0) n = new Date(t0.getFullYear() + 1, e.m - 1, e.d);
    return { ...e, left: Math.round((n - t0) / 864e5) };
  }).sort((a, b) => a.left - b.left);
  $('#efList').innerHTML = items.map(e => `
    <div class="ef">
      <div class="ef-date"><span class="ef-day">${esc(e.d)}</span><span class="ef-mon">${esc(MES3[e.m - 1] || '')}</span><span class="ef-year">${esc(e.y)}</span></div>
      <div>
        <span class="kick">${e.left === 0 ? 'Hoy' : e.left === 1 ? 'Mañana' : 'Faltan ' + e.left + ' días'}</span>
        <h3>${esc(e.t)}</h3>
        <p>${e.x}</p>
        ${e.det || e.imgs.length ? `<details class="more">
          <summary class="linkbtn"><span class="more-open">Leer más</span><span class="more-close">Leer menos</span></summary>
          ${e.imgs.length ? figura(e.imgs[0], 'Imagen: ' + e.t, 'detail-img') : ''}
          ${galeriaHTML(e.imgs.slice(1), e.t)}
          ${e.det}
        </details>` : ''}
      </div>
    </div>`).join('');
}

/* Render: lecturas (internamente recortes: extractos, frases e historias) */
function renderRecortes() {
  if (!REC_TIPOS.includes(S.rec)) S.rec = 'Todos';
  $('#recChips').innerHTML = REC_TIPOS.map(t => `
    <button class="chip" type="button" data-rec="${esc(t)}" aria-pressed="${S.rec === t}">${esc(t)}</button>`).join('');

  const list = RECORTES.filter(r => S.rec === 'Todos' || r.tipo === S.rec);
  $('#recCount').textContent = `${list.length} ${list.length === 1 ? 'lectura' : 'lecturas'}`;
  $('#recList').innerHTML = list.length ? list.map(r => `
    <article class="rec rec-${slug(r.tipo)}${r.more ? ' rec-long' : ''}">
      <span class="kick">${esc(r.tipo)}</span>
      <h3>${esc(r.t)}</h3>
      <div class="rec-text"><p>${mdInline(r.lead)}</p></div>
      ${r.more ? `<button class="linkbtn" type="button" data-openrec="${esc(r.id)}">Leer completo</button>` : ''}
      ${r.src ? `<p class="rec-src">${esc(r.src)}</p>` : ''}
    </article>`).join('') : '<p class="empty">Todavía no hay lecturas de este tipo.</p>';
}

/* Render: una lectura completa, en su propia vista */
function renderRecorte() {
  const r = RECORTES.find(x => x.id === S.openRec);
  const box = $('#recView');
  if (!r) {
    box.innerHTML = `<p class="empty">Esa lectura ya no está disponible.</p>
      <p style="text-align:center"><button class="linkbtn" type="button" data-gorec>Volver a Lecturas</button></p>`;
    return;
  }
  box.innerHTML = `
    <button class="linkbtn back" type="button" data-gorec>Volver a las lecturas</button>
    <span class="kick">${esc(r.tipo)}</span>
    <h2>${esc(r.t)}</h2>
    ${r.imgs.length ? figura(r.imgs[0], r.t) : ''}
    <div class="body">${r.body.replace(/^<p>/, '<p class="dropcap">')}</div>
    ${galeriaHTML(r.imgs.slice(1), r.t)}
    ${r.src ? `<p class="rec-src">${esc(r.src)}</p>` : ''}`;
}

/* Render: comunicados */
function renderComs() {
  $('#comList').innerHTML = COMS.map((c, i) => `
    <details${i === 0 ? ' open' : ''}>
      <summary><h3>${esc(c.t)}</h3><span>${fmt(c.iso)}</span></summary>
      ${c.imgs.length ? figura(c.imgs[0], c.t) : ''}
      ${mdBlocks(c.x)}
      ${galeriaHTML(c.imgs.slice(1), c.t)}
    </details>`).join('');
}

/* Rutas reales (/noticias, /agenda...). En el respaldo de GitHub Pages se usa
   hash (#noticias): allí no hay rewrites y las rutas reales darían 404. */
const VIEWS = ['portada', 'noticias', 'recortes', 'recorte', 'agenda', 'efemerides', 'comunicados', 'contacto'];
const ES_PAGES = /\.github\.io$/i.test(location.hostname);
const BASE = ES_PAGES ? '/porlaanarquia/' : '/';
const hrefDe = v => ES_PAGES ? '#' + v : BASE + v;

function rutaActual() {
  if (ES_PAGES) return location.hash.replace(/^#\/?/, '');
  let p = location.pathname;
  if (BASE !== '/' && p.indexOf(BASE) === 0) p = p.slice(BASE.length);
  return p.replace(/^\/+/, '');
}

function route() {
  const ruta = rutaActual();
  let v = ruta;
  if (!VIEWS.includes(v)) {
    v = 'portada';
    if (!ES_PAGES && ruta) history.replaceState(null, '', hrefDe('portada'));
  }
  if (v === 'recorte' && !S.openRec) { go('recortes', true); return; }
  VIEWS.forEach(x => { $('#v-' + x).hidden = x !== v; });
  $$('.nav a').forEach(a => a.removeAttribute('aria-current'));
  const activo = $(`.nav a[href="${hrefDe(v === 'recorte' ? 'recortes' : v)}"]`);
  if (activo) activo.setAttribute('aria-current', 'page');
  if (v === 'noticias') renderReader();
  if (v === 'recorte') renderRecorte();
  window.scrollTo(0, 0);
}

function go(v, reemplazar) {
  const href = hrefDe(v);
  if (ES_PAGES) {
    if (location.hash === href) route(); else location.hash = href;
    return;
  }
  if (location.pathname === href) { route(); return; }
  history[reemplazar ? 'replaceState' : 'pushState'](null, '', href);
  route();
}

window.addEventListener('popstate', route);
window.addEventListener('hashchange', route);

// Enlaces internos: navegación sin recargar.
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href]');
  if (!a || (a.target && a.target !== '_self')) return;
  const href = a.getAttribute('href') || '';
  if (/^(mailto:|tel:|https?:|\/\/)/i.test(href)) return;
  let ruta = null;
  if (href.indexOf('#/') === 0) ruta = href.slice(2);
  else if (href.charAt(0) === '/' && href.indexOf('//') !== 0) ruta = href.slice(1);
  if (!ruta) return;
  e.preventDefault();
  go(ruta);
});

// Enlaces antiguos con hash en el dominio propio: se canonizan a ruta real.
if (!ES_PAGES && /^#/.test(location.hash)) {
  const legado = location.hash.replace(/^#\/?/, '');
  if (VIEWS.includes(legado)) history.replaceState(null, '', hrefDe(legado));
}

/* Eventos */
document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.go) return go(t.dataset.go);
  if (t.dataset.open) { S.open = t.dataset.open; return go('noticias'); }
  if (t.dataset.openrec) { S.openRec = t.dataset.openrec; return go('recorte'); }
  if ('gorec' in t.dataset) { S.openRec = null; return go('recortes'); }
  if ('close' in t.dataset) { S.open = null; renderReader(); return window.scrollTo(0, 0); }
  if (t.dataset.cat) { S.cat = t.dataset.cat; return renderNews(); }
  if (t.dataset.rec) { S.rec = t.dataset.rec; return renderRecortes(); }
  if (t.dataset.year) { S.year = t.dataset.year; S.month = 0; return renderNews(); }
  if (t.dataset.month) { S.month = +t.dataset.month; return renderNews(); }
  if (t.dataset.city) { S.city = t.dataset.city; return renderAgenda(); }
  if (t.dataset.save) {
    S.saved.has(t.dataset.save) ? S.saved.delete(t.dataset.save) : S.saved.add(t.dataset.save);
    store.set('pla-saved', [...S.saved]); return renderAgenda();
  }
});
$('#q').addEventListener('input', e => { S.q = e.target.value; renderNews(); });

$('#copyBtn').addEventListener('click', async () => {
  const el = $('#mail'), btn = $('#copyBtn');
  try { await navigator.clipboard.writeText(el.textContent); btn.textContent = 'Copiado'; }
  catch (err) { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = 'Seleccionado'; }
  setTimeout(() => { btn.textContent = 'Copiar'; }, 1800);
});
$('#form').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#f-name').value.trim();
  const sub = $('#f-sub').value.trim();
  const msg = $('#f-msg').value.trim();
  if (!msg) { $('#status').textContent = 'Escribe un mensaje antes de enviar.'; return; }
  const lines = [];
  if (name) lines.push(`Nombre o colectivo: ${name}`);
  if (sub) lines.push(`Tipo de envío: ${sub}`);
  if (lines.length) lines.push('');
  lines.push(msg);
  const subject = sub ? `Contacto — ${sub}` : 'Contacto — Por la Anarquía';
  window.location.href = `mailto:${MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  $('#status').textContent = 'Se abrirá tu cliente de correo con el mensaje listo para enviar.';
});

/* Tema */
const root = document.documentElement, tbtn = $('#themeBtn');
const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
const syncTheme = () => { tbtn.textContent = isDark() ? 'Edición diurna' : 'Edición nocturna'; };
const savedTheme = store.get('pla-theme', null); if (savedTheme) root.dataset.theme = savedTheme;
tbtn.addEventListener('click', () => { const n = isDark() ? 'light' : 'dark'; root.dataset.theme = n; store.set('pla-theme', n); syncTheme(); });
syncTheme();

/* Arranque */
async function arrancar() {
  try {
    await cargarDatos();
    renderPortada(); renderNews(); renderRecortes(); renderAgenda(); renderEfem(); renderComs(); route();
  } catch (err) {
    console.error('No se pudieron cargar los datos:', err);
    const aviso = '<p class="empty">No se pudieron cargar los datos. Revisa la conexión o los archivos de <code>datos/</code>.</p>';
    ['#boxcoms', '#newsGrid', '#recList', '#agList', '#efList', '#comList'].forEach(sel => { const el = $(sel); if (el) el.innerHTML = aviso; });
  }
}
arrancar();
