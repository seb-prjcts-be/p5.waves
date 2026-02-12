# p5.waves Guide (v2.0.0)

A practical guide written in plain language, from first call to more playful sketches.

## Welcome

If you are still learning, this is the right place to start.

`p5.waves` is intentionally small:

- You give it one input number (`y`).
- It gives you back an offset (`x`, `z`, or both).
- You decide what to do with that number (move points, rotate shapes, change color, etc.).

That is it. No hidden magic. No scene management. No drawing engine.

## In One Sentence

`Waves.wave(y, select, seconds, axisOrOptions)` returns a wave-based value you can plug into your own drawing code.

## What This Library Is Good For

- Wavy lines and ribbons
- Grids and flow fields
- Gentle motion (breathing, bobbing, swaying)
- Repeatable offsets for generative layouts
- 3D motion in WEBGL
- Mapping values to color, size, alpha, and rotation

## What This Library Does Not Do

- It does not draw anything by itself.
- It does not manage animation time for you.
- It does not edit or add formulas at runtime.

If your sketch is static, `p5.waves` is static too. If you animate your input over time, your output moves.

## Mental Model (Simple)

Think of each wave as a small formula:

`algo(input) -> number`

You pass an input (`y`), and the library returns a number.
You then use that number however you want:

- Add it to `x`
- Add it to `z`
- Turn it into an angle
- Turn it into color/brightness/size

## Quick Start (Global Mode)

### 1) Include scripts

```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.1.1/lib/p5.js"></script>
<script src="p5.waves.min.js"></script>
```

### 2) Minimal sketch

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

If this runs, your setup is correct.

## First Five Experiments

These are safe first steps. Try one at a time.

### 1) The simplest call

```js
const x = Waves.wave(40, 'classicSine');
```

### 2) Make the effect larger (`amplitude`)

```js
const x = Waves.wave(40, 'classicSine', null, { amplitude: 120 });
```

### 3) Animate by changing input

```js
let t = 0;
const x = Waves.wave(40 + t, 'classicSine');
t += 0.02;
```

### 4) Return both axes (`x` and `z`)

```js
const o = Waves.wave(40, 'classicSine', null, { axis: 'xz', amplitude: 60 });
// o = { x, z }
```

### 5) Instance mode (`p5` instance)

```js
new p5(function (p) {
  p.draw = function () {
    const x = p.waves(40, 'classicSine');
  };
});
```

## Choosing Waves (Without Stress)

You can select a wave by:

- Wave name (string)
- Shape name (string)
- Index (number)

Matching is case-insensitive, and spaces/hyphens are ignored.

```js
Waves.wave(20, 'classicSine');
Waves.wave(20, 'Classic Sine');
Waves.wave(20, 'ellipse');
Waves.wave(20, 0);
```

Recommendation: store the wave string in saved projects, not the index.
That makes projects less fragile if order changes later.

## Gentle Defaults

If you are unsure where to start, these values are usually friendly:

- `select: 'classicSine'`
- `axis: 'x'`
- `amplitude: 60` to `120`
- `normalize: false`
- Add time with a small increment like `t += 0.01` or `t += 0.02`

## Practical Workflows

### 1) Simple line

Use wave output as an X offset for a vertical line.

```js
for (let y = 0; y < height; y += 6) {
  const x = Waves.wave(y + t, 'classicSine', null, { amplitude: 80 });
  point(width / 2 + x, y);
}
```

### 2) Grid / WEBGL

Use wave output as XZ offsets in 3D.

```js
const o = Waves.wave(y + t, 'classicSine', null, { axis: 'xz', amplitude: 60 });
translate(x + o.x, 0, y + o.z);
```

### 3) Color pattern

Map wave output into color values.

```js
const w = Waves.wave(y + t, 'classicSine', null, {
  amplitude: 1,
  normalize: true,
  range: [0, 1]
});
const hue = 200 + w * 120;
stroke(hue, 80, 90);
```

### 4) Flow field (direction map)

Use wave output as an angle.

```js
const angle = Waves.wave(x + y + t, 'classicSine', null, { amplitude: TWO_PI });
const v = p5.Vector.fromAngle(angle);
line(x, y, x + v.x * 10, y + v.y * 10);
```

### 5) Rotation / oscillation

Use wave output to rotate shapes.

```js
const r = Waves.wave(y + t, 'classicSine', null, { amplitude: PI / 6 });
rotate(r);
```

### 6) Motion path

Use wave output as a path offset.

```js
const rowY = i * 10;
const x = centerX + Waves.wave(rowY + t, 'classicSine', null, { amplitude: 60 });
circle(x, rowY, 4);
```

### 7) Particles

Use wave output as drift or force.

```js
const drift = Waves.wave(p.y + t, 'classicSine', null, { amplitude: 0.6 });
p.vx += drift;
```

### 8) Ribbon / strip

Offset a polyline and draw it as a strip.

```js
beginShape(TRIANGLE_STRIP);
for (let y = 0; y <= height; y += 8) {
  const x = Waves.wave(y + t, 'classicSine', null, { amplitude: 50 });
  vertex(cx + x - 8, y);
  vertex(cx + x + 8, y);
}
endShape();
```

### 9) Terrain / height map

Use wave output as height.

```js
const h = Waves.wave(x + t, 'classicSine', null, { amplitude: 40 });
vertex(x, h, y);
```

### 10) Typography / baseline wave

Shift text positions with a wave.

```js
const offset = Waves.wave(i * 20 + t, 'classicSine', null, { amplitude: 12 });
text(char, x, y + offset);
```

### 11) Audio-reactive (optional)

If you use `p5.sound`, map mic level to amplitude.

```js
const amp = mic.getLevel() * 200 + 20;
const x = Waves.wave(y + t, 'classicSine', null, { amplitude: amp });
```

### 12) Full play mode (interactive sketch)

Use mouse/keyboard to switch wave behavior live.

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

## Advanced Options (When You Need More Control)

### 1) Normalize + range

Normalize for a stable output range.

```js
const x = Waves.wave(y, 'classicSine', null, {
  normalize: true,
  range: [-1, 1]
});
```

### 2) Domain and samples

Tune how sampling/normalization is evaluated.

```js
const x = Waves.wave(y, 'classicSine', null, {
  normalize: true,
  domain: [-300, 300],
  samples: 512
});
```

### 3) Auto-advance with seconds

Change refresh/wave automatically every `N` seconds.

```js
const x = Waves.wave(y, 'classicSine', 2, { amplitude: 80 });
```

### 4) Refresh (deterministic shifts)

Use `refresh` when you need repeatable variation.

```js
const x = Waves.wave(y, 'classicSine', null, { refresh: 5 });
```

### 5) Use a sampler for speed/reuse

```js
const sampler = Waves.createSampler({ axis: 'xz', amplitude: 60 });
const o = sampler.sample(y);
```

## Troubleshooting

- Output too small: increase `amplitude`.
- Output too strong: reduce `amplitude` or use `normalize`.
- A wave name does not match: try another alias or use index.
- Motion looks random between sessions: set a fixed `refresh`.
- Nothing moves: remember to animate input (`y + t`) and increment `t`.

## A Calm Learning Path

If you are new, this order works well:

1. Draw one static line with `Waves.wave()`.
2. Add `t` and animate slowly.
3. Try `amplitude` from `40` to `120`.
4. Switch one wave name.
5. Then try `axis: 'xz'` in WEBGL.

Do one change at a time and keep a working version. Small steps make debugging much easier.

## Recap

- `Waves.wave()` gives you numbers, not drawings.
- You control time by changing input values.
- `amplitude` controls strength.
- `axis: 'xz'` returns `{ x, z }` for 3D-style motion.
- Store wave names (strings) when saving presets/projects.

You can build a lot with this library by combining one idea at a time.
