import * as React from 'react';
import { cx, useControllable } from '../utils';

export interface CheckboxProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'type' | 'checked' | 'defaultChecked' | 'onChange'> {
  checked?: boolean;
  defaultChecked?: boolean;
  /** 部分選取（橫線）狀態 */
  indeterminate?: boolean;
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  children?: React.ReactNode;
}

/** 核取方塊。包在 label 裡，點文字也能勾選。 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { checked, defaultChecked = false, indeterminate = false, onChange, className, style, children, ...rest },
  ref
) {
  const inner = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(ref, () => inner.current as HTMLInputElement);
  const [on, setOn] = useControllable<boolean>(checked, defaultChecked);
  React.useEffect(() => { if (inner.current) inner.current.indeterminate = indeterminate; }, [indeterminate, on]);
  return (
    <label className={cx('a-check', className)} style={style}>
      <input
        ref={inner}
        type="checkbox"
        checked={on}
        aria-checked={indeterminate ? 'mixed' : undefined}
        onChange={e => { setOn(e.target.checked); onChange?.(e.target.checked, e); }}
        {...rest}
      />
      {children}
    </label>
  );
});

export type CheckOption = string | { value: string; label?: React.ReactNode; disabled?: boolean };
export const normOption = (o: CheckOption) => typeof o === 'string' ? { value: o, label: o as React.ReactNode, disabled: false } : { value: o.value, label: o.label ?? o.value, disabled: !!o.disabled };

export interface CheckboxGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  options: CheckOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  /** 直向排列 */
  vertical?: boolean;
  disabled?: boolean;
}

/** 一組核取方塊，value 為勾選項目的陣列。 */
export function CheckboxGroup({ options, value, defaultValue = [], onChange, vertical, disabled, className, ...rest }: CheckboxGroupProps) {
  const [val, setVal] = useControllable<string[]>(value, defaultValue, onChange);
  return (
    <div role="group" className={cx('a-check-group', vertical && 'a-check-group--vertical', className)} {...rest}>
      {options.map(normOption).map(o => (
        <Checkbox
          key={o.value}
          checked={val.includes(o.value)}
          disabled={disabled || o.disabled}
          onChange={c => setVal(c ? [...val, o.value] : val.filter(v => v !== o.value))}
        >{o.label}</Checkbox>
      ))}
    </div>
  );
}
