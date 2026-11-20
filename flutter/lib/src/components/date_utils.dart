/// 日曆、範圍選擇共用的日期工具。日期以 `YYYY-MM-DD` 字串表示（和 React 版一致），可直接用字串比大小。
library;

String _pad(int n) => n.toString().padLeft(2, '0');

/// DateTime → `YYYY-MM-DD`
String aicdeDateKey(DateTime d) => '${d.year}-${_pad(d.month)}-${_pad(d.day)}';

/// `YYYY-MM-DD` → DateTime（本地時間 00:00）；格式錯誤回傳 null
DateTime? aicdeParseDateKey(String? k) {
  if (k == null || k.isEmpty) return null;
  final p = k.split('-').map(int.tryParse).toList();
  if (p.isEmpty || p[0] == null) return null;
  return DateTime(p[0]!, p.length > 1 && p[1] != null ? p[1]! : 1, p.length > 2 && p[2] != null ? p[2]! : 1);
}

/// 星期標籤，週日開始
const aicdeWeekLabels = ['日', '一', '二', '三', '四', '五', '六'];

/// 42 格：從當月 1 號那一週的星期日開始
List<DateTime> aicdeMonthGrid(int year, int month) {
  final first = DateTime(year, month, 1);
  final offset = first.weekday % 7; // DateTime.weekday：週一 = 1 … 週日 = 7
  return List.generate(42, (i) => DateTime(year, month, 1 - offset + i));
}
