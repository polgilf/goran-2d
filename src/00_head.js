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
