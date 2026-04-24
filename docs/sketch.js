/* ============================================================
   p5.waves Showcase - sketch.js
   Sections: Hero, Gallery, Interactive, Shift, Walker, Terrain
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

// Populate wave selects on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  var sel = document.getElementById('ctrl-wave');
  if (!sel) return;
  for (var i = 0; i < WAVE_NAMES.length; i++) {
    var opt = document.createElement('option');
    opt.value = WAVE_NAMES[i];
    opt.textContent = i + '. ' + WAVE_NAMES[i];
    if (WAVE_NAMES[i] === 'classic sine') opt.selected = true;
    sel.appendChild(opt);
  }
});

// ── IntersectionObserver: pause off-screen sketches ─────────
var _inst = {};
var _observer = new IntersectionObserver(function(entries) {
  for (var i = 0; i < entries.length; i++) {
    var s = _inst[entries[i].target.id];
    if (!s) continue;
    entries[i].isIntersecting ? s.loop() : s.noLoop();
  }
}, { rootMargin: '100px 0px', threshold: 0 });

function reg(id, sketch) {
  _inst[id] = sketch;
  var el = document.getElementById(id);
  if (el) _observer.observe(el);
  return sketch;
}


// ═════════════════════════════════════════════════════════════
// 1. HERO - Shifting wave landscape
// ═════════════════════════════════════════════════════════════
reg('hero-canvas', new p5(function(p) {
  var BG = [
    { yPct: 0.60, range: [-45, 45], freq: 0.006, phase: 0,   gray: 225, fillAlpha: 18, seed: 10 },
    { yPct: 0.70, range: [-40, 40], freq: 0.009, phase: 1.4, gray: 205, fillAlpha: 22, seed: 11 },
    { yPct: 0.80, range: [-35, 35], freq: 0.012, phase: 2.8, gray: 180, fillAlpha: 28, seed: 12 },
    { yPct: 0.90, range: [-25, 25], freq: 0.016, phase: 0.6, gray: 150, fillAlpha: 40, seed: 13 }
  ];
  var FG = [
    { yPct: 0.55, range: [-90, 90], freq: 0.007, phase: 0.3, color: '#174cff', alpha: 140, thickness: 80, seed: 20 },
    { yPct: 0.63, range: [-80, 80], freq: 0.010, phase: 1.8, color: '#ff3b2f', alpha: 150, thickness: 80, seed: 21 },
    { yPct: 0.72, range: [-70, 70], freq: 0.013, phase: 3.2, color: '#d7ff22', alpha: 160, thickness: 80, seed: 22 },
    { yPct: 0.80, range: [-65, 65], freq: 0.015, phase: 0.9, color: '#ff4fb3', alpha: 170, thickness: 80, seed: 23 },
    { yPct: 0.88, range: [-55, 55], freq: 0.018, phase: 2.1, color: '#00c7ff', alpha: 180, thickness: 80, seed: 24 }
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
        seed: f.seed, range: f.range, frequency: f.freq, phase: f.phase
      }));
    }
  };

  p.draw = function() {
    p.background(245);
    heroT += 0.018;

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

    for (var i = 0; i < FG.length; i++) {
      var f = FG[i];
      var baseY = p.height * f.yPct;
      p.noStroke();
      var c = p.color(f.color);
      c.setAlpha(f.alpha);
      p.fill(c);
      p.beginShape();
      for (var x = 0; x <= p.width; x += 3) {
        p.vertex(x, baseY + fgSamplers[i].sample(x * 0.4, heroT));
      }
      for (var x = p.width; x >= 0; x -= 3) {
        p.vertex(x, baseY + f.thickness);
      }
      p.endShape(p.CLOSE);
    }
  };

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
}, 'hero-canvas'));


// ═════════════════════════════════════════════════════════════
// 2. GALLERY - All 34 waves with hover focus
// ═════════════════════════════════════════════════════════════
reg('gallery-canvas', new p5(function(p) {
  var COLS = 6;
  var ROWS = Math.ceil(WAVE_NAMES.length / COLS);
  var EXP_H = 140;
  var cellW, cellH = 90, t = 0;
  var samplers = [], hovered = -1;

  p.setup = function() {
    var container = document.getElementById('gallery-canvas');
    var w = container.offsetWidth || 1200;
    cellW = Math.floor(w / COLS);
    p.createCanvas(cellW * COLS, cellH * ROWS).parent('gallery-canvas');
    p.textFont('Consolas, monospace');
    p.frameRate(30);
    samplers = [];
    for (var i = 0; i < WAVE_NAMES.length; i++) {
      samplers.push(Waves.createSampler({
        wave: WAVE_NAMES[i],
        amplitude: cellH * 0.22,
        frequency: 1
      }));
    }
  };

  p.draw = function() {
    p.background(248);
    t += 0.01;
    var hasFocus  = hovered >= 0;
    var miniY0    = hasFocus ? EXP_H + 4 : 0;
    var miniCellH = hasFocus ? Math.floor((p.height - miniY0) / ROWS) : cellH;
    var ampScale  = miniCellH / cellH;

    for (var i = 0; i < WAVE_NAMES.length; i++) {
      var col = i % COLS, row = Math.floor(i / COLS);
      var ox = col * cellW, oy = miniY0 + row * miniCellH;
      var ph = miniCellH - 2;
      var isHov = i === hovered;

      p.noStroke();
      p.fill(isHov ? 235 : 248);
      p.rect(ox + 1, oy + 1, cellW - 2, ph);

      p.stroke(isHov ? 0 : 60);
      p.strokeWeight(isHov ? 2 : 1.2);
      p.noFill();
      p.beginShape();
      for (var x = 6; x <= cellW - 6; x += 2) {
        var raw = samplers[i].sample(x * 0.5, t) * ampScale;
        p.vertex(ox + x, oy + miniCellH * 0.5 + raw);
      }
      p.endShape();

      p.noStroke();
      p.fill(isHov ? 0 : 100);
      p.rect(ox + 6, oy + 6, 20, 14);
      p.fill(248);
      p.textSize(9);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(i, ox + 16, oy + 13);

      if (!hasFocus) {
        p.fill(0);
        p.textSize(9);
        p.textAlign(p.LEFT, p.BOTTOM);
        p.text(WAVE_NAMES[i], ox + 8, oy + miniCellH - 7);
      }

      p.stroke(215);
      p.strokeWeight(1);
      if (col < COLS - 1) p.line(ox + cellW, oy, ox + cellW, oy + miniCellH);
      if (row < ROWS - 1) p.line(ox, oy + miniCellH, ox + cellW, oy + miniCellH);
    }

    if (hasFocus) {
      var fi = hovered;
      p.noStroke();
      p.fill(240);
      p.rect(0, 0, p.width, EXP_H);

      p.stroke(200);
      p.strokeWeight(0.5);
      p.line(0, EXP_H / 2, p.width, EXP_H / 2);

      p.stroke(0);
      p.strokeWeight(2);
      p.noFill();
      p.beginShape();
      for (var x = 0; x <= p.width; x += 2) {
        var inputX = p.map(x, 0, p.width, 0, 28) + t * 28;
        var v = Waves.wave(inputX, {
          wave: fi,
          range: [-EXP_H * 0.39, EXP_H * 0.39]
        });
        p.vertex(x, EXP_H / 2 + v);
      }
      p.endShape();

      p.noStroke();
      p.fill(0);
      p.textSize(10);
      p.textAlign(p.LEFT, p.TOP);
      p.text(fi + '  ' + WAVE_NAMES[fi], 10, 9);
    }

    var newFocus = -1;
    if (p.mouseX >= 0 && p.mouseX < p.width) {
      if (hasFocus && p.mouseY >= 0 && p.mouseY < EXP_H) {
        newFocus = hovered;
      } else if (p.mouseY >= miniY0 && p.mouseY < p.height) {
        var mc = Math.floor(p.mouseX / cellW);
        var mr = Math.floor((p.mouseY - miniY0) / miniCellH);
        var mi = mr * COLS + mc;
        if (mi >= 0 && mi < WAVE_NAMES.length) newFocus = mi;
      }
    }
    hovered = newFocus;
  };

  p.mouseExited = function() { hovered = -1; };

  p.windowResized = function() {
    var container = document.getElementById('gallery-canvas');
    cellW = Math.floor((container.offsetWidth || 1200) / COLS);
    p.resizeCanvas(cellW * COLS, cellH * ROWS);
  };
}, 'gallery-canvas'));


// ═════════════════════════════════════════════════════════════
// 3. INTERACTIVE - Live wave lab with sliders
// ═════════════════════════════════════════════════════════════
reg('interactive-canvas', new p5(function(p) {
  var params = {
    wave: 'classic sine', amplitude: 68,
    frequency: 0.060, speed: 0.020,
    lines: 12, dots: false
  };
  var GRAYS = [0, 40, 80, 120, 160, 30, 70, 110, 20, 50, 90, 140, 10, 60, 100, 150, 35, 75, 115, 45, 85, 130, 25, 65];
  var sampler, tInteractive = 0;

  function readControls() {
    params.wave      = document.getElementById('ctrl-wave').value;
    params.amplitude = +document.getElementById('ctrl-amplitude').value;
    params.frequency = +document.getElementById('ctrl-frequency').value / 1000;
    params.speed     = +document.getElementById('ctrl-speed').value / 1000;
    params.lines     = +document.getElementById('ctrl-lines').value;
    params.dots      = document.getElementById('ctrl-dots').checked;

    document.getElementById('val-amplitude').textContent = params.amplitude;
    document.getElementById('val-frequency').textContent = params.frequency.toFixed(3);
    document.getElementById('val-speed').textContent     = params.speed.toFixed(3);
    document.getElementById('val-lines').textContent     = params.lines;
    updateCode();
    sampler = Waves.createSampler({
      wave: params.wave,
      amplitude: params.amplitude,
      frequency: params.frequency
    });
  }

  function updateCode() {
    document.getElementById('code-text').textContent =
      'let y = Waves.wave(x, {\n' +
      '  wave: \'' + params.wave + '\',\n' +
      '  t: millis() / 1000 * ' + params.speed.toFixed(3) + ',\n' +
      '  amplitude: ' + params.amplitude + ',\n' +
      '  frequency: ' + params.frequency.toFixed(3) + '\n' +
      '});';
  }

  p.setup = function() {
    var container = document.getElementById('interactive-canvas');
    var w = container.offsetWidth || 800;
    p.createCanvas(w, Math.round(w * 3 / 4)).parent('interactive-canvas');
    sampler = Waves.createSampler({
      wave: params.wave,
      amplitude: params.amplitude,
      frequency: params.frequency
    });
    updateCode();

    var ids = ['ctrl-wave', 'ctrl-amplitude', 'ctrl-frequency', 'ctrl-speed', 'ctrl-lines', 'ctrl-dots'];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el) {
        el.addEventListener('input', readControls);
        el.addEventListener('change', readControls);
      }
    }
  };

  p.draw = function() {
    p.background(248);
    tInteractive += params.speed * 100;
    var t = tInteractive;

    p.stroke(220);
    p.strokeWeight(1);
    p.line(0, p.height / 2, p.width, p.height / 2);

    for (var li = 0; li < params.lines; li++) {
      var g = GRAYS[li % GRAYS.length];
      var offsetY = (li - (params.lines - 1) / 2) * (p.height / (params.lines + 3));

      p.stroke(g, g, g, 200 - li * 8);
      p.strokeWeight(1.8);
      p.noFill();
      p.beginShape();
      for (var x = 0; x <= p.width; x += 3) {
        p.vertex(x, p.height / 2 + offsetY + sampler.sample(x, t + li * 20));
      }
      p.endShape();

      if (params.dots) {
        p.noStroke();
        p.fill(g, g, g, 200);
        for (var x = 10; x <= p.width - 10; x += 18) {
          p.ellipse(x, p.height / 2 + offsetY + sampler.sample(x, t + li * 20), 4, 4);
        }
      }
    }

    p.noStroke();
    p.fill(0);
    p.textSize(10);
    p.textFont('Consolas, monospace');
    p.textAlign(p.LEFT, p.TOP);
    p.text(params.wave + '  ·  ' + p.frameRate().toFixed(0) + ' fps', 10, 10);
  };

  p.windowResized = function() {
    var container = document.getElementById('interactive-canvas');
    var w = container.offsetWidth || 800;
    p.resizeCanvas(w, Math.round(w * 3 / 4));
  };
}, 'interactive-canvas'));


// ═════════════════════════════════════════════════════════════
// 4. WAVE SHIFT - Auto-cycling demo
// ═════════════════════════════════════════════════════════════
reg('shift-canvas', new p5(function(p) {
  var shiftInterval = 3, shiftDuration = 1;
  var sampler, t = 0;

  function buildSampler() {
    sampler = Waves.createSampler({
      shift: true,
      shiftInterval: shiftInterval,
      shiftDuration: shiftDuration,
      amplitude: 60,
      frequency: 0.6
    });
    t = 0;
  }

  function updateShiftCode() {
    var el = document.getElementById('shift-code');
    if (!el) return;
    el.textContent =
      'let sampler = Waves.createSampler({\n' +
      '  shift:         true,\n' +
      '  shiftInterval: ' + shiftInterval + ',\n' +
      '  shiftDuration: ' + shiftDuration + ',\n' +
      '  amplitude:     60,\n' +
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
// 5. NOT SO RANDOM WALKER - Wave output as raw velocity
// ═════════════════════════════════════════════════════════════
reg('walker-canvas', new p5(function(p) {
  var palette = [
    [23, 76, 255],
    [255, 59, 47],
    [215, 255, 34],
    [255, 79, 179],
    [0, 199, 255]
  ];
  var IS_COLD = [true, false, false, false, true];
  var WALKERS_PER_COLOR = 3;
  var WALKERS = palette.length * WALKERS_PER_COLOR;
  var coldX, coldY, warmX, warmY, trailBuf;
  var wx = [], wy = [], pxArr = [], pyArr = [];
  var walkerT = 0;

  p.setup = function() {
    var container = document.getElementById('walker-canvas');
    var w = container ? container.offsetWidth : 500;
    p.createCanvas(w, w).parent('walker-canvas');
    trailBuf = p.createGraphics(w, w);
    trailBuf.background(241);
    p.frameRate(30);

    coldX = Waves.createSampler({
      shift: true,
      shiftInterval: 7,
      shiftDuration: 1.5,
      group: 'gentle',
      amplitude: 5,
      frequency: 0.4,
      seed: 0
    });

    coldY = Waves.createSampler({
      shift: true,
      shiftInterval: 7,
      shiftDuration: 1.5,
      group: 'gentle',
      amplitude: 5,
      frequency: 0.3,
      seed: 77
    });

    warmX = Waves.createSampler({
      shift: true,
      shiftInterval: 7,
      shiftDuration: 1.5,
      group: 'gentle',
      amplitude: 5,
      frequency: 0.4,
      seed: 311
    });

    warmY = Waves.createSampler({
      shift: true,
      shiftInterval: 7,
      shiftDuration: 1.5,
      group: 'gentle',
      amplitude: 5,
      frequency: 0.3,
      seed: 488
    });

    for (var i = 0; i < WALKERS; i++) {
      var colorIdx = Math.floor(i / WALKERS_PER_COLOR);
      var variantIdx = i % WALKERS_PER_COLOR;
      var a = p.TWO_PI * colorIdx / palette.length + (variantIdx - 1) * 0.14;
      wx[i] = p.width / 2 + p.cos(a) * 50;
      wy[i] = p.height / 2 + p.sin(a) * 50;
      pxArr[i] = wx[i];
      pyArr[i] = wy[i];
    }
  };

  p.draw = function() {
    // Fade the trail buffer
    trailBuf.noStroke();
    trailBuf.fill(241, 241, 241, 8);
    trailBuf.rect(0, 0, trailBuf.width, trailBuf.height);

    walkerT += 0.025;

    for (var i = 0; i < WALKERS; i++) {
      var colorIdx = Math.floor(i / WALKERS_PER_COLOR);
      var variantIdx = i % WALKERS_PER_COLOR;
      var phase = colorIdx * 6.7 + variantIdx * 1.3;
      var xS = IS_COLD[colorIdx] ? coldX : warmX;
      var yS = IS_COLD[colorIdx] ? coldY : warmY;
      var vx = xS.sample(walkerT * 1.8 + phase, walkerT);
      var vy = yS.sample(walkerT * 2.1 + phase * 1.3, walkerT);

      pxArr[i] = wx[i];
      pyArr[i] = wy[i];

      wx[i] += vx;
      wy[i] += vy;

      if (wx[i] < 0) wx[i] += p.width;
      if (wx[i] > p.width) wx[i] -= p.width;
      if (wy[i] < 0) wy[i] += p.height;
      if (wy[i] > p.height) wy[i] -= p.height;

      if (p.abs(wx[i] - pxArr[i]) > p.width / 2) continue;
      if (p.abs(wy[i] - pyArr[i]) > p.height / 2) continue;

      var col = palette[colorIdx];
      trailBuf.stroke(col[0], col[1], col[2], 150);
      trailBuf.strokeWeight(5);
      trailBuf.line(pxArr[i], pyArr[i], wx[i], wy[i]);
    }

    p.image(trailBuf, 0, 0);

    p.noStroke();
    p.textSize(10);
    p.textFont('monospace');
    p.textAlign(p.LEFT, p.TOP);
    p.fill(23, 76, 255, 180);
    p.text('cold  ' + coldX.waveName + ' \u00d7 ' + coldY.waveName, 8, 8);
    p.fill(255, 59, 47, 180);
    p.text('warm  ' + warmX.waveName + ' \u00d7 ' + warmY.waveName, 8, 22);
  };

  p.windowResized = function() {
    var container = document.getElementById('walker-canvas');
    var w = container ? container.offsetWidth : 500;
    p.resizeCanvas(w, w);
    var oldBuf = trailBuf;
    trailBuf = p.createGraphics(w, w);
    trailBuf.image(oldBuf, 0, 0, w, w);
    oldBuf.remove();
  };
}, 'walker-canvas'));


// ═════════════════════════════════════════════════════════════
// 6. 3D TERRAIN - Two wave samplers + WEBGL
// ═════════════════════════════════════════════════════════════
reg('terrain-canvas', new p5(function(p) {
  var TERRAIN_N = 35;
  var terrainH = 100, terrainSpeed = 0.023;
  var waveX = 'grow random', waveZ = 'bumpy sine';
  var terrainColor = 'height', wireframe = true, solid = false;
  var samplerX, samplerZ, tTerrain = 0;

  function buildSamplers() {
    samplerX = Waves.createSampler({
      wave: waveX, seed: 0,
      amplitude: terrainH, frequency: 1
    });
    samplerZ = Waves.createSampler({
      wave: waveZ, seed: 1,
      amplitude: terrainH, frequency: 1
    });
  }

  function updateTerrainCode() {
    var el = document.getElementById('terrain-code');
    if (!el) return;
    el.textContent =
      'let sx = Waves.createSampler({\n' +
      '  wave: \'' + waveX + '\',\n' +
      '  amplitude: ' + terrainH + '\n' +
      '});\n' +
      'let sz = Waves.createSampler({\n' +
      '  wave: \'' + waveZ + '\',\n' +
      '  amplitude: ' + terrainH + '\n' +
      '});\n' +
      '// height = sx.sample(x, t) + sz.sample(z, t);';
  }

  function grayFor(v, gx, gz) {
    var n = p.constrain((v + terrainH * 2) / (terrainH * 4), 0, 1);
    switch (terrainColor) {
      case 'height':  return Math.round(p.lerp(210, 20,  n));
      case 'inverse': return Math.round(p.lerp(20,  210, n));
      case 'contour':
        var band = 0.5 + 0.5 * Math.sin(n * Math.PI * 10);
        return Math.round(p.lerp(200, 20, band));
      case 'fog':
        var depth = gz / TERRAIN_N;
        var base  = Math.round(p.lerp(210, 20, n));
        return Math.round(p.lerp(base, 210, depth * 0.65));
      default: return Math.round(p.lerp(210, 20, n));
    }
  }

  function bind(id, fn) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('input',  function() { fn(); updateTerrainCode(); p.loop(); });
      el.addEventListener('change', function() { fn(); updateTerrainCode(); p.loop(); });
    }
  }

  p.setup = function() {
    var container = document.getElementById('terrain-canvas');
    var cnv = p.createCanvas(container.offsetWidth || 800, 480, p.WEBGL);
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
    tTerrain += terrainSpeed;
    var t    = tTerrain;
    var size = Math.min(p.width, p.height) * 0.85;
    var cellSz = size / TERRAIN_N;

    p.rotateX(-0.55);
    p.rotateY(0.35);
    p.translate(-size / 2, 0, -size / 2);

    var H = [];
    for (var z = 0; z <= TERRAIN_N; z++) {
      H[z] = [];
      for (var x = 0; x <= TERRAIN_N; x++) {
        H[z][x] = samplerX.sample(x * cellSz * 0.3, t) + samplerZ.sample(z * cellSz * 0.3, t * 1.3);
      }
    }

    for (var gz = 0; gz < TERRAIN_N; gz++) {
      for (var gx = 0; gx < TERRAIN_N; gx++) {
        var x0 = gx * cellSz, x1 = (gx + 1) * cellSz;
        var z0 = gz * cellSz, z1 = (gz + 1) * cellSz;
        var h00 = H[gz][gx], h10 = H[gz][gx+1], h01 = H[gz+1][gx], h11 = H[gz+1][gx+1];
        var avgH = (h00 + h10 + h01 + h11) / 4;
        var g = grayFor(avgH, gx, gz);

        if (solid) {
          p.stroke(Math.round(g * 0.55));
          p.strokeWeight(0.3);
          p.fill(g);
          p.beginShape(p.TRIANGLES);
          p.vertex(x0, -h00, z0);
          p.vertex(x1, -h10, z0);
          p.vertex(x0, -h01, z1);
          p.vertex(x1, -h10, z0);
          p.vertex(x1, -h11, z1);
          p.vertex(x0, -h01, z1);
          p.endShape();
        }

        if (wireframe) {
          p.stroke(g, g, g, solid ? 90 : 210);
          p.strokeWeight(solid ? 0.3 : 0.8);
          p.noFill();
          p.beginShape(p.LINES);
          p.vertex(x0, -h00, z0);
          p.vertex(x1, -h10, z0);
          p.vertex(x1, -h10, z0);
          p.vertex(x1, -h11, z1);
          p.vertex(x1, -h11, z1);
          p.vertex(x0, -h01, z1);
          p.vertex(x0, -h01, z1);
          p.vertex(x0, -h00, z0);
          p.endShape();
        }
      }
    }

    p.resetMatrix();
  };

  p.windowResized = function() {
    var container = document.getElementById('terrain-canvas');
    p.resizeCanvas(container.offsetWidth || 800, 480);
  };
}, 'terrain-canvas'));




