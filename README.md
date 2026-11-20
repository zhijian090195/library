# AICDE Design Library

AICDE 的設計系統：一套元件、15 種主題，同時提供網頁（純 CSS／JS）、React、Flutter 三個版本，外觀一致。

**線上文件**：https://zhijian090195.github.io/library/
**Flutter 範例**：https://zhijian090195.github.io/library/flutter-demo/

- **59 個元件**：按鈕、表單、選擇器、日期、表格、對話框、通知、導覽…
- **15 種主題**：不只換顏色，連材質一起換。例如紙雕的紙邊、墨線、網點、車縫線、票根缺口
- **深淺色**：每個主題都支援
- **36 個動畫範例**：每張卡片都能直接操作
- **無障礙**：核心元件照 WAI-ARIA APG 規範處理鍵盤操作、讀屏屬性、減少動態效果，並有自動化測試把關。已知例外：預設主題的品牌色珊瑚紅 `#fc5454` 配白字，對比是 3.21:1，低於 WCAG AA 的 4.5:1，這是刻意保留的品牌色

## 15 種主題

| 主題 | 網頁 `data-theme-style` | 特色 | 適合 |
|---|---|---|---|
| 紙雕分層（預設） | 不加屬性 | 底部紙邊、按下會沉進紙裡 | 品牌官網、一般產品 |
| 簡潔 | `clean` | 無陰影、細線外框 | SaaS 後台、工具 |
| 暖紙雕 | `paper` | 米色紙張、暖色紙邊 | 生活風格、文創、餐飲 |
| 混合媒材 | `ink` | 墨線、不規則圓角、實心位移陰影 | 創意工作室、教育 |
| 柔光立體 | `soft` | 膠囊按鈕、柔和陰影、光澤 | 消費型 App、健康 |
| 網點絲印 | `riso` | 半色調網點、套色錯位 | 獨立出版、活動 |
| 新粗野 | `brutal` | 3px 粗線、直角、等寬大寫字 | 開發者工具、新創 |
| 手縫布藝 | `stitch` | 內側車縫虛線 | 手作、親子、寵物 |
| 水彩票根 | `ticket` | 打孔缺口、水彩暈染 | 旅遊、展覽、票務 |
| 啞光積木 | `block` | 厚底座、倒角光影 | 遊戲、兒童教育 |
| 藍圖線稿 | `blueprint` | 細線、四角裁切標記 | 工程、建築、硬體 |
| 醫療 | `clinical` | 海藍主色、44px 點擊範圍、清楚的 focus | 醫療院所、保險、政府 |
| 可愛 | `cute` | 大圓角、貼紙描邊、彈跳動畫 | 寵物、兒童、社群 |
| 金融 | `finance` | 高密度、等寬數字 | 交易平台、儀表板 |
| 編輯 | `editorial` | 襯線標題、髮絲線、直角 | 媒體、部落格、出版 |

文件網站的「主題」頁可以看到每個主題套在整頁上的效果。

## 開始使用

### 網頁（純 HTML）

```html
<html data-theme-style="cute">   <!-- 換主題；不加就是預設的紙雕分層 -->
<head>
  <link rel="stylesheet" href="https://zhijian090195.github.io/library/assets/aicde-ui.css">
  <script src="https://zhijian090195.github.io/library/assets/aicde-ui.js" defer></script>
</head>
<body>
  <button class="a-btn a-btn--primary">儲存</button>
</body>
</html>
```

只用到 CSS 的元件不需要引入 JS。每個元件需要哪些檔案，文件網站上都有寫。

### React

```bash
npm install aicde-ui
```

```tsx
import 'aicde-ui/style.css';
import { ThemeProvider, Button } from 'aicde-ui';

<ThemeProvider theme="cute">
  <Button variant="primary">儲存</Button>
</ThemeProvider>
```

詳細說明見 [`react/README.md`](react/README.md)。

### Flutter

```yaml
dependencies:
  aicde_ui:
    git:
      url: https://github.com/zhijian090195/library.git
      path: flutter
```

```dart
MaterialApp(
  theme: aicdeThemeData(style: AicdeThemeStyle.cute),
  darkTheme: aicdeThemeData(style: AicdeThemeStyle.cute, brightness: Brightness.dark),
);

AicdeButton(label: '儲存', variant: AicdeButtonVariant.primary, onPressed: save);
```

詳細說明見 [`flutter/README.md`](flutter/README.md)。

## 專案結構

```
index.html              文件網站入口
assets/
  aicde-ui.css          元件庫（網頁版，React 版也用這份）
  aicde-ui.js           需要互動的元件（標籤頁、對話框、表格排序…）
  docs*.js              元件文件與範例
  themes.js             主題說明
  templates*.js         主題頁用的整頁示範
react/                  React 套件 aicde-ui
flutter/                Flutter 套件 aicde_ui
tokens/                 設計 token 的唯一來源
tests/                  網頁版自動化測試
```

## 設計 token

色票、圓角、各主題的底色和元件高度都放在 [`tokens/tokens.json`](tokens/tokens.json)，三個版本都從這份產生。修改後執行：

```bash
node tokens/build.mjs
```

會同時更新 `aicde-ui.css` 和 Flutter 的 token。詳見 [`tokens/README.md`](tokens/README.md)。

## 開發

```bash
# 文件網站：任何靜態伺服器都可以
python3 -m http.server 8000      # 打開 http://localhost:8000

# 檢查 token 有沒有過期
node tokens/build.mjs --check

# 網頁版測試（無障礙與鍵盤操作）
python3 tests/web/test_core.py

# React
cd react && npm install && npm test && npm run build

# Flutter
cd flutter && flutter test
cd flutter/example && flutter run -d chrome   # 元件範例

# 更新線上的 Flutter 範例（CanvasKit 從 CDN 載入，本地那份不用上傳）
cd flutter/example && flutter build web --release --base-href /library/flutter-demo/ -o ../../flutter-demo && rm -rf ../../flutter-demo/canvaskit
```

## 授權

MIT
