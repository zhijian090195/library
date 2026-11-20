import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** 數量；超過 max 顯示「max+」 */
  count?: number | ReactNode;
  max?: number;
  /** 只顯示紅點 */
  dot?: boolean;
  /** 行內徽章，放在文字旁邊（不包子元素） */
  inline?: boolean;
  color?: 'coral' | 'navy';
  /** count 為 0 時仍顯示 */
  showZero?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { count, max = 99, dot, inline, color = 'coral', showZero, className, children, ...rest }, ref
) {
  const text = typeof count === 'number' ? (count > max ? `${max}+` : String(count)) : count;
  const hidden = !dot && (count == null || (count === 0 && !showZero));
  const countCls = cx('a-badge__count', color === 'navy' && 'a-badge__count--navy');
  if (inline) {
    return hidden ? null : <span ref={ref} className={cx(countCls, 'a-badge__count--inline', className)} {...rest}>{text}</span>;
  }
  return (
    <span ref={ref} className={cx('a-badge', dot && 'a-badge--dot', className)} {...rest}>
      {children}
      {!hidden && <span className={countCls}>{dot ? null : text}</span>}
    </span>
  );
});
