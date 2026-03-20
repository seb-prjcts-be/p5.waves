// 15 — Morph Wave
// wave: ['a', 'b'] + animated mix crossfades between two formulas.
// Each panel morphs a different pair at its own speed.

const PAIRS = [
  ['classic sine',  'triangle'],
  ['mountain peaks','noise'],
  ['stepped sine',  'wobble sine'],
  ['sharp peaks',   'smooth solid sine']
];
const SPEEDS = [0.008, 0.013, 0.006, 0.010];

let t = 0;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  noFill();
  textFont('monospace');
  textSize(8);
}

function draw() {
  background(245);
  t += 0.012;
  const pw = width / PAIRS.length;

  for (let i = 0; i < PAIRS.length; i++) {
    const mix = (sin(frameCount * SPEEDS[i]) + 1) * 0.5;
    const cx  = pw * i + pw * 0.5;

    // panel divider
    stroke(0, 0, 0, 35);
    strokeWeight(0.5);
    line(pw * i, 0, pw * i, height);

    // wave line
    stroke(0);
    strokeWeight(1.4);
    beginShape();
    for (let y = 10; y < height - 28; y += 2) {
      const x = Waves.wave(y * 0.014, {
        wave: [PAIRS[i][0], PAIRS[i][1]],
        mix:  mix,
        t:    t,
        amplitude: pw * 0.40
      });
      vertex(cx + x, y);
    }
    endShape();

    // wave name labels
    noStroke();
    fill(0);
    textAlign(CENTER);
    text(PAIRS[i][0], cx, height - 20);
    text(PAIRS[i][1], cx, height - 10);

    // mix progress bar
    const barW = pw - 16;
    const barX = pw * i + 8;
    fill(220);
    noStroke();
    rect(barX, height - 33, barW, 3);
    fill(0);
    rect(barX, height - 33, barW * mix, 3);
  }
}
