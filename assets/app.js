(() => {
  const $ = s => document.querySelector(s);
  const slug = id => id.replace(/[^a-z0-9-]/gi, '-');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const CODE_RE = /(cubic-bezier\([^)]*\)|scale\([^)]*\)|translateY\([^)]*\)|:active|transform-origin|prefers-reduced-motion|ease-in|ease-out|transition|keyframes|transform|opacity|toast(?:\.\w+)?\(\)|className|NumberFlow|cmdk|dnd kit|input-otp|DESIGN\.md)/g;
  const typeOf = s => DEMO_TYPE[s.id] || s.title;
  const view = $('#view'), nav = $('#nav');

  /* ============ Sidebar ============ */
  function buildNav(){
    let h = `<a class="nav-top" href="#/" data-route="/">總覽</a>`;
    h += `<div class="nav-sec">主題<em>${THEMES.length}</em></div><div class="ng"><ul><li data-search="主題總覽 themes"><a href="#/s" data-route="/s">主題總覽<span class="en">All themes</span></a></li>${THEMES.map(t =>
      `<li data-search="${esc((t.name + ' ' + t.en + ' ' + t.tagline + ' ' + t.fit.join(' ')).toLowerCase())}"><a href="#/s/${t.id}" data-route="/s/${t.id}">${t.name}<span class="en">${t.en}</span></a></li>`).join('')}</ul></div>`;
    h += `<div class="nav-sec">元件<em>${COMPONENTS.length}</em></div>`;
    COMP_GROUPS.forEach(g => {
      const items = COMPONENTS.filter(c => c.group === g.id);
      h += `<div class="ng"><div class="ng-h"><span>${g.name}</span></div><ul>${items.map(c =>
        `<li data-search="${esc((c.name + ' ' + c.en + ' ' + c.desc).toLowerCase())}"><a href="#/c/${c.id}" data-route="/c/${c.id}">${c.name}<span class="en">${c.en}</span></a></li>`).join('')}</ul></div>`;
    });
    h += `<div class="nav-sec">動畫<em>${MOTIONS.length}</em></div>`;
    GROUPS.forEach(g => {
      const items = MOTIONS.filter(s => s.group === g.id);
      h += `<div class="ng"><div class="ng-h"><span>${g.name}</span><em>${items.length}</em></div><ul>${items.map(s =>
        `<li data-search="${esc((typeOf(s) + ' ' + s.id + ' ' + s.title + ' ' + s.desc).toLowerCase())}"><a href="#/a/${slug(s.id)}" data-route="/a/${slug(s.id)}" title="${esc(s.title)}">${esc(typeOf(s))}${SNIPPETS[s.id] ? '<i class="has-code">CODE</i>' : ''}</a></li>`).join('')}</ul></div>`;
    });
    nav.innerHTML = h;
  }
  buildNav();
  $('#sideCount').textContent = `${THEMES.length} 主題 · ${COMPONENTS.length} 元件 · ${MOTIONS.length} 動畫`;

  /* ============ 共用 ============ */
  const revealIO = new IntersectionObserver(es => es.forEach(e => {
    if(!e.isIntersecting) return;
    const sibs = [...e.target.parentElement.children].filter(c => !c.hidden);
    e.target.style.transitionDelay = (reduce ? 0 : (sibs.indexOf(e.target) % 3) * 90) + 'ms';
    e.target.classList.add('shown'); revealIO.unobserve(e.target);
    setTimeout(() => e.target.style.transitionDelay = '', 800);
  }), {threshold:.12});

  const timers = new Set();
  function setupAuto(stage, [fn, every]){
    let visible = false, lastUser = 0, timer = null;
    stage.insertAdjacentHTML('beforeend', '<div class="live">AUTO</div>');
    stage.addEventListener('pointerdown', () => { lastUser = Date.now(); stage.classList.add('paused'); }, true);
    const idle = () => Date.now() - lastUser >= 5000;
    new IntersectionObserver(es => es.forEach(e => {
      visible = e.isIntersecting;
      if(visible && !timer){
        timer = setInterval(() => { if(!stage.isConnected){ clearInterval(timer); timers.delete(timer); return; } if(!visible || document.hidden || !idle()) return; stage.classList.remove('paused'); fn(); }, every);
        timers.add(timer);
        setTimeout(() => { if(visible && idle()) fn(); }, 500);
      }
      if(!visible && timer){ clearInterval(timer); timers.delete(timer); timer = null; }
    }), {threshold:.5}).observe(stage);
  }
  function mountDemo(stage, s, withHint = true){
    const auto = DEMOS[s.demo](stage, s);
    if(withHint) stage.insertAdjacentHTML('beforeend', `<div class="stage-hint">${esc(s.hint)}</div>`);
    if(auto && !reduce) setupAuto(stage, auto);
  }
  async function copy(text, btn){
    try{ await navigator.clipboard.writeText(text); }
    catch(e){ const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
    const old = btn.textContent; btn.textContent = '已複製 ✓'; btn.classList.add('ok');
    setTimeout(() => { btn.textContent = old; btn.classList.remove('ok'); }, 1400);
  }
  const fullFile = sn => `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
html, body { margin: 0; min-height: 100%; }
body { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #e6edf0; font-family: system-ui, "Noto Sans TC", sans-serif; }
${sn.css}
</style>
</head>
<body>
${sn.html}
<script>
${sn.js}
<\/script>
</body>
</html>`;

  /* 程式碼區：分頁 + 複製 */
  /* 總覽縮圖：內容太大時等比縮小，完整放進卡片 */
  function fitThumb(st){
    const f = st && st.firstElementChild; if(!f) return;
    const aw = st.clientWidth - 40, ah = st.clientHeight - 40; if(aw <= 0) return;
    let best = null;
    for(const W of [aw, 360, 440, 560]){
      if(W < aw) continue;
      f.style.width = W + 'px';
      const s = Math.min(1, aw / Math.max(W, f.scrollWidth), ah / f.scrollHeight);
      if(!best || s > best.s + 0.02) best = {W, s};
      if(s >= 1) break;
    }
    f.style.width = best.W + 'px'; f.style.setProperty('--s', best.s.toFixed(3));
  }
  function fitThumbs(){ view.querySelectorAll('.comp-stage').forEach(fitThumb); }
  let fitT; addEventListener('resize', () => { clearTimeout(fitT); fitT = setTimeout(fitThumbs, 120); });

  function codeBlock(id, tabs){
    return `<div class="code" id="${id}" hidden>
      <div class="code-bar"><div class="code-tabs">${tabs.map((t, i) => `<button class="${i ? '' : 'on'}" data-i="${i}">${t[0]}</button>`).join('')}</div><button class="code-copy">複製</button></div>
      ${tabs.map((t, i) => `<pre ${i ? 'hidden' : ''}><code>${esc(t[1])}</code></pre>`).join('')}</div>`;
  }
  function wireCode(root){
    root.querySelectorAll('.code').forEach(c => {
      const tabs = [...c.querySelectorAll('.code-tabs button')], pres = [...c.querySelectorAll('pre')];
      tabs.forEach((b, i) => b.onclick = () => { tabs.forEach(x => x.classList.toggle('on', x === b)); pres.forEach((p, j) => p.hidden = j !== i); });
      c.querySelector('.code-copy').onclick = e => copy(pres.find(p => !p.hidden).textContent, e.currentTarget);
    });
    root.querySelectorAll('[data-toggle-code]').forEach(b => b.onclick = () => {
      const c = document.getElementById(b.dataset.toggleCode); c.hidden = !c.hidden;
      b.classList.toggle('on', !c.hidden); b.setAttribute('aria-expanded', !c.hidden);
      b.textContent = c.hidden ? '‹/› 顯示程式碼' : '‹/› 隱藏程式碼';
    });
  }

  /* 右側頁內目錄 */
  let tocIO;
  function buildToc(){
    const toc = $('#toc'); tocIO && tocIO.disconnect();
    if(!toc) return;
    const hs = [...view.querySelectorAll('.doc h2[id], .doc .demo-box[id]')];
    if(!hs.length){ toc.innerHTML = ''; return; }
    toc.innerHTML = `<div class="toc-h">本頁內容</div>` + hs.map(h => `<a data-target="${h.id}" class="${h.matches('.demo-box') ? 'sub' : ''}">${esc(h.dataset.toc || h.textContent)}</a>`).join('');
    toc.querySelectorAll('a').forEach(a => a.onclick = () => document.getElementById(a.dataset.target).scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'start'}));
    tocIO = new IntersectionObserver(es => es.forEach(e => {
      if(!e.isIntersecting) return;
      toc.querySelectorAll('a').forEach(a => a.classList.toggle('on', a.dataset.target === e.target.id));
    }), {rootMargin:'-20% 0px -70% 0px'});
    hs.forEach(h => tocIO.observe(h));
  }

  /* ============ 頁面：總覽 ============ */
  function pageHome(){
    view.innerHTML = `
      <header class="hero">
        <div class="eyebrow">AICDE Design Library</div>
        <h1>元件、動畫與視覺<br>的 <span>設計</span> 參考庫</h1>
        <p>AICDE 風格的原生 HTML/CSS 元件庫，加上做網頁常用的動畫與設計方法。每個項目都有可操作的範例，整理好的頁面附上可以直接複製的程式碼。</p>
        <div class="stats"><div><b>${COMPONENTS.length}</b>元件</div><div><b>${MOTIONS.length}</b>動畫</div><div><b>${Object.keys(SNIPPETS).length}</b>附程式碼</div><div><b>0</b>建置工具</div></div>
      </header>
      <section class="group" data-group="components"><div class="group-h"><div><h2>元件</h2><p>引入一份 CSS，複製 HTML 就能用。</p></div><span class="num">${String(COMPONENTS.length).padStart(2,'0')} COMPONENTS</span></div>
        <div class="grid">${COMPONENTS.map(c => `<a class="card comp-card" href="#/c/${c.id}" data-search="${esc((c.name + ' ' + c.en + ' ' + c.desc).toLowerCase())}"><div class="stage comp-stage"><div class="comp-fit">${c.demos[0].html.replace(/<a\b/g, '<span').replace(/<\/a>/g, '</span>')}</div></div><div class="meta"><h3>${c.name} <span class="en">${c.en}</span></h3><p>${esc(c.desc)}</p></div></a>`).join('')}</div></section>
      ${GROUPS.map(g => {
        const items = MOTIONS.filter(s => s.group === g.id);
        return `<section class="group" data-group="${g.id}"><div class="group-h"><div><h2>${g.name}</h2><p>${g.desc}</p></div><span class="num">${String(items.length).padStart(2,'0')} MOTIONS</span></div><div class="grid">${items.map(s => `
          <article class="card" data-id="${s.id}" data-search="${esc((typeOf(s) + ' ' + s.id + ' ' + s.title + ' ' + s.desc + ' ' + s.tags.join(' ')).toLowerCase())}">
            <div class="stage"></div>
            <div class="meta"><h3><a href="#/a/${slug(s.id)}">${esc(typeOf(s))}</a></h3><p>${esc(s.desc)}</p><div class="motion-of">${esc(s.title)}</div>
              <div class="meta-foot"><div class="tags">${s.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div><a class="more" href="#/a/${slug(s.id)}">${SNIPPETS[s.id] ? '程式碼 →' : '查看 →'}</a></div></div>
          </article>`).join('')}</div></section>`;
      }).join('')}
      <div class="empty" id="empty">找不到符合的項目，換個關鍵字試試。</div>`;
    view.querySelectorAll('.card[data-id]').forEach(el => mountDemo(el.querySelector('.stage'), MOTIONS.find(s => s.id === el.dataset.id)));
    view.querySelectorAll('.comp-stage').forEach(st => { st.inert = true; st.querySelectorAll('dialog').forEach(d => d.remove()); });
    fitThumbs();
    view.querySelectorAll('.comp-stage img').forEach(im => im.complete || im.addEventListener('load', () => fitThumb(im.closest('.comp-stage')), {once: true}));
    document.fonts && document.fonts.ready.then(fitThumbs);
    window.AUI && AUI.init(view);
    view.querySelectorAll('.card').forEach(c => revealIO.observe(c));
    applySearch();
  }

  /* ============ 頁面：動畫 ============ */
  function pageMotion(id){
    const s = MOTIONS.find(x => slug(x.id) === id); if(!s) return notFound();
    const g = GROUPS.find(x => x.id === s.group), sn = SNIPPETS[s.id];
    const i = MOTIONS.indexOf(s), prev = MOTIONS[i - 1], next = MOTIONS[i + 1];
    view.innerHTML = `<div class="doc-wrap"><article class="doc">
      <div class="crumb"><a href="#/">總覽</a> / 動畫 / ${g.name}</div>
      <h1>${esc(typeOf(s))}</h1>
      <p class="lead">${esc(s.desc)}</p>
      <div class="doc-meta"><span><b>${esc(s.title)}</b></span><span>${s.tags.map(esc).join(' · ')}</span></div>

      <h2 id="demo">範例</h2>
      <div class="demo-box">
        <div class="demo-preview">${sn ? `<iframe title="${esc(typeOf(s))} 範例" style="height:${sn.height}px"></iframe>` : '<div class="stage big"></div>'}</div>
        <div class="demo-info"><b>${esc(s.hint)}</b>${sn ? '<p>預覽區執行的就是下方的程式碼，複製後貼進一個 .html 檔就能用。</p>' : '<p>這個動畫的獨立程式碼還在整理中。</p>'}</div>
        ${sn ? `<div class="demo-actions"><button class="act" data-toggle-code="code-main" aria-expanded="false">‹/› 顯示程式碼</button><button class="act" data-copy-full>複製完整檔案</button><button class="act" data-replay>↻ 重播</button></div>` : ''}
        ${sn ? codeBlock('code-main', [['HTML', sn.html], ['CSS', sn.css], ['JS', sn.js]]) : ''}
      </div>

      ${sn ? `<h2 id="params">參數</h2><div class="table-wrap"><table class="api"><thead><tr><th>項目</th><th>值</th><th>說明</th></tr></thead><tbody>${sn.params.map(r => `<tr><td>${esc(r[0])}</td><td><code>${esc(r[1])}</code></td><td>${esc(r[2])}</td></tr>`).join('')}</tbody></table></div>` : ''}

      <h2 id="principles">原則</h2>
      <ul class="points">${s.points.map(p => `<li>${esc(p).replace(CODE_RE, '<code>$1</code>')}</li>`).join('')}</ul>

      <h2 id="when">使用時機</h2>
      <p>${esc(s.when)}</p>

      <nav class="pager">${prev ? `<a href="#/a/${slug(prev.id)}"><small>上一個</small>${esc(typeOf(prev))}</a>` : '<span></span>'}${next ? `<a class="nx" href="#/a/${slug(next.id)}"><small>下一個</small>${esc(typeOf(next))}</a>` : '<span></span>'}</nav>
    </article><aside class="toc" id="toc"></aside></div>`;

    if(sn){
      const frame = view.querySelector('iframe'), load = () => { frame.srcdoc = fullFile(sn).split('https://zhijian090195.github.io/design/').join(''); };  // 預覽時改用本地圖片
      load();
      view.querySelector('[data-replay]').onclick = load;
      view.querySelector('[data-copy-full]').onclick = e => copy(fullFile(sn), e.currentTarget);
    } else mountDemo(view.querySelector('.stage.big'), s, false);
    wireCode(view);
  }

  /* ============ 頁面：元件 ============ */
  const REACT_INSTALL = js => "// main.jsx（或 Next.js 的 app/layout.jsx）\nimport './aicde-ui.css';" + (js ? "\nimport './aicde-ui.js';   // 只在瀏覽器執行；Next.js 請放在 'use client' 元件裡" : '');
  const INSTALL = '<link rel="stylesheet" href="https://zhijian090195.github.io/design/assets/aicde-ui.css">\n<script src="https://zhijian090195.github.io/design/assets/aicde-ui.js" defer></' + 'script>';
  function pageComponent(id){
    const c = COMPONENTS.find(x => x.id === id); if(!c) return notFound();
    const g = COMP_GROUPS.find(x => x.id === c.group);
    const i = COMPONENTS.indexOf(c), prev = COMPONENTS[i - 1], next = COMPONENTS[i + 1];
    view.innerHTML = `<div class="doc-wrap"><article class="doc">
      <div class="crumb"><a href="#/">總覽</a> / 元件 / ${g.name}</div>
      <h1>${c.name} <span class="en">${c.en}</span></h1>
      <p class="lead">${esc(c.desc)}</p>

      <h2 id="when">何時使用</h2>
      <ul class="points">${c.when.map(w => `<li>${esc(w)}</li>`).join('')}</ul>

      <h2 id="install">引入</h2>
      <p class="install-note">${c.js ? '這個元件需要 CSS 和 JS 兩個檔案。' : '這個元件只需要 CSS，JS 那行可以不加。'}</p>
      <div class="install"><pre>${esc(INSTALL)}</pre><button class="act" data-copy-install>複製</button></div>
      <p class="install-note install-note--react">在 React／Next.js 裡：把 <code>aicde-ui.css</code>${c.js ? ' 和 <code>aicde-ui.js</code>' : ''} 下載到專案，在入口檔案引入一次；每個範例的程式碼都有「React」分頁。</p>
      <div class="install"><pre>${esc(REACT_INSTALL(c.js))}</pre><button class="act" data-copy-react>複製</button></div>

      <h2 id="examples">範例</h2>
      ${c.demos.map((d, k) => `<div class="demo-box" id="ex-${k}" data-toc="${esc(d.title)}">
        <div class="demo-preview comp">${d.html}</div>
        <div class="demo-info"><b>${esc(d.title)}</b><p>${esc(d.desc)}</p></div>
        <div class="demo-actions"><button class="act" data-toggle-code="code-${k}" aria-expanded="false">‹/› 顯示程式碼</button></div>
        ${codeBlock('code-' + k, [['HTML', d.html], ['React', window.toJSX ? toJSX(d.html, c) : '']])}
      </div>`).join('')}

      <h2 id="api">API</h2>
      <div class="table-wrap"><table class="api"><thead><tr><th>Class／屬性</th><th>說明</th><th>預設</th></tr></thead><tbody>${c.api.map(r => `<tr><td><code>${esc(r[0])}</code></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</tbody></table></div>

      <nav class="pager">${prev ? `<a href="#/c/${prev.id}"><small>上一個</small>${prev.name} ${prev.en}</a>` : '<span></span>'}${next ? `<a class="nx" href="#/c/${next.id}"><small>下一個</small>${next.name} ${next.en}</a>` : '<span></span>'}</nav>
    </article><aside class="toc" id="toc"></aside></div>`;
    view.querySelector('[data-copy-install]').onclick = e => copy(INSTALL, e.currentTarget);
    view.querySelector('[data-copy-react]').onclick = e => copy(REACT_INSTALL(c.js), e.currentTarget);
    wireCode(view);
    window.AUI && AUI.init(view);
  }

  /* ============ 頁面：版型 ============ */
  const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&family=Noto+Serif+TC:wght@700&display=swap" rel="stylesheet">';
  const BASE_CSS = 'html,body{margin:0}body{font-family:var(--a-font,"Noto Sans TC",system-ui,sans-serif);background:var(--a-surface-2);color:var(--a-ink-body);min-height:100vh}';
  const tplDoc = (t, href) => `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t.name}</title>
${FONTS}
<link rel="stylesheet" href="${href}aicde-ui.css">
<style>
${BASE_CSS}
${t.css.trim()}
</style>
</head>
<body>
${t.html.trim()}
<script src="${href}aicde-ui.js"><\/script>
</body>
</html>`;
  /* 示範頁 iframe 的高度跟著內容；先縮回最小再量，才能變矮 */
  function fitFrame(f){
    const d = f.contentDocument; if(!d || !d.body) return;
    f.style.height = '480px';
    f.style.height = Math.max(480, d.documentElement.scrollHeight) + 'px';
  }
  const SHOWCASE = ['pricing', 'checkout', 'booking', 'article', 'login', 'dashboard', 'settings', 'data-list'];
  const showcases = () => SHOWCASE.map(id => TEMPLATES.find(t => t.id === id)).filter(Boolean);
  const themeAttrs = (t, dark) => `${t.css ? ` data-theme-style="${t.css}"` : ''}${dark == null ? '' : ` data-theme="${dark ? 'dark' : 'light'}"`}`;
  const withAttrs = (html, attrs) => html.replace('<html lang="zh-Hant">', `<html lang="zh-Hant"${attrs}>`);
  const siteDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const ASSETS = () => new URL('assets/', location.href).href;

  /* ============ 頁面：主題總覽 ============ */
  function pageThemes(){
    const page = showcases()[0];
    view.innerHTML = `<div class="doc-wrap tpl-wrap"><article class="doc">
      <div class="crumb"><a href="#/">總覽</a> / 主題</div>
      <h1>主題 <span class="en">Themes</span></h1>
      <p class="lead">同一套元件，換一個屬性就是不同的風格。下面每張卡片都是同一頁「${esc(page.name)}」，分別套上 15 種主題，點進去可以看完整頁面和其他示範頁。</p>
      <div class="th-grid">${THEMES.map(t => `<a class="th-card" href="#/s/${t.id}">
        <div class="th-thumb"><iframe class="th-mini" title="${esc(t.name)} 縮圖" loading="lazy" tabindex="-1" aria-hidden="true" data-theme-id="${t.id}"></iframe></div>
        <div class="th-info"><b>${t.name}<span class="en">${t.en}</span></b><p>${esc(t.tagline)}</p>
        <div class="th-traits">${t.traits.map(x => `<span>${esc(x)}</span>`).join('')}</div></div></a>`).join('')}</div>
    </article></div>`;
    const dark = siteDark();
    view.querySelectorAll('.th-mini').forEach(f => {
      const t = THEMES.find(x => x.id === f.dataset.themeId);
      f.srcdoc = withAttrs(tplDoc(page, ASSETS()), themeAttrs(t, dark));
    });
    fitMinis();
  }
  function fitMinis(){
    view.querySelectorAll('.th-thumb').forEach(b => b.style.setProperty('--ts', (b.clientWidth / 1280).toFixed(4)));
  }
  addEventListener('resize', () => requestAnimationFrame(fitMinis));

  /* ============ 頁面：單一主題 ============ */
  function pageTheme(id){
    const t = THEMES.find(x => x.id === id); if(!t) return notFound();
    const i = THEMES.indexOf(t), prev = THEMES[i - 1], next = THEMES[i + 1];
    const pages = showcases();
    let page = pages[0], dark = siteDark();
    const attr = t.css ? ` data-theme-style="${t.css}"` : '';
    const codes = [
      ['HTML', `<!-- 整個網站 -->\n<html${attr || ''}>\n\n<!-- 或只套在某個區塊 -->\n<section${attr || ' '}>…</section>${t.css ? '' : '\n\n<!-- 預設主題不需要加屬性 -->'}`],
      ['React', `import { ThemeProvider } from 'aicde-ui';\n\n<ThemeProvider theme="${t.id}">\n  <App />\n</ThemeProvider>`],
      ['Flutter', `MaterialApp(\n  theme: aicdeThemeData(style: AicdeThemeStyle.${t.flutter}),\n  darkTheme: aicdeThemeData(style: AicdeThemeStyle.${t.flutter}, brightness: Brightness.dark),\n);`]
    ];
    view.innerHTML = `<div class="doc-wrap tpl-wrap"><article class="doc">
      <div class="crumb"><a href="#/">總覽</a> / <a href="#/s">主題</a></div>
      <h1>${t.name} <span class="en">${t.en}</span></h1>
      <p class="lead">${esc(t.tagline)}</p>
      <div class="th-meta"><div><small>適合</small>${t.fit.map(x => `<span class="a-tag">${esc(x)}</span>`).join('')}</div><div><small>特色</small>${t.traits.map(x => `<span class="a-tag a-tag--outline">${esc(x)}</span>`).join('')}</div></div>
      <div class="tpl-bar">
        <label class="th-pick"><span>示範頁</span><select class="a-input a-select a-input--sm th-page">${pages.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label>
        <div class="a-segmented" role="radiogroup" aria-label="預覽寬度">
          <label><input type="radio" name="tplw" value="100%" checked><span>桌面</span></label><label><input type="radio" name="tplw" value="820px"><span>平板</span></label><label><input type="radio" name="tplw" value="390px"><span>手機</span></label>
        </div>
        <div class="a-segmented" role="radiogroup" aria-label="深淺色">
          <label><input type="radio" name="thd" value="0" ${dark ? '' : 'checked'}><span>淺色</span></label><label><input type="radio" name="thd" value="1" ${dark ? 'checked' : ''}><span>深色</span></label>
        </div>
        <span class="tpl-hint"></span>
        <button class="a-btn a-btn--primary a-btn--sm" data-apply>套用到整個網站</button>
      </div>
      <div class="tpl-stage"><iframe class="th-frame" title="${esc(t.name)} 主題預覽"></iframe></div>
      <h2 id="use">怎麼套用</h2>
      <div class="demo-box"><div class="demo-info"><b>${t.css ? `data-theme-style="${t.css}"` : '不加任何屬性'}</b><p>主題只影響包在裡面的元件，同一頁可以混用不同主題。深淺色另外用 data-theme="dark"／"light" 控制。</p></div>
      ${codeBlock('th-code', codes).replace(' hidden>', '>')}</div>
      <nav class="pager">${prev ? `<a href="#/s/${prev.id}"><small>上一個</small>${prev.name} ${prev.en}</a>` : '<span></span>'}${next ? `<a class="nx" href="#/s/${next.id}"><small>下一個</small>${next.name} ${next.en}</a>` : '<span></span>'}</nav>
    </article></div>`;
    const f = view.querySelector('.th-frame');
    const load = () => { f.srcdoc = withAttrs(tplDoc(page, ASSETS()), themeAttrs(t, dark)); };
    f.onload = () => { fitFrame(f); try{ new (f.contentWindow.ResizeObserver)(() => fitFrame(f)).observe(f.contentDocument.body); }catch(e){} };
    load();
    view.querySelector('.th-page').onchange = e => { page = pages.find(p => p.id === e.target.value); load(); };
    view.querySelectorAll('input[name=tplw]').forEach(r => r.onchange = () => { f.style.width = r.value; });
    view.querySelectorAll('input[name=thd]').forEach(r => r.onchange = () => {
      dark = r.value === '1';
      const d = f.contentDocument; if(d) d.documentElement.dataset.theme = dark ? 'dark' : 'light';
    });
    view.querySelector('[data-apply]').onclick = e => {
      sel.value = t.css; setStyle(t.css); try{ localStorage.setItem('themeStyle', t.css); }catch(_){}
      e.currentTarget.textContent = '已套用 ✓';
    };
    wireCode(view);
    window.AUI && AUI.init(view);
  }

  function notFound(){ view.innerHTML = `<div class="doc"><h1>找不到這一頁</h1><p class="lead"><a href="#/">回到總覽</a></p></div>`; }

  /* ============ Router ============ */
  function route(){
    const r = location.hash.replace(/^#/, '') || '/';
    timers.forEach(clearInterval); timers.clear();
    const m = r.match(/^\/(a|c|s)(?:\/([\w-]+))?$/);
    document.body.dataset.page = m ? 'doc' : 'home';
    if(m && m[1] === 'a') pageMotion(m[2] || '');
    else if(m && m[1] === 'c') pageComponent(m[2] || '');
    else if(m && m[1] === 's') m[2] ? pageTheme(m[2]) : pageThemes();
    else pageHome();
    buildToc();
    nav.querySelectorAll('a[data-route]').forEach(a => a.classList.toggle('active', a.dataset.route === (m ? r : '/')));
    const act = nav.querySelector('a.active'); act && act.scrollIntoView({block:'nearest'});
    window.scrollTo(0, 0);
    document.body.classList.remove('nav-open');
    const t = m ? (view.querySelector('h1')?.textContent || '') : '';
    document.title = t ? `${t} · AICDE Design` : 'AICDE Design Library';
  }
  window.addEventListener('hashchange', route);

  /* ============ 搜尋 ============ */
  function applySearch(){
    const q = $('#q').value.trim().toLowerCase();
    nav.querySelectorAll('li[data-search]').forEach(li => li.classList.toggle('off', !!q && !li.dataset.search.includes(q)));
    nav.querySelectorAll('.ng').forEach(g => g.hidden = !!q && !g.querySelector('li:not(.off)'));
    if(document.body.dataset.page !== 'home') return;
    let total = 0;
    view.querySelectorAll('.group[data-group]').forEach(sec => {
      let n = 0;
      sec.querySelectorAll('.card').forEach(c => { const hit = !q || c.dataset.search.includes(q); c.hidden = !hit; if(hit){ n++; c.classList.add('shown'); } });
      sec.hidden = n === 0; total += n;
    });
    const empty = $('#empty'); empty && empty.classList.toggle('show', !!q && total === 0);
  }
  $('#q').addEventListener('input', applySearch);

  /* ============ 抽屜、深淺色 ============ */
  $('#menuBtn').onclick = () => document.body.classList.toggle('nav-open');
  $('#scrim').onclick = () => document.body.classList.remove('nav-open');
  document.addEventListener('keydown', e => { if(e.key === 'Escape') document.body.classList.remove('nav-open'); });
  const root = document.documentElement;
  try{ const t = localStorage.getItem('theme'); if(t) root.dataset.theme = t; }catch(e){}
  $('#themeBtn').onclick = () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try{ localStorage.setItem('theme', root.dataset.theme); }catch(e){}
  };

  const sel = $('#styleSel');
  const setStyle = v => { if(v) root.dataset.themeStyle = v; else delete root.dataset.themeStyle; requestAnimationFrame(fitThumbs); };
  try{ const v = localStorage.getItem('themeStyle') || ''; sel.value = v; setStyle(v); }catch(e){}
  sel.onchange = () => { setStyle(sel.value); try{ localStorage.setItem('themeStyle', sel.value); }catch(e){} };

  route();
})();
