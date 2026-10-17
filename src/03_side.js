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
