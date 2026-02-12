# p5.waves

Energy-consistent wave sampling for p5.js.

`p5.waves` gives you stable, controllable offsets from a single input value. It does not draw for you. You use the returned values in your own p5 sketch.

**Signature**
`Waves.wave(y, select, seconds, axisOrOptions)`

## Quick Start

### 1) Include scripts
```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.1.1/lib/p5.js"></script>
<script src="p5.waves.min.js"></script>
```

### CDN (jsDelivr GitHub)
```html
<script src="https://cdn.jsdelivr.net/gh/seb-prjcts-be/p5.waves@v2.1.0/p5.waves.min.js"></script>
```

### 2) Minimal sketch (global mode)
```js
function setup() {
  createCanvas(420, 240);
  noFill();
  stroke(0);
}

function draw() {
  background(245);
  beginShape();
  for (let y = 0; y <= height; y += 4) {
    const x = Waves.wave(y + frameCount * 0.02, 'classicSine', null, {
      amplitude: 90,
      frequency: 0.012,
      normalize: true
    });
    vertex(width * 0.5 + x, y);
  }
  endShape();
}
```

## Core Model

- `shape`: pure wave form (`classicSine`, `triangle`, ...)
- `frequency`: external multiplier on input
- `amplitude`: external multiplier on output
- optional `modulation`
- optional normalization to predictable ranges

This is what keeps animation energy consistent between waves.

## Built-in Waves (v2.1.0)

| index | wave | shape | family |
| --- | --- | --- | --- |
| 0 | classicSine | sine | classic |
| 1 | triangle | triangle | classic |
| 2 | sawRise | saw | classic |
| 3 | squarePulse | square | classic |
| 4 | tangentBloom | tangentFold | sculptural |

Alias examples still supported: `rectangular`, `pulse`, `rampUpSaw`, `rampDownSaw`, `fuzzyPulse`, `upDownPulse`, `valleys`.

## Basic Usage

### Global mode
```js
const x = Waves.wave(40, 'classicSine');
```

### Instance mode
```js
new p5(function (p) {
  p.draw = function () {
    const x = p.waves(40, 'triangle');
    p.circle(p.width * 0.5 + x, 60, 6);
  };
});
```

## Main Options

- `axis`: `'x' | 'z' | 'xz'`
- `amplitude`: number
- `frequency`: number
- `phase`: number
- `mode`: `'stable' | 'wild'`
- `unpredictability`: `0..1`
- `refresh`: number
- `seconds`: auto-advance interval in seconds
- `normalize`: boolean
- `range`: `[min, max]`
- `modulation`: `{ shape, frequency, phase, phaseDepth, amplitudeDepth }`

## Reusable Sampler

```js
const sampler = Waves.createSampler({
  axis: 'xz',
  wave: 'triangle',
  amplitude: 70,
  frequency: 0.01,
  normalize: true
});

const out = sampler.sample(12.5); // { x, z }
```

## Binary Grid Sampling (14x14)

```js
const grid = Waves.createGridSampler({
  cols: 14,
  rows: 14,
  waveA: 'classicSine',
  waveB: 'tangentBloom',
  mode: 'wild',
  unpredictability: 0.6,
  frequencyA: 0.22,
  frequencyB: 0.22,
  normalizeA: true,
  normalizeB: true,
  inputScale: TWO_PI,
  combine: 'add',
  threshold: 0,
  timeScaleA: 1,
  timeScaleB: -1
});

const frame = grid.sample(t);
// frame.cells -> Uint8Array(14 * 14) with 0/1 values
if (frame.uniform) grid.nextPair(1, 2);
```

## Examples

- `examples/00_wave_lab`: interactive playground with sliders, toggles, line/matrix preview.
- `examples/01_basic_wave_instance`
- `examples/01_basic_wave_p2d`
- `examples/01_basic_wave_webgl`
- `examples/02_seconds_param`
- `examples/03_select_by_index`
- `examples/04_triangle_domain`
- `examples/05_range_0_1`
- `examples/06_wave_override`
- `examples/07_archive_comparison`: side-by-side stable core vs legacy archive behavior

## Archive & Legacy Builds

`p5.waves` keeps two layers on purpose:

- **v2.x core (default)**: energy-consistent architecture with external `frequency` and `amplitude`, normalization, and stable/wild controls.
- **v1 archive (optional)**: preserved historical formulas with raw, uneven behavior.

Legacy assets live in `archive/v1`:

- `archive/v1/p5.waves.v1.js`
- `archive/v1/p5.waves.v1.min.js`
- `archive/v1/dataset.json`
- `archive/v1/README_ARCHIVE.md`

The archive is discoverable but not dominant:

- it is not auto-loaded
- it is not the default engine
- it does not replace the v2 core
- it exists for historical continuity and attribution

## Notes

- `amplitude` is preferred. `scale` remains supported for compatibility.
- `domain` and `samples` are no longer part of the v2.1.0 public options.
- `Waves.wave(...)` and `p.waves(...)` are the intended entry points.

## Versioning

- Patch: bug fixes/docs
- Minor: non-breaking features/waves/options
- Major: breaking API changes

## Makers and Contributors
Wave formula contributors in the original dataset: `tw@GenerativePunk` and `gh@ffd8`.

🙏 Thanks & Credits

This wave collection grew out of experiments shared across generative art communities.
Many of the formulas in this dataset were inspired by, adapted from, or directly attributed to the following handles:

- `tw@GenerativePunk`
- `gh@ffd8`

Some entries reference external explorations and educational material, including:

- TitanWolf article on waveform construction
- Jeremy Douglass (p5.js Editor sketch reference)

Where a handle or source is included in the dataset, it reflects the best available attribution at the time of compilation.

If you recognize your work here and would like:

- clearer attribution
- a link added
- your handle updated
- removal

please open an issue or contact the maintainer.

This library exists as a living archive of playful math, community tinkering, and waveform aesthetics.
Every sine, pulse, noise field, and ramp here stands on shared curiosity.

Thank you to everyone who bends math into drawing.
