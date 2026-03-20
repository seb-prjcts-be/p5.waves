// 23 — Poster Generator
// Wave-driven graphic design. Text, margins, ornaments, and layout
// are all positioned and distorted by wave formulas.

var waveIdx   = 0;
var t         = 0;
var titleText = 'WAVES';
var subText   = 'structured surprise';

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  textFont('monospace');
  buildControls();
}

function draw() {
  t += 0.008;
  background(245);

  var margin = 40;
  var innerW = width  - margin * 2;
  var innerH = height - margin * 2;

  drawBorder(margin, innerW, innerH);
  drawOrnaments(margin, innerW, innerH);
  drawTitle(margin, innerW, innerH);
  drawSubtitle(margin, innerW, innerH);
  drawFooterLines(margin, innerW, innerH);
}

function drawBorder(margin, innerW, innerH) {
  noFill();
  stroke(0, 40);
  strokeWeight(1);
  beginShape();
  for (var x = margin; x <= margin + innerW; x += 3) {
    var wobble = Waves.wave(x * 0.03, { wave: waveIdx, t: t, amplitude: 3 });
    vertex(x, margin + wobble);
  }
  endShape();
  beginShape();
  for (var x = margin; x <= margin + innerW; x += 3) {
    var wobble = Waves.wave(x * 0.03, { wave: waveIdx, t: t + 5, amplitude: 3 });
    vertex(x, margin + innerH + wobble);
  }
  endShape();
  beginShape();
  for (var y = margin; y <= margin + innerH; y += 3) {
    var wobble = Waves.wave(y * 0.03, { wave: waveIdx, t: t + 2, amplitude: 3 });
    vertex(margin + wobble, y);
  }
  endShape();
  beginShape();
  for (var y = margin; y <= margin + innerH; y += 3) {
    var wobble = Waves.wave(y * 0.03, { wave: waveIdx, t: t + 7, amplitude: 3 });
    vertex(margin + innerW + wobble, y);
  }
  endShape();
}

function drawOrnaments(margin, innerW, innerH) {
  noFill();
  var ornY = margin + innerH * 0.35;
  for (var layer = 0; layer < 3; layer++) {
    var alpha = map(layer, 0, 2, 25, 60);
    stroke(0, alpha);
    strokeWeight(0.6);
    beginShape();
    for (var x = margin + 20; x <= margin + innerW - 20; x += 2) {
      var v = Waves.wave(x * 0.015, {
        wave:      waveIdx,
        t:         t + layer * 1.5,
        amplitude: 15 + layer * 8,
        frequency: 1.2 - layer * 0.2
      });
      vertex(x, ornY + v + layer * 5);
    }
    endShape();
  }
}

function drawTitle(margin, innerW, innerH) {
  noStroke();
  var baseY = margin + innerH * 0.55;
  var baseSize = 52;
  var charW = baseSize * 0.65;
  var totalW = titleText.length * charW;
  var startX = margin + (innerW - totalW) * 0.5;

  for (var i = 0; i < titleText.length; i++) {
    var lift = Waves.wave(i * 2.5, {
      wave:      waveIdx,
      t:         t,
      amplitude: 12,
      frequency: 0.8
    });

    var sizeOff = Waves.wave(i * 1.8, {
      wave:      waveIdx,
      t:         t * 0.7,
      range:     [-6, 6]
    });

    var alpha = Waves.wave(i * 3.0, {
      wave:      waveIdx,
      t:         t * 1.2,
      range:     [120, 255]
    });

    fill(0, alpha);
    textSize(baseSize + sizeOff);
    textAlign(CENTER, CENTER);
    text(titleText[i], startX + i * charW + charW * 0.5, baseY + lift);
  }
}

function drawSubtitle(margin, innerW, innerH) {
  noStroke();
  var baseY = margin + innerH * 0.72;

  for (var i = 0; i < subText.length; i++) {
    var spacing = Waves.wave(i * 0.8, {
      wave:      waveIdx,
      t:         t * 0.5,
      range:     [8, 14]
    });

    var alpha = Waves.wave(i * 1.2, {
      wave:      waveIdx,
      t:         t * 0.9,
      range:     [60, 200]
    });

    fill(0, alpha);
    textSize(12);
    textAlign(LEFT, CENTER);
    var xPos = margin + 30;
    for (var j = 0; j < i; j++) {
      xPos += Waves.wave(j * 0.8, { wave: waveIdx, t: t * 0.5, range: [8, 14] });
    }
    if (xPos < margin + innerW - 20) {
      text(subText[i], xPos, baseY);
    }
  }
}

function drawFooterLines(margin, innerW, innerH) {
  stroke(0, 30);
  strokeWeight(0.5);
  var footY = margin + innerH * 0.88;
  for (var l = 0; l < 4; l++) {
    var y = footY + l * 8;
    var lineW = Waves.wave(l * 3, { wave: waveIdx, t: t, range: [innerW * 0.3, innerW * 0.9] });
    var xOff  = Waves.wave(l * 2, { wave: waveIdx, t: t * 0.6, range: [0, innerW * 0.3] });
    line(margin + xOff, y, margin + xOff + lineW, y);
  }
}

function buildControls() {
  var bar = document.createElement('div');
  bar.className = 'mood-bar';
  for (var i = 0; i < Waves.count; i++) {
    var btn = document.createElement('button');
    btn.textContent = i;
    btn.title = Waves.data[i].name;
    btn.dataset.idx = i;
    btn.onclick = function() { waveIdx = +this.dataset.idx; };
    bar.appendChild(btn);
  }
  var container = document.getElementById('sketch-container');
  container.parentNode.insertBefore(bar, container);
}
