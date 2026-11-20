import * as React from 'react';
import { cx, useId } from '../utils';
import { useDialog } from '../useDialog';

export interface DrawerProps extends Omit<React.ComponentPropsWithoutRef<'dialog'>, 'title' | 'open'> {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  side?: 'right' | 'left';
  closeOnBackdrop?: boolean;
  /** 隱藏右上角的關閉按鈕 */
  hideClose?: boolean;
}

export function Drawer({ open, onClose, title, footer, side = 'right', closeOnBackdrop = true, hideClose, className, children, ...rest }: DrawerProps) {
  const { ref, onClick } = useDialog(open, onClose, closeOnBackdrop);
  const titleId = useId('drawer');
  return (
    <dialog ref={ref} onClick={onClick} className={cx('a-drawer', side === 'left' && 'a-drawer--left', className)} aria-labelledby={title ? titleId : undefined} {...rest}>
      <div className="a-drawer__panel">
        {(title != null || !hideClose) && (
          <div className="a-drawer__header">
            <h3 className="a-drawer__title" id={titleId}>{title}</h3>
            {!hideClose && <button type="button" className="a-btn a-btn--ghost a-btn--icon a-btn--sm" aria-label="關閉" onClick={onClose}>×</button>}
          </div>
        )}
        <div className="a-drawer__body">{children}</div>
        {footer != null && <div className="a-drawer__footer">{footer}</div>}
      </div>
    </dialog>
  );
}
