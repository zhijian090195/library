import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactElement, type ReactNode, type Ref, type RefAttributes, type TableHTMLAttributes } from 'react';
import { cx, useControllable, useReducedMotion } from '../utils';

export interface TableColumn<T> {
  key: string;
  title: ReactNode;
  /** 取值欄位，預設等於 key */
  dataIndex?: keyof T;
  align?: 'left' | 'right';
  width?: number | string;
  render?: (row: T, index: number) => ReactNode;
  /** DataTable 用：可排序；'number' 以數字比較，'text' 以中文排序 */
  sortable?: boolean | 'number' | 'text';
  /** DataTable 用：排序與搜尋時使用的值 */
  sortValue?: (row: T) => string | number;
}

type RowKey<T> = keyof T | ((row: T) => string);

export interface TableProps<T> extends Omit<TableHTMLAttributes<HTMLTableElement>, 'children'> {
  columns: TableColumn<T>[];
  dataSource: T[];
  rowKey?: RowKey<T>;
  striped?: boolean;
  hover?: boolean;
  compact?: boolean;
  /** 沒有資料時顯示 */
  empty?: ReactNode;
  wrapClassName?: string;
  /** 表格標題（給讀屏軟體），視覺上會隱藏；要顯示時自己放在表格上方 */
  caption?: ReactNode;
}

const getKey = <T,>(row: T, i: number, rowKey?: RowKey<T>): string =>
  rowKey == null ? String(i) : typeof rowKey === 'function' ? rowKey(row) : String(row[rowKey]);
const rawValue = <T,>(row: T, c: TableColumn<T>): unknown => (row as Record<string, unknown>)[String(c.dataIndex ?? c.key)];
const cell = <T,>(row: T, c: TableColumn<T>, i: number): ReactNode => (c.render ? c.render(row, i) : (rawValue(row, c) as ReactNode));
const thStyle = (w?: number | string): CSSProperties | undefined => (w == null ? undefined : { width: w });

const SR_ONLY: CSSProperties = { position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 };
const Caption = ({ children }: { children?: ReactNode }) => (children == null ? null : <caption style={SR_ONLY}>{children}</caption>);

function TableInner<T>({ columns, dataSource, rowKey, striped, hover, compact, empty = '沒有資料', className, wrapClassName, caption, ...rest }: TableProps<T>, ref: Ref<HTMLTableElement>) {
  return (
    <div className={cx('a-table-wrap', wrapClassName)}>
      <table ref={ref} className={cx('a-table', striped && 'a-table--striped', hover && 'a-table--hover', compact && 'a-table--compact', className)} {...rest}>
        <Caption>{caption}</Caption>
        <thead>
          <tr>{columns.map(c => <th key={c.key} className={c.align === 'right' ? 'is-num' : undefined} style={thStyle(c.width)}>{c.title}</th>)}</tr>
        </thead>
        <tbody>
          {dataSource.length ? dataSource.map((row, i) => (
            <tr key={getKey(row, i, rowKey)}>
              {columns.map(c => <td key={c.key} className={c.align === 'right' ? 'is-num' : undefined}>{cell(row, c, i)}</td>)}
            </tr>
          )) : (
            <tr className="a-table__empty"><td colSpan={columns.length}>{empty}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/** 表格：數字欄（align: 'right'）靠右並使用等寬數字。ref 指向 <table> */
export const Table = forwardRef(TableInner) as <T>(props: TableProps<T> & RefAttributes<HTMLTableElement>) => ReactElement | null;

export interface DataTableProps<T> extends TableProps<T> {
  /** 顯示搜尋框 */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** 自訂篩選；預設比對每一欄的文字 */
  filter?: (row: T, query: string) => boolean;
  /** 顯示勾選欄 */
  selectable?: boolean;
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  /** 工具列右側額外內容（例如批次操作按鈕） */
  toolbarExtra?: ReactNode;
  /** 搜尋沒有結果時的文字 */
  emptyText?: (query: string) => ReactNode;
  /** 勾選框給讀屏念的列名稱；預設用第一欄的文字，例如「選取 王小明」 */
  rowLabel?: (row: T, index: number) => string;
}

type SortState = { key: string; dir: 'asc' | 'desc' } | null;

const SEARCH_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);

function DataTableInner<T>({
  columns, dataSource, rowKey, striped, hover = true, compact, empty, className, wrapClassName, caption,
  searchable, searchPlaceholder = '搜尋', filter, selectable, selectedKeys, defaultSelectedKeys = [], onSelectionChange,
  toolbarExtra, emptyText, rowLabel, ...rest
}: DataTableProps<T>, ref: Ref<HTMLTableElement>) {
  const reduce = useReducedMotion();
  const [sort, setSort] = useState<SortState>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useControllable<string[]>(selectedKeys, defaultSelectedKeys, onSelectionChange);
  const rowRefs = useRef(new Map<string, HTMLTableRowElement>());
  const firstTops = useRef<Map<string, number> | null>(null);
  const allRef = useRef<HTMLInputElement>(null);

  const valueOf = (row: T, c: TableColumn<T>): string | number => {
    if (c.sortValue) return c.sortValue(row);
    const v = rawValue(row, c);
    return typeof v === 'number' ? v : String(v ?? '');
  };

  const keyed = useMemo(() => dataSource.map((row, i) => ({ row, key: getKey(row, i, rowKey) })), [dataSource, rowKey]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = !q ? keyed : keyed.filter(({ row }) => filter ? filter(row, q) : columns.some(c => String(valueOf(row, c)).toLowerCase().includes(q)));
    if (sort) {
      const c = columns.find(x => x.key === sort.key);
      if (c) {
        const num = c.sortable === 'number';
        list = [...list].sort((a, b) => {
          const x = valueOf(a.row, c), y = valueOf(b.row, c);
          const r = num || (typeof x === 'number' && typeof y === 'number')
            ? (parseFloat(String(x).replace(/[^\d.-]/g, '')) || 0) - (parseFloat(String(y).replace(/[^\d.-]/g, '')) || 0)
            : String(x).localeCompare(String(y), 'zh-Hant');
          return sort.dir === 'asc' ? r : -r;
        });
      }
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyed, query, sort, columns, filter]);

  const visibleKeys = visible.map(v => v.key);
  const onCount = visibleKeys.filter(k => selected.includes(k)).length;

  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = onCount > 0 && onCount < visibleKeys.length;
  });

  // FLIP：排序前記錄位置，排序後從舊位置滑到新位置
  useLayoutEffect(() => {
    const first = firstTops.current; firstTops.current = null;
    if (!first || reduce) return;
    rowRefs.current.forEach((tr, k) => {
      const top = first.get(k); if (top == null) return;
      const dy = top - tr.getBoundingClientRect().top;
      if (dy && tr.animate) tr.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 280, easing: 'cubic-bezier(0.22,1,0.36,1)' });
    });
  }, [sort, reduce]);

  const toggleSort = (key: string) => {
    const m = new Map<string, number>();
    rowRefs.current.forEach((tr, k) => m.set(k, tr.getBoundingClientRect().top));
    firstTops.current = m;
    setSort(s => (s && s.key === key && s.dir === 'asc' ? { key, dir: 'desc' } : { key, dir: 'asc' }));
  };

  const toggleRow = (k: string, on: boolean) => setSelected(on ? [...selected, k] : selected.filter(x => x !== k));
  const toggleAll = (on: boolean) => setSelected(on ? Array.from(new Set([...selected, ...visibleKeys])) : selected.filter(k => !visibleKeys.includes(k)));
  const colSpan = columns.length + (selectable ? 1 : 0);
  const defaultRowLabel = (row: T, i: number) => {
    const c = columns[0];
    const v = c ? valueOf(row, c) : '';
    return String(v).trim() || `第 ${i + 1} 列`;
  };

  return (
    <div style={{ width: '100%' }}>
      {(searchable || selectable || toolbarExtra) && (
        <div className="a-table-toolbar">
          {searchable ? (
            <span className="a-input-wrap">
              {SEARCH_ICON}
              <input className="a-input a-input--sm" type="search" value={query} placeholder={searchPlaceholder} aria-label={searchPlaceholder} onChange={e => setQuery(e.target.value)} />
            </span>
          ) : <span />}
          <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="a-table-toolbar__info" aria-live="polite">
              {selected.length ? <>已選 <b>{selected.length}</b> 筆</> : `共 ${visible.length} 筆`}
            </span>
            {toolbarExtra}
          </span>
        </div>
      )}
      <div className={cx('a-table-wrap', wrapClassName)}>
        <table ref={ref} className={cx('a-table', striped && 'a-table--striped', hover && 'a-table--hover', compact && 'a-table--compact', className)} {...rest}>
          <Caption>{caption}</Caption>
          <thead>
            <tr>
              {selectable && (
                <th className="a-table__check">
                  <label className="a-check">
                    <input ref={allRef} type="checkbox" aria-label="全選" checked={visibleKeys.length > 0 && onCount === visibleKeys.length} onChange={e => toggleAll(e.target.checked)} />
                  </label>
                </th>
              )}
              {columns.map(c => (
                <th
                  key={c.key}
                  className={c.align === 'right' ? 'is-num' : undefined}
                  style={thStyle(c.width)}
                  aria-sort={c.sortable ? (sort?.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}
                >
                  {c.sortable ? <button type="button" className="a-th-sort" onClick={() => toggleSort(c.key)}>{c.title}</button> : c.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length ? visible.map(({ row, key }, i) => {
              const on = selected.includes(key);
              return (
                <tr
                  key={key}
                  className={on ? 'is-selected' : undefined}
                  ref={el => { if (el) rowRefs.current.set(key, el); else rowRefs.current.delete(key); }}
                >
                  {selectable && (
                    <td className="a-table__check">
                      <label className="a-check"><input type="checkbox" aria-label={'選取 ' + (rowLabel ? rowLabel(row, i) : defaultRowLabel(row, i))} checked={on} onChange={e => toggleRow(key, e.target.checked)} /></label>
                    </td>
                  )}
                  {columns.map(c => <td key={c.key} className={c.align === 'right' ? 'is-num' : undefined}>{cell(row, c, i)}</td>)}
                </tr>
              );
            }) : (
              <tr className="a-table__empty"><td colSpan={colSpan}>{query.trim() ? (emptyText ? emptyText(query.trim()) : `找不到符合「${query.trim()}」的資料`) : (empty ?? '沒有資料')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** 資料表格：排序（每列從舊位置滑到新位置）、搜尋、勾選。ref 指向 <table> */
export const DataTable = forwardRef(DataTableInner) as <T>(props: DataTableProps<T> & RefAttributes<HTMLTableElement>) => ReactElement | null;
