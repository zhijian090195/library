import * as React from 'react';
import { cx, useReducedMotion } from '../utils';

export interface BannerProps extends React.ComponentPropsWithoutRef<'div'> {
  color?: 'navy' | 'coral';
  /** 無圓角，貼齊頁面頂端 */
  flush?: boolean;
  /** 左側小標籤，例如「新功能」 */
  tag?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
}

export function Banner({ color = 'navy', flush, tag, closable = true, onClose, className, children, ...rest }: BannerProps) {
  const [state, setState] = React.useState<'open' | 'closing' | 'closed'>('open');
  const reduce = useReducedMotion();
  React.useEffect(() => {
    if (state !== 'closing') return;
    const t = setTimeout(() => { setState('closed'); onClose?.(); }, reduce ? 0 : 200);
    return () => clearTimeout(t);
  }, [state, reduce, onClose]);
  if (state === 'closed') return null;
  return (
    <div role="region" aria-label="公告" className={cx('a-banner', color === 'coral' && 'a-banner--coral', flush && 'a-banner--flush', state === 'closing' && 'is-closing', className)} {...rest}>
      {tag != null && <span className="a-banner__tag">{tag}</span>}
      <span>{children}</span>
      {closable && <button type="button" className="a-banner__close" aria-label="關閉公告" onClick={() => setState('closing')}>×</button>}
    </div>
  );
}
