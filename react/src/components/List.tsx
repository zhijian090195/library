import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils';

export interface ListItem {
  key?: string;
  avatar?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  extra?: ReactNode;
  onClick?: () => void;
}

export interface ListProps extends HTMLAttributes<HTMLUListElement> {
  items: ListItem[];
  /** 滑過時整列高亮 */
  hover?: boolean;
}

export const List = forwardRef<HTMLUListElement, ListProps>(function List({ items, hover, className, ...rest }, ref) {
  return (
    <ul ref={ref} className={cx('a-list', hover && 'a-list--hover', className)} {...rest}>
      {items.map((it, i) => (
        <li
          key={it.key ?? i}
          onClick={it.onClick}
          tabIndex={it.onClick ? 0 : undefined}
          role={it.onClick ? 'button' : undefined}
          onKeyDown={it.onClick ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); it.onClick!(); } } : undefined}
          style={it.onClick ? { cursor: 'pointer' } : undefined}
        >
          {it.avatar}
          <div className="a-list__main">
            <span className="a-list__title">{it.title}</span>
            {it.description != null && <span className="a-list__desc">{it.description}</span>}
          </div>
          {it.extra != null && <span className="a-list__extra">{it.extra}</span>}
        </li>
      ))}
    </ul>
  );
});
