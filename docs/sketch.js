/* ============================================================
   p5.waves Ultimate Showcase – sketch.js  (B&W edition)
   - IntersectionObserver: pauses off-screen sketches
   - frameRate caps to reduce idle CPU usage
   - Terrain GRID=35, 4 real B&W color modes
   ============================================================ */

// ── WAVE NAMES ──────────────────────────────────────────────
const WAVE_NAMES = [
  'classic sine', 'sine', 'sharp peaks', 'square', 'pulse',
  'stepped sine', 'mountain peaks', 'valleys', 'zig-zag sine',
  'batman', 'offset sine', 'steps down', 'steps', 'squared sine',
  'bumpy sine', 'wobble sine', 'up down noise', 'meta sine',
  'triangle', 'ramp', 'saw down', 'saw up', 'fade out',
  'grow random', 'noise', 'fuzzy pulse', 'up down pulse',
  'bald patch', 'fuzzy peak sine', 'ramp up sine', 'triangle sine',
  'round linked sine', 'half sine', 'smooth solid sine'
];

// Populate wave select on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  const sel = document.getElementById('ctrl-wave');
  if (!sel) return;
  for (let i = 0; i < WAVE_NAMES.length; i++) {
    const opt = document.createElement('option');
    opt.value = WAVE_NAMES[i];
    opt.textContent = i + '. ' + WAVE_NAMES[i];
    if (WAVE_NAMES[i] === 'classic sine') opt.selected = true;
    sel.appendChild(opt);
  }
});

// ── PERFORMANCE: IntersectionObserver ───────────────────────
// Pauses p5 draw loops for sketches not visible in the viewport,
// significantly reducing CPU when user scrolls away.
const _inst = {};
const _observer = new IntersectionObserver(function(entries) {
  for (let i = 0; i < entries.length; i++) {
    const s = _inst[entries[i].target.id];
    if (!s) continue;
    entries[i].isIntersecting ? s.loop() : s.noLoop();
  }
}, { rootMargin: '100px 0px', threshold: 0 });

function reg(id, sketch) {
  _inst[id] = sketch;
  const el = document.getElementById(id);
  if (el) _observer.observe(el);
  return sketch;
}


// ═════════════════════════════════════════════════════════════
// 1. HERO – Multi-wave layered background (B&W)
// ═════════════════════════════════════════════════════════════
reg('hero-canvas', new p5(function(p) {
  const LAYERS = [
    { wave: 'classic sine',   gray: 30,  amp: 90,  freq: 0.008, speed: 0.008, weight: 2.0 },
    { wave: 'mountain peaks', gray: 80,  amp: 70,  freq: 0.010, speed: 0.012, weight: 1.5 },
    { wave: 'triangle',       gray: 120, amp: 55,  freq: 0.015, speed: 0.006, weight: 1.2 },
    { wave: 'bumpy sine',     gray: 50,  amp: 45,  freq: 0.012, speed: 0.015, weight: 1.0 },
    { wave: 'wobble sine',    gray: 160, amp: 35,  freq: 0.018, speed: 0.010, weight: 0.8 },
    { wave: 'stepped sine',   gray: 20,  amp: 60,  freq: 0.007, speed: 0.005, weight: 1.8 },
    { wave: 'batman',         gray: 100, amp: 40,  freq: 0.020, speed: 0.018, weight: 0.8 },
    { wave: 'valleys',        gray: 70,  amp: 50,  freq: 0.009, speed: 0.009, weight: 1.2 },
  ];
  let samplers = [], particles = [];

  p.setup = function() {
    p.createCanvas(p.windowWidth, p.windowHeight).parent('hero-canvas');
    p.colorMode(p.RGB, 255, 255, 255, 255);
    p.frameRate(30);
    samplers = [];
    for (let i = 0; i < LAYERS.length; i++) {
      samplers.push(Waves.createSampler({ wave: LAYERS[i].wave, amplitude: LAYERS[i].amp, frequency: LAYERS[i].freq }));
    }
    for (let i = 0; i < 50; i++) {
      particles.push({ x: p.random(p.width), li: Math.floor(p.random(LAYERS.length)), size: p.random(2, 4), alpha: p.random(60, 160) });
    }
  };

  p.draw = function() {
    p.background(245, 245, 245, 35);
    const t = p.frameCount * 0.01;
    const waveY = p.height * 0.82;
    for (let i = 0; i < LAYERS.length; i++) {
      const l = LAYERS[i];
      if (i % 2 === 0) {
        p.noStroke(); p.fill(l.gray, l.gray, l.gray, 8);
        p.beginShape();
        p.vertex(0, p.height);
        for (let x = 0; x <= p.width; x += 7) p.vertex(x, waveY + samplers[i].sample(x * 0.4, t * l.speed * 100));
        p.vertex(p.width, p.height);
        p.endShape(p.CLOSE);
      }
      const alpha = 140 + Math.sin(t * 1.5 + i) * 40;
      p.stroke(l.gray, l.gray, l.gray, 18); p.strokeWeight(l.weight * 5); p.noFill();
      p.beginShape();
      for (let x = 0; x <= p.width; x += 8) p.vertex(x, waveY + samplers[i].sample(x * 0.4, t * l.speed * 100));
      p.endShape();
      p.stroke(l.gray, l.gray, l.gray, alpha); p.strokeWeight(l.weight); p.noFill();
      p.beginShape();
      for (let x = 0; x <= p.width; x += 3) p.vertex(x, waveY + samplers[i].sample(x * 0.4, t * l.speed * 100));
      p.endShape();
    }
    for (let i = 0; i < particles.length; i++) {
      const pt = particles[i];
      const l = LAYERS[pt.li];
      const y = waveY + samplers[pt.li].sample(pt.x * 0.4, t * l.speed * 100);
      pt.x += 0.7 + pt.li * 0.15;
      if (pt.x > p.width + 10) pt.x = -10;
      p.noStroke(); p.fill(l.gray, l.gray, l.gray, pt.alpha);
      p.ellipse(pt.x, y, pt.size, pt.size);
    }
  };

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    for (let i = 0; i < particles.length; i++) {
      particles[i].x = p.random(p.width);
    }
  };
}, 'hero-canvas'));


// ═════════════════════════════════════════════════════════════
// 2. GALLERY – All 34 waves (B&W, 30 fps)
// ═════════════════════════════════════════════════════════════
reg('gallery-canvas', new p5(function(p) {
  const COLS = 6;
  const ROWS = Math.ceil(WAVE_NAMES.length / COLS);
  let cellW, cellH = 90;
  let samplers = [], hovered = -1;

  p.setup = function() {
    const container = document.getElementById('gallery-canvas');
    const w = container.offsetWidth || 1200;
    cellW = Math.floor(w / COLS);
    p.createCanvas(cellW * COLS, cellH * ROWS).parent('gallery-canvas');
    p.textFont('Consolas, monospace');
    p.frameRate(30);
    samplers = [];
    for (let i = 0; i < WAVE_NAMES.length; i++) {
      samplers.push(Waves.createSampler({ wave: WAVE_NAMES[i], amplitude: cellH * 0.28, frequency: 1 }));
    }
  };

  p.draw = function() {
    p.background(248);
    const t = p.frameCount * 0.01;
    const limit = cellH * 0.45;
    for (let i = 0; i < WAVE_NAMES.length; i++) {
      const col = i % COLS, row = Math.floor(i / COLS);
      const ox = col * cellW, oy = row * cellH;
      const isHov = i === hovered;

      p.noStroke(); p.fill(isHov ? 235 : 248);
      p.rect(ox + 1, oy + 1, cellW - 2, cellH - 2);

      p.stroke(isHov ? 0 : 60); p.strokeWeight(isHov ? 2 : 1.2); p.noFill();
      p.beginShape();
      for (let x = 6; x <= cellW - 6; x += 2) {
        const raw = samplers[i].sample(x * 0.5, t);
        p.vertex(ox + x, oy + cellH * 0.5 + Math.tanh(raw / limit) * limit);
      }
      p.endShape();

      p.noStroke(); p.fill(isHov ? 0 : 100);
      p.rect(ox + 6, oy + 6, 20, 14);
      p.fill(248); p.textSize(9); p.textAlign(p.CENTER, p.CENTER);
      p.text(i, ox + 16, oy + 13);

      p.fill(isHov ? 0 : 120); p.textSize(9); p.textAlign(p.LEFT, p.BOTTOM);
      p.text(WAVE_NAMES[i], ox + 8, oy + cellH - 7);

      p.stroke(215); p.strokeWeight(1);
      if (col < COLS - 1) p.line(ox + cellW, oy, ox + cellW, oy + cellH);
      if (row < ROWS - 1) p.line(ox, oy + cellH, ox + cellW, oy + cellH);
    }
  };

  p.mouseMoved = function() {
    const idx = Math.floor(p.mouseY / cellH) * COLS + Math.floor(p.mouseX / cellW);
    hovered = (idx >= 0 && idx < WAVE_NAMES.length) ? idx : -1;
  };

  p.mouseExited = function() { hovered = -1; };

  p.windowResized = function() {
    const container = document.getElementById('gallery-canvas');
    cellW = Math.floor((container.offsetWidth || 1200) / COLS);
    p.resizeCanvas(cellW * COLS, cellH * ROWS);
  };
}, 'gallery-canvas'));


// ═════════════════════════════════════════════════════════════
// 3. INTERACTIVE – Live wave lab
// ═════════════════════════════════════════════════════════════
reg('interactive-canvas', new p5(function(p) {
  let params = { wave: 'classic sine', amplitude: 80, frequency: 0.02, speed: 0.01, phase: 0, lines: 5, fill: false, dots: false };
  const GRAYS = [0, 40, 80, 120, 160, 30, 70, 110, 20, 50, 90, 140];
  let sampler;

  function readControls() {
    params.wave      = document.getElementById('ctrl-wave').value;
    params.amplitude = +document.getElementById('ctrl-amplitude').value;
    params.frequency = +document.getElementById('ctrl-frequency').value / 1000;
    params.speed     = +document.getElementById('ctrl-speed').value / 1000;
    params.phase     = +document.getElementById('ctrl-phase').value / 100;
    params.lines     = +document.getElementById('ctrl-lines').value;
    params.fill      = document.getElementById('ctrl-fill').checked;
    params.dots      = document.getElementById('ctrl-dots').checked;

    document.getElementById('val-amplitude').textContent = params.amplitude;
    document.getElementById('val-frequency').textContent = params.frequency.toFixed(3);
    document.getElementById('val-speed').textContent     = params.speed.toFixed(3);
    document.getElementById('val-phase').textContent     = params.phase.toFixed(2);
    document.getElementById('val-lines').textContent     = params.lines;
    updateCode();
    sampler = Waves.createSampler({ wave: params.wave, amplitude: params.amplitude, frequency: params.frequency, phase: params.phase });
  }

  function updateCode() {
    document.getElementById('code-text').textContent =
`const s = Waves.createSampler({
  wave: '${params.wave}',
  amplitude: ${params.amplitude},
  frequency: ${params.frequency.toFixed(3)},
  phase: ${params.phase.toFixed(2)}
});
s.sample(x, t * ${params.speed.toFixed(3)})`;
  }

  p.setup = function() {
    const container = document.getElementById('interactive-canvas');
    const w = container.offsetWidth || 800;
    p.createCanvas(w, Math.round(w * 3 / 4)).parent('interactive-canvas');
    sampler = Waves.createSampler({ wave: params.wave, amplitude: params.amplitude, frequency: params.frequency, phase: params.phase });
    updateCode();

    const ids = ['ctrl-wave','ctrl-amplitude','ctrl-frequency','ctrl-speed','ctrl-phase','ctrl-lines','ctrl-fill','ctrl-dots'];
    for (let i = 0; i < ids.length; i++) {
      const el = document.getElementById(ids[i]);
      if (el) { el.addEventListener('input', readControls); el.addEventListener('change', readControls); }
    }
  };

  p.draw = function() {
    p.background(248);
    const t = p.frameCount * params.speed * 100;

    p.stroke(220); p.strokeWeight(1);
    p.line(0, p.height / 2, p.width, p.height / 2);

    for (let li = 0; li < params.lines; li++) {
      const g = GRAYS[li % GRAYS.length];
      const offsetY = (li - (params.lines - 1) / 2) * (p.height / (params.lines + 3));

      if (params.fill) {
        p.noStroke(); p.fill(g, g, g, 18);
        p.beginShape();
        p.vertex(0, p.height / 2 + offsetY);
        for (let x = 0; x <= p.width; x += 4) p.vertex(x, p.height / 2 + offsetY + sampler.sample(x, t + li * 20));
        p.vertex(p.width, p.height / 2 + offsetY);
        p.endShape(p.CLOSE);
      }

      p.stroke(g, g, g, 200 - li * 8); p.strokeWeight(1.8); p.noFill();
      p.beginShape();
      for (let x = 0; x <= p.width; x += 3) p.vertex(x, p.height / 2 + offsetY + sampler.sample(x, t + li * 20));
      p.endShape();

      if (params.dots) {
        p.noStroke(); p.fill(g, g, g, 200);
        for (let x = 10; x <= p.width - 10; x += 18) p.ellipse(x, p.height / 2 + offsetY + sampler.sample(x, t + li * 20), 4, 4);
      }
    }

    p.noStroke(); p.fill(180); p.textSize(10); p.textFont('Consolas, monospace');
    p.textAlign(p.LEFT, p.TOP);
    p.text('wave: "' + params.wave + '"  ·  ' + p.frameRate().toFixed(0) + ' fps', 10, 10);
  };

  p.windowResized = function() {
    const container = document.getElementById('interactive-canvas');
    const w = container.offsetWidth || 800;
    p.resizeCanvas(w, Math.round(w * 3 / 4));
  };
}, 'interactive-canvas'));


// ═════════════════════════════════════════════════════════════
// 4a. GRID – Binary threshold (B&W cells)
// ═════════════════════════════════════════════════════════════
reg('grid-binary-canvas', new p5(function(p) {
  const COLS = 24, ROWS = 18;
  let grid, currentRowWave = 'smooth solid sine', currentColWave = 'ramp up sine';
  let currentSpeed = 1, currentThreshold = 0;

  function buildGrid() {
    grid = Waves.createGrid(COLS, ROWS, { waveRow: currentRowWave, waveCol: currentColWave, threshold: currentThreshold, speed: currentSpeed });
  }

  function updateCode() {
    const el = document.getElementById('grid-binary-code');
    if (el) el.textContent =
`const g = Waves.createGrid(cols, rows, {
  waveRow:   '${currentRowWave}',
  waveCol:   '${currentColWave}',
  threshold: ${currentThreshold.toFixed(2)},
  speed:     ${currentSpeed.toFixed(2)}
});
const cells = g.sample(t); // Uint8Array`;
  }

  p.setup = function() {
    const container = document.getElementById('grid-binary-canvas');
    const w = container.offsetWidth || 500;
    p.createCanvas(w, Math.round(w * ROWS / COLS)).parent('grid-binary-canvas');
    buildGrid();
    updateCode();
    p.noStroke();

    function sync() {
      currentRowWave   = document.getElementById('grid-row-wave').value;
      currentColWave   = document.getElementById('grid-col-wave').value;
      currentSpeed     = document.getElementById('grid-speed').value / 30;
      currentThreshold = document.getElementById('grid-threshold').value / 100;
      buildGrid();
      updateCode();
      p.loop();
    }
    const ids = ['grid-row-wave','grid-col-wave','grid-speed','grid-threshold'];
    for (let i = 0; i < ids.length; i++) {
      const el = document.getElementById(ids[i]);
      if (el) { el.addEventListener('change', sync); el.addEventListener('input', sync); }
    }
  };

  p.draw = function() {
    p.background(245);
    const t = p.frameCount * 0.004;
    const cells = grid.sample(t);
    const cw = p.width / COLS, ch = p.height / ROWS;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const on = cells[r * COLS + c] === 1;
        const pulse = on ? 0.88 + Math.sin(p.frameCount * 0.05 + r * 0.3 + c * 0.22) * 0.12 : 1;
        p.fill(on ? Math.round(20 * pulse) : 238);
        p.rect(c * cw + 2, r * ch + 2, cw - 4, ch - 4);
      }
    }
  };

  p.windowResized = function() {
    const container = document.getElementById('grid-binary-canvas');
    const w = container.offsetWidth || 500;
    p.resizeCanvas(w, Math.round(w * ROWS / COLS));
    buildGrid();
  };
}, 'grid-binary-canvas'));


// ═════════════════════════════════════════════════════════════
// 4b. GRID – Continuous Float32 (grayscale)
// ═════════════════════════════════════════════════════════════
reg('grid-float-canvas', new p5(function(p) {
  const COLS = 24, ROWS = 18;
  let grid, seedA = 0, speed = 0.02, style = 'rect';

  function buildGrid() {
    grid = Waves.createGrid(COLS, ROWS, { seed: seedA, range: [0, 1], speed: speed * 5 });
  }

  function updateCode() {
    const el = document.getElementById('grid-float-code');
    if (el) el.textContent =
`const g = Waves.createGrid(cols, rows, {
  seed:  ${seedA},
  range: [0, 1],
  speed: ${(speed * 5).toFixed(3)}
});
const cells = g.sample(t); // Float32Array`;
  }

  p.setup = function() {
    const container = document.getElementById('grid-float-canvas');
    const w = container.offsetWidth || 500;
    p.createCanvas(w, Math.round(w * ROWS / COLS)).parent('grid-float-canvas');
    buildGrid();
    updateCode();

    function syncFloat() {
      seedA = +document.getElementById('grid-seed-a').value;
      speed = document.getElementById('grid-float-speed').value / 1000;
      style = document.getElementById('grid-style').value;
      buildGrid();
      updateCode();
    }
    const ids = ['grid-seed-a','grid-float-speed','grid-style'];
    for (let i = 0; i < ids.length; i++) {
      const el = document.getElementById(ids[i]);
      if (el) { el.addEventListener('input', syncFloat); el.addEventListener('change', syncFloat); }
    }
  };

  p.draw = function() {
    p.background(245);
    const t = p.frameCount * speed * 5;
    const cells = grid.sample(t);
    const cw = p.width / COLS, ch = p.height / ROWS;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const v = cells[r * COLS + c];
        const g = Math.round(p.lerp(230, 15, v));
        p.noStroke(); p.fill(g);
        if (style === 'rect') {
          const s = v * (Math.min(cw, ch) - 2);
          p.rect(c * cw + (cw - s) / 2, r * ch + (ch - s) / 2, s, s);
        } else if (style === 'circle') {
          p.ellipse(c * cw + cw / 2, r * ch + ch / 2, v * Math.min(cw, ch) * 0.88);
        } else {
          const bh = v * ch;
          p.rect(c * cw + 1, r * ch + ch - bh, cw - 2, bh);
        }
      }
    }
  };

  p.windowResized = function() {
    const container = document.getElementById('grid-float-canvas');
    const w = container.offsetWidth || 500;
    p.resizeCanvas(w, Math.round(w * ROWS / COLS));
  };
}, 'grid-float-canvas'));


// ═════════════════════════════════════════════════════════════
// 5. WILD MODE (stable=black → wild=light gray)
// ═════════════════════════════════════════════════════════════
reg('wild-canvas', new p5(function(p) {
  const NUM_LINES = 8;
  let wave = 'classic sine', speed = 0.008, amplitude = 100, frequency = 0.010, wildnessMax = 0.95;

  function updateWildCode() {
    const el = document.getElementById('wild-code');
    if (!el) return;
    el.textContent =
`for (let i = 0; i < ${NUM_LINES}; i++) {
  const u = (i / ${NUM_LINES - 1}) * ${wildnessMax.toFixed(2)};
  const y = Waves.wave(x, {
    wave: '${wave}',
    t: frameCount * ${speed.toFixed(3)} * 100,
    amplitude: ${amplitude},
    frequency: ${frequency.toFixed(3)},
    mode: u === 0 ? 'stable' : 'wild',
    unpredictability: u
  });
}`;
  }

  function bindSlider(id, handler) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input',  handler);
      el.addEventListener('change', handler);
    }
  }

  p.setup = function() {
    const container = document.getElementById('wild-canvas');
    p.createCanvas(container.offsetWidth || 1100, 360).parent('wild-canvas');
    p.textFont('Consolas, monospace');

    const waveEl = document.getElementById('wild-wave');
    if (waveEl) waveEl.addEventListener('change', function(e) { wave = e.target.value; updateWildCode(); });
    bindSlider('wild-speed',     function(e) { speed       = e.target.value / 1000; updateWildCode(); });
    bindSlider('wild-amplitude', function(e) { amplitude   = +e.target.value;       updateWildCode(); });
    bindSlider('wild-frequency', function(e) { frequency   = e.target.value / 1000; updateWildCode(); });
    bindSlider('wild-wildness',  function(e) { wildnessMax = e.target.value / 100;  updateWildCode(); });

    updateWildCode();
  };

  p.draw = function() {
    p.background(245, 245, 245, 35);
    const t = p.frameCount * speed * 100;

    p.noStroke(); p.fill(160); p.textSize(9);
    p.textAlign(p.LEFT,  p.TOP); p.text('stable  (0.0)', 10, 12);
    p.textAlign(p.RIGHT, p.TOP); p.text('wild  (' + wildnessMax.toFixed(2) + ')', p.width - 10, 12);

    for (let li = 0; li < NUM_LINES; li++) {
      const unpred = (li / (NUM_LINES - 1)) * wildnessMax;
      const g     = Math.round(p.lerp(0, 170, li / (NUM_LINES - 1)));
      const alpha = Math.round(p.lerp(220, 130, li / (NUM_LINES - 1)));

      p.stroke(g, g, g, alpha); p.strokeWeight(1.6); p.noFill();
      p.beginShape();
      for (let x = 0; x <= p.width; x += 3) {
        p.vertex(x, p.height * 0.5 + Waves.wave(x * 0.4, {
          wave, t: t + li * 5, amplitude, frequency,
          mode: unpred === 0 ? 'stable' : 'wild', unpredictability: unpred
        }));
      }
      p.endShape();
    }

    // Scale bar – 20 blocks instead of pixel-by-pixel
    p.noStroke();
    const steps = 20;
    const bw = p.width / steps;
    for (let sx = 0; sx < steps; sx++) {
      const g = Math.round((sx / (steps - 1)) * 170);
      p.fill(g, g, g, 180);
      p.rect(sx * bw, p.height - 12, bw + 1, 6);
    }
    p.fill(140); p.textSize(9);
    p.textAlign(p.LEFT,   p.BOTTOM); p.text('0.0', 4, p.height - 15);
    p.textAlign(p.RIGHT,  p.BOTTOM); p.text('1.0', p.width - 4, p.height - 15);
    p.textAlign(p.CENTER, p.BOTTOM); p.text('unpredictability', p.width / 2, p.height - 15);
  };

  p.windowResized = function() {
    const container = document.getElementById('wild-canvas');
    p.resizeCanvas(container.offsetWidth || 1100, 360);
  };
}, 'wild-canvas'));


// ═════════════════════════════════════════════════════════════
// 6. 3D TERRAIN – WEBGL, GRID=35, 4 real B&W color modes
// ═════════════════════════════════════════════════════════════
reg('terrain-canvas', new p5(function(p) {
  const GRID = 35;
  let terrainH = 100, terrainSpeed = 0.023;
  let waveX = 'grow random', waveZ = 'bumpy sine';
  let colorMode = 'height', wireframe = true, solid = false;
  let samplerX, samplerZ;

  function buildSamplers() {
    samplerX = Waves.createSampler({ wave: waveX, seed: 0, amplitude: terrainH, frequency: 1 });
    samplerZ = Waves.createSampler({ wave: waveZ, seed: 1, amplitude: terrainH, frequency: 1 });
  }

  function updateTerrainCode() {
    const el = document.getElementById('terrain-code');
    if (!el) return;
    el.textContent =
`const sx = Waves.createSampler({ wave: '${waveX}', seed: 0, amplitude: ${terrainH}, frequency: 1 });
const sz = Waves.createSampler({ wave: '${waveZ}', seed: 1, amplitude: ${terrainH}, frequency: 1 });
const t = frameCount * ${terrainSpeed.toFixed(3)};
// display: '${colorMode}', wireframe: ${wireframe}, solid: ${solid}`;
  }

  function grayFor(v, gx, gz) {
    const n = p.constrain((v + terrainH * 2) / (terrainH * 4), 0, 1);
    switch (colorMode) {
      case 'height':  return Math.round(p.lerp(210, 20,  n));
      case 'inverse': return Math.round(p.lerp(20,  210, n));
      case 'contour': {
        const band = 0.5 + 0.5 * Math.sin(n * Math.PI * 10);
        return Math.round(p.lerp(200, 20, band));
      }
      case 'fog': {
        const depth = gz / GRID;
        const base  = Math.round(p.lerp(210, 20, n));
        return Math.round(p.lerp(base, 210, depth * 0.65));
      }
      default: return Math.round(p.lerp(210, 20, n));
    }
  }

  function bind(id, fn) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input',  function() { fn(); updateTerrainCode(); p.loop(); });
      el.addEventListener('change', function() { fn(); updateTerrainCode(); p.loop(); });
    }
  }

  p.setup = function() {
    const container = document.getElementById('terrain-canvas');
    const cnv = p.createCanvas(container.offsetWidth || 800, 480, p.WEBGL);
    cnv.parent('terrain-canvas');
    p.frameRate(30);
    buildSamplers();
    updateTerrainCode();

    bind('terrain-wave-x', function() { waveX = document.getElementById('terrain-wave-x').value; buildSamplers(); });
    bind('terrain-wave-z', function() { waveZ = document.getElementById('terrain-wave-z').value; buildSamplers(); });
    bind('terrain-height', function() {
      terrainH = +document.getElementById('terrain-height').value;
      document.getElementById('val-height').textContent = terrainH;
      buildSamplers();
    });
    bind('terrain-speed', function() {
      terrainSpeed = document.getElementById('terrain-speed').value / 1000;
      document.getElementById('val-terrain-speed').textContent = terrainSpeed.toFixed(3);
    });
    bind('terrain-color', function() { colorMode = document.getElementById('terrain-color').value; });
    bind('terrain-wireframe', function() {
      wireframe = document.getElementById('terrain-wireframe').checked;
      if (!wireframe && !solid) { solid = true; document.getElementById('terrain-solid').checked = true; }
    });
    bind('terrain-solid', function() {
      solid = document.getElementById('terrain-solid').checked;
      if (!wireframe && !solid) { wireframe = true; document.getElementById('terrain-wireframe').checked = true; }
    });
  };

  p.draw = function() {
    p.background(245);
    const t    = p.frameCount * terrainSpeed;
    const size = Math.min(p.width, p.height) * 0.85;
    const step = size / GRID;

    p.rotateX(-0.55); p.rotateY(0.35);
    p.translate(-size / 2, 0, -size / 2);

    const H = [];
    for (let z = 0; z <= GRID; z++) {
      H[z] = [];
      for (let x = 0; x <= GRID; x++) {
        H[z][x] = samplerX.sample(x * step * 0.3, t) + samplerZ.sample(z * step * 0.3, t * 1.3);
      }
    }

    for (let gz = 0; gz < GRID; gz++) {
      for (let gx = 0; gx < GRID; gx++) {
        const x0 = gx * step, x1 = (gx + 1) * step;
        const z0 = gz * step, z1 = (gz + 1) * step;
        const h00 = H[gz][gx], h10 = H[gz][gx+1], h01 = H[gz+1][gx], h11 = H[gz+1][gx+1];
        const avgH = (h00 + h10 + h01 + h11) / 4;
        const g = grayFor(avgH, gx, gz);

        if (solid) {
          p.stroke(Math.round(g * 0.55)); p.strokeWeight(0.3);
          p.fill(g);
          p.beginShape(p.TRIANGLES);
          p.vertex(x0, -h00, z0); p.vertex(x1, -h10, z0); p.vertex(x0, -h01, z1);
          p.vertex(x1, -h10, z0); p.vertex(x1, -h11, z1); p.vertex(x0, -h01, z1);
          p.endShape();
        }

        if (wireframe) {
          p.stroke(g, g, g, solid ? 90 : 210); p.strokeWeight(solid ? 0.3 : 0.8); p.noFill();
          p.beginShape(p.LINES);
          p.vertex(x0, -h00, z0); p.vertex(x1, -h10, z0);
          p.vertex(x1, -h10, z0); p.vertex(x1, -h11, z1);
          p.vertex(x1, -h11, z1); p.vertex(x0, -h01, z1);
          p.vertex(x0, -h01, z1); p.vertex(x0, -h00, z0);
          p.endShape();
        }
      }
    }

    p.resetMatrix();
    p.noStroke(); p.fill(160); p.textSize(10);
    p.textAlign(p.LEFT, p.TOP);
    p.text('X: ' + waveX + '  ·  Z: ' + waveZ + '  ·  display: ' + colorMode, -p.width/2 + 10, -p.height/2 + 10);
  };

  p.windowResized = function() {
    const container = document.getElementById('terrain-canvas');
    p.resizeCanvas(container.offsetWidth || 800, 480);
  };
}, 'terrain-canvas'));
