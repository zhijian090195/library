import * as React from 'react';
import { cx, useControllable } from '../utils';

export type TransferItem = string | { value: string; label?: React.ReactNode; disabled?: boolean };

export interface TransferProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** 全部項目 */
  items: TransferItem[];
  /** 右側（已選）項目的 value */
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  /** 左右兩欄的標題 */
  titles?: [React.ReactNode, React.ReactNode];
}

const norm = (o: TransferItem) => typeof o === 'string' ? { value: o, label: o as React.ReactNode, disabled: false } : { value: o.value, label: o.label ?? o.value, disabled: !!o.disabled };

interface ListProps {
  title: React.ReactNode;
  list: ReturnType<typeof norm>[];
  checked: string[];
  fresh: string[];
  setChecked: (v: string[]) => void;
}

function TransferList({ title, list, checked, fresh, setChecked }: ListProps) {
  const pick = list.filter(o => !o.disabled).map(o => o.value);
  const on = checked.filter(v => pick.includes(v));
  const all = pick.length > 0 && on.length === pick.length;
  const some = on.length > 0 && !all;
  const allRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => { if (allRef.current) allRef.current.indeterminate = some; }, [some]);
  return (
    <div className="a-transfer__list">
      <div className="a-transfer__head">
        <label className="a-check">
          <input ref={allRef} type="checkbox" checked={all} disabled={!pick.length} aria-label="全選"
            onChange={e => setChecked(e.target.checked ? pick : [])} />
          {title}
        </label>
        <small>{on.length ? on.length + ' / ' + list.length : list.length}</small>
      </div>
      <div className="a-transfer__body">
        {list.map(o => (
          <label key={o.value} className={cx('a-check', fresh.includes(o.value) && 'is-new')}>
            <input type="checkbox" checked={checked.includes(o.value)} disabled={o.disabled}
              onChange={e => setChecked(e.target.checked ? [...checked, o.value] : checked.filter(v => v !== o.value))} />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  );
}

/** 穿梭框：勾選後用中間按鈕移到另一邊；剛移過去的項目會短暫亮起。 */
export function Transfer({ items, value, defaultValue = [], onChange, titles = ['可選', '已選'], className, ...rest }: TransferProps) {
  const [right, setRight] = useControllable<string[]>(value, defaultValue, onChange);
  const [checkL, setCheckL] = React.useState<string[]>([]);
  const [checkR, setCheckR] = React.useState<string[]>([]);
  const [fresh, setFresh] = React.useState<string[]>([]);
  const all = items.map(norm);
  const leftList = all.filter(o => !right.includes(o.value));
  const rightList = all.filter(o => right.includes(o.value));
  const toRight = checkL.filter(v => leftList.some(o => o.value === v));
  const toLeft = checkR.filter(v => rightList.some(o => o.value === v));

  React.useEffect(() => {
    if (!fresh.length) return;
    const t = setTimeout(() => setFresh([]), 900);
    return () => clearTimeout(t);
  }, [fresh]);

  return (
    <div className={cx('a-transfer', className)} {...rest}>
      <TransferList title={titles[0]} list={leftList} checked={checkL} fresh={fresh} setChecked={setCheckL} />
      <div className="a-transfer__ops">
        <button type="button" className="a-btn a-btn--outline a-btn--sm a-btn--icon" aria-label="移到右邊" disabled={!toRight.length}
          onClick={() => { setRight([...right, ...toRight]); setFresh(toRight); setCheckL([]); }}>›</button>
        <button type="button" className="a-btn a-btn--outline a-btn--sm a-btn--icon" aria-label="移到左邊" disabled={!toLeft.length}
          onClick={() => { setRight(right.filter(v => !toLeft.includes(v))); setFresh(toLeft); setCheckR([]); }}>‹</button>
      </div>
      <TransferList title={titles[1]} list={rightList} checked={checkR} fresh={fresh} setChecked={setCheckR} />
    </div>
  );
}
