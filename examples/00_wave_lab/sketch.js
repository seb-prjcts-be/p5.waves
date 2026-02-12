const controls = {};
const valueTargets = {};
const waveDefs = [];
const waveNames = [];
let t = 0;
let matrixSampler = null;
let matrixSamplerKey = '';
let codeOutputEl = null;
let copyButtonResetTimer = 0;
const matrixBuffers = {
  cells: new Uint8Array(14 * 14),
  values: new Float32Array(14 * 14)
};

const ids = [
  'axis', 'select-mode', 'wave', 'x-wave', 'z-wave',
  'refresh', 'seconds', 'amplitude', 'frequency', 'phase', 'mode', 'unpredictability',
  'normalize', 'range-min', 'range-max',
  'mod-enable', 'mod-shape', 'mod-frequency', 'mod-phase', 'mod-phase-depth', 'mod-amp-depth',
  'preview-mode', 'time-speed', 'step', 'show-points', 'show-grid', 'surprise', 'copy-code'
];

const valueIds = [
  'refresh-value', 'seconds-value', 'amplitude-value', 'frequency-value', 'phase-value', 'unpredictability-value',
  'range-min-value', 'range-max-value',
  'mod-frequency-value', 'mod-phase-value', 'mod-phase-depth-value', 'mod-amp-depth-value',
  'time-speed-value', 'step-value'
];

const autoAdvanceLockIds = [
  'select-mode', 'x-wave', 'z-wave',
  'mod-enable', 'mod-shape', 'mod-frequency', 'mod-phase', 'mod-phase-depth', 'mod-amp-depth',
  'range-min', 'range-max',
  'show-points', 'show-grid',
  'surprise'
];

function fmt(num, digits) {
  return Number(num).toFixed(digits);
}

function setup() {
  for (let i = 0; i < ids.length; i++) controls[ids[i]] = document.getElementById(ids[i]);
  for (let i = 0; i < valueIds.length; i++) valueTargets[valueIds[i]] = document.getElementById(valueIds[i]);
  codeOutputEl = document.getElementById('code-output');

  const defs = Array.isArray(Waves.data) ? Waves.data : [];
  for (let i = 0; i < defs.length; i++) {
    const w = defs[i];
    waveDefs.push(w);
    waveNames.push(w.wave);
  }

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

function populateWaveSelects() {
  const selects = [controls.wave, controls['x-wave'], controls['z-wave']];
  for (let i = 0; i < selects.length; i++) {
    const select = selects[i];
    select.innerHTML = '';
    for (let j = 0; j < waveDefs.length; j++) {
      const def = waveDefs[j];
      const option = document.createElement('option');
      option.value = def.wave;
      option.textContent = `${def.wave} (${def.family || 'wave'})`;
      select.appendChild(option);
    }
  }

  controls.wave.value = 'classicSine';
  controls['x-wave'].value = 'classicSine';
  controls['z-wave'].value = waveNames.includes('tangentBloom') ? 'tangentBloom' : waveNames[0];
}

function bindControls() {
  const allInputs = document.querySelectorAll('input, select');
  for (let i = 0; i < allInputs.length; i++) {
    allInputs[i].addEventListener('input', updateUiState);
    allInputs[i].addEventListener('change', updateUiState);
  }
  controls.surprise.addEventListener('click', randomizeControls);
  controls['copy-code'].addEventListener('click', copyCodeSnippet);
}

function enforceRangeOrder() {
  let minV = Number(controls['range-min'].value);
  let maxV = Number(controls['range-max'].value);
  if (minV >= maxV) {
    if (minV >= 1.95) minV = 1.9;
    maxV = minV + 0.05;
    controls['range-min'].value = String(minV);
    controls['range-max'].value = String(maxV);
  }
}

function setControlDisabled(id, disabled) {
  const el = controls[id];
  if (!el) return;
  el.disabled = disabled;
  const label = el.closest('label');
  if (label) label.classList.toggle('disabled-control', disabled);
  if (el.tagName === 'BUTTON') el.classList.toggle('disabled-control', disabled);
}

function applyAutoAdvanceLock() {
  const autoAdvanceOn = Number(controls.seconds.value) > 0;

  if (autoAdvanceOn) {
    controls['select-mode'].value = 'single';
    controls['mod-enable'].checked = false;
  }

  for (let i = 0; i < autoAdvanceLockIds.length; i++) {
    setControlDisabled(autoAdvanceLockIds[i], autoAdvanceOn);
  }

  const note = document.getElementById('autoadvance-note');
  if (note) note.classList.toggle('hidden', !autoAdvanceOn);

  return autoAdvanceOn;
}

function updateUiState() {
  enforceRangeOrder();
  const autoAdvanceOn = applyAutoAdvanceLock();

  valueTargets['refresh-value'].textContent = controls.refresh.value;
  valueTargets['seconds-value'].textContent = `${fmt(controls.seconds.value, 2)}s`;
  valueTargets['amplitude-value'].textContent = controls.amplitude.value;
  valueTargets['frequency-value'].textContent = fmt(controls.frequency.value, 3);
  valueTargets['phase-value'].textContent = fmt(controls.phase.value, 2);
  valueTargets['unpredictability-value'].textContent = fmt(controls.unpredictability.value, 2);
  valueTargets['range-min-value'].textContent = fmt(controls['range-min'].value, 2);
  valueTargets['range-max-value'].textContent = fmt(controls['range-max'].value, 2);
  valueTargets['mod-frequency-value'].textContent = fmt(controls['mod-frequency'].value, 2);
  valueTargets['mod-phase-value'].textContent = fmt(controls['mod-phase'].value, 2);
  valueTargets['mod-phase-depth-value'].textContent = fmt(controls['mod-phase-depth'].value, 2);
  valueTargets['mod-amp-depth-value'].textContent = fmt(controls['mod-amp-depth'].value, 2);
  valueTargets['time-speed-value'].textContent = fmt(controls['time-speed'].value, 3);
  valueTargets['step-value'].textContent = controls.step.value;

  const splitMode = !autoAdvanceOn && controls['select-mode'].value === 'split';
  const axisIsXz = controls.axis.value === 'xz';
  const showSplit = splitMode && axisIsXz;
  document.getElementById('single-wave-row').classList.toggle('hidden', showSplit);
  document.getElementById('x-wave-row').classList.toggle('hidden', !showSplit);
  document.getElementById('z-wave-row').classList.toggle('hidden', !showSplit);

  const modOn = !autoAdvanceOn && controls['mod-enable'].checked;
  document.getElementById('mod-fields').classList.toggle('hidden', !modOn);

  const isWild = controls.mode.value === 'wild';
  setControlDisabled('unpredictability', !isWild);

  updateCodeSnippet(readOptions());
}

function readOptions() {
  const axis = controls.axis.value;
  const selectMode = controls['select-mode'].value;
  const previewMode = controls['preview-mode'].value;
  const range = [Number(controls['range-min'].value), Number(controls['range-max'].value)];
  const normalize = controls.normalize.checked;
  const amplitude = Number(controls.amplitude.value);
  const frequency = Number(controls.frequency.value);
  const phase = Number(controls.phase.value);
  const waveMode = controls.mode.value;
  const unpredictability = Number(controls.unpredictability.value);
  const refresh = Number(controls.refresh.value);
  const seconds = Number(controls.seconds.value);

  const opts = {
    axis,
    amplitude,
    frequency,
    phase,
    mode: waveMode,
    unpredictability,
    refresh,
    normalize,
    range
  };

  let select = controls.wave.value;

  if (selectMode === 'split' && axis === 'xz') {
    opts.xWave = controls['x-wave'].value;
    opts.zWave = controls['z-wave'].value;
    select = null;
  }

  if (controls['mod-enable'].checked) {
    opts.modulation = {
      shape: controls['mod-shape'].value,
      frequency: Number(controls['mod-frequency'].value),
      phase: Number(controls['mod-phase'].value),
      phaseDepth: Number(controls['mod-phase-depth'].value),
      amplitudeDepth: Number(controls['mod-amp-depth'].value)
    };
  }

  return {
    axis,
    select,
    opts,
    previewMode,
    seconds: seconds > 0 ? seconds : 0,
    step: Number(controls.step.value),
    speed: Number(controls['time-speed'].value),
    showPoints: controls['show-points'].checked,
    showGrid: controls['show-grid'].checked
  };
}

function resolveMatrixWaves(state) {
  if (state.opts.xWave || state.opts.zWave) {
    return {
      waveA: state.opts.xWave || state.select || 'classicSine',
      waveB: state.opts.zWave || state.select || 'triangle'
    };
  }

  const selected = state.select || 'classicSine';
  return {
    waveA: selected,
    waveB: selected
  };
}

function codeNum(value, digits) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0';
  if (Number.isInteger(n)) return String(n);
  return String(Number(n.toFixed(digits ?? 4)));
}

function codeStr(value) {
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function buildWaveOptionsLiteral(state, indent) {
  const sp = indent || '  ';
  const opts = state.opts;
  const lines = [
    `${sp}axis: ${codeStr(opts.axis)}`,
    `${sp}amplitude: ${codeNum(opts.amplitude, 4)}`,
    `${sp}frequency: ${codeNum(opts.frequency, 4)}`,
    `${sp}phase: ${codeNum(opts.phase, 4)}`,
    `${sp}mode: ${codeStr(opts.mode)}`,
    `${sp}unpredictability: ${codeNum(opts.unpredictability, 4)}`,
    `${sp}refresh: ${codeNum(opts.refresh, 4)}`,
    `${sp}normalize: ${opts.normalize ? 'true' : 'false'}`,
    `${sp}range: [${codeNum(opts.range[0], 4)}, ${codeNum(opts.range[1], 4)}]`
  ];

  if (opts.xWave) lines.push(`${sp}xWave: ${codeStr(opts.xWave)}`);
  if (opts.zWave) lines.push(`${sp}zWave: ${codeStr(opts.zWave)}`);

  if (opts.modulation) {
    lines.push(
      `${sp}modulation: {\n` +
      `${sp}  shape: ${codeStr(opts.modulation.shape)},\n` +
      `${sp}  frequency: ${codeNum(opts.modulation.frequency, 4)},\n` +
      `${sp}  phase: ${codeNum(opts.modulation.phase, 4)},\n` +
      `${sp}  phaseDepth: ${codeNum(opts.modulation.phaseDepth, 4)},\n` +
      `${sp}  amplitudeDepth: ${codeNum(opts.modulation.amplitudeDepth, 4)}\n` +
      `${sp}}`
    );
  }

  return lines.join(',\n');
}

function buildLineSnippet(state) {
  const waveSelect = state.select ? codeStr(state.select) : 'null';
  const waveSeconds = state.seconds > 0 ? codeNum(state.seconds, 3) : 'null';
  const step = Math.max(1, state.step);
  const speed = codeNum(state.speed, 4);

  return `// Library input settings (exact preset from Wave Lab)
const waveSelect = ${waveSelect};
const waveSeconds = ${waveSeconds};
const waveOptions = {
${buildWaveOptionsLiteral(state, '  ')}
};

// Full core usage (line field)
let t = 0;

function setup() {
  createCanvas(800, 520);
  noFill();
}

function draw() {
  background(245);
  const centerX = width * 0.5;
  const step = ${step};

  beginShape();
  stroke(0);
  strokeWeight(2);
  for (let y = 0; y <= height; y += step) {
    const sample = Waves.wave(y + t, waveSelect, waveSeconds, waveOptions);
    let xOffset = 0;
    if (waveOptions.axis === 'x') xOffset = sample;
    else if (waveOptions.axis === 'xz') xOffset = sample.x;

    const x = centerX + xOffset;
    vertex(x, y);
${state.showPoints ? `    noStroke();
    fill(255, 0, 0);
    circle(x, y, 4);
    noFill();
    stroke(0);` : ''}
  }
  endShape();

  t += ${speed};
}`;
}

function buildMatrixSnippet(state) {
  const waves = resolveMatrixWaves(state);
  const freq = Math.max(0.001, state.opts.frequency * 18);
  const speed = codeNum(state.speed, 4);

  return `// Library input settings (exact preset from Wave Lab)
const matrixSettings = {
  cols: 14,
  rows: 14,
  waveA: ${codeStr(waves.waveA)},
  waveB: ${codeStr(waves.waveB)},
  axisA: 'x',
  axisB: 'x',
  frequencyA: ${codeNum(freq, 4)},
  frequencyB: ${codeNum(freq, 4)},
  amplitudeA: 1,
  amplitudeB: 1,
  phaseWaveA: ${codeNum(state.opts.phase, 4)},
  phaseWaveB: ${codeNum(state.opts.phase, 4)},
  mode: ${codeStr(state.opts.mode)},
  unpredictability: ${codeNum(state.opts.unpredictability, 4)},
  normalizeA: ${state.opts.normalize ? 'true' : 'false'},
  normalizeB: ${state.opts.normalize ? 'true' : 'false'},
  rangeA: [${codeNum(state.opts.range[0], 4)}, ${codeNum(state.opts.range[1], 4)}],
  rangeB: [${codeNum(state.opts.range[0], 4)}, ${codeNum(state.opts.range[1], 4)}],
  modulationA: ${state.opts.modulation ? JSON.stringify(state.opts.modulation) : 'null'},
  modulationB: ${state.opts.modulation ? JSON.stringify(state.opts.modulation) : 'null'},
  refreshA: ${codeNum(state.opts.refresh, 4)},
  refreshB: ${codeNum(state.opts.refresh + 1, 4)},
  combine: 'add',
  threshold: 0,
  inputScale: TWO_PI,
  timeScaleA: 1,
  timeScaleB: -1
};

// Full core usage (14x14 matrix)
let t = 0;
let matrixSampler;
const matrixBuffers = {
  cells: new Uint8Array(14 * 14),
  values: new Float32Array(14 * 14)
};

function setup() {
  createCanvas(560, 560);
  noStroke();
  matrixSampler = Waves.createGridSampler(matrixSettings);
}

function draw() {
  background(245);
  const frame = matrixSampler.sample(t * 8, matrixBuffers);
  const cols = 14;
  const rows = 14;
  const cell = min(width / cols, height / rows);
  const ox = (width - cols * cell) * 0.5;
  const oy = (height - rows * cell) * 0.5;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      fill(frame.cells[idx] === 1 ? 0 : 255);
      rect(ox + c * cell, oy + r * cell, cell, cell);
    }
  }

  t += ${speed};
}`;
}

function buildCodeSnippet(state) {
  const title = state.previewMode === 'matrix14'
    ? '// Wave Lab export: Matrix 14x14 preset'
    : '// Wave Lab export: Line field preset';
  const body = state.previewMode === 'matrix14'
    ? buildMatrixSnippet(state)
    : buildLineSnippet(state);
  return `${title}\n${body}`;
}

function updateCodeSnippet(state) {
  if (!codeOutputEl) return;
  codeOutputEl.value = buildCodeSnippet(state);
}

function fallbackCopyText(text) {
  const ghost = document.createElement('textarea');
  ghost.value = text;
  ghost.setAttribute('readonly', 'readonly');
  ghost.style.position = 'fixed';
  ghost.style.opacity = '0';
  ghost.style.pointerEvents = 'none';
  document.body.appendChild(ghost);
  ghost.select();
  document.execCommand('copy');
  document.body.removeChild(ghost);
}

function setCopyButtonText(label) {
  if (!controls['copy-code']) return;
  controls['copy-code'].textContent = label;
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
  } catch (err) {
    setCopyButtonText('Copy Failed');
  }

  if (copyButtonResetTimer) window.clearTimeout(copyButtonResetTimer);
  copyButtonResetTimer = window.setTimeout(() => setCopyButtonText('Copy Snippet'), 1400);
}

function getMatrixSampler(state) {
  if (!Waves.createGridSampler) return null;
  const waves = resolveMatrixWaves(state);
  const freq = Math.max(0.001, state.opts.frequency * 18);
  const key = [
    waves.waveA,
    waves.waveB,
    state.opts.refresh,
    state.opts.normalize,
    state.opts.phase,
    state.opts.mode,
    state.opts.unpredictability,
    state.opts.range[0],
    state.opts.range[1],
    state.opts.modulation ? JSON.stringify(state.opts.modulation) : '',
    freq
  ].join('|');

  if (matrixSamplerKey !== key) {
    matrixSamplerKey = key;
    matrixSampler = Waves.createGridSampler({
      cols: 14,
      rows: 14,
      waveA: waves.waveA,
      waveB: waves.waveB,
      axisA: 'x',
      axisB: 'x',
      frequencyA: freq,
      frequencyB: freq,
      amplitudeA: 1,
      amplitudeB: 1,
      phaseWaveA: state.opts.phase,
      phaseWaveB: state.opts.phase,
      mode: state.opts.mode,
      unpredictability: state.opts.unpredictability,
      normalizeA: state.opts.normalize,
      normalizeB: state.opts.normalize,
      rangeA: state.opts.range,
      rangeB: state.opts.range,
      modulationA: state.opts.modulation || null,
      modulationB: state.opts.modulation || null,
      refreshA: state.opts.refresh,
      refreshB: state.opts.refresh + 1,
      combine: 'add',
      threshold: 0,
      inputScale: TWO_PI,
      timeScaleA: 1,
      timeScaleB: -1
    });
  }

  return matrixSampler;
}

function resolveFamily(name) {
  const found = Waves.getWaveByName ? Waves.getWaveByName(name) : null;
  if (!found || !found.wave) return 'unknown';
  return found.wave.family || 'wave';
}

function updateBadges(state) {
  const familyEl = document.getElementById('active-family');
  const waveEl = document.getElementById('active-wave');
  const energyEl = document.getElementById('active-energy');

  if (state.opts.xWave || state.opts.zWave) {
    const xLabel = state.opts.xWave || 'random';
    const zLabel = state.opts.zWave || 'random';
    waveEl.textContent = `wave: x=${xLabel}, z=${zLabel}`;
    familyEl.textContent = `family: ${resolveFamily(xLabel)} + ${resolveFamily(zLabel)}`;
  } else {
    const name = state.select || 'random';
    waveEl.textContent = `wave: ${name}`;
    familyEl.textContent = `family: ${resolveFamily(name)}`;
  }

  const autoStatus = state.seconds > 0 ? 'on' : 'off';
  const modeLabel = state.opts.mode === 'wild'
    ? `wild ${state.opts.unpredictability.toFixed(2)}`
    : 'stable';
  energyEl.textContent = `${state.opts.normalize ? 'energy: normalized' : 'energy: raw'} | mode: ${modeLabel} | auto: ${autoStatus} | view: ${state.previewMode}`;
}

function drawBackdrop() {
  background(245);
}

function drawGrid() {
  stroke(0, 0, 0, 40);
  strokeWeight(1);
  for (let y = 0; y <= height; y += 40) line(0, y, width, y);
  for (let x = 0; x <= width; x += 80) line(x, 0, x, height);
}

function drawWave(state) {
  const cx = width * 0.5;
  const step = Math.max(1, state.step);
  const axis = state.axis;
  const phaseInput = t;

  stroke(0, 0, 0, 220);
  strokeWeight(2.1);
  beginShape();
  for (let y = 0; y <= height; y += step) {
    const sample = Waves.wave(y + phaseInput, state.select, state.seconds, state.opts);
    let xOffset = 0;
    let zOffset = 0;
    if (axis === 'x') {
      xOffset = sample;
    } else if (axis === 'z') {
      zOffset = sample;
      xOffset = 0;
    } else {
      xOffset = sample.x;
      zOffset = sample.z;
    }

    const x = cx + xOffset;
    vertex(x, y);

    if (state.showPoints) {
      noStroke();
      fill(255, 0, 0);
      circle(x, y, 4);
      noFill();
      stroke(0, 0, 0, 220);
    }
  }
  endShape();
}

function drawMatrix14(state) {
  const cols = 14;
  const rows = 14;
  const cell = Math.min(width / cols, height / rows);
  const gridW = cell * cols;
  const gridH = cell * rows;
  const ox = (width - gridW) * 0.5;
  const oy = (height - gridH) * 0.5;
  const sampler = getMatrixSampler(state);
  const frame = sampler
    ? sampler.sample(t * 8, matrixBuffers)
    : null;

  noStroke();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const isBlack = frame ? frame.cells[idx] === 1 : false;
      fill(isBlack ? 0 : 255);
      rect(ox + c * cell, oy + r * cell, cell, cell);
    }
  }

  if (state.showGrid) {
    stroke(0, 0, 0, 200);
    strokeWeight(1);
    noFill();
    for (let gx = 0; gx <= cols; gx++) {
      const x = ox + gx * cell;
      line(x, oy, x, oy + gridH);
    }
    for (let gy = 0; gy <= rows; gy++) {
      const y = oy + gy * cell;
      line(ox, y, ox + gridW, y);
    }
  }

  if (state.showPoints) {
    noFill();
    stroke(255, 0, 0);
    strokeWeight(2);
    rect(ox, oy, gridW, gridH);
  }

  if (frame && frame.uniform) {
    noFill();
    stroke(255, 0, 0);
    strokeWeight(3);
    rect(ox + 2, oy + 2, gridW - 4, gridH - 4);
  }
}

function randomizeControls() {
  const randomWave = () => waveNames[Math.floor(Math.random() * waveNames.length)];
  controls.axis.value = ['x', 'z', 'xz'][Math.floor(Math.random() * 3)];
  controls['select-mode'].value = Math.random() > 0.5 ? 'single' : 'split';
  controls.wave.value = randomWave();
  controls['x-wave'].value = randomWave();
  controls['z-wave'].value = randomWave();
  controls.refresh.value = String(Math.floor(Math.random() * 121));
  controls.seconds.value = Math.random() > 0.65 ? fmt(Math.random() * 3 + 0.25, 2) : '0';
  controls.amplitude.value = String(Math.floor(40 + Math.random() * 160));
  controls.frequency.value = fmt(0.004 + Math.random() * 0.045, 3);
  controls.phase.value = fmt(-1.5 + Math.random() * 3, 2);
  controls.mode.value = Math.random() > 0.45 ? 'wild' : 'stable';
  controls.unpredictability.value = fmt(Math.random(), 2);
  controls.normalize.checked = Math.random() > 0.15;
  controls['range-min'].value = '-1';
  controls['range-max'].value = '1';
  controls['mod-enable'].checked = Math.random() > 0.4;
  controls['mod-shape'].value = ['sine', 'triangle', 'saw', 'square', 'noise'][Math.floor(Math.random() * 5)];
  controls['mod-frequency'].value = fmt(0.05 + Math.random() * 0.45, 2);
  controls['mod-phase'].value = fmt(-1 + Math.random() * 2, 2);
  controls['mod-phase-depth'].value = fmt(Math.random() * 0.65, 2);
  controls['mod-amp-depth'].value = fmt(-0.35 + Math.random() * 0.7, 2);
  controls['preview-mode'].value = Math.random() > 0.5 ? 'line' : 'matrix14';
  controls['time-speed'].value = fmt(0.005 + Math.random() * 0.04, 3);
  controls.step.value = String(Math.floor(4 + Math.random() * 10));
  updateUiState();
}

function draw() {
  const state = readOptions();
  updateBadges(state);

  drawBackdrop();
  if (state.previewMode === 'matrix14') {
    drawMatrix14(state);
  } else {
    if (state.showGrid) drawGrid();
    drawWave(state);
  }

  t += state.speed;
}
