# p5.waves

**[Open site](https://seb-prjcts-be.github.io/p5.waves/)** · **[Wave Lab](https://seb-prjcts-be.github.io/p5.waves/examples/wave_lab/)**

34 wave shapes for p5.js. One function call, one number back.

## Install

```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.2.2/lib/p5.js"></script>
<script src="https://cdn.jsdelivr.net/gh/seb-prjcts-be/p5.waves@v3.0.0/p5.waves.min.js"></script>
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
| `wave` | Which shape. Name, index (0–33), or `['a', 'b']` for blending. | random |
| `t` | Time. Makes the wave move. Pass `millis() / 1000`. | `0` |
| `amplitude` | How tall. Output: `[-amplitude, +amplitude]`. | `100` |

### Good to know

| option | what it does | default |
|---|---|---|
| `range` | Map output to `[min, max]`. Overrides amplitude. | `null` |
| `frequency` | How tight the cycles are. Higher = squished. | `1` |
| `seed` | Pick a wave by number. Same seed = same wave. | `0` |
| `shift` | `true` = auto-switch to random waves with smooth blend. | `false` |

### Advanced

| option | what it does | default |
|---|---|---|
| `phase` | Shift wave sideways. | `0` |
| `mode` | `'stable'` or `'wild'` (adds wobble). | `'stable'` |
| `unpredictability` | How much wobble in wild mode. 0–1. | `0` |
| `mix` | Blend factor when `wave` is `['a', 'b']`. 0–1. | `0.5` |
| `shiftInterval` | Seconds to hold each wave. | `3` |
| `shiftDuration` | Seconds for the morph transition. | `1` |

> **Seed vs index:** `Waves.wave(x, 3)` — 3 is a seed (hashed). `Waves.wave(x, { wave: 3 })` — 3 is a direct index.

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
sampler.mix;           // morph progress 0–1
```

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

## createGrid()

Fill a 2D grid of wave values in one call.

```js
let g = Waves.createGrid(20, 20, { threshold: 0, speed: 1 });
let cells = g.sample(t);  // Uint8Array of 0/1
// cells[row * g.cols + col]
```

| option | what it does | default |
|---|---|---|
| `waveRow` | Wave for rows. | random |
| `waveCol` | Wave for columns. | random |
| `seed` | Auto-picks two different waves. | `0` |
| `range` | `[min, max]` → Float32Array. | `null` |
| `threshold` | Binary mode → Uint8Array. Overrides range. | `null` |
| `speed` | Time scale. | `1` |

The output array is **reused** between calls. Copy it if you need to keep it.

---

## API access

| always available | p5 global mode | p5 instance mode |
|---|---|---|
| `Waves.wave(y, opts)` | `waves(y, opts)` | `p.waves(y, opts)` |
| `Waves.createSampler(opts)` | `createWaveSampler(opts)` | `p.createWaveSampler(opts)` |
| `Waves.createGrid(c, r, opts)` | `createWaveGrid(c, r, opts)` | `p.createWaveGrid(c, r, opts)` |

Also: `Waves.list()`, `Waves.count` (34), `Waves.data`, `Waves.benchmark(config, n)`.

---

## All 34 waves

`classic sine · sine · sharp peaks · square · pulse · stepped sine · mountain peaks · valleys · zig-zag sine · batman · offset sine · steps down · steps · squared sine · bumpy sine · wobble sine · up down noise · meta sine · triangle · ramp · saw down · saw up · fade out · grow random · noise · fuzzy pulse · up down pulse · bald patch · fuzzy peak sine · ramp up sine · triangle sine · round linked sine · half sine · smooth solid sine`

---

## Examples

- `wave_lab` — interactive playground
- `wave_shift` — auto-cycling wave formulas
- `contour_map` — P2D contour lines
- `flow_fields` — particle swarms
- `wave_params` — amplitude, frequency, phase
- `luminance_field` — output range
- `wild_mode` — wild mode
- `time_strata` — manual time control
- `color_field` — HSB color field
- `morph_wave` — morph between two waves
- `3d_wave_volume` — 3D WebGL

---

## Credits

- `tw@GenerativePunk`, `gh@ffd8` — wave formula dataset

Developed by Sebastien Vanblaere.
