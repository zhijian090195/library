import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils';

export interface EmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** 行動按鈕 */
  action?: ReactNode;
}

const BOX = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7l9-4 9 4-9 4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></svg>;

export const Empty = forwardRef<HTMLDivElement, EmptyProps>(function Empty({ icon = BOX, title = '沒有資料', description, action, className, ...rest }, ref) {
  return (
    <div ref={ref} className={cx('a-empty', className)} {...rest}>
      <div className="a-empty__icon">{icon}</div>
      <h3 className="a-empty__title">{title}</h3>
      {description != null && <p className="a-empty__text">{description}</p>}
      {action}
    </div>
  );
});
