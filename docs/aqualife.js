/* ============================================================
   AQUALIFE - Wave-driven marine ecosystem
   Species: fish (small/medium/big), jellyfish, crabs, seaweed
   Not yet included in showcase - preserved for future use.

   To enable: add the HTML section to index.html and load this
   script after sketch.js. Requires the reg() function and
   Waves/p5 to be available globally.
   ============================================================ */

reg('aqualife-canvas', new p5(function(p) {
  var buf;
  var fish = [];
  var jellies = [];
  var crabs = [];
  var plants = [];
  var aquaT = 0;

  // Global current - shared by all life, shifts the whole ocean mood
  var current;

  // ── Fish factory: size drives everything ────────────────────
  function makeFish(seed, size, col) {
    // Small fish: fast, nervous, tight turns, rapid undulation
    // Big fish: slow, smooth, wide turns, lazy body wave
    return {
      x: p.random(40, p.width - 40),
      y: p.random(40, p.height - 80),
      heading: p.random(p.TWO_PI),
      size: size,
      spd: p.map(size, 2, 8, 2.2, 0.8),
      segs: Math.round(p.map(size, 2, 8, 6, 14)),
      segLen: p.map(size, 2, 8, 2, 4),
      col: col,
      steer: Waves.createSampler({
        shift: true,
        shiftInterval: p.map(size, 2, 8, 2, 5),
        shiftDuration: 1,
        amplitude: p.map(size, 2, 8, 0.06, 0.02),
        frequency: p.map(size, 2, 8, 0.6, 0.15),
        seed: seed
      }),
      body: Waves.createSampler({
        shift: true,
        shiftInterval: p.map(size, 2, 8, 2.5, 4.5),
        shiftDuration: 1.2,
        amplitude: p.map(size, 2, 8, 3, 7),
        frequency: p.map(size, 2, 8, 4, 1.5),
        seed: seed + 50
      })
    };
  }

  // ── Jellyfish factory ───────────────────────────────────────
  function makeJelly(seed, col) {
    return {
      x: p.random(60, p.width - 60),
      y: p.random(60, p.height - 120),
      vx: 0, vy: 0,
      col: col,
      pulse: Waves.createSampler({
        shift: true,
        shiftInterval: 5,
        shiftDuration: 2,
        range: [0.6, 1.4],
        frequency: 0.8,
        seed: seed
      }),
      drift: Waves.createSampler({
        shift: true,
        shiftInterval: 6,
        shiftDuration: 1.5,
        amplitude: 0.3,
        frequency: 0.12,
        seed: seed + 30
      }),
      tentacle: Waves.createSampler({
        shift: true,
        shiftInterval: 4,
        shiftDuration: 1,
        amplitude: 8,
        frequency: 1.5,
        seed: seed + 60
      })
    };
  }

  // ── Crab factory: sideways scuttlers ─────────────────────────
  function makeCrab(seed, col) {
    return {
      x: p.random(40, p.width - 40),
      y: p.height - p.random(15, 35),
      facing: p.random() > 0.5 ? 1 : -1,
      col: col,
      scuttle: Waves.createSampler({
        shift: true,
        shiftInterval: 3,
        shiftDuration: 0.8,
        amplitude: 1.8,
        frequency: 3,
        seed: seed
      }),
      bob: Waves.createSampler({
        shift: true,
        shiftInterval: 5,
        shiftDuration: 1,
        amplitude: 1.5,
        frequency: 1.2,
        seed: seed + 20
      })
    };
  }

  // ── Plant factory ───────────────────────────────────────────
  function makePlant(anchorX, segs, heightPx, col, seed) {
    return {
      anchorX: anchorX,
      anchorY: p.height,
      segs: segs,
      heightPx: heightPx,
      col: col,
      sway: Waves.createSampler({
        shift: true,
        shiftInterval: 6,
        shiftDuration: 2,
        amplitude: p.map(segs, 20, 50, 3, 8),
        frequency: 0.35,
        seed: seed
      })
    };
  }

  p.setup = function() {
    var container = document.getElementById('aqualife-canvas');
    var w = container ? container.offsetWidth : 600;
    var h = Math.round(w * 0.7);
    p.createCanvas(w, h).parent('aqualife-canvas');
    buf = p.createGraphics(w, h);
    buf.background(12, 20, 32);
    p.frameRate(30);

    current = Waves.createSampler({
      shift: true,
      shiftInterval: 8,
      shiftDuration: 2,
      amplitude: 0.4,
      frequency: 0.05,
      seed: 999
    });

    // School of small nervous fish
    fish = [];
    for (var i = 0; i < 5; i++) {
      fish.push(makeFish(i * 7, p.random(2, 3.5), [80 + i * 30, 200 + i * 10, 255]));
    }
    // Two medium fish
    fish.push(makeFish(100, p.random(4, 5.5), [255, 180, 60]));
    fish.push(makeFish(110, p.random(4, 5.5), [60, 220, 130]));
    // One big slow fish
    fish.push(makeFish(200, p.random(6.5, 8), [255, 80, 80]));

    // Jellyfish
    jellies = [];
    jellies.push(makeJelly(300, [200, 80, 255]));
    jellies.push(makeJelly(310, [80, 200, 220]));

    // Crabs along the bottom
    crabs = [];
    crabs.push(makeCrab(500, [220, 120, 50]));
    crabs.push(makeCrab(510, [200, 100, 60]));
    crabs.push(makeCrab(520, [230, 140, 40]));

    // Seaweed - many thin strands, almost invisible
    plants = [];
    var greens = [[25, 110, 45], [35, 130, 55], [20, 100, 40], [40, 140, 50], [30, 120, 48]];
    for (var i = 0; i < 14; i++) {
      var px = p.map(i, 0, 13, 20, w - 20) + p.random(-15, 15);
      var segs = Math.round(p.random(25, 45));
      var hPx = p.random(80, h * 0.55);
      plants.push(makePlant(px, segs, hPx, greens[i % greens.length], 400 + i * 11));
    }
  };

  p.draw = function() {
    buf.noStroke();
    buf.fill(12, 20, 32, 22);
    buf.rect(0, 0, buf.width, buf.height);

    aquaT += 0.025;

    var currentVal = current.sample(aquaT, aquaT);

    // ── Plants (behind everything, almost invisible) ───────────
    for (var i = 0; i < plants.length; i++) {
      var pl = plants[i];
      var stepY = pl.heightPx / pl.segs;

      buf.noFill();
      buf.strokeWeight(1.2);
      buf.stroke(pl.col[0], pl.col[1], pl.col[2], 25);
      buf.beginShape();
      buf.curveVertex(pl.anchorX, pl.anchorY);
      for (var s = 0; s <= pl.segs; s++) {
        var segT = s / pl.segs;
        var sway = pl.sway.sample(aquaT * 1.5 + s * 0.3, aquaT) * segT * segT;
        sway += currentVal * segT * 6;
        var vx = pl.anchorX + sway;
        var vy = pl.anchorY - s * stepY;
        buf.curveVertex(vx, vy);
      }
      buf.endShape();
    }

    // ── Crabs (scuttling along the bottom) ─────────────────────
    for (var i = 0; i < crabs.length; i++) {
      var cr = crabs[i];

      // Sideways scuttle - jerky lateral movement
      var scuttleVal = cr.scuttle.sample(aquaT * 4 + i * 7, aquaT);
      cr.x += scuttleVal * cr.facing;
      // Current pushes them
      cr.x += currentVal * 0.3;

      // Vertical bob
      var bobVal = cr.bob.sample(aquaT * 2 + i * 5, aquaT);

      // Occasionally flip direction
      if (cr.x < 15) cr.facing = 1;
      if (cr.x > p.width - 15) cr.facing = -1;

      var cy = cr.y + bobVal;

      // Body - wide oval
      buf.noStroke();
      buf.fill(cr.col[0], cr.col[1], cr.col[2], 180);
      buf.ellipse(cr.x, cy, 12, 7);
      // Claws
      var clawOff = cr.facing * 2;
      buf.fill(cr.col[0] - 20, cr.col[1] - 20, cr.col[2], 160);
      buf.ellipse(cr.x - 7 + clawOff, cy - 2, 5, 4);
      buf.ellipse(cr.x + 7 + clawOff, cy - 2, 5, 4);
      // Legs - tiny ticks
      buf.stroke(cr.col[0], cr.col[1], cr.col[2], 100);
      buf.strokeWeight(0.8);
      for (var leg = -2; leg <= 2; leg++) {
        var legX = cr.x + leg * 3;
        var legWave = cr.scuttle.sample(aquaT * 6 + leg + i * 3, aquaT) * 1.5;
        buf.line(legX, cy + 3, legX + legWave, cy + 6);
      }
    }

    // ── Jellyfish ─────────────────────────────────────────────
    for (var i = 0; i < jellies.length; i++) {
      var j = jellies[i];

      // Pulse drives vertical thrust
      var pulseVal = j.pulse.sample(aquaT * 2, aquaT);
      var thrust = (pulseVal - 1) * 1.8;
      j.vy += thrust * 0.06 - 0.02;
      j.vy *= 0.97;
      j.vx += j.drift.sample(aquaT, aquaT) * 0.08 + currentVal * 0.15;
      j.vx *= 0.96;

      j.x += j.vx;
      j.y += j.vy;

      // Soft bounds
      if (j.y < 20) j.vy = p.abs(j.vy) * 0.5;
      if (j.y > p.height - 80) j.vy = -p.abs(j.vy) * 0.5;
      if (j.x < -30) j.x += p.width + 60;
      if (j.x > p.width + 30) j.x -= p.width + 60;

      // Bell
      var bellR = 12 * pulseVal;
      buf.noStroke();
      buf.fill(j.col[0], j.col[1], j.col[2], 70);
      buf.ellipse(j.x, j.y, bellR * 2, bellR * 1.4);
      buf.fill(j.col[0], j.col[1], j.col[2], 40);
      buf.ellipse(j.x, j.y, bellR * 2.6, bellR * 1.8);

      // Tentacles
      for (var t = -2; t <= 2; t++) {
        var tx = j.x + t * 5;
        var ty = j.y + bellR * 0.5;
        buf.stroke(j.col[0], j.col[1], j.col[2], 50);
        buf.strokeWeight(1);
        buf.noFill();
        for (var s = 0; s < 8; s++) {
          var wave = j.tentacle.sample(aquaT * 2 + s * 1.2 + t, aquaT) * 0.5;
          var nx = tx + wave;
          var ny = ty + s * 5;
          buf.line(tx, ty, nx, ny);
          tx = nx;
          ty = ny;
        }
      }
    }

    // ── Fish ──────────────────────────────────────────────────
    for (var i = 0; i < fish.length; i++) {
      var f = fish[i];

      var turn = f.steer.sample(aquaT * 2 + i * 5, aquaT);
      // Global current nudges heading
      turn += currentVal * 0.01;
      f.heading += turn;

      f.x += p.cos(f.heading) * f.spd;
      f.y += p.sin(f.heading) * f.spd;

      // Wrap
      if (f.x < -20) f.x += p.width + 40;
      if (f.x > p.width + 20) f.x -= p.width + 40;
      if (f.y < -20) f.y += p.height + 40;
      if (f.y > p.height + 20) f.y -= p.height + 40;

      var perpX = -p.sin(f.heading);
      var perpY =  p.cos(f.heading);
      var backX = -p.cos(f.heading);
      var backY = -p.sin(f.heading);

      buf.noStroke();
      for (var s = 0; s < f.segs; s++) {
        var segT = s / f.segs;
        var wave = f.body.sample(aquaT * 3 + s * 0.8, aquaT);
        // Taper: thick head, thin tail, undulation grows toward tail
        var taper = (1 - segT) * (0.2 + segT * 0.8);
        var sx = f.x + backX * s * f.segLen + perpX * wave * taper;
        var sy = f.y + backY * s * f.segLen + perpY * wave * taper;
        var radius = f.size * (1 - segT * 0.8);
        var fade = 200 - s * (140 / f.segs);

        buf.fill(f.col[0], f.col[1], f.col[2], fade);
        buf.ellipse(sx, sy, radius, radius);
      }
    }

    p.image(buf, 0, 0);

    // Label - show current mood
    p.noStroke();
    p.fill(255, 255, 255, 70);
    p.textSize(10);
    p.textFont('monospace');
    p.textAlign(p.LEFT, p.TOP);
    p.text('current: ' + current.waveName, 8, 8);
  };

  p.windowResized = function() {
    var container = document.getElementById('aqualife-canvas');
    var w = container ? container.offsetWidth : 600;
    var h = Math.round(w * 0.7);
    p.resizeCanvas(w, h);
    var oldBuf = buf;
    buf = p.createGraphics(w, h);
    buf.image(oldBuf, 0, 0, w, h);
    oldBuf.remove();
  };
}, 'aqualife-canvas'));
