import * as React from 'react';
import { cx, useControllable, useId } from '../utils';

export interface PopoverProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'title' | 'content'> {
  /** 觸發元素（通常是 Button） */
  children: React.ReactElement;
  content: React.ReactNode;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type PopEl = HTMLDivElement & { showPopover?: () => void; hidePopover?: () => void };
const supports = () => typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;

/** 點擊後在觸發元素下方顯示的小卡片；用原生 popover（點外面、Esc 自動關閉），不支援時退回一般定位 */
export function Popover({ children, content, title, footer, open, defaultOpen = false, onOpenChange, className, style, ...rest }: PopoverProps) {
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const popRef = React.useRef<PopEl>(null);
  const trigRef = React.useRef<HTMLElement | null>(null);
  const id = useId('pop');
  const [native, setNative] = React.useState(true);

  const place = React.useCallback(() => {
    const pop = popRef.current, inv = trigRef.current;
    if (!pop || !inv) return;
    const r = inv.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
    let left = r.left;
    if (w && left + w > window.innerWidth - 16) left = Math.max(16, r.right - w);
    const below = r.bottom + 8;
    const top = h && below + h > window.innerHeight - 16 && r.top - 8 - h > 16 ? r.top - 8 - h : below;
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
  }, []);

  React.useEffect(() => { setNative(supports()); }, []);

  // 開關同步到原生 popover
  React.useLayoutEffect(() => {
    const pop = popRef.current;
    if (!pop || !native) return;
    const shown = pop.matches(':popover-open');
    if (isOpen && !shown) { pop.showPopover?.(); place(); }
    if (!isOpen && shown) pop.hidePopover?.();
  }, [isOpen, native, place]);

  // 原生 light dismiss（點外面、Esc）回報給 state
  React.useEffect(() => {
    const pop = popRef.current;
    if (!pop || !native) return;
    const onToggle = (e: Event) => {
      const ns = (e as Event & { newState?: string }).newState;
      if (ns === 'open') place();
      if (ns === 'closed' && isOpen) setOpen(false);
    };
    pop.addEventListener('toggle', onToggle);
    return () => pop.removeEventListener('toggle', onToggle);
  }, [native, isOpen, setOpen, place]);

  // 不支援 popover 時：自己處理點外面與 Esc
  React.useEffect(() => {
    if (native || !isOpen) return;
    place();
    const onDoc = (e: MouseEvent) => { const t = e.target as Node; if (!popRef.current?.contains(t) && !trigRef.current?.contains(t)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [native, isOpen, setOpen, place]);

  React.useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('scroll', place, { passive: true, capture: true });
    window.addEventListener('resize', place);
    return () => { window.removeEventListener('scroll', place, { capture: true }); window.removeEventListener('resize', place); };
  }, [isOpen, place]);

  const trig = children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void; ref?: React.Ref<HTMLElement> }>;
  const trigger = React.cloneElement(trig, {
    ref: (el: HTMLElement | null) => { trigRef.current = el; },
    'aria-expanded': isOpen,
    'aria-controls': id,
    'aria-haspopup': 'dialog',
    onClick: (e: React.MouseEvent) => {
      trig.props.onClick?.(e);
      // 原生 light dismiss 會在 pointerdown 時先關掉；這裡用目前的實際狀態切換
      const shown = native ? !!popRef.current?.matches(':popover-open') : isOpen;
      setOpen(!shown);
    }
  } as Record<string, unknown>);

  const fallbackStyle: React.CSSProperties | undefined = native ? undefined
    : { display: isOpen ? 'block' : 'none', opacity: 1, transform: 'none', zIndex: 60 };

  return (
    <>
      {trigger}
      <div
        ref={popRef}
        id={id}
        role="dialog"
        {...(native ? { popover: 'auto' } : {})}
        className={cx('a-popover', className)}
        style={{ ...fallbackStyle, ...style }}
        {...rest}
      >
        {title != null && <b className="a-popover__title">{title}</b>}
        {content}
        {footer != null && <div className="a-popover__footer">{footer}</div>}
      </div>
    </>
  );
}
