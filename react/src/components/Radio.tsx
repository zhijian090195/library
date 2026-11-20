import * as React from 'react';
import { cx, useControllable, useId } from '../utils';
import { normOption, type CheckOption } from './Checkbox';

export interface RadioProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'type'> {
  children?: React.ReactNode;
}

/** 單一 radio。成組使用時建議用 RadioGroup。 */
export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(function Radio({ className, style, children, ...rest }, ref) {
  return (
    <label className={cx('a-check', className)} style={style}>
      <input ref={ref} type="radio" {...rest} />
      {children}
    </label>
  );
});

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  options: CheckOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** radio 的 name，不填會自動產生 */
  name?: string;
  vertical?: boolean;
  disabled?: boolean;
}

/** 一組互斥的選項。記得加 aria-label 說明這組在選什麼。 */
export function RadioGroup({ options, value, defaultValue = '', onChange, name, vertical, disabled, className, ...rest }: RadioGroupProps) {
  const auto = useId('radio');
  const [val, setVal] = useControllable<string>(value, defaultValue, onChange);
  return (
    <div role="radiogroup" className={cx('a-check-group', vertical && 'a-check-group--vertical', className)} {...rest}>
      {options.map(normOption).map(o => (
        <Radio key={o.value} name={name ?? auto} value={o.value} checked={val === o.value} disabled={disabled || o.disabled}
          onChange={() => setVal(o.value)}>{o.label}</Radio>
      ))}
    </div>
  );
}
