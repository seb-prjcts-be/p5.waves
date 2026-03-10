# p5.waves

**[Open site](https://seb-prjcts-be.github.io/p5.waves/)**

Wave sampling helpers for p5.js. Always returns a number.

**Install**
```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.1.1/lib/p5.js"></script>
<script src="https://cdn.jsdelivr.net/gh/seb-prjcts-be/p5.waves@v2.0.0/p5.waves.min.js"></script>
<script src="sketch.js"></script>
```

Replace `v2.0.0` with the [latest tag](https://github.com/seb-prjcts-be/p5.waves/tags). Load order matters — `p5.js` must come first.

> **New to waves?** Try [p5.easywaves](https://github.com/seb-prjcts-be/p5.easywaves) first — a simplified version for beginners.

**[Wave Lab](https://seb-prjcts-be.github.io/p5.waves/examples/00_wave_lab/)** — explore all 34 waves interactively.

---

## What it does

34 wave formulas, sampled with a single number. Think of it like `noise(y)` — pass a coordinate, get a number back.

```js
Waves.wave(y)
Waves.wave(y, 'triangle')
Waves.wave(y, { wave: 'classic sine', range: [-1, 1], t: millis() / 1000 })
```

---

## API

### `Waves.wave(y, secondParam)`

| form | meaning |
| --- | --- |
| `Waves.wave(y)` | default wave, seed 0 |
| `Waves.wave(y, 3)` | seed 3 selects wave |
| `Waves.wave(y, 'triangle')` | wave by name |
| `Waves.wave(y, { wave: 'triangle' })` | options object |

Options:

| option | description | default |
| --- | --- | --- |
| `wave` | name or index | seed-determined |
| `seed` | selects wave via FNV-1a hash | `0` |
| `t` | time offset (`millis()/1000`) | `0` |
| `amplitude` | fast scale, no normalisation | `1` |
| `range` | `[min, max]` — normalises output | `null` |
| `frequency` | input multiplier | `1` |
| `phase` | input offset | `0` |
| `mode` | `'stable'` or `'wild'` | `'stable'` |
| `unpredictability` | `0..1`, wild mode only | `0` |

> `Waves.wave(y, 3)` — 3 is a **seed** (hashed to pick a wave). `Waves.wave(y, { wave: 3 })` — 3 is a direct **index**.

When `range` is set, `amplitude` is ignored. `t` adds to `y` before evaluation: `x = (y + t) * frequency + phase`.

---

### `Waves.createSampler(options)`

Config resolved once, reused on every call. Accepts the same options as `Waves.wave()`.

```js
const s = Waves.createSampler({ wave: 'triangle', range: [-80, 80] });
s.sample(y)      // → number
s.sample(y, t)   // → number with time offset
```

For two independent axes (e.g. WEBGL x/z), use two samplers with different seeds:
```js
const sx = Waves.createSampler({ seed: 0, range: [-80, 80] });
const sz = Waves.createSampler({ seed: 1, range: [-80, 80] });
```

---

### `Waves.createGrid(cols, rows, options)`

`.sample(t)` returns a typed array.

```js
const g = Waves.createGrid(20, 20, { range: [0, 1] });
g.sample(t)  // → Float32Array, length cols×rows
```

With `threshold`, returns `Uint8Array` of 0/1 values (overrides `range`).

| option | description | default |
| --- | --- | --- |
| `waveRow` | wave for row direction | seed-determined |
| `waveCol` | wave for col direction | seed-determined (different) |
| `seed` | wave selection | `0` |
| `range` | `[min, max]` → Float32Array | `null` |
| `threshold` | → Uint8Array (0/1) | `null` |
| `speed` | time scale | `1` |

Cell value = sum of `waveRow` at the row position + `waveCol` at the column position, both mapped to `[0, 2π]`.

---

### Discovery

```js
Waves.list()   // → [{ index, name, algo }, ...]
Waves.count    // → 34
Waves.data     // → raw WAVES array
```

### p5 prototype methods

```js
p.waves(y, secondParam)
p.createWaveSampler(opts)
p.createWaveGrid(cols, rows, opts)
```

Available without `p.` in global mode.

---

## Copy-paste templates

**`Waves.wave()`**
```js
const x = Waves.wave(y, {
  wave:                'classic sine',  // name or index (0–33); see Waves.list()
  // seed:             0,               // alternative: select wave via seed
  // t:                millis() / 1000, // drives animation
  // amplitude:        1,               // fast scale; ignored when range is set
  // range:            [-1, 1],         // normalises output; overrides amplitude
  // frequency:        1,               // tighter or looser cycles
  // phase:            0,               // shift wave left or right
  // mode:             'stable',        // 'stable' or 'wild'
  // unpredictability: 0,               // 0..1; wild mode only
});
```

**`Waves.createSampler()`**
```js
const s = Waves.createSampler({
  wave:                'classic sine',
  // seed:             0,
  // amplitude:        1,
  // range:            [-80, 80],
  // frequency:        1,
  // phase:            0,
  // mode:             'stable',
  // unpredictability: 0,
});
s.sample(y);      // → number
s.sample(y, t);   // → number with time
```

**`Waves.createGrid()`**
```js
const g = Waves.createGrid(cols, rows, {
  // waveRow:   'classic sine',
  // waveCol:   'triangle',
  // seed:      0,
  // range:     [0, 1],
  // threshold: 0.5,
  // speed:     1,
});
const cells = g.sample(t);  // cells[row * g.cols + col]
```

---

## Examples

- `00_wave_lab` — interactive Wave Lab
- `01_basic_wave` — line wave, global mode
- `02_instance_mode` — instance mode
- `03_basic_wave_instance` — range normalisation
- `04_basic_wave_p2d` — P2D renderer
- `05_basic_wave_webgl` — WEBGL, two samplers
- `06_seconds_param` — seconds param
- `07_select_by_index` — select by index
- `08_triangle_domain` — small input domain
- `09_range_0_1` — range [0, 1]
- `10_wave_override` — wild mode
- `11_tick_time_mode` — manual time control
- `12_color_spectrum` — wave output as hue / saturation (HSB)
- `13_sound` — wave output as oscillator frequency (Web Audio)
- `14_typography` — wave output as font size, lift and opacity
- `15_opacity` — wave output as alpha, two interfering layers
- `16_wave_chart` — all 34 formulas as live animated bars

---

## Versioning

Semantic versioning. See [HISTORY.md](HISTORY.md) for changelog and v1 migration guide.

---

## Credits

- `tw@GenerativePunk`, `gh@ffd8` — wave formula dataset
