/* 版型（一）：登入、儀表板、設定、資料列表 */
TEMPLATES.push({
  id:'login', name:'登入', en:'Sign in',
  desc:'左邊品牌區、右邊登入表單；手機上品牌區縮成頂部色帶。表單有錯誤狀態、記住我、第三方登入和註冊連結。',
  uses:['button','input','checkbox','divider'],
  css:`
.lg{display:grid;grid-template-columns:1.1fr 1fr;min-height:100vh}
.lg-brand{background:var(--a-navy);color:#fff;padding:56px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden}
.lg-brand::after{content:"";position:absolute;right:-120px;bottom:-120px;width:380px;height:380px;border-radius:50%;background:var(--a-coral);opacity:.9}
.lg-logo{display:flex;align-items:center;gap:10px;font-weight:700;font-size:18px;position:relative;z-index:1}
.lg-logo i{width:34px;height:34px;border-radius:var(--a-r-sm,10px);background:var(--a-coral);display:grid;place-items:center;font-style:normal}
.lg-quote{font-size:28px;line-height:1.45;font-weight:700;max-width:420px;position:relative;z-index:1}
.lg-quote small{display:block;margin-top:14px;font-size:14px;font-weight:400;opacity:.75}
.lg-main{display:grid;place-items:center;padding:40px 24px;background:var(--a-surface)}
.lg-form{width:100%;max-width:380px;display:grid;gap:18px}
.lg-form h1{margin:0;font-size:26px;color:var(--a-ink)}
.lg-form p{margin:-10px 0 4px;color:var(--a-ink-2);font-size:14px}
.lg-row{display:flex;justify-content:space-between;align-items:center;font-size:14px}
.lg-row a,.lg-foot a{color:var(--a-coral-dark);font-weight:600;text-decoration:none}
.lg-sso{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.lg-foot{text-align:center;font-size:14px;color:var(--a-ink-2)}
@media (max-width:760px){.lg{grid-template-columns:1fr}.lg-brand{padding:24px;min-height:auto}.lg-brand::after{width:160px;height:160px;right:-50px;bottom:-70px}.lg-quote{display:none}}
`,
  html:`
<div class="lg">
  <aside class="lg-brand">
    <div class="lg-logo"><i>A</i>AICDE Studio</div>
    <p class="lg-quote">把設計系統交給團隊，<br>每個人做出來的畫面都一致。<small>— 已有 1,200 個團隊在使用</small></p>
  </aside>
  <main class="lg-main">
    <form class="lg-form" onsubmit="event.preventDefault()">
      <h1>歡迎回來</h1>
      <p>登入後繼續你的專案。</p>
      <label class="a-field">
        <span class="a-label">電子郵件</span>
        <input class="a-input" type="email" placeholder="name@example.com" autocomplete="email">
      </label>
      <label class="a-field is-error">
        <span class="a-label">密碼</span>
        <input class="a-input" type="password" value="1234" aria-invalid="true" autocomplete="current-password">
        <span class="a-help">密碼錯誤，請再試一次或重設密碼。</span>
      </label>
      <div class="lg-row">
        <label class="a-check"><input type="checkbox" checked> 記住我</label>
        <a href="#">忘記密碼？</a>
      </div>
      <button class="a-btn a-btn--primary a-btn--block a-btn--lg">登入</button>
      <div class="a-divider">或使用以下方式</div>
      <div class="lg-sso">
        <button type="button" class="a-btn a-btn--outline">Google</button>
        <button type="button" class="a-btn a-btn--outline">Apple</button>
      </div>
      <p class="lg-foot">還沒有帳號？<a href="#">免費註冊</a></p>
    </form>
  </main>
</div>`
});

(() => {
const ic = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const IC = {
  home: ic('<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
  box: ic('<path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8"/>'),
  chart: ic('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  user: ic('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'),
  gear: ic('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  search: ic('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  bell: ic('<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>'),
  menu: ic('<path d="M4 7h16M4 12h16M4 17h10"/>'),
  plus: ic('<path d="M12 5v14M5 12h14"/>'),
  upload: ic('<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>'),
  download: ic('<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>')
};

/* ---------- 後台儀表板 ---------- */
TEMPLATES.push({
  id:'dashboard', name:'後台儀表板', en:'Dashboard',
  desc:'左側選單、頂部搜尋與通知，主區是數字卡、營收長條圖、最近訂單和動態時間軸。手機上選單收進左上角的按鈕。',
  uses:['menu','input','badge','avatar','statistic','table','tag','timeline','button'],
  css:`
.db{display:grid;grid-template-columns:240px minmax(0,1fr);min-height:100vh}
.db-side{background:var(--a-surface);border-right:1px solid var(--a-line);padding:20px 14px;display:flex;flex-direction:column;gap:18px}
.db-logo{display:flex;align-items:center;gap:10px;font-weight:700;color:var(--a-ink);padding:0 8px}
.db-logo i{width:30px;height:30px;border-radius:var(--a-r-sm,8px);background:var(--a-coral);color:#fff;display:grid;place-items:center;font-style:normal}
.db-side .a-menu{width:100%}
.db-main{min-width:0;display:flex;flex-direction:column}
.db-top{display:flex;align-items:center;gap:12px;padding:14px 28px;background:var(--a-surface);border-bottom:1px solid var(--a-line)}
.db-top .a-input-wrap{flex:1;max-width:360px}
.db-top .a-input-wrap .a-input{width:100%}
.db-top-r{margin-left:auto;display:flex;align-items:center;gap:14px}
.db-menu-btn{display:none}
.db-body{padding:28px;display:grid;gap:24px}
.db-head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px}
.db-head h1{margin:0;font-size:24px;color:var(--a-ink)}
.db-head p{margin:4px 0 0;color:var(--a-ink-2);font-size:14px}
.db-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:24px}
.db-panel{background:var(--a-surface);border:1px solid var(--a-line);border-radius:var(--a-r-lg,16px);padding:20px;min-width:0}
.db-panel h2{margin:0 0 16px;font-size:16px;color:var(--a-ink);display:flex;justify-content:space-between;align-items:center}
.db-panel h2 small{font-weight:400;font-size:13px;color:var(--a-ink-2)}
.db-chart{display:flex;align-items:flex-end;gap:10px;height:200px;padding-top:8px;border-bottom:1px solid var(--a-line)}
.db-bar{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end;min-width:0}
.db-bar span{width:100%;max-width:34px;border-radius:var(--a-r-xs,4px) var(--a-r-xs,4px) 0 0;background:var(--a-sky);height:calc(var(--h) * 1%)}
.db-bar.is-now span{background:var(--a-coral)}
.db-bar em{font-style:normal;font-size:12px;color:var(--a-ink-2)}
.db-legend{display:flex;gap:16px;margin-top:12px;font-size:13px;color:var(--a-ink-2)}
.db-legend i{display:inline-block;width:10px;height:10px;border-radius:2px;background:var(--a-sky);margin-right:6px;vertical-align:-1px}
.db-legend i.is-now{background:var(--a-coral)}
.db-panel .a-table td{white-space:nowrap}
@media (max-width:900px){
  .db{grid-template-columns:1fr}
  .db-side{position:fixed;inset:0 auto 0 0;width:260px;z-index:20;transform:translateX(-100%);transition:transform .25s ease;box-shadow:0 0 0 100vmax transparent}
  .db.is-open .db-side{transform:none;box-shadow:0 0 0 100vmax rgba(0,0,0,.35)}
  .db-menu-btn{display:inline-flex}
  .db-top{padding:12px 16px}
  .db-body{padding:20px 16px}
  .db-grid{grid-template-columns:1fr}
  .db-hide-sm{display:none}
}
`,
  html:`
<div class="db" id="db">
  <aside class="db-side" aria-label="側邊選單">
    <div class="db-logo"><i>A</i>AICDE 商店後台</div>
    <nav class="a-menu" aria-label="主選單">
      <a class="a-menu__item" href="#" aria-current="page">${IC.home}總覽</a>
      <a class="a-menu__item" href="#">${IC.box}訂單<span class="a-menu__badge">8</span></a>
      <details open>
        <summary>${IC.chart}報表</summary>
        <div>
          <a class="a-menu__item" href="#">營收</a>
          <a class="a-menu__item" href="#">流量來源</a>
        </div>
      </details>
      <a class="a-menu__item" href="#">${IC.user}會員</a>
      <div class="a-menu__label">系統</div>
      <a class="a-menu__item" href="#">${IC.gear}設定</a>
    </nav>
  </aside>
  <div class="db-main">
    <header class="db-top">
      <button class="a-btn a-btn--ghost a-btn--icon db-menu-btn" aria-label="開啟選單" onclick="document.getElementById('db').classList.toggle('is-open')">${IC.menu}</button>
      <span class="a-input-wrap">${IC.search}<input class="a-input a-input--sm" type="search" placeholder="搜尋訂單、會員、商品…"></span>
      <div class="db-top-r">
        <span class="a-badge"><button class="a-btn a-btn--ghost a-btn--icon" aria-label="通知，3 則未讀">${IC.bell}</button><span class="a-badge__count">3</span></span>
        <span class="a-avatar a-avatar--sm a-avatar--coral" title="林雅婷">林</span>
      </div>
    </header>
    <main class="db-body" onclick="if(event.target.closest('.db-body'))document.getElementById('db').classList.remove('is-open')">
      <div class="db-head">
        <div><h1>早安，雅婷</h1><p>這是 11 月到今天為止的營運狀況。</p></div>
        <button class="a-btn a-btn--primary">${IC.download}匯出報表</button>
      </div>
      <div class="a-stat-row">
        <div class="a-stat"><span class="a-stat__label">本月營收</span><span class="a-stat__value"><span data-a-count="1284500">0</span><small>元</small></span><span class="a-stat__trend">▲ 12.4%</span></div>
        <div class="a-stat"><span class="a-stat__label">訂單數</span><span class="a-stat__value" data-a-count="2318">0</span><span class="a-stat__trend">▲ 6.8%</span></div>
        <div class="a-stat"><span class="a-stat__label">新會員</span><span class="a-stat__value" data-a-count="516">0</span><span class="a-stat__trend">▲ 3.1%</span></div>
        <div class="a-stat"><span class="a-stat__label">退貨率</span><span class="a-stat__value"><span data-a-count="2.4" data-decimals="1">0</span><small>%</small></span><span class="a-stat__trend a-stat__trend--down">▲ 0.6%</span></div>
      </div>
      <div class="db-grid">
        <section class="db-panel">
          <h2>每月營收<small>單位：萬元</small></h2>
          <div class="db-chart" role="img" aria-label="6 月到 11 月營收：82、95、88、104、116、128 萬元">
            <div class="db-bar" style="--h:64"><span></span><em>6月</em></div>
            <div class="db-bar" style="--h:74"><span></span><em>7月</em></div>
            <div class="db-bar" style="--h:69"><span></span><em>8月</em></div>
            <div class="db-bar" style="--h:81"><span></span><em>9月</em></div>
            <div class="db-bar" style="--h:90"><span></span><em>10月</em></div>
            <div class="db-bar is-now" style="--h:100"><span></span><em>11月</em></div>
          </div>
          <div class="db-legend"><span><i></i>過去月份</span><span><i class="is-now"></i>本月</span></div>
        </section>
        <section class="db-panel">
          <h2>最新動態</h2>
          <ol class="a-timeline">
            <li class="is-active"><span class="a-timeline__title">訂單 #A1048 已出貨</span>黑貓宅急便 8823-1145<span class="a-timeline__time">今天 14:32</span></li>
            <li><span class="a-timeline__title">陳建宏 申請退貨</span>原因：尺寸不合<span class="a-timeline__time">今天 11:05</span></li>
            <li><span class="a-timeline__title">雙 11 活動結束</span>共成交 412 筆<span class="a-timeline__time">昨天 23:59</span></li>
            <li class="is-muted"><span class="a-timeline__title">年終盤點</span>預計 12/28</li>
          </ol>
        </section>
      </div>
      <section class="db-panel">
        <h2>最近訂單<a class="a-btn a-btn--ghost a-btn--sm" href="#">查看全部</a></h2>
        <div class="a-table-wrap">
          <table class="a-table a-table--hover">
            <thead><tr><th>訂單編號</th><th>顧客</th><th class="db-hide-sm">日期</th><th>狀態</th><th class="is-num">金額</th></tr></thead>
            <tbody>
              <tr><td>#A1048</td><td>王小明</td><td class="db-hide-sm">11/20</td><td><span class="a-tag a-tag--success a-tag--dot">已出貨</span></td><td class="is-num">3,280</td></tr>
              <tr><td>#A1047</td><td>林雅婷</td><td class="db-hide-sm">11/20</td><td><span class="a-tag a-tag--coral a-tag--dot">待付款</span></td><td class="is-num">1,450</td></tr>
              <tr><td>#A1046</td><td>陳建宏</td><td class="db-hide-sm">11/19</td><td><span class="a-tag a-tag--outline">退貨中</span></td><td class="is-num">890</td></tr>
              <tr><td>#A1045</td><td>張家豪</td><td class="db-hide-sm">11/19</td><td><span class="a-tag a-tag--success a-tag--dot">已出貨</span></td><td class="is-num">5,620</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</div>`
});

/* ---------- 設定頁 ---------- */
TEMPLATES.push({
  id:'settings', name:'設定頁', en:'Settings',
  desc:'用標籤頁分成個人資料、通知、方案三區：頭像上傳、表單、通知開關、用量進度，最後是刪除帳號的危險區。',
  uses:['tabs','avatar','upload','input','textarea','select','switch','progress','button','alert','divider'],
  css:`
.st{max-width:880px;margin:0 auto;padding:40px 24px 64px}
.st h1{margin:0 0 4px;font-size:26px;color:var(--a-ink)}
.st-sub{margin:0 0 24px;color:var(--a-ink-2);font-size:14px}
.st-card{background:var(--a-surface);border:1px solid var(--a-line);border-radius:var(--a-r-lg,16px);padding:24px;margin-top:20px}
.st-card h2{margin:0 0 4px;font-size:17px;color:var(--a-ink)}
.st-card > p{margin:0 0 20px;color:var(--a-ink-2);font-size:14px}
.st-profile{display:grid;grid-template-columns:auto minmax(0,1fr);gap:20px;align-items:center;margin-bottom:20px}
.st-profile .a-upload-wrap,.st-profile .a-upload{width:100%}
.st-form{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.st-form .st-wide{grid-column:1/-1}
.st-form .a-input{width:100%}
.st-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}
.st-row{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid var(--a-line)}
.st-row:last-child{border-bottom:0}
.st-row b{display:block;color:var(--a-ink);font-size:15px}
.st-row span.st-desc{font-size:13px;color:var(--a-ink-2)}
.st-plan{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:20px}
.st-plan strong{font-size:22px;color:var(--a-ink)}
.st-usage{display:grid;gap:16px}
.st-usage label{display:flex;justify-content:space-between;font-size:14px;color:var(--a-ink);margin-bottom:6px}
.st-danger{border-color:var(--a-danger)}
.st-danger h2{color:var(--a-danger)}
.st-danger .st-row{border:0;padding:0}
@media (max-width:640px){
  .st{padding:24px 16px 48px}
  .st-card{padding:18px}
  .st-form{grid-template-columns:1fr}
  .st-profile{grid-template-columns:1fr}
  .st-danger .st-row{flex-direction:column;align-items:flex-start}
}
`,
  html:`
<div class="st">
  <h1>帳號設定</h1>
  <p class="st-sub">管理個人資料、通知方式與訂閱方案。</p>
  <div class="a-tabs">
    <div class="a-tabs__list" role="tablist">
      <button role="tab" aria-selected="true" aria-controls="st-p1">個人資料</button>
      <button role="tab" aria-selected="false" aria-controls="st-p2">通知</button>
      <button role="tab" aria-selected="false" aria-controls="st-p3">方案與帳務</button>
    </div>
    <div class="a-tabs__panel" role="tabpanel" id="st-p1">
      <section class="st-card">
        <h2>個人資料</h2>
        <p>這些資料會顯示在你的公開頁面上。</p>
        <div class="st-profile">
          <span class="a-avatar a-avatar--lg a-avatar--coral">林</span>
          <div class="a-upload-wrap">
            <label class="a-upload">
              <input type="file" accept="image/*">
              <span class="a-upload__icon">${IC.upload}</span>
              <span class="a-upload__title">把照片拖到這裡，或 <b>點擊選擇</b></span>
              <span class="a-upload__hint">JPG、PNG，至少 256×256，2 MB 以內</span>
            </label>
            <ul class="a-upload-list"></ul>
          </div>
        </div>
        <form class="st-form" onsubmit="event.preventDefault()">
          <label class="a-field"><span class="a-label">姓名</span><input class="a-input" value="林雅婷" autocomplete="name"></label>
          <label class="a-field"><span class="a-label">顯示名稱</span><input class="a-input" value="yating"></label>
          <label class="a-field"><span class="a-label">電子郵件</span><input class="a-input" type="email" value="yating@example.com" autocomplete="email"><span class="a-help">變更後需要重新驗證。</span></label>
          <label class="a-field"><span class="a-label">所在地區</span>
            <select class="a-input a-select"><option>台北市</option><option>新北市</option><option>台中市</option><option>台南市</option><option>高雄市</option></select>
          </label>
          <label class="a-field st-wide"><span class="a-label">自我介紹</span>
            <textarea class="a-input a-textarea" maxlength="160" placeholder="用一兩句話介紹你自己">品牌設計師，喜歡把複雜的事情畫成簡單的圖。</textarea>
            <span class="a-field__count"></span>
          </label>
          <div class="st-actions st-wide">
            <button type="reset" class="a-btn a-btn--outline">取消</button>
            <button class="a-btn a-btn--primary">儲存變更</button>
          </div>
        </form>
      </section>
      <section class="st-card st-danger">
        <h2>危險區域</h2>
        <p>刪除帳號後，所有專案和檔案都會永久移除，無法復原。</p>
        <div class="st-row">
          <div><b>刪除這個帳號</b><span class="st-desc">刪除前請先匯出需要保留的資料。</span></div>
          <button class="a-btn a-btn--primary">刪除帳號</button>
        </div>
      </section>
    </div>
    <div class="a-tabs__panel" role="tabpanel" id="st-p2" hidden>
      <section class="st-card">
        <h2>通知</h2>
        <p>選擇你想收到哪些通知。</p>
        <div class="st-row"><div><b>訂單狀態</b><span class="st-desc">出貨、退貨與付款結果</span></div><label class="a-switch"><input type="checkbox" role="switch" checked aria-label="訂單狀態"><span class="a-switch__track"><span class="a-switch__thumb"></span></span></label></div>
        <div class="st-row"><div><b>留言與提及</b><span class="st-desc">有人在專案中提到你時</span></div><label class="a-switch"><input type="checkbox" role="switch" checked aria-label="留言與提及"><span class="a-switch__track"><span class="a-switch__thumb"></span></span></label></div>
        <div class="st-row"><div><b>每週報告</b><span class="st-desc">每週一早上寄送上週摘要</span></div><label class="a-switch"><input type="checkbox" role="switch" aria-label="每週報告"><span class="a-switch__track"><span class="a-switch__thumb"></span></span></label></div>
        <div class="st-row"><div><b>產品更新與活動</b><span class="st-desc">新功能和優惠，一個月最多兩封</span></div><label class="a-switch"><input type="checkbox" role="switch" aria-label="產品更新與活動"><span class="a-switch__track"><span class="a-switch__thumb"></span></span></label></div>
      </section>
    </div>
    <div class="a-tabs__panel" role="tabpanel" id="st-p3" hidden>
      <section class="st-card">
        <div class="st-plan">
          <div><h2>目前方案</h2><strong>團隊版</strong> <span class="a-tag a-tag--success a-tag--dot">使用中</span><p class="st-sub" style="margin:6px 0 0">每月 NT$1,290，下次扣款日 12/05</p></div>
          <button class="a-btn a-btn--secondary">升級方案</button>
        </div>
        <div class="st-usage">
          <div><label>成員 <span>8 / 10 人</span></label><div class="a-progress"><div class="a-progress__track" role="progressbar" aria-label="成員" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100"><div class="a-progress__bar" style="--v:.8"></div></div>80%</div></div>
          <div><label>儲存空間 <span>32 / 100 GB</span></label><div class="a-progress a-progress--navy"><div class="a-progress__track" role="progressbar" aria-label="儲存空間" aria-valuenow="32" aria-valuemin="0" aria-valuemax="100"><div class="a-progress__bar" style="--v:.32"></div></div>32%</div></div>
        </div>
      </section>
    </div>
  </div>
</div>`
});

/* ---------- 資料列表 ---------- */
const dlRow = (name, owner, status, n, date) =>
  `        <tr><td class="a-table__check"><label class="a-check"><input type="checkbox" aria-label="選取 ${name}"></label></td><td>${name}</td><td class="dl-hide-sm">${owner}</td><td>${status}</td><td class="is-num">${n}</td><td class="dl-hide-sm" data-value="${date}">${date.slice(5).replace('-', '/')}</td></tr>`;
const ON = '<span class="a-tag a-tag--success a-tag--dot">上架</span>', OFF = '<span class="a-tag a-tag--outline">下架</span>', LOW = '<span class="a-tag a-tag--coral a-tag--dot">庫存低</span>';
TEMPLATES.push({
  id:'data-list', name:'資料列表', en:'Data list',
  desc:'頁首有麵包屑和新增按鈕，篩選列有搜尋、分類、狀態與日期區間；表格可以排序和批次勾選，底部是分頁。',
  uses:['breadcrumb','button','input','select','segmented','date','data-table','tag','checkbox','pagination'],
  css:`
.dl{max-width:1200px;margin:0 auto;padding:28px 28px 56px;display:grid;gap:20px}
.dl-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:12px}
.dl-head h1{margin:6px 0 0;font-size:26px;color:var(--a-ink)}
.dl-head-r{display:flex;gap:10px;flex-wrap:wrap}
.dl-card{background:var(--a-surface);border:1px solid var(--a-line);border-radius:var(--a-r-lg,16px);padding:20px;display:grid;gap:16px;min-width:0}
.dl-filters{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end}
.dl-filters .a-field{min-width:0}
.dl-filters .a-input-wrap{flex:1 1 220px;min-width:0}
.dl-filters .a-input-wrap .a-input{width:100%}
.dl-filters > select{flex:0 0 180px;width:180px}
.dl-filters .a-date-range{flex-wrap:wrap}
.dl-filters .a-date-range .a-input{min-width:0;width:150px}
.dl-foot{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;font-size:14px;color:var(--a-ink-2)}
@media (max-width:720px){
  .dl{padding:20px 12px 40px}
  .dl-card{padding:12px}
  .dl-card .a-table td{white-space:nowrap}
  .dl-filters > *{flex:1 1 100%}
  .dl-filters > select{flex:1 1 100%;width:100%}
  .dl-filters .a-date-range .a-input{flex:1 1 0;width:auto}
  .dl-hide-sm{display:none}
  .dl-foot{justify-content:center}
}
`,
  html:`
<div class="dl">
  <header class="dl-head">
    <div>
      <nav class="a-breadcrumb" aria-label="麵包屑">
        <ol>
          <li><a href="#">後台</a></li>
          <li><a href="#">商品</a></li>
          <li aria-current="page">商品列表</li>
        </ol>
      </nav>
      <h1>商品列表</h1>
    </div>
    <div class="dl-head-r">
      <button class="a-btn a-btn--outline">${IC.download}匯出</button>
      <button class="a-btn a-btn--primary">${IC.plus}新增商品</button>
    </div>
  </header>
  <section class="dl-card">
    <div class="dl-filters">
      <span class="a-input-wrap">${IC.search}<input class="a-input" type="search" placeholder="搜尋商品名稱或負責人" data-a-filter="dl-table" aria-label="搜尋"></span>
      <select class="a-input a-select" aria-label="分類"><option>全部分類</option><option>咖啡豆</option><option>器材</option><option>禮盒</option></select>
      <div class="a-segmented" role="radiogroup" aria-label="狀態">
        <label><input type="radio" name="dl-st" checked><span>全部</span></label>
        <label><input type="radio" name="dl-st"><span>上架</span></label>
        <label><input type="radio" name="dl-st"><span>下架</span></label>
      </div>
      <div class="a-date-range">
        <input class="a-input" type="date" value="2026-11-01" aria-label="開始日期">
        <span>→</span>
        <input class="a-input" type="date" value="2026-11-30" min="2026-11-01" aria-label="結束日期">
      </div>
    </div>
    <div class="a-table-toolbar">
      <span class="a-table-toolbar__info" data-a-selected="dl-table"></span>
    </div>
    <div class="a-table-wrap">
      <table class="a-table a-table--hover" id="dl-table">
        <thead><tr>
          <th class="a-table__check"><label class="a-check"><input type="checkbox" aria-label="全選"></label></th>
          <th aria-sort="none"><button class="a-th-sort">商品</button></th>
          <th class="dl-hide-sm" aria-sort="none"><button class="a-th-sort">負責人</button></th>
          <th>狀態</th>
          <th class="is-num" aria-sort="none" data-sort="num"><button class="a-th-sort">庫存</button></th>
          <th class="dl-hide-sm" aria-sort="none"><button class="a-th-sort">更新</button></th>
        </tr></thead>
        <tbody>
${dlRow('衣索比亞 耶加雪菲', '王小明', ON, '128', '2026-11-18')}
${dlRow('哥倫比亞 慧蘭', '林雅婷', LOW, '6', '2026-11-20')}
${dlRow('手沖壺 600ml', '陳建宏', ON, '42', '2026-11-12')}
${dlRow('冬季禮盒', '林雅婷', OFF, '0', '2026-10-30')}
${dlRow('肯亞 AA', '張家豪', ON, '75', '2026-11-15')}
${dlRow('磨豆機 C40', '陳建宏', LOW, '3', '2026-11-19')}
        </tbody>
      </table>
    </div>
    <div class="dl-foot">
      <span>共 30 筆，每頁 6 筆</span>
      <nav class="a-pagination" aria-label="分頁" data-total="5" data-current="1"></nav>
    </div>
  </section>
</div>`
});
})();
