// Wave Lab — p5.waves v2
// Interactive explorer for Waves.wave() and Waves.createGrid().

const controls     = {};
const valueTargets = {};

let t = 0;
let currentFps     = 60;
let gridSampler    = null;
let gridSamplerKey = '';
let codeOutputEl   = null;
let copyButtonResetTimer = 0;
let autoFormulaLastAtMs = Date.now();
let autoSurpriseLastAtMs = Date.now();
let prevAutoFormula = false;
let prevAutoSurprise = false;
let prevAutoFormulaSeconds = 0;
let prevAutoSurpriseSeconds = 0;

const ids = [
  'preview-mode', 'wave', 'seed',
  'amplitude', 'frequency', 'phase', 'mode', 'unpredictability',
  'range-enable', 'range-min', 'range-max',
  'wave-row', 'wave-col', 'threshold',
  'time-speed', 'frame-rate', 'step', 'show-points', 'connect-line', 'show-grid',
  'random-formula', 'auto-formula', 'auto-formula-seconds',
  'surprise', 'auto-surprise', 'auto-surprise-seconds',
  'copy-code'
];

const valueIds = [
  'seed-value',
  'amplitude-value', 'frequency-value', 'phase-value', 'unpredictability-value',
  'range-min-value', 'range-max-value',
  'threshold-value', 'time-speed-value', 'step-value',
  'auto-formula-seconds-value', 'auto-surprise-seconds-value'
];

function fmt(num, digits) {
  return Number(num).toFixed(digits);
}

// ─── p5 setup / resize ───────────────────────────────────────────────────────

function setup() {
  for (let i = 0; i < ids.length; i++) {
    controls[ids[i]] = document.getElementById(ids[i]);
  }
  for (let i = 0; i < valueIds.length; i++) {
    valueTargets[valueIds[i]] = document.getElementById(valueIds[i]);
  }
  codeOutputEl = document.getElementById('code-output');

  populateWaveSelects();
  bindControls();
  updateUiState();

  const wrap = document.getElementById('canvas-wrap');
  const h = Math.max(360, Math.min(window.innerHeight - 130, 760));
  const c = createCanvas(wrap.clientWidth, h);
  c.parent('canvas-wrap');

  strokeWeight(2);
  noFill();
}

function windowResized() {
  const wrap = document.getElementById('canvas-wrap');
  resizeCanvas(wrap.clientWidth, Math.max(360, Math.min(window.innerHeight - 130, 760)));
}

// ─── Populate selects ─────────────────────────────────────────────────────────

function populateWaveSelects() {
  const waveList = Waves.list();

  // Main wave dropdown
  const waveEl = controls.wave;
  waveEl.innerHTML = '';
  for (let i = 0; i < waveList.length; i++) {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = i + ' \u2014 ' + waveList[i].name;
    waveEl.appendChild(opt);
  }
  waveEl.value = '0';

  // Grid wave-row / wave-col dropdowns
  const rowEl = controls['wave-row'];
  const colEl = controls['wave-col'];
  rowEl.innerHTML = '';
  colEl.innerHTML = '';

  const autoOpt = function () {
    const o = document.createElement('option');
    o.value = '';
    o.textContent = '(seed-determined)';
    return o;
  };
  rowEl.appendChild(autoOpt());
  colEl.appendChild(autoOpt());

  for (let i = 0; i < waveList.length; i++) {
    const makeOpt = function () {
      const o = document.createElement('option');
      o.value = String(i);
      o.textContent = i + ' \u2014 ' + waveList[i].name;
      return o;
    };
    rowEl.appendChild(makeOpt());
    colEl.appendChild(makeOpt());
  }
}

// ─── Control binding ─────────────────────────────────────────────────────────

function bindControls() {
  const allInputs = document.querySelectorAll('input, select');
  for (let i = 0; i < allInputs.length; i++) {
    allInputs[i].addEventListener('input', updateUiState);
    allInputs[i].addEventListener('change', updateUiState);
  }
  controls.surprise.addEventListener('click', randomizeControls);
  controls['random-formula'].addEventListener('click', randomizeWaveOnly);
  controls['copy-code'].addEventListener('click', copyCodeSnippet);
}

// ─── State reading ────────────────────────────────────────────────────────────

function enforceRanges() {
  let rMin = Number(controls['range-min'].value);
  let rMax = Number(controls['range-max'].value);
  if (rMin >= rMax) {
    if (rMin >= 1.95) rMin = 1.9;
    rMax = rMin + 0.05;
    controls['range-min'].value = String(rMin);
    controls['range-max'].value = String(rMax);
  }
}

function readState() {
  const waveIndex      = Number(controls.wave.value) || 0;
  const seed           = Number(controls.seed.value) || 0;
  const amplitude      = Number(controls.amplitude.value);
  const frequency      = Number(controls.frequency.value);
  const phase          = Number(controls.phase.value);
  const mode           = controls.mode.value;
  const unpredictability = Number(controls.unpredictability.value);
  const rangeEnable    = controls['range-enable'].checked;
  const range          = rangeEnable
    ? [Number(controls['range-min'].value), Number(controls['range-max'].value)]
    : null;

  const waveRowVal = controls['wave-row'].value;
  const waveColVal = controls['wave-col'].value;

  return {
    previewMode:     controls['preview-mode'].value,
    waveIndex,
    seed,
    amplitude,
    frequency,
    phase,
    mode,
    unpredictability,
    rangeEnable,
    range,
    grid: {
      waveRow:   waveRowVal !== '' ? Number(waveRowVal) : undefined,
      waveCol:   waveColVal !== '' ? Number(waveColVal) : undefined,
      threshold: Number(controls.threshold.value)
    },
    step:        Number(controls.step.value),
    fps:         Number(controls['frame-rate'].value),
    speed:       Number(controls['time-speed'].value),
    autoFormula: controls['auto-formula'].checked,
    autoFormulaSeconds: Number(controls['auto-formula-seconds'].value),
    autoSurprise: controls['auto-surprise'].checked,
    autoSurpriseSeconds: Number(controls['auto-surprise-seconds'].value),
    showPoints:  controls['show-points'].checked,
    connectLine: controls['connect-line'].checked,
    showGrid:    controls['show-grid'].checked
  };
}

// ─── UI updates ──────────────────────────────────────────────────────────────

function setControlDisabled(id, disabled) {
  const el = controls[id];
  if (!el) return;
  el.disabled = !!disabled;
  const label = el.closest('label');
  if (label) label.classList.toggle('disabled-control', !!disabled);
}

function updateValueDisplays() {
  valueTargets['seed-value'].textContent          = controls.seed.value;
  valueTargets['amplitude-value'].textContent     = controls.amplitude.value;
  valueTargets['frequency-value'].textContent     = fmt(controls.frequency.value, 2);
  valueTargets['phase-value'].textContent         = fmt(controls.phase.value, 2);
  valueTargets['unpredictability-value'].textContent = fmt(controls.unpredictability.value, 2);
  valueTargets['range-min-value'].textContent     = fmt(controls['range-min'].value, 2);
  valueTargets['range-max-value'].textContent     = fmt(controls['range-max'].value, 2);
  valueTargets['threshold-value'].textContent     = fmt(controls.threshold.value, 2);
  valueTargets['time-speed-value'].textContent    = fmt(controls['time-speed'].value, 3);
  valueTargets['step-value'].textContent          = controls.step.value;
  valueTargets['auto-formula-seconds-value'].textContent = fmt(controls['auto-formula-seconds'].value, 1);
  valueTargets['auto-surprise-seconds-value'].textContent = fmt(controls['auto-surprise-seconds'].value, 1);
}

function syncAutoTimers(state) {
  const now = Date.now();

  if (!state.autoFormula) {
    autoFormulaLastAtMs = now;
  } else if (!prevAutoFormula || state.autoFormulaSeconds !== prevAutoFormulaSeconds) {
    autoFormulaLastAtMs = now;
  }

  if (!state.autoSurprise) {
    autoSurpriseLastAtMs = now;
  } else if (!prevAutoSurprise || state.autoSurpriseSeconds !== prevAutoSurpriseSeconds) {
    autoSurpriseLastAtMs = now;
  }

  prevAutoFormula = state.autoFormula;
  prevAutoFormulaSeconds = state.autoFormulaSeconds;
  prevAutoSurprise = state.autoSurprise;
  prevAutoSurpriseSeconds = state.autoSurpriseSeconds;
}

function updateBadges(state) {
  const waveName = Waves.data[state.waveIndex] ? Waves.data[state.waveIndex].name : '?';
  document.getElementById('active-wave').textContent =
    'wave: ' + state.waveIndex + ' \u2014 ' + waveName;
  document.getElementById('active-settings').textContent =
    'seed: ' + state.seed +
    ' | freq: ' + state.frequency.toFixed(2) +
    ' | phase: ' + state.phase.toFixed(2);
  document.getElementById('active-normalize').textContent = state.rangeEnable
    ? 'range: [' + state.range[0].toFixed(2) + ', ' + state.range[1].toFixed(2) + ']'
    : 'amplitude: ' + state.amplitude;
  document.getElementById('active-behavior').textContent =
    'mode: ' + state.mode + ' (' + state.unpredictability.toFixed(2) + ')';
}

function updateUiState() {
  enforceRanges();
  setControlDisabled('unpredictability', controls.mode.value !== 'wild');
  const rangeOn = controls['range-enable'].checked;
  setControlDisabled('amplitude', rangeOn);
  setControlDisabled('range-min', !rangeOn);
  setControlDisabled('range-max', !rangeOn);
  setControlDisabled('auto-formula-seconds', !controls['auto-formula'].checked);
  setControlDisabled('auto-surprise-seconds', !controls['auto-surprise'].checked);
  updateValueDisplays();
  const state = readState();
  syncAutoTimers(state);
  updateBadges(state);
  updateCodeSnippet(state);
}

// ─── Drawing ─────────────────────────────────────────────────────────────────

function drawGridLines() {
  stroke(0);
  strokeWeight(1);
  for (let y = 0; y <= height; y += 40) line(0, y, width, y);
  for (let x = 0; x <= width; x += 80) line(x, 0, x, height);
}

function buildWaveOpts(state) {
  const opts = {
    wave:            state.waveIndex,
    t:               t,
    frequency:       state.frequency,
    phase:           state.phase,
    mode:            state.mode,
    unpredictability: state.unpredictability
  };
  if (state.rangeEnable && state.range) {
    opts.range = state.range;
  } else {
    opts.amplitude = state.amplitude;
  }
  return opts;
}

function drawWave(state) {
  const cx         = width * 0.5;
  const step       = Math.max(1, state.step);
  const opts       = buildWaveOpts(state);
  const drawPoints = state.showPoints || !state.connectLine;

  if (state.connectLine) {
    stroke(0);
    strokeWeight(2.1);
    noFill();
    beginShape();
  } else {
    noStroke();
    fill(0);
  }

  for (let y = 0; y <= height; y += step) {
    const x = cx + Waves.wave(y, opts);
    if (state.connectLine) vertex(x, y);
    if (drawPoints) {
      noStroke();
      fill(0);
      circle(x, y, 4);
      if (state.connectLine) { noFill(); stroke(0); }
    }
  }

  if (state.connectLine) endShape();
}

function getGridSampler(state) {
  const g   = state.grid;
  const key = [
    g.waveRow !== undefined ? g.waveRow : 'a',
    g.waveCol !== undefined ? g.waveCol : 'a',
    state.seed,
    g.threshold
  ].join('|');

  if (gridSamplerKey !== key) {
    gridSamplerKey = key;
    const opts = { seed: state.seed, threshold: g.threshold };
    if (g.waveRow !== undefined) opts.waveRow = g.waveRow;
    if (g.waveCol !== undefined) opts.waveCol = g.waveCol;
    gridSampler = Waves.createGrid(14, 14, opts);
  }

  return gridSampler;
}

function drawGrid14(state) {
  const gs    = getGridSampler(state);
  const cells = gs.sample(t * 8);
  const cols  = gs.cols;
  const rows  = gs.rows;
  const cell  = Math.min(width / cols, height / rows);
  const gridW = cell * cols;
  const gridH = cell * rows;
  const ox    = (width - gridW) * 0.5;
  const oy    = (height - gridH) * 0.5;

  noStroke();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const on  = cells[idx] === 1;
      fill(on ? 0 : 255);
      rect(ox + c * cell, oy + r * cell, cell, cell);
      if (state.showPoints) {
        fill(on ? 255 : 0);
        circle(ox + c * cell + cell * 0.5, oy + r * cell + cell * 0.5,
          on ? cell * 0.36 : cell * 0.14);
      }
    }
  }

  if (state.showGrid) {
    stroke(0);
    strokeWeight(1);
    noFill();
    for (let gx = 0; gx <= cols; gx++) {
      line(ox + gx * cell, oy, ox + gx * cell, oy + gridH);
    }
    for (let gy = 0; gy <= rows; gy++) {
      line(ox, oy + gy * cell, ox + gridW, oy + gy * cell);
    }
  }
}

// ─── Code snippet generation ─────────────────────────────────────────────────

function codeNum(value, digits) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0';
  if (Number.isInteger(n)) return String(n);
  return String(Number(n.toFixed(digits || 4)));
}

function buildLineSnippet(state) {
  const waveName = Waves.data[state.waveIndex] ? Waves.data[state.waveIndex].name : '?';
  const rangeStr = state.rangeEnable
    ? ',\n      range: [' + codeNum(state.range[0], 2) + ', ' + codeNum(state.range[1], 2) + ']'
    : ',\n      amplitude: ' + codeNum(state.amplitude, 0);
  return (
    '// p5.waves v2 \u2014 line\n' +
    'let t = 0;\n\n' +
    'function setup() {\n' +
    '  createCanvas(800, 520);\n' +
    '  noFill();\n' +
    '}\n\n' +
    'function draw() {\n' +
    '  background(245);\n' +
    '  beginShape();\n' +
    '  stroke(0);\n' +
    '  for (let y = 0; y <= height; y += ' + Math.max(1, state.step) + ') {\n' +
    '    const x = width * 0.5 + Waves.wave(y, {\n' +
    '      wave:             \'' + waveName + '\',\n' +
    '      t:                t,\n' +
    '      frequency:        ' + codeNum(state.frequency, 4) + ',\n' +
    '      phase:            ' + codeNum(state.phase, 4) + ',\n' +
    '      mode:             \'' + state.mode + '\',\n' +
    '      unpredictability: ' + codeNum(state.unpredictability, 4) +
    rangeStr + '\n' +
    '    });\n' +
    '    vertex(x, y);\n' +
    '  }\n' +
    '  endShape();\n' +
    '  t += ' + codeNum(state.speed, 4) + ';\n' +
    '}'
  );
}

function buildGridSnippet(state) {
  const g       = state.grid;
  const rowName = g.waveRow !== undefined && Waves.data[g.waveRow]
    ? Waves.data[g.waveRow].name : null;
  const colName = g.waveCol !== undefined && Waves.data[g.waveCol]
    ? Waves.data[g.waveCol].name : null;
  const rowLine = rowName ? "  waveRow:   '" + rowName + "',\n" : '';
  const colLine = colName ? "  waveCol:   '" + colName + "',\n" : '';
  return (
    '// p5.waves v2 \u2014 grid\n' +
    'let g, t = 0;\n\n' +
    'function setup() {\n' +
    '  createCanvas(560, 560);\n' +
    '  g = Waves.createGrid(14, 14, {\n' +
    rowLine +
    colLine +
    '  seed:      ' + codeNum(state.seed, 0) + ',\n' +
    '  threshold: ' + codeNum(g.threshold, 4) + '\n' +
    '  });\n' +
    '}\n\n' +
    'function draw() {\n' +
    '  background(245);\n' +
    '  const cells = g.sample(t * 8);\n' +
    '  const cell  = min(width / g.cols, height / g.rows);\n' +
    '  const ox    = (width  - g.cols * cell) * 0.5;\n' +
    '  const oy    = (height - g.rows * cell) * 0.5;\n' +
    '  noStroke();\n' +
    '  for (let r = 0; r < g.rows; r++) {\n' +
    '    for (let c = 0; c < g.cols; c++) {\n' +
    '      fill(cells[r * g.cols + c] === 1 ? 0 : 255);\n' +
    '      rect(ox + c * cell, oy + r * cell, cell, cell);\n' +
    '    }\n' +
    '  }\n' +
    '  t += ' + codeNum(state.speed, 4) + ';\n' +
    '}'
  );
}

function updateCodeSnippet(state) {
  if (!codeOutputEl) return;
  codeOutputEl.value = state.previewMode === 'grid'
    ? buildGridSnippet(state)
    : buildLineSnippet(state);
}

// ─── Copy snippet ─────────────────────────────────────────────────────────────

function fallbackCopyText(text) {
  const ghost = document.createElement('textarea');
  ghost.value = text;
  ghost.setAttribute('readonly', 'readonly');
  ghost.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
  document.body.appendChild(ghost);
  ghost.select();
  document.execCommand('copy');
  document.body.removeChild(ghost);
}

function setCopyButtonText(label) {
  if (controls['copy-code']) controls['copy-code'].textContent = label;
}

async function copyCodeSnippet() {
  if (!codeOutputEl) return;
  const snippet = codeOutputEl.value || '';
  if (!snippet) return;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(snippet);
    } else {
      fallbackCopyText(snippet);
    }
    setCopyButtonText('Copied');
  } catch (_) {
    setCopyButtonText('Copy Failed');
  }
  if (copyButtonResetTimer) window.clearTimeout(copyButtonResetTimer);
  copyButtonResetTimer = window.setTimeout(function () { setCopyButtonText('Copy Snippet'); }, 1400);
}

// ─── Randomise ────────────────────────────────────────────────────────────────

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomizeControls() {
  controls['preview-mode'].value        = randomFrom(['line', 'grid']);
  controls.wave.value                   = String(Math.floor(Math.random() * Waves.count));
  controls.seed.value                   = String(Math.floor(Math.random() * 121));
  controls.amplitude.value              = String(Math.floor(30 + Math.random() * 180));
  controls.frequency.value              = fmt(0.2 + Math.random() * 2.2, 2);
  controls.phase.value                  = fmt(-2 + Math.random() * 4, 2);
  controls.mode.value                   = Math.random() > 0.5 ? 'wild' : 'stable';
  controls.unpredictability.value       = fmt(Math.random(), 2);
  controls['range-enable'].checked      = Math.random() > 0.3;
  controls['range-min'].value           = fmt(-1 - Math.random() * 0.5, 2);
  controls['range-max'].value           = fmt(0.5 + Math.random() * 1.0, 2);

  const n = Waves.count;
  controls['wave-row'].value = Math.random() > 0.3
    ? String(Math.floor(Math.random() * n)) : '';
  controls['wave-col'].value = Math.random() > 0.3
    ? String(Math.floor(Math.random() * n)) : '';
  controls.threshold.value              = fmt(-0.35 + Math.random() * 0.7, 2);

  controls['time-speed'].value          = fmt(0.005 + Math.random() * 0.045, 3);
  controls.step.value                   = String(Math.floor(4 + Math.random() * 10));
  controls['connect-line'].checked      = Math.random() > 0.25;
  controls['show-points'].checked       = Math.random() > 0.25;
  if (!controls['connect-line'].checked) controls['show-points'].checked = true;
  controls['show-grid'].checked         = Math.random() > 0.2;

  updateUiState();
}

function randomizeWaveOnly() {
  const count = Waves.count || 0;
  if (count <= 1) return;

  const current = Number(controls.wave.value) || 0;
  let next = current;
  while (next === current) {
    next = Math.floor(Math.random() * count);
  }
  controls.wave.value = String(next);
  updateUiState();
}

function processAutoRandom(state, nowMs) {
  let changed = false;

  if (state.autoFormula && nowMs - autoFormulaLastAtMs >= state.autoFormulaSeconds * 1000) {
    randomizeWaveOnly();
    autoFormulaLastAtMs = nowMs;
    changed = true;
  }

  if (state.autoSurprise && nowMs - autoSurpriseLastAtMs >= state.autoSurpriseSeconds * 1000) {
    randomizeControls();
    autoSurpriseLastAtMs = nowMs;
    changed = true;
  }

  return changed ? readState() : state;
}

// ─── Main draw loop ───────────────────────────────────────────────────────────

function draw() {
  let state = readState();
  state = processAutoRandom(state, Date.now());
  if (state.fps !== currentFps) {
    currentFps = state.fps;
    frameRate(currentFps);
  }
  updateBadges(state);
  background(245);

  if (state.previewMode === 'grid') {
    drawGrid14(state);
  } else {
    if (state.showGrid) drawGridLines();
    drawWave(state);
  }

  t += state.speed;
}
