  const GUIDE_PALETTE = {
    paper: '#f4efe5',
    ink: '#080808',
    red: '#ff3b2f',
    blue: '#174cff',
    acid: '#d7ff22',
    pink: '#ff4fb3',
    cyan: '#00c7ff'
  };

  const GUIDE_WORDS = [
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
    { key: 'gentle', group: 'gentle', color: GUIDE_PALETTE.blue },
    { key: 'harsh', group: 'harsh', color: GUIDE_PALETTE.red },
    { key: 'all', group: 'all', color: GUIDE_PALETTE.acid },
    { key: 'array', group: ARRAY_GROUP, color: GUIDE_PALETTE.pink }
  ];

    function activeGroupIndex(t) {
    return Math.floor(t / 4.8) % GROUP_PRESETS.length;
  }

  function accentFrom(v) {
    const colors = [GUIDE_PALETTE.red, GUIDE_PALETTE.blue, GUIDE_PALETTE.acid, GUIDE_PALETTE.pink, GUIDE_PALETTE.cyan];
    return colors[Math.max(0, Math.min(colors.length - 1, Math.floor(v * colors.length)))];
  }

  function canvasSize(id, ratio, minHeight, maxHeight) {
    const element = document.getElementById(id);
    const width = Math.max(320, Math.floor(element.offsetWidth || 320));
    const height = Math.round(Math.min(maxHeight, Math.max(minHeight, width * ratio)));
    return { width, height };
  }

  function createGroupSamplers(seedOffset) {
    return GROUP_PRESETS.map(function(preset, i) {
      return Waves.createSampler({
        group: preset.group,
        shift: true,
        shiftInterval: 3.2 + i * 0.45,
        shiftDuration: 1.05,
        range: [-1, 1],
        frequency: 0.6 + i * 0.1,
        seed: seedOffset + i * 41,
        mode: preset.key === 'harsh' ? 'wild' : 'stable',
        unpredictability: preset.key === 'harsh' ? 0.32 : 0
      });
    });
  }

  function createGroupGrids(seedOffset, cols, rows) {
    return GROUP_PRESETS.map(function(preset, i) {
      return Waves.createGrid(cols, rows, {
        group: preset.group,
        threshold: preset.key === 'harsh' ? 0.12 : 0,
        speed: 0.36 + i * 0.08,
        seed: seedOffset + i * 29
      });
    });
  }

  async function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', 'readonly');
    area.style.position = 'absolute';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    document.body.removeChild(area);
  }

  function wireCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(function(button) {
      button.addEventListener('click', async function() {
        const key = button.getAttribute('data-copy');
        const source = document.getElementById('code-' + key);
        const text = source ? source.textContent : '';
        const original = button.textContent;

        try {
          await copyText(text);
          button.textContent = 'Copied';
          button.classList.add('copied');
        } catch (error) {
          button.textContent = 'Copy failed';
          button.classList.add('copied');
        }

        window.setTimeout(function() {
          button.textContent = original;
          button.classList.remove('copied');
        }, 1400);
      });
    });
  }

  function drawPanelLabel(p, label, x, y, color) {
    p.noStroke();
    p.fill(color);
    p.rect(x, y, 84, 18);
    p.fill(GUIDE_PALETTE.ink);
    p.textFont('Inter');
    p.textSize(8);
    p.textAlign(p.LEFT, p.CENTER);
    p.text(label.toUpperCase(), x + 6, y + 9);
  }

  const sketchRegistry = new Map();
  function registerSketch(id, builder) {
    const instance = new p5(builder, id);
    sketchRegistry.set(id, instance);
    return instance;
  }

  registerSketch('guide-system', function(p) {
    let colorSampler;
    let pulseSampler;
    let typeSampler;
    let groupSamplers = [];
    let groupGrids = [];

    function buildSystem() {
      colorSampler = Waves.createSampler({
        group: 'all',
        shift: true,
        shiftInterval: 6.2,
        shiftDuration: 1.7,
        range: [0, 1],
        frequency: 0.58,
        seed: 11
      });

      pulseSampler = Waves.createSampler({
        group: 'harsh',
        shift: true,
        shiftInterval: 4.1,
        shiftDuration: 1.2,
        range: [0, 1],
        frequency: 1.1,
        mode: 'wild',
        unpredictability: 0.28,
        seed: 27
      });

      typeSampler = Waves.createSampler({
        group: ARRAY_GROUP,
        shift: true,
        shiftInterval: 6.4,
        shiftDuration: 1.4,
        range: [-1, 1],
        frequency: 0.72,
        seed: 41
      });

      groupSamplers = createGroupSamplers(301);
      groupGrids = createGroupGrids(701, 20, 10);
    }

    p.setup = function() {
      const size = canvasSize('guide-system', 0.58, 260, 420);
      p.createCanvas(size.width, size.height).parent('guide-system');
      p.pixelDensity(1);
      p.frameRate(30);
      p.noStroke();
      buildSystem();
    };

    p.draw = function() {
      const t = p.millis() / 1000;
      const active = activeGroupIndex(t);
      const margin = Math.max(16, p.width * 0.045);

      p.background(GUIDE_PALETTE.paper);

      p.blendMode(p.MULTIPLY);
      for (let i = 0; i < 4; i++) {
        const v = colorSampler.sample(i * 0.38, t * 0.72);
        const blockW = p.map(v, 0, 1, p.width * 0.18, p.width * 0.48);
        p.fill(p.color(accentFrom(v) + '2e'));
        p.rect(p.width - blockW - margin * 0.35, i * p.height * 0.18 + margin * 0.5, blockW, p.height * 0.14);
      }

      for (let i = 0; i < GROUP_PRESETS.length; i++) {
        const preset = GROUP_PRESETS[i];
        const sampler = groupSamplers[i];
        const frac = i / (GROUP_PRESETS.length - 1);
        const y = p.lerp(p.height * 0.28, p.height * 0.82, frac);
        const amp = p.lerp(14, p.min(p.width, p.height) * 0.1, frac);
        const band = p.lerp(12, preset.key === 'harsh' ? 40 : 28, p.abs(sampler.sample(i * 0.3, t)));
        const alpha = i === active ? 'a8' : '62';

        p.fill(p.color(preset.color + alpha));
        p.beginShape();
        for (let x = -10; x <= p.width + 10; x += 12) {
          p.vertex(x, y + Waves.wave(x * 0.016 + i * 0.24, {
            group: preset.group,
            shift: true,
            shiftInterval: 3.5 + i * 0.3,
            shiftDuration: 1.05,
            seed: 900 + i * 53,
            t: t * 0.75 + i * 0.3,
            amplitude: amp,
            frequency: 0.74 + frac * 0.16,
            mode: preset.key === 'harsh' ? 'wild' : 'stable',
            unpredictability: preset.key === 'harsh' ? 0.34 : 0
          }));
        }
        for (let x = p.width + 10; x >= -10; x -= 12) {
          p.vertex(x, y + band);
        }
        p.endShape(p.CLOSE);
      }
      p.blendMode(p.BLEND);

      const grid = groupGrids[active];
      const cells = grid.sample(t);
      const cols = 20;
      const rows = 10;
      const gx = p.width - margin - p.width * 0.28;
      const gy = margin;
      const gw = p.width * 0.26;
      const gh = p.height * 0.26;
      const cw = gw / cols;
      const ch = gh / rows;

      p.fill(GUIDE_PALETTE.ink);
      p.rect(gx - 5, gy - 5, gw + 10, gh + 10);
      p.fill(GUIDE_PALETTE.paper);
      p.rect(gx, gy, gw, gh);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const on = cells[row * cols + col] === 1;
          p.fill(on ? GROUP_PRESETS[active].color : (row + col) % 2 === 0 ? '#efe7da' : GUIDE_PALETTE.paper);
          p.rect(gx + col * cw, gy + row * ch, Math.max(1, cw - 1), Math.max(1, ch - 1));
        }
      }

      p.fill(GUIDE_PALETTE.ink);
      p.textFont('Inter');
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(8);
      p.text('createGrid / group', gx, gy + gh + 8);

      p.textFont('Oswald');
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(Math.min(68, p.width * 0.12));
      let tx = margin;
      for (let i = 0; i < 'p5.waves'.length; i++) {
        const chLabel = 'p5.waves'[i];
        const wobble = typeSampler.sample(i * 0.22, t) * 6;
        p.fill(i === 3 || i === 5 ? GROUP_PRESETS[active].color : GUIDE_PALETTE.ink);
        p.text(chLabel, tx, p.height * 0.28 + wobble);
        tx += p.textWidth(chLabel) * 0.96;
      }

      p.fill(GUIDE_PALETTE.ink);
      p.textSize(Math.min(26, p.width * 0.05));
      p.text('AS A CURATION ENGINE', margin, p.height * 0.55);

      const sampler = groupSamplers[active];
      sampler.sample(0.4, t);
      const barX = margin;
      const barY = p.height - 46;
      const barW = Math.min(p.width - margin * 2, 290);
      const barH = 20;
      const mix = sampler.shifting ? sampler.mix : pulseSampler.sample(0.2, t);

      p.fill(GUIDE_PALETTE.ink);
      p.rect(barX, barY, barW, barH);
      p.fill(GROUP_PRESETS[active].color);
      p.rect(barX, barY, barW * p.constrain(mix, 0, 1), barH);
      p.fill(mix > 0.55 ? GUIDE_PALETTE.ink : GUIDE_PALETTE.paper);
      p.textFont('Inter');
      p.textSize(8);
      p.textAlign(p.LEFT, p.CENTER);
      p.text('group ' + GROUP_PRESETS[active].key + ' / ' + (sampler.waveName || 'wave'), barX + 8, barY + barH * 0.5);
      p.textAlign(p.RIGHT, p.CENTER);
      p.fill(GUIDE_PALETTE.paper);
      p.text('next ' + (sampler.targetName || sampler.waveName || 'wave'), barX + barW - 8, barY + barH * 0.5);
    };

    p.windowResized = function() {
      const size = canvasSize('guide-system', 0.58, 260, 420);
      p.resizeCanvas(size.width, size.height);
    };
  });

  registerSketch('guide-pools', function(p) {
    let groupSamplers = [];

    p.setup = function() {
      const size = canvasSize('guide-pools', 0.62, 240, 360);
      p.createCanvas(size.width, size.height).parent('guide-pools');
      p.pixelDensity(1);
      p.frameRate(30);
      p.textFont('Oswald');
      groupSamplers = createGroupSamplers(1200);
    };

    p.draw = function() {
      const t = p.millis() / 1000;
      const active = activeGroupIndex(t);
      const margin = 18;
      const labelW = Math.max(100, p.width * 0.22);
      const rowH = (p.height - margin * 2 - 12 * 3) / 4;

      p.background(GUIDE_PALETTE.paper);

      for (let i = 0; i < GROUP_PRESETS.length; i++) {
        const preset = GROUP_PRESETS[i];
        const y = margin + i * (rowH + 12);
        const sampler = groupSamplers[i];
        const amp = 10 + p.abs(sampler.sample(i * 0.22, t)) * (i === 1 ? 26 : 18);

        p.stroke(GUIDE_PALETTE.ink);
        p.strokeWeight(i === active ? 3 : 1);
        p.fill(i === active ? '#fffdfa' : '#f6efe4');
        p.rect(margin, y, p.width - margin * 2, rowH);
        p.noStroke();

        p.fill(preset.color);
        p.rect(margin, y, labelW, rowH);
        p.fill(GUIDE_PALETTE.ink);
        p.textSize(15);
        p.textAlign(p.LEFT, p.TOP);
        p.text(preset.key.toUpperCase(), margin + 12, y + 10);
        p.textFont('Inter');
        p.textSize(8);
        p.text('group', margin + 12, y + 30);
        p.textFont('Oswald');

        p.fill(p.color(preset.color + (i === active ? 'b2' : '74')));
        p.beginShape();
        for (let x = margin + labelW + 12; x <= p.width - margin - 14; x += 12) {
          const wave = Waves.wave(x * 0.018 + i * 0.3, {
            group: preset.group,
            shift: true,
            shiftInterval: 3.5 + i * 0.2,
            shiftDuration: 1.05,
            seed: 1600 + i * 40,
            t: t + i * 0.3,
            amplitude: amp,
            frequency: 0.78 + i * 0.03,
            mode: preset.key === 'harsh' ? 'wild' : 'stable',
            unpredictability: preset.key === 'harsh' ? 0.3 : 0
          });
          p.vertex(x, y + rowH * 0.48 + wave);
        }
        for (let x = p.width - margin - 14; x >= margin + labelW + 12; x -= 12) {
          p.vertex(x, y + rowH - 12);
        }
        p.endShape(p.CLOSE);
      }
    };

    p.windowResized = function() {
      const size = canvasSize('guide-pools', 0.62, 240, 360);
      p.resizeCanvas(size.width, size.height);
    };
  });

  registerSketch('guide-samplers', function(p) {
    let motionSampler;
    let colorSampler;
    let pulseSampler;
    let typeSampler;

    p.setup = function() {
      const size = canvasSize('guide-samplers', 0.7, 250, 380);
      p.createCanvas(size.width, size.height).parent('guide-samplers');
      p.pixelDensity(1);
      p.frameRate(30);
      p.noStroke();

      motionSampler = Waves.createSampler({
        group: 'gentle',
        shift: true,
        shiftInterval: 5.5,
        shiftDuration: 1.3,
        range: [-1, 1],
        frequency: 0.82,
        seed: 14
      });

      colorSampler = Waves.createSampler({
        group: 'all',
        shift: true,
        shiftInterval: 6.1,
        shiftDuration: 1.5,
        range: [0, 1],
        frequency: 0.6,
        seed: 19
      });

      pulseSampler = Waves.createSampler({
        group: 'harsh',
        shift: true,
        shiftInterval: 4,
        shiftDuration: 1.1,
        range: [0, 1],
        frequency: 1.1,
        mode: 'wild',
        unpredictability: 0.28,
        seed: 21
      });

      typeSampler = Waves.createSampler({
        group: ARRAY_GROUP,
        shift: true,
        shiftInterval: 6.6,
        shiftDuration: 1.5,
        range: [-1, 1],
        frequency: 0.72,
        seed: 26
      });
    };

    p.draw = function() {
      const t = p.millis() / 1000;
      const gap = 14;
      const w = (p.width - gap * 3) / 2;
      const h = (p.height - gap * 3) / 2;
      const panels = [
        { x: gap, y: gap, label: 'motion', color: GUIDE_PALETTE.blue },
        { x: gap * 2 + w, y: gap, label: 'color', color: GUIDE_PALETTE.red },
        { x: gap, y: gap * 2 + h, label: 'pulse', color: GUIDE_PALETTE.red },
        { x: gap * 2 + w, y: gap * 2 + h, label: 'type', color: GUIDE_PALETTE.pink }
      ];

      p.background(GUIDE_PALETTE.paper);
      p.textAlign(p.LEFT, p.TOP);

      panels.forEach(function(panel) {
        p.stroke(GUIDE_PALETTE.ink);
        p.strokeWeight(1.5);
        p.fill('#fffdfa');
        p.rect(panel.x, panel.y, w, h);
        p.noStroke();
        drawPanelLabel(p, panel.label, panel.x + 12, panel.y + 10, panel.color);
      });

      const mx = panels[0].x + w * 0.5 + motionSampler.sample(0.2, t) * w * 0.24;
      const my = panels[0].y + h * 0.62 + motionSampler.sample(0.41, t + 1) * h * 0.18;
      p.fill(GUIDE_PALETTE.blue);
      p.circle(mx, my, 38);

      const colorValue = colorSampler.sample(0.4, t);
      p.fill(accentFrom(colorValue));
      p.rect(panels[1].x + 14, panels[1].y + 44, (w - 28) * colorValue, h - 58);

      for (let i = 0; i < 8; i++) {
        const power = pulseSampler.sample(i * 0.18, t);
        p.fill(i % 2 === 0 ? GUIDE_PALETTE.red : GUIDE_PALETTE.ink);
        p.rect(panels[2].x + 16 + i * ((w - 48) / 8), panels[2].y + h - 18 - power * (h * 0.55), 12, power * (h * 0.55));
      }

      p.textFont('Oswald');
      p.textSize(Math.min(42, w * 0.22));
      let tx = panels[3].x + 16;
      const word = 'WAVE';
      for (let i = 0; i < word.length; i++) {
        const ch = word[i];
        const dy = typeSampler.sample(i * 0.24, t) * 8;
        p.fill(i === 1 ? GUIDE_PALETTE.pink : GUIDE_PALETTE.ink);
        p.text(ch, tx, panels[3].y + h * 0.58 + dy);
        tx += p.textWidth(ch) * 0.94;
      }
      p.textFont('Inter');
    };

    p.windowResized = function() {
      const size = canvasSize('guide-samplers', 0.7, 250, 380);
      p.resizeCanvas(size.width, size.height);
    };
  });

  registerSketch('guide-ribbons', function(p) {
    function drawRibbon(y, band, amp, group, tint, phase, mode, unpredictability) {
      p.fill(p.color(tint));
      p.beginShape();
      for (let x = -20; x <= p.width + 20; x += 14) {
        p.vertex(x, y + Waves.wave(x * 0.015 + phase, {
          group: group,
          shift: true,
          shiftInterval: 3.6,
          shiftDuration: 1.05,
          t: p.millis() / 1000,
          amplitude: amp,
          frequency: 0.8,
          mode: mode,
          unpredictability: unpredictability
        }));
      }
      for (let x = p.width + 20; x >= -20; x -= 14) {
        p.vertex(x, y + band);
      }
      p.endShape(p.CLOSE);
    }

    p.setup = function() {
      const size = canvasSize('guide-ribbons', 0.6, 220, 340);
      p.createCanvas(size.width, size.height).parent('guide-ribbons');
      p.pixelDensity(1);
      p.frameRate(30);
      p.textFont('Oswald');
    };

    p.draw = function() {
      p.background(GUIDE_PALETTE.paper);

      p.stroke(GUIDE_PALETTE.ink);
      p.strokeWeight(1.5);
      p.noFill();
      p.beginShape();
      for (let x = -20; x <= p.width + 20; x += 14) {
        p.vertex(x, p.height * 0.2 + Waves.wave(x * 0.015, {
          group: 'gentle',
          shift: true,
          shiftInterval: 3.6,
          shiftDuration: 1,
          t: p.millis() / 1000,
          amplitude: 12,
          frequency: 0.82
        }));
      }
      p.endShape();

      p.noStroke();
      drawRibbon(p.height * 0.42, 24, 18, 'gentle', GUIDE_PALETTE.blue + '88', 0.2, 'stable', 0);
      drawRibbon(p.height * 0.68, 48, 34, 'harsh', GUIDE_PALETTE.red + 'a8', 0.55, 'wild', 0.3);

      p.fill(GUIDE_PALETTE.ink);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(16);
      p.text('LINE', 20, 18);
      p.text('FILLED RIBBON', 20, p.height * 0.33);
      p.text('EDITORIAL BAND', 20, p.height * 0.58);
    };

    p.windowResized = function() {
      const size = canvasSize('guide-ribbons', 0.6, 220, 340);
      p.resizeCanvas(size.width, size.height);
    };
  });

  registerSketch('guide-grid', function(p) {
    let grids = [];

    p.setup = function() {
      const size = canvasSize('guide-grid', 0.58, 220, 340);
      p.createCanvas(size.width, size.height).parent('guide-grid');
      p.pixelDensity(1);
      p.frameRate(30);
      p.noStroke();
      p.textFont('Oswald');
      grids = createGroupGrids(2200, 24, 12);
    };

    p.draw = function() {
      const t = p.millis() / 1000;
      const active = activeGroupIndex(t);
      const cols = 24;
      const rows = 12;
      const x = 24;
      const y = 36;
      const gridW = p.width - 48;
      const gridH = p.height - 92;
      const cw = gridW / cols;
      const ch = gridH / rows;
      const cells = grids[active].sample(t);

      p.background(GUIDE_PALETTE.paper);
      p.fill(GUIDE_PALETTE.ink);
      p.rect(x - 6, y - 6, gridW + 12, gridH + 12);
      p.fill(GUIDE_PALETTE.paper);
      p.rect(x, y, gridW, gridH);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const on = cells[row * cols + col] === 1;
          p.fill(on ? GROUP_PRESETS[active].color : (row + col) % 2 === 0 ? '#ece5d7' : GUIDE_PALETTE.paper);
          p.rect(x + col * cw, y + row * ch, Math.max(1, cw - 1), Math.max(1, ch - 1));
        }
      }

      p.fill(GUIDE_PALETTE.ink);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(16);
      p.text('CREATEGRID / ' + GROUP_PRESETS[active].key.toUpperCase(), 24, p.height - 42);
      p.textFont('Inter');
      p.textSize(8);
      p.text('proof module', 24, p.height - 20);
      p.textFont('Oswald');
    };

    p.windowResized = function() {
      const size = canvasSize('guide-grid', 0.58, 220, 340);
      p.resizeCanvas(size.width, size.height);
    };
  });

  registerSketch('guide-title', function(p) {
    let typeSampler;
    let colorSampler;

    p.setup = function() {
      const size = canvasSize('guide-title', 0.44, 190, 270);
      p.createCanvas(size.width, size.height).parent('guide-title');
      p.pixelDensity(1);
      p.frameRate(30);
      p.noStroke();
      p.textFont('Oswald');

      typeSampler = Waves.createSampler({
        group: ARRAY_GROUP,
        shift: true,
        shiftInterval: 6.8,
        shiftDuration: 1.5,
        range: [-1, 1],
        frequency: 0.72,
        seed: 3001
      });

      colorSampler = Waves.createSampler({
        group: 'all',
        shift: true,
        shiftInterval: 6,
        shiftDuration: 1.4,
        range: [0, 1],
        frequency: 0.58,
        seed: 3009
      });
    };

    p.draw = function() {
      const t = p.millis() / 1000;
      const word = 'p5.waves';
      const size = Math.min(96, p.width * 0.17);
      let x = 18;

      p.background(GUIDE_PALETTE.paper);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(size);

      for (let i = 0; i < word.length; i++) {
        const ch = word[i];
        const dy = typeSampler.sample(i * 0.24, t) * (size * 0.05);
        const accent = accentFrom(colorSampler.sample(i * 0.18, t));
        p.fill(i === 3 || i === 5 ? accent : GUIDE_PALETTE.ink);
        p.text(ch, x, p.height * 0.3 + dy);
        x += p.textWidth(ch) * 0.97;
      }

      p.fill(GUIDE_PALETTE.ink);
      p.textFont('Inter');
      p.textSize(10);
      p.text('kinetic title driven by the curated array group', 18, p.height - 22);
      p.textFont('Oswald');
    };

    p.windowResized = function() {
      const size = canvasSize('guide-title', 0.44, 190, 270);
      p.resizeCanvas(size.width, size.height);
    };
  });

  registerSketch('guide-status', function(p) {
    let samplers = [];
    let pulseSampler;

    p.setup = function() {
      const size = canvasSize('guide-status', 0.4, 170, 240);
      p.createCanvas(size.width, size.height).parent('guide-status');
      p.pixelDensity(1);
      p.frameRate(30);
      p.noStroke();
      p.textFont('Oswald');
      samplers = createGroupSamplers(4200);

      pulseSampler = Waves.createSampler({
        group: 'harsh',
        shift: true,
        shiftInterval: 4,
        shiftDuration: 1.1,
        range: [0, 1],
        frequency: 1.08,
        mode: 'wild',
        unpredictability: 0.28,
        seed: 4211
      });
    };

    p.draw = function() {
      const t = p.millis() / 1000;
      const active = activeGroupIndex(t);
      const sampler = samplers[active];
      const x = 24;
      const y = p.height * 0.42;
      const w = p.width - 48;
      const h = 28;
      sampler.sample(0.28, t);
      const mix = sampler.shifting ? sampler.mix : 0.55;

      p.background(GUIDE_PALETTE.paper);
      p.fill(GUIDE_PALETTE.ink);
      p.rect(x, y, w, h);
      p.fill(GROUP_PRESETS[active].color);
      p.rect(x, y, w * p.constrain(mix, 0, 1), h);

      p.textFont('Inter');
      p.textSize(8);
      p.textAlign(p.LEFT, p.CENTER);
      p.fill(mix > 0.54 ? GUIDE_PALETTE.ink : GUIDE_PALETTE.paper);
      p.text('group ' + GROUP_PRESETS[active].key + ' / ' + (sampler.waveName || 'wave'), x + 8, y + h * 0.5);
      p.textAlign(p.RIGHT, p.CENTER);
      p.fill(GUIDE_PALETTE.paper);
      p.text('next ' + (sampler.targetName || sampler.waveName || 'wave'), x + w - 8, y + h * 0.5);

      for (let i = 0; i < 6; i++) {
        const on = pulseSampler.sample(i * 0.14, t) > 0.45;
        p.fill(on ? GUIDE_PALETTE.ink : '#d9d0c1');
        p.rect(p.width - 112 + i * 14, y + 40, 8, 16);
      }

      p.fill(GUIDE_PALETTE.ink);
      p.textAlign(p.LEFT, p.TOP);
      p.text('sampler state rendered as interface', x, 22);
    };

    p.windowResized = function() {
      const size = canvasSize('guide-status', 0.4, 170, 240);
      p.resizeCanvas(size.width, size.height);
    };
  });

  registerSketch('guide-cloud', function(p) {
    let motionSampler;
    let pulseSampler;
    let typeSampler;
    let particles = [];

    function buildParticles() {
      particles = [];
      p.randomSeed(31);
      const count = Math.max(18, Math.floor((p.width * p.height) / 12000));
      for (let i = 0; i < count; i++) {
        particles.push({
          seed: i,
          x: p.random(24, p.width - 24),
          y: p.random(38, p.height - 24),
          word: p.random(GUIDE_WORDS),
          size: p.random(10, 16)
        });
      }
    }

    p.setup = function() {
      const size = canvasSize('guide-cloud', 0.58, 210, 340);
      p.createCanvas(size.width, size.height).parent('guide-cloud');
      p.pixelDensity(1);
      p.frameRate(30);
      p.noStroke();
      p.textFont('Inter');

      motionSampler = Waves.createSampler({
        group: 'gentle',
        shift: true,
        shiftInterval: 5.4,
        shiftDuration: 1.3,
        range: [-1, 1],
        frequency: 0.8,
        seed: 5001
      });

      pulseSampler = Waves.createSampler({
        group: 'harsh',
        shift: true,
        shiftInterval: 4,
        shiftDuration: 1.1,
        range: [0, 1],
        frequency: 1.12,
        mode: 'wild',
        unpredictability: 0.24,
        seed: 5009
      });

      typeSampler = Waves.createSampler({
        group: 'all',
        shift: true,
        shiftInterval: 6.2,
        shiftDuration: 1.4,
        range: [-1, 1],
        frequency: 0.68,
        seed: 5017
      });

      buildParticles();
    };

    p.draw = function() {
      const t = p.millis() / 1000;
      p.background(GUIDE_PALETTE.paper);
      p.textAlign(p.CENTER, p.CENTER);

      particles.forEach(function(item) {
        const vx = motionSampler.sample(item.seed * 0.31, t) * 22;
        const vy = typeSampler.sample(item.seed * 0.22, t + 1.8) * 14;
        const a = pulseSampler.sample(item.seed * 0.13, t);
        if (a < 0.34) return;

        const alpha = Math.round(p.map(a, 0.34, 1, 40, 150)).toString(16).padStart(2, '0');
        p.fill(p.color(GUIDE_PALETTE.ink + alpha));
        p.textSize(item.size);
        p.text(item.word, item.x + vx, item.y + vy);
      });

      p.textAlign(p.LEFT, p.TOP);
      p.fill(GUIDE_PALETTE.ink);
      p.textSize(10);
      p.text('ambient language field', 18, 16);
    };

    p.windowResized = function() {
      const size = canvasSize('guide-cloud', 0.58, 210, 340);
      p.resizeCanvas(size.width, size.height);
      buildParticles();
    };
  });

  function wireChipScrollspy() {
    const chips = Array.from(document.querySelectorAll('.guide-chip'));
    if (chips.length === 0) return;

    const pairs = chips
      .map(function(chip) {
        const href = chip.getAttribute('href');
        const el = href && href.charAt(0) === '#' ? document.getElementById(href.slice(1)) : null;
        return el ? { el: el, chip: chip } : null;
      })
      .filter(Boolean);
    if (pairs.length === 0) return;

    let ticking = false;
    function update() {
      const trigger = window.innerHeight * 0.3;
      let current = pairs[0];
      for (let i = 0; i < pairs.length; i++) {
        if (pairs[i].el.getBoundingClientRect().top <= trigger) current = pairs[i];
        else break;
      }
      chips.forEach(function(chip) {
        chip.classList.toggle('active', chip === current.chip);
      });
      ticking = false;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  function prefersReducedMotion() {
    return typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function wireVisibilityPause() {
    if (prefersReducedMotion()) {
      sketchRegistry.forEach(function(instance) {
        if (instance && typeof instance.noLoop === 'function') instance.noLoop();
      });
      return;
    }
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        const instance = sketchRegistry.get(entry.target.id);
        if (!instance) return;
        if (entry.isIntersecting) {
          instance.loop();
        } else {
          instance.noLoop();
        }
      });
    }, { rootMargin: '160px 0px' });
    sketchRegistry.forEach(function(_, id) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  wireCopyButtons();
  wireVisibilityPause();
  wireChipScrollspy();
