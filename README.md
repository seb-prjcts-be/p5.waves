# p5.waves

**[Open site](https://seb-prjcts-be.github.io/p5.waves/)**

Wave sampling helpers for p5.js. Always returns a number.

**Install**
```html
<script src="https://cdn.jsdelivr.net/gh/seb-prjcts-be/p5.waves@v2.1.1/p5.waves.min.js"></script>
```

Replace `v2.1.1` with the [latest tag](https://github.com/seb-prjcts-be/p5.waves/tags).

**[Wave Lab](https://seb-prjcts-be.github.io/p5.waves/examples/00_wave_lab/)** — explore all 34 waves interactively.

---

## What it does

34 wave formulas, sampled with a single number. Think of it like `noise(y)` — pass a coordinate, get a number back.

```js
Waves.wave(y)
Waves.wave(y, 'triangle')
Waves.wave(y, { wave: 'classic sine', range: [-1, 1], t: millis() / 1000 })
```

One x in, one number out. Use it in a loop to draw a wave line:

```js
function draw() {
  background(245);
  beginShape();
  for (let x = 0; x < width; x += 4) {
    let y = Waves.wave(x, {
      wave: 'classic sine',
      t: millis() / 1000,
      amplitude: 80
    });
    vertex(x, height / 2 + y);
  }
  endShape();
}
```

---

## API Overview

Three ways to access the same functions:

| context | wave | sampler | grid |
|---|---|---|---|
| Namespace (always) | `Waves.wave(y, opts)` | `Waves.createSampler(opts)` | `Waves.createGrid(c, r, opts)` |
| p5 global mode | `waves(y, opts)` | `createWaveSampler(opts)` | `createWaveGrid(c, r, opts)` |
| p5 instance mode | `p.waves(y, opts)` | `p.createWaveSampler(opts)` | `p.createWaveGrid(c, r, opts)` |

Additional properties on the `Waves` object:

| property / method | returns | description |
|---|---|---|
| `Waves.list()` | `[{ index, name, algo }, ...]` | All 34 wave formulas |
| `Waves.count` | `34` | Number of formulas |
| `Waves.data` | `[{ name, algo }, ...]` | Raw internal WAVES array |
| `Waves.benchmark(config, n)` | `{ iterations, ms, callsPerMs }` | Measure performance of a wave config |

---

### `Waves.wave(y, secondParam)`

| form | meaning |
| --- | --- |
| `Waves.wave(y)` | default wave, seed 0 |
| `Waves.wave(y, 3)` | seed 3 selects wave |
| `Waves.wave(y, 'triangle')` | wave by name |
| `Waves.wave(y, { wave: 'triangle' })` | options object |
| `Waves.wave(y, { wave: ['sine', 'triangle'], mix: 0.5 })` | morph between two waves |

All options:

| option | type | description | default |
| --- | --- | --- | --- |
| `wave` | string, number, or array | Name, index (0–33), or morph pair `['a', 'b']` | seed-determined |
| `seed` | number | Selects wave via FNV-1a hash | `0` |
| `t` | number | Time offset — drives animation. Pass `millis()/1000`. The library never increments `t` internally. | `0` |
| `amplitude` | number | Output multiplier. Ignored when `range` is set. | `100` |
| `range` | `[min, max]` | Normalises output to this interval. Overrides `amplitude`. | `null` |
| `frequency` | number | Input multiplier — tighter or looser wave cycles. | `1` |
| `phase` | number | Input offset — shifts the wave left or right. | `0` |
| `mode` | string | `'stable'` or `'wild'` — wild injects position-varying noise. | `'stable'` |
| `unpredictability` | number | 0–1 intensity for wild mode. No effect in stable mode. | `0` |
| `mix` | number | 0–1 blend factor when `wave` is an array. 0 = first wave, 1 = second. | `0.5` |
| `shift` | boolean | Auto-cycle through random formulas with smooth morph transitions. | `false` |
| `shiftInterval` | number | Seconds to hold each wave before morphing. | `3` |
| `shiftDuration` | number | Seconds for the morph transition. | `1` |

> `Waves.wave(y, 3)` — 3 is a **seed** (hashed to pick a wave). `Waves.wave(y, { wave: 3 })` — 3 is a direct **index**.

Returns a single number. Internally: `x = (y + t) × frequency + phase`. When `range` is set, `amplitude` is ignored.

**Morph:** pass `wave: ['sine', 'triangle']` with `mix: 0..1` to blend two formulas. `range` normalisation is intentionally not applied in morph mode — output is scaled by `amplitude` only.

---

### `Waves.createSampler(options)`

Config resolved once, reused on every `.sample()` call. Accepts all the same options as `Waves.wave()`.

```js
const s = Waves.createSampler({ wave: 'triangle', range: [-80, 80] });
s.sample(y)          // → number
s.sample(y, t)       // → number with time offset
s.sample(y, t, mix)  // → number with time and morph blend (morph mode only)
```

**Standard sampler return:**

| property / method | description |
|---|---|
| `.sample(y)` | Evaluate at position y (uses default t from creation) |
| `.sample(y, t)` | Evaluate with explicit time |
| `.sample(y, t, mix)` | Morph mode — override blend factor per call |
| `.waveIndex` | Resolved wave index (number, or `[a, b]` for morph) |
| `.waveName` | Resolved wave name (shows `'sine → triangle'` for morph) |

**Shift sampler** — pass `shift: true` to auto-cycle through random formulas:

```js
const s = Waves.createSampler({ shift: true, amplitude: 120 });
s.sample(y, t);      // auto-cycles every 3 s, morphs over 1 s
```

| option | default | meaning |
|---|---|---|
| `shift` | `false` | Enable auto-cycling |
| `shiftInterval` | `3` | Seconds to hold each wave |
| `shiftDuration` | `1` | Seconds for the morph transition |

Shift sampler additional getters:

| getter | returns |
|---|---|
| `.waveIndex` | Current formula index |
| `.waveName` | Current formula name |
| `.targetName` | Next formula name (during morph) |
| `.mix` | Morph progress 0–1 |
| `.shifting` | `true` while morphing |

For two independent axes (e.g. WEBGL x/z), use two samplers with different seeds:
```js
const sx = Waves.createSampler({ seed: 0, range: [-80, 80] });
const sz = Waves.createSampler({ seed: 1, range: [-80, 80] });
```

---

### `Waves.createGrid(cols, rows, options)`

`.sample(t)` returns a typed array. The output array is **reused** between calls — copy it if you need to keep a snapshot: `new Float32Array(g.sample(t))`.

```js
const g = Waves.createGrid(20, 20, { range: [0, 1] });
g.sample(t)  // → Float32Array, length cols×rows
```

With `threshold`, returns `Uint8Array` of 0/1 values (overrides `range`).

Options:

| option | type | description | default |
| --- | --- | --- | --- |
| `waveRow` | string or number | Wave for row direction (name or index) | seed-determined |
| `waveCol` | string or number | Wave for col direction (name or index) | seed-determined (different) |
| `seed` | number | Auto-selects two different waves | `0` |
| `range` | `[min, max]` | Normalises output → `Float32Array` | `null` |
| `threshold` | number | Cells above → 1, below → 0 → `Uint8Array`. Overrides `range`. | `null` |
| `speed` | number | Time scale factor for `.sample(t)` | `1` |

Return value:

| property / method | description |
|---|---|
| `.cols` | Number of columns |
| `.rows` | Number of rows |
| `.sample(t)` | Evaluate full grid at time t → `Float32Array` or `Uint8Array`, length = cols × rows |

Cell value = sum of `waveRow` at the row position + `waveCol` at the column position, both mapped to `[0, 2π]`. Grid size is soft-limited to 250×250 (62,500 cells) — larger grids trigger a console warning.

---

### `Waves.benchmark(config, iterations)`

Measure performance of any wave configuration.

```js
Waves.benchmark()                                           // → default wave, 10000 iterations
Waves.benchmark({ wave: 'sine', range: [-1, 1] })           // → specific config
Waves.benchmark({ mode: 'wild', unpredictability: 1 }, 50000) // → custom iteration count
// Returns: { iterations: 50000, ms: 52.1, callsPerMs: 960 }
```

---

## Performance

| feature | relative cost | notes |
|---|---|---|
| `wave(y)` | 1× | Baseline — single formula evaluation |
| `wave(y, { range })` | ~1.2× | Adds a stats lookup (cached after first call) |
| `wave(y, { wave: ['a','b'], mix })` | 2× | Two formula evaluations + interpolation |
| `wave(y, { shift: true })` during transition | 2× | Two formulas + smoothstep blending |
| `wave(y, { mode: 'wild' })` | ~5× | 4 extra noise evaluations per sample |
| `createGrid(n, m).sample(t)` | n × m × above | Every cell is a full evaluation |

Tips:
- Use `createSampler()` when calling the same config repeatedly — resolves parameters once.
- `createGrid()` reuses its output array. Copy it if you need to keep it.
- Use `Waves.benchmark()` to measure your specific configuration.

---

## Copy-paste templates

### Compact — quick one-liners

```js
Waves.wave(y, 'triangle')
Waves.wave(y, { wave: 'sine', t: millis() / 1000, range: [-1, 1] })

const s = Waves.createSampler({ shift: true, amplitude: 120 });
s.sample(y, t);
```

### Full — one argument per line

**`Waves.wave()`**
```js
const x = Waves.wave(y, {
  wave:                'classic sine',  // name, index 0–33, or ['a', 'b'] for morph
  // seed:             0,               // alternative: select wave via seed
  // t:                millis() / 1000, // drives animation
  // amplitude:        100,             // fast scale; ignored when range is set
  // range:            [-1, 1],         // normalises output; overrides amplitude
  // frequency:        1,               // tighter or looser cycles
  // phase:            0,               // shift wave left or right
  // mode:             'stable',        // 'stable' or 'wild'
  // unpredictability: 0,               // 0..1; wild mode only
  // mix:              0.5,             // 0..1; morph blend (when wave is array)
  // shift:            false,           // auto-cycle through random waves
  // shiftInterval:    3,               // seconds to hold each wave
  // shiftDuration:    1,               // seconds for morph transition
});
```

**`Waves.createSampler()`**
```js
const s = Waves.createSampler({
  wave:                'classic sine',
  // seed:             0,
  // t:                0,               // default t when .sample(y) is called without t
  // amplitude:        100,
  // range:            [-80, 80],
  // frequency:        1,
  // phase:            0,
  // mode:             'stable',
  // unpredictability: 0,
  // mix:              0.5,             // default morph blend
  // shift:            false,
  // shiftInterval:    3,
  // shiftDuration:    1,
});
s.sample(y);          // → number (uses default t)
s.sample(y, t);       // → number with explicit time
s.sample(y, t, mix);  // → number with time and morph blend
s.waveIndex;          // → resolved wave index
s.waveName;           // → resolved wave name
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
const cells = g.sample(t);  // → Float32Array or Uint8Array (reused buffer)
g.cols;                      // → number of columns
g.rows;                      // → number of rows
```

**`Waves.benchmark()`**
```js
Waves.benchmark()                                           // → default, 10000 iterations
Waves.benchmark({ wave: 'sine', range: [-1, 1] })           // → specific config
Waves.benchmark({ mode: 'wild', unpredictability: 1 }, 50000) // → custom count
// Returns: { iterations, ms, callsPerMs }
```

---

## Examples

The **[Examples page](https://seb-prjcts-be.github.io/p5.waves/docs/examples.html)** is an animated gallery — each section shows a small live thumbnail and links to its standalone full-code page.

Standalone examples:

- `00_wave_lab` — interactive Wave Lab
- `01_basic_wave` — line wave, global mode
- `02_instance_mode` — instance mode
- `03_basic_wave_instance` — range normalisation
- `04_basic_wave_p2d` — P2D renderer
- `05_basic_wave_webgl` — WEBGL, two samplers
- `06_flow_fields` — flow fields (createSampler × 4)
- `07_wave_params` — amplitude · frequency · phase
- `08_triangle_domain` — small input domain
- `09_range_0_1` — range [0, 1]
- `10_wave_override` — wild mode
- `11_tick_time_mode` — manual time control
- `12_color_spectrum` — wave output as hue / saturation (HSB)
- `14_typography` — wave output as font size, lift and opacity
- `15_opacity` — wave output as alpha, two interfering layers
- `17_3d_wave_volume` — 3D point lattice, wave cycling (WEBGL)

---

## Versioning

Semantic versioning. See [HISTORY.md](HISTORY.md) for changelog and v1 migration guide.

---

## Credits

- `tw@GenerativePunk`, `gh@ffd8` — wave formula dataset

Developed by Sebastien Vanblaere with support from AI tools during ideation, drafting, and testing.
