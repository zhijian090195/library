import { Children, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx, useReducedMotion } from '../utils';

export interface CarouselProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  children: ReactNode;
  /** 露出下一張的一角，提示可以滑動 */
  peek?: boolean;
  /** 自動播放間隔（毫秒）；滑鼠移入、鍵盤聚焦或分頁隱藏時暫停 */
  autoplay?: number;
  showArrows?: boolean;
  showDots?: boolean;
  onChange?: (index: number) => void;
}

export interface CarouselHandle {
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
}

const ChevL = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>;
const ChevR = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>;

/** 輪播：原生 scroll-snap，可拖曳、觸控滑動與鍵盤操作 */
export const Carousel = forwardRef<CarouselHandle, CarouselProps>(function Carousel(
  { children, peek, autoplay, showArrows = true, showDots = true, onChange, className, ...rest }, ref
) {
  const reduce = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const slides = Children.toArray(children);
  const [index, setIndex] = useState(0);
  const [edge, setEdge] = useState({ start: true, end: slides.length <= 1 });
  const paused = useRef(false);

  const goTo = useCallback((i: number) => {
    const t = track.current; if (!t) return;
    const el = t.children[Math.max(0, Math.min(slides.length - 1, i))] as HTMLElement | undefined;
    if (el) t.scrollTo({ left: el.offsetLeft - t.offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
  }, [slides.length, reduce]);
  const step = useCallback((d: number) => {
    const t = track.current; if (!t) return;
    const w = (t.children[0] as HTMLElement | undefined)?.offsetWidth ?? t.clientWidth;
    t.scrollBy({ left: d * w, behavior: reduce ? 'auto' : 'smooth' });
  }, [reduce]);

  useImperativeHandle(ref, () => ({ goTo, next: () => step(1), prev: () => step(-1) }), [goTo, step]);

  const sync = useCallback(() => {
    const t = track.current; if (!t) return;
    const max = t.scrollWidth - t.clientWidth;
    setEdge({ start: t.scrollLeft <= 2, end: t.scrollLeft >= max - 2 });
    let best = 0, dist = Infinity;
    Array.from(t.children).forEach((c, i) => {
      const d = Math.abs((c as HTMLElement).offsetLeft - t.offsetLeft - t.scrollLeft);
      if (d < dist) { dist = d; best = i; }
    });
    if (t.scrollLeft >= max - 2) best = slides.length - 1;
    setIndex(prev => { if (prev !== best) onChange?.(best); return best; });
  }, [slides.length, onChange]);

  useEffect(() => {
    const t = track.current; if (!t) return;
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(sync); };
    t.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    sync();
    return () => { t.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, [sync]);

  useEffect(() => {
    if (!autoplay || reduce || slides.length < 2) return;
    const id = window.setInterval(() => {
      if (paused.current || document.hidden) return;
      const t = track.current; if (!t) return;
      if (t.scrollLeft >= t.scrollWidth - t.clientWidth - 2) goTo(0); else step(1);
    }, autoplay);
    return () => clearInterval(id);
  }, [autoplay, reduce, slides.length, goTo, step]);

  const pause = (v: boolean) => () => { paused.current = v; };

  return (
    <div
      ref={root}
      className={cx('a-carousel', peek && 'a-carousel--peek', className)}
      role="region"
      aria-roledescription="carousel"
      onPointerEnter={pause(true)}
      onPointerLeave={pause(false)}
      onFocus={pause(true)}
      onBlur={e => { if (!root.current?.contains(e.relatedTarget as Node | null)) paused.current = false; }}
      onKeyDown={e => {
        if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      }}
      {...rest}
    >
      <div ref={track} className="a-carousel__track" tabIndex={0}>
        {slides.map((s, i) => (
          <div key={i} className="a-carousel__slide" role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${slides.length}`}>{s}</div>
        ))}
      </div>
      {showArrows && slides.length > 1 && <>
        <button type="button" className="a-carousel__btn a-carousel__btn--prev" aria-label="上一張" disabled={edge.start} onClick={() => step(-1)}>{ChevL}</button>
        <button type="button" className="a-carousel__btn a-carousel__btn--next" aria-label="下一張" disabled={edge.end} onClick={() => step(1)}>{ChevR}</button>
      </>}
      {showDots && slides.length > 1 && (
        <div className="a-carousel__dots">
          {slides.map((_, i) => (
            <button key={i} type="button" aria-label={`第 ${i + 1} 張`} aria-current={i === index ? 'true' : 'false'} onClick={() => goTo(i)} />
          ))}
        </div>
      )}
    </div>
  );
});
