/* Por la anarquía — lógica de la maqueta (datos de ejemplo incluidos). */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const MES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MES3 = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const DIAS = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const fmt = iso => { const [y, m, d] = iso.split('-').map(Number); return `${d} de ${MES[m - 1]} de ${y}`; };
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const ARTS = [
  { id: 'a1', cat: 'Cultura', t: 'La feria del libro libertario cumple diez años con veinte mesas y tres debates', deck: 'Colectivos, imprentas y bibliotecas autónomas se reunieron durante dos días en el barrio Yungay.', date: '2026-10-31', place: 'Santiago',
    body: ['Durante el fin de semana, más de veinte mesas ocuparon el patio de un antiguo conventillo del barrio Yungay. Hubo folletos a precio de costo, afiches serigrafiados en el lugar y una mesa de intercambio donde cada persona podía dejar un libro y llevarse otro.',
      'El sábado en la tarde se realizaron tres debates abiertos: sobre autogestión de espacios, sobre vivienda y sobre la circulación de la prensa libertaria en tiempos de redes sociales. Cada uno terminó con una ronda de propuestas que quedó anotada en un papelógrafo a la entrada.',
      'Las organizadoras informaron que la próxima feria será en Valparaíso, en diciembre, y que quienes quieran poner mesa deben escribir con una semana de anticipación.'] },
  { id: 'a2', cat: 'Solidaridad', t: 'Vecinas del barrio Matta reactivan la olla común de los domingos', deck: 'La cocina colectiva vuelve a funcionar con verduras donadas por una feria cercana.', date: '2026-10-29', place: 'Santiago',
    body: ['Cada domingo a las doce, en la esquina de una plaza del barrio Matta, se arma una cocina al aire libre. Esta semana se repartieron ciento ochenta platos de legumbres con verduras de estación.',
      'Las vecinas que sostienen la olla piden ollas grandes, leña seca y manos para pelar. También reciben utensilios y frascos limpios para llevar la comida a quienes no pueden acercarse.',
      'La próxima jornada comienza a las nueve de la mañana, con la compra colectiva en la feria.'] },
  { id: 'a3', cat: 'Trabajo', t: 'Sindicato de oficios varios discute la jornada de 40 horas en asamblea abierta', deck: 'La reunión terminó con un acuerdo para repartir un volante en los lugares de trabajo.', date: '2026-10-27', place: 'Santiago',
    body: ['Más de cuarenta personas llegaron a la asamblea del sindicato, entre trabajadoras de casa particular, gásfiteres, cocineros y repartidores. La conversación giró en torno a cómo se aplicará la reducción de jornada en los oficios sin contrato fijo.',
      'Se acordó imprimir un volante con preguntas y respuestas, y repartirlo en terminales, ferias y puntos de reparto. El borrador queda abierto para que lo corrija quien quiera.'] },
  { id: 'a4', cat: 'Ecología', t: 'Taller de huerta urbana busca un sitio baldío para sembrar en primavera', deck: 'El grupo ya tiene semillas, compost y herramientas. Falta el terreno.', date: '2026-10-25', place: 'Concepción',
    body: ['Un grupo de vecinas y estudiantes de Concepción prepara una huerta comunitaria y busca un sitio baldío con acceso a agua. Piden que quien conozca un terreno disponible deje el dato en la mesa del taller.',
      'Las sesiones son los sábados por la mañana y cada persona lleva lo que pueda: semillas, palas, cajones o simplemente ganas de aprender.'] },
  { id: 'a5', cat: 'Memoria', t: 'Ciclo de cine documental recorre las luchas obreras del norte salitrero', deck: 'Cuatro funciones gratuitas, con conversatorio después de cada proyección.', date: '2026-10-22', place: 'Valparaíso',
    body: ['El ciclo reúne documentales y archivos sobre las oficinas salitreras, las mancomunales y las huelgas de comienzos del siglo XX. Cada función incluye una breve presentación histórica.',
      'Tras la película se abre una conversación con el público. Hay mate, sopaipillas y una mesa con folletos para llevar.'] },
  { id: 'a6', cat: 'Cultura', t: 'Una imprenta autogestionada prepara un pliego de poemas y grabados', deck: 'La tirada será pequeña, impresa a mano y vendida a precio de costo.', date: '2026-10-20', place: 'Santiago',
    body: ['En un taller del centro, tres personas componen a mano un pliego de poemas ilustrado con grabados en linóleo. La tirada será de trescientos ejemplares numerados.',
      'Quienes quieran aportar textos o ayudar a doblar y coser pueden pasar los jueves en la tarde.'] }
];
const CATS = ['Todas', ...new Set(ARTS.map(a => a.cat))];

const AGENDA = [
  { id: 'e1', iso: '2026-11-07', hora: '17:00', t: 'Presentación del pliego «Memoria del salitre»', place: 'Ateneo de barrio, calle ficticia 123', city: 'Santiago' },
  { id: 'e2', iso: '2026-11-11', hora: '19:00', t: 'Velada por los mártires de Chicago', place: 'Biblioteca autónoma del centro', city: 'Santiago' },
  { id: 'e3', iso: '2026-11-14', hora: '12:30', t: 'Almuerzo solidario y feria de ropa', place: 'Plazuela del cerro', city: 'Valparaíso' },
  { id: 'e4', iso: '2026-11-20', hora: '18:30', t: 'Conversatorio a 90 años de la muerte de Durruti', place: 'Sala del sindicato', city: 'Concepción' },
  { id: 'e5', iso: '2026-11-28', hora: '11:00', t: 'Taller abierto de serigrafía', place: 'Taller colectivo, barrio Yungay', city: 'Santiago' },
  { id: 'e6', iso: '2026-12-05', hora: '16:00', t: 'Feria del libro libertario de diciembre', place: 'Galpón cultural', city: 'Valparaíso' }
];
const CITIES = ['Todas', ...new Set(AGENDA.map(a => a.city))];

const EFEM = [
  { m: 11, d: 11, y: 1887, t: 'Ejecución de los mártires de Chicago', x: 'Cuatro anarquistas fueron ahorcados en Chicago tras el juicio por los hechos de Haymarket. Su memoria está en el origen de la conmemoración del 1.º de Mayo.' },
  { m: 11, d: 20, y: 1936, t: 'Muere Buenaventura Durruti en Madrid', x: 'El militante anarcosindicalista murió durante la defensa de Madrid, en plena Guerra Civil española.' },
  { m: 12, d: 9, y: 1842, t: 'Nace Piotr Kropotkin', x: 'Geógrafo y teórico del comunismo libertario, autor de El apoyo mutuo y La conquista del pan.' },
  { m: 12, d: 21, y: 1907, t: 'Masacre de la escuela Santa María de Iquique', x: 'El ejército disparó contra obreros del salitre y sus familias reunidos en Iquique. Es uno de los episodios más recordados de la historia obrera chilena.' }
];

const COMS = [
  { id: 'c1', iso: '2026-10-30', t: 'Convocatoria a asamblea de coordinación', x: 'Se invita a los colectivos, bibliotecas y talleres a la asamblea de coordinación de noviembre. Se conversará el calendario de actividades, la distribución de volantes y la próxima feria. Cada colectivo puede llevar un punto para la tabla.' },
  { id: 'c2', iso: '2026-10-28', t: 'Cambio de local de la biblioteca autónoma', x: 'La biblioteca autónoma del centro se traslada a un local más amplio a media cuadra del anterior. Se necesitan manos para mover estantes y cajas el sábado en la mañana. Los horarios de préstamo no cambian.' },
  { id: 'c3', iso: '2026-10-24', t: 'Se reciben textos para el próximo número', x: 'Estamos reuniendo crónicas breves, entrevistas y reseñas para el próximo número. Los textos deben tener menos de mil palabras y llegar con firma. También recibimos grabados y fotografías en blanco y negro.' }
];

/* Utilidades de estado */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const S = { cat: 'Todas', q: '', open: null, city: 'Todas', saved: new Set(store.get('pla-saved', [])) };

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
  $('#year').textContent = `Año ${roman(Math.max(1, year - 2025))}`;
  $('#dateline').textContent = `${DIAS[n.getDay()]} ${n.getDate()} de ${MES[n.getMonth()]} de ${year}`;
})();

/* Sello */
const SEAL = `<svg class="seal" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs><path id="ring" d="M80 80 m-58 0 a58 58 0 1 1 116 0 a58 58 0 1 1 -116 0"/></defs>
  <circle cx="80" cy="80" r="74" fill="var(--ink)"/>
  <circle cx="80" cy="80" r="70" fill="none" stroke="var(--paper)" stroke-width="1.2" stroke-dasharray="2 3"/>
  <circle cx="80" cy="80" r="40" fill="none" stroke="var(--paper)" stroke-width="1.6"/>
  <text font-family="Playfair Display, Georgia, serif" font-weight="700" font-size="13" letter-spacing="3" fill="var(--paper)"><textPath href="#ring" startOffset="0">DIFUSIÓN LIBRE · SIN AMOS · SIN PATRONES · </textPath></text>
  <text x="80" y="97" text-anchor="middle" font-family="Limelight, Georgia, serif" font-size="52" fill="var(--paper)">A</text>
</svg>`;

/* Render: portada */
function renderPortada() {
  const [a, b] = ARTS;
  $('#leads').innerHTML = `
    <div class="story">
      <span class="kick">${a.cat} · ${a.place}</span>
      <h3>${esc(a.t)}</h3>
      <p class="dropcap">${esc(a.body[0])}</p>
      <button class="linkbtn" data-open="${a.id}" type="button">Leer la nota completa</button>
    </div>
    ${SEAL}
    <div class="story">
      <span class="kick">${b.cat} · ${b.place}</span>
      <h3>${esc(b.t)}</h3>
      <p>${esc(b.deck)}</p>
      <button class="linkbtn" data-open="${b.id}" type="button">Leer la nota completa</button>
    </div>`;
  $('#boxcoms').innerHTML = COMS.map(c => `<li><button type="button" data-go="comunicados">${esc(c.t)}<small>${fmt(c.iso)}</small></button></li>`).join('');
}

/* Render: noticias */
function renderNews() {
  $('#catChips').innerHTML = CATS.map(c => `<button class="chip" type="button" data-cat="${c}" aria-pressed="${S.cat === c}">${c}</button>`).join('');
  const q = S.q.trim().toLowerCase();
  const list = ARTS.filter(a => (S.cat === 'Todas' || a.cat === S.cat) && (!q || (a.t + ' ' + a.deck + ' ' + a.body.join(' ')).toLowerCase().includes(q)));
  $('#newsCount').textContent = `${list.length} ${list.length === 1 ? 'nota' : 'notas'}`;
  $('#newsGrid').innerHTML = list.length ? list.map(a => `
    <div class="item">
      <span class="kick">${a.cat}</span>
      <h3>${esc(a.t)}</h3>
      <p class="meta">${a.place} · ${fmt(a.date)}</p>
      <p class="deck">${esc(a.deck)}</p>
      <button class="linkbtn" data-open="${a.id}" type="button">Leer nota</button>
    </div>`).join('') : '<p class="empty" style="grid-column:1/-1">Ninguna nota coincide con la búsqueda.</p>';
}
function renderReader() {
  const a = ARTS.find(x => x.id === S.open);
  const list = $('#newsList'), rd = $('#reader');
  if (!a) { list.hidden = false; rd.hidden = true; return; }
  list.hidden = true; rd.hidden = false;
  rd.innerHTML = `
    <button class="linkbtn back" data-close type="button">Volver a las notas</button>
    <span class="kick">${a.cat}</span>
    <h2>${esc(a.t)}</h2>
    <p class="deck">${esc(a.deck)}</p>
    <p class="meta">${a.place} · ${fmt(a.date)}</p>
    <div class="body">${a.body.map((p, i) => `<p${i === 0 ? ' class="dropcap"' : ''}>${esc(p)}</p>`).join('')}</div>
    <hr>
    <p class="note">Texto de ejemplo escrito para la maqueta. Los hechos, lugares y cifras no son reales.</p>`;
}

/* Render: agenda */
function renderAgenda() {
  $('#cityChips').innerHTML = CITIES.map(c => `<button class="chip" type="button" data-city="${c}" aria-pressed="${S.city === c}">${c}</button>`).join('')
    + `<button class="chip" type="button" data-city="__saved" aria-pressed="${S.city === '__saved'}">Guardados (${S.saved.size})</button>`;
  const list = AGENDA.filter(e => S.city === 'Todas' || (S.city === '__saved' ? S.saved.has(e.id) : e.city === S.city));
  $('#agCount').textContent = `${list.length} ${list.length === 1 ? 'actividad' : 'actividades'}`;
  $('#agList').innerHTML = list.length ? list.map(e => {
    const [y, m, d] = e.iso.split('-').map(Number), on = S.saved.has(e.id);
    return `<div class="ag">
      <div class="ag-date"><span class="ag-day">${d}</span><span class="ag-mon">${MES3[m - 1]}</span></div>
      <div><h3>${esc(e.t)}</h3><p class="meta">${e.hora} h · ${esc(e.place)} · ${e.city}</p></div>
      <button class="btn${on ? '' : ' alt'}" type="button" data-save="${e.id}" aria-pressed="${on}">${on ? 'Guardado' : 'Guardar'}</button>
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
      <div class="ef-year">${e.y}<small>${e.d} ${MES3[e.m - 1]}</small></div>
      <div>
        <span class="kick">${e.left === 0 ? 'Hoy' : e.left === 1 ? 'Mañana' : 'Faltan ' + e.left + ' días'}</span>
        <h3>${esc(e.t)}</h3>
        <p>${esc(e.x)}</p>
      </div>
    </div>`).join('');
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
const VIEWS = ['portada', 'noticias', 'agenda', 'efemerides', 'comunicados', 'contacto'];
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
  $('#status').textContent = !$('#f-msg').value.trim()
    ? 'Escribe un mensaje antes de enviar.'
    : 'Esto es una maqueta: el formulario todavía no envía nada.';
});

/* Tema */
const root = document.documentElement, tbtn = $('#themeBtn');
const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
const syncTheme = () => { tbtn.textContent = isDark() ? 'Edición diurna' : 'Edición nocturna'; };
const savedTheme = store.get('pla-theme', null); if (savedTheme) root.dataset.theme = savedTheme;
tbtn.addEventListener('click', () => { const n = isDark() ? 'light' : 'dark'; root.dataset.theme = n; store.set('pla-theme', n); syncTheme(); });
syncTheme();

/* Arranque */
renderPortada(); renderNews(); renderAgenda(); renderEfem(); renderComs(); route();
