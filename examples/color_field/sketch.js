// Color Field
// Two wave samplers with shift drive hue and brightness across a 2D field.
// Hue shifts every 4s, brightness every 5s — desynchronised for variety.

let hueSampler, briSampler;
let t = 0;

function setup() {
  createCanvas(460, 460).parent('sketch-container'); // remove .parent() for local use
  colorMode(HSB, 360, 100, 100);
  noStroke();

  hueSampler = Waves.createSampler({
    wave:          'meta sine',
    shift:         true,
    shiftInterval: 4,
    shiftDuration: 2,
    range:         [160, 320],
    seed:          0
  });

  briSampler = Waves.createSampler({
    wave:          'wobble sine',
    shift:         true,
    shiftInterval: 5,
    shiftDuration: 2,
    range:         [55, 90],
    seed:          7
  });
}

function draw() {
  t += 0.035;
  const cellSz = 8;

  for (let y = 0; y < height; y += cellSz) {
    for (let x = 0; x < width; x += cellSz) {
      const wHue = hueSampler.sample(x * 0.007 + y * 0.005, t);
      const wBri = briSampler.sample(x * 0.005 - y * 0.007, t * 0.6);
      fill(wHue, 72, wBri);
      rect(x, y, cellSz, cellSz);
    }
  }
}
