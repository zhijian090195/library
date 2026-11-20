import { forwardRef, Fragment, type HTMLAttributes } from 'react';
import { cx } from '../utils';

export const Kbd = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function Kbd({ className, ...rest }, ref) {
  return <kbd ref={ref} className={cx('a-kbd', className)} {...rest} />;
});

export interface KbdComboProps extends HTMLAttributes<HTMLSpanElement> {
  /** 例如 ['Ctrl', 'Shift', 'P'] */
  keys: string[];
  separator?: string;
}

export const KbdCombo = forwardRef<HTMLSpanElement, KbdComboProps>(function KbdCombo({ keys, separator = '+', className, ...rest }, ref) {
  return (
    <span ref={ref} className={cx('a-kbd-combo', className)} {...rest}>
      {keys.map((k, i) => <Fragment key={i}>{i > 0 && separator}<Kbd>{k}</Kbd></Fragment>)}
    </span>
  );
});
