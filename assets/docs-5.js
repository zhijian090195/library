/* 第五批元件文件：載入順序在 docs-4.js 之後 */
(() => {
const SVG = d => '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>';
const SEARCH = '<svg class="a-input-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
const row = (name, team, status, n, date) =>
  `      <tr><td class="a-table__check"><label class="a-check"><input type="checkbox" aria-label="選取 ${name}"></label></td><td>${name}</td><td>${team}</td><td>${status}</td><td class="is-num">${n}</td><td data-value="${date}">${date.slice(5).replace('-', '/')}</td></tr>`;
const OK = '<span class="a-tag a-tag--success a-tag--dot">上線</span>', DRAFT = '<span class="a-tag a-tag--outline">草稿</span>', REVIEW = '<span class="a-tag a-tag--coral a-tag--dot">審核中</span>';

window.COMPONENTS.push(
/* ================= 資料展示 ================= */
{
  id:'data-table', group:'display', name:'資料表格', en:'Data Table',
  desc:'可以排序、搜尋、勾選的表格。排序時每一列從舊位置滑到新位置（FLIP），看得出資料怎麼移動。',
  when:['後台的資料管理頁：訂單、會員、文章','需要批次操作時加勾選欄','只是展示少量資料用一般表格就好'],
  demos:[
    { title:'排序、搜尋、勾選', desc:'點欄位標題排序，再點一次反向；搜尋框用 data-a-filter 指向表格 id；表頭的核取方塊可全選，部分選取時顯示橫線。',
      html:`<div style="width:100%">
  <div class="a-table-toolbar">
    <div class="a-input-wrap">${SEARCH}<input class="a-input a-input--sm" type="search" placeholder="搜尋頁面或負責人" data-a-filter="dt-demo"></div>
    <span class="a-table-toolbar__info" data-a-selected="dt-demo"></span>
  </div>
  <div class="a-table-wrap">
    <table class="a-table a-table--hover" id="dt-demo" aria-label="頁面列表">
      <thead><tr>
        <th class="a-table__check"><label class="a-check"><input type="checkbox" aria-label="全選"></label></th>
        <th aria-sort="none"><button class="a-th-sort">頁面</button></th>
        <th aria-sort="none"><button class="a-th-sort">負責人</button></th>
        <th>狀態</th>
        <th class="is-num" aria-sort="none" data-sort="num"><button class="a-th-sort">瀏覽數</button></th>
        <th aria-sort="none"><button class="a-th-sort">更新</button></th>
      </tr></thead>
      <tbody>
${row('首頁', '王小明', OK, '48,210', '2026-11-18')}
${row('價格方案', '林雅婷', REVIEW, '12,904', '2026-11-20')}
${row('部落格', '陳建宏', OK, '31,577', '2026-11-02')}
${row('關於我們', '王小明', DRAFT, '2,340', '2026-10-27')}
${row('聯絡我們', '林雅婷', OK, '6,815', '2026-11-11')}
      </tbody>
    </table>
  </div>
</div>` }
  ],
  api:[
    ['th[aria-sort] > button.a-th-sort','可排序的欄位','—'],
    ['th[data-sort="num"]','以數字排序','文字（中文筆畫）'],
    ['td[data-value]','排序用的值，例如日期','儲存格文字'],
    ['[data-a-filter="表格 id"]','搜尋框，即時篩選列','—'],
    ['td.a-table__check / th.a-table__check','勾選欄；表頭為全選','—'],
    ['[data-a-selected="表格 id"]','顯示「已選 N 筆」','—']
  ]
},

/* ================= 資料輸入 ================= */
{
  id:'cascader', group:'entry', name:'級聯選擇', en:'Cascader',
  desc:'有階層的選項逐層選擇，例如縣市 → 區域。每選一層，右邊滑出下一欄。',
  when:['地址、商品分類、組織部門','層級 2–4 層','只有一層時用下拉選擇'],
  demos:[
    { title:'基本', desc:'選項寫成巢狀 ul 放在 a-cascader__data 裡（不會顯示），JS 自動產生面板；選好時觸發 a-change。',
      html:`<div class="a-field" style="width:100%;max-width:320px">
  <span class="a-label">地區</span>
  <div class="a-cascader" data-placeholder="選擇縣市與區域">
    <ul class="a-cascader__data" hidden>
      <li>台北市<ul><li>信義區</li><li>大安區</li><li>中山區</li><li>松山區</li></ul></li>
      <li>新北市<ul><li>板橋區</li><li>新店區</li><li>淡水區</li></ul></li>
      <li>台中市<ul><li>西屯區</li><li>北屯區</li><li>南屯區</li></ul></li>
      <li>高雄市<ul><li>苓雅區</li><li>左營區</li><li>鼓山區</li></ul></li>
    </ul>
  </div>
</div>` }
  ],
  api:[
    ['a-cascader','外層','—'],
    ['ul.a-cascader__data[hidden]','巢狀選項資料','—'],
    ['data-placeholder','還沒選時的文字','請選擇'],
    ['a-change 事件','選到最後一層時觸發，event.detail 為路徑陣列','—']
  ]
},
{
  id:'transfer', group:'entry', name:'穿梭框', en:'Transfer',
  desc:'在兩個列表之間移動項目，例如把成員加入專案。移過去的項目會淡入，標題顯示勾選數量。',
  when:['從一大群裡挑出一部分，例如權限、成員','需要同時看到「已選」和「未選」','選項少時用核取方塊就好'],
  demos:[
    { title:'基本', desc:'左右兩個 a-transfer__list，項目直接寫 a-check；按鈕只在有勾選時才能按。',
      html:`<div class="a-transfer">
  <div class="a-transfer__list" data-title="所有成員">
    <label class="a-check"><input type="checkbox">王小明</label>
    <label class="a-check"><input type="checkbox">林雅婷</label>
    <label class="a-check"><input type="checkbox">陳建宏</label>
    <label class="a-check"><input type="checkbox">黃怡君</label>
    <label class="a-check"><input type="checkbox">張志豪</label>
  </div>
  <div class="a-transfer__ops">
    <button class="a-btn a-btn--outline a-btn--sm a-btn--icon" data-a-transfer="1" aria-label="加入">›</button>
    <button class="a-btn a-btn--outline a-btn--sm a-btn--icon" data-a-transfer="-1" aria-label="移除">‹</button>
  </div>
  <div class="a-transfer__list" data-title="專案成員">
    <label class="a-check"><input type="checkbox">李佳穎</label>
  </div>
</div>` }
  ],
  api:[
    ['a-transfer','外層','—'],
    ['a-transfer__list[data-title]','左右列表；項目為 label.a-check','—'],
    ['[data-a-transfer="1" | "-1"]','往右／往左移動','—'],
    ['a-change 事件','移動後觸發，event.detail 為右側項目','—']
  ]
},
{
  id:'range-picker', group:'entry', name:'日期範圍', en:'Range Picker',
  desc:'在日曆上選開始和結束日期。選了開始日後，滑鼠移動時即時預覽範圍。',
  when:['訂房、請假、報表期間','範圍通常在兩個月內','跨很多個月時用兩個日期輸入框比較快'],
  demos:[
    { title:'基本', desc:'data-mode="range"；第一次點開始日、第二次點結束日，再點一次重新選。',
      html:`<div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start">
  <div class="a-calendar a-calendar--range" data-mode="range" data-start="2026-12-24" data-end="2026-12-27" data-target-start="rp-s" data-target-end="rp-e" id="rp-demo"></div>
  <div style="display:flex;flex-direction:column;gap:12px;width:200px">
    <label class="a-field"><span class="a-label">入住</span><input class="a-input" id="rp-s" value="2026-12-24" readonly></label>
    <label class="a-field"><span class="a-label">退房</span><input class="a-input" id="rp-e" value="2026-12-27" readonly></label>
    <span class="a-range-summary" id="rp-sum">共 <b>3</b> 晚</span>
  </div>
</div>` }
  ],
  api:[
    ['a-calendar.a-calendar--range[data-mode="range"]','範圍模式的日曆','—'],
    ['data-start / data-end','開始與結束日期','—'],
    ['data-target-start / data-target-end','選擇後填入的輸入框 id','—'],
    ['a-change 事件','event.detail 為 { start, end }','—']
  ]
},
{
  id:'tag-input', group:'entry', name:'標籤輸入', en:'Tag Input',
  desc:'輸入文字按 Enter 或逗號變成標籤。重複的標籤會搖一下提醒，Backspace 刪掉最後一個。',
  when:['關鍵字、收件人、技能','可以貼上一串用逗號分隔的文字','選項固定時用核取方塊或多選下拉'],
  demos:[
    { title:'基本', desc:'data-max 限制數量；變動時觸發 a-change，event.detail 為所有標籤。',
      html:`<div class="a-field" style="width:100%;max-width:420px">
  <span class="a-label">關鍵字（最多 6 個）</span>
  <div class="a-taginput" data-max="6">
    <span class="a-tag" data-v="動畫">動畫<button type="button" class="a-tag__close" aria-label="移除動畫">×</button></span>
    <span class="a-tag" data-v="設計系統">設計系統<button type="button" class="a-tag__close" aria-label="移除設計系統">×</button></span>
    <input placeholder="輸入後按 Enter" aria-label="新增關鍵字">
  </div>
</div>` }
  ],
  api:[
    ['a-taginput','外層，裡面放 a-tag 與一個 input','—'],
    ['a-tag[data-v]','已有的標籤','—'],
    ['data-max','最多幾個','不限'],
    ['a-change 事件','event.detail 為標籤陣列','—']
  ]
},

/* ================= 導覽 ================= */
{
  id:'command', group:'nav', name:'指令面板', en:'Command Palette',
  desc:'按 ⌘K（Windows 為 Ctrl+K）叫出搜尋框，輸入就能跳到頁面或執行動作，鍵盤全程操作。',
  when:['功能多的應用程式，讓熟手不用找選單','文件網站的全站搜尋','項目要分組，最常用的放最上面'],
  demos:[
    { title:'基本', desc:'在這一頁按 ⌘K 或 Ctrl+K 也能開啟。上下鍵移動、Enter 執行、Esc 關閉。',
      html:`<button class="a-btn a-btn--outline" data-a-open="cmd-demo">搜尋指令 <kbd class="a-kbd">⌘</kbd><kbd class="a-kbd">K</kbd></button>
<dialog class="a-command" id="cmd-demo" data-hotkey aria-label="指令面板">
  <div class="a-command__search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input placeholder="搜尋元件或指令…" aria-label="搜尋"></div>
  <div class="a-command__list" role="listbox">
    <div class="a-command__group">元件</div>
    <a class="a-command__item" href="#/c/button" data-k="button">按鈕 Button</a>
    <a class="a-command__item" href="#/c/modal" data-k="modal dialog">對話框 Modal</a>
    <a class="a-command__item" href="#/c/data-table" data-k="table sort">資料表格 Data Table</a>
    <a class="a-command__item" href="#/c/calendar" data-k="calendar date">日曆 Calendar</a>
    <div class="a-command__group">動作</div>
    <button class="a-command__item" data-a-toast="已切換深淺色">切換深淺色<kbd class="a-kbd">⇧D</kbd></button>
    <button class="a-command__item" data-a-toast="連結已複製" data-a-toast-type="success">複製這頁的連結<kbd class="a-kbd">⇧C</kbd></button>
  </div>
  <div class="a-command__foot"><span><kbd class="a-kbd">↑</kbd><kbd class="a-kbd">↓</kbd>移動</span><span><kbd class="a-kbd">↵</kbd>執行</span><span><kbd class="a-kbd">Esc</kbd>關閉</span></div>
</dialog>` }
  ],
  api:[
    ['dialog.a-command','面板本體（原生 dialog）','—'],
    ['data-hotkey','允許用 ⌘K／Ctrl+K 開關','—'],
    ['a-command__group','分組標題，沒有結果時自動隱藏','—'],
    ['a-command__item[data-k]','項目；data-k 為額外的搜尋關鍵字','—'],
    ['[data-a-open="id"]','開啟按鈕，與對話框相同','—']
  ]
},
{
  id:'context-menu', group:'nav', name:'右鍵選單', en:'Context Menu',
  desc:'在指定區域按右鍵，在游標位置跳出選單。靠近畫面邊緣時自動往反方向展開。',
  when:['檔案、畫布、列表項目的快捷操作','同樣的操作在畫面上也要有其他入口，右鍵不容易被發現','手機沒有右鍵，用長按或「更多」按鈕'],
  demos:[
    { title:'基本', desc:'區域加上 data-a-context="選單 id"；上下鍵移動、Esc 關閉。',
      html:`<div class="a-context-area" data-a-context="ctx-demo">在這裡按右鍵</div>
<div class="a-context" id="ctx-demo" role="menu">
  <button role="menuitem" data-a-toast="已複製">複製<kbd class="a-kbd">⌘C</kbd></button>
  <button role="menuitem" data-a-toast="已貼上">貼上<kbd class="a-kbd">⌘V</kbd></button>
  <button role="menuitem" data-a-toast="已建立副本">建立副本<kbd class="a-kbd">⌘D</kbd></button>
  <div class="a-context__sep"></div>
  <button role="menuitem" class="is-danger" data-a-toast="已刪除" data-a-toast-type="error">刪除<kbd class="a-kbd">⌫</kbd></button>
</div>` }
  ],
  api:[
    ['[data-a-context="id"]','可以按右鍵的區域','—'],
    ['div.a-context[role=menu]','選單本體，放在頁面任何地方','—'],
    ['[role=menuitem]','選項，點擊後自動關閉','—'],
    ['a-context__sep / is-danger','分隔線／危險操作','—']
  ]
},

/* ================= 回饋 ================= */
{
  id:'notification', group:'feedback', name:'通知提醒框', en:'Notification',
  desc:'從右上角滑入的通知卡片，比 Toast 多了標題、說明和操作按鈕。新的在最上面，最多 3 則。',
  when:['需要說明比較多、或附上操作的通知：新留言、匯出完成','只有一句話的回饋用 Toast','需要使用者立即決定時用對話框'],
  demos:[
    { title:'類型', desc:'按鈕寫 data-a-notify="標題|內文" 就能觸發。',
      html:`<button class="a-btn a-btn--outline" data-a-notify="新留言|林雅婷在「價格方案」留言：數字要再確認一次。">一般</button>
<button class="a-btn a-btn--outline" data-a-notify="匯出完成|報表已寄到你的信箱，連結 7 天內有效。" data-a-notify-type="success">成功</button>
<button class="a-btn a-btn--outline" data-a-notify="同步失敗|有 3 個檔案無法上傳，請檢查網路。" data-a-notify-type="error">錯誤</button>` },
    { title:'附操作按鈕', desc:'用 JS 呼叫 AUI.notify，actions 的第一個按鈕為主要按鈕；duration: 0 代表不自動關閉。',
      html:`<button class="a-btn a-btn--primary" onclick="AUI.notify({ title: '有新版本', text: '重新整理後即可使用新功能。', duration: 0, actions: [{ label: '重新整理', onClick: function(){ AUI.toast('已更新', { type: 'success' }) } }, { label: '稍後' }] })">顯示</button>` }
  ],
  api:[
    ['AUI.notify(options)','顯示通知，回傳關閉函式','—'],
    ['options.title / text','標題／說明','—'],
    ['options.type','success／error','一般'],
    ['options.actions','[{ label, onClick }]','—'],
    ['options.duration','顯示多久（毫秒），0 為不自動關閉','4500'],
    ['[data-a-notify="標題|內文"]','點擊按鈕就顯示','—']
  ]
}
);

['data-table','cascader','transfer','range-picker','tag-input','command','context-menu','notification'].forEach(id => { const c = window.COMPONENTS.find(x => x.id === id); if(c) c.js = true; });

/* 日期範圍範例：顯示晚數 */
if(typeof document !== 'undefined') document.addEventListener('a-change', e => {
  if(e.target.id !== 'rp-demo') return;
  const sum = document.getElementById('rp-sum'); if(!sum) return;
  const { start, end } = e.detail;
  sum.innerHTML = end ? '共 <b>' + Math.round((new Date(end) - new Date(start)) / 864e5) + '</b> 晚' : '請選擇退房日';
});
})();
