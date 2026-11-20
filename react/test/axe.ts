import axe from 'axe-core';
import { expect } from 'vitest';

/** 跑 axe，只要有 serious／critical 等級的問題就失敗，並把問題列出來 */
export async function expectNoSeriousA11y(container: Element) {
  const res = await axe.run(container, {
    // jsdom 沒有版面與顏色計算，對比檢查只會誤報；對比在瀏覽器端另外檢查
    rules: { 'color-contrast': { enabled: false } },
  });
  const bad = res.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
  expect(bad.map(v => `${v.id}: ${v.help} → ${v.nodes.map(n => n.target.join(' ')).join(', ')}`)).toEqual([]);
}
