/* ============================================================
   AICDE FX — 打擊特效層（原生 JS，不依賴任何框架，可單獨使用）
   引入：<script src="aicde-fx.js" defer></script>
   開啟：在 <html> 或任何容器加上 data-fx，裡面的 AICDE 元件就會有打擊感；
         data-fx="off" 可以在裡面再關掉某一塊。不加 data-fx 就完全不動作。
   做法：彈簧讓元件壓扁、回彈過頭；整頁只有一張 canvas（不擋點擊）畫出
         爆炸、煙霧、火花、刀光和擬聲字。開啟「減少動態效果」時全部關閉。
   顏色：--a-fx-hot（爆炸）、--a-fx-line（描邊）、--a-fx-cloud（煙霧）、
         --a-fx-spark（火花），沒設定就跟著主題的 --a-coral／--a-navy／--a-sky。
   ============================================================ */
(function(){
  if(typeof window === 'undefined' || typeof document === 'undefined' || window.AUIFX) return;
  const doc = document, TAU = Math.PI * 2;
  const reduce = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const easeOut = k => 1 - Math.pow(1 - k, 3);
  const easeBack = k => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };

  /* ---------- 開關：最近的 data-fx 決定 ---------- */
  function host(el){
    if(!el || !el.closest) return null;
    const h = el.closest('[data-fx]');
    return h && h.getAttribute('data-fx') !== 'off' ? h : null;
  }
  const active = el => !reduce() && !!host(el);
  function wordsOn(el){
    const w = el.closest && el.closest('[data-fx-word]');
    return !(w && w.getAttribute('data-fx-word') === 'off');
  }
  // 元件自己的 data-fx-word 可以換字；空字串或 off 不出字
  function wordFor(el, fallback){
    if(!wordsOn(el)) return '';
    const own = el.getAttribute && el.getAttribute('data-fx-word');
    return own != null && own !== '' && own !== 'off' ? own : fallback;
  }

  /* ---------- 顏色：從元件所在的主題讀 ---------- */
  function palette(el){
    const cs = getComputedStyle(el && el.nodeType === 1 ? el : doc.documentElement);
    const v = (n, d) => (cs.getPropertyValue(n) || '').trim() || d;
    const hot = v('--a-fx-hot', v('--a-coral', '#fc5454'));
    return { hot, line: v('--a-fx-line', v('--a-navy', '#173f50')), cloud: v('--a-fx-cloud', '#ffffff'), spark: v('--a-fx-spark', v('--a-sky', '#a8c8d4')) };
  }
  // 文字擬聲字用的字型：主題字型優先
  function fontOf(el){
    const f = (getComputedStyle(el && el.nodeType === 1 ? el : doc.documentElement).getPropertyValue('--a-font') || '').trim();
    return f || '"Noto Sans TC", system-ui, sans-serif';
  }

  /* ---------- 唯一的一張 canvas ---------- */
  let cv = null, ctx = null, dpr = 1, raf = 0, last = 0;
  const parts = [];
  function ensureCanvas(){
    if(cv && cv.isConnected) return;
    cv = doc.createElement('canvas');
    cv.className = 'a-fx-layer';
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483647;contain:strict';
    (doc.body || doc.documentElement).appendChild(cv);
    try{ ctx = cv.getContext("2d"); }catch(e){ ctx = null; }
    size();
  }
  function size(){
    if(!cv) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr);
  }
  addEventListener('resize', size);
  function add(p){
    if(reduce()) return;
    ensureCanvas();
    if(!ctx) return;   // 沒有 2D canvas 的環境（例如測試用的 jsdom）就不畫
    p.t = 0; parts.push(p);
    if(parts.length > 260) parts.splice(0, parts.length - 260);
    if(!raf){ last = performance.now(); raf = requestAnimationFrame(tick); }
  }
  function tick(now){
    const dt = Math.min(48, now - last); last = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    // 依加入順序畫，後加的蓋在上面（擬聲字永遠在爆炸上面）
    let w = 0;
    for(let i = 0; i < parts.length; i++){
      const p = parts[i];
      if(p.delay > 0){ p.delay -= dt; parts[w++] = p; continue; }
      p.t += dt;
      const k = p.t / p.life;
      if(k >= 1) continue;
      ctx.save(); p.draw(ctx, k, dt); ctx.restore();
      parts[w++] = p;
    }
    parts.length = w;
    raf = parts.length ? requestAnimationFrame(tick) : 0;
    if(!raf) ctx.clearRect(0, 0, cv.width, cv.height);
  }
  doc.addEventListener('visibilitychange', () => { if(doc.hidden){ parts.length = 0; if(ctx) ctx.clearRect(0, 0, cv.width, cv.height); } });

  /* ---------- 基本筆觸 ---------- */
  // 爆炸：鋸齒星形從 r0 往外炸開；r0 設成元件外框，就不會蓋住文字
  function burst(x, y, o){
    o = o || {}; const c = o.colors || palette(o.el);
    const r0 = o.r0 || 0, r = o.r || 60, n = o.spikes || 14, rot = rand(0, TAU);
    const len = Array.from({length: n * 2}, (_, i) => i % 2 ? rand(.35, .55) : rand(.8, 1.15));
    add({ life: o.life || 420, delay: o.delay || 0, draw(g, k){
      const grow = easeOut(Math.min(1, k / .45)), a = k < .55 ? 1 : 1 - (k - .55) / .45;
      const R = r0 + (r - r0) * grow;
      g.globalAlpha = a; g.translate(x, y); g.rotate(rot + k * .25);
      g.beginPath();
      if(r0){
        // 圍著元件的放射尖刺：每根從外框往外長，中間留空，不蓋住元件
        for(let i = 0; i < n * 2; i += 2){
          const ang = i / (n * 2) * TAU, half = Math.PI / (n * 2) * .8, tip = r0 + (R - r0) * len[i];
          g.moveTo(Math.cos(ang - half) * r0, Math.sin(ang - half) * r0);
          g.lineTo(Math.cos(ang) * tip, Math.sin(ang) * tip);
          g.lineTo(Math.cos(ang + half) * r0, Math.sin(ang + half) * r0);
          g.closePath();
        }
      } else {
        for(let i = 0; i < n * 2; i++){
          const ang = i / (n * 2) * TAU, rr = R * len[i];
          g.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
        }
        g.closePath();
      }
      g.fillStyle = c.hot; g.fill();
      g.lineWidth = 2.5; g.lineJoin = 'round'; g.strokeStyle = c.line; g.stroke();
    }});
  }
  // 速度線：細長三角形往外射
  function wedges(x, y, o){
    o = o || {}; const c = o.colors || palette(o.el);
    const n = o.n || 3, base = o.angle == null ? -Math.PI / 2 : o.angle, spread = o.spread == null ? .9 : o.spread;
    for(let i = 0; i < n; i++){
      const ang = base + (n === 1 ? 0 : (i / (n - 1) - .5) * spread) + rand(-.08, .08);
      const len = (o.len || 16) * rand(.8, 1.2), start = o.gap || 8;
      add({ life: o.life || 300, delay: (o.delay || 0) + i * 18, draw(g, k){
        const d = start + easeOut(k) * (o.travel || 14), L = len * (1 - k * .6);
        g.globalAlpha = 1 - k * k; g.translate(x, y); g.rotate(ang);
        g.beginPath(); g.moveTo(d, -2.6); g.lineTo(d + L, 0); g.lineTo(d, 2.6); g.closePath();
        g.fillStyle = o.color || c.line; g.fill();
      }});
    }
  }
  // 煙霧：三顆圓疊成一朵雲，往外飄、變大、變淡
  function puff(x, y, o){
    o = o || {}; const c = o.colors || palette(o.el);
    const r = o.r || 10, vx = o.vx || 0, vy = o.vy == null ? -.02 : o.vy;
    const blobs = [[0, 0, 1], [rand(.55, .8), rand(-.2, .2), rand(.6, .8)], [rand(-.8, -.55), rand(-.2, .2), rand(.55, .75)]];
    add({ life: o.life || 620, delay: o.delay || 0, draw(g, k){
      const s = .35 + easeOut(k) * .9, px = x + vx * this.t, py = y + vy * this.t;
      g.globalAlpha = k < .5 ? 1 : 1 - (k - .5) / .5;
      g.translate(px, py); g.scale(s, s);
      g.beginPath(); blobs.forEach(b => { g.moveTo(b[0] * r + b[2] * r, b[1] * r); g.arc(b[0] * r, b[1] * r, b[2] * r, 0, TAU); });
      g.lineWidth = 4 / s; g.strokeStyle = c.line; g.stroke();
      g.fillStyle = c.cloud; g.fill();
    }});
  }
  // 火花：小菱形帶重力和旋轉
  function sparks(x, y, o){
    o = o || {}; const c = o.colors || palette(o.el);
    const n = o.n || 8, sp = o.speed || .32, base = o.angle == null ? null : o.angle, spread = o.spread == null ? TAU : o.spread;
    for(let i = 0; i < n; i++){
      const ang = base == null ? rand(0, TAU) : base + rand(-spread / 2, spread / 2);
      const v = sp * rand(.55, 1.1), sz = (o.size || 4) * rand(.7, 1.3), spin = rand(-.02, .02);
      let px = x, py = y, vx = Math.cos(ang) * v, vy = Math.sin(ang) * v, rot = rand(0, TAU);
      const col = o.color || (i % 3 ? c.hot : c.spark);
      add({ life: (o.life || 560) * rand(.75, 1.1), delay: o.delay || 0, draw(g, k, dt){
        vy += .0009 * dt; px += vx * dt; py += vy * dt; rot += spin * dt;
        g.globalAlpha = 1 - k * k; g.translate(px, py); g.rotate(rot);
        g.beginPath(); g.moveTo(0, -sz); g.lineTo(sz * .55, 0); g.lineTo(0, sz); g.lineTo(-sz * .55, 0); g.closePath();
        g.fillStyle = col; g.fill(); g.lineWidth = 1.2; g.strokeStyle = c.line; g.stroke();
      }});
    }
  }
  // 衝擊環
  function ring(x, y, o){
    o = o || {}; const c = o.colors || palette(o.el);
    const r0 = o.r0 || 4, r = o.r || 30;
    add({ life: o.life || 420, delay: o.delay || 0, draw(g, k){
      g.globalAlpha = 1 - k; g.beginPath(); g.arc(x, y, r0 + (r - r0) * easeOut(k), 0, TAU);
      g.lineWidth = (o.width || 3) * (1 - k * .7); g.strokeStyle = o.color || c.line; g.stroke();
    }});
  }
  // 刀光：月牙形掃過去
  function crescent(x, y, o){
    o = o || {}; const c = o.colors || palette(o.el);
    const r = o.r || 18, a = o.angle || 0, sweep = o.sweep == null ? 2.4 : o.sweep, dir = o.dir || 1;
    const vx = o.vx || 0, vy = o.vy || 0;
    add({ life: o.life || 340, delay: o.delay || 0, draw(g, k){
      const e = easeOut(k), a0 = a + dir * (e * 1.4 - .7), a1 = a0 + dir * sweep * (.35 + e * .65);
      g.globalAlpha = k < .6 ? 1 : 1 - (k - .6) / .4;
      g.translate(x + vx * this.t, y + vy * this.t);
      g.beginPath();
      g.arc(0, 0, r, Math.min(a0, a1), Math.max(a0, a1));
      g.arc(r * .22 * Math.cos((a0 + a1) / 2), r * .22 * Math.sin((a0 + a1) / 2), r * .86, Math.max(a0, a1), Math.min(a0, a1), true);
      g.closePath(); g.fillStyle = o.color || c.hot; g.fill(); g.lineWidth = 1.5; g.strokeStyle = c.line; g.stroke();
    }});
  }
  // 擬聲字：彈出、停一下、往上飄走
  function word(x, y, text, o){
    o = o || {}; if(!text) return;
    const c = o.colors || palette(o.el), size = o.size || 26, rot = (o.rot == null ? rand(-.16, .06) : o.rot), font = fontOf(o.el);
    add({ life: o.life || 900, delay: o.delay || 0, draw(g, k){
      const s = k < .14 ? .3 + easeBack(k / .14) * .85 : k < .28 ? 1.15 - (k - .14) / .14 * .15 : 1;
      g.globalAlpha = k < .7 ? 1 : 1 - (k - .7) / .3;
      g.translate(x, y - (k > .7 ? (k - .7) * 30 : 0)); g.rotate(rot); g.scale(s, s);
      g.font = `900 ${size}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
      g.lineWidth = size * .34; g.strokeStyle = c.cloud; g.strokeText(text, 0, 0);
      g.lineWidth = size * .16; g.strokeStyle = c.line; g.strokeText(text, 0, 0);
      g.fillStyle = o.color || c.hot; g.fillText(text, 0, 0);
    }});
  }
  // 打勾：一筆畫出來，帶一個閃光
  function check(x, y, o){
    o = o || {}; const c = o.colors || palette(o.el), s = o.size || 22;
    add({ life: o.life || 1400, delay: o.delay || 0, draw(g, k){
      const draw = clamp(k / .22, 0, 1), a = k < .8 ? 1 : 1 - (k - .8) / .2;
      g.globalAlpha = a; g.translate(x, y); g.lineCap = 'round'; g.lineJoin = 'round';
      const pts = [[-.45, .02], [-.12, .35], [.5, -.38]], segs = [Math.hypot(.33, .33), Math.hypot(.62, .73)], tot = segs[0] + segs[1];
      const path = () => { g.beginPath(); g.moveTo(pts[0][0] * s, pts[0][1] * s); let left = draw * tot;
        for(let i = 0; i < 2; i++){ const f = clamp(left / segs[i], 0, 1); left -= segs[i];
          g.lineTo((pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f) * s, (pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f) * s); if(f < 1) break; } };
      path(); g.lineWidth = s * .42; g.strokeStyle = c.line; g.stroke();
      path(); g.lineWidth = s * .24; g.strokeStyle = o.color || c.hot; g.stroke();
      if(k > .2 && k < .5){ const gk = (k - .2) / .3, gs = Math.sin(gk * Math.PI) * s * .35;
        g.translate(.5 * s, -.38 * s); g.beginPath(); g.moveTo(0, -gs); g.lineTo(gs * .22, 0); g.lineTo(0, gs); g.lineTo(-gs * .22, 0); g.closePath();
        g.moveTo(-gs, 0); g.lineTo(0, gs * .22); g.lineTo(gs, 0); g.lineTo(0, -gs * .22); g.closePath(); g.fillStyle = c.cloud; g.fill(); g.lineWidth = 1.2; g.strokeStyle = c.line; g.stroke(); }
    }});
  }

  /* ---------- 彈簧：用 CSS 的 scale 屬性，不會蓋掉主題原本的 transform ---------- */
  const anims = new WeakMap();
  function springVals(from, to, v0, k, c){
    let x = from, v = v0; const out = [x];
    for(let i = 0; i < 150; i++){
      v += (-k * (x - to) - c * v) / 60; x += v / 60; out.push(x);
      if(Math.abs(x - to) < .002 && Math.abs(v) < .03) break;
    }
    out.push(to); return out;
  }
  function spring(el, from, opts){
    if(!el || !el.animate || reduce()) return;
    opts = opts || {};
    const k = opts.stiffness || 520, c = opts.damping || 15, v0 = opts.velocity || [0, 0];
    const xs = springVals(from[0], 1, v0[0], k, c), ys = springVals(from[1], 1, v0[1], k, c), n = Math.max(xs.length, ys.length);
    const frames = Array.from({length: n}, (_, i) => ({ scale: `${(xs[i] ?? 1).toFixed(4)} ${(ys[i] ?? 1).toFixed(4)}` }));
    const prev = anims.get(el); prev && prev.cancel();
    const a = el.animate(frames, { duration: n * 1000 / 60, easing: 'linear', delay: opts.delay || 0 });
    anims.set(el, a);
    return a;
  }
  function squash(el, sx, sy){
    if(!el || !el.animate || reduce()) return;
    const prev = anims.get(el); prev && prev.cancel();
    const a = el.animate([{ scale: '1 1' }, { scale: `${sx} ${sy}` }], { duration: 90, easing: 'cubic-bezier(.2,.9,.3,1)', fill: 'forwards' });
    a._sq = [sx, sy]; anims.set(el, a);
  }
  function release(el, big){
    const a = anims.get(el), from = a && a._sq ? a._sq : [big ? 1.1 : 1.05, big ? .84 : .92];
    spring(el, from, { velocity: big ? [-4, 9] : [-2, 5], stiffness: big ? 460 : 560, damping: big ? 13 : 17 });
  }

  /* ---------- 位置 ---------- */
  const rectOf = el => el.getBoundingClientRect();
  const center = r => [r.left + r.width / 2, r.top + r.height / 2];
  // 文字游標的位置：用一個隱藏的鏡像元素量出來
  const MIRROR = ['boxSizing', 'width', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderStyle', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'lineHeight', 'textTransform', 'wordSpacing', 'textIndent', 'tabSize'];
  function caret(el){
    const r = rectOf(el), area = el.tagName === 'TEXTAREA';
    let pos; try{ pos = el.selectionEnd; }catch(e){}
    if(pos == null) pos = el.value.length;
    const cs = getComputedStyle(el), m = doc.createElement('div');
    MIRROR.forEach(p => { m.style[p] = cs[p]; });
    m.style.cssText += `;position:fixed;left:${r.left}px;top:${r.top}px;visibility:hidden;overflow:hidden;white-space:${area ? 'pre-wrap' : 'pre'};overflow-wrap:break-word;border-color:transparent`;
    const txt = el.value.slice(0, pos);
    m.textContent = el.type === 'password' ? '•'.repeat(txt.length) : txt;
    const s = doc.createElement('span'); s.textContent = '|'; m.appendChild(s);
    doc.body.appendChild(m);
    const sr = s.getBoundingClientRect(); m.remove();
    const x = clamp(sr.left - el.scrollLeft, r.left + 6, r.right - 6);
    const y = area ? clamp(sr.top + sr.height / 2 - el.scrollTop, r.top + 6, r.bottom - 6) : r.top + r.height / 2;
    return [x, y];
  }

  /* ============ 元件反應 ============ */
  const isBtn = el => el && el.closest && el.closest('.a-btn');
  const usable = b => !b.disabled && !b.classList.contains('is-loading') && b.getAttribute('aria-disabled') !== 'true';
  const bigBtn = b => b.classList.contains('a-btn--primary');

  // 按鈕：按下壓扁，放開回彈；主要按鈕放開時外圈炸開、四角冒煙、出現「砰！」
  function impact(b){
    const r = rectOf(b), [x, y] = center(r), c = palette(b);
    if(bigBtn(b)){
      const r0 = Math.hypot(r.width, r.height) / 2 + 4;
      burst(x, y, { r0, r: r0 + 30, spikes: 14, colors: c });
      sparks(x, y, { n: 10, speed: .36, colors: c });
      [[r.left, r.top, -1, -1], [r.right, r.top, 1, -1], [r.left, r.bottom, -1, 1], [r.right, r.bottom, 1, 1]].forEach(([px, py, dx, dy], i) =>
        puff(px, py, { r: 9, vx: dx * .05, vy: dy * .03, delay: 60 + i * 25, colors: c }));
      word(x + r.width * .38, r.top - 30, wordFor(b, '砰！'), { size: 28, colors: c, delay: 60 });
      ring(x, y, { r0: r0, r: r0 + 50, width: 2.5, delay: 120, colors: c });
    } else {
      wedges(r.right - 4, r.top + 2, { n: 3, angle: -Math.PI / 4, spread: 1.1, len: 13, colors: c });
      if(b.classList.contains('a-btn--secondary')) puff(r.left + 6, r.bottom - 2, { r: 6, vx: -.03, vy: .01, colors: c });
    }
    release(b, bigBtn(b));
  }
  // 成功時呼叫：按鈕上冒出一個打勾和「叮！」
  function done(el, opts){
    if(!el || reduce()) return;
    opts = opts || {};
    const r = rectOf(el), c = palette(el);
    check(r.right - 2, r.top + 2, { size: 24, colors: c });
    wedges(r.right + 6, r.top - 6, { n: 2, angle: -Math.PI / 4, spread: .9, len: 10, delay: 220, colors: c });
    if(opts.word !== false) word(r.left + r.width / 2, r.top - 22, opts.word || wordFor(el, '叮！'), { size: 20, colors: c, delay: 160 });
    spring(el, [1.06, .94], { velocity: [-1, 3] });
  }

  let pressed = null;
  doc.addEventListener('pointerdown', e => {
    const b = isBtn(e.target); if(!b || !usable(b) || !active(b) || e.button) return;
    pressed = b; squash(b, bigBtn(b) ? 1.12 : 1.06, bigBtn(b) ? .8 : .9);
  }, true);
  const unpress = () => { if(pressed){ const b = pressed; pressed = null; const a = anims.get(b); if(a && a._sq) release(b, bigBtn(b)); } };
  doc.addEventListener('pointercancel', unpress, true);
  doc.addEventListener('pointerup', e => { if(pressed && !pressed.contains(e.target)) unpress(); }, true);
  doc.addEventListener('click', e => {
    const b = isBtn(e.target); if(!b || !usable(b) || !active(b)) return;
    pressed = null; impact(b);
  });

  // 開關：滑塊撞到底，濺起水花和「咔！」
  function onSwitch(input){
    const label = input.closest('.a-switch'), track = label && label.querySelector('.a-switch__track'), thumb = label && label.querySelector('.a-switch__thumb');
    if(!track) return;
    const c = palette(track), r = rectOf(track), on = input.checked, y = r.top + r.height / 2;
    const x = on ? r.right : r.left, dir = on ? 1 : -1;
    setTimeout(() => {
      if(on){
        sparks(x - 4, y, { n: 7, angle: -Math.PI / 2 + dir * .5, spread: 1.6, speed: .3, colors: c });
        puff(x + 2, r.bottom, { r: 7, vx: .03, vy: .01, colors: c });
        wedges(x + 4, y, { n: 3, angle: 0, spread: 1.2, len: 12, gap: 6, colors: c });
        word(r.left + r.width * .7, r.top - 16, wordFor(label, '咔！'), { size: 18, colors: c });
      } else {
        puff(x - 2, r.bottom, { r: 6, vx: -.03, vy: .01, colors: c });
      }
      thumb && spring(thumb, [.78, 1.2], { velocity: [4, -5] });
    }, 120);
    thumb && thumb.animate && !reduce() && thumb.animate([{ scale: '1 1' }, { scale: '1.35 .8' }, { scale: '1 1' }], { duration: 140, easing: 'ease-out' });
  }
  // 核取方塊：兩道刀光繞著方框掃過，火花飛出，「唰！」
  function onCheck(input){
    const r = rectOf(input), [x, y] = center(r), c = palette(input), lab = input.closest('.a-check');
    if(input.checked){
      crescent(x, y, { r: 16, angle: -Math.PI * .75, dir: 1, colors: c });
      crescent(x, y, { r: 16, angle: Math.PI * .25, dir: 1, delay: 50, colors: c });
      sparks(x, y, { n: 6, speed: .26, size: 3.4, colors: c, delay: 60 });
      lab && word(r.left - 4, r.top - 16, wordFor(lab, '唰！'), { size: 16, rot: -.2, colors: c, delay: 80 });
      spring(input, [.7, .7], { velocity: [6, 6], stiffness: 600, damping: 14 });
    } else {
      puff(x, y, { r: 5, vy: -.03, colors: c, life: 420 });
      spring(input, [.85, .85], { velocity: [3, 3] });
    }
  }
  // 單選：圓點彈進去，一扇速度線往上射，兩朵小煙，「啵！」
  function onRadio(input){
    const r = rectOf(input), [x, y] = center(r), c = palette(input), lab = input.closest('.a-check');
    wedges(x, y, { n: 5, angle: -Math.PI / 2, spread: 1.6, len: 11, gap: 12, colors: c });
    puff(r.left - 2, r.bottom, { r: 5, vx: -.03, vy: .005, colors: c, delay: 40 });
    puff(r.right + 2, r.bottom, { r: 5, vx: .03, vy: .005, colors: c, delay: 60 });
    lab && word(r.right + 14, r.top - 14, wordFor(lab, '啵！'), { size: 16, colors: c, delay: 60 });
    spring(input, [.6, .6], { velocity: [7, 7], stiffness: 620, damping: 13 });
  }
  // 評分：星星一顆接一顆彈出，滿分炸一下，「讚！」
  function onRating(input){
    const set = input.closest('.a-rating'); if(!set) return;
    const all = [...set.querySelectorAll('input')], idx = all.indexOf(input);
    const lit = all.slice(idx).map(i => set.querySelector(`label[for="${i.id}"]`) || i.nextElementSibling).filter(Boolean).reverse();
    const c = palette(set);
    lit.forEach((lab, i) => {
      setTimeout(() => {
        const r = rectOf(lab), [x, y] = center(r);
        spring(lab, [.5, .5], { velocity: [8, 8], stiffness: 560, damping: 12 });
        sparks(x, y, { n: 3, speed: .2, size: 3, colors: c });
      }, i * 60);
    });
    if(idx === 0 && lit.length){
      setTimeout(() => {
        const r = rectOf(set), [x, y] = center(r), r0 = Math.hypot(r.width, r.height) / 2 + 4;
        burst(x, y, { r0, r: r0 + 26, spikes: 18, colors: c });
        word(r.right + 10, r.top - 22, wordFor(set, '讚！'), { size: 22, colors: c });
      }, lit.length * 60);
    }
  }
  // 滑桿：拖得快，後面捲起煙；放開時刀光往前飛
  const sliders = new WeakMap();
  function thumbPos(s){
    const r = rectOf(s), min = +s.min || 0, max = s.max === '' ? 100 : +s.max, f = (s.value - min) / ((max - min) || 1);
    return [r.left + 10 + f * (r.width - 20), r.top + r.height / 2];
  }
  function onSlide(s){
    const now = performance.now(), [x, y] = thumbPos(s), st = sliders.get(s) || { x, t: now, puff: 0, v: 0 };
    const dt = Math.max(1, now - st.t), v = (x - st.x) / dt;
    st.v = st.v * .5 + v * .5; st.x = x; st.t = now;
    if(Math.abs(st.v) > .5 && now - st.puff > 45){
      st.puff = now; const d = Math.sign(st.v);
      puff(x - d * 14, y + 2, { r: 5 + Math.min(5, Math.abs(st.v) * 2), vx: -d * .04, vy: -.02, life: 520, el: s });
    }
    sliders.set(s, st);
  }
  function onSlideEnd(s){
    const st = sliders.get(s), [x, y] = thumbPos(s), c = palette(s);
    if(st && performance.now() - st.t < 140 && Math.abs(st.v) > .35){
      const d = Math.sign(st.v);
      crescent(x + d * 8, y, { r: 14, angle: d > 0 ? -Math.PI / 2 : Math.PI / 2, dir: d, sweep: 2.6, vx: d * .25, life: 380, colors: c });
      sparks(x, y, { n: 4, angle: d > 0 ? 0 : Math.PI, spread: 1, speed: .3, size: 3, colors: c });
    } else ring(x, y, { r0: 8, r: 20, width: 2, colors: c });
    if(st) st.v = 0;
  }
  // 輸入框：每打一個字，游標那裡揚起一點灰
  function onType(el){
    const [x, y] = caret(el), c = palette(el);
    puff(x, y + 4, { r: 3.6, vx: rand(-.02, .02), vy: -.03, life: 420, colors: c });
    if(Math.random() < .35) sparks(x, y, { n: 1, speed: .12, size: 2.4, angle: -Math.PI / 2, spread: 1.2, colors: c, life: 360 });
  }
  // 標籤頁：選中的標籤彈一下，兩側速度線和一朵煙
  const tabsSeen = new WeakMap();
  function checkTabs(list){
    const cur = list.querySelector('[role=tab][aria-selected="true"]'), prev = tabsSeen.get(list);
    tabsSeen.set(list, cur);
    if(!cur || cur === prev || !prev) return;
    const r = rectOf(cur), c = palette(cur), dir = rectOf(prev).left < r.left ? 1 : -1, y = r.bottom - 2;
    spring(cur, [1.12, .86], { velocity: [-3, 6] });
    wedges(r.left + 4, y, { n: 2, angle: Math.PI + .35, spread: .5, len: 10, gap: 2, colors: c });
    wedges(r.right - 4, y, { n: 2, angle: -.35, spread: .5, len: 10, gap: 2, colors: c });
    puff(dir > 0 ? r.left : r.right, y, { r: 6, vx: -dir * .04, vy: -.01, colors: c });
  }
  // 通知：滑進來落地，揚起灰塵，「咻！」
  function onToast(t){
    setTimeout(() => {
      if(!t.isConnected) return;
      const r = rectOf(t), c = palette(t);
      puff(r.left + 4, r.bottom, { r: 8, vx: -.05, vy: -.005, colors: c });
      puff(r.right - 4, r.bottom, { r: 8, vx: .05, vy: -.005, colors: c, delay: 30 });
      wedges(r.left - 4, r.top + r.height / 2, { n: 3, angle: Math.PI, spread: .5, len: 14, gap: 2, colors: c });
      word(r.right - 18, r.top - 10, wordFor(t, '咻！'), { size: 18, colors: c, delay: 40 });
      spring(t, [1.04, .92], { velocity: [-1, 4] });
    }, 200);
  }
  // 進度條：前緣冒火花；到 100% 時炸開，「完成！」
  const prog = new WeakMap();
  function onProgress(bar){
    const v = parseFloat(bar.style.getPropertyValue('--v')) || 0, p = prog.has(bar) ? prog.get(bar) : null;
    prog.set(bar, v);
    if(p == null || v <= p) return;
    const track = bar.parentElement || bar, r = rectOf(track), c = palette(bar), x = r.left + r.width * Math.min(1, v), y = r.top + r.height / 2;
    setTimeout(() => sparks(x, y, { n: 3, angle: -Math.PI / 2 - .4, spread: 1.4, speed: .2, size: 3, colors: c }), 200);
    if(v >= 1 && p < 1) setTimeout(() => {
      const rr = rectOf(track);
      burst(rr.right, y, { r0: 6, r: 38, spikes: 12, colors: c });
      check(rr.right, y - 26, { size: 18, colors: c, delay: 80 });
      word(rr.right - 30, rr.top - 22, wordFor(bar.closest('.a-progress') || bar, '完成！'), { size: 18, colors: c, delay: 60 });
    }, 420);
  }

  doc.addEventListener('change', e => {
    const t = e.target; if(!t || !t.matches || !active(t)) return;
    if(t.matches('.a-switch input')) onSwitch(t);
    else if(t.matches('.a-rating input')) onRating(t);
    else if(t.matches('.a-check input[type=checkbox]')) onCheck(t);
    else if(t.matches('.a-check input[type=radio]') && t.checked) onRadio(t);
    else if(t.matches('.a-slider')) onSlideEnd(t);
  });
  const TYPING = /^(insert|delete)/;
  doc.addEventListener('input', e => {
    const t = e.target; if(!t || !t.matches || !active(t)) return;
    if(t.matches('.a-slider')) onSlide(t);
    else if(t.matches('textarea, input.a-input, .a-input input, .a-otp input') && (!e.inputType || TYPING.test(e.inputType))) onType(t);
  });
  const tabEvent = e => {
    const tab = e.target && e.target.closest && e.target.closest('[role=tab]'), list = tab && tab.closest('[role=tablist]');
    if(!list || !list.closest('.a-tabs') || !active(list)) return;
    if(!tabsSeen.has(list)) tabsSeen.set(list, list.querySelector('[role=tab][aria-selected="true"]'));
    setTimeout(() => checkTabs(list), 0);
  };
  doc.addEventListener('pointerdown', e => { const l = e.target.closest && e.target.closest('[role=tablist]'); l && !tabsSeen.has(l) && tabsSeen.set(l, l.querySelector('[role=tab][aria-selected="true"]')); }, true);
  doc.addEventListener('click', tabEvent);
  doc.addEventListener('keydown', tabEvent);

  if(window.MutationObserver) new MutationObserver(ms => {
    if(reduce()) return;
    for(const m of ms){
      if(m.type === 'attributes'){ const el = m.target; if(el.classList && el.classList.contains('a-progress__bar') && active(el)) onProgress(el); continue; }
      m.addedNodes.forEach(n => { if(n.nodeType === 1 && n.matches('.a-toast, .a-notice') && active(n)) onToast(n); });
    }
  }).observe(doc.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['style'] });

  /* ---------- 對外 API ---------- */
  window.AUIFX = {
    version: '0.1.0',
    enable(root){ (root || doc.documentElement).setAttribute('data-fx', ''); },
    disable(root){ (root || doc.documentElement).setAttribute('data-fx', 'off'); },
    isOn: active,
    impact(el){ el && !reduce() && (el.classList.contains('a-btn') ? impact(el) : (() => { const r = rectOf(el), [x, y] = center(r), r0 = Math.hypot(r.width, r.height) / 2 + 4; burst(x, y, { r0, r: r0 + 30, el }); release(el, true); })()); },
    done,
    spring,
    burst, wedges, puff, sparks, ring, crescent, word, check
  };
})();
