// p5-grid v04 — 100 Ways to Use p5.waves (wildly creative edition)
// Instance mode conversion for showcase embedding
// Every frame: library as ENGINE, not decoration.

reg('grid100-canvas', new p5(function(p) {

  var FRAMES = [];
  var STATE = {};
  var COLS = 10, ROWS = 10, SZ = 50;
  var GRID_W = COLS * SZ, GRID_H = ROWS * SZ;
  var ox = 0, oy = 0;

  function W(c, o) { return Waves.wave(c, o); }

  p.setup = function() {
    var container = document.getElementById('grid100-canvas');
    p.createCanvas(GRID_W, GRID_H).parent('grid100-canvas');
    p.frameRate(20);
    initState();
    registerFrames();
  };

  function initState() {
    // 50: ant colony
    STATE[50] = Array.from({length:15},function(){return {x:25,y:25,a:p.random(p.TWO_PI)};});
    // 51: wave-driven L-system turtle
    STATE[51] = {trail:[],age:0};
    // 52: growing crystal
    STATE[52] = {pts:[[25,25]],age:0};
    // 53: wave erosion landscape
    STATE[53] = new Float32Array(50);
    for(var i=0;i<50;i++) STATE[53][i] = 20+10*Math.sin(i*0.3);
    // 54: flocking fish
    STATE[54] = Array.from({length:8},function(){return {x:p.random(5,45),y:p.random(5,45),vx:p.random(-1,1),vy:p.random(-1,1)};});
    // 55: lightning branches
    STATE[55] = {branches:[],timer:0};
    // 56: wave pendulum array
    STATE[56] = Array.from({length:7},function(_,i){return {len:10+i*2,a:p.PI/4,v:0};});
    // 60: wave-driven Game of Life
    STATE[60] = {g:new Uint8Array(625),n:new Uint8Array(625),age:0};
    for(var i=0;i<625;i++) STATE[60].g[i]=p.random()<0.4?1:0;
    // 61: reaction-diffusion
    var n=625;STATE[61]={A:new Float32Array(n).fill(1),B:new Float32Array(n).fill(0),nA:new Float32Array(n),nB:new Float32Array(n)};
    for(var i=8;i<17;i++)for(var j=8;j<17;j++)STATE[61].B[j*25+i]=1;
    // 85: galaxy spiral
    STATE[85]={stars:Array.from({length:60},function(){return {a:p.random(p.TWO_PI),r:p.random(2,22),speed:p.random(0.2,0.8)};})};
    // 92: seismograph
    STATE[92]={buf:new Float32Array(50).fill(25)};
    // 95: comet swarm
    STATE[95]=Array.from({length:4},function(){return {trail:[],phase:p.random(p.TWO_PI)};});
    // 98: wave DNA
    STATE[98]={rot:0};
  }

  p.draw = function() {
    p.background(0);
    var t = p.millis() / 1000;
    var fc = p.frameCount;
    var ctx = p.drawingContext;
    for (var i = 0; i < 100; i++) {
      var cx = ox + (i % COLS) * SZ;
      var cy = oy + p.floor(i / COLS) * SZ;
      p.push(); ctx.save();
      ctx.beginPath(); ctx.rect(cx, cy, SZ, SZ); ctx.clip();
      p.translate(cx, cy);
      if (FRAMES[i]) { try { FRAMES[i](t, fc); } catch(e) {} }
      ctx.restore(); p.pop();
    }
  };

  function registerFrames() {

    // ═══════════════════════════════════════════════════════
    // ROW 0 — RAW: Waveform fingerprints (unusual rendering)
    // ═══════════════════════════════════════════════════════

    // 0: Circular waveform — wave plotted as polar radius
    FRAMES[0] = (t) => {
      p.noFill(); p.stroke(255,80,200); p.strokeWeight(1);
      p.beginShape();
      for(var a=0;a<=p.TWO_PI;a+=0.08){
        var r=W(a*2,{wave:'batman',t:t,seed:0,range:[6,20]});
        p.vertex(25+p.cos(a)*r,25+p.sin(a)*r);
      }
      p.endShape(p.CLOSE);
    };

    // 1: Waveform as bar chart — stepped sine
    FRAMES[1] = (t) => {
      p.noStroke();
      for(var i=0;i<10;i++){
        var h=W(i*0.3,{wave:'stepped sine',t:t,seed:10,range:[3,45]});
        p.fill(W(i,{seed:11,t:t,range:[80,255]}),100,200);
        p.rect(i*5,50-h,4,h);
      }
    };

    // 2: Waveform as dot matrix — noise values as dot sizes
    FRAMES[2] = (t) => {
      p.noStroke();
      for(var r=0;r<10;r++)for(var c=0;c<10;c++){
        var sz=W((r*10+c)*0.05,{wave:'noise',t:t,seed:20,range:[0.5,5]});
        p.fill(255,W(r*10+c,{seed:21,t:t,range:[100,255]}),150);
        p.ellipse(c*5+2.5,r*5+2.5,sz);
      }
    };

    // 3: Twin waveforms — classic sine vs batman overlay
    FRAMES[3] = (t) => {
      p.noFill(); p.strokeWeight(1.2);
      p.stroke(0,255,180); p.beginShape();
      for(var x=0;x<50;x++) p.vertex(x,W(x*0.06,{wave:'classic sine',t:t,seed:30,range:[5,45]}));
      p.endShape();
      p.stroke(255,255,0); p.beginShape();
      for(var x=0;x<50;x++) p.vertex(x,W(x*0.06,{wave:'batman',t:t,seed:31,range:[5,45]}));
      p.endShape();
    };

    // 4: 3D ribbon — wave as height, drawn with parallelogram strips
    FRAMES[4] = (t) => {
      p.noStroke();
      for(var x=0;x<50;x+=2){
        var h1=W(x*0.06,{wave:'mountain peaks',t:t,seed:40,range:[5,30]});
        var h2=W((x+2)*0.06,{wave:'mountain peaks',t:t,seed:40,range:[5,30]});
        p.fill(100,W(x*0.04,{seed:41,t:t,range:[150,255]}),200);
        p.quad(x,40-h1, x+2,40-h2, x+2,42, x,42);
      }
    };

    // 5: Phase portrait — x=wave1, y=wave2, plot trajectory
    FRAMES[5] = (t) => {
      p.noFill(); p.stroke(255,100,50); p.strokeWeight(0.8);
      p.beginShape();
      for(var i=0;i<80;i++){
        var u=i*0.05+t*0.2;
        p.vertex(W(u,{wave:'wobble sine',seed:50,range:[3,47]}),
               W(u,{wave:'meta sine',seed:51,range:[3,47]}));
      }
      p.endShape();
    };

    // 6: Waveform heatmap — 10 waves stacked, brightness = value
    FRAMES[6] = (t) => {
      p.noStroke();
      var wvs=['sine','triangle','square','noise','pulse','ramp','saw up','steps','batman','valleys'];
      for(var r=0;r<10;r++)for(var x=0;x<50;x+=2){
        var v=W(x*0.06,{wave:wvs[r],t:t,seed:60+r,range:[0,255]});
        p.fill(v,v*0.5,255-v); p.rect(x,r*5,2,5);
      }
    };

    // 7: Spiral waveform — wave value along expanding spiral
    FRAMES[7] = (t) => {
      p.noFill(); p.stroke(0,200,255); p.strokeWeight(1);
      p.beginShape();
      for(var i=0;i<100;i++){
        var a=i*0.15+t*0.5;
        var baseR=1.5+i*0.18;
        var wave=W(i*0.05,{wave:'sharp peaks',t:t,seed:70,range:[-3,3]});
        p.vertex(25+p.cos(a)*(baseR+wave),25+p.sin(a)*(baseR+wave));
      }
      p.endShape();
    };

    // 8: Mirrored waveform — top half + reflected bottom
    FRAMES[8] = (t) => {
      p.noFill(); p.strokeWeight(1.2);
      p.stroke(255,0,100);
      p.beginShape();
      for(var x=0;x<50;x++){var y=W(x*0.06,{wave:'fuzzy pulse',t:t,seed:80,range:[2,23]});p.vertex(x,y);}
      p.endShape();
      p.stroke(255,0,100,100);
      p.beginShape();
      for(var x=0;x<50;x++){var y=W(x*0.06,{wave:'fuzzy pulse',t:t,seed:80,range:[2,23]});p.vertex(x,50-y);}
      p.endShape();
    };

    // 9: Frequency spectrum — 25 bars, each a different frequency
    FRAMES[9] = (t) => {
      p.noStroke();
      for(var i=0;i<25;i++){
        var freq=0.01+i*0.008;
        var h=W(t,{wave:'sine',seed:90+i,range:[2,40],frequency:freq*20});
        var hue=W(i*0.1,{seed:91,t:t,range:[0,255]});
        p.fill(hue,150,255); p.rect(i*2,50-h,2,h);
      }
    };

    // ═══════════════════════════════════════════════════════
    // ROW 1 — SHAPE: Wave-sculpted geometry
    // ═══════════════════════════════════════════════════════

    // 10: Breathing heart — cardioid with wave-driven scale
    FRAMES[10] = (t) => {
      p.noStroke();
      var beat=W(t,{wave:'sharp peaks',seed:100,range:[0.7,1.2]});
      p.fill(255,W(t,{seed:101,wave:'sine',range:[30,80]}),80);
      p.beginShape();
      for(var a=0;a<=p.TWO_PI;a+=0.05){
        var r=13*beat*(1-p.sin(a))*0.45;
        p.vertex(25+r*p.sin(a)*0.9,30-r*p.cos(a)*0.7);
      }
      p.endShape(p.CLOSE);
    };

    // 11: Wave-driven gear — teeth count and depth from library
    FRAMES[11] = (t) => {
      p.noFill(); p.stroke(255,200,0); p.strokeWeight(1);
      var teeth=p.floor(W(t*0.3,{wave:'steps',seed:110,range:[6,14.99]}));
      var depth=W(t,{wave:'bumpy sine',seed:111,range:[2,6]});
      p.translate(25,25); p.rotate(W(t,{wave:'saw up',seed:112,range:[0,p.TWO_PI]}));
      p.beginShape();
      for(var i=0;i<teeth*2;i++){
        var a=i*p.PI/teeth;
        var r=i%2===0?12+depth:12-depth;
        p.vertex(p.cos(a)*r,p.sin(a)*r);
      }
      p.endShape(p.CLOSE);
    };

    // 12: Morphing star — point count oscillates
    FRAMES[12] = (t) => {
      p.noFill(); p.stroke(200,100,255); p.strokeWeight(1.2);
      var pts=p.floor(W(t*0.2,{wave:'stepped sine',seed:120,range:[3,8.99]}));
      p.translate(25,25); p.rotate(W(t,{seed:121,wave:'sine',range:[0,1]}));
      p.beginShape();
      for(var i=0;i<pts*2;i++){
        var a=i*p.PI/pts-p.HALF_PI;
        var r=i%2===0?18:8;
        p.vertex(p.cos(a)*r,p.sin(a)*r);
      }
      p.endShape(p.CLOSE);
    };

    // 13: Wave ruler — tick marks with wave-driven heights
    FRAMES[13] = (t) => {
      p.stroke(255); p.strokeWeight(0.5);
      p.line(0,40,50,40);
      for(var i=0;i<25;i++){
        var h=W(i*0.15,{wave:'grow random',t:t,seed:130,range:[3,25]});
        p.stroke(255,W(i,{seed:131,t:t,range:[80,255]}),100);
        p.line(i*2+1,40,i*2+1,40-h);
      }
    };

    // 14: Elastic string — wave displaces a horizontal line
    FRAMES[14] = (t) => {
      p.noFill(); p.stroke(0,255,200); p.strokeWeight(2);
      p.beginShape();
      for(var x=0;x<50;x++){
        var pluck=p.sin(x*p.PI/50);
        var y=25+W(x*0.06,{wave:'triangle sine',t:t,seed:140,range:[-12,12]})*pluck;
        p.vertex(x,y);
      }
      p.endShape();
      // Fixed endpoints
      p.fill(255); p.noStroke();
      p.ellipse(0,25,4,4); p.ellipse(49,25,4,4);
    };

    // 15: Pac-man — mouth angle from wave
    FRAMES[15] = (t) => {
      var mouth=W(t*2,{wave:'half sine',seed:150,range:[0.05,0.8]});
      p.fill(255,220,0); p.noStroke();
      p.arc(25,25,30,30,mouth*p.PI,p.TWO_PI-mouth*p.PI,p.PIE);
      p.fill(0); p.ellipse(27,18,4,4);
    };

    // 16: Wave crown — spikes radiating from center
    FRAMES[16] = (t) => {
      p.noFill(); p.stroke(255,180,50); p.strokeWeight(1);
      p.translate(25,25);
      for(var i=0;i<16;i++){
        var a=i*p.TWO_PI/16;
        var inner=W(i,{wave:'pulse',t:t,seed:160,range:[5,10]});
        var outer=W(i,{wave:'sharp peaks',t:t,seed:161,range:[12,22]});
        p.line(p.cos(a)*inner,p.sin(a)*inner,p.cos(a)*outer,p.sin(a)*outer);
      }
    };

    // 17: DNA ladder — two wave helices with rungs
    FRAMES[17] = (t) => {
      p.strokeWeight(1.5);
      for(var y=0;y<50;y+=2){
        var x1=25+W(y*0.1,{wave:'sine',t:t,seed:170,range:[-14,14]});
        var x2=25+W(y*0.1,{wave:'sine',t:t,seed:170,range:[-14,14],phase:p.PI});
        p.stroke(0,200,255); p.point(x1,y);
        p.stroke(255,100,200); p.point(x2,y);
        if(y%4===0){p.stroke(255,60);p.line(x1,y,x2,y);}
      }
    };

    // 18: Wave-driven brackets — nested ( ) shapes
    FRAMES[18] = (t) => {
      p.noFill(); p.strokeWeight(1);
      for(var i=0;i<5;i++){
        var w=W(i,{wave:'fade out',t:t,seed:180,range:[4,20]});
        var h=W(i,{wave:'ramp up sine',t:t,seed:181,range:[10,40]});
        p.stroke(W(i,{seed:182,t:t,range:[100,255]}),150,255);
        p.arc(25-w/2,25,w,h,p.HALF_PI,p.PI+p.HALF_PI);
        p.arc(25+w/2,25,w,h,-p.HALF_PI,p.HALF_PI);
      }
    };

    // 19: Eye iris — pupil + layered iris rings all wave-driven
    FRAMES[19] = (t) => {
      p.noStroke();
      p.fill(240); p.ellipse(25,25,42,28);
      for(var i=14;i>0;i--){
        var h=W(i*0.3,{wave:'noise',t:t*0.5,seed:190,range:[15,45]});
        var s=W(i*0.2,{seed:191,t:t,range:[60,100]});
        p.colorMode(p.HSB,360,100,100); p.fill(h,s,70-i*3); p.colorMode(p.RGB);
        p.ellipse(25,25,i*2,i*2);
      }
      var pupil=W(t,{wave:'smooth solid sine',seed:192,range:[4,10]});
      p.fill(0); p.ellipse(25,25,pupil,pupil);
      p.fill(255,180); p.ellipse(28,22,3,2);
    };

    // ═══════════════════════════════════════════════════════
    // ROW 2 — COLOR: Wave as chromatic instrument
    // ═══════════════════════════════════════════════════════

    // 20: Aurora — layered horizontal color bands
    FRAMES[20] = (t) => {
      p.colorMode(p.HSB,360,100,100); p.noStroke();
      for(var y=0;y<50;y++){
        var h=W(y*0.04,{wave:'wobble sine',t:t,seed:200,range:[80,200]});
        var a=W(y*0.06,{wave:'fade out',t:t*0.5,seed:201,range:[0,80]});
        p.fill(h,70,90,a/100); p.rect(0,y,50,1);
      }
      p.colorMode(p.RGB);
    };

    // 21: Stained glass — wave picks hue per voronoi cell
    FRAMES[21] = (t) => {
      p.colorMode(p.HSB,360,100,100); p.noStroke();
      var seeds=[];
      for(var i=0;i<6;i++) seeds.push({
        x:W(t,{seed:210+i,wave:'noise',range:[5,45]}),
        y:W(t,{seed:216+i,wave:'noise',range:[5,45]}),
        h:W(i,{seed:222+i,t:t,wave:'ramp',range:[0,360]})
      });
      for(var y=0;y<50;y+=2)for(var x=0;x<50;x+=2){
        var md=999,ms=null;
        for(var si=0;si<seeds.length;si++){var s=seeds[si];var d=p.dist(x,y,s.x,s.y);if(d<md){md=d;ms=s;}}
        p.fill(ms.h%360,80,p.max(30,90-md*2)); p.rect(x,y,2,2);
      }
      p.colorMode(p.RGB);
    };

    // 22: Sunset gradient — wave bends the horizon line
    FRAMES[22] = (t) => {
      p.noStroke();
      for(var y=0;y<50;y++){
        var bend=W(y*0.04,{wave:'smooth solid sine',t:t*0.3,seed:220,range:[-5,5]});
        var yy=y+bend;
        var r=p.map(yy,0,50,255,20);
        var g=p.map(yy,0,50,150,0);
        var b=p.map(yy,0,50,50,80);
        p.fill(r,g,b); p.rect(0,y,50,1);
      }
    };

    // 23: Color organ — 5x5 grid, each cell a wave-driven color chord
    FRAMES[23] = (t) => {
      p.colorMode(p.HSB,360,100,100); p.noStroke();
      for(var r=0;r<5;r++)for(var c=0;c<5;c++){
        var h=W((r*5+c)*0.1,{wave:'triangle',t:t,seed:230,range:[0,360]});
        var s=W((r*5+c)*0.15,{wave:'up down pulse',t:t*0.5,seed:231,range:[40,100]});
        var b=W((r*5+c)*0.12,{wave:'bald patch',t:t*0.7,seed:232,range:[30,100]});
        p.fill(h%360,s,b); p.rect(c*10,r*10,10,10);
      }
      p.colorMode(p.RGB);
    };

    // 24: Neon tubes — glowing lines with wave-shifted colors
    FRAMES[24] = (t) => {
      for(var i=0;i<6;i++){
        var y=8+i*7;
        var hue=W(i,{wave:'saw up',t:t,seed:240,range:[0,255]});
        for(var g=4;g>=0;g--){
          p.stroke(hue,100+g*30,255,50-g*10); p.strokeWeight(1+g*1.5);
          var y1=y+W(0,{wave:'noise',t:t+i,seed:241+i,range:[-2,2]});
          var y2=y+W(1,{wave:'noise',t:t+i,seed:242+i,range:[-2,2]});
          p.line(3,y1,47,y2);
        }
      }
    };

    // 25: Prismatic fan — rotating gradient wedges
    FRAMES[25] = (t) => {
      p.colorMode(p.HSB,360,100,100); p.noStroke();
      p.translate(25,25);
      var n=p.floor(W(t*0.2,{wave:'steps',seed:250,range:[6,18.99]}));
      for(var i=0;i<n;i++){
        var a1=i*p.TWO_PI/n+W(t,{seed:251,wave:'sine',range:[0,0.3]});
        var a2=a1+p.TWO_PI/n;
        p.fill((i*360/n+W(t,{seed:252,wave:'ramp',range:[0,120]}))%360,85,90);
        p.arc(0,0,40,40,a1,a2,p.PIE);
      }
      p.colorMode(p.RGB);
    };

    // 26: Thermal camera — wave creates heat map
    FRAMES[26] = (t) => {
      p.noStroke();
      for(var y=0;y<50;y+=2)for(var x=0;x<50;x+=2){
        var heat=W((x+y*50)*0.003,{wave:'squared sine',t:t*0.4,seed:260,range:[0,1]});
        var d=p.dist(x,y,25+W(t,{seed:261,range:[-8,8]}),25)*0.04;
        var v=p.constrain(heat-d*0.3,0,1);
        if(v<0.33) p.fill(0,0,v*3*255);
        else if(v<0.66) p.fill(v*2*255,0,255-v*255);
        else p.fill(255,(v-0.5)*500,0);
        p.rect(x,y,2,2);
      }
    };

    // 27: Candy stripes — diagonal stripes with wave-bent angle
    FRAMES[27] = (t) => {
      p.colorMode(p.HSB,360,100,100); p.noStroke();
      var bend=W(t,{wave:'wobble sine',seed:270,range:[-0.5,0.5]});
      for(var y=0;y<50;y+=2)for(var x=0;x<50;x+=2){
        var v=((x*p.cos(bend)+y*p.sin(bend))*0.15+t*2)%1;
        p.fill(v*360,80,90); p.rect(x,y,2,2);
      }
      p.colorMode(p.RGB);
    };

    // 28: Color breathing — single cell, layers of fading halos
    FRAMES[28] = (t) => {
      p.noStroke(); p.colorMode(p.HSB,360,100,100);
      for(var i=8;i>=0;i--){
        var r=W(t,{wave:'classic sine',seed:280+i,range:[4+i*3,8+i*5]});
        var h=W(t*0.5+i*0.3,{wave:'triangle',seed:281,range:[0,360]});
        p.fill(h%360,80,90,30); p.ellipse(25,25,r*2,r*2);
      }
      p.colorMode(p.RGB);
    };

    // 29: RGB split — three offset images
    FRAMES[29] = (t) => {
      p.noStroke();
      var dx=W(t,{wave:'zig-zag sine',seed:290,range:[-4,4]});
      var dy=W(t,{wave:'zig-zag sine',seed:291,range:[-4,4]});
      p.blendMode(p.ADD);
      for(var y=0;y<50;y+=3)for(var x=0;x<50;x+=3){
        var v=W((x+y)*0.02,{wave:'noise',t:t*0.5,seed:292,range:[0,180]});
        p.fill(v,0,0); p.rect(x-dx,y-dy,3,3);
        p.fill(0,v,0); p.rect(x,y,3,3);
        p.fill(0,0,v); p.rect(x+dx,y+dy,3,3);
      }
      p.blendMode(p.BLEND);
    };

    // ═══════════════════════════════════════════════════════
    // ROW 3 — MOTION: Wave as choreographer
    // ═══════════════════════════════════════════════════════

    // 30: Newton's cradle — wave-timed energy transfer
    FRAMES[30] = (t) => {
      p.stroke(150); p.strokeWeight(0.5);
      p.noFill();
      var active=p.floor(W(t,{wave:'square',seed:300,range:[0,1.99]}));
      for(var i=0;i<5;i++){
        var ang=0;
        if(i===0&&active===0) ang=W(t*3,{wave:'half sine',seed:301,range:[-0.6,0]});
        if(i===4&&active===1) ang=W(t*3,{wave:'half sine',seed:302,range:[0,0.6]});
        var bx=15+i*5+p.sin(ang)*15;
        var by=10+p.cos(ang)*15;
        p.line(15+i*5,5,bx,by);
        p.fill(200); p.ellipse(bx,by,5,5); p.noFill();
      }
    };

    // 31: Typewriter carriage — wave drives x position, steps y
    FRAMES[31] = (t) => {
      var chars='p5waves';
      var x=W(t*1.5,{wave:'saw up',seed:310,range:[3,45]});
      var row=p.floor(W(t*0.3,{wave:'steps down',seed:311,range:[0,5.99]}));
      p.fill(0,255,0); p.noStroke(); p.textSize(7); p.textFont('monospace');
      var ci=p.floor(W(t*3,{wave:'ramp',seed:312,range:[0,6.99]}));
      p.text(chars[ci],x,10+row*7);
      var blink=W(t*2,{wave:'square',seed:313,range:[0,1]})>0.5;
      if(blink){p.fill(0,255,0,150);p.rect(x+5,6+row*7,1,7);}
    };

    // 32: Windshield wiper — wave-driven arc sweep
    FRAMES[32] = (t) => {
      var angle=W(t,{wave:'triangle',seed:320,range:[-p.PI/3,p.PI/3]});
      var speed=W(t*0.3,{wave:'stepped sine',seed:321,range:[0.5,2]});
      p.stroke(255,200,100); p.strokeWeight(2);
      p.push(); p.translate(25,45); p.rotate(angle*speed);
      p.line(0,0,0,-35);
      p.noStroke(); p.fill(255,200,100);
      p.ellipse(0,-35,4,4);
      p.pop();
    };

    // 33: Wave trampoline — ball bounces on wave surface
    FRAMES[33] = (t) => {
      // Wave surface
      p.noFill(); p.stroke(100,100,255); p.strokeWeight(1);
      p.beginShape();
      for(var x=0;x<50;x++) p.vertex(x,35+W(x*0.06,{wave:'bumpy sine',t:t,seed:330,range:[-5,5]}));
      p.endShape();
      // Ball
      var bx=W(t,{wave:'saw up',seed:331,range:[5,45]});
      var surface=35+W(bx*0.06,{wave:'bumpy sine',t:t,seed:330,range:[-5,5]});
      var bounce=p.abs(W(t*2,{wave:'triangle',seed:332,range:[-15,0]}));
      p.noStroke(); p.fill(255,100,100);
      p.ellipse(bx,surface-4-bounce,6,6);
    };

    // 34: Clock hands — three hands, each wave-driven independently
    FRAMES[34] = (t) => {
      p.translate(25,25); p.noFill();
      p.stroke(60); p.strokeWeight(0.5); p.ellipse(0,0,44,44);
      // Hour
      p.stroke(255); p.strokeWeight(2);
      var ha=W(t*0.05,{wave:'ramp',seed:340,range:[0,p.TWO_PI]});
      p.line(0,0,p.cos(ha-p.HALF_PI)*10,p.sin(ha-p.HALF_PI)*10);
      // Minute
      p.strokeWeight(1.2);
      var ma=W(t*0.3,{wave:'ramp',seed:341,range:[0,p.TWO_PI]});
      p.line(0,0,p.cos(ma-p.HALF_PI)*16,p.sin(ma-p.HALF_PI)*16);
      // Second — jerky
      p.stroke(255,50,50); p.strokeWeight(0.5);
      var sa=W(t,{wave:'steps',seed:342,range:[0,p.TWO_PI]});
      p.line(0,0,p.cos(sa-p.HALF_PI)*19,p.sin(sa-p.HALF_PI)*19);
    };

    // 35: Pendulum wave — 7 pendulums with wave-driven lengths
    FRAMES[35] = (t) => {
      p.stroke(200); p.strokeWeight(0.8);
      for(var i=0;i<7;i++){
        var len=W(i*0.3,{wave:'ramp up sine',t:t*0.1,seed:350,range:[12,35]});
        var period=p.sqrt(len)*0.5;
        var angle=0.5*p.sin(t*p.TWO_PI/period);
        var bx=5+i*6.5+p.sin(angle)*len;
        var by=3+p.cos(angle)*len;
        p.line(5+i*6.5,3,bx,by);
        p.noStroke();p.fill(W(i,{seed:351,t:t,range:[150,255]}),200,255);
        p.ellipse(bx,by,4,4);p.stroke(200);p.strokeWeight(0.8);
      }
    };

    // 36: Caterpillar — wave drives body segments
    FRAMES[36] = (t) => {
      p.noStroke();
      for(var i=0;i<8;i++){
        var x=5+i*5.5+W(t+i*0.3,{wave:'sine',seed:360,range:[-2,2]});
        var y=25+W(t+i*0.3,{wave:'sine',seed:361,range:[-6,6]});
        var sz=W(i*0.3,{wave:'bumpy sine',t:t,seed:362,range:[3,7]});
        p.fill(50,W(i,{seed:363,t:t,range:[150,255]}),50);
        p.ellipse(x,y,sz,sz);
      }
      // Eyes on first segment
      p.fill(0); p.ellipse(8,22,2,2); p.ellipse(11,22,2,2);
    };

    // 37: Slingshot — charge & release controlled by wave
    FRAMES[37] = (t) => {
      var phase=W(t,{wave:'saw up',seed:370,range:[0,1]});
      p.stroke(150); p.strokeWeight(1);
      // Slingshot Y
      p.line(10,40,10,15); p.line(10,15,5,10); p.line(10,15,15,10);
      // Elastic + projectile
      var stretch=phase<0.7?phase/0.7:0;
      var fly=phase>=0.7?(phase-0.7)/0.3:0;
      var px=10+stretch*5+fly*35;
      var py=25-fly*15;
      if(phase<0.7){p.stroke(200,100,50);p.line(5,10,px,py);p.line(15,10,px,py);}
      p.noStroke();p.fill(255,80,80);p.ellipse(px,py,5,5);
    };

    // 38: Metronome — weighted arm swings, wave = tempo
    FRAMES[38] = (t) => {
      var tempo=W(t*0.2,{wave:'stepped sine',seed:380,range:[1,4]});
      var angle=W(t*tempo,{wave:'triangle',seed:381,range:[-p.PI/4,p.PI/4]});
      p.stroke(200); p.strokeWeight(1.5);
      p.push(); p.translate(25,45); p.rotate(angle);
      p.line(0,0,0,-35);
      p.fill(180); p.noStroke();
      var wPos=W(t*0.1,{wave:'ramp',seed:382,range:[10,30]});
      p.rect(-3,-wPos,6,5);
      p.pop();
      // Base
      p.noStroke(); p.fill(100);
      p.triangle(15,45,35,45,25,42);
    };

    // 39: Pinball — wave launches ball, wave curves flippers
    FRAMES[39] = (t) => {
      var bx=W(t,{wave:'wobble sine',seed:390,range:[5,45]});
      var by=W(t,{wave:'meta sine',seed:391,range:[5,40]});
      p.noStroke();p.fill(200); p.ellipse(bx,by,5,5);
      // Flippers
      p.stroke(255,150,0);p.strokeWeight(2);
      var fL=W(t*2,{wave:'pulse',seed:392,range:[-0.3,0.3]});
      p.push();p.translate(15,44);p.rotate(fL);p.line(0,0,10,-3);p.pop();
      p.push();p.translate(35,44);p.rotate(-fL);p.line(0,0,-10,-3);p.pop();
      // Bumpers
      p.noStroke();
      p.fill(W(t*4,{seed:393,wave:'square',range:[60,255]}),0,0); p.ellipse(15,20,6,6);
      p.fill(0,W(t*4,{seed:394,wave:'square',range:[60,255]}),0); p.ellipse(35,20,6,6);
      p.fill(0,0,W(t*4,{seed:395,wave:'square',range:[60,255]})); p.ellipse(25,12,6,6);
    };

    // ═══════════════════════════════════════════════════════
    // ROW 4 — PATTERN: Wave-generated structure
    // ═══════════════════════════════════════════════════════

    // 40: Wave weave — warp and weft driven by different waves
    FRAMES[40] = (t) => {
      p.strokeWeight(0.8);
      for(var i=0;i<12;i++){
        var y=i*4+W(i*0.3,{wave:'sine',t:t,seed:400,range:[-2,2]});
        p.stroke(W(i,{seed:401,t:t,range:[100,255]}),100,150);
        p.line(0,y,50,y+W(t,{seed:402+i,wave:'noise',range:[-3,3]}));
      }
      for(var i=0;i<12;i++){
        var x=i*4+W(i*0.3,{wave:'triangle',t:t,seed:403,range:[-2,2]});
        p.stroke(100,W(i,{seed:404,t:t,range:[100,255]}),150);
        p.line(x,0,x+W(t,{seed:405+i,wave:'noise',range:[-3,3]}),50);
      }
    };

    // 41: Tile rotation — each square tile rotated by wave
    FRAMES[41] = (t) => {
      p.noFill(); p.stroke(0,255,180); p.strokeWeight(0.7); p.rectMode(p.CENTER);
      for(var r=0;r<5;r++)for(var c=0;c<5;c++){
        p.push();p.translate(c*10+5,r*10+5);
        p.rotate(W((r*5+c)*0.2,{wave:'offset sine',t:t,seed:410,range:[0,p.HALF_PI]}));
        p.rect(0,0,8,8);p.pop();
      }
    };

    // 42: Wave-driven maze — walls appear/disappear
    FRAMES[42] = (t) => {
      p.stroke(255); p.strokeWeight(0.8);
      for(var r=0;r<5;r++)for(var c=0;c<5;c++){
        var x=c*10,y=r*10;
        if(W((r*5+c)*0.2,{wave:'square',t:t*0.3,seed:420,range:[0,1]})>0.5) p.line(x+10,y,x+10,y+10);
        if(W((r*5+c)*0.2+0.1,{wave:'square',t:t*0.3,seed:421,range:[0,1]})>0.5) p.line(x,y+10,x+10,y+10);
      }
    };

    // 43: Scale pattern — overlapping circles like fish scales
    FRAMES[43] = (t) => {
      p.noFill(); p.strokeWeight(0.6);
      for(var r=0;r<8;r++)for(var c=0;c<8;c++){
        var off=(r%2)*3.5;
        var x=c*7+off-3, y=r*6-2;
        var sz=W((r*8+c)*0.08,{wave:'bumpy sine',t:t,seed:430,range:[5,9]});
        p.stroke(W(r*8+c,{seed:431,t:t,range:[80,200]}),180,255);
        p.arc(x,y,sz,sz,-0.3,p.PI+0.3);
      }
    };

    // 44: Brick wall — wave shifts rows
    FRAMES[44] = (t) => {
      p.stroke(60); p.strokeWeight(0.5);
      for(var r=0;r<8;r++){
        var off=W(r,{wave:'noise',t:t,seed:440,range:[-4,4]});
        for(var c=-1;c<7;c++){
          var x=c*8+(r%2)*4+off;
          p.fill(W((r*7+c)*0.1,{seed:441,t:t,wave:'noise',range:[140,200]}),80,50);
          p.rect(x,r*6.25,7.5,5.5);
        }
      }
    };

    // 45: Spirograph — wave modulates inner/outer radius ratio
    FRAMES[45] = (t) => {
      p.noFill(); p.stroke(255,100,200); p.strokeWeight(0.6);
      var R=16,d=W(t*0.2,{wave:'sine',seed:450,range:[6,14]});
      var r=W(t*0.15,{wave:'triangle',seed:451,range:[3,8]});
      p.beginShape();
      for(var a=0;a<p.TWO_PI*5;a+=0.03){
        var x=(R-r)*p.cos(a)+d*p.cos((R-r)/r*a);
        var y=(R-r)*p.sin(a)-d*p.sin((R-r)/r*a);
        p.vertex(25+x,25+y);
      }
      p.endShape();
    };

    // 46: Kaleidoscope hexagons — wave picks hex fill
    FRAMES[46] = (t) => {
      p.colorMode(p.HSB,360,100,100); p.noStroke();
      for(var r=0;r<7;r++)for(var c=0;c<6;c++){
        var x=c*9+(r%2)*4.5,y=r*7;
        var h=W((r*6+c)*0.12,{wave:'triangle sine',t:t,seed:460,range:[0,360]});
        p.fill(h%360,75,85);
        p.beginShape();
        for(var i=0;i<6;i++) p.vertex(x+4*p.cos(i*p.PI/3),y+4*p.sin(i*p.PI/3));
        p.endShape(p.CLOSE);
      }
      p.colorMode(p.RGB);
    };

    // 47: Op-art wave — concentric shapes with wave offset
    FRAMES[47] = (t) => {
      p.noFill(); p.strokeWeight(1.5);
      var opx=W(t,{wave:'sine',seed:470,range:[-4,4]});
      var opy=W(t*0.8,{wave:'sine',seed:471,range:[-4,4]});
      for(var i=1;i<12;i++){
        p.stroke(i%2===0?255:0);
        p.ellipse(25+opx*(i/12),25+opy*(i/12),i*4,i*4);
      }
    };

    // 48: Domino cascade — wave tips each piece
    FRAMES[48] = (t) => {
      for(var i=0;i<8;i++){
        var tip=p.constrain(W(t-i*0.15,{wave:'ramp',seed:480,range:[-0.2,1.2]}),0,1)*p.HALF_PI;
        p.push(); p.translate(4+i*6,40);p.rotate(-tip);
        p.fill(W(i,{seed:481,t:t,range:[180,255]})); p.noStroke();
        p.rect(-2,-15,4,15,1);
        p.pop();
      }
    };

    // 49: Wave quilting — diamond patches with wave-shifted hues
    FRAMES[49] = (t) => {
      p.colorMode(p.HSB,360,100,100); p.noStroke();
      for(var r=0;r<7;r++)for(var c=0;c<7;c++){
        var x=c*8-3,y=r*8-3;
        var h=W((r*7+c)*0.1,{wave:'grow random',t:t,seed:490,range:[0,360]});
        p.fill(h%360,70,80);
        p.quad(x+4,y, x+8,y+4, x+4,y+8, x,y+4);
      }
      p.colorMode(p.RGB);
    };

    // ═══════════════════════════════════════════════════════
    // ROW 5 — ORGANIC: Wave as life force
    // ═══════════════════════════════════════════════════════

    // 50: Ant colony — wave drives pheromone trail direction
    FRAMES[50] = (t) => {
      p.noStroke();
      for(var ai=0;ai<STATE[50].length;ai++){
        var ant=STATE[50][ai];
        ant.a += W(ant.x*0.06+ant.y*0.06,{wave:'noise',t:t,seed:500,range:[-0.3,0.3]});
        ant.x += p.cos(ant.a)*0.8; ant.y += p.sin(ant.a)*0.8;
        ant.x=(ant.x+50)%50; ant.y=(ant.y+50)%50;
        p.fill(W(t+ai,{seed:501,wave:'sine',range:[100,200]}),80,60);
        p.ellipse(ant.x,ant.y,2,2);
      }
      p.fill(180,120,60); p.ellipse(25,25,5,5); // nest
    };

    // 51: Wave turtle — L-system-like drawing
    FRAMES[51] = (t,fc) => {
      var s=STATE[51];
      if(fc%2===0){
        var x=s.trail.length?s.trail[s.trail.length-1][0]:25;
        var y=s.trail.length?s.trail[s.trail.length-1][1]:25;
        var a=W(s.age*0.2,{wave:'zig-zag sine',t:t,seed:510,range:[-p.PI,p.PI]});
        var stepLen=W(s.age*0.1,{wave:'noise',t:t,seed:511,range:[1,4]});
        x+=p.cos(a)*stepLen;y+=p.sin(a)*stepLen;
        x=(x+50)%50;y=(y+50)%50;
        s.trail.push([x,y]);
        if(s.trail.length>120) s.trail.shift();
        s.age++;
      }
      p.noFill();
      for(var i=1;i<s.trail.length;i++){
        p.stroke(80,W(i*0.05,{seed:512,t:t,range:[150,255]}),80,p.map(i,0,s.trail.length,30,255));
        p.strokeWeight(0.8); p.line(s.trail[i-1][0],s.trail[i-1][1],s.trail[i][0],s.trail[i][1]);
      }
    };

    // 52: Crystal growth — wave picks growth direction
    FRAMES[52] = (t,fc) => {
      var s=STATE[52];
      if(fc%4===0&&s.pts.length<200){
        var last=s.pts[s.pts.length-1];
        var dir=p.floor(W(s.age,{wave:'noise',t:t,seed:520,range:[0,3.99]}));
        var dx=[1,-1,0,0][dir]*2,dy=[0,0,1,-1][dir]*2;
        var nx=p.constrain(last[0]+dx,2,48),ny=p.constrain(last[1]+dy,2,48);
        s.pts.push([nx,ny]);s.age++;
        if(s.pts.length>180){s.pts=[[25,25]];s.age=0;}
      }
      p.noStroke();
      for(var i=0;i<s.pts.length;i++){
        p.fill(180,220,W(i*0.05,{seed:521,t:t,range:[200,255]}),p.map(i,0,s.pts.length,50,255));
        p.rect(s.pts[i][0]-1,s.pts[i][1]-1,2,2);
      }
    };

    // 53: Erosion landscape — wave eats into terrain
    FRAMES[53] = (t) => {
      var h=STATE[53];
      for(var x=0;x<50;x++){
        var erode=W(x*0.06,{wave:'sharp peaks',t:t,seed:530,range:[-0.3,0.3]});
        h[x]=p.constrain(h[x]+erode,5,45);
      }
      p.noStroke();p.fill(80,140,60);
      p.beginShape();p.vertex(0,50);
      for(var x=0;x<50;x++)p.vertex(x,h[x]);
      p.vertex(50,50);p.endShape(p.CLOSE);
      p.fill(30,80,180);p.rect(0,0,50,p.min.apply(null,h));
    };

    // 54: Schooling fish — wave modulates alignment
    FRAMES[54] = (t) => {
      var fish=STATE[54];
      var align=W(t,{wave:'up down noise',seed:540,range:[0.01,0.08]});
      for(var fi=0;fi<fish.length;fi++){
        var f=fish[fi];
        var ax=0,ay=0,cx=0,cy=0,sx=0,sy=0,n=0;
        for(var oi=0;oi<fish.length;oi++){
          var o=fish[oi];if(o===f)continue;var d=p.dist(f.x,f.y,o.x,o.y);
          if(d<15){sx+=f.x-o.x;sy+=f.y-o.y;}ax+=o.vx;ay+=o.vy;cx+=o.x;cy+=o.y;n++;
        }
        if(n>0){ax/=n;ay/=n;cx/=n;cy/=n;
          f.vx+=sx*0.03+(ax-f.vx)*align+(cx-f.x)*0.008;
          f.vy+=sy*0.03+(ay-f.vy)*align+(cy-f.y)*0.008;}
        var sp=p.sqrt(f.vx*f.vx+f.vy*f.vy);if(sp>1.5){f.vx=f.vx/sp*1.5;f.vy=f.vy/sp*1.5;}
        f.x+=f.vx;f.y+=f.vy;f.x=(f.x+50)%50;f.y=(f.y+50)%50;
      }
      p.fill(W(t,{seed:541,wave:'sine',range:[100,200]}),180,255);p.noStroke();
      for(var fi=0;fi<fish.length;fi++){
        var f=fish[fi];
        p.push();p.translate(f.x,f.y);p.rotate(p.atan2(f.vy,f.vx));
        p.triangle(4,0,-3,-2,-3,2);p.pop();
      }
    };

    // 55: Lightning — wave triggers branch generation
    FRAMES[55] = (t,fc) => {
      var s=STATE[55];
      s.timer+=W(t,{wave:'sharp peaks',seed:550,range:[0,0.15]});
      if(s.timer>1){
        s.timer=0;s.branches=[];
        var x=W(t,{seed:551,wave:'noise',range:[10,40]}),y=0;
        var pts=[[x,y]];
        while(y<50){
          x+=W(y*0.1,{wave:'noise',t:t,seed:552,range:[-5,5]});
          y+=p.random(3,6);pts.push([p.constrain(x,2,48),y]);
        }
        s.branches=pts;
      }
      if(s.branches.length>1){
        p.stroke(200,200,255);p.strokeWeight(1.5);p.noFill();
        for(var i=1;i<s.branches.length;i++)
          p.line(s.branches[i-1][0],s.branches[i-1][1],s.branches[i][0],s.branches[i][1]);
      }
    };

    // 56: Pendulum array — 7 pendulums, wave sets damping
    FRAMES[56] = (t) => {
      var pends=STATE[56];
      var damp=W(t*0.1,{wave:'smooth solid sine',seed:560,range:[0.995,0.9999]});
      p.stroke(200);p.strokeWeight(0.8);
      for(var i=0;i<7;i++){
        var pd=pends[i];
        var acc=-0.02*p.sin(pd.a)*pd.len;
        pd.v+=acc;pd.v*=damp;pd.a+=pd.v;
        var bx=5+i*6.5+p.sin(pd.a)*pd.len;
        var by=5+p.cos(pd.a)*pd.len;
        p.line(5+i*6.5,5,bx,by);
        p.noStroke();p.fill(255,W(i,{seed:561,t:t,range:[100,200]}),100);
        p.ellipse(bx,by,3,3);p.stroke(200);p.strokeWeight(0.8);
      }
    };

    // 57: Jellyfish — bell pulses via wave, tentacles trail
    FRAMES[57] = (t) => {
      var pulse=W(t*2,{wave:'half sine',seed:570,range:[0.8,1.2]});
      // Bell
      p.noStroke();p.fill(150,100,255,150);
      p.arc(25,18,22*pulse,18*pulse,0,p.PI);
      // Tentacles
      p.stroke(150,100,255,100);p.strokeWeight(0.8);p.noFill();
      for(var i=0;i<5;i++){
        p.beginShape();
        var bx=17+i*4;
        for(var j=0;j<8;j++){
          var dx=W(j*0.3,{wave:'sine',t:t+i,seed:571+i,range:[-3,3]});
          p.vertex(bx+dx,18+j*4);
        }
        p.endShape();
      }
    };

    // 58: Vine growth — wave drives curl direction
    FRAMES[58] = (t) => {
      p.noFill();p.strokeWeight(1.2);
      for(var v=0;v<3;v++){
        p.stroke(40,W(v,{seed:580+v,t:t,range:[120,220]}),40);
        var x=10+v*15,y=48;
        p.beginShape();
        for(var i=0;i<20;i++){
          var curl=W(i*0.2,{wave:'wobble sine',t:t+v,seed:582+v,range:[-p.PI/4,p.PI/4]})-p.HALF_PI;
          x+=p.cos(curl)*2.5;y+=p.sin(curl)*2.5;
          p.vertex(x,y);
        }
        p.endShape();
      }
    };

    // 59: Heartbeat EKG — wave shapes the PQRST complex
    FRAMES[59] = (t) => {
      p.noFill();p.stroke(0,255,100);p.strokeWeight(1.5);
      p.beginShape();
      for(var x=0;x<50;x++){
        var phase=((x*0.04+t*0.8)%1);
        var y=25;
        if(phase<0.1) y+=W(phase*30,{wave:'half sine',seed:590,range:[0,3]});
        else if(phase<0.2) y-=W((phase-0.1)*30,{wave:'sharp peaks',seed:591,range:[0,15]});
        else if(phase<0.3) y+=W((phase-0.2)*30,{wave:'half sine',seed:592,range:[0,4]});
        else y+=W(phase,{seed:593,wave:'noise',t:t,range:[-0.5,0.5]});
        p.vertex(x,y);
      }
      p.endShape();
      // Scanlines
      p.stroke(0,255,100,20);p.strokeWeight(0.5);
      for(var y=0;y<50;y+=4) p.line(0,y,50,y);
    };

    // ═══════════════════════════════════════════════════════
    // ROW 6 — TEXTURE: Wave as bitmap sculptor
    // ═══════════════════════════════════════════════════════

    // 60: Wave-reseeded Life — wave controls mutation rate
    FRAMES[60] = (t,fc) => {
      var s=STATE[60];
      if(fc%3===0){
        s.n.fill(0);var alive=0;
        for(var y=0;y<25;y++)for(var x=0;x<25;x++){
          var c=0;for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++){
            if(!dx&&!dy)continue;c+=s.g[((y+dy+25)%25)*25+((x+dx+25)%25)];}
          var idx=y*25+x;
          s.n[idx]=s.g[idx]?(c===2||c===3?1:0):(c===3?1:0);
          // Wave-driven spontaneous generation
          if(!s.n[idx]&&W((x+y*25)*0.01,{wave:'pulse',t:t,seed:600,range:[0,1]})>0.97) s.n[idx]=1;
          alive+=s.n[idx];
        }
        var tmp=s.g;s.g=s.n;s.n=tmp;s.age++;
        if(alive<3||s.age>200){for(var i=0;i<625;i++)s.g[i]=p.random()<0.35?1:0;s.age=0;}
      }
      p.noStroke();
      var hue=W(t,{wave:'ramp',seed:601,range:[0,255]});
      for(var y=0;y<25;y++)for(var x=0;x<25;x++)
        if(s.g[y*25+x]){p.fill(hue,255,150);p.rect(x*2,y*2,2,2);}
    };

    // 61: Reaction-diffusion — wave modulates kill rate
    FRAMES[61] = (t,fc) => {
      var s=STATE[61];
      var feed=0.055,kill=0.062+W(t*0.05,{wave:'sine',seed:610,range:[-0.003,0.003]});
      for(var iter=0;iter<2;iter++){
        s.nA.set(s.A);s.nB.set(s.B);
        for(var y=1;y<24;y++)for(var x=1;x<24;x++){
          var idx=y*25+x;
          var lA=s.A[idx-1]+s.A[idx+1]+s.A[idx-25]+s.A[idx+25]-4*s.A[idx];
          var lB=s.B[idx-1]+s.B[idx+1]+s.B[idx-25]+s.B[idx+25]-4*s.B[idx];
          var ab=s.A[idx]*s.B[idx]*s.B[idx];
          s.nA[idx]=p.constrain(s.A[idx]+(lA-ab+feed*(1-s.A[idx]))*0.8,0,1);
          s.nB[idx]=p.constrain(s.B[idx]+(0.5*lB+ab-(kill+feed)*s.B[idx])*0.8,0,1);
        }
        var tmpA=s.A;s.A=s.nA;s.nA=tmpA;var tmpB=s.B;s.B=s.nB;s.nB=tmpB;
      }
      p.noStroke();
      for(var y=0;y<25;y++)for(var x=0;x<25;x++){
        var v=s.A[y*25+x]-s.B[y*25+x];
        p.fill(p.map(v,-1,1,0,255),0,p.map(v,-1,1,200,50));p.rect(x*2,y*2,2,2);
      }
    };

    // 62: Woodgrain — wave creates ring pattern
    FRAMES[62] = (t) => {
      p.noStroke();
      for(var y=0;y<50;y+=2)for(var x=0;x<50;x+=2){
        var d=p.dist(x,y,25+W(y*0.02,{seed:620,t:t,range:[-5,5]}),25);
        var ring=W(d*0.08,{wave:'triangle',t:t*0.1,seed:621,range:[0,1]});
        p.fill(140+ring*60,80+ring*40,40+ring*20);
        p.rect(x,y,2,2);
      }
    };

    // 63: Water caustics — overlapping wave interference
    FRAMES[63] = (t) => {
      p.noStroke();
      for(var y=0;y<50;y+=2)for(var x=0;x<50;x+=2){
        var v1=W(x*0.08,{wave:'sine',t:t,seed:630,range:[-1,1]});
        var v2=W(y*0.08,{wave:'sine',t:t*1.3,seed:631,range:[-1,1]});
        var v3=W((x+y)*0.04,{wave:'sine',t:t*0.7,seed:632,range:[-1,1]});
        var bright=p.map(v1+v2+v3,-3,3,30,220);
        p.fill(bright*0.5,bright*0.8,bright);
        p.rect(x,y,2,2);
      }
    };

    // 64: Fabric weave — alternating pixel rows displaced
    FRAMES[64] = (t) => {
      p.noStroke();
      for(var y=0;y<50;y+=2){
        var dx=y%4===0?W(y*0.04,{wave:'sine',t:t,seed:640,range:[-3,3]}):0;
        var dy=y%4===2?W(y*0.04,{wave:'sine',t:t,seed:641,range:[-3,3]}):0;
        for(var x=0;x<50;x+=2){
          var c=y%4===0?
            p.color(W(x*0.04,{seed:642,t:t,range:[120,220]}),60,80):
            p.color(60,W(x*0.04,{seed:643,t:t,range:[120,220]}),80);
          p.fill(c);p.rect(x+dx,y+dy,2,2);
        }
      }
    };

    // 65: Glitch bands — wave picks glitch offset per row
    FRAMES[65] = (t) => {
      p.noStroke();
      for(var y=0;y<50;y+=2){
        var glitch=W(y*0.04,{wave:'pulse',t:t,seed:650,range:[-15,15]});
        for(var x=0;x<50;x+=2){
          var v=W((x+glitch)*0.04,{wave:'stepped sine',t:t,seed:651,range:[0,255]});
          p.fill(v,v*0.5,W(y*0.02,{seed:652,t:t,range:[100,255]}));
          p.rect(x,y,2,2);
        }
      }
    };

    // 66: Topographic map — wave as contour lines
    FRAMES[66] = (t) => {
      p.noStroke();
      for(var y=0;y<50;y+=2)for(var x=0;x<50;x+=2){
        var h=W((x*x+y*y)*0.0005,{wave:'valleys',t:t*0.2,seed:660,range:[0,10]});
        var contour=h%1;
        p.fill(contour<0.1?p.color(80,60,40):p.color(40+h*20,80+h*15,30+h*10));
        p.rect(x,y,2,2);
      }
    };

    // 67: CRT scanlines — wave modulates brightness per line
    FRAMES[67] = (t) => {
      p.noStroke();
      for(var y=0;y<50;y++){
        var scanB=W(y*0.1,{wave:'square',t:0,seed:670,range:[0.6,1]});
        var lineB=W(y*0.04,{wave:'sine',t:t,seed:671,range:[50,200]});
        p.fill(0,lineB*scanB,0);p.rect(0,y,50,1);
      }
      // Phosphor afterglow
      p.noStroke();p.fill(0,255,0,30);
      var scanY=(t*30)%50;
      p.rect(0,scanY,50,3);
    };

    // 68: Marble texture — veined pattern
    FRAMES[68] = (t) => {
      p.noStroke();
      for(var y=0;y<50;y+=2)for(var x=0;x<50;x+=2){
        var vein=W(x*0.03+W(y*0.04,{wave:'noise',t:t*0.2,seed:680,range:[-2,2]}),
                  {wave:'sharp peaks',t:t*0.1,seed:681,range:[0,1]});
        var b=180+vein*70;
        p.fill(b,b-20,b-10); p.rect(x,y,2,2);
      }
    };

    // 69: Pixelated fire — wave as heat source
    FRAMES[69] = (t) => {
      p.noStroke();
      for(var y=0;y<50;y+=2)for(var x=0;x<50;x+=2){
        var heat=W(x*0.06,{wave:'noise',t:t*2,seed:690+p.floor(y/10),range:[0,1]});
        var cooldown=y/50;
        var v=p.max(0,heat-cooldown*0.7);
        if(v>0.5) p.fill(255,255*v,0);
        else if(v>0.2) p.fill(255*v*2,0,0);
        else p.fill(v*200,0,0);
        p.rect(x,y,2,2);
      }
    };

    // ═══════════════════════════════════════════════════════
    // ROW 7 — COMPOSITION: Multi-wave masterworks
    // ═══════════════════════════════════════════════════════

    // 70: Four-wave interference — visible beats
    FRAMES[70] = (t) => {
      p.noStroke();
      for(var y=0;y<50;y+=2)for(var x=0;x<50;x+=2){
        var v=W(x*0.06,{wave:'sine',t:t,seed:700,range:[-1,1]})
             +W(y*0.06,{wave:'sine',t:t*1.1,seed:701,range:[-1,1]})
             +W((x-y)*0.04,{wave:'triangle',t:t*0.7,seed:702,range:[-1,1]})
             +W(p.dist(x,y,25,25)*0.05,{wave:'sine',t:t*0.5,seed:703,range:[-1,1]});
        p.fill(p.map(v,-4,4,0,255),100,p.map(v,-4,4,200,50)); p.rect(x,y,2,2);
      }
    };

    // 71: Layered silhouettes — 6 mountain ranges at different speeds
    FRAMES[71] = (t) => {
      p.noStroke();
      var wvs=['mountain peaks','valleys','noise','sharp peaks','bumpy sine','wobble sine'];
      for(var l=0;l<6;l++){
        p.fill(10+l*15,15+l*20,30+l*25,p.map(l,0,5,50,240));
        p.beginShape();p.vertex(0,50);
        for(var x=0;x<=50;x+=2)
          p.vertex(x,8+l*7+W(x*0.04,{wave:wvs[l],t:t*(0.1+l*0.05),seed:710+l,range:[-10,10]}));
        p.vertex(50,50);p.endShape(p.CLOSE);
      }
    };

    // 72: Wave organ — 8 pipes, height=wave, width=wave
    FRAMES[72] = (t) => {
      p.noStroke();
      for(var i=0;i<8;i++){
        var h=W(i*0.3,{wave:'ramp up sine',t:t,seed:720,range:[10,45]});
        var w=W(i*0.4,{wave:'sine',t:t*0.5,seed:721,range:[2,5]});
        p.fill(W(i,{seed:722,t:t,range:[150,220]}),140+i*10,100);
        p.rect(3+i*6,50-h,w,h,w/2);
      }
    };

    // 73: Chained oscilloscope — wave1->freq of wave2->amp of wave3
    FRAMES[73] = (t) => {
      p.noFill();p.stroke(0,255,180);p.strokeWeight(1.5);
      p.beginShape();
      for(var x=0;x<50;x++){
        var freq=W(t,{wave:'sine',seed:730,range:[0.03,0.12]});
        var amp=W(x*freq,{wave:'triangle',t:t,seed:731,range:[3,18]});
        var y=25+W(x*0.08,{wave:'bumpy sine',t:t,seed:732,range:[-1,1]})*amp;
        p.vertex(x,y);
      }
      p.endShape();
      p.stroke(0,255,180,25);for(var y=0;y<50;y+=4)p.line(0,y,50,y);
    };

    // 74: Radar sweep — rotating line reveals wave-driven terrain
    FRAMES[74] = (t) => {
      var sweepAngle=W(t,{wave:'ramp',seed:740,range:[0,p.TWO_PI]});
      p.translate(25,25);
      // Circles
      p.noFill();p.stroke(0,100,0);p.strokeWeight(0.3);
      for(var r=5;r<25;r+=5) p.ellipse(0,0,r*2,r*2);
      // Blips
      p.noStroke();
      for(var i=0;i<12;i++){
        var a=W(i*0.5,{wave:'noise',seed:741+i,t:0,range:[0,p.TWO_PI]});
        var r=W(i*0.3,{seed:753+i,t:0,wave:'noise',range:[5,20]});
        var angleDiff=p.abs(((a-sweepAngle+p.PI)%(p.TWO_PI))-p.PI);
        var bright=p.max(0,1-angleDiff*2);
        p.fill(0,255*bright,0,255*bright);
        p.ellipse(p.cos(a)*r,p.sin(a)*r,3,3);
      }
      // Sweep line
      p.stroke(0,255,0,200);p.strokeWeight(1);
      p.line(0,0,p.cos(sweepAngle)*23,p.sin(sweepAngle)*23);
    };

    // 75: Stacked waveforms — 5 overlapping, each unique color + wave
    FRAMES[75] = (t) => {
      p.noFill();p.strokeWeight(1);
      var wvs=['batman','noise','wobble sine','stepped sine','meta sine'];
      var cols=[[255,0,100],[0,255,150],[100,100,255],[255,200,0],[255,100,255]];
      for(var i=0;i<5;i++){
        p.stroke(cols[i][0],cols[i][1],cols[i][2],180);
        p.beginShape();
        for(var x=0;x<50;x++)
          p.vertex(x,10+i*8+W(x*0.06,{wave:wvs[i],t:t+i*0.3,seed:750+i,range:[-4,4]}));
        p.endShape();
      }
    };

    // 76: Beat grid — 8x4 sequencer, wave triggers beats
    FRAMES[76] = (t) => {
      p.noStroke();
      var stepIdx=p.floor((t*4)%8);
      for(var r=0;r<4;r++)for(var c=0;c<8;c++){
        var on=W((r*8+c)*0.15,{wave:'square',t:t*0.4,seed:760+r,range:[0,1]})>0.5;
        var active=c===stepIdx&&on;
        p.fill(active?p.color(255,W(r,{seed:764,t:t,range:[100,200]}),0):on?p.color(60):p.color(20));
        p.rect(c*6+1,r*12+2,5,10,1);
      }
      // Playhead
      p.stroke(255,255,0,100);p.strokeWeight(0.5);
      p.line(stepIdx*6+3,0,stepIdx*6+3,50);
    };

    // 77: Moire weave — two wave-stripe sets crossing
    FRAMES[77] = (t) => {
      p.stroke(255,60);p.strokeWeight(0.4);
      var a1=W(t,{wave:'sine',seed:770,range:[-0.3,0.3]});
      var a2=W(t*0.7,{wave:'triangle',seed:771,range:[-0.3,0.3]});
      for(var i=-20;i<70;i+=3){
        p.line(i+a1*20,0,i-a1*20,50);
        p.line(0,i+a2*20,50,i-a2*20);
      }
    };

    // 78: Double exposure — two different wave scenes overlaid
    FRAMES[78] = (t) => {
      p.noStroke();p.blendMode(p.ADD);
      // Scene 1: radial
      for(var y=0;y<50;y+=3)for(var x=0;x<50;x+=3){
        var d=p.dist(x,y,25,25);
        p.fill(W(d*0.05,{wave:'sine',t:t,seed:780,range:[0,120]}),0,0);
        p.rect(x,y,3,3);
      }
      // Scene 2: linear
      for(var y=0;y<50;y+=3)for(var x=0;x<50;x+=3){
        p.fill(0,0,W(x*0.04,{wave:'triangle',t:t*0.8,seed:781,range:[0,120]}));
        p.rect(x,y,3,3);
      }
      p.blendMode(p.BLEND);
    };

    // 79: Flow field — wave drives arrow direction
    FRAMES[79] = (t) => {
      p.stroke(255); p.strokeWeight(0.7);
      for(var r=0;r<6;r++)for(var c=0;c<6;c++){
        var angle=W((r*6+c)*0.15,{wave:'offset sine',t:t,seed:790,range:[-p.PI,p.PI]});
        var x=4+c*8,y=4+r*8;
        p.push();p.translate(x,y);p.rotate(angle);
        p.line(-3,0,3,0);p.line(2,-1.5,3,0);p.line(2,1.5,3,0);
        p.pop();
      }
    };

    // ═══════════════════════════════════════════════════════
    // ROW 8 — SPATIAL: Wave in the third dimension
    // ═══════════════════════════════════════════════════════

    // 80: Wave-extruded terrain — 3D bars from above
    FRAMES[80] = (t) => {
      p.noStroke();
      for(var r=0;r<8;r++)for(var c=0;c<8;c++){
        var h=W((r*8+c)*0.08,{wave:'mountain peaks',t:t,seed:800,range:[2,12]});
        var x=3+c*6-r*0.5,y=3+r*6-h;
        var bright=p.map(h,2,12,60,240);
        p.fill(bright,bright*0.8,W(r*8+c,{seed:801,t:t,range:[100,200]}));
        p.rect(x,y,5,h);
      }
    };

    // 81: Voxel landscape — isometric blocks with wave height
    FRAMES[81] = (t) => {
      p.noStroke();
      for(var r=4;r>=0;r--)for(var c=0;c<5;c++){
        var h=p.floor(W(r*5+c,{wave:'noise',t:t*0.3,seed:810,range:[1,4.99]}));
        for(var layer=0;layer<h;layer++){
          var ix=8+(c-r)*5,iy=25+(c+r)*3-layer*5;
          p.fill(80+layer*30,140+layer*20,80+layer*20);
          p.quad(ix,iy,ix+5,iy-2.5,ix,iy-5,ix-5,iy-2.5);
          p.fill(50+layer*20,100+layer*15,50+layer*15);
          p.quad(ix-5,iy-2.5,ix,iy,ix,iy+3,ix-5,iy+0.5);
          p.fill(30+layer*15,70+layer*10,30+layer*10);
          p.quad(ix,iy,ix+5,iy-2.5,ix+5,iy+0.5,ix,iy+3);
        }
      }
    };

    // 82: Starfield warp — wave controls warp speed
    FRAMES[82] = (t) => {
      var warp=W(t,{wave:'ramp up sine',seed:820,range:[0.3,3]});
      p.noStroke();
      for(var i=0;i<30;i++){
        var a=(i*2.4+0.5);
        var baseR=(i*1.3+t*warp*5)%25;
        var x=25+p.cos(a)*baseR,y=25+p.sin(a)*baseR;
        var sz=p.map(baseR,0,25,0.5,2.5);
        p.fill(255,p.map(baseR,0,25,80,255));
        p.ellipse(x,y,sz);
      }
    };

    // 83: Rotating donut — torus cross-section
    FRAMES[83] = (t) => {
      p.noStroke();
      var R=14,r=5;
      for(var a=0;a<p.TWO_PI;a+=0.15){
        for(var b=0;b<p.TWO_PI;b+=0.3){
          var x3=(R+r*p.cos(b))*p.cos(a);
          var y3=(R+r*p.cos(b))*p.sin(a);
          var z3=r*p.sin(b);
          var rot=W(t,{wave:'sine',seed:830,range:[0,p.TWO_PI]});
          var x2=x3*p.cos(rot)-z3*p.sin(rot);
          var z2=x3*p.sin(rot)+z3*p.cos(rot);
          var depth=p.map(z2,-20,20,40,255);
          p.fill(W(a*2,{seed:831,t:t,range:[100,200]}),depth*0.7,depth,depth);
          p.ellipse(25+x2*0.9,25+y3*0.9,p.map(z2,-20,20,0.5,2.5));
        }
      }
    };

    // 84: Parallax city skyline — 4 layers
    FRAMES[84] = (t) => {
      p.noStroke();
      for(var l=0;l<4;l++){
        var speed=0.15+l*0.25;
        var b=20+l*40;
        p.fill(b*0.3,b*0.4,b);
        for(var i=-1;i<8;i++){
          var x=((i*8+t*speed*20)%64)-8;
          var h=W(i+l*10,{wave:'steps',seed:840+l,t:t*0.1,range:[8,25+l*5]});
          p.rect(x,50-h,6,h);
        }
      }
    };

    // 85: Galaxy spiral — wave drives arm curvature
    FRAMES[85] = (t) => {
      p.noStroke();
      var twist=W(t*0.1,{wave:'sine',seed:850,range:[0.3,0.8]});
      for(var si=0;si<STATE[85].stars.length;si++){
        var s=STATE[85].stars[si];
        s.a+=s.speed*0.01;
        var spiralA=s.a+s.r*twist;
        var x=25+p.cos(spiralA)*s.r;
        var y=25+p.sin(spiralA)*s.r;
        p.fill(255,W(s.r*0.1,{seed:851,t:t,range:[180,255]}),200,W(t+s.a,{seed:852,wave:'half sine',range:[80,255]}));
        p.ellipse(x,y,p.map(s.r,2,22,1,2.5));
      }
      p.fill(255,240,200);p.ellipse(25,25,4,4);
    };

    // 86: Depth-sorted spheres — wave controls Z
    FRAMES[86] = (t) => {
      p.noStroke();
      var spheres=[];
      for(var i=0;i<15;i++){
        var z=W(i*0.3,{wave:'sine',t:t+i,seed:860+i,range:[-1,1]});
        spheres.push({
          x:W(t*0.5,{wave:'noise',seed:870+i,range:[8,42]}),
          y:W(t*0.4,{wave:'noise',seed:880+i,range:[8,42]}),z:z,i:i
        });
      }
      spheres.sort(function(a,b){return a.z-b.z;});
      for(var si=0;si<spheres.length;si++){
        var s=spheres[si];
        var sz=p.map(s.z,-1,1,2,8);
        p.fill(W(s.i,{seed:890+s.i,t:t,range:[100,255]}),150,255,p.map(s.z,-1,1,80,255));
        p.ellipse(s.x,s.y,sz);
      }
    };

    // 87: Infinite tunnel — wave modulates tunnel shape
    FRAMES[87] = (t) => {
      p.noFill();p.strokeWeight(1);
      for(var i=0;i<10;i++){
        var depth=((t*0.5+i*0.1)%1);
        var sz=depth*45;
        var sides=p.floor(W(i,{wave:'steps',seed:870,t:t*0.2,range:[3,6.99]}));
        p.stroke(255,255*(1-depth));
        p.push();p.translate(25,25);p.rotate(W(i*0.3,{seed:871,t:t,range:[0,p.PI/6]}));
        p.beginShape();
        for(var j=0;j<sides;j++){
          var a=j*p.TWO_PI/sides-p.HALF_PI;
          p.vertex(p.cos(a)*sz/2,p.sin(a)*sz/2);
        }
        p.endShape(p.CLOSE);p.pop();
      }
    };

    // 88: Planet with ring — wave tilts ring
    FRAMES[88] = (t) => {
      p.noStroke();
      // Ring (behind)
      var tilt=W(t,{wave:'smooth solid sine',seed:880,range:[0.2,0.8]});
      p.stroke(180,160,140);p.strokeWeight(1);p.noFill();
      p.ellipse(25,25,38,38*tilt);
      // Planet
      p.noStroke();
      for(var i=12;i>0;i--){
        p.fill(W(i*0.3,{seed:881,t:t*0.2,range:[40,120]}),80+i*8,W(i*0.2,{seed:882,t:t,range:[80,150]}));
        p.ellipse(25,25,i*2,i*2);
      }
      // Ring (in front) — brighter arc
      p.noFill();p.stroke(200,180,160,200);p.strokeWeight(1.5);
      p.arc(25,25,38,38*tilt,-0.3,p.PI+0.3);
    };

    // 89: Hologram flicker — wave controls visibility
    FRAMES[89] = (t) => {
      var flicker=W(t*4,{wave:'up down noise',seed:890,range:[0.2,1]});
      var scanY=(t*40)%50;
      // Holographic shape
      p.noFill();p.stroke(0,200,255,200*flicker);p.strokeWeight(1);
      p.push();p.translate(25,25);p.rotate(W(t,{seed:891,wave:'sine',range:[0,p.TWO_PI]}));
      for(var i=0;i<3;i++){
        var s=10+i*5;
        p.rect(-s/2,-s/2,s,s);
      }
      p.pop();
      // Scan line
      p.stroke(0,200,255,80*flicker);p.strokeWeight(2);
      p.line(0,scanY,50,scanY);
    };

    // ═══════════════════════════════════════════════════════
    // ROW 9 — EXTREMES: Wave pushed to breaking point
    // ═══════════════════════════════════════════════════════

    // 90: All 34 waves in one frame — stacked micro-lines
    FRAMES[90] = (t) => {
      var all=['classic sine','sine','sharp peaks','square','pulse','stepped sine',
        'mountain peaks','valleys','zig-zag sine','batman','offset sine','steps down','steps',
        'squared sine','bumpy sine','wobble sine','up down noise','meta sine','triangle','ramp',
        'saw down','saw up','fade out','grow random','noise','fuzzy pulse','up down pulse',
        'bald patch','fuzzy peak sine','ramp up sine','triangle sine','round linked sine',
        'half sine','smooth solid sine'];
      p.noFill();p.strokeWeight(0.5);
      var scroll=(t*5)%170;
      for(var i=0;i<34;i++){
        var y=i*5-scroll;if(y<-5||y>50)continue;
        p.stroke((i*10)%256,180,220);
        p.beginShape();
        for(var x=0;x<50;x+=2)p.vertex(x,W(x*0.08,{wave:all[i],t:t,seed:i,range:[y,y+4]}));
        p.endShape();
      }
    };

    // 91: Wave chess — wave picks which squares have pieces
    FRAMES[91] = (t) => {
      p.noStroke();
      var pieces=['\u265A','\u265B','\u265C','\u265D','\u265E','\u265F'];
      for(var r=0;r<6;r++)for(var c=0;c<6;c++){
        p.fill((r+c)%2===0?60:30);p.rect(c*8+1,r*8+1,8,8);
        var hasPiece=W((r*6+c)*0.12,{wave:'square',t:t*0.3,seed:910,range:[0,1]})>0.5;
        if(hasPiece){
          var pi=p.floor(W(r*6+c,{seed:911,t:t*0.2,wave:'steps',range:[0,5.99]}));
          p.fill(W(r*6+c,{seed:912,t:t,wave:'square',range:[0,1]})>0.5?220:100);
          p.textSize(6);p.textAlign(p.CENTER,p.CENTER);
          p.text(pieces[pi],c*8+5,r*8+5);
        }
      }
    };

    // 92: Seismograph — wave amplitude builds and releases
    FRAMES[92] = (t) => {
      var buf=STATE[92].buf;
      // Shift left, add new sample
      for(var i=0;i<49;i++) buf[i]=buf[i+1];
      var quake=W(t,{wave:'sharp peaks',seed:920,range:[0,1]});
      buf[49]=25+W(t*3,{wave:'noise',seed:921,range:[-15,15]})*quake;
      p.noFill();p.stroke(255,50,50);p.strokeWeight(1.2);
      p.beginShape();for(var x=0;x<50;x++)p.vertex(x,buf[x]);p.endShape();
      // Baseline
      p.stroke(255,30);p.line(0,25,50,25);
    };

    // 93: Wave feedback — output feeds back as input
    FRAMES[93] = (t) => {
      p.noFill();p.stroke(255,200,100);p.strokeWeight(1);
      var val=0;
      p.beginShape();
      for(var x=0;x<50;x++){
        val=W(x*0.06+val*0.3,{wave:'sine',t:t,seed:930,range:[-1,1]});
        p.vertex(x,25+val*18);
      }
      p.endShape();
      // Second pass with different seed
      p.stroke(100,200,255);
      val=0;p.beginShape();
      for(var x=0;x<50;x++){
        val=W(x*0.06+val*0.5,{wave:'noise',t:t,seed:931,range:[-1,1]});
        p.vertex(x,25+val*18);
      }
      p.endShape();
    };

    // 94: Wave as random number generator — scatter plot
    FRAMES[94] = (t) => {
      p.noStroke();
      for(var i=0;i<50;i++){
        var x=W(i*0.07,{wave:'grow random',t:t,seed:940,range:[2,48]});
        var y=W(i*0.07,{wave:'grow random',t:t,seed:941,range:[2,48]});
        var sz=W(i*0.1,{seed:942,t:t,wave:'noise',range:[1,4]});
        p.fill(W(i,{seed:943,t:t,range:[100,255]}),180,255,180);
        p.ellipse(x,y,sz);
      }
    };

    // 95: Comet swarm — 4 comets with wave-driven orbits
    FRAMES[95] = (t) => {
      p.noStroke();
      for(var ci=0;ci<STATE[95].length;ci++){
        var c=STATE[95][ci];
        var cx=25+W(t+c.phase,{wave:'wobble sine',seed:950+ci,range:[-20,20]});
        var cy=25+W(t+c.phase,{wave:'meta sine',seed:954+ci,range:[-20,20]});
        c.trail.unshift({x:cx,y:cy});if(c.trail.length>20)c.trail.pop();
        for(var i=0;i<c.trail.length;i++){
          p.fill(255,W(i*0.2,{seed:958,t:t,range:[100,200]}),50,p.map(i,0,c.trail.length,220,0));
          p.ellipse(c.trail[i].x,c.trail[i].y,p.map(i,0,c.trail.length,4,0.5));
        }
      }
    };

    // 96: Wave conductor — wand position affects all sub-waves
    FRAMES[96] = (t) => {
      var wx=W(t,{wave:'sine',seed:960,range:[5,45]});
      var wy=W(t*0.7,{wave:'triangle',seed:961,range:[5,20]});
      // Wand
      p.noStroke();p.fill(255);p.ellipse(wx,wy,3,3);
      p.stroke(200);p.strokeWeight(0.5);p.line(wx,wy,wx,wy+8);
      // Sub-waves influenced by wand position
      p.noFill();p.strokeWeight(1);
      for(var i=0;i<3;i++){
        p.stroke(W(i,{seed:962+i,t:t,range:[100,255]}),150,255);
        p.beginShape();
        for(var x=0;x<50;x++){
          var influence=1/(1+p.dist(x,35+i*5,wx,wy)*0.1);
          p.vertex(x,35+i*5+W(x*0.06,{wave:'sine',t:t,seed:965+i,range:[-5,5]})*influence*3);
        }
        p.endShape();
      }
    };

    // 97: Frequency modulation — wave1 modulates wave2's frequency
    FRAMES[97] = (t) => {
      p.noFill();p.strokeWeight(1.5);
      p.stroke(200,100,255);
      p.beginShape();
      for(var x=0;x<50;x++){
        var modulator=W(x*0.04,{wave:'sine',t:t,seed:970,range:[0.02,0.15]});
        var carrier=W(x*modulator*3,{wave:'sine',t:t,seed:971,range:[-18,18]});
        p.vertex(x,25+carrier);
      }
      p.endShape();
      // Show modulator as ghost
      p.stroke(200,100,255,40);p.strokeWeight(0.5);
      p.beginShape();
      for(var x=0;x<50;x++)
        p.vertex(x,25+W(x*0.04,{wave:'sine',t:t,seed:970,range:[-18,18]}));
      p.endShape();
    };

    // 98: DNA double helix 3D — waves create depth illusion
    FRAMES[98] = (t) => {
      STATE[98].rot+=0.02;
      p.strokeWeight(1.8);
      for(var y=0;y<50;y++){
        var phase=y*0.15+STATE[98].rot;
        var x1=25+W(phase,{wave:'sine',seed:980,range:[-12,12],t:0});
        var x2=25+W(phase+p.PI,{wave:'sine',seed:980,range:[-12,12],t:0});
        var z1=W(phase,{wave:'sine',seed:981,range:[0,1],t:0});
        var z2=W(phase+p.PI,{wave:'sine',seed:981,range:[0,1],t:0});
        // Draw back strand first
        if(z1<z2){
          p.stroke(0,150,255,z1*255);p.point(x1,y);
          if(y%4===0){p.stroke(255,50);p.line(x1,y,x2,y);}
          p.stroke(255,100,200,z2*255);p.point(x2,y);
        } else {
          p.stroke(255,100,200,z2*255);p.point(x2,y);
          if(y%4===0){p.stroke(255,50);p.line(x1,y,x2,y);}
          p.stroke(0,150,255,z1*255);p.point(x1,y);
        }
      }
    };

    // 99: The Grand Unified Wave — every visual property from a different wave type
    FRAMES[99] = (t) => {
      p.colorMode(p.HSB,360,100,100);
      var n=p.floor(W(t*0.3,{wave:'steps',seed:990,range:[4,12.99]}));
      for(var i=0;i<n;i++){
        var x=W(t+i*0.5,{wave:'wobble sine',seed:991+i,range:[5,45]});
        var y=W(t+i*0.5,{wave:'meta sine',seed:1001+i,range:[5,45]});
        var sz=W(i*0.3,{wave:'bumpy sine',t:t,seed:1011+i,range:[3,12]});
        var h=W(i,{wave:'triangle',t:t*0.5,seed:1021+i,range:[0,360]});
        var s=W(t,{wave:'half sine',seed:1031+i,range:[50,100]});
        var b=W(t*0.7,{wave:'ramp up sine',seed:1041+i,range:[50,100]});
        var rot=W(t,{wave:'saw up',seed:1051+i,range:[0,p.TWO_PI]});
        var sides=p.floor(W(i*0.5,{wave:'stepped sine',t:t*0.2,seed:1061+i,range:[3,6.99]}));
        p.noStroke();p.fill(h%360,s,b);
        p.push();p.translate(x,y);p.rotate(rot);
        p.beginShape();
        for(var j=0;j<sides;j++){
          var a=j*p.TWO_PI/sides-p.HALF_PI;
          p.vertex(p.cos(a)*sz,p.sin(a)*sz);
        }
        p.endShape(p.CLOSE);p.pop();
      }
      p.colorMode(p.RGB);
    };
  }

}, 'grid100-canvas'));
