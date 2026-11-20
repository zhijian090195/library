import * as React from 'react';
import { cx } from '../utils';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

const ICONS: Record<AlertType, React.ReactNode> = {
  info: <svg className="a-alert__icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>,
  success: <svg className="a-alert__icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></svg>,
  warning: <svg className="a-alert__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 2.5 20h19z" /><path d="M12 10v4M12 17h.01" /></svg>,
  error: <svg className="a-alert__icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
};

export interface AlertProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> {
  type?: AlertType;
  title?: React.ReactNode;
  /** 自訂圖示；傳 null 隱藏 */
  icon?: React.ReactNode;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { type = 'info', title, icon, className, children, role, ...rest }, ref
) {
  return (
    <div ref={ref} role={role ?? (type === 'error' ? 'alert' : 'status')} className={cx('a-alert', type !== 'info' && 'a-alert--' + type, className)} {...rest}>
      {icon === undefined ? ICONS[type] : icon}
      <div className="a-alert__content">
        {title != null && <b className="a-alert__title">{title}</b>}
        {children}
      </div>
    </div>
  );
});
