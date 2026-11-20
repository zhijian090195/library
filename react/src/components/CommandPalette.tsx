import * as React from 'react';
import { cx, useControllable, useId } from '../utils';
import { useDialog } from '../useDialog';

export interface CommandItem {
  key: string;
  label: React.ReactNode;
  /** 額外的搜尋關鍵字 */
  keywords?: string;
  /** 右側快捷鍵提示，例如 '⇧D' */
  shortcut?: string;
  icon?: React.ReactNode;
  href?: string;
  onSelect?: () => void;
}

export interface CommandGroup {
  label: React.ReactNode;
  items: CommandItem[];
}

export interface CommandPaletteProps {
  groups: CommandGroup[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  emptyText?: React.ReactNode;
  /** 允許 ⌘K／Ctrl+K 開關 */
  hotkey?: boolean;
  /** 顯示底部的鍵盤操作提示 */
  showFooter?: boolean;
  className?: string;
  'aria-label'?: string;
}

const text = (n: React.ReactNode): string =>
  typeof n === 'string' || typeof n === 'number' ? String(n)
    : Array.isArray(n) ? n.map(text).join(' ')
      : React.isValidElement<{ children?: React.ReactNode }>(n) ? text(n.props.children) : '';

export function CommandPalette({
  groups, open, defaultOpen = false, onOpenChange, placeholder = '搜尋指令…', emptyText = '沒有符合的指令',
  hotkey = true, showFooter = true, className, 'aria-label': label = '指令面板'
}: CommandPaletteProps) {
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const { ref, onClick } = useDialog(isOpen, () => setOpen(false));
  const [q, setQ] = React.useState('');
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const id = useId('cmd');

  React.useEffect(() => {
    if (!hotkey) return;
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(!isOpen); }
    };
    document.addEventListener('keydown', on);
    return () => document.removeEventListener('keydown', on);
  }, [hotkey, isOpen, setOpen]);

  React.useEffect(() => {
    if (isOpen) { setQ(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 0); }
  }, [isOpen]);

  const query = q.trim().toLowerCase();
  const filtered = groups
    .map(g => ({ ...g, items: g.items.filter(it => !query || (text(it.label) + ' ' + (it.keywords ?? '')).toLowerCase().includes(query)) }))
    .filter(g => g.items.length);
  const flat = filtered.flatMap(g => g.items);

  React.useEffect(() => { setActive(0); }, [query]);
  React.useEffect(() => {
    listRef.current?.querySelector('[aria-selected=true]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const run = (it: CommandItem) => {
    it.onSelect?.();
    if (it.href) window.location.href = it.href;
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(flat.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
    else if (e.key === 'Enter' && flat[active]) { e.preventDefault(); run(flat[active]); }
  };

  let n = -1;
  return (
    <dialog ref={ref} onClick={onClick} className={cx('a-command', className)} aria-label={label}>
      <div className="a-command__search">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input
          ref={inputRef}
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="搜尋"
          role="combobox"
          aria-expanded={true}
          aria-controls={id}
          aria-activedescendant={flat[active] ? id + '-' + flat[active].key : undefined}
        />
      </div>
      <div className="a-command__list" role="listbox" id={id} ref={listRef}>
        {filtered.map((g, gi) => (
          <React.Fragment key={gi}>
            <div className="a-command__group">{g.label}</div>
            {g.items.map(it => {
              const idx = ++n;
              return (
                <button
                  key={it.key}
                  id={id + '-' + it.key}
                  type="button"
                  role="option"
                  className="a-command__item"
                  aria-selected={idx === active}
                  tabIndex={-1}
                  onMouseMove={() => setActive(idx)}
                  onClick={() => run(it)}
                >
                  {it.icon}{it.label}
                  {it.shortcut && <kbd className="a-kbd">{it.shortcut}</kbd>}
                </button>
              );
            })}
          </React.Fragment>
        ))}
        {!flat.length && <div className="a-command__empty">{emptyText}</div>}
      </div>
      {showFooter && (
        <div className="a-command__foot">
          <span><kbd className="a-kbd">↑</kbd><kbd className="a-kbd">↓</kbd>移動</span>
          <span><kbd className="a-kbd">↵</kbd>執行</span>
          <span><kbd className="a-kbd">Esc</kbd>關閉</span>
        </div>
      )}
    </dialog>
  );
}
