let t = 0;

function setup() {
  createCanvas(600, 600);
  noStroke();
  fill(0);

  Waves.setWaveParams({
    axis: 'x',
    amplitude: 120,
    frequency: 0.012,
    mode: 'wild',
    unpredictability: 0.45,
    seconds: 1.25,
    normalize: true,
    range: [-1, 1]
  });
}

function draw() {
  background(245, 30);

  for (let y = 0; y < height; y += 10) {
    const x = Waves.wave(y + t);
    circle(width / 2 + x, y, 5);
  }

  t += 0.01;
}