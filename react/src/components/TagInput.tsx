import * as React from 'react';
import { cx, useControllable } from '../utils';

export interface TagInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  /** 最多幾個標籤 */
  max?: number;
  placeholder?: string;
  disabled?: boolean;
  /** 輸入框的 aria-label */
  inputLabel?: string;
}

/** 標籤輸入：Enter 或逗號新增、重複會搖一下、空白時 Backspace 刪最後一個、貼上會自動拆分。外層請用 div。 */
export function TagInput({ value, defaultValue = [], onChange, max, placeholder = '輸入後按 Enter', disabled, inputLabel = '新增標籤', className, ...rest }: TagInputProps) {
  const [tags, setTags] = useControllable<string[]>(value, defaultValue, onChange);
  const [text, setText] = React.useState('');
  const [fresh, setFresh] = React.useState<string | null>(null);
  const [dup, setDup] = React.useState<{ tag: string; n: number } | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const full = max != null && tags.length >= max;

  React.useEffect(() => {
    if (!dup) return;
    const t = setTimeout(() => setDup(null), 450);
    return () => clearTimeout(t);
  }, [dup]);

  const add = (raw: string[]) => {
    const next = [...tags];
    let last: string | null = null;
    for (const r of raw) {
      const t = r.trim();
      if (!t) continue;
      if (next.includes(t)) { setDup(d => ({ tag: t, n: (d?.n ?? 0) + 1 })); continue; }
      if (max != null && next.length >= max) break;
      next.push(t);
      last = t;
    }
    if (next.length !== tags.length) { setTags(next); setFresh(last); }
  };

  return (
    <div className={cx('a-taginput', className)} data-max={max} onClick={() => inputRef.current?.focus()} {...rest}>
      {tags.map(t => (
        <span key={dup?.tag === t ? t + '-dup' + dup.n : t} className={cx('a-tag', fresh === t && 'is-new', dup?.tag === t && 'is-dup')}>
          <span>{t}</span>
          <button type="button" className="a-tag__close" aria-label={'移除' + t} disabled={disabled}
            onClick={e => { e.stopPropagation(); setTags(tags.filter(x => x !== t)); }}>×</button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={text}
        placeholder={full ? '' : placeholder}
        aria-label={inputLabel}
        disabled={disabled || full}
        onChange={e => {
          const v = e.target.value;
          if (/[,，]/.test(v)) { add(v.split(/[,，]/)); setText(''); } else setText(v);
        }}
        onKeyDown={e => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === 'Enter') { e.preventDefault(); add([text]); setText(''); }
          else if (e.key === 'Backspace' && !text && tags.length) setTags(tags.slice(0, -1));
        }}
        onPaste={e => {
          const p = e.clipboardData.getData('text');
          if (!/[,，\n]/.test(p)) return;
          e.preventDefault();
          add((text + p).split(/[,，\n]/));
          setText('');
        }}
        onBlur={() => { if (text.trim()) { add([text]); setText(''); } }}
      />
    </div>
  );
}
