// Not So Random Walker
// No angles, no steps — wave output IS the velocity.
// Five trails ride two shift-samplers as raw displacement.
// When formulas shift, movement character transforms entirely.

let xWave, yWave;
const WALKERS = 5;
let wx = [], wy = [], prevX = [], prevY = [];
let t = 0;
let trail;

// R, G, B, yellow, purple
const palette = [
  [255, 60, 60],
  [60, 220, 60],
  [60, 100, 255],
  [255, 220, 40],
  [180, 60, 255]
];

function setup() {
  createCanvas(460, 460).parent('sketch-container'); // remove .parent() for local use
  trail = createGraphics(460, 460);
  trail.background(15);

  xWave = Waves.createSampler({
    shift: true,
    shiftInterval: 4,
    shiftDuration: 1.5,
    amplitude: 2.5,
    frequency: 0.7,
    seed: 0
  });

  yWave = Waves.createSampler({
    shift: true,
    shiftInterval: 5,
    shiftDuration: 1.2,
    amplitude: 2.5,
    frequency: 0.55,
    seed: 77
  });

  for (let i = 0; i < WALKERS; i++) {
    const a = TWO_PI * i / WALKERS;
    wx[i] = width / 2 + cos(a) * 40;
    wy[i] = height / 2 + sin(a) * 40;
    prevX[i] = wx[i];
    prevY[i] = wy[i];
  }
}

function draw() {
  // Fade the trail buffer
  trail.noStroke();
  trail.fill(15, 15, 15, 8);
  trail.rect(0, 0, trail.width, trail.height);

  t += 0.025;

  for (let i = 0; i < WALKERS; i++) {
    const phase = i * 6.7;

    // Wave output IS velocity — no angle, no step
    const vx = xWave.sample(t * 1.8 + phase, t);
    const vy = yWave.sample(t * 2.1 + phase * 1.3, t);

    prevX[i] = wx[i];
    prevY[i] = wy[i];

    wx[i] += vx;
    wy[i] += vy;

    // Wrap at edges
    if (wx[i] < 0) wx[i] += width;
    if (wx[i] > width) wx[i] -= width;
    if (wy[i] < 0) wy[i] += height;
    if (wy[i] > height) wy[i] -= height;

    // Skip wrap-around lines
    if (abs(wx[i] - prevX[i]) > width / 2) continue;
    if (abs(wy[i] - prevY[i]) > height / 2) continue;

    const col = palette[i];
    trail.stroke(col[0], col[1], col[2], 200);
    trail.strokeWeight(2.5);
    trail.line(prevX[i], prevY[i], wx[i], wy[i]);
  }

  image(trail, 0, 0);

  // Show active wave pair
  noStroke();
  fill(255, 255, 255, 120);
  textSize(10);
  textFont('monospace');
  textAlign(LEFT);
  text(xWave.waveName + ' \u00d7 ' + yWave.waveName, 8, 16);
}
