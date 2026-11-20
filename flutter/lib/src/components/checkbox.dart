import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/pressable.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';
import 'option.dart';

/// 核取方塊。[indeterminate] 為 true 時顯示「部分選取」。
class AicdeCheckbox extends StatelessWidget {
  const AicdeCheckbox({super.key, required this.value, required this.onChanged, this.label, this.indeterminate = false, this.focusNode});

  final bool value;

  /// 傳 null 代表停用
  final ValueChanged<bool>? onChanged;
  final String? label;
  final bool indeterminate;
  final FocusNode? focusNode;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final on = value || indeterminate;
    return Semantics(
      checked: value,
      mixed: indeterminate ? true : null,
      child: AicdePressable(
        onTap: onChanged == null ? null : () => onChanged!(!value),
        focusNode: focusNode,
        isButton: false,
        semanticLabel: label,
        builder: (context, s) => Opacity(
          opacity: s.disabled ? .45 : 1,
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            AicdeBox(
              kind: AicdeBoxKind.chip,
              emphasis: on ? AicdeEmphasis.solid : AicdeEmphasis.outline,
              fill: on ? t.primary : t.colors.surface,
              radius: t.rXs.clamp(0, 6),
              width: 18,
              height: 18,
              states: AicdeStates(focused: s.focused),
              alignment: Alignment.center,
              child: on
                  ? Icon(indeterminate ? Icons.remove_rounded : Icons.check_rounded, size: 14, color: t.onPrimary)
                  : const SizedBox.shrink(),
            ),
            if (label != null) ...[const SizedBox(width: 8), Text(label!, style: t.body())],
          ]),
        ),
      ),
    );
  }
}

/// 一組核取方塊
class AicdeCheckboxGroup extends StatelessWidget {
  const AicdeCheckboxGroup({super.key, required this.options, required this.value, required this.onChanged, this.vertical = false, this.disabled = false});

  final List<AicdeOption> options;
  final List<String> value;
  final ValueChanged<List<String>>? onChanged;
  final bool vertical;
  final bool disabled;

  @override
  Widget build(BuildContext context) {
    final items = [
      for (final o in options)
        AicdeCheckbox(
          label: o.text,
          value: value.contains(o.value),
          onChanged: disabled || o.disabled || onChanged == null
              ? null
              : (v) => onChanged!(v
                  ? [for (final x in options) if (x.value == o.value || value.contains(x.value)) x.value]
                  : [for (final x in value) if (x != o.value) x]),
        ),
    ];
    return vertical
        ? Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, spacing: 10, children: items)
        : Wrap(spacing: 18, runSpacing: 10, children: items);
  }
}
