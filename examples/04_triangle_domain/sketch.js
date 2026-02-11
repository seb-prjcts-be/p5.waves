let t = 0;

function setup() {
  createCanvas(600, 600);

  Waves.setWaveParams({
    axis: 'x',
    amplitude: 140,
    select: '',
    normalize: true,
    range: [-1, 1],
    domain: [-300, 300],
    samples: 512
  });
}

function draw() {
  background(245);

  for (let y = 0; y < height; y += 10) {
    const yy = map(y, 0, height, -300, 300);
    const x = Waves.wave(yy + t * 30);
    circle(width / 2 + x, y, 5);
  }

  t += 0.01;
}


