import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx, useReducedMotion } from '../utils';

export interface StatisticTrend {
  value: ReactNode;
  direction?: 'up' | 'down';
  /** 好的變化為綠、壞的為紅；預設上升為好、下降為壞 */
  tone?: 'good' | 'bad';
}

export interface StatisticProps extends Omit<HTMLAttributes<HTMLDivElement>, 'prefix'> {
  label: ReactNode;
  value: number;
  decimals?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  trend?: StatisticTrend;
  /** 進到畫面時從 0 跳到目標值（只播一次） */
  animate?: boolean;
  duration?: number;
  locale?: string;
  formatter?: (n: number) => string;
}

export const Statistic = forwardRef<HTMLDivElement, StatisticProps>(function Statistic(
  { label, value, decimals = 0, prefix, suffix, trend, animate = true, duration = 900, locale, formatter, className, ...rest }, ref
) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(animate ? 0 : value);
  const elRef = useRef<HTMLSpanElement>(null);
  const fromRef = useRef(animate ? 0 : value);
  const startedRef = useRef(!animate);

  useEffect(() => {
    if (reduce) { setShown(value); fromRef.current = value; startedRef.current = true; return; }
    let raf = 0;
    const run = () => {
      const from = fromRef.current, t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration), e = 1 - Math.pow(1 - p, 3);
        const v = from + (value - from) * e;
        setShown(v); fromRef.current = v;
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    if (startedRef.current) { run(); return () => cancelAnimationFrame(raf); }
    const el = elRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') { startedRef.current = true; run(); return () => cancelAnimationFrame(raf); }
    const io = new IntersectionObserver(es => {
      if (es.some(x => x.isIntersecting)) { io.disconnect(); startedRef.current = true; run(); }
    }, { threshold: .4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, duration, reduce]);

  const fmt = formatter ?? ((n: number) => n.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));
  const dir = trend?.direction ?? 'up';
  const tone = trend?.tone ?? (dir === 'up' ? 'good' : 'bad');
  return (
    <div ref={ref} className={cx('a-stat', className)} {...rest}>
      <span className="a-stat__label">{label}</span>
      <span className="a-stat__value">
        {prefix}<span ref={elRef}>{fmt(shown)}</span>{suffix != null && <small>{suffix}</small>}
      </span>
      {trend && <span className={cx('a-stat__trend', tone === 'bad' && 'a-stat__trend--down')}>{dir === 'up' ? '▲' : '▼'} {trend.value}</span>}
    </div>
  );
});

export const StatRow = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function StatRow({ className, ...rest }, ref) {
  return <div ref={ref} className={cx('a-stat-row', className)} {...rest} />;
});
