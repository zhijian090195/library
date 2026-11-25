/**
 * 打擊特效層：import 'aicde-ui/fx' 一次，再用 <ThemeProvider fx> 包住要有特效的範圍。
 * 核心和網頁版共用同一份 assets/aicde-fx.js（事件委派，不需要改元件的寫法）。
 * 在伺服器端（SSR）載入時什麼都不做。
 */
import '../../assets/aicde-fx.js';

export * from './fx-api';
