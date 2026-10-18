/*!
 * Goran v2 — personaje 2D por piezas con rig, IK y expresiones. Sin dependencias.
 * Uso: carga goran.js con una etiqueta script → window.Goran   (también CommonJS)
 *
 * Convenciones
 *  - Vista frontal/espalda: eje x = 225, suelo y = 680, 1 cabeza ≈ 81 u (≈ 7,9 cabezas de alto).
 *  - Vista de perfil (mira a la izquierda): mismas alturas; su eje vertical está en x ≈ 580 del espacio de rig.
 *  - "R" = derecha anatómica de Goran (izquierda del espectador en la vista frontal); "L" = su izquierda.
 *  - Cada pieza es un <g data-part> hermano de las demás, dibujado en el orden de capas de su vista (VIEWS[v].layers)
 *    con su matriz de mundo: la jerarquía decide cómo se mueve y las capas qué tapa a qué. Canales por pieza:
 *    a (grados, horario), dx, dy, sx, sy, qx/qy (escala solo del dibujo de la pieza, sin arrastrar a los hijos),
 *    k (escorzo a lo largo del hueso), o (opacidad, se hereda), v (variante de dibujo).
 *  - IK de dos huesos plano o 3D: con z (profundidad del objetivo) y polo del codo (px, py, pz) se resuelve en 3D y se
 *    proyecta, de modo que el codo no da la vuelta y el hueso que apunta al espectador se escorza (k).
 */
(function (root) {
  'use strict';
