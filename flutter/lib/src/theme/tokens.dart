import 'dart:ui' show lerpDouble;

import 'package:flutter/material.dart' show ThemeExtension;
import 'package:flutter/widgets.dart';

import 'colors.dart';
import 'generated_tokens.dart';

/// 15 種元件主題，和網頁版 `data-theme-style` 一一對應。
enum AicdeThemeStyle {
  /// 預設：紙雕分層，AICDE 原色
  paperCut,

  /// 無裝飾的簡潔版
  clean,

  /// 暖米色紙雕
  paper,

  /// 混合媒材手繪：墨線、不規則圓角、實心位移陰影
  ink,

  /// 柔光立體：膠囊、光澤、柔和陰影
  soft,

  /// 網點絲印：半色調、套色錯位
  riso,

  /// 新粗野：粗線、直角、等寬字
  brutal,

  /// 手縫布藝：內側車縫虛線
  stitch,

  /// 水彩票根：打孔缺口、撕線
  ticket,

  /// 啞光積木：倒角、厚底
  block,

  /// 藍圖線稿：細線、裁切角標
  blueprint,

  /// 醫療：深藍主色、44px 點擊範圍、清楚的 focus
  clinical,

  /// 可愛：大圓角、貼紙描邊、彈跳
  cute,

  /// 金融：高密度、等寬數字
  finance,

  /// 編輯：襯線標題、髮絲線
  editorial,
}

/// 元件底下「紙邊／陰影」的畫法
enum AicdeEdge {
  /// 沒有
  none,

  /// 底部一條實心厚度（紙雕、積木）：顏色取自填色的深色版
  solid,

  /// 實心位移陰影（混合媒材、粗野）：顏色為墨線色
  offset,

  /// 套色錯位（網點）：主要按鈕用深藍陰影、次要用珊瑚
  misregister,

  /// 柔和模糊陰影（柔光、醫療、金融）
  blur,

  /// 貼紙描邊：白圈 + 色圈（可愛）
  sticker,
}

/// 按下時的回饋
enum AicdePress {
  /// 往下沉到紙邊裡
  sink,

  /// 往陰影方向位移
  shift,

  /// 縮小
  scale,
}

/// 疊在表面上的材質
enum AicdeTexture { none, halftone, stitch, notch, corners, bevel, gloss, wash }

/// AICDE 設計 token。用 `AicdeTheme.of(context)` 取得。
///
/// 所有元件都透過 [AicdeBox] 依這些 token 畫外觀，
/// 所以換主題時每個元件會一起變，不需要逐一覆寫。
@immutable
class AicdeTokens extends ThemeExtension<AicdeTokens> {
  const AicdeTokens({
    required this.style,
    required this.brightness,
    required this.colors,
    required this.rXs,
    required this.rSm,
    required this.rMd,
    required this.rLg,
    required this.rPill,
    required this.buttonRadius,
    required this.inputRadius,
    required this.cardRadius,
    required this.tagRadius,
    required this.controlHeight,
    required this.strokeWidth,
    required this.strokeColor,
    required this.strokeAll,
    required this.edge,
    required this.edgeDepth,
    required this.press,
    required this.texture,
    required this.irregular,
    required this.underlineInputs,
    required this.primary,
    required this.onPrimary,
    required this.secondary,
    required this.onSecondary,
    required this.selectionBg,
    required this.selectionFg,
    required this.selectionRing,
    required this.focusColor,
    required this.hoverTilt,
    required this.motion,
    required this.curve,
    required this.fontFamily,
    required this.monoFamily,
    required this.headingFamily,
    required this.labelFamily,
    required this.upperLabels,
    required this.tabularNumbers,
  });

  final AicdeThemeStyle style;
  final Brightness brightness;
  final AicdeColors colors;

  // 圓角層級（和網頁版 --a-r-* 對應）
  final double rXs, rSm, rMd, rLg, rPill;

  // 各類元件的圓角
  final double buttonRadius, inputRadius, cardRadius, tagRadius;

  /// 按鈕與輸入框高度（醫療 44、金融 34、其他 40）
  final double controlHeight;

  /// 外框粗細與顏色；[strokeAll] 為 true 時所有控制項都描邊（墨線、粗野、藍圖）
  final double strokeWidth;
  final Color strokeColor;
  final bool strokeAll;

  final AicdeEdge edge;

  /// 紙邊／位移陰影的深度（px）
  final double edgeDepth;
  final AicdePress press;
  final AicdeTexture texture;

  /// 不規則的手繪圓角（混合媒材）
  final bool irregular;

  /// 輸入框只畫底線（網點、藍圖、編輯、票根）
  final bool underlineInputs;

  /// 主要按鈕的填色。多數主題是珊瑚；醫療用海藍、金融用深藍、編輯用墨色
  final Color primary, onPrimary, secondary, onSecondary;

  /// 選中項目（樹狀、選單、日曆）的底色與文字色
  final Color selectionBg, selectionFg;

  /// 選中項目左側的標記條顏色（編輯主題：選中底色透明，改用珊瑚色左邊條）；null 表示不畫
  final Color? selectionRing;
  final Color focusColor;

  /// 滑過時的傾斜角度（度），0 = 不傾斜
  final double hoverTilt;
  final Duration motion;
  final Curve curve;

  final String? fontFamily, monoFamily, headingFamily, labelFamily;

  /// 標籤、表頭用大寫字母（粗野、藍圖、金融、編輯）
  final bool upperLabels;
  final bool tabularNumbers;

  bool get isDark => brightness == Brightness.dark;

  /// 紙邊顏色：填色往深處調 22%
  Color edgeOf(Color fill) =>
      Color.lerp(fill, const Color(0xFF000000), isDark ? .45 : .22)!;

  BorderRadius radius(double r) {
    if (!irregular || r == 0) return BorderRadius.circular(r);
    // 手繪感：四個角大小不一的橢圓角
    return BorderRadius.only(
      topLeft: Radius.elliptical(r * 1.6, r * .6),
      topRight: Radius.elliptical(r * .5, r * 1.3),
      bottomRight: Radius.elliptical(r * 1.4, r * .5),
      bottomLeft: Radius.elliptical(r * .6, r * 1.5),
    );
  }

  static const _sans = 'Noto Sans TC';
  static const _mono = 'JetBrains Mono';
  static const _serif = 'Noto Serif TC';

  /// 依主題與深淺色產生 token
  factory AicdeTokens.resolve(AicdeThemeStyle style, Brightness brightness) {
    final dark = brightness == Brightness.dark;
    var c = dark ? AicdeColors.dark : AicdeColors.light;

    // 和網頁版共用的 token（tokens/tokens.json → generated_tokens.dart）
    final g = kAicdeThemeTokens[style]!;
    // 主題自己的淺色底（深色模式沿用深色 token，維持可讀性）
    if (!dark) {
      final o = g.surfaceLight;
      c = c.copyWith(surface: o.surface, surface2: o.surface2, line: o.line, lineStrong: o.lineStrong);
    }

    final inkK = dark ? const Color(0xFFEEF4F6) : const Color(0xFF173F50);
    final brutalK = dark ? const Color(0xFFEEF4F6) : const Color(0xFF0E1C23);

    AicdeTokens base({
      double? buttonRadius, double? inputRadius, double? cardRadius, double? tagRadius,
      double strokeWidth = 1, Color? strokeColor, bool strokeAll = false,
      AicdeEdge edge = AicdeEdge.none, double edgeDepth = 0, AicdePress press = AicdePress.scale,
      AicdeTexture texture = AicdeTexture.none, bool irregular = false, bool underlineInputs = false,
      Color? primary, Color? onPrimary, Color? secondary, Color? onSecondary,
      Color? selectionBg, Color? selectionFg, Color? selectionRing, Color? focusColor,
      double hoverTilt = 0, Duration motion = const Duration(milliseconds: 160),
      Curve curve = const Cubic(0.22, 1, 0.36, 1),
      String? fontFamily = _sans, String? headingFamily, String? labelFamily,
      bool upperLabels = false, bool tabularNumbers = false,
    }) {
      final rXs = g.rXs, rSm = g.rSm, rMd = g.rMd, rLg = g.rLg, rPill = g.rPill, controlHeight = g.controlHeight;
      return AicdeTokens(
        style: style, brightness: brightness, colors: c,
        rXs: rXs, rSm: rSm, rMd: rMd, rLg: rLg, rPill: rPill,
        buttonRadius: buttonRadius ?? rSm, inputRadius: inputRadius ?? rSm,
        cardRadius: cardRadius ?? rMd, tagRadius: tagRadius ?? rPill,
        controlHeight: controlHeight, strokeWidth: strokeWidth,
        strokeColor: strokeColor ?? c.lineStrong, strokeAll: strokeAll,
        edge: edge, edgeDepth: edgeDepth, press: press, texture: texture,
        irregular: irregular, underlineInputs: underlineInputs,
        primary: primary ?? c.coral, onPrimary: onPrimary ?? const Color(0xFFFFFFFF),
        secondary: secondary ?? c.navy, onSecondary: onSecondary ?? const Color(0xFFFFFFFF),
        selectionBg: selectionBg ?? c.coral.withValues(alpha: .12),
        selectionFg: selectionFg ?? c.coralDark,
        selectionRing: selectionRing,
        focusColor: focusColor ?? c.coral,
        hoverTilt: hoverTilt, motion: motion, curve: curve,
        fontFamily: fontFamily, monoFamily: _mono,
        headingFamily: headingFamily ?? fontFamily, labelFamily: labelFamily ?? fontFamily,
        upperLabels: upperLabels, tabularNumbers: tabularNumbers,
      );
    }

    const spring = Cubic(0.34, 1.56, 0.64, 1);

    switch (style) {
      case AicdeThemeStyle.paperCut:
      case AicdeThemeStyle.paper:
        return base(buttonRadius: 14, inputRadius: 12, cardRadius: 18, tagRadius: 14,
            edge: AicdeEdge.solid, edgeDepth: 4, press: AicdePress.sink,
            strokeColor: style == AicdeThemeStyle.paper
                ? (dark ? const Color(0xFF07161D) : const Color(0xFFE2D4BB))
                : (dark ? const Color(0xFF07161D) : const Color(0xFFC7D8DF)));
      case AicdeThemeStyle.clean:
        return base(press: AicdePress.scale);
      case AicdeThemeStyle.ink:
        return base(buttonRadius: 14, inputRadius: 10, cardRadius: 10, tagRadius: 2,
            strokeWidth: 2, strokeColor: inkK, strokeAll: true, edge: AicdeEdge.offset, edgeDepth: 3,
            press: AicdePress.shift, irregular: true, secondary: c.sky, onSecondary: const Color(0xFF173F50),
            hoverTilt: -1.2, selectionBg: c.coral.withValues(alpha: .4), selectionFg: c.ink);
      case AicdeThemeStyle.soft:
        return base(buttonRadius: 999, inputRadius: 16, cardRadius: 24,
            edge: AicdeEdge.blur, texture: AicdeTexture.gloss, press: AicdePress.scale,
            selectionBg: c.surface2, selectionFg: c.ink);
      case AicdeThemeStyle.riso:
        return base(buttonRadius: 10, inputRadius: 8, cardRadius: 14, tagRadius: 4,
            edge: AicdeEdge.misregister, edgeDepth: 4, press: AicdePress.shift, texture: AicdeTexture.halftone,
            underlineInputs: true, strokeColor: c.ink, selectionBg: c.coral, selectionFg: const Color(0xFFFFFFFF));
      case AicdeThemeStyle.brutal:
        return base(buttonRadius: 0, inputRadius: 0, cardRadius: 0, tagRadius: 0,
            strokeWidth: 3, strokeColor: brutalK, strokeAll: true, edge: AicdeEdge.offset, edgeDepth: 5,
            press: AicdePress.shift, secondary: c.sky, onSecondary: const Color(0xFF0E1C23),
            onPrimary: const Color(0xFF0E1C23), motion: const Duration(milliseconds: 100), curve: Curves.linear,
            labelFamily: _mono, upperLabels: true, selectionBg: brutalK, selectionFg: c.surface);
      case AicdeThemeStyle.stitch:
        return base(buttonRadius: 16, inputRadius: 14, cardRadius: 20, tagRadius: 4,
            edge: AicdeEdge.blur, texture: AicdeTexture.stitch, press: AicdePress.scale, hoverTilt: -.5,
            strokeColor: dark ? const Color(0x4DFFFFFF) : const Color(0x732B4552));
      case AicdeThemeStyle.ticket:
        return base(buttonRadius: 8, inputRadius: 10, cardRadius: 16, tagRadius: 4,
            edge: AicdeEdge.blur, texture: AicdeTexture.notch, press: AicdePress.scale, hoverTilt: -1,
            underlineInputs: true, strokeColor: dark ? const Color(0x4DFFFFFF) : const Color(0x59173F50),
            selectionBg: c.coral, selectionFg: const Color(0xFFFFFFFF));
      case AicdeThemeStyle.block:
        return base(buttonRadius: 8, inputRadius: 8, cardRadius: 12, tagRadius: 5,
            edge: AicdeEdge.solid, edgeDepth: 5, press: AicdePress.sink, texture: AicdeTexture.bevel,
            secondary: c.navy, selectionBg: c.coral, selectionFg: const Color(0xFFFFFFFF));
      case AicdeThemeStyle.blueprint:
        final line = dark ? const Color(0xFFA8C8D4) : const Color(0xFF173F50);
        return base(buttonRadius: 2, inputRadius: 0, cardRadius: 2, tagRadius: 2,
            strokeWidth: 1.5, strokeColor: line, strokeAll: true, texture: AicdeTexture.corners,
            underlineInputs: true, labelFamily: _mono, upperLabels: true,
            selectionBg: c.navy, selectionFg: const Color(0xFFFFFFFF));
      case AicdeThemeStyle.clinical:
        return base(buttonRadius: 10, inputRadius: 10, cardRadius: 14, tagRadius: 6,
            strokeWidth: 1.5, edge: AicdeEdge.blur, primary: c.band, focusColor: c.band,
            secondary: Color.lerp(c.surface, c.band, .12), onSecondary: c.ink,
            selectionBg: Color.lerp(c.surface, c.band, .12), selectionFg: c.band);
      case AicdeThemeStyle.cute:
        return base(buttonRadius: 999, inputRadius: 999, cardRadius: 28,
            edge: AicdeEdge.sticker, press: AicdePress.scale, hoverTilt: -2, curve: spring,
            motion: const Duration(milliseconds: 360), secondary: c.sky, onSecondary: const Color(0xFF173F50),
            selectionBg: dark ? const Color(0xFF5A2B31) : const Color(0xFFFFD9D6));
      case AicdeThemeStyle.finance:
        return base(buttonRadius: 4, inputRadius: 4, cardRadius: 6, tagRadius: 3,
            primary: c.navy, focusColor: c.navy, secondary: c.surface2, onSecondary: c.ink,
            upperLabels: true, tabularNumbers: true,
            selectionBg: Color.lerp(c.surface, c.navy, .1), selectionFg: c.navy);
      case AicdeThemeStyle.editorial:
        return base(buttonRadius: 0, inputRadius: 0, cardRadius: 0, tagRadius: 0,
            strokeColor: c.inkBody, underlineInputs: true, primary: c.inkBody, onPrimary: c.surface,
            secondary: c.coral, headingFamily: _serif, upperLabels: true,
            selectionBg: const Color(0x00000000), selectionFg: c.inkBody, selectionRing: c.coral);
    }
  }

  @override
  AicdeTokens copyWith({AicdeColors? colors, Color? primary, Color? secondary}) {
    return AicdeTokens(
      style: style, brightness: brightness, colors: colors ?? this.colors,
      rXs: rXs, rSm: rSm, rMd: rMd, rLg: rLg, rPill: rPill,
      buttonRadius: buttonRadius, inputRadius: inputRadius, cardRadius: cardRadius, tagRadius: tagRadius,
      controlHeight: controlHeight, strokeWidth: strokeWidth, strokeColor: strokeColor, strokeAll: strokeAll,
      edge: edge, edgeDepth: edgeDepth, press: press, texture: texture, irregular: irregular,
      underlineInputs: underlineInputs, primary: primary ?? this.primary, onPrimary: onPrimary,
      secondary: secondary ?? this.secondary, onSecondary: onSecondary,
      selectionBg: selectionBg, selectionFg: selectionFg, selectionRing: selectionRing, focusColor: focusColor,
      hoverTilt: hoverTilt, motion: motion, curve: curve, fontFamily: fontFamily, monoFamily: monoFamily,
      headingFamily: headingFamily, labelFamily: labelFamily, upperLabels: upperLabels, tabularNumbers: tabularNumbers,
    );
  }

  /// 主題切換時：顏色與數值平滑過渡，形狀類設定在中點切換
  @override
  AicdeTokens lerp(covariant AicdeTokens? other, double t) {
    if (other == null) return this;
    final o = t < .5 ? this : other;
    double d(double a, double b) => lerpDouble(a, b, t)!;
    Color col(Color a, Color b) => Color.lerp(a, b, t)!;
    return AicdeTokens(
      style: o.style, brightness: o.brightness, colors: AicdeColors.lerp(colors, other.colors, t),
      rXs: d(rXs, other.rXs), rSm: d(rSm, other.rSm), rMd: d(rMd, other.rMd), rLg: d(rLg, other.rLg),
      rPill: d(rPill.clamp(0, 60), other.rPill.clamp(0, 60)) >= 59 ? 999 : d(rPill.clamp(0, 60), other.rPill.clamp(0, 60)),
      buttonRadius: d(buttonRadius.clamp(0, 60), other.buttonRadius.clamp(0, 60)),
      inputRadius: d(inputRadius.clamp(0, 60), other.inputRadius.clamp(0, 60)),
      cardRadius: d(cardRadius, other.cardRadius), tagRadius: d(tagRadius.clamp(0, 60), other.tagRadius.clamp(0, 60)),
      controlHeight: d(controlHeight, other.controlHeight), strokeWidth: d(strokeWidth, other.strokeWidth),
      strokeColor: col(strokeColor, other.strokeColor), strokeAll: o.strokeAll,
      edge: o.edge, edgeDepth: d(edgeDepth, other.edgeDepth), press: o.press, texture: o.texture,
      irregular: o.irregular, underlineInputs: o.underlineInputs,
      primary: col(primary, other.primary), onPrimary: col(onPrimary, other.onPrimary),
      secondary: col(secondary, other.secondary), onSecondary: col(onSecondary, other.onSecondary),
      selectionBg: col(selectionBg, other.selectionBg), selectionFg: col(selectionFg, other.selectionFg),
      selectionRing: Color.lerp(selectionRing, other.selectionRing, t),
      focusColor: col(focusColor, other.focusColor), hoverTilt: d(hoverTilt, other.hoverTilt),
      motion: o.motion, curve: o.curve, fontFamily: o.fontFamily, monoFamily: o.monoFamily,
      headingFamily: o.headingFamily, labelFamily: o.labelFamily, upperLabels: o.upperLabels,
      tabularNumbers: o.tabularNumbers,
    );
  }
}
