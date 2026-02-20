// 09 — Range [0, 1]
// range: [0, 1] normalises the wave to 0..1.
// Use the result directly as a position fraction.

function setup() {
  createCanvas(600, 600);
  noStroke();
  fill(0);
}

function draw() {
  background(245);
  const t = frameCount * 0.01;

  for (let y = 0; y < height; y += 10) {
    const x01 = Waves.wave(y, {
      wave:  'classic sine',
      t:     t,
      range: [0, 1]
    });
    circle(x01 * width, y, 5);
  }
}
