import * as React from 'react';
import { cx, useControllable } from '../utils';

export interface InputNumberProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'type' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step' | 'size'> {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: 'sm' | 'md';
  /** 外層 class */
  wrapperClassName?: string;
}

const decimals = (n: number) => { const s = String(n); const i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; };

/** 數字輸入：加減按鈕到達上下限時自動停用；直接輸入時，離開欄位會修正到範圍內。 */
export const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(function InputNumber(
  { value, defaultValue, onChange, min = -Infinity, max = Infinity, step = 1, size = 'md', disabled, className, wrapperClassName, onBlur, ...rest },
  ref
) {
  const clamp = (n: number) => {
    const d = decimals(step);
    const v = Math.min(max, Math.max(min, n));
    return d ? Number(v.toFixed(d)) : v;
  };
  const [val, setVal] = useControllable<number>(value, defaultValue ?? (Number.isFinite(min) ? min : 0), onChange);
  const [draft, setDraft] = React.useState<string | null>(null);
  const commit = (n: number) => { setDraft(null); const c = clamp(Number.isNaN(n) ? val : n); if (c !== val) setVal(c); };
  return (
    <div className={cx('a-number', size === 'sm' && 'a-number--sm', wrapperClassName)}>
      <button type="button" aria-label="減少" disabled={disabled || val <= min} onClick={() => commit(val - step)}>−</button>
      <input
        ref={ref}
        type="number"
        className={className}
        inputMode="decimal"
        min={Number.isFinite(min) ? min : undefined}
        max={Number.isFinite(max) ? max : undefined}
        step={step}
        disabled={disabled}
        value={draft ?? String(val)}
        onChange={e => setDraft(e.target.value)}
        onBlur={e => { if (draft !== null) commit(parseFloat(draft)); onBlur?.(e); }}
        onKeyDown={e => { if (e.key === 'Enter' && draft !== null) commit(parseFloat(draft)); }}
        {...rest}
      />
      <button type="button" aria-label="增加" disabled={disabled || val >= max} onClick={() => commit(val + step)}>+</button>
    </div>
  );
});
