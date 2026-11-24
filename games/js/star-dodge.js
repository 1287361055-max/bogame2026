/* 星轨闪避 Star Dodge · BOGAME 2026 */
(function () {
  "use strict";
  const A = window.Arcade;
  const W = 480, H = 520;
  const cv = document.getElementById("cv");
  const ctx = A.setupCanvas(cv, W, H);
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const meter = document.getElementById("meterFill");
  const ov = document.getElementById("ov");
  const ovBtn = document.getElementById("ovBtn");
  const restart = document.getElementById("restart");
  const muteBtn = document.getElementById("muteBtn");
  const KEY = "dodge";

  const DURATION = 45000;
  let ship, rocks, stars, score, best, elapsed, last, spawnAcc, raf, running, keys;

  best = A.hi(KEY); bestEl.textContent = best;

  function initStars() {
    stars = [];
    for (let i = 0; i < 70; i++) stars.push({ x: A.rnd(0, W), y: A.rnd(0, H), s: A.rnd(.6, 2), v: A.rnd(18, 70) });
  }

  function reset() {
    ship = { x: W / 2, y: H - 46, w: 34, h: 24 };
    rocks = []; score = 0; elapsed = 0; last = 0; spawnAcc = 0;
    keys = { left: false, right: false, up: false, down: false };
    scoreEl.textContent = 0;
    if (meter) meter.style.width = "100%";
    initStars(); draw();
  }

  function spawnRock() {
    const r = A.rnd(9, 20);
    rocks.push({ x: A.rnd(r, W - r), y: -r, r: r, vy: A.rnd(120, 210) + elapsed / 260 });
  }

  function drawShip() {
    const x = ship.x, y = ship.y;
    ctx.save();
    ctx.shadowBlur = 18; ctx.shadowColor = "#36e2f4";
    ctx.fillStyle = "#36e2f4";
    ctx.beginPath();
    ctx.moveTo(x, y - ship.h / 2);
    ctx.lineTo(x - ship.w / 2, y + ship.h / 2);
    ctx.lineTo(x, y + ship.h / 4);
    ctx.lineTo(x + ship.w / 2, y + ship.h / 2);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#ff6b9d";
    ctx.beginPath(); ctx.arc(x, y + ship.h / 2 + 4, 4 + Math.random() * 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function draw() {
    ctx.fillStyle = "#050a18"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(180,205,255,.75)";
    stars.forEach(function (s) { ctx.fillRect(s.x, s.y, s.s, s.s); });
    ctx.save();
    ctx.shadowBlur = 14;
    rocks.forEach(function (r) {
      ctx.shadowColor = "rgba(160,107,255,.7)";
      const g = ctx.createRadialGradient(r.x - r.r * .3, r.y - r.r * .3, 1, r.x, r.y, r.r);
      g.addColorStop(0, "#c9a7ff"); g.addColorStop(1, "#4a2f8f");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
    drawShip();
  }

  function finish(won) {
    cancelAnimationFrame(raf); running = false;
    A.sfx(won ? "win" : "over");
    const isNew = A.setHi(KEY, score);
    best = A.hi(KEY); bestEl.textContent = best;
    A.showOverlay(ov, {
      title: won ? "航行完成！" : "飞船被击中",
      text: won ? "你成功穿越了整片陨石雨。" : (isNew ? "新纪录！再飞一次吧。" : "再试一次，走位可以更骚一点。"),
      big: "得分 " + score, button: "再来一局"
    });
  }

  function loop(ts) {
    if (!running) return;
    if (!last) last = ts;
    const dt = Math.min((ts - last) / 1000, .05);
    last = ts; elapsed += dt * 1000;

    const sp = 260;
    if (keys.left) ship.x -= sp * dt;
    if (keys.right) ship.x += sp * dt;
    if (keys.up) ship.y -= sp * dt;
    if (keys.down) ship.y += sp * dt;
    ship.x = A.clamp(ship.x, ship.w / 2, W - ship.w / 2);
    ship.y = A.clamp(ship.y, H * .45, H - ship.h / 2);

    stars.forEach(function (s) { s.y += s.v * dt; if (s.y > H) { s.y = -2; s.x = A.rnd(0, W); } });

    spawnAcc += dt;
    const interval = Math.max(.24, .72 - elapsed / 90000);
    if (spawnAcc >= interval) { spawnAcc = 0; spawnRock(); }

    for (let i = rocks.length - 1; i >= 0; i--) {
      const r = rocks[i];
      r.y += r.vy * dt;
      if (r.y - r.r > H) {
        rocks.splice(i, 1); score += 10; scoreEl.textContent = score; A.sfx("score"); continue;
      }
      const dx = Math.abs(r.x - ship.x), dy = Math.abs(r.y - ship.y);
      if (dx < r.r + ship.w / 2 - 6 && dy < r.r + ship.h / 2 - 4) { draw(); finish(false); return; }
    }

    if (meter) meter.style.width = Math.max(0, 100 - elapsed / DURATION * 100) + "%";
    if (elapsed >= DURATION) { draw(); finish(true); return; }

    draw();
    raf = requestAnimationFrame(loop);
  }

  function start() {
    cancelAnimationFrame(raf);
    A.showOverlay(ov, null);
    A.sfx("start");
    running = true; last = 0;
    raf = requestAnimationFrame(loop);
  }

  const KEYMAP = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down", a: "left", d: "right", w: "up", s: "down", A: "left", D: "right", W: "up", S: "down" };
  window.addEventListener("keydown", function (e) { const k = KEYMAP[e.key]; if (k) { e.preventDefault(); if (keys) keys[k] = true; } });
  window.addEventListener("keyup", function (e) { const k = KEYMAP[e.key]; if (k && keys) keys[k] = false; });

  function pointerX(e) {
    const r = cv.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return (clientX - r.left) * (W / r.width);
  }
  function moveTo(e) { if (running) ship.x = A.clamp(pointerX(e), ship.w / 2, W - ship.w / 2); }
  cv.addEventListener("mousemove", moveTo);
  cv.addEventListener("touchstart", function (e) { moveTo(e); }, { passive: true });
  cv.addEventListener("touchmove", function (e) { e.preventDefault(); moveTo(e); }, { passive: false });
  document.querySelectorAll("[data-dir]").forEach(function (b) {
    const d = b.dataset.dir;
    ["mousedown", "touchstart"].forEach(function (ev) { b.addEventListener(ev, function (e) { e.preventDefault(); if (keys) keys[d] = true; }, { passive: false }); });
    ["mouseup", "mouseleave", "touchend"].forEach(function (ev) { b.addEventListener(ev, function () { if (keys) keys[d] = false; }); });
  });

  restart.addEventListener("click", function () { A.sfx("click"); reset(); start(); });
  ovBtn.addEventListener("click", function () { A.sfx("click"); reset(); start(); });
  muteBtn.addEventListener("click", function () { muteBtn.textContent = A.toggleMute() ? "🔇" : "🔊"; });

  reset();
  A.showOverlay(ov, { title: "星轨闪避", text: "用方向键 / WASD、鼠标或手指移动飞船，躲开落下的陨石。坚持 45 秒即可通关。", big: "", button: "开始游戏" });
})();
