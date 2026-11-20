import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx, useControllable } from '../utils';

export interface CollapseItem {
  key: string;
  title: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface CollapseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  items: CollapseItem[];
  /** 手風琴：一次只展開一個 */
  accordion?: boolean;
  activeKeys?: string[];
  defaultActiveKeys?: string[];
  onChange?: (keys: string[]) => void;
}

export const Collapse = forwardRef<HTMLDivElement, CollapseProps>(function Collapse(
  { items, accordion, activeKeys, defaultActiveKeys = [], onChange, className, ...rest }, ref
) {
  const [keys, setKeys] = useControllable<string[]>(activeKeys, defaultActiveKeys, onChange);
  const toggle = (k: string) => {
    const open = keys.includes(k);
    setKeys(open ? keys.filter(x => x !== k) : accordion ? [k] : [...keys, k]);
  };
  return (
    <div ref={ref} className={cx('a-collapse', className)} {...rest}>
      {items.map(it => (
        <details key={it.key} open={keys.includes(it.key)}>
          <summary
            aria-disabled={it.disabled || undefined}
            onClick={e => { e.preventDefault(); if (!it.disabled) toggle(it.key); }}
            style={it.disabled ? { opacity: .45, cursor: 'not-allowed' } : undefined}
          >
            {it.title}
          </summary>
          <div className="a-collapse__body">{it.content}</div>
        </details>
      ))}
    </div>
  );
});
