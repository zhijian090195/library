import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../foundation/field.dart';
import '../foundation/box.dart';
import '../foundation/pressable.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';

enum AicdeInputNumberSize { sm, md }

/// 數字輸入：左右加減按鈕，方向鍵上下也可調整；超出範圍時自動夾回。
class AicdeInputNumber extends StatefulWidget {
  const AicdeInputNumber({
    super.key,
    required this.value,
    required this.onChanged,
    this.min = double.negativeInfinity,
    this.max = double.infinity,
    this.step = 1,
    this.size = AicdeInputNumberSize.md,
    this.width = 140,
    this.semanticLabel,
  });

  final num value;

  /// 傳 null 代表停用
  final ValueChanged<num>? onChanged;
  final num min, max, step;
  final AicdeInputNumberSize size;
  final double width;
  final String? semanticLabel;

  @override
  State<AicdeInputNumber> createState() => _AicdeInputNumberState();
}

class _AicdeInputNumberState extends State<AicdeInputNumber> {
  late final _ctrl = TextEditingController(text: _fmt(widget.value));
  final _focus = FocusNode();

  String _fmt(num v) => v == v.roundToDouble() ? v.toInt().toString() : v.toString();

  @override
  void initState() {
    super.initState();
    _focus.addListener(() {
      if (!_focus.hasFocus) _commit(_ctrl.text);
    });
  }

  @override
  void didUpdateWidget(AicdeInputNumber old) {
    super.didUpdateWidget(old);
    final s = _fmt(widget.value);
    if (!_focus.hasFocus && _ctrl.text != s) _ctrl.text = s;
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _focus.dispose();
    super.dispose();
  }

  num _clamp(num v) => v < widget.min ? widget.min : (v > widget.max ? widget.max : v);

  void _emit(num v) {
    final n = _clamp(v);
    // 避免浮點誤差：依 step 小數位四捨五入
    final dec = widget.step.toString().contains('.') ? widget.step.toString().split('.').last.length : 0;
    final r = dec == 0 ? n : num.parse(n.toStringAsFixed(dec));
    _ctrl.text = _fmt(r);
    if (r != widget.value) widget.onChanged?.call(r);
  }

  void _commit(String s) {
    final v = num.tryParse(s.trim());
    if (v == null) {
      _ctrl.text = _fmt(widget.value);
    } else {
      _emit(v);
    }
  }

  KeyEventResult _key(FocusNode _, KeyEvent e) {
    if (e is! KeyDownEvent && e is! KeyRepeatEvent) return KeyEventResult.ignored;
    if (e.logicalKey == LogicalKeyboardKey.arrowUp) {
      _emit((num.tryParse(_ctrl.text) ?? widget.value) + widget.step);
      return KeyEventResult.handled;
    }
    if (e.logicalKey == LogicalKeyboardKey.arrowDown) {
      _emit((num.tryParse(_ctrl.text) ?? widget.value) - widget.step);
      return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final enabled = widget.onChanged != null;
    final h = widget.size == AicdeInputNumberSize.sm ? t.controlHeight - 8 : t.controlHeight;

    Widget step(IconData icon, num delta, String label) {
      final can = enabled && (delta < 0 ? widget.value > widget.min : widget.value < widget.max);
      return AicdePressable(
        onTap: can ? () => _emit(widget.value + delta) : null,
        semanticLabel: label,
        builder: (context, s) => AicdeBox(
          kind: AicdeBoxKind.chip,
          emphasis: AicdeEmphasis.ghost,
          width: h - 8,
          height: h - 8,
          radius: (t.inputRadius - 4).clamp(0, 999),
          states: s,
          alignment: Alignment.center,
          child: Container(
            width: h - 8,
            height: h - 8,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: s.hovered ? c.surface2 : const Color(0x00000000),
              borderRadius: BorderRadius.circular((t.inputRadius - 4).clamp(0, 999)),
            ),
            child: Icon(icon, size: 16, color: can ? c.ink : c.ink3),
          ),
        ),
      );
    }

    return Semantics(
      label: widget.semanticLabel,
      value: _fmt(widget.value),
      child: AnimatedBuilder(
        animation: _focus,
        builder: (context, _) => AicdeBox(
          kind: AicdeBoxKind.field,
          width: widget.width,
          height: h,
          states: AicdeStates(focused: _focus.hasFocus, disabled: !enabled),
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: Row(children: [
            step(Icons.remove_rounded, -widget.step, '減少'),
            Expanded(
              child: Focus(
                onKeyEvent: _key,
                canRequestFocus: false,
                skipTraversal: true,
                child: TextField(
                  controller: _ctrl,
                  focusNode: _focus,
                  enabled: enabled,
                  textAlign: TextAlign.center,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true, signed: true),
                  inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[-0-9.]'))],
                  style: t.number(size: 14, weight: FontWeight.w500, color: c.inkBody),
                  cursorColor: t.focusColor,
                  decoration: aicdeBareDecoration(),
                  onSubmitted: _commit,
                ),
              ),
            ),
            step(Icons.add_rounded, widget.step, '增加'),
          ]),
        ),
      ),
    );
  }
}
