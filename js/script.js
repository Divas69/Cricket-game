const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const ballStyleSelect = document.getElementById('ballStyle');
const message = document.getElementById('message');
const runsDisplay = document.getElementById('runs');
const ballsDisplay = document.getElementById('balls');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let totalRuns = 0;
let totalBalls = 0;

let ball = {
  x: canvas.width / 2,
  y: canvas.height - 100,
  radius: 12,
  speedY: -8,
  moving: false,
  path: [],
  style: 'fast'
};

let wickets = [
  { x: canvas.width/2 - 20, y: 150, width: 6, height: 50, fallen: false },
  { x: canvas.width/2, y: 150, width: 6, height: 50, fallen: false },
  { x: canvas.width/2 + 20, y: 150, width: 6, height: 50, fallen: false }
];

let bat = {
  x: canvas.width/2 + 30,
  y: 210,
  width: 10,
  height: 70,
  angle: 0,
  swinging: false
};

// Fielders setup
const fielderCount = 10;
const fielders = [];
const centerX = canvas.width / 2;
const centerY = canvas.height / 2 + 100;
const circleRadius = 300;

for (let i = 0; i < fielderCount; i++) {
  const angle = (i / fielderCount) * (2 * Math.PI);
  const x = centerX + circleRadius * Math.cos(angle);
  const y = centerY + circleRadius * Math.sin(angle);
  fielders.push({ x, y });
}

// Wicketkeeper
const wicketkeeper = {
  x: centerX,
  y: centerY - 160,
  radius: 18
};

function drawGround() {
  ctx.fillStyle = '#006400';
  ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);
  ctx.fillStyle = '#DEB887';
  ctx.fillRect(canvas.width / 2 - 60, canvas.height / 2 - 200, 120, 400);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(canvas.width/2, canvas.height/2 - 200);
  ctx.lineTo(canvas.width/2, canvas.height/2 + 200);
  ctx.stroke();
}

function drawWickets() {
  ctx.fillStyle = "saddlebrown";
  wickets.forEach(w => {
    if (!w.fallen) {
      ctx.fillRect(w.x, w.y, w.width, w.height);
    } else {
      ctx.save();
      ctx.translate(w.x, w.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(0, 0, w.width, w.height);
      ctx.restore();
    }
  });
}

function drawBat() {
  ctx.save();
  ctx.translate(bat.x, bat.y);
  ctx.rotate(bat.angle);
  ctx.fillStyle = "#2F4F4F"; 
  ctx.fillRect(-2, 0, 5, 20);
  ctx.fillStyle = "#ffe4b5";
  ctx.fillRect(-8, 20, 16, 50);
  ctx.restore();
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.shadowColor = "black";
  ctx.shadowBlur = 15;
  ctx.fill();
  ctx.closePath();
}

function drawTrajectory() {
  if (ball.path.length > 1) {
    ctx.save();
    ctx.strokeStyle = "#8A2BE2";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 5]);
    ctx.beginPath();
    ctx.moveTo(ball.path[0].x, ball.path[0].y);
    for (let i = 1; i < ball.path.length; i++) {
      ctx.lineTo(ball.path[i].x, ball.path[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }
}

// Draw fielders + wicketkeeper
function drawFielders() {
  ctx.fillStyle = "blue";
  fielders.forEach(fielder => {
    ctx.beginPath();
    ctx.arc(fielder.x, fielder.y, 12, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(wicketkeeper.x, wicketkeeper.y, wicketkeeper.radius, 0, Math.PI * 2);
  ctx.fill();
}

function updateBall() {
  if (ball.moving) {
    ball.y += ball.speedY;
    ball.path.push({ x: ball.x, y: ball.y });

    if (ball.y <= bat.y + bat.height && !bat.swinging) {
      swingBat();
      generateRun();
      ball.moving = false;
    }
  }
}

function swingBat() {
  bat.swinging = true;
  let swingDirection = 1;
  let swingSpeed = 0.15;
  let swingFrames = 0;

  function animateSwing() {
    if (swingFrames < 10) {
      bat.angle += swingSpeed * swingDirection;
      swingFrames++;
      requestAnimationFrame(animateSwing);
    } else {
      bat.angle = 0;
      bat.swinging = false;
    }
  }
  animateSwing();
}

function generateRun() {
  let runs = [0, 1, 2, 4, 6];
  let run = runs[Math.floor(Math.random() * runs.length)];
  totalBalls++;

  if (run === 0) {
    wickets.forEach(w => w.fallen = true);
    displayMessage('OUT!');
    setTimeout(() => {
      if (confirm("You are OUT! Start a new game?")) {
        resetGame();
      }
    }, 1500);
  } else {
    totalRuns += run;
    displayMessage(run + " RUNS");
  }

  updateScoreboard();
}

function updateScoreboard() {
  runsDisplay.innerText = totalRuns;
  ballsDisplay.innerText = totalBalls;
}

function displayMessage(text) {
  message.innerText = text;
  message.style.animation = "bounceText 1s forwards";
  setTimeout(() => {
    message.style.animation = "none";
    message.style.transform = "translate(-50%, -50%) scale(0)";
  }, 2000);
}

function applyBallStyle() {
  const style = ballStyleSelect.value;
  ball.style = style;
  ball.path = [];
  ball.y = canvas.height - 100;
  ball.x = canvas.width/2;
  wickets.forEach(w => w.fallen = false);

  if (style === 'fast') {
    ball.speedY = -14;
  } else if (style === 'slow') {
    ball.speedY = -6;
  } else if (style === 'spin') {
    ball.speedY = -8;
  } else if (style === 'yorker') {
    ball.speedY = -16;
  } else if (style === 'googly') {
    ball.speedY = -10;
  }
}

function hitBall() {
  if (!ball.moving) {
    applyBallStyle();
    ball.moving = true;
  }
}

function resetGame() {
  totalRuns = 0;
  totalBalls = 0;
  ball.x = canvas.width/2;
  ball.y = canvas.height-100;
  ball.path = [];
  wickets.forEach(w => w.fallen = false);
  updateScoreboard();
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGround();
  drawTrajectory();
  drawWickets();
  drawFielders();
  drawBat();
  drawBall();
  updateBall();
  requestAnimationFrame(gameLoop);
}

gameLoop();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
