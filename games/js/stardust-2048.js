/* 星尘合成 2048 Stardust 2048 · BOGAME 2026 */
(function () {
  "use strict";
  const A = window.Arcade;
  const grid = document.getElementById("grid");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const ov = document.getElementById("ov");
  const ovBtn = document.getElementById("ovBtn");
  const restart = document.getElementById("restart");
  const undoBtn = document.getElementById("undoBtn");
  const muteBtn = document.getElementById("muteBtn");
  const KEY = "g2048";

  let board, score, best, prev, won, running;

  best = A.hi(KEY); bestEl.textContent = best;

  function empty() { return [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]; }
  function clone(b) { return b.map(function (r) { return r.slice(); }); }

  function addRandom() {
    const free = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (!board[r][c]) free.push([r, c]);
    if (!free.length) return;
    const p = free[Math.floor(Math.random() * free.length)];
    board[p[0]][p[1]] = Math.random() < .9 ? 2 : 4;
  }

  function render() {
    grid.innerHTML = "";
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const v = board[r][c];
        const d = document.createElement("div");
        d.className = "cell" + (v ? "" : " empty");
        if (v) { d.dataset.v = String(v); d.textContent = String(v); }
        grid.appendChild(d);
      }
    }
    scoreEl.textContent = score;
  }

  function reset() {
    board = empty(); score = 0; prev = null; won = false; running = true;
    addRandom(); addRandom(); render();
    A.showOverlay(ov, null);
    if (undoBtn) undoBtn.disabled = false;
  }

  function slide(line) {
    const vals = line.filter(function (v) { return v !== 0; });
    const out = [];
    let gain = 0;
    for (let i = 0; i < vals.length; i++) {
      if (vals[i] === vals[i + 1]) {
        const merged = vals[i] * 2;
        out.push(merged); gain += merged; i++;
      } else {
        out.push(vals[i]);
      }
    }
    while (out.length < 4) out.push(0);
    return { line: out, gain: gain, moved: line.join(",") !== out.join(",") };
  }

  function move(dir) {
    if (!running) return;
    const snapshot = { board: clone(board), score: score };
    let moved = false, gain = 0;
    const idx = [0, 1, 2, 3];

    for (let i = 0; i < 4; i++) {
      let line;
      if (dir === "left") line = board[i].slice();
      else if (dir === "right") line = board[i].slice().reverse();
      else if (dir === "up") line = idx.map(function (r) { return board[r][i]; });
      else line = idx.map(function (r) { return board[3 - r][i]; });

      const res = slide(line);
      gain += res.gain;
      if (res.moved) moved = true;

      const back = dir === "right" ? res.line.slice().reverse() : res.line;
      for (let j = 0; j < 4; j++) {
        if (dir === "left" || dir === "right") board[i][j] = back[j];
        else if (dir === "up") board[j][i] = back[j];
        else board[3 - j][i] = back[j];
      }
    }

    if (!moved) return;
    prev = snapshot;
    score += gain;
    A.sfx(gain > 0 ? "score" : "click");
    addRandom();
    if (score > best) { A.setHi(KEY, score); best = A.hi(KEY); bestEl.textContent = best; }
    render();

    if (!won && board.some(function (r) { return r.some(function (v) { return v >= 2048; }); })) {
      won = true;
      A.sfx("win");
      A.showOverlay(ov, { title: "合成 2048 星核！", text: "漂亮的合并，你可以继续冲击更高数值。", big: "得分 " + score, button: "继续挑战" });
      return;
    }
    if (!canMove()) {
      running = false;
      A.sfx("over");
      A.showOverlay(ov, { title: "无处可动", text: "棋盘已满且没有可合并的星尘了。", big: "得分 " + score, button: "再来一局" });
    }
  }

  function canMove() {
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      if (!board[r][c]) return true;
      if (c < 3 && board[r][c] === board[r][c + 1]) return true;
      if (r < 3 && board[r][c] === board[r + 1][c]) return true;
    }
    return false;
  }

  function undo() {
    if (!prev || !running) return;
    board = clone(prev.board); score = prev.score; prev = null;
    A.sfx("click"); render();
  }

  A.directions(move);
  document.querySelectorAll("[data-dir]").forEach(function (b) {
    b.addEventListener("click", function (e) { e.preventDefault(); move(b.dataset.dir); });
  });
  let sx = 0, sy = 0;
  grid.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  grid.addEventListener("touchend", function (e) {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
  }, { passive: true });

  if (undoBtn) undoBtn.addEventListener("click", undo);
  restart.addEventListener("click", function () { A.sfx("click"); reset(); });
  ovBtn.addEventListener("click", function () {
    if (ovBtn.textContent === "继续挑战") { A.showOverlay(ov, null); return; }
    A.sfx("click"); reset();
  });
  muteBtn.addEventListener("click", function () { muteBtn.textContent = A.toggleMute() ? "🔇" : "🔊"; });

  reset();
  A.showOverlay(ov, { title: "星尘合成 2048", text: "用方向键 / WASD 或滑动合并相同数值的星尘，一路合成 2048 星核。支持撤销上一步。", big: "", button: "开始游戏" });
})();
