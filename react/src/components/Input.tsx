import * as React from 'react';
import { cx, useId } from '../utils';
import { FieldContext, useFieldControl } from '../fieldContext';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'size' | 'prefix'> {
  size?: InputSize;
  /** 左側圖示（通常是 SVG），會自動包進 a-input-wrap */
  prefix?: React.ReactNode;
  /** 值改變時以字串回傳（原生 onChange 仍可使用） */
  onValueChange?: (value: string) => void;
}

/**
 * 單行輸入框。value／onChange 與原生 input 相同；另提供 onValueChange 直接拿到字串。
 * 放在 Field 裡時，會自動接上標籤、說明文字（aria-describedby）與錯誤狀態（aria-invalid）。
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = 'md', prefix, className, onChange, onValueChange, id, required, 'aria-describedby': describedBy, 'aria-invalid': invalid, 'aria-label': ariaLabel, 'aria-labelledby': labelledBy, ...rest },
  ref
) {
  const a11y = useFieldControl({ id, required, 'aria-describedby': describedBy, 'aria-invalid': invalid, 'aria-label': ariaLabel, 'aria-labelledby': labelledBy });
  const input = (
    <input
      ref={ref}
      className={cx('a-input', size !== 'md' && 'a-input--' + size, className)}
      onChange={e => { onChange?.(e); onValueChange?.(e.target.value); }}
      {...a11y}
      {...rest}
    />
  );
  return prefix ? <span className="a-input-wrap">{prefix}{input}</span> : input;
});

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** 欄位標籤 */
  label?: React.ReactNode;
  /** 說明文字 */
  help?: React.ReactNode;
  /** 錯誤訊息；有值時整組變成錯誤樣式，並取代說明文字 */
  error?: React.ReactNode;
  /** 外層元素：包單一輸入框用 label（預設），包多個控制項時用 div */
  as?: 'label' | 'div';
  /** 控制項的 id；不給會自動產生。as="div" 時標籤用它指向控制項 */
  htmlFor?: string;
  /** 必填：在控制項加上 required，標籤後加上 * */
  required?: boolean;
  children?: React.ReactNode;
}

/**
 * 表單欄位外層：標籤＋控制項＋說明／錯誤。
 * 裡面的 Input／Select／Textarea 會自動拿到 id、aria-describedby（指向說明或錯誤）與 aria-invalid。
 */
export const Field = React.forwardRef<HTMLElement, FieldProps>(function Field(
  { label, help, error, as = 'label', htmlFor, required, className, children, ...rest },
  ref
) {
  const Tag = as as 'label';
  const auto = useId('field');
  const controlId = htmlFor ?? auto;
  const msgId = controlId + '-msg';
  const labelId = controlId + '-label';
  const hasError = error != null && error !== false;
  const msg = hasError ? error : help;
  const hasMsg = msg != null && msg !== false;
  const ctx = React.useMemo(
    () => ({ id: controlId, describedBy: hasMsg ? msgId : undefined, labelledBy: label != null ? labelId : undefined, invalid: hasError, required }),
    [controlId, msgId, labelId, label != null, hasMsg, hasError, required]
  );
  const labelText = label != null && <>{label}{required && <span aria-hidden="true"> *</span>}</>;
  return (
    <Tag ref={ref as React.Ref<HTMLLabelElement>} className={cx('a-field', hasError && 'is-error', className)} {...rest}>
      {label != null && (as === 'div'
        ? <label className="a-label" htmlFor={controlId} id={labelId}>{labelText}</label>
        : <span className="a-label" id={labelId}>{labelText}</span>)}
      <FieldContext.Provider value={ctx}>{children}</FieldContext.Provider>
      {hasMsg && <span className="a-help" id={msgId} role={hasError ? 'alert' : undefined}>{msg}</span>}
    </Tag>
  );
});
