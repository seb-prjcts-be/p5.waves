# p5.waves Guide (v2.1.0)

A gentle, practical guide to use `p5.waves` with confidence.

## Welcome

If you are still learning, this page is for you.

`p5.waves` is intentionally simple:

- You give one input number (`y`).
- You get back a wave value (`x`, `z`, or both).
- You decide how to draw it.

No hidden drawing engine, no forced style.

## The Big Idea

In v2.1.0, all wave behavior follows one stable structure:

- wave shape is pure (`classicSine`, `triangle`, etc.)
- frequency is external
- amplitude is external
- optional modulation layer
- optional normalization layer

This keeps energy and motion much more predictable while still allowing variation.

## Quick Start

### 1) Include scripts

```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.1.1/lib/p5.js"></script>
<script src="p5.waves.min.js"></script>
```

### 2) First running sketch

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
      amplitude: 80,
      frequency: 0.012,
      normalize: true
    });
    vertex(width / 2 + x, y);
  }
  endShape();
}
```

If this runs, setup is correct.

## Built-in Waves

- `classicSine` (classic)
- `triangle` (classic)
- `sawRise` (classic)
- `squarePulse` (classic)
- `tangentBloom` (sculptural)

You can still use several legacy aliases (`rectangular`, `pulse`, `valleys`, `fuzzyPulse`, ...).

## A Friendly Mental Model

Think in this order:

1. Pick a shape (`select`)
2. Pick speed (`frequency`)
3. Pick strength (`amplitude`)
4. Decide stability (`mode` + `unpredictability`)
5. Decide range (`normalize` + `range`)

When in doubt, change one control at a time.

## The Most Useful Calls

### Simple

```js
const x = Waves.wave(40, 'classicSine');
```

### With options

```js
const x = Waves.wave(40, 'triangle', null, {
  amplitude: 120,
  frequency: 0.02,
  normalize: true,
  range: [-1, 1]
});
```

### Return both axes

```js
const o = Waves.wave(40, 'classicSine', null, {
  axis: 'xz',
  amplitude: 70,
  frequency: 0.01,
  normalize: true
});
// o = { x, z }
```

### Instance mode

```js
new p5(function (p) {
  p.draw = function () {
    const x = p.waves(40, 'classicSine');
    p.circle(p.width / 2 + x, 50, 6);
  };
});
```

## Controlled Surprise (without chaos)

Use this if you want variation but still steerable behavior:

```js
const x = Waves.wave(y + t, 'tangentBloom', null, {
  amplitude: 90,
  frequency: 0.016,
  mode: 'wild',
  unpredictability: 0.45,
  normalize: true,
  range: [-1, 1]
});
```

Tips:

- Start `unpredictability` near `0.15`.
- For strong texture, move toward `0.5` to `0.7`.
- Keep `normalize: true` if you want stable energy.

## Modulation Layer

Modulation changes phase/amplitude over time, but keeps core control clean.

```js
const x = Waves.wave(y + t, 'classicSine', null, {
  amplitude: 100,
  frequency: 0.01,
  modulation: {
    shape: 'triangle',
    frequency: 0.12,
    phase: 0,
    phaseDepth: 0.25,
    amplitudeDepth: 0.2
  }
});
```

## Auto-Advance

You can cycle wave selection over real time:

```js
const x = Waves.wave(y + t, 'classicSine', 2, {
  amplitude: 110,
  frequency: 0.014,
  mode: 'wild',
  unpredictability: 0.35
});
```

- `seconds = 2` means advance every 2 seconds.
- Use `0` or `null` to disable.

## Reusable Sampler

For loops and grids, a reusable sampler is usually cleaner:

```js
const sampler = Waves.createSampler({
  axis: 'xz',
  wave: 'triangle',
  amplitude: 70,
  frequency: 0.01,
  normalize: true
});

const out = sampler.sample(10.5);
```

## 14x14 Matrix Sampler

```js
const grid = Waves.createGridSampler({
  cols: 14,
  rows: 14,
  waveA: 'classicSine',
  waveB: 'tangentBloom',
  mode: 'wild',
  unpredictability: 0.6,
  frequencyA: 0.22,
  frequencyB: 0.22,
  threshold: 0,
  combine: 'add',
  inputScale: TWO_PI,
  timeScaleA: 1,
  timeScaleB: -1
});

const frame = grid.sample(t);
if (frame.uniform) grid.nextPair(1, 2);
```

## Important Notes

- `amplitude` is preferred (`scale` remains compatible).
- `domain` and `samples` are not public options in v2.1.0.
- Save wave names as strings in presets, not indices, if you want safer long-term compatibility.

## Practical Learning Path

1. Start with `classicSine`, `normalize: true`, `amplitude: 80`.
2. Add time (`t += 0.01`).
3. Change only `frequency`.
4. Try `triangle`, then `tangentBloom`.
5. Turn on `mode: 'wild'` with low unpredictability.
6. Add modulation last.

Slow, single-step changes make debugging and creative direction much easier.

## Where to Explore

- `examples/00_wave_lab` is the main control panel.
- It includes line preview and 14x14 matrix preview for the same presets.
