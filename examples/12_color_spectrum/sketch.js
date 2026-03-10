// 12 — Chromatic Drift
// Wave output drives hue and saturation in HSB mode.
// No x/y position output — the wave value IS the color.

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  colorMode(HSB, 360, 100, 100);
  noStroke();
}

function draw() {
  const t = frameCount * 0.008;
  for (let y = 0; y < height; y += 2) {
    const hue = Waves.wave(y * 0.015, {
      wave:  'classic sine',
      t:     t,
      range: [0, 360]
    });
    const sat = Waves.wave(y * 0.015, {
      wave:  'wobble sine',
      t:     t * 0.6,
      range: [30, 100]
    });
    fill(hue, sat, 88);
    rect(0, y, width, 2);
  }
}
