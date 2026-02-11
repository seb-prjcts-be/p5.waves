# p5.waves

Gentle wave sampling helpers for p5.js.

Use it to turn a single input (`y`) into stable offsets (`x`, `z`, or both). This is great for lines, grids, ribbons, and subtle motion. It does **not** draw anything for you.

**Version note (v2)**
Wave names are camelCase (for example `classicSine`). Legacy spaced names and shape names still resolve.

## Quick Start

**1) Include scripts**
```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.1.1/lib/p5.js"></script>
<script src="p5.waves.min.js"></script>
```

**2) Minimal sketch (global mode)**
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

## Basic Usage

**Global mode (recommended)**
```js
const x = Waves.wave(40, 'classicSine');
```

**Instance mode**
```js
new p5(function (p) {
  p.setup = function () {
    p.createCanvas(400, 200);
  };

  p.draw = function () {
    const x = p.waves(40, 'classicSine');
    p.circle(p.width / 2 + x, 50, 6);
  };
});
```

## Customization

### 1) Choose a wave
A wave reference can be:
- index (number)
- `wave` name (string)
- `shape` name (string)
Matching is case-insensitive, and spaces/hyphens are ignored.

```js
Waves.wave(20, 'classicSine');
Waves.wave(20, 'Classic Sine');   // alias (case-insensitive)
Waves.wave(20, 'ellipse');        // old shape alias
Waves.wave(20, 0);                // index
```

### Preset Browser
Use any `wave` or `shape` below as the `select` value.

| index | wave | shape |
| --- | --- | --- |
| 0 | classicSine | ellipse |
| 1 | sine | infinity |
| 2 | sharpPeaksSine | pendulum |
| 3 | sharpPeaksSine | phasingPendulum |
| 4 | rectangular | topBottom |
| 5 | pulse | bottomTop |
| 6 | rectangularSine | leftRight |
| 7 | mountainPeaks | invertedHeart |
| 8 | valleys | heart |
| 9 | zigZagSine | spaceShip |
| 10 | batman | starfighter |
| 11 | zigZagSine | solarSystem |
| 12 | offsetSine | cSection |
| 13 | stepsDown | hive |
| 14 | steps | hexagon |
| 15 | classSine | invertedPendulum |
| 16 | classicSine | pendulum |
| 17 | bumpySine | depthIllusion |
| 18 | bumpySine | headWithEars |
| 19 | upDownNoise | upDownScatter |
| 20 | metaSine | upDownScatter |
| 21 | triangle | phasingSharpSine |
| 22 | rampWithPeriodHeight | spiral |
| 23 | rampDownSaw | crissCross |
| 24 | rampUpSaw | crissCross |
| 25 | fadeOut | snake |
| 26 | growRandom | scatterDown |
| 27 | noise | noise |
| 28 | fuzzyPulse | fuzzyCenter |
| 29 | upDownPulse | spinningTop |
| 30 | baldPatch | scatter |
| 31 | fuzzyPeakSine | foamingBowl |
| 32 | rampUpSine | scatter |
| 33 | triangleSine | scatter |
| 34 | roundLinkedSine | scatterSphere |
| 35 | halfAndHalfSine | crissCrossUpDown |
| 36 | smoothSolidSine | dna |

### 2) Adjust output size (amplitude)
```js
const x = Waves.wave(y, 'classicSine', null, { amplitude: 120 });
```

### 3) Sample both axes (x and z)
```js
const o = Waves.wave(y, 'classicSine', null, { axis: 'xz', amplitude: 60 });
// o = { x, z }
```

### 4) Smooth or normalize
```js
const x = Waves.wave(y, 'classicSine', null, {
  normalize: true,
  range: [-1, 1]
});
```

### 5) Use defaults (set once)
```js
function setup() {
  createCanvas(400, 200);
  Waves.setWaveParams({
    axis: 'x',
    amplitude: 80,
    select: 'classicSine',
    normalize: true
  });
}

function draw() {
  const x = Waves.wave(40 + frameCount * 0.02);
}
```

## Sampling Patterns

**Animate a wave**
```js
let t = 0;
function draw() {
  const x = Waves.wave(40 + t, 'classicSine');
  t += 0.02;
}
```

**Grid / WEBGL**
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
      const o = Waves.wave(y + t, 'classicSine', null, { axis: 'xz', amplitude: 60 });
      push();
      translate(x + o.x, 0, y + o.z);
      box(6);
      pop();
    }
  }
  t += 0.02;
}
```

## Reference (Short)

### `Waves.wave(y, select, seconds, axisOrOptions)`
- `y` number (input)
- `select` wave reference (optional)
- `seconds` number (optional, auto-advance)
- `axisOrOptions` string or options object

Options:
- `axis`: `'x' | 'z' | 'xz'`
- `amplitude`: number
- `refresh`: number
- `select`: wave ref
- `seconds`: number
- `normalize`: boolean
- `range`: `[min, max]`
- `domain`: `[min, max]`
- `samples`: number

Returns:
- number (`x` or `z`) or `{ x, z }` if `axis: 'xz'`

### `Waves.createSampler(options)`
Use when you want a reusable sampler.
```js
const sampler = Waves.createSampler({ axis: 'xz', amplitude: 60 });
const out = sampler.sample(10);
```

### `Waves.sample(y, refresh, axisOrOptions)`
Lower-level helper if you prefer explicit refresh.

### `Waves.setWaveParams(options)`
Sets defaults used by `Waves.wave()`.

### `Waves.data`
Array of preset definitions.

## UI Guidance
- Show a friendly label (for example title-case the wave name).
- Store the `wave` string in saved projects. Use index only if you control the list order.

## Notes
- `amplitude` is preferred. `scale` is supported for backward compatibility.
- Time is not built in. Add it yourself by changing the input `y` over time.
- Safe usage: `Waves.wave(...)` or `p.waves(...)`. Avoid relying on a global `wave(...)`.

## Versioning
- Patch: fixes/docs only.
- Minor: new waves/options (non-breaking).
- Major: breaking changes or renamed identifiers.
