import { forwardRef, useState, type HTMLAttributes } from 'react';
import { cx, useReducedMotion } from '../utils';

export type TagColor = 'default' | 'coral' | 'navy' | 'success' | 'outline';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  color?: TagColor;
  /** 前面加圓點，適合狀態 */
  dot?: boolean;
  /** 顯示 × 按鈕，點擊後縮小淡出再移除 */
  closable?: boolean;
  /** 退場動畫結束後呼叫 */
  onClose?: () => void;
  closeLabel?: string;
}

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { color = 'default', dot, closable, onClose, closeLabel, className, children, ...rest }, ref
) {
  const reduce = useReducedMotion();
  const [removing, setRemoving] = useState(false);
  const [gone, setGone] = useState(false);
  if (gone) return null;
  const close = () => {
    if (removing) return;
    setRemoving(true);
    setTimeout(() => { setGone(true); onClose?.(); }, reduce ? 0 : 160);
  };
  return (
    <span ref={ref} className={cx('a-tag', color !== 'default' && `a-tag--${color}`, dot && 'a-tag--dot', removing && 'is-removing', className)} {...rest}>
      {children}
      {closable && (
        <button type="button" className="a-tag__close" aria-label={closeLabel ?? (typeof children === 'string' ? `移除${children}` : '移除')} onClick={close}>×</button>
      )}
    </span>
  );
});
