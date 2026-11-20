import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';

export interface TooltipProps {
  /** 提示文字（純 CSS 顯示，只支援文字） */
  title: string;
  placement?: 'top' | 'bottom';
  /**
   * 一般會把屬性加在子元素上；子元素是 input、img 等無法有 ::after 的元素，
   * 或不是單一元素時，會自動包一層 span。
   */
  children: ReactNode;
  /** 強制包一層 span */
  wrap?: boolean;
}

const VOID = new Set(['input', 'img', 'textarea', 'select', 'br', 'hr', 'video', 'iframe']);

/** 文字提示。滑鼠停留 300ms 或鍵盤聚焦時顯示（樣式來自 aicde-ui.css 的 [data-a-tip]） */
export function Tooltip({ title, placement = 'top', children, wrap }: TooltipProps) {
  const attrs = {
    'data-a-tip': title,
    'data-a-tip-pos': placement === 'bottom' ? 'bottom' : undefined,
    'aria-description': title
  };
  const el = children as ReactElement<Record<string, unknown>>;
  const canClone = !wrap && isValidElement(children) && typeof el.type === 'string' && !VOID.has(el.type);
  if (canClone) return cloneElement(el, attrs);
  return <span tabIndex={0} style={{ display: 'inline-block' }} {...attrs}>{children}</span>;
}
