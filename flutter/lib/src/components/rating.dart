import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../theme/theme.dart';

enum AicdeRatingSize { sm, md }

/// 評分。滑過預覽、點擊選取；鍵盤左右鍵調整。
class AicdeRating extends StatefulWidget {
  const AicdeRating({
    super.key,
    this.value,
    this.initialValue = 0,
    this.onChanged,
    this.count = 5,
    this.readOnly = false,
    this.size = AicdeRatingSize.md,
    this.character,
    this.semanticLabel = '評分',
  });

  /// 受控值；null 時元件自己管理
  final int? value;
  final int initialValue;
  final ValueChanged<int>? onChanged;
  final int count;
  final bool readOnly;
  final AicdeRatingSize size;

  /// 自訂圖示（顏色由元件控制，請用 Icon 或繼承 IconTheme 的 widget）
  final Widget? character;
  final String semanticLabel;

  @override
  State<AicdeRating> createState() => _AicdeRatingState();
}

class _AicdeRatingState extends State<AicdeRating> {
  late int _own = widget.initialValue;
  int? _hover;
  int? _pressed;
  bool _focused = false;

  int get _value => widget.value ?? _own;

  void _set(int v) {
    if (widget.readOnly) return;
    v = v.clamp(0, widget.count);
    if (widget.value == null) setState(() => _own = v);
    widget.onChanged?.call(v);
  }

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final px = widget.size == AicdeRatingSize.sm ? 18.0 : 26.0;
    final shown = _hover ?? _value;

    return Semantics(
      label: widget.semanticLabel,
      value: '$_value / ${widget.count}',
      slider: !widget.readOnly,
      increasedValue: '${(_value + 1).clamp(0, widget.count)}',
      decreasedValue: '${(_value - 1).clamp(0, widget.count)}',
      onIncrease: widget.readOnly ? null : () => _set(_value + 1),
      onDecrease: widget.readOnly ? null : () => _set(_value - 1),
      child: Focus(
        canRequestFocus: !widget.readOnly,
        onFocusChange: (f) => setState(() => _focused = f),
        onKeyEvent: (node, e) {
          if (e is! KeyDownEvent && e is! KeyRepeatEvent) return KeyEventResult.ignored;
          final k = e.logicalKey;
          if (k == LogicalKeyboardKey.arrowRight || k == LogicalKeyboardKey.arrowUp) {
            _set(_value + 1);
            return KeyEventResult.handled;
          }
          if (k == LogicalKeyboardKey.arrowLeft || k == LogicalKeyboardKey.arrowDown) {
            _set(_value - 1);
            return KeyEventResult.handled;
          }
          return KeyEventResult.ignored;
        },
        child: MouseRegion(
          onExit: (_) => setState(() => _hover = null),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (var i = 1; i <= widget.count; i++)
                MouseRegion(
                  cursor: widget.readOnly ? MouseCursor.defer : SystemMouseCursors.click,
                  onEnter: widget.readOnly ? null : (_) => setState(() => _hover = i),
                  child: GestureDetector(
                    onTapDown: widget.readOnly ? null : (_) => setState(() => _pressed = i),
                    onTapCancel: () => setState(() => _pressed = null),
                    onTap: widget.readOnly
                        ? null
                        : () {
                            setState(() => _pressed = null);
                            _set(i);
                          },
                    child: Semantics(
                      label: '$i 星',
                      button: !widget.readOnly,
                      excludeSemantics: true,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 1),
                        decoration: _focused && i == (_value == 0 ? 1 : _value)
                            ? BoxDecoration(
                                border: Border.all(color: t.focusColor, width: 2),
                                borderRadius: BorderRadius.circular(t.rXs),
                              )
                            : null,
                        child: AnimatedScale(
                          scale: _pressed == i ? .85 : 1,
                          duration: reduce ? Duration.zero : t.motion,
                          curve: t.curve,
                          child: TweenAnimationBuilder<Color?>(
                            tween: ColorTween(end: i <= shown ? c.coral : c.lineStrong),
                            duration: reduce ? Duration.zero : const Duration(milliseconds: 120),
                            builder: (context, col, _) => IconTheme.merge(
                              data: IconThemeData(color: col, size: px),
                              child: DefaultTextStyle.merge(
                                style: TextStyle(color: col, fontSize: px, height: 1),
                                child: widget.character ?? Icon(Icons.star_rounded, size: px + 2),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
