import * as React from 'react';
import { cx, useControllable, useId } from '../utils';
import { normOption, type CheckOption } from './Checkbox';

export interface SegmentedProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  options: CheckOption[];
  value?: string;
  /** 預設為第一個選項 */
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
}

/** 分段控制器：2–5 個短選項的單選，底層是 radio。 */
export function Segmented({ options, value, defaultValue, onChange, name, className, ...rest }: SegmentedProps) {
  const auto = useId('seg');
  const list = options.map(normOption);
  const [val, setVal] = useControllable<string>(value, defaultValue ?? list[0]?.value ?? '', onChange);
  return (
    <div role="radiogroup" className={cx('a-segmented', className)} {...rest}>
      {list.map(o => (
        <label key={o.value}>
          <input type="radio" name={name ?? auto} value={o.value} checked={val === o.value} disabled={o.disabled} onChange={() => setVal(o.value)} />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}
