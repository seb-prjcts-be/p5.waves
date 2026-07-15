const DISPLAY = 'Anton';
const GROTESK = 'Space Grotesk';
const MONO = 'IBM Plex Mono';

const PALETTE = {
  paper: '#f4efe5',
  ink: '#080808',
  red: '#ff3b2f',
  blue: '#174cff',
  acid: '#d7ff22',
  pink: '#ff4fb3',
  cyan: '#00c7ff'
};

const WAVE_COPY = [
  {
    kicker: 'group: gentle',
    title: 'gentle',
    body: 'Periodic, stable shapes. Good for readable motion.'
  },
  {
    kicker: 'group: harsh',
    title: 'harsh',
    body: 'Noise, random and tan-driven formulas only.'
  },
  {
    kicker: 'group: all',
    title: 'all',
    body: 'The full 34-shape catalogue stays in play.'
  },
  {
    kicker: 'group: array',
    title: 'array',
    body: 'A hand-picked pool for a tighter voice.'
  }
];

const TICKER_ITEMS = [
  'p5.waves',
  'Waves.wave(y, opts)',
  'createSampler()',
  'binary field',
  "group: 'gentle'",
  "group: 'harsh'",
  "group: 'all'",
  'group: [array]',
  'mix',
  'phase',
  'frequency',
  'range',
  'seed',
  'mode: wild',
  'shift: true'
];

const FAMILY_WORDS = [
  'pure sine',
  'layered sine',
  'peak valley',
  'square pulse',
  'saw ramp',
  'noise',
  'modulo',
  'quantized'
];

const ARRAY_GROUP = [
  'classic sine',
  'mountain peaks',
  'triangle sine',
  'smooth solid sine',
  'meta sine'
];

const GROUP_PRESETS = [
  { key: 'gentle', label: 'GENTLE', group: 'gentle', color: PALETTE.blue },
  { key: 'harsh', label: 'HARSH', group: 'harsh', color: PALETTE.red },
  { key: 'all', label: 'ALL', group: 'all', color: PALETTE.acid },
  { key: 'array', label: 'ARRAY', group: ARRAY_GROUP, color: PALETTE.pink }
];

let motionSampler;
let colorSampler;
let pulseSampler;
let typeSampler;
let groupSamplers = [];
let groupGridSamplers = [];
let particles = [];
let waveNames = [];

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent(document.querySelector('main'));
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
  frameRate(60);
  noStroke();

  waveNames = typeof Waves.list === 'function' ? Waves.list() : [];
  createWaveSystem();
  buildParticles();
}

function createWaveSystem() {
  motionSampler = Waves.createSampler({
    group: 'gentle',
    shift: true,
    shiftInterval: 5.5,
    shiftDuration: 1.4,
    range: [-1, 1],
    frequency: 0.82
  });

  colorSampler = Waves.createSampler({
    group: 'all',
    shift: true,
    shiftInterval: 6.5,
    shiftDuration: 2,
    range: [0, 1],
    frequency: 0.58
  });

  pulseSampler = Waves.createSampler({
    group: 'harsh',
    shift: true,
    shiftInterval: 4,
    shiftDuration: 1.3,
    range: [0, 1],
    frequency: 1.1
  });

  typeSampler = Waves.createSampler({
    group: ARRAY_GROUP,
    shift: true,
    shiftInterval: 7,
    shiftDuration: 1.8,
    range: [-1, 1],
    frequency: 0.7
  });

  groupSamplers = GROUP_PRESETS.map((preset, i) => Waves.createSampler({
    group: preset.group,
    shift: true,
    shiftInterval: 3.2 + i * 0.5,
    shiftDuration: 1,
    range: [-1, 1],
    frequency: 0.58 + i * 0.12,
    seed: 301 + i * 41,
    mode: preset.key === 'harsh' ? 'wild' : 'stable',
    unpredictability: preset.key === 'harsh' ? 0.32 : 0
  }));

  // Hand-rolled binary field: per preset, a row-sampler and a col-sampler
  // pulled from the same group. drawGridModule sums them per cell and
  // thresholds. Same logic the old createGrid did, but composed from
  // primitives. Shift mode keeps wave pairs evolving so any single
  // unbalanced pair cycles out automatically.
  groupGridSamplers = GROUP_PRESETS.map((preset, i) => ({
    rowS: Waves.createSampler({
      group: preset.group,
      shift: true,
      shiftInterval: 4 + i * 0.4,
      shiftDuration: 1,
      range: [-1, 1],
      seed: 701 + i * 29
    }),
    colS: Waves.createSampler({
      group: preset.group,
      shift: true,
      shiftInterval: 4.5 + i * 0.5,
      shiftDuration: 1.2,
      range: [-1, 1],
      seed: 702 + i * 29
    }),
    threshold: preset.key === 'harsh' ? 0.12 : 0,
    speed: 0.34 + i * 0.07
  }));
}

function buildParticles() {
  particles = [];
  randomSeed(41);
  const count = constrain(floor((width * height) / 18000), 32, 88);

  for (let i = 0; i < count; i++) {
    particles.push({
      seed: i,
      x: random(width),
      y: random(height),
      word: random(FAMILY_WORDS),
      size: random(9, 14)
    });
  }
}

function draw() {
  const t = millis() / 1000;
  background(PALETTE.paper);

  drawColorBlocks(t);
  drawWaveRibbons(t);
  drawGridModule(t);
  drawParticles(t);
  drawHero(t);
  drawProgramPanels(t);
  drawTicker(t);
  drawStatusPill(t);
  drawCursorPulse(t);
  drawPaperGrain();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  buildParticles();
}

function marginUnit() {
  return constrain(min(width, height) * 0.055, 22, 64);
}

function accentFrom(v) {
  const colors = [PALETTE.red, PALETTE.blue, PALETTE.acid, PALETTE.pink, PALETTE.cyan];
  return colors[constrain(floor(v * colors.length), 0, colors.length - 1)];
}

function activeGroupIndex(t) {
  return floor(t / 5.5) % GROUP_PRESETS.length;
}

function groupCount(preset) {
  if (Array.isArray(preset.group)) return preset.group.length;
  if (preset.key === 'all') return Waves.count || waveNames.length || 35;

  const fromList = waveNames.filter(w => w.character === preset.key).length;
  if (fromList > 0) return fromList;
  return preset.key === 'harsh' ? 7 : 27;
}

function drawColorBlocks(t) {
  const m = marginUnit();
  const blockCount = width < 760 ? 5 : 7;
  const blockH = height / blockCount;

  blendMode(MULTIPLY);
  for (let i = 0; i < blockCount; i++) {
    const v = colorSampler.sample(i * 0.41, t * 0.7);
    const blockW = map(v, 0, 1, width * 0.18, width * 0.72);
    fill(color(accentFrom(v) + '38'));
    rect(width - blockW - m * 0.4, i * blockH + blockH * 0.08, blockW, blockH * 0.72);
  }
  blendMode(BLEND);
}

function drawWaveRibbons(t) {
  const rows = GROUP_PRESETS.length;
  const top = height * 0.15;
  const bottom = height * 0.79;
  const active = activeGroupIndex(t);

  blendMode(MULTIPLY);
  for (let i = 0; i < rows; i++) {
    const preset = GROUP_PRESETS[i];
    const sampler = groupSamplers[i];
    const frac = rows === 1 ? 0 : i / (rows - 1);
    const y = lerp(top, bottom, frac);
    const energy = sampler ? abs(sampler.sample(i * 0.33, t)) : 0.5;
    const band = lerp(18, preset.key === 'harsh' ? 86 : 56, energy);
    const amp = lerp(26, min(width, height) * (preset.key === 'harsh' ? 0.16 : 0.11), frac);
    const alpha = i === active ? 'b8' : '78';
    fill(color(preset.color + alpha));

    beginShape();
    for (let x = -20; x <= width + 20; x += 18) {
      const wave = Waves.wave(x * 0.012 + i * 0.35, {
        group: preset.group,
        shift: true,
        shiftInterval: 3.5 + i * 0.35,
        shiftDuration: 1.1,
        seed: 900 + i * 71,
        t: t * 0.74 + i * 0.4,
        amplitude: amp,
        frequency: 0.62 + frac * 0.3,
        mode: preset.key === 'harsh' ? 'wild' : 'stable',
        unpredictability: preset.key === 'harsh' ? 0.34 : 0
      });
      vertex(x, y + wave);
    }
    for (let x = width + 20; x >= -20; x -= 18) {
      const wave = Waves.wave(x * 0.012 + i * 0.35, {
        group: preset.group,
        shift: true,
        shiftInterval: 3.5 + i * 0.35,
        shiftDuration: 1.1,
        seed: 900 + i * 71,
        t: t * 0.74 + i * 0.4,
        amplitude: amp,
        frequency: 0.62 + frac * 0.3,
        mode: preset.key === 'harsh' ? 'wild' : 'stable',
        unpredictability: preset.key === 'harsh' ? 0.34 : 0
      });
      vertex(x, y + wave + band);
    }
    endShape(CLOSE);
  }
  blendMode(BLEND);
}

function drawGridModule(t) {
  const m = marginUnit();
  const panelW = width < 760 ? width - m * 2 : min(width * 0.34, 380);
  const panelH = width < 760 ? min(height * 0.2, 150) : min(height * 0.31, 230);
  const x = width < 760 ? m : width - panelW - m;
  const y = width < 760 ? height * 0.57 : m * 1.25;
  const active = activeGroupIndex(t);
  const preset = GROUP_PRESETS[active];
  const gs = groupGridSamplers[active];
  const cols = 34;
  const rows = 18;
  const cw = panelW / cols;
  const ch = panelH / rows;
  const offset = t * gs.speed;

  fill(PALETTE.ink);
  rect(x - 8, y - 8, panelW + 16, panelH + 16);
  fill(PALETTE.paper);
  rect(x, y, panelW, panelH);

  noStroke();
  // x-step covers ~one full wave period; t drives the shift cycle so waves
  // evolve over time, keeping the visual balanced even when a static pair
  // would be biased.
  for (let row = 0; row < rows; row++) {
    const rv = gs.rowS.sample(row * 3.5 + offset, t);
    for (let col = 0; col < cols; col++) {
      const cv = gs.colS.sample(col * 1.85 - offset, t);
      const on = (rv + cv) > gs.threshold;
      if (on) {
        const v = colorSampler.sample(col * 0.08 + row * 0.16, t);
        fill(preset.key === 'all' ? accentFrom(v) : preset.color);
      } else {
        fill((row + col) % 2 === 0 ? '#efe7da' : PALETTE.paper);
      }
      rect(x + col * cw, y + row * ch, max(1, cw - 1), max(1, ch - 1));
    }
  }

  textFont(MONO);
  textStyle(NORMAL);
  textAlign(LEFT, TOP);
  textSize(10);
  fill(PALETTE.paper);
  text(`binary field / group: ${preset.key}`, x - 4, y + panelH + 14);
}

function drawParticles(t) {
  textFont(MONO);
  textAlign(CENTER, CENTER);
  textStyle(NORMAL);
  for (const p of particles) {
    const vx = motionSampler.sample(p.seed * 0.31, t) * 22;
    const vy = typeSampler.sample(p.seed * 0.22, t + 2) * 16;
    const a = pulseSampler.sample(p.seed * 0.13, t);
    if (a < 0.34) continue;

    fill(color(PALETTE.ink + hexAlpha(map(a, 0.34, 1, 36, 150))));
    textSize(p.size);
    text(p.word, p.x + vx, p.y + vy);
  }
}

function drawHero(t) {
  const m = marginUnit();
  const heroW = width < 760 ? width - m * 2 : width * 0.62;
  const heroX = m;
  const topY = width < 760 ? m * 2.4 : height * 0.22;
  const labelSize = width < 760 ? 11 : 13;

  textFont(MONO);
  textStyle(NORMAL);
  textAlign(LEFT, TOP);
  textSize(labelSize);
  fill(PALETTE.ink);
  text('P5.JS ADDON LIBRARY / V3.4.0', heroX, m);

  const titleSize = fitSize('p5.waves', heroW, width < 760 ? 98 : 190, 48, DISPLAY);
  drawKineticWord('p5.waves', heroX, topY, titleSize, t);

  const headlineY = topY + titleSize * 0.95;
  textFont(GROTESK);
  textStyle(NORMAL);
  textAlign(LEFT, TOP);
  const headline = 'P5.WAVES AS A CURATION ENGINE';
  const headSize = fitSize(headline, heroW, width < 760 ? 30 : 54, 18, GROTESK);
  textSize(headSize);
  fill(PALETTE.ink);
  text(headline, heroX, headlineY);

  textFont(MONO);
  textSize(width < 760 ? 12 : 14);
  const bodyY = headlineY + headSize * 1.25;
  const bodyW = width < 760 ? heroW : min(heroW, 560);
  drawWrappedText('35 wave shapes. Now pooled as gentle, harsh, all or a curated array.', heroX, bodyY, bodyW, width < 760 ? 17 : 20);

  const samplerY = bodyY + (width < 760 ? 50 : 62);
  drawSamplerStrip(heroX, samplerY, bodyW, t);
}

function drawKineticWord(word, x, y, size, t) {
  textFont(DISPLAY);
  textStyle(NORMAL);
  textSize(size);
  textAlign(LEFT, TOP);

  const jitter = size * 0.055;
  let cursor = x;
  fill(PALETTE.ink);
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    const wobble = typeSampler.sample(i * 0.24, t) * jitter;
    const accent = colorSampler.sample(i * 0.19, t);
    if (i === 3 || i === 5) fill(accentFrom(accent));
    else fill(PALETTE.ink);
    text(ch, cursor, y + wobble);
    cursor += textWidth(ch) * 0.97;
  }
}

function drawSamplerStrip(x, y, w, t) {
  const h = 38;
  const active = activeGroupIndex(t);
  const preset = GROUP_PRESETS[active];
  const sampler = groupSamplers[active] || motionSampler;
  sampler.sample(0.37, t);

  const current = sampler.waveName || 'wave';
  const next = sampler.targetName || current;
  const mix = sampler.shifting ? sampler.mix : pulseSampler.sample(0.2, t);

  fill(PALETTE.ink);
  rect(x, y, w, h);
  fill(preset.color);
  rect(x, y, w * constrain(mix, 0, 1), h);

  textFont(MONO);
  textAlign(LEFT, CENTER);
  textSize(11);
  fill(mix > 0.52 ? PALETTE.ink : PALETTE.paper);
  text(`group ${preset.key} / ${current}`, x + 12, y + h * 0.5);

  textAlign(RIGHT, CENTER);
  fill(PALETTE.paper);
  text(`next ${next}`, x + w - 12, y + h * 0.5);
}

function drawProgramPanels(t) {
  const m = marginUnit();
  const gap = 10;
  const isMobile = width < 760;
  const panelW = isMobile ? (width - m * 2 - gap) / 2 : min(width * 0.18, 225);
  const panelH = isMobile ? 86 : 126;
  const startX = isMobile ? m : width - panelW - m;
  const startY = isMobile ? height - m - panelH * 2 - gap - 46 : height * 0.42;
  const active = activeGroupIndex(t);

  for (let i = 0; i < WAVE_COPY.length; i++) {
    const item = WAVE_COPY[i];
    const preset = GROUP_PRESETS[i];
    const col = isMobile ? i % 2 : 0;
    const row = isMobile ? floor(i / 2) : i;
    const x = startX + col * (panelW + gap);
    const y = startY + row * (panelH + gap);
    const sampler = groupSamplers[i];
    if (sampler) sampler.sample(i * 0.21, t);
    const fillCol = i === active ? preset.color : i % 2 === 0 ? PALETTE.paper : PALETTE.ink;

    stroke(PALETTE.ink);
    strokeWeight(i === active ? 4 : 2);
    fill(fillCol);
    rect(x, y, panelW, panelH, 0);
    noStroke();

    const dark = fillCol === PALETTE.ink || fillCol === PALETTE.blue || fillCol === PALETTE.red;
    fill(dark ? PALETTE.paper : PALETTE.ink);
    textFont(MONO);
    textStyle(NORMAL);
    textAlign(LEFT, TOP);
    textSize(10);
    text(item.kicker.toUpperCase(), x + 12, y + 11);

    textFont(GROTESK);
    const titleSize = fitSize(item.title.toUpperCase(), panelW - 24, isMobile ? 20 : 25, 14, GROTESK);
    textSize(titleSize);
    text(item.title.toUpperCase(), x + 12, y + 30);

    textFont(MONO);
    textSize(isMobile ? 9 : 10);
    drawWrappedText(item.body, x + 12, y + (isMobile ? 54 : 67), panelW - 24, isMobile ? 12 : 14);

    if (!isMobile && sampler) {
      textSize(9);
      textAlign(LEFT, BOTTOM);
      text((sampler.waveName || '').toUpperCase(), x + 12, y + panelH - 10);
    }
  }
}

function drawTicker(t) {
  const h = width < 760 ? 36 : 44;
  const y = height - h;
  const copy = TICKER_ITEMS.join('  /  ') + '  /  ';
  const speed = width < 760 ? 58 : 88;

  fill(PALETTE.ink);
  rect(0, y, width, h);

  textFont(MONO);
  textStyle(NORMAL);
  textAlign(LEFT, CENTER);
  textSize(width < 760 ? 12 : 15);
  fill(PALETTE.paper);

  const tw = textWidth(copy);
  let x = -((t * speed) % tw);
  while (x < width + tw) {
    text(copy, x, y + h * 0.5);
    x += tw;
  }
}

function drawStatusPill(t) {
  const m = marginUnit();
  const x = m;
  const y = height - (width < 760 ? 82 : 94);
  const w = min(width - m * 2, width < 760 ? 360 : 430);
  const h = 36;
  const active = activeGroupIndex(t);
  const preset = GROUP_PRESETS[active];
  const sampler = groupSamplers[active] || motionSampler;
  sampler.sample(0.19, t);
  const label = `${groupCount(preset)} pool / group: ${preset.key} / ${sampler.waveName || 'sampling'}`;

  fill(preset.color);
  rect(x, y, w, h);
  fill(PALETTE.ink);
  textFont(MONO);
  textSize(11);
  textAlign(LEFT, CENTER);
  text(label.toUpperCase(), x + 12, y + h * 0.5);

  const n = constrain(floor(pulseSampler.sample(0.4, t) * 9), 1, 8);
  for (let i = 0; i < n; i++) {
    fill(i % 2 === 0 ? PALETTE.ink : PALETTE.paper);
    rect(x + w - 16 - i * 13, y + 10, 8, 16);
  }
}

function drawCursorPulse(t) {
  if (!mouseIsPressed && (mouseX <= 0 || mouseY <= 0 || mouseX >= width || mouseY >= height)) return;

  const ring = map(Math.max(0, pulseSampler.sample(0.9, t)), 0, 1, 18, 80);
  noFill();
  stroke(PALETTE.ink);
  strokeWeight(2);
  circle(mouseX, mouseY, ring);
  stroke(PALETTE.red);
  circle(mouseX, mouseY, ring * 0.55);
  noStroke();
}

function drawPaperGrain() {
  randomSeed(3);
  stroke(PALETTE.ink + '17');
  strokeWeight(1);
  const amount = constrain(floor((width * height) / 5500), 70, 260);
  for (let i = 0; i < amount; i++) {
    point(random(width), random(height));
  }
  noStroke();
}

function drawWrappedText(str, x, y, maxW, leading) {
  const words = str.split(' ');
  let line = '';
  let cy = y;

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (textWidth(test) > maxW && line) {
      text(line, x, cy);
      line = word;
      cy += leading;
    } else {
      line = test;
    }
  }

  if (line) text(line, x, cy);
}

function fitSize(str, maxW, maxSize, minSize, fontName) {
  textFont(fontName);
  let s = maxSize;
  textSize(s);
  while (s > minSize && textWidth(str) > maxW) {
    s -= 2;
    textSize(s);
  }
  return s;
}

function hexAlpha(alpha) {
  const n = constrain(round(alpha), 0, 255);
  return n.toString(16).padStart(2, '0');
}
