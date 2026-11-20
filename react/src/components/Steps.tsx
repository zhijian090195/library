import * as React from 'react';
import { cx } from '../utils';

export interface StepItem {
  title: React.ReactNode;
  description?: React.ReactNode;
}

export interface StepsProps extends React.ComponentPropsWithoutRef<'ol'> {
  items: StepItem[];
  /** 目前步驟（從 0 開始）；等於 items.length 代表全部完成 */
  current?: number;
}

export function Steps({ items, current = 0, className, ...rest }: StepsProps) {
  return (
    <ol className={cx('a-steps', className)} {...rest}>
      {items.map((it, i) => (
        <li key={i} className={cx(i < current && 'is-done', i === current && 'is-current')} aria-current={i === current ? 'step' : undefined}>
          {it.title}
          {it.description != null && <span className="a-steps__desc">{it.description}</span>}
        </li>
      ))}
    </ol>
  );
}
