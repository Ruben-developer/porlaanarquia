/* Por la anarquía — lógica del portal.
   Los datos viven en datos/*.json; este archivo solo los carga y los pinta. */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const MES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MES3 = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const DIAS = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const fmt = iso => { const [y, m, d] = iso.split('-').map(Number); return `${d} de ${MES[m - 1]} de ${y}`; };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const MAIL = 'por-la-anarquia@riseup.net';

/* Los datos se llenan desde los JSON */
let ARTS = [], AGENDA = [], EFEM = [], COMS = [], RECORTES = [];
let CATS = ['Todas'], CITIES = ['Todas'], REC_TIPOS = ['Todos'];

const parrafos = s => String(s || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
const porFecha = (a, b) => b.date.localeCompare(a.date);
const slug = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const idDe = (item, campoFecha, campoTitulo) =>
  item.id || `${item[campoFecha]}-${slug(item[campoTitulo])}`;

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

  ARTS = noticias.map(n => ({
    id: idDe(n, 'fecha', 'titulo'), cat: n.categoria, t: n.titulo, deck: n.bajada,
    date: n.fecha, place: n.lugar, body: parrafos(n.cuerpo),
    img: n.imagen ? String(n.imagen).replace(/^\/+/, '') : null
  })).sort(porFecha);
  CATS = ['Todas', ...new Set(ARTS.map(a => a.cat))];

  AGENDA = agenda.map(e => ({
    id: idDe(e, 'fecha', 'titulo'), iso: e.fecha, hora: e.hora, t: e.titulo, place: e.lugar, city: e.ciudad,
    desc: parrafos(e.descripcion), afiche: e.afiche ? String(e.afiche).replace(/^\/+/, '') : null
  })).sort((a, b) => a.iso.localeCompare(b.iso));
  CITIES = ['Todas', ...new Set(AGENDA.map(a => a.city))];

  EFEM = efem.map(e => ({
    m: e.mes, d: e.dia, y: e.anio, t: e.titulo, x: e.texto, det: parrafos(e.detalle)
  }));

  RECORTES = recortes.map(r => ({
    id: idDe(r, 'tipo', 'titulo'), tipo: r.tipo, t: r.titulo, body: parrafos(r.texto),
    autor: r.autor || '', fuente: r.fuente || ''
  }));
  REC_TIPOS = ['Todos', ...new Set(RECORTES.map(r => r.tipo))];

  COMS = coms.map(c => ({ id: idDe(c, 'fecha', 'titulo'), iso: c.fecha, t: c.titulo, x: c.texto }))
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
  cat: 'Todas', q: '', open: null, city: 'Todas', rec: 'Todos',
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
    (!q || (a.t + ' ' + a.deck + ' ' + a.body.join(' ')).toLowerCase().includes(q))
  );

  const periodo = S.year === 'Todos' ? '' : (S.month ? ` · ${MES[S.month - 1]} ${S.year}` : ` · ${S.year}`);
  $('#newsCount').textContent = `${list.length} ${list.length === 1 ? 'nota' : 'notas'}${periodo}`;

  const filtros = S.year !== 'Todos' || S.month || S.cat !== 'Todas' || q;
  $('#newsGrid').innerHTML = list.length ? list.map(a => `
    <div class="item">
      <span class="kick">${esc(a.cat)}</span>
      <h3>${esc(a.t)}</h3>
      <p class="meta">${esc(a.place)} · ${fmt(a.date)}</p>
      <p class="deck">${esc(a.deck)}</p>
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
    <p class="deck">${esc(a.deck)}</p>
    <p class="meta">${esc(a.place)} · ${fmt(a.date)}</p>
    ${a.img ? `<figure class="foto"><img src="${esc(a.img)}" alt="" loading="lazy"></figure>` : ''}
    <div class="body">${a.body.map((p, i) => `<p${i === 0 ? ' class="dropcap"' : ''}>${esc(p)}</p>`).join('')}</div>
    <hr>
    <p class="note">Texto de ejemplo escrito para la maqueta. Los hechos, lugares y cifras no son reales.</p>`;
}

/* Render: agenda */
function renderAgenda() {
  $('#cityChips').innerHTML = CITIES.map(c => `<button class="chip" type="button" data-city="${esc(c)}" aria-pressed="${S.city === c}">${esc(c)}</button>`).join('')
    + `<button class="chip" type="button" data-city="__saved" aria-pressed="${S.city === '__saved'}">Guardados (${S.saved.size})</button>`;
  const list = AGENDA.filter(e => S.city === 'Todas' || (S.city === '__saved' ? S.saved.has(e.id) : e.city === S.city));
  $('#agCount').textContent = `${list.length} ${list.length === 1 ? 'actividad' : 'actividades'}`;
  $('#agList').innerHTML = list.length ? list.map(e => {
    const [y, m, d] = e.iso.split('-').map(Number), on = S.saved.has(e.id);
    const extra = e.desc.length || e.afiche;
    return `<div class="ag">
      <div class="ag-date"><span class="ag-day">${d}</span><span class="ag-mon">${MES3[m - 1]}</span></div>
      <div class="ag-body">
        <h3>${esc(e.t)}</h3>
        <p class="meta">${esc(e.hora)} h · ${esc(e.place)} · ${esc(e.city)}</p>
        ${extra ? `<details class="more">
          <summary class="linkbtn"><span class="more-open">Leer más</span><span class="more-close">Leer menos</span></summary>
          ${e.desc.map(p => `<p>${esc(p)}</p>`).join('')}
          ${e.afiche ? `<figure class="afiche"><img src="${esc(e.afiche)}" alt="Afiche: ${esc(e.t)}" loading="lazy"></figure>` : ''}
        </details>` : ''}
      </div>
      <button class="btn${on ? '' : ' alt'}" type="button" data-save="${esc(e.id)}" aria-pressed="${on}">${on ? 'Guardado' : 'Guardar'}</button>
    </div>`;
  }).join('') : '<p class="empty">Todavía no has guardado actividades.</p>';
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
      <div class="ef-year">${esc(e.y)}<small>${esc(e.d)} ${esc(MES3[e.m - 1] || '')}</small></div>
      <div>
        <span class="kick">${e.left === 0 ? 'Hoy' : e.left === 1 ? 'Mañana' : 'Faltan ' + e.left + ' días'}</span>
        <h3>${esc(e.t)}</h3>
        <p>${esc(e.x)}</p>
        ${e.det.length ? `<details class="more">
          <summary class="linkbtn"><span class="more-open">Leer más</span><span class="more-close">Leer menos</span></summary>
          ${e.det.map(p => `<p>${esc(p)}</p>`).join('')}
        </details>` : ''}
      </div>
    </div>`).join('');
}

/* Render: recortes (extractos, frases e historias) */
function renderRecortes() {
  if (!REC_TIPOS.includes(S.rec)) S.rec = 'Todos';
  $('#recChips').innerHTML = REC_TIPOS.map(t => `
    <button class="chip" type="button" data-rec="${esc(t)}" aria-pressed="${S.rec === t}">${esc(t)}</button>`).join('');

  const list = RECORTES.filter(r => S.rec === 'Todos' || r.tipo === S.rec);
  $('#recCount').textContent = `${list.length} ${list.length === 1 ? 'recorte' : 'recortes'}`;
  $('#recList').innerHTML = list.length ? list.map(r => `
    <article class="rec rec-${slug(r.tipo)}">
      <span class="kick">${esc(r.tipo)}</span>
      <h3>${esc(r.t)}</h3>
      <div class="rec-text">${r.body.map(p => `<p>${esc(p)}</p>`).join('')}</div>
      ${r.autor || r.fuente ? `<p class="rec-src">${[r.autor, r.fuente].filter(Boolean).map(esc).join(' · ')}</p>` : ''}
    </article>`).join('') : '<p class="empty">Todavía no hay recortes de este tipo.</p>';
}

/* Render: comunicados */
function renderComs() {
  $('#comList').innerHTML = COMS.map((c, i) => `
    <details${i === 0 ? ' open' : ''}>
      <summary><h3>${esc(c.t)}</h3><span>${fmt(c.iso)}</span></summary>
      <p>${esc(c.x)}</p>
    </details>`).join('');
}

/* Rutas por hash */
const VIEWS = ['portada', 'noticias', 'recortes', 'agenda', 'efemerides', 'comunicados', 'contacto'];
function route() {
  let v = location.hash.replace('#', ''); if (!VIEWS.includes(v)) v = 'portada';
  VIEWS.forEach(x => { $('#v-' + x).hidden = x !== v; });
  $$('.nav a').forEach(a => a.removeAttribute('aria-current'));
  $(`.nav a[href="#${v}"]`).setAttribute('aria-current', 'page');
  if (v === 'noticias') renderReader();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
const go = v => { if (location.hash === '#' + v) route(); else location.hash = v; };

/* Eventos */
document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.go) return go(t.dataset.go);
  if (t.dataset.open) { S.open = t.dataset.open; return go('noticias'); }
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
