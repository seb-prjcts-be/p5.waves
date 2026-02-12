const controls = {};
const valueTargets = {};
const waveDefs = [];
const waveNames = [];
let t = 0;

const ids = [
  'axis', 'select-mode', 'wave', 'x-wave', 'z-wave',
  'refresh', 'seconds', 'amplitude', 'frequency', 'phase',
  'normalize', 'range-min', 'range-max',
  'mod-enable', 'mod-shape', 'mod-frequency', 'mod-phase', 'mod-phase-depth', 'mod-amp-depth',
  'preview-mode', 'time-speed', 'step', 'show-points', 'show-grid', 'surprise'
];

const valueIds = [
  'refresh-value', 'seconds-value', 'amplitude-value', 'frequency-value', 'phase-value',
  'range-min-value', 'range-max-value',
  'mod-frequency-value', 'mod-phase-value', 'mod-phase-depth-value', 'mod-amp-depth-value',
  'time-speed-value', 'step-value'
];

function fmt(num, digits) {
  return Number(num).toFixed(digits);
}

function setup() {
  for (let i = 0; i < ids.length; i++) controls[ids[i]] = document.getElementById(ids[i]);
  for (let i = 0; i < valueIds.length; i++) valueTargets[valueIds[i]] = document.getElementById(valueIds[i]);

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

function updateUiState() {
  enforceRangeOrder();

  valueTargets['refresh-value'].textContent = controls.refresh.value;
  valueTargets['seconds-value'].textContent = `${fmt(controls.seconds.value, 2)}s`;
  valueTargets['amplitude-value'].textContent = controls.amplitude.value;
  valueTargets['frequency-value'].textContent = fmt(controls.frequency.value, 3);
  valueTargets['phase-value'].textContent = fmt(controls.phase.value, 2);
  valueTargets['range-min-value'].textContent = fmt(controls['range-min'].value, 2);
  valueTargets['range-max-value'].textContent = fmt(controls['range-max'].value, 2);
  valueTargets['mod-frequency-value'].textContent = fmt(controls['mod-frequency'].value, 2);
  valueTargets['mod-phase-value'].textContent = fmt(controls['mod-phase'].value, 2);
  valueTargets['mod-phase-depth-value'].textContent = fmt(controls['mod-phase-depth'].value, 2);
  valueTargets['mod-amp-depth-value'].textContent = fmt(controls['mod-amp-depth'].value, 2);
  valueTargets['time-speed-value'].textContent = fmt(controls['time-speed'].value, 3);
  valueTargets['step-value'].textContent = controls.step.value;

  const splitMode = controls['select-mode'].value === 'split';
  const axisIsXz = controls.axis.value === 'xz';
  const showSplit = splitMode && axisIsXz;
  document.getElementById('single-wave-row').classList.toggle('hidden', showSplit);
  document.getElementById('x-wave-row').classList.toggle('hidden', !showSplit);
  document.getElementById('z-wave-row').classList.toggle('hidden', !showSplit);

  const modOn = controls['mod-enable'].checked;
  document.getElementById('mod-fields').classList.toggle('hidden', !modOn);
}

function readOptions() {
  const axis = controls.axis.value;
  const mode = controls['select-mode'].value;
  const previewMode = controls['preview-mode'].value;
  const range = [Number(controls['range-min'].value), Number(controls['range-max'].value)];
  const normalize = controls.normalize.checked;
  const amplitude = Number(controls.amplitude.value);
  const frequency = Number(controls.frequency.value);
  const phase = Number(controls.phase.value);
  const refresh = Number(controls.refresh.value);
  const seconds = Number(controls.seconds.value);

  const opts = {
    axis,
    amplitude,
    frequency,
    phase,
    refresh,
    normalize,
    range
  };

  let select = controls.wave.value;

  if (mode === 'split' && axis === 'xz') {
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

  energyEl.textContent = `${state.opts.normalize ? 'energy: normalized' : 'energy: raw'} | view: ${state.previewMode}`;
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
      fill(255, 0, 0, 170);
      circle(x, y, 4);
      noFill();
      stroke(0, 0, 0, 220);
    }
  }
  endShape();
}

function sampleToScalar(sample, axis) {
  if (axis === 'x' || axis === 'z') return Number(sample) || 0;
  if (!sample || typeof sample !== 'object') return 0;
  const x = Number(sample.x) || 0;
  const z = Number(sample.z) || 0;
  return (x + z) * 0.5;
}

function drawMatrix14(state) {
  const cols = 14;
  const rows = 14;
  const cell = Math.min(width / cols, height / rows);
  const gridW = cell * cols;
  const gridH = cell * rows;
  const ox = (width - gridW) * 0.5;
  const oy = (height - gridH) * 0.5;

  const rangeAbs = Math.max(1, Math.abs(state.opts.range[0]), Math.abs(state.opts.range[1]));
  const denom = Math.max(1, state.opts.amplitude * rangeAbs);
  const timeShift = t * 120;

  noStroke();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const inVal = idx * 4 + timeShift;
      const sample = Waves.wave(inVal, state.select, state.seconds, state.opts);
      const scalar = sampleToScalar(sample, state.axis);
      const n = constrain(scalar / denom, -1, 1);
      const isBlack = n > 0;
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
