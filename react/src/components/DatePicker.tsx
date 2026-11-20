import * as React from 'react';
import { Input, type InputProps } from './Input';

export interface DatePickerProps extends Omit<InputProps, 'type'> {
  /** 原生日期類型 */
  type?: 'date' | 'time' | 'month' | 'datetime-local';
}

/** 日期／時間輸入，用原生 input，手機會跳出系統選擇器。值格式與原生相同（例如 2026-11-20）。 */
export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker({ type = 'date', ...rest }, ref) {
  return <Input ref={ref} type={type} {...rest} />;
});

export interface DateRangeInputsProps {
  start?: DatePickerProps;
  end?: DatePickerProps;
  /** 中間的分隔，預設箭頭 */
  separator?: React.ReactNode;
  className?: string;
}

/** 兩個日期輸入框並排；結束日自動以開始日作為 min。 */
export function DateRangeInputs({ start = {}, end = {}, separator = '→', className }: DateRangeInputsProps) {
  const startVal = (start.value ?? undefined) as string | undefined;
  return (
    <div className={['a-date-range', className].filter(Boolean).join(' ')}>
      <DatePicker {...start} />
      <span aria-hidden="true">{separator}</span>
      <DatePicker min={startVal} {...end} />
    </div>
  );
}
