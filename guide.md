# p5.waves Guide (v2.0.0)

A gentle, practical guide from basics to full play mode.

## Overview

`p5.waves` is a tiny math helper. You give it a single input (`y`) and it gives you a stable offset (`x`, `z`, or both). It does not draw. It does not animate. It simply returns numbers you can use anywhere in your sketch.

### What It's Good For

- Wavy lines and ribbons
- Grids and flow fields
- Subtle motion (breathing, bobbing, swaying)
- Reproducible offsets for layout and generative art
- 3D motion in WEBGL
- Mapping numbers to color, size, rotation, and alpha

### What It Does Not Do

- It does not manage time. You control time by changing the input.
- It does not edit or add new formulas at runtime.
- It does not draw shapes or manage sprites.

### Mental Model

Think of a wave preset as a tiny formula: `algo(x) -> number`. You pass `y`, the library treats it as `x`, and returns a number. You decide how to use it: shift a point, rotate a shape, drive color, or build a flow field.

## Quick Start (Global Mode)

### HTML

```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.1.1/lib/p5.js"></script>
<script src="p5.waves.min.js"></script>
```

### Sketch

```js
function setup() {
  createCanvas(400, 200);
  noFill();
  stroke(20);
}

function draw() {
  background(240);
  beginShape();
  for (let y = 0; y <= height; y += 4) {
    const x = Waves.wave(y + frameCount * 0.02, 'classicSine', null, { amplitude: 80 });
    vertex(width / 2 + x, y);
  }
  endShape();
}
```

## Basics

1. The simplest call:

```js
const x = Waves.wave(40, 'classicSine');
```

2. Make it bigger (amplitude):

```js
const x = Waves.wave(40, 'classicSine', null, { amplitude: 120 });
```

3. Animate it:

```js
let t = 0;
const x = Waves.wave(40 + t, 'classicSine');
t += 0.02;
```

4. Return both axes (`x` and `z`):

```js
const o = Waves.wave(40, 'classicSine', null, { axis: 'xz', amplitude: 60 });
// o = { x, z }
```

5. Instance mode:

```js
new p5(function (p) {
  p.draw = function () {
    const x = p.waves(40, 'classicSine');
  };
});
```

## Choosing Waves

You can select a wave by:

- Wave name (string)
- Shape name (string)
- Index (number)

Matching is case-insensitive, and spaces/hyphens are ignored.

### Examples

```js
Waves.wave(20, 'classicSine');
Waves.wave(20, 'Classic Sine');
Waves.wave(20, 'ellipse');
Waves.wave(20, 0);
```

Tip: if you want to avoid breaking changes in saved projects, store the wave string, not the index.

## Workflows

### 1) Simple Line

Use the wave output as an X offset for a vertical line:

```js
for (let y = 0; y < height; y += 6) {
  const x = Waves.wave(y + t, 'classicSine', null, { amplitude: 80 });
  point(width / 2 + x, y);
}
```

### 2) Grid / WEBGL

Use the wave output as XZ offsets for a 3D grid:

```js
const o = Waves.wave(y + t, 'classicSine', null, { axis: 'xz', amplitude: 60 });
translate(x + o.x, 0, y + o.z);
```

### 3) Color Pattern

Map the wave output into color values:

```js
const w = Waves.wave(y + t, 'classicSine', null, {
  amplitude: 1,
  normalize: true,
  range: [0, 1]
});
const hue = 200 + w * 120;
stroke(hue, 80, 90);
```

### 4) Flow Field (Direction Map)

Use the wave as an angle that turns a vector field:

```js
const angle = Waves.wave(x + y + t, 'classicSine', null, { amplitude: TWO_PI });
const v = p5.Vector.fromAngle(angle);
line(x, y, x + v.x * 10, y + v.y * 10);
```

### 5) Rotation / Oscillation

Rotate shapes using the wave output:

```js
const r = Waves.wave(y + t, 'classicSine', null, { amplitude: PI / 6 });
rotate(r);
```

### 6) Motion Path

Use wave output as a path offset:

```js
const rowY = i * 10;
const x = centerX + Waves.wave(rowY + t, 'classicSine', null, { amplitude: 60 });
circle(x, rowY, 4);
```

### 7) Particles

Use wave output as a force or drift:

```js
const drift = Waves.wave(p.y + t, 'classicSine', null, { amplitude: 0.6 });
p.vx += drift;
```

### 8) Ribbon / Strip

Use wave output to offset a polyline, then draw as a strip:

```js
beginShape(TRIANGLE_STRIP);
for (let y = 0; y <= height; y += 8) {
  const x = Waves.wave(y + t, 'classicSine', null, { amplitude: 50 });
  vertex(cx + x - 8, y);
  vertex(cx + x + 8, y);
}
endShape();
```

### 9) Terrain / Height Map

Use wave output as a height:

```js
const h = Waves.wave(x + t, 'classicSine', null, { amplitude: 40 });
vertex(x, h, y);
```

### 10) Typography / Baseline Wave

Shift text positions by a wave:

```js
const offset = Waves.wave(i * 20 + t, 'classicSine', null, { amplitude: 12 });
text(char, x, y + offset);
```

### 11) Audio-Reactive (Optional)

If you use `p5.sound`, you can modulate amplitude by volume:

```js
const amp = mic.getLevel() * 200 + 20;
const x = Waves.wave(y + t, 'classicSine', null, { amplitude: amp });
```

### 12) Full Play Mode (Interactive Sketch)

Use mouse or keyboard to control wave choice and amplitude:

```js
let waveName = 'classicSine';
let amp = 80;

function keyPressed() {
  if (key === '1') waveName = 'classicSine';
  if (key === '2') waveName = 'zigZagSine';
  if (key === '3') waveName = 'triangle';
}

function draw() {
  amp = map(mouseX, 0, width, 20, 160);
  const x = Waves.wave(y + t, waveName, null, { amplitude: amp });
}
```

## Advanced Options

### 1) Normalize + Range

Normalize keeps outputs within a consistent range:

```js
const x = Waves.wave(y, 'classicSine', null, {
  normalize: true,
  range: [-1, 1]
});
```

### 2) Domain and Samples

Domain and samples control internal sampling and normalization:

```js
const x = Waves.wave(y, 'classicSine', null, {
  normalize: true,
  domain: [-300, 300],
  samples: 512
});
```

### 3) Auto-Advance with Seconds

Every `N` seconds, the wave changes based on refresh:

```js
const x = Waves.wave(y, 'classicSine', 2, { amplitude: 80 });
```

### 4) Refresh (Deterministic Shifts)

Refresh lets you change the phase or pick different waves:

```js
const x = Waves.wave(y, 'classicSine', null, { refresh: 5 });
```

### 5) Use a Sampler for Speed

```js
const sampler = Waves.createSampler({ axis: 'xz', amplitude: 60 });
const o = sampler.sample(y);
```

## Troubleshooting

- If outputs look too small, increase amplitude.
- If outputs explode, reduce amplitude or normalize.
- If a name does not match, try a different alias or index.
- If you want deterministic results across sessions, fix `refresh`.

## Recap

- Use `Waves.wave()` for simple sampling.
- Animate by changing the input.
- Use `axis: 'xz'` for WEBGL grids and flow fields.
- Map outputs to color, rotation, size, or position.
- Store wave names (strings) in saved projects.
