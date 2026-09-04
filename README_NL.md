# p5.waves

**[Open site](https://seb-prjcts-be.github.io/p5.waves/)** · **[Wave Lab](https://seb-prjcts-be.github.io/p5.waves_lab/)** · **[Processing (Java) port](https://github.com/seb-prjcts-be/processing.waves)**

35 golfvormen voor p5.js. Eén functie-aanroep, één getal terug.

**Geoptimaliseerd voor p5.js 2.x** (getest met 2.2.2). Werkt ook met p5.js 1.x.

**CSP-veilig.** De library bevat geen `eval` of `new Function` en draait dus onder een strikte Content-Security-Policy zonder `'unsafe-eval'`.

## Installeren

```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.2.2/lib/p5.js"></script>
<script src="https://cdn.jsdelivr.net/gh/seb-prjcts-be/p5.waves@v3.6.0/p5.waves.min.js"
        integrity="sha384-dHdUC+3z6CdPzSv5Nc0Euww+a51g/8mZsDZYSDBisghUfCsdbg4ynknr5q/f+u41"
        crossorigin="anonymous"></script>
```

De gepinde versie + `integrity`-hash garandeert dat de browser alleen het exacte gepubliceerde bestand uitvoert. Liever automatische updates dan die garantie? Gebruik dan `@latest` (zonder `integrity` — het bestand verandert per release):

```html
<script src="https://cdn.jsdelivr.net/gh/seb-prjcts-be/p5.waves@latest/p5.waves.min.js"></script>
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
Waves.wave(x)                       // standaardgolf (seed 0)
Waves.wave(x, 'triangle')           // kies op naam
Waves.wave(x, { wave: 'triangle', t: millis() / 1000, amplitude: 50 })
```

Geeft altijd één getal terug.

## Opties

### Belangrijk

| optie | wat het doet | standaard |
|---|---|---|
| `wave` | Welke vorm. Naam, index (0-33), of `['a', 'b']` om te blenden. Laat je hem weg, dan krijg je de `seed`-pick. | seed 0 |
| `t` | Tijd. Laat de golf bewegen. Geef `millis() / 1000` mee. | `0` |
| `amplitude` | Hoe hoog. Output: `[-amplitude, +amplitude]`. | `100` |

### Handig

| optie | wat het doet | standaard |
|---|---|---|
| `range` | Map output naar `[min, max]`. Overschrijft amplitude. | `null` |
| `frequency` | Vermenigvuldigt `x`. Bij sinussen: hoger = samengedrukt. Niet bij elke golf &mdash; zie de guide. | `1` |
| `seed` | Kies een golf via een getal. Zelfde seed = zelfde golf. | `0` |
| `shift` | `true` = wissel automatisch naar willekeurige golven met vloeiende overgang. | `false` |
| `group` | Welke pool `shift` / `seed` mag kiezen: `'gentle'`, `'harsh'`, `'closing'` (experimenteel), `'ghost'` (experimenteel, 6 gecureerde closing-golven), `'all'`, of `['sine', 'triangle']`. | `'all'` |

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

### Kies een pool met `group`

Standaard kan `shift` op alle 35 formules landen, inclusief tan/noise-spikes. Beperk de pool:

```js
Waves.createSampler({ shift: true, group: 'gentle' });  // alleen sinussen & curves (26 golven)
Waves.createSampler({ shift: true, group: 'harsh' });   // alleen tan/noise/random/unbounded/erratic (9 golven)
Waves.createSampler({ shift: true, group: 'closing' }); // 19 golven die op dezelfde sweep sluiten (experimenteel)
Waves.createSampler({ shift: true, group: 'ghost' });   // 6 gecureerde closing-golven voor Ghost Delay (experimenteel)
Waves.createSampler({ shift: true, group: ['sine', 'triangle', 'batman'] });  // eigen lijst
```

> **`mode` vs `group`, verwar ze niet.** `mode: 'wild'` vervormt *één* golf (frequency + phase + amplitude noise). `group: 'harsh'` kiest een *ander soort golf* (de formules met ingebakken spikes). Ze zijn orthogonaal: `{ mode: 'wild', group: 'gentle' }` = ademende sinussen, geen spikes.

### Gesloten blijven tijdens het shiften (`group: 'closing'`)

Een ring die je met `shift` samplet, scheurt normaal zijn naad open zodra hij op een nieuwe golf landt: elke formule heeft zijn eigen periode, dus een vaste sweep-lengte klopt niet meer. De `'closing'`-pool lost dat op. Alle 19 golven erin delen één basis-periode (`62.8319`, dat is `2π/0.1`), dus een sweep van `sampler.period × lobes` sluit naadloos dwars door elke transitie heen. De vorm blijft morphen en toont nooit een naad.

```js
const ring = Waves.createSampler({ shift: true, group: 'closing', amplitude: 30 });

function draw() {
  translate(width / 2, height / 2);
  const sweep = ring.period * 8;          // 8 lobes, blijft kloppen door elke shift
  beginShape();
  for (let i = 0; i < 240; i++) {
    const a = (i / 240) * TWO_PI;
    const r = 180 + ring.sample(i / 240 * sweep, millis() / 1000);
    vertex(r * cos(a), r * sin(a));
  }
  endShape(CLOSE);
}
```

`sampler.period` en `sampler.targetPeriod` geven de gemeten periode van de huidige en volgende golf (beide geven de stabiele basis voor een closing-pool, `null` voor niet-periodieke golven). Experimenteel in 3.3.0: periodewaarden kunnen ~0.001 verschuiven in minor-versies. Prima voor beeld, niet voor plotters of CNC.

---

## Binaire velden

Combineer twee samplers en je krijgt 2D-patronen. Handig voor achtergronden, monitor-panelen, organische texturen, of fingerprint-beelden waarin elk wave-paar zijn eigen herkenbare spoor laat.

De recipe: twee samplers (één voor rijen, één voor kolommen), sommeer per cel, threshold het resultaat. Elke cel wordt `(rowSampler(row) + colSampler(col)) > threshold`. True is "aan", false is "uit". Twee sines geven interferentiepatronen. Twee pulsen geven een schaakbord. Een sine plus een puls geeft strepen. De library biedt bewust geen grid-wrapper. De nested loop is kort genoeg om zelf te schrijven, en dat geeft je volledige controle over animatie, layering, en per-cel rendering.

```js
const rowS = Waves.createSampler({ wave: 'classic sine', range: [-1, 1] });
const colS = Waves.createSampler({ wave: 'triangle',     range: [-1, 1] });

function draw() {
  const t = millis() / 1000;
  for (let row = 0; row < rows; row++) {
    const rv = rowS.sample(row * 5 + t);   // x-stap ~ één wave-periode
    for (let col = 0; col < cols; col++) {
      const cv = colS.sample(col * 2.5 - t);
      fill((rv + cv) > 0 ? 0 : 245);       // threshold
      rect(col * cw, row * ch, cw, ch);
    }
  }
}
```

### Variaties

- **Shift mode.** Zet `shift: true` op elke sampler en het wave-paar evolueert over tijd. Het karakter van het veld verandert elke paar seconden. Geen twee snapshots zijn hetzelfde.
- **Threshold afstellen.** `> 0` geeft ongeveer 50/50 voor symmetrische waves. `> 0.12` maakt "aan" schaarser. `> -0.12` maakt het dichter. Asymmetrische waves (saw, triangle) scheven de balans. Daardoor krijgt elk paar een eigen, herkenbaar karakter.
- **Analoog veld.** Vervang de binaire `fill()` door een kleurmapping op basis van de sum-waarde direct. Zelfde patroon, vloeiend gradient in plaats van aan/uit.

De `docs/about.html` origin-grid (de sketch waarmee p5.waves begon) is het eenvoudigste referentievoorbeeld. Binaire velden zijn een goede kandidaat voor het [Wave Lab](https://seb-prjcts-be.github.io/p5.waves_lab/). Verschillende wave-pools, threshold-waarden en shift-snelheden naast elkaar laten zien welk visueel karakter elke combinatie produceert.

---

## API-toegang

| altijd beschikbaar | p5 global mode | p5 instance mode |
|---|---|---|
| `Waves.wave(y, opts)` | `waves(y, opts)` | `p.waves(y, opts)` |
| `Waves.createSampler(opts)` | `createWaveSampler(opts)` | `p.createWaveSampler(opts)` |

Ook: `Waves.list()`, `Waves.count` (35), `Waves.data`, `Waves.benchmark(config, n)`.

---

## Alle 35 golven

`classic sine · sine · sharp peaks · square · pulse · stepped sine · mountain peaks · valleys · zig-zag sine · batman · offset sine · steps down · steps · squared sine · bumpy sine · wobble sine · up down noise · meta sine · triangle · ramp · saw down · saw up · shake out · grow random · noise · fuzzy pulse · up down pulse · bald patch · fuzzy peak sine · ramp up sine · triangle sine · round linked sine · half sine · smooth solid sine · spike sine`

Elke periodieke golf heeft een gemeten periode op de [Waves-pagina](https://seb-prjcts-be.github.io/p5.waves/docs/waves.html#periodicity). Vermenigvuldig die periode met een geheel aantal lobes om gekromde vormen zonder naad te sluiten. De [periodicity-testharness](https://seb-prjcts-be.github.io/p5.waves/docs/periodicity.html) herverifieert deze waarden in de browser.

---

## Voorbeelden

- `wave_shift` - auto-wisselende golfformules
- `wave_params` - amplitude, frequency, phase
- `wild_mode` - wild mode
- `flow_fields` - ASCII stroomveld
- `time_strata` - handmatige tijdcontrole
- `color_field` - RGB static field (basis + veld per kanaal)
- `morph_wave` - morph tussen twee golven
- `random_walker` - golf-gestuurde walker
- `spiky_lissajous` - sluitende Lissajous met een spiky golf
- `ghost_delay` - één golf tegen een vertraagde kopie van zichzelf, sluit tot een lus-ring
- `spirograph` - een rolkromme (epi-/hypotrochoïde) uit één closing-golf, twee keer gelezen
- `binary_field` - twee samplers, opgeteld en gedrempeld
- `3d_wave_volume` - 3D WebGL

---

## Processing (Java) port

Er is een Java-port voor Processing 4: [**processing.waves**](https://github.com/seb-prjcts-be/processing.waves). Dezelfde golven en API-vorm, voor sketches die buiten de browser leven.

## Hoe dit gemaakt is

Het beginpunt was klein: een lijst golfformules gecureerd door Ted Davis, en een 16×16 grid-sketch die ik ermee bouwde voor Genuary 2026. De weg van die sketch naar deze library (caching, seeding, normalisatie, morphing, shifting, wild mode, samplers) is gebouwd in nauwe samenwerking met AI-assistenten. Ontwerpbeslissingen, curatie en oordeelsvorming zijn van mij; de implementatie was een samenwerking. [Volledig verhaal →](https://seb-prjcts-be.github.io/p5.waves/docs/about.html)

## Credits

- `tw@GenerativePunk`, `gh@ffd8` ([Ted Davis](https://teddavis.org), [Oscillation Sandbox](https://github.com/ffd8/oscillation-sandbox)) - golfformule dataset
- Stephen Kokoska, *Fifty Famous Curves, Lots of Calculus Questions, and a Few Answers* (Bloomsburg University) - de krommen-afkomst achter de sectie Famous Curves en de vragen per golf op de Waves-pagina, en het `spirograph`-voorbeeld

Ontwikkeld door Sebastien Vanblaere.
