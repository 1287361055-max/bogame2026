/* 极速反应 Reflex Rush · BOGAME 2026 */
(function () {
  "use strict";
  const A = window.Arcade;
  const W = 480, H = 420;
  const cv = document.getElementById("cv");
  const ctx = A.setupCanvas(cv, W, H);
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const extraEl = document.getElementById("extra");
  const meter = document.getElementById("meterFill");
  const ov = document.getElementById("ov");
  const ovBtn = document.getElementById("ovBtn");
  const restart = document.getElementById("restart");
  const muteBtn = document.getElementById("muteBtn");
  const KEY = "reflex";

  const DURATION = 30000, TARGET_LIFE = 1300;
  let target, score, combo, maxCombo, hits, best, elapsed, raf, ticker, targetAge, running, pulse;

  best = A.hi(KEY); bestEl.textContent = best;

  function newTarget() {
    const r = A.rnd(20, 30);
    target = { x: A.rnd(r + 12, W - r - 12), y: A.rnd(r + 12, H - r - 12), r: r };
    targetAge = 0; pulse = 0;
  }

  function sync() {
    scoreEl.textContent = score;
    if (extraEl) extraEl.textContent = "连击 ×" + combo + " · 命中 " + hits;
  }

  function reset() {
    cancelAnimationFrame(raf); clearInterval(ticker);
    score = 0; combo = 0; maxCombo = 0; hits = 0; elapsed = 0; running = false;
    if (meter) meter.style.width = "100%";
    newTarget(); sync(); draw();
  }

  function draw() {
    ctx.fillStyle = "#050a18"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(38,51,95,.35)"; ctx.lineWidth = 1;
    for (let i = 0; i < W; i += 40) { ctx.beginPath(); ctx.moveTo(i + .5, 0); ctx.lineTo(i + .5, H); ctx.stroke(); }
    for (let j = 0; j < H; j += 40) { ctx.beginPath(); ctx.moveTo(0, j + .5); ctx.lineTo(W, j + .5); ctx.stroke(); }

    if (!target) return;
    const grow = Math.sin(pulse / 180) * 3;
    ctx.save();
    ctx.shadowBlur = 26; ctx.shadowColor = "#ff6b9d";
    const g = ctx.createRadialGradient(target.x, target.y, 2, target.x, target.y, target.r + grow);
    g.addColorStop(0, "#ffe3ef"); g.addColorStop(.45, "#ff6b9d"); g.addColorStop(1, "#a06bff");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(target.x, target.y, target.r + grow, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(target.x, target.y, target.r + 8, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "rgba(234,241,255,.85)";
    ctx.font = "bold 15px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("点我！", target.x, target.y + 5);
  }

  function finish() {
    cancelAnimationFrame(raf); clearInterval(ticker); running = false;
    A.sfx("over");
    const isNew = A.setHi(KEY, score);
    best = A.hi(KEY); bestEl.textContent = best;
    A.showOverlay(ov, {
      title: "时间到！",
      text: "命中 " + hits + " 次，最高连击 ×" + maxCombo + "。" + (isNew ? " 新纪录！" : " 再挑战一次反应极限。"),
      big: "得分 " + score, button: "再来一局"
    });
  }

  function loop(ts) {
    if (!running) return;
    if (!loop.last) loop.last = ts;
    const dt = Math.min((ts - loop.last) / 1000, .05);
    loop.last = ts;
    elapsed += dt * 1000; pulse += dt * 1000; targetAge += dt * 1000;
    if (targetAge >= TARGET_LIFE) { combo = 0; sync(); newTarget(); }
    if (meter) meter.style.width = Math.max(0, 100 - elapsed / DURATION * 100) + "%";
    if (elapsed >= DURATION) { finish(); return; }
    draw();
    raf = requestAnimationFrame(loop);
  }

  function start() {
    cancelAnimationFrame(raf); clearInterval(ticker); loop.last = 0;
    A.showOverlay(ov, null);
    A.sfx("start");
    running = true;
    raf = requestAnimationFrame(loop);
  }

  function tap(e) {
    if (!running || !target) return;
    const r = cv.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const x = (cx - r.left) * (W / r.width), y = (cy - r.top) * (H / r.height);
    if (Math.hypot(x - target.x, y - target.y) <= target.r + 10) {
      hits += 1; combo += 1; maxCombo = Math.max(maxCombo, combo);
      score += 10 + combo * 2;
      A.sfx("score"); sync(); newTarget();
    } else {
      combo = 0; A.sfx("hit"); sync();
    }
  }
  cv.addEventListener("mousedown", tap);
  cv.addEventListener("touchstart", function (e) { e.preventDefault(); tap(e); }, { passive: false });

  restart.addEventListener("click", function () { A.sfx("click"); reset(); start(); });
  ovBtn.addEventListener("click", function () { A.sfx("click"); reset(); start(); });
  muteBtn.addEventListener("click", function () { muteBtn.textContent = A.toggleMute() ? "🔇" : "🔊"; });

  reset();
  A.showOverlay(ov, { title: "极速反应", text: "30 秒内尽可能点亮出现的目标，连击越高得分越猛；点空或超时会中断连击。", big: "", button: "开始游戏" });
})();
