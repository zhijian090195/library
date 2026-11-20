import * as React from 'react';
import { cx, useControllable, useId } from '../utils';

export interface ColorPickerProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'type' | 'value' | 'defaultValue' | 'onChange'> {
  /** #rrggbb */
  value?: string;
  defaultValue?: string;
  onChange?: (hex: string) => void;
  /** 是否顯示色碼，預設是 */
  showValue?: boolean;
}

/** 自由選色：原生色票＋色碼。 */
export const ColorPicker = React.forwardRef<HTMLInputElement, ColorPickerProps>(function ColorPicker(
  { value, defaultValue = '#fc5454', onChange, showValue = true, className, style, ...rest },
  ref
) {
  const [hex, setHex] = useControllable<string>(value, defaultValue, onChange);
  return (
    <label className={cx('a-color', className)} style={style}>
      <input ref={ref} type="color" value={hex} onChange={e => setHex(e.target.value)} {...rest} />
      {showValue && <span className="a-color__value">{hex.toUpperCase()}</span>}
    </label>
  );
});

export type SwatchOption = string | { value: string; label?: string };

export interface ColorSwatchesProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'defaultValue'> {
  colors: SwatchOption[];
  value?: string;
  /** 預設為第一個顏色 */
  defaultValue?: string;
  onChange?: (color: string) => void;
  name?: string;
}

/** 預設色票（品牌色限定時使用），底層是 radio。 */
export function ColorSwatches({ colors, value, defaultValue, onChange, name, className, ...rest }: ColorSwatchesProps) {
  const auto = useId('sw');
  const list = colors.map(c => typeof c === 'string' ? { value: c, label: c } : { value: c.value, label: c.label ?? c.value });
  const [val, setVal] = useControllable<string>(value, defaultValue ?? list[0]?.value ?? '', onChange);
  return (
    <fieldset className={cx('a-swatches', className)} {...rest}>
      {list.map(c => (
        <label key={c.value}>
          <input type="radio" name={name ?? auto} value={c.value} aria-label={c.label} checked={val === c.value} onChange={() => setVal(c.value)} />
          <span style={{ '--c': c.value } as React.CSSProperties} />
        </label>
      ))}
    </fieldset>
  );
}
