import * as React from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../utils';

export interface ContextMenuItem {
  key: string;
  label?: React.ReactNode;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

export interface ContextMenuProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onSelect'> {
  items: ContextMenuItem[];
  onSelect?: (key: string) => void;
}

/** 在包住的區域按右鍵，於游標位置顯示選單；靠近邊緣時往反方向展開 */
export function ContextMenu({ items, onSelect, children, onContextMenu, className, ...rest }: ContextMenuProps) {
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null);
  const [placed, setPlaced] = React.useState<{ left: number; top: number; origin: string } | null>(null);
  const [shown, setShown] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const m = menuRef.current;
    if (!pos || !m) { setPlaced(null); return; }
    const w = m.offsetWidth, h = m.offsetHeight;
    const x = pos.x + w > window.innerWidth - 8 ? pos.x - w : pos.x;
    const y = pos.y + h > window.innerHeight - 8 ? pos.y - h : pos.y;
    setPlaced({ left: Math.max(8, x), top: Math.max(8, y), origin: (x < pos.x ? 'right' : 'left') + ' ' + (y < pos.y ? 'bottom' : 'top') });
  }, [pos]);

  React.useEffect(() => {
    if (!placed) { setShown(false); return; }
    setShown(false);
    const r = requestAnimationFrame(() => setShown(true));   // 下一幀再加 is-open，進場動畫才會播放
    return () => cancelAnimationFrame(r);
  }, [placed]);

  React.useEffect(() => {
    if (shown) menuRef.current?.querySelector<HTMLElement>('[role=menuitem]:not(:disabled)')?.focus({ preventScroll: true });
  }, [shown]);

  React.useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    const onDoc = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) close(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, { capture: true, passive: true });
    window.addEventListener('blur', close);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, { capture: true });
      window.removeEventListener('blur', close);
    };
  }, [pos]);

  const onMenuKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const its = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role=menuitem]:not(:disabled)'));
    const k = its.indexOf(document.activeElement as HTMLElement);
    its[(k + (e.key === 'ArrowDown' ? 1 : -1) + its.length) % its.length]?.focus();
  };

  const menu = pos && typeof document !== 'undefined' ? createPortal(
    <div
      ref={menuRef}
      className={cx('a-context', shown && 'is-open')}
      role="menu"
      style={{ left: placed?.left ?? pos.x, top: placed?.top ?? pos.y, transformOrigin: placed?.origin }}
      onKeyDown={onMenuKey}
    >
      {items.map(it => it.divider
        ? <div key={it.key} className="a-context__sep" role="separator" />
        : (
          <button key={it.key} type="button" role="menuitem" className={cx(it.danger && 'is-danger')} disabled={it.disabled}
            onClick={() => { it.onClick?.(); onSelect?.(it.key); setPos(null); }}>
            {it.label}{it.shortcut && <kbd className="a-kbd">{it.shortcut}</kbd>}
          </button>
        ))}
    </div>,
    document.body
  ) : null;

  return (
    <div
      className={className}
      onContextMenu={e => { onContextMenu?.(e); if (e.defaultPrevented) return; e.preventDefault(); setPos({ x: e.clientX, y: e.clientY }); }}
      {...rest}
    >
      {children}
      {menu}
    </div>
  );
}
