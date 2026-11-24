/* 记忆翻牌 Card Match · BOGAME 2026 */
(function () {
  "use strict";
  const A = window.Arcade;
  const grid = document.getElementById("grid");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const extraEl = document.getElementById("extra");
  const ov = document.getElementById("ov");
  const ovBtn = document.getElementById("ovBtn");
  const restart = document.getElementById("restart");
  const muteBtn = document.getElementById("muteBtn");
  const KEY = "memory";

  const SYMBOLS = ["✦", "★", "☄", "✧", "◆", "◈", "✺", "❖"];
  let deck, first, second, lock, moves, matched, seconds, ticker, best, running;

  best = A.hi(KEY); bestEl.textContent = best;

  function score() { return Math.max(0, matched * 100 - moves * 5); }
  function sync() {
    scoreEl.textContent = score();
    if (extraEl) extraEl.textContent = moves + " 步 · " + seconds + "s";
  }

  function reset() {
    clearInterval(ticker);
    deck = A.shuffle(SYMBOLS.concat(SYMBOLS)).map(function (s, i) { return { id: i, sym: s, flipped: false, matched: false }; });
    first = null; second = null; lock = false; moves = 0; matched = 0; seconds = 0; running = false;
    grid.innerHTML = "";
    deck.forEach(function (card) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "flip-card";
      b.setAttribute("aria-label", "未翻开的卡片");
      b.innerHTML = '<span class="flip-inner"><span class="flip-face flip-back"></span><span class="flip-face flip-front">' + card.sym + "</span></span>";
      b.addEventListener("click", function () { flip(card, b); });
      grid.appendChild(b);
    });
    sync();
  }

  function startTimer() {
    if (running) return;
    running = true;
    ticker = setInterval(function () { seconds += 1; sync(); }, 1000);
  }

  function flip(card, el) {
    if (lock || card.flipped || card.matched) return;
    startTimer();
    A.sfx("flip");
    card.flipped = true;
    el.classList.add("flipped");
    if (!first) { first = { card: card, el: el }; return; }

    second = { card: card, el: el };
    moves += 1; sync();
    if (first.card.sym === second.card.sym) {
      first.card.matched = second.card.matched = true;
      first.el.classList.add("matched"); second.el.classList.add("matched");
      first = null; second = null; lock = false;
      matched += 1; sync(); A.sfx("score");
      if (matched === SYMBOLS.length) win();
    } else {
      lock = true;
      const a = first, b = second;
      setTimeout(function () {
        a.card.flipped = b.card.flipped = false;
        a.el.classList.remove("flipped"); b.el.classList.remove("flipped");
        first = null; second = null; lock = false;
      }, 720);
    }
  }

  function win() {
    clearInterval(ticker); running = false;
    const final = Math.max(100, 2000 - moves * 40 - seconds * 10);
    A.sfx("win");
    const isNew = A.setHi(KEY, final);
    best = A.hi(KEY); bestEl.textContent = best;
    A.showOverlay(ov, {
      title: "全部配对成功！",
      text: "用了 " + moves + " 步、" + seconds + " 秒。" + (isNew ? " 新纪录！" : " 再挑战更快解法吧。"),
      big: "最终得分 " + final, button: "再玩一局"
    });
  }

  function start() {
    A.showOverlay(ov, null);
    A.sfx("start");
    reset();
  }

  restart.addEventListener("click", function () { A.sfx("click"); start(); });
  ovBtn.addEventListener("click", function () { A.sfx("click"); start(); });
  muteBtn.addEventListener("click", function () { muteBtn.textContent = A.toggleMute() ? "🔇" : "🔊"; });

  reset();
  A.showOverlay(ov, { title: "记忆翻牌", text: "每次翻开两张卡片，找出 8 对相同的星图符号。用更少的步数与时间清空牌桌，得分更高。", big: "", button: "开始游戏" });
})();
