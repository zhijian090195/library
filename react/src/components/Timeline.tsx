import { forwardRef, type OlHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils';

export interface TimelineItem {
  key?: string;
  title: ReactNode;
  content?: ReactNode;
  time?: ReactNode;
  /** active：目前事件（珊瑚紅）；muted：尚未發生 */
  status?: 'default' | 'active' | 'muted';
}

export interface TimelineProps extends OlHTMLAttributes<HTMLOListElement> {
  items: TimelineItem[];
}

export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(function Timeline({ items, className, ...rest }, ref) {
  return (
    <ol ref={ref} className={cx('a-timeline', className)} {...rest}>
      {items.map((it, i) => (
        <li key={it.key ?? i} className={it.status && it.status !== 'default' ? `is-${it.status}` : undefined}>
          <span className="a-timeline__title">{it.title}</span>
          {it.content}
          {it.time != null && <span className="a-timeline__time">{it.time}</span>}
        </li>
      ))}
    </ol>
  );
});
