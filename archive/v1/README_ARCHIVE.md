# p5.waves Legacy Archive (v1)

Historical preservation layer for the original pre-v2 wave system.

## Why This Exists

This archive keeps the original formula culture available without changing the modern engine.

- v2.x core stays primary and default.
- legacy v1 stays optional and explicit.
- no rollback, no fallback, no silent switching.

## What Is Included

- `p5.waves.v1.js`: original legacy build from tag `v1.1.0`
- `p5.waves.v1.min.js`: original legacy minified build from tag `v1.1.0`
- `dataset.json`: extracted 37-wave snapshot from the legacy build

## Legacy Behavior Profile

Legacy formulas are intentionally raw and may:

- spike or overflow
- have uneven energy per wave
- feel more chaotic or inconsistent
- differ strongly from v2 RMS-normalized behavior

That behavior is preserved by design.

## Installation (Legacy)

### Local

```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.1.1/lib/p5.js"></script>
<script src="../../archive/v1/p5.waves.v1.min.js"></script>
```

### Real CDN (archive tag)

```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.1.1/lib/p5.js"></script>
<script src="https://cdn.jsdelivr.net/gh/seb-prjcts-be/p5.waves@v1.0.0-legacy/archive/v1/p5.waves.v1.min.js"></script>
```

### Historical CDN (original v1.1.0 release path)

```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.1.1/lib/p5.js"></script>
<script src="https://cdn.jsdelivr.net/gh/seb-prjcts-be/p5.waves@v1.1.0/p5.waves.min.js"></script>
```

Load order matters: load p5 first, then legacy waves.

## Legacy Wave Names

Unique legacy wave names (33):

- `classic sine`
- `sine`
- `sharp peaks sine`
- `rectangular`
- `pulse`
- `rectangular sine`
- `mountain peaks`
- `valleys`
- `zig-zag sine`
- `batman`
- `offset sine`
- `steps down`
- `steps`
- `class sine`
- `bumpy sine`
- `up down noise`
- `meta sine`
- `triangle`
- `ramp with period height`
- `ramp down saw`
- `ramp up saw`
- `fade out`
- `grow random`
- `noise`
- `fuzzy pulse`
- `up down pulse`
- `bald patch`
- `fuzzy peak sine`
- `ramp up sine`
- `triangle sine`
- `round linked sine`
- `half & half sine`
- `smooth solid sine`

## Legacy Preset Browser (37 entries)

| index | wave | shape |
| --- | --- | --- |
| 0 | classic sine | ellipse |
| 1 | sine | infinity |
| 2 | sharp peaks sine | pendulum |
| 3 | sharp peaks sine | phasingPendulum |
| 4 | rectangular | topBottom |
| 5 | pulse | bottomTop |
| 6 | rectangular sine | leftRight |
| 7 | mountain peaks | invertedHeart |
| 8 | valleys | heart |
| 9 | zig-zag sine | spaceShip |
| 10 | batman | starfighter |
| 11 | zig-zag sine | solarSystem |
| 12 | offset sine | cSection |
| 13 | steps down | hive |
| 14 | steps | hexagon |
| 15 | class sine | invertedPendulum |
| 16 | classic sine | pendulum |
| 17 | bumpy sine | depthIllusion |
| 18 | bumpy sine | headWithEars |
| 19 | up down noise | upDownScatter |
| 20 | meta sine | upDownScatter |
| 21 | triangle | phasingSharpSine |
| 22 | ramp with period height | spiral |
| 23 | ramp down saw | crissCross |
| 24 | ramp up saw | crissCross |
| 25 | fade out | snake |
| 26 | grow random | scatterDown |
| 27 | noise | noise |
| 28 | fuzzy pulse | fuzzyCenter |
| 29 | up down pulse | spinningTop |
| 30 | bald patch | scatter |
| 31 | fuzzy peak sine | foamingBowl |
| 32 | ramp up sine | scatter |
| 33 | triangle sine | scatter |
| 34 | round linked sine | scatterSphere |
| 35 | half & half sine | crissCrossUpDown |
| 36 | smooth solid sine | dna |

## Legacy Examples (Original Usage Style)

Legacy example names (historical set):

- Basic Wave (Instance)
- Basic Wave (P2D)
- Basic Wave (WEBGL)
- Seconds Parameter
- Select By Index
- Triangle Domain
- Range 0 to 1
- Wave Override

### Global mode

```js
function setup() {
  createCanvas(400, 200);
  noFill();
  Waves.setWaveParams({ axis: 'x', amplitude: 80 });
}

function draw() {
  background(240);
  beginShape();
  for (let y = 0; y <= height; y += 4) {
    const x = Waves.wave(y, 'classic sine');
    vertex(width / 2 + x, y);
  }
  endShape();
}
```

### Instance mode

```js
new p5(function (p) {
  p.setup = function () {
    p.createCanvas(400, 200);
    p.noFill();
  };

  p.draw = function () {
    p.background(240);
    p.beginShape();
    for (let y = 0; y <= p.height; y += 4) {
      const x = p.waves(y, 'triangle', null, { amplitude: 80 });
      p.vertex(p.width / 2 + x, y);
    }
    p.endShape();
  };
});
```

### Grid / WEBGL style

```js
let sampler;

function setup() {
  createCanvas(400, 400, WEBGL);
  sampler = Waves.createSampler({ refresh: 1, axis: 'xz', amplitude: 60 });
  noStroke();
}

function draw() {
  background(240);
  rotateY(frameCount * 0.01);
  for (let y = -180; y <= 180; y += 30) {
    for (let x = -180; x <= 180; x += 30) {
      const offset = sampler.sample(y, { t: frameCount * 0.02 });
      push();
      translate(x + offset.x, 0, y + offset.z);
      sphere(4);
      pop();
    }
  }
}
```

## Legacy API Surface (v1)

Available on `Waves`:

- `Waves.data`
- `Waves.getWaveByIndex(index)`
- `Waves.getWaveByName(name)`
- `Waves.createSampler(options)`
- `Waves.sample(y, refresh, axisOrOptions)`
- `Waves.setWaveParams(options)`
- `Waves.wave(y, select, seconds, axisOrOptions)`
- `Waves.seedFrom(value)`

p5 aliases also exist in legacy builds:

- `p.waves(...)`
- `p.waveSample(...)`
- `p.createWaveSampler(...)`
- `p.setWaveParams(...)`

## Archive Boundaries

- Not auto-loaded by v2 examples.
- Not the default engine in v2.x.
- Not linked in main quick-start docs as primary runtime.
- Preserved for historical continuity and attribution.

## Attribution

Legacy wave contributors and references:

- `tw@GenerativePunk`
- `gh@ffd8`
- Rectangular/pulse reference: https://titanwolf.org/Network/Articles/Article?AID=b5a3e4c8-1939-4fcb-aab8-8ff126c895da#gsc.tab=0
- Triangle reference: https://editor.p5js.org/jeremydouglass/sketches/fE0UWUEg

See root `README.md` for full project-level credits and current v2 guidance.
