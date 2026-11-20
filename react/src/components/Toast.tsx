import * as React from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../utils';

/* ---------------- 共用的外部 store（toast 與 notify 都放在這裡） ---------------- */
export type FeedbackType = 'info' | 'success' | 'error';

export interface ToastOptions { type?: FeedbackType; duration?: number; }
export interface NotifyAction { label: string; onClick?: () => void; }
export interface NotifyOptions {
  title: React.ReactNode;
  text?: React.ReactNode;
  type?: FeedbackType;
  actions?: NotifyAction[];
  /** 毫秒；0 代表不自動關閉 */
  duration?: number;
}

interface Entry {
  id: number;
  kind: 'toast' | 'notice';
  type: FeedbackType;
  duration: number;
  leaving: boolean;
  message?: React.ReactNode;
  title?: React.ReactNode;
  text?: React.ReactNode;
  actions?: NotifyAction[];
}

let entries: Entry[] = [];
let seq = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const getSnapshot = () => entries;
const EMPTY: Entry[] = [];
const getServerSnapshot = () => EMPTY;

function dismiss(id: number) {
  if (!entries.some(e => e.id === id && !e.leaving)) return;
  entries = entries.map(e => e.id === id ? { ...e, leaving: true } : e);
  emit();
  setTimeout(() => { entries = entries.filter(e => e.id !== id); emit(); }, 200);
}

function push(e: Omit<Entry, 'id' | 'leaving'>, max: number): () => void {
  const id = ++seq;
  entries = [...entries, { ...e, id, leaving: false }];
  const same = entries.filter(x => x.kind === e.kind);
  if (same.length > max) { const drop = new Set(same.slice(0, same.length - max).map(x => x.id)); entries = entries.filter(x => !drop.has(x.id)); }
  emit();
  return () => dismiss(id);
}

/** 顯示一則短暫通知（需要在 App 裡放一次 <Toaster />），回傳關閉函式 */
export function toast(message: React.ReactNode, opts: ToastOptions = {}): () => void {
  return push({ kind: 'toast', message, type: opts.type ?? 'info', duration: opts.duration ?? 3200 }, 4);
}

/** 顯示右上角的通知卡片（同樣由 <Toaster /> 顯示），回傳關閉函式 */
export function notify(opts: NotifyOptions): () => void {
  return push({
    kind: 'notice', title: opts.title, text: opts.text, actions: opts.actions,
    type: opts.type ?? 'info', duration: opts.duration === 0 ? 0 : (opts.duration ?? 4500)
  }, 3);
}

/* ---------------- 單則項目：計時、滑鼠停留暫停、進退場 ---------------- */
function useLife(e: Entry, resume: number) {
  const [inn, setIn] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => {
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setIn(true)));
    if (e.duration) timer.current = setTimeout(() => dismiss(e.id), e.duration);
    return () => { cancelAnimationFrame(r); clearTimeout(timer.current); };
  }, [e.id, e.duration]);
  return {
    inn,
    onPointerEnter: () => clearTimeout(timer.current),
    onPointerLeave: () => { if (e.duration) { clearTimeout(timer.current); timer.current = setTimeout(() => dismiss(e.id), resume); } }
  };
}

function ToastItem({ e }: { e: Entry }) {
  const { inn, ...hover } = useLife(e, 1500);
  return (
    <div className={cx('a-toast', e.type !== 'info' && 'a-toast--' + e.type, inn && 'is-in', e.leaving && 'is-out')} {...hover}>
      <span className="a-toast__dot" />
      <span className="a-toast__msg">{e.message}</span>
      <button type="button" className="a-toast__close" aria-label="關閉" onClick={() => dismiss(e.id)}>×</button>
    </div>
  );
}

const ICON: Record<FeedbackType, React.ReactNode> = {
  info: <svg viewBox="0 0 24 24"><path d="M12 11v6M12 7h.01" /></svg>,
  success: <svg viewBox="0 0 24 24"><path d="M6 12.5l4 4L18 8" /></svg>,
  error: <svg viewBox="0 0 24 24"><path d="M12 7v6M12 17h.01" /></svg>
};

function NoticeItem({ e }: { e: Entry }) {
  const { inn, ...hover } = useLife(e, 2000);
  return (
    <div className={cx('a-notice', 'a-notice--' + e.type, inn && 'is-in', e.leaving && 'is-out')} {...hover}>
      <span className="a-notice__icon">{ICON[e.type]}</span>
      <div className="a-notice__main">
        <b className="a-notice__title">{e.title}</b>
        {e.text != null && <div className="a-notice__text">{e.text}</div>}
        {!!e.actions?.length && (
          <div className="a-notice__actions">
            {e.actions.map((a, k) => (
              <button key={k} type="button" className={cx('a-btn', 'a-btn--sm', k === 0 ? 'a-btn--primary' : 'a-btn--ghost')}
                onClick={() => { a.onClick?.(); dismiss(e.id); }}>{a.label}</button>
            ))}
          </div>
        )}
      </div>
      <button type="button" className="a-notice__close" aria-label="關閉" onClick={() => dismiss(e.id)}>×</button>
    </div>
  );
}

/** 在 App 根層放一次，toast() 與 notify() 的內容會顯示在這裡 */
export function Toaster() {
  const list = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const toasts = list.filter(e => e.kind === 'toast');
  const notices = list.filter(e => e.kind === 'notice').reverse();
  return createPortal(
    <>
      <div className="a-toaster" role="status" aria-live="polite">{toasts.map(e => <ToastItem key={e.id} e={e} />)}</div>
      <div className="a-notifier" role="region" aria-label="通知" aria-live="polite">{notices.map(e => <NoticeItem key={e.id} e={e} />)}</div>
    </>,
    document.body
  );
}
