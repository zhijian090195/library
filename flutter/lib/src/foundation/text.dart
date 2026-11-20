import 'package:flutter/widgets.dart';

import '../theme/tokens.dart';

/// 依主題產生文字樣式。所有元件的文字都從這裡拿，主題的字體規則（大寫標籤、襯線標題、等寬數字）才會一致。
extension AicdeTextStyles on AicdeTokens {
  /// 按鈕、標籤頁、分段控制器上的文字
  TextStyle label({double size = 14, FontWeight weight = FontWeight.w600, Color? color}) => TextStyle(
        fontFamily: labelFamily,
        fontSize: upperLabels && labelFamily == monoFamily ? size - 1 : size,
        fontWeight: weight,
        letterSpacing: upperLabels ? .6 : 0,
        height: 1,
        color: color ?? colors.ink,
      );

  /// 卡片標題、對話框標題
  TextStyle heading({double size = 17, Color? color}) => TextStyle(
        fontFamily: headingFamily,
        fontSize: size,
        fontWeight: FontWeight.w700,
        height: 1.35,
        color: color ?? colors.ink,
      );

  /// 內文
  TextStyle body({double size = 14, Color? color}) =>
      TextStyle(fontFamily: fontFamily, fontSize: size, height: 1.6, color: color ?? colors.inkBody);

  /// 小字說明
  TextStyle caption({double size = 12, Color? color}) =>
      TextStyle(fontFamily: fontFamily, fontSize: size, height: 1.5, color: color ?? colors.ink2);

  /// 數字（統計、表格、分頁）
  TextStyle number({double size = 14, FontWeight weight = FontWeight.w600, Color? color}) => TextStyle(
        fontFamily: tabularNumbers ? monoFamily : fontFamily,
        fontSize: size,
        fontWeight: weight,
        fontFeatures: const [FontFeature.tabularFigures()],
        color: color ?? colors.ink,
      );

  /// 依主題決定標籤文字要不要轉大寫
  String labelText(String s) => upperLabels ? s.toUpperCase() : s;
}
