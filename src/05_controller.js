  // ═══════════════════════════ VISTAS Y CONTROLADOR ═══════════════════════════
  // axis = eje del hueso en reposo (hacia la articulación siguiente de su cadena); lo usa el escorzo k.
  function normRig(def, chains) {
    const rig = def.map(([id, parent, pivot, name, o]) => ({ id, parent, pivot, name, m: o && o.m, src: o && o.src, tx: (o && o.tx) || 0, dim: !!(o && o.dim), w: !!(o && o.w), h: !!(o && o.h), axis: [0, 1] }));
    const by = {}; rig.forEach(p => { by[p.id] = p; });
    Object.keys(chains).forEach(c => chains[c].bones.slice(0, 2).forEach((b, i) => {
      const a = by[b].pivot, e = by[chains[c].bones[i + 1]].pivot, l = Math.hypot(e[0] - a[0], e[1] - a[1]);
      by[b].axis = [(e[0] - a[0]) / l, (e[1] - a[1]) / l];
    }));
    return rig;
  }
  // Orden completo: el de la vista, más cualquier pieza del rig que falte (al frente, en orden de definición).
  const fullLayers = (rig, order) => order.filter(id => rig.some(p => p.id === id)).concat(rig.map(p => p.id).filter(id => !order.includes(id)));
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
  const RIG_FRONT = normRig(R_FRONT, CHAINS_FRONT), RIG_SIDE = normRig(R_SIDE, CHAINS_SIDE);
  const VIEWS = {
    front: { rig: RIG_FRONT, chains: CHAINS_FRONT, layers: fullLayers(RIG_FRONT, LAYERS_FRONT), art: F, kind: 'front', wrap: ID, explode: EXPLODE_FRONT, expr: EXPR_FRONT,
      viewBox: { rest: '22 22 406 668', action: '-40 -170 530 866', head: '170 24 110 116' } },
    back: { rig: RIG_FRONT, chains: CHAINS_FRONT, layers: fullLayers(RIG_FRONT, LAYERS_BACK), layerRules: RULES_BACK, art: F, kind: 'back', wrap: [-1, 0, 0, 1, 450, 0],
      explode: EXPLODE_FRONT, expr: EXPR_FRONT, viewBox: { rest: '22 22 406 668', action: '-40 -170 530 866', head: '170 24 110 116' } },
    side: { rig: RIG_SIDE, chains: CHAINS_SIDE, layers: fullLayers(RIG_SIDE, LAYERS_SIDE), art: S, kind: 'side', wrap: [1, 0, 0, 1, -355, 0], explode: EXPLODE_SIDE,
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
  // Cada pieza es un <g data-part> hermano de las demás, en el orden de capas de la vista; el motor le pone su matriz de mundo.
  function buildMarkup(viewName, opts) {
    opts = opts || {};
    const V = VIEWS[viewName];
    _uid = 0; _pre = opts.idPrefix || ('gr' + (++instances) + '_');
    const by = {}; V.rig.forEach(p => { by[p.id] = p; });
    const parts = V.layers.map(id => {
      const p = by[id], fn = V.art[p.src || p.m || p.id];
      const art = fn ? fn(V.kind, !!p.m) : '';
      let inner = (art && typeof art === 'object')
        ? Object.keys(art).map((k, i) => `<g data-v="${k}"${i ? ' display="none"' : ''}>${art[k]}</g>`).join('')
        : (art || '');
      if (p.m) inner = `<g transform="matrix(-1 0 0 1 450 0)">${inner}</g>`;
      if (p.tx) inner = `<g transform="translate(${p.tx} 0)">${inner}</g>`;
      if (p.dim) inner = `<g style="filter:brightness(.74) saturate(.92)">${inner}</g>`;
      return `<g data-part="${p.id}"${p.h ? ' opacity="0"' : ''}><g data-art="1">${inner}</g></g>`;
    }).join('');
    const vb = V.viewBox[opts.viewBox || 'rest'] || opts.viewBox || V.viewBox.rest;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="Goran"${opts.className ? ` class="${opts.className}"` : ''}>` +
      `<g data-wrap="1" transform="matrix(${V.wrap.join(' ')})">${parts}</g></svg>`;
  }

  /**
   * Crea a Goran en `container`.
   * opts: { view: 'front'|'back'|'side', viewBox: 'rest'|'action'|'head'|string, expression, equip: {hammer, flask} }
   * Devuelve: { svg, view, nodes, rig, pose(states, {ik, flat, layers}), play(name, {speed, onEnd, onFrame, chain}), seek(name, t), stop(),
   *             setExpression(name), equip(prop, on), setExplode(k), pivots(), world(id) }
   */
  function create(container, opts) {
    opts = opts || {};
    const view = opts.view || 'front', V = VIEWS[view];
    container.insertAdjacentHTML('beforeend', buildMarkup(view, opts));
    const svg = container.lastElementChild, wrapEl = svg.querySelector('[data-wrap]');
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
    let zState = null, zKey = '';
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

    // L = matriz local, W = de mundo, A = solo del dibujo (q/k), O = opacidad acumulada (la de los padres se hereda)
    function world(st) {
      const L = {}, W = {}, A = {}, O = {};
      V.rig.forEach(p => {
        const s = st[p.id];
        A[p.id] = artM(p, s);
        let ox = 0, oy = 0;
        if (p.parent) { const q = ap(A[p.parent], p.pivot[0], p.pivot[1]); ox = q[0] - p.pivot[0]; oy = q[1] - p.pivot[1]; }
        let lm = localM(p.pivot, s, ox, oy);
        if (p.w && p.parent) lm = mul(inv(W[p.parent]), localM(p.pivot, s, 0, 0));
        L[p.id] = lm; W[p.id] = p.parent ? mul(W[p.parent], lm) : lm;
        O[p.id] = Math.max(0, Math.min(1, s.o)) * (p.parent ? O[p.parent] : 1);
      });
      return { L, W, A, O };
    }

    // IK de dos huesos. Sin z ni polo: plano, el codo/rodilla se dobla hacia el lado `bend` de la cadena.
    // Con z (profundidad del objetivo, + hacia el espectador) o polo (px, py, pz: hacia dónde apunta el codo),
    // se resuelve en 3D y se proyecta: el codo nunca da la vuelta y el hueso que sale del plano se acorta (canal k).
    function solve(chainName, t, st, M) {
      const ch = V.chains[chainName], w = t.w == null ? 1 : t.w;
      if (!ch || !w) return;
      const [u, f, h] = ch.bones, par = rig[u].parent;
      const Pw = M.W[par], Pi = inv(Pw), T = ap(Pi, t.x, t.y);
      const pu = rig[u].pivot, pf = rig[f].pivot, ph = rig[h].pivot;
      const S = ap(M.L[u], pu[0], pu[1]);
      const u0 = [pf[0] - pu[0], pf[1] - pu[1]], f0 = [ph[0] - pf[0], ph[1] - pf[1]];
      const L1 = Math.hypot(u0[0], u0[1]), L2 = Math.hypot(f0[0], f0[1]);
      let E, H, k1 = 1, k2 = 1;
      if (t.z == null && t.px == null && t.py == null && t.pz == null) {
        const dx = T[0] - S[0], dy = T[1] - S[1];
        const D = Math.min(L1 + L2 - 0.01, Math.max(Math.abs(L1 - L2) + 0.01, Math.hypot(dx, dy)));
        const baseA = Math.atan2(dy, dx), A = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + D * D - L2 * L2) / (2 * L1 * D))));
        const cands = [baseA + A, baseA - A].map(t1 => {
          const e = [S[0] + Math.cos(t1) * L1, S[1] + Math.sin(t1) * L1];
          return { e, xw: ap(Pw, e[0], e[1])[0] };
        });
        E = (cands[0].xw * ch.bend >= cands[1].xw * ch.bend ? cands[0] : cands[1]).e;
        const t2 = Math.atan2(T[1] - E[1], T[0] - E[0]);
        H = [E[0] + Math.cos(t2) * L2, E[1] + Math.sin(t2) * L2];
      } else {
        const z = t.z || 0, D = [T[0] - S[0], T[1] - S[1], z], d0 = Math.hypot(D[0], D[1], D[2]) || 1e-6;
        const d = Math.min(L1 + L2 - 0.01, Math.max(Math.abs(L1 - L2) + 0.01, d0));
        const n = [D[0] / d0, D[1] / d0, D[2] / d0];
        const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), r = Math.sqrt(Math.max(0, L1 * L1 - a * a));
        let px = t.px || 0, py = t.py || 0;
        const pz = t.pz || 0;
        if (!px && !py && !pz) px = ch.bend;
        let P = [Pi[0] * px + Pi[2] * py, Pi[1] * px + Pi[3] * py, pz];
        const pn = P[0] * n[0] + P[1] * n[1] + P[2] * n[2];
        P = [P[0] - pn * n[0], P[1] - pn * n[1], P[2] - pn * n[2]];
        let pl = Math.hypot(P[0], P[1], P[2]);
        if (pl < 1e-6) { P = [-n[1], n[0], 0]; pl = Math.hypot(P[0], P[1]) || 1; }
        const E3 = [S[0] + n[0] * a + P[0] / pl * r, S[1] + n[1] * a + P[1] / pl * r, n[2] * a + P[2] / pl * r];
        const Fv = [T[0] - E3[0], T[1] - E3[1], z - E3[2]], fl = Math.hypot(Fv[0], Fv[1], Fv[2]) || 1e-6;
        E = [E3[0], E3[1]]; H = [E3[0] + Fv[0] / fl * L2, E3[1] + Fv[1] / fl * L2];
        k1 = Math.max(0.05, Math.hypot(E[0] - S[0], E[1] - S[1]) / L1);
        k2 = Math.max(0.05, Math.hypot(H[0] - E[0], H[1] - E[1]) / L2);
      }
      const aU = (Math.atan2(E[1] - S[1], E[0] - S[0]) - Math.atan2(u0[1], u0[0])) / D2R;
      const aF = (Math.atan2(H[1] - E[1], H[0] - E[0]) - Math.atan2(f0[1], f0[0])) / D2R - aU;
      st[u].a = lerpA(st[u].a, normA(aU), w);
      st[f].a = lerpA(st[f].a, normA(aF), w);
      st[u].k += (k1 - st[u].k) * w; st[f].k += (k2 - st[f].k) * w;
    }

    // Reordena las capas solo cuando cambia el estado ({grupo: estado}, p. ej. { armR: 'fore' })
    function setLayers(state) {
      if (state === zState) return;
      zState = state;
      const key = state && Object.keys(state).length ? JSON.stringify(state) : '';
      if (key === zKey) return;
      zKey = key;
      layerOrder(V, state).forEach(id => wrapEl.appendChild(nodes[id]));
    }

    const r4 = v => Math.round(v * 1e4) / 1e4;
    function render(anim) {
      last = anim;
      const st = compose(anim);
      let M = world(st);
      const ik = anim.ik || {};
      const keys = Object.keys(ik);
      if (keys.length) {
        keys.forEach(k => {
          const t = Object.assign({}, ik[k]);
          if (t.rel) { const rp = ap(M.W[t.rel], rig[t.rel].pivot[0], rig[t.rel].pivot[1]); t.x += rp[0]; t.y += rp[1]; }
          solve(k, t, st, M);
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
      setLayers(anim.layers);
      V.rig.forEach(p => {
        const s = st[p.id], W = M.W[p.id], A = M.A[p.id];
        const tr = `matrix(${W.map(r4).join(' ')})`;
        const c = cache[p.id] || (cache[p.id] = {});
        if (c.tr !== tr) { nodes[p.id].setAttribute('transform', tr); c.tr = tr; }
        const q = (A[0] !== 1 || A[1] !== 0 || A[2] !== 0 || A[3] !== 1) ? `matrix(${A.map(r4).join(' ')})` : '';
        if (c.q !== q) { if (q) arts[p.id].setAttribute('transform', q); else arts[p.id].removeAttribute('transform'); c.q = q; }
        const o = M.O[p.id].toFixed(3);
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
      Object.keys(A.ik || {}).forEach(k => { ik[k] = Object.assign(sampleTrack(A.ik[k], t), { rel: A.ikRel && A.ikRel[k] }); });
      Object.keys(A.flat || {}).forEach(id => { flat[id] = typeof A.flat[id] === 'number' ? A.flat[id] : sampleTrack(A.flat[id], t).w; });
      return { st, ik, flat, ex: A.expr ? sampleDiscrete(A.expr, t) : null, layers: A.layers ? sampleDiscrete(A.layers, t) : null };
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
      pose(states, extra) { stop(); extra = extra || {}; render({ st: states || {}, ik: extra.ik || {}, flat: extra.flat || {}, ex: extra.expression, layers: extra.layers }); },
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
