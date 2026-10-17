  // ───────────────────────────── Paleta ─────────────────────────────
  // Cada material: base, luz, sombra y sombra profunda (cel-shading de 3-4 tonos).
  const PALETTE = {
    outline: '#2b1a10',
    skin: '#d4915a', skinLight: '#e8ae78', skinShade: '#b06e3d', skinDeep: '#86502b',
    lip: '#b0664e', sclera: '#efe4d2', iris: '#6f7a4f', pupil: '#1b120c', teeth: '#ece0c8',
    hair: '#8a5a33', hairLight: '#b07b47', hairShade: '#69411f', hairDeep: '#432812',
    beard: '#7c4f2b', beardLight: '#a06c3d',
    headband: '#6b4428', headbandShade: '#4a2d18',
    tunic: '#d3b98e', tunicLight: '#e4d0aa', tunicShade: '#b39a70', tunicDeep: '#8c7552',
    trousers: '#6e4f31', trousersLight: '#87623f', trousersShade: '#543c25', trousersDeep: '#3b2a19',
    wraps: '#a28a68', wrapsLight: '#bda788', wrapsShade: '#83704f', wrapsDeep: '#64553b',
    boots: '#6a4a2e', bootsLight: '#86613f', bootsShade: '#4d3420', bootsDeep: '#33220f', sole: '#2e2015',
    leather: '#5f412d', leatherLight: '#7d5839', leatherShade: '#432c1c',
    iron: '#87817a', ironLight: '#b5aea2', ironShade: '#5c5751', ironDeep: '#3d3a36',
    sash: '#8d4830', sashLight: '#a95d3e', sashShade: '#6c3220', sashDeep: '#4d2215',
    brass: '#b08440', brassLight: '#d6ab5d', brassShade: '#7c5a26', cord: '#3a2717',
    wood: '#7d4f2a', woodLight: '#9d6c3d', woodShade: '#5a371c',
    copper: '#8f5532', copperLight: '#bd7a45', copperShade: '#62361c', copperHi: '#dc9b5e',
    stone: '#8e8a82', stoneLight: '#aba69c', stoneShade: '#6e6a63', stoneDeep: '#4e4b46',
    dust: '#c9b893'
  };
  const C = PALETTE, OUT = C.outline;

  // ───────────────────────── Utilidades de dibujo ─────────────────────────
  let _uid = 0, _pre = 'g';
  const nid = () => `${_pre}${(_uid++).toString(36)}`;
  const n1 = v => Math.round(v * 10) / 10;

  // Forma con relleno base + sombreado recortado a su silueta + contorno
  function shape(d, fill, shading, w, stroke) {
    let s = `<path d="${d}" fill="${fill}"/>`;
    if (shading) { const id = nid(); s += `<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})">${shading}</g>`; }
    if (w !== 0) s += `<path d="${d}" fill="none" stroke="${stroke || OUT}" stroke-width="${w || 2.2}" stroke-linejoin="round" stroke-linecap="round"/>`;
    return s;
  }
  const fill = (d, c, op) => `<path d="${d}" fill="${c}"${op != null ? ` opacity="${op}"` : ''}/>`;
  const line = (d, c, w, op, dash) =>
    `<path d="${d}" fill="none" stroke="${c || OUT}" stroke-width="${w || 1.2}" stroke-linecap="round" stroke-linejoin="round"${op != null ? ` opacity="${op}"` : ''}${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
  const ell = (cx, cy, rx, ry, c, op, rot) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}"${op != null ? ` opacity="${op}"` : ''}${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;
  const circ = (cx, cy, r, c, sw) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}"${sw ? ` stroke="${OUT}" stroke-width="${sw}"` : ''}/>`;

  // Generador pseudoaleatorio determinista (el arte sale siempre igual)
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  // Cinta/mechón: contorno de una curva cúbica con grosor variable (w0 → w1). caps = extremos redondeados
  function rib(p, w0, w1, caps, n) {
    n = n || 14;
    const Lp = [], Rp = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, m = 1 - t;
      const x = m * m * m * p[0] + 3 * m * m * t * p[2] + 3 * m * t * t * p[4] + t * t * t * p[6];
      const y = m * m * m * p[1] + 3 * m * m * t * p[3] + 3 * m * t * t * p[5] + t * t * t * p[7];
      const dx = 3 * m * m * (p[2] - p[0]) + 6 * m * t * (p[4] - p[2]) + 3 * t * t * (p[6] - p[4]);
      const dy = 3 * m * m * (p[3] - p[1]) + 6 * m * t * (p[5] - p[3]) + 3 * t * t * (p[7] - p[5]);
      const l = Math.hypot(dx, dy) || 1, w = (w0 + (w1 - w0) * t) / 2;
      Lp.push([x - dy / l * w, y + dx / l * w]); Rp.push([x + dy / l * w, y - dx / l * w]);
    }
    const P = q => n1(q[0]) + ' ' + n1(q[1]);
    let d = 'M' + P(Lp[0]) + Lp.slice(1).map(q => ' L' + P(q)).join('');
    d += caps ? ` A${n1(w1 / 2)} ${n1(w1 / 2)} 0 0 0 ${P(Rp[n])}` : ' L' + P(Rp[n]);
    d += Rp.slice(0, n).reverse().map(q => ' L' + P(q)).join('');
    d += caps ? ` A${n1(w0 / 2)} ${n1(w0 / 2)} 0 0 0 ${P(Lp[0])}` : '';
    return d + ' Z';
  }

  // Borde deshilachado a lo largo de una polilínea. Devuelve " L x y ..." (sin el primer punto).
  // sign = +1 desplaza los flecos a la normal (-dy, dx) del avance; -1 al lado contrario.
  function fray(pts, depth, tooth, seed, sign) {
    const r = rng(seed); let s = '';
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len * sign, ny = dx / len * sign;
      const k = Math.max(1, Math.round(len / tooth));
      for (let j = 0; j < k; j++) {
        const fa = (j + 0.25 + r() * 0.2) / k, fb = (j + 1) / k;
        const dd = depth * (0.35 + 0.65 * r());
        s += ` L${n1(x0 + dx * fa + nx * dd)} ${n1(y0 + dy * fa + ny * dd)} L${n1(x0 + dx * fb)} ${n1(y0 + dy * fb)}`;
      }
    }
    return s;
  }

  // Trazos cortos aleatorios (textura de barba, piedra, tela)
  function strokes(seed, n, box, len, ang, color, w, op) {
    const r = rng(seed); let s = '';
    for (let i = 0; i < n; i++) {
      const x = box[0] + r() * box[2], y = box[1] + r() * box[3];
      const a = (ang + (r() - 0.5) * 40) * Math.PI / 180, l = len * (0.6 + r() * 0.7);
      s += `M${n1(x)} ${n1(y)} l${n1(Math.cos(a) * l)} ${n1(Math.sin(a) * l)} `;
    }
    return line(s, color, w, op);
  }

  const mirrorX = (x) => 450 - x;

  // Contorno ondulado (rizos): une los puntos con curvas que se abomban hacia fuera del centro c.
  function bumpy(pts, c, amp, seed) {
    const r = rng(seed); let d = '';
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, vx = mx - c[0], vy = my - c[1], l = Math.hypot(vx, vy) || 1;
      const k = amp * (0.6 + r() * 0.7);
      d += ` Q${n1(mx + vx / l * k)} ${n1(my + vy / l * k)} ${n1(x1)} ${n1(y1)}`;
    }
    return d;
  }
