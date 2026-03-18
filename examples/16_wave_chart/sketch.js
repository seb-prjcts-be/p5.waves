// 16 — Wave Chart Gallery
// 34 wave formulas as scrolling miniature waveforms in a 6×6 grid.
// Hover over any panel to expand it — see the formula name and a playhead dot.

var COLS      = 6;
var N         = 0;
var waveNames = [];
var hoveredWave   = -1;

var PANEL_W = 0;
var PANEL_H = 0;
var EXP_H   = 160;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  N         = Waves.count;          // 34
  PANEL_W   = floor(width / COLS);  // 76
  PANEL_H   = PANEL_W;              // square cells

  var list = Waves.list();
  for (var i = 0; i < list.length; i++) {
    waveNames[i] = list[i].name;
  }

  strokeCap(ROUND);
  textFont('monospace');
}

function draw() {
  background(245);

  var t       = frameCount * 0.012;
  var rows    = ceil(N / COLS);      // 6
  var hasFocus = (hoveredWave >= 0 && hoveredWave < N);
  var miniY0  = hasFocus ? EXP_H + 4 : 0;
  var miniH   = hasFocus ? floor((height - miniY0) / rows) : PANEL_H;

  colorMode(HSB, N, 100, 100);

  // ── Mini grid ──────────────────────────────────────────────────────────────
  for (var i = 0; i < N; i++) {
    var col = i % COLS;
    var row = floor(i / COLS);
    var px  = col * PANEL_W;
    var py  = miniY0 + row * miniH;
    var pw  = PANEL_W - 2;
    var ph  = miniH - 2;

    noStroke();
    fill(i, 18, 97);
    rect(px + 1, py + 1, pw, ph);

    stroke(i, 65, 58);
    strokeWeight(1.2);
    noFill();
    drawWaveLine(i, t, px + 1, py + 1, pw, ph, 0.30);

    noStroke();
    fill(0, 0, 45, 70);
    textSize(6);
    textAlign(LEFT, BOTTOM);
    text(i, px + 4, py + ph - 1);
  }

  // ── Expanded focus panel ───────────────────────────────────────────────────
  if (hasFocus) {
    var fi = hoveredWave;

    noStroke();
    fill(fi, 22, 96);
    rect(0, 0, width, EXP_H);

    // Baseline
    stroke(fi, 30, 68, 50);
    strokeWeight(0.5);
    line(0, EXP_H / 2, width, EXP_H / 2);

    // Full-width waveform
    stroke(fi, 70, 52);
    strokeWeight(2);
    noFill();
    drawWaveLine(fi, t, 0, 0, width, EXP_H, 0.78);

    // Playhead dot — the original single-point value, now in context
    var tFrac = (t * 0.5) % 1.0;
    var dotX  = tFrac * width;
    var dotV  = Waves.wave(
      map(tFrac, 0, 1, 0, width),
      { wave: fi, t: t, range: [EXP_H * 0.11, EXP_H * 0.89] }
    );
    noStroke();
    fill(fi, 80, 52);
    circle(dotX, dotV, 8);

    // Wave name + index
    noStroke();
    fill(0, 0, 28);
    textSize(10);
    textAlign(LEFT, TOP);
    text('wave: ' + fi + '  ' + waveNames[fi], 10, 9);
  }

  colorMode(RGB, 255);

  // ── Hover detection (runs every frame so layout vars are current) ──────────
  var newFocus = -1;
  if (mouseX >= 0 && mouseX < width) {
    if (hasFocus && mouseY >= 0 && mouseY < EXP_H) {
      newFocus = hoveredWave;
    } else if (mouseY >= miniY0 && mouseY < height) {
      var mc = floor(mouseX / PANEL_W);
      var mr = floor((mouseY - miniY0) / miniH);
      var mi = mr * COLS + mc;
      if (mi >= 0 && mi < N) {
        newFocus = mi;
      }
    }
  }
  hoveredWave = newFocus;
}

// Draw one formula as a polyline inside the box (bx, by, bw, bh).
// ampFrac: fraction of bh used as half-amplitude.
function drawWaveLine(waveIndex, t, bx, by, bw, bh, ampFrac) {
  var midY = by + bh * 0.5;
  var amp  = bh * ampFrac * 0.5;
  var stride = max(1, floor(bw / 80));

  beginShape();
  for (var x = 0; x <= bw; x += stride) {
    var inputX = map(x, 0, bw, 0, 28) + t * 28;
    var v      = Waves.wave(inputX, { wave: waveIndex, range: [-amp, amp] });
    vertex(bx + x, midY + v);
  }
  endShape();
}
