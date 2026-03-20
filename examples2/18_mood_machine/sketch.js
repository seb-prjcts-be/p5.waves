// 18 — Mood Machine
// Pick a feeling, not a formula. Each mood maps to a wave + palette + behaviour.

var MOODS = [
  { label: 'calm',       wave: 'classic sine',      color: [90, 140, 180],  bg: [240, 245, 250], speed: 0.004, amp: 35,  lines: 18, freq: 0.8  },
  { label: 'anxious',    wave: 'fuzzy pulse',        color: [200, 60, 60],   bg: [250, 240, 238], speed: 0.035, amp: 50,  lines: 30, freq: 2.2  },
  { label: 'playful',    wave: 'wobble sine',        color: [240, 140, 50],  bg: [255, 250, 240], speed: 0.018, amp: 45,  lines: 22, freq: 1.4  },
  { label: 'dreamy',     wave: 'noise',              color: [140, 120, 190], bg: [245, 242, 255], speed: 0.005, amp: 40,  lines: 16, freq: 0.6  },
  { label: 'mechanical', wave: 'square',             color: [60, 60, 60],    bg: [235, 235, 235], speed: 0.012, amp: 30,  lines: 24, freq: 1.8  },
  { label: 'broken',     wave: 'up down noise',      color: [180, 40, 80],   bg: [248, 240, 242], speed: 0.025, amp: 55,  lines: 28, freq: 2.6  },
  { label: 'ceremonial', wave: 'mountain peaks',     color: [180, 150, 80],  bg: [250, 248, 240], speed: 0.006, amp: 38,  lines: 14, freq: 0.5  },
  { label: 'biological', wave: 'bumpy sine',         color: [60, 150, 100],  bg: [238, 248, 242], speed: 0.010, amp: 42,  lines: 20, freq: 1.1  }
];

var current = 0;
var t = 0;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  noFill();
  strokeCap(ROUND);
  buildButtons();
}

function draw() {
  var m  = MOODS[current];
  t += m.speed;

  background(m.bg[0], m.bg[1], m.bg[2]);

  var cx = width / 2;
  var cy = height / 2;
  var maxR = min(width, height) * 0.42;

  for (var i = 0; i < m.lines; i++) {
    var frac  = i / m.lines;
    var r     = maxR * (0.15 + frac * 0.85);
    var alpha = map(i, 0, m.lines - 1, 40, 220);
    var sw    = map(i, 0, m.lines - 1, 0.6, 2.2);

    stroke(m.color[0], m.color[1], m.color[2], alpha);
    strokeWeight(sw);

    beginShape();
    for (var a = 0; a <= TWO_PI; a += 0.04) {
      var offset = Waves.wave(a * 4 + i * 0.7, {
        wave:      m.wave,
        t:         t + i * 0.3,
        amplitude: m.amp * frac,
        frequency: m.freq
      });
      var px = cx + cos(a) * (r + offset);
      var py = cy + sin(a) * (r + offset);
      vertex(px, py);
    }
    endShape(CLOSE);
  }

  noStroke();
  fill(m.color[0], m.color[1], m.color[2], 120);
  textFont('monospace');
  textSize(11);
  textAlign(CENTER);
  text(m.label, width / 2, height - 14);
}

function buildButtons() {
  var bar = document.createElement('div');
  bar.className = 'mood-bar';
  for (var i = 0; i < MOODS.length; i++) {
    var btn = document.createElement('button');
    btn.textContent = MOODS[i].label;
    btn.dataset.idx = i;
    btn.onclick = function() { current = +this.dataset.idx; };
    bar.appendChild(btn);
  }
  var container = document.getElementById('sketch-container');
  container.parentNode.insertBefore(bar, container);
}
