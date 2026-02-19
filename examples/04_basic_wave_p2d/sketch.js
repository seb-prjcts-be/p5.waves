let t = 0;

function setup() {
  createCanvas(600, 600, P2D);
  noStroke();
  fill(0);
}

function draw() {
  background(245);

  for (let y = 0; y < height; y += 10) {
    const x = Waves.wave(y + t, 'classic sine', null, {
      axis: 'x',
      amplitude: 120,
      normalize: true,
      range: [-1, 1]
    });
    circle(width / 2 + x, y, 5);
  }

  t += 0.01;
}
