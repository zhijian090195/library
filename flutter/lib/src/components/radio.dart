import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/pressable.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';
import 'option.dart';

/// 單選鈕。所有主題都維持圓形（和網頁版一致）。
class AicdeRadio extends StatelessWidget {
  const AicdeRadio({super.key, required this.selected, required this.onSelected, this.label, this.focusNode});

  final bool selected;

  /// 傳 null 代表停用
  final VoidCallback? onSelected;
  final String? label;
  final FocusNode? focusNode;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    return Semantics(
      inMutuallyExclusiveGroup: true,
      checked: selected,
      child: AicdePressable(
        onTap: onSelected,
        focusNode: focusNode,
        isButton: false,
        selected: selected,
        semanticLabel: label,
        builder: (context, s) => Opacity(
          opacity: s.disabled ? .45 : 1,
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            AicdeBox(
              kind: AicdeBoxKind.chip,
              emphasis: AicdeEmphasis.outline,
              fill: t.colors.surface,
              radius: 999,
              width: 18,
              height: 18,
              states: AicdeStates(focused: s.focused),
              alignment: Alignment.center,
              child: AnimatedScale(
                scale: selected ? 1 : 0,
                duration: reduce ? Duration.zero : t.motion,
                curve: t.curve,
                child: Container(width: 8, height: 8, decoration: BoxDecoration(color: t.primary, shape: BoxShape.circle)),
              ),
            ),
            if (label != null) ...[const SizedBox(width: 8), Text(label!, style: t.body())],
          ]),
        ),
      ),
    );
  }
}

/// 一組單選鈕
class AicdeRadioGroup extends StatelessWidget {
  const AicdeRadioGroup({super.key, required this.options, required this.value, required this.onChanged, this.vertical = false, this.disabled = false});

  final List<AicdeOption> options;
  final String? value;
  final ValueChanged<String>? onChanged;
  final bool vertical;
  final bool disabled;

  @override
  Widget build(BuildContext context) {
    final items = [
      for (final o in options)
        AicdeRadio(
          label: o.text,
          selected: o.value == value,
          onSelected: disabled || o.disabled || onChanged == null ? null : () => onChanged!(o.value),
        ),
    ];
    return Semantics(
      container: true,
      child: vertical
          ? Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, spacing: 10, children: items)
          : Wrap(spacing: 18, runSpacing: 10, children: items),
    );
  }
}
