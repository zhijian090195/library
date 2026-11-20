import * as React from 'react';

/** 合併 class 名稱，忽略 falsy 值 */
export function cx(...a: Array<string | false | null | undefined | 0>): string {
  return a.filter(Boolean).join(' ');
}

/** 同時支援受控（value）與非受控（defaultValue）的狀態 */
export function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (v: T) => void): [T, (v: T) => void] {
  const [inner, setInner] = React.useState<T>(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? (value as T) : inner;
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;
  const set = React.useCallback((v: T) => {
    if (!controlled) setInner(v);
    onChangeRef.current?.(v);
  }, [controlled]);
  return [current, set];
}

/** 使用者是否開啟「減少動態效果」 */
export function useReducedMotion(): boolean {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduce;
}

/** React.useId，去掉冒號等字元，可安全用在 id / querySelector */
export function useId(prefix = 'a'): string {
  const raw = React.useId();
  return prefix + '-' + raw.replace(/[^a-zA-Z0-9_-]/g, '');
}
