/* 每個 demo：DEMOS[key](stage) 建立內容，回傳 [自動播放函式, 間隔毫秒]。 */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function onVisible(node, fn){
  if(!('IntersectionObserver' in window)) return fn();
  const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ fn(); io.disconnect(); } }), {threshold:.4});
  io.observe(node);
}
/* 簡易彈簧積分 */
function spring(from, to, v0, onUpdate, {k=260, c=24, m=1} = {}){
  let x = from, v = v0, last = performance.now(), id;
  const step = t => {
    const dt = Math.min(.032, (t - last) / 1000); last = t;
    const a = (-k * (x - to) - c * v) / m; v += a * dt; x += v * dt; onUpdate(x);
    if(Math.abs(v) < .5 && Math.abs(x - to) < .5){ onUpdate(to); return; }
    id = requestAnimationFrame(step);
  };
  id = requestAnimationFrame(step);
  return () => cancelAnimationFrame(id);
}
/* 依序替節點加上 class，回傳可重播的函式 */
function staggerer(nodes, cls='in', gap=120, start=200){
  let timers = [];
  const play = () => {
    timers.forEach(clearTimeout); timers = [];
    if(reduce){ nodes.forEach(n => n.classList.add(cls)); return; }
    const wasOn = nodes.some(n => n.classList.contains(cls));
    nodes.forEach(n => n.classList.remove(cls));
    const delay = wasOn ? start + 350 : start;
    nodes.forEach((n, i) => timers.push(setTimeout(() => n.classList.add(cls), delay + i * gap)));
  };
  if(reduce) play();
  return play;
}
function typer(el, speed=45){
  let tid;
  return (text, done) => {
    clearInterval(tid);
    if(reduce){ el.textContent = text; done && done(); return; }
    let i = 0; el.textContent = '';
    tid = setInterval(() => { el.textContent = text.slice(0, ++i); if(i >= text.length){ clearInterval(tid); done && done(); } }, speed);
  };
}
const raf2 = fn => requestAnimationFrame(() => requestAnimationFrame(fn));

window.DEMOS = {
  /* ---------- 動畫與動效 ---------- */
  pop(st){
    st.innerHTML = `<div class="d-pop"><button class="btn">選項 ▾</button>
      <div class="menu panel"><div>複製連結</div><div>重新命名</div><div>移到資料夾</div></div></div>`;
    const w = st.querySelector('.d-pop');
    w.querySelector('.btn').onclick = () => w.classList.toggle('open');
    return [() => w.classList.toggle('open'), 1600];
  },
  sheet(st){
    st.innerHTML = `<div class="phone"><div class="notch"></div><div class="row"></div><div class="row" style="width:60%"></div><div class="row"></div>
      <div class="sheet"><span>拖曳我</span></div></div>`;
    const sh = st.querySelector('.sheet');
    let y = 0, startY = 0, startPos = 0, lastY = 0, lastT = 0, vel = 0, stop = null, max = 0, down = false;
    const set = v => { y = v; sh.style.transform = `translateY(${v}px)`; };
    sh.addEventListener('pointerdown', e => {
      stop && stop(); max = sh.offsetHeight - 34; sh.setPointerCapture(e.pointerId);
      startY = lastY = e.clientY; startPos = y; lastT = performance.now(); vel = 0; sh.style.cursor = 'grabbing';
    });
    sh.addEventListener('pointermove', e => {
      if(!sh.hasPointerCapture(e.pointerId)) return;
      const now = performance.now(); vel = (e.clientY - lastY) / Math.max(1, now - lastT) * 1000; lastY = e.clientY; lastT = now;
      const v = startPos + e.clientY - startY; set(v < 0 ? v * .3 : v);
    });
    sh.addEventListener('pointerup', () => {
      sh.style.cursor = 'grab';
      const target = y + vel * .2 > max / 2 ? max : 0; down = target > 0;
      stop = spring(y, target, vel, set, {k:300, c:28});
    });
    return [() => { stop && stop(); max = sh.offsetHeight - 34; down = !down; stop = spring(y, down ? max : 0, down ? 900 : -900, set, {k:300, c:28}); }, 1800];
  },
  vocab(st){
    const terms = [['Pop in','popIn 420ms cubic-bezier(.23,1,.32,1)'],['Shake','shake 420ms ease'],['Pulse','pulse 600ms ease-in-out'],['Flip','flip 500ms cubic-bezier(.77,0,.175,1)'],['Squash & stretch','squash 520ms ease']];
    st.innerHTML = `<div class="d-vocab"><div class="box"></div><div class="terms">${terms.map((t,i) => `<button data-i="${i}">${t[0]}</button>`).join('')}</div></div>`;
    const box = st.querySelector('.box'), bs = [...st.querySelectorAll('.terms button')];
    bs.forEach(b => b.onclick = () => {
      bs.forEach(x => x.classList.toggle('on', x === b));
      box.style.animation = 'none'; box.offsetWidth; box.style.animation = terms[b.dataset.i][1];
    });
    let k = 0;
    return [() => bs[k++ % bs.length].click(), 1400];
  },
  rubber(st){
    st.innerHTML = `<div class="d-rubber"><div class="puck"></div></div>`;
    const area = st.querySelector('.d-rubber'), p = st.querySelector('.puck');
    let x=0, y=0, sx=0, sy=0, ox=0, oy=0, vx=0, vy=0, lx=0, ly=0, lt=0, stops=[], dir=0;
    const render = () => p.style.transform = `translate(${x}px,${y}px)`;
    const band = (d, lim) => { const over = Math.abs(d) - lim; if(over <= 0) return d; return Math.sign(d) * (lim + (1 - 1 / (over * .55 / lim + 1)) * lim); };
    const lims = () => [area.clientWidth / 2 - 32, area.clientHeight / 2 - 32];
    p.addEventListener('pointerdown', e => { stops.forEach(f => f()); p.setPointerCapture(e.pointerId); sx = lx = e.clientX; sy = ly = e.clientY; ox = x; oy = y; lt = performance.now(); vx = vy = 0; p.style.cursor = 'grabbing'; });
    p.addEventListener('pointermove', e => {
      if(!p.hasPointerCapture(e.pointerId)) return;
      const [limX, limY] = lims(), now = performance.now(), dt = Math.max(1, now - lt);
      vx = (e.clientX - lx) / dt * 1000; vy = (e.clientY - ly) / dt * 1000; lx = e.clientX; ly = e.clientY; lt = now;
      x = band(ox + e.clientX - sx, limX); y = band(oy + e.clientY - sy, limY); render();
    });
    p.addEventListener('pointerup', () => {
      p.style.cursor = 'grab';
      const [limX, limY] = lims();
      const tx = Math.max(-limX, Math.min(limX, x + vx * .15)), ty = Math.max(-limY, Math.min(limY, y + vy * .15));
      stops = [spring(x, tx, vx, v => { x = v; render(); }, {k:220, c:22}), spring(y, ty, vy, v => { y = v; render(); }, {k:220, c:22})];
    });
    return [() => {
      stops.forEach(f => f());
      const [limX, limY] = lims(), ang = [[1,0],[0,1],[-1,0],[0,-1],[1,1]][dir++ % 5];
      const t0 = performance.now(), fx = x, fy = y, gx = band(ang[0] * limX * 1.9, limX), gy = band(ang[1] * limY * 1.9, limY);
      const drag = t => {
        const k = Math.min(1, (t - t0) / 650), e = 1 - Math.pow(1 - k, 3);
        x = fx + (gx - fx) * e; y = fy + (gy - fy) * e; render();
        if(k < 1) requestAnimationFrame(drag);
        else setTimeout(() => { stops = [spring(x, 0, 0, v => { x = v; render(); }, {k:220, c:18}), spring(y, 0, 0, v => { y = v; render(); }, {k:220, c:18})]; }, 250);
      };
      requestAnimationFrame(drag);
    }, 2600];
  },
  race(st){
    st.innerHTML = `<div class="d-race">
      <div class="lane"><span class="lbl">ease-in</span><div class="track"><div class="runner"></div></div></div>
      <div class="lane good"><span class="lbl">ease-out</span><div class="track"><div class="runner"></div></div></div>
      <button class="btn">開跑 ▶</button></div>`;
    const rs = st.querySelectorAll('.runner'), eases = ['cubic-bezier(.55,0,1,.45)', 'cubic-bezier(.23,1,.32,1)'];
    let out = false;
    const run = () => { out = !out; rs.forEach((r, i) => { const dist = r.parentElement.clientWidth - 30; r.style.transition = `transform 600ms ${eases[i]}`; r.style.transform = out ? `translateX(${dist}px)` : 'none'; }); };
    st.querySelector('.btn').onclick = run;
    return [run, 1400];
  },
  proto(st){
    const V = [`<button class="v-a">立即開始</button>`, `<button class="v-b">Get started →</button>`, `<div class="v-c"><i></i><div><b>立即開始</b><small>免費試用 14 天</small></div></div>`];
    st.innerHTML = `<div class="d-proto"><div class="variant"></div><div class="picker"><span class="pill"></span><button>A 圓潤</button><button>B 硬派</button><button>C 卡片</button></div></div>`;
    const vEl = st.querySelector('.variant'), bs = [...st.querySelectorAll('.picker button')], pill = st.querySelector('.pill');
    let cur = 0;
    const pick = i => { cur = i; vEl.innerHTML = V[i]; bs.forEach((b, j) => b.classList.toggle('on', i === j)); pill.style.width = bs[i].offsetWidth + 'px'; pill.style.transform = `translateX(${bs[i].offsetLeft - 3}px)`; };
    bs.forEach((b, i) => b.onclick = () => pick(i));
    requestAnimationFrame(() => pick(0));
    if(document.fonts) document.fonts.ready.then(() => pick(cur));
    return [() => pick((cur + 1) % 3), 1700];
  },

  /* ---------- 審查與改善 ---------- */
  gate(st){
    const c = [['鍵盤快捷鍵開啟面板','一天 100+ 次','n','拒絕'],['Toast 從同一側進出','空間一致','y','採用'],['首次完成的慶祝','少見・驚喜','y','採用'],['列表 hover 放大','高頻・只為好看','n','拒絕']];
    st.innerHTML = `<div class="d-gate">${c.map(x => `<div class="cand panel"><div>${x[0]}<small>${x[1]}</small></div><span class="verdict ${x[2]}">${x[3]}</span></div>`).join('')}</div>`;
    return [staggerer([...st.querySelectorAll('.cand')], 'in', 110), 3600];
  },
  audit(st){
    const rows = [['效能','#fc5454',.72,8],['緩動','#d08a1a',.5,5],['可及性','#246078',.38,4],['一致性','#a8c8d4',.24,2]];
    st.innerHTML = `<div class="d-audit panel"><h4>動畫稽核報告 <span>19 findings</span></h4>
      ${rows.map(r => `<div class="arow"><span>${r[0]}</span><div class="bar"><i style="--v:${r[2]};background:${r[1]}"></i></div><span class="n">${r[3]}</span></div>`).join('')}</div>`;
    const a = st.querySelector('.d-audit');
    if(reduce) a.classList.add('run');
    return [() => { if(a.classList.contains('run')){ a.classList.remove('run'); setTimeout(() => a.classList.add('run'), 500); } else a.classList.add('run'); }, 3200];
  },
  code(st){
    st.innerHTML = `<div class="d-code panel">
      <div class="ln">.dropdown {</div>
      <div class="ln del">-  transition: all 300ms ease-in;</div>
      <div class="ln del">-  transform: scale(0);</div>
      <div class="ln add">+  transition: transform 180ms var(--ease-out);</div>
      <div class="ln add">+  transform: scale(.95); opacity: 0;</div>
      <div class="ln">}</div>
      <div class="flag"><b>BLOCK</b>　UI 用 ease-in 會延遲使用者最注意的瞬間；也不要從 scale(0) 開始。</div></div>`;
    const c = st.querySelector('.d-code'), parts = [...c.querySelectorAll('.del,.add,.flag')];
    parts.forEach((el, i) => el.style.transitionDelay = (400 + i * 280) + 'ms');
    return [() => { c.classList.add('hide'); raf2(() => c.classList.remove('hide')); }, 4200];
  },
  redesign(st){
    st.innerHTML = `<div class="d-rd">
      <div class="rd before"><div class="rd-h">Welcome to Our Platform</div><div class="rd-p">The best solution for all your needs.</div><span class="rd-btn">Get Started</span></div>
      <div class="rd after"><div class="rd-p">AUDIT → FIX → UPGRADE</div><div class="rd-h">讓網站看起來<br>像被設計過</div><span class="rd-btn">開始升級 →</span></div>
      <div class="rd-line"></div></div>`;
    const w = st.querySelector('.d-rd');
    return [() => w.classList.toggle('on'), 2400];
  },
  critique(st){
    const notes = [['01 層級','標題字級太接近內文，層級不明顯'],['02 對比','按鈕跟內容距離太遠，視線斷掉'],['03 一致性','次要文字有兩種灰色']];
    st.innerHTML = `<div class="d-crit"><div class="mock panel"><div class="m-h"></div><div class="m-t"></div><div class="m-t s"></div><div class="m-t"></div><div class="m-b"></div></div>
      <span class="pin" style="left:14%;top:16%">1</span><span class="pin" style="left:30%;top:82%">2</span><span class="pin" style="left:58%;top:44%">3</span>
      <div class="note panel"><b></b><span></span></div></div>`;
    const pins = [...st.querySelectorAll('.pin')], note = st.querySelector('.note');
    let k = -1;
    const show = i => { pins.forEach((p, j) => { p.classList.add('in'); p.classList.toggle('on', j === i); }); note.querySelector('b').textContent = notes[i][0]; note.querySelector('span').textContent = notes[i][1]; };
    pins.forEach((p, i) => p.addEventListener('click', () => show(k = i)));
    show(0); k = 0;
    return [() => show(k = (k + 1) % 3), 1800];
  },
  contrast(st){
    const pairs = [['#a8c8d4','#ffffff'],['#fc5454','#ffffff'],['#246078','#ffffff'],['#ffffff','#173f50']];
    st.innerHTML = `<div class="d-con"><div class="con-sample">Aa 文字範例</div>
      <div class="con-row"><div>對比值<br><b>0.0:1</b></div><span class="badge"></span></div></div>`;
    const s = st.querySelector('.con-sample'), num = st.querySelector('.con-row b'), badge = st.querySelector('.badge');
    const lum = hex => { const c = [1,3,5].map(i => parseInt(hex.substr(i, 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4)); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
    const ratio = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x); return (l1 + .05) / (l2 + .05); };
    let k = 0, cur = 1, raf;
    const show = () => {
      const [fg, bg] = pairs[k++ % pairs.length], r = ratio(fg, bg);
      s.style.color = fg; s.style.background = bg;
      badge.className = 'badge ' + (r >= 4.5 ? 'pass' : r >= 3 ? 'mid' : 'fail');
      badge.textContent = r >= 4.5 ? 'AA 通過' : r >= 3 ? '僅限大字' : '未通過';
      cancelAnimationFrame(raf); const from = cur, t0 = performance.now();
      const tick = t => { const p = Math.min(1, (t - t0) / 600), e = 1 - Math.pow(1 - p, 3); cur = from + (r - from) * e; num.textContent = cur.toFixed(1) + ':1'; if(p < 1) raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    };
    show();
    return [show, 2000];
  },
  uxcopy(st){
    const P = [['提交','建立帳號','註冊表單的主按鈕'],['錯誤：操作失敗','密碼至少需要 8 個字元','密碼欄位的錯誤訊息'],['確定','刪除 3 個檔案','刪除確認對話框']];
    st.innerHTML = `<div class="d-ux"><div class="ux-card panel"><span class="ux-tag">BEFORE</span><div class="ux-txt before"></div><div class="ux-ctx"></div></div></div>`;
    const tag = st.querySelector('.ux-tag'), txt = st.querySelector('.ux-txt'), ctx = st.querySelector('.ux-ctx');
    let k = 0, after = false;
    const swap = (t, isAfter) => { txt.classList.add('out'); setTimeout(() => { txt.textContent = t; txt.classList.toggle('before', !isAfter); tag.textContent = isAfter ? 'AFTER' : 'BEFORE'; tag.classList.toggle('after', isAfter); txt.classList.remove('out'); }, 220); };
    txt.textContent = P[0][0]; ctx.textContent = P[0][2];
    return [() => {
      if(!after){ swap(P[k][1], true); after = true; }
      else { k = (k + 1) % P.length; ctx.textContent = P[k][2]; swap(P[k][0], false); after = false; }
    }, 1700];
  },

  /* ---------- AICDE 視覺風格：範例圖慢速推移 ---------- */
  visual(st, s){
    st.classList.add('st-img');
    st.innerHTML = `<img class="vis" src="${s.img}" alt="${s.title} 範例圖" loading="lazy" decoding="async">`;
    const img = st.querySelector('img'), moves = ['scale(1.08) translate(-2%,1%)','scale(1.08) translate(2%,-1%)','scale(1)'];
    let k = 0;
    return [() => { img.style.transform = moves[k++ % moves.length]; }, 4200];
  },

  /* ---------- 研究與交付 ---------- */
  interview(st){
    const L = [['q','最近一次訂餐是什麼時候？'],['a','昨天中午，在公司用手機點的。'],['q','當時遇到什麼麻煩嗎？'],['a','找不到上次點過的那家店…']];
    st.innerHTML = `<div class="d-chat">${L.map(([w, t]) => `<div class="bub ${w}">${t}</div>`).join('')}</div>`;
    return [staggerer([...st.querySelectorAll('.bub')], 'in', 450, 200), 4000];
  },
  synth(st){
    const N = [['找不到舊訂單',0],['想要再點一次',0],['運費看不懂',1],['結帳步驟太多',1],['優惠券用不了',1],['外送時間不準',2]];
    st.innerHTML = `<div class="d-syn"><div class="syn-h"><span>回訪需求</span><span>結帳摩擦</span><span>配送</span></div>${N.map(([t, g]) => `<div class="stk g${g}">${t}</div>`).join('')}</div>`;
    const w = st.querySelector('.d-syn'), ns = [...w.querySelectorAll('.stk')];
    const scatter = [[8,20,-6],[62,62,5],[34,8,3],[70,22,-4],[14,66,6],[40,46,-3]];
    const place = grouped => {
      const W = w.clientWidth, H = w.clientHeight, cnt = [0,0,0];
      w.classList.toggle('grouped', grouped);
      ns.forEach((n, i) => {
        if(grouped){ const g = N[i][1], k = cnt[g]++; n.style.transform = `translate(${g * W / 3 + 6}px,${30 + k * 34}px)`; }
        else { const [x, y, r] = scatter[i]; n.style.transform = `translate(${x / 100 * W * .78}px,${y / 100 * H}px) rotate(${r}deg)`; }
      });
    };
    let g = false;
    requestAnimationFrame(() => place(false));
    if(reduce) requestAnimationFrame(() => place(true));
    return [() => place(g = !g), 2200];
  },
  tokens(st){
    const R = [['#173f51','--navy'],['15px','--sp-4'],['#fd5555','--coral'],['11px','--r-md']];
    st.innerHTML = `<div class="d-tok panel">${R.map(([a, b]) => `<div class="tok"><code class="raw">${a}</code><span class="arr">→</span><code class="tk">var(${b})</code><span class="ck">✓</span></div>`).join('')}
      <div class="cov"><span>Token 覆蓋率</span><b>62%</b></div><div class="cov-bar"><i></i></div></div>`;
    const rows = [...st.querySelectorAll('.tok')], b = st.querySelector('.cov b'), bar = st.querySelector('.cov-bar i');
    let timers = [];
    const set = pct => { b.textContent = pct + '%'; bar.style.transform = `scaleX(${pct / 100})`; };
    set(62);
    return [() => {
      timers.forEach(clearTimeout); timers = [];
      rows.forEach(r => r.classList.remove('fixed')); set(62);
      rows.forEach((r, i) => timers.push(setTimeout(() => { r.classList.add('fixed'); set(62 + (i + 1) * 9); }, 500 + i * 450)));
    }, 4000];
  },
  handoff(st){
    st.innerHTML = `<div class="d-hand"><div class="hcomp"><div class="hav"></div><div class="htx"><i></i><i class="s"></i></div><div class="hbtn">追蹤</div></div>
      <div class="rl rl-pad"><span>16</span></div><div class="rl rl-gap"><span>12</span></div><div class="rl rl-h"><span>72</span></div>
      <div class="rtag t1">radius 12 · --r-md</div><div class="rtag t2">button / primary / hover</div></div>`;
    return [staggerer([...st.querySelectorAll('.rl,.rtag')], 'in', 300, 300), 3800];
  },

  /* ---------- 視覺風格 ---------- */
  dials(st){
    st.innerHTML = `<div class="d-dials"><div class="dial-list">${['VARIANCE','MOTION','DENSITY'].map(n => `<div class="dial"><span>${n}</span><div class="dtrack"><i></i></div><b>5</b></div>`).join('')}</div>
      <div class="dprev"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>`;
    const ds = [...st.querySelectorAll('.dial')], prev = st.querySelector('.dprev');
    const presets = [[8,6,4],[2,3,2],[5,8,9]];
    let k = 0;
    const set = vals => {
      vals.forEach((v, i) => { ds[i].querySelector('i').style.transform = `scaleX(${v / 10})`; ds[i].querySelector('b').textContent = v; });
      const [v, , d] = vals;
      prev.dataset.v = v > 6 ? 'hi' : 'lo';
      prev.style.gap = (d > 6 ? 4 : d < 4 ? 12 : 8) + 'px';
      prev.style.setProperty('--n', d > 6 ? 3 : 2);
    };
    set(presets[0]);
    return [() => set(presets[++k % presets.length]), 2200];
  },
  soft(st){
    st.innerHTML = `<div class="d-soft"><div class="bezel"><div class="core"><div class="sk1"></div><div class="sk2"></div><button class="pillbtn">開始使用<span class="ico">→</span></button></div></div></div>`;
    const b = st.querySelector('.d-soft');
    return [() => b.classList.toggle('lift'), 1600];
  },
  minimal(st){
    st.innerHTML = `<div class="d-min"><div class="t t1"><em>Less,</em>but better.</div><div class="t t2"></div><div class="t t3">01 / 04</div></div>`;
    return [staggerer([...st.querySelectorAll('.t')], 'in', 160), 3600];
  },
  brutal(st){
    st.innerHTML = `<div class="d-brut"><div class="bhead"><span>FILE_047</span><span>CLASSIFIED</span></div><div class="bnum">047</div><div class="btype"><span></span><i>█</i></div></div>`;
    const type = typer(st.querySelector('.btype span'), 45), words = ['STATUS: DECLASSIFIED','GRID: 12COL / RIGID','TYPE: SWISS × TERMINAL'];
    let k = 0;
    return [() => type(words[k++ % words.length]), 2600];
  },
  stack(st){
    const c = ['Attention','Interest','Desire','Action'];
    st.innerHTML = `<div class="d-stack">${c.map((t, i) => `<div class="sc"><b>0${i + 1}</b>${t}</div>`).join('')}</div>`;
    const cs = [...st.querySelectorAll('.sc')];
    let k = 0;
    const step = () => {
      k = k % cs.length + 1;
      cs.forEach((c, i) => {
        const depth = k - 1 - i;
        if(depth < 0){ c.style.transform = 'translateY(130%)'; c.style.opacity = 0; }
        else { c.style.transform = `translateY(${-depth * 10}px) scale(${1 - depth * .05})`; c.style.opacity = 1; }
      });
    };
    step();
    return [step, 1100];
  },
  designmd(st){
    const L = [['h','# DESIGN.md'],['k','## Color'],['sw',''],['k','## Typography'],['t','Display · Poppins 600'],['k','## Motion'],['t','ease-out · 200ms']];
    st.innerHTML = `<div class="d-md panel">${L.map(([c, t]) => c === 'sw'
      ? `<div class="md-l sw"><i style="background:#173f50"></i><i style="background:#fc5454"></i><i style="background:#246078"></i><i style="background:#a8c8d4"></i></div>`
      : `<div class="md-l ${c}">${t}</div>`).join('')}</div>`;
    return [staggerer([...st.querySelectorAll('.md-l')], 'in', 160), 3800];
  },

  /* ---------- 圖像生成 ---------- */
  slices(st){
    st.innerHTML = `<div class="d-slices">${['Hero','Features','Proof','CTA'].map(n => `<div class="sl"><span>${n}</span></div>`).join('')}</div>`;
    const w = st.querySelector('.d-slices'), s = [...w.querySelectorAll('.sl')];
    let timers = [];
    const run = () => {
      timers.forEach(clearTimeout); timers = [];
      if(reduce){ s.forEach(x => x.classList.add('done')); return; }
      w.classList.add('reset'); s.forEach(x => x.classList.remove('done'));
      raf2(() => { w.classList.remove('reset'); s.forEach((x, i) => timers.push(setTimeout(() => x.classList.add('done'), 300 + i * 450))); });
    };
    if(reduce) run();
    return [run, 3600];
  },
  phones(st){
    st.innerHTML = `<div class="d-phones">${[0,1,2].map(() => `<div class="mp"><div class="mp-hero"></div><div class="mp-l"></div><div class="mp-l s"></div><div class="mp-row"><i></i><i></i></div></div>`).join('')}</div>`;
    const ps = [...st.querySelectorAll('.mp')];
    let k = 0;
    const lay = () => ps.forEach((p, i) => p.dataset.pos = ((i - k) % 3 + 3) % 3);
    lay();
    return [() => { k++; lay(); }, 1800];
  },
  img2code(st){
    st.innerHTML = `<div class="d-i2c"><div class="i2c-img"><i class="a"></i><i class="b"></i><i class="c"></i><div class="scan"></div></div><div class="i2c-arrow">→</div>
      <div class="i2c-code">${['<header>','  <h1/>','</header>','<section>','  <Card/>','</section>'].map(l => `<div></div>`).join('')}</div></div>`;
    const lines = [...st.querySelectorAll('.i2c-code div')];
    ['<header>','  <h1/>','</header>','<section>','  <Card/>','</section>'].forEach((t, i) => lines[i].textContent = t);
    const w = st.querySelector('.d-i2c'), play = staggerer(lines, 'in', 200, 400);
    return [() => { w.classList.remove('go'); raf2(() => w.classList.add('go')); play(); }, 3600];
  },
  brand(st){
    st.innerHTML = `<svg class="d-brand" viewBox="0 0 200 140" aria-hidden="true">
      <g class="guides"><circle cx="100" cy="70" r="50"/><circle cx="100" cy="70" r="30"/><line x1="36" y1="70" x2="164" y2="70"/><line x1="100" y1="10" x2="100" y2="130"/><line x1="55" y1="25" x2="145" y2="115"/></g>
      <path class="mark" d="M70 106 L100 34 L130 106 M83 80 H117"/><circle class="dot" cx="140" cy="106" r="7"/></svg>`;
    const svg = st.querySelector('svg');
    if(reduce) svg.classList.add('go');
    return [() => { svg.classList.remove('go'); raf2(() => svg.classList.add('go')); }, 3800];
  },
  aigen(st){
    st.innerHTML = `<div class="d-gen"><div class="gen-prompt"><span></span><i>|</i></div><div class="gen-img"><div class="sun"></div><div class="hill h1"></div><div class="hill h2"></div></div></div>`;
    const img = st.querySelector('.gen-img'), type = typer(st.querySelector('.gen-prompt span'), 60);
    return [() => {
      img.classList.add('reset'); img.classList.remove('done');
      raf2(() => { img.classList.remove('reset'); type('夕陽下的山丘，暖色調，寬幅 banner', () => setTimeout(() => img.classList.add('done'), 200)); });
    }, 4400];
  },
  icons(st){
    const I = [
      '<path d="M4 11 12 4l8 7v9H4z"/><rect class="c" x="10" y="14" width="4" height="6"/>',
      '<circle cx="11" cy="11" r="6"/><path class="cs" d="m16 16 4 4"/>',
      '<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
      '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><circle class="c" cx="12" cy="21" r="1.6"/>',
      '<path d="M4 5h16v11H9l-5 4z"/><circle class="c" cx="9" cy="10.5" r="1.2"/><circle class="c" cx="13" cy="10.5" r="1.2"/>',
      '<path d="M4 20V4M4 20h16"/><path class="cs" d="m7 15 4-4 3 3 5-6"/>',
      '<path d="M12 20s-8-4.5-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.5-8 10-8 10z"/>',
      '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect class="c" x="13" y="13" width="7" height="7" rx="1.5"/>'
    ];
    st.innerHTML = `<div class="d-icons">${I.map(p => `<div class="ic"><svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg></div>`).join('')}</div>`;
    return [staggerer([...st.querySelectorAll('.ic')], 'in', 70), 3200];
  },

  /* ---------- 開發工具 ---------- */
  showroom(st){
    st.innerHTML = `<div class="d-browser panel"><div class="bar"><i></i><i></i><i></i><span>showroom / case-07</span></div>
      <div class="vp"><div class="page"><div class="ph"><b>Expensive<br>by design.</b><span></span></div><div class="pg"><i></i><i></i><i></i></div><div class="pb"></div><div class="pg"><i></i><i></i><i></i></div></div></div></div>`;
    const pg = st.querySelector('.page');
    let down = false;
    return [() => { down = !down; pg.style.transform = down ? 'translateY(-52%)' : 'none'; }, 2400];
  },
  picklib(st){
    const Q = [['數字動畫','NumberFlow'],['⌘K 指令選單','cmdk'],['拖放排序','dnd kit'],['驗證碼輸入','input-otp'],['即時串流圖表','Liveline']];
    st.innerHTML = `<div class="d-lib panel"><div class="lib-q"><span class="ic0">⌕</span><span class="q"></span><span class="cur"></span></div>
      <div class="lib-r">${Q.slice(0, 3).map(() => `<div class="lib-row"><span></span><b></b></div>`).join('')}</div></div>`;
    const type = typer(st.querySelector('.q'), 90), rows = [...st.querySelectorAll('.lib-row')];
    let k = 0;
    return [() => {
      const start = k++ % Q.length;
      rows.forEach(r => r.classList.remove('in', 'hit'));
      type(Q[start][0], () => rows.forEach((r, i) => {
        const [need, lib] = Q[(start + i) % Q.length];
        r.querySelector('span').textContent = need; r.querySelector('b').textContent = lib;
        setTimeout(() => { r.classList.add('in'); if(i === 0) r.classList.add('hit'); }, reduce ? 0 : 120 + i * 90);
      }));
    }, 2800];
  },
  toast(st){
    st.innerHTML = `<div class="d-toast"><button class="btn">送出通知</button><div class="toaster"></div></div>`;
    const tr = st.querySelector('.toaster'), msgs = [['已儲存變更','#1f9d6b'],['檔案上傳中…','#246078'],['連線失敗，請重試','#fc5454'],['已複製連結','#1f9d6b']];
    let n = 0, list = [];
    const layout = () => list.forEach((t, i) => { const d = list.length - 1 - i; t.style.transform = `translateY(${-d * 10}px) scale(${1 - d * .05})`; t.style.opacity = d > 2 ? 0 : 1; t.style.zIndex = 100 - d; });
    const b = st.querySelector('.btn');
    b.onclick = () => {
      const m = msgs[n++ % msgs.length], t = document.createElement('div');
      t.className = 'toast panel'; t.innerHTML = `<span class="dot" style="background:${m[1]}"></span>${m[0]}`;
      t.style.transform = 'translateY(40px) scale(.95)'; t.style.opacity = 0; tr.appendChild(t); list.push(t);
      t.offsetWidth; layout();
      setTimeout(() => { t.style.opacity = 0; t.style.transform += ' translateY(16px)'; setTimeout(() => { t.remove(); list = list.filter(x => x !== t); layout(); }, 400); }, 3200);
      if(list.length > 4){ list.shift().remove(); }
    };
    return [() => b.click(), 1100];
  },
  resp(st){
    st.innerHTML = `<div class="d-resp"><div class="rs"><div class="rs-grid"><i></i><i></i><i></i><i></i></div></div><div class="rs-lbl">viewport <b>1280px</b></div></div>`;
    const w = st.querySelector('.d-resp'), lbl = st.querySelector('.rs-lbl b');
    return [() => { const m = w.classList.toggle('mob'); lbl.textContent = m ? '390px' : '1280px'; }, 2200];
  },
  pw(st){
    st.innerHTML = `<div class="d-pw"><div class="pw-view panel"><i></i><i></i><button class="pw-btn">登入</button><div class="cursor"></div></div>
      <div class="pw-log mono"><div>goto('/login')</div><div>fill('#email')</div><div>click('登入')</div><div class="ok">✓ 跳轉 /dashboard</div></div></div>`;
    const cur = st.querySelector('.cursor'), btn = st.querySelector('.pw-btn'), view = st.querySelector('.pw-view'), logs = [...st.querySelectorAll('.pw-log div')];
    let timers = [];
    return [() => {
      timers.forEach(clearTimeout); timers = [];
      logs.forEach(l => l.classList.remove('in')); cur.style.transform = 'none';
      const T = (fn, ms) => timers.push(setTimeout(fn, ms));
      T(() => logs[0].classList.add('in'), 300);
      T(() => { logs[1].classList.add('in'); cur.style.transform = `translate(${view.clientWidth * .45}px,${view.clientHeight * .14}px)`; }, 800);
      T(() => { logs[2].classList.add('in'); const bx = btn.offsetLeft + btn.offsetWidth / 2 - view.clientWidth * .12, by = btn.offsetTop + 6 - view.clientHeight * .12; cur.style.transform = `translate(${bx}px,${by}px)`; }, 1500);
      T(() => btn.classList.add('press'), 2200);
      T(() => { btn.classList.remove('press'); logs[3].classList.add('in'); }, 2350);
    }, 4000];
  }
};
