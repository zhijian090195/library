import * as React from 'react';
import { cx, useControllable, useId } from '../utils';

export interface CascaderOption {
  value: string;
  label?: string;
  children?: CascaderOption[];
  disabled?: boolean;
}

export interface CascaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  options: CascaderOption[];
  /** 選取路徑，例如 ['tw', 'taipei', 'xinyi'] */
  value?: string[];
  defaultValue?: string[];
  onChange?: (path: string[], labels: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  /** 路徑標籤的分隔，預設 " / " */
  separator?: string;
}

const labelOf = (o: CascaderOption) => o.label ?? o.value;

function resolve(options: CascaderOption[], path: string[]): CascaderOption[] {
  const out: CascaderOption[] = [];
  let level: CascaderOption[] | undefined = options;
  for (const v of path) {
    const hit: CascaderOption | undefined = level?.find(o => o.value === v);
    if (!hit) break;
    out.push(hit);
    level = hit.children;
  }
  return out;
}

/** 多層選擇（縣市 → 區域…）。只有選到最末層才算完成；點外面或按 Esc 關閉。外層請用 div，不要用 label。 */
export function Cascader({ options, value, defaultValue = [], onChange, placeholder = '請選擇', disabled, separator = ' / ', className, ...rest }: CascaderProps) {
  const id = useId('cas');
  const [path, setPath] = useControllable<string[]>(value, defaultValue);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<string[]>(path);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!(t as Element).isConnected) return;
      if (rootRef.current && !rootRef.current.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); } };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const chosen = resolve(options, path);
  const text = chosen.length ? chosen.map(labelOf).join(separator) : placeholder;
  const activeOpts = resolve(options, active);
  const cols: CascaderOption[][] = [options];
  activeOpts.forEach(o => { if (o.children?.length) cols.push(o.children); });

  const choose = (depth: number, o: CascaderOption) => {
    const next = [...active.slice(0, depth), o.value];
    setActive(next);
    if (!o.children?.length) {
      const opts = resolve(options, next);
      setPath(next);
      onChange?.(next, opts.map(labelOf));
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div ref={rootRef} className={cx('a-cascader', open && 'is-open', className)} {...rest}>
      <button
        ref={triggerRef}
        type="button"
        className={cx('a-input', 'a-select', 'a-cascader__trigger', !chosen.length && 'is-empty')}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        disabled={disabled}
        onClick={() => { setActive(path); setOpen(o => !o); }}
      >
        <span>{text}</span>
      </button>
      <div className="a-cascader__panel" id={id} aria-hidden={!open || undefined} onClick={e => e.preventDefault()}>
        {cols.map((col, depth) => (
          <ul key={depth} className="a-cascader__col" role="listbox">
            {col.map(o => {
              const parent = !!o.children?.length;
              const on = active[depth] === o.value;
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    className={parent ? "has-children" : undefined}
                    disabled={o.disabled}
                    aria-expanded={parent ? on : undefined}
                    aria-selected={!parent ? on : undefined}
                    onClick={() => choose(depth, o)}
                  >{labelOf(o)}</button>
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </div>
  );
}
