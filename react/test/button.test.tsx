import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../src';
import { expectNoSeriousA11y } from './axe';

describe('Button', () => {
  it('滑鼠、Enter、Space 都會觸發', async () => {
    const onClick = vi.fn();
    render(<Button variant="primary" onClick={onClick}>儲存</Button>);
    const btn = screen.getByRole('button', { name: '儲存' });
    await userEvent.click(btn);
    btn.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('載入中：保留焦點與名稱，aria-busy／aria-disabled，點擊與鍵盤都不觸發', async () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>送出</Button>);
    const btn = screen.getByRole('button', { name: '送出' });
    btn.focus();
    rerender(<Button onClick={onClick} loading>送出</Button>);
    expect(document.activeElement).toBe(btn);
    expect(btn).toHaveProperty('disabled', false);
    expect(btn.getAttribute('aria-busy')).toBe('true');
    expect(btn.getAttribute('aria-disabled')).toBe('true');
    await userEvent.keyboard('{Enter}');
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('載入中的 submit 按鈕不會送出表單', async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(<form onSubmit={onSubmit}><Button type="submit" loading>送出</Button></form>);
    await userEvent.click(screen.getByRole('button'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disabled 用原生停用', async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>停用</Button>);
    const btn = screen.getByRole('button', { name: '停用' });
    expect(btn).toHaveProperty('disabled', true);
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('轉送 ref、合併 className、傳遞其他屬性', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref} className="mine" data-x="1" variant="secondary" size="lg">A</Button>);
    expect(ref.current?.tagName).toBe('BUTTON');
    expect(ref.current?.className).toBe('a-btn a-btn--secondary a-btn--lg mine');
    expect(ref.current?.dataset.x).toBe('1');
    expect(ref.current?.type).toBe('button');
  });

  it('無障礙檢查', async () => {
    const { container } = render(<div>
      <Button variant="primary">主要</Button>
      <Button loading>載入中</Button>
      <Button iconOnly aria-label="搜尋" icon={<svg aria-hidden="true" />} />
    </div>);
    await expectNoSeriousA11y(container);
  });
});
