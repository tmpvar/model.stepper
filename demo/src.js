  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');

  canvas.width = 600;
  canvas.height = 600;

  var Stepper = require('../stepper');
  var stepper = window.stepper = new Stepper(Stepper.NEMA34, 200, 160, 1.8);
  var cycle = 0;
  //var a = 1, b = 1;
  setInterval(function() {
    ctx.save();
      ctx.fillStyle = "#445";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.scale(5, 5);

      stepper.coilA(Math.sin(cycle));
      stepper.coilB(Math.cos(cycle));

//      a = (cycle%2) ? 1 : -1
//      b = (cycle%2) ? 1 : -1
      cycle+=.1;
      console.log(cycle);
      stepper.computeAngle();
      stepper.render(ctx);
    ctx.restore();
  }, 500);