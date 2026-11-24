/* BOGAME 2026 · 星轨游戏盒 — 公共运行时
   提供：高分存档、WebAudio 音效、HiDPI 画布、覆盖层、输入辅助。
   所有游戏通过全局对象 Arcade 调用，无第三方依赖。 */
(function () {
  "use strict";

  const PREFIX = "bogame2026:";

  let audioCtx = null;
  function ctx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  let muted = false;
  try { muted = localStorage.getItem(PREFIX + "muted") === "1"; } catch (e) {}

  function tone(freq, dur, type, vol, delay) {
    if (muted) return;
    const c = ctx();
    if (!c) return;
    const t0 = c.currentTime + (delay || 0);
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  const SFX = {
    click:  [[520, 0.06, "triangle", 0.08]],
    start:  [[392, 0.09, "triangle", 0.10], [523, 0.10, "triangle", 0.10, 0.09], [659, 0.16, "triangle", 0.10, 0.18]],
    score:  [[740, 0.08, "sine", 0.10], [988, 0.12, "sine", 0.09, 0.07]],
    hit:    [[180, 0.14, "sawtooth", 0.10]],
    flip:   [[620, 0.07, "square", 0.06]],
    win:    [[523, 0.10, "triangle", 0.10], [659, 0.10, "triangle", 0.10, 0.10], [784, 0.10, "triangle", 0.10, 0.20], [1047, 0.24, "triangle", 0.11, 0.30]],
    over:   [[440, 0.16, "triangle", 0.10], [330, 0.18, "triangle", 0.10, 0.14], [220, 0.30, "triangle", 0.10, 0.30]],
  };

  const Arcade = {
    /* ---- 存档 ---- */
    hi(key) {
      try { return Number(localStorage.getItem(PREFIX + "hi:" + key)) || 0; } catch (e) { return 0; }
    },
    setHi(key, value) {
      try {
        const old = this.hi(key);
        if (value > old) { localStorage.setItem(PREFIX + "hi:" + key, String(value)); return true; }
      } catch (e) {}
      return false;
    },
    isMuted() { return muted; },
    toggleMute() {
      muted = !muted;
      try { localStorage.setItem(PREFIX + "muted", muted ? "1" : "0"); } catch (e) {}
      return muted;
    },

    /* ---- 音效 ---- */
    sfx(name) {
      const list = SFX[name] || SFX.click;
      list.forEach(([f, d, t, v, delay]) => tone(f, d, t, v, delay));
    },

    /* ---- 画布 ---- */
    /** 按逻辑尺寸创建 HiDPI 画布，返回 2D ctx（绘制坐标用逻辑像素）。 */
    setupCanvas(canvas, w, h) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      const c = canvas.getContext("2d");
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      return c;
    },

    /* ---- 覆盖层 ---- */
    /** el 为 .overlay 元素；传入 null 表示隐藏。 */
    showOverlay(el, opts) {
      if (!el) return;
      if (!opts) { el.classList.add("hidden"); return; }
      const h = el.querySelector("h2");
      const p = el.querySelector("p");
      const big = el.querySelector(".big");
      const btn = el.querySelector("button");
      if (h) h.textContent = opts.title || "";
      if (p) p.textContent = opts.text || "";
      if (big) big.textContent = opts.big != null ? opts.big : "";
      if (btn) btn.textContent = opts.button || "再来一局";
      el.classList.remove("hidden");
    },

    /* ---- 工具 ---- */
    rnd(a, b) { return a + Math.random() * (b - a); },
    rndInt(a, b) { return Math.floor(this.rnd(a, b + 1)); },
    clamp(v, a, b) { return Math.max(a, Math.min(b, v)); },
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },

    /** 方向键 / WASD 监听，回调收到 'up'|'down'|'left'|'right'，并阻止页面滚动。 */
    directions(handler) {
      const map = {
        ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
        w: "up", s: "down", a: "left", d: "right",
        W: "up", S: "down", A: "left", D: "right",
      };
      window.addEventListener("keydown", (e) => {
        const dir = map[e.key];
        if (dir) { e.preventDefault(); handler(dir); }
      }, { passive: false });
    },
  };

  window.Arcade = Arcade;
})();
