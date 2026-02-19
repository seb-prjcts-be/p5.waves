const controls = {};
const valueTargets = {};
const waveDefs = [];

let t = 0;
let matrixSampler = null;
let matrixSamplerKey = '';
let codeOutputEl = null;
let copyButtonResetTimer = 0;

const ids = [
  'preview-mode', 'axis', 'wave', 'refresh', 'seconds',
  'amplitude', 'frequency', 'phase', 'mode', 'unpredictability',
  'normalize', 'range-min', 'range-max',
  'domain-min', 'domain-max', 'samples',
  'mod-enable', 'mod-shape', 'mod-frequency', 'mod-phase', 'mod-phase-depth', 'mod-amp-depth',
  'wave-b-gap', 'combine', 'threshold', 'grid-mode', 'grid-unpredictability', 'auto-step-on-uniform',
  'time-speed', 'step', 'show-points', 'connect-line', 'show-grid',
  'surprise', 'copy-code'
];

const valueIds = [
  'refresh-value', 'seconds-value',
  'amplitude-value', 'frequency-value', 'phase-value', 'unpredictability-value',
  'range-min-value', 'range-max-value',
  'domain-min-value', 'domain-max-value', 'samples-value',
  'mod-frequency-value', 'mod-phase-value', 'mod-phase-depth-value', 'mod-amp-depth-value',
  'wave-b-gap-value', 'threshold-value', 'grid-unpredictability-value',
  'time-speed-value', 'step-value'
];

function fmt(num, digits) {
  return Number(num).toFixed(digits);
}

function clampWaveIndex(index) {
  const n = Number(index);
  const len = waveDefs.length || 1;
  const i = Number.isFinite(n) ? Math.floor(n) : 0;
  return ((i % len) + len) % len;
}

function getWaveLabel(index) {
  const i = clampWaveIndex(index);
  const item = waveDefs[i] || { wave: 'unknown', shape: 'unknown' };
  return `${i}: ${item.wave} | ${item.shape}`;
}

function currentTick(seconds) {
  const s = Number(seconds);
  if (!Number.isFinite(s) || s <= 0) return 0;
  return Math.floor((millis() / 1000) / s);
}

function resolvedWaveIndex(baseWave, seconds) {
  return clampWaveIndex(clampWaveIndex(baseWave) + currentTick(seconds));
}

function setControlDisabled(id, disabled) {
  const el = controls[id];
  if (!el) return;
  el.disabled = !!disabled;
  const label = el.closest('label');
  if (label) label.classList.toggle('disabled-control', !!disabled);
}

function setup() {
  for (let i = 0; i < ids.length; i++) controls[ids[i]] = document.getElementById(ids[i]);
  for (let i = 0; i < valueIds.length; i++) valueTargets[valueIds[i]] = document.getElementById(valueIds[i]);
  codeOutputEl = document.getElementById('code-output');

  const defs = Array.isArray(Waves.data) ? Waves.data : [];
  for (let i = 0; i < defs.length; i++) waveDefs.push(defs[i]);

  populateWaveSelect();
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

function populateWaveSelect() {
  const select = controls.wave;
  select.innerHTML = '';

  for (let i = 0; i < waveDefs.length; i++) {
    const def = waveDefs[i];
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = `${i} - ${def.wave} | ${def.shape}`;
    select.appendChild(option);
  }

  let defaultIndex = 0;
  for (let i = 0; i < waveDefs.length; i++) {
    if (String(waveDefs[i].wave).toLowerCase() === 'classic sine') {
      defaultIndex = i;
      break;
    }
  }

  select.value = String(defaultIndex);
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

function enforceRanges() {
  let rangeMin = Number(controls['range-min'].value);
  let rangeMax = Number(controls['range-max'].value);
  if (rangeMin >= rangeMax) {
    if (rangeMin >= 1.95) rangeMin = 1.9;
    rangeMax = rangeMin + 0.05;
    controls['range-min'].value = String(rangeMin);
    controls['range-max'].value = String(rangeMax);
  }

  let domainMin = Number(controls['domain-min'].value);
  let domainMax = Number(controls['domain-max'].value);
  if (domainMin >= domainMax) {
    if (domainMin >= 299) domainMin = 298;
    domainMax = domainMin + 1;
    controls['domain-min'].value = String(domainMin);
    controls['domain-max'].value = String(domainMax);
  }
}

function readModulation() {
  if (!controls['mod-enable'].checked) return null;
  return {
    shape: controls['mod-shape'].value,
    frequency: Number(controls['mod-frequency'].value),
    phase: Number(controls['mod-phase'].value),
    phaseDepth: Number(controls['mod-phase-depth'].value),
    amplitudeDepth: Number(controls['mod-amp-depth'].value)
  };
}

function readState() {
  const axis = controls.axis.value;
  const wave = clampWaveIndex(controls.wave.value);
  const refresh = Number(controls.refresh.value);
  const seconds = Number(controls.seconds.value);
  const amplitude = Number(controls.amplitude.value);
  const frequency = Number(controls.frequency.value);
  const phase = Number(controls.phase.value);
  const mode = controls.mode.value;
  const unpredictability = Number(controls.unpredictability.value);
  const normalize = controls.normalize.checked;
  const range = [Number(controls['range-min'].value), Number(controls['range-max'].value)];
  const domain = [Number(controls['domain-min'].value), Number(controls['domain-max'].value)];
  const samples = Number(controls.samples.value);
  const modulation = readModulation();

  return {
    previewMode: controls['preview-mode'].value,
    axis,
    wave,
    seconds: seconds > 0 ? seconds : 0,
    opts: {
      axis,
      amplitude,
      frequency,
      phase,
      mode,
      unpredictability,
      modulation,
      refresh,
      normalize,
      range,
      domain,
      samples
    },
    matrix: {
      waveBGap: Number(controls['wave-b-gap'].value),
      combine: controls.combine.value,
      threshold: Number(controls.threshold.value),
      mode: controls['grid-mode'].value,
      unpredictability: Number(controls['grid-unpredictability'].value),
      autoStepOnUniform: controls['auto-step-on-uniform'].checked
    },
    step: Number(controls.step.value),
    speed: Number(controls['time-speed'].value),
    showPoints: controls['show-points'].checked,
    connectLine: controls['connect-line'].checked,
    showGrid: controls['show-grid'].checked
  };
}

function updateValueDisplays() {
  valueTargets['refresh-value'].textContent = controls.refresh.value;
  valueTargets['seconds-value'].textContent = `${fmt(controls.seconds.value, 2)}s`;
  valueTargets['amplitude-value'].textContent = controls.amplitude.value;
  valueTargets['frequency-value'].textContent = fmt(controls.frequency.value, 2);
  valueTargets['phase-value'].textContent = fmt(controls.phase.value, 2);
  valueTargets['unpredictability-value'].textContent = fmt(controls.unpredictability.value, 2);
  valueTargets['range-min-value'].textContent = fmt(controls['range-min'].value, 2);
  valueTargets['range-max-value'].textContent = fmt(controls['range-max'].value, 2);
  valueTargets['domain-min-value'].textContent = controls['domain-min'].value;
  valueTargets['domain-max-value'].textContent = controls['domain-max'].value;
  valueTargets['samples-value'].textContent = controls.samples.value;
  valueTargets['mod-frequency-value'].textContent = fmt(controls['mod-frequency'].value, 2);
  valueTargets['mod-phase-value'].textContent = fmt(controls['mod-phase'].value, 2);
  valueTargets['mod-phase-depth-value'].textContent = fmt(controls['mod-phase-depth'].value, 2);
  valueTargets['mod-amp-depth-value'].textContent = fmt(controls['mod-amp-depth'].value, 2);
  valueTargets['wave-b-gap-value'].textContent = controls['wave-b-gap'].value;
  valueTargets['threshold-value'].textContent = fmt(controls.threshold.value, 2);
  valueTargets['grid-unpredictability-value'].textContent = fmt(controls['grid-unpredictability'].value, 2);
  valueTargets['time-speed-value'].textContent = fmt(controls['time-speed'].value, 3);
  valueTargets['step-value'].textContent = controls.step.value;
}

function matrixAxes(axis) {
  if (axis === 'x') return { axisA: 'x', axisB: 'x' };
  if (axis === 'z') return { axisA: 'z', axisB: 'z' };
  return { axisA: 'x', axisB: 'z' };
}

function matrixSamplerConfig(state) {
  const tick = currentTick(state.seconds);
  const waveA = resolvedWaveIndex(state.wave, state.seconds);
  const waveB = clampWaveIndex(waveA + state.matrix.waveBGap);
  const refreshA = state.opts.refresh + tick;
  const refreshB = refreshA + state.matrix.waveBGap;
  const axes = matrixAxes(state.axis);

  return { tick, waveA, waveB, refreshA, refreshB, axes };
}

function updateBadges(state) {
  const waveEl = document.getElementById('active-wave');
  const settingsEl = document.getElementById('active-settings');
  const normalizeEl = document.getElementById('active-normalize');
  const behaviorEl = document.getElementById('active-behavior');

  if (state.previewMode === 'matrix14') {
    const cfg = matrixSamplerConfig(state);
    waveEl.textContent = `waves: A ${getWaveLabel(cfg.waveA)} | B ${getWaveLabel(cfg.waveB)}`;
  } else {
    waveEl.textContent = `wave: ${getWaveLabel(resolvedWaveIndex(state.wave, state.seconds))}`;
  }

  settingsEl.textContent =
    `axis: ${state.axis} | refresh: ${state.opts.refresh} | seconds: ${state.seconds > 0 ? `${state.seconds.toFixed(2)}s` : 'off'} | freq: ${state.opts.frequency.toFixed(2)} | phase: ${state.opts.phase.toFixed(2)}`;

  normalizeEl.textContent =
    `normalize: ${state.opts.normalize ? 'on' : 'off'} | range: [${state.opts.range[0].toFixed(2)}, ${state.opts.range[1].toFixed(2)}] | domain: [${state.opts.domain[0].toFixed(0)}, ${state.opts.domain[1].toFixed(0)}]`;

  behaviorEl.textContent =
    `mode: ${state.opts.mode} (${state.opts.unpredictability.toFixed(2)}) | mod: ${state.opts.modulation ? state.opts.modulation.shape : 'off'} | combine: ${state.matrix.combine} | grid: ${state.matrix.mode} (${state.matrix.unpredictability.toFixed(2)}) | render: ${state.connectLine ? 'line' : 'circles'}`;
}

function updateUiState() {
  enforceRanges();

  const modOn = controls['mod-enable'].checked;
  document.getElementById('mod-fields').classList.toggle('hidden', !modOn);

  setControlDisabled('unpredictability', controls.mode.value !== 'wild');
  setControlDisabled('grid-unpredictability', controls['grid-mode'].value !== 'wild');

  updateValueDisplays();
  const state = readState();
  updateBadges(state);
  updateCodeSnippet(state);
}

function drawBackdrop() {
  background(245);
}

function drawGrid() {
  stroke(0);
  strokeWeight(1);
  for (let y = 0; y <= height; y += 40) line(0, y, width, y);
  for (let x = 0; x <= width; x += 80) line(x, 0, x, height);
}

function drawWave(state) {
  const cx = width * 0.5;
  const step = Math.max(1, state.step);
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
    const sample = Waves.wave(y + t, state.wave, state.seconds, state.opts);
    const xOffset = state.axis === 'xz' ? sample.x : sample;
    const x = cx + xOffset;
    if (state.connectLine) vertex(x, y);

    if (drawPoints) {
      noStroke();
      fill(0);
      circle(x, y, 4);
      if (state.connectLine) {
        noFill();
        stroke(0);
      }
    }
  }

  if (state.connectLine) endShape();
}

function getMatrixSampler(state) {
  const cfg = matrixSamplerConfig(state);
  const key = [
    cfg.waveA,
    cfg.waveB,
    cfg.refreshA,
    cfg.refreshB,
    cfg.axes.axisA,
    cfg.axes.axisB,
    state.opts.amplitude,
    state.opts.frequency,
    state.opts.phase,
    state.opts.mode,
    state.opts.unpredictability,
    JSON.stringify(state.opts.modulation || null),
    state.opts.normalize,
    state.opts.range[0],
    state.opts.range[1],
    state.opts.domain[0],
    state.opts.domain[1],
    state.opts.samples,
    state.matrix.combine,
    state.matrix.threshold,
    state.matrix.mode,
    state.matrix.unpredictability,
    state.matrix.autoStepOnUniform
  ].join('|');

  if (matrixSamplerKey !== key) {
    matrixSamplerKey = key;
    matrixSampler = Waves.createGridSampler({
      cols: 14,
      rows: 14,
      waveA: cfg.waveA,
      waveB: cfg.waveB,
      axisA: cfg.axes.axisA,
      axisB: cfg.axes.axisB,
      amplitudeA: state.opts.amplitude,
      amplitudeB: state.opts.amplitude,
      frequencyA: state.opts.frequency,
      frequencyB: state.opts.frequency,
      phaseWaveA: state.opts.phase,
      phaseWaveB: -state.opts.phase,
      modeA: state.opts.mode,
      modeB: state.opts.mode,
      unpredictabilityA: state.opts.unpredictability,
      unpredictabilityB: state.opts.unpredictability,
      modulationA: state.opts.modulation,
      modulationB: state.opts.modulation,
      normalizeA: state.opts.normalize,
      normalizeB: state.opts.normalize,
      rangeA: state.opts.range,
      rangeB: state.opts.range,
      domainA: state.opts.domain,
      domainB: state.opts.domain,
      samplesA: state.opts.samples,
      samplesB: state.opts.samples,
      refreshA: cfg.refreshA,
      refreshB: cfg.refreshB,
      combine: state.matrix.combine,
      threshold: state.matrix.threshold,
      mode: state.matrix.mode,
      unpredictability: state.matrix.unpredictability,
      autoStepOnUniform: state.matrix.autoStepOnUniform,
      inputScale: TWO_PI
    });
  }

  return matrixSampler;
}

function drawMatrix14(state) {
  const sampler = getMatrixSampler(state);
  const frame = sampler.sample(t * 8);
  const cols = frame.cols;
  const rows = frame.rows;
  const cell = Math.min(width / cols, height / rows);
  const gridW = cell * cols;
  const gridH = cell * rows;
  const ox = (width - gridW) * 0.5;
  const oy = (height - gridH) * 0.5;

  noStroke();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const on = frame.cells[idx] === 1;
      fill(on ? 0 : 255);
      rect(ox + c * cell, oy + r * cell, cell, cell);

      if (state.showPoints) {
        const centerX = ox + c * cell + cell * 0.5;
        const centerY = oy + r * cell + cell * 0.5;
        const radius = on ? cell * 0.36 : cell * 0.14;
        fill(on ? 255 : 0);
        circle(centerX, centerY, radius);
      }
    }
  }

  if (state.showGrid) {
    stroke(0);
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

  if (frame.uniform) {
    noFill();
    stroke(255, 0, 0);
    strokeWeight(3);
    rect(ox + 2, oy + 2, gridW - 4, gridH - 4);
  }
}

function codeNum(value, digits) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0';
  if (Number.isInteger(n)) return String(n);
  return String(Number(n.toFixed(digits || 4)));
}

function codeBool(value) {
  return value ? 'true' : 'false';
}

function buildModulationLiteral(mod, indent) {
  const sp = indent || '  ';
  if (!mod) return 'null';
  return `{
${sp}shape: '${mod.shape}',
${sp}frequency: ${codeNum(mod.frequency, 4)},
${sp}phase: ${codeNum(mod.phase, 4)},
${sp}phaseDepth: ${codeNum(mod.phaseDepth, 4)},
${sp}amplitudeDepth: ${codeNum(mod.amplitudeDepth, 4)}
}`;
}

function buildWaveOptionsLiteral(state, indent) {
  const sp = indent || '  ';
  const lines = [
    `${sp}axis: '${state.axis}'`,
    `${sp}amplitude: ${codeNum(state.opts.amplitude, 4)}`,
    `${sp}frequency: ${codeNum(state.opts.frequency, 4)}`,
    `${sp}phase: ${codeNum(state.opts.phase, 4)}`,
    `${sp}mode: '${state.opts.mode}'`,
    `${sp}unpredictability: ${codeNum(state.opts.unpredictability, 4)}`,
    `${sp}refresh: ${codeNum(state.opts.refresh, 4)}`,
    `${sp}normalize: ${codeBool(state.opts.normalize)}`,
    `${sp}range: [${codeNum(state.opts.range[0], 4)}, ${codeNum(state.opts.range[1], 4)}]`,
    `${sp}domain: [${codeNum(state.opts.domain[0], 4)}, ${codeNum(state.opts.domain[1], 4)}]`,
    `${sp}samples: ${codeNum(state.opts.samples, 0)}`,
    `${sp}modulation: ${buildModulationLiteral(state.opts.modulation, `${sp}  `)}`
  ];
  return lines.join(',\n');
}

function buildLineSnippet(state) {
  const seconds = state.seconds > 0 ? codeNum(state.seconds, 2) : 'null';

  return `// p5.waves line preset export\nconst waveSelect = ${state.wave};\nconst waveSeconds = ${seconds};\nconst connectLine = ${codeBool(state.connectLine)};\nconst drawPoints = ${codeBool(state.showPoints)};\nconst waveOptions = {\n${buildWaveOptionsLiteral(state, '  ')}\n};\n\nlet t = 0;\n\nfunction setup() {\n  createCanvas(800, 520);\n  noFill();\n}\n\nfunction draw() {\n  background(245);\n\n  if (connectLine) {\n    beginShape();\n    stroke(0);\n    strokeWeight(2);\n  } else {\n    noStroke();\n    fill(0);\n  }\n\n  for (let y = 0; y <= height; y += ${Math.max(1, state.step)}) {\n    const sample = Waves.wave(y + t, waveSelect, waveSeconds, waveOptions);\n    const x = width * 0.5 + (waveOptions.axis === 'xz' ? sample.x : sample);\n\n    if (connectLine) vertex(x, y);\n\n    if (drawPoints || !connectLine) {\n      noStroke();\n      fill(0);\n      circle(x, y, 4);\n      if (connectLine) {\n        noFill();\n        stroke(0);\n      }\n    }\n  }\n\n  if (connectLine) endShape();\n  t += ${codeNum(state.speed, 4)};\n}`;
}

function buildMatrixSnippet(state) {
  const seconds = state.seconds > 0 ? codeNum(state.seconds, 2) : '0';

  return `// p5.waves matrix preset export (createGridSampler)\nconst baseWave = ${state.wave};\nconst seconds = ${seconds};\nconst waveBGap = ${state.matrix.waveBGap};\n\nconst gridOptionsBase = {\n  cols: 14,\n  rows: 14,\n  axisA: '${matrixAxes(state.axis).axisA}',\n  axisB: '${matrixAxes(state.axis).axisB}',\n  amplitudeA: ${codeNum(state.opts.amplitude, 4)},\n  amplitudeB: ${codeNum(state.opts.amplitude, 4)},\n  frequencyA: ${codeNum(state.opts.frequency, 4)},\n  frequencyB: ${codeNum(state.opts.frequency, 4)},\n  phaseWaveA: ${codeNum(state.opts.phase, 4)},\n  phaseWaveB: ${codeNum(-state.opts.phase, 4)},\n  modeA: '${state.opts.mode}',\n  modeB: '${state.opts.mode}',\n  unpredictabilityA: ${codeNum(state.opts.unpredictability, 4)},\n  unpredictabilityB: ${codeNum(state.opts.unpredictability, 4)},\n  modulationA: ${buildModulationLiteral(state.opts.modulation, '    ')},\n  modulationB: ${buildModulationLiteral(state.opts.modulation, '    ')},\n  normalizeA: ${codeBool(state.opts.normalize)},\n  normalizeB: ${codeBool(state.opts.normalize)},\n  rangeA: [${codeNum(state.opts.range[0], 4)}, ${codeNum(state.opts.range[1], 4)}],\n  rangeB: [${codeNum(state.opts.range[0], 4)}, ${codeNum(state.opts.range[1], 4)}],\n  domainA: [${codeNum(state.opts.domain[0], 4)}, ${codeNum(state.opts.domain[1], 4)}],\n  domainB: [${codeNum(state.opts.domain[0], 4)}, ${codeNum(state.opts.domain[1], 4)}],\n  samplesA: ${codeNum(state.opts.samples, 0)},\n  samplesB: ${codeNum(state.opts.samples, 0)},\n  combine: '${state.matrix.combine}',\n  threshold: ${codeNum(state.matrix.threshold, 4)},\n  mode: '${state.matrix.mode}',\n  unpredictability: ${codeNum(state.matrix.unpredictability, 4)},\n  autoStepOnUniform: ${codeBool(state.matrix.autoStepOnUniform)},\n  inputScale: TWO_PI\n};\n\nlet t = 0;\nlet sampler = null;\nlet samplerKey = '';\n\nfunction getSampler() {\n  const tick = seconds > 0 ? Math.floor((millis() / 1000) / seconds) : 0;\n  const waveA = ((baseWave + tick) % Waves.data.length + Waves.data.length) % Waves.data.length;\n  const waveB = ((waveA + waveBGap) % Waves.data.length + Waves.data.length) % Waves.data.length;\n  const refreshA = ${codeNum(state.opts.refresh, 4)} + tick;\n  const refreshB = refreshA + waveBGap;\n  const key = waveA + '|' + waveB + '|' + refreshA + '|' + refreshB;\n\n  if (key !== samplerKey) {\n    samplerKey = key;\n    sampler = Waves.createGridSampler({\n      ...gridOptionsBase,\n      waveA,\n      waveB,\n      refreshA,\n      refreshB\n    });\n  }\n\n  return sampler;\n}\n\nfunction setup() {\n  createCanvas(560, 560);\n}\n\nfunction draw() {\n  background(245);\n  const frame = getSampler().sample(t * 8);\n  const cols = frame.cols;\n  const rows = frame.rows;\n  const cell = min(width / cols, height / rows);\n  const ox = (width - cols * cell) * 0.5;\n  const oy = (height - rows * cell) * 0.5;\n\n  noStroke();\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      const idx = r * cols + c;\n      fill(frame.cells[idx] === 1 ? 0 : 255);\n      rect(ox + c * cell, oy + r * cell, cell, cell);\n    }\n  }\n\n  t += ${codeNum(state.speed, 4)};\n}`;
}

function buildCodeSnippet(state) {
  if (state.previewMode === 'matrix14') return buildMatrixSnippet(state);
  return buildLineSnippet(state);
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

function randomFrom(values) {
  return values[Math.floor(Math.random() * values.length)];
}

function randomizeControls() {
  controls['preview-mode'].value = randomFrom(['line', 'matrix14']);
  controls.axis.value = randomFrom(['x', 'z', 'xz']);
  controls.wave.value = String(Math.floor(Math.random() * waveDefs.length));
  controls.refresh.value = String(Math.floor(Math.random() * 121));
  controls.seconds.value = Math.random() > 0.45 ? fmt(0.5 + Math.random() * 2, 2) : '0';
  controls.amplitude.value = String(Math.floor(30 + Math.random() * 180));
  controls.frequency.value = fmt(0.2 + Math.random() * 2.2, 2);
  controls.phase.value = fmt(-2 + Math.random() * 4, 2);
  controls.mode.value = Math.random() > 0.5 ? 'wild' : 'stable';
  controls.unpredictability.value = fmt(Math.random(), 2);
  controls.normalize.checked = Math.random() > 0.2;
  controls['range-min'].value = '-1';
  controls['range-max'].value = '1';
  controls['domain-min'].value = String(-Math.floor(40 + Math.random() * 220));
  controls['domain-max'].value = String(Math.floor(40 + Math.random() * 220));
  controls.samples.value = String(randomFrom([128, 256, 512, 1024, 1536, 2048]));

  controls['mod-enable'].checked = Math.random() > 0.45;
  controls['mod-shape'].value = randomFrom(['sine', 'triangle', 'saw', 'square', 'noise']);
  controls['mod-frequency'].value = fmt(0.05 + Math.random() * 0.75, 2);
  controls['mod-phase'].value = fmt(-1.5 + Math.random() * 3, 2);
  controls['mod-phase-depth'].value = fmt(Math.random() * 0.6, 2);
  controls['mod-amp-depth'].value = fmt(-0.45 + Math.random() * 0.9, 2);

  controls['wave-b-gap'].value = String(Math.floor(2 + Math.random() * 14));
  controls.combine.value = randomFrom(['add', 'subtract', 'multiply', 'max', 'min', 'avg']);
  controls.threshold.value = fmt(-0.35 + Math.random() * 0.7, 2);
  controls['grid-mode'].value = Math.random() > 0.5 ? 'wild' : 'stable';
  controls['grid-unpredictability'].value = fmt(Math.random(), 2);
  controls['auto-step-on-uniform'].checked = Math.random() > 0.4;

  controls['time-speed'].value = fmt(0.005 + Math.random() * 0.045, 3);
  controls.step.value = String(Math.floor(4 + Math.random() * 10));
  controls['connect-line'].checked = Math.random() > 0.25;
  controls['show-points'].checked = Math.random() > 0.25;
  if (!controls['connect-line'].checked) controls['show-points'].checked = true;
  controls['show-grid'].checked = Math.random() > 0.2;

  updateUiState();
}

function draw() {
  const state = readState();
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
