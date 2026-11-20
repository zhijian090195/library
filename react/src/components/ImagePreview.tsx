import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ButtonHTMLAttributes } from 'react';
import { cx, useReducedMotion } from '../utils';

export interface ImagePreviewProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  src: string;
  /** 大圖網址，預設與 src 相同 */
  previewSrc?: string;
  /** 替代文字，也會顯示為大圖說明 */
  alt: string;
  width?: number | string;
  height?: number | string;
}

const EASE = 'cubic-bezier(0.22,1,0.36,1)';

/** 圖片預覽：點縮圖後，大圖從縮圖的位置放大；關閉時縮回原位 */
export const ImagePreview = forwardRef<HTMLButtonElement, ImagePreviewProps>(function ImagePreview(
  { src, previewSrc, alt, width = 160, height = 110, className, style, onClick, ...rest }, ref
) {
  const reduce = useReducedMotion();
  const thumb = useRef<HTMLButtonElement>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const big = useRef<HTMLImageElement>(null);
  const [open, setOpen] = useState(false);
  const closing = useRef(false);
  useImperativeHandle(ref, () => thumb.current as HTMLButtonElement);

  const fromThumb = (): Keyframe | null => {
    const t = thumb.current?.querySelector('img'), b = big.current;
    if (!t || !b) return null;
    const a = t.getBoundingClientRect(), z = b.getBoundingClientRect();
    if (!z.width) return null;
    const s = a.width / z.width;
    return { transform: `translate(${a.left + a.width / 2 - (z.left + z.width / 2)}px, ${a.top + a.height / 2 - (z.top + z.height / 2)}px) scale(${s})`, opacity: .5 };
  };

  useEffect(() => {
    const d = dlg.current; if (!d || !open) return;
    if (!d.open) d.showModal?.();
    closing.current = false;
    const k = fromThumb();
    if (k && !reduce && big.current?.animate) big.current.animate([k, { transform: 'none', opacity: 1 }], { duration: 340, easing: EASE });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    const d = dlg.current; if (!d || closing.current) return;
    closing.current = true;
    const finish = () => { d.classList.remove('is-closing'); d.close(); setOpen(false); thumb.current?.focus(); };
    const k = fromThumb();
    if (!k || reduce || !big.current?.animate) { finish(); return; }
    d.classList.add('is-closing');
    big.current.animate([{ transform: 'none', opacity: 1 }, k], { duration: 200, easing: EASE, fill: 'forwards' }).onfinish = finish;
  };

  return (
    <>
      <button
        ref={thumb}
        type="button"
        className={cx('a-image', className)}
        style={{ width, height, ...style }}
        aria-haspopup="dialog"
        onClick={e => { onClick?.(e); if (!e.defaultPrevented) setOpen(true); }}
        {...rest}
      >
        <img src={src} alt={alt} loading="lazy" />
      </button>
      {open && (
        <dialog
          ref={dlg}
          className="a-lightbox"
          aria-label={alt}
          onCancel={e => { e.preventDefault(); close(); }}
          onClick={close}
        >
          <figure>
            <img ref={big} src={previewSrc ?? src} alt={alt} />
            <figcaption>{alt}</figcaption>
          </figure>
          <button type="button" className="a-lightbox__close" aria-label="關閉" onClick={e => { e.stopPropagation(); close(); }}>×</button>
        </dialog>
      )}
    </>
  );
});
