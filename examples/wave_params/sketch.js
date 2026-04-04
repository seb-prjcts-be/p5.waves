// Wave Params
// Three rows isolate each parameter as filled wave ribbons.
// Each row uses a distinct hue; light to dark shows increasing values.

var WAVE = 'classic sine';
var N    = 5;
var t    = 0;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  textFont('monospace');
  textAlign(LEFT, TOP);
}

function draw() {
  background(245);
  t += 0.012;

  var rowH = height / 3;
  var i, x, amp, freq, ph, waveY;

  // ── Row 1: RED — amplitude ─────────────────────────────────
  for (i = 0; i < N; i++) {
    amp = map(i, 0, N - 1, 4, rowH * 0.21);
    var alphaVal = map(i, 0, N - 1, 60, 255);
    fill(255, 0, 0, alphaVal);
    noStroke();
    beginShape();
    for (x = 0; x <= width; x += 3) {
      waveY = Waves.wave(x * 0.016, {
        wave: WAVE, t: t, amplitude: amp, frequency: 1.2
      });
      vertex(x, rowH * 0.5 + waveY);
    }
    for (x = width; x >= 0; x -= 3) {
      waveY = Waves.wave(x * 0.016, {
        wave: WAVE, t: t, amplitude: amp, frequency: 1.2
      });
      vertex(x, rowH * 0.5 - waveY);
    }
    endShape(CLOSE);
  }

  // ── Row 2: GREEN — frequency ──────────────────────────────
  for (i = 0; i < N; i++) {
    freq = map(i, 0, N - 1, 0.4, 2.8);
    var alphaVal2 = map(i, 0, N - 1, 60, 255);
    fill(0, 255, 0, alphaVal2);
    noStroke();
    beginShape();
    for (x = 0; x <= width; x += 3) {
      waveY = Waves.wave(x * 0.016, {
        wave: WAVE, t: t, amplitude: rowH * 0.12, frequency: freq
      });
      vertex(x, rowH * 1.5 + waveY);
    }
    for (x = width; x >= 0; x -= 3) {
      waveY = Waves.wave(x * 0.016, {
        wave: WAVE, t: t, amplitude: rowH * 0.12, frequency: freq
      });
      vertex(x, rowH * 1.5 - waveY);
    }
    endShape(CLOSE);
  }

  // ── Row 3: BLUE — phase ──────────────────────────────────
  for (i = 0; i < N; i++) {
    ph = map(i, 0, N - 1, 0, TWO_PI * 0.85);
    var alphaVal3 = map(i, 0, N - 1, 60, 255);
    fill(0, 0, 255, alphaVal3);
    noStroke();
    beginShape();
    for (x = 0; x <= width; x += 3) {
      waveY = Waves.wave(x * 0.016, {
        wave: WAVE, t: t, amplitude: rowH * 0.12, frequency: 1.2, phase: ph
      });
      vertex(x, rowH * 2.5 + waveY);
    }
    for (x = width; x >= 0; x -= 3) {
      waveY = Waves.wave(x * 0.016, {
        wave: WAVE, t: t, amplitude: rowH * 0.12, frequency: 1.2, phase: ph
      });
      vertex(x, rowH * 2.5 - waveY);
    }
    endShape(CLOSE);
  }

  // ── Dividers & labels ────────────────────────────────────
  stroke(0, 0, 0, 18);
  strokeWeight(1);
  line(0, rowH,     width, rowH);
  line(0, rowH * 2, width, rowH * 2);

  noStroke();
  fill(0, 0, 0, 90);
  textSize(9);
  text('amplitude', 6, rowH * 0 + 6);
  text('frequency', 6, rowH * 1 + 6);
  text('phase',     6, rowH * 2 + 6);
}
