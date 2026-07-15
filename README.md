# p5.waves

**[Open site](https://seb-prjcts-be.github.io/p5.waves/)** · **[Wave Lab](https://seb-prjcts-be.github.io/p5.waves_lab/)** · **[Processing (Java) port](https://github.com/seb-prjcts-be/processing.waves)**

35 wave shapes for p5.js. One function call, one number back.

**Optimized for p5.js 2.x** (tested with 2.2.2). Also works with p5.js 1.x.

**CSP-safe.** The library contains no `eval` or `new Function`, so it runs under a strict Content-Security-Policy without `'unsafe-eval'`.

## Install

```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.2.2/lib/p5.js"></script>
<script src="https://cdn.jsdelivr.net/gh/seb-prjcts-be/p5.waves@v3.4.0/p5.waves.min.js"
        integrity="sha384-dYhDqxT6d7S8tTTYfe3pmU1F85hlMguwlIFMLNfqYDomLiaacI/cGxBLZWABvrJp"
        crossorigin="anonymous"></script>
```

The pinned version + `integrity` hash guarantees the browser only runs the exact published file. Prefer auto-updates over that guarantee? Use `@latest` instead (no `integrity` — the file changes between releases):

```html
<script src="https://cdn.jsdelivr.net/gh/seb-prjcts-be/p5.waves@latest/p5.waves.min.js"></script>
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
Waves.wave(x)                       // default wave (seed 0)
Waves.wave(x, 'triangle')           // pick by name
Waves.wave(x, { wave: 'triangle', t: millis() / 1000, amplitude: 50 })
```

Always returns a single number.

## Options

### Must-know

| option | what it does | default |
|---|---|---|
| `wave` | Which shape. Name, index (0-33), or `['a', 'b']` for blending. Omit it and you get the `seed`-based pick. | seed 0 |
| `t` | Time. Makes the wave move. Pass `millis() / 1000`. | `0` |
| `amplitude` | How tall. Output: `[-amplitude, +amplitude]`. | `100` |

### Good to know

| option | what it does | default |
|---|---|---|
| `range` | Map output to `[min, max]`. Overrides amplitude. | `null` |
| `frequency` | How tight the cycles are. Higher = squished. | `1` |
| `seed` | Pick a wave by number. Same seed = same wave. | `0` |
| `shift` | `true` = auto-switch to random waves with smooth blend. | `false` |
| `group` | Which pool `shift` / `seed` can pick from: `'gentle'`, `'harsh'`, `'closing'` (experimental), `'all'`, or `['sine', 'triangle']`. | `'all'` |

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

By default `shift` can land on any of the 35 formulas, including tan/noise spikes. Narrow the pool:

```js
Waves.createSampler({ shift: true, group: 'gentle' });  // sines & curves only (25 waves)
Waves.createSampler({ shift: true, group: 'harsh' });   // tan/noise/random/unbounded/erratic only (10 waves)
Waves.createSampler({ shift: true, group: 'closing' }); // 18 waves that all close on the same sweep (experimental)
Waves.createSampler({ shift: true, group: ['sine', 'triangle', 'batman'] });  // your own list
```

> **`mode` vs `group`, don't confuse them.** `mode: 'wild'` warps *one* wave (frequency + phase + amplitude noise). `group: 'harsh'` picks a *different kind of wave* (the ones with spikes baked in). They're orthogonal: `{ mode: 'wild', group: 'gentle' }` = breathing sines, no spikes.

### Stay closed while shifting (`group: 'closing'`)

A ring sampled with `shift` normally tears its seam open the moment it lands on a new wave: every formula has its own period, so a fixed sweep length stops lining up. The `'closing'` pool fixes that. All 18 waves in it share one base period (`62.8319`, that is `2π/0.1`), so a sweep of `sampler.period × lobes` closes seamlessly through every transition. The shape keeps morphing and never shows a seam.

```js
const ring = Waves.createSampler({ shift: true, group: 'closing', amplitude: 30 });

function draw() {
  translate(width / 2, height / 2);
  const sweep = ring.period * 8;          // 8 lobes, holds across every shift
  beginShape();
  for (let i = 0; i < 240; i++) {
    const a = (i / 240) * TWO_PI;
    const r = 180 + ring.sample(i / 240 * sweep, millis() / 1000);
    vertex(r * cos(a), r * sin(a));
  }
  endShape(CLOSE);
}
```

`sampler.period` and `sampler.targetPeriod` report the current and next wave's measured period (both return the stable base for a closing pool, `null` for non-periodic waves). Experimental in 3.3.0: period values may drift by ~0.001 in minor versions. Fine for visuals, not for plotters or CNC.

---

## Binary fields

Combine two samplers and you get 2D patterns. Useful for backgrounds, monitor panels, organic textures, or fingerprint visuals where each wave-pair leaves its own recognisable mark.

The recipe: two samplers (one for rows, one for columns), sum per cell, threshold the result. Each cell becomes `(rowSampler(row) + colSampler(col)) > threshold`. True means "on", false means "off". Two sines give interference patterns. Two pulses give a checkerboard. A sine plus a pulse gives striped bands. The library deliberately doesn't ship a grid wrapper. The nested loop is short enough to write yourself, and that gives you full control over animation, layering, and per-cell rendering.

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

### Variations

- **Shift mode.** Set `shift: true` on each sampler and the wave-pair evolves over time. The field's character changes every few seconds. No two snapshots alike.
- **Threshold tuning.** `> 0` gives roughly 50/50 for symmetric waves. `> 0.12` makes "on" sparser. `> -0.12` makes it denser. Asymmetric waves (saw, triangle) skew the balance. That skew is a feature, it gives each pair a recognisable signature.
- **Analog field.** Replace the binary `fill()` with a colour mapping using the sum value directly. Same pattern, smooth gradient instead of on/off.

The `docs/about.html` origin grid (the sketch that started p5.waves) is the simplest reference. Binary fields are a good candidate for the [Wave Lab](https://seb-prjcts-be.github.io/p5.waves_lab/). Different wave pools, threshold values, and shift speeds explored side by side reveal what visual character each combination produces.

---

## API access

| always available | p5 global mode | p5 instance mode |
|---|---|---|
| `Waves.wave(y, opts)` | `waves(y, opts)` | `p.waves(y, opts)` |
| `Waves.createSampler(opts)` | `createWaveSampler(opts)` | `p.createWaveSampler(opts)` |

Also: `Waves.list()`, `Waves.count` (35), `Waves.data`, `Waves.benchmark(config, n)`.

---

## All 35 waves

`classic sine · sine · sharp peaks · square · pulse · stepped sine · mountain peaks · valleys · zig-zag sine · batman · offset sine · steps down · steps · squared sine · bumpy sine · wobble sine · up down noise · meta sine · triangle · ramp · saw down · saw up · fade out · grow random · noise · fuzzy pulse · up down pulse · bald patch · fuzzy peak sine · ramp up sine · triangle sine · round linked sine · half sine · smooth solid sine · spike sine`

Every periodic wave has a measured period listed on the [Waves page](https://seb-prjcts-be.github.io/p5.waves/docs/waves.html#periodicity). Multiply that period by an integer number of lobes to close curved shapes without a seam. The [periodicity test harness](https://seb-prjcts-be.github.io/p5.waves/docs/periodicity.html) re-verifies these values in the browser.

---

## Examples

- `wave_shift` - auto-cycling wave formulas
- `wave_params` - amplitude, frequency, phase
- `wild_mode` - wild mode
- `flow_fields` - ASCII flow field
- `time_strata` - manual time control
- `color_field` - RGB static field (base + field per channel)
- `morph_wave` - morph between two waves
- `random_walker` - wave-steered walker
- `spiky_lissajous` - closing Lissajous with a spiky wave
- `ghost_delay` - one wave against a delayed copy of itself, closing into a loop ring
- `binary_field` - two samplers, summed and thresholded
- `3d_wave_volume` - 3D WebGL

---

## Processing (Java) port

There's a Java port for Processing 4: [**processing.waves**](https://github.com/seb-prjcts-be/processing.waves). The same waves and API shape, for sketches that live outside the browser.

## How this was made

The starting point was small: a list of wave formulas curated by Ted Davis, and a 16×16 grid sketch I built around them for Genuary 2026. The path from that sketch to this library (caching, seeding, normalisation, morphing, shifting, wild mode, samplers) was built in heavy collaboration with AI assistants. Design decisions, curation, and judgement calls are mine; implementation was a partnership. [Full story →](https://seb-prjcts-be.github.io/p5.waves/docs/about.html)

## Credits

- `tw@GenerativePunk`, `gh@ffd8` ([Ted Davis](https://teddavis.org), [Oscillation Sandbox](https://github.com/ffd8/oscillation-sandbox)) - wave formula dataset

Developed by Sebastien Vanblaere.
