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
