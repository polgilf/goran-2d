# Goran · 2D model

Character sheet and animation rig for **Goran**, drawn as layered SVG and driven by a small dependency-free JavaScript engine.

**Live site:** https://polgilf.github.io/goran-2d/

The page (in Spanish) includes an interactive stage with front, side and back views, a head-unit turnaround, the six key poses of the rock lift, five facial expressions, props, the palette by material, a gallery of every rig piece, and the rig reference.

## What's in the rig

- **Front / back view:** 39 pieces (36 body parts plus the hammer, flask and rock). The back view reuses the front rig mirrored, so every front animation also plays from behind.
- **Side view:** 34 pieces, with the far arm and leg drawn behind and darkened.
- **Two-bone IK** for `armR`, `armL`, `legR`, `legL`, with optional "keep foot flat" and targets relative to another piece (the rock).
- **Variants:** expressions (`neutral`, `contento`, `confundido`, `esfuerzo`, `resoplido`) and hand shapes (`relax`, `fist`, `grip`).
- **Animations:** `idle`, `liftRock`, `wave` (front/back) and `idle`, `walk` (side).

Conventions: front/back axis at x = 225, ground at y = 680, one head ≈ 81 units (≈ 7.9 heads tall). `R` is Goran's anatomical right (viewer's left in the front view).

## Use it in your own page

```html
<div id="goran" style="width:420px"></div>
<script src="https://polgilf.github.io/goran-2d/js/goran.js"></script>
<script>
  const g = Goran.create(document.getElementById('goran'), { view: 'front', viewBox: 'action' });
  g.play('liftRock');
  g.setExpression('esfuerzo');
  g.equip('hammer', true);
  g.seek('liftRock', 0.5);   // freeze a frame (t from 0 to 1)

  // Manual pose with IK: the left hand reaches a point in world space
  g.pose({ head: { a: -6 }, handL: { v: 'grip' } }, { ik: { armL: { x: 380, y: 120, w: 1 } } });
</script>
```

Animations are plain data in `Goran.ANIMS[view][name]`:

```js
Goran.ANIMS.front.myMove = {
  duration: 1800, then: 'idle',
  tracks: { torso: [[0, {}], [0.5, { a: -4, qy: 1.02 }], [1, {}]] },   // per-piece keys: a, dx, dy, sx, sy, qx, qy, o, v
  ik: { armR: [[0, { x: 79, y: 374, w: 0 }], [0.5, { x: 70, y: 150, w: 1 }], [1, { x: 79, y: 374, w: 0 }]] },
  expr: [[0, 'neutral'], [0.4, 'contento']]
};
```

## Project layout

| Path | Contents |
| --- | --- |
| `index.html`, `css/styles.css`, `js/app.js` | The character sheet page |
| `js/goran.js` | Built library (art, rigs, engine, animations) |
| `src/` | Library source modules, concatenated in order |
| `build.mjs` | Rebuilds `js/goran.js` from `src/`: `node build.mjs` |
| `media/goran_levantamiento_roca.mp4` | Rendered clip of the rock lift (1080×1920, 30 fps) |

## Local preview

No build step is needed to view the site. Serve the folder with any static server, for example `python3 -m http.server`, and open http://localhost:8000.
