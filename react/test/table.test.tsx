import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, Table, type TableColumn } from '../src';
import { expectNoSeriousA11y } from './axe';

type Row = { id: string; name: string; team: string; score: number };
const rows: Row[] = [
  { id: 'a', name: '王小明', team: '設計', score: 82 },
  { id: 'b', name: '林小雨', team: '工程', score: 95 },
  { id: 'c', name: '陳大文', team: '行銷', score: 7 },
];
const columns: TableColumn<Row>[] = [
  { key: 'name', title: '姓名', sortable: 'text' },
  { key: 'team', title: '部門' },
  { key: 'score', title: '分數', align: 'right', sortable: 'number' },
];
const names = () => screen.getAllByRole('row').slice(1).map(r => { const c = within(r).getAllByRole('cell'); return c[c.length - 3].textContent; });

describe('Table', () => {
  it('表頭與資料、caption、ref', () => {
    const ref = React.createRef<HTMLTableElement>();
    render(<Table ref={ref} caption="成員" columns={columns} dataSource={rows} rowKey="id" className="t" />);
    const table = screen.getByRole('table', { name: '成員' });
    expect(table).toBe(ref.current);
    expect(table.className).toContain('t');
    expect(screen.getAllByRole('columnheader').map(h => h.textContent)).toEqual(['姓名', '部門', '分數']);
  });

  it('沒有資料時顯示空狀態', () => {
    render(<Table columns={columns} dataSource={[]} empty="還沒有成員" />);
    expect(screen.getByText('還沒有成員')).toBeTruthy();
  });
});

describe('DataTable', () => {
  it('排序：表頭是按鈕，aria-sort 隨之更新，數字欄以數值比較', async () => {
    render(<DataTable caption="成員" columns={columns} dataSource={rows} rowKey="id" />);
    const scoreBtn = screen.getByRole('button', { name: '分數' });
    const th = scoreBtn.closest('th')!;
    expect(th.getAttribute('aria-sort')).toBe('none');
    expect(screen.getByRole('columnheader', { name: '部門' }).getAttribute('aria-sort')).toBeNull();
    await userEvent.click(scoreBtn);
    expect(th.getAttribute('aria-sort')).toBe('ascending');
    expect(names()).toEqual(['陳大文', '王小明', '林小雨']);
    scoreBtn.focus();
    await userEvent.keyboard('{Enter}');
    expect(th.getAttribute('aria-sort')).toBe('descending');
    expect(names()).toEqual(['林小雨', '王小明', '陳大文']);
  });

  it('勾選：列的勾選框用列內容命名，全選有部分選取狀態', async () => {
    const onSel = vi.fn();
    render(<DataTable columns={columns} dataSource={rows} rowKey="id" selectable onSelectionChange={onSel} />);
    const all = screen.getByRole('checkbox', { name: '全選' }) as HTMLInputElement;
    await userEvent.click(screen.getByRole('checkbox', { name: '選取 林小雨' }));
    expect(onSel).toHaveBeenLastCalledWith(['b']);
    expect(all.indeterminate).toBe(true);
    expect(all.checked).toBe(false);
    await userEvent.click(all);
    expect(onSel).toHaveBeenLastCalledWith(expect.arrayContaining(['a', 'b', 'c']));
    expect(all.checked).toBe(true);
    expect(all.indeterminate).toBe(false);
    // 鍵盤：Space 切換
    screen.getByRole('checkbox', { name: '選取 王小明' }).focus();
    await userEvent.keyboard(' ');
    expect(onSel).toHaveBeenLastCalledWith(['b', 'c']);
  });

  it('受控勾選：畫面跟著 selectedKeys', async () => {
    function Demo() {
      const [keys, setKeys] = React.useState<string[]>(['c']);
      return <><DataTable columns={columns} dataSource={rows} rowKey="id" selectable selectedKeys={keys} onSelectionChange={setKeys} /><button onClick={() => setKeys([])}>清除</button></>;
    }
    render(<Demo />);
    const c = screen.getByRole('checkbox', { name: '選取 陳大文' }) as HTMLInputElement;
    expect(c.checked).toBe(true);
    await userEvent.click(screen.getByRole('button', { name: '清除' }));
    expect(c.checked).toBe(false);
  });

  it('rowLabel 自訂勾選框名稱', () => {
    render(<DataTable columns={columns} dataSource={rows} rowKey="id" selectable rowLabel={r => `${r.team}的${r.name}`} />);
    expect(screen.getByRole('checkbox', { name: '選取 設計的王小明' })).toBeTruthy();
  });

  it('搜尋與找不到結果', async () => {
    render(<DataTable columns={columns} dataSource={rows} rowKey="id" searchable searchPlaceholder="搜尋成員" />);
    await userEvent.type(screen.getByRole('searchbox', { name: '搜尋成員' }), '工程');
    expect(names()).toEqual(['林小雨']);
    await userEvent.clear(screen.getByRole('searchbox'));
    await userEvent.type(screen.getByRole('searchbox'), 'zzz');
    expect(screen.getByText('找不到符合「zzz」的資料')).toBeTruthy();
  });

  it('無障礙檢查', async () => {
    const { container } = render(<DataTable caption="成員" columns={columns} dataSource={rows} rowKey="id" selectable searchable />);
    await expectNoSeriousA11y(container);
  });
});
