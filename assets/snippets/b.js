/* 動畫程式碼 batch B：研究與交付、視覺風格、圖像生成（部分） */
Object.assign(window.SNIPPETS, {

  'insight-sorting': {
    height:400,
    html:`<div class="board">
  <div class="cols"><span>回訪需求</span><span>結帳摩擦</span><span>配送</span></div>
  <div class="note g0" data-g="0">找不到舊訂單</div>
  <div class="note g0" data-g="0">想要再點一次</div>
  <div class="note g1" data-g="1">運費看不懂</div>
  <div class="note g1" data-g="1">結帳步驟太多</div>
  <div class="note g1" data-g="1">優惠券用不了</div>
  <div class="note g2" data-g="2">外送時間不準</div>
</div>
<button class="toggle">歸納成主題</button>`,
    css:`body { flex-direction: column; gap: 16px; }
.board { position: relative; width: 420px; height: 260px; border: 1px solid #e3e6ea; border-radius: 16px; background: #fff; }
.cols {
  position: absolute; top: 14px; left: 12px; right: 12px;
  display: grid; grid-template-columns: repeat(3, 1fr);
  font: 600 12px system-ui, sans-serif; color: #55595f;
  opacity: 0; transition: opacity 300ms;
}
.board.grouped .cols { opacity: 1; }
.note {
  position: absolute; left: 0; top: 0; width: 120px; padding: 8px 10px; border-radius: 4px;
  font: 12px system-ui, sans-serif; color: #1d1d1f; box-shadow: 0 2px 6px rgba(23, 63, 80, 0.15);
  transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
}
.g0 { background: #ffe08a; } .g1 { background: #ffc2bf; } .g2 { background: #c9e2ea; }
.toggle { height: 36px; padding: 0 16px; border: 0; border-radius: 8px; background: #173f50; color: #fff; cursor: pointer; }
@media (prefers-reduced-motion: reduce) { .note { transition: none; } }`,
    js:`const board = document.querySelector('.board');
const notes = [...board.querySelectorAll('.note')];
const btn = document.querySelector('.toggle');
// 散落時的位置：x、y、旋轉角度
const scatter = [[20, 60, -6], [260, 170, 5], [140, 30, 3], [280, 60, -4], [40, 180, 6], [160, 120, -3]];
let grouped = false;

function place() {
  const count = [0, 0, 0];
  notes.forEach((n, i) => {
    let x, y, r = 0;
    if (grouped) { const g = +n.dataset.g; x = 12 + g * 134; y = 40 + count[g]++ * 40; }
    else { [x, y, r] = scatter[i]; }
    n.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + r + 'deg)';
  });
  board.classList.toggle('grouped', grouped);
  btn.textContent = grouped ? '打散' : '歸納成主題';
}

btn.addEventListener('click', () => { grouped = !grouped; place(); });
place();`,
    params:[
      ['時長','700ms','距離較長的移動，給眼睛時間追蹤'],
      ['緩動','cubic-bezier(0.22, 1, 0.36, 1)','ease-out'],
      ['動畫屬性','transform','translate 加 rotate，不動 top／left'],
      ['欄位標題','opacity 300ms','便利貼歸位時才淡入'],
      ['可打斷','是','連點時從目前位置轉向新目標'],
      ['減少動態','直接跳到定位','尊重 prefers-reduced-motion']
    ]
  },

  'token-audit': {
    height:360,
    html:`<div class="panel">
  <div class="row"><code class="raw">#173f51</code><span class="arr">→</span><code class="tk">var(--navy)</code><span class="ck">✓</span></div>
  <div class="row"><code class="raw">15px</code><span class="arr">→</span><code class="tk">var(--sp-4)</code><span class="ck">✓</span></div>
  <div class="row"><code class="raw">#fd5555</code><span class="arr">→</span><code class="tk">var(--coral)</code><span class="ck">✓</span></div>
  <div class="row"><code class="raw">11px</code><span class="arr">→</span><code class="tk">var(--r-md)</code><span class="ck">✓</span></div>
  <div class="cov"><span>Token 覆蓋率</span><b id="pct">62%</b></div>
  <div class="bar"><i id="fill"></i></div>
</div>
<button class="run">替換成 token</button>`,
    css:`body { flex-direction: column; gap: 16px; }
.panel { width: 320px; padding: 16px 20px; display: grid; gap: 8px; border: 1px solid #e3e6ea; border-radius: 12px; background: #fff; font: 13px system-ui, sans-serif; }
.row { display: grid; grid-template-columns: 70px 18px 1fr 16px; align-items: center; }
code { font: 12px ui-monospace, monospace; }
.raw { color: #e43f3f; text-decoration: line-through; text-decoration-color: transparent; transition: color 300ms, text-decoration-color 300ms; }
.tk { color: #246078; }
.ck { color: #1f9d6b; font-weight: 700; }
.arr, .tk, .ck { opacity: 0; transform: translateX(-4px); transition: opacity 300ms cubic-bezier(0.22, 1, 0.36, 1), transform 300ms cubic-bezier(0.22, 1, 0.36, 1); }
.row.fixed .raw { color: #7f8b91; text-decoration-color: currentColor; }
.row.fixed .arr, .row.fixed .tk, .row.fixed .ck { opacity: 1; transform: none; }
.cov { display: flex; justify-content: space-between; align-items: baseline; margin-top: 4px; color: #55595f; }
.cov b { font-size: 18px; color: #173f50; }
.bar { height: 6px; border-radius: 3px; background: #e6edf0; overflow: hidden; }
.bar i { display: block; height: 100%; background: #fc5454; transform-origin: left; transform: scaleX(0.62); transition: transform 450ms cubic-bezier(0.22, 1, 0.36, 1); }
.run { height: 36px; padding: 0 16px; border: 0; border-radius: 8px; background: #173f50; color: #fff; cursor: pointer; }
@media (prefers-reduced-motion: reduce) { .arr, .tk, .ck, .bar i { transform: none; transition: opacity 150ms; } }`,
    js:`const rows = [...document.querySelectorAll('.row')];
const pct = document.getElementById('pct');
const fill = document.getElementById('fill');
let timers = [];

function setCoverage(v) { pct.textContent = v + '%'; fill.style.transform = 'scaleX(' + v / 100 + ')'; }

function run() {
  timers.forEach(clearTimeout); timers = [];
  rows.forEach(r => r.classList.remove('fixed'));
  setCoverage(62);
  // 每 400ms 修正一列，覆蓋率跟著上升
  rows.forEach((r, i) => timers.push(setTimeout(() => {
    r.classList.add('fixed');
    setCoverage(62 + (i + 1) * 9);
  }, 400 + i * 400)));
}

document.querySelector('.run').addEventListener('click', run);`,
    params:[
      ['每列間隔','400ms','一列一列修正，看得出順序'],
      ['單列動畫','300ms','箭頭、token、勾勾淡入並右移 4px'],
      ['進度條','scaleX，450ms','用 transform 縮放，不動 width'],
      ['刪除線','text-decoration-color 300ms','寫死的值變灰並劃掉'],
      ['緩動','cubic-bezier(0.22, 1, 0.36, 1)','ease-out'],
      ['減少動態','只保留淡入','尊重 prefers-reduced-motion']
    ]
  },

  'handoff-spec': {
    height:340,
    html:`<div class="spec">
  <div class="comp"><div class="avatar"></div><div class="text"><i></i><i class="s"></i></div><div class="btn">追蹤</div></div>
  <div class="rl h" style="left:41px;top:86px;width:16px;--i:0"><span>16</span></div>
  <div class="rl h" style="left:97px;top:86px;width:12px;--i:1"><span class="below">12</span></div>
  <div class="rl v" style="left:24px;top:50px;height:72px;--i:2"><span>72</span></div>
  <div class="tag" style="left:40px;top:14px;--i:3">radius 12 · --r-md</div>
  <div class="tag" style="right:0;bottom:8px;--i:4">button / primary / hover</div>
</div>
<button class="toggle">顯示標註</button>`,
    css:`body { flex-direction: column; gap: 16px; }
.spec { position: relative; width: 280px; height: 170px; }
.comp {
  position: absolute; left: 40px; top: 50px; width: 220px; height: 72px; padding: 16px;
  display: flex; align-items: center; gap: 12px; box-sizing: border-box;
  background: #fff; border: 1px solid #e3e6ea; border-radius: 12px;
}
.avatar { width: 40px; height: 40px; flex: none; border-radius: 50%; background: linear-gradient(135deg, #a8c8d4, #246078); }
.text { flex: 1; display: grid; gap: 6px; }
.text i { height: 7px; border-radius: 4px; background: #e6edf0; } .text i.s { width: 60%; }
.btn { height: 26px; padding: 0 10px; border-radius: 999px; background: #fc5454; color: #fff; font: 11px/26px system-ui, sans-serif; }
.rl, .tag {
  position: absolute; opacity: 0;
  transition: opacity 250ms cubic-bezier(0.22, 1, 0.36, 1), transform 350ms cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--i) * 200ms);      /* 依序出現 */
}
.rl.h { border-top: 1px solid #fc5454; transform: scaleX(0); transform-origin: left; }
.rl.v { border-left: 1px solid #fc5454; transform: scaleY(0); transform-origin: top; }
.rl span { position: absolute; padding: 2px 4px; border-radius: 3px; background: #fc5454; color: #fff; font: 600 10px/1 ui-monospace, monospace; white-space: nowrap; }
.rl.h span { left: 50%; top: -20px; transform: translateX(-50%); }
.rl.h span.below { top: 6px; }
.rl.v span { left: -12px; top: 50%; transform: translate(-50%, -50%); }
.tag { padding: 4px 6px; border: 1px dashed #fc5454; border-radius: 4px; background: #fff; font: 10px/1 ui-monospace, monospace; color: #55595f; transform: translateY(4px); white-space: nowrap; }
.spec.on .rl, .spec.on .tag { opacity: 1; transform: none; }
.spec:not(.on) .rl, .spec:not(.on) .tag { transition-delay: 0ms; }
.toggle { height: 36px; padding: 0 16px; border: 0; border-radius: 8px; background: #173f50; color: #fff; cursor: pointer; }
@media (prefers-reduced-motion: reduce) { .rl, .tag { transform: none !important; transition-delay: 0ms; } }`,
    js:`const spec = document.querySelector('.spec');
const btn = document.querySelector('.toggle');

btn.addEventListener('click', () => {
  const on = spec.classList.toggle('on');
  btn.textContent = on ? '隱藏標註' : '顯示標註';
});`,
    params:[
      ['標註線','scaleX／scaleY，350ms','從起點畫出去，不動 width／height'],
      ['間隔','200ms','依序出現：內距 → 間距 → 高度 → 標籤'],
      ['標籤','opacity + translateY(4px)','短距離淡入'],
      ['收起','不延遲','隱藏時一次消失，不拖時間'],
      ['緩動','cubic-bezier(0.22, 1, 0.36, 1)','ease-out'],
      ['減少動態','只保留淡入','尊重 prefers-reduced-motion']
    ]
  },

  'layout-dials': {
    height:360,
    html:`<div class="wrap">
  <div class="dials">
    <label>VARIANCE <output>8</output><input type="range" min="1" max="10" value="8" data-k="variance"></label>
    <label>MOTION <output>6</output><input type="range" min="1" max="10" value="6" data-k="motion"></label>
    <label>DENSITY <output>4</output><input type="range" min="1" max="10" value="4" data-k="density"></label>
  </div>
  <div class="preview"><i></i><i></i><i></i><i></i><i></i><i></i></div>
</div>`,
    css:`.wrap { width: 460px; display: grid; grid-template-columns: 170px 1fr; gap: 24px; align-items: center; }
.dials { display: grid; gap: 16px; }
label { display: grid; grid-template-columns: 1fr auto; gap: 4px; font: 11px ui-monospace, monospace; color: #55595f; }
label input { grid-column: 1 / -1; accent-color: #fc5454; }
output { color: #173f50; font-weight: 600; }
.preview { display: grid; grid-template-columns: repeat(var(--cols, 2), 1fr); grid-auto-rows: 52px; gap: 10px; padding: 12px; border-radius: 12px; background: #fff; border: 1px solid #e3e6ea; }
.preview i { border-radius: 6px; background: #a8c8d4; transition: background-color 300ms; }
.preview i:first-child { background: #173f50; }
.preview.hi i:first-child { grid-column: span 2; grid-row: span 2; background: #fc5454; }
@media (prefers-reduced-motion: reduce) { .preview i { transition: none; } }`,
    js:`const preview = document.querySelector('.preview');
const tiles = [...preview.children];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const val = k => +document.querySelector('[data-k="' + k + '"]').value;

// FLIP：先記下舊位置，改版面後再從舊位置動畫到新位置
function update() {
  document.querySelectorAll('label').forEach(l => { l.querySelector('output').textContent = l.querySelector('input').value; });
  const before = tiles.map(t => t.getBoundingClientRect());
  const v = val('variance'), d = val('density'), ms = val('motion') * 60;
  preview.classList.toggle('hi', v > 6);                 // 變化度高：打破對稱
  preview.style.setProperty('--cols', d > 6 ? 3 : 2);   // 密度高：欄數變多
  preview.style.gap = (14 - d) + 'px';                  // 密度高：間距變小
  if (reduce) return;
  tiles.forEach((t, i) => {
    const a = before[i], b = t.getBoundingClientRect();
    t.animate([
      { transform: 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px) scale(' + a.width / b.width + ',' + a.height / b.height + ')', transformOrigin: 'top left' },
      { transform: 'none', transformOrigin: 'top left' }
    ], { duration: ms, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
  });
}

document.querySelectorAll('input').forEach(i => i.addEventListener('input', update));
update();`,
    params:[
      ['VARIANCE','1–10，> 6 打破對稱','第一格放大成 2×2，改用強調色'],
      ['MOTION','1–10 × 60ms','控制版面轉換的時長（60–600ms）'],
      ['DENSITY','1–10','> 6 變三欄，間距 = 14 − 密度'],
      ['版面轉換','FLIP','記下舊位置，用 transform 動畫到新位置'],
      ['動畫屬性','transform','不直接動畫 grid 或寬高'],
      ['減少動態','直接換版面','尊重 prefers-reduced-motion']
    ]
  },

  'soft-depth': {
    height:320,
    html:`<div class="bezel" tabindex="0">
  <div class="core">
    <div class="line w70"></div>
    <div class="line w90"></div>
    <button class="pill">開始使用<span class="ico">→</span></button>
  </div>
</div>
<p class="hint">滑鼠移上卡片，或按 Tab 聚焦</p>`,
    css:`:root { --ease-fluid: cubic-bezier(0.32, 0.72, 0, 1); }
body { flex-direction: column; gap: 20px; }
/* 雙層外框：外層半透明框 + 內層實心卡片 */
.bezel {
  padding: 6px; border-radius: 26px; outline: none;
  background: rgba(23, 63, 80, 0.06); border: 1px solid rgba(23, 63, 80, 0.08);
  transition: transform 700ms var(--ease-fluid), box-shadow 700ms var(--ease-fluid);
}
.core { width: 220px; padding: 24px 16px 16px; border-radius: 20px; background: #fff; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 1px 2px rgba(23, 63, 80, 0.06); }
.line { height: 10px; border-radius: 5px; background: #e6edf0; margin-bottom: 8px; }
.w70 { width: 70%; } .w90 { width: 90%; height: 8px; margin-bottom: 16px; }
.pill { display: inline-flex; align-items: center; gap: 8px; height: 38px; padding: 0 4px 0 16px; border: 0; border-radius: 999px; background: #173f50; color: #fff; font: 500 13px system-ui, sans-serif; cursor: pointer; transition: transform 160ms cubic-bezier(0.22, 1, 0.36, 1); }
.pill:active { transform: scale(0.97); }
.ico { width: 30px; height: 30px; border-radius: 50%; background: rgba(255, 255, 255, 0.14); display: grid; place-items: center; transition: transform 700ms var(--ease-fluid); }
.bezel:focus-visible, .bezel:focus-within { transform: translateY(-6px) scale(1.02); box-shadow: 0 24px 40px -20px rgba(23, 63, 80, 0.4); }
.bezel:focus-within .ico { transform: translateX(3px) scale(1.06); }
@media (hover: hover) and (pointer: fine) {
  .bezel:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 24px 40px -20px rgba(23, 63, 80, 0.4); }
  .bezel:hover .ico { transform: translateX(3px) scale(1.06); }
}
.hint { margin: 0; font: 12px system-ui, sans-serif; color: #7f8b91; }
@media (prefers-reduced-motion: reduce) { .bezel, .ico { transition: box-shadow 200ms; transform: none !important; } }`,
    js:`// 純 CSS 效果，不需要 JavaScript。
// hover 只在有滑鼠的裝置觸發；鍵盤聚焦用 :focus-within 達到同樣效果。`,
    params:[
      ['外框','padding 6px + 半透明底','雙層外框取代單層陰影'],
      ['浮起','translateY(-6px) scale(1.02)','距離小，質感來自陰影變化'],
      ['時長','700ms','慢一點，像有重量的物體'],
      ['緩動','cubic-bezier(0.32, 0.72, 0, 1)','流體曲線，收尾很柔'],
      ['箭頭','translateX(3px) scale(1.06)','按鈕內的圓圈跟著往右推'],
      ['hover 限制','(hover: hover) and (pointer: fine)','手機不會誤觸 hover'],
      ['減少動態','只保留陰影變化','尊重 prefers-reduced-motion']
    ]
  },

  'warm-minimal': {
    height:340,
    html:`<div class="bento">
  <div class="t t1" style="--i:0"><em>Less,</em><br>but better.</div>
  <div class="t t2" style="--i:1"></div>
  <div class="t t3" style="--i:2">01 / 04</div>
</div>
<button class="replay">重播</button>`,
    css:`body { flex-direction: column; gap: 16px; }
.bento {
  width: 340px; height: 200px; padding: 8px; box-sizing: border-box;
  display: grid; grid-template-columns: 1.4fr 1fr; grid-template-rows: 1fr 1fr; gap: 8px;
  background: #f7f5ee; border: 1px solid #e6e2d8; border-radius: 12px;
}
.t {
  border-radius: 8px; border: 1px solid #e6e2d8; background: #fbfaf6; color: #2a2a2a;
  opacity: 0; transform: translateY(8px);
  transition: opacity 500ms cubic-bezier(0.22, 1, 0.36, 1), transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--i) * 140ms);
}
.bento.in .t { opacity: 1; transform: none; }
.bento:not(.in) .t { transition: none; }
.t1 { grid-row: span 2; padding: 14px; display: flex; flex-direction: column; justify-content: flex-end; font: 22px/1.25 Georgia, "Times New Roman", serif; }
.t1 em { color: #8a7f6e; }
.t2 { background: #f2ddd6; }
.t3 { display: flex; align-items: flex-end; justify-content: flex-end; padding: 8px; background: #dbe7ea; font: 10px ui-monospace, monospace; color: #8a7f6e; }
.replay { height: 32px; padding: 0 12px; border: 1px solid #d8d3c7; border-radius: 8px; background: #fbfaf6; color: #2a2a2a; cursor: pointer; }
@media (prefers-reduced-motion: reduce) { .t { transform: none; transition-delay: 0ms; } }`,
    js:`const bento = document.querySelector('.bento');

function play() {
  bento.classList.remove('in');
  requestAnimationFrame(() => requestAnimationFrame(() => bento.classList.add('in')));
}

document.querySelector('.replay').addEventListener('click', play);
play();`,
    params:[
      ['單格時長','500ms','比一般 UI 慢，配合安靜的風格'],
      ['間隔','140ms','三格依序出現'],
      ['位移','translateY(8px)','幾乎察覺不到，只是暗示'],
      ['配色','#f7f5ee 暖白 + 低飽和粉彩','沒有漸層，也沒有重陰影'],
      ['字體','Georgia 襯線','用字體對比製造層級'],
      ['減少動態','只保留淡入','尊重 prefers-reduced-motion']
    ]
  },

  'brutal-grid': {
    height:320,
    html:`<div class="term">
  <div class="head"><span>FILE_047</span><span class="stamp">CLASSIFIED</span></div>
  <div class="num">047</div>
  <div class="line"><span id="out"></span><i>█</i></div>
</div>
<button class="next">下一行</button>`,
    css:`body { flex-direction: column; gap: 16px; }
.term {
  position: relative; width: 320px; height: 200px; padding: 14px; box-sizing: border-box; overflow: hidden;
  display: flex; flex-direction: column; border-radius: 4px;
  background: #0b0b0b; color: #e8e8e2; font-family: ui-monospace, monospace;
}
/* 掃描線質感 */
.term::after { content: ""; position: absolute; inset: 0; pointer-events: none; background: repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.04) 0 1px, transparent 1px 3px); }
.head { display: flex; justify-content: space-between; padding-bottom: 6px; border-bottom: 1px solid #333; font-size: 10px; letter-spacing: 0.1em; }
.stamp { padding: 0 4px; background: #e8e8e2; color: #0b0b0b; }
.num { margin-top: auto; font: 700 84px/1 system-ui, sans-serif; letter-spacing: -0.04em; }
.line { height: 16px; margin-top: 6px; font-size: 12px; letter-spacing: 0.06em; color: #fc5454; }
.line i { font-style: normal; animation: blink 1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }
.next { height: 32px; padding: 0 12px; border: 2px solid #0b0b0b; border-radius: 0; background: #fff; font: 600 12px ui-monospace, monospace; letter-spacing: 0.06em; cursor: pointer; }
@media (prefers-reduced-motion: reduce) { .line i { animation: none; } }`,
    js:`const out = document.getElementById('out');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lines = ['STATUS: DECLASSIFIED', 'GRID: 12COL / RIGID', 'TYPE: SWISS × TERMINAL'];
let k = 0, timer = 0;

// 逐字打出，每字 45ms
function type() {
  clearInterval(timer);
  const text = lines[k++ % lines.length];
  if (reduce) { out.textContent = text; return; }
  let i = 0; out.textContent = '';
  timer = setInterval(() => {
    out.textContent = text.slice(0, ++i);
    if (i >= text.length) clearInterval(timer);
  }, 45);
}

document.querySelector('.next').addEventListener('click', type);
type();`,
    params:[
      ['打字速度','45ms／字','約 20 字在 1 秒內打完'],
      ['游標','steps(1)，1s 閃爍','用階梯動畫，不做淡入淡出'],
      ['掃描線','repeating-linear-gradient 3px','靜態質感，不耗效能'],
      ['字級對比','84px 對 10–12px','極端的大小差製造張力'],
      ['配色','#0b0b0b 黑底 + 珊瑚紅','功能性配色，少量警示色'],
      ['減少動態','直接顯示整行、游標不閃','尊重 prefers-reduced-motion']
    ]
  },

  'scroll-story': {
    height:360,
    html:`<div class="stack">
  <div class="card"><b>01</b>Attention</div>
  <div class="card"><b>02</b>Interest</div>
  <div class="card"><b>03</b>Desire</div>
  <div class="card"><b>04</b>Action</div>
</div>
<button class="next">下一段</button>`,
    css:`body { flex-direction: column; gap: 24px; }
.stack { position: relative; width: 240px; height: 150px; margin-top: 30px; }
.card {
  position: absolute; inset: 0; padding: 16px; border-radius: 12px; box-sizing: border-box;
  display: flex; flex-direction: column; justify-content: space-between;
  color: #fff; font: 600 18px system-ui, sans-serif;
  box-shadow: 0 -8px 24px -12px rgba(0, 0, 0, 0.35);
  opacity: 0; transform: translateY(130%);
  transition: transform 650ms cubic-bezier(0.22, 1, 0.36, 1), opacity 650ms cubic-bezier(0.22, 1, 0.36, 1);
}
.card b { font: 500 11px ui-monospace, monospace; opacity: 0.7; }
.card:nth-child(1) { background: #173f50; } .card:nth-child(2) { background: #246078; }
.card:nth-child(3) { background: #fc5454; } .card:nth-child(4) { background: #0f2c38; }
.next { height: 36px; padding: 0 16px; border: 0; border-radius: 8px; background: #173f50; color: #fff; cursor: pointer; }
@media (prefers-reduced-motion: reduce) { .card { transition: opacity 200ms; } }`,
    js:`const cards = [...document.querySelectorAll('.card')];
const btn = document.querySelector('.next');
let shown = 0;

// 已出現的卡片往後縮小、往上推，最新一張在最前面
function layout() {
  cards.forEach((c, i) => {
    const depth = shown - 1 - i;
    if (depth < 0) { c.style.transform = 'translateY(130%)'; c.style.opacity = 0; return; }
    c.style.transform = 'translateY(' + (-depth * 10) + 'px) scale(' + (1 - depth * 0.05) + ')';
    c.style.opacity = 1;
  });
  btn.textContent = shown === cards.length ? '重來' : '下一段';
}

btn.addEventListener('click', () => { shown = shown === cards.length ? 1 : shown + 1; layout(); });
shown = 1; layout();`,
    params:[
      ['結構','AIDA 四段','注意 → 興趣 → 渴望 → 行動'],
      ['進場','translateY(130%) → 0','從下方推上來，像捲動時的釘選'],
      ['堆疊','每層 −10px、scale −0.05','舊卡片往後退，最新一張在最前面'],
      ['時長','650ms','區塊大，比一般 UI 慢一點'],
      ['緩動','cubic-bezier(0.22, 1, 0.36, 1)','ease-out'],
      ['減少動態','只保留淡入','尊重 prefers-reduced-motion']
    ]
  },

  'design-md': {
    height:360,
    html:`<div class="md">
  <div class="l h"># DESIGN.md</div>
  <div class="l k">## Color</div>
  <div class="l sw"><i style="background:#173f50"></i><i style="background:#fc5454"></i><i style="background:#246078"></i><i style="background:#a8c8d4"></i></div>
  <div class="l k">## Typography</div>
  <div class="l">Display · Poppins 600</div>
  <div class="l k">## Motion</div>
  <div class="l">ease-out · 200ms</div>
</div>
<button class="replay">重播</button>`,
    css:`body { flex-direction: column; gap: 16px; }
.md { width: 280px; padding: 14px 18px; border: 1px solid #e3e6ea; border-radius: 12px; background: #fff; font: 12px/1.8 ui-monospace, monospace; color: #55595f; }
.l {
  opacity: 0; transform: translateX(-6px);
  transition: opacity 260ms cubic-bezier(0.22, 1, 0.36, 1), transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--i) * 140ms);
}
.md.in .l { opacity: 1; transform: none; }
.md:not(.in) .l { transition: none; }
.h { font-size: 14px; font-weight: 600; color: #173f50; }
.k { color: #fc5454; }
.sw { display: flex; gap: 6px; padding: 4px 0; }
.sw i { width: 24px; height: 14px; border-radius: 4px; }
.replay { height: 32px; padding: 0 12px; border: 1px solid #cfd6db; border-radius: 8px; background: #fff; cursor: pointer; }
@media (prefers-reduced-motion: reduce) { .l { transform: none; transition-delay: 0ms; } }`,
    js:`const md = document.querySelector('.md');
md.querySelectorAll('.l').forEach((l, i) => l.style.setProperty('--i', i));

function play() {
  md.classList.remove('in');
  requestAnimationFrame(() => requestAnimationFrame(() => md.classList.add('in')));
}

document.querySelector('.replay').addEventListener('click', play);
play();`,
    params:[
      ['單行時長','260ms','每一行淡入並右移 6px'],
      ['間隔','140ms','模擬一段一段寫出來'],
      ['結構','Color → Typography → Motion','DESIGN.md 的固定段落順序'],
      ['緩動','cubic-bezier(0.22, 1, 0.36, 1)','ease-out'],
      ['動畫屬性','transform、opacity','不會觸發重排'],
      ['減少動態','只保留淡入、不延遲','尊重 prefers-reduced-motion']
    ]
  },

  'section-mockups': {
    height:380,
    html:`<div class="page">
  <div class="sec hero" style="--i:0"><span>Hero</span></div>
  <div class="sec" style="--i:1"><span>Features</span></div>
  <div class="sec" style="--i:2"><span>Proof</span></div>
  <div class="sec" style="--i:3"><span>CTA</span></div>
</div>
<button class="run">生成設計圖</button>`,
    css:`body { flex-direction: column; gap: 16px; }
.page { width: 240px; padding: 8px; display: grid; gap: 6px; border: 1px solid #e3e6ea; border-radius: 12px; background: #fff; }
.sec { position: relative; height: 40px; overflow: hidden; border: 1px dashed #e3e6ea; border-radius: 6px; }
.sec.hero { height: 72px; }
/* 「生成」的色塊：用 scaleX 從左往右擦入 */
.sec::after {
  content: ""; position: absolute; inset: 0; transform: scaleX(0); transform-origin: left;
  transition: transform 520ms cubic-bezier(0.77, 0, 0.175, 1);
  transition-delay: calc(var(--i) * 450ms);
}
.sec:nth-child(1)::after { background: linear-gradient(120deg, #173f50, #246078); }
.sec:nth-child(2)::after { background: linear-gradient(120deg, #a8c8d4, #dfeaee); }
.sec:nth-child(3)::after { background: linear-gradient(120deg, #fc5454, #ff9a7a); }
.sec:nth-child(4)::after { background: linear-gradient(120deg, #246078, #a8c8d4); }
.sec span { position: absolute; left: 8px; top: 50%; z-index: 1; transform: translateY(-50%); font: 11px ui-monospace, monospace; color: #7f8b91; transition: color 300ms; transition-delay: calc(var(--i) * 450ms + 300ms); }
.page.done .sec::after { transform: scaleX(1); }
.page.done .sec span { color: #fff; }
.page:not(.done) .sec::after, .page:not(.done) .sec span { transition: none; }
.run { height: 36px; padding: 0 16px; border: 0; border-radius: 8px; background: #173f50; color: #fff; cursor: pointer; }
@media (prefers-reduced-motion: reduce) { .sec::after { transition: opacity 200ms; transform: none; opacity: 0; } .page.done .sec::after { opacity: 1; } }`,
    js:`const page = document.querySelector('.page');

// 每個區段各自「生成」一張圖，依序完成
function run() {
  page.classList.remove('done');
  requestAnimationFrame(() => requestAnimationFrame(() => page.classList.add('done')));
}

document.querySelector('.run').addEventListener('click', run);
run();`,
    params:[
      ['規則','一個區段一張圖','8 個區段就是 8 張，不壓成一張'],
      ['擦入','scaleX(0 → 1)，520ms','用 transform，不動 clip-path 或寬度'],
      ['間隔','450ms','一段完成才換下一段'],
      ['緩動','cubic-bezier(0.77, 0, 0.175, 1)','ease-in-out，適合畫面內的位移'],
      ['文字','300ms 後轉白','色塊蓋上後才換字色'],
      ['減少動態','改成淡入','尊重 prefers-reduced-motion']
    ]
  },

  'app-screens': {
    height:400,
    html:`<div class="phones">
  <div class="mp" data-pos="0"><div class="hero"></div><i></i><i class="s"></i><div class="row"><b></b><b></b></div></div>
  <div class="mp" data-pos="1"><div class="hero"></div><i></i><i class="s"></i><div class="row"><b></b><b></b></div></div>
  <div class="mp" data-pos="2"><div class="hero"></div><i></i><i class="s"></i><div class="row"><b></b><b></b></div></div>
</div>
<div class="nav"><button data-d="-1" aria-label="上一張">‹</button><button data-d="1" aria-label="下一張">›</button></div>`,
    css:`body { flex-direction: column; gap: 20px; }
.phones { position: relative; width: 320px; height: 240px; }
.mp {
  position: absolute; left: 50%; top: 50%; width: 110px; height: 220px; margin: -110px 0 0 -55px;
  padding: 8px; box-sizing: border-box; display: flex; flex-direction: column; gap: 6px;
  border: 5px solid #173f50; border-radius: 22px; background: #fff; cursor: pointer;
  transition: transform 650ms cubic-bezier(0.22, 1, 0.36, 1), opacity 650ms cubic-bezier(0.22, 1, 0.36, 1);
}
.mp[data-pos="0"] { transform: none; z-index: 3; }
.mp[data-pos="1"] { transform: translateX(95px) scale(0.82) rotate(6deg); opacity: 0.75; z-index: 1; }
.mp[data-pos="2"] { transform: translateX(-95px) scale(0.82) rotate(-6deg); opacity: 0.75; z-index: 2; }
.hero { height: 78px; border-radius: 10px; background: linear-gradient(150deg, #fc5454, #ffa38a); }
.mp:nth-child(2) .hero { background: linear-gradient(150deg, #246078, #a8c8d4); }
.mp:nth-child(3) .hero { background: linear-gradient(150deg, #173f50, #246078); }
.mp i { height: 7px; border-radius: 4px; background: #e6edf0; } .mp i.s { width: 60%; }
.row { display: flex; gap: 5px; margin-top: auto; } .row b { flex: 1; height: 38px; border-radius: 8px; background: #e6edf0; }
.nav { display: flex; gap: 8px; }
.nav button { width: 40px; height: 36px; border: 1px solid #cfd6db; border-radius: 8px; background: #fff; font-size: 18px; cursor: pointer; transition: transform 160ms cubic-bezier(0.22, 1, 0.36, 1); }
.nav button:active { transform: scale(0.95); }
@media (prefers-reduced-motion: reduce) { .mp { transition: opacity 200ms; } }`,
    js:`const phones = [...document.querySelectorAll('.mp')];
let k = 0;

// pos 0 在中間，1 在右後方，2 在左後方
function layout() {
  phones.forEach((p, i) => { p.dataset.pos = ((i - k) % 3 + 3) % 3; });
}

document.querySelectorAll('.nav button').forEach(b => b.addEventListener('click', () => { k += +b.dataset.d; layout(); }));
// 點旁邊的手機，直接轉到前面
phones.forEach((p, i) => p.addEventListener('click', () => { k = i; layout(); }));
layout();`,
    params:[
      ['時長','650ms','物件較大，轉位需要多一點時間'],
      ['後方畫面','scale(0.82) + rotate(±6deg)','縮小並微傾，拉出前後景深'],
      ['透明度','0.75','後方畫面稍淡，焦點留在中間'],
      ['動畫屬性','transform、opacity','位置、縮放、旋轉都用 transform'],
      ['一致性','同一套配色與元件','多張畫面保持同樣的設計語言'],
      ['減少動態','只保留淡入淡出','尊重 prefers-reduced-motion']
    ]
  }

});
