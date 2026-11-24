#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成 6 个游戏页面（统一外壳）。
所有游戏共用 ../assets/css/arcade.css 与 ../assets/js/arcade.js，
游戏逻辑位于 js/<slug>.js。修改外壳后重新运行本脚本即可。
"""
import os
from string import Template

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
GAMES_DIR = os.path.join(ROOT, "games")

TPL = Template('''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>$title · BOGAME 2026</title>
<meta name="description" content="$desc" />
<link rel="icon" type="image/svg+xml" href="../assets/showcase/icon.svg" />
<link rel="stylesheet" href="../assets/css/arcade.css" />
</head>
<body>
<div class="wrap">

  <div class="topbar">
    <a class="btn ghost" href="../index.html">← 返回大厅</a>
    <div class="brand"><span class="dot"></span> $title</div>
    <div class="spacer"></div>
$stats
    <button class="btn" id="restart" type="button">重开</button>
    <button class="btn ghost" id="muteBtn" type="button">🔊</button>
  </div>

  <div class="stage">
    <div class="board">
$board
      <div class="overlay" id="ov">
        <h2></h2>
        <p></p>
        <div class="big"></div>
        <button class="btn primary" id="ovBtn" type="button">开始游戏</button>
      </div>
$pad
    </div>

    <aside class="side">
      <h3>玩法说明</h3>
$howto
      <h3 style="margin-top:22px">操作</h3>
$controls
    </aside>
  </div>

  <div class="footer">
    BOGAME 2026 · 星轨游戏盒 &nbsp;|&nbsp; $title &nbsp;|&nbsp; 分数保存在浏览器本地
  </div>

</div>
<script src="../assets/js/arcade.js"></script>
<script src="js/$slug.js"></script>
</body>
</html>
''')

PAD = '''      <div class="touchpad">
        <span></span><button type="button" data-dir="up">↑</button><span></span>
        <button type="button" data-dir="left">←</button><button type="button" data-dir="down">↓</button><button type="button" data-dir="right">→</button>
      </div>'''


def stat(inner):
    return '    <div class="stat">%s</div>' % inner


GAMES = [
    dict(
        slug="neon-snake", title="霓虹贪吃蛇",
        desc="在霓虹网格中收集光点、不断变长的经典贪吃蛇。",
        stats="\n".join([stat('得分 <b id="score">0</b>'), stat('最高 <b id="best">0</b>')]),
        board='      <canvas id="cv"></canvas>',
        pad=PAD,
        howto='''      <p>控制小蛇在 24×24 的网格中移动，吃到粉色光点即可变长并加分。撞到墙壁或自己的身体，本局结束。</p>
      <ul>
        <li>每吃一个光点 +10 分</li>
        <li>得分越高，移动速度越快</li>
        <li>最高分自动保存在本地</li>
      </ul>''',
        controls='''      <p><kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> 或 <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> 控制方向。</p>
      <p>手机上可滑动屏幕，或使用下方方向键。</p>''',
    ),
    dict(
        slug="star-dodge", title="星轨闪避",
        desc="驾驶飞船穿过陨石雨，坚持 45 秒即可通关。",
        stats="\n".join([stat('得分 <b id="score">0</b>'), stat('最高 <b id="best">0</b>')]),
        board='''      <canvas id="cv"></canvas>
      <div class="meter"><i id="meterFill"></i></div>''',
        pad="",
        howto='''      <p>飞船在屏幕下方活动，陨石不断从上方落下。躲开全部陨石并坚持 45 秒即可通关。</p>
      <ul>
        <li>每躲过一块陨石 +10 分</li>
        <li>时间越久，陨石越密越快</li>
        <li>被击中立即结束</li>
      </ul>''',
        controls='''      <p>方向键 / <kbd>WASD</kbd> 四向移动，或直接拖动鼠标 / 手指控制飞船。</p>''',
    ),
    dict(
        slug="card-match", title="记忆翻牌",
        desc="翻开成对的星图卡片，用最少步数清空牌桌。",
        stats="\n".join([stat('得分 <b id="score">0</b>'), stat('最高 <b id="best">0</b>'), stat('<span id="extra">0 步 · 0s</span>')]),
        board='      <div class="flip-grid" id="grid"></div>',
        pad="",
        howto='''      <p>牌桌上共有 16 张卡，组成 8 对星图符号。每次翻开两张，符号相同则配对成功并保留翻开。</p>
      <ul>
        <li>每配对一组 +100 分，每步 −5 分</li>
        <li>用时越短，最终得分越高</li>
        <li>全部配对成功后结算</li>
      </ul>''',
        controls='''      <p>点击 / 轻触卡片翻开。找齐全部 8 对即获胜。</p>''',
    ),
    dict(
        slug="brick-breaker", title="弹球破砖",
        desc="移动挡板反弹光球，击碎整片砖阵。",
        stats="\n".join([stat('得分 <b id="score">0</b>'), stat('最高 <b id="best">0</b>'), stat('生命 <b id="lives">3</b>')]),
        board='      <canvas id="cv"></canvas>',
        pad="",
        howto='''      <p>用挡板反弹光球击碎上方全部砖块，共 3 条命。球落到底线损失一条命。</p>
      <ul>
        <li>每击碎一块砖 +10 分</li>
        <li>挡板边缘反弹角度更斜</li>
        <li>清空砖阵即通关</li>
      </ul>''',
        controls='''      <p>方向键 / 鼠标 / 手指左右移动挡板；点击或按 <kbd>空格</kbd> 发球。</p>''',
    ),
    dict(
        slug="stardust-2048", title="星尘合成 2048",
        desc="滑动合并同数值星尘，合成 2048 星核。",
        stats="\n".join([stat('得分 <b id="score">0</b>'), stat('最高 <b id="best">0</b>'), '    <button class="btn ghost" id="undoBtn" type="button">撤销</button>']),
        board='      <div class="g2048" id="grid"></div>',
        pad=PAD,
        howto='''      <p>向四个方向滑动，相同数值的星尘会合并相加。目标是合成 2048 星核。</p>
      <ul>
        <li>合并时获得等值分数</li>
        <li>可用“撤销”回退一步</li>
        <li>棋盘填满且无法合并即结束</li>
      </ul>''',
        controls='''      <p>方向键 / <kbd>WASD</kbd> 或滑动棋盘；手机可用下方方向键。</p>''',
    ),
    dict(
        slug="reflex-rush", title="极速反应",
        desc="30 秒内点亮出现的光点，连击越高得分越猛。",
        stats="\n".join([stat('得分 <b id="score">0</b>'), stat('最高 <b id="best">0</b>'), stat('<span id="extra">连击 ×0 · 命中 0</span>')]),
        board='''      <canvas id="cv"></canvas>
      <div class="meter"><i id="meterFill"></i></div>''',
        pad="",
        howto='''      <p>30 秒内点亮所有出现的光点，越快越准得分越高。</p>
      <ul>
        <li>命中 +10 分，连击额外加分</li>
        <li>点空或目标超时会中断连击</li>
        <li>限时结束结算总得分</li>
      </ul>''',
        controls='''      <p>鼠标点击或手指轻触光点。</p>''',
    ),
]


def main():
    for g in GAMES:
        html = TPL.substitute(
            title=g["title"], desc=g["desc"], slug=g["slug"],
            stats=g["stats"], board=g["board"], pad=g["pad"],
            howto=g["howto"], controls=g["controls"],
        )
        path = os.path.join(GAMES_DIR, g["slug"] + ".html")
        with open(path, "w", encoding="utf-8", newline="\n") as f:
            f.write(html)
        print("生成", os.path.relpath(path, os.path.dirname(GAMES_DIR)), len(html), "chars")


if __name__ == "__main__":
    main()
