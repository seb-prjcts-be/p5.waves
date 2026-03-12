// 14 — Breathing Type
// Five createSampler() calls drive letter size independently.
// A second wave controls vertical lift per character.
// No spatial position output — wave values are typographic properties.

const WORD = 'WAVES';

const sizeSamplers = [];
for (let i = 0; i < 5; i++) {
  sizeSamplers.push(Waves.createSampler({ seed: i * 7, range: [28, 96] }));
}

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  textAlign(CENTER, CENTER);
  textFont('monospace');
  noStroke();
}

function draw() {
  background(245);
  const t = frameCount * 0.018;

  // First pass: measure total width for centering
  const sizes = [];
  for (let i = 0; i < WORD.length; i++) sizes.push(sizeSamplers[i].sample(i * 0.6, t));
  let totalW = 0;
  for (let i = 0; i < sizes.length; i++) totalW += sizes[i] * 0.72;

  let x = (width - totalW) / 2 + sizes[0] * 0.36;

  for (let i = 0; i < WORD.length; i++) {
    const sz    = sizes[i];
    const lift  = Waves.wave(i * 0.9 + t * 0.6,  { seed: i + 20, range: [-38, 38] });
    const alpha = Waves.wave(i * 1.1 + t * 0.35, { seed: i + 40, range: [80, 255] });

    textSize(sz);
    fill(0, 0, 0, alpha);
    text(WORD[i], x, height / 2 + lift);

    x += sz * 0.72;
  }
}
