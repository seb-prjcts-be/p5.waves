/*!
 * p5.waves
 * Wave sampling for p5.js. Always returns a number.
 * Version 2.0.0
 * Author: seb@prjcts
 * License: MIT
 */
(function (global) {
  'use strict';

  // ─── Wave definitions (34 entries, unique names) ─────────────────────────────

  const WAVES = [
    { name: 'classic sine',      algo: 'sin(x*.1)*.4' },
    { name: 'sine',              algo: 'sin(x*.2)*.25' },
    { name: 'sharp peaks',       algo: 'abs(sin(x*.1))*.5' },
    { name: 'square',            algo: '(x*.025)%1 < .5 ? -.5 : .5' },
    { name: 'pulse',             algo: '(x*.5)%20 < 1 ? -.5 : .5' },
    { name: 'stepped sine',      algo: 'ceil(sin(x*.1))*.25' },
    { name: 'mountain peaks',    algo: 'abs(cos(x*.1))*.35 + sin(x*.1)*.25' },
    { name: 'valleys',           algo: 'abs(cos(x*.1))*-.35 + sin(x*.1)*.25' },
    { name: 'zig-zag sine',      algo: 'sin(x*.1)*.25 % .15' },
    { name: 'batman',            algo: 'sin(x*.1)*.7 % .4' },
    { name: 'offset sine',       algo: 'ceil(cos(x*.1))*.25 - sin(x*.1)*.25' },
    { name: 'steps down',        algo: 'ceil(tan(x*.1))*.25' },
    { name: 'steps',             algo: 'round(sin(-x*.1))*.25' },
    { name: 'squared sine',      algo: 'sq(sin(x*.1))*.25' },
    { name: 'bumpy sine',        algo: 'sin(x*.1)*.25 + sin(x*.5)*.1' },
    { name: 'wobble sine',       algo: 'sin(x*.1)*cos(x*.2)*.5' },
    { name: 'up down noise',     algo: 'x*sin(x*.1) % .5' },
    { name: 'meta sine',         algo: 'sin(x*.45 + radians(x))*cos(x*.4)*.5' },
    { name: 'triangle',          algo: 'abs((x*.03) % (.5*2) - .5)' },
    { name: 'ramp',              algo: '-1*(x*.02%1)/1 + 0.5' },
    { name: 'saw down',          algo: 'x*.03 % .5' },
    { name: 'saw up',            algo: '-x*.03 % .5' },
    { name: 'fade out',          algo: 'log(x)*.1' },
    { name: 'grow random',       algo: 'random(x*.003)' },
    { name: 'noise',             algo: 'noise(x*.1) - .5' },
    { name: 'fuzzy pulse',       algo: 'tan(x*20)*.05' },
    { name: 'up down pulse',     algo: 'tan(x*.1)*.05' },
    { name: 'bald patch',        algo: 'sq(x*.05) % .5' },
    { name: 'fuzzy peak sine',   algo: 'sin(x*.1) < 0 ? random(-.2, .2) : sin(x*.1)*.5' },
    { name: 'ramp up sine',      algo: 'sin(x)*(x*.01%.5)' },
    { name: 'triangle sine',     algo: 'sin(x)*(x*.01%1-.5)' },
    { name: 'round linked sine', algo: 'sin(x*.1)*cos(x*1)*.5' },
    { name: 'half sine',         algo: 'sin(x*.05)*(x*.1%.5)' },
    { name: 'smooth solid sine', algo: 'sin(x*3.1)*.25' },
  ];

  // ─── Caches ──────────────────────────────────────────────────────────────────

  const COMPILE_CACHE = new Map();
  const STATS_CACHE   = new Map();

  // ─── Math helpers ────────────────────────────────────────────────────────────

  function radians(deg) { return deg * (Math.PI / 180); }
  function sq(n)        { return n * n; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function lerp(a, b, t)    { return a + (b - a) * t; }
  function fade(t)      { return t * t * t * (t * (t * 6 - 15) + 10); }

  // ─── Value coercion ───────────────────────────────────────────────────────────

  function toNumber(v, fallback) {
    const n = Number(v);
    return Number.isFinite(n) ? n : (fallback !== undefined ? fallback : 0);
  }

  function toUnit(v, fb) {
    return clamp(toNumber(v, fb !== undefined ? fb : 0), 0, 1);
  }

  // ─── String helpers ───────────────────────────────────────────────────────────

  function normalizeName(v) { return String(v == null ? '' : v).trim().toLowerCase(); }
  function compact(v)       { return normalizeName(v).replace(/[^a-z0-9]/g, ''); }

  // ─── Seeding (FNV-1a 32-bit) ─────────────────────────────────────────────────

  function seedFrom(value) {
    const str = String(value == null ? 0 : value);
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h  = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ─── Wave lookup ─────────────────────────────────────────────────────────────

  function wrapIndex(i) {
    const len = WAVES.length;
    return ((Math.floor(i) % len) + len) % len;
  }

  function pickWaveIndex(seedValue) {
    const rng = mulberry32(seedFrom(seedValue));
    return Math.floor(rng() * WAVES.length);
  }

  function findWaveByName(name) {
    const key  = normalizeName(name);
    const keyC = compact(name);
    for (let i = 0; i < WAVES.length; i++) {
      if (normalizeName(WAVES[i].name) === key)  return i;
      if (compact(WAVES[i].name)       === keyC) return i;
    }
    return -1;
  }

  // Resolve a wave reference (number = index, string = name).
  function resolveWave(ref) {
    if (ref === undefined || ref === null) return -1;
    if (typeof ref === 'number') return wrapIndex(ref);
    if (typeof ref === 'string') return findWaveByName(ref);
    return -1;
  }

  // ─── Deterministic random / noise ────────────────────────────────────────────

  function hash01(n) {
    const s = Math.sin(n) * 43758.5453123;
    return s - Math.floor(s);
  }

  function rand01(seed, x, i) {
    return hash01(seed * 0.001 + x * 0.017 + i * 0.131);
  }

  function noise1D(x, seed) {
    if (!Number.isFinite(x)) return 0;
    const xi = Math.floor(x);
    const xf = x - xi;
    const v0 = hash01(xi     + seed * 0.07);
    const v1 = hash01(xi + 1 + seed * 0.07);
    return lerp(v0, v1, fade(xf));
  }

  function noiseSigned(x, seed) { return noise1D(x, seed) * 2 - 1; }

  // ─── Compilation ─────────────────────────────────────────────────────────────

  const ARG_NAMES = [
    'x', 't',
    'random', 'noise',
    'sin', 'cos', 'tan', 'abs', 'ceil', 'round', 'floor', 'min', 'max',
    'log', 'sq', 'radians', 'PI'
  ];

  function compile(expr) {
    if (COMPILE_CACHE.has(expr)) return COMPILE_CACHE.get(expr);
    const fn = new Function(...ARG_NAMES, 'return (' + expr + ');');
    COMPILE_CACHE.set(expr, fn);
    return fn;
  }

  function evaluate(fn, x, t, seed) {
    let calls = 0;
    const tVal = toNumber(t, 0);

    const random = function (min, max) {
      const r = rand01(seed, x, calls++);
      if (min === undefined) return r;
      if (max === undefined) { max = min; min = 0; }
      if (max < min) { const tmp = max; max = min; min = tmp; }
      return min + r * (max - min);
    };

    const noise = function (n) { return noise1D(n, seed); };

    const out = fn(
      x, tVal,
      random, noise,
      Math.sin, Math.cos, Math.tan, Math.abs, Math.ceil, Math.round, Math.floor, Math.min, Math.max,
      Math.log, sq, radians, Math.PI
    );
    return Number.isFinite(out) ? out : 0;
  }

  // ─── Wild mode ────────────────────────────────────────────────────────────────

  function evaluateWild(fn, x, t, seed, unpredictability) {
    let freqScale = 1 + noiseSigned(x * 0.17, seed + 17) * unpredictability * 0.7;
    freqScale = Math.max(0.05, freqScale);
    const phaseNoise = noiseSigned(x * 0.09, seed + 29) * unpredictability * 0.75;
    let ampNoise = 1 + noiseSigned(x * 0.23, seed + 41) * unpredictability * 0.45;
    ampNoise = Math.max(0.05, ampNoise);
    const wildMix = unpredictability * 0.25;

    const evalX = x * freqScale + phaseNoise;
    let val = evaluate(fn, evalX, t, seed);

    if (wildMix > 0) {
      const carrier = noiseSigned(evalX * 0.97 + seed * 0.0001, seed + 101);
      val = lerp(val, carrier, wildMix);
    }

    return val * ampNoise;
  }

  // ─── Normalization ────────────────────────────────────────────────────────────

  const STATS_DOMAIN  = [-200, 200];
  const STATS_SAMPLES = 256;

  function getStats(waveIndex, internalSeed) {
    const key = waveIndex + '|' + internalSeed;
    if (STATS_CACHE.has(key)) return STATS_CACHE.get(key);

    const fn  = compile(WAVES[waveIndex].algo);
    let mn = Infinity, mx = -Infinity;

    for (let i = 0; i < STATS_SAMPLES; i++) {
      const frac = i / (STATS_SAMPLES - 1);
      const x    = STATS_DOMAIN[0] + (STATS_DOMAIN[1] - STATS_DOMAIN[0]) * frac;
      const v    = evaluate(fn, x, 0, internalSeed);
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }

    if (!Number.isFinite(mn) || !Number.isFinite(mx) || mn === mx) { mn = -1; mx = 1; }
    const stats = { min: mn, max: mx };
    STATS_CACHE.set(key, stats);
    return stats;
  }

  function mapToRange(value, stats, range) {
    if (stats.min === stats.max) return (range[0] + range[1]) * 0.5;
    const t = (value - stats.min) / (stats.max - stats.min);
    return range[0] + t * (range[1] - range[0]);
  }

  // ─── Shared evaluation kernel ─────────────────────────────────────────────────

  function evalKernel(fn, y, t, frequency, phase, seed, mode, unpredictability) {
    const x = (toNumber(y, 0) + toNumber(t, 0)) * frequency + phase;
    if (mode === 'wild' && unpredictability > 0) {
      return evaluateWild(fn, x, t, seed, unpredictability);
    }
    return evaluate(fn, x, t, seed);
  }

  // ─── wave() ──────────────────────────────────────────────────────────────────
  //
  // wave(y)                               → number, default wave, seed 0
  // wave(y, 3)                            → seed 3 selects wave
  // wave(y, 'triangle')                   → wave by name
  // wave(y, { wave: 'triangle' })         → options form
  // wave(y, { wave: 4 })                  → wave by index
  // wave(y, { seed: 2, amplitude: 80 })   → seed + amplitude scaling
  // wave(y, { wave: 'sine', range: [0,1], t: millis()/1000 })
  //
  // Options:
  //   wave             name or index                (seed-determined if omitted)
  //   seed             number for wave selection    0
  //   t                time offset                  0
  //   amplitude        fast multiply, no normalise  1
  //   range            [min,max] normalise output   null
  //   frequency        input multiplier             1
  //   phase            input offset                 0
  //   mode             'stable' | 'wild'            'stable'
  //   unpredictability 0..1 (wild only)             0
  //
  // Returns: always a number.

  function wave(y, secondParam) {
    let waveRef, seed = 0, t = 0, amplitude = 1, range = null;
    let frequency = 1, phase = 0, mode = 'stable', unpredictability = 0;

    if (secondParam !== null && secondParam !== undefined) {
      if (typeof secondParam === 'number') {
        seed = secondParam;
      } else if (typeof secondParam === 'string') {
        waveRef = secondParam;
      } else if (typeof secondParam === 'object') {
        if (secondParam.wave !== undefined) waveRef = secondParam.wave;
        seed            = toNumber(secondParam.seed, 0);
        t               = toNumber(secondParam.t, 0);
        amplitude       = toNumber(secondParam.amplitude, 1);
        frequency       = toNumber(secondParam.frequency, 1);
        phase           = toNumber(secondParam.phase, 0);
        mode            = normalizeName(secondParam.mode || 'stable') === 'wild' ? 'wild' : 'stable';
        unpredictability = toUnit(secondParam.unpredictability, 0);
        if (Array.isArray(secondParam.range) && secondParam.range.length >= 2) {
          range = [toNumber(secondParam.range[0], -1), toNumber(secondParam.range[1], 1)];
        }
      }
    }

    const internalSeed = seedFrom(seed);

    let waveIndex;
    if (waveRef !== undefined) {
      const r = resolveWave(waveRef);
      waveIndex = r >= 0 ? r : pickWaveIndex(seed);
    } else {
      waveIndex = pickWaveIndex(seed);
    }

    const fn  = compile(WAVES[waveIndex].algo);
    let val   = evalKernel(fn, y, t, frequency, phase, internalSeed, mode, unpredictability);

    if (range !== null) {
      const stats = getStats(waveIndex, internalSeed);
      return mapToRange(val, stats, range);
    }

    return val * amplitude;
  }

  // ─── createSampler() ─────────────────────────────────────────────────────────
  //
  // const s = Waves.createSampler({ wave: 'triangle', range: [-80, 80] });
  // s.sample(y)      → number
  // s.sample(y, t)   → number with time
  //
  // For 3D (two values) use two samplers with different seeds:
  //   const sx = Waves.createSampler({ seed: 0 });
  //   const sz = Waves.createSampler({ seed: 1 });

  function createSampler(options) {
    const opts           = options || {};
    const seed           = toNumber(opts.seed, 0);
    const t0             = toNumber(opts.t, 0);
    const amplitude      = toNumber(opts.amplitude, 1);
    const frequency      = toNumber(opts.frequency, 1);
    const phase          = toNumber(opts.phase, 0);
    const mode           = normalizeName(opts.mode || 'stable') === 'wild' ? 'wild' : 'stable';
    const unpredictability = toUnit(opts.unpredictability, 0);

    let range = null;
    if (Array.isArray(opts.range) && opts.range.length >= 2) {
      range = [toNumber(opts.range[0], -1), toNumber(opts.range[1], 1)];
    }

    const internalSeed = seedFrom(seed);

    let waveIndex;
    if (opts.wave !== undefined) {
      const r = resolveWave(opts.wave);
      waveIndex = r >= 0 ? r : pickWaveIndex(seed);
    } else {
      waveIndex = pickWaveIndex(seed);
    }

    const fn    = compile(WAVES[waveIndex].algo);
    const stats = range !== null ? getStats(waveIndex, internalSeed) : null;

    return {
      waveIndex: waveIndex,
      waveName:  WAVES[waveIndex].name,
      sample: function (y, t) {
        const tVal = t !== undefined ? toNumber(t, 0) : t0;
        const val  = evalKernel(fn, y, tVal, frequency, phase, internalSeed, mode, unpredictability);
        if (range !== null && stats !== null) return mapToRange(val, stats, range);
        return val * amplitude;
      }
    };
  }

  // ─── createGrid() ────────────────────────────────────────────────────────────
  //
  // const g = Waves.createGrid(20, 20);
  // g.sample(t)  → Float32Array (length cols×rows)
  //
  // const g2 = Waves.createGrid(20, 20, { range: [0,1], threshold: 0.5 });
  // g2.sample(t) → Uint8Array of 0/1
  //
  // Options:
  //   waveRow   wave for row direction          (seed-determined)
  //   waveCol   wave for col direction          (seed-determined, different)
  //   seed      number for wave selection       0
  //   range     [min,max] → Float32Array        null (raw)
  //   threshold value → Uint8Array (0/1)        null
  //   speed     time scale factor               1

  function createGrid(cols, rows, options) {
    const opts      = options || {};
    const c         = Math.max(1, Math.floor(toNumber(cols, 10)));
    const r         = Math.max(1, Math.floor(toNumber(rows, 10)));
    const seed      = toNumber(opts.seed, 0);
    const speed     = toNumber(opts.speed, 1);
    const cellCount = c * r;
    const TWO_PI    = Math.PI * 2;

    // Pick two different waves from seed
    const seedHash = seedFrom(seed);
    const rng      = mulberry32(seedHash);
    const def0     = Math.floor(rng() * WAVES.length);
    let   def1     = Math.floor(rng() * WAVES.length);
    if (def1 === def0) def1 = (def1 + 1) % WAVES.length;

    function resolveGridWave(ref, fallback) {
      if (ref === undefined || ref === null) return fallback;
      const r = resolveWave(ref);
      return r >= 0 ? r : fallback;
    }

    const rowIdx  = resolveGridWave(opts.waveRow, def0);
    const colIdx  = resolveGridWave(opts.waveCol, def1);
    const rowFn   = compile(WAVES[rowIdx].algo);
    const colFn   = compile(WAVES[colIdx].algo);
    const rowSeed = seedFrom(String(seed) + 'r' + rowIdx);
    const colSeed = seedFrom(String(seed) + 'c' + colIdx);

    let range = null;
    if (Array.isArray(opts.range) && opts.range.length >= 2) {
      range = [toNumber(opts.range[0], -1), toNumber(opts.range[1], 1)];
    }

    const hasThreshold = opts.threshold !== undefined && opts.threshold !== null;
    const threshold    = hasThreshold ? toNumber(opts.threshold, 0) : null;

    // Precompute combined min/max for range normalisation
    let stats = null;
    if (range !== null && !hasThreshold) {
      const nS = 32;
      let mn = Infinity, mx = -Infinity;
      for (let ri = 0; ri < nS; ri++) {
        const ri_in = (ri / nS) * TWO_PI;
        for (let ci = 0; ci < nS; ci++) {
          const ci_in = (ci / nS) * TWO_PI;
          const v = evaluate(rowFn, ri_in, 0, rowSeed) + evaluate(colFn, ci_in, 0, colSeed);
          if (v < mn) mn = v;
          if (v > mx) mx = v;
        }
      }
      if (!Number.isFinite(mn) || !Number.isFinite(mx) || mn === mx) { mn = -1; mx = 1; }
      stats = { min: mn, max: mx };
    }

    return {
      cols: c,
      rows: r,
      sample: function (t) {
        const time = toNumber(t, 0);

        if (hasThreshold) {
          const out = new Uint8Array(cellCount);
          let idx = 0;
          for (let row = 0; row < r; row++) {
            const ri = (row / r) * TWO_PI + time * speed;
            for (let col = 0; col < c; col++) {
              const ci  = (col / c) * TWO_PI + time * speed;
              const val = evaluate(rowFn, ri, time, rowSeed) + evaluate(colFn, ci, time, colSeed);
              out[idx++] = val > threshold ? 1 : 0;
            }
          }
          return out;
        }

        const out = new Float32Array(cellCount);
        let idx = 0;
        for (let row = 0; row < r; row++) {
          const ri = (row / r) * TWO_PI + time * speed;
          for (let col = 0; col < c; col++) {
            const ci  = (col / c) * TWO_PI + time * speed;
            const val = evaluate(rowFn, ri, time, rowSeed) + evaluate(colFn, ci, time, colSeed);
            out[idx++] = (range && stats) ? mapToRange(val, stats, range) : val;
          }
        }
        return out;
      }
    };
  }

  // ─── Discovery ───────────────────────────────────────────────────────────────

  function list() {
    return WAVES.map(function (w, i) {
      return { index: i, name: w.name, algo: w.algo };
    });
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  const Waves = {
    data:          WAVES,
    count:         WAVES.length,
    list:          list,
    wave:          wave,
    createSampler: createSampler,
    createGrid:    createGrid
  };

  // ─── p5 prototype extensions ─────────────────────────────────────────────────

  if (global.p5 && global.p5.prototype) {
    global.p5.prototype.waves = function (y, secondParam) {
      return wave(y, secondParam);
    };
    global.p5.prototype.createWaveSampler = function (opts) {
      return createSampler(opts);
    };
    global.p5.prototype.createWaveGrid = function (c, r, opts) {
      return createGrid(c, r, opts);
    };
  }

  global.Waves = Waves;

})(typeof window !== 'undefined' ? window : this);
