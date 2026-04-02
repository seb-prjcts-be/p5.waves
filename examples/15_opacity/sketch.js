// 15 — Morph Wave
// wave: ['a', 'b'] + animated mix crossfades between two formulas.
// Each panel morphs a different pair at its own speed.

var PAIRS = [
  ['classic sine',  'triangle'],
  ['mountain peaks','wobble sine'],
  ['stepped sine',  'bumpy sine'],
  ['sharp peaks',   'smooth solid sine']
];
var SPEEDS = [0.025, 0.018, 0.022, 0.015];

var t = 0;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  textFont('monospace');
  textSize(8);
}

function draw() {
  background(245);
  t += 0.012;
  var pw = width / PAIRS.length;

  for (var i = 0; i < PAIRS.length; i++) {
    var morphMix = (sin(frameCount * SPEEDS[i]) + 1) * 0.5;
    var cx = pw * i + pw * 0.5;

    // panel divider
    stroke(0, 0, 0, 35);
    strokeWeight(0.5);
    line(pw * i, 0, pw * i, height);

    // wave line
    noFill();
    stroke(0);
    strokeWeight(1.6);
    beginShape();
    for (var y = 10; y < height - 28; y += 2) {
      var waveX = Waves.wave(y * 0.05, {
        wave: [PAIRS[i][0], PAIRS[i][1]],
        mix:  morphMix,
        t:    t,
        amplitude: (i === 3) ? pw * 0.80 : pw * 0.35
      });
      vertex(cx + waveX, y);
    }
    endShape();

    // wave name labels
    noStroke();
    fill(0);
    textAlign(CENTER);
    text(PAIRS[i][0], cx, height - 20);
    text(PAIRS[i][1], cx, height - 10);

    // mix progress bar
    var barW = pw - 16;
    var barX = pw * i + 8;
    fill(220);
    noStroke();
    rect(barX, height - 33, barW, 3);
    fill(0);
    rect(barX, height - 33, barW * morphMix, 3);
  }
}
