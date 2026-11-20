/* 動畫程式碼 batch A */
Object.assign(window.SNIPPETS, {
  'ui-animation-vocabulary': {
    height:320,
    html:`<div class="vocab">
  <div class="box" id="box"></div>
  <div class="terms">
    <button data-anim="pop-in">Pop in</button>
    <button data-anim="shake">Shake</button>
    <button data-anim="pulse">Pulse</button>
    <button data-anim="flip">Flip</button>
    <button data-anim="squash">Squash &amp; stretch</button>
  </div>
</div>`,
    css:`.vocab { display: flex; flex-direction: column; align-items: center; gap: 24px; }
.box { width: 72px; height: 72px; border-radius: 16px; background: #fc5454; }
.terms { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; max-width: 360px; }
.terms button {
  height: 32px; padding: 0 12px; border: 1px solid #e3e6ea; border-radius: 999px;
  background: #fff; color: #173f50; font: 13px system-ui, sans-serif; cursor: pointer;
}
.terms button.on { background: #173f50; border-color: #173f50; color: #fff; }

/* 每個名詞對應一組 keyframes */
.pop-in { animation: pop-in 420ms cubic-bezier(0.22, 1, 0.36, 1); }
.shake  { animation: shake 420ms ease; }
.pulse  { animation: pulse 600ms ease-in-out; }
.flip   { animation: flip 500ms cubic-bezier(0.77, 0, 0.175, 1); }
.squash { animation: squash 520ms ease; }
@keyframes pop-in { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); } }
@keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-10px); } 40% { transform: translateX(9px); } 60% { transform: translateX(-6px); } 80% { transform: translateX(3px); } }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }
@keyframes flip { from { transform: perspective(400px) rotateY(0); } to { transform: perspective(400px) rotateY(180deg); } }
@keyframes squash { 0%, 100% { transform: scale(1, 1); } 30% { transform: scale(1.25, 0.75); } 60% { transform: scale(0.9, 1.12); } }

@media (prefers-reduced-motion: reduce) {
  .box { animation: none !important; }
}`,
    js:`const box = document.getElementById('box');
const buttons = document.querySelectorAll('.terms button');

buttons.forEach(btn => btn.addEventListener('click', () => {
  buttons.forEach(b => b.classList.toggle('on', b === btn));
  box.className = 'box';
  void box.offsetWidth;            // 強制重排，讓同一個動畫可以重播
  box.classList.add(btn.dataset.anim);
}));`,
    params:[
      ['Pop in','420ms，scale 0.6 → 1.08 → 1','進場時稍微超過再回來，有彈性'],
      ['Shake','420ms，±10px 遞減','表示錯誤或被拒絕'],
      ['Pulse','600ms，scale 1 → 1.12 → 1','吸引注意，不改變位置'],
      ['Flip','500ms，rotateY 0 → 180°','翻面切換正反內容'],
      ['Squash & stretch','520ms，scale(1.25, 0.75)','壓扁再拉長，讓物體有重量感'],
      ['重播技巧','移除 class → 讀 offsetWidth → 加回','強制瀏覽器重新開始動畫']
    ]
  },

  'ui-apple-design': {
    height:380,
    html:`<div class="area" id="area">
  <div class="puck" id="puck"></div>
</div>
<p class="tip">拖曳方塊到虛線框外，越拉越重；放手會彈回。</p>`,
    css:`body { flex-direction: column; gap: 16px; }
.area {
  position: relative; width: 320px; height: 240px;
  border: 1.5px dashed #a8c8d4; border-radius: 16px;
}
.puck {
  position: absolute; left: 50%; top: 50%; width: 64px; height: 64px; margin: -32px 0 0 -32px;
  border-radius: 18px; background: linear-gradient(140deg, #246078, #173f50);
  box-shadow: 0 10px 24px -8px rgba(23, 63, 80, 0.6);
  cursor: grab; touch-action: none; will-change: transform;
}
.puck:active { cursor: grabbing; }
.tip { margin: 0; font-size: 13px; color: #55595f; }`,
    js:`const area = document.getElementById('area');
const puck = document.getElementById('puck');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let x = 0, y = 0, sx = 0, sy = 0, ox = 0, oy = 0, raf = 0;

const render = () => { puck.style.transform = 'translate(' + x + 'px,' + y + 'px)'; };
const limits = () => [area.clientWidth / 2 - 32, area.clientHeight / 2 - 32];

// 超出邊界的部分越拉越短（rubber-banding）
function band(d, lim) {
  const over = Math.abs(d) - lim;
  if (over <= 0) return d;
  return Math.sign(d) * (lim + (1 - 1 / (over * 0.55 / lim + 1)) * lim);
}

// 兩軸各自用彈簧回到框內
function springBack() {
  const [lx, ly] = limits();
  const tx = Math.max(-lx, Math.min(lx, x)), ty = Math.max(-ly, Math.min(ly, y));
  if (reduce) { x = tx; y = ty; return render(); }
  let vx = 0, vy = 0, last = performance.now();
  const step = t => {
    const dt = Math.min(0.032, (t - last) / 1000); last = t;
    vx += (-220 * (x - tx) - 22 * vx) * dt; x += vx * dt;
    vy += (-220 * (y - ty) - 22 * vy) * dt; y += vy * dt;
    render();
    if (Math.abs(vx) + Math.abs(vy) > 1 || Math.abs(x - tx) + Math.abs(y - ty) > 0.5) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
}

puck.addEventListener('pointerdown', e => {
  cancelAnimationFrame(raf);                       // 動畫中也能直接抓住
  puck.setPointerCapture(e.pointerId);
  sx = e.clientX; sy = e.clientY; ox = x; oy = y;
});
puck.addEventListener('pointermove', e => {
  if (!puck.hasPointerCapture(e.pointerId)) return;
  const [lx, ly] = limits();
  x = band(ox + e.clientX - sx, lx);
  y = band(oy + e.clientY - sy, ly);
  render();
});
puck.addEventListener('pointerup', springBack);`,
    params:[
      ['跟手','1:1','框內拖曳時完全跟著手指'],
      ['邊界阻尼','lim + (1 − 1 / (超出 × 0.55 / lim + 1)) × lim','越往外拉，移動越少'],
      ['回彈彈簧','stiffness 220、damping 22','沒有固定時長'],
      ['可打斷','是','彈回途中按下會立刻停住並接手'],
      ['動畫屬性','transform: translate()','不動 left / top'],
      ['減少動態','直接回到框內','尊重 prefers-reduced-motion']
    ]
  },

  'ui-emil-design-eng': {
    height:300,
    html:`<div class="race">
  <div class="lane"><span>ease-in</span><div class="track"><i class="runner"></i></div></div>
  <div class="lane good"><span>ease-out</span><div class="track"><i class="runner"></i></div></div>
  <button class="go">開跑 ▶</button>
</div>`,
    css:`.race { width: 340px; display: flex; flex-direction: column; gap: 12px; }
.lane { display: flex; align-items: center; gap: 12px; }
.lane span { width: 64px; font: 12px ui-monospace, monospace; color: #55595f; }
.track { position: relative; flex: 1; height: 32px; border: 1px solid #e3e6ea; border-radius: 8px; background: #fff; }
.runner { position: absolute; left: 4px; top: 4px; width: 22px; height: 22px; border-radius: 6px; background: #7f8b91; transition: transform 600ms; }
.lane:first-child .runner { transition-timing-function: cubic-bezier(0.55, 0, 1, 0.45); }      /* ease-in */
.lane.good .runner { background: #fc5454; transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1); } /* ease-out */
.race.out .runner { transform: translateX(var(--dist)); }
.go {
  align-self: center; height: 36px; padding: 0 16px; border: 0; border-radius: 8px;
  background: #173f50; color: #fff; font: 500 14px system-ui, sans-serif; cursor: pointer;
  transition: transform 160ms cubic-bezier(0.22, 1, 0.36, 1);
}
.go:active { transform: scale(0.97); }

@media (prefers-reduced-motion: reduce) {
  .runner { transition-duration: 1ms; }
}`,
    js:`const race = document.querySelector('.race');
const track = race.querySelector('.track');

document.querySelector('.go').addEventListener('click', () => {
  race.style.setProperty('--dist', (track.clientWidth - 30) + 'px');
  race.classList.toggle('out');      // 兩條跑道同樣 600ms，只差在曲線
});`,
    params:[
      ['時長','600ms（兩條相同）','為了看清差異刻意放慢；實際 UI 應控制在 300ms 內'],
      ['ease-in','cubic-bezier(0.55, 0, 1, 0.45)','起步慢，延遲使用者最注意的那一刻'],
      ['ease-out','cubic-bezier(0.22, 1, 0.36, 1)','一開始就動，感覺比較快'],
      ['按鈕回饋','scale(0.97)、160ms','按下的瞬間就有反應'],
      ['動畫屬性','transform','用 translateX，不動 left'],
      ['減少動態','時長 1ms','尊重 prefers-reduced-motion']
    ]
  },

  'ui-prototype': {
    height:300,
    html:`<div class="proto">
  <div class="variant" id="variant"></div>
  <div class="picker" role="tablist">
    <span class="pill"></span>
    <button role="tab">A 圓潤</button>
    <button role="tab">B 硬派</button>
    <button role="tab">C 卡片</button>
  </div>
</div>`,
    css:`.proto { display: flex; flex-direction: column; align-items: center; gap: 24px; }
.variant { height: 88px; display: grid; place-items: center; }
.variant > * { animation: v-in 220ms cubic-bezier(0.22, 1, 0.36, 1); }
@keyframes v-in { from { opacity: 0; transform: scale(0.96); filter: blur(3px); } to { opacity: 1; transform: none; filter: none; } }

.picker { position: relative; display: flex; gap: 2px; padding: 3px; border: 1px solid #e3e6ea; border-radius: 10px; background: #fff; }
.picker button { position: relative; z-index: 1; height: 28px; padding: 0 12px; border: 0; border-radius: 7px; background: none; font: 12px ui-monospace, monospace; color: #173f50; cursor: pointer; transition: color 200ms; }
.picker button.on { color: #fff; }
.pill { position: absolute; top: 3px; bottom: 3px; left: 3px; border-radius: 7px; background: #173f50; transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1), width 260ms cubic-bezier(0.22, 1, 0.36, 1); }

.v-a { height: 44px; padding: 0 24px; border: 0; border-radius: 999px; background: #fc5454; color: #fff; font: 700 15px system-ui, sans-serif; }
.v-b { height: 42px; padding: 0 20px; border: 2px solid #173f50; border-radius: 4px; background: none; color: #173f50; font: 500 12px ui-monospace, monospace; letter-spacing: 0.08em; text-transform: uppercase; }
.v-c { display: flex; align-items: center; gap: 12px; padding: 8px 16px 8px 8px; border: 1px solid #e3e6ea; border-radius: 12px; background: #fff; font: 14px system-ui, sans-serif; }
.v-c i { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #a8c8d4, #246078); }
.v-c small { display: block; font-size: 12px; color: #7f8b91; }

@media (prefers-reduced-motion: reduce) {
  .variant > * { animation: none; }
  .pill { transition: none; }
}`,
    js:`const variants = [
  '<button class="v-a">立即開始</button>',
  '<button class="v-b">Get started →</button>',
  '<div class="v-c"><i></i><div><b>立即開始</b><small>免費試用 14 天</small></div></div>'
];
const box = document.getElementById('variant');
const tabs = [...document.querySelectorAll('.picker button')];
const pill = document.querySelector('.pill');

function pick(i) {
  box.innerHTML = variants[i];                    // 新內容用模糊淡入銜接
  tabs.forEach((t, j) => { t.classList.toggle('on', i === j); t.setAttribute('aria-selected', i === j); });
  pill.style.width = tabs[i].offsetWidth + 'px';  // 滑塊跟著選項移動
  pill.style.transform = 'translateX(' + (tabs[i].offsetLeft - 3) + 'px)';
}

tabs.forEach((t, i) => t.addEventListener('click', () => pick(i)));
pick(0);`,
    params:[
      ['滑塊移動','260ms，ease-out','transform 移位，寬度同步調整'],
      ['內容切換','220ms，blur(3px) → 0','模糊遮住新舊內容的差異'],
      ['起始縮放','scale(0.96)','輕微放大進場，不從 0 開始'],
      ['變體軸線','個性：圓潤／硬派／卡片','每個版本要在明確的軸線上分歧'],
      ['無障礙','role="tablist"、aria-selected','鍵盤與螢幕報讀器可辨識'],
      ['減少動態','取消模糊與滑動','尊重 prefers-reduced-motion']
    ]
  },

  'ui-improve-animations': {
    height:320,
    html:`<div class="audit">
  <h4>動畫稽核報告 <span>19 findings</span></h4>
  <div class="row"><span>效能</span><div class="bar"><i style="--v:.72;background:#fc5454"></i></div><b>8</b></div>
  <div class="row"><span>緩動</span><div class="bar"><i style="--v:.5;background:#d08a1a"></i></div><b>5</b></div>
  <div class="row"><span>可及性</span><div class="bar"><i style="--v:.38;background:#246078"></i></div><b>4</b></div>
  <div class="row"><span>一致性</span><div class="bar"><i style="--v:.24;background:#a8c8d4"></i></div><b>2</b></div>
</div>
<button class="replay">重播</button>`,
    css:`body { flex-direction: column; gap: 16px; }
.audit { width: 320px; padding: 16px; border: 1px solid #e3e6ea; border-radius: 12px; background: #fff; display: grid; gap: 12px; font: 13px system-ui, sans-serif; }
.audit h4 { margin: 0; display: flex; justify-content: space-between; color: #173f50; }
.audit h4 span { font: 400 11px ui-monospace, monospace; color: #7f8b91; }
.row { display: grid; grid-template-columns: 56px 1fr 24px; gap: 8px; align-items: center; }
.row b { font: 400 12px ui-monospace, monospace; text-align: right; color: #55595f; }
.bar { height: 8px; border-radius: 4px; background: #e6edf0; overflow: hidden; }
.bar i {
  display: block; height: 100%; border-radius: 4px;
  transform-origin: left; transform: scaleX(0);   /* 用 scaleX 長出來，不動 width */
  transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--i) * 80ms);
}
.audit.run .bar i { transform: scaleX(var(--v)); }
.audit:not(.run) .bar i { transition: none; }
.replay { height: 32px; padding: 0 12px; border: 1px solid #cfd6db; border-radius: 8px; background: #fff; cursor: pointer; }

@media (prefers-reduced-motion: reduce) {
  .bar i { transition: none; }
}`,
    js:`const audit = document.querySelector('.audit');
audit.querySelectorAll('.bar i').forEach((bar, i) => bar.style.setProperty('--i', i));

function play() {
  audit.classList.remove('run');
  requestAnimationFrame(() => requestAnimationFrame(() => audit.classList.add('run')));
}

document.querySelector('.replay').addEventListener('click', play);
play();`,
    params:[
      ['長條時長','700ms','資料圖表可以比 UI 元件慢一點'],
      ['間隔','80ms','依序長出，帶出排序'],
      ['緩動','cubic-bezier(0.22, 1, 0.36, 1)','ease-out'],
      ['動畫屬性','transform: scaleX()','不動 width，不會觸發重排'],
      ['原點','transform-origin: left','從左邊長出'],
      ['減少動態','直接顯示最終長度','尊重 prefers-reduced-motion']
    ]
  },

  'ui-review-animations': {
    height:340,
    html:`<div class="diff">
  <div class="ln">.dropdown {</div>
  <div class="ln del">-  transition: all 300ms ease-in;</div>
  <div class="ln del">-  transform: scale(0);</div>
  <div class="ln add">+  transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1);</div>
  <div class="ln add">+  transform: scale(0.95); opacity: 0;</div>
  <div class="ln">}</div>
  <div class="flag"><b>BLOCK</b> UI 用 ease-in 會延遲使用者最注意的瞬間；也不要從 scale(0) 開始。</div>
</div>
<button class="replay">重播</button>`,
    css:`body { flex-direction: column; gap: 16px; }
.diff { width: 420px; max-width: 92vw; padding: 12px 0; border: 1px solid #e3e6ea; border-radius: 12px; background: #fff; overflow: hidden; font: 12px/1.9 ui-monospace, monospace; }
.ln { padding: 0 16px; white-space: pre; color: #55595f; overflow: hidden; text-overflow: ellipsis; }
.del { background: #fde3e3; color: #e43f3f; }
.add { background: #dff3ea; color: #1f9d6b; }
.flag { margin: 8px 12px 0; padding: 8px 10px; border-radius: 8px; background: #e6edf0; font: 12px/1.5 system-ui, sans-serif; color: #1d1d1f; }
.flag b { color: #e43f3f; margin-right: 6px; }

/* 審查意見逐行出現 */
.del, .add, .flag {
  opacity: 0; transform: translateX(-8px);
  transition: opacity 300ms cubic-bezier(0.22, 1, 0.36, 1), transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--i) * 280ms + 200ms);
}
.diff.in .del, .diff.in .add, .diff.in .flag { opacity: 1; transform: none; }
.diff:not(.in) * { transition: none; }
.replay { height: 32px; padding: 0 12px; border: 1px solid #cfd6db; border-radius: 8px; background: #fff; cursor: pointer; }

@media (prefers-reduced-motion: reduce) {
  .del, .add, .flag { transform: none; transition-delay: 0ms; }
}`,
    js:`const diff = document.querySelector('.diff');
diff.querySelectorAll('.del, .add, .flag').forEach((el, i) => el.style.setProperty('--i', i));

function play() {
  diff.classList.remove('in');
  requestAnimationFrame(() => requestAnimationFrame(() => diff.classList.add('in')));
}

document.querySelector('.replay').addEventListener('click', play);
play();`,
    params:[
      ['擋下：transition: all','只列出要動的屬性','all 會連帶動到不該動的屬性'],
      ['擋下：ease-in','改用 cubic-bezier(0.22, 1, 0.36, 1)','UI 進場一律 ease-out'],
      ['擋下：scale(0)','改成 scale(0.95) + opacity: 0','東西不會憑空出現'],
      ['時長上限','300ms','選單建議 150–250ms，這裡用 180ms'],
      ['逐行間隔','280ms','示範用，讓每條意見可以被讀到'],
      ['減少動態','只保留淡入','尊重 prefers-reduced-motion']
    ]
  },

  'taste-redesign': {
    height:340,
    html:`<div class="compare" id="compare">
  <div class="pane before">
    <h3>Welcome to Our Platform</h3>
    <p>The best solution for all your needs.</p>
    <span class="cta">Get Started</span>
  </div>
  <div class="pane after">
    <p>AUDIT → FIX → UPGRADE</p>
    <h3>讓網站看起來<br>像被設計過</h3>
    <span class="cta">開始升級 →</span>
  </div>
  <div class="line"></div>
</div>
<button class="toggle">切換前後</button>`,
    css:`body { flex-direction: column; gap: 16px; }
.compare { position: relative; width: 360px; height: 220px; border: 1px solid #e3e6ea; border-radius: 12px; overflow: hidden; }
.pane { position: absolute; inset: 0; padding: 20px; display: flex; flex-direction: column; gap: 8px; }
.pane h3, .pane p { margin: 0; }
.before { align-items: center; justify-content: center; text-align: center; background: #fff; font-family: Arial, sans-serif; color: #333; }
.before h3 { font-size: 17px; }
.before p { font-size: 12px; color: #777; }
.before .cta { padding: 6px 14px; border-radius: 6px; background: linear-gradient(90deg, #7c5cff, #c05cff); color: #fff; font-size: 12px; }
.after { justify-content: flex-end; background: #173f50; color: #fff; font-family: system-ui, sans-serif;
  clip-path: inset(0 0 0 100%);                    /* 從右邊擦入 */
  transition: clip-path 1100ms cubic-bezier(0.77, 0, 0.175, 1); }
.after h3 { font-size: 22px; line-height: 1.2; }
.after p { font: 11px ui-monospace, monospace; color: #a8c8d4; }
.after .cta { align-self: flex-start; height: 28px; line-height: 28px; padding: 0 12px; border-radius: 999px; background: #fc5454; font-size: 12px; }
.line { position: absolute; top: 0; bottom: 0; left: 0; width: 2px; margin-left: -1px; background: #fc5454;
  transform: translateX(360px); transition: transform 1100ms cubic-bezier(0.77, 0, 0.175, 1); }
.compare.on .after { clip-path: inset(0); }
.compare.on .line { transform: translateX(0); }
.toggle { height: 32px; padding: 0 12px; border: 1px solid #cfd6db; border-radius: 8px; background: #fff; cursor: pointer; }

@media (prefers-reduced-motion: reduce) {
  .after, .line { transition: opacity 200ms; }
}`,
    js:`const compare = document.getElementById('compare');
document.querySelector('.toggle').addEventListener('click', () => compare.classList.toggle('on'));`,
    params:[
      ['擦入時長','1100ms','前後對照是展示用，可以放慢讓人看清'],
      ['緩動','cubic-bezier(0.77, 0, 0.175, 1)','ease-in-out：在畫面上移動的東西用這個'],
      ['動畫屬性','clip-path、transform','分隔線用 translateX，不動 left'],
      ['改版前','置中標題、紫色漸層按鈕','常見的 AI 模板痕跡'],
      ['改版後','品牌深藍、左下對齊、珊瑚紅 CTA','有層級和品牌色'],
      ['減少動態','直接切換','尊重 prefers-reduced-motion']
    ]
  },

  'design:design-critique': {
    height:340,
    html:`<div class="crit">
  <div class="mock">
    <div class="m-h"></div><div class="m-t"></div><div class="m-t s"></div><div class="m-t"></div><div class="m-b"></div>
  </div>
  <button class="pin" style="left:14%;top:16%" data-i="0">1</button>
  <button class="pin" style="left:30%;top:82%" data-i="1">2</button>
  <button class="pin" style="left:58%;top:44%" data-i="2">3</button>
  <div class="note"><b id="noteTitle"></b><span id="noteText"></span></div>
</div>`,
    css:`.crit { position: relative; width: 400px; height: 220px; }
.mock { position: absolute; inset: 0 32% 0 0; padding: 16px; display: flex; flex-direction: column; gap: 8px; border: 1px solid #e3e6ea; border-radius: 12px; background: #fff; }
.m-h { width: 60%; height: 16px; border-radius: 4px; background: #c4ccd1; }
.m-t { height: 8px; border-radius: 4px; background: #e6edf0; }
.m-t.s { width: 70%; }
.m-b { margin-top: auto; width: 44%; height: 28px; border-radius: 6px; background: #173f50; }
.pin {
  position: absolute; width: 24px; height: 24px; margin: -12px 0 0 -12px; padding: 0; border: 0; border-radius: 50%;
  background: #fc5454; color: #fff; font: 600 12px system-ui, sans-serif; cursor: pointer;
  box-shadow: 0 0 0 4px rgba(252, 84, 84, 0.25);
  transform: scale(0); transition: transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 200ms;
  transition-delay: calc(var(--i) * 150ms);
}
.crit.in .pin { transform: scale(1); }
.pin.on { box-shadow: 0 0 0 8px rgba(252, 84, 84, 0.3); }
.note { position: absolute; right: 0; top: 50%; width: 30%; transform: translateY(-50%); padding: 10px; border: 1px solid #e3e6ea; border-radius: 12px; background: #fff; font: 12px/1.5 system-ui, sans-serif; color: #1d1d1f; transition: opacity 150ms; }
.note b { display: block; font: 600 11px ui-monospace, monospace; color: #fc5454; }

@media (prefers-reduced-motion: reduce) {
  .pin { transition: none; }
}`,
    js:`const notes = [
  ['01 層級', '標題字級太接近內文，層級不明顯'],
  ['02 間距', '按鈕跟內容距離太遠，視線斷掉'],
  ['03 一致性', '次要文字有兩種灰色']
];
const crit = document.querySelector('.crit');
const pins = [...crit.querySelectorAll('.pin')];
const note = crit.querySelector('.note');

function show(i) {
  pins.forEach((p, j) => p.classList.toggle('on', i === j));
  note.style.opacity = 0;
  setTimeout(() => {
    document.getElementById('noteTitle').textContent = notes[i][0];
    document.getElementById('noteText').textContent = notes[i][1];
    note.style.opacity = 1;
  }, 150);
}

pins.forEach((p, i) => { p.style.setProperty('--i', i); p.addEventListener('click', () => show(i)); });
requestAnimationFrame(() => crit.classList.add('in'));   // 標記依序彈出
show(0);`,
    params:[
      ['標記進場','400ms，cubic-bezier(0.34, 1.56, 0.64, 1)','帶一點回彈，吸引視線'],
      ['間隔','150ms','依編號順序出現'],
      ['選取強調','外框光暈 4px → 8px','不移動位置，只加強'],
      ['說明切換','淡出 150ms → 換字 → 淡入','避免文字瞬間跳換'],
      ['互動','點擊編號切換說明','標記用 button，可用鍵盤操作'],
      ['減少動態','標記直接出現','尊重 prefers-reduced-motion']
    ]
  },

  'design:accessibility-review': {
    height:320,
    html:`<div class="con">
  <div class="sample" id="sample">Aa 文字範例</div>
  <div class="row"><div>對比值<br><b id="ratio">1.0:1</b></div><span class="badge" id="badge"></span></div>
  <div class="pairs">
    <button data-fg="#a8c8d4" data-bg="#ffffff">天空藍／白</button>
    <button data-fg="#fc5454" data-bg="#ffffff">珊瑚紅／白</button>
    <button data-fg="#246078" data-bg="#ffffff">帶狀藍／白</button>
    <button data-fg="#ffffff" data-bg="#173f50">白／深藍</button>
  </div>
</div>`,
    css:`.con { width: 340px; display: flex; flex-direction: column; gap: 12px; font-family: system-ui, sans-serif; }
.sample { height: 88px; display: grid; place-items: center; border: 1px solid #e3e6ea; border-radius: 12px; font: 600 24px system-ui, sans-serif;
  transition: background-color 400ms cubic-bezier(0.22, 1, 0.36, 1), color 400ms cubic-bezier(0.22, 1, 0.36, 1); }
.row { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #55595f; }
.row b { font: 600 24px system-ui, sans-serif; color: #173f50; font-variant-numeric: tabular-nums; }
.badge { padding: 3px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; }
.badge.pass { background: #dff3ea; color: #1f9d6b; }
.badge.mid { background: #fbeed3; color: #a86c00; }
.badge.fail { background: #fde3e3; color: #e43f3f; }
.pairs { display: flex; flex-wrap: wrap; gap: 6px; }
.pairs button { height: 28px; padding: 0 10px; border: 1px solid #e3e6ea; border-radius: 999px; background: #fff; font-size: 12px; cursor: pointer; }
.pairs button.on { background: #173f50; border-color: #173f50; color: #fff; }

@media (prefers-reduced-motion: reduce) {
  .sample { transition: none; }
}`,
    js:`// WCAG 相對亮度與對比值
function luminance(hex) {
  const c = [1, 3, 5].map(i => parseInt(hex.substr(i, 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sample = document.getElementById('sample'), out = document.getElementById('ratio'), badge = document.getElementById('badge');
const buttons = document.querySelectorAll('.pairs button');
let current = 1, raf = 0;

function check(btn) {
  const fg = btn.dataset.fg, bg = btn.dataset.bg, r = contrast(fg, bg);
  buttons.forEach(b => b.classList.toggle('on', b === btn));
  sample.style.color = fg; sample.style.background = bg;
  badge.className = 'badge ' + (r >= 4.5 ? 'pass' : r >= 3 ? 'mid' : 'fail');
  badge.textContent = r >= 4.5 ? 'AA 通過' : r >= 3 ? '僅限大字' : '未通過';
  // 數字從舊值滾到新值
  cancelAnimationFrame(raf);
  const from = current, t0 = performance.now(), dur = reduce ? 0 : 600;
  const tick = t => {
    const p = dur ? Math.min(1, (t - t0) / dur) : 1, e = 1 - Math.pow(1 - p, 3);
    current = from + (r - from) * e;
    out.textContent = current.toFixed(1) + ':1';
    if (p < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}

buttons.forEach(b => b.addEventListener('click', () => check(b)));
check(buttons[0]);`,
    params:[
      ['一般文字','≥ 4.5:1','WCAG 2.1 AA，1.4.3'],
      ['大字（≥ 24px 或粗體 ≥ 18.66px）','≥ 3:1','介於 3 到 4.5 只能用在大字'],
      ['數字滾動','600ms，ease-out cubic','從舊值補間到新值，看得出變化方向'],
      ['換色','400ms','背景與文字顏色一起過渡'],
      ['等寬數字','font-variant-numeric: tabular-nums','數字滾動時寬度不跳動'],
      ['減少動態','直接顯示結果','尊重 prefers-reduced-motion']
    ]
  },

  'design:ux-copy': {
    height:280,
    html:`<div class="ux">
  <div class="card">
    <span class="tag" id="tag">BEFORE</span>
    <div class="txt before" id="txt">提交</div>
    <div class="ctx" id="ctx">註冊表單的主按鈕</div>
  </div>
  <div class="actions"><button id="swap">看改寫後</button><button id="next">下一個例子</button></div>
</div>`,
    css:`.ux { width: 320px; display: flex; flex-direction: column; gap: 12px; font-family: system-ui, sans-serif; }
.card { display: flex; flex-direction: column; gap: 8px; padding: 16px; border: 1px solid #e3e6ea; border-radius: 12px; background: #fff; }
.tag { align-self: flex-start; padding: 4px 6px; border-radius: 4px; background: #e6edf0; color: #7f8b91; font: 600 10px ui-monospace, monospace; letter-spacing: 0.08em; transition: background-color 300ms, color 300ms; }
.tag.after { background: #dff3ea; color: #1f9d6b; }
.txt { min-height: 26px; font-size: 17px; font-weight: 500; color: #173f50;
  transition: opacity 220ms cubic-bezier(0.22, 1, 0.36, 1), transform 220ms cubic-bezier(0.22, 1, 0.36, 1), filter 220ms; }
.txt.before { color: #7f8b91; text-decoration: line-through; }
.txt.out { opacity: 0; transform: translateY(4px); filter: blur(4px); }
.ctx { font-size: 12px; color: #7f8b91; }
.actions { display: flex; gap: 8px; }
.actions button { height: 32px; padding: 0 12px; border: 1px solid #cfd6db; border-radius: 8px; background: #fff; cursor: pointer; }

@media (prefers-reduced-motion: reduce) {
  .txt { transition: opacity 150ms; }
  .txt.out { transform: none; filter: none; }
}`,
    js:`const pairs = [
  ['提交', '建立帳號', '註冊表單的主按鈕'],
  ['錯誤：操作失敗', '密碼至少需要 8 個字元', '密碼欄位的錯誤訊息'],
  ['確定', '刪除 3 個檔案', '刪除確認對話框']
];
const tag = document.getElementById('tag'), txt = document.getElementById('txt'), ctx = document.getElementById('ctx');
const swapBtn = document.getElementById('swap');
let k = 0, after = false;

// 淡出 → 換字 → 淡入
function render() {
  txt.classList.add('out');
  setTimeout(() => {
    txt.textContent = pairs[k][after ? 1 : 0];
    txt.classList.toggle('before', !after);
    tag.textContent = after ? 'AFTER' : 'BEFORE';
    tag.classList.toggle('after', after);
    ctx.textContent = pairs[k][2];
    swapBtn.textContent = after ? '看改寫前' : '看改寫後';
    txt.classList.remove('out');
  }, 220);
}

swapBtn.addEventListener('click', () => { after = !after; render(); });
document.getElementById('next').addEventListener('click', () => { k = (k + 1) % pairs.length; after = false; render(); });`,
    params:[
      ['替換方式','淡出 → 換字 → 淡入','避免新舊文字重疊'],
      ['時長','220ms × 2','文字替換要快，不打斷閱讀'],
      ['模糊','blur(4px)','遮住字形差異'],
      ['按鈕文案','寫出結果，例如「建立帳號」','不用「提交」「確定」'],
      ['錯誤訊息','說出原因與解法','不用「操作失敗」'],
      ['減少動態','只保留淡入淡出','尊重 prefers-reduced-motion']
    ]
  },

  'design:user-research': {
    height:340,
    html:`<div class="chat" id="chat">
  <div class="bub q">最近一次訂餐是什麼時候？</div>
  <div class="bub a">昨天中午，在公司用手機點的。</div>
  <div class="bub q">當時遇到什麼麻煩嗎？</div>
  <div class="bub a">找不到上次點過的那家店…</div>
</div>
<button class="replay">重播</button>`,
    css:`body { flex-direction: column; gap: 16px; }
.chat { width: 320px; display: flex; flex-direction: column; gap: 8px; font: 13px/1.5 system-ui, sans-serif; }
.bub {
  max-width: 78%; padding: 8px 12px; border-radius: 12px;
  opacity: 0; transform: translateY(8px) scale(0.97);
  transition: opacity 300ms cubic-bezier(0.22, 1, 0.36, 1), transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--i) * 450ms);         /* 像對話一樣一句一句出現 */
}
.q { align-self: flex-start; background: #173f50; color: #fff; border-bottom-left-radius: 4px; transform-origin: bottom left; }
.a { align-self: flex-end; background: #fff; border: 1px solid #e3e6ea; color: #1d1d1f; border-bottom-right-radius: 4px; transform-origin: bottom right; }
.chat.in .bub { opacity: 1; transform: none; }
.chat:not(.in) .bub { transition: none; }
.replay { height: 32px; padding: 0 12px; border: 1px solid #cfd6db; border-radius: 8px; background: #fff; cursor: pointer; }

@media (prefers-reduced-motion: reduce) {
  .bub { transform: none; transition-delay: 0ms; }
}`,
    js:`const chat = document.getElementById('chat');
chat.querySelectorAll('.bub').forEach((b, i) => b.style.setProperty('--i', i));

function play() {
  chat.classList.remove('in');
  requestAnimationFrame(() => requestAnimationFrame(() => chat.classList.add('in')));
}

document.querySelector('.replay').addEventListener('click', play);
play();`,
    params:[
      ['單則時長','300ms','淡入加上 8px 位移'],
      ['間隔','450ms','模擬一問一答的節奏'],
      ['原點','提問左下、回答右下','從對話框的尾巴長出來'],
      ['起始縮放','scale(0.97)','輕微放大，不從 0 開始'],
      ['訪談原則','先問實際行為，再問困難','不問假設性問題'],
      ['減少動態','全部直接淡入','尊重 prefers-reduced-motion']
    ]
  }
});
