// Cameron Samuels

window.addEventListener("DOMContentLoaded", () => {


  // Canvas & animation
  var animate = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) { window.setTimeout(callback, 1000/60) };

  var canvas = document.createElement("canvas");
  var width = 1024;
  var height = 768;
  canvas.width = width;
  canvas.height = height;
  var context = canvas.getContext("2d");

  var pause = false;


  // Scoring
  var startTime = new Date();
  function time() {
    var elapsed = new Date() - startTime;
    var ms = elapsed % 1000;
    var seconds = (elapsed - ms) / 1000;
    var minutes = 0;
    if (seconds >= 60) {
      var x = seconds % 60;
      minutes = (seconds - x) / 60;
      seconds = x;
    }
    if (seconds < 10) seconds = "0" + seconds;
    return minutes + ":" + seconds + ":" + ms;
  }
  

  // Bricks
  var bricks = [];

  function Brick(x, y, type) {
    this.x = x;
    this.y = y;
    this.width = 150;
    this.height = 40;
    this.type = type;
    if (this.type === 0 || this.type === 2 || this.type === 3)
      this.hits = -1;
    else if (this.type === 1)
      this.hits = -2;
    else if (this.type === 4)
      this.hits = -3;
  }

  Brick.prototype.render = function() {
    if (this.hits >= 0) return;
    if (this.type === 0)
      context.fillStyle = "#555";
    else if (this.type === 1) {
      if (this.hits === -2)
        context.fillStyle = "#222";
      else if (this.hits === -1)
        context.fillStyle = "#555";
    }
    else if (this.type === 2) {
      context.fillStyle = "#f00";
    }
    else if (this.type === 3) {
      context.fillStyle = "#6a6";
    }
    else if (this.type === 4) {
      if (this.hits === -3)
        context.fillStyle = "#a6a";
      else if (this.hits === -2)
        context.fillStyle = "#222";
      else if (this.hits === -1)
        context.fillStyle = "#555";
    }
    context.fillRect(this.x, this.y, this.width, this.height);
  }

  var level = window.location.hash.substring(1) || 1;
  var levels = [
    [4, 3, 2, 1, 0],
    [4, 3, 2, 1, 1],
    [4, 2, 2, 1, 0],
    [4, 4, 2, 1, 0],
    [4, 4, 2, 1, 1]
  ];

  function numBricks() {
    var num = 0;
    for (let i = 0; i < bricks.length; i++)
      for (let j = 0; j < bricks[i].length; j++)
        if (bricks[i][j].hits < 0)
          num++;
    return num;
  }

  function createBricks() {
    for (let i = 0; i < 5; i++) {
      bricks.push([]);
      for (let j = 0; j < 6; j++)
        bricks[i].push(new Brick((j * 160)+37, (i * 50)+37, levels[level - 1][i]));
    }
  }

  function levelUp() {
    level++;
    ball = new Ball(width / 2, height / 2);
    bricks = [];
    createBricks();
  }

  window.addEventListener("hashchange", function() {
    level = window.location.hash.substring(1) || 1;
    bricks = [];
    createBricks();
  });

  Brick.prototype.checkHit = function(b) {
    if (this.hits < 0 && b.x >= this.x && b.x <= (this.x + this.width) && b.y >= this.y && b.y <= (this.y + this.height)) {
      this.hits += 1;
      if (this.type === 2) {
        // increase random brick
        var i = Math.floor(Math.random() * bricks.length);
        var j = Math.floor(Math.random() * bricks[i].length);
        bricks[i][j].hits -= 1;
      }
      else if (this.type === 3) {
        // decrease random brick
        var i = Math.floor(Math.random() * bricks.length);
        var j = Math.floor(Math.random() * bricks[i].length);
        bricks[i][j].hits += 1;
      }
      b.y_speed = -b.y_speed;
      // b.x_speed = -b.x_speed;
      if (numBricks() === 0)
        levelUp();
    }
  }


  // Player paddle
  function Paddle(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.x_speed = 0;
    this.y_speed = 0;
  }

  Paddle.prototype.render = function() {
    context.fillStyle = "#555";
    context.fillRect(this.x, this.y, this.width, this.height);
  };

  Paddle.prototype.move = function(x, y) {
    this.x += x;
    this.y += y;
    this.x_speed = x;
    this.y_speed = y;
    if (this.x < 0) {
      this.x = 0;
      this.x_speed = 0;
    }
    else if (this.x + this.width > width) {
      this.x = width - this.width;
      this.x_speed = 0;
    }
  }

  Paddle.prototype.update = function() {
    for (var key in keysDown) {
      if (key === "ArrowLeft")
        this.move(-4, 0);
      else if (key === "ArrowRight")
        this.move(4, 0);
      else
        this.move(0, 0);
    }
  };


  // Ball
  function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.x_speed = 0;
    this.y_speed = 3;
    this.radius = 5;
  }

  Ball.prototype.render = function() {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
    context.fillStyle = "#555";
    context.fill();
  };

  Ball.prototype.update = function(paddle1) {
    this.x += this.x_speed;
    this.y += this.y_speed;
    var top_x = this.x - 5;
    var top_y = this.y - 5;
    var bottom_x = this.x + 5;
    var bottom_y = this.y + 5;

    // left wall
    if (this.x - 5 < 0) {
      this.x = 5;
      this.x_speed = -this.x_speed;
    }

    // right wall
    else if (this.x + 5 > width) {
      this.x = width - 5;
      this.x_speed = -this.x_speed;
    }

    // bottom wall (game over)
    if (this.y > paddle1.y + paddle1.height) {
      setTimeout(function() {
        window.location = "index.html#gameover";
      }, 500);
    }

    // top wall
    if (this.y - 5 < 0) {
      this.y = 5;
      this.y_speed = -this.y_speed;
    }

    // hit paddle
    if (top_y > height / 2) {
      if (top_y < (paddle1.y + paddle1.height) && bottom_y > paddle1.y
        && top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x) {
        this.y_speed = -3;
        this.x_speed = paddle1.x_speed / 2;
        this.y += this.y_speed;
      }
    }

  };


  // Game flow
  var update = function() {
    player.update();
    ball.update(player);
    for (let i = 0; i < bricks.length; i++)
      for (let j = 0; j < bricks[i].length; j++)
        bricks[i][j].checkHit(ball);
  };

  var render = function() {

    context.fillStyle = "#eee";
    context.fillRect(0, 0, width, height);

    document.querySelector("#time").textContent = time();

    player.render();
    ball.render();

    for (let i = 0; i < bricks.length; i++)
      for (let j = 0; j < bricks[i].length; j++)
        bricks[i][j].render();

  };

  var flow = function() {
    update();
    render();
    if (!pause)
      animate(flow);
  };

  document.querySelector("#pause").addEventListener("click", function() {
    pause = !pause;
    if (!pause)
      animate(flow);
  });


  // Player events
  var keysDown = {};
  window.addEventListener("keydown", function(e) {
    keysDown[e.key] = true;
  });
  window.addEventListener("keyup", function(e) {
    delete keysDown[e.key];
  });
  document.addEventListener("mousedown", function(e) {
    e.preventDefault();
  });


  // Initialization
  var player = new Paddle(width / 2, height - 40, 80, 10);
  var ball = new Ball(width / 2, height / 2);
  createBricks();
  document.body.appendChild(canvas);
  animate(flow);


});
