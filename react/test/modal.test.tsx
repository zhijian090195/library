import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, Modal } from '../src';
import { expectNoSeriousA11y } from './axe';

function Demo({ onClose, initial, children }: { onClose?: () => void; initial?: boolean; children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const ok = React.useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button onClick={() => setOpen(true)}>開啟</Button>
      <Modal
        open={open}
        onClose={() => { onClose?.(); setOpen(false); }}
        title="刪除專案"
        initialFocus={initial ? ok : undefined}
        footer={<><Button onClick={() => setOpen(false)}>取消</Button><Button ref={ok} variant="primary">確定</Button></>}
      >
        {children ?? '刪除後無法復原。'}
      </Modal>
    </>
  );
}

const openIt = async () => {
  await userEvent.click(screen.getByRole('button', { name: '開啟' }));
  return screen.getByRole('dialog', { name: '刪除專案' });
};

describe('Modal', () => {
  it('開啟：dialog 角色、名稱、說明、aria-modal，焦點移到第一個可聚焦元素', async () => {
    render(<Demo />);
    const d = await openIt();
    expect(d.getAttribute('aria-modal')).toBe('true');
    expect(document.getElementById(d.getAttribute('aria-describedby')!)?.textContent).toBe('刪除後無法復原。');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '取消' }));
  });

  it('initialFocus 與 autoFocus 優先', async () => {
    render(<Demo initial />);
    await openIt();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '確定' }));
  });

  it('沒有可聚焦元素時聚焦對話框本身', async () => {
    function Bare() {
      const [open, setOpen] = React.useState(false);
      return <><Button onClick={() => setOpen(true)}>開啟</Button><Modal open={open} onClose={() => setOpen(false)} title="刪除專案">純文字</Modal></>;
    }
    render(<Bare />);
    const d = await openIt();
    expect(document.activeElement).toBe(d);
  });

  it('Tab／Shift+Tab 在對話框內循環', async () => {
    render(<Demo />);
    await openIt();
    const cancel = screen.getByRole('button', { name: '取消' }), ok = screen.getByRole('button', { name: '確定' });
    await userEvent.tab();
    expect(document.activeElement).toBe(ok);
    await userEvent.tab();
    expect(document.activeElement).toBe(cancel);
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(ok);
  });

  it('Esc 呼叫 onClose，關閉後焦點回到開啟按鈕', async () => {
    const onClose = vi.fn();
    render(<Demo onClose={onClose} />);
    await openIt();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: '開啟' })));
  });

  it('點背景關閉；closeOnBackdrop=false 時不關', async () => {
    const onClose = vi.fn();
    render(<Demo onClose={onClose} />);
    const d = await openIt();
    await userEvent.click(d);
    expect(onClose).toHaveBeenCalledTimes(1);

    const stay = vi.fn();
    render(<Modal open onClose={stay} closeOnBackdrop={false} title="保留">x</Modal>);
    await userEvent.click(screen.getByRole('dialog', { name: '保留' }));
    expect(stay).not.toHaveBeenCalled();
  });

  it('開啟期間鎖住頁面捲動，關閉後還原', async () => {
    document.body.style.overflow = 'auto';
    render(<Demo />);
    await openIt();
    expect(document.body.style.overflow).toBe('hidden');
    await userEvent.keyboard('{Escape}');
    expect(document.body.style.overflow).toBe('auto');
  });

  it('支援原生 showModal：Esc 走 cancel 事件，只呼叫一次 onClose', async () => {
    const proto = HTMLDialogElement.prototype as unknown as { showModal?: () => void };
    const had = proto.showModal;
    proto.showModal = function (this: HTMLDialogElement) { this.setAttribute('open', ''); } as () => void;
    try {
      const onClose = vi.fn();
      render(<Demo onClose={onClose} />);
      const d = await openIt();
      d.dispatchEvent(new Event('cancel', { cancelable: true }));
      await userEvent.keyboard('{Escape}'); // 原生環境下 keydown 不重複處理
      expect(onClose).toHaveBeenCalledTimes(1);
    } finally {
      if (had) proto.showModal = had; else delete proto.showModal;
    }
  });

  it('轉送 ref、合併 className', () => {
    const ref = React.createRef<HTMLDialogElement>();
    render(<Modal ref={ref} open onClose={() => {}} className="wide" title="T">x</Modal>);
    expect(ref.current?.tagName).toBe('DIALOG');
    expect(ref.current?.className).toContain('a-modal');
    expect(ref.current?.className).toContain('wide');
  });

  it('無障礙檢查', async () => {
    const { container } = render(<Demo />);
    await openIt();
    await expectNoSeriousA11y(container);
  });
});
