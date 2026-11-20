import * as React from 'react';
import { cx } from '../utils';

export interface SkeletonProps extends React.ComponentPropsWithoutRef<'span'> {
  variant?: 'text' | 'title' | 'circle' | 'block';
  width?: number | string;
  height?: number | string;
}

export const Skeleton = React.forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(
  { variant = 'text', width, height, className, style, ...rest }, ref
) {
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cx('a-skeleton', variant !== 'text' && 'a-skeleton--' + variant, className)}
      style={{ width, height, ...style }}
      {...rest}
    />
  );
});

/** 直向排列多條骨架，間距 10px */
export function SkeletonGroup({ className, ...rest }: React.ComponentPropsWithoutRef<'div'>) {
  return <div className={cx('a-skeleton-group', className)} aria-busy="true" {...rest} />;
}
