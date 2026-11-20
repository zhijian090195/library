/* 第四批元件文件：載入順序在 docs-3.js 之後 */
(() => {
const SVG = d => '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>';
const I = {
  prev: SVG('<path d="M15 6l-6 6 6 6"/>'),
  next: SVG('<path d="M9 6l6 6-6 6"/>'),
  folder: SVG('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
  file: SVG('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>'),
  plus: SVG('<path d="M12 5v14M5 12h14"/>'),
  up: SVG('<path d="M12 19V5M5 12l7-7 7 7"/>'),
  chat: SVG('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>')
};
const IMG1 = 'assets/visual/aicde-visual-001.webp', IMG2 = 'assets/visual/aicde-visual-018.webp';

window.COMPONENTS.push(
/* ================= 通用 ================= */
{
  id:'float-button', group:'general', name:'懸浮按鈕', en:'Float Button',
  desc:'固定在畫面角落的按鈕，放最常用的一個動作，或「回到頂部」。',
  when:['頁面上最重要的單一動作，例如新增、客服','長頁面的回到頂部','一個頁面最多一個，太多會擋住內容'],
  demos:[
    { title:'樣式', desc:'這裡用 a-fab--static 讓它留在範例框裡；實際使用時拿掉，就會固定在右下角。',
      html:`<button class="a-fab a-fab--static" aria-label="新增">${I.plus}</button>
<button class="a-fab a-fab--static a-fab--navy a-fab--sm" aria-label="客服">${I.chat}</button>
<button class="a-fab a-fab--static a-fab--extended">${I.plus}新增專案</button>` },
    { title:'回到頂部', desc:'加上 a-backtop，捲動超過 300px 才出現。往下捲動這一頁，右下角就會出現。',
      html:`<button class="a-fab a-fab--navy a-backtop" data-a-backtop aria-label="回到頂部">${I.up}</button>
<span style="font-size:14px;color:var(--a-ink-2)">往下捲動頁面，看右下角 ↘</span>` }
  ],
  api:[
    ['a-fab','懸浮按鈕，固定在右下 24px','珊瑚紅、48px'],
    ['a-fab--navy / --sm / --extended','深藍／40px／帶文字','—'],
    ['a-fab--static','不固定，跟著版面排列','—'],
    ['a-backtop + data-a-backtop','回到頂部，捲動 300px 後出現','—']
  ]
},

/* ================= 資料輸入 ================= */
{
  id:'autocomplete', group:'entry', name:'自動完成', en:'Autocomplete',
  desc:'邊打字邊篩選建議，符合的字會標成珊瑚紅。可以用方向鍵選、Enter 確認。',
  when:['選項很多，用下拉選擇要捲很久','使用者大概知道要找什麼','選項少於 7 個時直接用下拉選擇'],
  demos:[
    { title:'基本', desc:'選項直接寫在 ul 裡；選中時觸發 a-select 事件。試試輸入「台」或「新」。',
      html:`<label class="a-field" style="width:100%;max-width:320px">
  <span class="a-label">城市</span>
  <div class="a-combo">
    <input class="a-input" placeholder="輸入城市名稱">
    <ul class="a-combo__list">
      <li>台北市</li><li>新北市</li><li>桃園市</li><li>台中市</li><li>台南市</li>
      <li>高雄市</li><li>基隆市</li><li>新竹市</li><li>嘉義市</li><li>宜蘭縣</li><li>花蓮縣</li><li>台東縣</li>
    </ul>
  </div>
</label>` }
  ],
  api:[
    ['a-combo','外層','—'],
    ['a-combo > input','輸入框，role 與 aria 由 JS 補上','—'],
    ['a-combo__list > li','選項','—'],
    ['data-empty','沒有結果時的文字','沒有符合的結果'],
    ['a-select 事件','選中時觸發，event.detail 為選項文字','—']
  ]
},
{
  id:'input-number', group:'entry', name:'數字輸入', en:'Input Number',
  desc:'用加減按鈕調整數字，也能直接輸入。到達上下限時按鈕自動停用。',
  when:['數量、人數、份數等小範圍整數','需要精確數值又常常只差一兩個','範圍大、不需要精確時用滑桿'],
  demos:[
    { title:'基本', desc:'min、max、step 都是原生屬性；輸入超出範圍時離開欄位會自動修正。',
      html:`<div class="a-field"><span class="a-label">人數</span>
  <div class="a-number"><button type="button" data-a-step="-1" aria-label="減少">−</button><input type="number" value="2" min="1" max="10" aria-label="人數"><button type="button" data-a-step="1" aria-label="增加">+</button></div>
</div>
<div class="a-field"><span class="a-label">折扣（每次 5%）</span>
  <div class="a-number a-number--sm"><button type="button" data-a-step="-1" aria-label="減少">−</button><input type="number" value="95" min="0" max="100" step="5" aria-label="折扣"><button type="button" data-a-step="1" aria-label="增加">+</button></div>
</div>` }
  ],
  api:[
    ['a-number','外層','40px'],
    ['input[type=number]','數值，用 min／max／step 限制','—'],
    ['[data-a-step="1"] / [data-a-step="-1"]','加／減按鈕','—'],
    ['a-number--sm','小尺寸','—']
  ]
},
{
  id:'color', group:'entry', name:'顏色選擇', en:'Color Picker',
  desc:'選顏色。自由選色用原生色票，品牌色限定時用預設色票（純 CSS）。',
  when:['標籤、主題、圖表顏色設定','品牌限定顏色時只給預設色票，避免選到不合規的顏色'],
  demos:[
    { title:'自由選色', desc:'右側同步顯示色碼。',
      html:`<label class="a-color"><input type="color" value="#fc5454" aria-label="主色"><span class="a-color__value"></span></label>
<label class="a-color"><input type="color" value="#173f50" aria-label="輔色"><span class="a-color__value"></span></label>` },
    { title:'預設色票', desc:'底層是 radio，用 --c 設定顏色；選中時外圈出現同色光環。',
      html:`<fieldset class="a-swatches" aria-label="標籤顏色">
  <label><input type="radio" name="sw" checked aria-label="珊瑚"><span style="--c:#fc5454"></span></label>
  <label><input type="radio" name="sw" aria-label="深藍"><span style="--c:#173f50"></span></label>
  <label><input type="radio" name="sw" aria-label="藍"><span style="--c:#246078"></span></label>
  <label><input type="radio" name="sw" aria-label="天藍"><span style="--c:#a8c8d4"></span></label>
  <label><input type="radio" name="sw" aria-label="綠"><span style="--c:#1f9d6b"></span></label>
  <label><input type="radio" name="sw" aria-label="橘"><span style="--c:#d98a00"></span></label>
</fieldset>` }
  ],
  api:[
    ['label.a-color > input[type=color]','自由選色','—'],
    ['a-color__value','色碼顯示，由 JS 同步','—'],
    ['fieldset.a-swatches > label > input[type=radio] + span','預設色票','—'],
    ['style="--c:#色碼"','色票顏色','—']
  ]
},
{
  id:'otp', group:'entry', name:'驗證碼', en:'OTP Input',
  desc:'輸入簡訊或信箱收到的驗證碼。打一位自動跳下一格，可以一次貼上整串，錯誤時左右搖晃。',
  when:['登入、付款的二次驗證','固定位數的代碼','長度不固定的密碼用一般輸入框'],
  demos:[
    { title:'基本', desc:'輸入完觸發 a-complete 事件。這個範例的正確答案是 123456，打錯會搖晃並清空。',
      html:`<div class="a-otp" id="otp-demo" role="group" aria-label="6 位數驗證碼">
  <input inputmode="numeric" autocomplete="one-time-code" maxlength="1" placeholder=" " aria-label="第 1 位">
  <input inputmode="numeric" maxlength="1" placeholder=" " aria-label="第 2 位">
  <input inputmode="numeric" maxlength="1" placeholder=" " aria-label="第 3 位">
  <span class="a-otp__sep"></span>
  <input inputmode="numeric" maxlength="1" placeholder=" " aria-label="第 4 位">
  <input inputmode="numeric" maxlength="1" placeholder=" " aria-label="第 5 位">
  <input inputmode="numeric" maxlength="1" placeholder=" " aria-label="第 6 位">
</div>` }
  ],
  api:[
    ['a-otp > input','每一格；placeholder=" " 用來判斷是否已填','—'],
    ['a-otp__sep','分隔線','—'],
    ['a-complete 事件','填滿時觸發，event.detail 為整串代碼','—'],
    ['AUI.otpError(el)','標示錯誤：搖晃並清空','—'],
    ['is-success','驗證成功的樣式','—']
  ]
},

/* ================= 資料展示 ================= */
{
  id:'carousel', group:'display', name:'輪播', en:'Carousel',
  desc:'在同一個位置輪流顯示多張內容。用 scroll-snap，手機可以直接滑動，滑到一半放開會自動對齊。',
  when:['首頁主視覺、商品圖片','內容同等重要、不需要同時看到','重要資訊不要放在第 2 張以後，多數人不會看'],
  demos:[
    { title:'基本', desc:'左右按鈕在第一張和最後一張時自動隱藏；data-autoplay 設定自動播放間隔，滑鼠移上去暫停。',
      html:`<div class="a-carousel" data-autoplay="4000" aria-roledescription="輪播">
  <div class="a-carousel__track">
    <div class="a-carousel__slide"><img src="${IMG2}" alt="暖白分層剪紙"></div>
    <div class="a-carousel__slide"><img src="${IMG1}" alt="稚拙復古混合媒材"></div>
    <div class="a-carousel__slide" style="background:var(--a-navy);color:#fff">第三張：任何內容都可以</div>
  </div>
  <button class="a-carousel__btn a-carousel__btn--prev" aria-label="上一張">${I.prev}</button>
  <button class="a-carousel__btn a-carousel__btn--next" aria-label="下一張">${I.next}</button>
  <div class="a-carousel__dots"></div>
</div>` },
    { title:'露出下一張', desc:'a-carousel--peek 讓下一張露出一部分，暗示可以滑動。',
      html:`<div class="a-carousel a-carousel--peek">
  <div class="a-carousel__track">
    <div class="a-carousel__slide" style="background:#fde3e3">1</div>
    <div class="a-carousel__slide" style="background:#e6edf0">2</div>
    <div class="a-carousel__slide" style="background:#a8c8d4">3</div>
    <div class="a-carousel__slide" style="background:#d3e6dd">4</div>
  </div>
  <div class="a-carousel__dots"></div>
</div>` }
  ],
  api:[
    ['a-carousel','外層','—'],
    ['a-carousel__track > a-carousel__slide','軌道與每一張','16:9'],
    ['a-carousel__btn--prev / --next','左右按鈕，可省略','—'],
    ['a-carousel__dots','圓點，由 JS 產生','—'],
    ['data-autoplay="毫秒"','自動播放','不播放'],
    ['a-carousel--peek','露出下一張','—']
  ]
},
{
  id:'calendar', group:'display', name:'日曆', en:'Calendar',
  desc:'整個月份的日曆，可以切換月份與選日期。切換月份時日期往同方向滑入。',
  when:['需要看到一整個月才好決定，例如訂房、預約','只是輸入已知日期（生日）時用日期輸入框','今天用藍色外框標示'],
  demos:[
    { title:'基本', desc:'data-value 設定選中的日期；點上個月或下個月的灰色日期會直接跳過去。',
      html:`<div class="a-calendar" data-value="2026-11-20"></div>` },
    { title:'搭配輸入框', desc:'data-target 指向輸入框 id，選日期時自動填入；也會觸發 a-change 事件。',
      html:`<div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start">
  <div class="a-calendar" data-target="cal-input"></div>
  <label class="a-field" style="width:180px"><span class="a-label">預約日期</span><input class="a-input" id="cal-input" readonly placeholder="請在左側選擇"></label>
</div>` }
  ],
  api:[
    ['div.a-calendar','日曆，內容由 JS 產生','本月'],
    ['data-value="YYYY-MM-DD"','選中的日期','—'],
    ['data-target="id"','選擇後填入的輸入框','—'],
    ['a-change 事件','選擇日期時觸發，event.detail 為日期字串','—']
  ]
},
{
  id:'tree', group:'display', name:'樹狀結構', en:'Tree',
  desc:'有階層的資料，例如資料夾、組織架構。用巢狀 details，不需要 JS。',
  when:['檔案總管、分類、組織圖','層級 3 層以內最好找','只有兩層時用摺疊面板或側邊選單'],
  demos:[
    { title:'基本', desc:'左側細線標示層級；目前選中的項目用 aria-current。',
      html:`<div class="a-tree">
  <ul>
    <li><details open><summary>${I.folder}assets</summary>
      <ul>
        <li><details open><summary>${I.folder}snippets</summary>
          <ul>
            <li><span class="a-tree__leaf" tabindex="0">${I.file}a.js</span></li>
            <li><span class="a-tree__leaf" tabindex="0">${I.file}b.js</span></li>
          </ul>
        </details></li>
        <li><span class="a-tree__leaf" tabindex="0" aria-current="true">${I.file}aicde-ui.css</span></li>
        <li><span class="a-tree__leaf" tabindex="0">${I.file}aicde-ui.js</span></li>
      </ul>
    </details></li>
    <li><details><summary>${I.folder}docs</summary>
      <ul><li><span class="a-tree__leaf" tabindex="0">${I.file}README.md</span></li></ul>
    </details></li>
    <li><span class="a-tree__leaf" tabindex="0">${I.file}index.html</span></li>
  </ul>
</div>` }
  ],
  api:[
    ['a-tree > ul > li','外層與每個節點','—'],
    ['details > summary + ul','可展開的節點','—'],
    ['a-tree__leaf','沒有子項目的節點','—'],
    ['[aria-current="true"]','選中的節點','—']
  ]
},
{
  id:'image', group:'display', name:'圖片預覽', en:'Image',
  desc:'點縮圖放大檢視。大圖從縮圖的位置長出來（FLIP 動畫），關閉時縮回原位。',
  when:['作品集、商品圖、附件縮圖','縮圖太小看不清細節時','裝飾用的圖片不需要放大'],
  demos:[
    { title:'基本', desc:'hover 時縮圖微微放大；點背景或按 Esc 關閉。圖片的 alt 會變成說明文字。',
      html:`<button class="a-image" data-a-image style="width:200px;height:120px"><img src="${IMG2}" alt="暖白分層剪紙：用紙片建立近、中、遠景"></button>
<button class="a-image" data-a-image style="width:200px;height:120px"><img src="${IMG1}" alt="稚拙復古混合媒材：鉛筆、彩紙與顏料"></button>` }
  ],
  api:[
    ['button.a-image[data-a-image] > img','縮圖，點擊放大','—'],
    ['data-src','另外指定大圖網址','用縮圖的 src'],
    ['img alt','同時當作放大後的說明文字','—']
  ]
},

/* ================= 回饋 ================= */
{
  id:'banner', group:'feedback', name:'公告列', en:'Banner',
  desc:'放在頁面最上方的全站公告，例如新功能、維護通知。關閉時往上淡出。',
  when:['影響所有人的消息：維護、新版上線、優惠','一次只放一則','只跟某個區塊有關的訊息用警示'],
  demos:[
    { title:'基本', desc:'實際放在頁面頂端時加 a-banner--flush 去掉圓角。',
      html:`<div style="width:100%;display:flex;flex-direction:column;gap:12px">
  <div class="a-banner" role="region" aria-label="公告"><span class="a-banner__tag">新功能</span><span>元件庫新增 10 個元件。<a href="#/c/banner">看看有哪些</a></span><button class="a-banner__close" aria-label="關閉公告">×</button></div>
  <div class="a-banner a-banner--coral" role="region" aria-label="公告"><span>11/30 凌晨 2:00–4:00 系統維護，期間暫停服務。</span><button class="a-banner__close" aria-label="關閉公告">×</button></div>
</div>` }
  ],
  api:[
    ['a-banner','公告列','深藍'],
    ['a-banner--coral','珊瑚紅','—'],
    ['a-banner--flush','無圓角，貼齊頁面頂端','—'],
    ['a-banner__tag / __close','左側標籤／關閉按鈕','—']
  ]
}
);

['float-button','autocomplete','input-number','color','otp','carousel','calendar','image','banner'].forEach(id => { const c = window.COMPONENTS.find(x => x.id === id); if(c) c.js = true; });

/* 驗證碼範例：正確答案 123456 */
if(typeof document !== 'undefined') document.addEventListener('a-complete', e => {
  if(e.target.id !== 'otp-demo' || !window.AUI) return;
  if(e.detail === '123456'){ e.target.classList.add('is-success'); AUI.toast('驗證成功', {type: 'success'}); }
  else AUI.otpError(e.target);
});
})();
