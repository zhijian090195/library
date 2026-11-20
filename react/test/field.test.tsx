import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, Input, Select, Textarea } from '../src';
import { expectNoSeriousA11y } from './axe';

describe('Input + Field', () => {
  it('標籤、說明文字自動接上', () => {
    render(<Field label="電子郵件" help="只用來寄收據"><Input type="email" /></Field>);
    const input = screen.getByLabelText('電子郵件');
    expect(input.getAttribute('aria-describedby')).toBeTruthy();
    expect(document.getElementById(input.getAttribute('aria-describedby')!)?.textContent).toBe('只用來寄收據');
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('錯誤：aria-invalid、說明換成錯誤訊息並以 alert 宣告', () => {
    render(<Field label="密碼" error="至少 8 個字元"><Input type="password" /></Field>);
    const input = screen.getByLabelText('密碼');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const msg = screen.getByRole('alert');
    expect(msg.textContent).toBe('至少 8 個字元');
    expect(input.getAttribute('aria-describedby')).toContain(msg.id);
  });

  it('as="div" 時用 htmlFor 指向控制項；外部 aria-describedby 會合併', () => {
    render(<>
      <p id="extra">補充</p>
      <Field as="div" label="暱稱" help="顯示在留言旁" required><Input aria-describedby="extra" /></Field>
    </>);
    const input = screen.getByLabelText(/暱稱/);
    expect(input.tagName).toBe('INPUT');
    expect(input.getAttribute('aria-describedby')!.split(' ')).toHaveLength(2);
    expect(input).toHaveProperty('required', true);
  });

  it('明確傳入的 id 與 aria-invalid 優先', () => {
    render(<Field label="名稱" error="錯"><Input id="mine" aria-invalid={false} /></Field>);
    const input = screen.getByLabelText('名稱');
    expect(input.id).toBe('mine');
    expect(input.getAttribute('aria-invalid')).toBe('false');
  });

  it('受控輸入：onChange 與 onValueChange', async () => {
    const onValueChange = vi.fn();
    function Demo() {
      const [v, setV] = React.useState('');
      return <Input aria-label="名字" value={v} onChange={e => setV(e.target.value)} onValueChange={onValueChange} />;
    }
    render(<Demo />);
    await userEvent.type(screen.getByLabelText('名字'), '王小明');
    expect((screen.getByLabelText('名字') as HTMLInputElement).value).toBe('王小明');
    expect(onValueChange).toHaveBeenLastCalledWith('王小明');
  });

  it('轉送 ref、合併 className', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} className="x" size="sm" aria-label="a" />);
    expect(ref.current?.className).toBe('a-input a-input--sm x');
  });

  it('Textarea 也接上 Field', () => {
    render(<Field label="留言" error="必填"><Textarea /></Field>);
    expect(screen.getByLabelText('留言').getAttribute('aria-invalid')).toBe('true');
  });

  it('無障礙檢查', async () => {
    const { container } = render(<form>
      <Field label="電子郵件" help="說明"><Input type="email" /></Field>
      <Field label="密碼" error="錯誤"><Input type="password" /></Field>
      <Field as="div" label="地區"><Select options={['台北', '台中']} /></Field>
    </form>);
    await expectNoSeriousA11y(container);
  });
});

describe('Select', () => {
  it('有 placeholder 且非受控時，一開始停在提示文字', () => {
    render(<Select aria-label="城市" placeholder="請選擇" options={['台北', '台中']} />);
    expect((screen.getByLabelText('城市') as HTMLSelectElement).value).toBe('');
  });

  it('非受控：defaultValue 與選擇', async () => {
    const onValueChange = vi.fn();
    render(<Select aria-label="城市" defaultValue="台中" options={['台北', '台中', { value: 'ks', label: '高雄', disabled: true }]} onValueChange={onValueChange} />);
    const sel = screen.getByLabelText('城市') as HTMLSelectElement;
    expect(sel.value).toBe('台中');
    await userEvent.selectOptions(sel, '台北');
    expect(onValueChange).toHaveBeenLastCalledWith('台北');
    expect((screen.getByRole('option', { name: '高雄' }) as HTMLOptionElement).disabled).toBe(true);
  });

  it('受控：值由外部決定', async () => {
    function Demo() {
      const [v, setV] = React.useState('台北');
      return <><Select aria-label="城市" value={v} onValueChange={setV} options={['台北', '台中']} /><output>{v}</output></>;
    }
    render(<Demo />);
    await userEvent.selectOptions(screen.getByLabelText('城市'), '台中');
    expect(screen.getByRole('status').textContent).toBe('台中');
  });

  it('Field 錯誤狀態、ref、className', () => {
    const ref = React.createRef<HTMLSelectElement>();
    render(<Field label="地區" error="請選擇"><Select ref={ref} className="z" options={['A']} /></Field>);
    const sel = screen.getByLabelText('地區');
    expect(sel).toBe(ref.current);
    expect(sel.getAttribute('aria-invalid')).toBe('true');
    expect(sel.className).toBe('a-input a-select z');
  });
});
