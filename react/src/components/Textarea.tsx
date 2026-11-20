import * as React from 'react';
import { cx, useControllable } from '../utils';
import { useFieldControl } from '../fieldContext';

export interface TextareaProps extends Omit<React.ComponentPropsWithoutRef<'textarea'>, 'value' | 'defaultValue'> {
  value?: string;
  defaultValue?: string;
  /** 值改變時以字串回傳（原生 onChange 仍可使用） */
  onValueChange?: (value: string) => void;
  /** 有 maxLength 時是否顯示字數，預設顯示 */
  showCount?: boolean;
}

/** 多行輸入框。設定 maxLength 會在下方顯示「目前 / 上限」，到上限時變紅。放在 Field 裡排版最好。 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { value, defaultValue = '', onValueChange, onChange, maxLength, showCount = true, className, id, required, 'aria-describedby': describedBy, 'aria-invalid': invalid, 'aria-label': ariaLabel, 'aria-labelledby': labelledBy, ...rest },
  ref
) {
  const [val, setVal] = useControllable(value, defaultValue, onValueChange);
  const count = showCount && maxLength != null;
  const a11y = useFieldControl({ id, required, 'aria-describedby': describedBy, 'aria-invalid': invalid, 'aria-label': ariaLabel, 'aria-labelledby': labelledBy });
  return (
    <>
      <textarea
        ref={ref}
        className={cx('a-input', 'a-textarea', className)}
        value={val}
        maxLength={maxLength}
        onChange={e => { onChange?.(e); setVal(e.target.value); }}
        {...a11y}
        {...rest}
      />
      {count && (
        <span className={cx('a-field__count', val.length >= maxLength && 'is-full')} aria-live="polite">
          {val.length} / {maxLength}
        </span>
      )}
    </>
  );
});
