import * as React from 'react';
import { cx } from '../utils';

export interface DividerProps extends React.ComponentPropsWithoutRef<'div'> {
  /** 直立分隔線（行內） */
  vertical?: boolean;
  /** 文字靠左 */
  align?: 'center' | 'left';
}

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(function Divider(
  { vertical, align = 'center', className, children, ...rest }, ref
) {
  if (vertical) return <span ref={ref as React.Ref<HTMLSpanElement>} role="separator" aria-orientation="vertical" className={cx('a-divider', 'a-divider--vertical', className)} {...(rest as React.ComponentPropsWithoutRef<'span'>)} />;
  return (
    <div ref={ref} role="separator" className={cx('a-divider', align === 'left' && 'a-divider--left', className)} {...rest}>
      {children}
    </div>
  );
});
