// 22 — Particle Forces
// Wave-driven particle systems. Waves determine force direction and magnitude.
// Switch between smoke, dust, confetti, fireflies, snow, sparks.

var PRESETS = [
  { label: 'smoke',     wave: 'noise',           n: 300, size: [2, 5],  speed: 0.8,  alpha: [20, 80],   gravity: -0.3, color: [80, 80, 90],    drift: 0.5,  freq: 0.5  },
  { label: 'dust',      wave: 'classic sine',    n: 200, size: [1, 3],  speed: 0.3,  alpha: [30, 100],  gravity: 0.05, color: [160, 140, 110],  drift: 0.8,  freq: 0.7  },
  { label: 'confetti',  wave: 'wobble sine',     n: 150, size: [3, 8],  speed: 1.2,  alpha: [150, 255], gravity: 0.6,  color: null,             drift: 1.5,  freq: 1.2  },
  { label: 'fireflies', wave: 'bumpy sine',      n: 80,  size: [2, 5],  speed: 0.5,  alpha: [80, 220],  gravity: 0,    color: [200, 220, 80],   drift: 1.0,  freq: 0.9  },
  { label: 'snow',      wave: 'stepped sine',    n: 250, size: [2, 6],  speed: 0.6,  alpha: [100, 220], gravity: 0.4,  color: [220, 225, 240],  drift: 0.6,  freq: 0.4  },
  { label: 'sparks',    wave: 'fuzzy pulse',     n: 180, size: [1, 3],  speed: 2.0,  alpha: [100, 255], gravity: 0.8,  color: [255, 160, 40],   drift: 2.0,  freq: 2.0  }
];

var current   = 0;
var particles = [];
var t = 0;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  noStroke();
  spawnParticles();
  buildButtons();
}

function spawnParticles() {
  particles = [];
  var p = PRESETS[current];
  for (var i = 0; i < p.n; i++) {
    particles.push({
      x:    random(width),
      y:    random(height),
      seed: i,
      sz:   random(p.size[0], p.size[1]),
      hue:  random(360)
    });
  }
}

function draw() {
  var p = PRESETS[current];
  t += 0.012;

  var bgAlpha = (p.label === 'fireflies') ? 30 : 40;
  var bgColor = (p.label === 'fireflies') ? 20 : 245;
  background(bgColor, bgAlpha);

  for (var i = 0; i < particles.length; i++) {
    var pt = particles[i];

    var forceX = Waves.wave(pt.y * 0.01 + pt.seed * 0.1, {
      wave:      p.wave,
      t:         t + pt.seed * 0.05,
      amplitude: p.drift,
      frequency: p.freq
    });

    var forceY = Waves.wave(pt.x * 0.01 + pt.seed * 0.2, {
      wave:      p.wave,
      t:         t * 0.8 + pt.seed * 0.07,
      amplitude: p.speed,
      frequency: p.freq * 0.8
    });

    pt.x += forceX;
    pt.y += forceY + p.gravity;

    if (pt.y < -10)     pt.y = height + 10;
    if (pt.y > height + 10) pt.y = -10;
    if (pt.x < -10)     pt.x = width + 10;
    if (pt.x > width + 10)  pt.x = -10;

    var alpha = map(pt.sz, p.size[0], p.size[1], p.alpha[0], p.alpha[1]);
    if (p.color) {
      fill(p.color[0], p.color[1], p.color[2], alpha);
    } else {
      colorMode(HSB, 360, 100, 100, 255);
      fill(pt.hue, 80, 95, alpha);
      colorMode(RGB, 255);
    }

    circle(pt.x, pt.y, pt.sz);
  }

  fill(bgColor === 20 ? 200 : 0, 100);
  textFont('monospace');
  textSize(11);
  textAlign(CENTER);
  text(p.label, width / 2, height - 10);
}

function buildButtons() {
  var bar = document.createElement('div');
  bar.className = 'mood-bar';
  for (var i = 0; i < PRESETS.length; i++) {
    var btn = document.createElement('button');
    btn.textContent = PRESETS[i].label;
    btn.dataset.idx = i;
    btn.onclick = function() {
      current = +this.dataset.idx;
      spawnParticles();
    };
    bar.appendChild(btn);
  }
  var container = document.getElementById('sketch-container');
  container.parentNode.insertBefore(bar, container);
}
