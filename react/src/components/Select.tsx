import * as React from 'react';
import { cx } from '../utils';
import { useFieldControl } from '../fieldContext';

export type SelectOption = string | { value: string; label?: React.ReactNode; disabled?: boolean };

export interface SelectProps extends Omit<React.ComponentPropsWithoutRef<'select'>, 'size'> {
  /** 選項；也可以直接寫 <option> 當 children */
  options?: SelectOption[];
  size?: 'sm' | 'md' | 'lg';
  /** 尚未選擇時顯示的提示（會成為停用的第一個選項） */
  placeholder?: string;
  /** 值改變時以字串回傳（原生 onChange 仍可使用） */
  onValueChange?: (value: string) => void;
}

/**
 * 原生下拉選擇，外觀與輸入框一致。受控用 value＋onChange／onValueChange，非受控用 defaultValue。
 * 有 placeholder 又沒給值時，一開始會停在提示文字上（而不是第一個選項）。
 * 放在 Field 裡時會自動接上標籤、說明文字與錯誤狀態。
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, size = 'md', placeholder, className, children, onChange, onValueChange, id, required,
    'aria-describedby': describedBy, 'aria-invalid': invalid, 'aria-label': ariaLabel, 'aria-labelledby': labelledBy, value, defaultValue, ...rest },
  ref
) {
  const a11y = useFieldControl({ id, required, 'aria-describedby': describedBy, 'aria-invalid': invalid, 'aria-label': ariaLabel, 'aria-labelledby': labelledBy });
  const uncontrolledDefault = value === undefined && defaultValue === undefined && placeholder != null ? '' : defaultValue;
  return (
    <select
      ref={ref}
      className={cx('a-input', 'a-select', size !== 'md' && 'a-input--' + size, className)}
      onChange={e => { onChange?.(e); onValueChange?.(e.target.value); }}
      value={value}
      defaultValue={uncontrolledDefault}
      {...a11y}
      {...rest}
    >
      {placeholder != null && <option value="" disabled>{placeholder}</option>}
      {options?.map(o => typeof o === 'string'
        ? <option key={o} value={o}>{o}</option>
        : <option key={o.value} value={o.value} disabled={o.disabled}>{o.label ?? o.value}</option>)}
      {children}
    </select>
  );
});
