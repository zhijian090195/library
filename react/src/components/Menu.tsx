import * as React from 'react';
import { cx, useControllable } from '../utils';

export interface MenuItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  href?: string;
  /** 右側數量 */
  badge?: React.ReactNode;
  /** 子選單（展開用原生 details） */
  children?: MenuItem[];
  /** 預設展開子選單 */
  defaultOpen?: boolean;
  /** 'group' 代表分組標題 */
  type?: 'item' | 'group';
}

export interface MenuProps extends Omit<React.ComponentPropsWithoutRef<'nav'>, 'onSelect'> {
  items: MenuItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onSelect?: (key: string) => void;
}

const RESET: React.CSSProperties = { border: 0, background: 'none', width: '100%', font: 'inherit', textAlign: 'left' };

export function Menu({ items, activeKey, defaultActiveKey = '', onSelect, className, 'aria-label': label = '選單', ...rest }: MenuProps) {
  const [active, setActive] = useControllable(activeKey, defaultActiveKey, onSelect);
  const contains = (it: MenuItem): boolean => it.key === active || !!it.children?.some(contains);

  const renderItem = (it: MenuItem): React.ReactNode => {
    if (it.type === 'group') return <div key={it.key} className="a-menu__label">{it.label}</div>;
    if (it.children?.length) {
      return (
        <details key={it.key} open={it.defaultOpen ?? contains(it)}>
          <summary>{it.icon}{it.label}</summary>
          <div>{it.children.map(renderItem)}</div>
        </details>
      );
    }
    const content = <>{it.icon}{it.label}{it.badge != null && <span className="a-menu__badge">{it.badge}</span>}</>;
    const common = {
      className: 'a-menu__item',
      'aria-current': it.key === active ? ('page' as const) : undefined,
      onClick: () => setActive(it.key)
    };
    return it.href
      ? <a key={it.key} href={it.href} {...common}>{content}</a>
      : <button key={it.key} type="button" style={RESET} {...common}>{content}</button>;
  };

  return <nav className={cx('a-menu', className)} aria-label={label} {...rest}>{items.map(renderItem)}</nav>;
}
