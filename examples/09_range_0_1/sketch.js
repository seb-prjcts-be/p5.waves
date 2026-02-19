let t = 0;

function setup() {
  createCanvas(600, 600);
  noStroke();
  fill(0);

  Waves.setWaveParams({
    axis: 'x',
    amplitude: 1,
    select: 'classic sine',
    normalize: true,
    range: [0, 1]
  });
}

function draw() {
  background(245);

  for (let y = 0; y < height; y += 10) {
    const x01 = Waves.wave(y + t);
    circle(x01 * width, y, 5);
  }

  t += 0.01;
}
