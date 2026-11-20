import * as React from 'react';

/** 內部用：Field 把 id、說明文字 id、錯誤狀態傳給裡面的 Input／Select／Textarea */
export interface FieldContextValue {
  id: string;
  describedBy?: string;
  /** 標籤文字的 id；外層是 <label> 時，說明文字也會被算進名稱，所以改用 aria-labelledby 只指向標籤 */
  labelledBy?: string;
  invalid: boolean;
  required?: boolean;
}

export const FieldContext = React.createContext<FieldContextValue | null>(null);

/** 合併 Field 提供的 aria 屬性與元件自己的 props；元件明確傳入的值優先 */
export function useFieldControl(props: {
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: React.AriaAttributes['aria-invalid'];
  'aria-label'?: string;
  'aria-labelledby'?: string;
  required?: boolean;
}) {
  const f = React.useContext(FieldContext);
  const describedBy = [props['aria-describedby'], f?.describedBy].filter(Boolean).join(' ') || undefined;
  return {
    id: props.id ?? f?.id,
    'aria-labelledby': props['aria-labelledby'] ?? (props['aria-label'] ? undefined : f?.labelledBy),
    'aria-label': props['aria-label'],
    'aria-describedby': describedBy,
    'aria-invalid': props['aria-invalid'] ?? (f?.invalid ? true : undefined),
    required: props.required ?? f?.required,
  };
}
