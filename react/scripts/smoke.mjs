// SSR 冒煙測試：從 dist 載入每個元件，renderToString，攔截 console.error
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import * as UI from '../dist/index.js';

const errors = [];
const orig = console.error;
console.error = (...a) => { errors.push(a.map(String).join(' ')); };
const h = React.createElement;

/** 每個元件一個範例；其他 fork 的元件只要求可以用最少 props 渲染 */
const cases = {
  Button: h(UI.Button, { variant: 'primary', loading: true }, '送出'),
  Divider: h(UI.Divider, null, '或'),
  FloatButton: h(UI.FloatButton, { extended: true, icon: '+' }, '新增'),
  BackTop: h(UI.BackTop),
  ThemeProvider: h(UI.ThemeProvider, { theme: 'riso', mode: 'dark' }, 'x'),
  Tabs: h(UI.Tabs, { items: [{ key: 'a', label: 'A', children: 'pa' }, { key: 'b', label: 'B', children: 'pb' }] }),
  Pagination: h(UI.Pagination, { total: 20, defaultCurrent: 10 }),
  Dropdown: h(UI.Dropdown, { trigger: h(UI.Button, null, '更多'), items: [{ key: 'e', label: '編輯' }, { key: 's', divider: true }, { key: 'd', label: '刪除', danger: true }] }),
  Breadcrumb: h(UI.Breadcrumb, { items: [{ label: '首頁', href: '/' }, { label: '元件' }] }),
  Steps: h(UI.Steps, { current: 1, items: [{ title: '一' }, { title: '二', description: 'd' }, { title: '三' }] }),
  Menu: h(UI.Menu, { defaultActiveKey: 'b', items: [{ key: 'g', type: 'group', label: '組' }, { key: 'a', label: 'A', href: '#a', badge: 3 }, { key: 'p', label: 'P', children: [{ key: 'b', label: 'B' }] }] }),
  CommandPalette: h(UI.CommandPalette, { groups: [{ label: '頁面', items: [{ key: 'h', label: '首頁', shortcut: 'G H' }] }] }),
  ContextMenu: h(UI.ContextMenu, { items: [{ key: 'c', label: '複製', shortcut: '⌘C' }] }, '右鍵'),
  Modal: h(UI.Modal, { open: false, onClose() {}, title: '標題', footer: 'f' }, '內容'),
  Drawer: h(UI.Drawer, { open: false, onClose() {}, title: '設定' }, '內容'),
  Toaster: h(UI.Toaster),
  Alert: h(UI.Alert, { type: 'warning', title: '注意' }, '內容'),
  Progress: h(UI.Progress, { value: 42 }),
  ProgressIndeterminate: h(UI.Progress, { indeterminate: true }),
  Skeleton: h(UI.SkeletonGroup, null, h(UI.Skeleton, { variant: 'title' }), h(UI.Skeleton)),
  Spinner: h(UI.Spinner, { size: 'lg' }),
  Popover: h(UI.Popover, { content: '內容', title: 'T' }, h(UI.Button, null, '開')),
  Result: h(UI.Result, { status: 'error', title: '失敗', description: 'd', actions: h(UI.Button, null, '重試') }),
  Banner: h(UI.Banner, { tag: '新', color: 'coral' }, '公告')
};

let fail = 0;
for (const [name, el] of Object.entries(cases)) {
  const before = errors.length;
  try {
    const html = renderToString(el);
    const errs = errors.slice(before);
    if (errs.length || (!html && name !== 'Toaster')) { fail++; orig('✗', name, errs.join('\n  ') || 'empty'); }
    else console.log('✓', name.padEnd(22), html.length + 'b');
  } catch (e) { fail++; orig('✗', name, e.message); }
}
// toast()/notify() 在 server 端呼叫也不能拋錯
UI.toast('hi'); UI.notify({ title: 't', duration: 0 });
console.log('\nexports:', Object.keys(UI).length, '| failed:', fail);
console.error = orig;
process.exit(fail ? 1 : 0);
