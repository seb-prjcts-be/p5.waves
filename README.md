# p5.waves

Energy-consistent wave sampling for p5.js.

`p5.waves` gives you stable, controllable offsets from a single input value. It does not draw for you. You use the returned values in your own p5 sketch.

**Signature**
`Waves.wave(y, select, seconds, axisOrOptions)`

**Maintenance Status**
`v1.2.x` is legacy maintenance-only.
Active feature development continues on `main` (`v2+`).
See `BRANCH_POLICY.md`.

**Version Guide**
- New projects: use `main` (latest v2+ behavior).
- Reproducing legacy behavior: use tag `v1.2.0`.
- Historical snapshot data: use `archive/v1`.
- `v2.0.0` is transitional history, not the recommended starting point.

## Quick Start

### 1) Include scripts
```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.1.1/lib/p5.js"></script>
<script src="p5.waves.min.js"></script>
```

### CDN (jsDelivr GitHub)
```html
<script src="https://cdn.jsdelivr.net/gh/seb-prjcts-be/p5.waves@main/p5.waves.min.js"></script>
```

### 2) Minimal sketch (global mode)
```js
function setup() {
  createCanvas(420, 240);
  noFill();
  stroke(0);
}

function draw() {
  background(245);
  beginShape();
  for (let y = 0; y <= height; y += 4) {
    const x = Waves.wave(y + frameCount * 0.02, 'classicSine', null, {
      amplitude: 90,
      frequency: 0.012,
      normalize: true
    });
    vertex(width * 0.5 + x, y);
  }
  endShape();
}
```

## Core Model

- `shape`: pure wave form (`classicSine`, `triangle`, ...)
- `frequency`: external multiplier on input
- `amplitude`: external multiplier on output
- optional `modulation`
- optional normalization to predictable ranges

This is what keeps animation energy consistent between waves.

## Built-in Waves (v2.1.0)

| index | wave | shape | family |
| --- | --- | --- | --- |
| 0 | classicSine | sine | classic |
| 1 | triangle | triangle | classic |
| 2 | sawRise | saw | classic |
| 3 | squarePulse | square | classic |
| 4 | tangentBloom | tangentFold | sculptural |

Alias examples still supported: `rectangular`, `pulse`, `rampUpSaw`, `rampDownSaw`, `fuzzyPulse`, `upDownPulse`, `valleys`.

## Basic Usage

### Global mode
```js
const x = Waves.wave(40, 'classicSine');
```

### Instance mode
```js
new p5(function (p) {
  p.draw = function () {
    const x = p.waves(40, 'triangle');
    p.circle(p.width * 0.5 + x, 60, 6);
  };
});
```

## Simple Recipes

### 1) Adjust output size (`amplitude`)
```js
const x = Waves.wave(y, 'classicSine', null, { amplitude: 120 });
```

### 2) Sample both axes (`x` and `z`)
```js
const o = Waves.wave(y, 'classicSine', null, { axis: 'xz', amplitude: 60 });
// o = { x, z }
```

### 3) Smooth / normalize output
```js
const x = Waves.wave(y, 'classicSine', null, {
  normalize: true,
  range: [-1, 1]
});
```

### 4) Set defaults once
```js
function setup() {
  createCanvas(400, 200);
  Waves.setWaveParams({
    axis: 'x',
    amplitude: 80,
    frequency: 0.012,
    select: 'classicSine',
    normalize: true
  });
}

function draw() {
  const x = Waves.wave(40 + frameCount * 0.02);
}
```

## Sampling Patterns

### Time source (clock vs tick)
Use one explicit timing source for wave switching and default `vars.t`:

```js
Waves.setTimeMode('clock'); // default behavior
```

```js
Waves.setTimeMode('tick');
function draw() {
  Waves.tick(deltaTime / 1000); // live
  // or fixed-step recording:
  // Waves.tick(1 / targetFps);
}
```

### Animate a wave
```js
let t = 0;
function draw() {
  const x = Waves.wave(40 + t, 'classicSine');
  t += 0.02;
}
```

### Grid / WEBGL style
```js
let t = 0;
function setup() {
  createCanvas(400, 400, WEBGL);
  noStroke();
}

function draw() {
  background(240);
  rotateY(frameCount * 0.01);
  for (let y = -150; y <= 150; y += 30) {
    for (let x = -150; x <= 150; x += 30) {
      const o = Waves.wave(y + t, 'classicSine', null, {
        axis: 'xz',
        amplitude: 60,
        frequency: 0.012,
        normalize: true
      });
      push();
      translate(x + o.x, 0, y + o.z);
      box(6);
      pop();
    }
  }
  t += 0.02;
}
```

### p5.js Editor (No `index.html` edits, paste only in `sketch.js`)

Use this when you want a guaranteed start from `sketch.js` only:

```js
let grid = null;
let t = 0;
let wavesReady = false;

function loadWaves(url) {
  return new Promise((resolve, reject) => {
    if (window.Waves) return resolve();
    const s = document.createElement('script');
    s.src = url;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Could not load p5.waves from CDN'));
    document.head.appendChild(s);
  });
}

async function setup() {
  createCanvas(560, 560);
  noStroke();

  try {
    await loadWaves('https://cdn.jsdelivr.net/gh/seb-prjcts-be/p5.waves@main/p5.waves.min.js');
    grid = Waves.createGridSampler({
      grid: 14,
      waveA: 'classicSine',
      waveB: 'tangentBloom'
    });
    wavesReady = true;
  } catch (err) {
    console.error(err);
    noLoop();
  }
}

function draw() {
  background(245);
  if (!wavesReady || !grid) return;

  const frame = grid.sample(t);
  const cols = 14;
  const rows = 14;
  const cell = min(width / cols, height / rows);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      fill(frame.cells[idx] ? 0 : 255);
      rect(c * cell, r * cell, cell, cell);
    }
  }

  t += 0.02;
}
```

## Short Reference

### `Waves.wave(y, select, seconds, axisOrOptions)`
- `y`: number input
- `select`: wave reference (optional)
- `seconds`: number (optional, `0` disables auto-advance, `> 0` auto-advances)
- `axisOrOptions`: string axis or options object

Options:
- `axis`: `'x' | 'z' | 'xz'`
- `amplitude`: number
- `frequency`: number
- `phase`: number
- `mode`: `'stable' | 'wild'`
- `unpredictability`: `0..1`
- `refresh`: number
- `seconds`: number
- `select`: wave reference
- `vars`: object
- `normalize`: boolean
- `range`: `[min, max]`
- `modulation`: `{ shape, frequency, phase, phaseDepth, amplitudeDepth }`

Returns:
- number (`x` or `z`) or `{ x, z }` when `axis: 'xz'`
- if `vars.t` is omitted, `Waves.wave(...)` injects `t` from the active time source
- if `vars.t` is provided, it overrides internal time

### `Waves.setTimeMode(mode, options)`
- `mode`: `'clock' | 'tick'`
- `options`: reserved object (optional)
- default mode is `'clock'`

### `Waves.tick(dtSeconds)`
- advances internal time in seconds (relevant in `'tick'` mode)
- returns current internal time

### `Waves.createSampler(options)`
```js
const sampler = Waves.createSampler({
  axis: 'xz',
  wave: 'triangle',
  amplitude: 70,
  frequency: 0.01,
  normalize: true
});

const out = sampler.sample(12.5); // { x, z }
```

## Binary Grid Sampling (14x14, copy-paste ready)

Paste the whole block as a sketch (not only the `createGridSampler(...)` lines).

```js
let grid;
let t = 0;

function setup() {
  createCanvas(560, 560);
  noStroke();
  grid = Waves.createGridSampler({
    grid: 14,
    waveA: 'classicSine',
    waveB: 'tangentBloom'
  });
}

function draw() {
  background(245);
  const frame = grid.sample(t); // frame.cells => Uint8Array(14*14) with 0/1
  const cols = 14;
  const rows = 14;
  const cell = min(width / cols, height / rows);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      fill(frame.cells[idx] ? 0 : 255);
      rect(c * cell, r * cell, cell, cell);
    }
  }

  if (frame.uniform) grid.nextPair(1, 2);
  t += 0.02;
}
```

For full control (`mode`, `unpredictability`, `frequencyA/B`, thresholds, combine modes), see `examples/00_wave_lab`.

## Examples

- `examples/00_wave_lab`: interactive playground with sliders, toggles, line/matrix preview.
- `examples/01_basic_wave_instance`
- `examples/01_basic_wave_p2d`
- `examples/01_basic_wave_webgl`
- `examples/02_seconds_param`
- `examples/03_select_by_index`
- `examples/04_triangle_domain`
- `examples/05_range_0_1`
- `examples/06_wave_override`
- `examples/07_archive_comparison`: side-by-side stable core vs legacy archive behavior
- `examples/11_tick_time_mode`: deterministic timing demo (`frameRate(1)` + fixed `tick`)

## Archive & Legacy Builds

`p5.waves` keeps two layers on purpose:

- **v2.x core (default)**: energy-consistent architecture with external `frequency` and `amplitude`, normalization, and stable/wild controls.
- **v1 archive (optional)**: preserved historical formulas with raw, uneven behavior.

Legacy assets live in `archive/v1`:

- `archive/v1/p5.waves.v1.js`
- `archive/v1/p5.waves.v1.min.js`
- `archive/v1/dataset.json`
- `archive/v1/README_ARCHIVE.md`

The archive is discoverable but not dominant:

- it is not auto-loaded
- it is not the default engine
- it does not replace the v2 core
- it exists for historical continuity and attribution

## Notes

- `amplitude` is preferred. `scale` remains supported for compatibility.
- `domain` and `samples` are no longer part of the v2.1.0 public options.
- `Waves.wave(...)` and `p.waves(...)` are the intended entry points.

## Versioning

- Patch: bug fixes/docs
- Minor: non-breaking features/waves/options
- Major: breaking API changes

## Makers and Contributors
Wave formula contributors in the original dataset: `tw@GenerativePunk` and `gh@ffd8`.

🙏 Thanks & Credits

This wave collection grew out of experiments shared across generative art communities.
Many of the formulas in this dataset were inspired by, adapted from, or directly attributed to the following handles:

- `tw@GenerativePunk`
- `gh@ffd8`

Some entries reference external explorations and educational material, including:

- TitanWolf article on waveform construction
- Jeremy Douglass (p5.js Editor sketch reference)

Where a handle or source is included in the dataset, it reflects the best available attribution at the time of compilation.

If you recognize your work here and would like:

- clearer attribution
- a link added
- your handle updated
- removal

please open an issue or contact the maintainer.

This library exists as a living archive of playful math, community tinkering, and waveform aesthetics.
Every sine, pulse, noise field, and ramp here stands on shared curiosity.

Thank you to everyone who bends math into drawing.
