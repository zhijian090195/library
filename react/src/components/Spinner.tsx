import * as React from 'react';
import { cx } from '../utils';

export interface SpinnerProps extends React.ComponentPropsWithoutRef<'span'> {
  size?: 'sm' | 'md' | 'lg';
}

export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 'md', className, 'aria-label': label = '載入中', ...rest }, ref
) {
  return <span ref={ref} role="status" aria-label={label} className={cx('a-spinner', size !== 'md' && 'a-spinner--' + size, className)} {...rest} />;
});
