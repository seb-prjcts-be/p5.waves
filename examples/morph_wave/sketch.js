// Morph Wave
// A field of horizontal lines where each row blends two wave formulas.
// Top rows = pure waveA. Bottom rows = pure waveB. Middle = the morph.
// The blend sweeps up and down over time — you see the shape transform.

const WAVE_A = 'wobble sine';
const WAVE_B = 'meta sine';
const ROW_COUNT = 50;
let t = 0;

function setup() {
  createCanvas(460, 460).parent('sketch-container'); // remove .parent() for local use
}

function draw() {
  background(250);
  t += 0.0375;

  // the morph centre sweeps up and down
  const centre = (sin(t * 0.3) + 1) * 0.5;
  const rowH = height / ROW_COUNT;

  for (let row = 0; row < ROW_COUNT; row++) {
    const rowFrac = row / (ROW_COUNT - 1);
    // distance from the sweeping centre determines the mix
    const gap = abs(rowFrac - centre);
    const morphMix = constrain(1 - gap * 3, 0, 1);
    const yBase = row * rowH + rowH * 0.5;

    // waveA = blue, waveB = red — morph zone blends
    const r = round(lerp(0, 255, morphMix));
    const b = round(lerp(255, 0, morphMix));

    noFill();
    stroke(r, 0, b);
    strokeWeight(1.2 + morphMix * 1.8);
    beginShape();
    for (let x = 0; x < width; x += 3) {
      const waveY = Waves.wave(x, {
        wave: [WAVE_A, WAVE_B],
        mix:  morphMix,
        t:    t + row * 0.06,
        frequency: 0.08,
        amplitude: rowH * 2.5
      });
      vertex(x, yBase + constrain(waveY, -rowH * 0.7, rowH * 0.7));
    }
    endShape();
  }

  // labels
  noStroke();
  fill(0, 0, 255);
  textSize(10);
  textFont('monospace');
  textAlign(LEFT);
  text(WAVE_A, 8, 16);
  fill(255, 0, 0);
  textAlign(RIGHT);
  text(WAVE_B, width - 8, height - 8);
}
