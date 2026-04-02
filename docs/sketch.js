/* ============================================================
   p5.waves Ultimate Showcase – sketch.js  (B&W edition)
   - IntersectionObserver: pauses off-screen sketches
   - frameRate caps to reduce idle CPU usage
   - Terrain TERRAIN_N=35, 4 real B&W color modes
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
// 0. BACKGROUND – Subtle full-page wave silhouettes (fixed)
// ═════════════════════════════════════════════════════════════
reg('bg-canvas', new p5(function(p) {
  var layers = [];
  var bgT = 0;

  p.setup = function() {
    p.createCanvas(p.windowWidth, p.windowHeight).parent('bg-canvas');
    p.frameRate(20);
    for (var i = 0; i < 4; i++) {
      layers.push(Waves.createSampler({
        shift: true,
        shiftInterval: 8 + i * 3,
        shiftDuration: 3,
        seed: 50 + i,
        range: [-40 + i * 5, 40 - i * 5],
        frequency: 0.004 + i * 0.002,
        phase: i * 1.5
      }));
    }
  };

  p.draw = function() {
    p.clear();
    bgT += 0.005;
    for (var i = 0; i < layers.length; i++) {
      var baseY = p.height * (0.2 + i * 0.2);
      p.noStroke();
      p.fill(210 + i * 8, 10 + i * 2);
      p.beginShape();
      p.vertex(0, p.height);
      for (var x = 0; x <= p.width; x += 8) {
        p.vertex(x, baseY + layers[i].sample(x * 0.3, bgT + i * 0.5));
      }
      p.vertex(p.width, p.height);
      p.endShape(p.CLOSE);
    }
  };

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
}, 'bg-canvas'));


// ═════════════════════════════════════════════════════════════
// 1. HERO – Cascading landscape + wave lines with shift (B&W)
// ═════════════════════════════════════════════════════════════
reg('hero-canvas', new p5(function(p) {
  // Background landscape — soft filled silhouettes
  var BG = [
    { yPct: 0.60, range: [-45, 45], freq: 0.006, phase: 0,   gray: 225, fillAlpha: 18, seed: 10 },
    { yPct: 0.70, range: [-40, 40], freq: 0.009, phase: 1.4, gray: 205, fillAlpha: 22, seed: 11 },
    { yPct: 0.80, range: [-35, 35], freq: 0.012, phase: 2.8, gray: 180, fillAlpha: 28, seed: 12 },
    { yPct: 0.90, range: [-25, 25], freq: 0.016, phase: 0.6, gray: 150, fillAlpha: 40, seed: 13 }
  ];
  // Foreground wave lines — visible, characterful, shifting fast
  var FG = [
    { yPct: 0.62, range: [-55, 55], freq: 0.007, phase: 0.3, gray: 60,  lineAlpha: 35, weight: 1.5, seed: 20 },
    { yPct: 0.70, range: [-50, 50], freq: 0.010, phase: 1.8, gray: 40,  lineAlpha: 50, weight: 1.8, seed: 21, wild: true, unpr: 0.15 },
    { yPct: 0.78, range: [-45, 45], freq: 0.013, phase: 3.2, gray: 30,  lineAlpha: 65, weight: 2.0, seed: 22 },
    { yPct: 0.86, range: [-40, 40], freq: 0.015, phase: 0.9, gray: 20,  lineAlpha: 80, weight: 2.2, seed: 23, wild: true, unpr: 0.2 },
    { yPct: 0.93, range: [-30, 30], freq: 0.018, phase: 2.1, gray: 0,   lineAlpha: 100, weight: 2.5, seed: 24, wild: true, unpr: 0.3 }
  ];
  var bgSamplers = [], fgSamplers = [];
  var heroT = 0;

  p.setup = function() {
    p.createCanvas(p.windowWidth, p.windowHeight).parent('hero-canvas');
    p.frameRate(30);
    bgSamplers = [];
    fgSamplers = [];
    for (var i = 0; i < BG.length; i++) {
      var b = BG[i];
      bgSamplers.push(Waves.createSampler({
        shift: true, shiftInterval: 4 + i, shiftDuration: 1.5,
        seed: b.seed, range: b.range, frequency: b.freq, phase: b.phase
      }));
    }
    for (var i = 0; i < FG.length; i++) {
      var f = FG[i];
      fgSamplers.push(Waves.createSampler({
        shift: true, shiftInterval: 3 + i, shiftDuration: 1.2,
        seed: f.seed, range: f.range, frequency: f.freq, phase: f.phase,
        mode: f.wild ? 'wild' : 'stable',
        unpredictability: f.unpr || 0
      }));
    }
  };

  p.draw = function() {
    p.background(245);
    heroT += 0.018;

    // Background silhouettes
    for (var i = 0; i < BG.length; i++) {
      var b = BG[i];
      var baseY = p.height * b.yPct;
      p.noStroke();
      p.fill(b.gray, b.fillAlpha);
      p.beginShape();
      p.vertex(0, p.height);
      for (var x = 0; x <= p.width; x += 6) {
        p.vertex(x, baseY + bgSamplers[i].sample(x * 0.4, heroT));
      }
      p.vertex(p.width, p.height);
      p.endShape(p.CLOSE);
    }

    // Foreground wave lines
    for (var i = 0; i < FG.length; i++) {
      var f = FG[i];
      var baseY = p.height * f.yPct;
      p.noFill();
      p.stroke(f.gray, f.lineAlpha);
      p.strokeWeight(f.weight);
      p.beginShape();
      for (var x = 0; x <= p.width; x += 3) {
        p.vertex(x, baseY + fgSamplers[i].sample(x * 0.4, heroT));
      }
      p.endShape();
    }
  };

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
}, 'hero-canvas'));


// ═════════════════════════════════════════════════════════════
// 2. GALLERY – All 34 waves (B&W, 30 fps)
// ═════════════════════════════════════════════════════════════
reg('gallery-canvas', new p5(function(p) {
  const COLS = 6;
  const ROWS = Math.ceil(WAVE_NAMES.length / COLS);
  const EXP_H = 140;
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
      samplers.push(Waves.createSampler({ wave: WAVE_NAMES[i], amplitude: cellH * 0.44, frequency: 1 }));
    }
  };

  p.draw = function() {
    p.background(248);
    const t = p.frameCount * 0.01;
    const hasFocus  = hovered >= 0;
    const miniY0    = hasFocus ? EXP_H + 4 : 0;
    const miniCellH = hasFocus ? Math.floor((p.height - miniY0) / ROWS) : cellH;
    const ampScale  = miniCellH / cellH;

    // ── Mini grid ─────────────────────────────────────────────
    for (let i = 0; i < WAVE_NAMES.length; i++) {
      const col = i % COLS, row = Math.floor(i / COLS);
      const ox = col * cellW, oy = miniY0 + row * miniCellH;
      const ph = miniCellH - 2;
      const isHov = i === hovered;

      p.noStroke(); p.fill(isHov ? 235 : 248);
      p.rect(ox + 1, oy + 1, cellW - 2, ph);

      p.stroke(isHov ? 0 : 60); p.strokeWeight(isHov ? 2 : 1.2); p.noFill();
      p.beginShape();
      for (let x = 6; x <= cellW - 6; x += 2) {
        const raw = samplers[i].sample(x * 0.5, t) * ampScale;
        p.vertex(ox + x, oy + miniCellH * 0.5 + raw);
      }
      p.endShape();

      p.noStroke(); p.fill(isHov ? 0 : 100);
      p.rect(ox + 6, oy + 6, 20, 14);
      p.fill(248); p.textSize(9); p.textAlign(p.CENTER, p.CENTER);
      p.text(i, ox + 16, oy + 13);

      if (!hasFocus) {
        p.fill(isHov ? 0 : 120); p.textSize(9); p.textAlign(p.LEFT, p.BOTTOM);
        p.text(WAVE_NAMES[i], ox + 8, oy + miniCellH - 7);
      }

      p.stroke(215); p.strokeWeight(1);
      if (col < COLS - 1) p.line(ox + cellW, oy, ox + cellW, oy + miniCellH);
      if (row < ROWS - 1) p.line(ox, oy + miniCellH, ox + cellW, oy + miniCellH);
    }

    // ── Expanded focus panel ─────────────────────────────────
    if (hasFocus) {
      const fi = hovered;

      p.noStroke(); p.fill(240);
      p.rect(0, 0, p.width, EXP_H);

      p.stroke(200); p.strokeWeight(0.5);
      p.line(0, EXP_H / 2, p.width, EXP_H / 2);

      p.stroke(0); p.strokeWeight(2); p.noFill();
      p.beginShape();
      for (let x = 0; x <= p.width; x += 2) {
        const inputX = p.map(x, 0, p.width, 0, 28) + t * 28;
        const v = Waves.wave(inputX, { wave: fi, range: [-EXP_H * 0.39, EXP_H * 0.39] });
        p.vertex(x, EXP_H / 2 + v);
      }
      p.endShape();

      // Playhead dot
      const tFrac = (t * 0.5) % 1.0;
      const dotV = Waves.wave(
        p.map(tFrac, 0, 1, 0, p.width),
        { wave: fi, t: t, range: [EXP_H * 0.11, EXP_H * 0.89] }
      );
      p.noStroke(); p.fill(0);
      p.circle(tFrac * p.width, dotV, 8);

      p.noStroke(); p.fill(0);
      p.textSize(10); p.textAlign(p.LEFT, p.TOP);
      p.text(fi + '  ' + WAVE_NAMES[fi], 10, 9);
    }

    // ── Hover detection (uses current layout vars) ────────────
    let newFocus = -1;
    if (p.mouseX >= 0 && p.mouseX < p.width) {
      if (hasFocus && p.mouseY >= 0 && p.mouseY < EXP_H) {
        newFocus = hovered;
      } else if (p.mouseY >= miniY0 && p.mouseY < p.height) {
        const mc = Math.floor(p.mouseX / cellW);
        const mr = Math.floor((p.mouseY - miniY0) / miniCellH);
        const mi = mr * COLS + mc;
        if (mi >= 0 && mi < WAVE_NAMES.length) newFocus = mi;
      }
    }
    hovered = newFocus;
  };

  p.mouseExited = function() { hovered = -1; };

  p.windowResized = function() {
    const container = document.getElementById('gallery-canvas');
    cellW = Math.floor((container.offsetWidth || 1200) / COLS);
    p.resizeCanvas(cellW * COLS, cellH * ROWS);
  };
}, 'gallery-canvas'));


// ═════════════════════════════════════════════════════════════
// 2b. WAVE SHIFT – Auto-cycling demo
// ═════════════════════════════════════════════════════════════
reg('shift-canvas', new p5(function(p) {
  var shiftInterval = 3, shiftDuration = 1;
  var sampler, t = 0;

  function buildSampler() {
    sampler = Waves.createSampler({
      shift: true,
      shiftInterval: shiftInterval,
      shiftDuration: shiftDuration,
      amplitude: 120,
      frequency: 0.6
    });
    t = 0;
  }

  function updateShiftCode() {
    var el = document.getElementById('shift-code');
    if (!el) return;
    el.textContent =
      'var sampler = Waves.createSampler({\n' +
      '  shift:         true,\n' +
      '  shiftInterval: ' + shiftInterval + ',\n' +
      '  shiftDuration: ' + shiftDuration + ',\n' +
      '  amplitude:     120,\n' +
      '  frequency:     0.6\n' +
      '});\n\n' +
      '// In draw:\n' +
      'sampler.sample(y, t);\n' +
      'sampler.waveName;    // "' + sampler.waveName + '"\n' +
      'sampler.shifting;    // ' + sampler.shifting;
  }

  p.setup = function() {
    var container = document.getElementById('shift-canvas');
    var w = container ? container.offsetWidth : 600;
    p.createCanvas(w, Math.round(w * 0.6)).parent('shift-canvas');
    p.strokeCap(p.ROUND);
    p.textFont('monospace');
    p.textAlign(p.CENTER, p.CENTER);
    buildSampler();
    updateShiftCode();

    var intEl = document.getElementById('ctrl-shift-interval');
    var durEl = document.getElementById('ctrl-shift-duration');
    if (intEl) intEl.addEventListener('input', function() {
      shiftInterval = +this.value;
      document.getElementById('val-shift-interval').textContent = this.value;
      buildSampler();
    });
    if (durEl) durEl.addEventListener('input', function() {
      shiftDuration = +this.value;
      document.getElementById('val-shift-duration').textContent = this.value;
      buildSampler();
    });
  };

  p.draw = function() {
    p.background(30);
    t += 0.014;

    p.noFill();
    p.stroke(255);
    p.strokeWeight(2);
    p.beginShape();
    for (var y = 0; y <= p.height; y += 3) {
      p.vertex(p.width / 2 + sampler.sample(y, t), y);
    }
    p.endShape();

    // Labels
    p.noStroke();
    p.fill(255, 255, 255, 200);
    p.textSize(12);
    p.text(sampler.waveName, p.width / 2, p.height - 36);

    if (sampler.shifting) {
      p.fill(255, 255, 255, p.map(sampler.mix, 0, 1, 0, 200));
      p.text(sampler.targetName, p.width / 2, p.height - 18);
    }

    updateShiftCode();
  };

  p.windowResized = function() {
    var container = document.getElementById('shift-canvas');
    var w = container ? container.offsetWidth : 600;
    p.resizeCanvas(w, Math.round(w * 0.6));
  };
}, 'shift-canvas'));


// ═════════════════════════════════════════════════════════════
// 3. INTERACTIVE – Live wave lab
// ═════════════════════════════════════════════════════════════
reg('interactive-canvas', new p5(function(p) {
  let params = { wave: 'classic sine', amplitude: 136, frequency: 0.060, speed: 0.020, phase: 0, lines: 5, fill: false, dots: false };
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
// 4a. TERRAIN_N – Binary threshold (B&W cells)
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
// 4b. TERRAIN_N – Continuous Float32 (grayscale)
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
      const strokeA = Math.round(p.lerp(220, 130, li / (NUM_LINES - 1)));

      p.stroke(g, g, g, strokeA); p.strokeWeight(1.6); p.noFill();
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
// 6. 3D TERRAIN – WEBGL, TERRAIN_N=35, 4 real B&W color modes
// ═════════════════════════════════════════════════════════════
reg('terrain-canvas', new p5(function(p) {
  const TERRAIN_N = 35;
  let terrainH = 100, terrainSpeed = 0.023;
  let waveX = 'grow random', waveZ = 'bumpy sine';
  let terrainColor = 'height', wireframe = true, solid = false;
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
// display: '${terrainColor}', wireframe: ${wireframe}, solid: ${solid}`;
  }

  function grayFor(v, gx, gz) {
    const n = p.constrain((v + terrainH * 2) / (terrainH * 4), 0, 1);
    switch (terrainColor) {
      case 'height':  return Math.round(p.lerp(210, 20,  n));
      case 'inverse': return Math.round(p.lerp(20,  210, n));
      case 'contour': {
        const band = 0.5 + 0.5 * Math.sin(n * Math.PI * 10);
        return Math.round(p.lerp(200, 20, band));
      }
      case 'fog': {
        const depth = gz / TERRAIN_N;
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
    bind('terrain-color', function() { terrainColor = document.getElementById('terrain-color').value; });
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
    const cellSz = size / TERRAIN_N;

    p.rotateX(-0.55); p.rotateY(0.35);
    p.translate(-size / 2, 0, -size / 2);

    const H = [];
    for (let z = 0; z <= TERRAIN_N; z++) {
      H[z] = [];
      for (let x = 0; x <= TERRAIN_N; x++) {
        H[z][x] = samplerX.sample(x * cellSz * 0.3, t) + samplerZ.sample(z * cellSz * 0.3, t * 1.3);
      }
    }

    for (let gz = 0; gz < TERRAIN_N; gz++) {
      for (let gx = 0; gx < TERRAIN_N; gx++) {
        const x0 = gx * cellSz, x1 = (gx + 1) * cellSz;
        const z0 = gz * cellSz, z1 = (gz + 1) * cellSz;
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
  };

  p.windowResized = function() {
    const container = document.getElementById('terrain-canvas');
    p.resizeCanvas(container.offsetWidth || 800, 480);
  };
}, 'terrain-canvas'));


// ═════════════════════════════════════════════════════════════
// 7. POSTER GENERATOR – Wave-driven graphic design with shift
// ═════════════════════════════════════════════════════════════
reg('poster-canvas', new p5(function(p) {
  var t = 0;
  var titleText = 'WAVES';
  var subText   = 'structured surprise';
  var canvasW = 460, canvasH = 460;

  function wOpts(extra) {
    var opts = { shift: true, shiftInterval: 4, shiftDuration: 1.5, t: t };
    for (var k in extra) { opts[k] = extra[k]; }
    return opts;
  }

  function updatePosterCode() {
    var el = document.getElementById('poster-code');
    if (!el) return;
    el.textContent =
      '// Breathing border\n' +
      'Waves.wave(x * 0.03, {\n' +
      '  shift: true, t: t, amplitude: 3\n' +
      '});\n\n' +
      '// Title letter lift\n' +
      'Waves.wave(i * 2.5, {\n' +
      '  shift: true, t: t, amplitude: 12\n' +
      '});\n\n' +
      '// Ornament with wild mode\n' +
      'Waves.wave(x * 0.015, {\n' +
      '  shift: true, t: t,\n' +
      '  amplitude: 20, mode: \'wild\',\n' +
      '  unpredictability: 0.3\n' +
      '});';
  }

  p.setup = function() {
    var container = document.getElementById('poster-canvas');
    if (container && container.offsetWidth > 0) {
      canvasW = Math.min(460, container.offsetWidth);
      canvasH = canvasW;
    }
    p.createCanvas(canvasW, canvasH).parent('poster-canvas');
    p.textFont('monospace');
    updatePosterCode();
  };

  p.draw = function() {
    t += 0.008;
    p.background(245);

    var margin = canvasW * 0.087;
    var innerW = canvasW - margin * 2;
    var innerH = canvasH - margin * 2;

    drawBorder(margin, innerW, innerH);
    drawOrnaments(margin, innerW, innerH);
    drawTitle(margin, innerW, innerH);
    drawSubtitle(margin, innerW, innerH);
    drawFooterLines(margin, innerW, innerH);
    drawWaveName(margin, innerW, innerH);
  };

  function drawBorder(margin, innerW, innerH) {
    p.noFill();
    p.stroke(0, 40);
    p.strokeWeight(1);
    // top
    p.beginShape();
    for (var x = margin; x <= margin + innerW; x += 3) {
      p.vertex(x, margin + Waves.wave(x * 0.03, wOpts({ amplitude: 3 })));
    }
    p.endShape();
    // bottom
    p.beginShape();
    for (var x = margin; x <= margin + innerW; x += 3) {
      p.vertex(x, margin + innerH + Waves.wave(x * 0.03, wOpts({ amplitude: 3, phase: 5 })));
    }
    p.endShape();
    // left
    p.beginShape();
    for (var y = margin; y <= margin + innerH; y += 3) {
      p.vertex(margin + Waves.wave(y * 0.03, wOpts({ amplitude: 3, phase: 2 })), y);
    }
    p.endShape();
    // right
    p.beginShape();
    for (var y = margin; y <= margin + innerH; y += 3) {
      p.vertex(margin + innerW + Waves.wave(y * 0.03, wOpts({ amplitude: 3, phase: 7 })), y);
    }
    p.endShape();
  }

  function drawOrnaments(margin, innerW, innerH) {
    p.noFill();
    var ornY = margin + innerH * 0.35;
    for (var layer = 0; layer < 3; layer++) {
      var posterAlpha = p.map(layer, 0, 2, 25, 60);
      p.stroke(0, posterAlpha);
      p.strokeWeight(0.6);
      p.beginShape();
      for (var x = margin + 20; x <= margin + innerW - 20; x += 2) {
        var v = Waves.wave(x * 0.015, wOpts({
          amplitude:       15 + layer * 8,
          frequency:       1.2 - layer * 0.2,
          phase:           layer * 1.5,
          mode:            layer === 2 ? 'wild' : 'stable',
          unpredictability: layer === 2 ? 0.3 : 0
        }));
        p.vertex(x, ornY + v + layer * 5);
      }
      p.endShape();
    }
  }

  function drawTitle(margin, innerW, innerH) {
    p.noStroke();
    var baseY = margin + innerH * 0.55;
    var baseSize = canvasW * 0.113;
    var charW = baseSize * 0.65;
    var totalW = titleText.length * charW;
    var startX = margin + (innerW - totalW) * 0.5;

    for (var i = 0; i < titleText.length; i++) {
      var lift = Waves.wave(i * 2.5, wOpts({
        amplitude: 12, frequency: 0.8
      }));

      var sizeOff = Waves.wave(i * 1.8, wOpts({
        range: [-6, 6], phase: 0.7
      }));

      var titleAlpha = Waves.wave(i * 3.0, wOpts({
        range: [120, 255], phase: 1.2
      }));

      p.fill(0, titleAlpha);
      p.textSize(baseSize + sizeOff);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(titleText[i], startX + i * charW + charW * 0.5, baseY + lift);
    }
  }

  function drawSubtitle(margin, innerW, innerH) {
    p.noStroke();
    var baseY = margin + innerH * 0.72;

    for (var i = 0; i < subText.length; i++) {
      var spacing = Waves.wave(i * 0.8, wOpts({
        range: [8, 14], phase: 0.5
      }));

      var subAlpha = Waves.wave(i * 1.2, wOpts({
        range: [60, 200], phase: 0.9
      }));

      p.fill(0, subAlpha);
      p.textSize(12);
      p.textAlign(p.LEFT, p.CENTER);
      var xPos = margin + 30;
      for (var j = 0; j < i; j++) {
        xPos += Waves.wave(j * 0.8, wOpts({ range: [8, 14], phase: 0.5 }));
      }
      if (xPos < margin + innerW - 20) {
        p.text(subText[i], xPos, baseY);
      }
    }
  }

  function drawFooterLines(margin, innerW, innerH) {
    p.stroke(0, 30);
    p.strokeWeight(0.5);
    var footY = margin + innerH * 0.88;
    for (var l = 0; l < 4; l++) {
      var y = footY + l * 8;
      var lineW = Waves.wave(l * 3, wOpts({ range: [innerW * 0.3, innerW * 0.9] }));
      var xOff  = Waves.wave(l * 2, wOpts({ range: [0, innerW * 0.3], phase: 0.6 }));
      p.line(margin + xOff, y, margin + xOff + lineW, y);
    }
  }

  function drawWaveName(margin, innerW, innerH) {
    // Use wave() with shift to discover current formula name
    // We call it once just to get the side effect of which wave is active
    var probe = Waves.wave(0, wOpts({ range: [0, 1] }));
    // Display the shift era's wave — derive from t
    var cycleDur = 4 + 1.5;
    var era = Math.floor(t / cycleDur);
    var idx = Math.abs(era * 7 + 3) % Waves.count;
    p.noStroke();
    p.fill(0, 0, 0, 40);
    p.textSize(7);
    p.textAlign(p.RIGHT, p.BOTTOM);
    p.text('p5.waves', margin + innerW - 2, margin + innerH - 2);
  }

  p.windowResized = function() {
    var container = document.getElementById('poster-canvas');
    if (container && container.offsetWidth > 0) {
      canvasW = Math.min(460, container.offsetWidth);
      canvasH = canvasW;
      p.resizeCanvas(canvasW, canvasH);
    }
  };
}, 'poster-canvas'));
