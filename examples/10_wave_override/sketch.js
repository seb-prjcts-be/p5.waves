// 10 — Wild mode
// mode: 'wild' with unpredictability adds noise-driven variation.
// frequency and phase shape the input before the formula runs.

function setup() {
  createCanvas(600, 600);
  noStroke();
  fill(0);
}

function draw() {
  background(245);
  const t = frameCount * 0.01;

  for (let y = 0; y < height; y += 10) {
    const x = Waves.wave(y, {
      wave:            'pulse',
      t:               t,
      frequency:       1.1,
      phase:           0.15,
      mode:            'wild',
      unpredictability: 0.45,
      range:           [-160, 160]
    });
    circle(width / 2 + x, y, 5);
  }
}
