// 10 — Wild Storm
// 20 wave lines, left half smooth, right half wild mode.
// mouseX controls unpredictability — drag to feel the chaos build.

var WAVE  = 'mountain peaks';
var LINE_COUNT = 20;
var t     = 0;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  textFont('monospace');
  textAlign(CENTER);
}

function draw() {
  background(245);
  t += 0.012;

  var unpred = constrain(map(mouseX, 0, width, 0, 1), 0, 1);

  noFill();
  for (var i = 0; i < LINE_COUNT; i++) {
    var shade = 30 + (i / (LINE_COUNT - 1)) * 170;
    var phaseOff = i * 0.25;

    // smooth side — left half
    stroke(shade, shade * 0.9, shade * 1.1);
    strokeWeight(1.2);
    beginShape();
    for (var y = 0; y <= height - 30; y += 3) {
      var xs = Waves.wave(y * 0.014 + phaseOff, {
        wave: WAVE, t: t + phaseOff * 0.15,
        amplitude: 45
      });
      vertex(width / 4 + xs * 0.5, y);
    }
    endShape();

    // wild side — right half
    stroke(shade * 0.8, shade * 0.6, shade);
    beginShape();
    for (var y2 = 0; y2 <= height - 30; y2 += 3) {
      var xw = Waves.wave(y2 * 0.014 + phaseOff, {
        wave: WAVE, t: t + phaseOff * 0.15,
        mode: 'wild', unpredictability: unpred,
        amplitude: 45
      });
      vertex(3 * width / 4 + xw * 0.5, y2);
    }
    endShape();
  }

  // centre divider
  stroke(0, 0, 0, 40);
  strokeWeight(1);
  line(width / 2, 0, width / 2, height - 30);

  // labels
  noStroke();
  fill(0, 0, 0, 120);
  textSize(10);
  text('stable', width / 4, height - 10);
  text('wild  ' + nf(unpred, 1, 2), 3 * width / 4, height - 10);
}
