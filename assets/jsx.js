/* 把元件範例的 HTML 轉成 React（JSX）寫法 */
(() => {
  const VOID = new Set(['input', 'img', 'br', 'hr', 'meta', 'link', 'source', 'col', 'area', 'wbr']);
  const RENAME = {
    class: 'className', for: 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength',
    minlength: 'minLength', autocomplete: 'autoComplete', autofocus: 'autoFocus', inputmode: 'inputMode',
    colspan: 'colSpan', rowspan: 'rowSpan', popovertarget: 'popoverTarget', popovertargetaction: 'popoverTargetAction',
    viewbox: 'viewBox', enctype: 'encType', crossorigin: 'crossOrigin', srcset: 'srcSet', novalidate: 'noValidate'
  };
  const camel = s => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const q = s => "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";

  function styleObj(css){
    const parts = css.split(';').map(x => x.trim()).filter(Boolean).map(d => {
      const k = d.indexOf(':'), prop = d.slice(0, k).trim(), val = d.slice(k + 1).trim();
      return (prop.startsWith('--') ? q(prop) : camel(prop)) + ': ' + q(val);
    });
    return '{{ ' + parts.join(', ') + ' }}';
  }

  function attrs(tag, raw){
    const out = [], re = /([^\s=/]+)(?:\s*=\s*"([^"]*)")?/g; let m;
    while((m = re.exec(raw))){
      let [, name, val] = m; const lower = name.toLowerCase();
      if(lower.startsWith('on')){
        const body = (val || '').replace(/\bAUI\./g, 'window.AUI.').replace(/&quot;/g, '"');
        out.push('on' + lower[2].toUpperCase() + lower.slice(3) + '={() => ' + body + '}');
        continue;
      }
      if(lower === 'style'){ out.push('style=' + styleObj(val || '')); continue; }
      if(lower === 'checked' && val === undefined){ out.push('defaultChecked'); continue; }
      if(lower === 'popover' && !val){ out.push('popover="auto"'); continue; }   // React 需要字串值
      if(lower === 'value' && (tag === 'input' || tag === 'textarea' || tag === 'select')){ out.push('defaultValue=' + JSON.stringify(val || '')); continue; }
      let key = RENAME[lower] || name;
      if(!key.startsWith('aria-') && !key.startsWith('data-') && key.includes('-')) key = camel(key);   // stroke-width → strokeWidth
      out.push(val === undefined ? key : key + '=' + JSON.stringify(val));
    }
    return out.length ? ' ' + out.join(' ') : '';
  }

  function convert(html){
    let s = html.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');
    // 先處理文字裡的大括號，再轉標籤（標籤內的屬性另外處理）
    s = s.replace(/(^|>)([^<]*)/g, (all, gt, text) => gt + text.replace(/[{}]/g, ch => "{'" + ch + "'}"));
    s = s.replace(/<([a-zA-Z][\w-]*)((?:[^>"]|"[^"]*")*?)(\/?)>/g, (all, tag, raw, self) => {
      const t = tag.toLowerCase();
      return '<' + tag + attrs(t, raw) + (VOID.has(t) || self ? ' />' : '>');
    });
    // textarea 裡的文字改成 defaultValue
    s = s.replace(/<textarea([^>]*)>([^<]+)<\/textarea>/g, (all, a, text) => '<textarea' + a + ' defaultValue=' + JSON.stringify(text) + ' />');
    return s;
  }

  function topLevelCount(html){
    const t = document.createElement('template'); t.innerHTML = html;
    return [...t.content.childNodes].filter(n => n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim())).length;
  }

  const indent = (s, n) => s.split('\n').map(l => l ? ' '.repeat(n) + l : l).join('\n');

  window.toJSX = function(html, comp){
    const name = (comp && comp.en ? comp.en.replace(/[^A-Za-z]/g, '') : 'Demo') + 'Demo';
    const body = convert(html.trim());
    const multi = topLevelCount(html) > 1;
    if(comp && comp.js){
      return "import { useEffect, useRef } from 'react';\n\n" +
        'export default function ' + name + '() {\n' +
        '  const ref = useRef(null);\n' +
        '  // aicde-ui.js 用事件委派處理互動；需要初始化的元件（標籤頁、分頁、日曆…）在掛載後呼叫一次\n' +
        '  useEffect(() => { window.AUI?.init(ref.current); }, []);\n\n' +
        '  return (\n    <div ref={ref}>\n' + indent(body, 6) + '\n    </div>\n  );\n}\n';
    }
    const inner = multi ? '    <>\n' + indent(body, 6) + '\n    </>' : indent(body, 4);
    return 'export default function ' + name + '() {\n  return (\n' + inner + '\n  );\n}\n';
  };
})();
