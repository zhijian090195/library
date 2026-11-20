import { forwardRef, useState, type HTMLAttributes } from 'react';
import { cx, useControllable } from '../utils';
import { ChevL, ChevR, WEEK, fromKey, monthGrid, toKey } from './dateUtils';

export type DateRange = [start: string, end: string];

export interface RangePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** [開始, 結束]，格式 YYYY-MM-DD；尚未選完時結束為空字串 */
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;
  defaultMonth?: string;
  disabledDate?: (date: string) => boolean;
}

/** 日期範圍：點第一下設開始、第二下設結束；選開始後滑鼠移動會預覽範圍 */
export const RangePicker = forwardRef<HTMLDivElement, RangePickerProps>(function RangePicker(
  { value, defaultValue = ['', ''], onChange, defaultMonth, disabledDate, className, ...rest }, ref
) {
  const [range, setRange] = useControllable<DateRange>(value, defaultValue, onChange);
  const [start, end] = range;
  const [hover, setHover] = useState('');
  const init = fromKey(defaultMonth || start || toKey(new Date()));
  const [view, setView] = useState({ y: init.getFullYear(), m: init.getMonth(), dir: '' as '' | 'next' | 'prev', n: 0 });
  const today = toKey(new Date());
  const move = (d: number) => setView(v => { const t = new Date(v.y, v.m + d, 1); return { y: t.getFullYear(), m: t.getMonth(), dir: d > 0 ? 'next' : 'prev', n: v.n + 1 }; });

  const pick = (k: string) => {
    if (!start || end || k < start) setRange([k, '']);
    else setRange([start, k]);
  };
  const shownEnd = end || (start && hover >= start ? hover : '');

  return (
    <div ref={ref} className={cx('a-calendar', 'a-calendar--range', className)} {...rest}>
      <div className="a-calendar__head">
        <button type="button" aria-label="上個月" onClick={() => move(-1)}>{ChevL}</button>
        <b aria-live="polite">{view.y} 年 {view.m + 1} 月</b>
        <button type="button" aria-label="下個月" onClick={() => move(1)}>{ChevR}</button>
      </div>
      <div className="a-calendar__week" aria-hidden="true">{WEEK.map(w => <span key={w}>{w}</span>)}</div>
      <div key={view.n} className={cx('a-calendar__grid', view.dir && `is-${view.dir}`)} onPointerLeave={() => setHover('')}>
        {monthGrid(view.y, view.m).map(d => {
          const k = toKey(d), out = d.getMonth() !== view.m;
          const isStart = k === start, isEnd = !!shownEnd && k === shownEnd;
          const inRange = !!start && !!shownEnd && k > start && k < shownEnd;
          return (
            <button
              key={k}
              type="button"
              aria-label={`${d.getMonth() + 1} 月 ${d.getDate()} 日`}
              aria-selected={isStart || (!!end && k === end)}
              disabled={disabledDate?.(k)}
              className={cx(out && 'is-out', k === today && 'is-today', isStart && 'is-start', isStart && shownEnd && shownEnd !== start && 'has-end', isEnd && 'is-end', inRange && 'is-in-range') || undefined}
              onPointerEnter={() => { if (start && !end) setHover(k); }}
              onClick={() => pick(k)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
});
