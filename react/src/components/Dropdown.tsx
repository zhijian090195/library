import * as React from 'react';
import { cx, useControllable, useId } from '../utils';

export interface DropdownItem {
  key: string;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  /** 分隔線 */
  divider?: boolean;
  onClick?: () => void;
}

export interface DropdownProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onSelect'> {
  /** 觸發元素（通常是 Button），會自動加上點擊與 aria 屬性 */
  trigger: React.ReactElement;
  items: DropdownItem[];
  align?: 'left' | 'right';
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (key: string) => void;
}

export function Dropdown({ trigger, items, align = 'left', open, defaultOpen = false, onOpenChange, onSelect, className, ...rest }: DropdownProps) {
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const id = useId('dd');

  React.useEffect(() => {
    if (!isOpen) return;
    const onDoc = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onDoc); document.removeEventListener('keydown', onKey); };
  }, [isOpen, setOpen]);

  const trig = trigger as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
  const triggerEl = React.cloneElement(trig, {
    'aria-haspopup': 'menu',
    'aria-expanded': isOpen,
    'aria-controls': id,
    onClick: (e: React.MouseEvent) => { trig.props.onClick?.(e); setOpen(!isOpen); }
  } as Record<string, unknown>);

  const onMenuKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const its = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role=menuitem]:not(:disabled)'));
    const k = its.indexOf(document.activeElement as HTMLElement);
    its[(k + (e.key === 'ArrowDown' ? 1 : -1) + its.length) % its.length]?.focus();
  };

  return (
    <div ref={rootRef} className={cx('a-dropdown', align === 'right' && 'a-dropdown--right', isOpen && 'is-open', className)} {...rest}>
      {triggerEl}
      <div className="a-dropdown__menu" role="menu" id={id} onKeyDown={onMenuKey}>
        {items.map(it => it.divider
          ? <div key={it.key} className="a-dropdown__sep" role="separator" />
          : (
            <button
              key={it.key}
              type="button"
              role="menuitem"
              className={cx(it.danger && 'is-danger')}
              disabled={it.disabled}
              tabIndex={isOpen ? 0 : -1}
              onClick={() => { it.onClick?.(); onSelect?.(it.key); setOpen(false); }}
            >
              {it.icon}{it.label}
            </button>
          ))}
      </div>
    </div>
  );
}
