import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider } from '../src';
import { getFx, fxDone, fxImpact } from '../src/fx';

describe('fx', () => {
  it('載入後提供 window.AUIFX，輔助函式不會丟錯', () => {
    expect(getFx()).toBeDefined();
    const b = document.createElement('button');
    expect(() => { fxDone(null); fxImpact(undefined); fxDone(b); }).not.toThrow();
  });
  it('ThemeProvider 的 fx 對應 data-fx', () => {
    const { container } = render(<><ThemeProvider fx>a</ThemeProvider><ThemeProvider fx={false}>b</ThemeProvider><ThemeProvider>c</ThemeProvider></>);
    const [on, off, none] = [...container.children];
    expect(on.getAttribute('data-fx')).toBe('');
    expect(off.getAttribute('data-fx')).toBe('off');
    expect(none.hasAttribute('data-fx')).toBe(false);
  });
});
