// 21 — Fabric
// Horizontal threads displaced by waves simulate different materials.
// Switch between silk, burlap, rubber, water, grass, cable.

var MATERIALS = [
  { label: 'silk',   wave: 'classic sine',      amp: 18,  freq: 0.9,  spacing: 3,  sw: 0.8, speed: 0.006, color: [180, 170, 200] },
  { label: 'water',  wave: 'wobble sine',        amp: 25,  freq: 0.7,  spacing: 4,  sw: 1.0, speed: 0.010, color: [80, 140, 200]  },
  { label: 'burlap', wave: 'zig-zag sine',       amp: 12,  freq: 2.0,  spacing: 5,  sw: 1.5, speed: 0.008, color: [160, 130, 90]  },
  { label: 'rubber', wave: 'bumpy sine',         amp: 30,  freq: 1.4,  spacing: 6,  sw: 2.0, speed: 0.012, color: [50, 50, 55]    },
  { label: 'grass',  wave: 'fuzzy peak sine',    amp: 35,  freq: 1.8,  spacing: 3,  sw: 0.7, speed: 0.015, color: [60, 130, 50]   },
  { label: 'cable',  wave: 'ramp up sine',       amp: 40,  freq: 1.2,  spacing: 8,  sw: 2.5, speed: 0.005, color: [40, 40, 45]    }
];

var current = 0;
var t = 0;
var pinL = 0.15;
var pinR = 0.85;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  noFill();
  strokeCap(ROUND);
  buildButtons();
}

function draw() {
  var m = MATERIALS[current];
  t += m.speed;

  background(245);

  var topY  = height * 0.12;
  var botY  = height * 0.88;
  var leftX = width * pinL;
  var rightX = width * pinR;

  for (var y = topY; y <= botY; y += m.spacing) {
    var frac  = map(y, topY, botY, 0, 1);
    var sag   = sin(frac * PI) * m.amp * 1.5;
    var alpha = map(frac, 0, 1, 200, 100);

    stroke(m.color[0], m.color[1], m.color[2], alpha);
    strokeWeight(m.sw);

    beginShape();
    for (var x = leftX; x <= rightX; x += 3) {
      var xFrac   = map(x, leftX, rightX, 0, 1);
      var pinMask = sin(xFrac * PI);

      var dx = Waves.wave(x * 0.02 + y * 0.01, {
        wave:      m.wave,
        t:         t + frac * 2,
        amplitude: m.amp * pinMask,
        frequency: m.freq
      });

      var dy = sag * pinMask;

      vertex(x + dx * 0.3, y + dy + dx * 0.7);
    }
    endShape();
  }

  noStroke();
  fill(80);
  circle(leftX, topY, 6);
  circle(rightX, topY, 6);

  fill(0, 100);
  textFont('monospace');
  textSize(11);
  textAlign(CENTER);
  text(m.label, width / 2, height - 10);
}

function buildButtons() {
  var bar = document.createElement('div');
  bar.className = 'mood-bar';
  for (var i = 0; i < MATERIALS.length; i++) {
    var btn = document.createElement('button');
    btn.textContent = MATERIALS[i].label;
    btn.dataset.idx = i;
    btn.onclick = function() { current = +this.dataset.idx; };
    bar.appendChild(btn);
  }
  var container = document.getElementById('sketch-container');
  container.parentNode.insertBefore(bar, container);
}
