import * as React from 'react';
import { cx } from '../utils';

const ICONS = {
  success: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12.5l4 4L18 8" /></svg>,
  error: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17" /></svg>,
  info: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 11v6M12 7h.01" /></svg>
};

export interface ResultProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> {
  status?: 'success' | 'error' | 'info';
  title: React.ReactNode;
  description?: React.ReactNode;
  /** 底部的操作按鈕 */
  actions?: React.ReactNode;
  icon?: React.ReactNode;
}

export const Result = React.forwardRef<HTMLDivElement, ResultProps>(function Result(
  { status = 'success', title, description, actions, icon, className, children, ...rest }, ref
) {
  return (
    <div ref={ref} className={cx('a-result', status !== 'success' && 'a-result--' + status, className)} {...rest}>
      <div className="a-result__icon">{icon ?? ICONS[status]}</div>
      <h3 className="a-result__title">{title}</h3>
      {description != null && <p className="a-result__text">{description}</p>}
      {children}
      {actions != null && <div className="a-result__actions">{actions}</div>}
    </div>
  );
});
