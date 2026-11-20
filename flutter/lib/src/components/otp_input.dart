import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../foundation/field.dart';
import '../foundation/box.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';

/// 驗證碼輸入：一格一個數字，可貼上整串；填滿時觸發 [onComplete]。
/// [error] 時搖晃一下並顯示危險色，[success] 顯示成功色。
class AicdeOtpInput extends StatefulWidget {
  const AicdeOtpInput({
    super.key,
    required this.value,
    required this.onChanged,
    this.length = 6,
    this.groupSize = 0,
    this.onComplete,
    this.error = false,
    this.success = false,
    this.autofocus = false,
  });

  final String value;

  /// 傳 null 代表停用
  final ValueChanged<String>? onChanged;
  final int length;

  /// 每幾格之間加一條分隔線，0 = 不分組
  final int groupSize;
  final ValueChanged<String>? onComplete;
  final bool error, success;
  final bool autofocus;

  @override
  State<AicdeOtpInput> createState() => _AicdeOtpInputState();
}

class _AicdeOtpInputState extends State<AicdeOtpInput> {
  late final _ctrl = TextEditingController(text: widget.value);
  final _focus = FocusNode();
  int _shake = 0;

  @override
  void initState() {
    super.initState();
    _focus.addListener(() => setState(() {}));
  }

  @override
  void didUpdateWidget(AicdeOtpInput old) {
    super.didUpdateWidget(old);
    if (widget.value != _ctrl.text) {
      _ctrl.value = TextEditingValue(text: widget.value, selection: TextSelection.collapsed(offset: widget.value.length));
    }
    if (widget.error && !old.error) _shake++;
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _focus.dispose();
    super.dispose();
  }

  void _changed(String s) {
    final d = s.replaceAll(RegExp(r'\D'), '');
    final v = d.substring(0, math.min(d.length, widget.length));
    widget.onChanged?.call(v);
    if (v.length == widget.length) widget.onComplete?.call(v);
  }

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final enabled = widget.onChanged != null;
    final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final size = t.controlHeight + 8;
    final cursor = math.min(widget.value.length, widget.length - 1);
    final tone = widget.error ? c.danger : (widget.success ? c.success : null);

    final cells = <Widget>[];
    for (var i = 0; i < widget.length; i++) {
      if (widget.groupSize > 0 && i > 0 && i % widget.groupSize == 0) {
        cells.add(Container(width: 10, height: 2, margin: const EdgeInsets.symmetric(horizontal: 4), color: c.lineStrong));
      }
      final ch = i < widget.value.length ? widget.value[i] : '';
      Widget cell = AicdeBox(
        kind: AicdeBoxKind.field,
        width: size - 4,
        height: size,
        radius: t.inputRadius >= 999 ? 14 : t.inputRadius,
        alignment: Alignment.center,
        states: AicdeStates(focused: _focus.hasFocus && i == cursor, disabled: !enabled),
        child: Text(ch, style: t.number(size: 20, weight: FontWeight.w700, color: tone ?? c.ink)),
      );
      if (tone != null) {
        final theme = Theme.of(context);
        cell = Theme(
          data: theme.copyWith(extensions: [t.copyWith(colors: c.copyWith(lineStrong: tone, line: tone))]),
          child: cell,
        );
      }
      cells.add(Padding(padding: const EdgeInsets.symmetric(horizontal: 4), child: cell));
    }

    final row = TweenAnimationBuilder<double>(
      key: ValueKey(_shake),
      tween: Tween(begin: _shake == 0 || reduce ? 1 : 0, end: 1),
      duration: const Duration(milliseconds: 420),
      builder: (context, p, child) => Transform.translate(
        offset: Offset(math.sin(p * math.pi * 6) * 6 * (1 - p), 0),
        child: child,
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: cells),
    );

    return Semantics(
      label: '驗證碼，共 ${widget.length} 位',
      value: widget.value,
      textField: true,
      child: GestureDetector(
        onTap: enabled ? () => _focus.requestFocus() : null,
        child: Stack(children: [
          row,
          // 隱藏的實際輸入框：處理鍵盤、貼上、一次性簡訊驗證碼自動填入
          Positioned.fill(
            child: Opacity(
              opacity: 0,
              child: TextField(
                controller: _ctrl,
                focusNode: _focus,
                enabled: enabled,
                autofocus: widget.autofocus,
                showCursor: false,
                enableInteractiveSelection: false,
                keyboardType: TextInputType.number,
                autofillHints: const [AutofillHints.oneTimeCode],
                inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(widget.length)],
                decoration: aicdeBareDecoration(),
                onChanged: _changed,
              ),
            ),
          ),
        ]),
      ),
    );
  }
}
