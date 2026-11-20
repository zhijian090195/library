/* 版型（二）：價目方案、結帳、預約掛號、文章 */

const TPL_CHECK = '<svg class="pr-ok" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

TEMPLATES.push({
  id:'pricing', name:'價目方案', en:'Pricing',
  desc:'三個方案並排，中間的推薦方案加強；月繳／年繳用分段控制器切換，價格用 CSS :has() 即時換掉，不需要 JS。下方接功能比較表、常見問題與行動呼籲橫幅。',
  uses:['segmented','card','button','tag','table','collapse','banner'],
  css:`
.pr{max-width:1120px;margin:0 auto;padding:56px 24px 72px}
.pr-head{text-align:center;max-width:620px;margin:0 auto 36px}
.pr-head h1{margin:12px 0 10px;font-size:clamp(28px,4vw,40px);line-height:1.25;color:var(--a-ink)}
.pr-head p{margin:0 0 24px;color:var(--a-ink-2);font-size:16px;line-height:1.7}
.pr-toggle{display:flex;justify-content:center;align-items:center;gap:10px;flex-wrap:wrap}
.pr-save{font-size:13px;color:var(--a-coral-dark);font-weight:600}
.pr-plans{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;align-items:stretch;margin-top:8px}
.pr-plans .a-card{width:auto;height:100%;display:flex;flex-direction:column}
.pr-plans .a-card__body{flex:1;display:flex;flex-direction:column;gap:6px}
.pr-pop{position:relative}
.pr-plans .pr-pop{outline:2px solid var(--a-coral);outline-offset:4px;border-radius:var(--a-r-lg,16px)}
.pr-badge{position:absolute;top:-14px;left:50%;transform:translateX(-50%);z-index:2;white-space:nowrap}
.pr-price{display:flex;align-items:baseline;gap:6px;margin:10px 0 2px;color:var(--a-ink)}
.pr-price b{font-size:36px;line-height:1;font-variant-numeric:tabular-nums}
.pr-price > span{color:var(--a-ink-2);font-size:14px}
.pr-note{font-size:13px;color:var(--a-ink-3);min-height:20px}
.pr-y{display:none}
.pr:has(input[value="year"]:checked) .pr-y{display:inline}
.pr:has(input[value="year"]:checked) .pr-m{display:none}
.pr-feat{list-style:none;margin:14px 0 0;padding:0;display:grid;gap:10px;font-size:14px;color:var(--a-ink-body)}
.pr-feat li{display:flex;gap:8px;align-items:flex-start;line-height:1.5}
.pr-ok{flex:none;width:18px;height:18px;margin-top:1px;fill:none;stroke:var(--a-success);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
.pr-plans .a-card__footer .a-btn{width:100%}
.pr h2{font-size:24px;color:var(--a-ink);margin:72px 0 20px;text-align:center}
.pr-cmp td:not(:first-child),.pr-cmp th:not(:first-child){text-align:center}
.pr-faq{max-width:760px;margin:0 auto}
.pr-cta{margin-top:56px}
.pr-cta .a-banner{flex-wrap:wrap;gap:12px 16px}
@media (max-width:900px){.pr-plans{grid-template-columns:minmax(0,1fr);max-width:460px;margin-inline:auto;gap:32px}}
@media (max-width:600px){.pr{padding:36px 16px 56px}.pr-head{margin-bottom:28px}}
`,
  html:`
<div class="pr">
  <header class="pr-head">
    <span class="a-tag a-tag--coral">14 天免費試用</span>
    <h1>選一個適合團隊的方案</h1>
    <p>所有方案都包含完整元件庫、15 種主題與深色模式。隨時可以升級或降級，按天數比例計費。</p>
    <div class="pr-toggle">
      <div class="a-segmented" role="radiogroup" aria-label="付款週期">
        <label><input type="radio" name="pr-cycle" value="month" checked><span>月繳</span></label>
        <label><input type="radio" name="pr-cycle" value="year"><span>年繳</span></label>
      </div>
      <span class="pr-save">年繳省兩個月</span>
    </div>
  </header>

  <section class="pr-plans">
    <article class="a-card a-card--outline">
      <div class="a-card__body">
        <span class="a-card__eyebrow">個人</span>
        <h3 class="a-card__title">入門</h3>
        <p class="a-card__text">一個人做側邊專案或接案。</p>
        <div class="pr-price"><b><span class="pr-m">NT$ 0</span><span class="pr-y">NT$ 0</span></b><span>／月</span></div>
        <div class="pr-note">永久免費</div>
        <ul class="pr-feat">
          <li>${TPL_CHECK}3 個專案</li>
          <li>${TPL_CHECK}全部 59 個元件</li>
          <li>${TPL_CHECK}社群論壇支援</li>
        </ul>
      </div>
      <div class="a-card__footer"><button class="a-btn a-btn--outline">免費開始</button></div>
    </article>

    <div class="pr-pop">
      <span class="a-tag a-tag--coral pr-badge">最多人選</span>
      <article class="a-card">
        <div class="a-card__body">
          <span class="a-card__eyebrow">小團隊</span>
          <h3 class="a-card__title">專業</h3>
          <p class="a-card__text">5–20 人的產品團隊，共用一套設計語言。</p>
          <div class="pr-price"><b><span class="pr-m">NT$ 390</span><span class="pr-y">NT$ 325</span></b><span>／人／月</span></div>
          <div class="pr-note"><span class="pr-m">按月計費，隨時取消</span><span class="pr-y">年繳 NT$ 3,900／人</span></div>
          <ul class="pr-feat">
            <li>${TPL_CHECK}不限專案數</li>
            <li>${TPL_CHECK}自訂品牌色與主題</li>
            <li>${TPL_CHECK}Figma 元件同步</li>
            <li>${TPL_CHECK}一個工作天內回覆</li>
          </ul>
        </div>
        <div class="a-card__footer"><button class="a-btn a-btn--primary">開始 14 天試用</button></div>
      </article>
    </div>

    <article class="a-card a-card--outline">
      <div class="a-card__body">
        <span class="a-card__eyebrow">組織</span>
        <h3 class="a-card__title">企業</h3>
        <p class="a-card__text">多個品牌、需要權限與稽核紀錄。</p>
        <div class="pr-price"><b><span class="pr-m">NT$ 890</span><span class="pr-y">NT$ 742</span></b><span>／人／月</span></div>
        <div class="pr-note"><span class="pr-m">20 人起</span><span class="pr-y">年繳 NT$ 8,900／人，20 人起</span></div>
        <ul class="pr-feat">
          <li>${TPL_CHECK}專業方案的所有功能</li>
          <li>${TPL_CHECK}SSO 單一登入與權限</li>
          <li>${TPL_CHECK}稽核紀錄保留 1 年</li>
          <li>${TPL_CHECK}專屬客戶經理</li>
        </ul>
      </div>
      <div class="a-card__footer"><button class="a-btn a-btn--secondary">聯絡業務</button></div>
    </article>
  </section>

  <h2>方案比較</h2>
  <div class="a-table-wrap">
    <table class="a-table a-table--striped pr-cmp">
      <thead><tr><th>功能</th><th>入門</th><th>專業</th><th>企業</th></tr></thead>
      <tbody>
        <tr><td>專案數</td><td>3</td><td>不限</td><td>不限</td></tr>
        <tr><td>成員數</td><td>1</td><td>20</td><td>不限</td></tr>
        <tr><td>自訂主題</td><td>—</td><td>✓</td><td>✓</td></tr>
        <tr><td>Figma 同步</td><td>—</td><td>✓</td><td>✓</td></tr>
        <tr><td>SSO 登入</td><td>—</td><td>—</td><td>✓</td></tr>
        <tr><td>客服回覆時間</td><td>社群</td><td>1 個工作天</td><td>4 小時</td></tr>
      </tbody>
    </table>
  </div>

  <h2>常見問題</h2>
  <div class="a-collapse pr-faq">
    <details name="pr-faq" open><summary>試用期結束後會自動扣款嗎？</summary><div class="a-collapse__body">不會。試用期結束前 3 天會寄信提醒，你確認方案後才會開始計費。</div></details>
    <details name="pr-faq"><summary>可以開發票嗎？</summary><div class="a-collapse__body">可以，付款後會自動開立電子發票；需要統一編號請在帳單設定填寫。</div></details>
    <details name="pr-faq"><summary>中途增加成員怎麼計費？</summary><div class="a-collapse__body">依加入當天到帳單日的天數按比例計算，下一期再以完整月費計費。</div></details>
    <details name="pr-faq"><summary>教育或非營利單位有優惠嗎？</summary><div class="a-collapse__body">有，學校與立案非營利組織享專業方案 5 折，請來信附上證明文件。</div></details>
  </div>

  <div class="pr-cta">
    <div class="a-banner" role="region" aria-label="聯絡我們"><span class="a-banner__tag">企業</span><span>超過 50 人？我們可以幫你規劃導入與教育訓練。</span><button class="a-btn a-btn--primary a-btn--sm">預約 30 分鐘諮詢</button></div>
  </div>
</div>`
});

TEMPLATES.push({
  id:'checkout', name:'結帳', en:'Checkout',
  desc:'步驟條標示進度；左邊是收件資料、配送方式與付款，右邊是黏在畫面上的訂單摘要。手機上訂單摘要移到最上面並預設收合，只露出總金額。',
  uses:['steps','input','select','radio','checkbox','card','button','divider','alert'],
  css:`
.co{max-width:1120px;margin:0 auto;padding:32px 24px 64px}
.co-top{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:28px;flex-wrap:wrap}
.co-logo{font-weight:700;font-size:18px;color:var(--a-ink);display:flex;align-items:center;gap:8px}
.co-logo i{width:30px;height:30px;border-radius:var(--a-r-sm,8px);background:var(--a-coral);color:#fff;display:grid;place-items:center;font-style:normal}
.co-safe{font-size:13px;color:var(--a-ink-2)}
.co-steps{margin-bottom:36px}
.co-grid{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:40px;align-items:start}
.co-main{display:grid;gap:36px;min-width:0}
.co-sec h2{font-size:18px;margin:0 0 16px;color:var(--a-ink);display:flex;align-items:center;gap:10px}
.co-sec h2 span{width:26px;height:26px;border-radius:50%;background:var(--a-navy);color:#fff;font-size:13px;display:grid;place-items:center}
.co-fields{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.co-fields .is-wide{grid-column:1/-1}
.co-ship{display:grid;gap:10px}
.co-opt{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border:1px solid var(--a-line);border-radius:var(--a-r-md,12px);background:var(--a-surface)}
.co-opt:has(input:checked){border-color:var(--a-coral)}
.co-opt small{display:block;color:var(--a-ink-2);font-size:13px;margin-top:2px}
.co-opt b{font-variant-numeric:tabular-nums;color:var(--a-ink);white-space:nowrap}
.co-side{position:sticky;top:24px;min-width:0}
.co-side .a-card{width:auto}
.co-sum summary{font-weight:600}
.co-items{list-style:none;margin:0;padding:0;display:grid;gap:14px}
.co-items li{display:grid;grid-template-columns:56px minmax(0,1fr) auto;gap:12px;align-items:center}
.co-thumb{width:56px;height:56px;border-radius:var(--a-r-sm,8px);position:relative}
.co-thumb em{position:absolute;top:-6px;right:-6px;min-width:20px;height:20px;border-radius:10px;background:var(--a-ink-2);color:var(--a-surface);font-size:12px;font-style:normal;display:grid;place-items:center;padding:0 5px}
.co-t1{background:linear-gradient(135deg,var(--a-sky),var(--a-navy))}
.co-t2{background:linear-gradient(135deg,var(--a-coral),var(--a-coral-dark))}
.co-t3{background:linear-gradient(135deg,var(--a-surface-2),var(--a-line-strong))}
.co-items b{display:block;font-size:14px;color:var(--a-ink)}
.co-items small{color:var(--a-ink-2);font-size:13px}
.co-items span{font-variant-numeric:tabular-nums;font-size:14px;color:var(--a-ink)}
.co-coupon{display:flex;gap:8px;margin:18px 0}
.co-coupon .a-input{flex:1;min-width:0}
.co-rows{display:grid;gap:8px;font-size:14px;color:var(--a-ink-body)}
.co-rows div{display:flex;justify-content:space-between;font-variant-numeric:tabular-nums}
.co-total{font-size:18px;font-weight:700;color:var(--a-ink)}
.co-disc{color:var(--a-success)}
.co-pay{margin-top:18px}
.co-fine{font-size:12px;color:var(--a-ink-3);text-align:center;margin:10px 0 0}
@media (max-width:900px){
  .co-grid{grid-template-columns:minmax(0,1fr);gap:28px}
  .co-side{position:static;order:-1}
}
@media (max-width:600px){
  .co{padding:20px 16px 48px}
  .co-fields{grid-template-columns:minmax(0,1fr)}
  .co-steps .a-steps__desc{display:none}
}
`,
  html:`
<div class="co">
  <div class="co-top">
    <div class="co-logo"><i>A</i>AICDE Store</div>
    <span class="co-safe">🔒 安全結帳・資料以 TLS 加密傳輸</span>
  </div>

  <ol class="a-steps co-steps">
    <li class="is-done">購物車<span class="a-steps__desc">4 件商品</span></li>
    <li class="is-current" aria-current="step">填寫資料<span class="a-steps__desc">收件與付款</span></li>
    <li>確認訂單</li>
  </ol>

  <div class="co-grid">
    <form class="co-main" onsubmit="event.preventDefault()">
      <section class="co-sec">
        <h2><span>1</span>收件資料</h2>
        <div class="co-fields">
          <label class="a-field"><span class="a-label">姓名</span><input class="a-input" value="林雅婷" autocomplete="name"></label>
          <label class="a-field"><span class="a-label">手機</span><input class="a-input" type="tel" value="0912-345-678" autocomplete="tel"></label>
          <label class="a-field is-wide"><span class="a-label">電子郵件</span><input class="a-input" type="email" placeholder="收據會寄到這裡" autocomplete="email"></label>
          <label class="a-field"><span class="a-label">縣市</span>
            <select class="a-input a-select"><option>台北市</option><option>新北市</option><option selected>台中市</option><option>台南市</option><option>高雄市</option></select>
          </label>
          <label class="a-field"><span class="a-label">郵遞區號</span><input class="a-input" value="403" inputmode="numeric"></label>
          <label class="a-field is-wide"><span class="a-label">地址</span><input class="a-input" value="西區公益路二段 51 號 8 樓" autocomplete="street-address"></label>
        </div>
      </section>

      <section class="co-sec">
        <h2><span>2</span>配送方式</h2>
        <div class="co-ship" role="radiogroup" aria-label="配送方式">
          <label class="co-opt"><span class="a-check"><input type="radio" name="co-ship" checked><span>宅配到府<small>1–2 個工作天送達</small></span></span><b>NT$ 100</b></label>
          <label class="co-opt"><span class="a-check"><input type="radio" name="co-ship"><span>超商取貨<small>7-ELEVEN、全家，2–3 個工作天</small></span></span><b>NT$ 60</b></label>
          <label class="co-opt"><span class="a-check"><input type="radio" name="co-ship"><span>門市自取<small>台中勤美門市，明天 12:00 後</small></span></span><b>免運</b></label>
        </div>
      </section>

      <section class="co-sec">
        <h2><span>3</span>付款</h2>
        <div class="a-check-group" role="radiogroup" aria-label="付款方式" style="margin-bottom:16px">
          <label class="a-check"><input type="radio" name="co-pay" checked>信用卡</label>
          <label class="a-check"><input type="radio" name="co-pay">LINE Pay</label>
          <label class="a-check"><input type="radio" name="co-pay">ATM 轉帳</label>
        </div>
        <div class="co-fields">
          <label class="a-field is-wide"><span class="a-label">卡號</span><input class="a-input" inputmode="numeric" placeholder="1234 5678 9012 3456" autocomplete="cc-number"></label>
          <label class="a-field"><span class="a-label">有效期限</span><input class="a-input" placeholder="MM / YY" autocomplete="cc-exp"></label>
          <label class="a-field"><span class="a-label">安全碼</span><input class="a-input" inputmode="numeric" placeholder="卡片背面 3 碼" autocomplete="cc-csc"></label>
        </div>
        <label class="a-check" style="margin-top:16px"><input type="checkbox" checked>開立電子發票並存入會員載具</label>
      </section>
    </form>

    <aside class="co-side">
      <article class="a-card a-card--outline">
        <div class="a-card__body">
          <div class="a-collapse co-sum">
            <details id="co-sum">
              <summary>訂單明細（4 件）・總計 NT$ 2,854</summary>
              <div class="a-collapse__body">
                <ul class="co-items">
                  <li><div class="co-thumb co-t1"><em>1</em></div><div><b>紙雕分層桌曆 2027</b><small>A5・霧面</small></div><span>NT$ 680</span></li>
                  <li><div class="co-thumb co-t2"><em>2</em></div><div><b>珊瑚紅帆布托特包</b><small>大・帆布 12oz</small></div><span>NT$ 1,960</span></li>
                  <li><div class="co-thumb co-t3"><em>1</em></div><div><b>設計系統筆記本</b><small>方格・160 頁</small></div><span>NT$ 420</span></li>
                </ul>
              </div>
            </details>
          </div>
          <div class="co-coupon">
            <input class="a-input" placeholder="優惠碼" value="WELCOME10" aria-label="優惠碼">
            <button class="a-btn a-btn--outline" type="button">套用</button>
          </div>
          <div class="a-alert a-alert--success" role="status"><svg class="a-alert__icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg><div class="a-alert__content">已套用 WELCOME10，折抵 NT$ 306。</div></div>
          <div class="a-divider"></div>
          <div class="co-rows">
            <div><span>小計</span><span>NT$ 3,060</span></div>
            <div><span>運費</span><span>NT$ 100</span></div>
            <div class="co-disc"><span>優惠折抵</span><span>− NT$ 306</span></div>
            <div class="a-divider" style="margin:6px 0"></div>
            <div class="co-total"><span>總計</span><span>NT$ 2,854</span></div>
          </div>
          <button class="a-btn a-btn--primary a-btn--block a-btn--lg co-pay">付款 NT$ 2,854</button>
          <p class="co-fine">按下付款即表示同意服務條款與退換貨政策</p>
        </div>
      </article>
    </aside>
  </div>
</div>
<script>
  /* 桌面版預設展開訂單明細；手機版收合，只露出金額 */
  (function(){
    var d = document.getElementById('co-sum'), mq = matchMedia('(min-width: 901px)');
    if (!d) return;
    var sync = function(){ d.open = mq.matches; };
    sync(); mq.addEventListener('change', sync);
  })();
</script>`
});

TEMPLATES.push({
  id:'booking', name:'預約掛號', en:'Booking',
  desc:'診所線上掛號：先選科別，再挑醫師，接著在月曆選日期、選時段，最後填寫就診資料。配合「醫療」主題時，主色換成海藍、按鈕加大到 44px。',
  uses:['segmented','list','avatar','tag','calendar','button','input','select','radio','alert','descriptions'],
  css:`
.bk{max-width:1080px;margin:0 auto;padding:32px 24px 64px}
.bk-head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:24px}
.bk-head h1{margin:0 0 6px;font-size:28px;color:var(--a-ink)}
.bk-head p{margin:0;color:var(--a-ink-2);font-size:15px}
.bk-clinic{display:flex;align-items:center;gap:10px;font-size:14px;color:var(--a-ink-2)}
.bk-step{background:var(--a-surface);border:1px solid var(--a-line);border-radius:var(--a-r-lg,16px);padding:24px;margin-bottom:20px}
.bk-step h2{margin:0 0 16px;font-size:17px;color:var(--a-ink);display:flex;gap:10px;align-items:center}
.bk-step h2 em{font-style:normal;font-size:12px;font-weight:700;color:var(--a-band,var(--a-navy));background:var(--a-surface-2);border-radius:var(--a-r-pill,999px);padding:3px 10px}
.bk-scroll{overflow-x:auto;padding-bottom:4px}
.bk-docs .a-list__extra{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.bk-docs li{cursor:pointer}
.bk-docs li:has(input:checked){background:var(--a-sel-bg,var(--a-surface-2))}
.bk-docs input{position:absolute;opacity:0;pointer-events:none}
.bk-when{display:grid;grid-template-columns:auto minmax(0,1fr);gap:28px;align-items:start}
.bk-slots h3{margin:0 0 10px;font-size:14px;color:var(--a-ink-2);font-weight:600}
.bk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:10px;margin-bottom:18px}
.bk-grid .a-btn{width:100%}
.bk-form{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.bk-form .is-wide{grid-column:1/-1}
.bk-confirm{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:20px;align-items:center}
@media (max-width:820px){.bk-when{grid-template-columns:minmax(0,1fr)}.bk-when .a-calendar{justify-self:center}}
@media (max-width:600px){
  .bk{padding:20px 12px 48px}
  .bk-step{padding:18px 14px}
  .bk-form,.bk-confirm{grid-template-columns:minmax(0,1fr)}
  .bk-docs .a-list__extra{display:none}
}
`,
  html:`
<div class="bk">
  <header class="bk-head">
    <div>
      <h1>線上預約掛號</h1>
      <p>四個步驟完成預約，看診前一天會收到簡訊提醒。</p>
    </div>
    <div class="bk-clinic"><span class="a-avatar a-avatar--square a-avatar--navy">安</span>安心家庭醫學診所・台北市大安區</div>
  </header>

  <section class="bk-step">
    <h2><em>步驟 1</em>選擇科別</h2>
    <div class="bk-scroll">
      <div class="a-segmented" role="radiogroup" aria-label="科別">
        <label><input type="radio" name="bk-dept" checked><span>家醫科</span></label>
        <label><input type="radio" name="bk-dept"><span>小兒科</span></label>
        <label><input type="radio" name="bk-dept"><span>皮膚科</span></label>
        <label><input type="radio" name="bk-dept"><span>耳鼻喉科</span></label>
      </div>
    </div>
  </section>

  <section class="bk-step">
    <h2><em>步驟 2</em>選擇醫師</h2>
    <ul class="a-list a-list--hover bk-docs" role="radiogroup" aria-label="醫師">
      <li><label style="display:contents"><input type="radio" name="bk-doc" checked><span class="a-avatar a-avatar--lg">陳</span><span class="a-list__main"><span class="a-list__title">陳怡君 醫師</span><span class="a-list__desc">家醫科主治・慢性病管理、成人健檢</span></span><span class="a-list__extra"><span class="a-tag a-tag--success a-tag--dot">今日可約</span><span class="a-tag">女醫師</span></span></label></li>
      <li><label style="display:contents"><input type="radio" name="bk-doc"><span class="a-avatar a-avatar--lg a-avatar--navy">黃</span><span class="a-list__main"><span class="a-list__title">黃建志 醫師</span><span class="a-list__desc">家醫科・旅遊醫學、疫苗諮詢</span></span><span class="a-list__extra"><span class="a-tag a-tag--outline">週二、四</span></span></label></li>
      <li><label style="display:contents"><input type="radio" name="bk-doc"><span class="a-avatar a-avatar--lg a-avatar--coral">林</span><span class="a-list__main"><span class="a-list__title">林思妤 醫師</span><span class="a-list__desc">家醫科・戒菸門診、睡眠問題</span></span><span class="a-list__extra"><span class="a-tag a-tag--coral">名額少</span></span></label></li>
    </ul>
  </section>

  <section class="bk-step">
    <h2><em>步驟 3</em>選擇日期與時段</h2>
    <div class="bk-when">
      <div class="a-calendar" data-value="2026-11-24" data-target="bk-date"></div>
      <div class="bk-slots">
        <h3>上午診 09:00–12:00</h3>
        <div class="bk-grid" role="radiogroup" aria-label="上午時段">
          <button class="a-btn a-btn--outline a-btn--sm" type="button" disabled>09:00</button>
          <button class="a-btn a-btn--outline a-btn--sm" type="button">09:30</button>
          <button class="a-btn a-btn--primary a-btn--sm" type="button" aria-pressed="true">10:00</button>
          <button class="a-btn a-btn--outline a-btn--sm" type="button">10:30</button>
          <button class="a-btn a-btn--outline a-btn--sm" type="button" disabled>11:00</button>
          <button class="a-btn a-btn--outline a-btn--sm" type="button">11:30</button>
        </div>
        <h3>晚診 18:00–21:00</h3>
        <div class="bk-grid" role="radiogroup" aria-label="晚上時段">
          <button class="a-btn a-btn--outline a-btn--sm" type="button">18:00</button>
          <button class="a-btn a-btn--outline a-btn--sm" type="button">18:30</button>
          <button class="a-btn a-btn--outline a-btn--sm" type="button" disabled>19:00</button>
          <button class="a-btn a-btn--outline a-btn--sm" type="button">19:30</button>
        </div>
        <label class="a-field"><span class="a-label">已選日期</span><input class="a-input" id="bk-date" readonly value="2026-11-24"></label>
      </div>
    </div>
  </section>

  <section class="bk-step">
    <h2><em>步驟 4</em>就診資料</h2>
    <form class="bk-form" onsubmit="event.preventDefault()">
      <label class="a-field"><span class="a-label">姓名</span><input class="a-input" value="王大明" autocomplete="name"></label>
      <label class="a-field"><span class="a-label">身分證字號</span><input class="a-input" placeholder="A123456789"><span class="a-help">只用於健保身分確認，不會顯示給其他人。</span></label>
      <label class="a-field"><span class="a-label">出生日期</span><input class="a-input" placeholder="例如 1985/03/12"></label>
      <label class="a-field"><span class="a-label">手機</span><input class="a-input" type="tel" placeholder="0912-345-678" autocomplete="tel"></label>
      <div class="a-field is-wide"><span class="a-label">初診或複診</span>
        <div class="a-check-group" role="radiogroup" aria-label="初診或複診">
          <label class="a-check"><input type="radio" name="bk-visit" checked>初診</label>
          <label class="a-check"><input type="radio" name="bk-visit">複診</label>
        </div>
      </div>
      <label class="a-field is-wide"><span class="a-label">想先告訴醫師的症狀（選填）</span><textarea class="a-input a-textarea" rows="3" placeholder="例如：咳嗽一週、夜間比較嚴重"></textarea></label>
    </form>
  </section>

  <section class="bk-step">
    <div class="bk-confirm">
      <dl class="a-desc">
        <div><dt>科別</dt><dd>家醫科</dd></div>
        <div><dt>醫師</dt><dd>陳怡君 醫師</dd></div>
        <div><dt>時間</dt><dd>11/24（二）10:00</dd></div>
        <div><dt>預估看診號</dt><dd>12 號</dd></div>
      </dl>
      <button class="a-btn a-btn--primary a-btn--lg">確認預約</button>
    </div>
    <div class="a-alert" role="status" style="margin-top:16px"><svg class="a-alert__icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg><div class="a-alert__content">請攜帶健保卡，於看診時間前 15 分鐘報到。若需取消，請在前一天 18:00 前操作。</div></div>
  </section>
</div>
<script>
  /* 時段：點一下切換成選中，同一時段群組只會有一個 */
  document.querySelectorAll('.bk-grid .a-btn').forEach(function(b){
    b.addEventListener('click', function(){
      document.querySelectorAll('.bk-grid .a-btn[aria-pressed]').forEach(function(x){ x.removeAttribute('aria-pressed'); x.classList.replace('a-btn--primary', 'a-btn--outline'); });
      b.setAttribute('aria-pressed', 'true'); b.classList.replace('a-btn--outline', 'a-btn--primary');
    });
  });
</script>`
});

TEMPLATES.push({
  id:'article', name:'文章', en:'Article',
  desc:'部落格或專欄文章：麵包屑、作者資訊、封面插畫、內文排版（小標、引言、行內程式碼、鍵盤按鍵、提示框）、標籤、分享與延伸閱讀。配合「編輯」主題時，標題換成襯線字、改為髮絲線。',
  uses:['breadcrumb','avatar','tag','alert','kbd','button','divider','card'],
  css:`
.ar{max-width:760px;margin:0 auto;padding:40px 24px 72px;color:var(--a-ink-body)}
.ar-title{font-size:clamp(28px,5vw,44px);line-height:1.25;color:var(--a-ink);margin:18px 0 14px;font-family:var(--th-serif,inherit)}
.ar-sub{font-size:18px;line-height:1.7;color:var(--a-ink-2);margin:0 0 24px}
.ar-meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:14px;color:var(--a-ink-2)}
.ar-meta b{color:var(--a-ink);display:block}
.ar-meta .ar-dot{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}
.ar-cover{margin:32px 0;border-radius:var(--a-r-lg,16px);overflow:hidden;aspect-ratio:16/8;background:var(--a-surface-2)}
.ar-cover svg{display:block;width:100%;height:100%}
.ar-cover figcaption{font-size:13px;color:var(--a-ink-3);padding:8px 0 0}
.ar-fig{margin:32px 0}
.ar-body{font-size:17px;line-height:1.9}
.ar-body p{margin:0 0 1.2em}
.ar-body h2{font-size:24px;line-height:1.4;color:var(--a-ink);margin:1.8em 0 .6em;font-family:var(--th-serif,inherit)}
.ar-body blockquote{margin:1.6em 0;padding:4px 0 4px 20px;border-left:3px solid var(--a-coral);font-size:20px;line-height:1.7;color:var(--a-ink)}
.ar-body blockquote cite{display:block;font-size:14px;font-style:normal;color:var(--a-ink-2);margin-top:8px}
.ar-body code{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:.88em;background:var(--a-surface-2);border-radius:var(--a-r-xs,4px);padding:2px 6px;color:var(--a-ink)}
.ar-body ul{padding-left:1.3em;margin:0 0 1.2em}
.ar-body li{margin:.3em 0}
.ar-body .a-alert{margin:1.6em 0;font-size:15px;line-height:1.7}
.ar-foot{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin:40px 0 0}
.ar-tags,.ar-share{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.ar-share span{font-size:14px;color:var(--a-ink-2)}
.ar-author{display:flex;gap:16px;align-items:flex-start;margin-top:32px;padding:20px;background:var(--a-surface);border:1px solid var(--a-line);border-radius:var(--a-r-lg,16px)}
.ar-author p{margin:4px 0 0;font-size:14px;line-height:1.7;color:var(--a-ink-2)}
.ar-related{max-width:1080px;margin:0 auto;padding:0 24px 72px}
.ar-related h2{font-size:20px;color:var(--a-ink);margin:0 0 18px}
.ar-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
.ar-cards .a-card{width:auto}
.ar-thumb{aspect-ratio:16/9}
.ar-th1{background:linear-gradient(135deg,var(--a-sky),var(--a-surface-2))}
.ar-th2{background:linear-gradient(135deg,var(--a-coral),var(--a-sky))}
.ar-th3{background:linear-gradient(135deg,var(--a-navy),var(--a-band,var(--a-navy)))}
@media (max-width:820px){.ar-cards{grid-template-columns:minmax(0,1fr)}}
@media (max-width:600px){.ar{padding:24px 16px 56px}.ar-body{font-size:16px}.ar-meta .ar-dot{margin-left:0}.ar-related{padding:0 16px 56px}}
`,
  html:`
<article class="ar">
  <nav class="a-breadcrumb" aria-label="麵包屑">
    <ol>
      <li><a href="#">首頁</a></li>
      <li><a href="#">設計筆記</a></li>
      <li aria-current="page">一套元件，十五種個性</li>
    </ol>
  </nav>
  <h1 class="ar-title">一套元件，十五種個性：我們怎麼讓主題「換得乾淨」</h1>
  <p class="ar-sub">從紙雕分層到新粗野，主題換掉的不只是顏色。這篇整理我們把 59 個元件做成可換主題時，踩過的坑與最後的做法。</p>
  <div class="ar-meta">
    <span class="a-avatar a-avatar--lg a-avatar--coral">林</span>
    <div><b>林雅婷</b>設計系統負責人・2026 年 11 月 20 日・閱讀 8 分鐘</div>
    <div class="ar-dot"><span class="a-tag a-tag--navy">設計系統</span></div>
  </div>

  <figure class="ar-fig">
    <div class="ar-cover" role="img" aria-label="分層紙片組成的山景插畫">
      <svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="800" height="400" fill="var(--a-surface-2)"/>
        <circle cx="610" cy="110" r="54" fill="var(--a-coral)"/>
        <path d="M0 260 C120 180 220 210 320 170 S560 120 800 190 V400 H0Z" fill="var(--a-sky)"/>
        <path d="M0 300 C140 240 260 290 400 250 S620 220 800 270 V400 H0Z" fill="var(--a-band,var(--a-navy))" opacity=".85"/>
        <path d="M0 340 C160 300 300 350 460 320 S680 300 800 330 V400 H0Z" fill="var(--a-navy)"/>
      </svg>
    </div>
    <figcaption>封面：用四層紙片表現遠近，正是預設主題「紙雕分層」的出發點。</figcaption>
  </figure>

  <div class="ar-body">
    <p>一開始我們的主題只有「淺色」和「深色」。後來客戶開始問：能不能給醫療網站一個更沉穩的版本？兒童教育的產品能不能可愛一點？於是我們決定做真正的主題，而不是換一組顏色。</p>

    <h2>主題要換的是「材質」</h2>
    <p>我們先列出每個主題的材質：紙雕是底部的紙邊，新粗野是 3px 黑框加實心位移陰影，網點絲印是半色調圓點。每一種材質都寫成一個 token，例如 <code>--a-frame-shadow</code>，元件只讀 token，不判斷自己在哪個主題裡。</p>

    <blockquote>好的主題系統，是讓元件「不知道」自己被換了主題。<cite>— 團隊內部設計準則第 3 條</cite></blockquote>

    <p>這樣做的好處是，新增第 16 個主題時，只需要寫一組 token，不用回頭改 59 個元件。</p>

    <div class="a-alert a-alert--warning" role="status"><svg class="a-alert__icon" viewBox="0 0 24 24"><path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4M12 17h.01"/></svg><div class="a-alert__content"><b class="a-alert__title">小心圓角</b>直角主題要把所有圓角歸零，但單選圓點必須維持圓形，不然看起來會像核取方塊。</div></div>

    <h2>給開發者的三個習慣</h2>
    <ul>
      <li>用 <code>data-theme-style</code> 包住區塊，就能在同一頁混用不同主題。</li>
      <li>用 <kbd class="a-kbd">⌘</kbd> <kbd class="a-kbd">K</kbd> 開啟指令面板，直接搜尋元件名稱。</li>
      <li>自訂元件時，顏色一律寫 <code>var(--a-*)</code>，深色模式會自動跟上。</li>
    </ul>
    <p>下一篇，我們會分享怎麼用截圖矩陣一次檢查 15 個主題 × 59 個元件，找出那些「只有在某個主題才壞掉」的問題。</p>
  </div>

  <div class="a-divider"></div>
  <div class="ar-foot">
    <div class="ar-tags"><span class="a-tag">主題</span><span class="a-tag">CSS 變數</span><span class="a-tag">無障礙</span></div>
    <div class="ar-share"><span>分享</span><button class="a-btn a-btn--outline a-btn--sm">複製連結</button><button class="a-btn a-btn--outline a-btn--sm">Facebook</button><button class="a-btn a-btn--outline a-btn--sm">LINE</button></div>
  </div>

  <div class="ar-author">
    <span class="a-avatar a-avatar--lg a-avatar--coral">林</span>
    <div><b>林雅婷</b><p>AICDE 設計系統負責人，過去在電商與醫療產品負責介面規範。喜歡紙、喜歡排版，也喜歡把規則寫得夠簡單，讓新同事第一天就能用。</p></div>
  </div>
</article>

<section class="ar-related" aria-label="延伸閱讀">
  <h2>延伸閱讀</h2>
  <div class="ar-cards">
    <a class="a-card a-card--interactive" href="#"><div class="a-card__media ar-thumb ar-th1"></div><div class="a-card__body"><span class="a-card__eyebrow">動畫</span><h3 class="a-card__title">200ms 不是魔術數字</h3><p class="a-card__text">什麼時候該快、什麼時候該慢，用三個問題決定動畫時長。</p></div></a>
    <a class="a-card a-card--interactive" href="#"><div class="a-card__media ar-thumb ar-th2"></div><div class="a-card__body"><span class="a-card__eyebrow">無障礙</span><h3 class="a-card__title">focus 外框別再拿掉了</h3><p class="a-card__text">鍵盤使用者靠它知道自己在哪裡，我們這樣讓它好看又清楚。</p></div></a>
    <a class="a-card a-card--interactive" href="#"><div class="a-card__media ar-thumb ar-th3"></div><div class="a-card__body"><span class="a-card__eyebrow">案例</span><h3 class="a-card__title">診所掛號流程改版</h3><p class="a-card__text">把掛號從 9 步縮成 4 步，長輩完成率提高 31%。</p></div></a>
  </div>
</section>`
});
