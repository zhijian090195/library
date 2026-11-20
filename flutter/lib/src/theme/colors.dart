import 'package:flutter/widgets.dart';

import 'generated_tokens.dart';

/// AICDE 色票。品牌色（navy / coral / sky）在所有主題都一樣，
/// 表面、文字、線條會依深淺色與主題調整。
@immutable
class AicdeColors {
  const AicdeColors({
    required this.navy,
    required this.band,
    required this.coral,
    required this.coralDark,
    required this.sky,
    required this.surface,
    required this.surface2,
    required this.ink,
    required this.inkBody,
    required this.ink2,
    required this.ink3,
    required this.line,
    required this.lineStrong,
    required this.danger,
    required this.success,
    required this.warning,
  });

  final Color navy;
  final Color band;
  final Color coral;
  final Color coralDark;
  final Color sky;

  /// 元件底色（卡片、輸入框、對話框）
  final Color surface;

  /// 次要底色（分段控制器、骨架屏、表頭）
  final Color surface2;

  /// 標題、強調文字
  final Color ink;

  /// 內文
  final Color inkBody;
  final Color ink2;
  final Color ink3;
  final Color line;
  final Color lineStrong;
  final Color danger;
  final Color success;
  final Color warning;

  static const AicdeColors light = kAicdeLight;


  static const AicdeColors dark = kAicdeDark;


  AicdeColors copyWith({
    Color? surface,
    Color? surface2,
    Color? line,
    Color? lineStrong,
  }) {
    return AicdeColors(
      navy: navy,
      band: band,
      coral: coral,
      coralDark: coralDark,
      sky: sky,
      surface: surface ?? this.surface,
      surface2: surface2 ?? this.surface2,
      ink: ink,
      inkBody: inkBody,
      ink2: ink2,
      ink3: ink3,
      line: line ?? this.line,
      lineStrong: lineStrong ?? this.lineStrong,
      danger: danger,
      success: success,
      warning: warning,
    );
  }

  static AicdeColors lerp(AicdeColors a, AicdeColors b, double t) {
    Color l(Color x, Color y) => Color.lerp(x, y, t)!;
    return AicdeColors(
      navy: l(a.navy, b.navy),
      band: l(a.band, b.band),
      coral: l(a.coral, b.coral),
      coralDark: l(a.coralDark, b.coralDark),
      sky: l(a.sky, b.sky),
      surface: l(a.surface, b.surface),
      surface2: l(a.surface2, b.surface2),
      ink: l(a.ink, b.ink),
      inkBody: l(a.inkBody, b.inkBody),
      ink2: l(a.ink2, b.ink2),
      ink3: l(a.ink3, b.ink3),
      line: l(a.line, b.line),
      lineStrong: l(a.lineStrong, b.lineStrong),
      danger: l(a.danger, b.danger),
      success: l(a.success, b.success),
      warning: l(a.warning, b.warning),
    );
  }
}
