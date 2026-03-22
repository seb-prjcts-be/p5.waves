// 20 — One Scene, 34 Moods
// Identical grid of circles. Only the wave formula changes.
// The formula alone determines the atmosphere.

var CELLS   = 10;
var waveIdx = 0;
var auto    = true;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  noStroke();
  textFont('monospace');
  buildControls();
}

function draw() {
  background(245);

  if (auto && frameCount % 90 === 0) {
    waveIdx = (waveIdx + 1) % Waves.count;
    highlightActive();
  }

  var t     = frameCount * 0.012;
  var cellW = width  / CELLS;
  var cellH = height / CELLS;
  var maxR  = min(cellW, cellH) * 0.38;

  for (var row = 0; row < CELLS; row++) {
    for (var col = 0; col < CELLS; col++) {
      var cx = col * cellW + cellW * 0.5;
      var cy = row * cellH + cellH * 0.5;
      var idx = row * CELLS + col;

      var size = Waves.wave(idx * 0.6, {
        wave:  waveIdx,
        t:     t,
        range: [maxR * 0.2, maxR]
      });

      var luma = Waves.wave(idx * 0.9, {
        wave:  waveIdx,
        t:     t * 0.7,
        range: [30, 220]
      });

      var lift = Waves.wave(idx * 0.4, {
        wave:  waveIdx,
        t:     t * 1.3,
        range: [-cellH * 0.12, cellH * 0.12]
      });

      fill(luma);
      circle(cx, cy + lift, size * 2);
    }
  }

  fill(0, 100);
  textSize(10);
  textAlign(CENTER);
  text(Waves.data[waveIdx].name, width / 2, height - 10);
}

function buildControls() {
  var bar = document.createElement('div');
  bar.className = 'mood-bar';
  bar.id = 'wave-bar';
  for (var i = 0; i < Waves.count; i++) {
    var btn = document.createElement('button');
    btn.textContent = i;
    btn.title = Waves.data[i].name;
    btn.dataset.idx = i;
    btn.onclick = function() {
      waveIdx = +this.dataset.idx;
      auto = false;
      highlightActive();
    };
    bar.appendChild(btn);
  }
  var container = document.getElementById('sketch-container');
  container.parentNode.appendChild(bar);
  highlightActive();
}

function highlightActive() {
  var btns = document.querySelectorAll('#wave-bar button');
  for (var i = 0; i < btns.length; i++) {
    btns[i].style.background = (+btns[i].dataset.idx === waveIdx) ? '#111' : '#fff';
    btns[i].style.color      = (+btns[i].dataset.idx === waveIdx) ? '#fff' : '#333';
  }
}
