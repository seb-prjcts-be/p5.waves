// Time Strata
// Time is a plain number - full manual control.
// Mouse X scrubs a time window; each layer is frozen at its own t.
// Layers are filled ribbons with HSB color, creating geological strata.

const LAYERS      = 16;
const WAVE_WINDOW = 6;

function setup() {
  createCanvas(460, 460).parent('sketch-container'); // remove .parent() for local use
  colorMode(HSB, 360, 100, 100, 255);
}

function draw() {
  background(0, 0, 96);
  const timeBase = map(mouseX, 0, width, 0, 24);

  noStroke();
  for (let i = LAYERS - 1; i >= 0; i--) {
    const layerT = timeBase + (i / LAYERS) * WAVE_WINDOW;
    const y0     = map(i, 0, LAYERS - 1, 50, height - 50);
    const wHue   = (i * 22) % 360;
    const alphaVal = map(i, 0, LAYERS - 1, 200, 60);

    const freq = 0.6 + i * 0.08;
    fill(wHue, 70, 85, alphaVal);
    beginShape();
    for (let x = 0; x <= width; x += 3) {
      const dy = Waves.wave(x * 0.15, {
        wave:      'classic sine',
        t:         layerT,
        amplitude: 25,
        frequency: freq
      });
      vertex(x, y0 + dy);
    }
    for (let x2 = width; x2 >= 0; x2 -= 3) {
      const dy2 = Waves.wave(x2 * 0.15, {
        wave:      'classic sine',
        t:         layerT + 0.3,
        amplitude: 15,
        frequency: freq
      });
      vertex(x2, y0 + dy2 + 22);
    }
    endShape(CLOSE);
  }

  // time cursor label
  fill(0);
  noStroke();
  textSize(10);
  textAlign(LEFT);
  textFont('monospace');
  text('t = ' + nf(map(mouseX, 0, width, 0, 24), 1, 2), 12, 20);
  text('move mouse', 12, 34);
}
