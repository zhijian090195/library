# 設計 token

`tokens.json` 是 AICDE 設計 token 的唯一來源。網頁、React、Flutter 三個版本的色票、圓角、主題底色和控制項高度都從這裡產生。

## 修改流程

1. 改 `tokens.json`
2. 執行 `node tokens/build.mjs`，會更新：
   - `assets/aicde-ui.css` 裡 `@tokens:base` 和 `@tokens:themes` 兩段標記之間的內容（React 版建置時會複製這份 CSS）
   - `flutter/lib/src/theme/generated_tokens.dart`
3. 不要手動修改上面這兩段產生的內容，下次產生時會被覆蓋

## 檢查

- `node tokens/build.mjs --check`：產出和 `tokens.json` 不一致時會失敗。React 的 `npm publish` 會先跑這個檢查。
- `flutter/test/tokens_parity_test.dart`：直接讀 `tokens.json`，確認 Flutter 解析出的每個主題都一致。

## 哪些東西不在這裡

紙邊、墨線、網點、車縫線這些材質效果，在網頁上是 CSS 規則，在 Flutter 是繪圖程式，寫法完全不同，所以仍然留在各自的程式碼裡。這裡只放三個版本都應該一模一樣的數值。

| 欄位 | 內容 |
|---|---|
| `color.light` / `color.dark` | 色票；深色只列和淺色不同的值 |
| `radius` | 預設圓角階層（xs / sm / md / lg / pill / base） |
| `controlHeight` | 按鈕、輸入框的預設高度 |
| `themes.<id>.radius` | 主題覆寫的圓角 |
| `themes.<id>.surfaceLight` | 主題在淺色模式下的底色與線條色 |
| `themes.<id>.controlHeight` | 主題覆寫的高度（醫療 44、金融 34） |
| `themes.<id>.flutter` | Flutter `AicdeThemeStyle` 名稱（和 id 不同時才寫） |
