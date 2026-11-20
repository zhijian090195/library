import * as React from 'react';
import { cx } from '../utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 顯示載入中轉圈並暫停點擊。按鈕仍保留焦點與名稱（aria-disabled + aria-busy），鍵盤使用者不會失去位置 */
  loading?: boolean;
  /** 放在文字前面的圖示 */
  icon?: React.ReactNode;
  /** 只有圖示的方形按鈕（記得加 aria-label） */
  iconOnly?: boolean;
  /** 撐滿父層寬度 */
  block?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'outline', size = 'md', loading, icon, iconOnly, block, className, children, disabled, type = 'button', onClick, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        'a-btn',
        'a-btn--' + variant,
        size !== 'md' && 'a-btn--' + size,
        iconOnly && 'a-btn--icon',
        block && 'a-btn--block',
        loading && 'is-loading',
        className
      )}
      disabled={disabled}
      aria-disabled={loading && !disabled ? true : undefined}
      aria-busy={loading || undefined}
      onClick={e => {
        // 載入中：擋掉點擊與表單送出，但不用原生 disabled，焦點才不會跳走
        if (loading) { e.preventDefault(); return; }
        onClick?.(e);
      }}
      {...rest}
    >
      {!loading && icon}
      {children}
    </button>
  );
});
