/* 弹球破砖 Brick Breaker · BOGAME 2026 */
(function () {
  "use strict";
  const A = window.Arcade;
  const W = 480, H = 520;
  const cv = document.getElementById("cv");
  const ctx = A.setupCanvas(cv, W, H);
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const livesEl = document.getElementById("lives");
  const ov = document.getElementById("ov");
  const ovBtn = document.getElementById("ovBtn");
  const restart = document.getElementById("restart");
  const muteBtn = document.getElementById("muteBtn");
  const KEY = "breaker";

  const COLS = 8, ROWS = 5, BW = 52, BH = 20, GAP = 6, OX = 24, OY = 54;
  const PW = 92, PH = 12;
  let paddle, ball, bricks, score, lives, best, raf, running, keys;

  best = A.hi(KEY); bestEl.textContent = best;

  function buildBricks() {
    bricks = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        bricks.push({ x: OX + c * (BW + GAP), y: OY + r * (BH + GAP), w: BW, h: BH, alive: true, row: r });
      }
    }
  }

  function resetBall() {
    ball = { x: W / 2, y: H - 52, vx: A.rnd(-140, 140) || 120, vy: -210, r: 7, stuck: true };
  }

  function reset() {
    paddle = { x: W / 2 - PW / 2, y: H - 30, w: PW, h: PH };
    score = 0; lives = 3;
    scoreEl.textContent = 0;
    if (livesEl) livesEl.textContent = lives;
    keys = { left: false, right: false };
    buildBricks(); resetBall(); draw();
  }

  const COLORS = ["#36e2f4", "#66c9f0", "#8ea9ff", "#a887ff", "#ff7fc4"];

  function draw() {
    ctx.fillStyle = "#050a18"; ctx.fillRect(0, 0, W, H);
    bricks.forEach(function (b) {
      if (!b.alive) return;
      ctx.save();
      ctx.shadowBlur = 9; ctx.shadowColor = COLORS[b.row % COLORS.length];
      ctx.fillStyle = COLORS[b.row % COLORS.length];
      ctx.beginPath();
      if (ctx.roundRect) { ctx.roundRect(b.x, b.y, b.w, b.h, 5); } else { ctx.rect(b.x, b.y, b.w, b.h); }
      ctx.fill(); ctx.restore();
    });
    ctx.save();
    ctx.shadowBlur = 16; ctx.shadowColor = "#36e2f4";
    ctx.fillStyle = "#36e2f4";
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 6); } else { ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h); }
    ctx.fill(); ctx.restore();
    ctx.save();
    ctx.shadowBlur = 18; ctx.shadowColor = "#ffd166"; ctx.fillStyle = "#ffd166";
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    if (ball.stuck) {
      ctx.fillStyle = "rgba(234,241,255,.75)"; ctx.font = "13px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("点击或按空格发球", W / 2, H - 72);
    }
  }

  function finish(won) {
    cancelAnimationFrame(raf); running = false;
    A.sfx(won ? "win" : "over");
    const isNew = A.setHi(KEY, score);
    best = A.hi(KEY); bestEl.textContent = best;
    A.showOverlay(ov, {
      title: won ? "砖阵清空！" : "游戏结束",
      text: won ? "漂亮，整片砖阵都被你击碎了。" : (isNew ? "新纪录！再来一局吧。" : "再试一次，注意接球角度。"),
      big: "得分 " + score, button: "再来一局"
    });
  }

  function launch() {
    if (ball.stuck) { ball.stuck = false; A.sfx("start"); }
  }

  function loop(ts) {
    if (!running) return;
    if (!loop.last) loop.last = ts;
    const dt = Math.min((ts - loop.last) / 1000, .033);
    loop.last = ts;

    if (keys.left) paddle.x -= 330 * dt;
    if (keys.right) paddle.x += 330 * dt;
    paddle.x = A.clamp(paddle.x, 0, W - paddle.w);

    if (ball.stuck) {
      ball.x = paddle.x + paddle.w / 2;
      ball.y = paddle.y - ball.r - 2;
    } else {
      ball.x += ball.vx * dt; ball.y += ball.vy * dt;
      if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx *= -1; A.sfx("hit"); }
      if (ball.x + ball.r > W) { ball.x = W - ball.r; ball.vx *= -1; A.sfx("hit"); }
      if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy *= -1; A.sfx("hit"); }

      if (ball.vy > 0 && ball.y + ball.r >= paddle.y && ball.y - ball.r <= paddle.y + paddle.h &&
          ball.x >= paddle.x - 4 && ball.x <= paddle.x + paddle.w + 4) {
        ball.y = paddle.y - ball.r;
        const off = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
        const speed = Math.min(Math.hypot(ball.vx, ball.vy) + 6, 380);
        const ang = off * 1.05;
        ball.vx = Math.sin(ang) * speed;
        ball.vy = -Math.abs(Math.cos(ang) * speed);
        A.sfx("hit");
      }

      for (let i = 0; i < bricks.length; i++) {
        const b = bricks[i];
        if (!b.alive) continue;
        if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w &&
            ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
          b.alive = false;
          ball.vy *= -1;
          score += 10; scoreEl.textContent = score; A.sfx("score");
          break;
        }
      }

      if (ball.y - ball.r > H) {
        lives -= 1;
        if (livesEl) livesEl.textContent = lives;
        A.sfx("over");
        if (lives <= 0) { finish(false); return; }
        resetBall();
      }
      if (bricks.every(function (b) { return !b.alive; })) { draw(); finish(true); return; }
    }

    draw();
    raf = requestAnimationFrame(loop);
  }

  function start() {
    cancelAnimationFrame(raf); loop.last = 0;
    A.showOverlay(ov, null);
    A.sfx("start");
    running = true;
    raf = requestAnimationFrame(loop);
  }

  const KM = { ArrowLeft: "left", ArrowRight: "right", a: "left", d: "right", A: "left", D: "right" };
  window.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Spacebar") { e.preventDefault(); launch(); return; }
    const k = KM[e.key]; if (k) { e.preventDefault(); if (keys) keys[k] = true; }
  });
  window.addEventListener("keyup", function (e) { const k = KM[e.key]; if (k && keys) keys[k] = false; });

  function pointerX(e) {
    const r = cv.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return (clientX - r.left) * (W / r.width);
  }
  function moveTo(e) { if (running) { paddle.x = A.clamp(pointerX(e) - paddle.w / 2, 0, W - paddle.w); launch(); } }
  cv.addEventListener("mousemove", moveTo);
  cv.addEventListener("mousedown", launch);
  cv.addEventListener("touchstart", function (e) { moveTo(e); }, { passive: true });
  cv.addEventListener("touchmove", function (e) { e.preventDefault(); moveTo(e); }, { passive: false });

  restart.addEventListener("click", function () { A.sfx("click"); reset(); start(); });
  ovBtn.addEventListener("click", function () { A.sfx("click"); reset(); start(); });
  muteBtn.addEventListener("click", function () { muteBtn.textContent = A.toggleMute() ? "🔇" : "🔊"; });

  reset();
  A.showOverlay(ov, { title: "弹球破砖", text: "移动挡板反弹光球，击碎全部砖块。方向键 / 鼠标 / 手指控制，点击或按空格发球，共 3 条命。", big: "", button: "开始游戏" });
})();
