# p5.waves

Wave sampling helpers for p5.js.

**Quick Install**
Script tag (CDN):
```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.1.1/lib/p5.js"></script>
<script src="https://cdn.jsdelivr.net/gh/seb-prjcts-be/p5.waves/p5.waves.min.js"></script>
<script src="sketch.js"></script>
```

Script tag (local file):
```html
<script src="p5.js"></script>
<script src="p5.waves.js"></script>
<script src="sketch.js"></script>
```

Load order matters.
`p5.js` must load before `p5.waves.js` or `p5.waves.min.js`.

**GitHub Pages Examples**
- Landing page: `https://seb-prjcts-be.github.io/p5.waves/`
- Direct examples: `https://seb-prjcts-be.github.io/p5.waves/examples/00_wave_lab/` (and the other folders under `examples/`).
- Deployment is handled by `.github/workflows/pages.yml` on pushes to `fusion/v1-spirit` (and `main`).

If Pages is not enabled yet in the repository settings, set:
- `Settings` -> `Pages` -> `Build and deployment` -> `Source: GitHub Actions`.

**What's New In 1.3.0 (Additive)**
- Added friendly name aliases in `Waves.getWaveByName(...)` and `Waves.wave(...)` (for example `classicSine`, `sawRise`, `squarePulse`).
- Added optional input shaping controls: `frequency` and `phase` on `Waves.createSampler(...)`, `Waves.wave(...)`, and `Waves.setWaveParams(...)`.
- Added optional behavior controls: `mode`, `unpredictability`, and `modulation` on sampler and wave calls.
- Added grid helpers: `Waves.createGridSampler(options)` and `Waves.grid(time, options)`.
- Added discovery helpers: `Waves.list()`, `Waves.aliases`, and `Waves.families`.
- Added p5 instance helpers: `p.createWaveGridSampler(options)` and `p.waveGrid(time, options)`.

These are additive and keep 1.2 call patterns working.

**What This Library Does**
This library adds wave sampling functions to p5.js and exposes a global `Waves` object.
You pass a single number (named `y` in the API).
It evaluates one or two built-in wave formulas and returns an `x` value, a `z` value, or both.
It solves the problem of generating repeatable offsets for lines, grids, or 3D positions.

**Scope**
`p5.waves` focuses on numeric wave sampling.
Drawing and animation stay in your p5.js sketch code.

**Mental Model**
Think of this library as a list of wave formulas you can sample.
Each formula is a small math expression that takes an input called `x`.
The library treats your `y` input as that `x`.
If you ask for both axes, it samples two formulas and returns `{ x, z }`.

**Repository Scope**
- `p5.waves` is the v1 formula library with a broad legacy dataset: `37` usable wave entries (around 40).
- Use `p5.waves` when you want maximum variety and legacy-compatible behavior.

**Usable Waves In `p5.waves` (v1 dataset)**
The current `Waves.data` list has `37` entries:

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

**Examples**
The repository now includes a broader set of examples covering base usage and 1.3 features.

- `examples/00_wave_lab`
- `examples/01_basic_wave`
- `examples/02_instance_mode`
- `examples/03_basic_wave_instance`
- `examples/04_basic_wave_p2d`
- `examples/05_basic_wave_webgl`
- `examples/06_seconds_param`
- `examples/07_select_by_index`
- `examples/08_triangle_domain`
- `examples/09_range_0_1`
- `examples/10_wave_override`
- `examples/11_tick_time_mode`

**Time Management (Clock vs Tick)**
`Waves.wave(...)` can run from two time sources:
- `clock` mode (default): real time from `millis()`/clock, keeps existing behavior.
- `tick` mode: internal time only, advanced by `Waves.tick(dtSeconds)`.

This solves low-fps recording/export cases where you want deterministic timing.

CLOCK (default):
```js
Waves.setTimeMode("clock");
```

TICK (deterministic):
```js
Waves.setTimeMode("tick");
function draw() {
  Waves.tick(deltaTime / 1000); // live
  // or for recording:
  // Waves.tick(1 / targetFps);
}
```

**Core API**
All functions below are available on the global `Waves` object.

**`Waves.data`**
Parameters
- None.
Expected ranges
- Not applicable.
Return value
- Array of wave objects with fields `wave`, `shape`, and `algo`.
Example
```js
const count = Waves.data.length;
```

**`Waves.aliases`**
Parameters
- None.
Expected ranges
- Not applicable.
Return value
- Object map of compact alias names to canonical wave names.
Example
```js
const canonical = Waves.aliases.classicsine; // "classic sine"
```

**`Waves.list()`**
Parameters
- None.
Expected ranges
- Not applicable.
Return value
- Array of `{ index, wave, shape, algo }`.
Example
```js
const list = Waves.list();
```

**`Waves.families`**
Parameters
- None.
Expected ranges
- Not applicable.
Return value
- Family groups for dataset browsing. Current value includes `legacy`.
Example
```js
const legacy = Waves.families.legacy;
```

**`Waves.getWaveByIndex(index)`**
Parameters
- `index` (number).
Expected ranges
- Any finite number.
- The index wraps around the list length.
Return value
- `{ index, wave }` or `null`.
Example
```js
const entry = Waves.getWaveByIndex(0);
```

**`Waves.getWaveByName(name)`**
Parameters
- `name` (string).
Expected ranges
- Any non-empty string.
- Matching is case-insensitive and checks both `wave` and `shape`.
- Shape names in `Waves.data` are camelCase.
- For shapes, spaces and hyphens in the input are ignored.
- Common migration aliases are supported (for example `classicSine`, `sawRise`, `squarePulse`).
Return value
- `{ index, wave }` or `null`.
Example
```js
const entry = Waves.getWaveByName('triangle');
```

**`Waves.createSampler(options)`**
Parameters
- `options` (object).
- `options.refresh` (number). Default `0`.
- `options.axis` (`'x'`, `'z'`, or `'xz'`). Default `'xz'`.
- `options.amplitude` (number). Default `1`.
- `options.scale` (number). Alias for `amplitude`.
- `options.frequency` (number). Input multiplier. Default `1`.
- `options.phase` (number). Input offset. Default `0`.
- `options.mode` (`'stable'` or `'wild'`). Default `'stable'`.
- `options.unpredictability` (number `0..1`). Default `0`.
- `options.modulation` (object or `null`). Default `null`.
- `options.wave` (wave reference). Sets both axes.
- `options.xWave` (wave reference). Sets only `x`.
- `options.zWave` (wave reference). Sets only `z`.
- `options.normalize` (boolean). Default `false`.
- `options.range` (array). Default `[-1, 1]`.
- `options.domain` (array). Default `[-100, 100]`.
- `options.samples` (number). Default `512`.
- `options.normalizeVars` (object). Default `null`.
`amplitude` is preferred.
`scale` stays supported for backward compatibility.
Expected ranges
- `options.axis` must be `'x'`, `'z'`, or `'xz'`.
- `options.frequency` and `options.phase` should be finite numbers.
- `options.mode` must be `'stable'` or `'wild'` when provided.
- `options.unpredictability` should be in `[0, 1]`.
- `options.range` and `options.domain` must be `[min, max]` with `min !== max`.
- `options.samples` should be an integer `>= 2`.
- A wave reference is a number index, a name string, or an object with `index`, `wave`, or `name`.
Return value
- Sampler object with a `sample(y, vars)` method.
Example
```js
const sampler = Waves.createSampler({ refresh: 2, axis: 'xz' });
```

**`sampler.sample(y, vars)`**
Parameters
- `y` (number).
- `vars` (object). Optional.
- `vars.y`, `vars.z`, `vars.t`, `vars.dis` (numbers). Optional.
Expected ranges
- `y` should be a finite number.
- `vars` values should be finite numbers.
Return value
- Object with `x` and/or `z` depending on `options.axis`.
Example
```js
const out = sampler.sample(10, { t: frameCount * 0.01 });
```

**`Waves.sample(y, refresh, axisOrOptions)`**
Parameters
- `y` (number).
- `refresh` (number).
- `axisOrOptions` (string or object). Optional.
- If `axisOrOptions` is a string, it is the axis.
- If it is an object, it accepts the same fields as `Waves.createSampler` plus `vars`.
Expected ranges
- `refresh` can be any finite number.
- `axis` must be `'x'`, `'z'`, or `'xz'` when provided.
Return value
- Object with `x` and/or `z`.
Example
```js
const out = Waves.sample(50, 3, { axis: 'x', wave: 'classic sine' });
```

**`Waves.setTimeMode(mode, options)`**
Parameters
- `mode` (`'clock'` or `'tick'`).
- `options` (object). Optional, reserved for future extensions.
Expected ranges
- `mode` should be `'clock'` or `'tick'`.
- Default mode is `'clock'`.
Return value
- The active mode string (`'clock'` or `'tick'`).
Example
```js
Waves.setTimeMode('tick');
```

**`Waves.tick(dtSeconds)`**
Parameters
- `dtSeconds` (number).
Expected ranges
- In `tick` mode, pass a finite positive delta in seconds.
- In `clock` mode, this does not change switching behavior.
Return value
- Current internal time in seconds.
Example
```js
Waves.tick(1 / 30);
```

**`Waves.setWaveParams(options)`**
Parameters
- `options` (object).
- `options.axis` (`'x'`, `'z'`, or `'xz'`).
- `options.amplitude` (number).
- `options.scale` (number). Alias for `amplitude`.
- `options.frequency` (number). Input multiplier.
- `options.phase` (number). Input offset.
- `options.mode` (`'stable'` or `'wild'`).
- `options.unpredictability` (number `0..1`).
- `options.modulation` (object or `null`).
- `options.refresh` (number).
- `options.select` (wave reference).
- `options.seconds` (number).
- `options.vars` (object).
- `options.normalize` (boolean).
- `options.range` (array).
- `options.domain` (array).
- `options.samples` (number).
- `options.normalizeVars` (object).
Expected ranges
- `options.axis` must be `'x'`, `'z'`, or `'xz'` when provided.
- `options.frequency` and `options.phase` should be finite numbers when provided.
- `options.mode` must be `'stable'` or `'wild'` when provided.
- `options.unpredictability` should be in `[0, 1]` when provided.
- `options.seconds` must be `> 0` to auto-advance.
- `options.range` and `options.domain` must be `[min, max]` with `min !== max`.
Return value
- A copy of the current defaults.
Example
```js
Waves.setWaveParams({ axis: 'x', amplitude: 120, normalize: true });
```
These defaults are used by `Waves.wave()` on every call.
`Waves.createSampler()` uses the `frequency`, `phase`, `mode`, `unpredictability`, `modulation`, `normalize`, `range`, `domain`, `samples`, and `normalizeVars` defaults when you omit them.

**`Waves.wave(y, select, seconds, axisOrOptions)`**
Parameters
- `y` (number).
- `select` (wave reference). Optional.
- `seconds` (number). Optional.
- `axisOrOptions` (string or object). Optional.
- If `axisOrOptions` is a string, it is the axis.
- If it is an object, it accepts `axis`, `amplitude`, `scale`, `frequency`, `phase`, `mode`, `unpredictability`, `modulation`, `refresh`, `select`, `xWave`, `zWave`, `seconds`, `vars`, `normalize`, `range`, `domain`, `samples`, and `normalizeVars`.
Expected ranges
- `select` can be a number index, a name string, or an object with `index`, `wave`, or `name`.
- `xWave` and `zWave` can use the same wave reference formats as `select`.
- `mode` must be `'stable'` or `'wild'` when provided.
- `unpredictability` should be in `[0, 1]` when provided.
- `seconds === 0` disables auto-advance.
- `seconds > 0` auto-advances on the active time source (`clock` or `tick` mode).
- `axis` must be `'x'`, `'z'`, or `'xz'` when provided.
- If `vars.t` is not provided, `Waves.wave(...)` injects time from the active time source.
- If `vars.t` is explicitly provided, it overrides internal time.
Return value
- A number when the axis is `'x'` or `'z'`.
- An object `{ x, z }` when the axis is `'xz'`.
Example
```js
const x = Waves.wave(40, 'classic sine');
```

**`Waves.seedFrom(value)`**
Parameters
- `value` (any type).
Expected ranges
- Any value is accepted.
Return value
- A 32-bit unsigned integer seed.
Example
```js
const seed = Waves.seedFrom('demo');
```

**`Waves.createGridSampler(options)`**
Parameters
- `options` (object).
- `options.cols` (number). Default `14`.
- `options.rows` (number). Default `14`.
- `options.waveA`, `options.waveB` (wave reference). Optional.
- `options.axisA`, `options.axisB` (`'x'`, `'z'`, or `'xz'`). Defaults `'x'`.
- `options.amplitudeA`, `options.amplitudeB` (number). Optional.
- `options.frequencyA`, `options.frequencyB` (number). Optional.
- `options.phaseWaveA`, `options.phaseWaveB` (number). Optional.
- `options.modeA`, `options.modeB` (`'stable'` or `'wild'`). Optional.
- `options.unpredictabilityA`, `options.unpredictabilityB` (number `0..1`). Optional.
- `options.modulation`, `options.modulationA`, `options.modulationB` (object or `null`). Optional.
- `options.refreshA`, `options.refreshB` (number). Optional.
- `options.normalizeA`, `options.normalizeB` (boolean). Optional.
- `options.rangeA`, `options.rangeB` (array). Optional.
- `options.domainA`, `options.domainB` (array). Optional.
- `options.samplesA`, `options.samplesB` (number). Optional.
- `options.combine` (`add`, `subtract`, `multiply`, `max`, `min`, `avg`). Default `add`.
- `options.threshold` (number). Default `0`.
- `options.high`, `options.low` (numbers). Defaults `1` and `0`.
- `options.invert` (boolean). Default `false`.
- `options.inputScale` (number). Default `TWO_PI`.
- `options.timeScaleA`, `options.timeScaleB` (numbers). Defaults `1` and `-1`.
- `options.phaseA`, `options.phaseB` (numbers). Defaults `0`.
- `options.mode` (`stable` or `wild`). Default `stable`.
- `options.unpredictability` (number `0..1`). Default `0`.
- `options.autoStepOnUniform` (boolean). Default `false`.
Return value
- Grid sampler object with methods `sample(time, out)`, `setWaves(...)`, `nextPair(...)`, and `getState()`.
Example
```js
const gridSampler = Waves.createGridSampler({ cols: 14, rows: 14, waveA: 'triangle', waveB: 'pulse' });
```

**`Waves.grid(time, options)`**
Parameters
- `time` (number).
- `options` (object). Same options as `Waves.createGridSampler(...)`.
Return value
- One-shot grid frame object from `createGridSampler(...).sample(time)`.
Example
```js
const frame = Waves.grid(frameCount * 0.02, { cols: 10, rows: 10 });
```

**p5 Methods (Aliases)**
These functions are added to `p5.prototype` when p5.js is loaded.
In global mode, they also appear as globals.
They behave the same as the `Waves` versions.

**`p5.prototype.waves(y, select, seconds, axisOrOptions)`**
Parameters
- Same as `Waves.wave(...)`.
Expected ranges
- Same as `Waves.wave(...)`.
Return value
- Same as `Waves.wave(...)`.
Example
```js
const x = p.waves(40, 'classic sine');
```

**`p5.prototype.waveSample(y, refresh, axisOrOptions)`**
Parameters
- Same as `Waves.sample(...)`.
Expected ranges
- Same as `Waves.sample(...)`.
Return value
- Same as `Waves.sample(...)`.
Example
```js
const out = p.waveSample(40, 3, 'xz');
```

**`p5.prototype.createWaveSampler(refresh, options)`**
Parameters
- `refresh` (number).
- `options` (object). Same fields as `Waves.createSampler(...)`.
Expected ranges
- Same as `Waves.createSampler(...)`.
Return value
- Sampler object with a `sample(y, vars)` method.
Example
```js
const sampler = p.createWaveSampler(2, { axis: 'xz' });
```

**`p5.prototype.createWaveGridSampler(options)`**
Parameters
- `options` (object). Same fields as `Waves.createGridSampler(...)`.
Expected ranges
- Same as `Waves.createGridSampler(...)`.
Return value
- Same as `Waves.createGridSampler(...)`.
Example
```js
const gridSampler = p.createWaveGridSampler({ cols: 14, rows: 14 });
```

**`p5.prototype.waveGrid(time, options)`**
Parameters
- `time` (number).
- `options` (object). Same fields as `Waves.createGridSampler(...)`.
Expected ranges
- Same as `Waves.grid(...)`.
Return value
- Same as `Waves.grid(...)`.
Example
```js
const frame = p.waveGrid(frameCount * 0.02, { cols: 8, rows: 8 });
```

**`p5.prototype.setWaveParams(options)`**
Parameters
- Same as `Waves.setWaveParams(...)`.
Expected ranges
- Same as `Waves.setWaveParams(...)`.
Return value
- Same as `Waves.setWaveParams(...)`.
Example
```js
p.setWaveParams({ axis: 'x', amplitude: 80 });
```

**Safe Usage vs Unsafe Usage**
Safe and recommended:
- `Waves.wave(...)` in any mode.
- `p.waves(...)` in instance mode.

Unsafe and collision-prone:
- Relying on a global `wave(...)` function.

Why this matters:
Global mode places many functions on `window`.
Any other script can overwrite them or be overwritten.
Using `Waves.wave(...)` or `p.waves(...)` avoids that collision risk.
This library does not define `window.wave`.

**Usage Patterns**
Global mode (explicit and safe):
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

Instance mode:
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

Grid / matrix / WEBGL-style usage:
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

**Versioning Philosophy**
This library follows semantic versioning.
Patch releases fix bugs or docs without changing outputs.
Minor releases add new waves or options without breaking existing calls.
Major releases may change outputs or remove or rename functions.

**Makers and Contributors (v1 dataset)**
- `tw@GenerativePunk` (wave formula contributor in the original dataset).
- `gh@ffd8` (wave formula contributor in the original dataset).
- Reference for rectangular and pulse formulas: https://titanwolf.org/Network/Articles/Article?AID=b5a3e4c8-1939-4fcb-aab8-8ff126c895da#gsc.tab=0
- Reference for the triangle formula: https://editor.p5js.org/jeremydouglass/sketches/fE0UWUEg
