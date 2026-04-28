/*!
 * p5.waves
 * Wave sampling for p5.js. Always returns a number.
 * Version 3.2.6
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
    { name: 'zig-zag sine',      algo: 'sin(x*.2)*.4 % .12' },
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

  // ─── Character classification ────────────────────────────────────────────────
  // Parallel to WAVES. 'harsh' = tan/random/noise-driven (breaks rhythm).
  // 'gentle' = everything else, including sharp-but-periodic (square, pulse).
  // See strategy.md §0 — group: 'harsh' picks BEFORE wave selection;
  // mode: 'wild' warps WITHIN one wave. They are orthogonal.
  const CHARACTER = [
    'gentle', 'gentle', 'gentle', 'gentle', 'gentle', 'gentle', 'gentle', 'gentle',
    'gentle', 'gentle', 'gentle',
    'harsh',                                     // 11 steps down (tan)
    'gentle', 'gentle', 'gentle', 'gentle', 'gentle', 'gentle', 'gentle', 'gentle',
    'gentle', 'gentle', 'gentle',
    'harsh',                                     // 23 grow random (random)
    'harsh',                                     // 24 noise (noise)
    'harsh',                                     // 25 fuzzy pulse (tan hi freq)
    'harsh',                                     // 26 up down pulse (tan)
    'gentle',
    'harsh',                                     // 28 fuzzy peak sine (random)
    'gentle', 'gentle', 'gentle', 'gentle', 'gentle'
  ];

  if (CHARACTER.length !== WAVES.length) {
    throw new Error('p5.waves: CHARACTER length (' + CHARACTER.length +
      ') must match WAVES length (' + WAVES.length + ')');
  }

  const GENTLE_INDICES = [];
  const HARSH_INDICES  = [];
  for (let i = 0; i < CHARACTER.length; i++) {
    (CHARACTER[i] === 'harsh' ? HARSH_INDICES : GENTLE_INDICES).push(i);
  }

  // ─── Caches ──────────────────────────────────────────────────────────────────

  const COMPILE_CACHE = new Map();
  const STATS_CACHE   = new Map();

  // Runtime entropy for wave() shift - stable per page load, different each session
  const _waveShiftEntropy = Math.floor(Math.random() * 100000);

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

  const _seedCacheKeys = new Array(16);
  const _seedCacheVals = new Array(16);
  let _seedCachePtr = 0, _seedCacheFill = 0;

  function seedFrom(value) {
    // Check small ring-buffer cache first
    for (let i = 0; i < _seedCacheFill; i++) {
      if (_seedCacheKeys[i] === value) return _seedCacheVals[i];
    }
    // Compute FNV-1a
    const str = String(value == null ? 0 : value);
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h  = Math.imul(h, 16777619);
    }
    h = h >>> 0;
    // Store in ring buffer
    _seedCacheKeys[_seedCachePtr] = value;
    _seedCacheVals[_seedCachePtr] = h;
    _seedCachePtr = (_seedCachePtr + 1) & 15;
    if (_seedCacheFill < 16) _seedCacheFill++;
    return h;
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

  // ─── Group (pool filter) ─────────────────────────────────────────────────────
  // `group` narrows the pool BEFORE wave selection (orthogonal to `mode`).
  // Accepts: 'all' / null (full pool), 'gentle', 'harsh', or an array of
  // names/indices. Unresolvable entries are silently dropped; empty result
  // falls back to the full pool. See strategy.md §0.

  function resolveGroup(opt) {
    if (opt == null) return null;
    if (Array.isArray(opt)) {
      const pool = [];
      for (let i = 0; i < opt.length; i++) {
        const r = resolveWave(opt[i]);
        if (r >= 0) pool.push(r);
      }
      return pool.length > 0 ? pool : null;
    }
    if (typeof opt === 'string') {
      const k = normalizeName(opt);
      if (k === '' || k === 'all') return null;
      if (k === 'gentle') return GENTLE_INDICES;
      if (k === 'harsh')  return HARSH_INDICES;
      return null;
    }
    return null;
  }

  function pickWaveIndexIn(seedValue, pool) {
    if (!pool || pool.length === 0) return pickWaveIndex(seedValue);
    const rng = mulberry32(seedFrom(seedValue));
    return pool[Math.floor(rng() * pool.length)];
  }

  // Returns an index different from curIdx, staying within the pool when given.
  // Pool of length 1 is an unavoidable repeat.
  function nextDifferentInPool(curIdx, pool) {
    if (!pool || pool.length === 0) return (curIdx + 1) % WAVES.length;
    if (pool.length === 1) return pool[0];
    const i = pool.indexOf(curIdx);
    if (i < 0) return pool[0];
    return pool[(i + 1) % pool.length];
  }

  function findWaveByName(name) {
    const key  = normalizeName(name);
    const keyC = compact(key);
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
    let h = (n * 127.1 + 311.7) | 0;
    h = ((h << 13) ^ h) | 0;
    h = (Math.imul(h, Math.imul(h, h) * 15731 + 789221) + 1376312589) | 0;
    return ((h & 0x7fffffff) / 0x7fffffff);
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

  // Module-scope state for evaluate - avoids closure allocation on every call
  let _evalSeed = 0, _evalX = 0, _evalCalls = 0;

  function _evalRandom(min, max) {
    const r = rand01(_evalSeed, _evalX, _evalCalls++);
    if (min === undefined) return r;
    if (max === undefined) { max = min; min = 0; }
    if (max < min) { const tmp = max; max = min; min = tmp; }
    return min + r * (max - min);
  }

  function _evalNoise(n) { return noise1D(n, _evalSeed); }

  function evaluate(fn, x, t, seed) {
    _evalSeed = seed; _evalX = x; _evalCalls = 0;
    const out = fn(
      x, toNumber(t, 0),
      _evalRandom, _evalNoise,
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
  const STATS_SAMPLES = 1024;

  function getStats(waveIndex, internalSeed) {
    const key = waveIndex + '|' + internalSeed;
    if (STATS_CACHE.has(key)) return STATS_CACHE.get(key);

    const fn  = compile(WAVES[waveIndex].algo);
    let mn = Infinity, mx = -Infinity;

    for (let i = 0; i < STATS_SAMPLES; i++) {
      const x = lerp(STATS_DOMAIN[0], STATS_DOMAIN[1], i / (STATS_SAMPLES - 1));
      const v = evaluate(fn, x, 0, internalSeed);
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }

    if (!Number.isFinite(mn) || !Number.isFinite(mx) || mn === mx) { mn = -1; mx = 1; }
    const stats = { min: mn, max: mx };
    STATS_CACHE.set(key, stats);
    // Evict oldest entry when cache exceeds limit
    if (STATS_CACHE.size > 256) {
      STATS_CACHE.delete(STATS_CACHE.keys().next().value);
    }
    return stats;
  }

  function mapToRange(value, stats, range) {
    if (stats.min === stats.max) return (range[0] + range[1]) * 0.5;
    const t = (value - stats.min) / (stats.max - stats.min);
    return range[0] + t * (range[1] - range[0]);
  }

  function normalizeVal(rawVal, stats) {
    if (stats.min === stats.max) return 0;
    const n = (rawVal - stats.min) / (stats.max - stats.min) * 2 - 1;
    return n < -1 ? -1 : n > 1 ? 1 : n;
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

  function wave(y, secondParam) {
    // ─── Fast path: wave(y)  - no params ──────────────────────
    if (secondParam == null) {
      const idx   = pickWaveIndex(0);
      const iSeed = seedFrom(0);
      const raw   = evaluate(compile(WAVES[idx].algo), toNumber(y, 0), 0, iSeed);
      return normalizeVal(raw, getStats(idx, iSeed)) * 100;
    }
    // ─── Fast path: wave(y, number)  - seed only ──────────────
    if (typeof secondParam === 'number') {
      const iSeed = seedFrom(secondParam);
      const idx   = pickWaveIndex(secondParam);
      const raw   = evaluate(compile(WAVES[idx].algo), toNumber(y, 0), 0, iSeed);
      return normalizeVal(raw, getStats(idx, iSeed)) * 100;
    }
    // ─── Fast path: wave(y, 'name')  - wave name only ─────────
    if (typeof secondParam === 'string') {
      const r     = resolveWave(secondParam);
      const idx   = r >= 0 ? r : pickWaveIndex(0);
      const iSeed = seedFrom(0);
      const raw   = evaluate(compile(WAVES[idx].algo), toNumber(y, 0), 0, iSeed);
      return normalizeVal(raw, getStats(idx, iSeed)) * 100;
    }

    // ─── Full path: wave(y, { ... }) ─────────────────────────
    let waveRef;
    if (secondParam.wave !== undefined) waveRef = secondParam.wave;
    const seed           = toNumber(secondParam.seed, 0);
    const t              = toNumber(secondParam.t, 0);
    const amplitude      = toNumber(secondParam.amplitude, 100);
    const frequency      = toNumber(secondParam.frequency, 1);
    const phase          = toNumber(secondParam.phase, 0);
    const mode           = normalizeName(secondParam.mode || 'stable') === 'wild' ? 'wild' : 'stable';
    const unpredictability = toUnit(secondParam.unpredictability, 0);
    let range = null;
    if (Array.isArray(secondParam.range) && secondParam.range.length >= 2) {
      range = [toNumber(secondParam.range[0], -1), toNumber(secondParam.range[1], 1)];
    }
    const shift         = !!secondParam.shift;
    const shiftInterval = Math.max(0, toNumber(secondParam.shiftInterval, 3));
    const shiftDuration = Math.max(1e-6, toNumber(secondParam.shiftDuration, 1));
    const groupPool     = resolveGroup(secondParam.group);

    const internalSeed = seedFrom(seed);

    // ─── Shift: auto-cycle through random waves ──────────────
    if (shift) {
      const cycleDur = shiftInterval + shiftDuration;
      const era      = Math.floor(t / cycleDur);
      const progress = t - era * cycleDur;
      // Runtime entropy - stateless wave() has no persistent state,
      // but the entropy is stable within a single page load via closure
      const waveShiftEntropy = _waveShiftEntropy;

      const userIdx = waveRef !== undefined ? resolveWave(waveRef) : -1;
      const idxA = (era === 0 && userIdx >= 0) ? userIdx : pickWaveIndexIn(seed + '.' + waveShiftEntropy + '.' + era, groupPool);
      const fnA  = compile(WAVES[idxA].algo);
      const valA = evalKernel(fnA, y, t, frequency, phase, internalSeed, mode, unpredictability);

      if (progress >= shiftInterval) {
        let idxB = (era === 1 && userIdx >= 0) ? pickWaveIndexIn(seed + '.' + waveShiftEntropy + '.1', groupPool) : pickWaveIndexIn(seed + '.' + waveShiftEntropy + '.' + (era + 1), groupPool);
        if (idxB === idxA) idxB = nextDifferentInPool(idxA, groupPool);
        const fnB  = compile(WAVES[idxB].algo);
        const valB = evalKernel(fnB, y, t, frequency, phase, internalSeed, mode, unpredictability);
        let m = clamp((progress - shiftInterval) / shiftDuration, 0, 1);
        m = m * m * (3 - 2 * m);
        if (range !== null) {
          const nA = mapToRange(valA, getStats(idxA, internalSeed), range);
          const nB = mapToRange(valB, getStats(idxB, internalSeed), range);
          return nA + (nB - nA) * m;
        }
        const nA = normalizeVal(valA, getStats(idxA, internalSeed));
        const nB = normalizeVal(valB, getStats(idxB, internalSeed));
        return (nA + (nB - nA) * m) * amplitude;
      }

      if (range !== null) return mapToRange(valA, getStats(idxA, internalSeed), range);
      return normalizeVal(valA, getStats(idxA, internalSeed)) * amplitude;
    }

    // ─── Morph: wave: ['nameA', 'nameB'], mix: 0-1 ───────────
    if (Array.isArray(waveRef)) {
      const mix  = toUnit(secondParam.mix, 0.5);
      const rA   = resolveWave(waveRef[0]);
      const rB   = waveRef.length > 1 ? resolveWave(waveRef[1]) : rA;
      const idxA = rA >= 0 ? rA : pickWaveIndexIn(seed, groupPool);
      const idxB = rB >= 0 ? rB : pickWaveIndexIn(seed, groupPool);
      const fnA  = compile(WAVES[idxA].algo);
      const fnB  = compile(WAVES[idxB].algo);
      const valA = evalKernel(fnA, y, t, frequency, phase, internalSeed, mode, unpredictability);
      const valB = evalKernel(fnB, y, t, frequency, phase, internalSeed, mode, unpredictability);
      if (range !== null) {
        const rA_ = mapToRange(valA, getStats(idxA, internalSeed), range);
        const rB_ = mapToRange(valB, getStats(idxB, internalSeed), range);
        return rA_ + (rB_ - rA_) * mix;
      }
      const nA = normalizeVal(valA, getStats(idxA, internalSeed));
      const nB = normalizeVal(valB, getStats(idxB, internalSeed));
      return (nA + (nB - nA) * mix) * amplitude;
    }

    let waveIndex;
    if (waveRef !== undefined) {
      const r = resolveWave(waveRef);
      waveIndex = r >= 0 ? r : pickWaveIndexIn(seed, groupPool);
    } else {
      waveIndex = pickWaveIndexIn(seed, groupPool);
    }

    const fn    = compile(WAVES[waveIndex].algo);
    const val   = evalKernel(fn, y, t, frequency, phase, internalSeed, mode, unpredictability);
    const stats = getStats(waveIndex, internalSeed);

    if (range !== null) return mapToRange(val, stats, range);
    return normalizeVal(val, stats) * amplitude;
  }

  // ─── createSampler() ─────────────────────────────────────────────────────────

  function createSampler(options) {
    const opts           = options || {};
    const seed           = toNumber(opts.seed, 0);
    const t0             = toNumber(opts.t, 0);
    const amplitude      = toNumber(opts.amplitude, 100);
    const frequency      = toNumber(opts.frequency, 1);
    const phase          = toNumber(opts.phase, 0);
    const mode           = normalizeName(opts.mode || 'stable') === 'wild' ? 'wild' : 'stable';
    const unpredictability = toUnit(opts.unpredictability, 0);

    let range = null;
    if (Array.isArray(opts.range) && opts.range.length >= 2) {
      range = [toNumber(opts.range[0], -1), toNumber(opts.range[1], 1)];
    }

    const internalSeed = seedFrom(seed);
    const isMorph      = Array.isArray(opts.wave) && opts.wave.length >= 2;
    const mixDefault   = isMorph ? toUnit(opts.mix, 0.5) : 0;
    const groupPool    = resolveGroup(opts.group);

    let waveIndexA;
    if (isMorph) {
      const rA = resolveWave(opts.wave[0]);
      waveIndexA = rA >= 0 ? rA : pickWaveIndexIn(seed, groupPool);
    } else if (opts.wave !== undefined) {
      const r = resolveWave(opts.wave);
      waveIndexA = r >= 0 ? r : pickWaveIndexIn(seed, groupPool);
    } else {
      waveIndexA = pickWaveIndexIn(seed, groupPool);
    }

    let waveIndexB = -1;
    if (isMorph) {
      const rB = resolveWave(opts.wave[1]);
      waveIndexB = rB >= 0 ? rB : pickWaveIndexIn(seed, groupPool);
    }

    const fn     = compile(WAVES[waveIndexA].algo);
    const fnB    = waveIndexB >= 0 ? compile(WAVES[waveIndexB].algo) : null;
    const statsA = getStats(waveIndexA, internalSeed);
    const statsB = waveIndexB >= 0 ? getStats(waveIndexB, internalSeed) : null;

    // ─── Shift mode ──────────────────────────────────────────
    if (opts.shift) {
      const shiftInt = Math.max(0, toNumber(opts.shiftInterval, 3));
      const shiftDur = Math.max(1e-6, toNumber(opts.shiftDuration, 1));
      const cycleDur = shiftInt + shiftDur;
      const hasUserWave = opts.wave !== undefined && !Array.isArray(opts.wave);
      // Runtime entropy so each session produces a different sequence
      const shiftEntropy = Math.floor(Math.random() * 100000);

      let cachedEra = -Infinity;
      let curIdx = waveIndexA, nxtIdx = -1;
      let curFn = fn, nxtFn = null;
      let curName = WAVES[waveIndexA].name, nxtName = '';
      let lastMix = 0;

      function pickForEra(era) {
        if (era === 0 && hasUserWave) return waveIndexA;
        return pickWaveIndexIn(seed + '.' + shiftEntropy + '.' + era, groupPool);
      }

      function ensureEra(era) {
        if (era === cachedEra) return;
        cachedEra = era;
        curIdx  = pickForEra(era);
        nxtIdx  = pickForEra(era + 1);
        if (nxtIdx === curIdx) nxtIdx = nextDifferentInPool(curIdx, groupPool);
        curFn   = compile(WAVES[curIdx].algo);
        nxtFn   = compile(WAVES[nxtIdx].algo);
        curName = WAVES[curIdx].name;
        nxtName = WAVES[nxtIdx].name;
      }

      return {
        get waveIndex()  { return curIdx; },
        get waveName()   { return curName; },
        get targetName() { return nxtName; },
        get mix()        { return lastMix; },
        get shifting()   { return lastMix > 0; },
        sample: function (y, t) {
          const tVal     = t !== undefined ? toNumber(t, 0) : t0;
          const era      = Math.floor(tVal / cycleDur);
          ensureEra(era);

          const progress = tVal - era * cycleDur;
          const valA     = evalKernel(curFn, y, tVal, frequency, phase, internalSeed, mode, unpredictability);

          if (progress >= shiftInt) {
            let m = clamp((progress - shiftInt) / shiftDur, 0, 1);
            m = m * m * (3 - 2 * m);
            lastMix = m;
            const valB = evalKernel(nxtFn, y, tVal, frequency, phase, internalSeed, mode, unpredictability);
            if (range !== null) {
              const nA = mapToRange(valA, getStats(curIdx, internalSeed), range);
              const nB = mapToRange(valB, getStats(nxtIdx, internalSeed), range);
              return nA + (nB - nA) * m;
            }
            const nA = normalizeVal(valA, getStats(curIdx, internalSeed));
            const nB = normalizeVal(valB, getStats(nxtIdx, internalSeed));
            return (nA + (nB - nA) * m) * amplitude;
          }

          lastMix = 0;
          if (range !== null) return mapToRange(valA, getStats(curIdx, internalSeed), range);
          return normalizeVal(valA, getStats(curIdx, internalSeed)) * amplitude;
        }
      };
    }

    return {
      waveIndex: isMorph ? [waveIndexA, waveIndexB] : waveIndexA,
      waveName:  isMorph
        ? WAVES[waveIndexA].name + ' -> ' + WAVES[waveIndexB].name
        : WAVES[waveIndexA].name,
      sample: function (y, t, mix) {
        const tVal = t !== undefined ? toNumber(t, 0) : t0;
        const val  = evalKernel(fn, y, tVal, frequency, phase, internalSeed, mode, unpredictability);
        if (fnB !== null) {
          const mixVal = mix !== undefined ? toUnit(mix, mixDefault) : mixDefault;
          const valB   = evalKernel(fnB, y, tVal, frequency, phase, internalSeed, mode, unpredictability);
          if (range !== null) {
            const rA = mapToRange(val, statsA, range);
            const rB = mapToRange(valB, statsB, range);
            return rA + (rB - rA) * mixVal;
          }
          const nA = normalizeVal(val, statsA);
          const nB = normalizeVal(valB, statsB);
          return (nA + (nB - nA) * mixVal) * amplitude;
        }
        if (range !== null) return mapToRange(val, statsA, range);
        return normalizeVal(val, statsA) * amplitude;
      }
    };
  }

  // ─── createGrid() ────────────────────────────────────────────────────────────

  const MAX_GRID_CELLS = 62500; // 250×250

  function createGrid(cols, rows, options) {
    const opts      = options || {};
    const c         = Math.max(1, Math.floor(toNumber(cols, 10)));
    const r         = Math.max(1, Math.floor(toNumber(rows, 10)));
    if (c * r > MAX_GRID_CELLS) {
      console.warn('p5.waves: createGrid(' + c + ', ' + r + ') = ' +
        (c * r) + ' cells exceeds recommended maximum of ' + MAX_GRID_CELLS +
        '. This may cause performance issues.');
    }
    const seed      = toNumber(opts.seed, 0);
    const speed     = toNumber(opts.speed, 1);
    const cellCount = c * r;
    const TWO_PI    = Math.PI * 2;
    const groupPool = resolveGroup(opts.group);

    // Pick two different waves from seed (optionally constrained to group)
    const seedHash = seedFrom(seed);
    const rng      = mulberry32(seedHash);
    const def0     = groupPool
      ? groupPool[Math.floor(rng() * groupPool.length)]
      : Math.floor(rng() * WAVES.length);
    let   def1     = groupPool
      ? groupPool[Math.floor(rng() * groupPool.length)]
      : Math.floor(rng() * WAVES.length);
    if (def1 === def0) def1 = nextDifferentInPool(def0, groupPool);

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

    // Pre-allocate output buffers - reused on every .sample() call
    const _gridBuf = hasThreshold ? new Uint8Array(cellCount) : new Float32Array(cellCount);

    return {
      cols: c,
      rows: r,
      sample: function (t) {
        const time = toNumber(t, 0);
        let idx = 0;

        if (hasThreshold) {
          for (let row = 0; row < r; row++) {
            const ri = (row / r) * TWO_PI + time * speed;
            for (let col = 0; col < c; col++) {
              const ci  = (col / c) * TWO_PI + time * speed;
              const val = evaluate(rowFn, ri, time, rowSeed) + evaluate(colFn, ci, time, colSeed);
              _gridBuf[idx++] = val > threshold ? 1 : 0;
            }
          }
          return _gridBuf;
        }

        for (let row = 0; row < r; row++) {
          const ri = (row / r) * TWO_PI + time * speed;
          for (let col = 0; col < c; col++) {
            const ci  = (col / c) * TWO_PI + time * speed;
            const val = evaluate(rowFn, ri, time, rowSeed) + evaluate(colFn, ci, time, colSeed);
            _gridBuf[idx++] = (range && stats) ? mapToRange(val, stats, range) : val;
          }
        }
        return _gridBuf;
      }
    };
  }

  // ─── Discovery ───────────────────────────────────────────────────────────────

  function list() {
    return WAVES.map(function (w, i) {
      return { index: i, name: w.name, algo: w.algo, character: CHARACTER[i] };
    });
  }

  // ─── Benchmark ───────────────────────────────────────────────────────────────

  function benchmark(config, iterations) {
    const n  = iterations || 10000;
    const t0 = performance.now();
    for (let i = 0; i < n; i++) {
      wave(i * 0.1, config);
    }
    const elapsed = performance.now() - t0;
    return {
      iterations: n,
      ms:         Math.round(elapsed * 100) / 100,
      callsPerMs: Math.round(n / elapsed)
    };
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  const Waves = {
    data:          WAVES,
    count:         WAVES.length,
    list:          list,
    wave:          wave,
    createSampler: createSampler,
    createGrid:    createGrid,
    benchmark:     benchmark
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
