# p5.waves

**[Open site](https://seb-prjcts-be.github.io/p5.waves/)** · **[Wave Lab](https://seb-prjcts-be.github.io/p5.waves_lab/)**

34 wave shapes for p5.js. One function call, one number back.

**Optimized for p5.js 2.x** (tested with 2.2.2). Also works with p5.js 1.x.

## Install

```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.2.2/lib/p5.js"></script>
<script src="https://cdn.jsdelivr.net/gh/seb-prjcts-be/p5.waves@v3.3.0/p5.waves.min.js"></script>
```

## Quick start

```js
function draw() {
  background(245);
  beginShape();
  for (let x = 0; x < width; x += 3) {
    let y = Waves.wave(x, {
      wave: 'mountain peaks',
      t: millis() / 1000,
      amplitude: 80
    });
    vertex(x, height / 2 + y);
  }
  endShape();
}
```

## Three ways to call it

```js
Waves.wave(x)                       // random wave
Waves.wave(x, 'triangle')           // pick by name
Waves.wave(x, { wave: 'triangle', t: millis() / 1000, amplitude: 50 })
```

Always returns a single number.

## Options

### Must-know

| option | what it does | default |
|---|---|---|
| `wave` | Which shape. Name, index (0-33), or `['a', 'b']` for blending. | random |
| `t` | Time. Makes the wave move. Pass `millis() / 1000`. | `0` |
| `amplitude` | How tall. Output: `[-amplitude, +amplitude]`. | `100` |

### Good to know

| option | what it does | default |
|---|---|---|
| `range` | Map output to `[min, max]`. Overrides amplitude. | `null` |
| `frequency` | How tight the cycles are. Higher = squished. | `1` |
| `seed` | Pick a wave by number. Same seed = same wave. | `0` |
| `shift` | `true` = auto-switch to random waves with smooth blend. | `false` |
| `group` | Which pool `shift` / `seed` can pick from: `'gentle'`, `'harsh'`, `'all'`, or `['sine', 'triangle']`. | `'all'` |

### Advanced

| option | what it does | default |
|---|---|---|
| `phase` | Shift wave sideways. | `0` |
| `mode` | `'stable'` or `'wild'` (adds wobble). | `'stable'` |
| `unpredictability` | How much wobble in wild mode. 0-1. | `0` |
| `mix` | Blend factor when `wave` is `['a', 'b']`. 0-1. | `0.5` |
| `shiftInterval` | Units of `t` to hold each wave. | `3` |
| `shiftDuration` | Units of `t` for the morph transition. | `1` |

> **Seed vs index:** `Waves.wave(x, 3)`  - 3 is a seed (hashed). `Waves.wave(x, { wave: 3 })` - 3 is a direct index.

---

## Wave Shift

The main feature. One flag and the wave auto-switches to a random formula every few seconds.

```js
let sampler = Waves.createSampler({
  shift: true,
  amplitude: 60
});

// In draw:
sampler.sample(y, t);
sampler.waveName;      // current wave
sampler.shifting;      // true during morph
sampler.targetName;    // next wave
sampler.mix;           // morph progress 0-1
```

### Pick a pool with `group`

By default `shift` can land on any of the 34 formulas, including tan/noise spikes. Narrow the pool:

```js
Waves.createSampler({ shift: true, group: 'gentle' });  // sines & curves only (28 waves)
Waves.createSampler({ shift: true, group: 'harsh' });   // tan/noise/random only (6 waves)
Waves.createSampler({ shift: true, group: ['sine', 'triangle', 'batman'] });  // your own list
```

> **`mode` vs `group` — don't confuse them.** `mode: 'wild'` warps *one* wave (frequency + phase + amplitude noise). `group: 'harsh'` picks a *different kind of wave* (the ones with spikes baked in). They're orthogonal: `{ mode: 'wild', group: 'gentle' }` = breathing sines, no spikes.

---

## createSampler()

Set up once, call `.sample()` many times. Useful for loops and particles.

```js
let s = Waves.createSampler({ wave: 'triangle', range: [-80, 80] });
s.sample(y);          // at position y
s.sample(y, t);       // with time
s.sample(y, t, mix);  // morph: override blend
```

Same options as `Waves.wave()`.

---

## Binary fields

2D patterns from one principle: two samplers, sum per cell, threshold the result. Each cell is `rowSampler(row) + colSampler(col) > threshold`. Two sines give interference patterns; two pulses give a checkerboard. The library doesn't ship a grid wrapper — the nested loop is short enough to write yourself, and that gives you full control over animation, layering, and cell rendering.

```js
const rowS = Waves.createSampler({ wave: 'classic sine', range: [-1, 1] });
const colS = Waves.createSampler({ wave: 'triangle',     range: [-1, 1] });

function draw() {
  const t = millis() / 1000;
  for (let row = 0; row < rows; row++) {
    const rv = rowS.sample(row * 5 + t);   // x-step ~ one wave period
    for (let col = 0; col < cols; col++) {
      const cv = colS.sample(col * 2.5 - t);
      fill((rv + cv) > 0 ? 0 : 245);       // threshold
      rect(col * cw, row * ch, cw, ch);
    }
  }
}
```

Make the samplers `shift: true` and the field evolves through wave pairs. Tighten the threshold for sparser marks. Replace the binary `fill()` with a colour mapping for an analog field. The `docs/about.html` origin grid (the sketch that started p5.waves) is the simplest possible reference.

---

## API access

| always available | p5 global mode | p5 instance mode |
|---|---|---|
| `Waves.wave(y, opts)` | `waves(y, opts)` | `p.waves(y, opts)` |
| `Waves.createSampler(opts)` | `createWaveSampler(opts)` | `p.createWaveSampler(opts)` |

Also: `Waves.list()`, `Waves.count` (34), `Waves.data`, `Waves.benchmark(config, n)`.

---

## All 34 waves

`classic sine · sine · sharp peaks · square · pulse · stepped sine · mountain peaks · valleys · zig-zag sine · batman · offset sine · steps down · steps · squared sine · bumpy sine · wobble sine · up down noise · meta sine · triangle · ramp · saw down · saw up · fade out · grow random · noise · fuzzy pulse · up down pulse · bald patch · fuzzy peak sine · ramp up sine · triangle sine · round linked sine · half sine · smooth solid sine`

Every periodic wave has a measured period listed on the [Waves page](https://seb-prjcts-be.github.io/p5.waves/docs/waves.html#periodicity) — multiply it by an integer number of lobes to close curved shapes without a seam. The [periodicity test harness](https://seb-prjcts-be.github.io/p5.waves/docs/periodicity.html) re-verifies these values in the browser.

---

## Examples

- `wave_shift` - auto-cycling wave formulas
- `wave_params` - amplitude, frequency, phase
- `wild_mode` - wild mode
- `flow_fields` - ASCII flow field
- `time_strata` - manual time control
- `color_field` - HSB color field
- `morph_wave` - morph between two waves
- `random_walker` - wave-steered walker
- `3d_wave_volume` - 3D WebGL

---

## How this was made

The starting point was small: a list of wave formulas curated by Ted Davis, and a 16×16 grid sketch I built around them for Genuary 2026. The path from that sketch to this library — caching, seeding, normalisation, morphing, shifting, wild mode, samplers — was built in heavy collaboration with AI assistants. Design decisions, curation, and judgement calls are mine; implementation was a partnership. [Full story →](https://seb-prjcts-be.github.io/p5.waves/docs/about.html)

## Credits

- `tw@GenerativePunk`, `gh@ffd8` ([Ted Davis](https://teddavis.org), [Oscillation Sandbox](https://github.com/ffd8/oscillation-sandbox)) - wave formula dataset

Developed by Sebastien Vanblaere.
