// Wave Lab — p5.waves v2
// Interactive explorer for all library features.

var controls     = {};
var valueTargets = {};

var t = 0;
var currentFps     = 60;
var gridSampler    = null;
var gridSamplerKey = '';
var codeOutputEl   = null;
var copyBtnTimer   = 0;
var shiftSampler   = null;
var shiftSamplerKey = '';
var userEditedCode = false;

var ids = [
  'wave', 'seed',
  'amplitude', 'frequency', 'phase',
  'shift-enable', 'shift-interval', 'shift-duration',
  'mode', 'unpredictability',
  'range-enable', 'range-preset',
  'preview-mode', 'wave-row', 'wave-col', 'threshold',
  'time-speed', 'frame-rate', 'step', 'show-points', 'connect-line', 'show-grid',
  'surprise', 'copy-code', 'run-code', 'reset-code'
];

var valueIds = [
  'seed-value',
  'shift-interval-value', 'shift-duration-value',
  'amplitude-value', 'frequency-value', 'phase-value', 'unpredictability-value',
  'range-value',
  'threshold-value', 'time-speed-value', 'step-value'
];

function fmt(num, digits) {
  return Number(num).toFixed(digits);
}

var RANGE_PRESETS = {
  color:      { range: [0, 255],   label: 'Color [0, 255]' },
  opacity:    { range: [0, 1],     label: 'Opacity [0, 1]' },
  position:   { range: null,       label: 'Position [0, width]' },
  angle:      { range: [0, 360],   label: 'Angle [0, 360]' },
  centered:   { range: [-100, 100], label: 'Centered [-100, 100]' },
  normalized: { range: [-1, 1],    label: 'Normalized [-1, 1]' }
};

function resolveRangePreset(key) {
  var preset = RANGE_PRESETS[key];
  if (!preset) return [0, 255];
  if (key === 'position') return [0, width];
  return preset.range;
}

// ─── p5 setup / resize ───────────────────────────────────────────────────────

function setup() {
  for (var i = 0; i < ids.length; i++) {
    controls[ids[i]] = document.getElementById(ids[i]);
  }
  for (var i = 0; i < valueIds.length; i++) {
    valueTargets[valueIds[i]] = document.getElementById(valueIds[i]);
  }
  codeOutputEl = document.getElementById('code-output');

  populateWaveSelects();
  bindControls();
  updateUiState();

  var wrap = document.getElementById('canvas-wrap');
  var c = createCanvas(wrap.clientWidth, 100);
  c.parent('canvas-wrap');

  controls.amplitude.max = wrap.clientWidth;

  strokeWeight(2);
  noFill();

  // Resize after layout settles
  window.setTimeout(function () { fitCanvas(); }, 50);
}

function fitCanvas() {
  var wrap = document.getElementById('canvas-wrap');
  var w = wrap.clientWidth;
  var h = wrap.clientHeight;
  if (h < 50) h = wrap.getBoundingClientRect().height;
  if (h < 50) h = 400;
  resizeCanvas(w, h);
  controls.amplitude.max = w;
}

function windowResized() {
  fitCanvas();
}

// ─── Populate selects ─────────────────────────────────────────────────────────

function populateWaveSelects() {
  var waveList = Waves.list();

  // Build options for a select element
  function fillSelect(el, includeAuto) {
    el.innerHTML = '';
    if (includeAuto) {
      var autoOpt = document.createElement('option');
      autoOpt.value = '';
      autoOpt.textContent = '(seed-determined)';
      el.appendChild(autoOpt);
    }
    for (var i = 0; i < waveList.length; i++) {
      var opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = i + ' \u2014 ' + waveList[i].name;
      el.appendChild(opt);
    }
  }

  fillSelect(controls.wave, false);
  fillSelect(controls['wave-row'], true);
  fillSelect(controls['wave-col'], true);

  controls.wave.value = '0';
}

// ─── Control binding ─────────────────────────────────────────────────────────

function bindControls() {
  var allInputs = document.querySelectorAll('input, select');
  for (var i = 0; i < allInputs.length; i++) {
    allInputs[i].addEventListener('input', onControlChange);
    allInputs[i].addEventListener('change', onControlChange);
  }
  controls.surprise.addEventListener('click', randomizeControls);
  controls['copy-code'].addEventListener('click', copyCodeSnippet);
  controls['run-code'].addEventListener('click', runUserCode);
  controls['reset-code'].addEventListener('click', resetCode);

  // Track manual edits in the code textarea
  codeOutputEl.addEventListener('input', function () {
    userEditedCode = true;
    codeOutputEl.classList.add('user-edited');
  });
}

function onControlChange() {
  // Any slider/dropdown change resets the user-edited state
  userEditedCode = false;
  codeOutputEl.classList.remove('user-edited');
  updateUiState();
}

// ─── State reading ────────────────────────────────────────────────────────────

function enforceRanges() {
  // Presets are always valid — no enforcement needed
}

function readState() {
  var waveIndex    = Number(controls.wave.value) || 0;
  var seed         = Number(controls.seed.value) || 0;
  var amplitude    = Number(controls.amplitude.value);
  var frequency    = Number(controls.frequency.value);
  var phase        = Number(controls.phase.value);
  var modeVal      = controls.mode.value;
  var unpredictability = Number(controls.unpredictability.value);
  var rangeEnable  = controls['range-enable'].checked;
  var rangePreset  = controls['range-preset'].value;
  var rangeVal     = rangeEnable ? resolveRangePreset(rangePreset) : null;

  var waveRowVal = controls['wave-row'].value;
  var waveColVal = controls['wave-col'].value;

  return {
    previewMode:     controls['preview-mode'].value,
    waveIndex:       waveIndex,
    seed:            seed,
    amplitude:       amplitude,
    frequency:       frequency,
    phase:           phase,
    mode:            modeVal,
    unpredictability: unpredictability,
    rangeEnable:     rangeEnable,
    rangePreset:     rangePreset,
    range:           rangeVal,
    grid: {
      waveRow:   waveRowVal !== '' ? Number(waveRowVal) : undefined,
      waveCol:   waveColVal !== '' ? Number(waveColVal) : undefined,
      threshold: Number(controls.threshold.value)
    },
    pointStep:    Number(controls.step.value),
    fps:          Number(controls['frame-rate'].value),
    speed:        Number(controls['time-speed'].value),
    showPoints:   controls['show-points'].checked,
    connectLine:  controls['connect-line'].checked,
    showGrid:     controls['show-grid'].checked,
    shiftEnable:    controls['shift-enable'].checked,
    shiftInterval:  Number(controls['shift-interval'].value),
    shiftDuration:  Number(controls['shift-duration'].value)
  };
}

// ─── UI updates ──────────────────────────────────────────────────────────────

function setControlDisabled(id, disabled) {
  var el = controls[id];
  if (!el) return;
  el.disabled = !!disabled;
  var labelEl = el.closest('label');
  if (labelEl) labelEl.classList.toggle('disabled-control', !!disabled);
}

function updateValueDisplays() {
  valueTargets['seed-value'].textContent            = controls.seed.value;
  valueTargets['shift-interval-value'].textContent   = controls['shift-interval'].value;
  valueTargets['shift-duration-value'].textContent   = controls['shift-duration'].value;
  valueTargets['amplitude-value'].textContent        = controls.amplitude.value;
  valueTargets['frequency-value'].textContent        = fmt(controls.frequency.value, 2);
  valueTargets['phase-value'].textContent            = fmt(controls.phase.value, 2);
  valueTargets['unpredictability-value'].textContent = fmt(controls.unpredictability.value, 2);
  var rng = resolveRangePreset(controls['range-preset'].value);
  valueTargets['range-value'].textContent             = '[' + rng[0] + ', ' + rng[1] + ']';
  valueTargets['threshold-value'].textContent        = fmt(controls.threshold.value, 2);
  valueTargets['time-speed-value'].textContent       = fmt(controls['time-speed'].value, 3);
  valueTargets['step-value'].textContent             = controls.step.value;
}

function updateBadges(state) {
  var waveLabel;
  if (state.shiftEnable) {
    waveLabel = 'shift: ' + (shiftSampler ? shiftSampler.waveName : 'auto');
  } else {
    var waveName = Waves.data[state.waveIndex] ? Waves.data[state.waveIndex].name : '?';
    waveLabel = 'wave: ' + state.waveIndex + ' \u2014 ' + waveName;
  }
  document.getElementById('active-wave').textContent = waveLabel;
  document.getElementById('active-settings').textContent =
    'seed: ' + state.seed +
    ' | freq: ' + state.frequency.toFixed(2) +
    ' | phase: ' + state.phase.toFixed(2);
  document.getElementById('active-normalize').textContent = state.rangeEnable
    ? 'range: [' + state.range[0] + ', ' + state.range[1] + '] (' + state.rangePreset + ')'
    : 'amplitude: ' + state.amplitude;
  document.getElementById('active-behavior').textContent =
    'mode: ' + state.mode + ' (' + state.unpredictability.toFixed(2) + ')';
}

function updateUiState() {
  enforceRanges();

  // Shift toggle
  var shiftOn = controls['shift-enable'].checked;
  setControlDisabled('wave', shiftOn);
  setControlDisabled('seed', shiftOn);
  setControlDisabled('shift-interval', !shiftOn);
  setControlDisabled('shift-duration', !shiftOn);

  // Wild mode
  setControlDisabled('unpredictability', controls.mode.value !== 'wild');

  // Range
  var rangeOn = controls['range-enable'].checked;
  setControlDisabled('range-preset', !rangeOn);

  // Grid sub-controls
  var isGrid = controls['preview-mode'].value === 'grid';
  var gridCtrl = document.getElementById('grid-controls');
  gridCtrl.style.display = isGrid ? '' : 'none';

  // Shift forces line mode
  if (shiftOn) {
    controls['preview-mode'].value = 'line';
    gridCtrl.style.display = 'none';
    setControlDisabled('preview-mode', true);
  } else {
    setControlDisabled('preview-mode', false);
    if (!shiftOn) {
      shiftSampler = null;
      shiftSamplerKey = '';
    }
  }

  updateValueDisplays();
  var state = readState();
  updateBadges(state);

  // Only update code if user hasn't manually edited
  if (!userEditedCode) {
    updateCodeSnippet(state);
  }
}

// ─── Drawing ─────────────────────────────────────────────────────────────────

function drawGridLines() {
  stroke(0);
  strokeWeight(1);
  for (var y = 0; y <= height; y += 40) line(0, y, width, y);
  for (var x = 0; x <= width; x += 80) line(x, 0, x, height);
}

function buildWaveOpts(state) {
  var opts = {
    t:               t,
    frequency:       state.frequency,
    phase:           state.phase,
    mode:            state.mode,
    unpredictability: state.unpredictability
  };

  opts.wave = state.waveIndex;

  if (state.rangeEnable && state.range) {
    opts.range = state.range;
  } else {
    opts.amplitude = state.amplitude;
  }
  return opts;
}

function getShiftSampler(state) {
  var cacheKey = [
    state.shiftInterval, state.shiftDuration,
    state.amplitude, state.frequency, state.phase,
    state.mode, state.unpredictability,
    state.rangeEnable, state.range ? state.range.join(',') : ''
  ].join('|');
  if (cacheKey !== shiftSamplerKey) {
    shiftSamplerKey = cacheKey;
    var opts = {
      shift:           true,
      shiftInterval:   state.shiftInterval,
      shiftDuration:   state.shiftDuration,
      amplitude:       state.amplitude,
      frequency:       state.frequency,
      phase:           state.phase,
      mode:            state.mode,
      unpredictability: state.unpredictability
    };
    if (state.rangeEnable && state.range) {
      opts.range = state.range;
      delete opts.amplitude;
    }
    shiftSampler = Waves.createSampler(opts);
  }
  return shiftSampler;
}

function drawWave(state) {
  var LAYERS     = 8;
  var cx         = width * 0.5;
  var pointStep  = Math.max(1, state.pointStep);
  var drawPoints = state.showPoints || !state.connectLine;
  var useShift   = state.shiftEnable;

  var sampler;
  if (useShift) {
    sampler = getShiftSampler(state);
  }

  noFill();

  // Draw layers back to front — lightest first, darkest last
  for (var layer = LAYERS - 1; layer >= 0; layer--) {
    var norm     = layer / (LAYERS - 1);
    var phaseOff = layer * 0.3;
    var shade    = Math.round(200 - norm * 170);
    var alphaVal = Math.round(30 + norm * 225);

    if (state.connectLine) {
      stroke(shade, shade, shade, alphaVal);
      strokeWeight(1.8);
      beginShape();
    }

    for (var y = 0; y <= height; y += pointStep) {
      var sampleVal;
      if (useShift) {
        sampleVal = sampler.sample(y + phaseOff * 50, t + phaseOff * 0.15);
      } else {
        var opts = buildWaveOpts(state);
        opts.phase = (opts.phase || 0) + phaseOff;
        sampleVal = Waves.wave(y + phaseOff * 50, opts);
      }
      var x = cx + (state.rangeEnable && !useShift
        ? map(sampleVal, state.range[0], state.range[1], -state.amplitude, state.amplitude)
        : sampleVal);

      if (state.connectLine) vertex(x, y);

      // Points only on the front layer
      if (drawPoints && layer === 0) {
        noStroke();
        fill(0, 0, 0, 200);
        circle(x, y, 4);
        if (state.connectLine) {
          noFill();
          stroke(shade, shade, shade, alphaVal);
          strokeWeight(1.8);
        }
      }
    }

    if (state.connectLine) endShape();
  }

  // Shift labels
  if (useShift && sampler) {
    noStroke();
    fill(0);
    textFont('monospace');
    textSize(12);
    textAlign(CENTER, CENTER);
    text(sampler.waveName, cx, height - 36);
    if (sampler.shifting) {
      fill(0, 0, 0, map(sampler.mix, 0, 1, 0, 255));
      text(sampler.targetName, cx, height - 18);
    }
  }
}

function getGridSampler(state) {
  var g = state.grid;
  var gridCacheKey = [
    g.waveRow !== undefined ? g.waveRow : 'a',
    g.waveCol !== undefined ? g.waveCol : 'a',
    state.seed,
    g.threshold
  ].join('|');

  if (gridSamplerKey !== gridCacheKey) {
    gridSamplerKey = gridCacheKey;
    var opts = { seed: state.seed, threshold: g.threshold };
    if (g.waveRow !== undefined) opts.waveRow = g.waveRow;
    if (g.waveCol !== undefined) opts.waveCol = g.waveCol;
    gridSampler = Waves.createGrid(14, 14, opts);
  }

  return gridSampler;
}

function drawGrid14(state) {
  var gs    = getGridSampler(state);
  var cells = gs.sample(t * 8);
  var cols  = gs.cols;
  var rows  = gs.rows;
  var cell  = Math.min(width / cols, height / rows);
  var gridW = cell * cols;
  var gridH = cell * rows;
  var ox    = (width - gridW) * 0.5;
  var oy    = (height - gridH) * 0.5;

  noStroke();
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      fill(cells[r * cols + c] === 1 ? 0 : 245);
      rect(ox + c * cell, oy + r * cell, cell, cell);
    }
  }
}

// ─── Code snippet generation ─────────────────────────────────────────────────

function codeNum(value, digits) {
  var n = Number(value);
  if (!Number.isFinite(n)) return '0';
  if (Number.isInteger(n)) return String(n);
  return String(Number(n.toFixed(digits || 4)));
}

function buildLineSnippet(state) {
  var waveTail = state.rangeEnable
    ? ',\n      range: [' + codeNum(state.range[0], 2) + ', ' + codeNum(state.range[1], 2) + ']'
    : ',\n      amplitude: ' + codeNum(state.amplitude, 0);

  var waveName = Waves.data[state.waveIndex] ? Waves.data[state.waveIndex].name : '?';
  var waveParam = "      wave:             '" + waveName + "',\n";

  var waveCall =
    'Waves.wave(y, {\n' +
    waveParam +
    '      t:                t,\n' +
    '      frequency:        ' + codeNum(state.frequency, 4) + ',\n' +
    '      phase:            ' + codeNum(state.phase, 4) + ',\n' +
    '      mode:             \'' + state.mode + '\',\n' +
    '      unpredictability: ' + codeNum(state.unpredictability, 4) +
    waveTail + '\n' +
    '    })';

  var xLines = state.rangeEnable
    ? '    var sample = ' + waveCall + ';\n' +
      '    var x = map(sample, ' + codeNum(state.range[0], 2) + ', ' + codeNum(state.range[1], 2) +
      ', width * 0.5 - ' + codeNum(state.amplitude, 0) + ', width * 0.5 + ' + codeNum(state.amplitude, 0) + ');\n'
    : '    var x = width * 0.5 + ' + waveCall + ';\n';

  return (
    '// p5.waves v2 \u2014 line\n' +
    'var t = 0;\n\n' +
    'function setup() {\n' +
    '  createCanvas(800, 520);\n' +
    '  noFill();\n' +
    '}\n\n' +
    'function draw() {\n' +
    '  background(245);\n' +
    '  beginShape();\n' +
    '  stroke(0);\n' +
    '  for (var y = 0; y <= height; y += ' + Math.max(1, state.pointStep) + ') {\n' +
    xLines +
    '    vertex(x, y);\n' +
    '  }\n' +
    '  endShape();\n' +
    '  t += ' + codeNum(state.speed, 4) + ';\n' +
    '}'
  );
}

function buildGridSnippet(state) {
  var g       = state.grid;
  var rowName = g.waveRow !== undefined && Waves.data[g.waveRow]
    ? Waves.data[g.waveRow].name : null;
  var colName = g.waveCol !== undefined && Waves.data[g.waveCol]
    ? Waves.data[g.waveCol].name : null;
  var rowLine = rowName ? "  waveRow:   '" + rowName + "',\n" : '';
  var colLine = colName ? "  waveCol:   '" + colName + "',\n" : '';
  return (
    '// p5.waves v2 \u2014 grid\n' +
    'var g, t = 0;\n\n' +
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
    '  var cells = g.sample(t * 8);\n' +
    '  var cell  = min(width / g.cols, height / g.rows);\n' +
    '  var ox    = (width  - g.cols * cell) * 0.5;\n' +
    '  var oy    = (height - g.rows * cell) * 0.5;\n' +
    '  noStroke();\n' +
    '  for (var r = 0; r < g.rows; r++) {\n' +
    '    for (var c = 0; c < g.cols; c++) {\n' +
    '      fill(cells[r * g.cols + c] === 1 ? 0 : 255);\n' +
    '      rect(ox + c * cell, oy + r * cell, cell, cell);\n' +
    '    }\n' +
    '  }\n' +
    '  t += ' + codeNum(state.speed, 4) + ';\n' +
    '}'
  );
}

function buildShiftSnippet(state) {
  var ampLine = state.rangeEnable
    ? '  range:          [' + codeNum(state.range[0], 2) + ', ' + codeNum(state.range[1], 2) + '],'
    : '  amplitude:      ' + codeNum(state.amplitude, 0) + ',';
  return (
    '// p5.waves v2 \u2014 shift\n' +
    'var sampler = Waves.createSampler({\n' +
    '  shift:          true,\n' +
    '  shiftInterval:  ' + codeNum(state.shiftInterval, 1) + ',\n' +
    '  shiftDuration:  ' + codeNum(state.shiftDuration, 1) + ',\n' +
    ampLine + '\n' +
    '  frequency:      ' + codeNum(state.frequency, 4) + ',\n' +
    '  phase:          ' + codeNum(state.phase, 4) + '\n' +
    '});\n\n' +
    'var t = 0;\n\n' +
    'function setup() {\n' +
    '  createCanvas(800, 520);\n' +
    '  noFill();\n' +
    '}\n\n' +
    'function draw() {\n' +
    '  background(245);\n' +
    '  t += ' + codeNum(state.speed, 4) + ';\n\n' +
    '  stroke(0);\n' +
    '  strokeWeight(2);\n' +
    '  beginShape();\n' +
    '  for (var y = 0; y <= height; y += ' + Math.max(1, state.pointStep) + ') {\n' +
    '    vertex(width / 2 + sampler.sample(y, t), y);\n' +
    '  }\n' +
    '  endShape();\n\n' +
    '  // Show current wave name\n' +
    '  noStroke();\n' +
    '  fill(0);\n' +
    '  textSize(12);\n' +
    '  text(sampler.waveName, width / 2, height - 20);\n' +
    '}'
  );
}

function updateCodeSnippet(state) {
  if (!codeOutputEl) return;
  if (state.shiftEnable) {
    codeOutputEl.value = buildShiftSnippet(state);
  } else if (state.previewMode === 'grid') {
    codeOutputEl.value = buildGridSnippet(state);
  } else {
    codeOutputEl.value = buildLineSnippet(state);
  }
}

// ─── Live code editor — Run / Reset / Copy ───────────────────────────────────

function runUserCode() {
  // Placeholder: in v1 we just reset the time to re-evaluate
  // Full eval would require sandboxed p5 instance — for now, reset time
  t = 0;
  shiftSampler = null;
  shiftSamplerKey = '';
  gridSampler = null;
  gridSamplerKey = '';

  setBtnFeedback('run-code', 'Running...', 'Run', 800);
}

function resetCode() {
  userEditedCode = false;
  codeOutputEl.classList.remove('user-edited');
  var state = readState();
  updateCodeSnippet(state);
  setBtnFeedback('reset-code', 'Reset!', 'Reset', 800);
}

function fallbackCopyText(txt) {
  var ghost = document.createElement('textarea');
  ghost.value = txt;
  ghost.setAttribute('readonly', 'readonly');
  ghost.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
  document.body.appendChild(ghost);
  ghost.select();
  document.execCommand('copy');
  document.body.removeChild(ghost);
}

async function copyCodeSnippet() {
  if (!codeOutputEl) return;
  var snippet = codeOutputEl.value || '';
  if (!snippet) return;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(snippet);
    } else {
      fallbackCopyText(snippet);
    }
    setBtnFeedback('copy-code', 'Copied', 'Copy', 1400);
  } catch (_) {
    setBtnFeedback('copy-code', 'Failed', 'Copy', 1400);
  }
}

function setBtnFeedback(id, tempLabel, originalLabel, ms) {
  var btn = controls[id];
  if (!btn) return;
  btn.textContent = tempLabel;
  window.setTimeout(function () { btn.textContent = originalLabel; }, ms);
}

// ─── Randomise ────────────────────────────────────────────────────────────────

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomizeControls() {
  var n = Waves.count;

  controls.wave.value = String(Math.floor(Math.random() * n));
  controls.seed.value = String(Math.floor(Math.random() * 501));
  controls.amplitude.value = String(Math.floor(30 + Math.random() * 90));
  controls.frequency.value = fmt(0.4 + Math.random() * 3, 2);
  controls.phase.value = fmt(-6 + Math.random() * 12, 2);
  controls.mode.value = Math.random() > 0.6 ? 'wild' : 'stable';
  controls.unpredictability.value = fmt(0.1 + Math.random() * 0.7, 2);
  controls['range-enable'].checked = false;

  // Shift: 50% chance
  var doShift = Math.random() > 0.5;
  controls['shift-enable'].checked = doShift;
  controls['shift-interval'].value = fmt(1 + Math.random() * 8, 1);
  controls['shift-duration'].value = fmt(0.3 + Math.random() * 3, 1);

  // Grid: only when not shifting
  if (!doShift) {
    controls['preview-mode'].value = Math.random() > 0.7 ? 'grid' : 'line';
  } else {
    controls['preview-mode'].value = 'line';
  }

  controls['wave-row'].value = Math.random() > 0.3
    ? String(Math.floor(Math.random() * n)) : '';
  controls['wave-col'].value = Math.random() > 0.3
    ? String(Math.floor(Math.random() * n)) : '';
  controls.threshold.value = fmt(-1 + Math.random() * 2, 2);

  controls['time-speed'].value = fmt(0.005 + Math.random() * 0.06, 3);
  controls.step.value = String(Math.floor(3 + Math.random() * 6));
  controls['connect-line'].checked = true;
  controls['show-points'].checked = false;
  controls['show-grid'].checked = false;

  userEditedCode = false;
  codeOutputEl.classList.remove('user-edited');
  updateUiState();
}

// ─── Main draw loop ───────────────────────────────────────────────────────────

function draw() {
  var state = readState();
  if (state.fps !== currentFps) {
    currentFps = state.fps;
    frameRate(currentFps);
  }
  background(245);

  if (state.previewMode === 'grid') {
    drawGrid14(state);
  } else {
    if (state.showGrid) drawGridLines();
    drawWave(state);
  }

  // Badges after draw so shift sampler exists
  updateBadges(state);

  t += state.speed;
}
