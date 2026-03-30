// 07 — Amplitude · Frequency · Phase
// Three rows of stacked waves, each isolating one parameter.
// Light to dark: values increase from small to large.
// All rows use classic sine — only the highlighted parameter changes.

var WAVE = 'classic sine';
var N    = 5;
var t    = 0;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  noFill();
  strokeCap(ROUND);
  textFont('monospace');
  textAlign(LEFT, TOP);
}

function draw() {
  background(245);
  t += 0.012;

  var rowH = height / 3;
  var i, x, amp, freq, ph;

  // ── Row 1: amplitude ──────────────────────────────────────
  for (i = 0; i < N; i++) {
    amp = map(i, 0, N - 1, 5, rowH * 0.42);
    stroke(0, 0, 0, map(i, 0, N - 1, 45, 210));
    strokeWeight(1.2);
    beginShape();
    for (x = 0; x <= width; x += 4) {
      vertex(x, rowH * 0.5 + Waves.wave(x * 0.016, {
        wave: WAVE, t: t, amplitude: amp, frequency: 1.2
      }));
    }
    endShape();
  }

  // ── Row 2: frequency ─────────────────────────────────────
  for (i = 0; i < N; i++) {
    freq = map(i, 0, N - 1, 0.4, 2.8);
    stroke(0, 0, 0, map(i, 0, N - 1, 45, 210));
    strokeWeight(1.2);
    beginShape();
    for (x = 0; x <= width; x += 4) {
      vertex(x, rowH * 1.5 + Waves.wave(x * 0.016, {
        wave: WAVE, t: t, amplitude: rowH * 0.10, frequency: freq
      }));
    }
    endShape();
  }

  // ── Row 3: phase ─────────────────────────────────────────
  for (i = 0; i < N; i++) {
    ph = map(i, 0, N - 1, 0, TWO_PI * 0.85);
    stroke(0, 0, 0, map(i, 0, N - 1, 45, 210));
    strokeWeight(1.2);
    beginShape();
    for (x = 0; x <= width; x += 4) {
      vertex(x, rowH * 2.5 + Waves.wave(x * 0.016, {
        wave: WAVE, t: t, amplitude: rowH * 0.10, frequency: 1.2, phase: ph
      }));
    }
    endShape();
  }

  // ── Dividers & labels ────────────────────────────────────
  stroke(0, 0, 0, 18);
  strokeWeight(1);
  line(0, rowH,     width, rowH);
  line(0, rowH * 2, width, rowH * 2);

  noStroke();
  fill(0, 0, 0, 70);
  textSize(9);
  text('amplitude', 6, rowH * 0 + 6);
  text('frequency', 6, rowH * 1 + 6);
  text('phase',     6, rowH * 2 + 6);
}
