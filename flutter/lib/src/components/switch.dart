import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/pressable.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';

enum AicdeSwitchSize { sm, md }

/// 開關。
///
/// ```dart
/// AicdeSwitch(value: on, onChanged: (v) => setState(() => on = v), label: '通知')
/// ```
class AicdeSwitch extends StatelessWidget {
  const AicdeSwitch({super.key, required this.value, required this.onChanged, this.label, this.size = AicdeSwitchSize.md, this.focusNode});

  final bool value;

  /// 傳 null 代表停用
  final ValueChanged<bool>? onChanged;
  final String? label;
  final AicdeSwitchSize size;
  final FocusNode? focusNode;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final (w, h) = size == AicdeSwitchSize.sm ? (36.0, 20.0) : (44.0, 24.0);
    final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final r = t.rPill.clamp(0.0, h / 2);
    return Semantics(
      toggled: value,
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
              radius: r,
              width: w,
              height: h,
              fill: value ? t.primary : c.lineStrong,
              states: AicdeStates(focused: s.focused),
              padding: const EdgeInsets.all(2),
              child: AnimatedAlign(
                alignment: value ? Alignment.centerRight : Alignment.centerLeft,
                duration: reduce ? Duration.zero : const Duration(milliseconds: 200),
                curve: t.curve,
                child: Container(
                  width: h - 4,
                  height: h - 4,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFFFFF),
                    borderRadius: BorderRadius.circular((r - 2).clamp(0, h)),
                    border: t.strokeAll ? Border.all(color: t.strokeColor, width: t.strokeWidth.clamp(1, 2)) : null,
                    boxShadow: const [BoxShadow(color: Color(0x33000000), blurRadius: 3, offset: Offset(0, 1))],
                  ),
                ),
              ),
            ),
            if (label != null) ...[const SizedBox(width: 8), Text(label!, style: t.body())],
          ]),
        ),
      ),
    );
  }
}
