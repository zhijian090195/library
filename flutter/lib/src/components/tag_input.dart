import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../foundation/box.dart';
import '../foundation/pressable.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';
import 'anchored_overlay.dart';

/// 標籤輸入：Enter 或逗號新增、Backspace 刪最後一個；重複的標籤會抖一下提示。
class AicdeTagInput extends StatefulWidget {
  const AicdeTagInput({
    super.key,
    this.value,
    this.initialValue = const [],
    this.onChanged,
    this.max,
    this.placeholder = '輸入後按 Enter',
    this.enabled = true,
    this.inputLabel = '新增標籤',
    this.focusNode,
  });

  /// 受控的標籤；null 時元件自己管理
  final List<String>? value;
  final List<String> initialValue;
  final ValueChanged<List<String>>? onChanged;

  /// 最多幾個，達到上限後輸入框停用
  final int? max;
  final String placeholder;
  final bool enabled;
  final String inputLabel;
  final FocusNode? focusNode;

  @override
  State<AicdeTagInput> createState() => _AicdeTagInputState();
}

class _AicdeTagInputState extends State<AicdeTagInput> {
  late List<String> _own = List.of(widget.initialValue);
  final _ctrl = TextEditingController();
  FocusNode? _ownFocus;
  FocusNode get _focus => widget.focusNode ?? (_ownFocus ??= FocusNode());
  String? _fresh;
  String? _dup;
  int _dupN = 0;
  Timer? _dupTimer;
  bool _hover = false;

  List<String> get _tags => widget.value ?? _own;
  bool get _full => widget.max != null && _tags.length >= widget.max!;

  @override
  void initState() {
    super.initState();
    _focus.addListener(_rebuild);
    _focus.onKeyEvent = _onKey;
  }

  void _rebuild() => setState(() {});

  @override
  void dispose() {
    _dupTimer?.cancel();
    _focus.removeListener(_rebuild);
    _ownFocus?.dispose();
    _ctrl.dispose();
    super.dispose();
  }

  void _set(List<String> next) {
    if (widget.value == null) setState(() => _own = next);
    widget.onChanged?.call(next);
  }

  void _add(Iterable<String> raw) {
    final next = List.of(_tags);
    String? last;
    for (final r in raw) {
      final t = r.trim();
      if (t.isEmpty) continue;
      if (next.contains(t)) {
        _dupTimer?.cancel();
        setState(() {
          _dup = t;
          _dupN++;
        });
        _dupTimer = Timer(const Duration(milliseconds: 450), () {
          if (mounted) setState(() => _dup = null);
        });
        continue;
      }
      if (widget.max != null && next.length >= widget.max!) break;
      next.add(t);
      last = t;
    }
    if (next.length != _tags.length) {
      setState(() => _fresh = last);
      _set(next);
    }
  }

  KeyEventResult _onKey(FocusNode n, KeyEvent e) {
    if (e is! KeyDownEvent && e is! KeyRepeatEvent) return KeyEventResult.ignored;
    if (_ctrl.value.composing.isValid) return KeyEventResult.ignored;
    if (e.logicalKey == LogicalKeyboardKey.enter || e.logicalKey == LogicalKeyboardKey.numpadEnter) {
      _add([_ctrl.text]);
      _ctrl.clear();
      return KeyEventResult.handled;
    }
    if (e.logicalKey == LogicalKeyboardKey.backspace && _ctrl.text.isEmpty && _tags.isNotEmpty) {
      _set(_tags.sublist(0, _tags.length - 1));
      return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final full = _full;

    return MouseRegion(
      cursor: SystemMouseCursors.text,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => _focus.requestFocus(),
        child: AicdeBox(
          kind: AicdeBoxKind.field,
          states: AicdeStates(focused: _focus.hasFocus, hovered: _hover, disabled: !widget.enabled),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
          child: ConstrainedBox(
            constraints: BoxConstraints(minHeight: t.controlHeight - 12),
            child: Wrap(
              spacing: 6,
              runSpacing: 6,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                for (final tag in _tags)
                  _Chip(
                    key: ValueKey(tag == _dup ? '$tag-dup$_dupN' : tag),
                    label: tag,
                    fresh: tag == _fresh,
                    dup: tag == _dup,
                    reduce: reduce,
                    onRemove: widget.enabled ? () => _set(_tags.where((x) => x != tag).toList()) : null,
                  ),
                ConstrainedBox(
                  constraints: const BoxConstraints(minWidth: 120, maxWidth: 220),
                  child: IntrinsicWidth(
                    child: Semantics(
                      label: widget.inputLabel,
                      textField: true,
                      child: TextField(
                        controller: _ctrl,
                        focusNode: _focus,
                        enabled: widget.enabled && !full,
                        style: t.body(size: 14).copyWith(height: 1.3),
                        cursorColor: t.focusColor,
                        decoration: aicdeBareDecoration(
                          hintText: full ? '' : widget.placeholder,
                          hintStyle: t.body(size: 14, color: c.ink3).copyWith(height: 1.3),
                        ),
                        onChanged: (v) {
                          if (RegExp('[,，]').hasMatch(v)) {
                            _add(v.split(RegExp('[,，]')));
                            _ctrl.clear();
                          }
                        },
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({super.key, required this.label, required this.fresh, required this.dup, required this.reduce, this.onRemove});
  final String label;
  final bool fresh, dup, reduce;
  final VoidCallback? onRemove;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    Widget chip = AicdeBox(
      kind: AicdeBoxKind.chip,
      fill: dup ? Color.lerp(c.surface2, c.coral, .25) : c.surface2,
      padding: const EdgeInsets.only(left: 10, right: 2),
      height: 26,
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Text(label, style: t.label(size: 12.5, weight: FontWeight.w500, color: c.ink)),
        AicdePressable(
          onTap: onRemove,
          semanticLabel: '移除$label',
          builder: (context, s) => AnimatedContainer(
            duration: t.motion,
            width: 22,
            height: 22,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: s.hovered ? c.coral.withValues(alpha: .18) : null,
              border: s.focused ? Border.all(color: t.focusColor, width: 2) : null,
            ),
            child: Icon(Icons.close_rounded, size: 14, color: s.hovered ? c.coralDark : c.ink2),
          ),
        ),
      ]),
    );
    if (reduce) return chip;
    if (dup) {
      return TweenAnimationBuilder<double>(
        tween: Tween(begin: 0, end: 1),
        duration: const Duration(milliseconds: 400),
        builder: (context, v, child) => Transform.translate(offset: Offset(math.sin(v * math.pi * 6) * 4 * (1 - v), 0), child: child),
        child: chip,
      );
    }
    if (fresh) {
      return TweenAnimationBuilder<double>(
        tween: Tween(begin: .6, end: 1),
        duration: const Duration(milliseconds: 320),
        curve: const Cubic(0.34, 1.56, 0.64, 1),
        builder: (context, v, child) => Transform.scale(scale: v, child: Opacity(opacity: ((v - .6) / .4).clamp(0, 1), child: child)),
        child: chip,
      );
    }
    return chip;
  }
}
