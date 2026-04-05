// Wild Mode
// Grid of circles: left half stable, right half wild.
// mouseX controls unpredictability — drag to feel the chaos build.

var COLS = 20, ROWS = 14;
var t = 0;
var wildWave;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  noStroke();
  textFont('monospace');
  textAlign(CENTER);
  wildWave = floor(random(Waves.count));
}

function draw() {
  background(238);
  t += 0.012;
  var cw = width / COLS;
  var ch = (height - 24) / ROWS;
  var maxR = min(cw, ch) * 0.44;
  var half = COLS / 2;
  var unpred = constrain(map(mouseX, 0, width, 0, 1), 0, 1);

  for (var row = 0; row < ROWS; row++) {
    for (var col = 0; col < COLS; col++) {
      var cx = (col + 0.5) * cw;
      var cy = (row + 0.5) * ch;
      var coord = col * 0.15 + row * 0.3;

      if (col < half) {
        var sz = Waves.wave(coord, { wave: wildWave, t: t, range: [3, maxR] });
        fill(0);
        circle(cx, cy, sz * 2);
      } else {
        var szW = Waves.wave(coord, {
          wave: wildWave, t: t, range: [3, maxR],
          mode: 'wild', unpredictability: unpred
        });
        fill(0);
        circle(cx, cy, szW * 2);
      }
    }
  }

  stroke(0, 0, 0, 30);
  strokeWeight(1);
  line(width / 2, 0, width / 2, height - 24);
  noStroke();
  fill(0);
  textSize(10);
  text('stable', width / 4, height - 6);
  text('wild  ' + nf(unpred, 1, 2), 3 * width / 4, height - 6);
}
