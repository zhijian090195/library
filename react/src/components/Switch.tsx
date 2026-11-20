import * as React from 'react';
import { cx, useControllable } from '../utils';

export interface SwitchProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'type' | 'size' | 'checked' | 'defaultChecked' | 'onChange'> {
  checked?: boolean;
  defaultChecked?: boolean;
  /** 切換時回傳新的狀態 */
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  size?: 'sm' | 'md';
  /** 開關右側的文字 */
  children?: React.ReactNode;
}

/** 開關，底層是 role="switch" 的原生 checkbox。 */
export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { checked, defaultChecked = false, onChange, size = 'md', className, children, style, ...rest },
  ref
) {
  const [on, setOn] = useControllable<boolean>(checked, defaultChecked);
  return (
    <label className={cx('a-switch', size === 'sm' && 'a-switch--sm', className)} style={style}>
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        checked={on}
        onChange={e => { setOn(e.target.checked); onChange?.(e.target.checked, e); }}
        {...rest}
      />
      <span className="a-switch__track"><span className="a-switch__thumb" /></span>
      {children}
    </label>
  );
});
