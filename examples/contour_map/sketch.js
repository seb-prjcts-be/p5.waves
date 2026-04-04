// Contour Map (P2D renderer)
// 22 horizontal wave lines, phase offset per row -> topographic map.
// Alternate bands filled to show enclosed regions like a topo chart.

var LINE_COUNT = 22;
var t = 0;

function setup() {
  createCanvas(460, 460, P2D).parent('sketch-container');
}

function draw() {
  background(245);
  t += 0.01;

  for (var i = 0; i < LINE_COUNT - 1; i++) {
    var y0    = map(i,     0, LINE_COUNT - 1, 30, height - 30);
    var y1    = map(i + 1, 0, LINE_COUNT - 1, 30, height - 30);
    var phase = i * 0.24;
    var freq  = 2.4 * (1 + i * 0.04);

    // Filled band between line i and i+1 (alternating)
    if (i % 2 === 0) {
      noStroke();
      fill(0, 0, 0, 18);
      beginShape();
      for (var x = 0; x <= width; x += 4) {
        var dy = Waves.wave(x * 0.011, {
          wave: 'wobble sine', t: t + phase, amplitude: 26, frequency: freq
        });
        vertex(x, y0 + dy);
      }
      for (var x2 = width; x2 >= 0; x2 -= 4) {
        var dy2 = Waves.wave(x2 * 0.011, {
          wave: 'wobble sine', t: t + phase + 0.24, amplitude: 26, frequency: freq
        });
        vertex(x2, y1 + dy2);
      }
      endShape(CLOSE);
    }
  }

  // Draw lines on top
  for (var j = 0; j < LINE_COUNT; j++) {
    var yBase = map(j, 0, LINE_COUNT - 1, 30, height - 30);
    var ph    = j * 0.24;
    var fr    = 2.4 * (1 + j * 0.04);
    var sw    = map(j % 3, 0, 2, 0.5, 1.5);
    var dotAlpha = map(j % 4, 0, 3, 80, 255);

    stroke(0, 0, 0, dotAlpha);
    strokeWeight(sw);
    noFill();
    beginShape();
    for (var x3 = 0; x3 <= width; x3 += 4) {
      var dy3 = Waves.wave(x3 * 0.011, {
        wave: 'wobble sine', t: t + ph, amplitude: 26, frequency: fr
      });
      vertex(x3, yBase + dy3);
    }
    endShape();
  }
}
