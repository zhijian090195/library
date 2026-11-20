import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/painters.dart';
import '../foundation/pressable.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';
import '../theme/tokens.dart';

enum AicdeButtonVariant { primary, secondary, outline, ghost, danger }

enum AicdeButtonSize { sm, md, lg }

/// 按鈕。
///
/// ```dart
/// AicdeButton(label: '儲存', variant: AicdeButtonVariant.primary, onPressed: save)
/// ```
/// 和 React 版一樣，不指定 [variant] 時是外框按鈕。
class AicdeButton extends StatelessWidget {
  const AicdeButton({
    super.key,
    this.label,
    this.child,
    required this.onPressed,
    this.variant = AicdeButtonVariant.outline,
    this.size = AicdeButtonSize.md,
    this.icon,
    this.loading = false,
    this.block = false,
    this.focusNode,
    this.autofocus = false,
    this.semanticLabel,
  }) : assert(label != null || child != null || icon != null);

  final String? label;
  final Widget? child;

  /// 傳 null 代表停用
  final VoidCallback? onPressed;
  final AicdeButtonVariant variant;
  final AicdeButtonSize size;
  final Widget? icon;

  /// 載入中：顯示轉圈並暫停點擊
  final bool loading;

  /// 撐滿寬度
  final bool block;
  final FocusNode? focusNode;
  final bool autofocus;

  /// 讀屏念出的名稱；只有圖示的按鈕一定要給
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final (fill, fg, emphasis) = switch (variant) {
      AicdeButtonVariant.primary => (
        t.primary,
        t.onPrimary,
        AicdeEmphasis.solid,
      ),
      AicdeButtonVariant.secondary => (
        t.secondary,
        t.onSecondary,
        AicdeEmphasis.solid,
      ),
      AicdeButtonVariant.danger => (
        c.danger,
        Colors.white,
        AicdeEmphasis.solid,
      ),
      AicdeButtonVariant.outline => (
        c.surface,
        t.strokeAll ? t.strokeColor : c.ink,
        AicdeEmphasis.outline,
      ),
      AicdeButtonVariant.ghost => (
        Colors.transparent,
        t.style == AicdeThemeStyle.riso ? c.coralDark : c.ink,
        AicdeEmphasis.ghost,
      ),
    };
    final h = switch (size) {
      AicdeButtonSize.sm => t.controlHeight - 8,
      AicdeButtonSize.md => t.controlHeight,
      AicdeButtonSize.lg => t.controlHeight + 8,
    };
    final fontSize = switch (size) {
      AicdeButtonSize.sm => 13.0,
      AicdeButtonSize.md => 14.0,
      AicdeButtonSize.lg => 16.0,
    };
    final iconOnly = label == null && child == null;
    final hPad = iconOnly
        ? 0.0
        : (size == AicdeButtonSize.sm ? 12.0 : 18.0) +
              (t.buttonRadius >= 999 ? 4 : 0);

    final text =
        child ??
        (label != null
            ? Text(
                t.labelText(label!),
                style: t.label(size: fontSize, color: fg),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              )
            : null);

    return AicdePressable(
      semanticLabel: semanticLabel ?? (iconOnly ? label : null),
      // 載入中仍保持可 focus（鍵盤使用者不會失去位置），只是不觸發；讀屏念「處理中」
      onTap: onPressed == null ? null : (loading ? () {} : onPressed),
      semanticHint: loading ? '處理中' : null,
      mouseCursor: loading ? SystemMouseCursors.progress : null,
      focusNode: focusNode,
      autofocus: autofocus,
      builder: (context, states) {
        final s = loading ? AicdeStates(focused: states.focused) : states;
        Widget row = Row(
          mainAxisSize: block ? MainAxisSize.max : MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (loading)
              SizedBox.square(
                dimension: 14,
                child: CircularProgressIndicator(strokeWidth: 2, color: fg),
              )
            else if (icon != null)
              IconTheme.merge(
                data: IconThemeData(color: fg, size: fontSize + 4),
                child: icon!,
              ),
            if ((loading || icon != null) && text != null)
              const SizedBox(width: 8),
            if (text != null)
              Flexible(
                child: DefaultTextStyle.merge(
                  style: t.label(size: fontSize, color: fg),
                  child: text,
                ),
              ),
          ],
        );
        if (variant == AicdeButtonVariant.ghost) {
          row = _GhostDecor(hovered: s.hovered, child: row);
        }
        return AicdeBox(
          kind: AicdeBoxKind.control,
          emphasis: emphasis,
          fill: fill,
          states: s,
          height: h,
          width: iconOnly ? h : (block ? double.infinity : null),
          padding: EdgeInsets.symmetric(horizontal: hPad),
          alignment: iconOnly || block ? Alignment.center : null,
          child: row,
        );
      },
    );
  }
}

/// 文字按鈕滑過時的主題裝飾：麥克筆底線（紙雕、混合媒材）、底線（編輯）、淡底色（其他）
class _GhostDecor extends StatelessWidget {
  const _GhostDecor({required this.hovered, required this.child});
  final bool hovered;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final marker = switch (t.style) {
      AicdeThemeStyle.paperCut ||
      AicdeThemeStyle.paper ||
      AicdeThemeStyle.ink ||
      AicdeThemeStyle.cute => true,
      _ => false,
    };
    return TweenAnimationBuilder<double>(
      tween: Tween(end: hovered ? 1 : 0),
      duration: t.motion * 1.6,
      curve: t.curve,
      builder: (context, p, child) => CustomPaint(
        painter: marker
            ? MarkerPainter(
                color: t.colors.coral.withValues(alpha: .32),
                progress: p,
              )
            : _UnderlinePainter(
                color: t.style == AicdeThemeStyle.editorial
                    ? t.colors.inkBody
                    : t.colors.coral,
                progress: p,
              ),
        child: child,
      ),
      child: child,
    );
  }
}

class _UnderlinePainter extends CustomPainter {
  _UnderlinePainter({required this.color, required this.progress});
  final Color color;
  final double progress;
  @override
  void paint(Canvas canvas, Size size) {
    if (progress <= 0) return;
    canvas.drawRect(
      Rect.fromLTWH(0, size.height - 1, size.width * progress, 1.5),
      Paint()..color = color,
    );
  }

  @override
  bool shouldRepaint(_UnderlinePainter o) =>
      o.progress != progress || o.color != color;
}
