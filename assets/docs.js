/* ============================================================
   文件內容：元件頁（COMPONENTS）與動畫程式碼（SNIPPETS）
   ============================================================ */
const ICON_SEARCH = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
const ICON_PLUS = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>';
const ICON_ARROW = '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

window.COMP_GROUPS = [
  { id:'general',  name:'通用' },
  { id:'nav',      name:'導覽' },
  { id:'entry',    name:'資料輸入' },
  { id:'display',  name:'資料展示' },
  { id:'feedback', name:'回饋' }
];

window.COMPONENTS = [
  {
    id:'button', group:'general', name:'按鈕', en:'Button',
    desc:'觸發一個操作。主要按鈕用珊瑚紅，一個區塊最多一個；其他動作用次要、外框或文字按鈕。',
    when:['送出表單、開啟對話框等主要操作','同一區塊有多個操作時，用不同變體區分主次','需要載入狀態時加上 is-loading，避免重複送出'],
    demos:[
      { title:'變體', desc:'primary 用於最主要的操作；secondary 次要；outline 和 ghost 用於較弱的操作。',
        html:`<button class="a-btn a-btn--primary">主要按鈕</button>
<button class="a-btn a-btn--secondary">次要按鈕</button>
<button class="a-btn a-btn--outline">外框按鈕</button>
<button class="a-btn a-btn--ghost">文字按鈕</button>` },
      { title:'尺寸', desc:'sm 32px、預設 40px、lg 48px，高度都落在 8 的倍數上。',
        html:`<button class="a-btn a-btn--primary a-btn--sm">小</button>
<button class="a-btn a-btn--primary">中</button>
<button class="a-btn a-btn--primary a-btn--lg">大</button>` },
      { title:'圖示', desc:'圖示放在文字前或後；只有圖示時加 a-btn--icon，並寫 aria-label。',
        html:`<button class="a-btn a-btn--secondary">${ICON_PLUS}新增</button>
<button class="a-btn a-btn--outline">下一步${ICON_ARROW}</button>
<button class="a-btn a-btn--outline a-btn--icon" aria-label="搜尋">${ICON_SEARCH}</button>` },
      { title:'狀態', desc:'載入中用 is-loading，會顯示轉圈並停用點擊；停用用 disabled 屬性。',
        html:`<button class="a-btn a-btn--primary is-loading">儲存中</button>
<button class="a-btn a-btn--primary" disabled>無法送出</button>` },
      { title:'滿版', desc:'手機版表單常用，按鈕撐滿容器寬度。',
        html:`<button class="a-btn a-btn--primary a-btn--block">建立帳號</button>` }
    ],
    api:[
      ['a-btn','基本樣式，必填','—'],
      ['a-btn--primary / --secondary / --outline / --ghost','變體','預設無底色'],
      ['a-btn--sm / --lg','尺寸','預設 40px'],
      ['a-btn--block','撐滿寬度','—'],
      ['a-btn--icon','只有圖示的正方形按鈕','—'],
      ['is-loading','載入中，顯示轉圈並停用點擊','—'],
      ['disabled','停用（HTML 屬性）','—']
    ]
  },
  {
    id:'tabs', js:true, group:'nav', name:'標籤頁', en:'Tabs',
    desc:'在同一個區域切換不同內容。底線指示器用 transform 滑到選中的標籤，內容切換時輕微淡入。',
    when:['同一層級、互斥的內容分組，例如「總覽／設定／紀錄」','選項 2–6 個；超過時考慮下拉選單或側邊導覽','需要比較的內容不要拆在不同標籤裡'],
    demos:[
      { title:'基本', desc:'點擊或用左右方向鍵切換，底線會從目前位置滑過去。',
        html:`<div class="a-tabs">
  <div class="a-tabs__list" role="tablist">
    <button role="tab" aria-selected="true" aria-controls="tab-a1">總覽</button>
    <button role="tab" aria-selected="false" aria-controls="tab-a2">動畫設定</button>
    <button role="tab" aria-selected="false" aria-controls="tab-a3">紀錄</button>
  </div>
  <div class="a-tabs__panel" role="tabpanel" id="tab-a1">專案共有 36 個動畫、9 個元件。</div>
  <div class="a-tabs__panel" role="tabpanel" id="tab-a2" hidden>預設時長 200ms，曲線 ease-out。</div>
  <div class="a-tabs__panel" role="tabpanel" id="tab-a3" hidden>最近一次更新：今天 15:30。</div>
</div>` },
      { title:'膠囊樣式', desc:'加上 a-tabs--pill，適合放在工具列或小區塊切換檢視方式。',
        html:`<div class="a-tabs a-tabs--pill">
  <div class="a-tabs__list" role="tablist">
    <button role="tab" aria-selected="true" aria-controls="tab-b1">日</button>
    <button role="tab" aria-selected="false" aria-controls="tab-b2">週</button>
    <button role="tab" aria-selected="false" aria-controls="tab-b3">月</button>
  </div>
  <div class="a-tabs__panel" role="tabpanel" id="tab-b1">今天新增 12 位使用者。</div>
  <div class="a-tabs__panel" role="tabpanel" id="tab-b2" hidden>本週新增 84 位使用者。</div>
  <div class="a-tabs__panel" role="tabpanel" id="tab-b3" hidden>本月新增 352 位使用者。</div>
</div>` }
    ],
    api:[
      ['a-tabs','外層，必填','—'],
      ['a-tabs__list[role=tablist]','標籤列','—'],
      ['[role=tab][aria-selected][aria-controls]','標籤；aria-controls 指向面板 id','—'],
      ['a-tabs__panel[role=tabpanel]','內容面板，未選中的加 hidden','—'],
      ['a-tabs--pill','膠囊樣式','底線樣式'],
      ['AUI.init(容器)','動態插入後呼叫，計算指示器位置','載入時自動執行']
    ]
  },
  {
    id:'pagination', js:true, group:'nav', name:'分頁', en:'Pagination',
    desc:'把長列表分成多頁。只要寫總頁數和目前頁數，按鈕與省略號由 aicde-ui.js 產生。',
    when:['資料量大、需要跳到特定頁數時','使用者需要知道「總共有多少」','連續瀏覽的內容（動態、消息）改用無限捲動或「載入更多」'],
    demos:[
      { title:'基本', desc:'頁數少於 8 頁時全部列出。',
        html:`<nav class="a-pagination" aria-label="分頁" data-total="5" data-current="2"></nav>` },
      { title:'大量頁數', desc:'頁數多時保留首頁、尾頁與目前頁附近，其餘用省略號。換頁時會觸發 a-page 事件。',
        html:`<nav class="a-pagination" aria-label="分頁" data-total="24" data-current="12"></nav>` }
    ],
    api:[
      ['a-pagination','外層 nav，必填','—'],
      ['data-total','總頁數','1'],
      ['data-current','目前頁數','1'],
      ['a-page 事件','換頁時觸發，event.detail 為新頁數','—'],
      ['AUI.init(容器)','動態插入後呼叫，產生按鈕','載入時自動執行']
    ]
  },
  {
    id:'dropdown', js:true, group:'nav', name:'下拉選單', en:'Dropdown',
    desc:'把次要的操作收進選單。選單從觸發按鈕的位置長出來，點外面或按 Esc 關閉。',
    when:['操作超過 3 個，不想全部攤在畫面上','「更多」按鈕裡的次要操作','需要選一個值時，改用下拉選擇（select）'],
    demos:[
      { title:'基本', desc:'從 scale(0.95) 加淡入展開，200ms ease-out，原點在左上角。',
        html:`<div class="a-dropdown">
  <button class="a-btn a-btn--outline" data-a-dropdown aria-haspopup="menu" aria-expanded="false">排序方式 ▾</button>
  <div class="a-dropdown__menu" role="menu">
    <button role="menuitem">最新</button>
    <button role="menuitem">最熱門</button>
    <button role="menuitem">名稱 A–Z</button>
  </div>
</div>` },
      { title:'靠右與分隔線', desc:'放在畫面右側時加 a-dropdown--right，選單改從右上角長出來；危險操作用 is-danger 並放在最後。',
        html:`<div class="a-dropdown a-dropdown--right" style="margin-left:auto">
  <button class="a-btn a-btn--ghost a-btn--icon" data-a-dropdown aria-haspopup="menu" aria-expanded="false" aria-label="更多">⋯</button>
  <div class="a-dropdown__menu" role="menu">
    <button role="menuitem">重新命名</button>
    <button role="menuitem">複製連結</button>
    <div class="a-dropdown__sep"></div>
    <button role="menuitem" class="is-danger">刪除</button>
  </div>
</div>` }
    ],
    api:[
      ['a-dropdown','外層，必填','—'],
      ['[data-a-dropdown]','觸發按鈕','—'],
      ['a-dropdown__menu[role=menu]','選單','—'],
      ['[role=menuitem]','選項，點擊後自動關閉','—'],
      ['a-dropdown--right','靠右對齊','靠左'],
      ['a-dropdown__sep / is-danger','分隔線／危險操作','—']
    ]
  },
  {
    id:'input', group:'entry', name:'輸入框', en:'Input',
    desc:'讓使用者輸入文字。搭配 a-field 加上標籤與說明文字，錯誤時整組變紅。',
    when:['需要使用者輸入一行文字','表單欄位需要標籤、提示或錯誤訊息','搜尋框可以在左側放圖示'],
    demos:[
      { title:'基本', desc:'placeholder 只放範例，不要拿來當標籤。',
        html:`<input class="a-input" placeholder="例如：王小明">` },
      { title:'標籤與說明', desc:'a-field 包住 label、輸入框與說明文字。',
        html:`<label class="a-field">
  <span class="a-label">電子郵件</span>
  <input class="a-input" type="email" placeholder="name@example.com">
  <span class="a-help">我們只會用來寄送收據。</span>
</label>` },
      { title:'錯誤狀態', desc:'在 a-field 加上 is-error，說明文字寫出原因與解法。',
        html:`<label class="a-field is-error">
  <span class="a-label">密碼</span>
  <input class="a-input" type="password" value="1234" aria-invalid="true">
  <span class="a-help">密碼至少需要 8 個字元。</span>
</label>` },
      { title:'圖示與尺寸', desc:'圖示放在 a-input-wrap 裡；尺寸與按鈕一致，方便並排。',
        html:`<span class="a-input-wrap">${ICON_SEARCH}<input class="a-input a-input--lg" placeholder="搜尋元件…"></span>
<input class="a-input a-input--sm" placeholder="小尺寸">
<input class="a-input" placeholder="停用" disabled>` }
    ],
    api:[
      ['a-input','輸入框，必填','高度 40px'],
      ['a-input--sm / --lg','尺寸','32px / 48px'],
      ['a-field','外層，垂直排列標籤、輸入框、說明','—'],
      ['a-label / a-help','標籤／說明文字','—'],
      ['is-error','加在 a-field 上，整組變成錯誤樣式','—'],
      ['a-input-wrap','左側放圖示的外層','—'],
      ['disabled','停用（HTML 屬性）','—']
    ]
  },
  {
    id:'switch', group:'entry', name:'開關', en:'Switch',
    desc:'切換兩種狀態，切換後立即生效。底層是原生 checkbox，鍵盤與螢幕報讀器都能使用。',
    when:['設定項目的開／關，切換後立即生效','需要按「儲存」才生效的選項，改用 checkbox'],
    demos:[
      { title:'基本', desc:'點擊或按空白鍵切換；圓點用 transform 移動，200ms ease-out。',
        html:`<label class="a-switch"><input type="checkbox" role="switch" checked><span class="a-switch__track"><span class="a-switch__thumb"></span></span>接收通知</label>
<label class="a-switch"><input type="checkbox" role="switch"><span class="a-switch__track"><span class="a-switch__thumb"></span></span>深色模式</label>` },
      { title:'尺寸與停用', desc:'a-switch--sm 用在表格或密集的列表；停用時降低透明度。',
        html:`<label class="a-switch a-switch--sm"><input type="checkbox" role="switch" checked><span class="a-switch__track"><span class="a-switch__thumb"></span></span>小尺寸</label>
<label class="a-switch"><input type="checkbox" role="switch" disabled><span class="a-switch__track"><span class="a-switch__thumb"></span></span>停用</label>` }
    ],
    api:[
      ['a-switch','外層 label，必填','—'],
      ['input[type=checkbox][role=switch]','實際的開關狀態，用 checked 控制','—'],
      ['a-switch__track / a-switch__thumb','軌道與圓點','—'],
      ['a-switch--sm','小尺寸','36×20px'],
      ['disabled','停用（加在 input 上）','—']
    ]
  },
  {
    id:'card', group:'display', name:'卡片', en:'Card',
    desc:'把一組相關資訊包在一起：圖片、標題、說明與操作。可點擊的卡片 hover 時浮起。',
    when:['列表中每個項目資訊較多，例如文章、商品、專案','需要整張可以點進去時，用 a-card--interactive 並把卡片做成 a 標籤','資訊很少時直接用列表，不要硬包成卡片'],
    demos:[
      { title:'基本', desc:'圖片、標題、說明、操作按鈕。圓角 16px，內距 20px。',
        html:`<article class="a-card" style="width:300px">
  <div class="a-card__media"><img src="assets/visual/aicde-visual-018.webp" alt=""></div>
  <div class="a-card__body">
    <span class="a-card__eyebrow">案例</span>
    <h3 class="a-card__title">暖白分層剪紙</h3>
    <p class="a-card__text">用少量紙片建立近、中、遠景，層與層之間保留柔和陰影。</p>
  </div>
  <div class="a-card__footer">
    <button class="a-btn a-btn--primary a-btn--sm">查看</button>
    <button class="a-btn a-btn--ghost a-btn--sm">收藏</button>
  </div>
</article>` },
      { title:'可點擊', desc:'整張卡片是連結，hover 時往上浮 4px，按下時微縮。',
        html:`<a class="a-card a-card--interactive" href="#/c/card" style="width:300px">
  <div class="a-card__body" style="padding-bottom:20px">
    <span class="a-card__eyebrow">元件</span>
    <h3 class="a-card__title">把滑鼠移上來</h3>
    <p class="a-card__text">浮起用 transform，不改變排版，所以不會推動旁邊的卡片。</p>
  </div>
</a>` },
      { title:'橫向與外框', desc:'a-card--horizontal 圖片在左；a-card--outline 去掉陰影，適合放在已經有底色的區塊。',
        html:`<article class="a-card a-card--horizontal a-card--outline" style="width:420px">
  <div class="a-card__media"><img src="assets/visual/aicde-visual-001.webp" alt=""></div>
  <div class="a-card__body">
    <h3 class="a-card__title">稚拙復古混合媒材</h3>
    <p class="a-card__text">鉛筆、彩紙和不透明顏料混用。</p>
  </div>
</article>` }
    ],
    api:[
      ['a-card','外層，必填','有陰影'],
      ['a-card__media / __body / __footer','圖片區／內容區／操作區','—'],
      ['a-card__eyebrow / __title / __text','小標／標題／說明','—'],
      ['a-card--interactive','整張可點擊，hover 浮起','—'],
      ['a-card--outline','只有外框、沒有陰影','—'],
      ['a-card--horizontal','圖片在左的橫向排列','直向']
    ]
  },
  {
    id:'modal', js:true, group:'feedback', name:'對話框', en:'Modal',
    desc:'打斷目前流程，請使用者確認或補充資訊。用原生 dialog，焦點鎖定與 Esc 關閉都是瀏覽器內建的。',
    when:['需要使用者確認才能繼續，例如刪除','簡短的表單，不想離開目前頁面','只是告知訊息時改用 Toast，不要打斷使用者'],
    demos:[
      { title:'確認對話框', desc:'點背景、按 Esc 或取消都會關閉。進場 220ms，退場 160ms，退場比進場快。',
        html:`<button class="a-btn a-btn--outline" data-a-open="modal-demo">刪除專案</button>
<dialog class="a-modal" id="modal-demo" aria-labelledby="modal-demo-title">
  <div class="a-modal__panel">
    <h3 class="a-modal__title" id="modal-demo-title">刪除「官網改版」？</h3>
    <p class="a-modal__body">專案內的 12 個頁面會一起刪除，這個動作無法復原。</p>
    <div class="a-modal__footer">
      <button class="a-btn a-btn--ghost" data-a-close>取消</button>
      <button class="a-btn a-btn--primary" data-a-close>刪除 12 個頁面</button>
    </div>
  </div>
</dialog>` },
      { title:'表單', desc:'對話框裡可以放任何內容；第一個輸入框會自動取得焦點。',
        html:`<button class="a-btn a-btn--secondary" data-a-open="modal-form">邀請成員</button>
<dialog class="a-modal" id="modal-form" aria-labelledby="modal-form-title">
  <form class="a-modal__panel" method="dialog">
    <h3 class="a-modal__title" id="modal-form-title">邀請成員</h3>
    <label class="a-field"><span class="a-label">電子郵件</span><input class="a-input" type="email" placeholder="name@example.com" autofocus></label>
    <div class="a-modal__footer">
      <button class="a-btn a-btn--ghost" type="button" data-a-close>取消</button>
      <button class="a-btn a-btn--primary">送出邀請</button>
    </div>
  </form>
</dialog>` }
    ],
    api:[
      ['dialog.a-modal','對話框本體（原生 dialog）','—'],
      ['a-modal__panel / __title / __body / __footer','面板／標題／內文／操作列','—'],
      ['[data-a-open="id"]','點擊後開啟指定 id 的對話框','—'],
      ['[data-a-close]','點擊後關閉所在的對話框','—'],
      ['AUI.openModal(el) / AUI.closeModal(el)','用 JS 開關，關閉時會播退場動畫','—']
    ]
  },
  {
    id:'toast', js:true, group:'feedback', name:'通知', en:'Toast',
    desc:'操作完成後的短暫回饋，不打斷使用者。從右下角滑入，3.2 秒後自動消失，滑鼠停留時暫停。',
    when:['回報操作結果：已儲存、已複製、上傳失敗','訊息不需要使用者回應','需要使用者決定的事改用對話框'],
    demos:[
      { title:'類型', desc:'在按鈕上寫 data-a-toast 就能觸發，不用寫 JS；最多同時顯示 4 則。',
        html:`<button class="a-btn a-btn--outline" data-a-toast="已儲存變更" data-a-toast-type="success">成功</button>
<button class="a-btn a-btn--outline" data-a-toast="上傳失敗，請重試" data-a-toast-type="error">錯誤</button>
<button class="a-btn a-btn--outline" data-a-toast="有 3 位成員加入專案">一般</button>` },
      { title:'用 JS 呼叫', desc:'AUI.toast(訊息, { type, duration })，回傳一個可以提早關閉的函式。',
        html:`<button class="a-btn a-btn--primary" onclick="AUI.toast('連結已複製', { type: 'success', duration: 2000 })">複製連結</button>` }
    ],
    api:[
      ['AUI.toast(message, options)','顯示一則通知，回傳關閉函式','—'],
      ['options.type','success／error，不填為一般','一般'],
      ['options.duration','顯示多久（毫秒）','3200'],
      ['[data-a-toast="訊息"]','點擊按鈕就顯示通知','—'],
      ['[data-a-toast-type]','通知類型','—']
    ]
  }
];

/* ---------- 動畫程式碼：預覽區直接執行這份程式碼，所以複製下來就能用 ---------- */
window.SNIPPETS = {
  'motion-decisions': {
    height:300,
    html:`<div class="pop">
  <button class="pop-trigger" aria-expanded="false" aria-controls="pop-menu">選項 ▾</button>
  <div class="pop-menu" id="pop-menu" role="menu">
    <button role="menuitem">複製連結</button>
    <button role="menuitem">重新命名</button>
    <button role="menuitem">移到資料夾</button>
  </div>
</div>`,
    css:`:root { --ease-out: cubic-bezier(0.22, 1, 0.36, 1); }

.pop { position: relative; display: inline-block; margin-bottom: 140px; }

.pop-trigger {
  height: 36px; padding: 0 16px; border: 0; border-radius: 8px;
  background: #173f50; color: #fff; font: 500 14px/1 system-ui, sans-serif; cursor: pointer;
  transition: transform 160ms var(--ease-out);
}
.pop-trigger:active { transform: scale(0.97); }

.pop-menu {
  position: absolute; top: calc(100% + 8px); left: 0; min-width: 176px; padding: 6px;
  background: #fff; border: 1px solid #e3e6ea; border-radius: 12px;
  box-shadow: 0 12px 28px -16px rgba(23, 63, 80, 0.35);
  /* 從觸發按鈕的位置長出來，不從中心、也不從 scale(0) */
  transform-origin: top left;
  transform: scale(0.95);
  opacity: 0;
  pointer-events: none;
  transition: transform 200ms var(--ease-out), opacity 200ms var(--ease-out);
}
.pop.open .pop-menu { transform: scale(1); opacity: 1; pointer-events: auto; }

.pop-menu button {
  display: block; width: 100%; padding: 8px 10px; border: 0; border-radius: 8px;
  background: none; text-align: left; font: 14px system-ui, sans-serif; color: #1d1d1f; cursor: pointer;
}
.pop-menu button:hover { background: #e6edf0; }

@media (prefers-reduced-motion: reduce) {
  .pop-menu { transform: none; transition: opacity 150ms; }
}`,
    js:`const pop = document.querySelector('.pop');
const trigger = pop.querySelector('.pop-trigger');

function setOpen(open) {
  pop.classList.toggle('open', open);
  trigger.setAttribute('aria-expanded', open);
}

trigger.addEventListener('click', () => setOpen(!pop.classList.contains('open')));
document.addEventListener('click', e => { if (!pop.contains(e.target)) setOpen(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });`,
    params:[
      ['時長','200ms','選單屬於 150–250ms 的區間；按鈕按壓回饋 160ms'],
      ['緩動','cubic-bezier(0.22, 1, 0.36, 1)','ease-out：一開始就動，感覺回應快'],
      ['起始狀態','scale(0.95) + opacity: 0','不從 scale(0) 開始，現實中東西不會憑空出現'],
      ['原點','transform-origin: top left','從觸發按鈕的位置長出來'],
      ['動畫屬性','transform、opacity','只動這兩個，不會觸發重排'],
      ['可打斷','是','用 transition，連點時會從當下狀態反轉'],
      ['減少動態','只保留淡入','尊重 prefers-reduced-motion']
    ]
  },

  'mobile-gesture': {
    height:480,
    html:`<div class="phone">
  <div class="sheet" id="sheet">
    <div class="handle"></div>
    <p>往下拖曳收起，往上拖曳展開。<br>用力甩一下，會依速度決定停在哪裡。</p>
  </div>
</div>`,
    css:`.phone {
  position: relative; width: 260px; height: 420px; overflow: hidden;
  border: 8px solid #173f50; border-radius: 32px; background: #fff;
}
.sheet {
  position: absolute; left: 0; right: 0; bottom: 0; height: 70%;
  padding: 12px 16px; border-radius: 20px 20px 0 0;
  background: #fc5454; color: #fff; font: 14px/1.6 system-ui, sans-serif;
  cursor: grab; touch-action: none; will-change: transform;
}
.sheet:active { cursor: grabbing; }
.handle { width: 40px; height: 5px; margin: 0 auto 12px; border-radius: 3px; background: rgba(255, 255, 255, 0.7); }`,
    js:`const sheet = document.getElementById('sheet');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let y = 0, startY = 0, startPos = 0, lastY = 0, lastT = 0, velocity = 0, raf = 0;

const maxY = () => sheet.offsetHeight - 48;          // 收起時露出 48px
const render = v => { y = v; sheet.style.transform = 'translateY(' + v + 'px)'; };
const rubber = v => (v < 0 ? v * 0.3 : v);           // 往上超出時有阻力

// 彈簧：從目前位置與速度出發，所以隨時可以被打斷
function springTo(target, v0) {
  cancelAnimationFrame(raf);
  if (reduce) return render(target);
  const stiffness = 300, damping = 28;
  let x = y, v = v0, last = performance.now();
  const step = t => {
    const dt = Math.min(0.032, (t - last) / 1000); last = t;
    v += (-stiffness * (x - target) - damping * v) * dt;
    x += v * dt;
    render(x);
    if (Math.abs(v) > 0.5 || Math.abs(x - target) > 0.5) raf = requestAnimationFrame(step);
    else render(target);
  };
  raf = requestAnimationFrame(step);
}

sheet.addEventListener('pointerdown', e => {
  cancelAnimationFrame(raf);
  sheet.setPointerCapture(e.pointerId);
  startY = lastY = e.clientY; startPos = y; lastT = performance.now(); velocity = 0;
});

sheet.addEventListener('pointermove', e => {
  if (!sheet.hasPointerCapture(e.pointerId)) return;
  const now = performance.now();
  velocity = (e.clientY - lastY) / Math.max(1, now - lastT) * 1000;
  lastY = e.clientY; lastT = now;
  render(rubber(startPos + e.clientY - startY));     // 1:1 跟手
});

sheet.addEventListener('pointerup', () => {
  const projected = y + velocity * 0.2;              // 依放手速度預測落點
  springTo(projected > maxY() / 2 ? maxY() : 0, velocity);
});`,
    params:[
      ['跟手','1:1','拖曳時元素和手指的位移完全相同'],
      ['邊界阻力','超出部分 × 0.3','往上拉超過頂端會變重（rubber-banding）'],
      ['彈簧','stiffness 300、damping 28','沒有固定時長，由物理參數決定'],
      ['速度接續','放手速度 → 彈簧初速','拖曳和動畫之間沒有斷點'],
      ['落點預測','位置 + 速度 × 0.2s','輕甩也能收起或展開'],
      ['動畫屬性','transform','用 translateY，不動 top 或 height'],
      ['減少動態','直接跳到終點','尊重 prefers-reduced-motion']
    ]
  },

  'motion-opportunities': {
    height:340,
    html:`<ul class="list">
  <li>鍵盤快捷鍵開啟面板<span class="tag no">拒絕</span></li>
  <li>Toast 從同一側進出<span class="tag yes">採用</span></li>
  <li>首次完成的慶祝<span class="tag yes">採用</span></li>
  <li>列表 hover 放大<span class="tag no">拒絕</span></li>
</ul>
<button class="replay">重播</button>`,
    css:`:root { --ease-out: cubic-bezier(0.22, 1, 0.36, 1); }

body { flex-direction: column; gap: 16px; }
.list { width: 300px; margin: 0; padding: 0; list-style: none; display: grid; gap: 8px; }
.list li {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 14px; border: 1px solid #e3e6ea; border-radius: 12px; background: #fff;
  font: 14px system-ui, sans-serif; color: #1d1d1f;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 260ms var(--ease-out), transform 260ms var(--ease-out);
  transition-delay: calc(var(--i) * 60ms);           /* 每項晚 60ms 出現 */
}
.list.in li { opacity: 1; transform: none; }
.list:not(.in) li { transition: none; }              /* 重播時瞬間歸位 */

.tag { font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 6px; }
.tag.yes { background: #dff3ea; color: #1f9d6b; }
.tag.no { background: #fde3e3; color: #e43f3f; }

.replay { height: 32px; padding: 0 12px; border: 1px solid #cfd6db; border-radius: 8px; background: #fff; cursor: pointer; }

@media (prefers-reduced-motion: reduce) {
  .list li { transform: none; transition-delay: 0ms; }
}`,
    js:`const list = document.querySelector('.list');
list.querySelectorAll('li').forEach((li, i) => li.style.setProperty('--i', i));

function play() {
  list.classList.remove('in');
  requestAnimationFrame(() => requestAnimationFrame(() => list.classList.add('in')));
}

document.querySelector('.replay').addEventListener('click', play);
play();`,
    params:[
      ['單項時長','260ms','每一項的淡入與位移'],
      ['間隔','60ms','項目越多間隔越短，總時長控制在 500ms 內'],
      ['位移','translateY(8px) → 0','距離短，只是暗示方向'],
      ['緩動','cubic-bezier(0.22, 1, 0.36, 1)','ease-out'],
      ['動畫屬性','transform、opacity','不會觸發重排'],
      ['使用時機','頁面首次載入、篩選結果更新','每天看上百次的列表不要加'],
      ['減少動態','只保留淡入、不延遲','尊重 prefers-reduced-motion']
    ]
  }
};
