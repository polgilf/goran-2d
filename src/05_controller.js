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
