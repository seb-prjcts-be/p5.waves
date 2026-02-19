let t = 0;

function setup() {
  createCanvas(600, 600);
  noStroke();
  fill(0);

  Waves.setWaveParams({
    axis: 'x',
    amplitude: 120,
    select: 'classic sine',
    normalize: true,
    range: [-1, 1],
    refresh: 2
  });
}

function draw() {
  background(245);

  for (let y = 0; y < height; y += 10) {
    const x = Waves.wave(y + t, 'squarePulse', 1, {
      axis: 'x',
      amplitude: 160,
      frequency: 1.1,
      phase: 0.15,
      mode: 'wild',
      unpredictability: 0.45,
      modulation: {
        shape: 'triangle',
        frequency: 0.2,
        phase: 0.1,
        phaseDepth: 0.16,
        amplitudeDepth: 0.22
      },
      normalize: true,
      range: [-1, 1]
    });
    circle(width / 2 + x, y, 5);
  }

  t += 0.01;
}
