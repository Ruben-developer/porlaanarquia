/* Por la anarquía — render mínimo de Markdown.
   Los campos largos del CMS (Pages CMS, `type: rich-text`) guardan Markdown.
   Aquí se convierte a HTML con un subconjunto deliberado: párrafos, títulos,
   listas, citas, separadores, negrita, cursiva, tachado, código y enlaces.
   Todo el texto se escapa antes de formatear: no se acepta HTML del CMS. */

const mdEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const mdUrl = u => {
  const t = u.replace(/&amp;/g, '&').trim();
  if (/^(https?:|mailto:|tel:)/i.test(t)) return u;
  if (/^[#/.]/.test(t)) return u;
  return null;
};

const mdEnfasis = s => s
  .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
  .replace(/__([^_\n]+)__/g, '<strong>$1</strong>')
  .replace(/~~([^~\n]+)~~/g, '<del>$1</del>')
  .replace(/(^|[^\w*])\*([^*\n]+)\*(?![\w*])/g, '$1<em>$2</em>')
  .replace(/(^|[^\w_])_([^_\n]+)_(?![\w_])/g, '$1<em>$2</em>');

/* Formato dentro de un párrafo: sin <p> ni listas. */
const mdInline = src => {
  const guardado = [];
  const guardar = html => `\u0000${guardado.push(html) - 1}\u0000`;
  let s = mdEsc(src);

  s = s.replace(/`([^`\n]+)`/g, (_, c) => guardar(`<code>${c}</code>`));

  s = s.replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (todo, txt, url) => {
    const href = mdUrl(url);
    return href ? guardar(`<a href="${href}" rel="noopener noreferrer">${mdEnfasis(txt)}</a>`) : todo;
  });

  s = s.replace(/(^|[\s(])(https?:\/\/[^\s<)\u0000]+)/g, (_, pre, url) => {
    const cola = (url.match(/[.,;:!?]+$/) || [''])[0];
    const limpia = cola ? url.slice(0, -cola.length) : url;
    if (!limpia) return pre + url;
    return pre + guardar(`<a href="${limpia}" rel="noopener noreferrer">${limpia}</a>`) + cola;
  });

  s = mdEnfasis(s);
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => guardado[+i]);
  return s.replace(/\s*\n\s*/g, ' ');
};

/* Bloques: párrafos separados por línea en blanco, listas, citas y títulos. */
const mdBlocks = src => {
  const lineas = String(src || '').replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let para = [], lista = null, cita = null;

  const cerrarPara = () => { if (para.length) { out.push(`<p>${mdInline(para.join(' '))}</p>`); para = []; } };
  const cerrarLista = () => {
    if (lista) {
      out.push(`<${lista.tipo}>${lista.items.map(i => `<li>${mdInline(i)}</li>`).join('')}</${lista.tipo}>`);
      lista = null;
    }
  };
  const cerrarCita = () => {
    if (cita) { out.push(`<blockquote><p>${mdInline(cita.join(' '))}</p></blockquote>`); cita = null; }
  };
  const cerrar = () => { cerrarPara(); cerrarLista(); cerrarCita(); };

  lineas.forEach(linea => {
    if (!linea.trim()) return cerrar();

    const h = linea.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      cerrar();
      const n = Math.min(6, h[1].length + 2); // el título de la vista ya es h2
      return out.push(`<h${n}>${mdInline(h[2])}</h${n}>`);
    }

    if (/^\s*((\*|-|_)\s*){3,}$/.test(linea)) { cerrar(); return out.push('<hr>'); }

    const ul = linea.match(/^\s*[-*+]\s+(.*)$/);
    const ol = linea.match(/^\s*\d+[.)]\s+(.*)$/);
    if (ul || ol) {
      cerrarPara(); cerrarCita();
      const tipo = ul ? 'ul' : 'ol';
      if (!lista || lista.tipo !== tipo) { cerrarLista(); lista = { tipo, items: [] }; }
      return lista.items.push((ul ? ul[1] : ol[1]).trim());
    }

    if (lista && /^\s{2,}\S/.test(linea)) {
      lista.items[lista.items.length - 1] += ' ' + linea.trim();
      return;
    }

    const q = linea.match(/^\s*>\s?(.*)$/);
    if (q) { cerrarPara(); cerrarLista(); (cita = cita || []).push(q[1]); return; }

    cerrarLista(); cerrarCita(); para.push(linea.trim());
  });

  cerrar();
  return out.join('');
};

/* Texto plano para buscar y para los metadatos. */
const mdPlano = html => String(html || '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/\s+/g, ' ').trim();
