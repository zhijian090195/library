import * as React from 'react';
import { cx, useControllable, useId } from '../utils';

export type AutocompleteOption = string | { value: string; label?: string };

export interface AutocompleteProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'value' | 'defaultValue' | 'onChange' | 'onSelect' | 'size'> {
  options: AutocompleteOption[];
  /** 輸入框的文字 */
  value?: string;
  defaultValue?: string;
  /** 輸入框文字改變時 */
  onChange?: (text: string) => void;
  /** 選中某個選項時，回傳選項的 value */
  onSelect?: (value: string) => void;
  /** 沒有符合結果時的文字 */
  emptyText?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** 外層 class */
  wrapperClassName?: string;
}

const norm = (o: AutocompleteOption) => typeof o === 'string' ? { value: o, label: o } : { value: o.value, label: o.label ?? o.value };

function highlight(label: string, q: string): React.ReactNode {
  if (!q) return label;
  const k = label.toLowerCase().indexOf(q.toLowerCase());
  if (k < 0) return label;
  return <>{label.slice(0, k)}<mark>{label.slice(k, k + q.length)}</mark>{label.slice(k + q.length)}</>;
}

/** 自動完成：邊打字邊篩選，符合的字標成珊瑚紅；上下鍵移動、Enter 選取、Esc 關閉。 */
export const Autocomplete = React.forwardRef<HTMLInputElement, AutocompleteProps>(function Autocomplete(
  { options, value, defaultValue = '', onChange, onSelect, emptyText = '沒有符合的結果', size = 'md', className, wrapperClassName, onFocus, onBlur, onKeyDown, ...rest },
  ref
) {
  const id = useId('combo');
  const [text, setText] = useControllable<string>(value, defaultValue, onChange);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const listRef = React.useRef<HTMLUListElement>(null);
  const q = text.trim();
  const items = options.map(norm).filter(o => !q || o.label.toLowerCase().includes(q.toLowerCase()));
  React.useEffect(() => {
    if (active < 0 || !listRef.current) return;
    const el = listRef.current.children[active] as HTMLElement | undefined;
    el?.scrollIntoView?.({ block: 'nearest' });
  }, [active]);
  const pick = (o: { value: string; label: string }) => { setText(o.label); setOpen(false); setActive(-1); onSelect?.(o.value); };
  return (
    <div className={cx('a-combo', open && 'is-open', wrapperClassName)}>
      <input
        ref={ref}
        className={cx('a-input', size !== 'md' && 'a-input--' + size, className)}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={id}
        aria-activedescendant={active >= 0 && items[active] ? id + '-' + active : undefined}
        autoComplete="off"
        value={text}
        onChange={e => { setText(e.target.value); setOpen(true); setActive(-1); }}
        onFocus={e => { setOpen(true); onFocus?.(e); }}
        onBlur={e => { setOpen(false); setActive(-1); onBlur?.(e); }}
        onKeyDown={e => {
          onKeyDown?.(e);
          if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive(a => Math.min(items.length - 1, a + 1)); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
          else if (e.key === 'Enter' && open && items[active]) { e.preventDefault(); pick(items[active]); }
          else if (e.key === 'Escape') { setOpen(false); setActive(-1); }
        }}
        {...rest}
      />
      <ul className="a-combo__list" role="listbox" id={id} ref={listRef}>
        {items.map((o, i) => (
          <li key={o.value} id={id + '-' + i} role="option" aria-selected={i === active}
            onMouseDown={e => { e.preventDefault(); pick(o); }}
            onMouseEnter={() => setActive(i)}>
            {highlight(o.label, q)}
          </li>
        ))}
        {items.length === 0 && <li className="a-combo__empty">{emptyText}</li>}
      </ul>
    </div>
  );
});
