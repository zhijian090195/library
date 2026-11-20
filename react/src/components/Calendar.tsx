import { forwardRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx, useControllable } from '../utils';
import { ChevL, ChevR, WEEK, fromKey, monthGrid, toKey } from './dateUtils';

export interface CalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** 選取的日期，格式 YYYY-MM-DD */
  value?: string;
  defaultValue?: string;
  onChange?: (date: string) => void;
  /** 一開始顯示的月份（YYYY-MM-DD 任一天），預設為選取日或今天 */
  defaultMonth?: string;
  /** 回傳 true 的日期不可點 */
  disabledDate?: (date: string) => boolean;
  /** 自訂日期格內容 */
  renderDay?: (date: Date, key: string) => ReactNode;
}

/** 月曆：切換月份時日期格朝方向滑入 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
  { value, defaultValue = '', onChange, defaultMonth, disabledDate, renderDay, className, ...rest }, ref
) {
  const [sel, setSel] = useControllable<string>(value, defaultValue, onChange);
  const init = fromKey(defaultMonth || sel || toKey(new Date()));
  const [view, setView] = useState({ y: init.getFullYear(), m: init.getMonth(), dir: '' as '' | 'next' | 'prev', n: 0 });
  const today = toKey(new Date());
  const move = (d: number) => setView(v => { const t = new Date(v.y, v.m + d, 1); return { y: t.getFullYear(), m: t.getMonth(), dir: d > 0 ? 'next' : 'prev', n: v.n + 1 }; });

  return (
    <div ref={ref} className={cx('a-calendar', className)} {...rest}>
      <div className="a-calendar__head">
        <button type="button" aria-label="上個月" onClick={() => move(-1)}>{ChevL}</button>
        <b aria-live="polite">{view.y} 年 {view.m + 1} 月</b>
        <button type="button" aria-label="下個月" onClick={() => move(1)}>{ChevR}</button>
      </div>
      <div className="a-calendar__week" aria-hidden="true">{WEEK.map(w => <span key={w}>{w}</span>)}</div>
      <div key={view.n} className={cx('a-calendar__grid', view.dir && `is-${view.dir}`)}>
        {monthGrid(view.y, view.m).map(d => {
          const k = toKey(d), out = d.getMonth() !== view.m, dis = disabledDate?.(k);
          return (
            <button
              key={k}
              type="button"
              aria-label={`${d.getMonth() + 1} 月 ${d.getDate()} 日`}
              aria-selected={k === sel}
              disabled={dis}
              className={cx(out && 'is-out', k === today && 'is-today') || undefined}
              onClick={() => { setSel(k); if (out) move(d < new Date(view.y, view.m, 1) ? -1 : 1); }}
            >
              {renderDay ? renderDay(d, k) : d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
});
