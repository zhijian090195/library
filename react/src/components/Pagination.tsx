import * as React from 'react';
import { cx, useControllable } from '../utils';

export interface PaginationProps extends Omit<React.ComponentPropsWithoutRef<'nav'>, 'onChange'> {
  /** 總頁數 */
  total: number;
  current?: number;
  defaultCurrent?: number;
  onChange?: (page: number) => void;
}

/** 頁數視窗：少於 8 頁全列；否則保留首尾與目前頁附近 */
export function pageWindow(cur: number, total: number): Array<number | '…'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (cur <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (cur >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', cur - 1, cur, cur + 1, '…', total];
}

const L = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>;
const R = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>;

export function Pagination({ total, current, defaultCurrent = 1, onChange, className, 'aria-label': label = '分頁', ...rest }: PaginationProps) {
  const t = Math.max(1, total);
  const [raw, setPage] = useControllable(current, defaultCurrent, onChange);
  const cur = Math.min(t, Math.max(1, raw));
  const go = (p: number) => { if (p >= 1 && p <= t && p !== cur) setPage(p); };
  return (
    <nav className={cx('a-pagination', className)} aria-label={label} {...rest}>
      <button type="button" aria-label="上一頁" disabled={cur === 1} onClick={() => go(cur - 1)}>{L}</button>
      {pageWindow(cur, t).map((p, i) =>
        p === '…'
          ? <span key={'gap' + i} className="a-pagination__gap">…</span>
          : <button key={p} type="button" aria-current={p === cur ? 'page' : undefined} onClick={() => go(p)}>{p}</button>
      )}
      <button type="button" aria-label="下一頁" disabled={cur === t} onClick={() => go(cur + 1)}>{R}</button>
    </nav>
  );
}
