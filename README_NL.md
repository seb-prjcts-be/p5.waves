# p5.waves

**[Open site](https://seb-prjcts-be.github.io/p5.waves/)**

Wave-sampling hulpfuncties voor p5.js. Geeft altijd een getal terug.

**Installeren**
```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.1.1/lib/p5.js"></script>
<script src="https://cdn.jsdelivr.net/gh/seb-prjcts-be/p5.waves@v2.0.0/p5.waves.min.js"></script>
<script src="sketch.js"></script>
```

Vervang `v2.0.0` door de [laatste tag](https://github.com/seb-prjcts-be/p5.waves/tags). Volgorde is belangrijk — `p5.js` moet eerst laden.

> **Nieuw met waves?** Begin met [p5.easywaves](https://github.com/seb-prjcts-be/p5.easywaves) — een vereenvoudigde versie voor beginners.

**[Wave Lab](https://seb-prjcts-be.github.io/p5.waves/examples/00_wave_lab/)** — verken alle 34 golven interactief.

---

## Wat het doet

34 golfformules, gesampled met één getal. Vergelijkbaar met `noise(y)` — geef een coördinaat mee, krijg een getal terug.

```js
Waves.wave(y)
Waves.wave(y, 'triangle')
Waves.wave(y, { wave: 'classic sine', range: [-1, 1], t: millis() / 1000 })
```

---

## API

### `Waves.wave(y, tweedeParam)`

| vorm | betekenis |
| --- | --- |
| `Waves.wave(y)` | standaardgolf, seed 0 |
| `Waves.wave(y, 3)` | seed 3 bepaalt de golf |
| `Waves.wave(y, 'triangle')` | golf op naam |
| `Waves.wave(y, { wave: 'triangle' })` | opties-object |

Opties:

| optie | beschrijving | standaard |
| --- | --- | --- |
| `wave` | naam of index | bepaald door seed |
| `seed` | selecteert golf via FNV-1a hash | `0` |
| `t` | tijdverschuiving (`millis()/1000`) | `0` |
| `amplitude` | snelle schaal, geen normalisatie | `1` |
| `range` | `[min, max]` — normaliseert uitvoer | `null` |
| `frequency` | invoervermenigvuldiger | `1` |
| `phase` | invoerverschuiving | `0` |
| `mode` | `'stable'` of `'wild'` | `'stable'` |
| `unpredictability` | `0..1`, alleen wild-modus | `0` |

> `Waves.wave(y, 3)` — 3 is een **seed** (via hash omgezet naar een golf). `Waves.wave(y, { wave: 3 })` — 3 is een directe **index**.

Als `range` is ingesteld, wordt `amplitude` genegeerd. `t` wordt opgeteld bij `y` vóór evaluatie: `x = (y + t) * frequency + phase`.

---

### `Waves.createSampler(opties)`

Configuratie eenmalig opgelost, hergebruikt bij elke aanroep. Accepteert dezelfde opties als `Waves.wave()`.

```js
const s = Waves.createSampler({ wave: 'triangle', range: [-80, 80] });
s.sample(y)      // → getal
s.sample(y, t)   // → getal met tijdsverschuiving
```

Voor twee onafhankelijke assen (bv. WEBGL x/z), gebruik twee samplers met verschillende seeds:
```js
const sx = Waves.createSampler({ seed: 0, range: [-80, 80] });
const sz = Waves.createSampler({ seed: 1, range: [-80, 80] });
```

---

### `Waves.createGrid(cols, rows, opties)`

`.sample(t)` geeft een getypeerde array terug.

```js
const g = Waves.createGrid(20, 20, { range: [0, 1] });
g.sample(t)  // → Float32Array, lengte cols×rows
```

Met `threshold` geeft het een `Uint8Array` van 0/1 waarden terug (overschrijft `range`).

| optie | beschrijving | standaard |
| --- | --- | --- |
| `waveRow` | golf voor rijrichting | bepaald door seed |
| `waveCol` | golf voor kolomrichting | bepaald door seed (anders) |
| `seed` | golfselectie | `0` |
| `range` | `[min, max]` → Float32Array | `null` |
| `threshold` | → Uint8Array (0/1) | `null` |
| `speed` | tijdsschaal | `1` |

Celwaarde = som van `waveRow` op de rijpositie + `waveCol` op de kolompositie, beiden gemapt naar `[0, 2π]`.

---

### Ontdekking

```js
Waves.list()   // → [{ index, name, algo }, ...]
Waves.count    // → 34
Waves.data     // → ruwe WAVES-array
```

### p5 prototype-methoden

```js
p.waves(y, tweedeParam)
p.createWaveSampler(opts)
p.createWaveGrid(cols, rows, opts)
```

In globale modus beschikbaar zonder `p.`.

---

## Copy-paste templates

**`Waves.wave()`**
```js
const x = Waves.wave(y, {
  wave:                'classic sine',  // naam of index (0–33); zie Waves.list()
  // seed:             0,               // alternatief: kies golf via seed
  // t:                millis() / 1000, // drijft animatie
  // amplitude:        1,               // snelle schaal; genegeerd als range is ingesteld
  // range:            [-1, 1],         // normaliseert uitvoer; overschrijft amplitude
  // frequency:        1,               // nauwere of lossere cycli
  // phase:            0,               // verschuif golf links of rechts
  // mode:             'stable',        // 'stable' of 'wild'
  // unpredictability: 0,               // 0..1; alleen wild-modus
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
s.sample(y);      // → getal
s.sample(y, t);   // → getal met tijd
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
const cells = g.sample(t);  // cells[rij * g.cols + kolom]
```

---

## Voorbeelden

- `00_wave_lab` — interactieve Wave Lab
- `01_basic_wave` — lijngolf, globale modus
- `02_instance_mode` — instance-modus
- `03_basic_wave_instance` — range-normalisatie
- `04_basic_wave_p2d` — P2D renderer
- `05_basic_wave_webgl` — WEBGL, twee samplers
- `06_seconds_param` — seconds param
- `07_select_by_index` — golf op index selecteren
- `08_triangle_domain` — klein invoerdomein
- `09_range_0_1` — range [0, 1]
- `10_wave_override` — wild-modus
- `11_tick_time_mode` — handmatige tijdsbesturing
- `12_color_spectrum` — wave output als hue / saturatie (HSB)
- `13_sound` — wave output als oscillatorfrequentie (Web Audio)
- `14_typography` — wave output als lettergrootte, lift en doorzichtigheid
- `15_opacity` — wave output als alpha, twee interfererende lagen
- `16_wave_chart` — alle 34 formules als live geanimeerde bars

---

## Versioning

Semantische versienummering. Zie [HISTORY.md](HISTORY.md) voor changelog en v1-migratiegids.

---

## Credits

- `tw@GenerativePunk`, `gh@ffd8` — golfformule-dataset
