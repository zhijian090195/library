/* 打擊特效頁的內容：每張卡片可以直接玩，附 HTML、React 寫法和給 AI 的提示詞。
   新增一筆：在 FX_ITEMS 加一個物件，id 對到 COMPONENTS 的元件頁。 */
window.FX_ITEMS = [
  { id:'button', name:'主要按鈕', tag:'a-btn--primary', how:'按住再放開。放開後過一下會蓋上打勾，那是 AUIFX.done()。',
    html:`<button class="a-btn a-btn--primary a-btn--lg" data-demo="primary">確認送出</button>`,
    react:`import { Button } from 'aicde-ui';\nimport { fxDone } from 'aicde-ui/fx';\n\n<Button variant="primary" size="lg" onClick={async e => {\n  const el = e.currentTarget;\n  await save();\n  fxDone(el);   // 成功了才呼叫，蓋上打勾\n}}>確認送出</Button>`,
    wire:['按下會壓扁，放開回彈過頭，外圈炸開、四角冒煙、出現「砰！」。這些都是自動的，照平常一樣監聽 click 就好。',
      '操作真的成功了，再呼叫 AUIFX.done(按鈕元素)（React 用 import { fxDone } from \'aicde-ui/fx\'），會蓋上一個打勾和「叮！」。失敗時不要呼叫。'],
    wireDemo(stage, say){ const b = stage.querySelector('[data-demo=primary]'); b.addEventListener('click', () => { say('click'); setTimeout(() => { window.AUIFX && AUIFX.done(b); say('AUIFX.done()'); }, 700); }); } },
  { id:'button', name:'次要按鈕', tag:'a-btn--secondary', how:'點一下。次要與外框按鈕比較低調，只有角落幾道速度線。',
    html:`<button class="a-btn a-btn--secondary">儲存草稿</button>\n<button class="a-btn a-btn--outline">取消</button>`,
    react:`import { Button } from 'aicde-ui';\n\n<Button variant="secondary">儲存草稿</Button>\n<Button variant="outline">取消</Button>`,
    wire:['次要、外框、文字按鈕的反應比較小：輕微壓扁和角落的速度線，不會出現擬聲字。'],
    wireDemo(stage, say){ stage.querySelectorAll('.a-btn').forEach(b => b.addEventListener('click', () => say('click'))); } },
  { id:'switch', name:'開關', tag:'a-switch', how:'打開，再關掉。',
    html:`<label class="a-switch"><input type="checkbox" role="switch"><span class="a-switch__track"><span class="a-switch__thumb"></span></span>接收通知</label>`,
    react:`import { Switch } from 'aicde-ui';\n\n<Switch onChange={on => console.log(on)}>接收通知</Switch>`,
    wire:['打開時滑塊撞到底，濺起火花和「咔！」；關掉時只冒一小朵煙。讀 checked、監聽 change，跟原生 checkbox 一樣。',
      '用程式改 checked 不會觸發特效，只有使用者自己切換才會。'],
    wireDemo(stage, say){ const i = stage.querySelector('input'); i.addEventListener('change', () => say('change：' + (i.checked ? '開' : '關'))); } },
  { id:'checkbox', name:'核取方塊', tag:'a-check', how:'勾起來。',
    html:`<div class="a-check-group a-check-group--vertical">\n  <label class="a-check"><input type="checkbox">記住這台裝置</label>\n  <label class="a-check"><input type="checkbox">訂閱電子報</label>\n</div>`,
    react:`import { Checkbox } from 'aicde-ui';\n\n<Checkbox onChange={on => console.log(on)}>記住這台裝置</Checkbox>`,
    wire:['勾選時兩道刀光繞著方框掃過、火花飛出、「唰！」；取消勾選只有一小朵煙。讀 checked、監聽 change。'],
    wireDemo(stage, say){ stage.querySelectorAll('input').forEach(i => i.addEventListener('change', () => say('change：' + (i.checked ? '勾選' : '取消')))); } },
  { id:'radio', name:'單選', tag:'a-check (radio)', how:'選另一個。',
    html:`<div class="a-check-group" role="radiogroup" aria-label="方案">\n  <label class="a-check"><input type="radio" name="fx-plan" value="month" checked>月繳</label>\n  <label class="a-check"><input type="radio" name="fx-plan" value="year">年繳</label>\n</div>`,
    react:`import { RadioGroup } from 'aicde-ui';\n\n<RadioGroup aria-label="方案" defaultValue="month"\n  options={[{ value: 'month', label: '月繳' }, { value: 'year', label: '年繳' }]}\n  onChange={v => console.log(v)} />`,
    wire:['選中的圓點彈進去，一扇速度線往上射、兩朵小煙、「啵！」。同一組用相同的 name，監聽 change。'],
    wireDemo(stage, say){ stage.querySelectorAll('input').forEach(i => i.addEventListener('change', () => say('change：' + i.value))); } },
  { id:'rating', name:'評分', tag:'a-rating', how:'給五顆星。',
    html:`<fieldset class="a-rating" aria-label="評分">\n  <input type="radio" name="fx-rate" id="fxr5" value="5"><label for="fxr5" aria-label="5 星">★</label>\n  <input type="radio" name="fx-rate" id="fxr4" value="4"><label for="fxr4" aria-label="4 星">★</label>\n  <input type="radio" name="fx-rate" id="fxr3" value="3"><label for="fxr3" aria-label="3 星">★</label>\n  <input type="radio" name="fx-rate" id="fxr2" value="2"><label for="fxr2" aria-label="2 星">★</label>\n  <input type="radio" name="fx-rate" id="fxr1" value="1"><label for="fxr1" aria-label="1 星">★</label>\n</fieldset>`,
    react:`import { Rating } from 'aicde-ui';\n\n<Rating aria-label="評分" onChange={n => console.log(n)} />`,
    wire:['星星一顆接一顆彈出；給滿分時整排炸開，出現「讚！」。監聽 change，值在被選中的 input 上。'],
    wireDemo(stage, say){ stage.querySelectorAll('input').forEach(i => i.addEventListener('change', () => say('change：' + i.value + ' 星'))); } },
  { id:'slider', name:'滑桿', tag:'a-slider', how:'快速拖過去，在還在動的時候放開。',
    html:`<div class="a-slider-row">\n  <input class="a-slider" type="range" min="0" max="100" value="30" aria-label="音量">\n  <span class="a-slider-value"></span>\n</div>`,
    react:`import { Slider } from 'aicde-ui';\n\n<Slider aria-label="音量" defaultValue={30} onChange={v => console.log(v)} />`,
    wire:['拖得夠快時，圓鈕後面會捲起煙；在移動中放開，一道刀光往前飛。慢慢拖不會有煙。監聽 input（拖曳中）和 change（放開）。'],
    wireDemo(stage, say){ const s = stage.querySelector('input'); s.addEventListener('change', () => say('change：' + s.value)); } },
  { id:'input', name:'輸入框', tag:'a-input', how:'點進去打字。',
    html:`<input class="a-input" placeholder="打幾個字看看" aria-label="輸入框">`,
    react:`import { Input } from 'aicde-ui';\n\n<Input aria-label="輸入框" placeholder="打幾個字看看" />`,
    wire:['每打一個字（或刪一個字），游標的位置就揚起一點灰。textarea 也一樣。用法和原本的 a-input 完全相同。'] },
  { id:'tabs', name:'標籤頁', tag:'a-tabs', how:'點另一個標籤，或用左右方向鍵。',
    html:`<div class="a-tabs">\n  <div class="a-tabs__list" role="tablist">\n    <button role="tab" aria-selected="true" aria-controls="fx-t1">總覽</button>\n    <button role="tab" aria-selected="false" aria-controls="fx-t2">成員</button>\n    <button role="tab" aria-selected="false" aria-controls="fx-t3">設定</button>\n  </div>\n  <div class="a-tabs__panel" role="tabpanel" id="fx-t1">專案共有 12 個頁面。</div>\n  <div class="a-tabs__panel" role="tabpanel" id="fx-t2" hidden>目前有 4 位成員。</div>\n  <div class="a-tabs__panel" role="tabpanel" id="fx-t3" hidden>通知已開啟。</div>\n</div>`,
    react:`import { Tabs } from 'aicde-ui';\n\n<Tabs items={[\n  { key: 'a', label: '總覽', children: '專案共有 12 個頁面。' },\n  { key: 'b', label: '成員', children: '目前有 4 位成員。' },\n  { key: 'c', label: '設定', children: '通知已開啟。' }\n]} />`,
    wire:['選到的標籤彈一下，兩側出現速度線和一朵煙。只在使用者切換時出現，程式改 aria-selected 不會觸發。'] },
  { id:'progress', name:'進度條', tag:'a-progress', how:'按「開始」。進度一段一段往前，前緣冒火花，到 100% 會炸開、打勾、「完成！」。', wide:true,
    html:`<div class="fx-prog">\n  <div class="a-progress"><div class="a-progress__track" role="progressbar" aria-label="上傳中" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="a-progress__bar" style="--v:0"></div></div><span class="fx-pct">0%</span></div>\n  <button class="a-btn a-btn--outline a-btn--sm" data-demo="run">開始</button>\n</div>`,
    react:`import { Progress } from 'aicde-ui';\n\n// value 是 0 到 100\n<Progress value={percent} label={percent + '%'} aria-label="上傳中" />`,
    wire:['把真正的進度寫進去：網頁版改 a-progress__bar 的 --v（0 到 1），React 版改 value（0 到 100）。數字變大時前緣冒火花，到 100% 時炸開、打勾、出現「完成！」。',
      '不確定模式（a-progress--indeterminate）沒有特效。'],
    wireDemo(stage, say){
      const bar = stage.querySelector('.a-progress__bar'), track = stage.querySelector('.a-progress__track'), pct = stage.querySelector('.fx-pct'), btn = stage.querySelector('[data-demo=run]');
      let t = null;
      const set = v => { bar.style.setProperty('--v', v); track.setAttribute('aria-valuenow', Math.round(v * 100)); pct.textContent = Math.round(v * 100) + '%'; };
      btn.addEventListener('click', () => {
        clearTimeout(t); set(0); say('開始');
        let v = 0;
        const step = () => { v = Math.min(1, v + .12 + Math.random() * .18); set(v); if(v < 1) t = setTimeout(step, 450 + Math.random() * 350); else say('完成'); };
        t = setTimeout(step, 400);
      });
    } },
  { id:'toast', name:'通知', tag:'a-toast', how:'按「儲存」。通知從右下角滑進來，落地揚起灰塵，「咻！」。',
    html:`<button class="a-btn a-btn--outline" data-a-toast="已儲存變更" data-a-toast-type="success">儲存</button>`,
    react:`import { toast, Toaster } from 'aicde-ui';\n\n// 在 App 放一次 <Toaster />\ntoast('已儲存變更', { type: 'success' });`,
    wire:['照平常一樣顯示通知（網頁版 AUI.toast() 或 data-a-toast，React 版 toast()），特效自動出現。通知要在有 data-fx 的範圍裡，網頁版的通知掛在 <body> 下，所以 data-fx 要加在 <html>。'] }
];

window.FX_API = [
  ['data-fx','開啟範圍裡所有元件的特效，可加在 <html> 或任何容器','不開'],
  ['data-fx="off"','在已開啟的範圍裡，關掉某一塊','—'],
  ['data-fx-word="off"','不出現擬聲字，其他特效照舊','出現'],
  ['data-fx-word="字"','加在元件上，換掉預設的擬聲字','砰！ 咔！ 唰！…'],
  ['--a-fx-hot / --a-fx-line / --a-fx-cloud / --a-fx-spark','爆炸、描邊、煙霧、火花的顏色','跟著主題'],
  ['AUIFX.done(el)','成功時呼叫：元件上蓋一個打勾和「叮！」','—'],
  ['AUIFX.impact(el)','不用點擊，直接播放一次打擊','—'],
  ['AUIFX.enable(root) / disable(root)','用程式開關特效','<html>'],
  ['AUIFX.burst / puff / sparks / ring / wedges / crescent / word / check','單獨畫一個效果，第一個參數是螢幕座標 x, y','—'],
  ["import 'aicde-ui/fx'",'React：載入特效層；<ThemeProvider fx> 開啟範圍','—'],
  ["fxDone(el) / fxImpact(el)",'React：同 AUIFX.done／impact，伺服器端呼叫時什麼都不做','—']
];

window.FX_LIMITS = [
  '特效畫在一張最上層的 canvas，可能會飛到對話框或固定的頁首上面。canvas 不擋點擊。',
  '開啟「減少動態效果」時，彈簧和所有特效都會關掉，元件照常運作。',
  '目前只在 Chromium 測過，還沒在 Safari、Firefox 和實體手機上試過。縮放用的是 CSS scale 屬性，需要 2022 年之後的瀏覽器。',
  '擬聲字用主題的字型畫，字型還沒載入時會用系統字型。'
];
