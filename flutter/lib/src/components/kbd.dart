import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';

/// 鍵盤按鍵
class AicdeKbd extends StatelessWidget {
  const AicdeKbd(this.label, {super.key});
  final String label;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    return AicdeBox(
      kind: AicdeBoxKind.chip,
      emphasis: AicdeEmphasis.outline,
      radius: t.rXs + 2 > t.tagRadius ? t.tagRadius : t.rXs + 2,
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      child: Text(label, style: TextStyle(fontFamily: t.monoFamily, fontSize: 12, fontWeight: FontWeight.w600, color: t.colors.ink, height: 1.2)),
    );
  }
}

/// 組合鍵，例如 `AicdeKbdCombo(keys: ['⌘', 'K'])`
class AicdeKbdCombo extends StatelessWidget {
  const AicdeKbdCombo({super.key, required this.keys, this.separator = '+'});
  final List<String> keys;
  final String separator;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    return Semantics(
      label: keys.join(' '),
      child: ExcludeSemantics(
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          for (var i = 0; i < keys.length; i++) ...[
            if (i > 0) Padding(padding: const EdgeInsets.symmetric(horizontal: 4), child: Text(separator, style: t.caption())),
            AicdeKbd(keys[i]),
          ],
        ]),
      ),
    );
  }
}
