/* 第二批元件文件：載入順序在 docs.js 之後 */
(() => {
const ICON = {
  info:'<svg class="a-alert__icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  ok:'<svg class="a-alert__icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg>',
  warn:'<svg class="a-alert__icon" viewBox="0 0 24 24"><path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4M12 17h.01"/></svg>',
  err:'<svg class="a-alert__icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>'
};

window.COMPONENTS.push(
/* ================= 通用 ================= */
{
  id:'divider', group:'general', name:'分隔線', en:'Divider',
  desc:'區隔內容區塊。可以加文字，也可以直立放在文字之間。',
  when:['同一張卡片或表單裡，把不同段落分開','分隔一排連結或操作，用直立分隔線','區塊之間已經有足夠留白時，不需要再加線'],
  demos:[
    { title:'水平', desc:'單純的線、置中文字、靠左文字三種。',
      html:`<div style="width:100%">
  <p style="margin:0">登入後可以同步收藏。</p>
  <div class="a-divider"></div>
  <div class="a-divider">或使用以下方式</div>
  <div class="a-divider a-divider--left">進階設定</div>
</div>` },
    { title:'直立', desc:'放在行內文字或連結之間，高度跟著文字。',
      html:`<span>編輯</span><span class="a-divider a-divider--vertical"></span><span>複製</span><span class="a-divider a-divider--vertical"></span><span>刪除</span>` }
  ],
  api:[
    ['a-divider','水平分隔線；有文字時文字置中','—'],
    ['a-divider--left','文字靠左','置中'],
    ['a-divider--vertical','直立分隔線（行內）','—']
  ]
},

/* ================= 導覽 ================= */
{
  id:'breadcrumb', group:'nav', name:'麵包屑', en:'Breadcrumb',
  desc:'顯示目前頁面在網站裡的位置，並能快速回到上層。',
  when:['網站有 3 層以上的階層','使用者可能從搜尋直接進到深層頁面','只有一兩層的網站不需要'],
  demos:[
    { title:'基本', desc:'最後一項是目前頁面，用 aria-current 標記，不做成連結。',
      html:`<nav class="a-breadcrumb" aria-label="麵包屑">
  <ol>
    <li><a href="#/">首頁</a></li>
    <li><a href="#/">元件</a></li>
    <li><a href="#/">導覽</a></li>
    <li aria-current="page">麵包屑</li>
  </ol>
</nav>` }
  ],
  api:[
    ['nav.a-breadcrumb > ol > li','結構，必填','—'],
    ['[aria-current="page"]','目前頁面','—']
  ]
},
{
  id:'steps', group:'nav', name:'步驟條', en:'Steps',
  desc:'把一個長流程拆成幾步，讓使用者知道現在在哪、還剩多少。',
  when:['註冊、結帳、設定精靈等有固定順序的流程','步驟 3–5 個最容易理解','沒有先後順序的內容改用標籤頁'],
  demos:[
    { title:'基本', desc:'完成的步驟打勾，目前步驟用珊瑚紅並加一圈光暈。',
      html:`<ol class="a-steps" id="steps-a">
  <li class="is-done">建立帳號<span class="a-steps__desc">已完成</span></li>
  <li class="is-current" aria-current="step">填寫資料<span class="a-steps__desc">進行中</span></li>
  <li>選擇方案</li>
  <li>完成</li>
</ol>` },
    { title:'切換步驟', desc:'在按鈕加 data-a-steps="步驟條 id"，data-dir="-1" 代表上一步。',
      html:`<div style="width:100%;display:flex;flex-direction:column;gap:24px">
  <ol class="a-steps" id="steps-b">
    <li class="is-current" aria-current="step">上傳</li>
    <li>裁切</li>
    <li>發布</li>
  </ol>
  <div style="display:flex;gap:8px">
    <button class="a-btn a-btn--outline a-btn--sm" data-a-steps="steps-b" data-dir="-1">上一步</button>
    <button class="a-btn a-btn--primary a-btn--sm" data-a-steps="steps-b">下一步</button>
  </div>
</div>` }
  ],
  api:[
    ['ol.a-steps > li','步驟，數字自動編號','—'],
    ['is-done / is-current','已完成／目前步驟','未開始'],
    ['a-steps__desc','步驟下方的說明','—'],
    ['[data-a-steps="id"][data-dir]','切換按鈕；dir 為 1 或 -1','1']
  ]
},

/* ================= 資料輸入 ================= */
{
  id:'textarea', group:'entry', name:'多行輸入', en:'Textarea',
  desc:'輸入較長的文字。設定 maxlength 時會自動顯示字數，接近上限時變紅。',
  when:['留言、描述、意見回饋等超過一行的內容','只需要一行的內容用輸入框','需要格式（粗體、清單）時改用編輯器'],
  demos:[
    { title:'字數統計', desc:'加上 maxlength 和 a-field__count，aicde-ui.js 會即時更新字數。',
      html:`<label class="a-field" style="width:100%;max-width:420px">
  <span class="a-label">專案描述</span>
  <textarea class="a-input a-textarea" maxlength="120" placeholder="這個專案想解決什麼問題？"></textarea>
  <span class="a-field__count"></span>
</label>` },
    { title:'錯誤狀態', desc:'和輸入框共用 is-error。',
      html:`<label class="a-field is-error" style="width:100%;max-width:420px">
  <span class="a-label">退款原因</span>
  <textarea class="a-input a-textarea" rows="3"></textarea>
  <span class="a-help">請至少寫 10 個字，方便我們處理。</span>
</label>` }
  ],
  api:[
    ['textarea.a-input.a-textarea','多行輸入框','最小高度 96px'],
    ['maxlength','字數上限','—'],
    ['a-field__count','字數顯示，放在 a-field 裡','—']
  ]
},
{
  id:'select', group:'entry', name:'下拉選擇', en:'Select',
  desc:'從固定選項中選一個。用原生 select，手機上會跳出系統的選擇器。',
  when:['選項 5 個以上、只能選一個','選項 2–4 個時，用單選或分段控制器更快','需要搜尋選項時改用自動完成'],
  demos:[
    { title:'基本', desc:'外觀和輸入框一致，右側加上箭頭。',
      html:`<label class="a-field" style="width:240px">
  <span class="a-label">地區</span>
  <select class="a-input a-select">
    <option>台北市</option><option>新北市</option><option>台中市</option><option>台南市</option><option>高雄市</option>
  </select>
</label>
<label class="a-field" style="width:240px">
  <span class="a-label">排序</span>
  <select class="a-input a-select" disabled><option>最新</option></select>
</label>` }
  ],
  api:[
    ['select.a-input.a-select','下拉選擇','—'],
    ['a-input--sm / a-input--lg','尺寸，與輸入框相同','40px'],
    ['disabled','停用','—']
  ]
},
{
  id:'checkbox', group:'entry', name:'核取方塊', en:'Checkbox',
  desc:'從多個選項中勾選任意幾個。按下時微縮，勾選後換成珊瑚紅。',
  when:['可以複選的選項','需要按「送出」才生效的設定','單一、立即生效的開關改用開關元件'],
  demos:[
    { title:'基本', desc:'包在 label 裡，點文字也能勾選。',
      html:`<div class="a-check-group">
  <label class="a-check"><input type="checkbox" checked>電子報</label>
  <label class="a-check"><input type="checkbox">活動通知</label>
  <label class="a-check"><input type="checkbox" data-indeterminate>部分選取</label>
  <label class="a-check"><input type="checkbox" disabled>停用</label>
</div>` },
    { title:'直向排列', desc:'選項文字較長時改成直向。',
      html:`<div class="a-check-group a-check-group--vertical">
  <label class="a-check"><input type="checkbox" checked>我已閱讀並同意服務條款</label>
  <label class="a-check"><input type="checkbox">記住這台裝置 30 天</label>
</div>` }
  ],
  api:[
    ['label.a-check > input[type=checkbox]','核取方塊','—'],
    ['a-check-group','選項群組，橫向排列','—'],
    ['a-check-group--vertical','直向排列','橫向'],
    ['data-indeterminate','部分選取狀態（由 JS 設定）','—']
  ]
},
{
  id:'radio', group:'entry', name:'單選', en:'Radio',
  desc:'從幾個選項中只能選一個，所有選項同時攤開，一眼就能比較。',
  when:['2–5 個互斥選項，而且需要讓使用者看到全部','選項太多時改用下拉選擇','選項短、像在切換檢視時，改用分段控制器'],
  demos:[
    { title:'基本', desc:'同一組用相同的 name；選中時邊框加粗成實心圈。',
      html:`<div class="a-check-group" role="radiogroup" aria-label="付款方式">
  <label class="a-check"><input type="radio" name="pay" checked>信用卡</label>
  <label class="a-check"><input type="radio" name="pay">轉帳</label>
  <label class="a-check"><input type="radio" name="pay">超商付款</label>
  <label class="a-check"><input type="radio" name="pay" disabled>貨到付款</label>
</div>` }
  ],
  api:[
    ['label.a-check > input[type=radio]','單選','—'],
    ['name','同一組必須相同','—'],
    ['a-check-group[role=radiogroup]','群組，記得加 aria-label','—']
  ]
},
{
  id:'segmented', group:'entry', name:'分段控制器', en:'Segmented',
  desc:'2–5 個短選項的單選，像按鈕群組。底層是 radio，可以直接放進表單。',
  when:['切換檢視方式：列表／格狀、日／週／月','選項短、數量少','切換的是不同頁面內容時，用標籤頁'],
  demos:[
    { title:'基本', desc:'選中的項目浮起成白底。',
      html:`<div class="a-segmented" role="radiogroup" aria-label="檢視方式">
  <label><input type="radio" name="view" checked><span>列表</span></label>
  <label><input type="radio" name="view"><span>格狀</span></label>
  <label><input type="radio" name="view"><span>看板</span></label>
</div>` }
  ],
  api:[
    ['a-segmented','外層','—'],
    ['label > input[type=radio] + span','每個選項；input 視覺隱藏','—']
  ]
},
{
  id:'slider', group:'entry', name:'滑桿', en:'Slider',
  desc:'在一個範圍內拖曳選值。用原生 range，鍵盤方向鍵也能調整。',
  when:['數值精確度不重要，例如音量、透明度','使用者想邊拖邊看效果','需要輸入精確數字時，改用輸入框'],
  demos:[
    { title:'基本', desc:'左側填色跟著數值；拖曳時圓鈕放大。',
      html:`<div class="a-slider-row">
  <input class="a-slider" type="range" min="0" max="100" value="40" aria-label="音量">
  <span class="a-slider-value"></span>
</div>` },
    { title:'單位與步進', desc:'data-unit 設定顯示單位，step 設定每次跳多少。',
      html:`<div class="a-slider-row">
  <input class="a-slider" type="range" min="100" max="600" step="50" value="200" data-unit="ms" aria-label="動畫時長">
  <span class="a-slider-value"></span>
</div>` }
  ],
  api:[
    ['input[type=range].a-slider','滑桿','—'],
    ['a-slider-row / a-slider-value','外層與數值顯示','—'],
    ['min / max / step / value','原生屬性','0 / 100 / 1'],
    ['data-unit','數值後面的單位','—']
  ]
},

/* ================= 資料展示 ================= */
{
  id:'tag', group:'display', name:'標籤', en:'Tag',
  desc:'標示分類、狀態或關鍵字。可以加上關閉按鈕讓使用者移除。',
  when:['文章分類、篩選條件、狀態','可移除的篩選條件用有關閉按鈕的版本','需要點擊觸發動作時用按鈕，不要用標籤'],
  demos:[
    { title:'顏色', desc:'預設、珊瑚、深藍、成功、外框。',
      html:`<span class="a-tag">預設</span>
<span class="a-tag a-tag--coral">熱門</span>
<span class="a-tag a-tag--navy">精選</span>
<span class="a-tag a-tag--success a-tag--dot">上線中</span>
<span class="a-tag a-tag--outline">草稿</span>` },
    { title:'可移除', desc:'點 × 會縮小淡出後移除。',
      html:`<span class="a-tag">動畫<button class="a-tag__close" aria-label="移除動畫">×</button></span>
<span class="a-tag">設計系統<button class="a-tag__close" aria-label="移除設計系統">×</button></span>
<span class="a-tag">無障礙<button class="a-tag__close" aria-label="移除無障礙">×</button></span>` }
  ],
  api:[
    ['a-tag','標籤','灰底'],
    ['a-tag--coral / --navy / --success / --outline','顏色','—'],
    ['a-tag--dot','前面加圓點，適合狀態','—'],
    ['a-tag__close','關閉按鈕，點擊後移除標籤','—']
  ]
},
{
  id:'badge', group:'display', name:'徽章', en:'Badge',
  desc:'在圖示或頭像右上角顯示數量或紅點，提醒有新內容。',
  when:['未讀訊息、通知數量','只要提醒「有新的」不需要數字時用紅點','數字超過 99 顯示 99+'],
  demos:[
    { title:'數字與紅點', desc:'外圈加一圈底色，疊在任何背景上都清楚。',
      html:`<span class="a-badge"><button class="a-btn a-btn--outline">通知</button><span class="a-badge__count">3</span></span>
<span class="a-badge"><span class="a-avatar a-avatar--square">設</span><span class="a-badge__count">99+</span></span>
<span class="a-badge a-badge--dot"><span class="a-avatar">林</span><span class="a-badge__count"></span></span>` },
    { title:'行內', desc:'a-badge__count--inline 放在文字旁邊。',
      html:`<span>收件匣 <span class="a-badge__count a-badge__count--inline">12</span></span>
<span>草稿 <span class="a-badge__count a-badge__count--inline a-badge__count--navy">4</span></span>` }
  ],
  api:[
    ['a-badge','外層，包住要加徽章的元素','—'],
    ['a-badge__count','數字','珊瑚紅'],
    ['a-badge--dot','只顯示紅點','—'],
    ['a-badge__count--inline / --navy','行內／深藍','—']
  ]
},
{
  id:'avatar', group:'display', name:'頭像', en:'Avatar',
  desc:'代表使用者或團隊。沒有照片時顯示名字的第一個字。',
  when:['留言、成員列表、帳號選單','多位成員用頭像群組，重疊排列','物件或專案用方形頭像'],
  demos:[
    { title:'尺寸與顏色', desc:'32／40／56px；字級跟著尺寸自動縮放。',
      html:`<span class="a-avatar a-avatar--sm">陳</span>
<span class="a-avatar">林</span>
<span class="a-avatar a-avatar--lg a-avatar--coral">王</span>
<span class="a-avatar a-avatar--lg a-avatar--square a-avatar--navy">A</span>
<span class="a-avatar a-avatar--lg"><img src="assets/visual/aicde-visual-001.webp" alt="專案封面"></span>` },
    { title:'群組', desc:'每個頭像加一圈底色後重疊 10px。',
      html:`<div class="a-avatar-group">
  <span class="a-avatar a-avatar--coral">王</span>
  <span class="a-avatar">林</span>
  <span class="a-avatar a-avatar--navy">陳</span>
  <span class="a-avatar">+5</span>
</div>` }
  ],
  api:[
    ['a-avatar','頭像，內容放文字或 img','40px、天藍底'],
    ['a-avatar--sm / --lg','32px／56px','—'],
    ['a-avatar--square','方形','圓形'],
    ['a-avatar--coral / --navy','顏色','—'],
    ['a-avatar-group','重疊排列','—']
  ]
},
{
  id:'tooltip', group:'display', name:'文字提示', en:'Tooltip',
  desc:'滑鼠停留或鍵盤聚焦時顯示簡短說明。純 CSS，只要加一個屬性。',
  when:['只有圖示的按鈕，說明它是做什麼的','補充說明，不是必要資訊','手機上沒有 hover，重要資訊不要只放在提示裡'],
  demos:[
    { title:'基本', desc:'停留 300ms 才出現，避免滑鼠經過時一直閃；鍵盤聚焦時立即出現。',
      html:`<button class="a-btn a-btn--outline" data-a-tip="複製到剪貼簿">複製</button>
<button class="a-btn a-btn--outline" data-a-tip="下載 PNG、SVG" data-a-tip-pos="bottom">下載</button>
<button class="a-btn a-btn--ghost a-btn--icon" data-a-tip="設定" aria-label="設定">⚙</button>` }
  ],
  api:[
    ['[data-a-tip="文字"]','提示內容，加在任何元素上','—'],
    ['[data-a-tip-pos="bottom"]','顯示在下方','上方']
  ]
},
{
  id:'collapse', group:'display', name:'摺疊面板', en:'Collapse',
  desc:'把次要內容收起來，需要時再展開。用原生 details，不需要 JS。',
  when:['常見問題、進階設定','內容很長但多數人只看其中一兩段','重要資訊不要藏在摺疊裡'],
  demos:[
    { title:'基本', desc:'箭頭旋轉 180°；支援的瀏覽器會平滑展開高度。',
      html:`<div class="a-collapse">
  <details open>
    <summary>這些元件需要安裝什麼嗎？</summary>
    <div class="a-collapse__body">不需要。引入一個 CSS 檔就能用；有互動的元件再加一個 JS 檔。</div>
  </details>
  <details>
    <summary>可以用在 React 或 Vue 嗎？</summary>
    <div class="a-collapse__body">可以，所有元件都是 class 名稱，任何框架都能套用。</div>
  </details>
  <details>
    <summary>支援深色模式嗎？</summary>
    <div class="a-collapse__body">支援，會跟著系統設定，也可以用 data-theme 強制指定。</div>
  </details>
</div>` },
    { title:'手風琴', desc:'給每個 details 相同的 name，一次只會展開一個。',
      html:`<div class="a-collapse">
  <details name="faq" open><summary>第一步：建立專案</summary><div class="a-collapse__body">輸入名稱與網址。</div></details>
  <details name="faq"><summary>第二步：邀請成員</summary><div class="a-collapse__body">輸入成員的電子郵件。</div></details>
  <details name="faq"><summary>第三步：發布</summary><div class="a-collapse__body">確認後按下發布。</div></details>
</div>` }
  ],
  api:[
    ['a-collapse','外層','—'],
    ['details > summary','每一項與標題','—'],
    ['a-collapse__body','展開後的內容','—'],
    ['open','預設展開','收起'],
    ['name','相同 name 的項目互斥（手風琴）','—']
  ]
},
{
  id:'table', group:'display', name:'表格', en:'Table',
  desc:'比較多筆資料的多個欄位。數字靠右、等寬數字，方便上下對齊比較。',
  when:['需要比較、排序的結構化資料','欄位多時外層會出現橫向捲動，不會撐破版面','手機上欄位太多時，考慮改成卡片列表'],
  demos:[
    { title:'基本', desc:'表頭淡底色；數字欄加 is-num。',
      html:`<div class="a-table-wrap">
  <table class="a-table a-table--hover">
    <thead><tr><th>元件</th><th>分類</th><th>狀態</th><th class="is-num">使用次數</th></tr></thead>
    <tbody>
      <tr><td>按鈕</td><td>通用</td><td><span class="a-tag a-tag--success a-tag--dot">穩定</span></td><td class="is-num">12,480</td></tr>
      <tr><td>對話框</td><td>回饋</td><td><span class="a-tag a-tag--success a-tag--dot">穩定</span></td><td class="is-num">3,215</td></tr>
      <tr><td>步驟條</td><td>導覽</td><td><span class="a-tag a-tag--coral a-tag--dot">新</span></td><td class="is-num">86</td></tr>
    </tbody>
  </table>
</div>` },
    { title:'斑馬紋與緊湊', desc:'資料列多時用斑馬紋幫助對行；a-table--compact 縮小內距。',
      html:`<div class="a-table-wrap">
  <table class="a-table a-table--striped a-table--compact">
    <thead><tr><th>Token</th><th>值</th><th>用途</th></tr></thead>
    <tbody>
      <tr><td>--sp-1</td><td>4px</td><td>圖示與文字</td></tr>
      <tr><td>--sp-2</td><td>8px</td><td>按鈕之間</td></tr>
      <tr><td>--sp-4</td><td>16px</td><td>卡片內距</td></tr>
      <tr><td>--sp-6</td><td>32px</td><td>區塊之間</td></tr>
    </tbody>
  </table>
</div>` }
  ],
  api:[
    ['a-table-wrap','外層，提供圓角與橫向捲動','—'],
    ['table.a-table','表格','—'],
    ['a-table--hover / --striped / --compact','滑過高亮／斑馬紋／緊湊','—'],
    ['is-num','數字欄，靠右對齊','—']
  ]
},
{
  id:'empty', group:'display', name:'空狀態', en:'Empty',
  desc:'沒有資料時告訴使用者發生了什麼，以及下一步可以做什麼。',
  when:['列表、搜尋結果、收件匣沒有內容','第一次使用、還沒建立任何東西','附上一個明確的行動按鈕'],
  demos:[
    { title:'基本', desc:'圖示、標題、說明、行動按鈕。',
      html:`<div class="a-empty">
  <div class="a-empty__icon"><svg viewBox="0 0 24 24"><path d="M3 7l9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></svg></div>
  <h3 class="a-empty__title">還沒有專案</h3>
  <p class="a-empty__text">建立第一個專案後，就能邀請成員一起編輯。</p>
  <button class="a-btn a-btn--primary">建立專案</button>
</div>` }
  ],
  api:[
    ['a-empty','外層，內容置中','—'],
    ['a-empty__icon / __title / __text','圖示／標題／說明','—']
  ]
},

/* ================= 回饋 ================= */
{
  id:'alert', group:'feedback', name:'警示', en:'Alert',
  desc:'在頁面中顯示需要注意的訊息，會一直留在畫面上，直到問題解決。',
  when:['表單整體錯誤、系統公告、帳號狀態','訊息需要留著讓使用者回頭看','短暫的操作結果改用通知 Toast'],
  demos:[
    { title:'類型', desc:'資訊、成功、警告、錯誤；底色從主色混出 8%。',
      html:`<div style="width:100%;display:flex;flex-direction:column;gap:12px">
  <div class="a-alert" role="status">${ICON.info}<div class="a-alert__content">新版元件庫已上線，舊的 class 名稱仍可使用到明年。</div></div>
  <div class="a-alert a-alert--success" role="status">${ICON.ok}<div class="a-alert__content"><b class="a-alert__title">付款完成</b>收據已寄到你的信箱。</div></div>
  <div class="a-alert a-alert--warning" role="status">${ICON.warn}<div class="a-alert__content"><b class="a-alert__title">儲存空間剩 10%</b>超過上限後將無法上傳新檔案。</div></div>
  <div class="a-alert a-alert--error" role="alert">${ICON.err}<div class="a-alert__content"><b class="a-alert__title">無法連線</b>請檢查網路後重新整理頁面。</div></div>
</div>` }
  ],
  api:[
    ['a-alert','外層','資訊（藍）'],
    ['a-alert--success / --warning / --error','類型','—'],
    ['a-alert__icon / __content / __title','圖示／內容／標題','—'],
    ['role="alert"','錯誤時使用，螢幕報讀器會立即唸出','role="status"']
  ]
},
{
  id:'progress', group:'feedback', name:'進度條', en:'Progress',
  desc:'顯示一個操作完成了多少。用 --v（0 到 1）控制進度，變化時平滑移動。',
  when:['上傳、下載、匯出等超過 1 秒的操作','知道總量時顯示百分比；不知道時用不確定模式','不到 1 秒的操作不需要進度條'],
  demos:[
    { title:'基本', desc:'改變 --v 時進度條用 transform 移動，不會重新排版。',
      html:`<div style="width:100%;display:flex;flex-direction:column;gap:16px">
  <div class="a-progress"><div class="a-progress__track" role="progressbar" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100"><div class="a-progress__bar" style="--v:.3"></div></div>30%</div>
  <div class="a-progress a-progress--navy"><div class="a-progress__track" role="progressbar" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100"><div class="a-progress__bar" style="--v:.65"></div></div>65%</div>
  <div class="a-progress a-progress--success"><div class="a-progress__track" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"><div class="a-progress__bar" style="--v:1"></div></div>完成</div>
</div>` },
    { title:'不確定', desc:'不知道還要多久時，讓一小段來回移動。',
      html:`<div class="a-progress a-progress--indeterminate"><div class="a-progress__track" role="progressbar" aria-label="處理中"><div class="a-progress__bar"></div></div>處理中</div>` }
  ],
  api:[
    ['a-progress','外層，可放百分比文字','—'],
    ['a-progress__track[role=progressbar]','軌道，記得加 aria-valuenow','—'],
    ['a-progress__bar[style="--v:0.5"]','進度，0 到 1','0'],
    ['a-progress--navy / --success','顏色','珊瑚紅'],
    ['a-progress--indeterminate','不確定模式','—']
  ]
},
{
  id:'skeleton', group:'feedback', name:'骨架屏', en:'Skeleton',
  desc:'內容載入中時，先畫出大致的版面形狀，讓等待感覺比較短。',
  when:['載入時間 300ms 以上、版面結構已知','形狀盡量接近真實內容','很短的載入不要閃一下骨架，直接顯示內容'],
  demos:[
    { title:'列表項目', desc:'一道光從左掃到右，1.4 秒一次。',
      html:`<div style="width:100%;max-width:420px;display:flex;gap:12px">
  <span class="a-skeleton a-skeleton--circle"></span>
  <div class="a-skeleton-group">
    <span class="a-skeleton a-skeleton--title"></span>
    <span class="a-skeleton"></span>
    <span class="a-skeleton" style="width:80%"></span>
  </div>
</div>` },
    { title:'卡片', desc:'圖片區用 a-skeleton--block。',
      html:`<div class="a-skeleton-group" style="max-width:280px">
  <span class="a-skeleton a-skeleton--block"></span>
  <span class="a-skeleton a-skeleton--title"></span>
  <span class="a-skeleton"></span>
</div>` }
  ],
  api:[
    ['a-skeleton','一條文字列','高 12px'],
    ['a-skeleton--title / --circle / --block','標題／圓形／圖片區','—'],
    ['a-skeleton-group','直向排列，間距 10px','—']
  ]
},
{
  id:'spinner', group:'feedback', name:'載入中', en:'Spinner',
  desc:'表示正在處理，但不知道要多久。適合小範圍、短時間的等待。',
  when:['按鈕送出後、區塊重新整理時','整頁載入用骨架屏，體驗比較好','按鈕裡的載入狀態直接用按鈕的 is-loading'],
  demos:[
    { title:'尺寸', desc:'16／24／40px；每圈 700ms，等速旋轉。',
      html:`<span class="a-spinner a-spinner--sm" role="status" aria-label="載入中"></span>
<span class="a-spinner" role="status" aria-label="載入中"></span>
<span class="a-spinner a-spinner--lg" role="status" aria-label="載入中"></span>` }
  ],
  api:[
    ['a-spinner','載入圖示','24px'],
    ['a-spinner--sm / --lg','16px／40px','—'],
    ['role="status" aria-label','讓螢幕報讀器知道正在載入','—']
  ]
}
);

/* 標記需要 JS 的元件 */
['steps','textarea','slider','tag'].forEach(id => { const c = window.COMPONENTS.find(x => x.id === id); if(c) c.js = true; });
})();
