import * as React from 'react';
import { cx, useId } from '../utils';
import { mergeRefs, useDialog } from '../useDialog';

export interface ModalProps extends Omit<React.ComponentPropsWithoutRef<'dialog'>, 'title' | 'open'> {
  open: boolean;
  /** 按 Esc、點背景或呼叫關閉時觸發 */
  onClose: () => void;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  /** 點背景是否關閉 */
  closeOnBackdrop?: boolean;
  /** 開啟時要聚焦的元素；不給時依序找 autoFocus、第一個可聚焦元素 */
  initialFocus?: React.RefObject<HTMLElement | null>;
  /** 開啟時鎖住頁面捲動，預設 true */
  lockScroll?: boolean;
}

/**
 * 對話框：原生 dialog（瀏覽器頂層，不需要 portal）。
 * 開啟時焦點移進對話框並在裡面循環，Esc 與點背景呼叫 onClose，關閉後焦點回到開啟它的按鈕，開啟期間鎖住頁面捲動。
 */
export const Modal = React.forwardRef<HTMLDialogElement, ModalProps>(function Modal(
  { open, onClose, title, footer, closeOnBackdrop = true, initialFocus, lockScroll, className, children, ...rest },
  forwarded
) {
  const { ref, onClick } = useDialog(open, onClose, closeOnBackdrop, { initialFocus, lockScroll });
  const titleId = useId('modal');
  const bodyId = titleId + '-body';
  const merged = React.useMemo(() => mergeRefs(ref, forwarded), [ref, forwarded]);
  return (
    <dialog
      ref={merged}
      onClick={onClick}
      className={cx('a-modal', className)}
      aria-labelledby={title != null ? titleId : undefined}
      aria-describedby={bodyId}
      aria-modal="true"
      {...rest}
    >
      <div className="a-modal__panel">
        {title != null && <h3 className="a-modal__title" id={titleId}>{title}</h3>}
        <div className="a-modal__body" id={bodyId}>{children}</div>
        {footer != null && <div className="a-modal__footer">{footer}</div>}
      </div>
    </dialog>
  );
});
