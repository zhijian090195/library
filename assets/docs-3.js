/* 第三批元件文件：載入順序在 docs-2.js 之後 */
(() => {
const SVG = (d) => '<svg viewBox="0 0 24 24">' + d + '</svg>';
const I = {
  home: SVG('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>'),
  box: SVG('<path d="M3 7l9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7"/>'),
  chart: SVG('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  gear: SVG('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>'),
  upload: SVG('<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>'),
  ok: SVG('<path d="M6 12.5l4 4L18 8"/>'),
  err: SVG('<path d="M7 7l10 10M17 7 7 17"/>')
};

window.COMPONENTS.push(
/* ================= 導覽 ================= */
{
  id:'menu', group:'nav', name:'側邊選單', en:'Menu',
  desc:'後台或文件網站的主要導覽。子選單用原生 details 展開，目前頁面用 aria-current 標記。',
  when:['頁面多、需要常駐的導覽','選單層級最多兩層，再深就難找','頁面少於 5 個時，放在頂部導覽列就好'],
  demos:[
    { title:'基本', desc:'分組標題、圖示、子選單與數量。',
      html:`<nav class="a-menu" aria-label="主選單">
  <a class="a-menu__item" href="#/c/menu" aria-current="page">${I.home}總覽</a>
  <a class="a-menu__item" href="#/c/menu">${I.box}專案<span class="a-menu__badge">12</span></a>
  <details open>
    <summary>${I.chart}報表</summary>
    <div>
      <a class="a-menu__item" href="#/c/menu">流量</a>
      <a class="a-menu__item" href="#/c/menu">轉換率</a>
    </div>
  </details>
  <div class="a-menu__label">系統</div>
  <a class="a-menu__item" href="#/c/menu">${I.gear}設定</a>
</nav>` }
  ],
  api:[
    ['nav.a-menu','外層','寬 240px'],
    ['a-menu__item','選單項目，通常是 a','—'],
    ['details > summary + div','子選單','—'],
    ['a-menu__label / a-menu__badge','分組標題／右側數量','—'],
    ['[aria-current="page"]','目前頁面','—']
  ]
},

/* ================= 資料輸入 ================= */
{
  id:'date', group:'entry', name:'日期時間', en:'Date Picker',
  desc:'選日期或時間。用原生 input，手機會跳出系統的選擇器，鍵盤也能直接輸入。',
  when:['生日、預約、篩選期間','日期範圍用兩個輸入框，中間加箭頭','需要同時看到整個月的空檔時，改用日曆元件'],
  demos:[
    { title:'類型', desc:'date、time、datetime-local、month 都套用同一個 a-input。',
      html:`<label class="a-field" style="width:200px"><span class="a-label">日期</span><input class="a-input" type="date" value="2026-11-20"></label>
<label class="a-field" style="width:140px"><span class="a-label">時間</span><input class="a-input" type="time" value="14:30"></label>
<label class="a-field" style="width:170px"><span class="a-label">月份</span><input class="a-input" type="month" value="2026-11"></label>` },
    { title:'日期範圍', desc:'用 min 限制結束日期不能早於開始日期。',
      html:`<div class="a-field">
  <span class="a-label">入住期間</span>
  <div class="a-date-range">
    <input class="a-input" type="date" value="2026-12-24" aria-label="入住日">
    <span>→</span>
    <input class="a-input" type="date" value="2026-12-26" min="2026-12-24" aria-label="退房日">
  </div>
</div>` }
  ],
  api:[
    ['input.a-input[type=date|time|month|datetime-local]','日期時間輸入','—'],
    ['min / max','可選範圍','—'],
    ['a-date-range','兩個輸入框並排','—']
  ]
},
{
  id:'upload', group:'entry', name:'上傳', en:'Upload',
  desc:'點擊或把檔案拖進來上傳。拖進來時框線變珊瑚紅並微微放大，選好的檔案列在下方。',
  when:['上傳圖片、文件、匯入資料','寫清楚接受的格式與大小上限','只上傳一張頭像時，直接點頭像更直覺'],
  demos:[
    { title:'拖曳上傳', desc:'整個區塊是 label，鍵盤可以聚焦後按 Enter 選檔。',
      html:`<div class="a-upload-wrap">
  <label class="a-upload">
    <input type="file" multiple accept="image/*,.pdf">
    <span class="a-upload__icon">${I.upload}</span>
    <span class="a-upload__title">把檔案拖到這裡，或 <b>點擊選擇</b></span>
    <span class="a-upload__hint">PNG、JPG、PDF，單檔 10 MB 以內</span>
  </label>
  <ul class="a-upload-list"></ul>
</div>` }
  ],
  api:[
    ['a-upload-wrap','外層，包住上傳區與檔案列表','—'],
    ['label.a-upload > input[type=file]','上傳區','—'],
    ['a-upload__icon / __title / __hint','圖示／標題／格式說明','—'],
    ['a-upload-list','選好的檔案列表，由 JS 填入','—'],
    ['multiple / accept','原生屬性：多檔、限制格式','—']
  ]
},
{
  id:'rating', group:'entry', name:'評分', en:'Rating',
  desc:'用星星打分數。底層是 radio，純 CSS；滑過時預覽分數，按下時星星微縮。',
  when:['商品評價、滿意度調查','只需要讚／不讚時用兩個按鈕就好','顯示平均分數時用停用狀態'],
  demos:[
    { title:'基本', desc:'HTML 從 5 星寫到 1 星，CSS 用 row-reverse 反轉，才能用 ~ 選到「之前」的星星。',
      html:`<fieldset class="a-rating" aria-label="評分">
  <input type="radio" name="rate" id="rate5" value="5"><label for="rate5" aria-label="5 星">★</label>
  <input type="radio" name="rate" id="rate4" value="4" checked><label for="rate4" aria-label="4 星">★</label>
  <input type="radio" name="rate" id="rate3" value="3"><label for="rate3" aria-label="3 星">★</label>
  <input type="radio" name="rate" id="rate2" value="2"><label for="rate2" aria-label="2 星">★</label>
  <input type="radio" name="rate" id="rate1" value="1"><label for="rate1" aria-label="1 星">★</label>
</fieldset>` },
    { title:'唯讀小尺寸', desc:'所有 input 加 disabled 用來顯示分數。',
      html:`<fieldset class="a-rating a-rating--sm" aria-label="平均 3 星">
  <input type="radio" disabled id="ro5"><label for="ro5">★</label>
  <input type="radio" disabled id="ro4"><label for="ro4">★</label>
  <input type="radio" disabled id="ro3" checked><label for="ro3">★</label>
  <input type="radio" disabled id="ro2"><label for="ro2">★</label>
  <input type="radio" disabled id="ro1"><label for="ro1">★</label>
</fieldset><span style="font-size:13px;color:var(--a-ink-2)">3.0（128 則評價）</span>` }
  ],
  api:[
    ['fieldset.a-rating','外層，加 aria-label','—'],
    ['input[type=radio] + label','每顆星，順序由高到低','—'],
    ['a-rating--sm','小尺寸','26px'],
    ['disabled','唯讀顯示','—']
  ]
},

/* ================= 資料展示 ================= */
{
  id:'statistic', group:'display', name:'統計數值', en:'Statistic',
  desc:'在儀表板顯示重點數字與變化。進到畫面時數字從 0 跳到目標值，只播一次。',
  when:['儀表板的 KPI','加上和上期比較的漲跌','數字很多時改用表格'],
  demos:[
    { title:'基本', desc:'data-a-count 設定目標值；跳動 900ms，ease-out。',
      html:`<div class="a-stat-row">
  <div class="a-stat"><span class="a-stat__label">本月營收</span><span class="a-stat__value"><span data-a-count="1284500">0</span><small>元</small></span><span class="a-stat__trend">▲ 12.4%</span></div>
  <div class="a-stat"><span class="a-stat__label">新會員</span><span class="a-stat__value" data-a-count="3216">0</span><span class="a-stat__trend">▲ 8.1%</span></div>
  <div class="a-stat"><span class="a-stat__label">跳出率</span><span class="a-stat__value"><span data-a-count="42.6" data-decimals="1">0</span><small>%</small></span><span class="a-stat__trend a-stat__trend--down">▲ 3.2%</span></div>
</div>` }
  ],
  api:[
    ['a-stat-row','自動換行的格線','每格最小 160px'],
    ['a-stat / __label / __value / __trend','卡片／標題／數值／漲跌','—'],
    ['a-stat__trend--down','壞的變化（紅）','好的變化（綠）'],
    ['[data-a-count]','數字跳動的目標值','—'],
    ['data-decimals','小數位數','0']
  ]
},
{
  id:'timeline', group:'display', name:'時間軸', en:'Timeline',
  desc:'按時間順序列出事件，例如訂單進度或更新紀錄。',
  when:['訂單、物流、審核進度','版本更新紀錄','步驟還沒發生、需要引導時，用步驟條'],
  demos:[
    { title:'基本', desc:'最新的事件用 is-active 標成珊瑚紅；尚未發生的用 is-muted。',
      html:`<ol class="a-timeline">
  <li class="is-active"><span class="a-timeline__title">已出貨</span>黑貓宅急便 8823-1145<span class="a-timeline__time">11/20 14:32</span></li>
  <li><span class="a-timeline__title">撿貨完成</span><span class="a-timeline__time">11/20 10:05</span></li>
  <li><span class="a-timeline__title">付款成功</span><span class="a-timeline__time">11/19 22:47</span></li>
  <li class="is-muted"><span class="a-timeline__title">送達</span>預計 11/22</li>
</ol>` }
  ],
  api:[
    ['ol.a-timeline > li','事件','—'],
    ['a-timeline__title / __time','標題／時間','—'],
    ['is-active / is-muted','目前事件／尚未發生','—']
  ]
},
{
  id:'list', group:'display', name:'列表', en:'List',
  desc:'一列一筆資料：頭像、標題、說明、右側資訊。文字過長自動省略。',
  when:['成員、檔案、通知等同類型資料','每筆資料欄位少於 3 個','欄位多、需要比較時改用表格'],
  demos:[
    { title:'基本', desc:'a-list--hover 滑過時整列高亮。',
      html:`<ul class="a-list a-list--hover" style="max-width:460px">
  <li><span class="a-avatar a-avatar--coral">王</span><div class="a-list__main"><span class="a-list__title">王小明</span><span class="a-list__desc">設計師・負責元件庫與動畫規範</span></div><span class="a-list__extra">管理員</span></li>
  <li><span class="a-avatar">林</span><div class="a-list__main"><span class="a-list__title">林雅婷</span><span class="a-list__desc">前端工程師</span></div><span class="a-list__extra">成員</span></li>
  <li><span class="a-avatar a-avatar--navy">陳</span><div class="a-list__main"><span class="a-list__title">陳建宏</span><span class="a-list__desc">產品經理・很長很長很長很長很長很長很長很長的說明會自動省略</span></div><span class="a-list__extra">成員</span></li>
</ul>` }
  ],
  api:[
    ['ul.a-list > li','列表與每一列','—'],
    ['a-list__main / __title / __desc','主要內容／標題／說明','—'],
    ['a-list__extra','右側次要資訊','—'],
    ['a-list--hover','滑過高亮','—']
  ]
},
{
  id:'descriptions', group:'display', name:'描述列表', en:'Descriptions',
  desc:'成對顯示「欄位：值」，例如訂單資訊、個人資料。手機上自動變成單欄。',
  when:['詳情頁的唯讀資料','欄位名稱短、值也短','要編輯時換成表單'],
  demos:[
    { title:'基本', desc:'預設兩欄；is-wide 讓一項佔滿整列。',
      html:`<dl class="a-desc">
  <div><dt>訂單編號</dt><dd>A-20261120-0042</dd></div>
  <div><dt>狀態</dt><dd><span class="a-tag a-tag--success a-tag--dot">已出貨</span></dd></div>
  <div><dt>收件人</dt><dd>王小明</dd></div>
  <div><dt>電話</dt><dd>0912-345-678</dd></div>
  <div class="is-wide"><dt>地址</dt><dd>台北市信義區市府路 1 號</dd></div>
</dl>` }
  ],
  api:[
    ['dl.a-desc > div > dt + dd','每一組欄位與值','兩欄'],
    ['a-desc--3','三欄','—'],
    ['is-wide','佔滿整列','—']
  ]
},
{
  id:'kbd', group:'display', name:'鍵盤按鍵', en:'Kbd',
  desc:'在說明文字中標示鍵盤快捷鍵，底部加厚模擬實體按鍵。',
  when:['說明快捷鍵','選單項目右側的快捷鍵提示','Mac 與 Windows 不同時兩者都寫'],
  demos:[
    { title:'基本', desc:'用語意化的 kbd 標籤。',
      html:`<p style="margin:0;font-size:14px">按 <kbd class="a-kbd">⌘</kbd> <kbd class="a-kbd">K</kbd> 開啟搜尋，<kbd class="a-kbd">Esc</kbd> 關閉。</p>
<span class="a-kbd-combo"><kbd class="a-kbd">Ctrl</kbd>+<kbd class="a-kbd">Shift</kbd>+<kbd class="a-kbd">P</kbd></span>` }
  ],
  api:[
    ['kbd.a-kbd','單一按鍵','—'],
    ['a-kbd-combo','組合鍵外層','—']
  ]
},

/* ================= 回饋 ================= */
{
  id:'drawer', group:'feedback', name:'抽屜', en:'Drawer',
  desc:'從畫面側邊滑出的面板，放進一步的細節或表單，不用離開目前頁面。和對話框共用開關方式。',
  when:['查看或編輯一筆資料的詳情','內容較長、對話框放不下','只需要確認一件事時用對話框'],
  demos:[
    { title:'右側', desc:'滑入 280ms，退場 160ms；點背景或按 Esc 關閉。',
      html:`<button class="a-btn a-btn--secondary" data-a-open="drawer-r">編輯成員</button>
<dialog class="a-drawer" id="drawer-r" aria-labelledby="drawer-r-title">
  <div class="a-drawer__panel">
    <div class="a-drawer__header"><h3 class="a-drawer__title" id="drawer-r-title">編輯成員</h3><button class="a-btn a-btn--ghost a-btn--icon a-btn--sm" data-a-close aria-label="關閉">×</button></div>
    <div class="a-drawer__body" style="display:flex;flex-direction:column;gap:16px">
      <label class="a-field"><span class="a-label">名稱</span><input class="a-input" value="王小明"></label>
      <label class="a-field"><span class="a-label">角色</span><select class="a-input a-select"><option>管理員</option><option>成員</option></select></label>
    </div>
    <div class="a-drawer__footer"><button class="a-btn a-btn--ghost" data-a-close>取消</button><button class="a-btn a-btn--primary" data-a-close>儲存</button></div>
  </div>
</dialog>` },
    { title:'左側', desc:'加 a-drawer--left，常用在手機的導覽選單。',
      html:`<button class="a-btn a-btn--outline" data-a-open="drawer-l">開啟選單</button>
<dialog class="a-drawer a-drawer--left" id="drawer-l" aria-label="選單">
  <div class="a-drawer__panel">
    <div class="a-drawer__header"><h3 class="a-drawer__title">AICDE</h3><button class="a-btn a-btn--ghost a-btn--icon a-btn--sm" data-a-close aria-label="關閉">×</button></div>
    <div class="a-drawer__body">首頁<br>元件<br>動畫<br>關於</div>
  </div>
</dialog>` }
  ],
  api:[
    ['dialog.a-drawer','抽屜本體（原生 dialog）','右側、寬 400px'],
    ['a-drawer--left','從左側滑出','右側'],
    ['a-drawer__panel / __header / __title / __body / __footer','面板結構','—'],
    ['[data-a-open] / [data-a-close]','開關，與對話框相同','—']
  ]
},
{
  id:'popover', group:'feedback', name:'彈出卡片', en:'Popover',
  desc:'點擊後在按鈕旁邊顯示的小卡片，可以放文字和按鈕。用原生 popover，點外面或按 Esc 自動關閉。',
  when:['需要互動的補充內容，例如小表單、確認','只是文字說明時用文字提示','內容多到需要捲動時改用抽屜'],
  demos:[
    { title:'基本', desc:'popovertarget 指向卡片 id；aicde-ui.js 負責把卡片放到按鈕下方，空間不夠時翻到上方。',
      html:`<button class="a-btn a-btn--outline" popovertarget="pop-a">分享</button>
<div class="a-popover" id="pop-a" popover>
  <b class="a-popover__title">分享這個專案</b>
  知道連結的人都可以檢視，但不能編輯。
  <div class="a-popover__footer">
    <button class="a-btn a-btn--ghost a-btn--sm" popovertarget="pop-a" popovertargetaction="hide">取消</button>
    <button class="a-btn a-btn--primary a-btn--sm" popovertarget="pop-a" popovertargetaction="hide" data-a-toast="連結已複製" data-a-toast-type="success">複製連結</button>
  </div>
</div>` }
  ],
  api:[
    ['[popover].a-popover','卡片本體（原生 popover）','—'],
    ['[popovertarget="id"]','觸發按鈕','—'],
    ['popovertargetaction="hide"','卡片內的關閉按鈕','toggle'],
    ['a-popover__title / __footer','標題／操作列','—']
  ]
},
{
  id:'result', group:'feedback', name:'結果頁', en:'Result',
  desc:'流程結束時告訴使用者結果：成功、失敗或需要等待。圖示彈出後打勾逐筆畫出。',
  when:['付款、送出表單、註冊完成','失敗時說明原因並提供下一步','小操作的結果用通知就好'],
  demos:[
    { title:'成功', desc:'圖示從 0.6 倍彈出，勾勾在 180ms 後畫出。',
      html:`<div class="a-result">
  <div class="a-result__icon">${I.ok}</div>
  <h3 class="a-result__title">付款完成</h3>
  <p class="a-result__text">訂單 A-0042 已成立，收據已寄到你的信箱。</p>
  <div class="a-result__actions"><button class="a-btn a-btn--primary">查看訂單</button><button class="a-btn a-btn--ghost">回首頁</button></div>
</div>` },
    { title:'失敗', desc:'a-result--error；說明原因並提供重試。',
      html:`<div class="a-result a-result--error">
  <div class="a-result__icon">${I.err}</div>
  <h3 class="a-result__title">付款失敗</h3>
  <p class="a-result__text">信用卡被拒絕，請換一張卡或改用其他付款方式。</p>
  <div class="a-result__actions"><button class="a-btn a-btn--primary">重新付款</button></div>
</div>` }
  ],
  api:[
    ['a-result','外層','成功（綠）'],
    ['a-result--error / --info','失敗／資訊','—'],
    ['a-result__icon / __title / __text / __actions','圖示／標題／說明／操作','—']
  ]
}
);

['upload','statistic','drawer','popover'].forEach(id => { const c = window.COMPONENTS.find(x => x.id === id); if(c) c.js = true; });
})();
