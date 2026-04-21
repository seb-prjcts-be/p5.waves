# p5.waves

**[Open site](https://seb-prjcts-be.github.io/p5.waves/)** · **[Wave Lab](https://seb-prjcts-be.github.io/p5.waves/examples/wave_lab/)**

34 golfvormen voor p5.js. Eén functie-aanroep, één getal terug.

**Vereist p5.js 2.x** (getest met 2.2.2). Niet compatibel met p5.js 1.x.

## Installeren

```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.2.2/lib/p5.js"></script>
<script src="https://cdn.jsdelivr.net/gh/seb-prjcts-be/p5.waves@v3.1.0/p5.waves.min.js"></script>
```

## Snel starten

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

## Drie manieren om het te gebruiken

```js
Waves.wave(x)                       // willekeurige golf
Waves.wave(x, 'triangle')           // kies op naam
Waves.wave(x, { wave: 'triangle', t: millis() / 1000, amplitude: 50 })
```

Geeft altijd één getal terug.

## Opties

### Belangrijk

| optie | wat het doet | standaard |
|---|---|---|
| `wave` | Welke vorm. Naam, index (0-33), of `['a', 'b']` om te blenden. | willekeurig |
| `t` | Tijd. Laat de golf bewegen. Geef `millis() / 1000` mee. | `0` |
| `amplitude` | Hoe hoog. Output: `[-amplitude, +amplitude]`. | `100` |

### Handig

| optie | wat het doet | standaard |
|---|---|---|
| `range` | Map output naar `[min, max]`. Overschrijft amplitude. | `null` |
| `frequency` | Hoe dicht de cycli op elkaar zitten. Hoger = samengedrukt. | `1` |
| `seed` | Kies een golf via een getal. Zelfde seed = zelfde golf. | `0` |
| `shift` | `true` = wissel automatisch naar willekeurige golven met vloeiende overgang. | `false` |

### Geavanceerd

| optie | wat het doet | standaard |
|---|---|---|
| `phase` | Verschuif de golf zijwaarts. | `0` |
| `mode` | `'stable'` of `'wild'` (voegt wankeling toe). | `'stable'` |
| `unpredictability` | Hoeveel wankeling in wild mode. 0-1. | `0` |
| `mix` | Blendfactor wanneer `wave` is `['a', 'b']`. 0-1. | `0.5` |
| `shiftInterval` | Eenheden van `t` per golf vasthouden. | `3` |
| `shiftDuration` | Eenheden van `t` voor de overgang. | `1` |

> **Seed vs index:** `Waves.wave(x, 3)`  - 3 is een seed (gehasht). `Waves.wave(x, { wave: 3 })` - 3 is een directe index.

---

## Wave Shift

De hoofdfunctie. Eén vlag en de golf wisselt automatisch naar een willekeurige formule om de paar seconden.

```js
let sampler = Waves.createSampler({
  shift: true,
  amplitude: 60
});

// In draw:
sampler.sample(y, t);
sampler.waveName;      // huidige golf
sampler.shifting;      // true tijdens overgang
sampler.targetName;    // volgende golf
sampler.mix;           // voortgang 0-1
```

---

## createSampler()

Eenmaal instellen, vaak `.sample()` aanroepen. Handig voor lussen en deeltjes.

```js
let s = Waves.createSampler({ wave: 'triangle', range: [-80, 80] });
s.sample(y);          // op positie y
s.sample(y, t);       // met tijd
s.sample(y, t, mix);  // morph: blend overschrijven
```

Zelfde opties als `Waves.wave()`.

---

## createGrid()

Vul een 2D-raster met golfwaarden in één aanroep.

Elke celwaarde is de **som** van `waveRow` geëvalueerd op de rij en `waveCol` geëvalueerd op de kolom: `cel = waveRow(rij) + waveCol(kolom)`. Twee sines geven interferentiepatronen; twee pulsen geven een schaakbord.

```js
let g = Waves.createGrid(20, 20, { threshold: 0, speed: 1 });
let cells = g.sample(t);  // Uint8Array van 0/1
// cells[row * g.cols + col]
```

| optie | wat het doet | standaard |
|---|---|---|
| `waveRow` | Golf voor rijen. | willekeurig |
| `waveCol` | Golf voor kolommen. | willekeurig |
| `seed` | Kiest automatisch twee verschillende golven. | `0` |
| `range` | `[min, max]` -> Float32Array. | `null` |
| `threshold` | Binaire modus -> Uint8Array. Overschrijft range. | `null` |
| `speed` | Tijdschaalfactor. | `1` |

De output-array wordt **hergebruikt** tussen aanroepen. Kopieer als je het wilt bewaren.

---

## API-toegang

| altijd beschikbaar | p5 global mode | p5 instance mode |
|---|---|---|
| `Waves.wave(y, opts)` | `waves(y, opts)` | `p.waves(y, opts)` |
| `Waves.createSampler(opts)` | `createWaveSampler(opts)` | `p.createWaveSampler(opts)` |
| `Waves.createGrid(c, r, opts)` | `createWaveGrid(c, r, opts)` | `p.createWaveGrid(c, r, opts)` |

Ook: `Waves.list()`, `Waves.count` (34), `Waves.data`, `Waves.benchmark(config, n)`.

---

## Alle 34 golven

`classic sine · sine · sharp peaks · square · pulse · stepped sine · mountain peaks · valleys · zig-zag sine · batman · offset sine · steps down · steps · squared sine · bumpy sine · wobble sine · up down noise · meta sine · triangle · ramp · saw down · saw up · fade out · grow random · noise · fuzzy pulse · up down pulse · bald patch · fuzzy peak sine · ramp up sine · triangle sine · round linked sine · half sine · smooth solid sine`

---

## Voorbeelden

- `wave_lab` - interactieve speeltuin
- `wave_shift` - auto-wisselende golfformules
- `wave_params` - amplitude, frequency, phase
- `wild_mode` - wild mode
- `flow_fields` - ASCII stroomveld
- `time_strata` - handmatige tijdcontrole
- `color_field` - HSB kleurveld
- `morph_wave` - morph tussen twee golven
- `random_walker` - golf-gestuurde walker
- `3d_wave_volume` - 3D WebGL

---

## Credits

- `tw@GenerativePunk`, `gh@ffd8` ([Ted Davis](https://teddavis.org), [Oscillation Sandbox](https://github.com/ffd8/oscillation-sandbox)) - golfformule dataset

Ontwikkeld door Sebastien Vanblaere.
