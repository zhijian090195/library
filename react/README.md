# aicde-ui（React）

AICDE 風格的 React 元件庫。樣式沿用網站的 `aicde-ui.css`，元件只負責結構、狀態與無障礙屬性。

元件文件與範例：https://zhijian090195.github.io/library/

## 安裝

```bash
npm install aicde-ui
```

字型（建議，放在 `<head>` 或你的全域 CSS）：

```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Noto+Sans+TC:wght@400;500;700&family=JetBrains+Mono:wght@500;700&family=Noto+Serif+TC:wght@700&display=swap" rel="stylesheet">
```

## 使用

```tsx
import { Button, Tabs, Toaster, toast } from 'aicde-ui';
import 'aicde-ui/style.css';

export default function App() {
  return (
    <>
      <Button variant="primary" onClick={() => toast('已儲存', { type: 'success' })}>儲存</Button>
      <Toaster />
    </>
  );
}
```

需要 React 18 以上。`toast()` 和 `notify()` 要在畫面上放一個 `<Toaster />` 才看得到。`Button` 不指定 `variant` 時是外框按鈕。所有元件都標了 `"use client"`，可以直接在 Next.js App Router 裡使用。

## 主題

```tsx
<ThemeProvider theme="riso" mode="dark">…</ThemeProvider>
```

`theme`：

| 值 | 風格 |
|---|---|
| `default`（預設） | 紙雕分層，AICDE 原色：有厚度的紙片、按下壓到底、卡片後疊兩張彩紙 |
| `clean` | 無裝飾的簡潔版 |
| `paper` | 暖米色紙雕 |
| `ink` | 混合媒材手繪：墨線、不規則圓角、紙膠帶 |
| `soft` | 柔光立體：膠囊、光澤、霧面玻璃 |
| `riso` | 網點絲印：半色調、套色錯位 |
| `brutal` | 新粗野：粗線、直角、等寬字 |
| `stitch` | 手縫布藝：車縫虛線、鈕扣開關 |
| `ticket` | 水彩票根：打孔缺口、撕線、水彩暈染 |
| `block` | 啞光積木：倒角、厚底 |
| `blueprint` | 藍圖線稿：方格、裁切角標、紅筆標註 |
| `clinical` | 醫療：主要色用深藍、珊瑚只留給警示；44px 點擊範圍、清楚的 focus |
| `cute` | 可愛：大圓角、粉嫩色、貼紙描邊、彈跳動畫 |
| `finance` | 金融：高密度、4px 圓角、等寬數字、細線分隔 |
| `editorial` | 編輯：襯線標題、髮絲線、小型大寫，雜誌感 |

`mode`：`light`／`dark`／`system`。不用 React 時，在 `<html>` 加 `data-theme-style="ink"` 也一樣。

## 元件

| 分類 | 元件 |
|---|---|
| 通用 | Button、Divider、FloatButton、BackTop、ThemeProvider |
| 導覽 | Tabs、Pagination、Dropdown、Breadcrumb、Steps、Menu、CommandPalette、ContextMenu |
| 回饋 | Modal、Drawer、toast()／notify()＋`<Toaster/>`、Alert、Progress、Skeleton、Spinner、Popover、Result、Banner |
| 輸入、資料展示 | 見 `src/groups/entry.ts`、`src/groups/display.ts` |

有狀態的元件都同時支援受控（`value`／`open`／`activeKey`）與非受控（`default*`）用法。

## 指令

| 指令 | 用途 |
|---|---|
| `npm run build` | tsup 輸出 ESM／CJS／型別，並複製 CSS 到 `dist/style.css` |
| `npm run typecheck` | TypeScript 型別檢查 |
| `npm run smoke` | 用 SSR 把每個元件 renderToString 一次，有 console.error 就失敗 |

## 授權

MIT
