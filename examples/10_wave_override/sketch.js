// 10 — Wild Storm
// Same wave formula, left=smooth, right=wild mode.
// mode:'wild' + unpredictability:0.65 injects structured noise.

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  noStroke();
}

function draw() {
  background(245);
  const t = frameCount * 0.014;

  for (let y = 0; y < height; y += 7) {
    // ── Left — smooth ──
    const xs = Waves.wave(y * 0.014, {
      wave:  'plasma',
      t:     t,
      range: [10, width / 2 - 10]
    });
    fill(0, 0, 0, 180);
    circle(xs, y, 5);

    // ── Right — wild ──
    const xw = Waves.wave(y * 0.014, {
      wave:             'plasma',
      t:                t,
      mode:             'wild',
      unpredictability:  0.65,
      range:            [width / 2 + 10, width - 10]
    });
    fill(0, 0, 0, 180);
    circle(xw, y, 5);
  }

  // centre divider
  stroke(0, 0, 0, 40);
  strokeWeight(1);
  line(width / 2, 0, width / 2, height);
  noStroke();

  // labels
  fill(0, 0, 0, 110);
  textSize(10);
  textAlign(CENTER);
  textFont('monospace');
  text('smooth', width / 4, 14);
  text('wild', 3 * width / 4, 14);
}
