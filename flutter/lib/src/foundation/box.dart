import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import '../theme/theme.dart';
import '../theme/tokens.dart';
import 'painters.dart';

/// 元件類型：決定用哪一組圓角、要不要紙邊、材質疊多少
enum AicdeBoxKind {
  /// 按鈕、分段控制器的選中塊
  control,

  /// 輸入框、選擇器
  field,

  /// 卡片
  card,

  /// 標籤、徽章
  chip,

  /// 表格、清單、日曆等容器
  panel,

  /// 下拉選單、彈出卡片、對話框、Toast
  overlay,
}

/// 外觀強度
enum AicdeEmphasis {
  /// 實心填色
  solid,

  /// 外框（底色為 surface）
  outline,

  /// 無框無底，只有內容
  ghost,
}

/// 互動狀態
@immutable
class AicdeStates {
  const AicdeStates({this.hovered = false, this.pressed = false, this.focused = false, this.disabled = false, this.selected = false, this.error = false});
  final bool hovered, pressed, focused, disabled, selected;

  /// 欄位內容有誤：外框、底線、focus 都改用危險色（所有主題，包括全描邊的墨線、粗野、藍圖）
  final bool error;

  AicdeStates copyWith({bool? hovered, bool? pressed, bool? focused, bool? disabled, bool? selected, bool? error}) => AicdeStates(
        hovered: hovered ?? this.hovered,
        pressed: pressed ?? this.pressed,
        focused: focused ?? this.focused,
        disabled: disabled ?? this.disabled,
        selected: selected ?? this.selected,
        error: error ?? this.error,
      );
  static const none = AicdeStates();
}

/// **所有 AICDE 元件的外觀都由這個 widget 畫出來。**
///
/// 傳入「我是什麼（[kind]）、什麼顏色（[fill]）、現在什麼狀態（[states]）」，
/// 它會依目前主題的 token 畫出紙邊、墨線、網點、車縫線、票根缺口等材質。
/// 自訂元件只要用 [AicdeBox] 包起來，就會自動跟著所有主題一致。
class AicdeBox extends StatelessWidget {
  const AicdeBox({
    super.key,
    this.kind = AicdeBoxKind.control,
    this.emphasis = AicdeEmphasis.solid,
    this.fill,
    this.states = AicdeStates.none,
    this.padding,
    this.width,
    this.height,
    this.radius,
    this.clip = false,
    this.alignment,
    required this.child,
  });

  final AicdeBoxKind kind;
  final AicdeEmphasis emphasis;

  /// 填色；預設為 surface
  final Color? fill;
  final AicdeStates states;
  final EdgeInsetsGeometry? padding;
  final double? width, height;

  /// 覆寫圓角；預設依 [kind] 取主題 token
  final double? radius;

  /// 內容超出圓角時是否裁切（圖片卡片要開）
  final bool clip;
  final AlignmentGeometry? alignment;
  final Widget child;

  double _radiusFor(AicdeTokens t) => radius ?? switch (kind) {
        AicdeBoxKind.control => t.buttonRadius,
        AicdeBoxKind.field => t.inputRadius,
        AicdeBoxKind.card => t.cardRadius,
        AicdeBoxKind.chip => t.tagRadius,
        AicdeBoxKind.panel => t.rLg,
        AicdeBoxKind.overlay => t.rMd,
      };

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final s = states;
    final ghost = emphasis == AicdeEmphasis.ghost;
    final outline = emphasis == AicdeEmphasis.outline;
    final isField = kind == AicdeBoxKind.field;
    final raised = !ghost && (kind == AicdeBoxKind.control || kind == AicdeBoxKind.chip || kind == AicdeBoxKind.card || kind == AicdeBoxKind.panel);
    final interactive = kind == AicdeBoxKind.control || kind == AicdeBoxKind.card;

    final baseFill = ghost ? const Color(0x00000000) : (fill ?? c.surface);
    final r = math.min(_radiusFor(t), t.irregular ? 24.0 : 999.0);
    final br = t.radius(r);
    final onSurfaceFill = fill == null || outline || fill == c.surface;

    // ── 外框 ──
    Border? border;
    final err = isField && s.error;
    final strokeC = err ? c.danger : (isField && s.focused ? t.focusColor : (t.strokeAll ? t.strokeColor : c.lineStrong));
    final strokeW = isField && s.focused ? math.max(t.strokeWidth, 1.5) : t.strokeWidth;
    if (isField && t.underlineInputs) {
      border = Border(bottom: BorderSide(color: err ? c.danger : (s.focused ? t.focusColor : t.strokeColor), width: s.focused ? 2.5 : math.max(1.5, t.strokeWidth)));
    } else if (!ghost && (t.strokeAll || outline || isField || (kind == AicdeBoxKind.panel || kind == AicdeBoxKind.overlay || kind == AicdeBoxKind.card) && t.edge != AicdeEdge.sticker)) {
      final w = (t.strokeAll || isField || outline) ? strokeW : 1.0;
      final col = (t.strokeAll || isField || outline) ? strokeC : c.line;
      border = Border.all(color: col, width: w);
    }

    // ── 紙邊／陰影 ──
    final shadows = <BoxShadow>[];
    var dx = 0.0, dy = 0.0, rot = 0.0, scale = 1.0;
    final d = t.edgeDepth;
    if (!ghost && !s.disabled) {
      switch (t.edge) {
        case AicdeEdge.solid:
          if (raised || kind == AicdeBoxKind.overlay) {
            final edgeC = onSurfaceFill ? t.strokeColor : t.edgeOf(baseFill);
            final depth = interactive && s.pressed ? 0.0 : d + (interactive && s.hovered ? 2 : 0);
            shadows.add(BoxShadow(color: edgeC, offset: Offset(0, depth)));
            if (kind != AicdeBoxKind.chip) {
              shadows.add(BoxShadow(color: c.ink.withValues(alpha: .18), offset: Offset(0, depth + 8), blurRadius: 18, spreadRadius: -10));
            }
            if (interactive) dy = s.pressed ? d : (s.hovered ? -2 : 0);
          }
        case AicdeEdge.offset:
          if (!isField || s.focused) {
            final big = kind == AicdeBoxKind.card || kind == AicdeBoxKind.overlay ? d + 3 : d;
            final depth = interactive && s.pressed ? 0.0 : big + (interactive && s.hovered ? 2 : 0);
            final col = isField ? (err ? c.danger : c.coral) : t.strokeColor;
            shadows.add(BoxShadow(color: col, offset: Offset(depth, depth)));
            if (interactive) {
              dx = dy = s.pressed ? big : (s.hovered ? -1 : 0);
            }
          }
        case AicdeEdge.misregister:
          if (raised || kind == AicdeBoxKind.overlay) {
            final isPrimary = fill != null && fill == t.primary;
            final col = (isPrimary ? c.navy : c.coral).withValues(alpha: .8);
            final k = interactive && s.pressed ? 0.0 : d + (interactive && s.hovered ? 2 : 0);
            shadows.add(BoxShadow(color: col, offset: Offset(isPrimary ? -k : k, k * .75)));
            if (interactive && s.pressed) {
              dx = isPrimary ? -2 : 2;
              dy = 2;
            }
          }
        case AicdeEdge.blur:
          if (raised || kind == AicdeBoxKind.overlay) {
            final glow = onSurfaceFill ? c.ink : baseFill;
            shadows.add(BoxShadow(
              color: glow.withValues(alpha: t.isDark ? .45 : (onSurfaceFill ? .16 : .45)),
              offset: Offset(0, s.hovered && interactive ? 12 : 8),
              blurRadius: s.hovered && interactive ? 24 : 18,
              spreadRadius: -8,
            ));
          }
        case AicdeEdge.sticker:
          if (raised || kind == AicdeBoxKind.overlay) {
            final ring = onSurfaceFill ? (t.isDark ? const Color(0xFF5A2B31) : const Color(0xFFFFD9D6)) : baseFill;
            shadows
              ..add(BoxShadow(color: ring, spreadRadius: kind == AicdeBoxKind.card ? 6 : 4.5))
              ..add(BoxShadow(color: c.surface, spreadRadius: kind == AicdeBoxKind.card ? 4 : 3))
              ..add(BoxShadow(color: c.coral.withValues(alpha: .3), offset: const Offset(0, 10), blurRadius: 18, spreadRadius: -6));
          }
        case AicdeEdge.none:
          break;
      }
    }

    // ── 按下與滑過的動作 ──
    if (interactive && !s.disabled) {
      if (t.press == AicdePress.scale && s.pressed) scale = t.style == AicdeThemeStyle.cute ? .92 : .97;
      if (s.hovered && !s.pressed) {
        rot = t.hoverTilt * math.pi / 180 * (kind == AicdeBoxKind.card ? .5 : 1);
        if (t.press == AicdePress.scale && t.edge != AicdeEdge.solid) dy = kind == AicdeBoxKind.card ? -4 : (t.style == AicdeThemeStyle.cute ? -3 : -1);
        if (t.style == AicdeThemeStyle.cute) scale = 1.04;
      }
    }

    // ── 鍵盤 focus 外框 ──
    if (s.focused && !isField) {
      shadows
        ..add(BoxShadow(color: c.surface, spreadRadius: 2))
        ..add(BoxShadow(color: t.focusColor, spreadRadius: t.style == AicdeThemeStyle.clinical ? 5 : 4));
    }

    // ── 填色（光澤主題用漸層） ──
    Gradient? gradient;
    if (t.texture == AicdeTexture.gloss && !ghost && !onSurfaceFill) {
      gradient = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color.lerp(baseFill, const Color(0xFFFFFFFF), .2)!, Color.lerp(baseFill, const Color(0xFF000000), .08)!],
      );
    } else if (t.texture == AicdeTexture.gloss && !ghost) {
      gradient = LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [c.surface, c.surface2]);
    } else if (t.texture == AicdeTexture.notch && !ghost && !onSurfaceFill) {
      // 水彩暈染：左上淡、右下略深，像顏料在紙上自然乾掉
      gradient = LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color.lerp(baseFill, const Color(0xFFFFFFFF), .16)!, baseFill, Color.lerp(baseFill, const Color(0xFF000000), .07)!],
        stops: const [0, .5, 1],
      );
    }

    final duration = reduce ? Duration.zero : t.motion;
    final decoration = BoxDecoration(
      color: gradient == null ? (isField && t.underlineInputs ? const Color(0x00000000) : (s.disabled && !ghost ? Color.lerp(baseFill, c.surface2, .5) : baseFill)) : null,
      gradient: gradient,
      borderRadius: isField && t.underlineInputs ? BorderRadius.vertical(top: Radius.circular(math.min(r, 10))) : br,
      border: border,
      boxShadow: shadows,
    );

    // ── 疊加材質 ──
    final overlays = <Widget>[];
    if (!ghost) {
      switch (t.texture) {
        case AicdeTexture.halftone:
          if (!onSurfaceFill) {
            overlays.add(CustomPaint(painter: HalftonePainter(color: (t.isDark || baseFill.computeLuminance() < .2 ? const Color(0x29FFFFFF) : const Color(0x24000000)))));
          }
        case AicdeTexture.stitch:
          if (kind != AicdeBoxKind.field || true) {
            final onDark = !onSurfaceFill && baseFill.computeLuminance() < .5;
            overlays.add(CustomPaint(
              painter: DashedRRectPainter(
                color: onDark ? const Color(0xBFFFFFFF) : (err ? c.danger : (isField && s.focused ? c.coral : t.strokeColor)),
                radius: br,
                inset: kind == AicdeBoxKind.card ? 7 : (kind == AicdeBoxKind.chip ? 3.5 : 5.5),
                strokeWidth: kind == AicdeBoxKind.chip ? 1 : 1.5,
              ),
            ));
          }
        case AicdeTexture.corners:
          if (kind == AicdeBoxKind.card || kind == AicdeBoxKind.panel || kind == AicdeBoxKind.overlay || (outline && kind == AicdeBoxKind.control)) {
            overlays.add(CustomPaint(painter: CornerTicksPainter(color: t.strokeColor)));
          }
        case AicdeTexture.bevel:
          if (raised && !onSurfaceFill || kind == AicdeBoxKind.control) {
            overlays.add(CustomPaint(painter: BevelPainter(radius: br)));
          }
        default:
          break;
      }
    }

    Widget content = AnimatedContainer(
      duration: duration,
      // 彈跳曲線會超出 0..1，讓陰影 blur 變負數；外觀只用不超出的曲線，彈跳留給外層 transform
      curve: Curves.easeOutCubic,
      width: width,
      height: height,
      padding: padding,
      decoration: decoration,
      clipBehavior: clip ? Clip.antiAlias : Clip.none,
      // 有 alignment 時只在指定的寬高內置中，沒指定寬高就貼合內容，不會撐滿父層
      child: alignment == null
          ? child
          : Align(alignment: alignment!, widthFactor: width == null ? 1 : null, heightFactor: height == null ? 1 : null, child: child),
    );

    if (overlays.isNotEmpty) {
      content = Stack(
        // passthrough：父層給的固定寬度要照樣傳給內容，否則外框縮小、材質卻畫在原尺寸上
        fit: StackFit.passthrough,
        clipBehavior: Clip.none,
        children: [
          content,
          for (final o in overlays) Positioned.fill(child: IgnorePointer(child: o)),
        ],
      );
    }

    if (t.texture == AicdeTexture.notch && !ghost && (kind == AicdeBoxKind.control || kind == AicdeBoxKind.chip)) {
      content = ClipPath(clipper: NotchClipper(radius: br, notch: kind == AicdeBoxKind.chip ? 4 : 6), child: content);
    }

    return AnimatedContainer(
      duration: duration,
      curve: t.curve,
      transformAlignment: Alignment.center,
      transform: Matrix4.identity()
        ..translateByDouble(dx, dy, 0, 1)
        ..rotateZ(rot)
        ..scaleByDouble(scale, scale, 1, 1),
      child: Opacity(opacity: s.disabled ? .5 : 1, child: content),
    );
  }
}
