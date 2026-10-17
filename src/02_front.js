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
