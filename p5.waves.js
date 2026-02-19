/*!
 * p5.waves
 * Samples x/z offsets from a y input using a fixed set of wave formulas.
 * Version 2.0.0
 * Author: seb@prjcts
 * License: MIT
 */
(function (global) {
  'use strict';

  // Waves library: sample x/z offsets from a y input using a seeded refresh number.
  // Usage:
  // const sampler = Waves.createSampler({ refresh: 42, axis: 'xz' });
  // const { x, z } = sampler.sample(y);

  const WAVES = [
    {
      algo: "sin(x*.1)*.4",
      shape: "ellipse",
      wave: "classic sine",    },
    {
      algo: "sin(x*.2)*.25",
      shape: "infinity",
      wave: "sine",    },
    {
      algo: "abs(sin(x*.1))*.5",
      shape: "pendulum",
      wave: "sharp peaks sine",    },
    {
      algo: "abs(sin(x*.01 + x*.1))*.5",
      shape: "phasingPendulum",
      wave: "sharp peaks sine",    },
    {
      algo: "(x*.025)%1 < .5 ? -.5 : .5",
      shape: "topBottom",
      wave: "rectangular",    },
    {
      algo: "(x*.5)%20 < 1 ? -.5 : .5",
      shape: "bottomTop",
      wave: "pulse",    },
    {
      algo: "ceil(sin(x*.1))*.25",
      shape: "leftRight",
      wave: "rectangular sine",    },
    {
      algo: "abs(cos(x*.1))*.35 + sin(x*.1)*.25",
      shape: "invertedHeart",
      wave: "mountain peaks",    },
    {
      algo: "abs(cos(x*.1))*-.35 + sin(x*.1)*.25",
      shape: "heart",
      wave: "valleys",    },
    {
      algo: "sin(x*.1)*.25 % .15",
      shape: "spaceShip",
      wave: "zig-zag sine",    },
    {
      algo: "sin(x*.1)*.7 % .4",
      shape: "starfighter",
      wave: "batman",    },
    {
      algo: "sin(x*.1)*.25 - cos(x*.1)*.25 % .15",
      shape: "solarSystem",
      wave: "zig-zag sine",    },
    {
      algo: "ceil(cos(x*.1))*.25 - sin(x*.1)*.25",
      shape: "cSection",
      wave: "offset sine",    },
    {
      algo: "ceil(tan(x*.1))*.25",
      shape: "hive",
      wave: "steps down",    },
    {
      algo: "round(sin(-x*.1))*.25",
      shape: "hexagon",
      wave: "steps",    },
    {
      algo: "sq(sin(PI/2+x*.1))*.25",
      shape: "invertedPendulum",
      wave: "class sine",    },
    {
      algo: "sq(sin(x*.1))*.25",
      shape: "pendulum",
      wave: "classic sine",    },
    {
      algo: "sin(x*.1)*.25 + sin(x*.5)*.1",
      shape: "depthIllusion",
      wave: "bumpy sine",    },
    {
      algo: "sin(x*.1)*cos(x*.2)*.5",
      shape: "headWithEars",
      wave: "bumpy sine",    },
    {
      algo: "x*sin(x*.1) % .5",
      shape: "upDownScatter",
      wave: "up down noise",    },
    {
      algo: "sin(x*.45 + radians(x))*cos(x*.4)*.5",
      shape: "upDownScatter",
      wave: "meta sine",    },
    {
      algo: "abs((x*.03) % (.5*2) - .5)",
      shape: "phasingSharpSine",
      wave: "triangle",    },
    {
      algo: "-1*(x*.02%1)/1 + 0.5",
      shape: "spiral",
      wave: "ramp with period height"
    },
    {
      algo: "x*.03 % .5",
      shape: "crissCross",
      wave: "ramp down saw",    },
    {
      algo: "-x*.03 % .5",
      shape: "crissCross",
      wave: "ramp up saw",    },
    {
      algo: "log(x)*.1",
      shape: "snake",
      wave: "fade out",    },
    {
      algo: "random(x*.003)",
      shape: "scatterDown",
      wave: "grow random",    },
    {
      algo: "noise(x*.1) - .5",
      shape: "noise",
      wave: "noise",    },
    {
      algo: "tan(x*20)*.05",
      shape: "fuzzyCenter",
      wave: "fuzzy pulse",    },
    {
      algo: "tan(x*.1)*.05",
      shape: "spinningTop",
      wave: "up down pulse",    },
    {
      algo: "sq(x*.05) % .5",
      shape: "scatter",
      wave: "bald patch",    },
    {
      algo: "sin(x*.1) < 0 ? random(-.2, .2) : sin(x*.1)*.5",
      shape: "foamingBowl",
      wave: "fuzzy peak sine",    },
    {
      algo: "sin(x)*(x*.01%.5)",
      shape: "scatter",
      wave: "ramp up sine",    },
    {
      algo: "sin(x)*(x*.01%1-.5)",
      shape: "scatter",
      wave: "triangle sine",    },
    {
      algo: "sin(x*.1)*cos(x*1)*.5",
      shape: "scatterSphere",
      wave: "round linked sine",    },
    {
      algo: "sin(x*.05)*(x*.1%.5)",
      shape: "crissCrossUpDown",
      wave: "half & half sine",    },
    {
      algo: "sin(x*3.1)*.25",
      shape: "dna",
      wave: "smooth solid sine"
    }
  ];

  const CACHE = new Map();
  const NORM_CACHE = new Map();
  const SIMPLE_CACHE = { key: null, sampler: null };
  const WAVE_DEFAULTS = {
    axis: 'x',
    amplitude: 1,
    refresh: 0,
    select: null,
    seconds: 0,
    vars: null,
    normalize: false,
    range: [-1, 1],
    domain: [-100, 100],
    samples: 512,
    normalizeVars: null
  };

  function normalizeName(value) {
    return String(value ?? '').trim().toLowerCase();
  }

  function normalizeCompact(value) {
    return normalizeName(value).replace(/[^a-z0-9]/g, '');
  }

  function findWaveIndexByName(name) {
    const key = normalizeName(name);
    if (!key) return -1;
    const keyCompact = normalizeCompact(name);
    for (let i = 0; i < WAVES.length; i++) {
      const waveName = normalizeName(WAVES[i].wave);
      const shapeName = normalizeName(WAVES[i].shape);
      if (waveName === key || shapeName === key) return i;
      const waveCompact = normalizeCompact(WAVES[i].wave);
      if (waveCompact && keyCompact && waveCompact === keyCompact) return i;
      if (shapeName && keyCompact && normalizeCompact(shapeName) === keyCompact) return i;
    }
    return -1;
  }

  function getWaveByIndex(index) {
    if (typeof index !== 'number' || !isFinite(index)) return null;
    const len = WAVES.length;
    const i = ((Math.floor(index) % len) + len) % len;
    return { index: i, wave: WAVES[i] };
  }

  function getWaveByName(name) {
    const i = findWaveIndexByName(name);
    if (i < 0) return null;
    return { index: i, wave: WAVES[i] };
  }

  function resolveWaveRef(ref) {
    if (ref === undefined || ref === null) return null;
    if (typeof ref === 'number') return getWaveByIndex(ref);
    if (typeof ref === 'string') return getWaveByName(ref);
    if (typeof ref === 'object') {
      if (typeof ref.index === 'number') return getWaveByIndex(ref.index);
      if (typeof ref.wave === 'string') return getWaveByName(ref.wave);
      if (typeof ref.name === 'string') return getWaveByName(ref.name);
    }
    return null;
  }

  function seedFrom(value) {
    const str = String(value ?? 0);
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(a) {
    return function () {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pickIndices(seed) {
    const rng = mulberry32(seed);
    const count = WAVES.length;
    const xIndex = Math.floor(rng() * count);
    let zIndex = Math.floor(rng() * count);
    if (zIndex === xIndex) zIndex = (zIndex + 1) % count;
    return { xIndex, zIndex };
  }

  function hash01(n) {
    const s = Math.sin(n) * 43758.5453123;
    return s - Math.floor(s);
  }

  function rand01(seed, x, i) {
    return hash01(seed * 0.001 + x * 0.017 + i * 0.131);
  }

  function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function noise1D(x, seed) {
    if (!Number.isFinite(x)) return 0;
    const xi = Math.floor(x);
    const xf = x - xi;
    const v0 = hash01(xi + seed * 0.07);
    const v1 = hash01(xi + 1 + seed * 0.07);
    return lerp(v0, v1, fade(xf));
  }

  function radians(deg) {
    return deg * (Math.PI / 180);
  }

  function sq(n) {
    return n * n;
  }

  function toNumber(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : (fallback ?? 0);
  }

  function toRange(value, fallback) {
    const def = fallback || [-1, 1];
    if (!Array.isArray(value) || value.length < 2) return def.slice();
    const a = toNumber(value[0], def[0]);
    const b = toNumber(value[1], def[1]);
    if (!Number.isFinite(a) || !Number.isFinite(b) || a === b) return def.slice();
    return [a, b];
  }

  function toDomain(value, fallback) {
    const def = fallback || [-100, 100];
    if (!Array.isArray(value) || value.length < 2) return def.slice();
    const a = toNumber(value[0], def[0]);
    const b = toNumber(value[1], def[1]);
    if (!Number.isFinite(a) || !Number.isFinite(b) || a === b) return def.slice();
    return [a, b];
  }

  function varsToKey(vars) {
    if (!vars) return '';
    const keys = Object.keys(vars).sort();
    let out = '';
    for (const k of keys) {
      out += `${k}:${String(vars[k])}|`;
    }
    return out;
  }

  function getWaveStats(index, fn, seed, domain, samples, normVars) {
    const count = Math.max(2, Math.floor(toNumber(samples, 512)));
    const d0 = toNumber(domain[0], -100);
    const d1 = toNumber(domain[1], 100);
    const key = `${index}|${seed}|${d0}|${d1}|${count}|${varsToKey(normVars)}`;
    const cached = NORM_CACHE.get(key);
    if (cached) return cached;

    let min = Infinity;
    let max = -Infinity;
    const span = d1 - d0;
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1);
      const x = d0 + span * t;
      const v = evaluate(fn, x, normVars, seed);
      if (v < min) min = v;
      if (v > max) max = v;
    }

    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
      min = 0;
      max = 1;
    }

    const stats = { min, max };
    NORM_CACHE.set(key, stats);
    return stats;
  }

  function normalizeValue(value, stats, range) {
    if (!stats || stats.min === stats.max) return 0;
    const t = (value - stats.min) / (stats.max - stats.min);
    return range[0] + t * (range[1] - range[0]);
  }

  function nowSeconds() {
    if (typeof global.millis === 'function') return global.millis() / 1000;
    if (typeof performance !== 'undefined' && performance.now) return performance.now() / 1000;
    return Date.now() / 1000;
  }

  const ARG_NAMES = [
    'x', 'y', 'z', 't', 'dis',
    'random', 'noise',
    'sin', 'cos', 'tan', 'abs', 'ceil', 'round', 'floor', 'min', 'max',
    'log', 'sq', 'radians', 'PI'
  ];

  function compile(expr) {
    if (CACHE.has(expr)) return CACHE.get(expr);
    const fn = new Function(...ARG_NAMES, `return (${expr});`);
    CACHE.set(expr, fn);
    return fn;
  }

  function evaluate(fn, input, vars, seed) {
    const v = vars || {};
    const x = toNumber(input, 0);
    const y = toNumber(v.y, 0);
    const z = toNumber(v.z, 0);
    const t = toNumber(v.t, 0);
    const dis = toNumber(v.dis, 0);
    let calls = 0;

    const random = (min, max) => {
      const r = rand01(seed, x, calls++);
      if (min === undefined) return r;
      if (max === undefined) {
        max = min;
        min = 0;
      }
      if (max < min) {
        const tmp = max;
        max = min;
        min = tmp;
      }
      return min + r * (max - min);
    };

    const noise = (n) => noise1D(n, seed);

    const out = fn(
      x, y, z, t, dis,
      random, noise,
      Math.sin, Math.cos, Math.tan, Math.abs, Math.ceil, Math.round, Math.floor, Math.min, Math.max,
      Math.log, sq, radians, Math.PI
    );
    return Number.isFinite(out) ? out : 0;
  }

  function createSampler(options) {
    const opts = options || {};
    const refresh = opts.refresh ?? 0;
    const axis = opts.axis || 'xz';
    const amplitude = (
      (typeof opts.amplitude === 'number' ? opts.amplitude : undefined) ??
      (typeof opts.scale === 'number' ? opts.scale : undefined) ??
      1
    );
    const normalize = opts.normalize ?? WAVE_DEFAULTS.normalize;
    const range = toRange(opts.range ?? WAVE_DEFAULTS.range, [-1, 1]);
    const domain = toDomain(opts.domain ?? WAVE_DEFAULTS.domain, [-100, 100]);
    const samples = opts.samples ?? WAVE_DEFAULTS.samples;
    const normalizeVars = opts.normalizeVars ?? WAVE_DEFAULTS.normalizeVars;
    const seed = seedFrom(refresh);
    const defaultPick = pickIndices(seed);
    const xChoice = resolveWaveRef(opts.xWave ?? opts.wave);
    const zChoice = resolveWaveRef(opts.zWave ?? opts.wave);
    const xIndex = xChoice ? xChoice.index : defaultPick.xIndex;
    const zIndex = zChoice ? zChoice.index : defaultPick.zIndex;
    const xWave = WAVES[xIndex];
    const zWave = WAVES[zIndex];
    const xFn = compile(xWave.algo);
    const zFn = compile(zWave.algo);
    const xStats = normalize && (axis === 'x' || axis === 'xz')
      ? getWaveStats(xIndex, xFn, seed, domain, samples, normalizeVars)
      : null;
    const zStats = normalize && (axis === 'z' || axis === 'xz')
      ? getWaveStats(zIndex, zFn, seed + 1, domain, samples, normalizeVars)
      : null;

    return {
      refresh,
      axis,
      amplitude,
      scale: amplitude,
      normalize,
      range,
      domain,
      samples,
      normalizeVars,
      xIndex,
      zIndex,
      xWave,
      zWave,
      sample(y, vars) {
        const out = {};
        if (axis === 'x' || axis === 'xz') {
          let val = evaluate(xFn, y, vars, seed);
          if (normalize) val = normalizeValue(val, xStats, range);
          out.x = val * amplitude;
        }
        if (axis === 'z' || axis === 'xz') {
          let val = evaluate(zFn, y, vars, seed + 1);
          if (normalize) val = normalizeValue(val, zStats, range);
          out.z = val * amplitude;
        }
        return out;
      }
    };
  }

  function getSimpleSampler(options) {
    const opts = options || {};
    const amplitude = (
      (typeof opts.amplitude === 'number' ? opts.amplitude : undefined) ??
      (typeof opts.scale === 'number' ? opts.scale : undefined) ??
      1
    );
    const key = [
      opts.refresh ?? 0,
      opts.axis || 'x',
      amplitude,
      opts.normalize ?? WAVE_DEFAULTS.normalize,
      JSON.stringify(opts.range ?? WAVE_DEFAULTS.range),
      JSON.stringify(opts.domain ?? WAVE_DEFAULTS.domain),
      opts.samples ?? WAVE_DEFAULTS.samples,
      varsToKey(opts.normalizeVars ?? WAVE_DEFAULTS.normalizeVars),
      opts.wave ?? '',
      opts.xWave ?? '',
      opts.zWave ?? ''
    ].join('|');
    if (SIMPLE_CACHE.key !== key) {
      SIMPLE_CACHE.key = key;
      SIMPLE_CACHE.sampler = createSampler({ ...opts, amplitude });
    }
    return SIMPLE_CACHE.sampler;
  }

  function sample(y, refresh, axisOrOptions) {
    const opts = typeof axisOrOptions === 'string' ? { axis: axisOrOptions } : (axisOrOptions || {});
    return createSampler({ ...opts, refresh }).sample(y, opts.vars);
  }

  function setWaveParams(options) {
    const opts = options || {};
    if (opts.axis !== undefined) WAVE_DEFAULTS.axis = opts.axis;
    if (opts.amplitude !== undefined || opts.scale !== undefined) {
      WAVE_DEFAULTS.amplitude = opts.amplitude ?? opts.scale ?? WAVE_DEFAULTS.amplitude;
    }
    if (opts.refresh !== undefined) WAVE_DEFAULTS.refresh = opts.refresh;
    if (opts.select !== undefined) WAVE_DEFAULTS.select = opts.select;
    if (opts.seconds !== undefined) WAVE_DEFAULTS.seconds = opts.seconds;
    if (opts.vars !== undefined) WAVE_DEFAULTS.vars = opts.vars;
    if (opts.normalize !== undefined) WAVE_DEFAULTS.normalize = opts.normalize;
    if (opts.range !== undefined) WAVE_DEFAULTS.range = toRange(opts.range, WAVE_DEFAULTS.range);
    if (opts.domain !== undefined) WAVE_DEFAULTS.domain = toDomain(opts.domain, WAVE_DEFAULTS.domain);
    if (opts.samples !== undefined) WAVE_DEFAULTS.samples = opts.samples;
    if (opts.normalizeVars !== undefined) WAVE_DEFAULTS.normalizeVars = opts.normalizeVars;
    return { ...WAVE_DEFAULTS, scale: WAVE_DEFAULTS.amplitude };
  }

  function wave(y, select, seconds, axisOrOptions) {
    const opts = typeof axisOrOptions === 'string' ? { axis: axisOrOptions } : (axisOrOptions || {});
    const axis = (opts.axis ?? WAVE_DEFAULTS.axis) || 'x';
    const amplitude = (
      (typeof opts.amplitude === 'number' ? opts.amplitude : undefined) ??
      (typeof opts.scale === 'number' ? opts.scale : undefined) ??
      WAVE_DEFAULTS.amplitude
    );
    const baseRefresh = opts.refresh ?? WAVE_DEFAULTS.refresh ?? 0;
    const inlineSeconds = seconds !== undefined ? seconds : opts.seconds;
    const resolvedSeconds = inlineSeconds !== undefined ? inlineSeconds : WAVE_DEFAULTS.seconds;
    const secs = typeof resolvedSeconds === 'number' && isFinite(resolvedSeconds) && resolvedSeconds > 0 ? resolvedSeconds : 0;
    const inlineSelect = select !== undefined ? select : opts.select;
    const resolvedSelect = inlineSelect !== undefined ? inlineSelect : WAVE_DEFAULTS.select;
    const vars = opts.vars ?? WAVE_DEFAULTS.vars;
    const normalize = opts.normalize ?? WAVE_DEFAULTS.normalize;
    const range = opts.range ?? WAVE_DEFAULTS.range;
    const domain = opts.domain ?? WAVE_DEFAULTS.domain;
    const samples = opts.samples ?? WAVE_DEFAULTS.samples;
    const normalizeVars = opts.normalizeVars ?? WAVE_DEFAULTS.normalizeVars;
    const tick = secs > 0 ? Math.floor(nowSeconds() / secs) : 0;

    let samplerOptions = {
      axis,
      amplitude,
      normalize,
      range,
      domain,
      samples,
      normalizeVars
    };

    const resolved = resolveWaveRef(resolvedSelect);
    if (resolved) {
      const len = WAVES.length;
      const baseIndex = Math.floor(baseRefresh) + resolved.index + tick;
      const index = ((baseIndex % len) + len) % len;
      samplerOptions.wave = index;
    } else {
      samplerOptions.refresh = baseRefresh + tick;
    }

    const sampler = getSimpleSampler(samplerOptions);
    const out = sampler.sample(y, vars);
    if (axis === 'x') return out.x;
    if (axis === 'z') return out.z;
    return out;
  }

  const api = {
    data: WAVES,
    getWaveByIndex,
    getWaveByName,
    createSampler,
    sample,
    setWaveParams,
    wave,
    seedFrom
  };

  if (global.p5 && global.p5.prototype) {
    global.p5.prototype.waveSample = function (y, refresh, axisOrOptions) {
      return sample(y, refresh, axisOrOptions);
    };
    global.p5.prototype.createWaveSampler = function (refresh, options) {
      return createSampler({ ...(options || {}), refresh });
    };
    global.p5.prototype.setWaveParams = function (options) {
      return setWaveParams(options);
    };
    global.p5.prototype.waves = function (y, select, seconds, axisOrOptions) {
      return wave(y, select, seconds, axisOrOptions);
    };
    global.p5.prototype.wave = function (y, select, seconds, axisOrOptions) {
      return wave(y, select, seconds, axisOrOptions);
    };
  }

  global.Waves = api;
})(typeof window !== 'undefined' ? window : this);
