import * as React from 'react';
import { cx, useControllable } from '../utils';

export interface SliderProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'type' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step'> {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** 右側顯示目前數值，預設顯示 */
  showValue?: boolean;
  /** 數值後面的單位，例如 "ms"、"%" */
  unit?: string;
}

/** 滑桿，左側填色跟著數值。 */
export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { value, defaultValue, onChange, min = 0, max = 100, step = 1, showValue = true, unit = '', className, style, ...rest },
  ref
) {
  const [val, setVal] = useControllable<number>(value, defaultValue ?? min, onChange);
  const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
  return (
    <div className={cx('a-slider-row', className)} style={style}>
      <input
        ref={ref}
        className="a-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={val}
        style={{ '--v': pct + '%' } as React.CSSProperties}
        onChange={e => setVal(Number(e.target.value))}
        {...rest}
      />
      {showValue && <span className="a-slider-value">{val}{unit}</span>}
    </div>
  );
});
