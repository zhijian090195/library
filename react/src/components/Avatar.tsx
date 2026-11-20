import { Children, forwardRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string;
  alt?: string;
  /** 沒有圖片時，取名字第一個字 */
  name?: string;
  /** sm 32px、md 40px、lg 56px，或直接給數字 */
  size?: 'sm' | 'md' | 'lg' | number;
  shape?: 'circle' | 'square';
  color?: 'sky' | 'coral' | 'navy';
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, alt = '', name, size = 'md', shape = 'circle', color = 'sky', className, style, children, ...rest }, ref
) {
  const [broken, setBroken] = useState(false);
  const initial = name ? Array.from(name.trim())[0] : null;
  const s: CSSProperties | undefined = typeof size === 'number' ? ({ ...style, ['--s' as string]: `${size}px` } as CSSProperties) : style;
  return (
    <span
      ref={ref}
      role={src && !broken ? undefined : 'img'}
      aria-label={src && !broken ? undefined : (name ?? alt) || undefined}
      className={cx('a-avatar', typeof size === 'string' && size !== 'md' && `a-avatar--${size}`, shape === 'square' && 'a-avatar--square', color !== 'sky' && `a-avatar--${color}`, className)}
      style={s}
      {...rest}
    >
      {src && !broken ? <img src={src} alt={alt || name || ''} onError={() => setBroken(true)} /> : children ?? initial}
    </span>
  );
});

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** 最多顯示幾個，其餘以「+N」表示 */
  max?: number;
  size?: AvatarProps['size'];
  children?: ReactNode;
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup({ max, size, className, children, ...rest }, ref) {
  const items = Children.toArray(children);
  const shown = max != null && items.length > max ? items.slice(0, max) : items;
  const extra = items.length - shown.length;
  return (
    <div ref={ref} className={cx('a-avatar-group', className)} {...rest}>
      {shown}
      {extra > 0 && <Avatar size={size}>+{extra}</Avatar>}
    </div>
  );
});
