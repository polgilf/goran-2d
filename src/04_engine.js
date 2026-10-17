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
