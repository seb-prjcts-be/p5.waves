# p5.waves

Wave sampling helpers for p5.js. Always returns a number.

**Quick Install**
Script tag (CDN):
```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.1.1/lib/p5.js"></script>
<script src="https://cdn.jsdelivr.net/gh/seb-prjcts-be/p5.waves/p5.waves.min.js"></script>
<script src="sketch.js"></script>
```

Script tag (local file):
```html
<script src="p5.js"></script>
<script src="p5.waves.js"></script>
<script src="sketch.js"></script>
```

Load order matters. `p5.js` must load before `p5.waves.js`.

**GitHub Pages Examples**
- Landing page: `https://seb-prjcts-be.github.io/p5.waves/`
- Direct examples: `https://seb-prjcts-be.github.io/p5.waves/examples/00_wave_lab/`
- Deployment is handled by `.github/workflows/pages.yml` on pushes to `fusion/v1-spirit` or `main`.

If Pages is not enabled yet: `Settings` → `Pages` → `Build and deployment` → `Source: GitHub Actions`.

---

## What's New in 2.0.0

**v2 is a complete rewrite. v1 call patterns are not supported.**

- `wave(y, secondParam)` always returns a **number**. No more `{x, z}` objects, no axis parameter.
- Time is **explicit**: pass `t` in options instead of relying on an internal clock.
- `range: [min, max]` replaces the old `normalize + range` combination.
- 34 curated waves with **unique names** (removed 3 near-identical duplicates from v1).
- `createSampler(opts).sample(y, t)` returns a number. Use two samplers for 3D.
- `createGrid(cols, rows, opts).sample(t)` returns `Float32Array` or `Uint8Array`.
- Removed: `setWaveParams`, `setTimeMode`, `tick`, `sample`, `grid`, `seedFrom`, `aliases`, `families`, `getWaveByIndex`, `getWaveByName`, `createGridSampler` (replaced by `createGrid`).
- Removed parameters: `axis`, `refresh`, `seconds`, `normalize` (bool), `domain`, `samples`, `modulation`.

---

## What This Library Does

Gives you a curated list of 34 wave formulas you can sample with a single number input.
Each formula is a small math expression that takes `x`. You pass `y` (your position), and get a number back.

**Mental model**: Think of `wave(y)` the same way you think of `noise(y)` in p5.js — pass a coordinate, get a number.

---

## Wave List (34 entries)

| index | name |
| --- | --- |
| 0 | classic sine |
| 1 | sine |
| 2 | sharp peaks |
| 3 | square |
| 4 | pulse |
| 5 | stepped sine |
| 6 | mountain peaks |
| 7 | valleys |
| 8 | zig-zag sine |
| 9 | batman |
| 10 | offset sine |
| 11 | steps down |
| 12 | steps |
| 13 | squared sine |
| 14 | bumpy sine |
| 15 | wobble sine |
| 16 | up down noise |
| 17 | meta sine |
| 18 | triangle |
| 19 | ramp |
| 20 | saw down |
| 21 | saw up |
| 22 | fade out |
| 23 | grow random |
| 24 | noise |
| 25 | fuzzy pulse |
| 26 | up down pulse |
| 27 | bald patch |
| 28 | fuzzy peak sine |
| 29 | ramp up sine |
| 30 | triangle sine |
| 31 | round linked sine |
| 32 | half sine |
| 33 | smooth solid sine |

---

## Core API

### `Waves.wave(y, secondParam)`

The primary entry point. Always returns a number.

Second parameter forms:

| form | meaning |
| --- | --- |
| `wave(y)` | default wave, seed 0 |
| `wave(y, 3)` | number → seed 3 selects wave |
| `wave(y, 'triangle')` | string → wave by name |
| `wave(y, { wave: 'triangle' })` | options object |

Options (when second param is an object):

| option | description | default |
| --- | --- | --- |
| `wave` | wave name or index | seed-determined |
| `seed` | number for wave selection | `0` |
| `t` | time offset (e.g. `millis()/1000`) | `0` |
| `amplitude` | fast multiply, no normalisation | `1` |
| `range` | `[min, max]` normalises output | `null` (native) |
| `frequency` | input multiplier | `1` |
| `phase` | input offset | `0` |
| `mode` | `'stable'` or `'wild'` | `'stable'` |
| `unpredictability` | `0..1`, wild mode only | `0` |

**Notes:**
- `wave` as a number inside options is a direct **index** (not a seed). `wave(y, 3)` uses 3 as a seed; `wave(y, { wave: 3 })` selects index 3.
- When `range` is specified it normalises the output; `amplitude` is ignored.
- `t` adds to `y` before formula evaluation: `x = (y + t) * frequency + phase`.

Examples:
```js
wave(y)                                          // number, seed 0
wave(y, 3)                                       // seed 3 selects wave
wave(y, 'triangle')                              // wave by name
wave(y, { wave: 'triangle' })                    // options form
wave(y, { wave: 'triangle', range: [-1, 1] })    // normalised
wave(y, { range: [0, 255], t: millis()/1000 })   // with time
wave(y, { seed: 2, amplitude: 80 })              // seed + fast scaling
```

---

### `Waves.createSampler(options)`

Returns a reusable sampler. Accepts the same options as `wave()`.

```js
const s = Waves.createSampler({ wave: 'triangle', range: [-80, 80] });
s.sample(y)         // → number
s.sample(y, t)      // → number with time offset
```

For 3D (two independent values) use two samplers with different seeds:
```js
const sx = Waves.createSampler({ seed: 0 });
const sz = Waves.createSampler({ seed: 1 });

// In draw():
const ox = sx.sample(y, frameCount * 0.01);
const oz = sz.sample(y, frameCount * 0.01);
```

---

### `Waves.createGrid(cols, rows, options)`

Returns a grid sampler. `.sample(t)` returns a typed array.

```js
const g = Waves.createGrid(20, 20);
g.sample(t)   // → Float32Array, length cols×rows, raw values

const g2 = Waves.createGrid(20, 20, { range: [0, 1], threshold: 0.5 });
g2.sample(t)  // → Uint8Array of 0/1 (binary)
```

Grid options:

| option | description | default |
| --- | --- | --- |
| `waveRow` | wave for row direction (name or index) | seed-determined |
| `waveCol` | wave for col direction (name or index) | seed-determined (different) |
| `seed` | number for wave selection | `0` |
| `range` | `[min, max]` → Float32Array normalised | `null` (raw) |
| `threshold` | threshold value → Uint8Array (0/1) | `null` |
| `speed` | time scale factor | `1` |

When `threshold` is given, `range` is ignored and a `Uint8Array` is returned.

---

### Discovery

```js
Waves.list()   // → [{ index, name, algo }, ...]
Waves.count    // → 34
Waves.data     // → raw WAVES array [{ name, algo }, ...]
```

---

### p5 Prototype Methods

Added to `p5.prototype` when p5.js is loaded first.

```js
p.waves(y, secondParam)            // → Waves.wave(y, secondParam)
p.createWaveSampler(opts)          // → Waves.createSampler(opts)
p.createWaveGrid(cols, rows, opts) // → Waves.createGrid(cols, rows, opts)
```

In global mode these are also available without `p.`.

---

## Usage Patterns

**Global mode — basic wave:**
```js
function setup() {
  createCanvas(400, 200);
  noFill();
  stroke(0);
}

function draw() {
  background(245);
  beginShape();
  for (let y = 0; y <= height; y += 4) {
    const x = width / 2 + Waves.wave(y, {
      wave:      'classic sine',
      t:         frameCount * 0.5,
      amplitude: 80
    });
    vertex(x, y);
  }
  endShape();
}
```

**With range normalisation:**
```js
for (let y = 0; y < height; y += 10) {
  const x = Waves.wave(y, {
    wave:  'classic sine',
    t:     frameCount * 0.01,
    range: [-120, 120]
  });
  circle(width / 2 + x, y, 5);
}
```

**Range [0, 1] — use as a position fraction:**
```js
for (let y = 0; y < height; y += 10) {
  const x01 = Waves.wave(y, {
    wave:  'classic sine',
    t:     frameCount * 0.01,
    range: [0, 1]
  });
  circle(x01 * width, y, 5);
}
```

**Instance mode:**
```js
new p5(function (p) {
  p.setup = function () {
    p.createCanvas(400, 200);
    p.noFill();
    p.stroke(0);
  };

  p.draw = function () {
    p.background(245);
    p.beginShape();
    for (let y = 0; y <= p.height; y += 4) {
      const x = p.width / 2 + p.waves(y, {
        wave:      'classic sine',
        t:         p.frameCount * 0.5,
        amplitude: 80
      });
      p.vertex(x, y);
    }
    p.endShape();
  };
});
```

**WEBGL — two samplers for x/z offsets:**
```js
let samplerX, samplerZ;

function setup() {
  createCanvas(600, 600, WEBGL);
  noStroke();
  fill(0);
  samplerX = Waves.createSampler({ seed: 0, range: [-80, 80] });
  samplerZ = Waves.createSampler({ seed: 1, range: [-80, 80] });
}

function draw() {
  background(245);
  rotateY(frameCount * 0.01);
  const t = frameCount * 0.01;
  for (let y = -200; y <= 200; y += 30) {
    for (let x = -200; x <= 200; x += 30) {
      const ox = samplerX.sample(y, t);
      const oz = samplerZ.sample(y, t);
      push();
      translate(x + ox, 0, y + oz);
      sphere(4);
      pop();
    }
  }
}
```

**Grid (binary threshold):**
```js
let g;

function setup() {
  createCanvas(560, 560);
  g = Waves.createGrid(14, 14, { threshold: 0, speed: 1 });
}

function draw() {
  background(245);
  const cells = g.sample(frameCount * 0.02);
  const cell  = min(width / g.cols, height / g.rows);
  const ox    = (width  - g.cols * cell) * 0.5;
  const oy    = (height - g.rows * cell) * 0.5;
  noStroke();
  for (let r = 0; r < g.rows; r++) {
    for (let c = 0; c < g.cols; c++) {
      fill(cells[r * g.cols + c] === 1 ? 0 : 255);
      rect(ox + c * cell, oy + r * cell, cell, cell);
    }
  }
}
```

**Wild mode:**
```js
for (let y = 0; y < height; y += 10) {
  const x = Waves.wave(y, {
    wave:             'pulse',
    t:                frameCount * 0.01,
    mode:             'wild',
    unpredictability: 0.45,
    range:            [-160, 160]
  });
  circle(width / 2 + x, y, 5);
}
```

**Manual time control (replaces v1 tick mode):**
```js
let simTime = 0;

function draw() {
  simTime += 1 / 30;  // fixed timestep regardless of real frame rate
  for (let y = 0; y < height; y += 10) {
    const x = Waves.wave(y, {
      wave:  'classic sine',
      t:     simTime * 6,
      range: [-120, 120]
    });
    circle(width / 2 + x, y, 5);
  }
}
```

**Recording / capture:**
```js
function setup() {
  createCanvas(600, 600);
  frameRate(6);   // slow the renderer for screen recorders / GIF tools
}

function draw() {
  background(245);
  for (let y = 0; y < height; y += 10) {
    const x = Waves.wave(y, { wave: 'classic sine', t: frameCount * 0.003, range: [-120, 120] });
    circle(width / 2 + x, y, 5);
  }
}
```

Two independent knobs:
- **`t` multiplier** — controls how fast the wave moves (motion speed).
- **`frameRate(n)`** — controls how many frames per second p5 renders (capture speed).

Lower `frameRate()` when your screen recorder or GIF tool needs time to grab each frame. The Wave Lab has a **Frame Rate** selector (60 / 30 / 12 / 6 / 2 fps) in the Render panel for this.

---

## Examples

- `examples/00_wave_lab` — interactive explorer (Wave Lab)
- `examples/01_basic_wave` — line wave, global mode
- `examples/02_instance_mode` — line wave, instance mode
- `examples/03_basic_wave_instance` — range normalisation, instance mode
- `examples/04_basic_wave_p2d` — P2D renderer
- `examples/05_basic_wave_webgl` — WEBGL with two samplers
- `examples/06_create_sampler` — createSampler reuse
- `examples/07_select_by_index` — select wave by index
- `examples/08_triangle_domain` — small input domain
- `examples/09_range_0_1` — range [0, 1]
- `examples/10_wave_override` — wild mode
- `examples/11_tick_time_mode` — manual time control

---

## Safe Usage

Recommended — no name collisions:
```js
Waves.wave(...)
Waves.createSampler(...)
Waves.createGrid(...)
p.waves(...)    // instance mode
```

This library does not define `window.wave`.

---

## p5.js Library Compliance

p5.waves follows the [p5.js addon library guidelines](https://p5js.org/contribute/creating_libraries/):

| Requirement | Status |
| --- | --- |
| Filename pattern `p5.featurename.js` | ✓ `p5.waves.js` / `p5.waves.min.js` |
| Prototype methods use `function()`, not arrow functions | ✓ correct `this` binding in instance mode |
| Does not overwrite existing p5.js methods | ✓ adds only `waves`, `createWaveSampler`, `createWaveGrid` |
| Does not shadow native JS objects (`Math`, `console`, …) | ✓ |
| p5.js must load before the library | ✓ documented above |
| Single-file bundle + minified version | ✓ |
| Working examples | ✓ 12 examples (00–11) |

---

## Versioning

Semantic versioning. Major releases may change outputs or remove functions.

---

## Makers and Contributors (wave formulas)

- `tw@GenerativePunk` (original dataset contributor)
- `gh@ffd8` (original dataset contributor)
- Reference for rectangular/pulse formulas: https://titanwolf.org/Network/Articles/Article?AID=b5a3e4c8-1939-4fcb-aab8-8ff126c895da#gsc.tab=0
- Reference for triangle formula: https://editor.p5js.org/jeremydouglass/sketches/fE0UWUEg
