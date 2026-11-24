/* 霓虹贪吃蛇 Neon Snake · BOGAME 2026 */
(function () {
  "use strict";
  const A = window.Arcade;
  const W = 480, H = 480, C = 20, COLS = W / C, ROWS = H / C;
  const cv = document.getElementById("cv");
  const ctx = A.setupCanvas(cv, W, H);
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const ov = document.getElementById("ov");
  const ovBtn = document.getElementById("ovBtn");
  const restart = document.getElementById("restart");
  const muteBtn = document.getElementById("muteBtn");
  const KEY = "snake";

  let snake, dir, nextDir, food, score, speed, timer, running, dead, best;
  best = A.hi(KEY); bestEl.textContent = best;

  function rrect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function placeFood() {
    let p;
    do { p = { x: A.rndInt(0, COLS - 1), y: A.rndInt(0, ROWS - 1) }; }
    while (snake.some(function (s) { return s.x === p.x && s.y === p.y; }));
    food = p;
  }

  function reset() {
    snake = [{ x: 10, y: 12 }, { x: 9, y: 12 }, { x: 8, y: 12 }];
    dir = "right"; nextDir = "right";
    score = 0; speed = 125; dead = false;
    scoreEl.textContent = score;
    placeFood(); draw();
  }

  function draw() {
    ctx.fillStyle = "#050a18";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(38,51,95,.42)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= COLS; i++) { ctx.beginPath(); ctx.moveTo(i * C + .5, 0); ctx.lineTo(i * C + .5, H); ctx.stroke(); }
    for (let j = 0; j <= ROWS; j++) { ctx.beginPath(); ctx.moveTo(0, j * C + .5); ctx.lineTo(W, j * C + .5); ctx.stroke(); }

    ctx.save();
    ctx.shadowBlur = 20; ctx.shadowColor = "#ff6b9d"; ctx.fillStyle = "#ff6b9d";
    ctx.beginPath(); ctx.arc(food.x * C + C / 2, food.y * C + C / 2, 6.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    snake.forEach(function (s, i) {
      const t = i / Math.max(snake.length - 1, 1);
      const r = Math.round(54 + t * 106), g = Math.round(226 - t * 119), b = Math.round(244 + t * 11);
      ctx.save();
      ctx.shadowBlur = i === 0 ? 16 : 6;
      ctx.shadowColor = "rgba(54,226,244,.6)";
      ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
      rrect(s.x * C + 2, s.y * C + 2, C - 4, C - 4, 5); ctx.fill();
      ctx.restore();
      if (i === 0) {
        ctx.fillStyle = "#06121f";
        ctx.fillRect(s.x * C + 6, s.y * C + 7, 3, 3);
        ctx.fillRect(s.x * C + 12, s.y * C + 7, 3, 3);
      }
    });
  }

  function gameOver() {
    clearInterval(timer); running = false; dead = true;
    A.sfx("over");
    const isNew = A.setHi(KEY, score);
    best = A.hi(KEY); bestEl.textContent = best;
    A.showOverlay(ov, {
      title: "游戏结束",
      text: isNew ? "新纪录！再来一局挑战更高分吧。" : "别灰心，再试一次就好。",
      big: "得分 " + score, button: "再来一局"
    });
  }

  function step() {
    dir = nextDir;
    const D = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }[dir];
    const head = { x: snake[0].x + D.x, y: snake[0].y + D.y };
    const hitWall = head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS;
    const hitSelf = snake.some(function (s, i) { return i < snake.length - 1 && s.x === head.x && s.y === head.y; });
    if (hitWall || hitSelf) { gameOver(); return; }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10; scoreEl.textContent = score; A.sfx("score"); placeFood();
      if (score % 40 === 0 && speed > 65) {
        speed -= 8; clearInterval(timer); timer = setInterval(step, speed);
      }
    } else {
      snake.pop();
    }
    draw();
  }

  function start() {
    clearInterval(timer);
    A.showOverlay(ov, null);
    A.sfx("start");
    running = true; dead = false;
    timer = setInterval(step, speed);
  }

  function setDir(d) {
    const opposite = { up: "down", down: "up", left: "right", right: "left" };
    if (opposite[dir] !== d) nextDir = d;
  }
  A.directions(setDir);
  document.querySelectorAll("[data-dir]").forEach(function (b) {
    b.addEventListener("click", function (e) { e.preventDefault(); setDir(b.dataset.dir); });
  });
  let sx = 0, sy = 0;
  cv.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  cv.addEventListener("touchend", function (e) {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
    setDir(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
  }, { passive: true });

  restart.addEventListener("click", function () { A.sfx("click"); reset(); start(); });
  ovBtn.addEventListener("click", function () { A.sfx("click"); reset(); start(); });
  muteBtn.addEventListener("click", function () { muteBtn.textContent = A.toggleMute() ? "🔇" : "🔊"; });

  reset();
  A.showOverlay(ov, { title: "霓虹贪吃蛇", text: "用方向键或 WASD 控制方向，收集光点让身体变长。撞到墙壁或自己就结束。", big: "", button: "开始游戏" });
})();
