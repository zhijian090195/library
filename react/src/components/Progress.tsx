import * as React from 'react';
import { cx } from '../utils';

export interface ProgressProps extends React.ComponentPropsWithoutRef<'div'> {
  /** 0–100 */
  value?: number;
  color?: 'coral' | 'navy' | 'success';
  /** 不知道還要多久時使用 */
  indeterminate?: boolean;
  /** 右側文字；預設顯示百分比，傳 null 隱藏 */
  label?: React.ReactNode;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value = 0, color = 'coral', indeterminate, label, className, 'aria-label': ariaLabel, ...rest }, ref
) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div ref={ref} className={cx('a-progress', color !== 'coral' && 'a-progress--' + color, indeterminate && 'a-progress--indeterminate', className)} {...rest}>
      <div
        className="a-progress__track"
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : 100}
        aria-valuenow={indeterminate ? undefined : v}
      >
        <div className="a-progress__bar" style={indeterminate ? undefined : ({ '--v': v / 100 } as React.CSSProperties)} />
      </div>
      {label === undefined ? (indeterminate ? null : Math.round(v) + '%') : label}
    </div>
  );
});
