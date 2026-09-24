// Vula e kompanisë, e vizatuar si SVG vektoriale (e mprehtë në ekran dhe në PDF).
// Paraqitja ndjek vulën fizike: rreth i trashë + rreth i hollë, teksti i harkut lart,
// rreshti i dytë i harkut, SH.P.K dhe NIPT në qendër, qyteti/shteti në harkun poshtë
// dhe dy yje anash.
const Stamp = (() => {
  const INK = '#28428f';
  const FONT = "Arial, Helvetica, 'Liberation Sans', sans-serif";
  const C = 100; // qendra e viewBox 0 0 200 200
  const CAP = 0.716; // lartësia e shkronjës së madhe në Arial, në em
  const NARROW = 0.84; // shkronjat e vulës janë pak më të ngushta se Arial Bold

  // Gjerësitë e Arial/Helvetica Bold (njësi për 1000 em).
  const W = {
    ' ': 278, '-': 333, '.': 278, ',': 278, ':': 333, '&': 722, '/': 278, "'": 238, '"': 474,
    A: 722, B: 722, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 556, K: 722, L: 611, M: 833,
    N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611
  };
  const glyphW = ch => W[ch.normalize('NFD')[0]] ?? (/\d/.test(ch) ? 556 : 667);
  const textW = (s, size) => [...s].reduce((a, ch) => a + glyphW(ch), 0) * size / 1000;
  const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const n = v => +v.toFixed(2);

  // Shkronjat vendosen një nga një përgjatë harkut. `r` është rrezja e vijës bazë,
  // `span` këndi (gradë) që zë teksti, `bottom` = teksti lexohet në harkun poshtë.
  function arc(text, { r, size, span, bottom = false }) {
    const chars = [...String(text || '').toUpperCase().trim()];
    if (!chars.length) return '';
    const rMid = bottom ? r - size * CAP / 2 : r + size * CAP / 2;
    const target = rMid * span * Math.PI / 180;
    const minGap = size * 0.08;
    let natural = textW(chars.join(''), size) * NARROW;
    if (natural + minGap * (chars.length - 1) > target) {
      size *= (target - minGap * (chars.length - 1)) / natural;
      natural = textW(chars.join(''), size) * NARROW;
    }
    const gap = chars.length > 1 ? (target - natural) / (chars.length - 1) : 0;
    let pos = 0;
    return chars.map(ch => {
      const w = glyphW(ch) * size / 1000 * NARROW;
      const deg = (pos + w / 2) / rMid * 180 / Math.PI;
      pos += w + gap;
      if (ch === ' ') return '';
      const rot = bottom ? span / 2 - deg : deg - span / 2;
      const y = bottom ? C + r : C - r;
      return `<text transform="rotate(${n(rot)} ${C} ${C}) translate(${C} ${n(y)}) scale(${NARROW} 1)" font-size="${n(size)}">${esc(ch)}</text>`;
    }).join('');
  }

  // Rresht i drejtë në qendër; ngushtohet vetëm kur nuk nxë në gjerësinë `max`.
  function line(text, { y, size, max, sx }) {
    const s = String(text || '').toUpperCase().trim();
    if (!s) return '';
    const fit = textW(s, size) * sx > max ? ` textLength="${n(max / sx)}" lengthAdjust="spacingAndGlyphs"` : '';
    return `<text transform="translate(${C} ${y}) scale(${sx} 1)" font-size="${size}"${fit}>${esc(s)}</text>`;
  }

  function star(deg, r) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = (i * 36 - 90) * Math.PI / 180, rr = i % 2 ? 1.5 : 3.6;
      pts.push(`${n(rr * Math.cos(a))},${n(rr * Math.sin(a))}`);
    }
    return `<polygon transform="rotate(${deg} ${C} ${C}) translate(${C} ${C - r})" points="${pts.join(' ')}"/>`;
  }

  function svg(c) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="Vula">` +
      `<g fill="none" stroke="${INK}"><circle cx="${C}" cy="${C}" r="95.6" stroke-width="2.8"/><circle cx="${C}" cy="${C}" r="89.9" stroke-width="1.7"/></g>` +
      `<g fill="${INK}" font-family="${FONT}" font-weight="700" text-anchor="middle">` +
      arc(c.stampTop, { r: 69.8, size: 18.2, span: 128 }) +
      arc(c.stampInner, { r: 49.4, size: 18.2, span: 117 }) +
      arc(c.stampBottom, { r: 82.6, size: 18.2, span: 120, bottom: true }) +
      star(100, 76) + star(-100, 76) +
      line(c.stampCenter, { y: 105.6, size: 22.4, max: 72, sx: 0.9 }) +
      line(c.nipt ? `NIPT: ${c.nipt}` : '', { y: 126, size: 14.8, max: 126, sx: 0.95 }) +
      `</g></svg>`;
  }

  const dataUrl = c => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg(c));

  return { svg, dataUrl };
})();
