// 18 — Mood Machine
// Pick a feeling, not a formula. Each mood maps to a wave + behaviour.

var MOODS = [
  { label: 'calm',       wave: 'classic sine',   speed: 0.004, amp: 35,  lines: 18, freq: 0.8  },
  { label: 'anxious',    wave: 'fuzzy pulse',     speed: 0.035, amp: 50,  lines: 30, freq: 2.2  },
  { label: 'playful',    wave: 'wobble sine',     speed: 0.018, amp: 45,  lines: 22, freq: 1.4  },
  { label: 'dreamy',     wave: 'noise',           speed: 0.005, amp: 40,  lines: 16, freq: 0.6  },
  { label: 'mechanical', wave: 'square',          speed: 0.012, amp: 30,  lines: 24, freq: 1.8  },
  { label: 'broken',     wave: 'up down noise',   speed: 0.025, amp: 55,  lines: 28, freq: 2.6  },
  { label: 'ceremonial', wave: 'mountain peaks',  speed: 0.006, amp: 38,  lines: 14, freq: 0.5  },
  { label: 'biological', wave: 'bumpy sine',      speed: 0.010, amp: 42,  lines: 20, freq: 1.1  }
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
  var m = MOODS[current];
  t += m.speed;

  background(248);

  var cx   = width / 2;
  var cy   = height / 2;
  var maxR = min(width, height) * 0.42;
  var step = 0.05;

  for (var i = 0; i < m.lines; i++) {
    var frac  = i / m.lines;
    var r     = maxR * (0.15 + frac * 0.85);
    var alpha = map(i, 0, m.lines - 1, 30, 200);
    var sw    = map(i, 0, m.lines - 1, 0.5, 2.0);

    stroke(0, alpha);
    strokeWeight(sw);

    // Pre-compute ring vertices
    var pts = [];
    for (var a = 0; a < TWO_PI; a += step) {
      var offset = Waves.wave(a * 4 + i * 0.7, {
        wave:      m.wave,
        t:         t + i * 0.3,
        amplitude: m.amp * frac,
        frequency: m.freq
      });
      pts.push([cx + cos(a) * (r + offset), cy + sin(a) * (r + offset)]);
    }

    var n = pts.length;

    // Catmull-Rom spline: phantom first = last, phantom last = first
    beginShape();
    curveVertex(pts[n - 1][0], pts[n - 1][1]);
    for (var j = 0; j < n; j++) {
      curveVertex(pts[j][0], pts[j][1]);
    }
    curveVertex(pts[0][0], pts[0][1]);
    curveVertex(pts[1][0], pts[1][1]);
    endShape();
  }

  noStroke();
  fill(0, 100);
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
