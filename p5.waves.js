/*!
 * p5.waves
 * Energy-consistent wave sampling for p5.js sketches.
 * Version 2.1.0
 * Author: seb@prjcts
 * License: MIT
 */
(function (global) {
  'use strict';

  const TAU = Math.PI * 2;
  const EPSILON = 1e-9;
  const NORMALIZATION_SAMPLES = 2048;
  const TARGET_RMS = 0.65;

  const NORM_CACHE = new Map();
  const SIMPLE_CACHE = { key: null, sampler: null };

  const WAVE_DEFAULTS = {
    axis: 'x',
    amplitude: 1,
    frequency: 0.01,
    phase: 0,
    refresh: 0,
    select: null,
    seconds: 0,
    vars: null,
    normalize: true,
    range: [-1, 1],
    modulation: null
  };

  function toNumber(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : (fallback ?? 0);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function wrap01(value) {
    const n = toNumber(value, 0);
    const wrapped = n - Math.floor(n);
    return wrapped < 0 ? wrapped + 1 : wrapped;
  }

  function softClip(value, knee) {
    const v = toNumber(value, 0);
    const k = Math.max(EPSILON, Math.abs(toNumber(knee, 1)));
    return Math.tanh(v / k);
  }

  function toAxis(value, fallback) {
    const axis = String(value ?? fallback ?? 'x').toLowerCase();
    if (axis === 'x' || axis === 'z' || axis === 'xz') return axis;
    return fallback ?? 'x';
  }

  function toRange(value, fallback) {
    const def = Array.isArray(fallback) ? fallback.slice() : [-1, 1];
    if (!Array.isArray(value) || value.length < 2) return def;
    const a = toNumber(value[0], def[0]);
    const b = toNumber(value[1], def[1]);
    if (!Number.isFinite(a) || !Number.isFinite(b) || a === b) return def;
    return [a, b];
  }

  function mapUnitToRange(value, range) {
    const unit = clamp(toNumber(value, 0), -1, 1);
    const t = (unit + 1) * 0.5;
    return range[0] + t * (range[1] - range[0]);
  }

  function normalizeName(value) {
    return String(value ?? '').trim().toLowerCase();
  }

  function normalizeCompact(value) {
    return normalizeName(value).replace(/[^a-z0-9]/g, '');
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

  function hash01(n) {
    const s = Math.sin(n) * 43758.5453123;
    return s - Math.floor(s);
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

  function shapeSine(u) {
    return Math.sin(TAU * wrap01(u));
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

  function shapeTangentFold(u) {
    const centered = wrap01(u) - 0.5;
    return Math.tan(centered * Math.PI * 0.98);
  }

  const PURE_WAVES = [
    {
      wave: 'classicSine',
      shape: 'sine',
      family: 'classic',
      mode: 'pure',
      inputSpace: 'unit',
      aliases: ['sine', 'ellipse'],
      fn: shapeSine
    },
    {
      wave: 'triangle',
      shape: 'triangle',
      family: 'classic',
      mode: 'pure',
      inputSpace: 'unit',
      aliases: ['phasingSharpSine', 'valleys'],
      fn: shapeTriangle
    },
    {
      wave: 'sawRise',
      shape: 'saw',
      family: 'classic',
      mode: 'pure',
      inputSpace: 'unit',
      aliases: ['rampUpSaw', 'rampDownSaw'],
      fn: shapeSaw
    },
    {
      wave: 'squarePulse',
      shape: 'square',
      family: 'classic',
      mode: 'pure',
      inputSpace: 'unit',
      aliases: ['rectangular', 'pulse'],
      fn: shapeSquare
    }
  ];

  const SCULPTURAL_WAVES = [
    {
      wave: 'tangentBloom',
      shape: 'tangentFold',
      family: 'sculptural',
      mode: 'experimental',
      inputSpace: 'unit',
      safety: 'softClip',
      clipKnee: 1,
      aliases: ['fuzzyPulse', 'upDownPulse'],
      fn: shapeTangentFold
    }
  ];

  const WAVES = PURE_WAVES.concat(SCULPTURAL_WAVES);

  function getWaveByIndex(index) {
    if (typeof index !== 'number' || !isFinite(index)) return null;
    const len = WAVES.length;
    const i = ((Math.floor(index) % len) + len) % len;
    return { index: i, wave: WAVES[i] };
  }

  function waveMatchesName(def, key, keyCompact) {
    const names = [def.wave, def.shape].concat(def.aliases || []);
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      if (!name) continue;
      if (normalizeName(name) === key) return true;
      if (normalizeCompact(name) === keyCompact) return true;
    }
    return false;
  }

  function findWaveIndexByName(name) {
    const key = normalizeName(name);
    if (!key) return -1;
    const keyCompact = normalizeCompact(name);
    for (let i = 0; i < WAVES.length; i++) {
      if (waveMatchesName(WAVES[i], key, keyCompact)) return i;
    }
    return -1;
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

  function pickIndices(seed) {
    const rng = mulberry32(seed);
    const count = WAVES.length;
    const xIndex = Math.floor(rng() * count);
    let zIndex = Math.floor(rng() * count);
    if (zIndex === xIndex) zIndex = (zIndex + 1) % count;
    return { xIndex, zIndex };
  }

  function applySafety(def, value) {
    const v = Number.isFinite(value) ? value : 0;
    if (def.safety === 'softClip') return softClip(v, def.clipKnee ?? 1);
    return v;
  }

  function getWaveNormalization(def) {
    const key = `${def.wave}|${NORMALIZATION_SAMPLES}`;
    const cached = NORM_CACHE.get(key);
    if (cached) return cached;

    const seed = seedFrom(def.wave);
    const raws = new Array(NORMALIZATION_SAMPLES);
    let min = Infinity;
    let max = -Infinity;

    for (let i = 0; i < NORMALIZATION_SAMPLES; i++) {
      const u = NORMALIZATION_SAMPLES === 1 ? 0 : i / (NORMALIZATION_SAMPLES - 1);
      const raw = applySafety(def, def.fn(u, { seed, noise: noise1D }));
      raws[i] = raw;
      if (raw < min) min = raw;
      if (raw > max) max = raw;
    }

    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
      min = -1;
      max = 1;
    }

    const bias = (min + max) * 0.5;
    const peak = Math.max(EPSILON, Math.abs(max - bias), Math.abs(min - bias));

    let sumSq = 0;
    for (let i = 0; i < raws.length; i++) {
      const unit = (raws[i] - bias) / peak;
      sumSq += unit * unit;
    }

    const rms = Math.sqrt(sumSq / raws.length);
    const energyGain = rms > EPSILON ? TARGET_RMS / rms : 1;

    const stats = {
      min,
      max,
      bias,
      peak,
      rms,
      energyGain,
      targetRms: TARGET_RMS
    };

    NORM_CACHE.set(key, stats);
    return stats;
  }

  function normalizeWaveValue(value, stats) {
    const centered = (value - stats.bias) / stats.peak;
    const matched = centered * stats.energyGain;
    return clamp(matched, -1, 1);
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
    if (shape === 'noise') return noise1D(u * 64 + seed * 0.01, seed) * 2 - 1;
    return shapeSine(u);
  }

  function evaluateWave(def, phase, seed) {
    const raw = def.fn(wrap01(phase), { seed, noise: noise1D });
    return applySafety(def, raw);
  }

  function sampleAxis(def, input, axisSeed, settings, vars) {
    const v = vars || {};
    const inputShift = toNumber(v.t, 0);
    const phaseShift = toNumber(v.phase, 0);
    const resolvedInput = input + inputShift;
    const basePhase = resolvedInput * settings.frequency + settings.phase + phaseShift;

    let modSignal = 0;
    let modAmp = 1;
    let phase = basePhase;

    if (settings.modulation) {
      const mod = settings.modulation;
      const modPhase = resolvedInput * mod.frequency + mod.phase;
      modSignal = modulationShapeSignal(mod.shape, modPhase, axisSeed);
      phase = basePhase + modSignal * mod.phaseDepth;
      modAmp = Math.max(0, 1 + modSignal * mod.amplitudeDepth);
    }

    const raw = evaluateWave(def, phase, axisSeed);
    const norm = settings.normalize ? normalizeWaveValue(raw, settings.norm) : clamp(raw, -1, 1);
    const ranged = mapUnitToRange(norm, settings.range);
    return ranged * settings.amplitude * modAmp;
  }

  function nowSeconds() {
    if (typeof global.millis === 'function') return global.millis() / 1000;
    if (typeof performance !== 'undefined' && performance.now) return performance.now() / 1000;
    return Date.now() / 1000;
  }

  function createSampler(options) {
    const opts = options || {};

    const refresh = opts.refresh ?? 0;
    const axis = toAxis(opts.axis ?? 'xz', 'xz');
    const amplitude = (
      (typeof opts.amplitude === 'number' ? opts.amplitude : undefined) ??
      (typeof opts.scale === 'number' ? opts.scale : undefined) ??
      1
    );
    const frequency = toNumber(opts.frequency ?? WAVE_DEFAULTS.frequency, WAVE_DEFAULTS.frequency);
    const phase = toNumber(opts.phase ?? WAVE_DEFAULTS.phase, WAVE_DEFAULTS.phase);
    const normalize = opts.normalize ?? WAVE_DEFAULTS.normalize;
    const range = toRange(opts.range ?? WAVE_DEFAULTS.range, [-1, 1]);
    const modulation = resolveModulation(opts.modulation ?? WAVE_DEFAULTS.modulation);

    const seed = seedFrom(refresh);
    const defaultPick = pickIndices(seed);

    const xChoice = resolveWaveRef(opts.xWave ?? opts.wave);
    const zChoice = resolveWaveRef(opts.zWave ?? opts.wave);

    const xIndex = xChoice ? xChoice.index : defaultPick.xIndex;
    const zIndex = zChoice ? zChoice.index : defaultPick.zIndex;

    const xWave = WAVES[xIndex];
    const zWave = WAVES[zIndex];

    const xNorm = getWaveNormalization(xWave);
    const zNorm = getWaveNormalization(zWave);

    return {
      refresh,
      axis,
      amplitude,
      scale: amplitude,
      frequency,
      phase,
      normalize,
      range,
      modulation,
      xIndex,
      zIndex,
      xWave,
      zWave,
      sample(y, vars) {
        const input = toNumber(y, 0);
        const out = {};

        if (axis === 'x' || axis === 'xz') {
          out.x = sampleAxis(xWave, input, seed, {
            amplitude,
            frequency,
            phase,
            normalize,
            range,
            modulation,
            norm: xNorm
          }, vars);
        }

        if (axis === 'z' || axis === 'xz') {
          out.z = sampleAxis(zWave, input, seed + 1, {
            amplitude,
            frequency,
            phase,
            normalize,
            range,
            modulation,
            norm: zNorm
          }, vars);
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
      toAxis(opts.axis ?? 'x', 'x'),
      amplitude,
      toNumber(opts.frequency ?? WAVE_DEFAULTS.frequency, WAVE_DEFAULTS.frequency),
      toNumber(opts.phase ?? WAVE_DEFAULTS.phase, WAVE_DEFAULTS.phase),
      opts.normalize ?? WAVE_DEFAULTS.normalize,
      JSON.stringify(opts.range ?? WAVE_DEFAULTS.range),
      JSON.stringify(opts.modulation ?? WAVE_DEFAULTS.modulation),
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
    if (opts.axis !== undefined) WAVE_DEFAULTS.axis = toAxis(opts.axis, WAVE_DEFAULTS.axis);
    if (opts.amplitude !== undefined || opts.scale !== undefined) {
      WAVE_DEFAULTS.amplitude = opts.amplitude ?? opts.scale ?? WAVE_DEFAULTS.amplitude;
    }
    if (opts.frequency !== undefined) WAVE_DEFAULTS.frequency = toNumber(opts.frequency, WAVE_DEFAULTS.frequency);
    if (opts.phase !== undefined) WAVE_DEFAULTS.phase = toNumber(opts.phase, WAVE_DEFAULTS.phase);
    if (opts.refresh !== undefined) WAVE_DEFAULTS.refresh = opts.refresh;
    if (opts.select !== undefined) WAVE_DEFAULTS.select = opts.select;
    if (opts.seconds !== undefined) WAVE_DEFAULTS.seconds = opts.seconds;
    if (opts.vars !== undefined) WAVE_DEFAULTS.vars = opts.vars;
    if (opts.normalize !== undefined) WAVE_DEFAULTS.normalize = !!opts.normalize;
    if (opts.range !== undefined) WAVE_DEFAULTS.range = toRange(opts.range, WAVE_DEFAULTS.range);
    if (opts.modulation !== undefined) WAVE_DEFAULTS.modulation = opts.modulation;
    return { ...WAVE_DEFAULTS, scale: WAVE_DEFAULTS.amplitude };
  }

  function wave(y, select, seconds, axisOrOptions) {
    const opts = typeof axisOrOptions === 'string' ? { axis: axisOrOptions } : (axisOrOptions || {});

    const axis = toAxis(opts.axis ?? WAVE_DEFAULTS.axis, 'x');
    const amplitude = (
      (typeof opts.amplitude === 'number' ? opts.amplitude : undefined) ??
      (typeof opts.scale === 'number' ? opts.scale : undefined) ??
      WAVE_DEFAULTS.amplitude
    );
    const frequency = toNumber(opts.frequency ?? WAVE_DEFAULTS.frequency, WAVE_DEFAULTS.frequency);
    const phase = toNumber(opts.phase ?? WAVE_DEFAULTS.phase, WAVE_DEFAULTS.phase);

    const baseRefresh = opts.refresh ?? WAVE_DEFAULTS.refresh ?? 0;
    const inlineSeconds = seconds !== undefined ? seconds : opts.seconds;
    const resolvedSeconds = inlineSeconds !== undefined ? inlineSeconds : WAVE_DEFAULTS.seconds;
    const secs = typeof resolvedSeconds === 'number' && isFinite(resolvedSeconds) && resolvedSeconds > 0 ? resolvedSeconds : 0;

    const inlineSelect = select !== undefined ? select : opts.select;
    const resolvedSelect = inlineSelect !== undefined ? inlineSelect : WAVE_DEFAULTS.select;
    const resolvedXWave = resolveWaveRef(opts.xWave);
    const resolvedZWave = resolveWaveRef(opts.zWave);

    const normalize = opts.normalize ?? WAVE_DEFAULTS.normalize;
    const range = opts.range ?? WAVE_DEFAULTS.range;
    const modulation = opts.modulation ?? WAVE_DEFAULTS.modulation;
    const vars = opts.vars ?? WAVE_DEFAULTS.vars;

    const tick = secs > 0 ? Math.floor(nowSeconds() / secs) : 0;

    const samplerOptions = {
      axis,
      amplitude,
      frequency,
      phase,
      normalize,
      range,
      modulation
    };

    if (resolvedXWave || resolvedZWave) {
      if (resolvedXWave) samplerOptions.xWave = resolvedXWave.index;
      if (resolvedZWave) samplerOptions.zWave = resolvedZWave.index;
    } else {
      const resolved = resolveWaveRef(resolvedSelect);
      if (resolved) {
      const len = WAVES.length;
      const baseIndex = Math.floor(baseRefresh) + resolved.index + tick;
      const index = ((baseIndex % len) + len) % len;
      samplerOptions.wave = index;
      } else {
        samplerOptions.refresh = baseRefresh + tick;
      }
    }

    const sampler = getSimpleSampler(samplerOptions);
    const out = sampler.sample(y, vars);

    if (axis === 'x') return out.x;
    if (axis === 'z') return out.z;
    return out;
  }

  const api = {
    data: WAVES,
    families: {
      classic: PURE_WAVES,
      sculptural: SCULPTURAL_WAVES
    },
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
  }

  global.Waves = api;
})(typeof window !== 'undefined' ? window : this);
