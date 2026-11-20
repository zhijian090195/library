/* 動畫程式碼 batch C：圖像生成、開發工具、AICDE 視覺風格 */
Object.assign(window.SNIPPETS, {
  'mockup-to-code': {
    height:320,
    html:`<div class="i2c">
  <div class="shot"><i class="a"></i><i class="b"></i><i class="c"></i><div class="scan"></div></div>
  <span class="arrow">→</span>
  <pre class="code"><span>&lt;header&gt;</span><span>  &lt;h1/&gt;</span><span>&lt;/header&gt;</span><span>&lt;section&gt;</span><span>  &lt;Card/&gt;</span><span>&lt;/section&gt;</span></pre>
</div>
<button class="replay">重新掃描</button>`,
    css:`:root { --ease-out: cubic-bezier(0.22, 1, 0.36, 1); }
body { flex-direction: column; gap: 20px; }
.i2c { display: grid; grid-template-columns: 180px 24px 150px; gap: 12px; align-items: center; }
.shot { position: relative; height: 140px; padding: 8px; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1.4fr 1fr; gap: 6px;
  background: #fff; border: 1px solid #e3e6ea; border-radius: 10px; overflow: hidden; }
.shot i { border-radius: 4px; }
.shot .a { grid-column: span 2; background: linear-gradient(120deg, #173f50, #246078); }
.shot .b { background: #fc5454; } .shot .c { background: #a8c8d4; }
/* 掃描線：由上往下掃過設計圖 */
.scan { position: absolute; left: 0; right: 0; top: 0; height: 2px; background: #fc5454; box-shadow: 0 0 12px #fc5454; opacity: 0; }
.go .scan { animation: scan 1.3s cubic-bezier(0.77, 0, 0.175, 1); }
@keyframes scan { from { transform: translateY(0); opacity: 1; } to { transform: translateY(138px); opacity: 1; } }
.arrow { color: #7f8b91; text-align: center; }
.code { margin: 0; font: 12px/1.8 ui-monospace, monospace; color: #246078; }
.code span { display: block; opacity: 0; transform: translateX(-6px); transition: opacity 260ms var(--ease-out), transform 260ms var(--ease-out); }
.go .code span { opacity: 1; transform: none; transition-delay: calc(400ms + var(--i) * 200ms); }
.replay { height: 32px; padding: 0 12px; border: 1px solid #cfd6db; border-radius: 8px; background: #fff; cursor: pointer; }
@media (prefers-reduced-motion: reduce) { .scan { display: none; } .code span { transform: none; transition-delay: 0ms !important; } }`,
    js:`const box = document.querySelector('.i2c');
box.querySelectorAll('.code span').forEach((s, i) => s.style.setProperty('--i', i));

function play() {
  box.classList.remove('go');
  void box.offsetWidth;                 // 強制重排，讓動畫重新開始
  box.classList.add('go');
}
document.querySelector('.replay').addEventListener('click', play);
play();`,
    params:[
      ['掃描時長','1.3s','掃描線從頂端到底部'],
      ['掃描曲線','cubic-bezier(0.77, 0, 0.175, 1)','ease-in-out：頭尾放慢，像真的在掃'],
      ['程式碼延遲','400ms 起，每行 200ms','掃到一半開始逐行寫出'],
      ['單行時長','260ms','淡入加 6px 位移'],
      ['動畫屬性','transform、opacity','不會觸發重排'],
      ['減少動態','隱藏掃描線，程式碼直接出現','尊重 prefers-reduced-motion']
    ]
  },

  'brand-board': {
    height:340,
    html:`<svg class="mark" viewBox="0 0 200 140" aria-label="Logo 幾何結構">
  <g class="guides">
    <circle cx="100" cy="70" r="50"/><circle cx="100" cy="70" r="30"/>
    <line x1="36" y1="70" x2="164" y2="70"/><line x1="100" y1="10" x2="100" y2="130"/>
    <line x1="55" y1="25" x2="145" y2="115"/>
  </g>
  <path class="letter" d="M70 106 L100 34 L130 106 M83 80 H117"/>
  <circle class="dot" cx="140" cy="106" r="7"/>
</svg>
<button class="replay">重畫</button>`,
    css:`body { flex-direction: column; gap: 16px; }
.mark { width: 320px; }
/* 先畫輔助線，再描字母，最後點上品牌色 */
.guides * { fill: none; stroke: #a8c8d4; stroke-width: 1; stroke-dasharray: 400; stroke-dashoffset: 400; }
.letter { fill: none; stroke: #173f50; stroke-width: 11; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 260; stroke-dashoffset: 260; }
.dot { fill: #fc5454; transform-box: fill-box; transform-origin: center; transform: scale(0); }
.go .guides * { stroke-dashoffset: 0; transition: stroke-dashoffset 1000ms cubic-bezier(0.22, 1, 0.36, 1); }
.go .letter { stroke-dashoffset: 0; transition: stroke-dashoffset 900ms cubic-bezier(0.77, 0, 0.175, 1) 700ms; }
.go .dot { transform: scale(1); transition: transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1) 1500ms; }
.replay { height: 32px; padding: 0 12px; border: 1px solid #cfd6db; border-radius: 8px; background: #fff; cursor: pointer; }
@media (prefers-reduced-motion: reduce) { .go * { transition: none !important; } }`,
    js:`const svg = document.querySelector('.mark');

function draw() {
  svg.classList.remove('go');
  requestAnimationFrame(() => requestAnimationFrame(() => svg.classList.add('go')));
}
document.querySelector('.replay').addEventListener('click', draw);
draw();`,
    params:[
      ['描線技巧','stroke-dasharray + stroke-dashoffset','把線條長度設成虛線間距，再把偏移歸零'],
      ['輔助線','1000ms ease-out','先建立幾何結構'],
      ['字母','900ms ease-in-out，延遲 700ms','沿結構描出主體'],
      ['品牌色圓點','500ms 回彈曲線，延遲 1500ms','cubic-bezier(0.34, 1.56, 0.64, 1) 稍微超出再回來'],
      ['重播','移除 class 後隔兩個影格再加回','沒有 transition 的狀態瞬間歸零'],
      ['減少動態','直接顯示完成圖','尊重 prefers-reduced-motion']
    ]
  },

  'ai-image-gen': {
    height:340,
    html:`<div class="gen">
  <div class="prompt"><span id="text"></span><i>|</i></div>
  <div class="img" id="img"><div class="sun"></div><div class="hill h1"></div><div class="hill h2"></div></div>
  <button class="replay">重新生成</button>
</div>`,
    css:`.gen { width: 340px; display: flex; flex-direction: column; gap: 10px; }
.prompt { height: 36px; padding: 0 12px; display: flex; align-items: center; background: #fff; border: 1px solid #e3e6ea; border-radius: 8px; font-size: 13px; color: #1d1d1f; }
.prompt i { font-style: normal; color: #fc5454; animation: blink 1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }
/* 從模糊、低飽和慢慢清晰 */
.img { position: relative; height: 180px; border-radius: 10px; overflow: hidden;
  background: linear-gradient(180deg, #ffb38a, #fc7a6a 45%, #f6c8a8);
  filter: blur(14px) saturate(0.2); opacity: 0.45;
  transition: filter 1400ms cubic-bezier(0.22, 1, 0.36, 1), opacity 1400ms cubic-bezier(0.22, 1, 0.36, 1); }
.img.done { filter: none; opacity: 1; }
.img.reset { transition: none; }
.sun { position: absolute; left: 58%; top: 20%; width: 40px; height: 40px; border-radius: 50%; background: #fff1d6; }
.hill { position: absolute; bottom: -40%; border-radius: 50%; }
.h1 { left: -20%; width: 90%; height: 90%; background: #246078; }
.h2 { right: -25%; width: 100%; height: 80%; background: #173f50; }
.replay { align-self: center; height: 32px; padding: 0 12px; border: 1px solid #cfd6db; border-radius: 8px; background: #fff; cursor: pointer; }
@media (prefers-reduced-motion: reduce) { .img { transition: opacity 300ms; } .prompt i { animation: none; } }`,
    js:`const text = document.getElementById('text');
const img = document.getElementById('img');
const prompt = '夕陽下的山丘，暖色調，寬幅 banner';
let timer;

function generate() {
  clearInterval(timer);
  img.classList.add('reset'); img.classList.remove('done');
  void img.offsetWidth;
  img.classList.remove('reset');
  let i = 0; text.textContent = '';
  timer = setInterval(() => {           // 逐字打出提示詞
    text.textContent = prompt.slice(0, ++i);
    if (i >= prompt.length) { clearInterval(timer); setTimeout(() => img.classList.add('done'), 200); }
  }, 60);
}
document.querySelector('.replay').addEventListener('click', generate);
generate();`,
    params:[
      ['打字速度','每字 60ms','提示詞逐字出現'],
      ['成圖時長','1400ms','打完字後 200ms 開始'],
      ['起始狀態','blur(14px) + saturate(0.2) + opacity 0.45','模擬生成中的雜訊'],
      ['緩動','cubic-bezier(0.22, 1, 0.36, 1)','一開始變化快，最後慢慢對焦'],
      ['效能','filter 會吃 GPU','只用在單張主視覺，不要整頁套用'],
      ['減少動態','只保留淡入','尊重 prefers-reduced-motion']
    ]
  },

  'icon-generator': {
    height:300,
    html:`<div class="icons">
  <div class="ic"><svg viewBox="0 0 24 24"><path d="M4 11 12 4l8 7v9H4z"/><rect class="c" x="10" y="14" width="4" height="6"/></svg></div>
  <div class="ic"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path class="cs" d="m16 16 4 4"/></svg></div>
  <div class="ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg></div>
  <div class="ic"><svg viewBox="0 0 24 24"><path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><circle class="c" cx="12" cy="21" r="1.6"/></svg></div>
  <div class="ic"><svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/><circle class="c" cx="9" cy="10.5" r="1.2"/><circle class="c" cx="13" cy="10.5" r="1.2"/></svg></div>
  <div class="ic"><svg viewBox="0 0 24 24"><path d="M4 20V4M4 20h16"/><path class="cs" d="m7 15 4-4 3 3 5-6"/></svg></div>
  <div class="ic"><svg viewBox="0 0 24 24"><path d="M12 20s-8-4.5-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.5-8 10-8 10z"/></svg></div>
  <div class="ic"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect class="c" x="13" y="13" width="7" height="7" rx="1.5"/></svg></div>
</div>
<button class="replay">重播</button>`,
    css:`body { flex-direction: column; gap: 20px; }
.icons { display: grid; grid-template-columns: repeat(4, 56px); gap: 12px; }
.ic { width: 56px; height: 56px; display: grid; place-items: center; background: #fff; border: 1px solid #e3e6ea; border-radius: 12px;
  opacity: 0; transform: scale(0.6); }
/* 回彈曲線讓 icon 稍微超出再回來 */
.in .ic { opacity: 1; transform: none;
  transition: transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--i) * 70ms); }
.ic svg { width: 26px; height: 26px; fill: none; stroke: #173f50; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.ic .c { fill: #fc5454; stroke: none; }
.ic .cs { stroke: #fc5454; }
.replay { height: 32px; padding: 0 12px; border: 1px solid #cfd6db; border-radius: 8px; background: #fff; cursor: pointer; }
@media (prefers-reduced-motion: reduce) { .ic { transform: none; } .in .ic { transition: opacity 200ms; transition-delay: 0ms; } }`,
    js:`const grid = document.querySelector('.icons');
grid.querySelectorAll('.ic').forEach((el, i) => el.style.setProperty('--i', i));

function play() {
  grid.classList.remove('in');
  requestAnimationFrame(() => requestAnimationFrame(() => grid.classList.add('in')));
}
document.querySelector('.replay').addEventListener('click', play);
play();`,
    params:[
      ['配色','#173f50 主體、#fc5454 重點','每個 icon 都是雙色'],
      ['線寬','1.8（24px 畫布）','整套統一，圓角端點'],
      ['進場','scale(0.6) → 1','不從 0 開始'],
      ['曲線','cubic-bezier(0.34, 1.56, 0.64, 1)','回彈，450ms'],
      ['間隔','70ms','8 個總共約 1 秒'],
      ['減少動態','只淡入、不延遲','尊重 prefers-reduced-motion']
    ]
  },

  'landing-page-showroom': {
    height:380,
    html:`<div class="browser">
  <div class="bar"><i></i><i></i><i></i><span>showroom / case-07</span></div>
  <div class="viewport">
    <div class="page" id="page">
      <div class="hero"><b>Expensive<br>by design.</b><span></span></div>
      <div class="row"><i></i><i></i><i></i></div>
      <div class="band"></div>
      <div class="row"><i></i><i></i><i></i></div>
    </div>
  </div>
</div>
<button class="toggle">往下捲</button>`,
    css:`body { flex-direction: column; gap: 16px; }
.browser { width: 360px; height: 280px; display: flex; flex-direction: column; overflow: hidden; background: #fff; border: 1px solid #e3e6ea; border-radius: 12px; box-shadow: 0 12px 28px -16px rgba(23, 63, 80, 0.3); }
.bar { flex: none; height: 30px; display: flex; align-items: center; gap: 6px; padding: 0 10px; border-bottom: 1px solid #e3e6ea; }
.bar i { width: 8px; height: 8px; border-radius: 50%; background: #e3e6ea; }
.bar span { margin-left: 8px; font: 11px ui-monospace, monospace; color: #7f8b91; }
.viewport { flex: 1; overflow: hidden; }
/* 用 transform 模擬捲動，不改 scrollTop */
.page { transition: transform 1800ms cubic-bezier(0.77, 0, 0.175, 1); }
.page.down { transform: translateY(-52%); }
.hero { height: 150px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; color: #fff; background: linear-gradient(140deg, #173f50, #246078); }
.hero b { font: 600 20px/1.2 system-ui, sans-serif; }
.hero span { width: 80px; height: 22px; border-radius: 999px; background: #fc5454; }
.row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 10px; }
.row i { height: 64px; border-radius: 8px; background: #e6edf0; }
.band { height: 90px; margin: 0 10px; border-radius: 8px; background: linear-gradient(120deg, #fc5454, #ffa38a); }
.toggle { height: 32px; padding: 0 12px; border: 1px solid #cfd6db; border-radius: 8px; background: #fff; cursor: pointer; }
@media (prefers-reduced-motion: reduce) { .page { transition-duration: 1ms; } }`,
    js:`const page = document.getElementById('page');
const btn = document.querySelector('.toggle');

btn.addEventListener('click', () => {
  const down = page.classList.toggle('down');
  btn.textContent = down ? '回到頂端' : '往下捲';
});`,
    params:[
      ['捲動距離','translateY(-52%)','頁面高度的一半左右'],
      ['時長','1800ms','展示用的慢速捲動，一般 UI 不要這麼慢'],
      ['曲線','cubic-bezier(0.77, 0, 0.175, 1)','ease-in-out：起步和停止都柔和'],
      ['動畫屬性','transform','比動 scrollTop 更順，不會掉幀'],
      ['可打斷','是','transition 會從目前位置反轉'],
      ['減少動態','直接跳到目標位置','尊重 prefers-reduced-motion']
    ]
  },

  'component-finder': {
    height:320,
    html:`<div class="cmd">
  <div class="q"><span class="icon">⌕</span><span id="query"></span><span class="caret"></span></div>
  <div class="results" id="results"></div>
</div>
<button class="next">下一個需求</button>`,
    css:`body { flex-direction: column; gap: 16px; }
.cmd { width: 320px; overflow: hidden; background: #fff; border: 1px solid #e3e6ea; border-radius: 12px; box-shadow: 0 12px 28px -16px rgba(23, 63, 80, 0.3); }
.q { height: 48px; display: flex; align-items: center; gap: 8px; padding: 0 16px; border-bottom: 1px solid #e3e6ea; font-size: 15px; color: #1d1d1f; }
.icon { color: #7f8b91; }
.caret { width: 2px; height: 18px; background: #fc5454; animation: blink 1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }
.results { padding: 10px 12px; display: grid; gap: 6px; min-height: 130px; }
.row { display: flex; justify-content: space-between; align-items: center; height: 34px; padding: 0 12px; border-radius: 8px; font-size: 13px; color: #55595f;
  opacity: 0; transform: translateY(4px); transition: opacity 250ms cubic-bezier(0.22, 1, 0.36, 1), transform 250ms cubic-bezier(0.22, 1, 0.36, 1); }
.row.in { opacity: 1; transform: none; }
.row.hit { background: #e6edf0; color: #173f50; }
.row b { font: 500 12px ui-monospace, monospace; color: #fc5454; }
.next { height: 32px; padding: 0 12px; border: 1px solid #cfd6db; border-radius: 8px; background: #fff; cursor: pointer; }
@media (prefers-reduced-motion: reduce) { .row { transform: none; } .caret { animation: none; } }`,
    js:`const LIBS = [['指令選單', 'a-command'], ['驗證碼輸入', 'a-otp'], ['日期區間', 'a-range-picker'], ['多層選單', 'a-cascader'], ['左右穿梭', 'a-transfer']];
const query = document.getElementById('query');
const results = document.getElementById('results');
let k = 0, timer;

function search() {
  const start = k++ % LIBS.length;
  clearInterval(timer); results.innerHTML = ''; query.textContent = '';
  let i = 0; const word = LIBS[start][0];
  timer = setInterval(() => {            // 先打字，再顯示結果
    query.textContent = word.slice(0, ++i);
    if (i < word.length) return;
    clearInterval(timer);
    for (let j = 0; j < 3; j++) {
      const lib = LIBS[(start + j) % LIBS.length];
      const row = document.createElement('div');
      row.className = 'row' + (j === 0 ? ' hit' : '');
      row.innerHTML = '<span>' + lib[0] + '</span><b>' + lib[1] + '</b>';
      results.appendChild(row);
      setTimeout(() => row.classList.add('in'), 120 + j * 90);
    }
  }, 90);
}
document.querySelector('.next').addEventListener('click', search);
search();`,
    params:[
      ['打字速度','每字 90ms','模擬使用者輸入'],
      ['結果進場','250ms，間隔 90ms','淡入加 4px 位移'],
      ['第一筆','背景高亮','最符合需求的推薦'],
      ['動畫屬性','transform、opacity','不會觸發重排'],
      ['實務提醒','真正的指令選單不要加開關動畫','⌘K 每天開上百次，動畫只會拖慢'],
      ['減少動態','只淡入、游標不閃','尊重 prefers-reduced-motion']
    ]
  },

  'toast-stack': {
    height:320,
    html:`<button class="send">送出通知</button>
<div class="toaster" id="toaster" aria-live="polite"></div>`,
    css:`.send { height: 40px; padding: 0 16px; border: 0; border-radius: 8px; background: #173f50; color: #fff; font: 500 14px system-ui, sans-serif; cursor: pointer;
  transition: transform 160ms cubic-bezier(0.22, 1, 0.36, 1); margin-bottom: 120px; }
.send:active { transform: scale(0.97); }
.toaster { position: fixed; left: 50%; bottom: 24px; width: 280px; margin-left: -140px; }
.toast { position: absolute; left: 0; right: 0; bottom: 0; display: flex; align-items: center; gap: 8px; padding: 12px 14px;
  background: #fff; border: 1px solid #e3e6ea; border-radius: 12px; box-shadow: 0 12px 28px -16px rgba(23, 63, 80, 0.35);
  font-size: 14px; color: #1d1d1f; transform-origin: bottom center;
  transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1), opacity 400ms cubic-bezier(0.22, 1, 0.36, 1); }
.dot { width: 8px; height: 8px; border-radius: 50%; flex: none; }
@media (prefers-reduced-motion: reduce) { .toast { transition: opacity 200ms; } }`,
    js:`const toaster = document.getElementById('toaster');
const MSGS = [['已儲存變更', '#1f9d6b'], ['檔案上傳中…', '#246078'], ['連線失敗，請重試', '#fc5454'], ['已複製連結', '#1f9d6b']];
let n = 0, list = [];

// 越舊的通知越往後、越小，超過 3 則就淡出
function layout() {
  list.forEach((t, i) => {
    const depth = list.length - 1 - i;
    t.style.transform = 'translateY(' + (-depth * 10) + 'px) scale(' + (1 - depth * 0.05) + ')';
    t.style.opacity = depth > 2 ? 0 : 1;
    t.style.zIndex = 100 - depth;
  });
}

function dismiss(t) {
  t.style.opacity = 0;
  t.style.transform += ' translateY(16px)';
  setTimeout(() => { t.remove(); list = list.filter(x => x !== t); layout(); }, 400);
}

document.querySelector('.send').addEventListener('click', () => {
  const m = MSGS[n++ % MSGS.length];
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = '<span class="dot" style="background:' + m[1] + '"></span>' + m[0];
  t.style.transform = 'translateY(40px) scale(0.95)';
  t.style.opacity = 0;
  toaster.appendChild(t); list.push(t);
  void t.offsetWidth;                    // 先套用起始位置
  layout();
  setTimeout(() => dismiss(t), 3200);
});`,
    params:[
      ['進場','translateY(40px) + scale(0.95) → 原位','從下方滑入'],
      ['堆疊','每層上移 10px、縮小 5%','舊通知退到後面'],
      ['可見數量','3 則','第 4 則開始淡出'],
      ['時長','400ms ease-out','進場、堆疊、退場共用'],
      ['自動關閉','3200ms','退場往下 16px 並淡出'],
      ['可及性','aria-live="polite"','螢幕報讀器會念出新通知']
    ]
  },

  'responsive-component': {
    height:300,
    html:`<div class="demo">
  <div class="frame" id="frame">
    <div class="grid"><i class="head"></i><i></i><i></i><i></i></div>
  </div>
  <button class="toggle">切換到手機寬度</button>
</div>`,
    css:`.demo { width: 380px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
/* 容器查詢：元件依自己的寬度排版，而不是視窗寬度 */
.frame { width: 100%; container-type: inline-size; padding: 10px; background: #fff; border: 1px solid #e3e6ea; border-radius: 12px;
  transition: width 1000ms cubic-bezier(0.77, 0, 0.175, 1); }
.frame.mobile { width: 40%; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.grid i { height: 52px; border-radius: 8px; background: #a8c8d4; }
.grid .head { grid-column: 1 / -1; height: 36px; background: #173f50; }
@container (max-width: 180px) {
  .grid { grid-template-columns: 1fr; }
  .grid i { height: 24px; }
}
.toggle { height: 32px; padding: 0 12px; border: 1px solid #cfd6db; border-radius: 8px; background: #fff; cursor: pointer; }
@media (prefers-reduced-motion: reduce) { .frame { transition: none; } }`,
    js:`const frame = document.getElementById('frame');
const btn = document.querySelector('.toggle');

btn.addEventListener('click', () => {
  const mobile = frame.classList.toggle('mobile');
  btn.textContent = mobile ? '切換到桌機寬度' : '切換到手機寬度';
});`,
    params:[
      ['排版方式','@container (max-width: 180px)','依元件自身寬度切換，不看視窗'],
      ['桌機','三欄','標題列撐滿'],
      ['手機','一欄','卡片高度縮小'],
      ['寬度動畫','1000ms ease-in-out','僅示範用；動 width 會重排，正式介面不要這樣做'],
      ['相容性','container-type: inline-size','現代瀏覽器皆支援'],
      ['減少動態','直接切換寬度','尊重 prefers-reduced-motion']
    ]
  },

  'e2e-check': {
    height:300,
    html:`<div class="pw">
  <div class="view" id="view">
    <i></i><i></i><button class="login" id="login">登入</button>
    <div class="cursor" id="cursor"></div>
  </div>
  <div class="log" id="log">
    <div>goto('/login')</div><div>fill('#email')</div><div>click('登入')</div><div class="ok">✓ 跳轉 /dashboard</div>
  </div>
</div>
<button class="run">執行測試</button>`,
    css:`body { flex-direction: column; gap: 16px; }
.pw { display: grid; grid-template-columns: 170px 170px; gap: 16px; align-items: center; }
.view { position: relative; height: 140px; padding: 14px; display: flex; flex-direction: column; gap: 8px; background: #fff; border: 1px solid #e3e6ea; border-radius: 12px; }
.view i { height: 22px; border-radius: 6px; background: #e6edf0; border: 1px solid #e3e6ea; }
.login { height: 28px; border: 0; border-radius: 6px; background: #173f50; color: #fff; font-size: 12px; transition: transform 120ms cubic-bezier(0.22, 1, 0.36, 1); }
.login.press { transform: scale(0.95); }
.cursor { position: absolute; left: 14px; top: 14px; width: 16px; height: 16px; background: #fc5454; pointer-events: none;
  clip-path: polygon(0 0, 0 100%, 30% 72%, 52% 100%, 64% 92%, 44% 64%, 80% 64%);
  transition: transform 700ms cubic-bezier(0.77, 0, 0.175, 1); }
.log { font: 12px/1.9 ui-monospace, monospace; color: #55595f; }
.log div { opacity: 0; transform: translateY(4px); transition: opacity 220ms cubic-bezier(0.22, 1, 0.36, 1), transform 220ms cubic-bezier(0.22, 1, 0.36, 1); }
.log div.in { opacity: 1; transform: none; }
.log .ok { color: #1f9d6b; }
.run { height: 32px; padding: 0 12px; border: 1px solid #cfd6db; border-radius: 8px; background: #fff; cursor: pointer; }
@media (prefers-reduced-motion: reduce) { .cursor, .log div { transition-duration: 1ms; } }`,
    js:`const view = document.getElementById('view');
const btn = document.getElementById('login');
const cursor = document.getElementById('cursor');
const logs = document.querySelectorAll('#log div');
let timers = [];

function run() {
  timers.forEach(clearTimeout); timers = [];
  logs.forEach(l => l.classList.remove('in'));
  cursor.style.transform = 'none';
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  at(300, () => logs[0].classList.add('in'));
  at(800, () => { logs[1].classList.add('in'); cursor.style.transform = 'translate(70px, 12px)'; });
  at(1500, () => {                       // 游標移到按鈕中央
    logs[2].classList.add('in');
    const x = btn.offsetLeft + btn.offsetWidth / 2 - 14;
    const y = btn.offsetTop + 8 - 14;
    cursor.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
  });
  at(2200, () => btn.classList.add('press'));
  at(2350, () => { btn.classList.remove('press'); logs[3].classList.add('in'); });
}
document.querySelector('.run').addEventListener('click', run);
run();`,
    params:[
      ['游標移動','700ms ease-in-out','模擬滑鼠從一點移到另一點'],
      ['按壓回饋','scale(0.95)，120ms','點擊瞬間的按下感'],
      ['紀錄出現','220ms，跟著每個步驟','淡入加 4px 位移'],
      ['步驟時間','300 / 800 / 1500 / 2350ms','對應 goto、fill、click、驗證'],
      ['動畫屬性','transform、opacity','游標用 translate 移動'],
      ['減少動態','游標和紀錄直接出現','尊重 prefers-reduced-motion']
    ]
  },

  'aicde-visual-001': {
    height:340,
    html:`<figure class="kb">
  <img src="https://zhijian090195.github.io/design/assets/visual/aicde-visual-001.webp" alt="稚拙復古混合媒材範例圖">
</figure>
<button class="toggle">暫停</button>`,
    css:`body { flex-direction: column; gap: 16px; }
/* 請把 img 的 src 換成你自己的圖片 */
.kb { width: 420px; aspect-ratio: 16 / 9; margin: 0; overflow: hidden; border-radius: 12px; box-shadow: 0 12px 28px -16px rgba(23, 63, 80, 0.4); }
.kb img { display: block; width: 100%; height: 100%; object-fit: cover; will-change: transform;
  animation: kenburns 16s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate; }
/* 慢速放大加平移，讓靜態插畫有呼吸感 */
@keyframes kenburns {
  from { transform: scale(1) translate(0, 0); }
  to   { transform: scale(1.1) translate(-3%, 2%); }
}
.kb.paused img { animation-play-state: paused; }
.toggle { height: 32px; padding: 0 12px; border: 1px solid #cfd6db; border-radius: 8px; background: #fff; cursor: pointer; }
@media (prefers-reduced-motion: reduce) { .kb img { animation: none; } }`,
    js:`const kb = document.querySelector('.kb');
const btn = document.querySelector('.toggle');

btn.addEventListener('click', () => {
  const paused = kb.classList.toggle('paused');
  btn.textContent = paused ? '播放' : '暫停';
});`,
    params:[
      ['效果','Ken Burns（慢速推移）','放大加平移'],
      ['時長','16s，來回循環','慢到幾乎察覺不到'],
      ['幅度','scale 1 → 1.1、平移 3%','幅度小才不會暈'],
      ['曲線','cubic-bezier(0.45, 0, 0.55, 1)','對稱的 ease-in-out，來回都平順'],
      ['動畫屬性','transform','GPU 合成，不會掉幀'],
      ['減少動態','停止推移','尊重 prefers-reduced-motion']
    ]
  },

  'aicde-visual-018': {
    height:340,
    html:`<figure class="kb">
  <img src="https://zhijian090195.github.io/design/assets/visual/aicde-visual-018.webp" alt="暖白分層剪紙範例圖">
</figure>
<button class="toggle">暫停</button>`,
    css:`body { flex-direction: column; gap: 16px; }
/* 請把 img 的 src 換成你自己的圖片 */
.kb { width: 420px; aspect-ratio: 16 / 9; margin: 0; overflow: hidden; border-radius: 12px; box-shadow: 0 12px 28px -16px rgba(23, 63, 80, 0.4); }
.kb img { display: block; width: 100%; height: 100%; object-fit: cover; will-change: transform;
  animation: kenburns 18s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate; }
/* 剪紙畫面往右上推，順著紙片層次的方向 */
@keyframes kenburns {
  from { transform: scale(1.08) translate(2%, 1%); }
  to   { transform: scale(1) translate(-1%, -1%); }
}
.kb.paused img { animation-play-state: paused; }
.toggle { height: 32px; padding: 0 12px; border: 1px solid #cfd6db; border-radius: 8px; background: #fff; cursor: pointer; }
@media (prefers-reduced-motion: reduce) { .kb img { animation: none; } }`,
    js:`const kb = document.querySelector('.kb');
const btn = document.querySelector('.toggle');

btn.addEventListener('click', () => {
  const paused = kb.classList.toggle('paused');
  btn.textContent = paused ? '播放' : '暫停';
});`,
    params:[
      ['效果','Ken Burns（慢速推移）','由近拉遠，再推回'],
      ['時長','18s，來回循環','比 001 更慢，配合柔和的剪紙風'],
      ['幅度','scale 1.08 → 1、平移 2%','先放大，讓邊緣不露白'],
      ['曲線','cubic-bezier(0.45, 0, 0.55, 1)','對稱的 ease-in-out'],
      ['動畫屬性','transform','GPU 合成，不會掉幀'],
      ['減少動態','停止推移','尊重 prefers-reduced-motion']
    ]
  }
});
