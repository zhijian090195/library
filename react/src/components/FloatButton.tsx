import * as React from 'react';
import { cx, useReducedMotion } from '../utils';

export interface FloatButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  color?: 'coral' | 'navy';
  size?: 'md' | 'sm';
  /** 帶文字的膠囊形狀 */
  extended?: boolean;
  /** 不固定在右下角，跟著版面排列 */
  static?: boolean;
  icon?: React.ReactNode;
}

export const FloatButton = React.forwardRef<HTMLButtonElement, FloatButtonProps>(function FloatButton(
  { color = 'coral', size = 'md', extended, static: isStatic, icon, className, children, type = 'button', ...rest }, ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx('a-fab', color === 'navy' && 'a-fab--navy', size === 'sm' && 'a-fab--sm', extended && 'a-fab--extended', isStatic && 'a-fab--static', className)}
      {...rest}
    >
      {icon}
      {extended && children}
    </button>
  );
});

const UP = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>;

export interface BackTopProps extends Omit<FloatButtonProps, 'extended' | 'static'> {
  /** 捲動超過多少 px 才出現 */
  threshold?: number;
}

/** 回到頂部：捲動超過 threshold 後出現 */
export function BackTop({ threshold = 300, className, onClick, color = 'navy', icon = UP, ...rest }: BackTopProps) {
  const [visible, setVisible] = React.useState(false);
  const reduce = useReducedMotion();
  React.useEffect(() => {
    const on = () => setVisible(window.scrollY > threshold);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [threshold]);
  return (
    <FloatButton
      aria-label="回到頂部"
      color={color}
      icon={icon}
      className={cx('a-backtop', visible && 'is-visible', className)}
      tabIndex={visible ? undefined : -1}
      onClick={e => { onClick?.(e); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }}
      {...rest}
    />
  );
}
