/** 'aicde-ui/fx' 的型別與輔助函式；實際載入特效層的是 fx.ts */
export interface AicdeFx {
  version: string;
  enable(root?: Element): void;
  disable(root?: Element): void;
  isOn(el: Element): boolean;
  impact(el: Element): void;
  done(el: Element, opts?: { word?: string | false }): void;
  spring(el: Element, from: [number, number], opts?: { velocity?: [number, number]; stiffness?: number; damping?: number; delay?: number }): Animation | undefined;
  burst(x: number, y: number, opts?: Record<string, unknown>): void;
  wedges(x: number, y: number, opts?: Record<string, unknown>): void;
  puff(x: number, y: number, opts?: Record<string, unknown>): void;
  sparks(x: number, y: number, opts?: Record<string, unknown>): void;
  ring(x: number, y: number, opts?: Record<string, unknown>): void;
  crescent(x: number, y: number, opts?: Record<string, unknown>): void;
  word(x: number, y: number, text: string, opts?: Record<string, unknown>): void;
  check(x: number, y: number, opts?: Record<string, unknown>): void;
}

declare global {
  interface Window { AUIFX?: AicdeFx }
}

/** 取得特效 API；在伺服器端回傳 undefined */
export function getFx(): AicdeFx | undefined {
  return typeof window === 'undefined' ? undefined : window.AUIFX;
}

/** 操作成功時呼叫：元件上蓋一個打勾和「叮！」。失敗時不要呼叫。 */
export function fxDone(el: Element | null | undefined, opts?: { word?: string | false }) {
  if (el) getFx()?.done(el, opts);
}

/** 不用點擊，直接在元件上播放一次打擊 */
export function fxImpact(el: Element | null | undefined) {
  if (el) getFx()?.impact(el);
}
