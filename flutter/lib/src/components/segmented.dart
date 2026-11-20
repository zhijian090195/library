import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/pressable.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';
import 'option.dart';

/// 分段控制器：一組互斥的選項，選中的那一塊會浮起來。
class AicdeSegmented extends StatelessWidget {
  const AicdeSegmented({super.key, required this.options, required this.value, required this.onChanged});

  final List<AicdeOption> options;
  final String? value;

  /// 傳 null 代表停用
  final ValueChanged<String>? onChanged;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final h = t.controlHeight;
    final outerR = t.buttonRadius >= 999 ? 999.0 : t.buttonRadius;
    final innerR = outerR >= 999 ? 999.0 : (outerR - 3).clamp(0.0, 999.0);
    return Semantics(
      container: true,
      child: Container(
        height: h,
        padding: const EdgeInsets.all(3),
        decoration: BoxDecoration(
          color: c.surface2,
          borderRadius: t.radius(outerR.clamp(0, h / 2)),
          border: t.strokeAll ? Border.all(color: t.strokeColor, width: t.strokeWidth) : null,
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          for (final o in options)
            AicdePressable(
              onTap: onChanged == null || o.disabled ? null : () => onChanged!(o.value),
              selected: o.value == value,
              semanticLabel: o.text,
              builder: (context, s) {
                final on = o.value == value;
                final label = Text(t.labelText(o.text),
                    style: t.label(size: 13, weight: on ? FontWeight.w700 : FontWeight.w500, color: on ? c.ink : c.ink2));
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 1),
                  child: on
                      ? AicdeBox(
                          kind: AicdeBoxKind.chip,
                          radius: innerR,
                          fill: c.surface,
                          states: AicdeStates(focused: s.focused),
                          padding: const EdgeInsets.symmetric(horizontal: 14),
                          alignment: Alignment.center,
                          child: label,
                        )
                      : AicdeBox(
                          kind: AicdeBoxKind.chip,
                          emphasis: AicdeEmphasis.ghost,
                          radius: innerR,
                          states: AicdeStates(focused: s.focused, disabled: s.disabled),
                          padding: const EdgeInsets.symmetric(horizontal: 14),
                          alignment: Alignment.center,
                          child: label,
                        ),
                );
              },
            ),
        ]),
      ),
    );
  }
}
