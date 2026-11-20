import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../foundation/box.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';

/// 滑桿。拖曳或點擊軌道設定數值；focus 後可用方向鍵、Home、End。
class AicdeSlider extends StatefulWidget {
  const AicdeSlider({
    super.key,
    required this.value,
    required this.onChanged,
    this.min = 0,
    this.max = 100,
    this.step = 1,
    this.showValue = false,
    this.unit = '',
    this.semanticLabel,
    this.focusNode,
  });

  final double value;

  /// 傳 null 代表停用
  final ValueChanged<double>? onChanged;
  final double min, max, step;

  /// 右側顯示目前數值
  final bool showValue;
  final String unit;
  final String? semanticLabel;
  final FocusNode? focusNode;

  @override
  State<AicdeSlider> createState() => _AicdeSliderState();
}

class _AicdeSliderState extends State<AicdeSlider> {
  bool _drag = false, _focused = false, _hovered = false;

  double _snap(double v) {
    final s = widget.step <= 0 ? 1 : widget.step;
    final n = ((v - widget.min) / s).round() * s + widget.min;
    return n.clamp(widget.min, widget.max).toDouble();
  }

  void _set(double v) {
    final n = _snap(v);
    if (n != widget.value) widget.onChanged?.call(n);
  }

  void _fromDx(double dx, double width) {
    final p = (dx / width).clamp(0.0, 1.0);
    _set(widget.min + p * (widget.max - widget.min));
  }

  String _fmt(double v) => (v == v.roundToDouble() ? v.toInt().toString() : v.toStringAsFixed(1)) + widget.unit;

  KeyEventResult _key(FocusNode _, KeyEvent e) {
    if (e is! KeyDownEvent && e is! KeyRepeatEvent) return KeyEventResult.ignored;
    final k = e.logicalKey, s = widget.step;
    if (k == LogicalKeyboardKey.arrowRight || k == LogicalKeyboardKey.arrowUp) {
      _set(widget.value + s);
    } else if (k == LogicalKeyboardKey.arrowLeft || k == LogicalKeyboardKey.arrowDown) {
      _set(widget.value - s);
    } else if (k == LogicalKeyboardKey.home) {
      _set(widget.min);
    } else if (k == LogicalKeyboardKey.end) {
      _set(widget.max);
    } else {
      return KeyEventResult.ignored;
    }
    return KeyEventResult.handled;
  }

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final enabled = widget.onChanged != null;
    final span = widget.max - widget.min;
    final p = span == 0 ? 0.0 : ((widget.value - widget.min) / span).clamp(0.0, 1.0);
    final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    const thumb = 20.0;
    final thumbR = t.rPill.clamp(0.0, thumb / 2);

    final track = LayoutBuilder(builder: (context, box) {
      final w = box.maxWidth - thumb;
      return GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTapDown: enabled ? (d) => _fromDx(d.localPosition.dx - thumb / 2, w) : null,
        onHorizontalDragStart: enabled ? (d) => setState(() => _drag = true) : null,
        onHorizontalDragUpdate: enabled ? (d) => _fromDx(d.localPosition.dx - thumb / 2, w) : null,
        onHorizontalDragEnd: enabled ? (_) => setState(() => _drag = false) : null,
        child: SizedBox(
          height: 28,
          child: Stack(alignment: Alignment.centerLeft, clipBehavior: Clip.none, children: [
            Positioned(
              left: thumb / 2,
              right: thumb / 2,
              child: Container(
                height: t.strokeAll ? 6 : 4,
                decoration: BoxDecoration(
                  color: c.lineStrong,
                  borderRadius: BorderRadius.circular(t.rXs.clamp(0, 3)),
                  border: t.strokeAll ? Border.all(color: t.strokeColor, width: 1) : null,
                ),
                alignment: Alignment.centerLeft,
                child: FractionallySizedBox(
                  widthFactor: p,
                  child: Container(color: t.primary),
                ),
              ),
            ),
            Positioned(
              left: p * w,
              child: AnimatedScale(
                scale: (_drag || _hovered) && enabled && !reduce ? 1.15 : 1,
                duration: reduce ? Duration.zero : t.motion,
                child: AicdeBox(
                  kind: AicdeBoxKind.chip,
                  emphasis: AicdeEmphasis.outline,
                  fill: const Color(0xFFFFFFFF),
                  radius: thumbR,
                  width: thumb,
                  height: thumb,
                  states: AicdeStates(focused: _focused),
                  child: Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: t.primary, width: 2),
                      borderRadius: BorderRadius.circular((thumbR - 1).clamp(0, thumb)),
                    ),
                  ),
                ),
              ),
            ),
          ]),
        ),
      );
    });

    return Semantics(
      slider: true,
      label: widget.semanticLabel,
      value: _fmt(widget.value),
      enabled: enabled,
      increasedValue: _fmt(_snap(widget.value + widget.step)),
      decreasedValue: _fmt(_snap(widget.value - widget.step)),
      onIncrease: enabled ? () => _set(widget.value + widget.step) : null,
      onDecrease: enabled ? () => _set(widget.value - widget.step) : null,
      child: Focus(
        focusNode: widget.focusNode,
        canRequestFocus: enabled,
        onFocusChange: (f) => setState(() => _focused = f && FocusManager.instance.highlightMode == FocusHighlightMode.traditional),
        onKeyEvent: _key,
        child: MouseRegion(
          cursor: enabled ? SystemMouseCursors.click : SystemMouseCursors.forbidden,
          onEnter: (_) => setState(() => _hovered = true),
          onExit: (_) => setState(() => _hovered = false),
          child: Opacity(
            opacity: enabled ? 1 : .45,
            child: Row(children: [
              Expanded(child: track),
              if (widget.showValue) ...[
                const SizedBox(width: 12),
                SizedBox(width: 44, child: Text(_fmt(widget.value), textAlign: TextAlign.right, style: t.number(size: 13, weight: FontWeight.w500))),
              ],
            ]),
          ),
        ),
      ),
    );
  }
}
