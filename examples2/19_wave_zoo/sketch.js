// 19 — Wave Zoo
// Each of the 34 waves is a creature with a name, temperament, and animated portrait.

var TEMPERAMENTS = [
  'serene',      'gentle',      'bold',        'rigid',
  'startled',    'precise',     'majestic',    'melancholic',
  'jagged',      'theatrical',  'balanced',    'volatile',
  'decisive',    'warm',        'layered',     'restless',
  'chaotic',     'hypnotic',    'angular',     'steady',
  'climbing',    'descending',  'fading',      'growing',
  'organic',     'electric',    'pulsing',     'stubborn',
  'nervous',     'ascending',   'torn',        'lively',
  'wandering',   'smooth'
];

var COLS = 6;
var ROWS;
var cellW, cellH;
var hoveredIdx = -1;

function setup() {
  ROWS = ceil(Waves.count / COLS);
  createCanvas(460, 460).parent('sketch-container');
  cellW = width / COLS;
  cellH = height / ROWS;
  textFont('monospace');
}

function draw() {
  background(248);
  var t = frameCount * 0.012;

  hoveredIdx = -1;
  if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
    var mc = floor(mouseX / cellW);
    var mr = floor(mouseY / cellH);
    if (mc < COLS && mr < ROWS) {
      var idx = mr * COLS + mc;
      if (idx < Waves.count) hoveredIdx = idx;
    }
  }

  for (var i = 0; i < Waves.count; i++) {
    var col = i % COLS;
    var row = floor(i / COLS);
    var x0  = col * cellW;
    var y0  = row * cellH;
    var midY = y0 + cellH * 0.5;
    var hovered = (i === hoveredIdx);

    noStroke();
    if (hovered) {
      fill(30);
      rect(x0, y0, cellW, cellH);
    }

    colorMode(HSB, Waves.count, 100, 100);
    stroke(i, hovered ? 80 : 50, hovered ? 95 : 70);
    strokeWeight(hovered ? 2.2 : 1.2);
    noFill();

    var amp = cellH * 0.28;
    beginShape();
    for (var px = 2; px < cellW - 2; px += 2) {
      var v = Waves.wave(map(px, 0, cellW, 0, 20) + t * 12, {
        wave:  i,
        range: [-amp, amp]
      });
      vertex(x0 + px, midY + v);
    }
    endShape();
    colorMode(RGB, 255);

    noStroke();
    fill(hovered ? 220 : 120);
    textSize(hovered ? 7.5 : 5.5);
    textAlign(LEFT, BOTTOM);
    text(Waves.data[i].name, x0 + 3, y0 + cellH - 3);

    if (hovered) {
      fill(180);
      textSize(5.5);
      textAlign(LEFT, TOP);
      text(TEMPERAMENTS[i] || '', x0 + 3, y0 + 3);
    }
  }

  stroke(0, 30);
  strokeWeight(0.5);
  for (var c = 1; c < COLS; c++) line(c * cellW, 0, c * cellW, height);
  for (var r = 1; r < ROWS; r++) line(0, r * cellH, width, r * cellH);
}
