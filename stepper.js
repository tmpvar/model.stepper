var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Stepper(frame, stepsPerRotation, ozin, coilResistance) {
  EventEmitter.call(this);

  this.stepsPerRotation = stepsPerRotation;
  this.radsPerStep = (Math.PI*2)/stepsPerRotation;
  this.steps = 0;
  this.ozin = ozin;
  this.frame = frame;

  this.rpm = 0;

  // The maximum detent torque (Tdm) is not always specified.
  // This parameter can be assumed to be equal to 1-10% of the maximum holding torque
  // taken from: http://www.mathworks.com/help/physmod/sps/powersys/ref/steppermotor.html
  this.detent = ozin*.05;

  this.timer = 0;
  this.stepTracker = 0;

  this.steps = 0.0;
  this.wires = [0, 0, 0, 0];
  this.phase = 0;
  this.currentAngle = 0;
}

Stepper.NEMA8 =  { w: 20.32,  holes: 16.00, holeD: 3.00, shaftD: 4.00  };
Stepper.NEMA11 = { w: 27.94,  holes: 23.00, holeD: 4.00, shaftD: 5.00  };
Stepper.NEMA14 = { w: 35.56,  holes: 26.00, holeD: 4.00, shaftD: 5.00  };
Stepper.NEMA17 = { w: 43.18,  holes: 31.00, holeD: 4.00, shaftD: 5.00  };
Stepper.NEMA23 = { w: 58.41,  holes: 47.14, holeD: 5.00, shaftD: 6.35  }; 
Stepper.NEMA34 = { w: 86.36,  holes: 69.70, holeD: 5.50, shaftD: 9.50  }; 
Stepper.NEMA42 = { w: 106.68, holes: 89.90, holeD: 7.13, shaftD: 16.00 }; 

Stepper.ROTATION = 'rotation';

util.inherits(Stepper, EventEmitter);

Stepper.prototype.step = function(direction) {
  this.steps += direction;
  this.currentAngle = this.steps*this.radsPerStep;
  this.stepTracker += Math.abs(direction);
}

Stepper.prototype.loc = 0;
Stepper.prototype.computeAngle = function() {

};

Stepper.prototype.coilA = function(percent) {
  if (typeof percent !== 'undefined') {
    this.wires[0] = 0;
    this.wires[1] = 0;

    if (percent > 0) {
      this.wires[0] = percent;
    } else if (percent < 0) {
      this.wires[1] = -percent;
    }
  }

  return this.wires[0] - this.wires[1];
};

Stepper.prototype.coilB = function(percent) {
  if (typeof percent !== 'undefined') {
    this.wires[2] = 0;
    this.wires[3] = 0;
    if (percent > 0) {
      this.wires[2] = percent;
    } else if (percent < 0) {
      this.wires[3] = -percent;
    }
  }

  return this.wires[2] - this.wires[3];
};


Stepper.prototype.tick = function(elapsedMicroseconds) {
  this.timer+=delta;
  if (this.timer >= 10000000) {
    this.timer = this.timer%10000000;
    this.rpm = (this.stepTracker/this.stepsPerRotation)*60;
    this.stepTracker = 0; 
  }
};

Stepper.prototype.render = function(ctx, delta) {
  var hx = this.frame.w/2, hy = this.frame.w/2

  var colors = ['#FF5059', '#FF5059', '#5369FF', '#5369FF'];
  ctx.save();
    var wireWidth = 2;
    ctx.translate(-this.frame.w/2, -wireWidth/2-8.5);

    for (var i=0; i<4; i++) {

      ctx.translate(0, wireWidth+2);
      
      if (this.wires[i] !== 0) {
        ctx.strokeStyle = colors[i < 2 ? 0 : 2];
      } else {
        ctx.strokeStyle = 'black';
      }
      ctx.strokeRect(-1, -wireWidth/2, -15, wireWidth/2);
    }
  ctx.restore();


  ctx.save()

    for (var coil = 0; coil < 4; coil++) {

      ctx.rotate(Math.PI);
      if (coil && coil%2 === 0) {
        ctx.rotate(Math.PI/2);
      }

      ctx.save();
        ctx.translate(0, hx*.4);
        ctx.beginPath();
        ctx.lineWidth = .5
        ctx.moveTo(-hx/4, 0);

        for (var w = 0; w<hx/2; w+=1) {
          ctx.lineTo(-hx/4, w);
          ctx.lineTo(hx/4, w);
        }

        var active = (coil > 1) ? this.coilB() : this.coilA();
        if (active) {
          ctx.strokeStyle = colors[coil < 2 ? 1 : 2];
        } else {
          ctx.strokeStyle = 'black';
        }
        
        ctx.stroke();
      ctx.restore();
    }

  ctx.restore();

  ctx.save();
    ctx.rotate(this.currentAngle);
    ctx.fillStyle = "#000";
    ctx.strokeStyle = "#000";
    ctx.beginPath();

    for (var i = 0; i<this.stepsPerRotation/2; i++) {
      ctx.rotate(this.radsPerStep*2);
      ctx.fillRect(-1, 0, 1, (i%2) ? hx*.3 : hx*.34)
    }
    ctx.stroke();
    ctx.fill();
  ctx.restore();

  ctx.lineWidth = 1;


  ctx.fillStyle = "#909090";
  ctx.strokeStyle = 'black';
  ctx.beginPath();
    ctx.arc(0, 0, hx*.75, -Math.PI*2, true);
    ctx.moveTo(-hx, -hy);
    ctx.lineTo(-hx, hy);
    ctx.lineTo(hx, hy);
    ctx.lineTo(hx, -hy);
  ctx.closePath();
  ctx.stroke();
  ctx.fill()


  ctx.fillStyle = "#909090";
  ctx.strokeStyle = 'black';
  ctx.beginPath();
    ctx.arc(0, 0, hx/5, -Math.PI*2, true);
  ctx.closePath();
  ctx.stroke();
  ctx.fill()  

  ctx.strokeStyle = "black";

  for (var i = 0; i<4; i++) {
    ctx.save();

      ctx.rotate((Math.PI/2) * i);
      ctx.translate(this.frame.holes/2, this.frame.holes/2);

      ctx.beginPath();
      ctx.arc(0, 0, this.frame.holeD/2, Math.PI*2, false);
      ctx.stroke();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  ctx.strokeStyle = "#444";
  ctx.fillStyle = "#CCC"
  ctx.beginPath();
    ctx.arc(0, 0, this.frame.shaftD/2, Math.PI*2, false);
    ctx.stroke();
    ctx.fill();

  ctx.strokeStyle = 'black';
  ctx.save();
    ctx.rotate(this.currentAngle);
    ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, this.frame.shaftD/2.5);
      ctx.stroke();
  ctx.restore();
};

module.exports = Stepper;
