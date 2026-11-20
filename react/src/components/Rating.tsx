import * as React from 'react';
import { cx, useControllable, useId } from '../utils';

export interface RatingProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'defaultValue'> {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** 星星數量，預設 5 */
  count?: number;
  /** 只顯示分數，不能點 */
  readOnly?: boolean;
  size?: 'sm' | 'md';
  /** 星星符號，預設 ★ */
  character?: React.ReactNode;
}

/** 星星評分，底層是 radio（由高到低排列，CSS 用 row-reverse 反轉）。記得加 aria-label。 */
export function Rating({ value, defaultValue = 0, onChange, count = 5, readOnly, size = 'md', character = '★', className, ...rest }: RatingProps) {
  const id = useId('rate');
  const [val, setVal] = useControllable<number>(value, defaultValue, onChange);
  const stars = Array.from({ length: count }, (_, i) => count - i);
  return (
    <fieldset className={cx('a-rating', size === 'sm' && 'a-rating--sm', className)} {...rest}>
      {stars.map(n => (
        <React.Fragment key={n}>
          <input type="radio" id={id + '-' + n} name={id} value={n} checked={val === n} disabled={readOnly} onChange={() => setVal(n)} />
          <label htmlFor={id + '-' + n} aria-label={n + ' 星'}>{character}</label>
        </React.Fragment>
      ))}
    </fieldset>
  );
}
