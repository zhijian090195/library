<p align="center"><img src="https://zhijian090195.github.io/library/assets/aicde-mark.png" width="80" alt="AICDE"></p>

# aicde-ui

給 React 用的現成元件：按鈕、輸入框、表格、對話框、通知……裝好就能用，還能一鍵換成 15 種風格。

- **看所有元件和範例**：https://zhijian090195.github.io/library/
- **原始碼**：https://github.com/zhijian090195/library

## 安裝

```bash
npm install aicde-ui
```

需要 React 18 以上。

## 三步開始用

**1. 在入口檔案引入樣式（只要一次）**

一般 React 專案放在 `main.jsx`；Next.js 放在 `app/layout.jsx`。

```tsx
import 'aicde-ui/style.css';
```

**2. 在要用的地方引入元件**

```tsx
import { Button, Toaster, toast } from 'aicde-ui';

export default function App() {
  return (
    <>
      <Button variant="primary" onClick={() => toast('已儲存', { type: 'success' })}>
        儲存
      </Button>
      <Toaster />
    </>
  );
}
```

**3.（建議）加上字型**

放在網頁的 `<head>` 裡，字會比較好看：

```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Noto+Sans+TC:wght@400;500;700&family=JetBrains+Mono:wght@500;700&family=Noto+Serif+TC:wght@700&display=swap" rel="stylesheet">
```

**小提醒**

- 要跳通知（`toast`、`notify`），畫面上要放一個 `<Toaster />`。
- Next.js 可以直接用，不用另外設定。

## 換風格

用 `ThemeProvider` 包起來，`theme` 填風格名稱：

```tsx
import { ThemeProvider } from 'aicde-ui';

<ThemeProvider theme="cute" mode="dark">
  <App />
</ThemeProvider>
```

`mode` 可以填 `light`（淺色）、`dark`（深色）或 `system`（跟著電腦設定）。

| theme | 風格 | 適合 |
|---|---|---|
| `default` | 紙雕（預設）：像紙一層層疊起來 | 品牌官網、一般產品 |
| `clean` | 簡潔：細框、沒有陰影 | 後台、工具 |
| `paper` | 暖紙雕：米色紙張 | 餐飲、文創 |
| `ink` | 混合媒材：手繪墨線 | 創意工作室、教育 |
| `soft` | 柔光：圓圓的、柔和陰影 | 消費型 App、健康 |
| `riso` | 網點絲印：印刷網點 | 活動、出版 |
| `brutal` | 新粗野：粗黑框、直角 | 開發者工具、新創 |
| `stitch` | 手縫布藝：車縫虛線 | 手作、親子、寵物 |
| `ticket` | 水彩票根：打孔、水彩 | 旅遊、售票 |
| `block` | 積木：厚底、立體 | 遊戲、兒童 |
| `blueprint` | 藍圖：工程細線 | 工程、建築 |
| `clinical` | 醫療：海藍色、按鈕大好點 | 醫院、保險、政府 |
| `cute` | 可愛：大圓角、會彈跳 | 寵物、兒童、社群 |
| `finance` | 金融：資訊密集、數字對齊 | 交易平台、報表 |
| `editorial` | 編輯：雜誌感、襯線標題 | 媒體、部落格 |


## 打擊特效（選用）

讓按鈕、開關、勾選框這些元件一按下去就壓扁、回彈，旁邊冒出爆炸、煙霧、火花和「砰！」這類擬聲字。

```tsx
// 入口檔案引入一次
import 'aicde-ui/fx';

// 包在 ThemeProvider 裡，加上 fx
<ThemeProvider fx>
  <App />
</ThemeProvider>
```

操作成功時，在按鈕上蓋一個打勾：

```tsx
import { fxDone } from 'aicde-ui/fx';

<Button variant="primary" onClick={async e => {
  const el = e.currentTarget;
  await save();
  fxDone(el);   // 成功了才呼叫
}}>儲存</Button>
```

- `<ThemeProvider fx={false}>` 可以在已開啟的範圍裡關掉一塊；不要擬聲字就在外層加 `data-fx-word="off"`。
- 有特效的元件：Button、Switch、Checkbox、Radio、Rating、Slider、Input、Tabs、Progress、toast。
- 使用者的系統開了「減少動態效果」時，特效會自動關掉。在伺服器端（SSR）載入時什麼都不做。
- 線上試玩：https://zhijian090195.github.io/library/#/fx

## 有哪些元件

| 類別 | 元件 |
|---|---|
| 通用 | `Button` 按鈕、`Divider` 分隔線、`FloatButton` 浮動按鈕、`BackTop` 回到頂部 |
| 導覽 | `Tabs` 分頁標籤、`Pagination` 頁碼、`Dropdown` 下拉選單、`Breadcrumb` 麵包屑、`Steps` 步驟、`Menu` 側邊選單、`CommandPalette` 指令面板、`ContextMenu` 右鍵選單 |
| 輸入 | `Input` 輸入框、`Textarea` 多行輸入、`Select` 下拉選擇、`Checkbox` 勾選、`Radio` 單選、`Switch` 開關、`Segmented` 分段切換、`Slider` 滑桿、`InputNumber` 數字、`OtpInput` 驗證碼、`Autocomplete` 自動完成、`Cascader` 多層選擇、`ColorPicker` 選色、`DatePicker` 日期、`RangePicker` 日期範圍、`Rating` 評分、`Upload` 上傳、`TagInput` 標籤輸入、`Transfer` 穿梭框、`Field` 欄位標題與錯誤訊息 |
| 展示 | `Card` 卡片、`Tag` 標籤、`Badge` 徽章、`Avatar` 頭像、`Table` 表格、`DataTable` 可排序表格、`List` 列表、`Descriptions` 資料欄位、`Statistic` 數字、`Timeline` 時間軸、`Collapse` 折疊、`Tooltip` 提示、`Calendar` 月曆、`Tree` 樹狀、`Carousel` 輪播、`ImagePreview` 看大圖、`Empty` 空狀態、`Kbd` 鍵盤按鍵 |
| 回饋 | `Modal` 對話框、`Drawer` 側邊抽屜、`toast()` / `notify()` 通知、`Alert` 提示、`Banner` 橫幅、`Progress` 進度條、`Spinner` 轉圈、`Skeleton` 載入佔位、`Popover` 彈出卡片、`Result` 結果頁 |

每個元件怎麼用、有哪些參數，網站上都有範例。

**兩種寫法都可以**：元件可以讓它自己記住狀態（例如 `defaultValue`），也可以由你控制（例如 `value` + `onChange`）。

## 好操作

按鈕、輸入框、下拉選擇、對話框、表格這幾個最常用的元件，都測試過只用鍵盤也能操作，視障者用的讀屏軟體也念得出來。

## 授權

- 程式碼是 MIT 授權，可以免費使用、修改、商用。
- AICDE 名稱和 logo 不包含在內，做自己的產品時請換成你自己的。
