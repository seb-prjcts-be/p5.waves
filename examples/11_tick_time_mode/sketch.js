// 11 — Time Strata
// Time is a plain number — full manual control.
// Mouse X scrubs a time window; each layer is frozen at its own t.
// Layers are filled ribbons with HSB color, creating geological strata.

var LAYERS      = 16;
var WAVE_WINDOW = 6;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  colorMode(HSB, 360, 100, 100, 255);
}

function draw() {
  background(0, 0, 96);
  var timeBase = map(mouseX, 0, width, 0, 8);

  noStroke();
  for (var i = LAYERS - 1; i >= 0; i--) {
    var layerT = timeBase + (i / LAYERS) * WAVE_WINDOW;
    var y0     = map(i, 0, LAYERS - 1, 50, height - 50);
    var wHue   = (i * 22) % 360;
    var alphaVal = map(i, 0, LAYERS - 1, 200, 60);

    fill(wHue, 40, 85, alphaVal);
    beginShape();
    for (var x = 0; x <= width; x += 3) {
      var dy = Waves.wave(x * 0.015, {
        wave:      'classic sine',
        t:         layerT,
        amplitude: 40
      });
      vertex(x, y0 + dy);
    }
    // close along the bottom edge of this band
    for (var x2 = width; x2 >= 0; x2 -= 3) {
      var dy2 = Waves.wave(x2 * 0.015, {
        wave:      'classic sine',
        t:         layerT + 0.3,
        amplitude: 25
      });
      vertex(x2, y0 + dy2 + 22);
    }
    endShape(CLOSE);
  }

  // time cursor label
  fill(0, 0, 30);
  noStroke();
  textSize(10);
  textAlign(LEFT);
  textFont('monospace');
  text('t = ' + nf(map(mouseX, 0, width, 0, 8), 1, 2), 12, 20);
  text('move mouse', 12, 34);
}
