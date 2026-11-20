import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils';

export interface DescriptionsItem {
  key?: string;
  label: ReactNode;
  children: ReactNode;
  /** 佔滿整列 */
  wide?: boolean;
}

export interface DescriptionsProps extends HTMLAttributes<HTMLDListElement> {
  items: DescriptionsItem[];
  /** 欄數，預設 2；手機上自動變成 1 欄 */
  columns?: number;
}

export const Descriptions = forwardRef<HTMLDListElement, DescriptionsProps>(function Descriptions({ items, columns = 2, className, style, ...rest }, ref) {
  const s = columns !== 2 && columns !== 3 ? ({ ...style, ['--cols' as string]: columns } as CSSProperties) : style;
  return (
    <dl ref={ref} className={cx('a-desc', columns === 3 && 'a-desc--3', className)} style={s} {...rest}>
      {items.map((it, i) => (
        <div key={it.key ?? i} className={it.wide ? 'is-wide' : undefined}>
          <dt>{it.label}</dt>
          <dd>{it.children}</dd>
        </div>
      ))}
    </dl>
  );
});
