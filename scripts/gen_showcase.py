#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成 BOGAME 2026 展示图（SVG）。
输出到 ../assets/showcase/：
  icon.svg      站点图标
  banner.svg    项目横幅
  hall.svg      大厅界面
  game-*.svg    6 款游戏界面展示图
全部为手写矢量，纯文本、体积小、任意缩放不失真。
"""
import os
import random

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), "assets", "showcase")
IF = "'PingFang SC','Hiragino Sans GB','Microsoft YaHei',system-ui,sans-serif"
MF = "'SFMono-Regular',Consolas,monospace"

CY, VI, PK, GD, GR = "#36e2f4", "#a06bff", "#ff6b9d", "#ffd166", "#4be3a2"


def stars(w, h, n, seed):
    random.seed(seed)
    return "".join(
        '<circle cx="%.1f" cy="%.1f" r="%s" fill="#dbe6ff" opacity="%.2f"/>'
        % (random.uniform(0, w), random.uniform(0, h), random.choice([0.8, 1, 1.2, 1.6]), random.uniform(0.2, 0.75))
        for _ in range(n)
    )


def bg(w, h, a1, a2, seed):
    return (
        '<defs>'
        '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">'
        '<stop offset="0" stop-color="#0c142e"/><stop offset="1" stop-color="#070b1a"/></linearGradient>'
        '<radialGradient id="g1" cx="16%%" cy="0%%" r="72%%"><stop offset="0" stop-color="%s" stop-opacity=".34"/><stop offset="1" stop-color="%s" stop-opacity="0"/></radialGradient>'
        '<radialGradient id="g2" cx="88%%" cy="10%%" r="66%%"><stop offset="0" stop-color="%s" stop-opacity=".26"/><stop offset="1" stop-color="%s" stop-opacity="0"/></radialGradient>'
        '</defs>'
        '<rect width="%d" height="%d" fill="url(#bg)"/>'
        '<rect width="%d" height="%d" fill="url(#g1)"/>'
        '<rect width="%d" height="%d" fill="url(#g2)"/>'
        '<g>%s</g>'
    ) % (a1, a1, a2, a2, w, h, w, h, w, h, stars(w, h, 70, seed))


def hud(w, title, score, accent):
    return (
        '<rect x="24" y="22" width="%d" height="46" rx="12" fill="#121b38" stroke="#26335f"/>'
        '<circle cx="48" cy="45" r="6" fill="%s"/>'
        '<text x="64" y="51" font-family="%s" font-size="17" font-weight="700" fill="#eaf1ff">%s</text>'
        '<text x="%d" y="51" text-anchor="end" font-family="%s" font-size="15" fill="%s">SCORE %s</text>'
        '<text x="%d" y="51" text-anchor="end" font-family="%s" font-size="12" fill="#7d8dba">BOGAME 2026</text>'
    ) % (w - 48, accent, IF, title, w - 46, MF, GD, score, w - 140, MF)


def wrap(w, h, inner, seed=1, a1=CY, a2=VI):
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d" role="img">'
        % (w, h, w, h)
        + bg(w, h, a1, a2, seed)
        + inner
        + '<rect x="1" y="1" width="%d" height="%d" rx="16" fill="none" stroke="#26335f"/>' % (w - 2, h - 2)
        + "</svg>"
    )


SHAPES = ["✦", "★", "☄", "✧", "◆", "◈", "✺", "❖"]


# ---------------- 1. 霓虹贪吃蛇 ----------------
def snake():
    w, h = 800, 500
    cols, rows, cell = 20, 10, 33
    ox, oy = (w - cols * cell) / 2, 96
    g = ""
    for i in range(cols + 1):
        g += '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#26335f" stroke-opacity=".5"/>' % (
            ox + i * cell, oy, ox + i * cell, oy + rows * cell)
    for j in range(rows + 1):
        g += '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#26335f" stroke-opacity=".5"/>' % (
            ox, oy + j * cell, ox + cols * cell, oy + j * cell)
    body = [(4, 5), (5, 5), (6, 5), (7, 5), (8, 5), (8, 4), (8, 3)]
    palette = ["#6ff0d2", "#5fd8f0", "#66c9f0", "#8ea9ff", "#a887ff", "#c98bff", "#ff6b9d"]
    for k, (cx, cy) in enumerate(body):
        col = palette[min(k, len(palette) - 1)] if k else CY
        x, y = ox + cx * cell + 3, oy + cy * cell + 3
        g += ('<rect x="%.1f" y="%.1f" width="%d" height="%d" rx="6" fill="%s" opacity="%s"/>'
              % (x, y, cell - 6, cell - 6, col, 1 if k == 0 else 0.85 - k * 0.07))
    hx, hy = ox + 4 * cell + 9, oy + 5 * cell + 9
    g += '<rect x="%.1f" y="%.1f" width="4" height="4" rx="1" fill="#06121f"/>' % (hx, hy)
    g += '<rect x="%.1f" y="%.1f" width="4" height="4" rx="1" fill="#06121f"/>' % (hx + 10, hy)
    fx, fy = ox + 14 * cell + cell / 2, oy + 2 * cell + cell / 2
    g += '<circle cx="%.1f" cy="%.1f" r="18" fill="%s" opacity=".22"/>' % (fx, fy, PK)
    g += '<circle cx="%.1f" cy="%.1f" r="9" fill="%s"/>' % (fx, fy, PK)
    return wrap(w, h, hud(w, "霓虹贪吃蛇", "0120", CY) + g, seed=11)


# ---------------- 2. 星轨闪避 ----------------
def dodge():
    w, h = 800, 500
    g = ""
    rocks = [(160, 150, 20), (300, 90, 13), (470, 190, 26), (610, 120, 16), (700, 250, 11),
             (240, 300, 15), (520, 330, 19), (390, 45, 9), (100, 360, 12)]
    for (x, y, r) in rocks:
        g += '<circle cx="%d" cy="%d" r="%d" fill="%s" opacity=".16"/>' % (x, y, r * 2, VI)
        g += ('<circle cx="%d" cy="%d" r="%d" fill="url(#rk)"/>' % (x, y, r))
    g += ('<radialGradient id="rk" cx="35%%" cy="30%%" r="75%%"><stop offset="0" stop-color="#c9a7ff"/>'
          '<stop offset="1" stop-color="#4a2f8f"/></radialGradient>')
    sx, sy = 400, 400
    g += '<circle cx="%d" cy="%d" r="40" fill="%s" opacity=".18"/>' % (sx, sy + 20, CY)
    g += ('<path d="M%d %d L%d %d L%d %d L%d %d Z" fill="%s"/>'
          % (sx, sy - 24, sx - 26, sy + 18, sx, sy + 6, sx + 26, sy + 18, CY))
    g += '<circle cx="%d" cy="%d" r="5" fill="%s"/>' % (sx, sy + 30, PK)
    # 进度条
    g += '<rect x="60" y="452" width="680" height="8" rx="4" fill="#1a2447"/>'
    g += '<rect x="60" y="452" width="470" height="8" rx="4" fill="%s"/>' % CY
    g += '<text x="60" y="440" font-family="%s" font-size="12" fill="#7d8dba">SURVIVE 45s</text>' % MF
    return wrap(w, h, hud(w, "星轨闪避", "0260", VI) + g, seed=22, a1=VI, a2=CY)


# ---------------- 3. 记忆翻牌 ----------------
def memory():
    w, h = 800, 500
    cw, ch, gap = 78, 100, 14
    total = 4 * cw + 3 * gap
    ox, oy = (w - total) / 2, 104
    labels = ["✦", "★", "☄", "✧", "◆", "◈", "✺", "❖", "✦", "★", "☄", "✧", "◆", "◈", "✺", "❖"]
    shown = {0, 5, 5, 10, 11}  # 已翻开/已配对
    g = ""
    for i in range(16):
        r, c = divmod(i, 4)
        x, y = ox + c * (cw + gap), oy + r * (ch + gap)
        face_up = i in {0, 4, 5, 10, 11}
        if face_up:
            matched = i in {0, 4}
            stroke = GR if matched else CY
            g += '<rect x="%.1f" y="%.1f" width="%d" height="%d" rx="12" fill="%s" fill-opacity=".18" stroke="%s" stroke-width="2"/>' % (
                x, y, cw, ch, CY if not matched else GR, stroke)
            g += '<text x="%.1f" y="%.1f" text-anchor="middle" font-family="%s" font-size="34" fill="%s">%s</text>' % (
                x + cw / 2, y + ch / 2 + 12, IF, "#ffffff", labels[i])
        else:
            g += '<rect x="%.1f" y="%.1f" width="%d" height="%d" rx="12" fill="#1b2a58" stroke="#26335f" stroke-width="2"/>' % (x, y, cw, ch)
            g += '<text x="%.1f" y="%.1f" text-anchor="middle" font-family="%s" font-size="22" fill="%s" opacity=".55">✦</text>' % (
                x + cw / 2, y + ch / 2 + 8, IF, CY)
    g += '<text x="400" y="476" text-anchor="middle" font-family="%s" font-size="13" fill="#7d8dba">12 步 · 24s · 已配对 2 / 8</text>' % MF
    return wrap(w, h, hud(w, "记忆翻牌", "0450", PK) + g, seed=33, a1=PK, a2=VI)


# ---------------- 4. 弹球破砖 ----------------
def breaker():
    w, h = 800, 500
    g = ""
    cols, rows, bw, bh, gap, ox, oy = 8, 5, 62, 18, 8, 148, 100
    cols_colors = [CY, "#66c9f0", "#8ea9ff", "#a887ff", "#ff7fc4"]
    alive = {(r, c) for r in range(rows) for c in range(cols)} - {(0, 0), (0, 1), (1, 3), (2, 5), (3, 2), (4, 6), (4, 7)}
    for (r, c) in sorted(alive):
        x, y = ox + c * (bw + gap), oy + r * (bh + gap)
        g += '<rect x="%d" y="%d" width="%d" height="%d" rx="5" fill="%s" opacity=".92"/>' % (x, y, bw, bh, cols_colors[r])
    px, py = 330, 430
    g += '<rect x="%d" y="%d" width="140" height="13" rx="7" fill="%s"/>' % (px, py, CY)
    g += '<circle cx="%d" cy="%d" r="9" fill="%s" opacity=".25"/>' % (520, 350, GD)
    g += '<circle cx="520" cy="350" r="8" fill="%s"/>' % GD
    g += '<text x="400" y="478" text-anchor="middle" font-family="%s" font-size="13" fill="#7d8dba">生命 ♥ ♥ ♥　·　点击或空格发球</text>' % MF
    return wrap(w, h, hud(w, "弹球破砖", "0330", CY) + g, seed=44, a1=CY, a2=PK)


# ---------------- 5. 星尘合成 2048 ----------------
def g2048():
    w, h = 800, 500
    size, gap = 84, 12
    total = 4 * size + 3 * gap
    ox, oy = (w - total) / 2, 104
    vals = [[2, 4, 8, 16], [32, 64, 128, 256], [512, 1024, 2048, 0], [0, 0, 0, 0]]
    colors = {2: "#6fe6f5", 4: "#66c9f0", 8: "#8ea9ff", 16: "#a887ff", 32: "#cf7bff",
              64: "#ff7fc4", 128: "#ff9d7a", 256: "#ffc46b", 512: "#ffe066", 1024: "#b6f36b", 2048: GD}
    g = ""
    for r in range(4):
        for c in range(4):
            x, y = ox + c * (size + gap), oy + r * (size + gap)
            v = vals[r][c]
            if v:
                fill = colors.get(v, GD)
                g += '<rect x="%.1f" y="%.1f" width="%d" height="%d" rx="10" fill="%s"/>' % (x, y, size, size, fill)
                fs = 30 if v < 100 else (26 if v < 1000 else 21)
                g += '<text x="%.1f" y="%.1f" text-anchor="middle" font-family="%s" font-size="%d" font-weight="800" fill="#0a1024">%d</text>' % (
                    x + size / 2, y + size / 2 + fs / 3, MF, fs, v)
            else:
                g += '<rect x="%.1f" y="%.1f" width="%d" height="%d" rx="10" fill="#141e3e"/>' % (x, y, size, size)
    return wrap(w, h, hud(w, "星尘合成 2048", "1840", GD) + g, seed=55, a1=GD, a2=PK)


# ---------------- 6. 极速反应 ----------------
def reflex():
    w, h = 800, 500
    g = ""
    for i in range(0, w, 50):
        g += '<line x1="%d" y1="90" x2="%d" y2="430" stroke="#26335f" stroke-opacity=".4"/>' % (i, i)
    for j in range(110, 440, 50):
        g += '<line x1="0" y1="%d" x2="%d" y2="%d" stroke="#26335f" stroke-opacity=".4"/>' % (j, w, j)
    for (x, y, r, op) in [(250, 220, 34, .22), (560, 170, 26, .16), (470, 350, 30, .14)]:
        g += '<circle cx="%d" cy="%d" r="%d" fill="%s" opacity="%s"/>' % (x, y, r * 2, PK, op)
    g += '<circle cx="250" cy="220" r="46" fill="%s" opacity=".16"/>' % PK
    g += '<circle cx="250" cy="220" r="30" fill="%s"/>' % PK
    g += '<circle cx="250" cy="220" r="44" fill="none" stroke="#ffffff" stroke-opacity=".8" stroke-width="2"/>'
    g += '<text x="250" y="227" text-anchor="middle" font-family="%s" font-size="14" font-weight="700" fill="#ffffff">点我</text>' % IF
    g += '<text x="560" y="178" text-anchor="middle" font-family="%s" font-size="30" fill="%s" opacity=".55">✦</text>' % (IF, VI)
    g += '<text x="470" y="358" text-anchor="middle" font-family="%s" font-size="30" fill="%s" opacity=".45">✦</text>' % (IF, CY)
    g += '<rect x="60" y="452" width="680" height="8" rx="4" fill="#1a2447"/>'
    g += '<rect x="60" y="452" width="390" height="8" rx="4" fill="%s"/>' % PK
    return wrap(w, h, hud(w, "极速反应", "0680", PK) + g, seed=66, a1=PK, a2=GD)


# ---------------- 大厅 ----------------
def hall():
    w, h = 800, 500
    g = ""
    g += '<text x="400" y="150" text-anchor="middle" font-family="%s" font-size="46" font-weight="800" fill="#ffffff">星轨游戏盒</text>' % IF
    g += '<text x="400" y="186" text-anchor="middle" font-family="%s" font-size="15" fill="#94a5cc">BOGAME 2026 · 六款开箱即玩的轻量网页小游戏</text>' % IF
    g += '<rect x="352" y="206" width="96" height="34" rx="17" fill="%s"/><text x="400" y="228" text-anchor="middle" font-family="%s" font-size="13" font-weight="700" fill="#06121f">开始游玩</text>' % (CY, IF)
    titles = ["霓虹贪吃蛇", "星轨闪避", "记忆翻牌", "弹球破砖", "星尘 2048", "极速反应"]
    cols_colors = [CY, VI, PK, CY, GD, PK]
    cw, ch, gap = 226, 84, 18
    ox, oy = (w - (3 * cw + 2 * gap)) / 2, 274
    for i, t in enumerate(titles):
        r, c = divmod(i, 3)
        x, y = ox + c * (cw + gap), oy + r * (ch + gap)
        g += '<rect x="%.1f" y="%.1f" width="%d" height="%d" rx="12" fill="#121b38" stroke="#26335f"/>' % (x, y, cw, ch)
        g += '<rect x="%.1f" y="%.1f" width="6" height="%d" rx="3" fill="%s"/>' % (x + 16, y + 20, ch - 40, cols_colors[i])
        g += '<text x="%.1f" y="%.1f" font-family="%s" font-size="16" font-weight="700" fill="#eaf1ff">%s</text>' % (x + 34, y + 38, IF, t)
        g += '<text x="%.1f" y="%.1f" font-family="%s" font-size="11" fill="#7d8dba">开始游玩 →</text>' % (x + 34, y + 62, IF)
    return wrap(w, h, g, seed=77, a1=CY, a2=VI)


# ---------------- 横幅 ----------------
def banner():
    w, h = 1200, 420
    g = ""
    g += '<rect x="70" y="96" width="440" height="34" rx="17" fill="none" stroke="#26335f"/>'
    g += '<text x="290" y="119" text-anchor="middle" font-family="%s" font-size="13" letter-spacing="3" fill="%s">BOGAME 2026 · MINI ARCADE</text>' % (MF, CY)
    g += '<text x="70" y="220" font-family="%s" font-size="76" font-weight="800" fill="#ffffff">星轨游戏盒</text>' % IF
    g += '<text x="72" y="268" font-family="%s" font-size="19" fill="#94a5cc">六款零依赖、开箱即玩的轻量网页小游戏</text>' % IF
    for i, t in enumerate(["贪吃蛇", "闪避", "记忆", "破砖", "2048", "反应"]):
        x = 72 + i * 108
        g += '<rect x="%d" y="306" width="96" height="34" rx="17" fill="#121b38" stroke="#26335f"/>' % x
        g += '<text x="%d" y="328" text-anchor="middle" font-family="%s" font-size="13" fill="#c8d6f5">%s</text>' % (x + 48, IF, t)
    # 右侧图形：骰子/星轨
    cx, cy = 950, 210
    g += '<circle cx="%d" cy="%d" r="132" fill="%s" opacity=".10"/>' % (cx, cy, VI)
    g += '<circle cx="%d" cy="%d" r="96" fill="none" stroke="%s" stroke-opacity=".45" stroke-width="2"/>' % (cx, cy, CY)
    g += '<circle cx="%d" cy="%d" r="66" fill="none" stroke="%s" stroke-opacity=".35" stroke-width="2" stroke-dasharray="6 10"/>' % (cx, cy, PK)
    for (dx, dy, r, col) in [(-96, 0, 7, CY), (96, 0, 7, VI), (0, -96, 7, PK), (0, 96, 7, GD),
                             (68, -68, 6, CY), (-68, 68, 6, VI), (-68, -68, 6, PK), (68, 68, 6, GD)]:
        g += '<circle cx="%d" cy="%d" r="%d" fill="%s"/>' % (cx + dx, cy + dy, r, col)
    g += '<path d="M%d %d L%d %d L%d %d Z" fill="%s" opacity=".9"/>' % (cx - 16, cy + 24, cx, cy - 26, cx + 22, cy + 24, CY)
    g += '<circle cx="%d" cy="%d" r="10" fill="%s"/>' % (cx, cy - 26, PK)
    return wrap(w, h, g, seed=88, a1=VI, a2=CY)


# ---------------- 特性图 1：本地高分榜 ----------------
def feature_scores():
    w, h = 800, 500
    g = ""
    g += '<text x="60" y="92" font-family="%s" font-size="28" font-weight="800" fill="#ffffff">本地高分榜</text>' % IF
    g += '<text x="60" y="118" font-family="%s" font-size="12" letter-spacing="2" fill="%s">LOCAL LEADERBOARD</text>' % (MF, CY)
    rows = [("霓虹贪吃蛇", 120, CY), ("星轨闪避", 260, VI), ("记忆翻牌", 450, PK),
            ("弹球破砖", 330, CY), ("星尘合成 2048", 1840, GD), ("极速反应", 680, PK)]
    top = max(v for _, v, _ in rows)
    for i, (name, val, col) in enumerate(rows):
        y = 146 + i * 52
        g += '<rect x="60" y="%d" width="680" height="42" rx="10" fill="#121b38" stroke="#26335f"/>' % y
        g += '<text x="80" y="%d" font-family="%s" font-size="15" fill="#eaf1ff">%s</text>' % (y + 27, IF, name)
        g += '<rect x="430" y="%d" width="200" height="8" rx="4" fill="#1a2447"/>' % (y + 17)
        g += '<rect x="430" y="%d" width="%d" height="8" rx="4" fill="%s"/>' % (y + 17, max(12, int(200 * val / top)), col)
        g += '<text x="720" y="%d" text-anchor="end" font-family="%s" font-size="16" font-weight="700" fill="%s">%04d</text>' % (y + 28, MF, GD, val)
    g += '<text x="60" y="478" font-family="%s" font-size="12" fill="#7d8dba">成绩写入浏览器 localStorage · 清除站点数据即可重置</text>' % IF
    return wrap(w, h, g, seed=91, a1=CY, a2=VI)


# ---------------- 特性图 2：响应式适配 ----------------
def feature_responsive():
    w, h = 800, 500
    g = ""
    g += '<text x="60" y="80" font-family="%s" font-size="26" font-weight="800" fill="#ffffff">一处编写，处处可玩</text>' % IF
    g += '<text x="60" y="106" font-family="%s" font-size="12" letter-spacing="2" fill="%s">RESPONSIVE BY DESIGN</text>' % (MF, VI)
    # 桌面窗口
    g += '<rect x="60" y="140" width="410" height="270" rx="14" fill="#0b1226" stroke="#26335f" stroke-width="2"/>'
    g += '<path d="M60 154 a14 14 0 0 1 14 -14 h382 a14 14 0 0 1 14 14 v16 h-410 z" fill="#121b38"/>'
    for i, col in enumerate([PK, GD, CY]):
        g += '<circle cx="%d" cy="155" r="5" fill="%s" opacity=".8"/>' % (82 + i * 16, col)
    g += '<text x="265" y="200" text-anchor="middle" font-family="%s" font-size="22" font-weight="800" fill="#ffffff">星轨游戏盒</text>' % IF
    for i in range(6):
        r, c = divmod(i, 3)
        x, y = 84 + c * 126, 226 + r * 84
        g += '<rect x="%d" y="%d" width="114" height="70" rx="9" fill="#121b38" stroke="#26335f"/>' % (x, y)
        g += '<rect x="%d" y="%d" width="%d" height="30" rx="5" fill="%s" opacity=".5"/>' % (x + 8, y + 8, 98, [CY, VI, PK, CY, GD, PK][i])
        g += '<rect x="%d" y="%d" width="70" height="8" rx="4" fill="#3a4a80"/>' % (x + 8, y + 48)
    # 手机
    g += '<rect x="560" y="124" width="178" height="302" rx="26" fill="#0b1226" stroke="#26335f" stroke-width="3"/>'
    g += '<rect x="616" y="136" width="66" height="8" rx="4" fill="#26335f"/>'
    g += '<text x="649" y="186" text-anchor="middle" font-family="%s" font-size="16" font-weight="800" fill="#ffffff">星轨游戏盒</text>' % IF
    for i in range(4):
        y = 206 + i * 52
        g += '<rect x="576" y="%d" width="146" height="44" rx="8" fill="#121b38" stroke="#26335f"/>' % y
        g += '<rect x="584" y="%d" width="42" height="28" rx="4" fill="%s" opacity=".55"/>' % (y + 8, [CY, VI, PK, GD][i])
        g += '<rect x="634" y="%d" width="66" height="7" rx="3" fill="#3a4a80"/>' % (y + 13)
        g += '<rect x="634" y="%d" width="46" height="7" rx="3" fill="#2b3866"/>' % (y + 25)
    # 中间箭头
    g += '<text x="510" y="282" text-anchor="middle" font-family="%s" font-size="30" fill="%s">⇄</text>' % (IF, CY)
    g += '<text x="510" y="306" text-anchor="middle" font-family="%s" font-size="11" fill="#7d8dba">自适应</text>' % IF
    g += '<text x="60" y="456" font-family="%s" font-size="13" fill="#94a5cc">桌面：画布 + 侧栏说明　·　手机：单列布局 + 触屏方向键 / 滑动 / 点击</text>' % IF
    return wrap(w, h, g, seed=92, a1=VI, a2=CY)


# ---------------- 特性图 3：技术栈 ----------------
def feature_stack():
    w, h = 800, 500
    g = ""
    g += '<text x="60" y="92" font-family="%s" font-size="28" font-weight="800" fill="#ffffff">零依赖，纯前端</text>' % IF
    g += '<text x="60" y="118" font-family="%s" font-size="12" letter-spacing="2" fill="%s">NO BUILD · NO DEPENDENCIES</text>' % (MF, GD)
    blocks = [("HTML5", "结构与页面", CY, "&lt; &gt;"), ("CSS3", "视觉与动画", VI, "{ }"), ("JavaScript", "逻辑与交互", PK, "JS")]
    for i, (name, sub, col, ico) in enumerate(blocks):
        x = 60 + i * 232
        g += '<rect x="%d" y="160" width="208" height="180" rx="16" fill="#121b38" stroke="%s" stroke-opacity=".6"/>' % (x, col)
        g += '<circle cx="%d" cy="212" r="28" fill="%s" opacity=".18"/>' % (x + 104, col)
        g += '<text x="%d" y="221" text-anchor="middle" font-family="%s" font-size="18" font-weight="800" fill="%s">%s</text>' % (x + 104, MF, col, ico)
        g += '<text x="%d" y="278" text-anchor="middle" font-family="%s" font-size="20" font-weight="800" fill="#ffffff">%s</text>' % (x + 104, IF, name)
        g += '<text x="%d" y="304" text-anchor="middle" font-family="%s" font-size="13" fill="#94a5cc">%s</text>' % (x + 104, IF, sub)
    tags = ["不需要 npm install", "不加载任何 CDN", "离线双击即玩", "GitHub Pages 直接托管"]
    for i, t in enumerate(tags):
        x = 60 + (i % 2) * 370
        y = 374 + (i // 2) * 48
        g += '<rect x="%d" y="%d" width="344" height="36" rx="18" fill="#0f1834" stroke="#26335f"/>' % (x, y)
        g += '<text x="%d" y="%d" text-anchor="middle" font-family="%s" font-size="13" fill="%s">✓　%s</text>' % (x + 172, y + 23, IF, GR, t)
    return wrap(w, h, g, seed=93, a1=GD, a2=VI)


# ---------------- 图标 ----------------
def icon():
    w = h = 120
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" role="img">'
        '<defs><linearGradient id="ig" x1="0" y1="0" x2="1" y2="1">'
        '<stop offset="0" stop-color="#121b38"/><stop offset="1" stop-color="#0a1330"/></linearGradient></defs>'
        '<rect width="120" height="120" rx="26" fill="url(#ig)"/>'
        '<rect x="1" y="1" width="118" height="118" rx="25" fill="none" stroke="#26335f"/>'
        '<circle cx="60" cy="60" r="34" fill="none" stroke="%s" stroke-opacity=".55" stroke-width="2"/>'
        '<path d="M60 40 V52 M60 68 V80 M40 60 H52 M68 60 H80" stroke="%s" stroke-width="7" stroke-linecap="round"/>'
        '<circle cx="60" cy="60" r="9" fill="%s"/>'
        '<circle cx="94" cy="60" r="5" fill="%s"/>'
        '<circle cx="60" cy="94" r="5" fill="%s"/>'
        '<circle cx="26" cy="60" r="5" fill="%s"/>'
        "</svg>"
    ) % (CY, CY, PK, GD, VI, GR)


def main():
    os.makedirs(OUT, exist_ok=True)
    items = {
        "icon.svg": icon(),
        "banner.svg": banner(),
        "hall.svg": hall(),
        "game-snake.svg": snake(),
        "game-dodge.svg": dodge(),
        "game-memory.svg": memory(),
        "game-breaker.svg": breaker(),
        "game-2048.svg": g2048(),
        "game-reflex.svg": reflex(),
        "feature-scores.svg": feature_scores(),
        "feature-responsive.svg": feature_responsive(),
        "feature-stack.svg": feature_stack(),
    }
    for name, svg in items.items():
        p = os.path.join(OUT, name)
        with open(p, "w", encoding="utf-8", newline="\n") as f:
            f.write(svg)
        print("%-18s %6d bytes" % (name, len(svg.encode("utf-8"))))


if __name__ == "__main__":
    main()
