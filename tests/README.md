# 測試

## 網頁版核心元件 `tests/web/test_core.py`

檢查按鈕、輸入框、下拉選擇、對話框、表格（含資料表格）是否符合 WAI-ARIA APG 與 WCAG AA。

```bash
pip install playwright && playwright install chromium   # 第一次
python3 tests/web/test_core.py        # 只印失敗
python3 tests/web/test_core.py -v     # 每一項都印
```

不需要先開伺服器，腳本會在隨機埠自己起一個。有失敗時結束碼為 1，可以直接放進 CI。

| 項目 | 內容 |
|---|---|
| axe-core 4.10.2 | 6 個元件頁 × 預設／brutal／clinical × 淺色／深色，外加開啟中的對話框；只算 serious、critical |
| 對話框 | 開啟後焦點移入、`:modal`、Tab／Shift+Tab 不離開、Esc 與取消鈕關閉後焦點回到開啟按鈕、開啟時鎖捲動、autofocus |
| 資料表格 | 排序鈕是 `type=button`、Enter／Space 切換 `aria-sort`、數字排序正確、表格有名稱、全選與部分選取、列的 `aria-selected`、「已選 N 筆」用 `aria-live` |
| 按鈕 | `.is-loading` 自動加上 `aria-busy`／`aria-disabled`、載入中不觸發 click、移除 class 後屬性一起移除 |
| 輸入框 | `.a-help` 用 `aria-describedby` 連到輸入框、`.is-error` 自動加 `aria-invalid`，用 JS 切換也會同步 |
| focus | 15 個主題 × 深淺色，每個核心控制項 focus 時都看得到外框或光暈 |
| 尺寸 | clinical 主題按鈕、輸入框高度 ≥ 44px |
| 系統設定 | 減少動態效果時對話框立即關閉；Windows 高對比（forced-colors）下 focus 仍有外框 |

### 已知例外

`KNOWN_CONTRAST`：預設（紙雕）主題的珊瑚紅、綠色實心底配白字，對比約 3.3:1，未達 AA 的 4.5:1。
這是品牌色的決定，目前列為警告（會印出 ⚠ 但不算失敗）。決定調整後，刪掉 `KNOWN_CONTRAST` 的處理，測試就會開始擋。

### 新增元件到測試

把元件 id 加進 `COMPONENTS`，axe 就會檢查它的文件頁範例；鍵盤行為另外寫一個 `test_xxx` 函式並在 `main()` 呼叫。

## 其他

- Token 是否同步：`node tokens/build.mjs --check`
- React：`cd react && npm run typecheck && npm run smoke`
- Flutter：`cd flutter && flutter test`
