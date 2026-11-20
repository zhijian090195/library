import * as React from 'react';
import { useReducedMotion } from './utils';

const FOCUSABLE = [
  'a[href]', 'area[href]', 'button:not([disabled])', 'input:not([disabled]):not([type="hidden"])', 'select:not([disabled])',
  'textarea:not([disabled])', 'iframe', 'audio[controls]', 'video[controls]', '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** 對話框內可以 Tab 到的元素（略過隱藏的） */
function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(el => !el.closest('[hidden],[inert]') && el.getAttribute('aria-hidden') !== 'true');
}

export interface UseDialogOptions {
  /** 開啟時要聚焦的元素；不給時依序找 [autofocus]、第一個可聚焦元素、對話框本身 */
  initialFocus?: React.RefObject<HTMLElement | null>;
  /** 開啟時鎖住頁面捲動，預設 true */
  lockScroll?: boolean;
}

/**
 * 內部用：讓原生 <dialog> 跟著 open 開關，關閉時先加 is-closing 播退場動畫（160ms）。
 * - Esc、點背景都改成呼叫 requestClose，由外部決定是否真的關閉
 * - 開啟時把焦點移進對話框，Tab／Shift+Tab 在對話框內循環；關閉後焦點回到開啟它的元素
 * - 開啟期間鎖住頁面捲動
 * - 瀏覽器不支援 showModal（例如舊環境、jsdom）時，Esc 與焦點鎖定由這裡補上
 * 只在 effect 裡碰 document，伺服器端渲染時安全。
 */
export function useDialog(open: boolean, requestClose: () => void, closeOnBackdrop = true, options: UseDialogOptions = {}) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const reduce = useReducedMotion();
  const closeRef = React.useRef(requestClose);
  closeRef.current = requestClose;
  const openRef = React.useRef(open);
  openRef.current = open;
  const opener = React.useRef<HTMLElement | null>(null);
  const native = React.useRef(false);
  const { initialFocus, lockScroll = true } = options;

  React.useEffect(() => {
    const d = ref.current;
    if (!d) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const finishClose = () => {
      d.classList.remove('is-closing');
      if (d.open) d.close?.();
      d.removeAttribute('open');
      const o = opener.current; opener.current = null;
      if (o && o.isConnected && typeof o.focus === 'function') o.focus();
    };
    if (open) {
      d.classList.remove('is-closing');
      if (!d.open) {
        const active = d.ownerDocument.activeElement;
        opener.current = active instanceof HTMLElement && active !== d.ownerDocument.body ? active : null;
        native.current = typeof d.showModal === 'function';
        if (native.current) d.showModal(); else d.setAttribute('open', '');
      }
      // 初始焦點
      if (!d.contains(d.ownerDocument.activeElement) || d.ownerDocument.activeElement === d) {
        const target = initialFocus?.current ?? d.querySelector<HTMLElement>('[autofocus]') ?? focusables(d)[0];
        if (target) target.focus();
        else { if (!d.hasAttribute('tabindex')) d.tabIndex = -1; d.focus(); }
      }
    } else if (d.open || d.hasAttribute('open')) {
      if (reduce) finishClose();
      else {
        d.classList.add('is-closing');
        t = setTimeout(finishClose, 160);
      }
    }
    return () => { if (t) clearTimeout(t); };
  }, [open, reduce, initialFocus]);

  // 鎖住頁面捲動
  React.useEffect(() => {
    if (!open || !lockScroll) return;
    const body = ref.current?.ownerDocument.body;
    if (!body) return;
    const prev = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => { body.style.overflow = prev; };
  }, [open, lockScroll]);

  React.useEffect(() => {
    const d = ref.current;
    if (!d) return;
    // 原生 Esc：攔下來交給外部決定
    const onCancel = (e: Event) => { e.preventDefault(); closeRef.current(); };
    // 瀏覽器可能不經過 cancel 就直接關閉（例如連按 Esc）；外部仍認為開著時，同步通知外部
    const onClose = () => { if (openRef.current) closeRef.current(); };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !native.current) { e.preventDefault(); closeRef.current(); return; }
      if (e.key !== 'Tab') return;
      const list = focusables(d);
      if (!list.length) { e.preventDefault(); return; }
      const first = list[0], last = list[list.length - 1], cur = d.ownerDocument.activeElement;
      if (e.shiftKey && (cur === first || cur === d || !d.contains(cur))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (cur === last || !d.contains(cur))) { e.preventDefault(); first.focus(); }
    };
    d.addEventListener('cancel', onCancel);
    d.addEventListener('close', onClose);
    d.addEventListener('keydown', onKey);
    return () => {
      d.removeEventListener('cancel', onCancel);
      d.removeEventListener('close', onClose);
      d.removeEventListener('keydown', onKey);
    };
  }, []);

  const onClick = React.useCallback((e: React.MouseEvent<HTMLDialogElement>) => {
    if (closeOnBackdrop && e.target === e.currentTarget) closeRef.current();
  }, [closeOnBackdrop]);

  return { ref, onClick };
}

/** 內部用：把多個 ref 合成一個 */
export function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (el: T | null) => {
    for (const r of refs) {
      if (typeof r === 'function') r(el);
      else if (r) (r as React.MutableRefObject<T | null>).current = el;
    }
  };
}
