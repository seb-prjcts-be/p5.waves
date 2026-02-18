/*!
 * p5.waves
 * Samples x/z offsets from a y input using a fixed set of wave formulas.
 * Version 1.2.0
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
  const ORDER_CACHE = new Map();
  const SIMPLE_CACHE = { key: null, sampler: null };
  const WAVE_DEFAULTS = {
    axis: 'x',
    amplitude: 1,
    refresh: 0,
    select: null,
    seconds: 0,
    step: null,
    vars: null,
    formulaVars: null,
    params: null,
    normalize: false,
    normalizeMode: 'minmax',
    range: [-1, 1],
    outputRange: [-1, 1],
    domain: [-100, 100],
    inputDomain: [-100, 100],
    clampRange: null,
    samples: 512,
    normalizeVars: null,
    order: null,
    orderSeed: null,
    noRepeat: false,
    allowRandomInFormula: true,
    allowNoiseInFormula: true
  };

  function normalizeName(value) {
    return String(value ?? '').trim().toLowerCase();
  }

  function normalizeCompact(value) {
    return normalizeName(value).replace(/[^a-z0-9]/g, '');
  }

  function hasOwn(obj, key) {
    return !!obj && Object.prototype.hasOwnProperty.call(obj, key);
  }

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function mod(n, m) {
    if (!Number.isFinite(n) || !Number.isFinite(m) || m === 0) return 0;
    return ((Math.floor(n) % m) + m) % m;
  }

  function normalizeAxis(value, fallback) {
    const axis = normalizeName(value ?? fallback ?? 'x');
    if (axis === 'x' || axis === 'z' || axis === 'xz') return axis;
    return normalizeName(fallback ?? 'x') || 'x';
  }

  function normalizeMode(value, fallback) {
    const mode = normalizeName(value ?? fallback ?? 'minmax');
    return mode === 'clamp' ? 'clamp' : 'minmax';
  }

  function findWaveIndexByName(name) {
    const key = normalizeName(name);
    if (!key) return -1;
    const keyCompact = normalizeCompact(name);
    for (let i = 0; i < WAVES.length; i++) {
      const waveName = normalizeName(WAVES[i].wave);
      const shapeName = normalizeName(WAVES[i].shape);
      if (waveName === key || shapeName === key) return i;
      if (shapeName && keyCompact && normalizeCompact(shapeName) === keyCompact) return i;
    }
    return -1;
  }

  function getWaveByIndex(index) {
    if (typeof index !== 'number' || !isFinite(index)) return null;
    const len = WAVES.length;
    const i = mod(index, len);
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

  function resolveFormulaVarsAlias(opts, fallback) {
    if (hasOwn(opts, 'formulaVars')) return isObject(opts.formulaVars) ? opts.formulaVars : {};
    if (hasOwn(opts, 'params')) return isObject(opts.params) ? opts.params : {};
    return isObject(fallback) ? fallback : {};
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

  function getShuffleOrder(seed, count) {
    const key = `${seed}|${count}`;
    const cached = ORDER_CACHE.get(key);
    if (cached) return cached;
    const arr = [];
    for (let i = 0; i < count; i++) arr.push(i);
    const rng = mulberry32(seed);
    for (let i = count - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    ORDER_CACHE.set(key, arr);
    return arr;
  }

  function resolveOrderMode(order, hasSelect) {
    if (typeof order === 'string') {
      const key = normalizeName(order);
      if (key === 'sequential' || key === 'shuffle' || key === 'random') return key;
    }
    return hasSelect ? 'sequential' : null;
  }

  function resolveOrderedIndex(options) {
    const count = WAVES.length;
    const selectRef = resolveWaveRef(options.select);
    const hasSelect = !!selectRef;
    const order = resolveOrderMode(options.order, hasSelect);
    if (!order) return null;

    const baseRefresh = Math.floor(toNumber(options.refresh, 0));
    const tick = Math.floor(toNumber(options.tick, 0));
    const baseIndex = hasSelect ? selectRef.index : 0;
    const baseSeed = seedFrom(options.orderSeed ?? options.refresh ?? 0);

    if (order === 'sequential') {
      return mod(baseRefresh + baseIndex + tick, count);
    }

    if (order === 'shuffle') {
      const perm = getShuffleOrder(baseSeed, count);
      const basePos = hasSelect ? perm.indexOf(baseIndex) : 0;
      const shift = mod(baseRefresh + tick, count);
      const pos = mod((basePos < 0 ? 0 : basePos) + shift, count);
      return perm[pos];
    }

    const stepSeed = seedFrom(`${baseSeed}|${tick}|${baseRefresh}`);
    const rng = mulberry32(stepSeed);
    let index = mod(Math.floor(rng() * count) + baseIndex + baseRefresh, count);
    if (options.noRepeat && count > 1 && tick > 0) {
      const prevSeed = seedFrom(`${baseSeed}|${tick - 1}|${baseRefresh}`);
      const prevRng = mulberry32(prevSeed);
      const prev = mod(Math.floor(prevRng() * count) + baseIndex + baseRefresh, count);
      if (index === prev) index = (index + 1 + mod(baseRefresh, count - 1)) % count;
    }
    return index;
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

  function resolveOutputRange(opts, fallback) {
    if (hasOwn(opts, 'outputRange')) return toRange(opts.outputRange, fallback);
    if (hasOwn(opts, 'range')) return toRange(opts.range, fallback);
    return toRange(fallback, [-1, 1]);
  }

  function resolveInputDomain(opts, fallback) {
    if (hasOwn(opts, 'inputDomain')) return toDomain(opts.inputDomain, fallback);
    if (hasOwn(opts, 'domain')) return toDomain(opts.domain, fallback);
    return toDomain(fallback, [-100, 100]);
  }

  function resolveAmplitude(opts, fallback) {
    if (typeof opts?.amplitude === 'number') return opts.amplitude;
    if (typeof opts?.scale === 'number') return opts.scale;
    return fallback ?? 1;
  }

  function mergeFormulaVars() {
    const out = {};
    for (let i = 0; i < arguments.length; i++) {
      const source = arguments[i];
      if (!isObject(source)) continue;
      for (const key of Object.keys(source)) out[key] = source[key];
    }
    return out;
  }

  function stableSerialize(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value);
    if (typeof value === 'string') return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
    if (typeof value === 'object') {
      const keys = Object.keys(value).sort();
      return `{${keys.map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`).join(',')}}`;
    }
    return String(value);
  }

  function varsToKey(vars) {
    return stableSerialize(vars || {});
  }

  function pairToKey(pair) {
    if (!Array.isArray(pair) || pair.length < 2) return '';
    return `${toNumber(pair[0], 0)},${toNumber(pair[1], 0)}`;
  }

  function getWaveStats(index, fn, seed, domain, samples, normVars, formulaVars, evalOptions) {
    const count = Math.max(2, Math.floor(toNumber(samples, 512)));
    const d0 = toNumber(domain[0], -100);
    const d1 = toNumber(domain[1], 100);
    const key = [
      index,
      seed,
      d0,
      d1,
      count,
      varsToKey(normVars),
      varsToKey(formulaVars),
      evalOptions?.allowRandomInFormula === false ? 0 : 1,
      evalOptions?.allowNoiseInFormula === false ? 0 : 1
    ].join('|');
    const cached = NORM_CACHE.get(key);
    if (cached) return cached;

    let min = Infinity;
    let max = -Infinity;
    let finite = 0;
    const span = d1 - d0;
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1);
      const x = d0 + span * t;
      const v = evaluate(fn, x, normVars, seed, formulaVars, evalOptions);
      if (!Number.isFinite(v)) continue;
      finite++;
      if (v < min) min = v;
      if (v > max) max = v;
    }

    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
      min = 0;
      max = 1;
    }

    const stats = { min, max, finiteRatio: finite / count };
    NORM_CACHE.set(key, stats);
    return stats;
  }

  function normalizeValue(value, stats, range, mode, clampRange) {
    if (!stats || stats.min === stats.max) return range[0];
    let srcMin = stats.min;
    let srcMax = stats.max;
    if (mode === 'clamp' && Array.isArray(clampRange) && clampRange.length >= 2) {
      srcMin = toNumber(clampRange[0], srcMin);
      srcMax = toNumber(clampRange[1], srcMax);
      if (!Number.isFinite(srcMin) || !Number.isFinite(srcMax) || srcMin === srcMax) {
        srcMin = stats.min;
        srcMax = stats.max;
      }
    }
    if (srcMin === srcMax) return range[0];
    let t = (value - srcMin) / (srcMax - srcMin);
    if (mode === 'clamp') {
      if (t < 0) t = 0;
      if (t > 1) t = 1;
    }
    return range[0] + t * (range[1] - range[0]);
  }

  function nowSeconds() {
    if (typeof global.millis === 'function') return global.millis() / 1000;
    if (typeof performance !== 'undefined' && performance.now) return performance.now() / 1000;
    return Date.now() / 1000;
  }

  function getFrameCount() {
    if (typeof global.frameCount === 'number' && Number.isFinite(global.frameCount)) return Math.floor(global.frameCount);
    return null;
  }

  function normalizeStep(step, legacySeconds) {
    const out = {};
    if (isObject(step)) {
      const frames = toNumber(step.frames, 0);
      const seconds = toNumber(step.seconds, 0);
      if (frames > 0) out.frames = frames;
      if (seconds > 0) out.seconds = seconds;
    }
    const secs = toNumber(legacySeconds, 0);
    if (!out.seconds && secs > 0) out.seconds = secs;
    return Object.keys(out).length ? out : null;
  }

  function getStepTick(step) {
    if (!step) return 0;
    const frames = toNumber(step.frames, 0);
    const seconds = toNumber(step.seconds, 0);
    if (frames > 0) {
      const frameCount = getFrameCount();
      if (frameCount !== null) return Math.floor(frameCount / frames);
      if (seconds > 0) return Math.floor(nowSeconds() / seconds);
      return 0;
    }
    if (seconds > 0) return Math.floor(nowSeconds() / seconds);
    return 0;
  }

  function buildEvalOptions(opts, fallback) {
    const base = fallback || {};
    return {
      allowRandomInFormula: hasOwn(opts, 'allowRandomInFormula')
        ? Boolean(opts.allowRandomInFormula)
        : (base.allowRandomInFormula !== false),
      allowNoiseInFormula: hasOwn(opts, 'allowNoiseInFormula')
        ? Boolean(opts.allowNoiseInFormula)
        : (base.allowNoiseInFormula !== false),
      coerceNonFinite: hasOwn(opts, 'coerceNonFinite')
        ? Boolean(opts.coerceNonFinite)
        : (base.coerceNonFinite !== false)
    };
  }

  const ARG_NAMES = [
    'x', 'y', 'z', 't', 'dis',
    'random', 'noise',
    'sin', 'cos', 'tan', 'abs', 'ceil', 'round', 'floor', 'min', 'max',
    'log', 'sq', 'radians', 'PI',
    'v'
  ];

  function compile(expr) {
    if (CACHE.has(expr)) return CACHE.get(expr);
    const fn = new Function(...ARG_NAMES, `return (${expr});`);
    CACHE.set(expr, fn);
    return fn;
  }

  function evaluate(fn, input, vars, seed, formulaVars, evalOptions) {
    const data = vars || {};
    const x = toNumber(input, 0);
    const y = toNumber(data.y, 0);
    const z = toNumber(data.z, 0);
    const t = toNumber(data.t, 0);
    const dis = toNumber(data.dis, 0);
    const formula = isObject(formulaVars) ? formulaVars : {};
    const settings = evalOptions || {};
    const allowRandom = settings.allowRandomInFormula !== false;
    const allowNoise = settings.allowNoiseInFormula !== false;
    const coerce = settings.coerceNonFinite !== false;
    let calls = 0;

    const random = (min, max) => {
      if (!allowRandom) return 0;
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

    const noise = (n) => (allowNoise ? noise1D(n, seed) : 0);

    const out = fn(
      x, y, z, t, dis,
      random, noise,
      Math.sin, Math.cos, Math.tan, Math.abs, Math.ceil, Math.round, Math.floor, Math.min, Math.max,
      Math.log, sq, radians, Math.PI,
      formula
    );
    if (Number.isFinite(out)) return out;
    return coerce ? 0 : out;
  }

  function createSampler(options) {
    const opts = options || {};
    const refresh = toNumber(opts.refresh ?? 0, 0);
    const axis = normalizeAxis(opts.axis, 'xz');
    const amplitude = resolveAmplitude(opts, 1);
    const normalize = hasOwn(opts, 'normalize') ? Boolean(opts.normalize) : Boolean(WAVE_DEFAULTS.normalize);
    const outputRange = resolveOutputRange(opts, WAVE_DEFAULTS.outputRange);
    const inputDomain = resolveInputDomain(opts, WAVE_DEFAULTS.inputDomain);
    const samples = Math.max(2, Math.floor(toNumber(opts.samples ?? WAVE_DEFAULTS.samples, WAVE_DEFAULTS.samples)));
    const normalizeVars = hasOwn(opts, 'normalizeVars') ? opts.normalizeVars : WAVE_DEFAULTS.normalizeVars;
    const mode = normalizeMode(opts.normalizeMode ?? WAVE_DEFAULTS.normalizeMode, WAVE_DEFAULTS.normalizeMode);
    const clampRange = hasOwn(opts, 'clampRange')
      ? toRange(opts.clampRange, outputRange)
      : (WAVE_DEFAULTS.clampRange ? toRange(WAVE_DEFAULTS.clampRange, outputRange) : null);
    const evalOptions = buildEvalOptions(opts, WAVE_DEFAULTS);
    evalOptions.coerceNonFinite = true;

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

    const globalFormulaDefaults = resolveFormulaVarsAlias(WAVE_DEFAULTS, {});
    const optionFormulaDefaults = resolveFormulaVarsAlias(opts, globalFormulaDefaults);
    const normalizeFormulaDefaults = resolveFormulaVarsAlias(
      { formulaVars: opts.normalizeFormulaVars, params: opts.normalizeParams },
      optionFormulaDefaults
    );
    const xWaveDefaults = resolveFormulaVarsAlias(xWave, {});
    const zWaveDefaults = resolveFormulaVarsAlias(zWave, {});
    const xBaseFormulaVars = mergeFormulaVars(xWaveDefaults, optionFormulaDefaults);
    const zBaseFormulaVars = mergeFormulaVars(zWaveDefaults, optionFormulaDefaults);
    const xNormFormulaVars = mergeFormulaVars(xWaveDefaults, normalizeFormulaDefaults, isObject(normalizeVars) ? normalizeVars : {});
    const zNormFormulaVars = mergeFormulaVars(zWaveDefaults, normalizeFormulaDefaults, isObject(normalizeVars) ? normalizeVars : {});

    const xStats = normalize && (axis === 'x' || axis === 'xz')
      ? getWaveStats(xIndex, xFn, seed, inputDomain, samples, normalizeVars, xNormFormulaVars, evalOptions)
      : null;
    const zStats = normalize && (axis === 'z' || axis === 'xz')
      ? getWaveStats(zIndex, zFn, seed + 1, inputDomain, samples, normalizeVars, zNormFormulaVars, evalOptions)
      : null;

    function cloneStats(stats) {
      if (!stats) return null;
      return { min: stats.min, max: stats.max, finiteRatio: stats.finiteRatio };
    }

    return {
      refresh,
      axis,
      amplitude,
      scale: amplitude,
      normalize,
      normalizeMode: mode,
      range: outputRange,
      outputRange,
      domain: inputDomain,
      inputDomain,
      clampRange,
      samples,
      normalizeVars,
      formulaVars: optionFormulaDefaults,
      params: optionFormulaDefaults,
      allowRandomInFormula: evalOptions.allowRandomInFormula,
      allowNoiseInFormula: evalOptions.allowNoiseInFormula,
      xIndex,
      zIndex,
      xWave,
      zWave,
      stats(axisName) {
        const key = normalizeName(axisName ?? '');
        if (key === 'x') return cloneStats(xStats);
        if (key === 'z') return cloneStats(zStats);
        return { x: cloneStats(xStats), z: cloneStats(zStats) };
      },
      sample(y, vars, formulaVars) {
        const runtimeVars = isObject(vars) ? vars : {};
        const runtimeFormulaVars = resolveFormulaVarsAlias({ formulaVars, params: formulaVars }, {});
        const out = {};
        if (axis === 'x' || axis === 'xz') {
          const mergedFormulaVars = mergeFormulaVars(xBaseFormulaVars, runtimeFormulaVars, runtimeVars);
          let val = evaluate(xFn, y, runtimeVars, seed, mergedFormulaVars, evalOptions);
          if (normalize) val = normalizeValue(val, xStats, outputRange, mode, clampRange);
          out.x = val * amplitude;
        }
        if (axis === 'z' || axis === 'xz') {
          const mergedFormulaVars = mergeFormulaVars(zBaseFormulaVars, runtimeFormulaVars, runtimeVars);
          let val = evaluate(zFn, y, runtimeVars, seed + 1, mergedFormulaVars, evalOptions);
          if (normalize) val = normalizeValue(val, zStats, outputRange, mode, clampRange);
          out.z = val * amplitude;
        }
        return out;
      }
    };
  }

  function getSimpleSampler(options) {
    const opts = options || {};
    const amplitude = resolveAmplitude(opts, 1);
    const outputRange = resolveOutputRange(opts, WAVE_DEFAULTS.outputRange);
    const inputDomain = resolveInputDomain(opts, WAVE_DEFAULTS.inputDomain);
    const mode = normalizeMode(opts.normalizeMode ?? WAVE_DEFAULTS.normalizeMode, WAVE_DEFAULTS.normalizeMode);
    const clampRange = hasOwn(opts, 'clampRange')
      ? toRange(opts.clampRange, outputRange)
      : (WAVE_DEFAULTS.clampRange ? toRange(WAVE_DEFAULTS.clampRange, outputRange) : null);
    const formulaVars = resolveFormulaVarsAlias(opts, resolveFormulaVarsAlias(WAVE_DEFAULTS, {}));

    const key = [
      opts.refresh ?? 0,
      normalizeAxis(opts.axis, 'x'),
      amplitude,
      opts.normalize ?? WAVE_DEFAULTS.normalize,
      mode,
      pairToKey(outputRange),
      pairToKey(inputDomain),
      pairToKey(clampRange),
      opts.samples ?? WAVE_DEFAULTS.samples,
      varsToKey(opts.normalizeVars ?? WAVE_DEFAULTS.normalizeVars),
      varsToKey(formulaVars),
      opts.wave ?? '',
      opts.xWave ?? '',
      opts.zWave ?? '',
      (opts.allowRandomInFormula ?? WAVE_DEFAULTS.allowRandomInFormula) ? 1 : 0,
      (opts.allowNoiseInFormula ?? WAVE_DEFAULTS.allowNoiseInFormula) ? 1 : 0
    ].join('|');
    if (SIMPLE_CACHE.key !== key) {
      SIMPLE_CACHE.key = key;
      SIMPLE_CACHE.sampler = createSampler({
        ...opts,
        amplitude,
        outputRange,
        inputDomain,
        normalizeMode: mode,
        clampRange
      });
    }
    return SIMPLE_CACHE.sampler;
  }

  function resolveSamplingConfig(rawOptions, mode) {
    const opts = rawOptions || {};
    const legacySampleMode = mode === 'legacySample';
    const axisDefault = legacySampleMode ? 'xz' : WAVE_DEFAULTS.axis;
    const amplitudeDefault = legacySampleMode ? 1 : WAVE_DEFAULTS.amplitude;
    const refreshDefault = legacySampleMode ? 0 : WAVE_DEFAULTS.refresh;
    const normalizeDefault = legacySampleMode ? false : WAVE_DEFAULTS.normalize;
    const outputRangeDefault = legacySampleMode ? [-1, 1] : WAVE_DEFAULTS.outputRange;
    const inputDomainDefault = legacySampleMode ? [-100, 100] : WAVE_DEFAULTS.inputDomain;
    const samplesDefault = legacySampleMode ? 512 : WAVE_DEFAULTS.samples;
    const normalizeVarsDefault = legacySampleMode ? null : WAVE_DEFAULTS.normalizeVars;
    const varsDefault = legacySampleMode ? null : WAVE_DEFAULTS.vars;
    const selectDefault = legacySampleMode ? null : WAVE_DEFAULTS.select;
    const secondsDefault = legacySampleMode ? 0 : WAVE_DEFAULTS.seconds;
    const stepDefault = legacySampleMode ? null : WAVE_DEFAULTS.step;
    const orderDefault = legacySampleMode ? null : WAVE_DEFAULTS.order;
    const orderSeedDefault = legacySampleMode ? null : WAVE_DEFAULTS.orderSeed;
    const noRepeatDefault = legacySampleMode ? false : WAVE_DEFAULTS.noRepeat;
    const normalizeModeDefault = legacySampleMode ? 'minmax' : WAVE_DEFAULTS.normalizeMode;
    const clampRangeDefault = legacySampleMode ? null : WAVE_DEFAULTS.clampRange;
    const allowRandomDefault = legacySampleMode ? true : WAVE_DEFAULTS.allowRandomInFormula;
    const allowNoiseDefault = legacySampleMode ? true : WAVE_DEFAULTS.allowNoiseInFormula;
    const formulaVarsDefault = legacySampleMode ? {} : resolveFormulaVarsAlias(WAVE_DEFAULTS, {});

    const axis = normalizeAxis(hasOwn(opts, 'axis') ? opts.axis : axisDefault, axisDefault);
    const amplitude = resolveAmplitude(opts, amplitudeDefault);
    const refresh = toNumber(hasOwn(opts, 'refresh') ? opts.refresh : refreshDefault, refreshDefault);
    const normalize = hasOwn(opts, 'normalize') ? Boolean(opts.normalize) : Boolean(normalizeDefault);
    const outputRange = resolveOutputRange(opts, outputRangeDefault);
    const inputDomain = resolveInputDomain(opts, inputDomainDefault);
    const samples = Math.max(2, Math.floor(toNumber(hasOwn(opts, 'samples') ? opts.samples : samplesDefault, samplesDefault)));
    const normalizeVars = hasOwn(opts, 'normalizeVars') ? opts.normalizeVars : normalizeVarsDefault;
    const vars = hasOwn(opts, 'vars') ? opts.vars : varsDefault;
    const select = hasOwn(opts, 'select') ? opts.select : selectDefault;
    const seconds = hasOwn(opts, 'seconds') ? opts.seconds : secondsDefault;
    const step = normalizeStep(hasOwn(opts, 'step') ? opts.step : stepDefault, seconds);
    const order = hasOwn(opts, 'order') ? opts.order : orderDefault;
    const orderSeed = hasOwn(opts, 'orderSeed') ? opts.orderSeed : orderSeedDefault;
    const noRepeat = hasOwn(opts, 'noRepeat') ? Boolean(opts.noRepeat) : Boolean(noRepeatDefault);
    const modeName = normalizeMode(hasOwn(opts, 'normalizeMode') ? opts.normalizeMode : normalizeModeDefault, normalizeModeDefault);
    const clampRange = hasOwn(opts, 'clampRange')
      ? toRange(opts.clampRange, outputRange)
      : (clampRangeDefault ? toRange(clampRangeDefault, outputRange) : null);
    const formulaVars = resolveFormulaVarsAlias(opts, formulaVarsDefault);
    const allowRandomInFormula = hasOwn(opts, 'allowRandomInFormula')
      ? Boolean(opts.allowRandomInFormula)
      : Boolean(allowRandomDefault);
    const allowNoiseInFormula = hasOwn(opts, 'allowNoiseInFormula')
      ? Boolean(opts.allowNoiseInFormula)
      : Boolean(allowNoiseDefault);

    return {
      axis,
      amplitude,
      refresh,
      normalize,
      outputRange,
      inputDomain,
      samples,
      normalizeVars,
      vars,
      select,
      step,
      order,
      orderSeed,
      noRepeat,
      normalizeMode: modeName,
      clampRange,
      formulaVars,
      allowRandomInFormula,
      allowNoiseInFormula
    };
  }

  function sampleInternal(y, rawOptions, mode) {
    const opts = rawOptions || {};
    const config = resolveSamplingConfig(opts, mode);
    const tick = getStepTick(config.step);
    const hasExplicitWaveRef = hasOwn(opts, 'wave') || hasOwn(opts, 'xWave') || hasOwn(opts, 'zWave');
    const selectRef = resolveWaveRef(config.select);
    const orderMode = resolveOrderMode(config.order, !!selectRef);
    const hasExplicitOrder = hasOwn(opts, 'order');

    const samplerOptions = {
      axis: config.axis,
      amplitude: config.amplitude,
      normalize: config.normalize,
      outputRange: config.outputRange,
      inputDomain: config.inputDomain,
      samples: config.samples,
      normalizeVars: config.normalizeVars,
      normalizeMode: config.normalizeMode,
      clampRange: config.clampRange,
      formulaVars: config.formulaVars,
      allowRandomInFormula: config.allowRandomInFormula,
      allowNoiseInFormula: config.allowNoiseInFormula
    };

    if (hasOwn(opts, 'wave')) samplerOptions.wave = opts.wave;
    if (hasOwn(opts, 'xWave')) samplerOptions.xWave = opts.xWave;
    if (hasOwn(opts, 'zWave')) samplerOptions.zWave = opts.zWave;

    if (!hasExplicitWaveRef) {
      if (orderMode) {
        const orderedIndex = resolveOrderedIndex({
          select: config.select,
          order: orderMode,
          orderSeed: config.orderSeed ?? config.refresh,
          refresh: config.refresh,
          tick,
          noRepeat: config.noRepeat
        });

        if (orderedIndex !== null) {
          samplerOptions.wave = orderedIndex;
          const keepLegacySelectRefreshBehavior = mode === 'wave' && !hasExplicitOrder && !!selectRef;
          if (!keepLegacySelectRefreshBehavior && hasOwn(opts, 'refresh')) samplerOptions.refresh = config.refresh;
        } else {
          samplerOptions.refresh = config.refresh + tick;
        }
      } else {
        samplerOptions.refresh = config.refresh + tick;
      }
    } else if (hasOwn(opts, 'refresh')) {
      samplerOptions.refresh = config.refresh;
    }

    const sampler = getSimpleSampler(samplerOptions);
    return sampler.sample(y, config.vars, config.formulaVars);
  }

  function sample(y, optionsOrRefresh, axisOrOptions) {
    if (typeof optionsOrRefresh === 'number' || axisOrOptions !== undefined) {
      const refresh = typeof optionsOrRefresh === 'number' ? optionsOrRefresh : 0;
      const opts = typeof axisOrOptions === 'string' ? { axis: axisOrOptions } : (axisOrOptions || {});
      return sampleInternal(y, { ...opts, refresh }, 'legacySample');
    }
    if (typeof optionsOrRefresh === 'string') {
      return sampleInternal(y, { axis: optionsOrRefresh }, 'sample');
    }
    return sampleInternal(y, optionsOrRefresh || {}, 'sample');
  }

  function defaultsSnapshot() {
    return {
      ...WAVE_DEFAULTS,
      scale: WAVE_DEFAULTS.amplitude,
      range: WAVE_DEFAULTS.outputRange.slice(),
      outputRange: WAVE_DEFAULTS.outputRange.slice(),
      domain: WAVE_DEFAULTS.inputDomain.slice(),
      inputDomain: WAVE_DEFAULTS.inputDomain.slice(),
      formulaVars: { ...resolveFormulaVarsAlias(WAVE_DEFAULTS, {}) },
      params: { ...resolveFormulaVarsAlias(WAVE_DEFAULTS, {}) },
      step: WAVE_DEFAULTS.step ? { ...WAVE_DEFAULTS.step } : null
    };
  }

  function setWaveParams(options) {
    const opts = options || {};

    if (hasOwn(opts, 'axis')) WAVE_DEFAULTS.axis = normalizeAxis(opts.axis, WAVE_DEFAULTS.axis);
    if (hasOwn(opts, 'amplitude') || hasOwn(opts, 'scale')) {
      WAVE_DEFAULTS.amplitude = resolveAmplitude(opts, WAVE_DEFAULTS.amplitude);
    }
    if (hasOwn(opts, 'refresh')) WAVE_DEFAULTS.refresh = toNumber(opts.refresh, WAVE_DEFAULTS.refresh);
    if (hasOwn(opts, 'select')) WAVE_DEFAULTS.select = opts.select;
    if (hasOwn(opts, 'vars')) WAVE_DEFAULTS.vars = opts.vars;
    if (hasOwn(opts, 'normalize')) WAVE_DEFAULTS.normalize = Boolean(opts.normalize);
    if (hasOwn(opts, 'samples')) WAVE_DEFAULTS.samples = Math.max(2, Math.floor(toNumber(opts.samples, WAVE_DEFAULTS.samples)));
    if (hasOwn(opts, 'normalizeVars')) WAVE_DEFAULTS.normalizeVars = opts.normalizeVars;

    if (hasOwn(opts, 'outputRange') || hasOwn(opts, 'range')) {
      const outputRange = resolveOutputRange(opts, WAVE_DEFAULTS.outputRange);
      WAVE_DEFAULTS.outputRange = outputRange;
      WAVE_DEFAULTS.range = outputRange.slice();
    }

    if (hasOwn(opts, 'inputDomain') || hasOwn(opts, 'domain')) {
      const inputDomain = resolveInputDomain(opts, WAVE_DEFAULTS.inputDomain);
      WAVE_DEFAULTS.inputDomain = inputDomain;
      WAVE_DEFAULTS.domain = inputDomain.slice();
    }

    if (hasOwn(opts, 'formulaVars') || hasOwn(opts, 'params')) {
      const formulaVars = resolveFormulaVarsAlias(opts, {});
      WAVE_DEFAULTS.formulaVars = formulaVars;
      WAVE_DEFAULTS.params = formulaVars;
    }

    if (hasOwn(opts, 'normalizeMode')) WAVE_DEFAULTS.normalizeMode = normalizeMode(opts.normalizeMode, WAVE_DEFAULTS.normalizeMode);
    if (hasOwn(opts, 'clampRange')) WAVE_DEFAULTS.clampRange = opts.clampRange ? toRange(opts.clampRange, WAVE_DEFAULTS.outputRange) : null;

    if (hasOwn(opts, 'seconds') || hasOwn(opts, 'step')) {
      const seconds = hasOwn(opts, 'seconds') ? toNumber(opts.seconds, 0) : WAVE_DEFAULTS.seconds;
      WAVE_DEFAULTS.seconds = seconds;
      WAVE_DEFAULTS.step = normalizeStep(hasOwn(opts, 'step') ? opts.step : WAVE_DEFAULTS.step, seconds);
    }

    if (hasOwn(opts, 'order')) WAVE_DEFAULTS.order = opts.order;
    if (hasOwn(opts, 'orderSeed')) WAVE_DEFAULTS.orderSeed = opts.orderSeed;
    if (hasOwn(opts, 'noRepeat')) WAVE_DEFAULTS.noRepeat = Boolean(opts.noRepeat);
    if (hasOwn(opts, 'allowRandomInFormula')) WAVE_DEFAULTS.allowRandomInFormula = Boolean(opts.allowRandomInFormula);
    if (hasOwn(opts, 'allowNoiseInFormula')) WAVE_DEFAULTS.allowNoiseInFormula = Boolean(opts.allowNoiseInFormula);

    return defaultsSnapshot();
  }

  function wave(y, select, seconds, axisOrOptions) {
    const opts = typeof axisOrOptions === 'string' ? { axis: axisOrOptions } : (axisOrOptions || {});
    if (select !== undefined) opts.select = select;
    if (seconds !== undefined) opts.seconds = seconds;
    const out = sampleInternal(y, opts, 'wave');
    const axis = normalizeAxis(hasOwn(opts, 'axis') ? opts.axis : WAVE_DEFAULTS.axis, WAVE_DEFAULTS.axis);
    if (axis === 'x') return out.x;
    if (axis === 'z') return out.z;
    return out;
  }

  function stats(waveRef, options) {
    const opts = options || {};
    const resolved = resolveWaveRef(waveRef ?? opts.wave ?? opts.select);
    if (!resolved) return null;
    const inputDomain = resolveInputDomain(opts, WAVE_DEFAULTS.inputDomain);
    const samples = Math.max(2, Math.floor(toNumber(opts.samples ?? WAVE_DEFAULTS.samples, WAVE_DEFAULTS.samples)));
    const normalizeVars = opts.normalizeVars ?? WAVE_DEFAULTS.normalizeVars;
    const refresh = toNumber(opts.refresh ?? WAVE_DEFAULTS.refresh, 0);
    const evalOptions = buildEvalOptions(opts, WAVE_DEFAULTS);
    evalOptions.coerceNonFinite = true;

    const waveDefaults = resolveFormulaVarsAlias(resolved.wave, {});
    const globalDefaults = resolveFormulaVarsAlias(WAVE_DEFAULTS, {});
    const optionDefaults = resolveFormulaVarsAlias(opts, globalDefaults);
    const formulaVars = mergeFormulaVars(waveDefaults, optionDefaults, isObject(normalizeVars) ? normalizeVars : {});

    const fn = compile(resolved.wave.algo);
    const computed = getWaveStats(
      resolved.index,
      fn,
      seedFrom(refresh),
      inputDomain,
      samples,
      normalizeVars,
      formulaVars,
      evalOptions
    );

    return {
      index: resolved.index,
      wave: resolved.wave,
      inputDomain: inputDomain.slice(),
      domain: inputDomain.slice(),
      samples,
      min: computed.min,
      max: computed.max,
      finiteRatio: computed.finiteRatio
    };
  }

  function computeFiniteStats(values) {
    if (!values.length) return { min: 0, max: 0, mean: 0, std: 0 };
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (v < min) min = v;
      if (v > max) max = v;
      sum += v;
    }
    const mean = sum / values.length;
    let varSum = 0;
    for (let i = 0; i < values.length; i++) {
      const d = values[i] - mean;
      varSum += d * d;
    }
    return {
      min,
      max,
      mean,
      std: Math.sqrt(Math.max(0, varSum / values.length))
    };
  }

  function suggestOutputRange(min, max) {
    const absMax = Math.max(Math.abs(min), Math.abs(max));
    if (!Number.isFinite(absMax) || absMax === 0) return [-1, 1];
    if (absMax <= 0.25) return [-0.25, 0.25];
    if (absMax <= 0.5) return [-0.5, 0.5];
    if (absMax <= 1) return [-1, 1];
    return [-absMax, absMax];
  }

  function resolveAnalyzeIndices(opts) {
    const out = [];

    function addResolved(ref) {
      const resolved = resolveWaveRef(ref);
      if (!resolved) return;
      if (!out.includes(resolved.index)) out.push(resolved.index);
    }

    if (Array.isArray(opts.indices)) {
      for (const index of opts.indices) addResolved(index);
      return out;
    }
    if (Array.isArray(opts.select)) {
      for (const item of opts.select) addResolved(item);
      return out;
    }
    if (Array.isArray(opts.wave)) {
      for (const item of opts.wave) addResolved(item);
      return out;
    }
    if (hasOwn(opts, 'select')) {
      addResolved(opts.select);
      return out;
    }
    if (hasOwn(opts, 'wave')) {
      addResolved(opts.wave);
      return out;
    }

    for (let i = 0; i < WAVES.length; i++) out.push(i);
    return out;
  }

  function analyze(options) {
    const opts = options || {};
    const inputDomain = resolveInputDomain(opts, WAVE_DEFAULTS.inputDomain);
    const samples = Math.max(2, Math.floor(toNumber(opts.samples ?? WAVE_DEFAULTS.samples, WAVE_DEFAULTS.samples)));
    const vars = opts.vars ?? WAVE_DEFAULTS.vars;
    const refresh = toNumber(opts.refresh ?? WAVE_DEFAULTS.refresh, 0);
    const indices = resolveAnalyzeIndices(opts);
    const evalOptions = buildEvalOptions(opts, WAVE_DEFAULTS);
    evalOptions.coerceNonFinite = false;

    const globalDefaults = resolveFormulaVarsAlias(WAVE_DEFAULTS, {});
    const optionDefaults = resolveFormulaVarsAlias(opts, globalDefaults);
    const seed = seedFrom(refresh);
    const d0 = toNumber(inputDomain[0], -100);
    const d1 = toNumber(inputDomain[1], 100);
    const span = d1 - d0;
    const items = [];

    for (const index of indices) {
      const entry = WAVES[index];
      if (!entry) continue;
      const fn = compile(entry.algo);
      const waveDefaults = resolveFormulaVarsAlias(entry, {});
      const formulaVars = mergeFormulaVars(waveDefaults, optionDefaults, isObject(vars) ? vars : {});

      const finiteValues = [];
      const absDeltas = [];
      let finite = 0;
      let prevFinite = null;
      for (let i = 0; i < samples; i++) {
        const t = samples === 1 ? 0 : i / (samples - 1);
        const x = d0 + span * t;
        const value = evaluate(fn, x, vars, seed, formulaVars, evalOptions);
        if (Number.isFinite(value)) {
          finite++;
          finiteValues.push(value);
          if (prevFinite !== null) absDeltas.push(Math.abs(value - prevFinite));
          prevFinite = value;
        } else {
          prevFinite = null;
        }
      }

      const summary = computeFiniteStats(finiteValues);
      const deltaStats = computeFiniteStats(absDeltas);
      const spikeThreshold = deltaStats.mean + deltaStats.std * 3;
      const spikes = absDeltas.filter((d) => d > spikeThreshold && d > 0).length;
      const spikeRatio = absDeltas.length ? spikes / absDeltas.length : 0;
      const spread = Math.abs(summary.max - summary.min);
      const flatThreshold = Math.max(1e-6, spread * 0.001);
      const flatCount = absDeltas.filter((d) => d <= flatThreshold).length;
      const zeroFlatRatio = absDeltas.length ? flatCount / absDeltas.length : 1;
      const discontinuityScore = absDeltas.length
        ? absDeltas.reduce((sum, v) => sum + v, 0) / absDeltas.length
        : 0;
      const finiteRatio = finite / samples;
      const absMax = Math.max(Math.abs(summary.min), Math.abs(summary.max));
      const suggestedRange = suggestOutputRange(summary.min, summary.max);
      const suggestedAmplitude = absMax > 0 ? Number((1 / absMax).toFixed(6)) : 1;

      const tags = [];
      const algo = normalizeName(entry.algo);
      if (algo.includes('tan(')) tags.push('tan-risk');
      if (algo.includes('log(')) tags.push('log-risk');
      if (algo.includes('random(')) tags.push('random-in-formula');
      if (algo.includes('noise(')) tags.push('noise');
      if (finiteRatio < 0.98) tags.push('non-finite');
      if (zeroFlatRatio > 0.9 || summary.std < 1e-4) tags.push('flat');
      if (spikeRatio > 0.12 || discontinuityScore > 1) tags.push('spiky');

      items.push({
        index,
        wave: entry.wave,
        shape: entry.shape,
        algo: entry.algo,
        min: summary.min,
        max: summary.max,
        mean: summary.mean,
        std: summary.std,
        finiteRatio,
        spikeRatio,
        zeroFlatRatio,
        discontinuityScore,
        suggestedOutputRange: suggestedRange,
        suggestedAmplitude,
        tags
      });
    }

    return {
      inputDomain: inputDomain.slice(),
      domain: inputDomain.slice(),
      samples,
      count: items.length,
      items
    };
  }

  function flagOutliers(report, rules) {
    const source = Array.isArray(report?.items) ? report.items : [];
    const cfg = {
      finiteRatioMin: 0.98,
      maxAbsThreshold: 5,
      discontinuityThreshold: 1,
      tinyStdThreshold: 1e-4,
      spikeRatioThreshold: 0.12,
      ...(rules || {})
    };

    const items = [];
    for (const entry of source) {
      const reasons = [];
      if (entry.finiteRatio < cfg.finiteRatioMin) reasons.push('finiteRatio');
      if (Math.max(Math.abs(entry.min), Math.abs(entry.max)) > cfg.maxAbsThreshold) reasons.push('maxAbs');
      if (entry.discontinuityScore > cfg.discontinuityThreshold) reasons.push('discontinuity');
      if (entry.std < cfg.tinyStdThreshold) reasons.push('flatStd');
      if (entry.spikeRatio > cfg.spikeRatioThreshold) reasons.push('spikeRatio');
      if (reasons.length) items.push({ ...entry, reasons });
    }

    return { rules: cfg, items };
  }

  const DEFAULT_MIGRATION_RULES = [
    { pattern: "sin(x*.1)*.4", replace: "sin(x*v.freq)*v.amp" },
    { pattern: "(x*.025)%1 < .5 ? -.5 : .5", replace: "(x*v.freq)%1 < v.duty ? -v.amp : v.amp" }
  ];

  function normalizeMigrationRules(mapping) {
    if (!mapping) return DEFAULT_MIGRATION_RULES.slice();
    if (Array.isArray(mapping)) {
      return mapping
        .map((item) => {
          if (!item) return null;
          if (item.pattern !== undefined && item.replace !== undefined) return item;
          if (item.from !== undefined && item.to !== undefined) return { pattern: item.from, replace: item.to };
          return null;
        })
        .filter(Boolean);
    }
    if (isObject(mapping)) {
      return Object.keys(mapping).map((from) => ({ pattern: from, replace: mapping[from] }));
    }
    return DEFAULT_MIGRATION_RULES.slice();
  }

  function migrateAlgo(algoString, mapping) {
    let out = String(algoString ?? '');
    const rules = normalizeMigrationRules(mapping);
    for (const rule of rules) {
      if (!rule) continue;
      if (rule.pattern instanceof RegExp) {
        out = out.replace(rule.pattern, String(rule.replace ?? ''));
        continue;
      }
      const pattern = String(rule.pattern ?? '');
      if (!pattern) continue;
      out = out.split(pattern).join(String(rule.replace ?? ''));
    }
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
    stats,
    analyze,
    flagOutliers,
    migrateAlgo,
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
