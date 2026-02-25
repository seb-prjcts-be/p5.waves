# p5.waves

Wave-sampling hulpfuncties voor p5.js. Geeft altijd een getal terug.

**Snel installeren**
Via script-tag (CDN):
```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.1.1/lib/p5.js"></script>
<script src="https://cdn.jsdelivr.net/gh/seb-prjcts-be/p5.waves@v2.0.0/p5.waves.min.js"></script>
<script src="sketch.js"></script>
```

Vervang `v2.0.0` door de [laatste tag op GitHub](https://github.com/seb-prjcts-be/p5.waves/tags).

Via script-tag (lokaal bestand):
```html
<script src="p5.js"></script>
<script src="p5.waves.js"></script>
<script src="sketch.js"></script>
```

Volgorde is belangrijk. `p5.js` moet vóór `p5.waves.js` laden.

> **Nieuw met waves?** Start met [p5.easywaves](https://github.com/seb-prjcts-be/p5.easywaves) — een vereenvoudigde versie voor beginners. Kom hier terug als je meer controle nodig hebt.

**GitHub Pages voorbeelden**
- Overzichtspagina: `https://seb-prjcts-be.github.io/p5.waves/`
- Direct naar Wave Lab: `https://seb-prjcts-be.github.io/p5.waves/examples/00_wave_lab/`
- Deployment via `.github/workflows/pages.yml` bij pushes naar `main`.

Als Pages nog niet actief is: `Settings` → `Pages` → `Build and deployment` → `Source: GitHub Actions`.

---

## Wat is er nieuw in 2.0.0

**v2 is een volledige herschrijving. v1-aanroepen worden niet meer ondersteund.**

- `wave(y, secondParam)` geeft altijd een **getal** terug. Geen `{x, z}` objecten meer, geen axis-parameter.
- Tijd is **expliciet**: geef `t` mee als optie in plaats van een interne klok.
- `range: [min, max]` vervangt de oude combinatie `normalize + range`.
- 34 gecureerde golven met **unieke namen** (3 bijna-identieke duplicaten uit v1 verwijderd).
- `createSampler(opts).sample(y, t)` geeft een getal terug. Gebruik twee samplers voor 3D.
- `createGrid(cols, rows, opts).sample(t)` geeft een `Float32Array` of `Uint8Array` terug.
- Verwijderd: `setWaveParams`, `setTimeMode`, `tick`, `sample`, `grid`, `seedFrom`, `aliases`, `families`, `getWaveByIndex`, `getWaveByName`, `createGridSampler` (vervangen door `createGrid`).
- Verwijderde parameters: `axis`, `refresh`, `seconds`, `normalize` (bool), `domain`, `samples`, `modulation`.

---

## Wat doet deze bibliotheek

Geeft je een gecureerde lijst van 34 golfformules die je kunt samplen met één getal als invoer.
Elke formule is een kleine wiskundige uitdrukking die `x` als invoer neemt. Jij geeft `y` (jouw positie) mee en krijgt een getal terug.

**Mentaal model**: Denk aan `wave(y)` zoals je aan `noise(y)` in p5.js denkt — geef een coördinaat mee, krijg een getal terug.

---

## Golflijst (34 golven)

| index | naam |
| --- | --- |
| 0 | classic sine |
| 1 | sine |
| 2 | sharp peaks |
| 3 | square |
| 4 | pulse |
| 5 | stepped sine |
| 6 | mountain peaks |
| 7 | valleys |
| 8 | zig-zag sine |
| 9 | batman |
| 10 | offset sine |
| 11 | steps down |
| 12 | steps |
| 13 | squared sine |
| 14 | bumpy sine |
| 15 | wobble sine |
| 16 | up down noise |
| 17 | meta sine |
| 18 | triangle |
| 19 | ramp |
| 20 | saw down |
| 21 | saw up |
| 22 | fade out |
| 23 | grow random |
| 24 | noise |
| 25 | fuzzy pulse |
| 26 | up down pulse |
| 27 | bald patch |
| 28 | fuzzy peak sine |
| 29 | ramp up sine |
| 30 | triangle sine |
| 31 | round linked sine |
| 32 | half sine |
| 33 | smooth solid sine |

**`classic sine` vs `sine`**: Beide zijn zuivere sinusgolven. `classic sine` (index 0) heeft de halve ruimtelijke frequentie met een bredere amplitudeenvelope; `sine` (index 1) voltooit dubbel zoveel cycli bij een kleinere amplitude. Het verschil zit in de ingebakken schaalfactoren van de formule, niet in de golfvorm.

---

## Kern-API

### `Waves.wave(y, tweedeParam)`

Het belangrijkste ingangspunt. Geeft altijd een getal terug.

Mogelijke vormen voor de tweede parameter:

| vorm | betekenis |
| --- | --- |
| `wave(y)` | standaardgolf, seed 0 |
| `wave(y, 3)` | getal → seed 3 bepaalt de golf |
| `wave(y, 'triangle')` | string → golf op naam |
| `wave(y, { wave: 'triangle' })` | opties-object |

Opties (als tweede parameter een object is):

| optie | beschrijving | standaard |
| --- | --- | --- |
| `wave` | golfnaam of index | bepaald door seed |
| `seed` | integer die deterministisch een golfformule selecteert (zie opmerking) | `0` |
| `t` | tijdverschuiving (bv. `millis()/1000`) | `0` |
| `amplitude` | snelle vermenigvuldiging, geen normalisatie | `1` |
| `range` | `[min, max]` normaliseert de uitvoer | `null` (native) |
| `frequency` | invoervermenigvuldiger | `1` |
| `phase` | invoerverschuiving | `0` |
| `mode` | `'stable'` of `'wild'` | `'stable'` |
| `unpredictability` | `0..1`, alleen in wild-modus | `0` |

**Opmerkingen:**

> ⚠️ **Seed vs index — een subtiel verschil:**
> ```js
> wave(y, 3)           // 3 is een seed  → via hash omgezet naar een golfformule
> wave(y, { wave: 3 }) // 3 is een index → selecteert direct de golf op positie 3
> ```
> Een seed doorloopt een hashfunctie om de golf te bepalen; hetzelfde getal als directe index kiest een andere golf. Gebruik `{ wave: 3 }` als je een specifieke golf op index wil, en `wave(y, 3)` (of `{ seed: 3 }`) als je stabiele maar gevarieerde resultaten wil over een reeks objecten.

- **`seed`** is zo genoemd naar analogie met generatieve seeds: één integer bepaalt via FNV-1a-hashing deterministisch één van de 34 golfformules. Het heeft geen invloed op p5's `random()`-functie en staat volledig los van `randomSeed()`.
- Als `range` is opgegeven, wordt de uitvoer genormaliseerd; `amplitude` wordt genegeerd.
- `t` wordt opgeteld bij `y` vóór de formule wordt berekend: `x = (y + t) * frequency + phase`.
- **`unpredictability`** past positieafhankelijke ruis toe op de frequentieschaal, phase-offset en amplitudeenvelope van de invoer tegelijk; bij `1` is de uitvoer sterk vervormd.

Voorbeelden:
```js
wave(y)                                          // getal, seed 0
wave(y, 3)                                       // seed 3 bepaalt golf
wave(y, 'triangle')                              // golf op naam
wave(y, { wave: 'triangle' })                    // opties-vorm
wave(y, { wave: 'triangle', range: [-1, 1] })    // genormaliseerd
wave(y, { range: [0, 255], t: millis()/1000 })   // met tijd
wave(y, { seed: 2, amplitude: 80 })              // seed + snelle schaling
```

---

### `Waves.createSampler(opties)`

Geeft een herbruikbare sampler terug. Accepteert dezelfde opties als `wave()`.

```js
const s = Waves.createSampler({ wave: 'triangle', range: [-80, 80] });
s.sample(y)         // → getal
s.sample(y, t)      // → getal met tijdsverschuiving
```

**Mentaal model:**
- `Waves.wave(y, opties)` — ad hoc: bereken nu één waarde met deze opties.
- `Waves.createSampler(opties)` — maak één keer een instrument, en speel er noten mee via `sample()`.

**Waarom een sampler gebruiken?**

- **Leesbaarheid** — `s.sample(x)` leest als p5's `noise(x)`: één bron, veel samples.
- **Performance** — de configuratie (golf, range, seed, …) wordt eenmalig opgelost. In een 40×40 grid of een lus met 1000 punten roep je enkel `sample()` aan.
- **Herhaalbaarheid** — een vaste `seed` geeft stabiele, reproduceerbare variatie. Onmisbaar voor generatief werk dat je opnieuw wil draaien of exporteren.
- **Onafhankelijke assen** — twee samplers met verschillende seeds geven twee ongerelateerde signalen. Eén sampler voor zowel `ox` als `oz` levert gecorreleerde waarden op — de beweging voelt vlak of te synchroon aan.

Voor 3D (twee onafhankelijke waarden) gebruik je twee samplers met verschillende seeds:
```js
const sx = Waves.createSampler({ seed: 0 });
const sz = Waves.createSampler({ seed: 1 });

// In draw():
const ox = sx.sample(y, frameCount * 0.01);
const oz = sz.sample(y, frameCount * 0.01);
```

Met `seed: 0` en `seed: 1` hebben de twee velden geen correlatie — de beweging voelt ruimtelijk aan in plaats van vlak.

---

### `Waves.createGrid(cols, rows, opties)`

Geeft een grid-sampler terug. `.sample(t)` geeft een getypeerde array terug.

```js
const g = Waves.createGrid(20, 20);
g.sample(t)   // → Float32Array, lengte cols×rows, ruwe waarden

const g2 = Waves.createGrid(20, 20, { range: [0, 1], threshold: 0.5 });
g2.sample(t)  // → Uint8Array van 0/1 (binair)
```

Grid-opties:

| optie | beschrijving | standaard |
| --- | --- | --- |
| `waveRow` | golf voor rijrichting (naam of index) | bepaald door seed |
| `waveCol` | golf voor kolomrichting (naam of index) | bepaald door seed (anders) |
| `seed` | getal voor golfselectie | `0` |
| `range` | `[min, max]` → genormaliseerde Float32Array | `null` (ruw) |
| `threshold` | drempelwaarde → Uint8Array (0/1) | `null` |
| `speed` | tijdsschaalfactor | `1` |

**Hoe waveRow en waveCol gecombineerd worden:** elke celwaarde is de **som** van `waveRow` gesampled op de rijpositie en `waveCol` gesampled op de kolompositie. Beide posities worden vóór het samplen naar `[0, 2π]` gemapt, zodat de twee golven naadloos over het grid tegelen.

Als `threshold` is opgegeven, wordt `range` genegeerd en wordt een `Uint8Array` teruggegeven.

---

### Ontdekking

```js
Waves.list()   // → [{ index, name, algo }, ...]
Waves.count    // → 34
Waves.data     // → ruwe WAVES-array [{ name, algo }, ...]
```

---

### p5 Prototype-methoden

Worden toegevoegd aan `p5.prototype` als p5.js eerst laadt.

```js
p.waves(y, tweedeParam)            // → Waves.wave(y, tweedeParam)
p.createWaveSampler(opts)          // → Waves.createSampler(opts)
p.createWaveGrid(cols, rows, opts) // → Waves.createGrid(cols, rows, opts)
```

In globale modus zijn deze ook beschikbaar zonder `p.`.

---

## Copy-paste template

Plak dit in je sketch, verwijder het commentaarteken voor de regels die je nodig hebt en schrap de rest.

**`Waves.wave()`**
```js
const x = Waves.wave(y, {
  wave:                'classic sine',  // naam of index (0–33); zie Waves.list()
  // seed:             0,               // alternatief: kies golf via seed-integer
  // t:                millis() / 1000, // tijd → drijft animatie; probeer frameCount * 0.01
  // amplitude:        1,               // snelle schaal (geen normalisatie); genegeerd als range is ingesteld
  // range:            [-1, 1],         // normaliseert uitvoer naar [min, max]; overschrijft amplitude
  // frequency:        1,               // invoervermenigvuldiger → nauwere of lossere golfcycli
  // phase:            0,               // invoerverschuiving → verschuif de golf links of rechts
  // mode:             'stable',        // 'stable' (standaard) of 'wild' voor chaotische variatie
  // unpredictability: 0,               // 0..1; alleen actief als mode 'wild' is
});
```

**`Waves.createSampler()`**
```js
const s = Waves.createSampler({
  wave:                'classic sine',  // naam of index (0–33); eenmalig opgelost, hergebruikt bij elk sample
  // seed:             0,               // alternatief: kies golf via seed-integer
  // amplitude:        1,               // snelle schaal; genegeerd als range is ingesteld
  // range:            [-80, 80],       // normaliseert elk sample naar [min, max]
  // frequency:        1,               // invoervermenigvuldiger → nauwere of lossere golfcycli
  // phase:            0,               // invoerverschuiving → verschuif de golf links of rechts
  // mode:             'stable',        // 'stable' of 'wild' voor chaotische variatie
  // unpredictability: 0,               // 0..1; alleen actief als mode 'wild' is
});

s.sample(y);         // → getal; geef positie mee
s.sample(y, t);      // → getal; geef positie + tijd mee (drijft animatie)
```

**`Waves.createGrid()`**
```js
const g = Waves.createGrid(cols, rows, {
  // waveRow:       'classic sine',  // golf voor de rijrichting (naam of index)
  // waveCol:       'triangle',      // golf voor de kolomrichting (naam of index)
  // seed:          0,               // selecteert automatisch waveRow en waveCol (twee verschillende golven)
  // range:         [0, 1],          // normaliseert elke cel naar [min, max] → geeft Float32Array terug
  // threshold:     0.5,             // boven drempel → 1, eronder → 0; geeft Uint8Array; overschrijft range
  // speed:         1,               // tijdsschaalfactor; hoger = snellere animatie
});

const cells = g.sample(t);      // → Float32Array, of Uint8Array als threshold is ingesteld
// cells[rij * g.cols + kolom]  // waarde voor een specifieke cel
```

---

## Gebruikspatronen

**Globale modus — basisgolf:**
```js
function setup() {
  createCanvas(400, 200);
  noFill();
  stroke(0);
}

function draw() {
  background(245);
  beginShape();
  for (let y = 0; y <= height; y += 4) {
    const x = width / 2 + Waves.wave(y, {
      wave:      'classic sine',
      t:         frameCount * 0.5,
      amplitude: 80
    });
    vertex(x, y);
  }
  endShape();
}
```

**Met range-normalisatie:**
```js
for (let y = 0; y < height; y += 10) {
  const x = Waves.wave(y, {
    wave:  'classic sine',
    t:     frameCount * 0.01,
    range: [-120, 120]
  });
  circle(width / 2 + x, y, 5);
}
```

**Range [0, 1] — als positiefractie:**
```js
for (let y = 0; y < height; y += 10) {
  const x01 = Waves.wave(y, {
    wave:  'classic sine',
    t:     frameCount * 0.01,
    range: [0, 1]
  });
  circle(x01 * width, y, 5);
}
```

**Instance-modus:**
```js
new p5(function (p) {
  p.setup = function () {
    p.createCanvas(400, 200);
    p.noFill();
    p.stroke(0);
  };

  p.draw = function () {
    p.background(245);
    p.beginShape();
    for (let y = 0; y <= p.height; y += 4) {
      const x = p.width / 2 + p.waves(y, {
        wave:      'classic sine',
        t:         p.frameCount * 0.5,
        amplitude: 80
      });
      p.vertex(x, y);
    }
    p.endShape();
  };
});
```

**WEBGL — twee samplers voor x/z-verschuivingen:**
```js
let samplerX, samplerZ;

function setup() {
  createCanvas(600, 600, WEBGL);
  noStroke();
  fill(0);
  samplerX = Waves.createSampler({ seed: 0, range: [-80, 80] });
  samplerZ = Waves.createSampler({ seed: 1, range: [-80, 80] });
}

function draw() {
  background(245);
  rotateY(frameCount * 0.01);
  const t = frameCount * 0.01;
  for (let y = -200; y <= 200; y += 30) {
    for (let x = -200; x <= 200; x += 30) {
      const ox = samplerX.sample(y, t);
      const oz = samplerZ.sample(y, t);
      push();
      translate(x + ox, 0, y + oz);
      sphere(4);
      pop();
    }
  }
}
```

**Grid (binaire drempelwaarde):**
```js
let g;

function setup() {
  createCanvas(560, 560);
  g = Waves.createGrid(14, 14, { threshold: 0, speed: 1 });
}

function draw() {
  background(245);
  const cells = g.sample(frameCount * 0.02);
  const cell  = min(width / g.cols, height / g.rows);
  const ox    = (width  - g.cols * cell) * 0.5;
  const oy    = (height - g.rows * cell) * 0.5;
  noStroke();
  for (let r = 0; r < g.rows; r++) {
    for (let c = 0; c < g.cols; c++) {
      fill(cells[r * g.cols + c] === 1 ? 0 : 255);
      rect(ox + c * cell, oy + r * cell, cell, cell);
    }
  }
}
```

**Wild-modus:**
```js
for (let y = 0; y < height; y += 10) {
  const x = Waves.wave(y, {
    wave:             'pulse',
    t:                frameCount * 0.01,
    mode:             'wild',
    unpredictability: 0.45,
    range:            [-160, 160]
  });
  circle(width / 2 + x, y, 5);
}
```

**Handmatige tijdsbesturing (vervangt v1 tick-modus):**
```js
let simTime = 0;

function setup() {
  createCanvas(600, 600);
  noStroke();
  fill(0);
}

function draw() {
  background(245);
  simTime += 1 / 30;  // vaste tijdstap ongeacht de echte framerate
  for (let y = 0; y < height; y += 10) {
    const x = Waves.wave(y, {
      wave:  'classic sine',
      t:     simTime * 6,
      range: [-120, 120]
    });
    circle(width / 2 + x, y, 5);
  }
}
```

**Opnemen / exporteren:**
```js
function setup() {
  createCanvas(600, 600);
  noStroke();
  fill(0);
  frameRate(6);   // vertraag de renderer voor schermopname / GIF-tools
}

function draw() {
  background(245);
  for (let y = 0; y < height; y += 10) {
    // houd de t-vermenigvuldiger klein zodat de beweging past bij de lagere framerate
    const x = Waves.wave(y, { wave: 'classic sine', t: frameCount * 0.003, range: [-120, 120] });
    circle(width / 2 + x, y, 5);
  }
}
```

Twee onafhankelijke knoppen:
- **`t`-vermenigvuldiger** — bepaalt hoe snel de golf beweegt (bewegingssnelheid).
- **`frameRate(n)`** — bepaalt hoeveel frames per seconde p5 tekent (opnamesnelheid).

Verlaag `frameRate()` als je schermopname- of GIF-tool tijd nodig heeft om elk frame te vangen. De Wave Lab heeft een **Frame Rate**-selector (60 / 30 / 12 / 6 / 2 fps) in het Render-paneel.

---

## Voorbeelden

- `examples/00_wave_lab` — interactieve verkenner (Wave Lab)
- `examples/01_basic_wave` — lijngolf, globale modus
- `examples/02_instance_mode` — lijngolf, instance-modus
- `examples/03_basic_wave_instance` — range-normalisatie, instance-modus
- `examples/04_basic_wave_p2d` — P2D renderer
- `examples/05_basic_wave_webgl` — WEBGL met twee samplers
- `examples/06_seconds_param` — createSampler hergebruik
- `examples/07_select_by_index` — golf selecteren op index
- `examples/08_triangle_domain` — klein invoerdomein
- `examples/09_range_0_1` — range [0, 1]
- `examples/10_wave_override` — wild-modus
- `examples/11_tick_time_mode` — handmatige tijdsbesturing

---

## Veilig gebruik

Aanbevolen — geen naamconflicten:
```js
Waves.wave(...)
Waves.createSampler(...)
p.waves(...)    // instance-modus
```

Deze bibliotheek definieert `window.wave` niet.

---

## p5.js Bibliotheekrichtlijnen

p5.waves volgt de [p5.js addon-bibliotheekrichtlijnen](https://p5js.org/contribute/creating_libraries/):

| Vereiste | Status |
| --- | --- |
| Bestandsnaampatroon `p5.featurename.js` | ✓ `p5.waves.js` / `p5.waves.min.js` |
| Prototype-methoden gebruiken `function()`, geen arrow functions | ✓ correcte `this`-binding in instance-modus |
| Overschrijft geen bestaande p5.js-methoden | ✓ voegt enkel `waves`, `createWaveSampler`, `createWaveGrid` toe |
| Overschaduwt geen native JS-objecten (`Math`, `console`, …) | ✓ |
| p5.js moet vóór de bibliotheek laden | ✓ hierboven gedocumenteerd |
| Enkelvoudig bestand + geminificeerde versie | ✓ |
| Werkende voorbeelden | ✓ 12 voorbeelden (00–11) |

---

## Versioning

Semantische versienummering. Grote releases kunnen uitvoer wijzigen of functies verwijderen.

---

## Makers en bijdragers (golfformules)

- `tw@GenerativePunk` (originele dataset-bijdrager)
- `gh@ffd8` (originele dataset-bijdrager)
- Referentie voor rechthoekige/pulse-formules: https://titanwolf.org/Network/Articles/Article?AID=b5a3e4c8-1939-4fcb-aab8-8ff126c895da#gsc.tab=0
- Referentie voor driehoeksformule: https://editor.p5js.org/jeremydouglass/sketches/fE0UWUEg
