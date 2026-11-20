import * as React from 'react';
import { cx } from '../utils';

export interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<'nav'> {
  /** 最後一項為目前頁面，不會做成連結 */
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items, className, 'aria-label': label = '麵包屑', ...rest }: BreadcrumbProps) {
  return (
    <nav className={cx('a-breadcrumb', className)} aria-label={label} {...rest}>
      <ol>
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} aria-current={last ? 'page' : undefined}>
              {last || (!it.href && !it.onClick) ? it.label : <a href={it.href ?? '#'} onClick={it.onClick}>{it.label}</a>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
