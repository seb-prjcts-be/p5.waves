// Snapshot test for p5.waves formulas.
//
// Samples each of the 34 wave functions at fixed positions and
// compares the result to a stored baseline. Detects regressions
// caused by formula edits, normalisation changes, or accidental
// behaviour shifts in shared helpers.
//
// Vanilla Node, no dependencies. Approved per CLAUDE.md §10.5.
//
// Usage:
//   node tests/snapshot.js              compare to baseline
//   node tests/snapshot.js --update     overwrite baseline
//                                       (after intentional changes)

'use strict';

const fs = require('fs');
const path = require('path');

// Shim a fake window so the IIFE attaches Waves to it.
global.window = global;

const libPath = path.join(__dirname, '..', 'p5.waves.js');
const src = fs.readFileSync(libPath, 'utf8');
new Function(src)();

const Waves = global.Waves;
if (!Waves) {
  console.error('Failed to load Waves from', libPath);
  process.exit(2);
}

// Sample parameters - keep stable once a baseline exists.
const N = 64;
const X_MIN = 0;
const X_MAX = 200;
const PRECISION = 6;

function sampleFormula(name) {
  const out = new Array(N);
  for (let i = 0; i < N; i++) {
    const x = X_MIN + (X_MAX - X_MIN) * (i / (N - 1));
    const v = Waves.wave(x, { wave: name, amplitude: 1 });
    out[i] = Number(v.toFixed(PRECISION));
  }
  return out;
}

const list = Waves.list();
const result = {};
for (let i = 0; i < list.length; i++) {
  result[list[i].name] = sampleFormula(list[i].name);
}

// ─── algo ↔ fn drift check ─────────────────────────────────────────────
// The library ships precompiled fns (CSP-safe, no eval at runtime); the
// `algo` string is display-only metadata. Here in Node we MAY eval, so
// compile each algo string the old way and verify it matches the shipped
// fn exactly. Waves using random()/noise() are skipped (their primitives
// are internal to the library); the snapshot baseline above pins those.

const driftIssues = [];
{
  const radians = function (deg) { return deg * (Math.PI / 180); };
  const sq = function (n) { return n * n; };
  const ARG_NAMES = [
    'x', 't', 'random', 'noise',
    'sin', 'cos', 'tan', 'abs', 'ceil', 'round', 'floor', 'min', 'max',
    'log', 'sq', 'radians', 'PI'
  ];
  const helpers = [
    Math.sin, Math.cos, Math.tan, Math.abs, Math.ceil, Math.round,
    Math.floor, Math.min, Math.max, Math.log, sq, radians, Math.PI
  ];
  for (let i = 0; i < Waves.data.length; i++) {
    const w = Waves.data[i];
    if (typeof w.fn !== 'function') {
      driftIssues.push(w.name + ': missing fn');
      continue;
    }
    if (/\b(random|noise)\(/.test(w.algo)) continue;
    const compiled = new Function(...ARG_NAMES, 'return (' + w.algo + ');');
    for (let s = 0; s < 48; s++) {
      const x = -120 + s * 5.1;
      const a = w.fn(x, 0);
      const b = compiled(x, 0, null, null, ...helpers);
      const same = (Number.isNaN(a) && Number.isNaN(b)) || a === b;
      if (!same) {
        driftIssues.push(w.name + ': fn/algo mismatch at x=' + x + ' (' + a + ' vs ' + b + ')');
        break;
      }
    }
  }
}

const baselinePath = path.join(__dirname, 'snapshot.json');
const updateMode = process.argv.indexOf('--update') !== -1;

if (updateMode) {
  fs.writeFileSync(baselinePath, JSON.stringify(result, null, 2) + '\n');
  console.log('Baseline written:', list.length, 'formulas at', baselinePath);
  process.exit(0);
}

if (!fs.existsSync(baselinePath)) {
  console.error('No baseline at', baselinePath);
  console.error('Run with --update to create one.');
  process.exit(2);
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));

const issues = [];
let pass = 0;
const resultKeys = Object.keys(result);
const baselineKeys = Object.keys(baseline);

for (let i = 0; i < resultKeys.length; i++) {
  const name = resultKeys[i];
  if (!baseline[name]) {
    issues.push({ kind: 'NEW', name: name });
    continue;
  }
  if (JSON.stringify(result[name]) === JSON.stringify(baseline[name])) {
    pass++;
  } else {
    let diffAt = -1;
    for (let j = 0; j < N; j++) {
      if (result[name][j] !== baseline[name][j]) {
        diffAt = j;
        break;
      }
    }
    issues.push({
      kind: 'DIFF',
      name: name,
      at: diffAt,
      was: baseline[name][diffAt],
      now: result[name][diffAt]
    });
  }
}

for (let i = 0; i < baselineKeys.length; i++) {
  const name = baselineKeys[i];
  if (!result[name]) {
    issues.push({ kind: 'GONE', name: name });
  }
}

console.log('p5.waves snapshot');
console.log('  baseline:', baselinePath);
console.log('  formulas:', list.length);
console.log('  samples per formula:', N);
console.log('  passed:', pass);
console.log('  issues:', issues.length);
console.log('  algo/fn drift issues:', driftIssues.length);
console.log('');

if (issues.length === 0 && driftIssues.length === 0) {
  console.log('OK');
  process.exit(0);
}

for (let i = 0; i < driftIssues.length; i++) {
  console.log('  DRIFT ' + driftIssues[i]);
}

for (let i = 0; i < issues.length; i++) {
  const it = issues[i];
  if (it.kind === 'DIFF') {
    console.log('  DIFF  ' + it.name + '  (at index ' + it.at + ': ' + it.was + ' -> ' + it.now + ')');
  } else {
    console.log('  ' + it.kind + '   ' + it.name);
  }
}
console.log('');
console.log('Run with --update if these changes are intentional.');
process.exit(1);
