import 'package:flutter/material.dart';

import '../foundation/text.dart';
import '../theme/theme.dart';
import 'input.dart';

/// 多行文字輸入，可顯示字數（[showCount] + [maxLength]）。
class AicdeTextarea extends StatefulWidget {
  const AicdeTextarea({
    super.key,
    this.value,
    this.onChanged,
    this.placeholder,
    this.rows = 3,
    this.maxRows,
    this.maxLength,
    this.showCount = false,
    this.enabled = true,
    this.error = false,
    this.focusNode,
  });

  final String? value;
  final ValueChanged<String>? onChanged;
  final String? placeholder;

  /// 最少行數
  final int rows;

  /// 最多行數，null = 自動長高
  final int? maxRows;
  final int? maxLength;
  final bool showCount;
  final bool enabled;
  final bool error;
  final FocusNode? focusNode;

  @override
  State<AicdeTextarea> createState() => _AicdeTextareaState();
}

class _AicdeTextareaState extends State<AicdeTextarea> {
  late String _text = widget.value ?? '';

  @override
  void didUpdateWidget(AicdeTextarea old) {
    super.didUpdateWidget(old);
    if (widget.value != null) _text = widget.value!;
  }

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final over = widget.maxLength != null && _text.characters.length >= widget.maxLength!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      mainAxisSize: MainAxisSize.min,
      children: [
        AicdeInput(
          value: widget.value,
          placeholder: widget.placeholder,
          minLines: widget.rows,
          maxLines: widget.maxRows,
          maxLength: widget.maxLength,
          enabled: widget.enabled,
          error: widget.error,
          focusNode: widget.focusNode,
          onChanged: (v) {
            setState(() => _text = v);
            widget.onChanged?.call(v);
          },
        ),
        if (widget.showCount) ...[
          const SizedBox(height: 4),
          Text(
            widget.maxLength != null ? '${_text.characters.length} / ${widget.maxLength}' : '${_text.characters.length}',
            style: t.number(size: 12, weight: FontWeight.w400, color: over ? t.colors.danger : t.colors.ink3),
          ),
        ],
      ],
    );
  }
}
