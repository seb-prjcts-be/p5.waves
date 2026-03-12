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
    [
      { mode: 'stable', range: [10, width / 2 - 10] },
      { mode: 'wild',   range: [width / 2 + 10, width - 10] }
    ].forEach(({ mode, range }) => {
      const x = Waves.wave(y * 0.014, { wave: 'mountain peaks', t, mode, unpredictability: 0.65, range });
      fill(0, 0, 0, 180);
      circle(x, y, 5);
    });
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
