import * as React from 'react';
import { cx, useControllable } from '../utils';

export interface OtpInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** 位數，預設 6 */
  length?: number;
  /** 每幾格插入一個分隔線，例如 3 → 123-456；0 表示不分隔 */
  groupSize?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (code: string) => void;
  /** 填滿所有格子時呼叫 */
  onComplete?: (code: string) => void;
  /** 錯誤狀態；從 false 變成 true 時會搖一下 */
  error?: boolean;
  success?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

/** 驗證碼輸入：打字自動跳下一格、Backspace 回上一格、方向鍵移動、貼上整串會自動分配。記得加 aria-label。 */
export function OtpInput({
  length = 6, groupSize = 0, value, defaultValue = '', onChange, onComplete, error, success, disabled, autoFocus, className, ...rest
}: OtpInputProps) {
  const [code, setCode] = useControllable<string>(value, defaultValue, onChange);
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);
  const boxRef = React.useRef<HTMLDivElement>(null);
  const chars = Array.from({ length }, (_, i) => code[i] ?? '');

  // 錯誤時重新觸發搖晃動畫
  React.useEffect(() => {
    const el = boxRef.current;
    if (!el || !error) return;
    el.classList.remove('is-error');
    void el.offsetWidth;
    el.classList.add('is-error');
  }, [error]);

  const focusAt = (i: number) => { const el = refs.current[Math.max(0, Math.min(length - 1, i))]; el?.focus(); el?.select(); };
  const update = (next: string[]) => {
    const s = next.join('').slice(0, length);
    setCode(s);
    if (s.length === length && !next.slice(0, length).includes('')) onComplete?.(s);
  };
  const fill = (start: number, digits: string) => {
    const next = [...chars];
    let i = start;
    for (const d of digits) { if (i >= length) break; next[i++] = d; }
    update(next);
    focusAt(i);
  };

  const inputs: React.ReactNode[] = [];
  chars.forEach((ch, i) => {
    if (groupSize > 0 && i > 0 && i % groupSize === 0) inputs.push(<span key={'sep' + i} className="a-otp__sep" aria-hidden="true" />);
    inputs.push(
      <input
        key={i}
        ref={el => { refs.current[i] = el; }}
        inputMode="numeric"
        maxLength={1}
        placeholder=" "
        autoComplete={i === 0 ? 'one-time-code' : 'off'}
        aria-label={'第 ' + (i + 1) + ' 位'}
        autoFocus={autoFocus && i === 0}
        disabled={disabled}
        value={ch}
        onFocus={e => e.target.select()}
        onChange={e => {
          const d = e.target.value.replace(/\D/g, '');
          if (!d) { const next = [...chars]; next[i] = ''; update(next); return; }
          fill(i, d);
        }}
        onKeyDown={e => {
          if (e.key === 'Backspace' && !chars[i] && i > 0) {
            e.preventDefault();
            const next = [...chars]; next[i - 1] = ''; update(next); focusAt(i - 1);
          } else if (e.key === 'ArrowLeft') { e.preventDefault(); focusAt(i - 1); }
          else if (e.key === 'ArrowRight') { e.preventDefault(); focusAt(i + 1); }
        }}
        onPaste={e => {
          const d = e.clipboardData.getData('text').replace(/\D/g, '');
          if (!d) return;
          e.preventDefault();
          fill(i, d);
        }}
      />
    );
  });

  return (
    <div ref={boxRef} role="group" className={cx('a-otp', error && 'is-error', success && 'is-success', className)} {...rest}>
      {inputs}
    </div>
  );
}
