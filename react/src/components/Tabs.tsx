import * as React from 'react';
import { cx, useControllable, useId } from '../utils';

export interface TabItem {
  key: string;
  label: React.ReactNode;
  children?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  items: TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  /** 膠囊樣式 */
  variant?: 'line' | 'pill';
}

export function Tabs({ items, activeKey, defaultActiveKey, onChange, variant = 'line', className, ...rest }: TabsProps) {
  const [active, setActive] = useControllable(activeKey, defaultActiveKey ?? items[0]?.key ?? '', onChange);
  const id = useId('tabs');
  const listRef = React.useRef<HTMLDivElement>(null);
  const inkRef = React.useRef<HTMLSpanElement>(null);
  const first = React.useRef(true);

  const moveInk = React.useCallback(() => {
    const list = listRef.current, ink = inkRef.current;
    if (!list || !ink) return;
    const cur = list.querySelector<HTMLElement>('[role=tab][aria-selected=true]');
    if (!cur) return;
    if (first.current) ink.style.transition = 'none';
    ink.style.width = cur.offsetWidth + 'px';
    ink.style.transform = 'translateX(' + cur.offsetLeft + 'px)';
    if (first.current) { void ink.offsetWidth; ink.style.transition = ''; first.current = false; }
  }, []);

  React.useLayoutEffect(moveInk, [active, items, moveInk]);
  React.useEffect(() => {
    window.addEventListener('resize', moveInk);
    document.fonts?.ready.then(moveInk);
    return () => window.removeEventListener('resize', moveInk);
  }, [moveInk]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const enabled = items.filter(i => !i.disabled);
    const k = enabled.findIndex(i => i.key === active);
    const next = enabled[(k + (e.key === 'ArrowRight' ? 1 : -1) + enabled.length) % enabled.length];
    if (!next) return;
    e.preventDefault();
    setActive(next.key);
    listRef.current?.querySelector<HTMLElement>('#' + id + '-tab-' + CSS.escape(next.key))?.focus();
  };

  return (
    <div className={cx('a-tabs', variant === 'pill' && 'a-tabs--pill', className)} {...rest}>
      <div className="a-tabs__list" role="tablist" ref={listRef} onKeyDown={onKeyDown}>
        {items.map(it => (
          <button
            key={it.key}
            type="button"
            role="tab"
            id={id + '-tab-' + it.key}
            aria-selected={it.key === active}
            aria-controls={id + '-panel-' + it.key}
            tabIndex={it.key === active ? 0 : -1}
            disabled={it.disabled}
            onClick={() => setActive(it.key)}
          >
            {it.label}
          </button>
        ))}
        <span className="a-tabs__ink" aria-hidden="true" ref={inkRef} />
      </div>
      {items.map(it => (
        <div
          key={it.key}
          className="a-tabs__panel"
          role="tabpanel"
          id={id + '-panel-' + it.key}
          aria-labelledby={id + '-tab-' + it.key}
          hidden={it.key !== active}
        >
          {it.key === active ? it.children : null}
        </div>
      ))}
    </div>
  );
}
