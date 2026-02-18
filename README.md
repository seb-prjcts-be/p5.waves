# p5.waves

Wave sampling helpers for p5.js.

**What This Library Does**
This library adds wave sampling functions to p5.js and exposes a global `Waves` object.
You pass a single number (named `y` in the API).
It evaluates one or two built-in wave formulas and returns an `x` value, a `z` value, or both.
It solves the problem of generating repeatable offsets for lines, grids, or 3D positions.

**What This Library Does NOT Do**
- It does not draw anything or create a canvas.
- It does not animate by itself.
- It does not change p5's `random()` or `noise()` functions.
- It does not provide an API to add or edit wave formulas.
- It does not return arrays or paths, only numbers or `{ x, z }`.

**Mental Model**
Think of this library as a list of wave formulas you can sample.
Each formula is a small math expression that takes an input called `x`.
The library treats your `y` input as that `x`.
If you ask for both axes, it samples two formulas and returns `{ x, z }`.

**Installation**
Script tag (local file):
```html
<script src="p5.js"></script>
<script src="p5.waves.js"></script>
<script src="sketch.js"></script>
```

Script tag (CDN-style link):
```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.1.1/lib/p5.js"></script>
<script src="https://cdn.jsdelivr.net/gh/seb-prjcts-be/p5.waves@v1.2.0/p5.waves.min.js"></script>
<script src="sketch.js"></script>
```

Load order matters.
`p5.js` must load before `p5.waves.js` or `p5.waves.min.js`.

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
- `options.amplitude` (number). Default `1`. Final output multiplier in pixels.
- `options.wave` (wave reference). Sets both axes.
- `options.xWave` (wave reference). Sets only `x`.
- `options.zWave` (wave reference). Sets only `z`.
- `options.normalize` (boolean). Default `false`.
- `options.range` (array). Default `[-1, 1]`.
- `options.domain` (array). Default `[-100, 100]`.
- `options.samples` (number). Default `512`.
- `options.normalizeVars` (object). Default `null`.

`amplitude` is preferred.
`scale` is supported for backward compatibility.
Expected ranges
- `options.axis` must be `'x'`, `'z'`, or `'xz'`.
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

**`Waves.setWaveParams(options)`**
Parameters
- `options` (object).
- `options.axis` (`'x'`, `'z'`, or `'xz'`).
- `options.amplitude` (number). Final output multiplier in pixels.
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
- `options.seconds` must be `> 0` to auto-advance.
- `options.range` and `options.domain` must be `[min, max]` with `min !== max`.
Return value
- A copy of the current defaults.
Example
```js
Waves.setWaveParams({ axis: 'x', amplitude: 120, normalize: true });
```
These defaults are used by `Waves.wave()` on every call.
`Waves.createSampler()` only uses the `normalize`, `range`, `domain`, `samples`, and `normalizeVars` defaults when you omit them.

**`Waves.wave(y, select, seconds, axisOrOptions)`**
Parameters
- `y` (number).
- `select` (wave reference). Optional.
- `seconds` (number). Optional.
- `axisOrOptions` (string or object). Optional.
- If `axisOrOptions` is a string, it is the axis.
- If it is an object, it accepts `axis`, `amplitude`, `refresh`, `select`, `seconds`, `vars`, `normalize`, `range`, `domain`, `samples`, and `normalizeVars`.
Expected ranges
- `select` can be a number index, a name string, or an object with `index`, `wave`, or `name`.
- `seconds` must be `> 0` to auto-advance.
- `axis` must be `'x'`, `'z'`, or `'xz'` when provided.
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

**p5 Methods (Aliases)**
These functions are added to `p5.prototype` when p5.js is loaded.
In global mode, they also appear as globals.
They behave the same as the `Waves` versions.
`Waves.wave(...)` is the stable API.

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

**Makers and Contributors**
- `tw@GenerativePunk` (wave formula contributor in the original dataset).
- `gh@ffd8` (wave formula contributor in the original dataset).
- Reference for rectangular and pulse formulas: https://titanwolf.org/Network/Articles/Article?AID=b5a3e4c8-1939-4fcb-aab8-8ff126c895da#gsc.tab=0
- Reference for the triangle formula: https://editor.p5js.org/jeremydouglass/sketches/fE0UWUEg
