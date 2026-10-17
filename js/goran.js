/*!
 * Goran v2 — personaje 2D por piezas con rig, IK y expresiones. Sin dependencias.
 * Uso: carga goran.js con una etiqueta script → window.Goran   (también CommonJS)
 *
 * Convenciones
 *  - Vista frontal/espalda: eje x = 225, suelo y = 680, 1 cabeza ≈ 81 u (≈ 7,9 cabezas de alto).
 *  - Vista de perfil (mira a la izquierda): mismas alturas; su eje vertical está en x ≈ 580 del espacio de rig.
 *  - "R" = derecha anatómica de Goran (izquierda del espectador en la vista frontal); "L" = su izquierda.
 *  - Cada pieza es un <g data-part> anidado. Canales por pieza: a (grados, horario), dx, dy, sx, sy,
 *    qx/qy (escala solo del dibujo de la pieza, sin arrastrar a los hijos), o (opacidad), v (variante de dibujo).
 */
(function (root) {
  'use strict';
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
  // ═══════════════════════ ARTE · VISTA FRONTAL (y ESPALDA) ═══════════════════════
  // Coordenadas: eje central x = 225, suelo y = 680, cabeza ≈ 81 u (≈ 7,9 cabezas de alto).
  // Las piezas "L" reutilizan el arte "R" reflejado en x = 225.
  const F = {};

  // ── Piernas ──
  F.pelvis = () => shape('M148 366 L302 366 L304 404 C296 424 262 436 225 438 C188 436 154 424 146 404 Z', C.trousers,
    fill('M146 366 L304 366 L304 398 C260 404 190 404 146 398 Z', C.trousersDeep, .5) +
    line('M225 396 C225 414 225 426 225 438', C.trousersDeep, 1.6));

  F.thighR = (view) => shape('M150 372 C144 404 136 440 132 470 C129 492 127 508 128 526 L202 526 C203 508 206 486 212 462 C217 444 222 430 228 418 L228 372 Z', C.trousers,
    fill('M150 372 C144 404 136 440 132 470 C129 492 127 508 128 526 L139 526 C139 502 142 474 147 448 C151 424 155 398 160 372 Z', C.trousersShade) +
    fill('M196 526 C198 500 202 476 208 456 C214 440 220 428 228 418 L234 418 L234 526 Z', C.trousersShade) +
    fill('M140 370 L234 370 L234 410 C210 418 186 420 168 414 C156 410 146 404 140 400 Z', C.trousersDeep, .55) +
    fill(rib([162, 432, 160, 458, 158, 484, 156, 510], 11, 3), C.trousersLight, .55) +
    line('M208 444 C192 456 176 468 160 478', C.trousersDeep, 1.6, .75) +
    line('M204 472 C190 484 178 492 166 498', C.trousersDeep, 1.4, .65) +
    line('M200 500 C190 506 180 512 170 516', C.trousersDeep, 1.3, .6) +
    (view === 'back' ? line('M222 420 C206 428 186 430 166 426', C.trousersDeep, 1.6, .7) : '') +
    line('M226 418 C224 460 224 500 222 526', C.trousersDeep, 1, .5, '3 3'));

  F.shinR = (view) => {
    const wraps = 'M124 536 C121 562 124 594 128 616 L165 617 C166 596 170 568 172 536 Z';
    let bands = '';
    for (let k = 0; k < 7; k++) {
      const y = 544 + k * 11, up = k % 2 === 0;
      const a = up ? [120, y + 7, 174, y - 1] : [120, y - 1, 174, y + 7];
      bands += line(`M${a[0]} ${a[1]} L${a[2]} ${a[3]}`, C.wrapsDeep, 1.3, .9) + line(`M${a[0]} ${a[1] + 2.5} L${a[2]} ${a[3] + 2.5}`, C.wrapsLight, 1.6, .7);
    }
    const wrapArt = shape(wraps, C.wraps,
      fill('M154 548 L176 548 L176 620 L156 620 C160 596 158 572 154 548 Z', C.wrapsShade, .9) + bands +
      fill('M118 548 L132 548 C128 570 128 594 132 620 L118 620 Z', C.wrapsShade, .6) +
      strokes(31, 18, [124, 552, 44, 64], 3, 0, C.wrapsDeep, .7, .5), 1.9);
    const loose = shape(rib([128, 598, 122, 604, 119, 610, 118, 618], 8, 6, true), C.wraps, line('M126 600 L120 616', C.wrapsShade, 1.2), 1.4);
    const cuffD = 'M128 500 C122 514 118 528 120 542' + fray([[120, 542], [134, 552], [150, 549], [168, 554], [186, 551], [200, 545]], 3, 7, 35, 1) + ' C206 532 206 516 202 500';
    const cuff = shape(cuffD + ' Z', C.trousers,
      fill('M112 530 C124 546 140 550 152 547 C168 551 188 550 204 540 L212 570 L106 570 Z', C.trousersDeep, .55) +
      fill('M178 496 L210 496 L210 560 C198 560 190 556 186 548 C190 530 186 512 178 496 Z', C.trousersShade, .8) +
      fill(rib([136, 506, 130, 518, 128, 532, 132, 544], 9, 3), C.trousersLight, .5) +
      line('M124 522 C138 532 158 528 174 534 C184 537 196 534 204 527', C.trousersDeep, 1.4, .8) +
      line('M150 549 C152 542 156 536 162 532', C.trousersDeep, 1.2, .7), 0) + line(cuffD, OUT, 2.2);
    return wrapArt + loose + cuff;
  };

  F.footR = (view) => {
    const boot = 'M110 604 L170 602 C171 620 172 640 175 658 L177 672 C178 680 173 683 166 683 L82 683 C71 683 66 677 68 668 C70 657 84 650 98 644 C106 638 109 624 110 604 Z';
    const back = view === 'back';
    const laces = back ? line('M150 606 C150 630 152 650 156 672', C.bootsDeep, 1.4, .8) :
      line('M140 610 L124 618 M140 618 L124 610 M134 624 L116 632 M134 632 L116 624 M126 638 L106 646 M126 646 L108 638', C.cord, 1.5) +
      circ(140, 610, 1.4, C.bootsDeep) + circ(124, 610, 1.4, C.bootsDeep) + circ(134, 624, 1.4, C.bootsDeep) + circ(116, 624, 1.4, C.bootsDeep);
    return shape(boot, C.boots,
      fill('M158 600 L180 600 L180 686 L160 686 C166 660 164 628 158 600 Z', C.bootsShade, .9) +
      fill('M68 664 C80 652 96 646 110 640 L114 650 C100 656 86 662 72 672 Z', C.bootsLight, .55) +
      ell(86, 662, 13, 5.5, C.bootsLight, .6, -18) +
      line('M106 640 C114 636 124 638 134 644', C.bootsDeep, 1.2, .7) +
      line('M112 652 C122 648 134 650 146 656', C.bootsDeep, 1.1, .5) +
      strokes(77, 10, [80, 610, 90, 60], 4, 30, C.bootsDeep, .8, .45) + laces) +
      shape('M106 597 L174 595 L173 611 L109 613 Z', C.boots, fill('M106 605 L174 603 L174 613 L106 615 Z', C.bootsShade, .8) + line('M110 600 L170 598', C.bootsLight, 1, .6), 1.9) +
      shape('M68 671 L178 671 L178 684 L80 684 C72 684 67 679 68 671 Z', C.sole, line('M74 676 L176 676', C.bootsShade, .9, .8, '3 2.5'), 1.9);
  };

  // ── Tronco ──
  F.torso = (view) => {
    const back = view === 'back';
    const skin = 'M206 124 C190 132 166 140 148 148 C138 168 134 200 136 236 L148 312 L302 312 L314 236 C316 200 312 168 302 148 C284 140 260 132 244 124 Z';
    const skinArt = shape(skin, C.skin,
      fill('M196 128 L254 128 L240 150 C232 146 218 146 210 150 Z', C.skinShade, .6) +
      (back ? '' :
        line('M204 147 C212 151 218 151 224 150', C.skinShade, 1.3) + line('M246 147 C238 151 232 151 226 150', C.skinShade, 1.3) +
        line('M225 160 L225 214', C.skinShade, 1.2, .8) +
        line('M206 178 C214 186 220 188 225 186 C230 188 236 186 244 178', C.skinShade, 1.5) +
        ell(212, 168, 9, 6, C.skinLight, .55) + ell(238, 168, 9, 6, C.skinLight, .55) +
        ell(225, 140, 5, 3, C.skinDeep, .5)), 2);
    // Túnica (simétrica): neckline, sisas deshilachadas, escote en V
    const armL = [[146, 148], [143, 190], [140, 240], [143, 290], [148, 316]];
    const armR = armL.map(([x, y]) => [mirrorX(x), y]).reverse();
    let d = 'M198 126 C184 130 164 138 146 148' + fray(armL, 5, 9, 11, 1) + ' L152 318 L298 318 L302 316' + fray(armR, 5, 9, 12, 1) + ' C286 138 266 130 252 126';
    if (back) d += ' C240 134 210 134 198 126 Z';
    else d += fray([[252, 126], [225, 224]], 3, 6, 13, 1) + fray([[225, 224], [198, 126]], 3, 6, 14, 1) + ' Z';
    const folds = back
      ? line('M160 200 C190 226 214 250 226 280', C.tunicDeep, 1.4, .6) + line('M290 196 C262 222 244 246 236 278', C.tunicDeep, 1.4, .6) +
        line('M176 250 C196 264 206 280 212 300', C.tunicDeep, 1.2, .5) + line('M274 252 C256 266 246 282 240 300', C.tunicDeep, 1.2, .5) +
        ell(186, 182, 22, 18, C.tunicLight, .4) + ell(264, 182, 22, 18, C.tunicLight, .4) + line('M225 140 L225 300', C.tunicShade, 1, .5)
      : line('M150 230 C175 252 200 280 214 314', C.tunicDeep, 1.4, .65) + line('M300 230 C278 254 254 284 238 314', C.tunicDeep, 1.4, .65) +
        line('M166 284 C176 296 184 306 188 316', C.tunicDeep, 1.2, .6) + line('M284 284 C274 296 266 306 262 316', C.tunicDeep, 1.2, .6) +
        fill('M160 232 C190 246 260 246 290 232 L290 248 C260 262 190 262 160 248 Z', C.tunicShade, .5) +
        ell(184, 196, 17, 26, C.tunicLight, .45, -10) + ell(266, 196, 17, 26, C.tunicLight, .45, 10) +
        line('M201 132 L223 212', C.tunicShade, 2.2, .8) + line('M249 132 L227 212', C.tunicShade, 2.2, .8);
    let gathers = '';
    [168, 186, 204, 222, 240, 258, 276].forEach((x, i) => { gathers += line(`M${x} 316 L${x + (i % 2 ? 2 : -2)} ${298 - (i % 3) * 4}`, C.tunicShade, 1.4, .8); });
    const tunic = shape(d, C.tunic,
      fill('M138 140 L162 150 C157 200 159 260 164 320 L138 320 Z', C.tunicShade, .9) +
      fill('M312 140 L288 150 C293 200 291 260 286 320 L312 320 Z', C.tunicShade, .9) +
      ell(146, 214, 8, 30, C.tunicDeep, .35) + ell(304, 214, 8, 30, C.tunicDeep, .35) + folds + gathers +
      line('M198 129 C184 133 166 140 152 146', C.tunicDeep, 1, .6, '3 3') + line('M252 129 C266 133 284 140 298 146', C.tunicDeep, 1, .6, '3 3') +
      strokes(5, 26, [150, 150, 150, 160], 3, 80, C.tunicShade, .7, .35));
    return skinArt + tunic;
  };

  F.hemR = (view) => {
    const d = 'M152 316 L226 316 L226 404' + fray([[226, 404], [180, 401], [128, 393]], 14, 11, view === 'back' ? 22 : 21, -1) + ' C132 370 142 344 152 316 Z';
    return shape(d, C.tunic,
      fill('M140 316 L232 316 L232 334 C200 330 170 330 140 338 Z', C.tunicShade, .85) +
      fill('M212 316 L232 316 L232 420 L214 420 C218 380 216 350 212 316 Z', C.tunicShade, .7) +
      line('M168 330 C164 356 158 378 152 400', C.tunicDeep, 1.3, .7) + line('M194 332 C196 360 194 382 190 404', C.tunicDeep, 1.3, .7) +
      fill(rib([180, 340, 178, 360, 176, 380, 174, 398], 9, 4), C.tunicLight, .5) +
      strokes(9, 10, [134, 330, 90, 70], 3, 85, C.tunicShade, .7, .4));
  };

  F.belt = (view) => {
    const back = view === 'back';
    const wrap = shape('M146 296 C190 302 260 302 304 296 L306 338 C260 344 190 344 144 338 Z', C.sash,
      line('M150 300 C190 306 260 306 300 300', C.sashShade, 1.4, .8) + line('M148 333 C190 338 260 338 302 333', C.sashShade, 1.4, .8) +
      fill('M144 326 L306 326 L306 344 L144 344 Z', C.sashShade, .45) + ell(170, 300, 12, 2, C.sashLight, .6));
    const strap = 'M146 306 C190 311 260 311 304 306 L304 326 C260 331 190 331 146 326 Z';
    const leather = shape(strap, C.leather,
      fill('M144 318 C190 323 260 323 306 318 L306 332 L144 332 Z', C.leatherShade, .7) +
      line('M148 309.5 C190 314.5 260 314.5 302 309.5', C.leatherLight, 1, .8, '3 2.5') +
      line('M148 322.5 C190 327.5 260 327.5 302 322.5', C.leatherShade, 1, .9, '3 2.5') +
      strokes(41, 12, [150, 308, 150, 16], 3, 0, C.leatherShade, .8, .5) +
      (back ? '' : circ(240, 317, 1.8, C.leatherShade) + circ(249, 317.5, 1.8, C.leatherShade)));
    const buckle = back ? '' :
      `<path d="M202 301 h28 a3 3 0 0 1 3 3 v22 a3 3 0 0 1 -3 3 h-28 a3 3 0 0 1 -3 -3 v-22 a3 3 0 0 1 3 -3 Z M206 306 v18 h20 v-18 Z" fill="${C.iron}" fill-rule="evenodd" stroke="${OUT}" stroke-width="1.8"/>` +
      line('M216 305 L216 325', C.ironShade, 3) + line('M216 315 L232 315', C.ironLight, 2) +
      line('M203 304 L229 304', C.ironLight, 1.2, .8) + line('M203 327 L229 327', C.ironDeep, 1.2, .7);
    return wrap + leather + buckle;
  };

  F.sashKnot = () => shape('M258 312 C262 303 279 303 285 312 C291 320 289 332 280 337 C272 341 260 337 256 329 C254 322 255 316 258 312 Z', C.sash,
    line('M262 314 C268 320 275 322 283 318', C.sashDeep, 1.3) + line('M262 330 C268 326 276 328 283 332', C.sashDeep, 1.3) +
    ell(281, 330, 8, 6, C.sashShade, .7) + ell(266, 311, 6, 3, C.sashLight, .7));

  F.sashTailB = () => shape('M274 332 C276 360 282 400 290 436' + fray([[290, 436], [307, 430]], 10, 6, 51, 1) + ' C306 400 302 360 296 330 Z', C.sashShade,
    line('M286 340 C288 372 292 404 298 430', C.sashDeep, 1.3) + fill('M296 330 L310 330 L310 440 L302 440 C304 404 300 366 296 330 Z', C.sashDeep, .5));

  F.sashTailA = () => shape('M258 332 C254 372 252 412 254 452' + fray([[254, 452], [283, 447]], 12, 6, 52, 1) + ' C285 412 284 372 282 332 Z', C.sash,
    line('M270 340 C268 380 266 412 268 446', C.sashDeep, 1.4, .8) +
    fill('M276 332 L290 332 L290 452 L278 452 C282 412 281 372 276 332 Z', C.sashShade, .8) +
    fill(rib([262, 340, 259, 370, 258, 400, 258, 430], 6, 3), C.sashLight, .6) +
    line('M262 400 L266 404 M274 372 L271 377', C.sashDeep, 1.1, .8) +
    strokes(53, 12, [254, 336, 30, 110], 3, 90, C.sashDeep, .7, .45));

  // ── Cuello, colgante ──
  F.neck = (view) => shape('M206 104 L244 104 L248 134 C238 142 212 142 202 134 Z', C.skin,
    fill('M198 102 L252 102 L252 124 C240 128 210 128 198 124 Z', C.skinDeep, .55) +
    (view === 'back' ? line('M225 112 L225 138', C.skinShade, 1.2, .7) :
      line('M210 112 C214 122 218 130 221 138', C.skinShade, 1.4) + line('M240 112 C236 122 232 130 229 138', C.skinShade, 1.4) +
      ell(225, 126, 3, 4, C.skinLight, .5)), 2);

  F.pendant = (view) => view === 'back'
    ? line('M205 128 C214 134 236 134 245 128', C.cord, 1.6)
    : line('M205 128 C206 150 214 176 222 190', C.cord, 1.7) + line('M245 128 C244 150 236 176 228 190', C.cord, 1.7) +
      circ(225, 189, 2.6, C.brassShade, 1.2) +
      shape('M219 191 h12 a2 2 0 0 1 2 2 v16 a2 2 0 0 1 -2 2 h-12 a2 2 0 0 1 -2 -2 v-16 a2 2 0 0 1 2 -2 Z', C.brass,
        fill('M227 191 L233 191 L233 211 L229 211 Z', C.brassShade, .8) + line('M220 194 L230 194 L230 208 L220 208 Z', C.brassShade, .8) +
        fill('M220 193 L223 193 L223 209 L220 209 Z', C.brassLight, .8), 1.5);

  // ── Cabeza ──
  F.hairBack = (view) => {
    if (view === 'back') {
      const pts = [[178, 122], [173, 106], [172, 90], [174, 74], [179, 60], [188, 47], [200, 38], [214, 33], [228, 32], [242, 34], [255, 40], [266, 50], [273, 63], [277, 78], [278, 94], [276, 108], [272, 122]];
      const d = 'M' + pts[0].join(' ') + bumpy(pts, [225, 86], 6, 3) + ' C262 128 248 126 240 120 L210 120 C202 126 188 128 178 122 Z';
      let s = '';
      [[188, 46], [202, 38], [216, 34], [234, 34], [248, 38], [262, 46], [178, 66], [272, 66], [176, 92], [274, 92], [180, 112], [270, 112]].forEach(([x, y]) => {
        s += line(`M${x} ${y} Q${(x + 225) / 2 + (x < 225 ? 8 : -8)} ${(y + 86) / 2 + 2} 225 86`, C.hairShade, 1.4, .9);
      });
      return shape(d, C.hair, s + fill(rib([196, 44, 210, 37, 240, 37, 254, 44], 7, 7), C.hairLight, .55) +
        fill(rib([184, 72, 182, 84, 182, 96, 186, 108], 5, 2), C.hairLight, .5) + fill(rib([266, 72, 268, 84, 268, 96, 264, 108], 5, 2), C.hairLight, .5) +
        ell(225, 116, 26, 9, C.hairDeep, .5));
    }
    const pts = [[262, 138], [274, 132], [282, 120], [283, 104], [280, 88], [276, 74], [271, 61], [263, 50], [252, 41], [239, 35], [225, 33], [211, 35], [198, 41], [187, 50], [179, 61], [174, 74], [170, 88], [167, 104], [168, 120], [176, 132], [188, 138]];
    const d = 'M' + pts[0].join(' ') + bumpy(pts, [225, 90], 7, 4) + ' C196 128 199 116 200 106 L250 106 C251 116 254 128 262 136 Z';
    const tip = (p, w) => shape(rib(p, w, 4, true), C.hair, line(`M${p[0]} ${p[1]} C${p[2]} ${p[3]} ${p[4]} ${p[5]} ${p[6]} ${p[7]}`, C.hairShade, 1.1, .9), 1.6);
    return shape(d, C.hair,
      ell(225, 92, 32, 26, C.hairDeep, .85) +
      line('M200 40 C190 52 184 66 184 84', C.hairShade, 1.4) + line('M190 60 C182 74 180 92 184 110', C.hairShade, 1.4) +
      line('M182 96 C178 106 180 116 186 124', C.hairShade, 1.4) + line('M250 40 C260 52 266 66 266 84', C.hairShade, 1.4) +
      line('M262 62 C268 76 270 92 266 108', C.hairShade, 1.4) + line('M268 98 C272 108 270 118 264 126', C.hairShade, 1.4) +
      fill(rib([182, 62, 179, 72, 178, 82, 180, 92], 6, 1), C.hairLight, .7) + fill(rib([268, 62, 271, 72, 272, 82, 270, 92], 6, 1), C.hairLight, .7)) +
      line('M178 112 C182 120 180 128 186 134 M272 112 C268 120 270 128 264 134', C.hairDeep, 1.2, .8);
  };

  F.ponytail = (view) => {
    if (view !== 'back') return '';
    const pts = [[216, 90], [208, 102], [204, 116], [206, 130], [211, 144], [219, 158], [228, 150], [236, 140], [242, 124], [243, 108], [235, 90]];
    return shape('M' + pts[0].join(' ') + bumpy(pts, [225, 122], 4, 9) + ' Z', C.hair,
      line('M220 94 C214 108 214 124 218 150 M226 94 C226 112 228 128 226 152 M232 94 C238 110 238 126 234 144', C.hairShade, 1.3, .9) +
      fill(rib([216, 96, 211, 110, 211, 124, 214, 140], 5, 2), C.hairLight, .6) + ell(236, 120, 5, 22, C.hairDeep, .4), 1.7) +
      shape('M216 80 C216 77 234 77 234 80 L234 92 C234 95 216 95 216 92 Z', C.headband, line('M216 84.5 h18 M216 88 h18', C.headbandShade, 1), 1.5);
  };

  F.face = (view) => {
    const ears = shape('M199 79 C192 74 188 82 190 89 C191 96 196 99 201 96 Z', C.skin, line('M197 83 C194 86 195 91 198 93', C.skinShade, 1.2), 1.8) +
      shape('M251 79 C258 74 262 82 260 89 C259 96 254 99 249 96 Z', C.skin, line('M253 83 C256 86 255 91 252 93', C.skinShade, 1.2), 1.8);
    if (view === 'back') return ears;
    return ears + shape('M203 56 C212 50 238 50 247 56 C252 64 254 74 253 86 C252 96 250 104 246 111 C240 119 232 123 225 123 C218 123 210 119 204 111 C200 104 198 96 197 86 C196 74 198 64 203 56 Z', C.skin,
      fill('M196 50 L254 50 L254 66 C240 60 210 60 196 66 Z', C.skinShade, .7) +
      ell(200, 92, 5, 16, C.skinShade, .6) + ell(250, 92, 5, 16, C.skinShade, .6) +
      ell(210, 79, 10, 5.5, C.skinShade, .5) + ell(240, 79, 10, 5.5, C.skinShade, .5) +
      line('M204 84.5 C208 86.5 213 86.5 217 84.5', C.skinShade, 1, .7) + line('M246 84.5 C242 86.5 237 86.5 233 84.5', C.skinShade, 1, .7) +
      fill('M220 77 C218 84 216.5 90 216.5 95 L220 95 C220 89 221 83 222.5 77 Z', C.skinShade, .6) +
      ell(225, 63, 13, 4, C.skinLight, .6) + ell(206, 87, 4, 2.4, C.skinLight, .6) + ell(244, 87, 4, 2.4, C.skinLight, .6) +
      line('M214 65 C220 63 230 63 236 65', C.skinShade, .9, .5), 2);
  };

  F.beard = (view) => view === 'back' ? '' : (() => {
    const d = 'M197.5 80 C196.5 94 198.5 106 206 115' + fray([[206, 115], [215, 123], [225, 126.5], [235, 123], [244, 115]], 3, 4, 61, 1) +
      ' C251.5 106 253.5 94 252.5 80 L250 82 C249 90 246 96 240 99.5 C238.5 104 235 107.5 230 109 C227.5 110 222.5 110 220 109 C215 107.5 211.5 104 210 99.5 C204 96 201 90 200 82 Z';
    return shape(d, C.beard,
      strokes(62, 46, [197, 84, 56, 42], 3.2, 95, C.hairDeep, .9, .55) + strokes(63, 22, [197, 84, 56, 42], 3, 95, C.beardLight, .8, .55) +
      ell(225, 111.5, 7, 2, C.hairDeep, .6) + ell(225, 120, 9, 3, C.beardLight, .45) + ell(204, 102, 4, 9, C.hairDeep, .35) + ell(246, 102, 4, 9, C.hairDeep, .35), 1.8);
  })();

  F.mouth = (view) => view === 'back' ? '' : ({
    neutral: fill('M219 105.8 C222 108.6 228 108.6 231 105.8 C228 106.6 222 106.6 219 105.8 Z', C.lip, .9) + line('M216.5 105 C221 106.3 229 106.3 233.5 105', OUT, 1.3),
    smile: fill('M218 106.6 C222 110.6 228 110.6 232 106.6 C228 107.8 222 107.8 218 106.6 Z', C.lip) + line('M214.5 103.5 C219 108 231 108 235.5 103.5', OUT, 1.3) +
      line('M212 100.5 C211 103.5 212 106.5 214 108.5', C.skinShade, 1, .8) + line('M238 100.5 C239 103.5 238 106.5 236 108.5', C.skinShade, 1, .8),
    askew: fill('M219 106.2 C222 109 228 108.6 231.5 105.4 C228 106.4 222 106.6 219 106.2 Z', C.lip) + line('M217 106 C221 106.4 228 105.4 233.5 103.6', OUT, 1.3),
    teeth: shape('M214.5 104 C219 102.6 231 102.6 235.5 104 L234 108.6 C229 110.2 221 110.2 216 108.6 Z', C.teeth,
      line('M215.5 106.3 L234.5 106.3', C.tunicShade, .8) + line('M220 103.5 L220 109.4 M225 103.2 L225 109.8 M230 103.5 L230 109.4', C.tunicShade, .7), 1.2),
    open: shape('M218.5 104.5 C221 103 229 103 231.5 104.5 C232.5 108 229.5 111.5 225 111.5 C220.5 111.5 217.5 108 218.5 104.5 Z', '#4a2418', fill('M220 109 C223 111 227 111 230 109 L230 112 L220 112 Z', C.lip), 1.2)
  });

  F.mustache = (view) => view === 'back' ? '' : shape('M211.5 102.5 C213 97 221 95.5 225 97.5 C229 95.5 237 97 238.5 102.5 C239.5 106 236 107 233.5 104.5 C230.5 102.5 228 101.8 225 102.6 C222 101.8 219.5 102.5 216.5 104.5 C214 107 210.5 106 211.5 102.5 Z', C.beard,
    strokes(64, 14, [212, 97, 26, 7], 3, 110, C.hairDeep, .8, .6) + ell(219, 98.5, 4, 1.4, C.beardLight, .6) + ell(231, 98.5, 4, 1.4, C.beardLight, .6), 1.4);

  F.nose = (view) => view === 'back' ? '' :
    fill('M221.5 78 C221 84 220 89 218 92.5 C221 92 229 92 232 92.5 C230 89 229 84 228.5 78 Z', C.skin) +
    line('M216.5 92.5 C214.5 96 217.5 99.4 221 97.6 C223 99.4 227 99.4 229 97.6 C232.5 99.4 235.5 96 233.5 92.5', OUT, 1.4) +
    ell(220.6, 95.6, 1.8, 1, C.skinDeep) + ell(229.4, 95.6, 1.8, 1, C.skinDeep) + ell(225, 93.5, 2.6, 1.6, C.skinLight, .8) +
    line('M222.5 79 L224 89', C.skinLight, 1.2, .7);

  const eyeShape = { open: 'M203 80.5 C205 77.4 214 76.4 217.6 79.5 C215 82.6 206 83.1 203 80.5 Z',
    narrow: 'M203.5 80.4 C206 78.6 213.5 78 217.2 79.8 C214 81.4 207 81.6 203.5 80.4 Z' };
  function eyeArt(kind, gx, gy, mir) {
    if (mir) gx = -gx;
    const sh = kind === 'open' ? eyeShape.open : eyeShape.narrow;
    const iris = circ(211 + gx, 80 + gy, 2.9, C.iris) + circ(211 + gx, 80 + gy, 1.4, C.pupil) + circ(211.9 + gx, 79 + gy, .75, '#fff8ec');
    let s = shape(sh, C.sclera, iris + fill('M202 76 L219 76 L219 79 C213 78 207 78 202 80 Z', C.skinShade, .35), 0);
    if (kind === 'open') s += line('M202.5 80.5 C205 76.8 214 76 218 79.6', OUT, 1.7) + line('M204.5 81.7 C208 83.1 213 83.1 216.6 80.9', C.skinDeep, .9) + line('M204 76.3 C208 74.4 214 74.4 217.2 76.6', C.skinShade, 1);
    else s += line('M203 80.3 C206 78 213.5 77.4 217.6 79.6', OUT, 1.8) + line('M205 81.8 C209 80.6 213 80.6 216.4 80.9', C.skinDeep, 1) + line('M201 79 L198 78.2 M201.4 81.2 L198.4 82.4', C.skinShade, .8);
    return s;
  }
  F.eyeR = (view, mir) => view === 'back' ? '' : ({
    open: eyeArt('open', 0, 0, mir),
    happy: line('M203 80.4 C206 77.4 213.5 76.8 217.6 79.6', OUT, 1.8) + line('M205 81.6 C209 79.6 213 79.6 216.4 81', C.skinDeep, 1) + line('M201 79 L198 78 M201.2 81.2 L198.2 82.4', C.skinShade, .8),
    up: eyeArt('open', 1.6, -1.3, mir),
    squint: eyeArt('narrow', 0, 0, mir),
    down: eyeArt('narrow', 0, .8, mir)
  });

  F.browR = (view) => view === 'back' ? '' : (() => {
    const tex = (d) => shape(d, C.hairShade, strokes(71, 7, [201, 70, 18, 6], 2.5, 170, C.hairDeep, .7, .7), 1.1);
    return {
      neutral: tex('M218.5 74.5 C214 71 206 70.5 200.5 73.5 C205 72.8 212 73.8 218.5 77.2 Z'),
      happy: tex('M218.5 73.4 C214 69.4 206 69 200.5 72.4 C205 71.3 212 72 218.5 75.8 Z'),
      raised: tex('M218.5 71.2 C214 66 206 65.5 200.5 69.2 C205 67.8 212 68.5 218.5 73.6 Z'),
      effort: tex('M219 77.8 C214 72.6 206 71.6 200.5 73.4 C205 73.4 212 74.8 219 79.8 Z')
    };
  })();

  F.hairFront = (view) => {
    if (view === 'back') return '';
    const lock = (p, w0, w1) => shape(rib(p, w0, w1, true), C.hair, line(`M${p[0]} ${p[1]} C${p[2]} ${p[3]} ${p[4]} ${p[5]} ${p[6]} ${p[7]}`, C.hairLight, 1.2, .7), 1.3, C.hairDeep);
    return shape('M195 70 C194 52 208 41 225 41 C242 41 256 52 255 70 C250 62 244 57 236 57 C231 60 224 60 218 57 C209 57 200 62 195 70 Z', C.hair,
      line('M206 46 C214 44 222 46 225 52', C.hairShade, 1.2) + line('M244 46 C236 44 228 46 225 52', C.hairShade, 1.2) + ell(214, 46, 8, 2.5, C.hairLight, .7) + ell(236, 46, 8, 2.5, C.hairLight, .7), 1.8) +
      lock([199, 56, 192, 64, 189, 74, 191, 84], 10, 4) + lock([251, 56, 258, 64, 261, 74, 259, 84], 10, 4) +
      lock([220, 47, 212, 52, 206, 58, 203, 66], 9, 3) + lock([230, 47, 238, 52, 244, 58, 247, 66], 9, 3);
  };

  F.headband = (view) => view === 'back'
    ? shape('M193 66 C204 74 246 74 257 66 L257 58 C246 66 204 66 193 58 Z', C.headband, line('M195 63 C206 70 244 70 255 63', C.headbandShade, 1, .8, '2.5 2'), 1.6)
    : shape('M196 57 C210 49 240 49 254 57 L254.5 65 C240 57.6 210 57.6 195.5 65 Z', C.headband,
      fill('M194 61 C210 54 240 54 256 61 L256 67 L194 67 Z', C.headbandShade, .7) + line('M198 59 C210 53 240 53 252 59', '#8a5c38', 1, .8) +
      line('M199 61.2 C211 55.5 239 55.5 251 61.2', C.headbandShade, .9, .9, '2.5 2'), 1.6);

  // ── Brazos ──
  F.upperArmR = (view) => {
    const back = view === 'back';
    const d = 'M170 150 C150 140 112 142 98 166 C88 182 86 200 84 218 C80 240 74 262 72 282 C71 292 74 298 80 302 L112 300 C120 288 128 274 132 258 C136 244 140 232 142 220 C146 200 156 176 170 150 Z';
    return shape(d, C.skin,
      fill('M98 166 C88 182 86 200 84 218 C80 240 74 262 72 282 C71 292 74 298 80 302 L89 302 C85 290 87 270 91 250 C95 228 97 204 105 180 Z', C.skinShade) +
      fill('M84 212 C96 228 114 230 132 214 L135 224 C116 240 96 238 82 224 Z', C.skinShade, .7) +
      (back
        ? fill('M100 230 C110 244 124 246 134 236 L134 246 C122 256 106 254 96 242 Z', C.skinShade, .7) + ell(108, 268, 10, 20, C.skinLight, .4, 8)
        : fill('M128 226 C124 248 118 270 112 302 L121 302 C127 280 133 258 137 236 Z', C.skinShade, .7) + ell(112, 254, 10, 24, C.skinLight, .55, 8) +
          line('M118 242 C116 258 112 272 108 286', C.skinShade, .8, .6)) +
      ell(118, 170, 18, 9, C.skinLight, .6, -20) +
      fill('M140 138 L178 138 L172 162 C160 164 150 160 144 152 Z', C.skinDeep, .5) +
      line('M95 292 C101 296 107 297 112 296', C.skinShade, 1.2));
  };

  F.forearmR = (view) => {
    const arm = shape('M76 286 C66 300 58 316 54 334 C52 346 50 358 50 374 L108 374 C108 356 110 340 112 324 C114 310 116 298 114 288 Z', C.skin,
      fill('M76 286 C66 300 58 316 54 334 C52 346 50 358 50 374 L60 374 C60 356 62 342 66 328 C70 312 76 300 83 290 Z', C.skinShade) +
      ell(92, 306, 9, 15, C.skinLight, .5, 20) + line('M86 292 C82 304 78 314 76 322', C.skinShade, 1) + fill('M70 284 L118 284 L116 296 C100 298 86 296 72 292 Z', C.skinShade, .6));
    let bands = '';
    for (let k = 0; k < 5; k++) {
      const y = 324 + k * 11, up = k % 2 === 0;
      const a = up ? [45, y + 7, 113, y - 1] : [45, y - 1, 113, y + 7];
      bands += line(`M${a[0]} ${a[1]} L${a[2]} ${a[3]}`, C.wrapsDeep, 1.3, .9) + line(`M${a[0]} ${a[1] + 2.5} L${a[2]} ${a[3] + 2.5}`, C.wrapsLight, 1.6, .7);
    }
    const wrap = shape('M47 320 L111 318 C113 336 113 356 111 376 L47 378 C45 358 45 338 47 320 Z', C.wraps,
      bands + fill('M96 316 L116 316 L116 380 L98 380 C102 358 100 336 96 316 Z', C.wrapsShade, .85) + fill('M42 316 L54 316 C50 340 50 360 54 380 L42 380 Z', C.wrapsShade, .6) +
      strokes(33, 18, [48, 322, 62, 54], 3, 0, C.wrapsDeep, .7, .45), 1.9);
    const blend = ell(94, 289, 19, 7, C.skin) + ell(84, 290, 8, 5, C.skinShade, .6);
    return arm + blend + wrap;
  };

  F.handR = (view) => {
    const finger = (p, w, crease) => shape(rib(p, w, w - 1.6, true), C.skin,
      fill(rib([p[0] - w * .3, p[1], p[2] - w * .3, p[3], p[4] - w * .3, p[5], p[6] - w * .3, p[7]], w * .4, w * .3), C.skinShade, .55) +
      (crease ? line(crease, C.skinShade, .9, .9) : ''), 1.6);
    const nail = (x, y, r) => ell(x, y, 2.6, 1.7, C.skinLight, .95, r || 0);
    const palm = (d) => shape(d, C.skin,
      fill('M46 368 L60 368 C57 388 57 404 60 420 L44 420 Z', C.skinShade) + ell(82, 392, 14, 7, C.skinLight, .45) +
      line('M66 384 L64 406 M78 384 L78 408 M90 384 L92 406', C.skinShade, .8, .5), 2);
    const relax = shape('M54 370 L104 370 C108 382 110 394 109 406 C108 418 108 428 106 434 Q104 440 98 439 Q94 446 87 446 Q81 446 79 443 Q75 445 71 443 Q66 441 65 437 Q60 438 57 434 C52 428 50 420 50 410 C49 396 50 382 54 370 Z', C.skin,
      fill('M44 368 L60 368 C57 392 58 416 62 440 L44 440 Z', C.skinShade) + ell(82, 392, 14, 7, C.skinLight, .45) +
      line('M66 384 L64 406 M78 384 L78 408 M90 384 L92 406', C.skinShade, .8, .5) +
      line('M96 412 C95 424 97 432 98 439 M83 414 C81 426 81 436 80 443 M70 412 C68 424 67 432 66 437', OUT, 1.1) +
      line('M58 418 Q62 420 66 418 M71 422 Q75 424 79 422 M84 424 Q88 426 93 424 M97 421 Q101 423 105 421', C.skinShade, 1, .9) +
      fill('M50 404 C56 410 96 414 108 404 L108 412 C96 420 58 418 50 412 Z', C.skinShade, .35) +
      nail(59, 431, 30) + nail(72, 439, 15) + nail(87, 442, 0) + nail(100, 435, -15), 2) +
      shape(rib([102, 378, 108, 387, 111, 398, 109, 411], 13, 10, true), C.skin, fill('M109 380 L117 380 L117 414 L110 414 Z', C.skinShade, .6), 1.7) + nail(108.5, 407, 80);
    const fist = shape('M52 370 L104 370 C110 386 110 404 104 418 C98 430 84 434 70 432 C58 430 50 420 48 406 C47 392 48 380 52 370 Z', C.skin,
      fill('M46 370 L60 370 C56 392 57 414 64 434 L44 434 Z', C.skinShade) + ell(80, 390, 14, 7, C.skinLight, .45) +
      line('M54 410 C62 416 74 418 88 416 M56 422 C66 428 80 428 94 424', C.skinShade, 1.1) +
      line('M66 416 L66 428 M78 418 L79 429 M90 416 L92 426', C.skinShade, 1, .8), 2) +
      shape(rib([106, 386, 104, 400, 96, 410, 85, 414], 12, 10, true), C.skin, fill('M90 404 L108 404 L108 420 L90 420 Z', C.skinShade, .5), 1.7) + nail(88, 413, 10);
    const grip = palm('M52 370 L106 370 C110 384 110 398 106 410 L54 414 C48 402 47 386 52 370 Z') +
      finger([57, 408, 53, 419, 51, 429, 51, 439], 10.5) + finger([69, 410, 67, 423, 67, 436, 67, 449], 12) +
      finger([82, 410, 82, 425, 83, 439, 84, 452], 12.5) + finger([95, 408, 97, 421, 99, 433, 101, 445], 12) +
      shape(rib([104, 382, 112, 390, 118, 398, 122, 408], 13, 10, true), C.skin, '', 1.7) +
      nail(51, 437) + nail(67, 447) + nail(84, 450) + nail(101, 443) + nail(121, 406, 60);
    return { relax, fist, grip };
  };

  // ── Props ──
  F.hammer = () => {
    const head = shape('M54 636 L66 626 L120 626 L108 636 Z', C.ironLight, line('M60 633 L112 633', C.ironShade, .8, .6), 1.8) +
      shape('M54 636 L108 636 L108 684 L54 684 Z', C.iron,
        fill('M54 636 L108 636 L108 642 L54 642 Z', C.ironLight, .6) + fill('M54 676 L108 676 L108 684 L54 684 Z', C.ironShade, .8) +
        line('M60 650 L72 646 M80 668 L96 660 M64 670 L70 672', C.ironDeep, .9, .7) + strokes(91, 16, [56, 640, 50, 40], 2, 30, C.ironShade, .8, .5) +
        line('M56 638 L56 682', C.ironLight, 1.2, .7), 1.9) +
      shape('M108 636 L120 626 L120 674 L108 684 Z', C.ironShade, line('M110 640 L118 632', C.ironLight, .8, .7) + strokes(92, 5, [109, 630, 10, 50], 2, 80, C.ironDeep, .8, .6), 1.9);
    const handle = shape('M79 436 L89 436 L89 630 L79 630 Z', C.wood,
      fill('M85 436 L89 436 L89 630 L85 630 Z', C.woodShade, .8) + line('M82 450 C83 500 81 560 83 620', C.woodShade, .8, .7) + line('M80.5 470 L80.5 600', C.woodLight, 1, .6), 1.8);
    const wrapG = shape('M78 448 L90 448 L90 490 L78 490 Z', C.leather, line('M78 456 L90 452 M78 464 L90 460 M78 472 L90 468 M78 480 L90 476 M78 488 L90 484', C.leatherShade, 1.1), 1.6);
    const caps = shape('M76 430 L92 430 L92 440 L76 440 Z', C.ironShade, line('M77 432 L91 432', C.ironLight, 1, .8), 1.6) +
      shape('M76 618 L92 618 L92 628 L76 628 Z', C.ironShade, line('M77 620 L91 620', C.ironLight, 1, .8), 1.6);
    return `<g transform="rotate(14 84 436)">${handle + wrapG + caps + head}</g>`;
  };

  F.flask = () => {
    const handleLoop = line('M80 444 C98 444 102 470 82 488', OUT, 9) + line('M80 444 C98 444 102 470 82 488', C.copperShade, 5.5) + line('M84 446 C94 450 96 462 90 474', C.copperLight, 1.2, .8);
    const body = shape('M38 440 C38 434 42 430 48 430 L72 430 C78 430 82 434 82 440 L82 516 C82 522 78 526 72 526 L48 526 C42 526 38 522 38 516 Z', C.copper,
      fill('M68 428 L84 428 L84 528 L70 528 C74 496 74 460 68 428 Z', C.copperShade, .85) + fill(rib([46, 438, 45, 470, 45, 500, 46, 518], 5, 4), C.copperHi, .7) +
      fill('M36 446 L84 446 L84 452 L36 452 Z', C.copperShade) + fill('M36 504 L84 504 L84 510 L36 510 Z', C.copperShade) +
      line('M36 446 L84 446 M36 452 L84 452 M36 504 L84 504 M36 510 L84 510', OUT, .9, .8) +
      circ(44, 449, 1.2, C.copperHi) + circ(76, 449, 1.2, C.copperHi) + circ(44, 507, 1.2, C.copperHi) + circ(76, 507, 1.2, C.copperHi) +
      strokes(93, 14, [40, 455, 40, 46], 3, 20, C.copperShade, .9, .6), 1.9);
    const top = shape('M44 430 C44 420 76 420 76 430 Z', C.copper, fill('M64 420 L78 420 L78 432 L66 432 Z', C.copperShade, .8), 1.8) +
      shape('M48 420 C48 412 72 412 72 420 Z', C.copperShade, '', 1.6) + circ(60, 410, 3.2, C.copperLight, 1.4) +
      shape('M34 522 L86 522 L86 530 L34 530 Z', C.copperShade, '', 1.6);
    return `<g transform="translate(14 -36)">${handleLoop + body + top}</g>`;
  };

  F.rock = () => `<g transform="matrix(1.4 0 0 1.4 -90 -269.2)">${rockArt()}</g>`;
  function rockArt() {
    const r = rng(7), pts = [];
    for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2, rr = 60 * (1 + (r() - .5) * .05); pts.push([225 + Math.cos(a) * rr, 618 + Math.sin(a) * rr]); }
    const d = 'M' + pts.map(p => n1(p[0]) + ' ' + n1(p[1])).join(' L') + ' Z';
    let pits = '';
    for (let i = 0; i < 16; i++) {
      const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * 50, x = 225 + Math.cos(a) * rr, y = 618 + Math.sin(a) * rr, s = 1.5 + r() * 3.2;
      pits += ell(n1(x), n1(y), n1(s), n1(s * .7), C.stoneDeep, .55) + ell(n1(x + s * .4), n1(y + s * .5), n1(s * .7), n1(s * .35), C.stoneLight, .5);
    }
    return shape(d, C.stone,
      circ(242, 636, 62, C.stoneShade) + circ(255, 652, 52, C.stoneDeep, 0).replace('fill', 'opacity=".45" fill') +
      circ(214, 604, 44, C.stone) + ell(204, 590, 22, 15, C.stoneLight, .75, -30) + ell(196, 584, 8, 5, '#c4beb2', .7, -30) +
      pits + line('M232 572 L238 590 L232 602 L240 616', C.stoneDeep, 1.3, .8) + line('M188 640 L200 646 L206 662', C.stoneDeep, 1.2, .7) +
      strokes(94, 50, [168, 560, 114, 116], 1.5, 0, C.stoneDeep, 1, .35), 1.7);
  }

  F.dust = () => {
    let s = '';
    [[160, 676, 16], [186, 666, 13], [264, 666, 14], [292, 676, 17], [140, 682, 10], [312, 684, 11], [225, 662, 10]].forEach(([x, y, rr]) => { s += shape(`M${x - rr} ${y} a${rr} ${rr * .8} 0 1 1 ${rr * 2} 0 a${rr} ${rr * .8} 0 1 1 ${-rr * 2} 0 Z`, C.dust, '', 1.4); });
    return s;
  };
  // ═══════════════════════════ ARTE · VISTA DE PERFIL ═══════════════════════════
  // Mira a la izquierda. Lado cercano = derecha de Goran (R); lado lejano (L) = mismo dibujo desplazado y oscurecido.
  const S = {};

  S.pelvis = () => shape('M548 366 L654 366 C664 392 666 420 658 442 L560 442 C550 420 546 392 548 366 Z', C.trousers,
    fill('M548 366 L664 366 L664 400 L548 400 Z', C.trousersDeep, .5));

  S.thighR = () => shape('M552 380 C546 420 544 460 546 500 L548 526 L648 526 C646 500 648 470 654 444 C660 424 662 402 658 380 Z', C.trousers,
    fill('M630 380 L666 380 C664 420 656 450 652 480 C650 500 650 512 652 526 L636 526 C636 490 640 440 630 380 Z', C.trousersShade) +
    fill('M540 380 L668 380 L668 418 C640 424 580 424 540 416 Z', C.trousersDeep, .5) +
    fill(rib([566, 430, 562, 456, 560, 482, 560, 508], 12, 4), C.trousersLight, .5) +
    line('M640 448 C620 460 600 470 578 476', C.trousersDeep, 1.5, .7) + line('M644 482 C626 490 606 496 586 498', C.trousersDeep, 1.4, .6) +
    line('M552 452 C560 462 566 470 570 480', C.trousersDeep, 1.2, .5));

  S.shinR = () => {
    const wraps = 'M562 536 C564 566 570 594 576 620 L628 622 C630 596 638 566 644 536 Z';
    let bands = '';
    for (let k = 0; k < 7; k++) {
      const y = 544 + k * 11, up = k % 2 === 0;
      const a = up ? [560, y + 7, 646, y - 2] : [560, y - 2, 646, y + 7];
      bands += line(`M${a[0]} ${a[1]} L${a[2]} ${a[3]}`, C.wrapsDeep, 1.3, .9) + line(`M${a[0]} ${a[1] + 2.5} L${a[2]} ${a[3] + 2.5}`, C.wrapsLight, 1.6, .7);
    }
    const wrapArt = shape(wraps, C.wraps, bands + fill('M618 530 L650 530 L650 626 L620 626 C626 596 626 566 618 530 Z', C.wrapsShade, .85) +
      strokes(36, 20, [564, 540, 76, 80], 3, 0, C.wrapsDeep, .7, .45), 1.9);
    const cuffD = 'M552 500 C546 516 546 530 550 544' + fray([[550, 544], [572, 553], [598, 549], [622, 554], [646, 547]], 3, 8, 37, 1) + ' C652 530 652 514 648 500';
    const cuff = shape(cuffD + ' Z', C.trousers,
      fill('M540 530 C560 548 600 552 652 538 L656 570 L536 570 Z', C.trousersDeep, .55) + fill('M626 496 L656 496 L656 560 L630 560 C634 536 632 514 626 496 Z', C.trousersShade, .85) +
      line('M552 520 C574 530 604 526 630 532 C640 534 646 532 650 526', C.trousersDeep, 1.4, .8) + line('M600 549 C602 540 606 534 612 530', C.trousersDeep, 1.2, .7), 0) + line(cuffD, OUT, 2.2);
    return wrapArt + cuff;
  };

  S.footR = () => {
    const boot = 'M574 600 L640 598 C642 620 646 640 650 656 L652 672 C653 680 648 683 640 683 L548 683 C536 683 532 676 534 668 C536 658 548 652 560 646 C570 640 574 626 574 600 Z';
    return shape(boot, C.boots,
      fill('M628 598 L656 598 L656 686 L636 686 C640 660 636 626 628 598 Z', C.bootsShade, .9) +
      ell(552, 662, 15, 6, C.bootsLight, .6, -12) + fill('M534 664 C546 654 560 648 572 642 L576 650 C562 656 548 662 538 672 Z', C.bootsLight, .45) +
      line('M582 606 L572 614 M582 614 L572 606 M580 622 L568 630 M580 630 L568 622 M574 638 L560 646 M574 646 L562 638', C.cord, 1.5) +
      line('M576 650 C590 646 606 648 622 654', C.bootsDeep, 1.1, .6) + strokes(78, 10, [556, 610, 90, 60], 4, 30, C.bootsDeep, .8, .45)) +
      shape('M571 596 L643 594 L642 610 L573 612 Z', C.boots, fill('M571 604 L643 602 L643 612 L571 614 Z', C.bootsShade, .8), 1.9) +
      shape('M534 671 L654 671 L654 684 L546 684 C538 684 533 679 534 671 Z', C.sole, line('M540 676 L652 676', C.bootsShade, .9, .8, '3 2.5'), 1.9);
  };

  S.torso = () => {
    const skin = shape('M548 124 L594 124 L604 140 C590 146 572 150 556 160 C548 170 540 182 532 196 C534 170 540 146 548 124 Z', C.skin,
      fill('M540 124 L604 124 L604 140 L540 140 Z', C.skinShade, .6) + line('M548 150 C540 162 536 172 534 182', C.skinShade, 1.2), 2);
    const d = 'M556 136' + fray([[556, 136], [538, 168], [524, 204]], 3, 6, 81, 1) +
      ' C512 222 506 240 504 262 C503 276 503 290 504 304 L608 306 C612 276 618 240 624 206 C628 180 630 160 624 144 C610 136 590 132 572 132 Z';
    let gathers = '';
    [512, 528, 546, 564, 582, 598].forEach((x, i) => { gathers += line(`M${x} 304 L${x + (i % 2 ? 2 : -2)} ${288 - (i % 3) * 4}`, C.tunicShade, 1.4, .8); });
    const tunic = shape(d, C.tunic,
      fill('M596 132 L630 132 L630 310 L600 310 C608 260 606 190 596 132 Z', C.tunicShade, .9) +
      ell(530, 236, 16, 34, C.tunicLight, .5, -8) + fill('M502 270 C520 276 560 278 610 272 L610 290 C560 296 520 292 502 286 Z', C.tunicShade, .45) +
      line('M520 214 C536 232 548 254 556 290', C.tunicDeep, 1.3, .6) + line('M540 180 C556 200 568 224 576 252', C.tunicDeep, 1.2, .5) + gathers +
      strokes(82, 22, [508, 150, 110, 150], 3, 80, C.tunicShade, .7, .35));
    return skin + tunic;
  };

  S.hemFront = () => shape('M506 318 L568 318 L568 404' + fray([[568, 404], [536, 404], [500, 398]], 13, 10, 83, -1) + ' C500 370 502 344 506 318 Z', C.tunic,
    fill('M500 318 L570 318 L570 334 C546 330 524 330 500 336 Z', C.tunicShade, .85) + fill('M552 318 L572 318 L572 420 L556 420 C560 380 558 350 552 318 Z', C.tunicShade, .7) +
    line('M520 332 C516 356 512 378 508 398', C.tunicDeep, 1.3, .7) + line('M540 334 C540 360 538 384 536 402', C.tunicDeep, 1.3, .7));

  S.hemBack = () => shape('M598 318 L640 318 C654 342 664 372 672 404' + fray([[672, 404], [636, 410], [598, 406]], 13, 10, 84, 1) + ' L598 318 Z', C.tunicShade,
    line('M618 330 C626 356 634 380 640 404', C.tunicDeep, 1.3, .7) + line('M640 330 C648 352 656 374 662 398', C.tunicDeep, 1.2, .6) + fill('M598 318 L660 318 L660 334 L598 334 Z', C.tunicDeep, .4));

  S.belt = () => shape('M502 294 C540 300 580 302 610 300 L612 340 C580 344 540 342 500 336 Z', C.sash,
      line('M504 299 C540 305 580 307 608 305', C.sashShade, 1.4, .8) + line('M502 331 C540 337 580 339 610 335', C.sashShade, 1.4, .8) + fill('M500 326 L612 326 L612 346 L500 346 Z', C.sashShade, .45)) +
    shape('M501 305 C540 310 580 312 611 310 L611 330 C580 332 540 330 501 325 Z', C.leather,
      fill('M500 318 L612 318 L612 334 L500 334 Z', C.leatherShade, .7) + line('M503 308.5 C540 313.5 580 315.5 609 313.5', C.leatherLight, 1, .8, '3 2.5') +
      line('M503 321.5 C540 326.5 580 328.5 609 326.5', C.leatherShade, 1, .9, '3 2.5')) +
    shape('M497 302 L506 303 L506 328 L497 327 Z', C.iron, line('M499 304 L499 326', C.ironLight, 1.2), 1.6);

  S.sashTailB = () => shape('M534 332 C536 362 538 400 542 440' + fray([[542, 440], [560, 436]], 10, 6, 85, 1) + ' C558 400 556 362 554 332 Z', C.sashShade,
    line('M544 340 C546 372 548 404 550 436', C.sashDeep, 1.3));
  S.sashTailA = () => shape('M512 332 C508 372 506 412 508 458' + fray([[508, 458], [536, 452]], 12, 6, 86, 1) + ' C538 412 538 372 536 332 Z', C.sash,
    line('M522 340 C520 380 518 414 520 452', C.sashDeep, 1.4, .8) + fill('M528 332 L542 332 L542 460 L530 460 C534 414 534 372 528 332 Z', C.sashShade, .8) +
    fill(rib([515, 340, 512, 372, 511, 404, 512, 436], 6, 3), C.sashLight, .6) + strokes(87, 12, [508, 336, 30, 116], 3, 90, C.sashDeep, .7, .45));

  S.neck = () => shape('M550 100 L596 100 L606 140 L546 140 C548 128 550 114 550 100 Z', C.skin,
    fill('M544 100 L606 100 L606 120 C588 126 566 124 544 118 Z', C.skinDeep, .55) + line('M584 110 C574 120 562 130 552 138', C.skinShade, 1.4) + ell(552, 126, 3, 5, C.skinLight, .5), 2);

  S.pendant = () => line('M556 128 C548 150 536 174 526 196', C.cord, 1.7) + line('M594 132 C576 150 556 172 532 196', C.cord, 1.2, .7) +
    shape('M520 196 h9 a2 2 0 0 1 2 2 v16 a2 2 0 0 1 -2 2 h-9 a2 2 0 0 1 -2 -2 v-16 a2 2 0 0 1 2 -2 Z', C.brass,
      fill('M526 196 L531 196 L531 216 L527 216 Z', C.brassShade, .8) + fill('M519 198 L522 198 L522 214 L519 214 Z', C.brassLight, .8), 1.5);

  S.hairBack = () => {
    const pts = [[540, 76], [530, 62], [536, 48], [550, 39], [568, 34], [588, 34], [606, 39], [622, 48], [634, 60], [642, 74], [644, 90], [640, 104], [630, 116], [616, 120], [602, 116]];
    const d = 'M' + pts[0].join(' ') + bumpy(pts, [588, 80], 6, 21) + ' C596 104 590 90 584 80 C574 70 556 70 540 76 Z';
    let s = '';
    [[548, 46], [566, 38], [588, 36], [608, 42], [626, 54], [638, 72]].forEach(([x, y]) => { s += line(`M${x} ${y} Q${(x + 632) / 2 - 4} ${(y + 86) / 2 - 6} 632 88`, C.hairShade, 1.3, .9); });
    return shape(d, C.hair, s + fill(rib([552, 44, 570, 37, 596, 37, 614, 44], 7, 4), C.hairLight, .55) + ell(612, 100, 20, 12, C.hairDeep, .5));
  };

  S.ponytail = () => {
    const pts = [[626, 90], [638, 100], [648, 114], [652, 130], [649, 146], [643, 158], [636, 148], [630, 132], [626, 116], [622, 100]];
    return shape('M' + pts[0].join(' ') + bumpy(pts, [636, 124], 4, 19) + ' Z', C.hair,
      line('M630 96 C640 110 644 128 642 150 M626 100 C630 116 632 132 636 146', C.hairShade, 1.3, .9) + fill(rib([640, 104, 646, 116, 648, 128, 646, 142], 5, 2), C.hairLight, .6), 1.7) +
      shape('M626 82 C630 78 640 82 640 86 L636 98 C632 100 624 96 624 92 Z', C.headband, line('M626 88 L638 92', C.headbandShade, 1), 1.4);
  };

  S.face = () => shape('M532 54 C526 60 522 68 521 76 C519 80 516 84 512 90 C510 93 511 95 515 96 L518 97 C517 100 518 102 519 104 C518 108 519 114 524 118 C534 124 556 122 572 114 C580 108 586 98 588 86 C590 70 580 56 562 50 C550 48 540 50 532 54 Z', C.skin,
      fill('M520 50 L590 50 L590 64 C570 58 546 58 520 64 Z', C.skinShade, .7) + ell(532, 80, 8, 6, C.skinShade, .5) +
      line('M524 84 C528 86 533 86 537 84', C.skinShade, 1, .7) + ell(528, 64, 6, 4, C.skinLight, .6) + ell(540, 88, 6, 3, C.skinLight, .55) +
      line('M512 90.5 C514 92 516 92 518 91', OUT, 1.1) + ell(516.5, 93.5, 2, 1.1, C.skinDeep) + ell(514, 88, 2.2, 1.6, C.skinLight, .8), 2) +
    shape('M582 74 C590 68 600 74 599 86 C598 96 592 101 585 99 Z', C.skin, line('M588 78 C594 82 594 90 588 94', C.skinShade, 1.2) + fill('M590 72 L602 72 L602 102 L592 102 C596 92 596 80 590 72 Z', C.skinShade, .5), 1.8);

  S.beard = () => shape('M538 90 C534 98 528 102 524 104 C522 110 522 116 526 120' + fray([[526, 120], [534, 127], [548, 128], [562, 122], [574, 114]], 3, 4, 88, 1) +
      ' C580 108 584 100 584 90 C576 92 570 86 566 80 C560 86 550 90 538 90 Z', C.beard,
    strokes(89, 34, [524, 82, 60, 44], 3.2, 100, C.hairDeep, .9, .55) + strokes(90, 16, [524, 82, 60, 44], 3, 100, C.beardLight, .8, .55) + ell(528, 112, 5, 3, C.hairDeep, .5), 1.8);

  S.mouth = () => ({
    neutral: fill('M517.5 103 C520 102.5 523 103 525 104 C523 106.6 520 107.4 518.6 106.2 Z', C.lip) + line('M517 103.4 L525 104', OUT, 1.2),
    smile: fill('M518 104 C521 104 524 104.6 525.5 103.4 C523.5 107 520 108 518.6 106.4 Z', C.lip) + line('M517 103.4 C520 104.6 523.5 104.4 526.5 102', OUT, 1.2),
    askew: fill('M517.5 103.6 C520 103 523 103.6 525 104.6 C523 106.6 520 107.2 518.6 106.2 Z', C.lip) + line('M517 104 L525.5 103.4', OUT, 1.2),
    teeth: shape('M516.5 102 L526 102.6 L525.5 107.2 L517.5 106.8 Z', C.teeth, line('M517 104.6 L525.6 104.9', C.tunicShade, .8), 1.1),
    open: shape('M517 102 C521 101.4 525 102.6 525.6 104 C525 108 521 109.6 518 108.2 Z', '#4a2418', '', 1.1)
  });

  S.mustache = () => shape('M516 97.4 C520 95.6 528 96 534 99 C536 101.4 534 104 531 103 C527 101.4 522 101.2 518 102 C515 101.6 514.6 98.6 516 97.4 Z', C.beard,
    strokes(91, 8, [517, 97, 16, 5], 3, 120, C.hairDeep, .8, .6), 1.3);

  S.eyeR = () => {
    const open = (gx, gy) => shape('M524.5 80 C527 77 533 76.6 536 79 C534 81.4 528 82.2 524.5 80 Z', C.sclera,
      circ(527.6 + gx, 79.6 + gy, 2.6, C.iris) + circ(527.2 + gx, 79.6 + gy, 1.2, C.pupil) + circ(527.8 + gx, 78.8 + gy, .6, '#fff8ec'), 0) +
      line('M524 80 C527 76.4 533 76 536.4 78.8', OUT, 1.6) + line('M525.4 81.2 C529 82.2 533 81.6 535.4 80', C.skinDeep, .9) + line('M525 75.6 C529 74 533 74.2 536 76', C.skinShade, 1);
    return {
      open: open(0, 0), up: open(-.6, -1.2), down: open(0, .6),
      happy: line('M524 80 C527 77 533 76.6 536.4 79.2', OUT, 1.7) + line('M526 81.6 C529 80.4 533 80.4 535 81', C.skinDeep, 1) + line('M538 79 L541 78 M538 81 L541 82', C.skinShade, .8),
      squint: line('M524 80.4 C527 78.6 533 78.4 536.4 79.6', OUT, 1.8) + line('M525.4 81.6 C529 81 533 81 535.4 80.6', C.skinDeep, 1) + line('M538 79 L541 78.4 M538 81.4 L541 82.6', C.skinShade, .8)
    };
  };

  S.browR = () => {
    const tex = d => shape(d, C.hairShade, strokes(92, 6, [521, 70, 18, 5], 2.5, 10, C.hairDeep, .7, .7), 1.1);
    return {
      neutral: tex('M520 74.6 C526 71 534 70.6 540 72.8 C534 72.6 527 73.6 521 77 Z'),
      happy: tex('M520 73.6 C526 69.6 534 69.2 540 71.6 C534 71.4 527 72.2 521 75.8 Z'),
      raised: tex('M520 71.4 C526 66.6 534 66 540 69 C534 68.6 527 69.4 521 73.6 Z'),
      effort: tex('M519.4 76.6 C526 72.4 534 71.6 540 73 C534 73.8 527 75 520.6 79.4 Z')
    };
  };

  S.hairFront = () => {
    const lock = (p, w0, w1) => shape(rib(p, w0, w1, true), C.hair, line(`M${p[0]} ${p[1]} C${p[2]} ${p[3]} ${p[4]} ${p[5]} ${p[6]} ${p[7]}`, C.hairLight, 1.2, .7), 1.3, C.hairDeep);
    return shape('M528 66 C524 50 540 38 566 36 C590 36 604 46 606 58 C596 54 584 54 574 58 C560 56 544 58 528 66 Z', C.hair, ell(556, 44, 12, 3, C.hairLight, .7), 1.8) +
      lock([560, 56, 568, 68, 572, 80, 568, 92], 10, 4) + lock([534, 58, 530, 64, 528, 70, 530, 76], 7, 2) + lock([578, 58, 586, 68, 588, 80, 584, 90], 8, 3);
  };

  S.headband = () => shape('M526 56 C560 48 604 54 636 70 L634 79 C604 64 560 58 528 65 Z', C.headband,
    fill('M524 62 C560 56 604 62 640 76 L640 84 L524 70 Z', C.headbandShade, .7) + line('M530 60.5 C562 54 602 59 632 73', C.headbandShade, .9, .9, '2.5 2'), 1.6);

  S.upperArmR = () => shape('M582 150 C606 138 644 142 662 166 C672 182 672 206 670 228 C668 252 664 276 660 296 C656 306 646 310 636 308 L604 300 C596 284 590 264 586 244 C580 222 574 196 574 176 C574 164 576 156 582 150 Z', C.skin,
    fill('M650 160 C664 178 668 204 666 230 C664 256 660 280 656 304 L670 304 L676 160 Z', C.skinShade) +
    fill('M574 204 C590 214 612 214 632 202 L634 212 C612 226 588 224 572 214 Z', C.skinShade, .6) +
    fill('M586 230 C592 254 598 276 606 300 L596 300 C590 280 584 256 580 234 Z', C.skinShade, .7) +
    ell(608, 160, 20, 9, C.skinLight, .6, -12) + ell(600, 252, 9, 24, C.skinLight, .5, -12) + line('M640 222 C648 246 650 270 646 292', C.skinShade, 1.2, .8) +
    fill('M570 140 L612 140 L606 162 C596 164 584 160 576 154 Z', C.skinDeep, .45));

  S.forearmR = () => {
    const arm = shape('M630 290 C646 286 664 290 664 302 C660 322 646 346 630 368 L616 386 L582 372 C592 352 606 330 616 312 C620 302 624 294 630 290 Z', C.skin,
      fill('M664 296 C660 322 646 346 630 368 L616 386 L628 390 C644 368 660 336 672 300 Z', C.skinShade) + ell(622, 316, 9, 14, C.skinLight, .5, 30), 2) +
      ell(642, 294, 17, 7, C.skin) + ell(652, 296, 8, 5, C.skinShade, .6);
    let bands = '';
    for (let k = 0; k < 5; k++) {
      const y = 332 + k * 11;
      bands += line(`M${586 + k * 2} ${y + 8 + (k % 2 ? -6 : 0)} L${646 - k * 4} ${y - 4 + (k % 2 ? 6 : 0)}`, C.wrapsDeep, 1.3, .9);
    }
    const wrap = shape('M598 326 L648 330 C642 348 634 364 626 384 L580 376 C586 358 592 340 598 326 Z', C.wraps,
      bands + fill('M634 326 L654 326 L632 392 L616 392 Z', C.wrapsShade, .8) + strokes(38, 16, [584, 328, 62, 58], 3, 0, C.wrapsDeep, .7, .45), 1.9);
    return arm + wrap;
  };

  S.handR = () => {
    const nail = (x, y, r) => ell(x, y, 2.5, 1.6, C.skinLight, .95, r || 0);
    const relax = shape('M584 372 L622 378 C626 392 624 406 620 416 C618 428 614 438 606 444 Q600 448 594 446 Q588 447 584 442 C578 434 576 422 576 410 C576 396 578 382 584 372 Z', C.skin,
      fill('M610 372 L630 372 L630 450 L606 450 C616 430 618 400 610 372 Z', C.skinShade, .8) + ell(598, 392, 9, 13, C.skinLight, .4) +
      line('M582 418 C590 422 604 422 616 416 M582 430 C590 434 602 434 612 428', C.skinShade, 1, .9) +
      line('M594 446 C594 438 594 430 596 424 M604 442 C604 434 606 428 608 424', OUT, 1) + nail(588, 440, 20), 2) +
      shape(rib([584, 384, 576, 394, 572, 404, 574, 414], 12, 9, true), C.skin, fill('M566 380 L576 380 L576 418 L566 418 Z', C.skinShade, .5), 1.7) + nail(574.5, 411, 100);
    const fist = shape('M584 372 L622 378 C628 394 626 412 620 424 C614 436 600 440 590 436 C580 432 576 420 576 406 C576 392 578 380 584 372 Z', C.skin,
      fill('M610 372 L632 372 L632 442 L608 442 C618 420 618 396 610 372 Z', C.skinShade, .8) + line('M580 414 C592 420 606 420 618 414 M582 426 C592 432 604 432 614 426', C.skinShade, 1.1), 2) +
      shape(rib([584, 388, 578, 400, 580, 410, 588, 414], 11, 9, true), C.skin, '', 1.6) + nail(588, 413, 20);
    const grip = shape('M584 372 L622 378 C626 394 624 410 620 420 L582 420 C578 404 578 388 584 372 Z', C.skin, fill('M610 372 L630 372 L630 424 L608 424 Z', C.skinShade, .8), 2) +
      shape('M582 416 L620 418 L616 456 C610 460 590 460 584 456 Z', C.skin, line('M592 420 L590 456 M602 420 L601 458 M612 420 L611 456', C.skinShade, 1), 1.8) +
      shape(rib([584, 386, 574, 396, 568, 406, 566, 416], 12, 9, true), C.skin, '', 1.6);
    return { relax, fist, grip };
  };

  S.hammer = () => `<g transform="translate(514 -8)">${F.hammer()}</g>`;
  S.flask = () => `<g transform="translate(518 -12)">${F.flask()}</g>`;

  // ── Rig de perfil ──
  const R_SIDE = [
    ['root', null, [590, 680], 'Raíz (suelo)'],
    ['pelvis', 'root', [600, 400], 'Pelvis / asiento del pantalón'],
    ['thighL', 'pelvis', [578, 404], 'Muslo izq. (lejano)', { src: 'thighR', tx: -22, dim: 1 }],
    ['shinL', 'thighL', [576, 512], 'Espinilla izq. (lejana)', { src: 'shinR', tx: -22, dim: 1 }],
    ['footL', 'shinL', [580, 622], 'Bota izq. (lejana)', { src: 'footR', tx: -22, dim: 1 }],
    ['thighR', 'pelvis', [600, 404], 'Muslo der. (cercano)'],
    ['shinR', 'thighR', [598, 512], 'Espinilla der. (cercana)'],
    ['footR', 'shinR', [602, 622], 'Bota der. (cercana)'],
    ['torso', 'pelvis', [585, 345], 'Tronco + túnica'],
    ['upperArmL', 'torso', [586, 178], 'Brazo izq. (lejano)', { src: 'upperArmR', tx: -26, dim: 1 }],
    ['forearmL', 'upperArmL', [616, 298], 'Antebrazo izq.', { src: 'forearmR', tx: -26, dim: 1 }],
    ['handL', 'forearmL', [572, 378], 'Mano izq.', { src: 'handR', tx: -26, dim: 1 }],
    ['flask', 'handL', [572, 412], 'Recipiente (prop)', { tx: -26, dim: 1, h: 1 }],
    ['hemBack', 'torso', [600, 320], 'Faldón trasero'],
    ['hemFront', 'torso', [536, 320], 'Faldón delantero'],
    ['belt', 'torso', [556, 318], 'Cinturón + faja'],
    ['sashTailB', 'belt', [544, 332], 'Fajín · cola trasera'],
    ['sashTailA', 'belt', [522, 332], 'Fajín · cola delantera'],
    ['neck', 'torso', [576, 138], 'Cuello'],
    ['head', 'neck', [575, 116], 'Cabeza (control)'],
    ['ponytail', 'head', [632, 88], 'Coleta'],
    ['hairBack', 'head', [590, 80], 'Melena (fondo)'],
    ['face', 'head', [550, 86], 'Cara + oreja'],
    ['beard', 'head', [552, 108], 'Barba'],
    ['mouth', 'head', [521, 104], 'Boca'],
    ['mustache', 'head', [524, 99], 'Bigote'],
    ['eyeR', 'head', [530, 79], 'Ojo'],
    ['browR', 'head', [530, 73], 'Ceja'],
    ['hairFront', 'head', [566, 56], 'Flequillo y mechones'],
    ['headband', 'head', [580, 62], 'Cinta'],
    ['pendant', 'torso', [556, 132], 'Colgante'],
    ['upperArmR', 'torso', [612, 178], 'Brazo der. (cercano)'],
    ['forearmR', 'upperArmR', [642, 298], 'Antebrazo + vendas der.'],
    ['handR', 'forearmR', [598, 378], 'Mano der.'],
    ['hammer', 'handR', [598, 428], 'Maza (prop)', { h: 1 }]
  ];
  const CHAINS_SIDE = {
    armR: { bones: ['upperArmR', 'forearmR', 'handR'], bend: 1 },
    armL: { bones: ['upperArmL', 'forearmL', 'handL'], bend: 1 },
    legR: { bones: ['thighR', 'shinR', 'footR'], bend: -1 },
    legL: { bones: ['thighL', 'shinL', 'footL'], bend: -1 }
  };
  const FIRST_SIDE = { torso: ['upperArmL'], handR: ['hammer'], handL: ['flask'] };
  // ═══════════════════════════════ RIG ═══════════════════════════════
  // [id, padre, pivote, nombre, opciones]   opciones: m = arte reflejado de la pieza R, w = pieza en espacio de mundo, h = oculta en reposo
  const R_FRONT = [
    ['root', null, [225, 680], 'Raíz (suelo)'],
    ['pelvis', 'root', [225, 400], 'Pelvis / asiento del pantalón'],
    ['thighR', 'pelvis', [184, 402], 'Muslo der.'],
    ['shinR', 'thighR', [164, 508], 'Espinilla + vendas der.'],
    ['footR', 'shinR', [145, 612], 'Bota der.'],
    ['thighL', 'pelvis', [266, 402], 'Muslo izq.', { m: 'thighR' }],
    ['shinL', 'thighL', [286, 508], 'Espinilla + vendas izq.', { m: 'shinR' }],
    ['footL', 'shinL', [305, 612], 'Bota izq.', { m: 'footR' }],
    ['torso', 'pelvis', [225, 345], 'Tronco + túnica'],
    ['hemR', 'torso', [188, 320], 'Faldón der.'],
    ['hemL', 'torso', [262, 320], 'Faldón izq.', { m: 'hemR' }],
    ['belt', 'torso', [225, 316], 'Cinturón + faja'],
    ['sashTailB', 'belt', [282, 332], 'Fajín · cola trasera'],
    ['sashTailA', 'belt', [268, 332], 'Fajín · cola delantera'],
    ['sashKnot', 'belt', [271, 322], 'Fajín · nudo'],
    ['neck', 'torso', [225, 136], 'Cuello'],
    ['head', 'neck', [225, 116], 'Cabeza (control)'],
    ['ponytail', 'head', [225, 86], 'Coleta'],
    ['hairBack', 'head', [225, 80], 'Melena (fondo)'],
    ['face', 'head', [225, 90], 'Cara + orejas'],
    ['beard', 'head', [225, 108], 'Barba'],
    ['mouth', 'head', [225, 105], 'Boca'],
    ['mustache', 'head', [225, 100], 'Bigote'],
    ['nose', 'head', [225, 90], 'Nariz'],
    ['eyeR', 'head', [210, 80], 'Ojo der.'],
    ['eyeL', 'head', [240, 80], 'Ojo izq.', { m: 'eyeR' }],
    ['browR', 'head', [210, 74], 'Ceja der.'],
    ['browL', 'head', [240, 74], 'Ceja izq.', { m: 'browR' }],
    ['hairFront', 'head', [225, 60], 'Flequillo y mechones'],
    ['headband', 'head', [225, 58], 'Cinta'],
    ['pendant', 'torso', [225, 140], 'Colgante'],
    ['rock', 'torso', [225, 596], 'Roca (prop)', { w: 1, h: 1 }],
    ['upperArmR', 'torso', [128, 182], 'Brazo der.'],
    ['forearmR', 'upperArmR', [94, 288], 'Antebrazo + vendas der.'],
    ['handR', 'forearmR', [79, 374], 'Mano der.'],
    ['hammer', 'handR', [84, 436], 'Maza (prop)', { h: 1 }],
    ['upperArmL', 'torso', [322, 182], 'Brazo izq.', { m: 'upperArmR' }],
    ['forearmL', 'upperArmL', [356, 288], 'Antebrazo + vendas izq.', { m: 'forearmR' }],
    ['handL', 'forearmL', [371, 374], 'Mano izq.', { m: 'handR' }],
    ['flask', 'handL', [366, 412], 'Recipiente (prop)', { m: 'flask', h: 1 }],
    ['dust', 'root', [225, 672], 'FX polvo', { h: 1 }]
  ];
  const CHAINS_FRONT = {
    armR: { bones: ['upperArmR', 'forearmR', 'handR'], bend: -1 },
    armL: { bones: ['upperArmL', 'forearmL', 'handL'], bend: 1 },
    legR: { bones: ['thighR', 'shinR', 'footR'], bend: -1 },
    legL: { bones: ['thighL', 'shinL', 'footL'], bend: 1 }
  };
  const FIRST_FRONT = { handR: ['hammer'], handL: ['flask'] };

  // ═══════════════════════════════ MOTOR ═══════════════════════════════
  const D2R = Math.PI / 180;
  const KEYS = ['a', 'dx', 'dy', 'sx', 'sy', 'qx', 'qy', 'o'];
  const DEF = { a: 0, dx: 0, dy: 0, sx: 1, sy: 1, qx: 1, qy: 1, o: 1 };
  const EASE = {
    linear: t => t, in: t => t * t * t, out: t => 1 - Math.pow(1 - t, 3),
    inout: t => 0.5 - 0.5 * Math.cos(Math.PI * t), back: t => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
  };
  const mul = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
  const inv = m => { const k = m[0] * m[3] - m[1] * m[2]; return [m[3] / k, -m[1] / k, -m[2] / k, m[0] / k, (m[2] * m[5] - m[3] * m[4]) / k, (m[1] * m[4] - m[0] * m[5]) / k]; };
  const ap = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
  const ID = [1, 0, 0, 1, 0, 0];
  function localM(p, s, ox, oy) {
    const a = s.a * D2R, c = Math.cos(a), n = Math.sin(a);
    const A = c * s.sx, B = n * s.sx, Cc = -n * s.sy, Dd = c * s.sy;
    return [A, B, Cc, Dd, ox + s.dx + p[0] - (A * p[0] + Cc * p[1]), oy + s.dy + p[1] - (B * p[0] + Dd * p[1])];
  }
  const normA = a => { a = (a + 180) % 360; if (a < 0) a += 360; return a - 180; };
  const lerpA = (a, b, w) => a + normA(b - a) * w;

  function sampleTrack(track, t) {
    // track: [[t, {..}, ease?], ...] → valores interpolados + variante discreta 'v'
    let i = 1;
    while (i < track.length && t > track[i][0]) i++;
    const out = {};
    let v;
    for (let j = 0; j < track.length && track[j][0] <= t; j++) if (track[j][1].v != null) v = track[j][1].v;
    if (v == null && track[0][1].v != null) v = track[0][1].v;
    if (i >= track.length) { Object.assign(out, track[track.length - 1][1]); }
    else if (t <= track[0][0]) { Object.assign(out, track[0][1]); }
    else {
      const [t0, s0] = track[i - 1], [t1, s1, e] = track[i];
      const k = (EASE[e || 'inout'])((t - t0) / Math.max(1e-6, t1 - t0));
      const keys = new Set(Object.keys(s0).concat(Object.keys(s1)));
      keys.forEach(key => {
        if (key === 'v') return;
        const base = key in DEF ? DEF[key] : 0;
        const A = key in s0 ? s0[key] : base, B = key in s1 ? s1[key] : base;
        out[key] = A + (B - A) * k;
      });
    }
    if (v != null) out.v = v; else delete out.v;
    return out;
  }
  function sampleDiscrete(track, t) { let v = track[0][1]; for (const [tt, val] of track) if (tt <= t) v = val; return v; }
  // ═══════════════════════════ VISTAS Y CONTROLADOR ═══════════════════════════
  const normRig = def => def.map(([id, parent, pivot, name, o]) => ({ id, parent, pivot, name, m: o && o.m, src: o && o.src, tx: (o && o.tx) || 0, dim: !!(o && o.dim), w: !!(o && o.w), h: !!(o && o.h) }));
  const EXPLODE_SIDE = {
    thighL: [-26, 24], shinL: [-6, 26], footL: [-6, 22], thighR: [26, 24], shinR: [6, 26], footR: [6, 22], torso: [0, -26],
    hemFront: [-30, 40], hemBack: [34, 40], belt: [0, 22], sashTailA: [-26, 30], sashTailB: [-8, 34], neck: [0, -20], head: [0, -34],
    ponytail: [22, -6], hairBack: [10, -22], hairFront: [0, -18], headband: [0, -30], browR: [-10, -10], eyeR: [-12, -2], mouth: [-14, 10],
    mustache: [-12, 4], beard: [-6, 22], pendant: [-34, 30], upperArmR: [46, -6], forearmR: [22, 26], handR: [6, 28], upperArmL: [-46, -6], forearmL: [-20, 26], handL: [-8, 28]
  };
  const EXPLODE_FRONT = {
    thighR: [-30, 22], shinR: [-8, 26], footR: [-6, 22], thighL: [30, 22], shinL: [8, 26], footL: [6, 22], torso: [0, -26],
    hemR: [-24, 44], hemL: [24, 44], belt: [0, 22], sashTailA: [16, 30], sashTailB: [34, 26], sashKnot: [30, 2],
    neck: [0, -20], head: [0, -34], ponytail: [0, -10], hairBack: [0, -24], hairFront: [0, -16], headband: [0, -30],
    browR: [-8, -10], browL: [8, -10], eyeR: [-6, -2], eyeL: [6, -2], nose: [0, 4], mustache: [0, 8], mouth: [0, 14], beard: [0, 24],
    pendant: [0, 36], upperArmR: [-44, -8], forearmR: [-18, 28], handR: [-8, 28], upperArmL: [44, -8], forearmL: [18, 28], handL: [8, 28]
  };
  const EXPR_FRONT = {
    neutral: { browR: 'neutral', browL: 'neutral', eyeR: 'open', eyeL: 'open', mouth: 'neutral' },
    contento: { browR: 'happy', browL: 'happy', eyeR: 'happy', eyeL: 'happy', mouth: 'smile' },
    confundido: { browR: 'raised', browL: 'effort', eyeR: 'up', eyeL: 'up', mouth: 'askew' },
    esfuerzo: { browR: 'effort', browL: 'effort', eyeR: 'squint', eyeL: 'squint', mouth: 'teeth' },
    resoplido: { browR: 'effort', browL: 'neutral', eyeR: 'down', eyeL: 'down', mouth: 'open' }
  };
  const VIEWS = {
    front: { rig: normRig(R_FRONT), chains: CHAINS_FRONT, first: FIRST_FRONT, art: F, kind: 'front', wrap: ID, explode: EXPLODE_FRONT, expr: EXPR_FRONT,
      viewBox: { rest: '22 22 406 668', action: '-40 -170 530 866', head: '170 24 110 116' } },
    back: { rig: normRig(R_FRONT), chains: CHAINS_FRONT, first: FIRST_FRONT, art: F, kind: 'back', wrap: [-1, 0, 0, 1, 450, 0],
      order: { head: ['hairBack', 'face', 'ponytail', 'beard', 'mouth', 'mustache', 'nose', 'eyeR', 'eyeL', 'browR', 'browL', 'hairFront', 'headband'] }, explode: EXPLODE_FRONT, expr: EXPR_FRONT,
      viewBox: { rest: '22 22 406 668', action: '-40 -170 530 866', head: '170 24 110 116' } },
    side: { rig: normRig(R_SIDE), chains: CHAINS_SIDE, first: FIRST_SIDE, art: S, kind: 'side', wrap: [1, 0, 0, 1, -355, 0], explode: EXPLODE_SIDE,
      expr: { neutral: { browR: 'neutral', eyeR: 'open', mouth: 'neutral' }, contento: { browR: 'happy', eyeR: 'happy', mouth: 'smile' },
        confundido: { browR: 'raised', eyeR: 'up', mouth: 'askew' }, esfuerzo: { browR: 'effort', eyeR: 'squint', mouth: 'teeth' }, resoplido: { browR: 'effort', eyeR: 'down', mouth: 'open' } },
      viewBox: { rest: '22 22 406 668', action: '-40 -170 530 866', head: '140 24 130 116' } }
  };

  let instances = 0;
  // Dibujo aislado de una pieza (para galerías o para montarla a mano). Devuelve el SVG interior.
  function partMarkup(viewName, id, variant) {
    const V = VIEWS[viewName], p = V.rig.find(q => q.id === id);
    if (!p) return '';
    _uid = 0; _pre = 'pm' + (++instances) + '_';
    const fn = V.art[p.src || p.m || p.id];
    let art = fn ? fn(V.kind, !!p.m) : '';
    if (art && typeof art === 'object') art = art[variant] || art[Object.keys(art)[0]];
    if (p.m) art = `<g transform="matrix(-1 0 0 1 450 0)">${art}</g>`;
    if (p.tx) art = `<g transform="translate(${p.tx} 0)">${art}</g>`;
    return `<g transform="matrix(${V.wrap.join(' ')})">${art}</g>`;
  }
  function buildMarkup(viewName, opts) {
    opts = opts || {};
    const V = VIEWS[viewName];
    _uid = 0; _pre = opts.idPrefix || ('gr' + (++instances) + '_');
    const byParent = {};
    V.rig.forEach(p => { (byParent[p.parent] = byParent[p.parent] || []).push(p); });
    const g = p => {
      let kids = byParent[p.id] || [];
      const first = V.first[p.id] || [];
      if (V.order && V.order[p.id]) { const ord = V.order[p.id]; kids = kids.slice().sort((a, b) => ord.indexOf(a.id) - ord.indexOf(b.id)); }
      const before = kids.filter(k => first.includes(k.id)).map(g).join('');
      const after = kids.filter(k => !first.includes(k.id)).map(g).join('');
      const fn = V.art[p.src || p.m || p.id];
      const art = fn ? fn(V.kind, !!p.m) : '';
      let inner = (art && typeof art === 'object')
        ? Object.keys(art).map((k, i) => `<g data-v="${k}"${i ? ' display="none"' : ''}>${art[k]}</g>`).join('')
        : (art || '');
      if (p.m) inner = `<g transform="matrix(-1 0 0 1 450 0)">${inner}</g>`;
      if (p.tx) inner = `<g transform="translate(${p.tx} 0)">${inner}</g>`;
      if (p.dim) inner = `<g style="filter:brightness(.74) saturate(.92)">${inner}</g>`;
      return `<g data-part="${p.id}"${p.h ? ' opacity="0"' : ''}>${before}<g data-art="1">${inner}</g>${after}</g>`;
    };
    const vb = V.viewBox[opts.viewBox || 'rest'] || opts.viewBox || V.viewBox.rest;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="Goran"${opts.className ? ` class="${opts.className}"` : ''}>` +
      `<g data-wrap="1" transform="matrix(${V.wrap.join(' ')})">${g(V.rig[0])}</g></svg>`;
  }

  /**
   * Crea a Goran en `container`.
   * opts: { view: 'front'|'back'|'side', viewBox: 'rest'|'action'|'head'|string, expression, equip: {hammer, flask} }
   * Devuelve: { svg, view, nodes, rig, pose(states, {ik, flat}), play(name, {speed, onEnd, onFrame, chain}), seek(name, t), stop(),
   *             setExpression(name), equip(prop, on), setExplode(k), pivots(), world(id) }
   */
  function create(container, opts) {
    opts = opts || {};
    const view = opts.view || 'front', V = VIEWS[view];
    container.insertAdjacentHTML('beforeend', buildMarkup(view, opts));
    const svg = container.lastElementChild;
    const rig = {}, nodes = {}, arts = {}, vars = {};
    V.rig.forEach(p => { rig[p.id] = p; });
    svg.querySelectorAll('[data-part]').forEach(n => {
      const id = n.dataset.part; nodes[id] = n;
      arts[id] = Array.from(n.children).find(c => c.hasAttribute('data-art'));
      const vs = arts[id].querySelectorAll('[data-v]');
      if (vs.length) { vars[id] = {}; vs.forEach(v => { vars[id][v.dataset.v] = v; }); }
    });
    const cache = {};
    let base = {}, expression = opts.expression || 'neutral', explode = 0, raf = 0, playing = null, last = { st: {}, ik: {}, flat: {} };
    const equipped = {};

    function compose(anim) {
      const st = {};
      const ex = V.expr ? (V.expr[anim.ex || expression] || {}) : {};
      V.rig.forEach(p => {
        const s = Object.assign({}, DEF, p.h ? { o: 0 } : null, base[p.id], anim.st[p.id]);
        if (s.v == null) s.v = (base[p.id] && base[p.id].v) || ex[p.id];
        const e = explode && V.explode[p.id];
        if (e) { s.dx += e[0] * explode; s.dy += e[1] * explode; }
        st[p.id] = s;
      });
      return st;
    }

    function world(st) {
      const L = {}, W = {};
      V.rig.forEach(p => {
        let ox = 0, oy = 0;
        if (p.parent) {
          const ps = st[p.parent], pp = rig[p.parent].pivot;
          ox = (p.pivot[0] - pp[0]) * (ps.qx - 1); oy = (p.pivot[1] - pp[1]) * (ps.qy - 1);
        }
        let lm = localM(p.pivot, st[p.id], ox, oy);
        if (p.w && p.parent) lm = mul(inv(W[p.parent]), localM(p.pivot, st[p.id], 0, 0));
        L[p.id] = lm; W[p.id] = p.parent ? mul(W[p.parent], lm) : lm;
      });
      return { L, W };
    }

    function solve(chainName, tx, ty, w, st, M) {
      const ch = V.chains[chainName]; if (!ch || !w) return;
      const [u, f, h] = ch.bones, par = rig[u].parent;
      const Pw = M.W[par], T = ap(inv(Pw), tx, ty);
      const pu = rig[u].pivot, pf = rig[f].pivot, ph = rig[h].pivot;
      const S = ap(M.L[u], pu[0], pu[1]);
      const u0 = [pf[0] - pu[0], pf[1] - pu[1]], f0 = [ph[0] - pf[0], ph[1] - pf[1]];
      const L1 = Math.hypot(u0[0], u0[1]), L2 = Math.hypot(f0[0], f0[1]);
      const dx = T[0] - S[0], dy = T[1] - S[1];
      const D = Math.min(L1 + L2 - 0.01, Math.max(Math.abs(L1 - L2) + 0.01, Math.hypot(dx, dy)));
      const baseA = Math.atan2(dy, dx), A = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + D * D - L2 * L2) / (2 * L1 * D))));
      const cands = [baseA + A, baseA - A].map(t1 => {
        const E = [S[0] + Math.cos(t1) * L1, S[1] + Math.sin(t1) * L1];
        return { t1, E, xw: ap(Pw, E[0], E[1])[0] };
      });
      const c = cands[0].xw * ch.bend >= cands[1].xw * ch.bend ? cands[0] : cands[1];
      const t2 = Math.atan2(T[1] - c.E[1], T[0] - c.E[0]);
      const aU = (c.t1 - Math.atan2(u0[1], u0[0])) / D2R;
      const aF = (t2 - Math.atan2(f0[1], f0[0])) / D2R - aU;
      st[u].a = lerpA(st[u].a, normA(aU), w);
      st[f].a = lerpA(st[f].a, normA(aF), w);
    }

    function render(anim) {
      last = anim;
      const st = compose(anim);
      let M = world(st);
      const ik = anim.ik || {};
      const keys = Object.keys(ik);
      if (keys.length) {
        keys.forEach(k => {
          const t = ik[k]; let x = t.x, y = t.y;
          if (t.rel) { const rp = ap(M.W[t.rel], rig[t.rel].pivot[0], rig[t.rel].pivot[1]); x += rp[0]; y += rp[1]; }
          solve(k, x, y, t.w == null ? 1 : t.w, st, M);
        });
        M = world(st);
      }
      const flat = anim.flat || {};
      if (Object.keys(flat).length) {
        Object.keys(flat).forEach(id => {
          const pw = M.W[rig[id].parent];
          st[id].a = st[id].a - (Math.atan2(pw[1], pw[0]) / D2R) * flat[id];
        });
        M = world(st);
      }
      V.rig.forEach(p => {
        const s = st[p.id], L = M.L[p.id];
        const tr = `matrix(${L.map(v => Math.round(v * 1e4) / 1e4).join(' ')})`;
        const c = cache[p.id] || (cache[p.id] = {});
        if (c.tr !== tr) { nodes[p.id].setAttribute('transform', tr); c.tr = tr; }
        const q = (s.qx !== 1 || s.qy !== 1) ? `matrix(${s.qx} 0 0 ${s.qy} ${p.pivot[0] * (1 - s.qx)} ${p.pivot[1] * (1 - s.qy)})` : '';
        if (c.q !== q) { if (q) arts[p.id].setAttribute('transform', q); else arts[p.id].removeAttribute('transform'); c.q = q; }
        const o = Math.max(0, Math.min(1, s.o)).toFixed(3);
        if (c.o !== o) { nodes[p.id].setAttribute('opacity', o); c.o = o; }
        if (vars[p.id]) {
          const want = (s.v && vars[p.id][s.v]) ? s.v : Object.keys(vars[p.id])[0];
          if (c.v !== want) { Object.keys(vars[p.id]).forEach(k => vars[p.id][k].setAttribute('display', k === want ? 'inline' : 'none')); c.v = want; }
        }
      });
      last.M = M;
    }

    function stateAt(name, t) {
      const A = ANIMS[view][name];
      if (!A) throw new Error('Animación desconocida en vista ' + view + ': ' + name);
      const st = {}, ik = {}, flat = {};
      Object.keys(A.tracks || {}).forEach(id => { st[id] = sampleTrack(A.tracks[id], t); });
      Object.keys(A.ik || {}).forEach(k => { const s = sampleTrack(A.ik[k], t); ik[k] = { x: s.x, y: s.y, w: s.w, rel: A.ikRel && A.ikRel[k] }; });
      Object.keys(A.flat || {}).forEach(id => { flat[id] = typeof A.flat[id] === 'number' ? A.flat[id] : sampleTrack(A.flat[id], t).w; });
      return { st, ik, flat, ex: A.expr ? sampleDiscrete(A.expr, t) : null };
    }

    function stop() { cancelAnimationFrame(raf); playing = null; }
    function play(name, o) {
      o = o || {};
      const A = ANIMS[view][name];
      if (!A) throw new Error('Animación desconocida en vista ' + view + ': ' + name);
      stop();
      const reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const dur = A.duration / (o.speed || 1), t0 = performance.now();
      playing = name;
      const tick = now => {
        let t = (now - t0) / dur;
        t = A.loop ? (reduce ? 0 : t % 1) : Math.min(1, t);
        render(stateAt(name, t));
        if (o.onFrame) o.onFrame(t, name);
        if (A.loop || t < 1) raf = requestAnimationFrame(tick);
        else { playing = null; if (o.onEnd) o.onEnd(name); if (A.then && o.chain !== false) play(A.then, { onFrame: o.onFrame }); }
      };
      raf = requestAnimationFrame(tick);
    }

    render({ st: {}, ik: {}, flat: {} });
    return {
      svg, view, nodes, rig, chains: V.chains,
      pose(states, extra) { stop(); extra = extra || {}; render({ st: states || {}, ik: extra.ik || {}, flat: extra.flat || {}, ex: extra.expression }); },
      play, stop, seek(name, t) { stop(); render(stateAt(name, t)); },
      get playing() { return playing; },
      setExpression(name) { expression = name; if (!playing) render(last); },
      equip(prop, on) {
        equipped[prop] = on;
        base[prop] = Object.assign({}, base[prop], { o: on ? 1 : 0 });
        if (prop === 'flask') base.handL = Object.assign({}, base.handL, { v: on ? 'fist' : undefined });
        if (!playing) render(last);
      },
      setExplode(k) { explode = k; if (!playing) render(last); },
      world(id) { const M = last.M || world(compose(last)); const p = rig[id]; const q = ap(M.W[id], p.pivot[0], p.pivot[1]); return ap(V.wrap, q[0], q[1]); },
      pivots() { return V.rig.map(p => { const q = this.world(p.id); return { id: p.id, name: p.name, x: q[0], y: q[1] }; }); }
    };
  }
  // ═══════════════════════════════ ANIMACIONES ═══════════════════════════════
  // Formato: { duration (ms), loop?, then?, tracks: {pieza: [[t, {a,dx,dy,sx,sy,qx,qy,o,v}, easing?], ...]},
  //            ik: {cadena: [[t, {x, y, w}]]}, ikRel: {cadena: 'pieza'}, flat: {pie: peso}, expr: [[t, 'expresión']] }
  // t va de 0 a 1. Una clave vacía {} = pose de reposo. Easing: 'inout' (def.), 'in', 'out', 'linear', 'back'.
  const ANIMS = { front: {}, side: {} };

  ANIMS.front.idle = {
    duration: 3600, loop: true,
    tracks: {
      torso: [[0, {}], [0.5, { qy: 1.012, dy: -0.6 }], [1, {}]],
      upperArmR: [[0, {}], [0.5, { a: 1.2 }], [1, {}]],
      upperArmL: [[0, {}], [0.5, { a: -1.2 }], [1, {}]],
      head: [[0, {}], [0.5, { a: -1, dy: 0.6 }], [1, {}]],
      hemR: [[0, {}], [0.5, { a: 1 }], [1, {}]],
      hemL: [[0, {}], [0.5, { a: -1 }], [1, {}]],
      sashTailA: [[0, {}], [0.35, { a: 2.5 }], [0.75, { a: -1 }], [1, {}]],
      sashTailB: [[0, {}], [0.45, { a: 2 }], [0.85, { a: -1 }], [1, {}]],
      pendant: [[0, {}], [0.4, { a: 1.5 }], [0.8, { a: -1 }], [1, {}]],
      eyeR: [[0, {}], [0.86, {}], [0.89, { sy: 0.08 }], [0.92, {}], [1, {}]],
      eyeL: [[0, {}], [0.86, {}], [0.89, { sy: 0.08 }], [0.92, {}], [1, {}]]
    }
  };

  // Levantamiento de roca: 6 poses clave (preparación → bloqueo), sostener, soltar.
  const KEYPOSES = [
    { id: 'prep', name: 'Preparación', t: 0.14 }, { id: 'lift', name: 'Despegue', t: 0.28 }, { id: 'lap', name: 'Al regazo', t: 0.38 },
    { id: 'chest', name: 'Al pecho', t: 0.50 }, { id: 'drive', name: 'Impulso', t: 0.58 }, { id: 'lock', name: 'Bloqueo', t: 0.66 }
  ];
  // Agarre de cada mano relativo al centro de la roca (s = -1 mano der., +1 mano izq.)
  const ikArm = s => [[0, { x: 96 * s, y: -30, w: 0 }],
    [0.1, { x: 96 * s, y: -30, w: 0 }], [0.14, { x: 96 * s, y: -30, w: 1 }], [0.28, { x: 94 * s, y: -34, w: 1 }], [0.38, { x: 80 * s, y: 0, w: 1 }],
    [0.5, { x: 64 * s, y: 40, w: 1 }], [0.58, { x: s < 0 ? -56 : 58, y: s < 0 ? 64 : 58, w: 1 }], [0.66, { x: 72 * s, y: 44, w: 1 }], [0.84, { x: 64 * s, y: 40, w: 1 }],
    [0.875, { x: 64 * s, y: 40, w: 1 }], [0.9, { x: 64 * s, y: 40, w: 0 }], [1, { x: 64 * s, y: 40, w: 0 }]];
  const gripTrack = [[0, { v: 'relax' }], [0.12, { v: 'grip' }], [0.885, { v: 'relax' }]];
  ANIMS.front.liftRock = {
    duration: 11000, then: 'idle',
    tracks: {
      rock: [[0, { o: 1 }], [0.2, { o: 1 }], [0.28, { o: 1, dy: -20, a: 4 }], [0.38, { o: 1, dy: -126, a: 12 }], [0.5, { o: 1, dy: -346, a: 20 }],
        [0.58, { o: 1, dx: -40, dy: -606, a: 26 }], [0.66, { o: 1, dy: -656, a: 30 }], [0.71, { o: 1, dx: 4, dy: -660, a: 32 }], [0.76, { o: 1, dx: -2, dy: -656, a: 30 }],
        [0.84, { o: 1, dy: -346, a: 22 }], [0.88, { o: 1, dy: -348, a: 22 }], [0.91, { o: 1, dy: 0, a: 40 }, 'in'], [0.93, { o: 1, dy: -12, a: 42 }, 'out'], [0.95, { o: 1, dy: 0, a: 44 }, 'in'],
        [0.965, { o: 1, a: 44 }], [1, { o: 1, dx: 340, a: 300 }, 'in']],
      pelvis: [[0, {}], [0.06, {}], [0.14, { dy: 125 }], [0.2, { dy: 125 }], [0.28, { dy: 110 }], [0.38, { dy: 96 }], [0.5, {}], [0.58, { dy: 26 }], [0.66, { dy: -2 }],
        [0.76, {}], [0.84, { dy: 6 }], [0.88, { dy: 8 }], [0.91, { dy: 22 }, 'out'], [0.96, {}], [1, {}]],
      torso: [[0, {}], [0.06, {}], [0.14, { qy: 0.55, dy: 12 }], [0.2, { qy: 0.55, dy: 12 }], [0.28, { qy: 0.62, dy: 10 }], [0.38, { qy: 0.86, dy: 4 }], [0.5, {}],
        [0.58, { a: 5, qy: 0.98 }], [0.66, {}], [0.71, { a: -1.5 }], [0.76, { a: 1 }], [0.84, {}], [0.91, { qy: 0.94, dy: 4 }], [0.96, {}], [1, {}]],
      neck: [[0, {}], [0.14, { dy: 4 }], [0.28, {}], [1, {}]],
      head: [[0, {}], [0.14, { dy: 4 }], [0.28, { dy: -2 }], [0.38, { a: 6 }], [0.5, {}], [0.58, { a: 10, dy: 4 }], [0.66, { dy: 6 }], [0.76, { dy: 6 }], [0.84, {}], [0.94, { a: -3 }], [1, {}]],
      upperArmR: [[0, {}], [0.62, {}], [0.66, { dy: -10 }], [0.78, { dy: -10 }], [0.84, {}], [1, {}]],
      upperArmL: [[0, {}], [0.62, {}], [0.66, { dy: -10 }], [0.78, { dy: -10 }], [0.84, {}], [1, {}]],
      handR: gripTrack, handL: gripTrack,
      hemR: [[0, {}], [0.14, { a: 22 }], [0.28, { a: 18 }], [0.38, { a: 12 }], [0.5, { a: -2 }], [0.58, { a: 4 }], [0.66, {}], [0.91, { a: 6 }], [0.96, { a: -2 }], [1, {}]],
      hemL: [[0, {}], [0.14, { a: -22 }], [0.28, { a: -18 }], [0.38, { a: -12 }], [0.5, { a: 2 }], [0.58, { a: -4 }], [0.66, {}], [0.91, { a: -6 }], [0.96, { a: 2 }], [1, {}]],
      sashTailA: [[0, {}], [0.14, { a: -10 }], [0.38, { a: -6 }], [0.5, { a: 4 }], [0.6, { a: -5 }], [0.7, { a: 3 }], [0.92, { a: -6 }], [0.97, { a: 3 }], [1, {}]],
      sashTailB: [[0, {}], [0.16, { a: -8 }], [0.4, { a: -4 }], [0.52, { a: 5 }], [0.62, { a: -4 }], [0.72, { a: 3 }], [0.93, { a: -5 }], [0.98, { a: 2 }], [1, {}]],
      pendant: [[0, {}], [0.14, { a: -6 }], [0.5, { a: 4 }], [0.6, { a: -3 }], [1, {}]],
      dust: [[0, { o: 0, sx: 0.4, sy: 0.4 }], [0.905, { o: 0, sx: 0.4, sy: 0.4 }], [0.915, { o: 1, sx: 0.8, sy: 0.8 }, 'out'], [0.97, { o: 0, sx: 1.5, sy: 1.2 }, 'out'], [1, { o: 0 }]]
    },
    ikRel: { armR: 'rock', armL: 'rock' },
    ik: {
      armR: ikArm(-1), armL: ikArm(1),
      legR: [[0, { x: 145, y: 612, w: 1 }], [0.03, { x: 132, y: 600, w: 1 }], [0.06, { x: 112, y: 612, w: 1 }], [0.94, { x: 112, y: 612, w: 1 }], [0.97, { x: 130, y: 600, w: 1 }], [1, { x: 145, y: 612, w: 1 }]],
      legL: [[0, { x: 305, y: 612, w: 1 }], [0.04, { x: 305, y: 612, w: 1 }], [0.07, { x: 320, y: 600, w: 1 }], [0.1, { x: 338, y: 612, w: 1 }], [0.95, { x: 338, y: 612, w: 1 }], [0.98, { x: 320, y: 600, w: 1 }], [1, { x: 305, y: 612, w: 1 }]]
    },
    flat: { footR: 1, footL: 1 },
    expr: [[0, 'neutral'], [0.1, 'resoplido'], [0.22, 'esfuerzo'], [0.8, 'esfuerzo'], [0.86, 'resoplido'], [0.94, 'contento']]
  };

  ANIMS.side.idle = {
    duration: 3600, loop: true,
    tracks: {
      torso: [[0, {}], [0.5, { qy: 1.012, dy: -0.6 }], [1, {}]],
      upperArmR: [[0, {}], [0.5, { a: -1.2 }], [1, {}]],
      head: [[0, {}], [0.5, { a: 1, dy: 0.6 }], [1, {}]],
      ponytail: [[0, {}], [0.5, { a: 2 }], [1, {}]],
      sashTailA: [[0, {}], [0.4, { a: 2 }], [0.8, { a: -1 }], [1, {}]],
      eyeR: [[0, {}], [0.86, {}], [0.89, { sy: 0.08 }], [0.92, {}], [1, {}]]
    }
  };

  // Ciclo de andar en el sitio (perfil). Pierna cercana (R) adelantada en t = 0; la lejana (L) va medio ciclo detrás.
  (function () {
    const legKeys = [[0, 24, -2, 14], [0.1, 16, -12, 0], [0.25, 0, -4, 0], [0.4, -16, -6, -4], [0.5, -22, -18, -22], [0.62, -8, -52, -10], [0.75, 12, -58, 0], [0.88, 26, -18, 12], [1, 24, -2, 14]];
    const shift = (t, o) => (t + o) % 1;
    const build = (off, idx) => {
      const tr = legKeys.map(k => [shift(k[0], off), k[idx]]).sort((a, b) => a[0] - b[0]);
      if (tr[0][0] !== 0) { const lastV = tr[tr.length - 1][1]; tr.unshift([0, lastV]); }
      if (tr[tr.length - 1][0] !== 1) tr.push([1, tr[0][1]]);
      return tr.map(([t, v]) => [t, { a: v }]);
    };
    // en la pierna lejana, interpolamos entre la última clave y la primera envolviendo el ciclo
    const wrap = (tr) => {
      const out = tr.filter((k, i) => !(i > 0 && k[0] === tr[i - 1][0]));
      return out;
    };
    const arm = (sign) => [[0, { a: -14 * sign }], [0.5, { a: 14 * sign }], [1, { a: -14 * sign }]];
    const fore = (sign) => [[0, { a: sign > 0 ? 8 : 22 }], [0.5, { a: sign > 0 ? 22 : 8 }], [1, { a: sign > 0 ? 8 : 22 }]];
    ANIMS.side.walk = {
      duration: 1150, loop: true,
      tracks: {
        thighR: build(0, 1), shinR: build(0, 2), footR: build(0, 3),
        thighL: wrap(build(0.5, 1)), shinL: wrap(build(0.5, 2)), footL: wrap(build(0.5, 3)),
        pelvis: [[0, { dy: 2 }], [0.1, { dy: 6 }], [0.25, { dy: -3 }], [0.4, { dy: -4 }], [0.5, { dy: 2 }], [0.6, { dy: 6 }], [0.75, { dy: -3 }], [0.9, { dy: -4 }], [1, { dy: 2 }]],
        torso: [[0, { a: -2 }], [0.25, { a: -3 }], [0.5, { a: -2 }], [0.75, { a: -3 }], [1, { a: -2 }]],
        upperArmR: arm(1), forearmR: fore(1), upperArmL: arm(-1), forearmL: fore(-1),
        head: [[0, { a: 1 }], [0.25, { a: -0.5 }], [0.5, { a: 1 }], [0.75, { a: -0.5 }], [1, { a: 1 }]],
        ponytail: [[0, { a: 5 }], [0.25, { a: -3 }], [0.5, { a: 5 }], [0.75, { a: -3 }], [1, { a: 5 }]],
        hemFront: [[0, { a: -4 }], [0.25, { a: 2 }], [0.5, { a: -4 }], [0.75, { a: 2 }], [1, { a: -4 }]],
        hemBack: [[0, { a: 3 }], [0.25, { a: -3 }], [0.5, { a: 3 }], [0.75, { a: -3 }], [1, { a: 3 }]],
        sashTailA: [[0, { a: 6 }], [0.25, { a: -3 }], [0.5, { a: 6 }], [0.75, { a: -3 }], [1, { a: 6 }]],
        sashTailB: [[0, { a: 4 }], [0.3, { a: -4 }], [0.55, { a: 4 }], [0.8, { a: -4 }], [1, { a: 4 }]],
        pendant: [[0, { a: -3 }], [0.25, { a: 2 }], [0.5, { a: -3 }], [0.75, { a: 2 }], [1, { a: -3 }]]
      },
      flat: { footR: 1, footL: 1 }
    };
  })();

  ANIMS.back = ANIMS.front;

  // Saludo con la mano izquierda (IK hacia un punto junto a la cabeza)
  ANIMS.front.wave = {
    duration: 2600, then: 'idle',
    tracks: {
      handL: [[0, { v: 'relax' }], [0.14, { v: 'grip' }], [0.86, { v: 'relax' }]],
      head: [[0, {}], [0.2, { a: -4 }], [0.8, { a: -4 }], [1, {}]],
      torso: [[0, {}], [0.2, { a: -2 }], [0.8, { a: -2 }], [1, {}]],
      sashTailA: [[0, {}], [0.3, { a: 3 }], [0.6, { a: -2 }], [1, {}]],
      eyeR: [[0, {}], [0.9, {}], [0.93, { sy: 0.1 }], [0.96, {}], [1, {}]], eyeL: [[0, {}], [0.9, {}], [0.93, { sy: 0.1 }], [0.96, {}], [1, {}]]
    },
    ik: { armL: [[0, { x: 371, y: 374, w: 0 }], [0.18, { x: 372, y: 96, w: 1 }], [0.3, { x: 404, y: 104, w: 1 }], [0.42, { x: 366, y: 92, w: 1 }],
      [0.54, { x: 404, y: 104, w: 1 }], [0.66, { x: 366, y: 92, w: 1 }], [0.82, { x: 372, y: 96, w: 1 }], [1, { x: 371, y: 374, w: 0 }]] },
    expr: [[0, 'neutral'], [0.12, 'contento'], [0.9, 'neutral']]
  };

  const api = { PALETTE, VIEWS, ANIMS, KEYPOSES, ART: { front: F, side: typeof S !== 'undefined' ? S : null }, create, buildMarkup, partMarkup, sampleTrack, EASE };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.Goran = api;
})(typeof window !== 'undefined' ? window : globalThis);
