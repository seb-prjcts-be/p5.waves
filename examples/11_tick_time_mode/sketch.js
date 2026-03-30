// 11 — Time Strata
// Time is a plain number — full manual control.
// Mouse X scrubs a time window; each layer is frozen at its own t.

const LAYERS      = 16;
const WAVE_WINDOW = 6;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  noFill();
}

function draw() {
  background(245);
  const timeBase = map(mouseX, 0, width, 0, 8);

  for (let i = 0; i < LAYERS; i++) {
    const t     = timeBase + (i / LAYERS) * WAVE_WINDOW;
    const y0    = map(i, 0, LAYERS - 1, 40, height - 40);
    const alpha = map(i, 0, LAYERS - 1, 200, 40);
    const sw    = map(i, 0, LAYERS - 1, 2,   0.5);

    stroke(0, 0, 0, alpha);
    strokeWeight(sw);

    beginShape();
    for (let x = 0; x <= width; x += 3) {
      const dy = Waves.wave(x * 0.015, {
        wave:      'classic sine',
        t:         t,
        amplitude: 55
      });
      vertex(x, y0 + dy);
    }
    endShape();
  }

  // time cursor label
  noStroke();
  fill(0, 0, 0, 90);
  textSize(10);
  textAlign(LEFT);
  textFont('monospace');
  text('t = ' + map(mouseX, 0, width, 0, 8).toFixed(2), 12, 14);
}
