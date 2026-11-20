# aicde_ui

AICDE 風格的 Flutter 元件庫，和網頁版（`aicde-ui.css`）、React 版（`aicde-ui`）同一套設計：

- **15 種主題**：紙雕分層（預設）、簡潔、暖紙雕、混合媒材、柔光立體、網點絲印、新粗野、手縫布藝、水彩票根、啞光積木、藍圖線稿、醫療、可愛、金融、編輯
- **深淺色**都支援，跟著 `MaterialApp` 的 `themeMode`
- **元件外觀一致**：所有元件都透過同一個 `AicdeBox` 畫紙邊、墨線、網點、車縫線、票根缺口等材質。換主題時，所有元件一起換
- 不依賴任何第三方套件

## 安裝

```yaml
dependencies:
  aicde_ui:
    git:
      url: https://github.com/zhijian090195/design.git
      path: flutter
```

## 使用

```dart
import 'package:aicde_ui/aicde_ui.dart';

MaterialApp(
  theme: aicdeThemeData(style: AicdeThemeStyle.paperCut),
  darkTheme: aicdeThemeData(style: AicdeThemeStyle.paperCut, brightness: Brightness.dark),
  home: ...,
);

AicdeButton(label: '儲存', variant: AicdeButtonVariant.primary, onPressed: save);
```

`aicdeThemeData` 同時設定 Material 原生元件（`ElevatedButton`、`TextField`、`Switch`…）的主題，讓它們和 AICDE 元件看起來一致。

### 只換某個區塊的主題

```dart
AicdeTheme(
  style: AicdeThemeStyle.cute,
  child: AicdeButton(label: '可愛', onPressed: () {}),
)
```

### 取得 token 做自己的元件

```dart
final t = AicdeTheme.of(context);
AicdePressable(
  onTap: () {},
  builder: (context, states) => AicdeBox(
    kind: AicdeBoxKind.card,
    states: states,
    padding: const EdgeInsets.all(16),
    child: Text('自訂卡片', style: t.heading()),
  ),
);
```

用 `AicdeBox` 包起來的自訂元件，會自動套用每個主題的材質和互動回饋。

## 主題對照

| `AicdeThemeStyle` | 網頁 `data-theme-style` | 特色 |
|---|---|---|
| `paperCut` | （不設定） | 紙雕分層、底部紙邊、按下時下沉 |
| `clean` | `clean` | 無裝飾 |
| `paper` | `paper` | 暖米色紙雕 |
| `ink` | `ink` | 墨線、不規則圓角、實心位移陰影 |
| `soft` | `soft` | 膠囊、光澤、柔和陰影 |
| `riso` | `riso` | 半色調網點、套色錯位 |
| `brutal` | `brutal` | 3px 粗線、直角、等寬大寫標籤 |
| `stitch` | `stitch` | 內側車縫虛線 |
| `ticket` | `ticket` | 打孔缺口、水彩暈染 |
| `block` | `block` | 倒角、厚底 |
| `blueprint` | `blueprint` | 細線、四角裁切標記 |
| `clinical` | `clinical` | 深海藍主色、44px 點擊範圍 |
| `cute` | `cute` | 大圓角、貼紙描邊、彈跳動畫 |
| `finance` | `finance` | 高密度、等寬數字 |
| `editorial` | `editorial` | 襯線標題、髮絲線、直角 |

## 字型

元件使用 Noto Sans TC、JetBrains Mono、Noto Serif TC。沒有安裝時會退回系統字型。需要完全一致時，可在 App 內加入字型檔，或使用 `google_fonts` 套件。

## 無障礙

- 所有可點擊元件都支援鍵盤 focus，用 Enter / Space 觸發
- 系統開啟「減少動態效果」時，動畫會關閉

## 範例

```bash
cd example && flutter run -d chrome
```

## 授權

MIT
