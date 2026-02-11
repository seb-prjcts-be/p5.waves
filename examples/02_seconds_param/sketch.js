let t = 0;

function setup() {
  createCanvas(600, 600);

  Waves.setWaveParams({
    axis: 'x',
    amplitude: 120,
    seconds: 1,
    normalize: true,
    range: [-1, 1],
    domain: [0, 600],
    samples: 512
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


