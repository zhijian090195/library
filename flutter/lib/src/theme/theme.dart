import 'package:flutter/material.dart';

import 'tokens.dart';

/// 產生帶有 AICDE token 的 [ThemeData]，用在 `MaterialApp(theme:, darkTheme:)`。
///
/// 除了 [AicdeTokens] extension，也一併設定 Material 元件的主題，
/// 讓 App 裡原生的 `ElevatedButton`、`TextField`、`Switch` 等大致跟著 AICDE 風格。
ThemeData aicdeThemeData({
  AicdeThemeStyle style = AicdeThemeStyle.paperCut,
  Brightness brightness = Brightness.light,
}) {
  final t = AicdeTokens.resolve(style, brightness);
  final c = t.colors;
  final scheme = ColorScheme(
    brightness: brightness,
    primary: t.primary,
    onPrimary: t.onPrimary,
    secondary: t.secondary,
    onSecondary: t.onSecondary,
    error: c.danger,
    onError: Colors.white,
    surface: c.surface,
    onSurface: c.inkBody,
    surfaceContainerHighest: c.surface2,
    outline: c.lineStrong,
    outlineVariant: c.line,
  );
  final shape = RoundedRectangleBorder(
    borderRadius: t.radius(t.buttonRadius.clamp(0, t.controlHeight / 2)),
    side: t.strokeAll ? BorderSide(color: t.strokeColor, width: t.strokeWidth) : BorderSide.none,
  );
  final text = Typography.material2021(platform: TargetPlatform.android)
      .black
      .apply(fontFamily: t.fontFamily, bodyColor: c.inkBody, displayColor: c.ink);
  final darkText = Typography.material2021(platform: TargetPlatform.android)
      .white
      .apply(fontFamily: t.fontFamily, bodyColor: c.inkBody, displayColor: c.ink);

  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    colorScheme: scheme,
    scaffoldBackgroundColor: c.surface2,
    canvasColor: c.surface,
    fontFamily: t.fontFamily,
    textTheme: brightness == Brightness.dark ? darkText : text,
    dividerColor: c.line,
    focusColor: t.focusColor.withValues(alpha: .24),
    splashFactory: NoSplash.splashFactory,
    extensions: [t],
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: t.primary,
        foregroundColor: t.onPrimary,
        minimumSize: Size(0, t.controlHeight),
        shape: shape,
        elevation: 0,
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: c.ink,
        minimumSize: Size(0, t.controlHeight),
        shape: shape,
        side: BorderSide(color: t.strokeAll ? t.strokeColor : c.lineStrong, width: t.strokeWidth),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(foregroundColor: c.ink, minimumSize: Size(0, t.controlHeight)),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: !t.underlineInputs,
      fillColor: c.surface,
      isDense: t.controlHeight < 40,
      border: t.underlineInputs
          ? UnderlineInputBorder(borderSide: BorderSide(color: t.strokeColor, width: t.strokeWidth))
          : OutlineInputBorder(
              borderRadius: BorderRadius.circular(t.inputRadius.clamp(0, 24)),
              borderSide: BorderSide(color: t.strokeAll ? t.strokeColor : c.lineStrong, width: t.strokeWidth)),
      enabledBorder: t.underlineInputs
          ? UnderlineInputBorder(borderSide: BorderSide(color: t.strokeColor, width: t.strokeWidth))
          : OutlineInputBorder(
              borderRadius: BorderRadius.circular(t.inputRadius.clamp(0, 24)),
              borderSide: BorderSide(color: t.strokeAll ? t.strokeColor : c.lineStrong, width: t.strokeWidth)),
      focusedBorder: t.underlineInputs
          ? UnderlineInputBorder(borderSide: BorderSide(color: t.focusColor, width: 2))
          : OutlineInputBorder(
              borderRadius: BorderRadius.circular(t.inputRadius.clamp(0, 24)),
              borderSide: BorderSide(color: t.focusColor, width: 2)),
    ),
    switchTheme: SwitchThemeData(
      trackColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? t.primary : c.lineStrong),
      thumbColor: const WidgetStatePropertyAll(Colors.white),
      trackOutlineColor: const WidgetStatePropertyAll(Colors.transparent),
    ),
    checkboxTheme: CheckboxThemeData(
      fillColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? t.primary : Colors.transparent),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(t.rXs)),
    ),
    radioTheme: RadioThemeData(
      fillColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? t.primary : c.lineStrong),
    ),
    cardTheme: CardThemeData(
      color: c.surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: t.radius(t.cardRadius),
        side: t.strokeAll ? BorderSide(color: t.strokeColor, width: t.strokeWidth) : BorderSide(color: c.line),
      ),
    ),
    dialogTheme: DialogThemeData(
      backgroundColor: c.surface,
      shape: RoundedRectangleBorder(borderRadius: t.radius(t.rLg + 4)),
    ),
    progressIndicatorTheme: ProgressIndicatorThemeData(color: t.primary, linearTrackColor: c.surface2),
    sliderTheme: SliderThemeData(activeTrackColor: t.primary, inactiveTrackColor: c.lineStrong, thumbColor: t.primary),
    tabBarTheme: TabBarThemeData(labelColor: c.ink, unselectedLabelColor: c.ink2, indicatorColor: t.primary),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: c.navy,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(t.rMd)),
    ),
  );
}

/// 讓一個區塊使用指定的主題（不影響外面），等同網頁版的 `data-theme-style` 包裝。
///
/// ```dart
/// AicdeTheme(style: AicdeThemeStyle.cute, child: AicdeButton(...))
/// ```
class AicdeTheme extends StatelessWidget {
  const AicdeTheme({
    super.key,
    this.style = AicdeThemeStyle.paperCut,
    this.mode = ThemeMode.system,
    required this.child,
  });

  final AicdeThemeStyle style;

  /// light / dark / system（跟著系統或外層）
  final ThemeMode mode;
  final Widget child;

  /// 取得目前的 token；外層沒有設定時，回傳預設主題（紙雕分層）
  static AicdeTokens of(BuildContext context) {
    final theme = Theme.of(context);
    return theme.extension<AicdeTokens>() ??
        AicdeTokens.resolve(AicdeThemeStyle.paperCut, theme.brightness);
  }

  @override
  Widget build(BuildContext context) {
    final brightness = switch (mode) {
      ThemeMode.light => Brightness.light,
      ThemeMode.dark => Brightness.dark,
      ThemeMode.system => Theme.of(context).brightness,
    };
    final data = aicdeThemeData(style: style, brightness: brightness);
    return Theme(
      data: data,
      child: DefaultTextStyle.merge(
        style: TextStyle(color: data.colorScheme.onSurface, fontFamily: data.extension<AicdeTokens>()!.fontFamily),
        child: child,
      ),
    );
  }
}
