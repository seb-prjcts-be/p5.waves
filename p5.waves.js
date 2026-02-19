/*!
 * p5.waves
 * Samples x/z offsets from a y input using a fixed set of wave formulas.
 * Version 1.3.0
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

  // Friendly aliases for migration from p5.easywaves naming and common shorthand.
  // These aliases are additive and do not change existing numeric indices.
  const WAVE_NAME_ALIASES = Object.freeze({
    classicsine: 'classic sine',
    squarepulse: 'pulse',
    sawrise: 'ramp up saw',
    sawfall: 'ramp down saw',
    rampupsaw: 'ramp up saw',
    rampdownsaw: 'ramp down saw',
    phasingsharpsine: 'triangle',
    fuzzypulse: 'fuzzy pulse',
    updownpulse: 'up down pulse'
  });

  const CACHE = new Map();
  const NORM_CACHE = new Map();
  const SIMPLE_CACHE = { key: null, sampler: null };
  const WAVE_DEFAULTS = {
    axis: 'x',
    amplitude: 1,
    frequency: 1,
    phase: 0,
    mode: 'stable',
    unpredictability: 0,
    modulation: null,
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

  function findWaveIndexByNameRaw(name) {
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

  function findWaveIndexByName(name) {
    const raw = findWaveIndexByNameRaw(name);
    if (raw >= 0) return raw;

    const keyCompact = normalizeCompact(name);
    if (!keyCompact) return -1;

    const alias = WAVE_NAME_ALIASES[keyCompact];
    if (!alias) return -1;

    return findWaveIndexByNameRaw(alias);
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

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function toAxis(value, fallback) {
    const axis = String(value ?? fallback ?? 'x').toLowerCase();
    if (axis === 'x' || axis === 'z' || axis === 'xz') return axis;
    return fallback ?? 'x';
  }

  function toUnit(value, fallback) {
    return clamp(toNumber(value, fallback ?? 0), 0, 1);
  }

  function resolveMode(value) {
    const m = normalizeName(value || 'stable');
    return m === 'wild' ? 'wild' : 'stable';
  }

  function wrap01(value) {
    const n = toNumber(value, 0);
    const wrapped = n - Math.floor(n);
    return wrapped < 0 ? wrapped + 1 : wrapped;
  }

  function shapeSine(u) {
    return Math.sin((Math.PI * 2) * wrap01(u));
  }

  function shapeTriangle(u) {
    const p = wrap01(u);
    return 1 - 4 * Math.abs(p - 0.5);
  }

  function shapeSaw(u) {
    return wrap01(u) * 2 - 1;
  }

  function shapeSquare(u) {
    return wrap01(u) < 0.5 ? 1 : -1;
  }

  function resolveModulation(options) {
    if (!options || typeof options !== 'object') return null;

    const shape = normalizeName(options.shape || 'sine');
    const frequency = toNumber(options.frequency, 0.25);
    const phase = toNumber(options.phase, 0);
    const phaseDepth = toNumber(options.phaseDepth, 0);
    const amplitudeDepth = clamp(toNumber(options.amplitudeDepth, 0), -1, 1);

    if (phaseDepth === 0 && amplitudeDepth === 0) return null;

    return { shape, frequency, phase, phaseDepth, amplitudeDepth };
  }

  function modulationShapeSignal(shape, phase, seed) {
    const u = wrap01(phase);
    if (shape === 'triangle') return shapeTriangle(u);
    if (shape === 'saw') return shapeSaw(u);
    if (shape === 'square') return shapeSquare(u);
    if (shape === 'noise') return noiseSigned(u * 64 + seed * 0.01, seed);
    return shapeSine(u);
  }

  function noiseSigned(x, seed) {
    return noise1D(x, seed) * 2 - 1;
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

  function getClockSeconds() {
    if (typeof global.millis === 'function') return global.millis() / 1000;
    if (typeof performance !== 'undefined' && performance.now) return performance.now() / 1000;
    return Date.now() / 1000;
  }

  function resolveTimeMode(mode) {
    return normalizeName(mode) === 'tick' ? 'tick' : 'clock';
  }

  function setTimeMode(mode, options) {
    options = options || {};
    const nextMode = resolveTimeMode(mode);
    if (nextMode === 'tick' && api._timeMode !== 'tick') {
      const lastClock = toNumber(api._lastClockSeconds, NaN);
      if (Number.isFinite(lastClock)) api._timeSeconds = lastClock;
    } else if (nextMode === 'clock') {
      const clockSeconds = getClockSeconds();
      api._lastClockSeconds = clockSeconds;
      api._timeSeconds = clockSeconds;
    }
    api._timeMode = nextMode;
    return api._timeMode;
  }

  function tick(dtSeconds) {
    if (api._timeMode !== 'tick') return getTimeSeconds();
    const dt = toNumber(dtSeconds, 0);
    if (dt > 0) api._timeSeconds += dt;
    return api._timeSeconds;
  }

  function getTimeSeconds() {
    if (api._timeMode === 'tick') return api._timeSeconds;
    const clockSeconds = getClockSeconds();
    api._lastClockSeconds = clockSeconds;
    api._timeSeconds = clockSeconds;
    return clockSeconds;
  }

  function resolveWaveVars(vars, timeSeconds) {
    if (!vars || typeof vars !== 'object') return { t: timeSeconds };
    if (Object.prototype.hasOwnProperty.call(vars, 't')) return vars;
    return { ...vars, t: timeSeconds };
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
    const frequency = toNumber(opts.frequency ?? WAVE_DEFAULTS.frequency, WAVE_DEFAULTS.frequency);
    const phase = toNumber(opts.phase ?? WAVE_DEFAULTS.phase, WAVE_DEFAULTS.phase);
    const mode = resolveMode(opts.mode ?? WAVE_DEFAULTS.mode);
    const unpredictability = toUnit(opts.unpredictability ?? WAVE_DEFAULTS.unpredictability, WAVE_DEFAULTS.unpredictability);
    const modulation = resolveModulation(opts.modulation ?? WAVE_DEFAULTS.modulation);
    const normalize = opts.normalize ?? WAVE_DEFAULTS.normalize;
    const range = toRange(opts.range ?? WAVE_DEFAULTS.range, [-1, 1]);
    const domain = toDomain(opts.domain ?? WAVE_DEFAULTS.domain, [-100, 100]);
    const samples = opts.samples ?? WAVE_DEFAULTS.samples;
    const normalizeVars = opts.normalizeVars ?? WAVE_DEFAULTS.normalizeVars;
    const statDomain = [
      domain[0] * frequency + phase,
      domain[1] * frequency + phase
    ];
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
      ? getWaveStats(xIndex, xFn, seed, statDomain, samples, normalizeVars)
      : null;
    const zStats = normalize && (axis === 'z' || axis === 'xz')
      ? getWaveStats(zIndex, zFn, seed + 1, statDomain, samples, normalizeVars)
      : null;

    return {
      refresh,
      axis,
      amplitude,
      scale: amplitude,
      frequency,
      phase,
      mode,
      unpredictability,
      modulation,
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
        const input = toNumber(y, 0) * frequency + phase;
        const v = vars || {};
        const out = {};
        if (axis === 'x' || axis === 'xz') {
          let evalInput = input;
          let axisAmp = 1;
          let phaseNoise = 0;
          let frequencyScale = 1;
          let amplitudeNoise = 1;
          let wildMix = 0;
          if (mode === 'wild' && unpredictability > 0) {
            frequencyScale += noiseSigned(input * 0.17 + phase * 0.31, seed + 17) * unpredictability * 0.7;
            frequencyScale = Math.max(0.05, frequencyScale);
            phaseNoise = noiseSigned(input * 0.09 + frequency * 13.7, seed + 29) * unpredictability * 0.75;
            amplitudeNoise += noiseSigned(input * 0.23 + phase * 0.5, seed + 41) * unpredictability * 0.45;
            amplitudeNoise = Math.max(0.05, amplitudeNoise);
            wildMix = unpredictability * 0.25;
          }
          evalInput = input * frequencyScale + phaseNoise;
          if (modulation) {
            const modPhase = input * modulation.frequency + modulation.phase + phaseNoise * 0.25;
            const modSignal = modulationShapeSignal(modulation.shape, modPhase, seed);
            evalInput += modSignal * modulation.phaseDepth;
            axisAmp = Math.max(0, 1 + modSignal * modulation.amplitudeDepth);
          }
          let val = evaluate(xFn, evalInput, v, seed);
          if (wildMix > 0) {
            const wildCarrier = noiseSigned(evalInput * 0.97 + seed * 0.0001, seed + 101);
            val = lerp(val, wildCarrier, wildMix);
          }
          if (normalize) val = normalizeValue(val, xStats, range);
          out.x = val * amplitude * axisAmp * amplitudeNoise;
        }
        if (axis === 'z' || axis === 'xz') {
          let evalInput = input;
          let axisAmp = 1;
          let phaseNoise = 0;
          let frequencyScale = 1;
          let amplitudeNoise = 1;
          let wildMix = 0;
          if (mode === 'wild' && unpredictability > 0) {
            frequencyScale += noiseSigned(input * 0.17 + phase * 0.31, seed + 18) * unpredictability * 0.7;
            frequencyScale = Math.max(0.05, frequencyScale);
            phaseNoise = noiseSigned(input * 0.09 + frequency * 13.7, seed + 30) * unpredictability * 0.75;
            amplitudeNoise += noiseSigned(input * 0.23 + phase * 0.5, seed + 42) * unpredictability * 0.45;
            amplitudeNoise = Math.max(0.05, amplitudeNoise);
            wildMix = unpredictability * 0.25;
          }
          evalInput = input * frequencyScale + phaseNoise;
          if (modulation) {
            const modPhase = input * modulation.frequency + modulation.phase + phaseNoise * 0.25;
            const modSignal = modulationShapeSignal(modulation.shape, modPhase, seed + 1);
            evalInput += modSignal * modulation.phaseDepth;
            axisAmp = Math.max(0, 1 + modSignal * modulation.amplitudeDepth);
          }
          let val = evaluate(zFn, evalInput, v, seed + 1);
          if (wildMix > 0) {
            const wildCarrier = noiseSigned(evalInput * 0.97 + seed * 0.0001, seed + 102);
            val = lerp(val, wildCarrier, wildMix);
          }
          if (normalize) val = normalizeValue(val, zStats, range);
          out.z = val * amplitude * axisAmp * amplitudeNoise;
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
      toNumber(opts.frequency ?? WAVE_DEFAULTS.frequency, WAVE_DEFAULTS.frequency),
      toNumber(opts.phase ?? WAVE_DEFAULTS.phase, WAVE_DEFAULTS.phase),
      resolveMode(opts.mode ?? WAVE_DEFAULTS.mode),
      toUnit(opts.unpredictability ?? WAVE_DEFAULTS.unpredictability, WAVE_DEFAULTS.unpredictability),
      JSON.stringify(opts.modulation ?? WAVE_DEFAULTS.modulation),
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
    if (opts.frequency !== undefined) WAVE_DEFAULTS.frequency = toNumber(opts.frequency, WAVE_DEFAULTS.frequency);
    if (opts.phase !== undefined) WAVE_DEFAULTS.phase = toNumber(opts.phase, WAVE_DEFAULTS.phase);
    if (opts.mode !== undefined) WAVE_DEFAULTS.mode = resolveMode(opts.mode);
    if (opts.unpredictability !== undefined) WAVE_DEFAULTS.unpredictability = toUnit(opts.unpredictability, WAVE_DEFAULTS.unpredictability);
    if (opts.modulation !== undefined) WAVE_DEFAULTS.modulation = opts.modulation;
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
    const frequency = toNumber(opts.frequency ?? WAVE_DEFAULTS.frequency, WAVE_DEFAULTS.frequency);
    const phase = toNumber(opts.phase ?? WAVE_DEFAULTS.phase, WAVE_DEFAULTS.phase);
    const mode = resolveMode(opts.mode ?? WAVE_DEFAULTS.mode);
    const unpredictability = toUnit(opts.unpredictability ?? WAVE_DEFAULTS.unpredictability, WAVE_DEFAULTS.unpredictability);
    const modulation = opts.modulation ?? WAVE_DEFAULTS.modulation;
    const baseRefresh = opts.refresh ?? WAVE_DEFAULTS.refresh ?? 0;
    const inlineSeconds = seconds !== undefined ? seconds : opts.seconds;
    const resolvedSeconds = inlineSeconds !== undefined ? inlineSeconds : WAVE_DEFAULTS.seconds;
    const secs = typeof resolvedSeconds === 'number' && isFinite(resolvedSeconds) && resolvedSeconds > 0 ? resolvedSeconds : 0;
    const inlineSelect = select !== undefined ? select : opts.select;
    const resolvedSelect = inlineSelect !== undefined ? inlineSelect : WAVE_DEFAULTS.select;
    const resolvedXWave = resolveWaveRef(opts.xWave);
    const resolvedZWave = resolveWaveRef(opts.zWave);
    const baseVars = opts.vars ?? WAVE_DEFAULTS.vars;
    const normalize = opts.normalize ?? WAVE_DEFAULTS.normalize;
    const range = opts.range ?? WAVE_DEFAULTS.range;
    const domain = opts.domain ?? WAVE_DEFAULTS.domain;
    const samples = opts.samples ?? WAVE_DEFAULTS.samples;
    const normalizeVars = opts.normalizeVars ?? WAVE_DEFAULTS.normalizeVars;
    const timeSeconds = getTimeSeconds();
    const switchTick = secs > 0 ? Math.floor(timeSeconds / secs) : 0;
    const vars = resolveWaveVars(baseVars, timeSeconds);

    let samplerOptions = {
      axis,
      amplitude,
      frequency,
      phase,
      mode,
      unpredictability,
      modulation,
      normalize,
      range,
      domain,
      samples,
      normalizeVars
    };

    if (resolvedXWave || resolvedZWave) {
      if (resolvedXWave) samplerOptions.xWave = resolvedXWave.index;
      if (resolvedZWave) samplerOptions.zWave = resolvedZWave.index;
    } else {
      const resolved = resolveWaveRef(resolvedSelect);
      if (resolved) {
        const len = WAVES.length;
        const baseIndex = Math.floor(baseRefresh) + resolved.index + switchTick;
        const index = ((baseIndex % len) + len) % len;
        samplerOptions.wave = index;
      } else {
        samplerOptions.refresh = baseRefresh + switchTick;
      }
    }

    const sampler = getSimpleSampler(samplerOptions);
    const out = sampler.sample(y, vars);
    if (axis === 'x') return out.x;
    if (axis === 'z') return out.z;
    return out;
  }

  function listWaves() {
    const out = new Array(WAVES.length);
    for (let i = 0; i < WAVES.length; i++) {
      out[i] = { index: i, wave: WAVES[i].wave, shape: WAVES[i].shape, algo: WAVES[i].algo };
    }
    return out;
  }

  function scalarFromAxisSample(sampleOut, axis) {
    if (axis === 'x') return toNumber(sampleOut && sampleOut.x, 0);
    if (axis === 'z') return toNumber(sampleOut && sampleOut.z, 0);
    const x = toNumber(sampleOut && sampleOut.x, 0);
    const z = toNumber(sampleOut && sampleOut.z, 0);
    return (x + z) * 0.5;
  }

  function combineGridValues(a, b, mode) {
    const m = normalizeName(mode || 'add');
    if (m === 'subtract' || m === 'sub') return a - b;
    if (m === 'multiply' || m === 'mul') return a * b;
    if (m === 'max') return Math.max(a, b);
    if (m === 'min') return Math.min(a, b);
    if (m === 'avg' || m === 'average') return (a + b) * 0.5;
    return a + b;
  }

  function createGridSampler(options) {
    const opts = options || {};
    const cols = Math.max(1, Math.floor(toNumber(opts.cols ?? opts.grid ?? 14, 14)));
    const rows = Math.max(1, Math.floor(toNumber(opts.rows ?? opts.grid ?? 14, 14)));
    const inputScale = toNumber(opts.inputScale, Math.PI * 2);
    const threshold = toNumber(opts.threshold, 0);
    const thresholdJitter = toNumber(opts.thresholdJitter, 0.35);
    const mode = resolveMode(opts.mode || 'stable');
    const unpredictability = toUnit(opts.unpredictability, 0);
    const high = toNumber(opts.high ?? 1, 1);
    const low = toNumber(opts.low ?? 0, 0);
    const invert = !!opts.invert;
    const combine = normalizeName(opts.combine || 'add');
    const timeScaleA = toNumber(opts.timeScaleA ?? opts.speedA, 1);
    const timeScaleB = toNumber(opts.timeScaleB ?? opts.speedB, -1);
    const phaseA = toNumber(opts.phaseA, 0);
    const phaseB = toNumber(opts.phaseB, 0);
    const varsA = opts.varsA ?? opts.vars ?? null;
    const varsB = opts.varsB ?? opts.vars ?? null;
    const axisA = toAxis(opts.axisA ?? 'x', 'x');
    const axisB = toAxis(opts.axisB ?? 'x', 'x');
    const autoStepOnUniform = !!opts.autoStepOnUniform;
    const autoStepA = Math.floor(toNumber(opts.autoStepA, 1));
    const autoGap = Math.floor(toNumber(opts.autoGap, 10));
    const cellsSize = cols * rows;

    const baseAmplitude = toNumber(opts.amplitude ?? 1, 1);
    const baseFrequency = toNumber(opts.frequency ?? WAVE_DEFAULTS.frequency, WAVE_DEFAULTS.frequency);
    const basePhase = toNumber(opts.phase ?? WAVE_DEFAULTS.phase, WAVE_DEFAULTS.phase);
    const baseNormalize = opts.normalize ?? WAVE_DEFAULTS.normalize;
    const baseRange = toRange(opts.range ?? WAVE_DEFAULTS.range, WAVE_DEFAULTS.range);
    const baseDomain = toDomain(opts.domain ?? WAVE_DEFAULTS.domain, WAVE_DEFAULTS.domain);
    const baseSamples = opts.samples ?? WAVE_DEFAULTS.samples;
    const baseNormalizeVars = opts.normalizeVars ?? WAVE_DEFAULTS.normalizeVars;
    const baseRefresh = opts.refresh ?? 0;
    const gridSeed = seedFrom(`${baseRefresh}|${cols}|${rows}|${mode}|${unpredictability}`);

    const aChoice = resolveWaveRef(opts.waveA ?? opts.algoA ?? opts.xWave ?? opts.wave);
    const bChoice = resolveWaveRef(opts.waveB ?? opts.algoB ?? opts.zWave ?? opts.wave);
    const picked = pickIndices(seedFrom(baseRefresh));
    let waveAIndex = aChoice ? aChoice.index : picked.xIndex;
    let waveBIndex = bChoice ? bChoice.index : picked.zIndex;

    const paramsA = {
      axis: axisA,
      amplitude: toNumber(opts.amplitudeA ?? baseAmplitude, baseAmplitude),
      frequency: toNumber(opts.frequencyA ?? baseFrequency, baseFrequency),
      phase: toNumber(opts.phaseWaveA ?? basePhase, basePhase),
      mode: resolveMode(opts.modeA ?? mode),
      unpredictability: toUnit(opts.unpredictabilityA ?? unpredictability, unpredictability),
      modulation: opts.modulationA ?? opts.modulation ?? null,
      normalize: opts.normalizeA ?? baseNormalize,
      range: toRange(opts.rangeA ?? baseRange, baseRange),
      domain: toDomain(opts.domainA ?? baseDomain, baseDomain),
      samples: opts.samplesA ?? baseSamples,
      normalizeVars: opts.normalizeVarsA ?? baseNormalizeVars,
      refresh: opts.refreshA ?? baseRefresh
    };

    const paramsB = {
      axis: axisB,
      amplitude: toNumber(opts.amplitudeB ?? baseAmplitude, baseAmplitude),
      frequency: toNumber(opts.frequencyB ?? baseFrequency, baseFrequency),
      phase: toNumber(opts.phaseWaveB ?? basePhase, basePhase),
      mode: resolveMode(opts.modeB ?? mode),
      unpredictability: toUnit(opts.unpredictabilityB ?? unpredictability, unpredictability),
      modulation: opts.modulationB ?? opts.modulation ?? null,
      normalize: opts.normalizeB ?? baseNormalize,
      range: toRange(opts.rangeB ?? baseRange, baseRange),
      domain: toDomain(opts.domainB ?? baseDomain, baseDomain),
      samples: opts.samplesB ?? baseSamples,
      normalizeVars: opts.normalizeVarsB ?? baseNormalizeVars,
      refresh: opts.refreshB ?? (baseRefresh + 1)
    };

    let samplerA = null;
    let samplerB = null;
    let lastWildJumpTick = -1;

    function wrapIndex(i) {
      const len = WAVES.length;
      return ((Math.floor(i) % len) + len) % len;
    }

    function rebuildSamplers() {
      samplerA = createSampler({ ...paramsA, wave: waveAIndex });
      samplerB = createSampler({ ...paramsB, wave: waveBIndex });
    }

    function setWaves(nextA, nextB) {
      const resolvedA = resolveWaveRef(nextA);
      const resolvedB = resolveWaveRef(nextB);
      if (resolvedA) waveAIndex = resolvedA.index;
      if (resolvedB) waveBIndex = resolvedB.index;
      rebuildSamplers();
      return {
        waveAIndex,
        waveBIndex,
        waveA: WAVES[waveAIndex],
        waveB: WAVES[waveBIndex]
      };
    }

    function nextPair(stepA, gap) {
      const aStep = Math.floor(toNumber(stepA, autoStepA || 1));
      const bGap = Math.floor(toNumber(gap, autoGap || 10));
      waveAIndex = wrapIndex(waveAIndex + aStep);
      waveBIndex = wrapIndex(waveAIndex + bGap);
      rebuildSamplers();
      return {
        waveAIndex,
        waveBIndex,
        waveA: WAVES[waveAIndex],
        waveB: WAVES[waveBIndex]
      };
    }

    rebuildSamplers();

    return {
      cols,
      rows,
      threshold,
      mode,
      unpredictability,
      combine,
      high,
      low,
      invert,
      inputScale,
      sample(time, out) {
        const timeValue = toNumber(time, 0);
        const cells = out && out.cells && out.cells.length >= cellsSize
          ? out.cells
          : new Uint8Array(cellsSize);
        const values = out && out.values && out.values.length >= cellsSize
          ? out.values
          : new Float32Array(cellsSize);

        let black = 0;
        let white = 0;
        let idx = 0;
        const colDiv = cols || 1;
        const rowDiv = rows || 1;
        let frameThreshold = threshold;
        let timeJitterA = 1;
        let timeJitterB = 1;

        if (mode === 'wild' && unpredictability > 0) {
          frameThreshold += noiseSigned(timeValue * 0.19 + 1.7, gridSeed + 3) * unpredictability * thresholdJitter;
          timeJitterA += noiseSigned(timeValue * 0.07 + 5.2, gridSeed + 9) * unpredictability * 0.55;
          timeJitterB += noiseSigned(timeValue * 0.05 + 9.8, gridSeed + 11) * unpredictability * 0.55;
          timeJitterA = Math.max(0.2, timeJitterA);
          timeJitterB = Math.max(0.2, timeJitterB);

          if (unpredictability > 0.35) {
            const jumpTick = Math.floor(timeValue * (0.7 + unpredictability * 2.2));
            if (jumpTick !== lastWildJumpTick) {
              const jumpPulse = noiseSigned(jumpTick * 0.73 + 3.1, gridSeed + 47);
              if (jumpPulse > 0.82 - unpredictability * 0.3) {
                const jump = 1 + Math.floor(unpredictability * 2);
                const gapJitter = autoGap + Math.floor(noiseSigned(jumpTick * 0.31 + 8.4, gridSeed + 53) * (2 + unpredictability * 3));
                nextPair(jump, gapJitter);
              }
              lastWildJumpTick = jumpTick;
            }
          }
        }

        for (let row = 0; row < rows; row++) {
          const ny = (row / rowDiv) * inputScale;
          for (let col = 0; col < cols; col++) {
            const nx = (col / colDiv) * inputScale;
            const aIn = nx + timeValue * timeScaleA * timeJitterA + phaseA;
            const bIn = ny + timeValue * timeScaleB * timeJitterB + phaseB;
            const a = scalarFromAxisSample(samplerA.sample(aIn, varsA), axisA);
            const b = scalarFromAxisSample(samplerB.sample(bIn, varsB), axisB);
            const v = combineGridValues(a, b, combine);
            const on = invert ? v <= frameThreshold : v > frameThreshold;
            const cellVal = on ? high : low;
            cells[idx] = on ? 1 : 0;
            values[idx] = cellVal;
            idx++;
            if (on) black++;
            else white++;
          }
        }

        const uniform = black === cellsSize || white === cellsSize;
        if (autoStepOnUniform && uniform) {
          nextPair(autoStepA, autoGap);
        }

        return {
          cols,
          rows,
          cells,
          values,
          black,
          white,
          uniform,
          threshold: frameThreshold,
          mode,
          unpredictability,
          combine,
          waveAIndex,
          waveBIndex,
          waveA: WAVES[waveAIndex],
          waveB: WAVES[waveBIndex]
        };
      },
      setWaves,
      nextPair,
      getState() {
        return {
          cols,
          rows,
          waveAIndex,
          waveBIndex,
          waveA: WAVES[waveAIndex],
          waveB: WAVES[waveBIndex],
          threshold,
          mode,
          unpredictability,
          combine,
          inputScale
        };
      }
    };
  }

  function grid(time, options) {
    return createGridSampler(options).sample(time);
  }

  const api = {
    data: WAVES,
    aliases: { ...WAVE_NAME_ALIASES },
    families: {
      legacy: WAVES
    },
    list: listWaves,
    getWaveByIndex,
    getWaveByName,
    createSampler,
    createGridSampler,
    sample,
    grid,
    setWaveParams,
    wave,
    seedFrom,
    setTimeMode,
    tick,
    _timeMode: 'clock',
    _timeSeconds: 0,
    _lastClockSeconds: null
  };

  if (global.p5 && global.p5.prototype) {
    global.p5.prototype.waveSample = function (y, refresh, axisOrOptions) {
      return sample(y, refresh, axisOrOptions);
    };
    global.p5.prototype.createWaveSampler = function (refresh, options) {
      return createSampler({ ...(options || {}), refresh });
    };
    global.p5.prototype.createWaveGridSampler = function (options) {
      return createGridSampler(options);
    };
    global.p5.prototype.setWaveParams = function (options) {
      return setWaveParams(options);
    };
    global.p5.prototype.waveGrid = function (time, options) {
      return grid(time, options);
    };
    global.p5.prototype.waves = function (y, select, seconds, axisOrOptions) {
      return wave(y, select, seconds, axisOrOptions);
    };
  }

  global.Waves = api;
})(typeof window !== 'undefined' ? window : this);
