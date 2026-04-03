# p5.waves

**[Open site](https://seb-prjcts-be.github.io/p5.waves/)**

Wave-sampling hulpfuncties voor p5.js. Geeft altijd een getal terug.

**Installeren**
```html
<script src="https://cdn.jsdelivr.net/gh/seb-prjcts-be/p5.waves@v3.0.0/p5.waves.min.js"></script>
```

Vervang `v3.0.0` door de [laatste tag](https://github.com/seb-prjcts-be/p5.waves/tags).

**[Wave Lab](https://seb-prjcts-be.github.io/p5.waves/examples/00_wave_lab/)** — verken alle 34 golven interactief.

---

## Wat het doet

34 golfformules, gesampled met één getal. Vergelijkbaar met `noise(y)` — geef een coördinaat mee, krijg een getal terug.

```js
Waves.wave(y)
Waves.wave(y, 'triangle')
Waves.wave(y, { wave: 'classic sine', range: [-1, 1], t: millis() / 1000 })
```

Eén x erin, één getal eruit. Gebruik het in een lus om een golflijn te tekenen:

```js
function draw() {
  background(245);
  beginShape();
  for (let x = 0; x < width; x += 4) {
    let y = Waves.wave(x, {
      wave: 'classic sine',
      t: millis() / 1000,
      amplitude: 40
    });
    vertex(x, height / 2 + y);
  }
  endShape();
}
```

---

## API-overzicht

Drie manieren om dezelfde functies aan te roepen:

| context | wave | sampler | grid |
|---|---|---|---|
| Namespace (altijd) | `Waves.wave(y, opts)` | `Waves.createSampler(opts)` | `Waves.createGrid(c, r, opts)` |
| p5 globale modus | `waves(y, opts)` | `createWaveSampler(opts)` | `createWaveGrid(c, r, opts)` |
| p5 instance-modus | `p.waves(y, opts)` | `p.createWaveSampler(opts)` | `p.createWaveGrid(c, r, opts)` |

Extra properties op het `Waves`-object:

| property / methode | geeft terug | beschrijving |
|---|---|---|
| `Waves.list()` | `[{ index, name, algo }, ...]` | Alle 34 golfformules |
| `Waves.count` | `34` | Aantal formules |
| `Waves.data` | `[{ name, algo }, ...]` | Ruwe interne WAVES-array |
| `Waves.benchmark(config, n)` | `{ iterations, ms, callsPerMs }` | Meet de prestaties van een golfconfiguratie |

---

### `Waves.wave(y, tweedeParam)`

| vorm | betekenis |
| --- | --- |
| `Waves.wave(y)` | standaardgolf, seed 0 |
| `Waves.wave(y, 3)` | seed 3 bepaalt de golf |
| `Waves.wave(y, 'triangle')` | golf op naam |
| `Waves.wave(y, { wave: 'triangle' })` | opties-object |
| `Waves.wave(y, { wave: ['sine', 'triangle'], mix: 0.5 })` | morph tussen twee golven |

Alle opties:

| optie | type | beschrijving | standaard |
| --- | --- | --- | --- |
| `wave` | string, number, of array | Naam, index (0–33), of morph-paar `['a', 'b']` | bepaald door seed |
| `seed` | number | Selecteert golf via FNV-1a hash | `0` |
| `t` | number | Tijdverschuiving — drijft animatie. Geef `millis()/1000` mee. De library verhoogt `t` nooit intern. | `0` |
| `amplitude` | number | Uitvoervermenigvuldiger. Alle formules worden genormaliseerd naar [-1, 1], daarna geschaald: `amplitude: N` → [-N, N]. Genegeerd als `range` is ingesteld. | `100` |
| `range` | `[min, max]` | Normaliseert uitvoer naar dit interval. Overschrijft `amplitude`. | `null` |
| `frequency` | number | Invoervermenigvuldiger — nauwere of lossere golfcycli. | `1` |
| `phase` | number | Invoerverschuiving — verschuift de golf links of rechts. | `0` |
| `mode` | string | `'stable'` of `'wild'` — wild injecteert positie-afhankelijke ruis. | `'stable'` |
| `unpredictability` | number | 0–1 intensiteit voor wild-modus. Geen effect in stable-modus. | `0` |
| `mix` | number | 0–1 blendfactor wanneer `wave` een array is. 0 = eerste golf, 1 = tweede. | `0.5` |
| `shift` | boolean | Wissel automatisch tussen willekeurige formules met vloeiende morph-overgangen. | `false` |
| `shiftInterval` | number | Seconden vasthouden per golf vóór morphing. | `3` |
| `shiftDuration` | number | Seconden voor de morph-overgang. | `1` |

> `Waves.wave(y, 3)` — 3 is een **seed** (via hash omgezet naar een golf). `Waves.wave(y, { wave: 3 })` — 3 is een directe **index**.

Geeft altijd één getal terug. Alle formules worden stilzwijgend genormaliseerd naar [-1, 1] vóór amplitudeschaling. Intern: `x = (y + t) × frequency + phase`. Als `range` is ingesteld, wordt `amplitude` genegeerd.

**Morph:** geef `wave: ['sine', 'triangle']` mee met `mix: 0..1` om twee formules te blenden. Beide waarden worden onafhankelijk genormaliseerd vóór interpolatie. `range` wordt ondersteund in morph-modus.

---

### `Waves.createSampler(opties)`

Configuratie eenmalig opgelost, hergebruikt bij elke `.sample()`-aanroep. Accepteert alle opties van `Waves.wave()`.

```js
const s = Waves.createSampler({ wave: 'triangle', range: [-80, 80] });
s.sample(y)          // → getal
s.sample(y, t)       // → getal met tijdsverschuiving
s.sample(y, t, mix)  // → getal met tijd en morph-blend (alleen morph-modus)
```

**Standaard sampler return:**

| property / methode | beschrijving |
|---|---|
| `.sample(y)` | Evalueer op positie y (gebruikt standaard t van creatie) |
| `.sample(y, t)` | Evalueer met expliciete tijd |
| `.sample(y, t, mix)` | Morph-modus — overschrijf blendfactor per aanroep |
| `.waveIndex` | Opgeloste golfindex (number, of `[a, b]` voor morph) |
| `.waveName` | Opgeloste golfnaam (toont `'sine → triangle'` voor morph) |

**Shift-sampler** — geef `shift: true` mee om automatisch te wisselen:

```js
const s = Waves.createSampler({ shift: true, amplitude: 60 });
s.sample(y, t);      // wisselt elke 3 s, morft over 1 s
```

| optie | standaard | betekenis |
|---|---|---|
| `shift` | `false` | Automatisch wisselen inschakelen |
| `shiftInterval` | `3` | Seconden vasthouden per golf |
| `shiftDuration` | `1` | Seconden voor de morph-overgang |

Extra getters van de shift-sampler:

| getter | geeft terug |
|---|---|
| `.waveIndex` | Huidige formule-index |
| `.waveName` | Huidige formulenaam |
| `.targetName` | Volgende formulenaam (tijdens morph) |
| `.mix` | Morph-voortgang 0–1 |
| `.shifting` | `true` tijdens morphing |

Voor twee onafhankelijke assen (bv. WEBGL x/z), gebruik twee samplers met verschillende seeds:
```js
const sx = Waves.createSampler({ seed: 0, range: [-80, 80] });
const sz = Waves.createSampler({ seed: 1, range: [-80, 80] });
```

---

### `Waves.createGrid(cols, rows, opties)`

`.sample(t)` geeft een getypeerde array terug. De uitvoerarray wordt **hergebruikt** tussen aanroepen — kopieer als je een snapshot wilt bewaren: `new Float32Array(g.sample(t))`.

```js
const g = Waves.createGrid(20, 20, { range: [0, 1] });
g.sample(t)  // → Float32Array, lengte cols×rows
```

Met `threshold` geeft het een `Uint8Array` van 0/1 waarden terug (overschrijft `range`).

Opties:

| optie | type | beschrijving | standaard |
| --- | --- | --- | --- |
| `waveRow` | string of number | Golf voor rijrichting (naam of index) | bepaald door seed |
| `waveCol` | string of number | Golf voor kolomrichting (naam of index) | bepaald door seed (anders) |
| `seed` | number | Selecteert automatisch twee verschillende golven | `0` |
| `range` | `[min, max]` | Normaliseert uitvoer → `Float32Array` | `null` |
| `threshold` | number | Cellen erboven → 1, eronder → 0 → `Uint8Array`. Overschrijft `range`. | `null` |
| `speed` | number | Tijdsschaalfactor voor `.sample(t)` | `1` |

Return-waarde:

| property / methode | beschrijving |
|---|---|
| `.cols` | Aantal kolommen |
| `.rows` | Aantal rijen |
| `.sample(t)` | Evalueer volledig grid op tijd t → `Float32Array` of `Uint8Array`, lengte = cols × rows |

Celwaarde = som van `waveRow` op de rijpositie + `waveCol` op de kolompositie, beiden gemapt naar `[0, 2π]`. Gridgrootte is soft-gelimiteerd tot 250×250 (62.500 cellen) — grotere grids triggeren een console-waarschuwing.

---

### `Waves.benchmark(config, iterations)`

Meet de prestaties van elke golfconfiguratie.

```js
Waves.benchmark()                                           // → standaardgolf, 10000 iteraties
Waves.benchmark({ wave: 'sine', range: [-1, 1] })           // → specifieke config
Waves.benchmark({ mode: 'wild', unpredictability: 1 }, 50000) // → aangepast aantal
// Geeft terug: { iterations: 50000, ms: 52.1, callsPerMs: 960 }
```

---

## Prestaties

| feature | relatieve kost | opmerkingen |
|---|---|---|
| `wave(y)` | 1× | Basis — enkele formule-evaluatie |
| `wave(y, { range })` | ~1.2× | Voegt een stats-lookup toe (gecacht na eerste aanroep) |
| `wave(y, { wave: ['a','b'], mix })` | 2× | Twee formule-evaluaties + interpolatie |
| `wave(y, { shift: true })` tijdens overgang | 2× | Twee formules + smoothstep-blending |
| `wave(y, { mode: 'wild' })` | ~5× | 4 extra ruis-evaluaties per sample |
| `createGrid(n, m).sample(t)` | n × m × bovenstaande | Elke cel is een volledige evaluatie |

Tips:
- Gebruik `createSampler()` bij herhaalde aanroepen met dezelfde config — lost parameters eenmalig op.
- `createGrid()` hergebruikt de uitvoerarray. Kopieer als je het wilt bewaren.
- Gebruik `Waves.benchmark()` om je specifieke configuratie te meten.

---

## Copy-paste templates

### Compact — snelle one-liners

```js
Waves.wave(y, 'triangle')
Waves.wave(y, { wave: 'sine', t: millis() / 1000, range: [-1, 1] })

const s = Waves.createSampler({ shift: true, amplitude: 60 });
s.sample(y, t);
```

### Volledig — één argument per lijn

**`Waves.wave()`**
```js
const x = Waves.wave(y, {
  wave:                'classic sine',  // naam, index 0–33, of ['a', 'b'] voor morph
  // seed:             0,               // alternatief: kies golf via seed
  // t:                millis() / 1000, // drijft animatie
  // amplitude:        100,             // snelle schaal; genegeerd als range is ingesteld
  // range:            [-1, 1],         // normaliseert uitvoer; overschrijft amplitude
  // frequency:        1,               // nauwere of lossere cycli
  // phase:            0,               // verschuif golf links of rechts
  // mode:             'stable',        // 'stable' of 'wild'
  // unpredictability: 0,               // 0..1; alleen wild-modus
  // mix:              0.5,             // 0..1; morph-blend (als wave een array is)
  // shift:            false,           // automatisch wisselen tussen golven
  // shiftInterval:    3,               // seconden vasthouden per golf
  // shiftDuration:    1,               // seconden voor morph-overgang
});
```

**`Waves.createSampler()`**
```js
const s = Waves.createSampler({
  wave:                'classic sine',
  // seed:             0,
  // t:                0,               // standaard t als .sample(y) zonder t wordt aangeroepen
  // amplitude:        100,
  // range:            [-80, 80],
  // frequency:        1,
  // phase:            0,
  // mode:             'stable',
  // unpredictability: 0,
  // mix:              0.5,             // standaard morph-blend
  // shift:            false,
  // shiftInterval:    3,
  // shiftDuration:    1,
});
s.sample(y);          // → getal (gebruikt standaard t)
s.sample(y, t);       // → getal met expliciete tijd
s.sample(y, t, mix);  // → getal met tijd en morph-blend
s.waveIndex;          // → opgeloste golfindex
s.waveName;           // → opgeloste golfnaam
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
const cells = g.sample(t);  // → Float32Array of Uint8Array (hergebruikte buffer)
g.cols;                      // → aantal kolommen
g.rows;                      // → aantal rijen
```

**`Waves.benchmark()`**
```js
Waves.benchmark()                                           // → standaard, 10000 iteraties
Waves.benchmark({ wave: 'sine', range: [-1, 1] })           // → specifieke config
Waves.benchmark({ mode: 'wild', unpredictability: 1 }, 50000) // → aangepast aantal
// Geeft terug: { iterations, ms, callsPerMs }
```

---

## Voorbeelden

De **[Voorbeeldenpagina](https://seb-prjcts-be.github.io/p5.waves/docs/examples.html)** is een geanimeerde galerij — elke sectie toont een kleine live miniatuur en linkt naar de volledige zelfstandige pagina met code.

Zelfstandige voorbeelden:

- `00_wave_lab` — interactieve Wave Lab
- `01_basic_wave` — lijngolf, globale modus
- `02_instance_mode` — instance-modus
- `03_basic_wave_instance` — range-normalisatie
- `04_basic_wave_p2d` — P2D renderer
- `05_basic_wave_webgl` — WEBGL, twee samplers
- `06_flow_fields` — flow fields (createSampler × 4)
- `07_wave_params` — amplitude · frequentie · fase
- `08_triangle_domain` — klein invoerdomein
- `09_range_0_1` — range [0, 1]
- `10_wave_override` — wild-modus
- `11_tick_time_mode` — handmatige tijdsbesturing
- `12_color_spectrum` — wave output als hue / saturatie (HSB)
- `14_typography` — wave output als lettergrootte, lift en doorzichtigheid
- `15_opacity` — wave output als alpha, twee interfererende lagen
- `17_3d_wave_volume` — 3D puntrooster, golfcycling (WEBGL)

---

## Versioning

Semantische versienummering. Zie [HISTORY.md](HISTORY.md) voor changelog en v1-migratiegids.

---

## Credits

- `tw@GenerativePunk`, `gh@ffd8` — golfformule-dataset
