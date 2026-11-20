/* ============================================================
   AICDE UI — 互動元件（原生 JS，不依賴任何框架）
   引入：<script src="aicde-ui.js" defer></script>
   用事件委派處理，動態插入的元件也能直接使用；
   標籤頁與分頁需要初始化，新增到頁面後呼叫 AUI.init(容器)。
   ============================================================ */
(() => {
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 對話框 Modal ---------- */
  function openModal(d){
    if(!d || d.open) return;
    d._opener = document.activeElement;
    d.classList.remove('is-closing'); d.showModal(); d.dispatchEvent(new Event('a-open'));
  }
  const MODAL = 'dialog.a-modal, dialog.a-drawer, dialog.a-command';
  const FOCUSABLE = 'a[href],area[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[contenteditable=""],[contenteditable=true]';
  const focusables = root => [...root.querySelectorAll(FOCUSABLE)].filter(el => !el.closest('[hidden],[inert]') && el.getClientRects().length);
  // Tab／Shift+Tab 在開啟的對話框內循環（APG：焦點不能離開 modal）
  document.addEventListener('keydown', e => {
    if(e.key !== 'Tab') return;
    const d = [...document.querySelectorAll(MODAL)].find(x => x.open && x.matches(':modal')); if(!d) return;
    const f = focusables(d); if(!f.length){ e.preventDefault(); return; }
    const first = f[0], last = f[f.length - 1], a = document.activeElement;
    if(e.shiftKey && (a === first || !d.contains(a))){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && (a === last || !d.contains(a))){ e.preventDefault(); first.focus(); }
  });
  // 關閉後焦點回到開啟它的元素（瀏覽器多半會做，這裡保證一定做到）
  document.addEventListener('close', e => {
    const d = e.target; if(!(d.matches && d.matches(MODAL))) return;
    const o = d._opener; d._opener = null;
    if(o && o.isConnected && typeof o.focus === 'function' && (document.activeElement === document.body || d.contains(document.activeElement))) o.focus();
  }, true);
  function closeModal(d){
    if(!d || !d.open || d.classList.contains('is-closing')) return;
    if(reduce()) return d.close();
    d.classList.add('is-closing');
    setTimeout(() => { d.classList.remove('is-closing'); d.close(); }, 160);
  }
  // Esc：攔下原生的立即關閉，改成有退場動畫
  document.addEventListener('cancel', e => {
    if(e.target.matches && e.target.matches('dialog.a-modal, dialog.a-drawer, dialog.a-command')){ e.preventDefault(); closeModal(e.target); }
  }, true);

  /* ---------- 按鈕載入中、欄位錯誤狀態：class 改變時同步 ARIA ---------- */
  function syncBusy(b){
    if(b.classList.contains('is-loading')){ b.setAttribute('aria-busy', 'true'); b.setAttribute('aria-disabled', 'true'); b.dataset.aBusy = ''; }
    else if('aBusy' in b.dataset){ b.removeAttribute('aria-busy'); b.removeAttribute('aria-disabled'); delete b.dataset.aBusy; }
  }
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.a-btn.is-loading, .a-btn[aria-disabled="true"]');
    if(b){ e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);
  let uid = 0;
  const ensureId = (el, p) => el.id || (el.id = p + '-' + (++uid));
  // a-field：說明文字用 aria-describedby 連到輸入框；is-error 時 aria-invalid；非 label 外層時用 aria-labelledby 連到 a-label
  function syncField(f){
    const c = f.querySelector('input:not([type=hidden]),select,textarea'); if(!c) return;
    const help = f.querySelector('.a-help');
    if(help){
      const ids = new Set((c.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
      ids.add(ensureId(help, 'a-help')); c.setAttribute('aria-describedby', [...ids].join(' '));
    }
    if(f.classList.contains('is-error')){ c.setAttribute('aria-invalid', 'true'); c.dataset.aInvalid = ''; }
    else if('aInvalid' in c.dataset || c.getAttribute('aria-invalid') === 'true' && !f.classList.contains('is-error') && f.dataset.aSynced != null){ c.removeAttribute('aria-invalid'); delete c.dataset.aInvalid; }
    const lab = f.querySelector('.a-label');
    if(lab && f.tagName !== 'LABEL' && !(c.labels && c.labels.length) && !c.hasAttribute('aria-label') && !c.hasAttribute('aria-labelledby')) c.setAttribute('aria-labelledby', ensureId(lab, 'a-label'));
    f.dataset.aSynced = '';
  }
  if(window.MutationObserver) new MutationObserver(ms => ms.forEach(m => {
    const el = m.target;
    if(el.classList.contains('a-btn')) syncBusy(el);
    if(el.classList.contains('a-field') || 'aSynced' in el.dataset) syncField(el);
  })).observe(document.documentElement, {subtree: true, attributes: true, attributeFilter: ['class']});

  /* ---------- 下拉選單 Dropdown ---------- */
  function setDropdown(dd, open){
    dd.classList.toggle('is-open', open);
    const t = dd.querySelector('[data-a-dropdown]'); t && t.setAttribute('aria-expanded', open);
  }

  /* ---------- 標籤頁 Tabs ---------- */
  function moveInk(list){
    const ink = list.querySelector('.a-tabs__ink'), cur = list.querySelector('[role=tab][aria-selected=true]');
    if(!ink || !cur) return;
    ink.style.width = cur.offsetWidth + 'px';
    ink.style.transform = 'translateX(' + cur.offsetLeft + 'px)';
  }
  function selectTab(tab){
    const list = tab.closest('[role=tablist]'), root = tab.closest('.a-tabs');
    list.querySelectorAll('[role=tab]').forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      const p = root.querySelector('#' + t.getAttribute('aria-controls')); if(p) p.hidden = !on;
    });
    moveInk(list);
  }

  /* ---------- 分頁 Pagination ---------- */
  const ARROW_L = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
  const ARROW_R = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
  function pages(cur, total){
    if(total <= 7) return Array.from({length: total}, (_, i) => i + 1);
    if(cur <= 4) return [1, 2, 3, 4, 5, '…', total];
    if(cur >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '…', cur - 1, cur, cur + 1, '…', total];
  }
  function renderPagination(nav){
    const total = Math.max(1, +nav.dataset.total || 1), cur = Math.min(total, Math.max(1, +nav.dataset.current || 1));
    nav.innerHTML =
      '<button data-page="' + (cur - 1) + '" aria-label="上一頁"' + (cur === 1 ? ' disabled' : '') + '>' + ARROW_L + '</button>' +
      pages(cur, total).map(p => p === '…'
        ? '<span class="a-pagination__gap">…</span>'
        : '<button data-page="' + p + '"' + (p === cur ? ' aria-current="page"' : '') + '>' + p + '</button>').join('') +
      '<button data-page="' + (cur + 1) + '" aria-label="下一頁"' + (cur === total ? ' disabled' : '') + '>' + ARROW_R + '</button>';
  }

  /* ---------- 通知 Toast ---------- */
  function toaster(){
    let t = document.querySelector('.a-toaster');
    if(!t){ t = document.createElement('div'); t.className = 'a-toaster'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
    return t;
  }
  function toast(message, opts){
    opts = opts || {};
    const el = document.createElement('div');
    el.className = 'a-toast' + (opts.type ? ' a-toast--' + opts.type : '');
    el.innerHTML = '<span class="a-toast__dot"></span><span class="a-toast__msg"></span><button class="a-toast__close" aria-label="關閉">×</button>';
    el.querySelector('.a-toast__msg').textContent = message;
    const box = toaster(); box.appendChild(el);
    while(box.children.length > 4) box.firstElementChild.remove();
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-in')));
    const dismiss = () => { el.classList.add('is-out'); setTimeout(() => el.remove(), reduce() ? 0 : 200); };
    el.querySelector('.a-toast__close').onclick = dismiss;
    let timer = setTimeout(dismiss, opts.duration || 3200);
    el.addEventListener('pointerenter', () => clearTimeout(timer));          // 滑鼠停留時不消失
    el.addEventListener('pointerleave', () => { timer = setTimeout(dismiss, 1500); });
    return dismiss;
  }

  /* ---------- 滑桿 Slider／字數 Textarea ---------- */
  function syncSlider(r){
    const min = +r.min || 0, max = r.max === '' ? 100 : +r.max;
    r.style.setProperty('--v', ((r.value - min) / (max - min) * 100) + '%');
    const row = r.closest('.a-slider-row'), out = row && row.querySelector('.a-slider-value');
    if(out) out.textContent = r.value + (r.dataset.unit || '');
  }
  function syncCount(ta){
    const f = ta.closest('.a-field'), c = f && f.querySelector('.a-field__count');
    if(!c) return;
    c.textContent = ta.value.length + ' / ' + ta.maxLength;
    c.classList.toggle('is-full', ta.value.length >= ta.maxLength);
  }
  document.addEventListener('change', e => { if(e.target.closest && e.target.closest('.a-table__check')){ const tb = e.target.closest('table'); if(e.target.closest('thead')) tb.querySelectorAll('tbody tr:not([hidden]) .a-table__check input').forEach(b => { b.checked = e.target.checked; }); syncSelect(tb); } });
  document.addEventListener('change', e => { if(e.target.matches('.a-number input')){ clampNumber(e.target); syncNumber(e.target.closest('.a-number')); } });
  document.addEventListener('input', e => {
    const t = e.target;
    if(t.matches('.a-slider')) syncSlider(t);
    if(t.matches('textarea[maxlength]')) syncCount(t);
    if(t.matches('[data-a-filter]')) filterTable(t);
    if(t.matches('.a-color input[type=color]')){ const v = t.closest('.a-color').querySelector('.a-color__value'); if(v) v.textContent = t.value.toUpperCase(); }
    if(t.matches('.a-otp input')){
      t.value = t.value.replace(/\D/g, '').slice(-1);
      const ins = [...t.closest('.a-otp').querySelectorAll('input')], k = ins.indexOf(t);
      if(t.value && ins[k + 1]) ins[k + 1].focus();
      otpCheck(t.closest('.a-otp'));
    }
  });

  /* ---------- 彈出卡片 Popover（原生 popover，定位在觸發按鈕下方） ---------- */
  function placePopover(pop){
    const inv = document.querySelector('[popovertarget="' + pop.id + '"]');
    if(!inv) return;
    const r = inv.getBoundingClientRect(), w = pop.offsetWidth || 0;
    let left = r.left;
    if(w && left + w > innerWidth - 16) left = Math.max(16, r.right - w);
    pop.style.left = left + 'px';
    const h = pop.offsetHeight || 0;
    pop.style.top = (h && r.bottom + 8 + h > innerHeight - 16 && r.top - 8 - h > 16 ? r.top - 8 - h : r.bottom + 8) + 'px';
  }
  document.addEventListener('beforetoggle', e => { if(e.newState === 'open' && e.target.matches && e.target.matches('.a-popover')) placePopover(e.target); }, true);
  document.addEventListener('toggle', e => { if(e.newState === 'open' && e.target.matches && e.target.matches('.a-popover')) placePopover(e.target); }, true);
  addEventListener('scroll', () => document.querySelectorAll('.a-popover:popover-open').forEach(placePopover), {passive: true, capture: true});

  /* ---------- 上傳 Upload ---------- */
  function fmtSize(b){ return b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(1) + ' MB'; }
  function listFiles(input){
    const wrap = input.closest('.a-upload-wrap'), list = wrap && wrap.querySelector('.a-upload-list');
    if(!list) return;
    list.innerHTML = '';
    [...input.files].forEach(f => {
      const li = document.createElement('li');
      li.innerHTML = '<span></span><small>' + fmtSize(f.size) + '</small>';
      li.firstChild.textContent = f.name; list.appendChild(li);
    });
  }
  document.addEventListener('change', e => { if(e.target.matches('.a-upload input[type=file]')) listFiles(e.target); });
  ['dragenter', 'dragover'].forEach(ev => document.addEventListener(ev, e => {
    const z = e.target.closest && e.target.closest('.a-upload'); if(!z) return;
    e.preventDefault(); z.classList.add('is-drag');
  }));
  ['dragleave', 'drop'].forEach(ev => document.addEventListener(ev, e => {
    const z = e.target.closest && e.target.closest('.a-upload'); if(!z) return;
    if(ev === 'dragleave' && z.contains(e.relatedTarget)) return;
    z.classList.remove('is-drag');
    if(ev === 'drop'){
      e.preventDefault();
      const input = z.querySelector('input[type=file]');
      if(input && e.dataTransfer.files.length){ input.files = e.dataTransfer.files; listFiles(input); }
    }
  }));

  /* ---------- 數字跳動 Statistic ---------- */
  const countIO = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => {
    if(!en.isIntersecting) return;
    countIO.unobserve(en.target); runCount(en.target);
  }), {threshold: .4}) : null;
  function runCount(el){
    const to = +el.dataset.aCount, dec = +(el.dataset.decimals || 0);
    const fmt = v => v.toLocaleString(undefined, {minimumFractionDigits: dec, maximumFractionDigits: dec});
    if(reduce()){ el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = 900;
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e);
      if(p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- 輪播 Carousel ---------- */
  function initCarousel(c){
    if(c._aInit) return; c._aInit = true;
    const track = c.querySelector('.a-carousel__track'), slides = [...track.children];
    const prev = c.querySelector('.a-carousel__btn--prev'), next = c.querySelector('.a-carousel__btn--next'), dots = c.querySelector('.a-carousel__dots');
    if(dots) dots.innerHTML = slides.map((_, i) => '<button type="button" aria-label="第 ' + (i + 1) + ' 張"></button>').join('');
    const step = () => slides[0].offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0);
    const idx = () => Math.round(track.scrollLeft / step());
    const go = i => track.scrollTo({left: Math.max(0, Math.min(slides.length - 1, i)) * step(), behavior: reduce() ? 'auto' : 'smooth'});
    let raf = 0;
    const update = () => {
      raf = 0; const i = idx(), max = track.scrollWidth - track.clientWidth - 2;
      if(dots) [...dots.children].forEach((d, k) => d.setAttribute('aria-current', k === i));
      if(prev) prev.disabled = track.scrollLeft <= 2;
      if(next) next.disabled = track.scrollLeft >= max;
    };
    track.addEventListener('scroll', () => { if(!raf) raf = requestAnimationFrame(update); }, {passive: true});
    if(prev) prev.onclick = () => go(idx() - 1);
    if(next) next.onclick = () => go(idx() + 1);
    if(dots) dots.onclick = e => { const b = e.target.closest('button'); if(b) go([...dots.children].indexOf(b)); };
    update();
    const ms = +c.dataset.autoplay;
    if(ms && !reduce()){
      let paused = false;
      c.addEventListener('pointerenter', () => paused = true); c.addEventListener('pointerleave', () => paused = false);
      c.addEventListener('focusin', () => paused = true); c.addEventListener('focusout', () => paused = false);
      const timer = setInterval(() => {
        if(!c.isConnected) return clearInterval(timer);
        if(paused || document.hidden) return;
        const i = idx(); go(i >= slides.length - 1 ? 0 : i + 1);
      }, ms);
    }
  }

  /* ---------- 自動完成 Autocomplete ---------- */
  const escH = s => s.replace(/[&<>"]/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[ch]));
  let comboN = 0;
  function initCombo(c){
    if(c._aInit) return; c._aInit = true;
    const input = c.querySelector('input'), list = c.querySelector('.a-combo__list');
    list.id = list.id || 'a-combo-' + (++comboN); list.setAttribute('role', 'listbox');
    input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list'); input.setAttribute('aria-controls', list.id); input.setAttribute('aria-expanded', 'false'); input.autocomplete = 'off';
    const items = [...list.querySelectorAll('li')];
    items.forEach((li, i) => { li.dataset.v = li.textContent.trim(); li.id = list.id + '-' + i; li.setAttribute('role', 'option'); li.setAttribute('aria-selected', 'false'); });
    const empty = document.createElement('li'); empty.className = 'a-combo__empty'; empty.textContent = c.dataset.empty || '沒有符合的結果'; empty.hidden = true; list.appendChild(empty);
    let active = -1;
    const visible = () => items.filter(li => !li.hidden);
    const setActive = i => {
      const v = visible(); active = i;
      items.forEach(li => li.setAttribute('aria-selected', 'false'));
      if(v[i]){ v[i].setAttribute('aria-selected', 'true'); input.setAttribute('aria-activedescendant', v[i].id); v[i].scrollIntoView({block: 'nearest'}); }
      else input.removeAttribute('aria-activedescendant');
    };
    const setOpen = o => { c.classList.toggle('is-open', o); input.setAttribute('aria-expanded', o); if(!o) setActive(-1); };
    const filter = () => {
      const q = input.value.trim().toLowerCase(); let n = 0;
      items.forEach(li => {
        const v = li.dataset.v, k = v.toLowerCase().indexOf(q), show = !q || k >= 0;
        li.hidden = !show;
        if(show){ n++; li.innerHTML = q ? escH(v.slice(0, k)) + '<mark>' + escH(v.slice(k, k + q.length)) + '</mark>' + escH(v.slice(k + q.length)) : escH(v); }
      });
      empty.hidden = n > 0; setActive(-1);
    };
    const pick = li => { input.value = li.dataset.v; setOpen(false); input.dispatchEvent(new CustomEvent('a-select', {detail: li.dataset.v, bubbles: true})); };
    input.addEventListener('input', () => { filter(); setOpen(true); });
    input.addEventListener('focus', () => { filter(); setOpen(true); });
    input.addEventListener('blur', () => setOpen(false));
    input.addEventListener('keydown', e => {
      const v = visible();
      if(e.key === 'ArrowDown'){ e.preventDefault(); setOpen(true); setActive(Math.min(v.length - 1, active + 1)); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); setActive(Math.max(0, active - 1)); }
      else if(e.key === 'Enter' && v[active]){ e.preventDefault(); pick(v[active]); }
      else if(e.key === 'Escape'){ setOpen(false); }
    });
    list.addEventListener('mousedown', e => { const li = e.target.closest('li[role=option]'); if(li){ e.preventDefault(); pick(li); } });
  }

  /* ---------- 日曆 Calendar ---------- */
  const CHEV_L = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
  const CHEV_R = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
  const dkey = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  function rangeCls(cal, k, hover){
    if(cal.dataset.mode !== 'range') return '';
    const s = cal.dataset.start, e = cal.dataset.end || (hover && hover > s ? hover : '');
    if(!s) return '';
    return (k === s ? 'is-start ' : '') + (e && k === e ? 'is-end ' : '') + (e && k > s && k < e ? 'is-in-range ' : '') + (e && e !== s && k === s ? 'has-end' : '');
  }
  function previewRange(cal, hover){
    cal.querySelectorAll('[data-day]').forEach(b => { b.classList.remove('is-start', 'is-end', 'is-in-range', 'has-end'); const c = rangeCls(cal, b.dataset.day, hover).trim(); if(c) b.classList.add(...c.split(/\s+/)); });
  }
  document.addEventListener('mouseover', e => {
    const b = e.target.closest && e.target.closest('.a-calendar--range [data-day]'); if(!b) return;
    const cal = b.closest('.a-calendar'); if(cal.dataset.start && !cal.dataset.end) previewRange(cal, b.dataset.day);
  });
  function renderCal(cal, dir){
    if(!cal._view){ const iv = cal.dataset.value || cal.dataset.start, v = iv ? new Date(iv + 'T00:00') : new Date(); cal._view = new Date(v.getFullYear(), v.getMonth(), 1); }
    const y = cal._view.getFullYear(), m = cal._view.getMonth(), start = new Date(y, m, 1 - new Date(y, m, 1).getDay()), today = dkey(new Date());
    let days = '';
    for(let i = 0; i < 42; i++){
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i), k = dkey(d);
      days += '<button type="button" data-day="' + k + '" aria-label="' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日" aria-selected="' + (cal.dataset.value === k) + '"' +
        ' class="' + (d.getMonth() !== m ? 'is-out ' : '') + (k === today ? 'is-today ' : '') + rangeCls(cal, k) + '">' + d.getDate() + '</button>';
    }
    cal.innerHTML = '<div class="a-calendar__head"><button type="button" data-cal="-1" aria-label="上個月">' + CHEV_L + '</button><b aria-live="polite">' + y + ' 年 ' + (m + 1) + ' 月</b><button type="button" data-cal="1" aria-label="下個月">' + CHEV_R + '</button></div>' +
      '<div class="a-calendar__week" aria-hidden="true"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div>' +
      '<div class="a-calendar__grid' + (dir > 0 ? ' is-next' : dir < 0 ? ' is-prev' : '') + '">' + days + '</div>';
  }

  /* ---------- 數字輸入 Input Number ---------- */
  function syncNumber(wrap){
    const i = wrap.querySelector('input'), v = +i.value, min = i.min === '' ? -Infinity : +i.min, max = i.max === '' ? Infinity : +i.max;
    const [dec, inc] = [wrap.querySelector('[data-a-step="-1"]'), wrap.querySelector('[data-a-step="1"]')];
    if(dec) dec.disabled = v <= min; if(inc) inc.disabled = v >= max;
  }
  function clampNumber(i){
    const min = i.min === '' ? -Infinity : +i.min, max = i.max === '' ? Infinity : +i.max;
    i.value = Math.min(max, Math.max(min, +i.value || 0));
  }

  /* ---------- 驗證碼 OTP ---------- */
  function otpCheck(otp){
    const ins = [...otp.querySelectorAll('input')], code = ins.map(i => i.value).join('');
    otp.classList.remove('is-error', 'is-success');
    if(code.length === ins.length) otp.dispatchEvent(new CustomEvent('a-complete', {detail: code, bubbles: true}));
  }
  function otpError(otp){
    otp.classList.remove('is-error'); void otp.offsetWidth; otp.classList.add('is-error');
    otp.querySelectorAll('input').forEach(i => { i.value = ''; }); otp.querySelector('input').focus();
  }
  document.addEventListener('focusin', e => { if(e.target.matches && e.target.matches('.a-otp input')) e.target.select(); });
  document.addEventListener('paste', e => {
    const t = e.target; if(!(t.matches && t.matches('.a-otp input'))) return;
    const digits = (e.clipboardData.getData('text') || '').replace(/\D/g, ''); if(!digits) return;
    e.preventDefault();
    const otp = t.closest('.a-otp'), ins = [...otp.querySelectorAll('input')];
    ins.forEach((i, k) => { i.value = digits[k] || ''; });
    ins[Math.min(digits.length, ins.length) - 1].focus(); otpCheck(otp);
  });

  /* ---------- 圖片預覽 Lightbox ---------- */
  function openLightbox(btn){
    const thumb = btn.querySelector('img'), d = document.createElement('dialog');
    d.className = 'a-lightbox';
    d.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure><button class="a-lightbox__close" aria-label="關閉">×</button>';
    const big = d.querySelector('img');
    big.src = btn.dataset.src || thumb.currentSrc || thumb.src; big.alt = thumb.alt;
    d.querySelector('figcaption').textContent = thumb.alt;
    document.body.appendChild(d); d.showModal();
    const flip = back => {
      const a = thumb.getBoundingClientRect(), b = big.getBoundingClientRect();
      const from = 'translate(' + (a.left + a.width / 2 - b.left - b.width / 2) + 'px,' + (a.top + a.height / 2 - b.top - b.height / 2) + 'px) scale(' + (a.width / (b.width || 1)) + ')';
      const kf = [{transform: from, opacity: .5}, {transform: 'none', opacity: 1}];
      return big.animate(back ? kf.reverse() : kf, {duration: reduce() ? 1 : back ? 200 : 340, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'both'});
    };
    if(big.complete) flip(false); else big.onload = () => flip(false);
    let closing = false;
    const close = () => {
      if(closing) return; closing = true; d.classList.add('is-closing');
      flip(true).finished.then(() => { d.close(); d.remove(); btn.focus(); });
    };
    d.addEventListener('cancel', e => { e.preventDefault(); close(); });
    d.addEventListener('click', close);
  }

  /* ---------- 回到頂部 ---------- */
  addEventListener('scroll', () => document.querySelectorAll('.a-backtop').forEach(b => b.classList.toggle('is-visible', scrollY > 300)), {passive: true});

  /* ---------- 資料表格 Data Table（排序／篩選／勾選） ---------- */
  function flipRows(tbody, mutate){
    const rows = [...tbody.rows], first = new Map(rows.map(r => [r, r.getBoundingClientRect().top]));
    mutate();
    if(reduce()) return;
    rows.forEach(r => {
      const dy = first.get(r) - r.getBoundingClientRect().top;
      if(dy) r.animate([{transform: 'translateY(' + dy + 'px)'}, {transform: 'none'}], {duration: 280, easing: 'cubic-bezier(0.22,1,0.36,1)'});
    });
  }
  function sortTable(th){
    const table = th.closest('table'), tbody = table.tBodies[0], col = th.cellIndex, num = th.dataset.sort === 'num';
    const dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
    table.querySelectorAll('th[aria-sort]').forEach(h => h.setAttribute('aria-sort', 'none'));
    th.setAttribute('aria-sort', dir);
    const val = r => { const t = r.cells[col] ? (r.cells[col].dataset.value || r.cells[col].textContent.trim()) : ''; return num ? parseFloat(t.replace(/[^\d.-]/g, '')) || 0 : t; };
    const rows = [...tbody.rows].filter(r => !r.classList.contains('a-table__empty'));
    rows.sort((a, b) => { const x = val(a), y = val(b), c = num ? x - y : String(x).localeCompare(String(y), 'zh-Hant'); return dir === 'ascending' ? c : -c; });
    flipRows(tbody, () => rows.forEach(r => tbody.appendChild(r)));
  }
  function filterTable(input){
    const table = document.getElementById(input.dataset.aFilter); if(!table) return;
    const tbody = table.tBodies[0], q = input.value.trim().toLowerCase(); let n = 0;
    [...tbody.rows].forEach(r => { if(r.classList.contains('a-table__empty')) return; const show = !q || r.textContent.toLowerCase().includes(q); r.hidden = !show; if(show) n++; });
    let empty = tbody.querySelector('.a-table__empty');
    if(!empty){ empty = tbody.insertRow(); empty.className = 'a-table__empty'; const c = empty.insertCell(); c.colSpan = table.tHead.rows[0].cells.length; c.textContent = '找不到符合「' + '」的資料'; }
    empty.cells[0].textContent = '找不到符合「' + input.value.trim() + '」的資料';
    empty.hidden = n > 0;
    syncSelect(table);
  }
  function syncSelect(table){
    const boxes = [...table.querySelectorAll('tbody tr:not([hidden]) .a-table__check input')], all = table.querySelector('thead .a-table__check input');
    table.querySelectorAll('tbody tr').forEach(r => { const b = r.querySelector('.a-table__check input'); r.classList.toggle('is-selected', !!(b && b.checked)); if(b) r.setAttribute('aria-selected', String(b.checked)); });
    const on = boxes.filter(b => b.checked).length;
    if(all){ all.checked = on > 0 && on === boxes.length; all.indeterminate = on > 0 && on < boxes.length; }
    document.querySelectorAll('[data-a-selected="' + table.id + '"]').forEach(el => { el.innerHTML = on ? '已選 <b>' + table.querySelectorAll('tbody .a-table__check input:checked').length + '</b> 筆' : el.dataset.emptyText || '共 ' + table.querySelectorAll('tbody tr:not(.a-table__empty)').length + ' 筆'; });
  }

  /* ---------- 級聯選擇 Cascader ---------- */
  function parseCascade(ul){
    return [...ul.children].map(li => {
      const sub = li.querySelector(':scope > ul');
      return {label: (li.firstChild && li.firstChild.nodeType === 3 ? li.firstChild.textContent : li.textContent).trim(), children: sub ? parseCascade(sub) : null};
    });
  }
  function initCascader(c){
    if(c._aInit) return; c._aInit = true;
    const data = parseCascade(c.querySelector('.a-cascader__data'));
    c.insertAdjacentHTML('beforeend', '<button type="button" class="a-input a-select a-cascader__trigger is-empty" aria-haspopup="true" aria-expanded="false"><span>' + escH(c.dataset.placeholder || '請選擇') + '</span></button><div class="a-cascader__panel"></div>');
    const trig = c.querySelector('.a-cascader__trigger'), panel = c.querySelector('.a-cascader__panel');
    let path = [], chosen = [];
    const render = () => {
      let cols = [data], html = '';
      path.forEach((i, d) => { const n = cols[d][i]; if(n && n.children) cols.push(n.children); });
      cols.forEach((list, d) => {
        html += '<ul class="a-cascader__col" role="listbox">' + list.map((n, i) => '<li><button type="button" data-d="' + d + '" data-i="' + i + '" class="' + (n.children ? 'has-children' : '') + '"' +
          (n.children ? ' aria-expanded="' + (path[d] === i) + '"' : ' aria-selected="' + (chosen.join('/') === path.slice(0, d).concat(i).join('/')) + '"') + '>' + escH(n.label) + '</button></li>').join('') + '</ul>';
      });
      const scroll = [...panel.children].map(u => u.scrollTop);
      panel.innerHTML = html;
      [...panel.children].forEach((u, k) => { if(k < scroll.length){ u.scrollTop = scroll[k]; u.style.animation = 'none'; } });
    };
    const setOpen = o => { c.classList.toggle('is-open', o); trig.setAttribute('aria-expanded', o); if(o){ path = chosen.slice(); render(); } };
    trig.addEventListener('click', () => setOpen(!c.classList.contains('is-open')));
    panel.addEventListener('click', e => {
      const b = e.target.closest('button'); if(!b) return;
      e.preventDefault();
      const d = +b.dataset.d, i = +b.dataset.i;
      path = path.slice(0, d).concat(i);
      let node = {children: data}; const labels = [];
      path.forEach(k => { node = node.children[k]; labels.push(node.label); });
      if(node.children){ render(); const nb = panel.children[d + 1]; nb && nb.querySelector('button').focus(); return; }
      chosen = path.slice();
      trig.querySelector('span').textContent = labels.join(' / '); trig.classList.remove('is-empty');
      setOpen(false); trig.focus();
      c.dispatchEvent(new CustomEvent('a-change', {detail: labels, bubbles: true}));
    });
    c.addEventListener('keydown', e => { if(e.key === 'Escape' && c.classList.contains('is-open')){ setOpen(false); trig.focus(); } });
    document.addEventListener('click', e => { if(c.isConnected && e.target.isConnected && !c.contains(e.target)) setOpen(false); });
  }

  /* ---------- 穿梭框 Transfer ---------- */
  function initTransfer(tf){
    if(tf._aInit) return; tf._aInit = true;
    const lists = [...tf.querySelectorAll('.a-transfer__list')];
    lists.forEach(l => {
      const items = [...l.children];
      l.innerHTML = '<div class="a-transfer__head"><label class="a-check"><input type="checkbox" aria-label="全選"></label>' + escH(l.dataset.title || '') + '<small></small></div><div class="a-transfer__body"></div>';
      const body = l.querySelector('.a-transfer__body'); items.forEach(i => body.appendChild(i));
    });
    const btns = tf.querySelectorAll('[data-a-transfer]');
    const sync = () => {
      lists.forEach((l, k) => {
        const boxes = [...l.querySelectorAll('.a-transfer__body input')], on = boxes.filter(b => b.checked).length, all = l.querySelector('.a-transfer__head input');
        all.checked = on > 0 && on === boxes.length; all.indeterminate = on > 0 && on < boxes.length; all.disabled = !boxes.length;
        l.querySelector('.a-transfer__head small').textContent = (on ? on + ' / ' : '') + boxes.length;
        btns.forEach(b => { if(+b.dataset.aTransfer === (k === 0 ? 1 : -1)) b.disabled = !on; });
      });
    };
    tf.addEventListener('change', e => {
      if(e.target.closest('.a-transfer__head')){ const l = e.target.closest('.a-transfer__list'); l.querySelectorAll('.a-transfer__body input').forEach(b => { b.checked = e.target.checked; }); }
      sync();
    });
    btns.forEach(b => b.addEventListener('click', () => {
      const dir = +b.dataset.aTransfer, from = lists[dir > 0 ? 0 : 1], to = lists[dir > 0 ? 1 : 0].querySelector('.a-transfer__body');
      from.querySelectorAll('.a-transfer__body input:checked').forEach(i => {
        const row = i.closest('.a-check'); i.checked = false; row.classList.remove('is-new'); void row.offsetWidth; row.classList.add('is-new'); to.appendChild(row);
      });
      sync();
      tf.dispatchEvent(new CustomEvent('a-change', {detail: [...lists[1].querySelectorAll('.a-transfer__body .a-check')].map(r => r.textContent.trim()), bubbles: true}));
    }));
    sync();
  }

  /* ---------- 標籤輸入 Tag Input ---------- */
  function initTagInput(box){
    if(box._aInit) return; box._aInit = true;
    const input = box.querySelector('input'), max = +box.dataset.max || Infinity;
    const values = () => [...box.querySelectorAll('.a-tag')].map(t => t.dataset.v);
    const emit = () => box.dispatchEvent(new CustomEvent('a-change', {detail: values(), bubbles: true}));
    box.querySelectorAll('.a-tag').forEach(t => { t.dataset.v = t.dataset.v || t.firstChild.textContent.trim(); });
    const add = raw => {
      const v = raw.trim(); if(!v) return;
      const dup = [...box.querySelectorAll('.a-tag')].find(t => t.dataset.v === v);
      if(dup){ dup.classList.remove('is-dup'); void dup.offsetWidth; dup.classList.add('is-dup'); return; }
      if(values().length >= max) return;
      const t = document.createElement('span'); t.className = 'a-tag is-new'; t.dataset.v = v;
      t.innerHTML = '<span></span><button type="button" class="a-tag__close">×</button>';
      t.firstChild.textContent = v; t.lastChild.setAttribute('aria-label', '移除' + v);
      box.insertBefore(t, input); emit();
    };
    box.addEventListener('click', e => { if(!e.target.closest('.a-tag__close')) input.focus(); else setTimeout(emit, 200); });
    input.addEventListener('keydown', e => {
      if((e.key === 'Enter' || e.key === ',' || e.key === '，') && !e.isComposing){ e.preventDefault(); add(input.value); input.value = ''; }
      else if(e.key === 'Backspace' && !input.value){ const last = input.previousElementSibling; if(last && last.classList.contains('a-tag')){ last.remove(); emit(); } }
    });
    input.addEventListener('paste', e => {
      const txt = e.clipboardData.getData('text'); if(!/[,，\n]/.test(txt)) return;
      e.preventDefault(); txt.split(/[,，\n]/).forEach(add);
    });
    input.addEventListener('blur', () => { if(input.value.trim()){ add(input.value); input.value = ''; } });
  }

  /* ---------- 指令面板 Command Palette ---------- */
  function initCommand(d){
    if(d._aInit) return; d._aInit = true;
    const input = d.querySelector('.a-command__search input'), list = d.querySelector('.a-command__list');
    const items = [...list.querySelectorAll('.a-command__item')];
    let empty = list.querySelector('.a-command__empty');
    if(!empty){ empty = document.createElement('div'); empty.className = 'a-command__empty'; empty.textContent = '沒有符合的指令'; empty.hidden = true; list.appendChild(empty); }
    let active = 0;
    const vis = () => items.filter(i => !i.hidden);
    const setActive = k => { const v = vis(); active = Math.max(0, Math.min(v.length - 1, k)); items.forEach(i => i.setAttribute('aria-selected', 'false')); if(v[active]){ v[active].setAttribute('aria-selected', 'true'); v[active].scrollIntoView({block: 'nearest'}); } };
    const filter = () => {
      const q = input.value.trim().toLowerCase();
      items.forEach(i => { i.hidden = q && !(i.textContent + ' ' + (i.dataset.k || '')).toLowerCase().includes(q); });
      list.querySelectorAll('.a-command__group').forEach(g => {
        let n = g.nextElementSibling, any = false;
        while(n && !n.classList.contains('a-command__group')){ if(n.classList.contains('a-command__item') && !n.hidden) any = true; n = n.nextElementSibling; }
        g.hidden = !any;
      });
      empty.hidden = vis().length > 0; setActive(0);
    };
    input.addEventListener('input', filter);
    input.addEventListener('keydown', e => {
      if(e.key === 'ArrowDown'){ e.preventDefault(); setActive(active + 1); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); setActive(active - 1); }
      else if(e.key === 'Enter'){ const v = vis()[active]; if(v){ e.preventDefault(); v.click(); } }
    });
    list.addEventListener('mousemove', e => { const it = e.target.closest('.a-command__item'); if(it) setActive(vis().indexOf(it)); });
    list.addEventListener('click', e => { if(e.target.closest('.a-command__item')) closeModal(d); });
    d.addEventListener('a-open', () => { input.value = ''; filter(); setTimeout(() => input.focus(), 0); });
  }
  document.addEventListener('keydown', e => {
    if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){
      const d = document.querySelector('dialog.a-command[data-hotkey]');
      if(d){ e.preventDefault(); d.open ? closeModal(d) : openModal(d); }
    }
  });

  /* ---------- 右鍵選單 Context Menu ---------- */
  function closeContext(){ document.querySelectorAll('.a-context.is-open').forEach(m => m.classList.remove('is-open')); }
  document.addEventListener('contextmenu', e => {
    const area = e.target.closest && e.target.closest('[data-a-context]'); if(!area) return closeContext();
    const m = document.getElementById(area.dataset.aContext); if(!m) return;
    e.preventDefault(); closeContext();
    m.style.left = '0px'; m.style.top = '0px'; m.classList.add('is-open');
    const w = m.offsetWidth, h = m.offsetHeight;
    const x = e.clientX + w > innerWidth - 8 ? e.clientX - w : e.clientX, y = e.clientY + h > innerHeight - 8 ? e.clientY - h : e.clientY;
    m.style.transformOrigin = (x < e.clientX ? 'right' : 'left') + ' ' + (y < e.clientY ? 'bottom' : 'top');
    m.style.left = Math.max(8, x) + 'px'; m.style.top = Math.max(8, y) + 'px';
    m.classList.remove('is-open'); void m.offsetWidth; m.classList.add('is-open');
    const first = m.querySelector('[role=menuitem]'); first && first.focus({preventScroll: true});
  });
  addEventListener('scroll', closeContext, {passive: true, capture: true});
  addEventListener('blur', closeContext);

  /* ---------- 通知提醒框 Notification ---------- */
  const NICON = {
    info: '<svg viewBox="0 0 24 24"><path d="M12 11v6M12 7h.01"/></svg>',
    success: '<svg viewBox="0 0 24 24"><path d="M6 12.5l4 4L18 8"/></svg>',
    error: '<svg viewBox="0 0 24 24"><path d="M12 7v6M12 17h.01"/></svg>'
  };
  function notify(o){
    o = o || {};
    let box = document.querySelector('.a-notifier');
    if(!box){ box = document.createElement('div'); box.className = 'a-notifier'; box.setAttribute('role', 'region'); box.setAttribute('aria-label', '通知'); box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    const el = document.createElement('div'), type = o.type || 'info';
    el.className = 'a-notice a-notice--' + type;
    el.innerHTML = '<span class="a-notice__icon">' + (NICON[type] || NICON.info) + '</span><div class="a-notice__main"><b class="a-notice__title"></b><div class="a-notice__text"></div></div><button class="a-notice__close" aria-label="關閉">×</button>';
    el.querySelector('.a-notice__title').textContent = o.title || '';
    el.querySelector('.a-notice__text').textContent = o.text || '';
    if(o.actions && o.actions.length){
      const row = document.createElement('div'); row.className = 'a-notice__actions';
      o.actions.forEach((a, k) => { const b = document.createElement('button'); b.className = 'a-btn a-btn--sm ' + (k === 0 ? 'a-btn--primary' : 'a-btn--ghost'); b.textContent = a.label; b.onclick = () => { a.onClick && a.onClick(); dismiss(); }; row.appendChild(b); });
      el.querySelector('.a-notice__main').appendChild(row);
    }
    box.prepend(el);
    while(box.children.length > 3) box.lastElementChild.remove();
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-in')));
    let timer;
    const dismiss = () => { clearTimeout(timer); el.classList.add('is-out'); setTimeout(() => el.remove(), reduce() ? 0 : 200); };
    el.querySelector('.a-notice__close').onclick = dismiss;
    const dur = o.duration === 0 ? 0 : (o.duration || 4500);
    if(dur){ timer = setTimeout(dismiss, dur); el.addEventListener('pointerenter', () => clearTimeout(timer)); el.addEventListener('pointerleave', () => { timer = setTimeout(dismiss, 2000); }); }
    return dismiss;
  }

  /* ---------- 步驟條 Steps ---------- */
  function stepTo(steps, delta){
    const li = [...steps.children], cur = Math.max(0, li.findIndex(x => x.classList.contains('is-current')));
    const n = Math.min(li.length, Math.max(0, cur + delta));
    li.forEach((x, i) => { x.classList.toggle('is-done', i < n); x.classList.toggle('is-current', i === n); x.toggleAttribute('aria-current', i === n); });
  }

  /* ---------- 事件委派 ---------- */
  document.addEventListener('click', e => {
    const t = e.target;
    const opener = t.closest('[data-a-open]');
    if(opener){ openModal(document.getElementById(opener.dataset.aOpen)); return; }
    const closer = t.closest('[data-a-close]');
    if(closer){ closeModal(closer.closest('dialog')); return; }
    if(t.matches(MODAL)){ closeModal(t); return; }                // 點背景關閉

    const calNav = t.closest('.a-calendar [data-cal]');
    if(calNav){ const cal = calNav.closest('.a-calendar'), dir = +calNav.dataset.cal; cal._view = new Date(cal._view.getFullYear(), cal._view.getMonth() + dir, 1); renderCal(cal, dir); return; }
    const day = t.closest('.a-calendar [data-day]');
    if(day){
      const cal = day.closest('.a-calendar'), k = day.dataset.day, d = new Date(k + 'T00:00');
      if(cal.dataset.mode === 'range'){
        if(!cal.dataset.start || cal.dataset.end || k < cal.dataset.start){ cal.dataset.start = k; cal.dataset.end = ''; }
        else cal.dataset.end = k;
      } else cal.dataset.value = k;
      const dir = day.classList.contains('is-out') ? (d < cal._view ? -1 : 1) : 0;
      if(dir) cal._view = new Date(d.getFullYear(), d.getMonth(), 1);
      renderCal(cal, dir);
      const sel = cal.querySelector('[data-day="' + k + '"]'); sel && sel.focus();
      if(cal.dataset.mode === 'range'){
        const s = document.getElementById(cal.dataset.targetStart), en = document.getElementById(cal.dataset.targetEnd);
        if(s) s.value = cal.dataset.start || ''; if(en) en.value = cal.dataset.end || '';
        cal.dispatchEvent(new CustomEvent('a-change', {detail: {start: cal.dataset.start, end: cal.dataset.end || null}, bubbles: true}));
        return;
      }
      if(cal.dataset.target){ const tg = document.getElementById(cal.dataset.target); if(tg) tg.value = k; }
      cal.dispatchEvent(new CustomEvent('a-change', {detail: k, bubbles: true}));
      return;
    }

    const numBtn = t.closest('.a-number [data-a-step]');
    if(numBtn){
      const wrap = numBtn.closest('.a-number'), i = wrap.querySelector('input');
      i.value = (+i.value || 0) + (+numBtn.dataset.aStep) * (+i.step || 1); clampNumber(i); syncNumber(wrap);
      i.dispatchEvent(new Event('change', {bubbles: true}));
    }

    const img = t.closest('[data-a-image]');
    if(img){ openLightbox(img); return; }

    if(t.closest('[data-a-backtop]')) scrollTo({top: 0, behavior: reduce() ? 'auto' : 'smooth'});

    const bannerX = t.closest('.a-banner__close');
    if(bannerX){ const bn = bannerX.closest('.a-banner'); bn.classList.add('is-closing'); setTimeout(() => bn.remove(), reduce() ? 0 : 200); }

    const sortBtn = t.closest('.a-th-sort');
    if(sortBtn){ sortTable(sortBtn.closest('th')); return; }
    const ntf = t.closest('[data-a-notify]');
    if(ntf){ const [title, text] = ntf.dataset.aNotify.split('|'); notify({title, text, type: ntf.dataset.aNotifyType}); }
    if(!t.closest('.a-context') || t.closest('[role=menuitem]')) closeContext();

    const tagX = t.closest('.a-tag__close');
    if(tagX){ const tag = tagX.closest('.a-tag'); tag.classList.add('is-removing'); setTimeout(() => tag.remove(), reduce() ? 0 : 160); }

    const stepBtn = t.closest('[data-a-steps]');
    if(stepBtn){ const st = document.getElementById(stepBtn.dataset.aSteps); if(st) stepTo(st, +(stepBtn.dataset.dir || 1)); }

    const tst = t.closest('[data-a-toast]');
    if(tst) toast(tst.dataset.aToast, {type: tst.dataset.aToastType});

    const tab = t.closest('.a-tabs [role=tab]');
    if(tab) selectTab(tab);

    const pg = t.closest('.a-pagination button[data-page]');
    if(pg && !pg.disabled){
      const nav = pg.closest('.a-pagination'); nav.dataset.current = pg.dataset.page; renderPagination(nav);
      nav.dispatchEvent(new CustomEvent('a-page', {detail: +pg.dataset.page, bubbles: true}));
      const cur = nav.querySelector('[aria-current=page]'); cur && cur.focus();
    }

    document.querySelectorAll('.a-dropdown.is-open').forEach(dd => { if(!dd.contains(t)) setDropdown(dd, false); });
    const trig = t.closest('[data-a-dropdown]');
    if(trig){ const dd = trig.closest('.a-dropdown'); setDropdown(dd, !dd.classList.contains('is-open')); }
    const item = t.closest('.a-dropdown__menu [role=menuitem]');
    if(item) setDropdown(item.closest('.a-dropdown'), false);
  });

  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){ document.querySelectorAll('.a-dropdown.is-open').forEach(dd => setDropdown(dd, false)); closeContext(); }
    const cm = e.target.closest && e.target.closest('.a-context.is-open');
    if(cm && (e.key === 'ArrowDown' || e.key === 'ArrowUp')){
      e.preventDefault(); const its = [...cm.querySelectorAll('[role=menuitem]')], k = its.indexOf(document.activeElement);
      its[(k + (e.key === 'ArrowDown' ? 1 : -1) + its.length) % its.length].focus();
    }
    const oi = e.target.matches && e.target.matches('.a-otp input') ? e.target : null;
    if(oi){
      const ins = [...oi.closest('.a-otp').querySelectorAll('input')], k = ins.indexOf(oi);
      if(e.key === 'Backspace' && !oi.value && ins[k - 1]){ e.preventDefault(); ins[k - 1].value = ''; ins[k - 1].focus(); }
      if(e.key === 'ArrowLeft' && ins[k - 1]){ e.preventDefault(); ins[k - 1].focus(); }
      if(e.key === 'ArrowRight' && ins[k + 1]){ e.preventDefault(); ins[k + 1].focus(); }
    }
    const tab = e.target.closest && e.target.closest('.a-tabs [role=tab]');
    if(tab && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')){
      const tabs = [...tab.closest('[role=tablist]').querySelectorAll('[role=tab]')];
      const next = tabs[(tabs.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      selectTab(next); next.focus(); e.preventDefault();
    }
  });

  function init(root){
    root = root || document;
    root.querySelectorAll('.a-btn').forEach(syncBusy);
    root.querySelectorAll('.a-field').forEach(syncField);
    root.querySelectorAll('.a-th-sort:not([type])').forEach(b => { b.type = 'button'; });
    root.querySelectorAll('[data-a-selected]').forEach(el => { if(!el.hasAttribute('aria-live')) el.setAttribute('aria-live', 'polite'); });
    root.querySelectorAll('.a-pagination[data-total]').forEach(renderPagination);
    root.querySelectorAll('.a-slider').forEach(syncSlider);
    root.querySelectorAll('textarea[maxlength]').forEach(syncCount);
    root.querySelectorAll('.a-carousel').forEach(initCarousel);
    root.querySelectorAll('.a-cascader').forEach(initCascader);
    root.querySelectorAll('.a-transfer').forEach(initTransfer);
    root.querySelectorAll('.a-taginput').forEach(initTagInput);
    root.querySelectorAll('dialog.a-command').forEach(initCommand);
    root.querySelectorAll('table[id]').forEach(tb => { if(tb.querySelector('.a-table__check') || document.querySelector('[data-a-selected="' + tb.id + '"]')) syncSelect(tb); });
    root.querySelectorAll('.a-combo').forEach(initCombo);
    root.querySelectorAll('.a-calendar').forEach(c => { c._view = null; renderCal(c, 0); });
    root.querySelectorAll('.a-number').forEach(syncNumber);
    root.querySelectorAll('.a-color').forEach(c => { const i = c.querySelector('input'), v = c.querySelector('.a-color__value'); if(i && v) v.textContent = i.value.toUpperCase(); });
    root.querySelectorAll('[data-a-count]').forEach(el => { if(el.closest('[inert]')){ el.textContent = (+el.dataset.aCount).toLocaleString(); return; } countIO ? countIO.observe(el) : runCount(el); });
    root.querySelectorAll('input[data-indeterminate]').forEach(i => { i.indeterminate = true; });
    root.querySelectorAll('.a-tabs [role=tablist]').forEach(list => {
      if(!list.querySelector('.a-tabs__ink')) list.insertAdjacentHTML('beforeend', '<span class="a-tabs__ink" aria-hidden="true"></span>');
      const ink = list.querySelector('.a-tabs__ink'); ink.style.transition = 'none';
      list.querySelectorAll('[role=tab]').forEach(t => { t.tabIndex = t.getAttribute('aria-selected') === 'true' ? 0 : -1; });
      moveInk(list); ink.offsetWidth; ink.style.transition = '';
    });
  }
  addEventListener('resize', () => document.querySelectorAll('.a-tabs [role=tablist]').forEach(moveInk));
  if(document.fonts) document.fonts.ready.then(() => document.querySelectorAll('.a-tabs [role=tablist]').forEach(moveInk));
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init());
  else init();

  window.AUI = { init, toast, notify, openModal, closeModal, otpError, syncField };
})();
