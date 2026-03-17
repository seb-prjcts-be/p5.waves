// 12 — Wave Color Field
// Two waves interfere across x and y axes to drive hue and brightness.
// wave(x+y) and wave(x-y) create diagonal color landscapes —
// not stripes, but a 2D flowing field that shifts as t advances.

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  colorMode(HSB, 360, 100, 100);
  noStroke();
}

function draw() {
  const t    = frameCount * 0.007;
  const step = 4;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const hue = Waves.wave(x * 0.007 + y * 0.005, {
        wave:  'meta sine',
        t:     t,
        range: [0, 360]
      });
      const bri = Waves.wave(x * 0.005 - y * 0.007, {
        wave:  'wobble sine',
        t:     t * 0.6,
        range: [45, 95]
      });
      fill(hue, 72, bri);
      rect(x, y, step, step);
    }
  }
}
