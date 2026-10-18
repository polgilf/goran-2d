(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const G = Goran;
  const HEAD = 81, TOP = 37, GROUND = 680;
  const VIEW_NAMES = { front: 'Vista frontal', side: 'Vista de perfil', back: 'Vista de espalda' };
  const ANIM_NAMES = { idle: 'Reposo', liftRock: 'Levantar roca', wave: 'Saludar', walk: 'Andar' };
  const EXPR_NAMES = { neutral: 'Neutro', contento: 'Contento', confundido: 'Confundido', esfuerzo: 'Esfuerzo', resoplido: 'Resoplido' };
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function headGrid(svg, x0, x1, opts) {
    opts = opts || {};
    const g = document.createElementNS(NS, 'g');
    let m = '';
    for (let k = 0; k <= 8; k++) {
      const y = TOP + k * HEAD;
      if (y > GROUND + 1) break;
      m += `<line x1="${x0}" x2="${x1}" y1="${y}" y2="${y}" stroke="var(--blue)" stroke-width="${k ? .8 : 1.1}" stroke-dasharray="${k ? '4 5' : ''}" opacity=".6"/>`;
      if (!opts.nolabels && TOP + (k + 1) * HEAD <= GROUND + 30) m += `<text x="${x1 - 4}" y="${y + HEAD / 2 + 4}" font-family="IBM Plex Mono, monospace" font-size="12" fill="var(--blue)" text-anchor="end">${k + 1}</text>`;
    }
    m += `<line x1="${x0}" x2="${x1}" y1="${GROUND}" y2="${GROUND}" stroke="var(--blue)" stroke-width="1.4"/>`;
    g.innerHTML = m;
    svg.insertBefore(g, svg.firstChild);
    return g;
  }

  // ─────────────── Escenario ───────────────
  const stage = document.getElementById('stage');
  let view = 'front', g = null, grid = null, piv = null, pivEls = {}, current = 'idle', expression = 'neutral';
  const flags = { grid: true, piv: false, exp: 0, hammer: false, flask: false };
  let hi = null;

  // El escenario mantiene la proporción 530:866; abre plano para la roca o el despiece y lo cierra en reposo
  const VB = { wide: [-40, -170, 530, 866], tight: [10, 6, 430, 702.5] };
  let vbNow = VB.tight.slice(), vbRaf = 0;
  function wantVB() { return (current === 'liftRock' || flags.expOn) ? VB.wide : VB.tight; }
  function tweenVB() {
    cancelAnimationFrame(vbRaf);
    const from = vbNow.slice(), to = wantVB(), t0 = performance.now(), dur = reduce ? 0 : 500;
    (function step(now) {
      const t = dur ? Math.min(1, (now - t0) / dur) : 1, e = 0.5 - 0.5 * Math.cos(Math.PI * t);
      vbNow = from.map((v, i) => v + (to[i] - v) * e);
      if (g) g.svg.setAttribute('viewBox', vbNow.map(v => v.toFixed(2)).join(' '));
      if (t < 1) vbRaf = requestAnimationFrame(step);
    })(t0);
  }
  function buildStage() {
    if (g) { g.stop(); g.svg.remove(); }
    g = G.create(stage, { view, viewBox: vbNow.join(' '), expression });
    grid = headGrid(g.svg, -40, 490);
    grid.style.display = flags.grid ? '' : 'none';
    piv = document.createElementNS(NS, 'g');
    piv.style.display = flags.piv ? '' : 'none';
    g.svg.appendChild(piv);
    pivEls = {};
    Object.keys(g.rig).forEach(id => {
      if (id === 'dust') return;
      const n = document.createElementNS(NS, 'g');
      n.innerHTML = `<circle r="4.5" fill="var(--stage)" stroke="var(--blue)" stroke-width="1.6"/><path d="M-8 0H8M0 -8V8" stroke="var(--blue)" stroke-width="1.1"/><text x="7" y="-6" font-family="IBM Plex Mono, monospace" font-size="10" fill="var(--blue)">${id}</text>`;
      piv.appendChild(n); pivEls[id] = n;
    });
    g.equip('hammer', flags.hammer); g.equip('flask', flags.flask);
    g.setExplode(flags.exp);
    document.getElementById('c-view').textContent = VIEW_NAMES[view];
    buildAnimButtons();
    if (hi) highlight(hi);
  }
  function drawPivots() {
    if (!flags.piv || !g) return;
    g.pivots().forEach(p => { if (pivEls[p.id]) pivEls[p.id].setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`); });
  }
  (function loop() { drawPivots(); requestAnimationFrame(loop); })();

  const scrub = document.getElementById('scrub'), scrubout = document.getElementById('scrubout');
  function setScrub(t) { scrub.value = Math.round(t * 1000); scrubout.textContent = t.toFixed(2); }
  function run(name) {
    current = name; tweenVB();
    document.querySelectorAll('#anims .btn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.anim === name)));
    document.getElementById('c-anim').textContent = ANIM_NAMES[name] || name;
    if (reduce && name !== 'idle') { g.seek(name, 0.5); setScrub(0.5); return; }
    g.play(name, {
      onFrame: (t, n) => {
        if (n !== current) { current = n; tweenVB(); document.querySelectorAll('#anims .btn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.anim === n))); document.getElementById('c-anim').textContent = ANIM_NAMES[n] || n; }
        setScrub(t);
      }
    });
  }
  scrub.addEventListener('input', () => {
    const t = scrub.value / 1000;
    g.seek(current, t); scrubout.textContent = t.toFixed(2);
    document.getElementById('c-anim').textContent = (ANIM_NAMES[current] || current) + ' · pausa';
  });

  function buildAnimButtons() {
    const row = document.getElementById('anims');
    row.querySelectorAll('.btn').forEach(b => b.remove());
    const names = Object.keys(G.ANIMS[view]);
    if (!names.includes(current)) current = 'idle';
    names.forEach(n => {
      const b = document.createElement('button');
      b.className = 'btn'; b.id = 'a-' + n; b.dataset.anim = n; b.textContent = ANIM_NAMES[n] || n;
      b.setAttribute('aria-pressed', String(n === current));
      b.addEventListener('click', () => run(n));
      row.appendChild(b);
    });
  }

  document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => {
    view = b.dataset.view;
    document.querySelectorAll('[data-view]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    buildStage(); buildParts(); run(G.ANIMS[view][current] ? current : 'idle');
  }));

  // Expresiones
  const exprRow = document.getElementById('exprs');
  Object.keys(EXPR_NAMES).forEach(k => {
    const b = document.createElement('button');
    b.className = 'chip'; b.id = 'e-' + k; b.textContent = EXPR_NAMES[k]; b.setAttribute('aria-pressed', String(k === expression));
    b.addEventListener('click', () => {
      expression = k; g.setExpression(k);
      exprRow.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    });
    exprRow.appendChild(b);
  });

  function toggle(id, fn) {
    const b = document.getElementById(id);
    b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); fn(on); });
  }
  toggle('t-grid', on => { flags.grid = on; grid.style.display = on ? '' : 'none'; });
  toggle('t-piv', on => { flags.piv = on; piv.style.display = on ? '' : 'none'; });
  toggle('t-hammer', on => { flags.hammer = on; g.equip('hammer', on); });
  toggle('t-flask', on => { flags.flask = on; g.equip('flask', on); });
  toggle('t-exp', on => {
    const k0 = flags.exp, k1 = on ? 1 : 0, t0 = performance.now();
    (function step(now) {
      const t = Math.min(1, (now - t0) / 450), e = 0.5 - 0.5 * Math.cos(Math.PI * t);
      flags.exp = k0 + (k1 - k0) * e; g.setExplode(flags.exp);
      if (t < 1) requestAnimationFrame(step);
    })(t0);
    flags.expOn = on; tweenVB();
  });

  // ─────────────── Paleta por material ───────────────
  const P = G.PALETTE;
  const MATS = [
    ['Piel', ['skin', 'skinLight', 'skinShade', 'skinDeep']], ['Pelo', ['hair', 'hairLight', 'hairShade', 'hairDeep']], ['Barba', ['beard', 'beardLight']],
    ['Túnica', ['tunic', 'tunicLight', 'tunicShade', 'tunicDeep']], ['Pantalón', ['trousers', 'trousersLight', 'trousersShade', 'trousersDeep']],
    ['Vendas', ['wraps', 'wrapsLight', 'wrapsShade', 'wrapsDeep']], ['Botas', ['boots', 'bootsLight', 'bootsShade', 'sole']],
    ['Fajín', ['sash', 'sashLight', 'sashShade', 'sashDeep']], ['Cuero', ['leather', 'leatherLight', 'leatherShade', 'headband']],
    ['Hierro', ['iron', 'ironLight', 'ironShade', 'ironDeep']], ['Latón', ['brass', 'brassLight', 'brassShade', 'cord']],
    ['Cobre', ['copper', 'copperHi', 'copperLight', 'copperShade']], ['Madera', ['wood', 'woodLight', 'woodShade']],
    ['Piedra', ['stone', 'stoneLight', 'stoneShade', 'stoneDeep']], ['Ojos y boca', ['sclera', 'iris', 'lip', 'teeth']], ['Contorno', ['outline']]
  ];
  document.getElementById('mats').innerHTML = MATS.map(([name, keys]) =>
    `<div class="mat"><span>${name}</span><div class="sw">${keys.map(k => `<i style="background:${P[k]}" title="${k} ${P[k]}"></i>`).join('')}</div><code>${keys.map(k => P[k]).join(' ')}</code></div>`).join('');

  // ─────────────── Giro ───────────────
  const turn = document.getElementById('turn');
  [['front', 'Frente'], ['side', 'Perfil'], ['back', 'Espalda']].forEach(([v, label]) => {
    const fig = document.createElement('figure');
    fig.innerHTML = `<div class="panel"></div><figcaption>${label}</figcaption>`;
    turn.appendChild(fig);
    const inst = G.create(fig.firstChild, { view: v, viewBox: '22 22 406 668' });
    headGrid(inst.svg, 22, 428);
  });

  // ─────────────── Secuencia ───────────────
  const seq = document.getElementById('seq');
  G.KEYPOSES.forEach((k, i) => {
    const fig = document.createElement('figure');
    fig.innerHTML = `<button type="button" id="kp-${k.id}" aria-label="Ver pose ${i + 1}, ${k.name}"><div class="panel"></div></button><figcaption>${i + 1}. ${k.name}<small>t = ${k.t.toFixed(2)}</small></figcaption>`;
    seq.appendChild(fig);
    const inst = G.create(fig.querySelector('.panel'), { view: 'front', viewBox: '-30 -160 510 846' });
    inst.seek('liftRock', k.t);
    fig.querySelector('button').addEventListener('click', () => {
      if (view === 'side') document.getElementById('v-front').click();
      current = 'liftRock'; tweenVB();
      document.querySelectorAll('#anims .btn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.anim === 'liftRock')));
      g.seek('liftRock', k.t); setScrub(k.t);
      document.getElementById('c-anim').textContent = `${i + 1}. ${k.name}`;
      stage.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  });
  document.getElementById('playseq').addEventListener('click', () => {
    if (view === 'side') document.getElementById('v-front').click();
    run('liftRock');
    stage.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  });

  // ─────────────── Expresiones ───────────────
  const busts = document.getElementById('busts');
  Object.keys(EXPR_NAMES).forEach(k => {
    const fig = document.createElement('figure');
    fig.innerHTML = `<div class="panel"></div><figcaption>${EXPR_NAMES[k]}</figcaption>`;
    busts.appendChild(fig);
    G.create(fig.firstChild, { view: 'front', viewBox: '156 20 138 144', expression: k });
  });

  // ─────────────── Props ───────────────
  function isolated(container, viewName, id, variant, pad) {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 10 10');
    svg.innerHTML = G.partMarkup(viewName, id, variant);
    container.appendChild(svg);
    const bb = svg.getBBox(); pad = pad == null ? 8 : pad;
    svg.setAttribute('viewBox', `${(bb.x - pad).toFixed(1)} ${(bb.y - pad).toFixed(1)} ${(bb.width + pad * 2).toFixed(1)} ${(bb.height + pad * 2).toFixed(1)}`);
    return svg;
  }
  const kit = document.getElementById('kit');
  [['hammer', 'Maza', 'mango largo, cabeza remachada'], ['flask', 'Recipiente', 'cobre, asa y tapa'], ['rock', 'Roca', 'Ø ≈ 2 cabezas']].forEach(([id, name, sub]) => {
    const fig = document.createElement('figure');
    fig.innerHTML = `<div class="panel"></div><figcaption>${name}<small>${sub}</small></figcaption>`;
    kit.appendChild(fig);
    isolated(fig.firstChild, 'front', id, null, 10);
  });

  // ─────────────── Piezas ───────────────
  const partsEl = document.getElementById('parts');
  function buildParts() {
    partsEl.innerHTML = '';
    const pv = view === 'back' ? 'front' : view;
    const rig = G.VIEWS[pv].rig.filter(p => p.id !== 'root' && p.id !== 'dust');
    let shown = 0;
    rig.forEach(p => {
      if (!G.partMarkup(pv, p.id).replace(/<\/?g[^>]*>/g, '').trim()) return;
      shown++;
      const b = document.createElement('button');
      b.className = 'pc'; b.type = 'button'; b.id = 'pc-' + p.id; b.setAttribute('aria-pressed', String(hi === p.id));
      b.innerHTML = `<div></div><code>${p.id}</code><small>${p.name}</small>`;
      partsEl.appendChild(b);
      const svg = isolated(b.firstChild, pv, p.id, null, 6);
      const w = pv === 'side' ? [1, 0, 0, 1, -355, 0] : [1, 0, 0, 1, 0, 0];
      const dot = document.createElementNS(NS, 'g');
      dot.setAttribute('transform', `translate(${p.pivot[0] + w[4]} ${p.pivot[1]})`);
      const vbw = svg.viewBox.baseVal, rr = Math.max(vbw.width, vbw.height) / 34;
      dot.innerHTML = `<circle r="${rr.toFixed(2)}" fill="var(--stage)" stroke="var(--blue)" stroke-width="${(rr / 2.4).toFixed(2)}"/>`;
      svg.appendChild(dot);
      b.addEventListener('click', () => {
        const on = b.getAttribute('aria-pressed') !== 'true';
        partsEl.querySelectorAll('.pc').forEach(x => x.setAttribute('aria-pressed', 'false'));
        if (on) b.setAttribute('aria-pressed', 'true');
        highlight(on ? p.id : null);
      });
    });
    document.getElementById('partsnote').textContent = `${shown} piezas con dibujo · vista ${pv === 'side' ? 'de perfil' : 'frontal'} · toca una para aislarla en el escenario`;
  }
  function highlight(id) {
    hi = id;
    Object.entries(g.nodes).forEach(([pid, n]) => {
      n.style.filter = '';
      if (!id || pid === 'root' || !g.rig[id]) return;
      let q = pid, keep = false;
      while (q) { if (q === id) { keep = true; break; } q = g.rig[q].parent; }
      let a = id, anc = false;
      while (a) { if (a === pid) { anc = true; break; } a = g.rig[a].parent; }
      if (!keep && !anc) n.style.filter = 'opacity(.16) saturate(.2)';
    });
  }

  // ─────────────── Rig y uso ───────────────
  const variantsOf = (V, p) => { const fn = V.art[p.src || p.m || p.id]; if (!fn) return ''; const a = fn(V.kind, !!p.m); return (a && typeof a === 'object') ? Object.keys(a).join(', ') : ''; };
  const VF = G.VIEWS.front;
  document.getElementById('rigrows').innerHTML = VF.rig.map(p =>
    `<tr><td><code>${p.id}</code></td><td><code>${p.parent || '—'}</code></td><td><code>${p.pivot.join(', ')}</code></td><td class="n">${variantsOf(VF, p)}</td><td class="n">${p.name}${p.m ? ' · reflejo de ' + p.m : ''}</td></tr>`).join('');

  const usage = `<div id="goran" style="width:420px"></div>
<script src="goran.js"><\/script>
<script>
  const g = Goran.create(document.getElementById('goran'), {
    view: 'front',            // 'front' | 'side' | 'back'
    viewBox: 'action'         // 'rest' | 'action' (deja hueco arriba) | 'head'
  });

  g.play('liftRock');         // frente/espalda: idle, liftRock, wave · perfil: idle, walk
  g.setExpression('esfuerzo'); // neutral, contento, confundido, esfuerzo, resoplido
  g.equip('hammer', true);    // props: hammer, flask
  g.seek('liftRock', 0.5);    // congela un fotograma (t de 0 a 1)

  // Pose a mano con IK: la mano izquierda alcanza un punto del mundo
  g.pose({ head: { a: -6 }, handL: { v: 'grip' } },
         { ik: { armL: { x: 380, y: 120, w: 1 } } });

  // IK 3D: z = profundidad de la mano (+ hacia ti), px/py/pz = hacia dónde apunta el codo
  g.pose({}, { ik: { armL: { x: 300, y: 120, z: 90, px: 1, py: 0.4, pz: 0 } } });

  // Animación propia: solo datos
  Goran.ANIMS.front.flexionar = {
    duration: 1800, then: 'idle',
    tracks: {
      handR: [[0, {}], [0.3, { v: 'fist' }], [0.8, { v: 'fist' }], [1, {}]],
      handL: [[0, {}], [0.3, { v: 'fist' }], [0.8, { v: 'fist' }], [1, {}]],
      torso: [[0, {}], [0.3, { qy: 1.02 }], [0.8, { qy: 1.02 }], [1, {}]]
    },
    ik: {
      armR: [[0, { x: 79, y: 374, w: 0 }], [0.3, { x: 70, y: 150, w: 1 }],
             [0.8, { x: 70, y: 150, w: 1 }], [1, { x: 79, y: 374, w: 0 }]],
      armL: [[0, { x: 371, y: 374, w: 0 }], [0.3, { x: 380, y: 150, w: 1 }],
             [0.8, { x: 380, y: 150, w: 1 }], [1, { x: 371, y: 374, w: 0 }]]
    },
    expr: [[0, 'neutral'], [0.25, 'esfuerzo'], [0.85, 'contento']]
  };
  g.play('flexionar');
<\/script>`;
  document.getElementById('usage').textContent = usage;
  const cb = document.getElementById('copybtn');
  cb.addEventListener('click', () => {
    const done = () => { cb.textContent = 'Copiado'; setTimeout(() => { cb.textContent = 'Copiar'; }, 1400); };
    const sel = () => { const r = document.createRange(); r.selectNodeContents(document.getElementById('usage')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
    try { navigator.clipboard.writeText(usage).then(done, sel); } catch (e) { sel(); }
  });

  buildStage(); buildParts(); run('idle');
})();
