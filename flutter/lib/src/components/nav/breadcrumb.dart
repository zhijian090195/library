import 'package:flutter/material.dart';

import '../../foundation/box.dart';
import '../../foundation/pressable.dart';
import '../../foundation/text.dart';
import '../../theme/theme.dart';

@immutable
class AicdeBreadcrumbItem {
  const AicdeBreadcrumbItem({required this.label, this.onTap});
  final String label;
  final VoidCallback? onTap;
}

/// 麵包屑。最後一項為目前頁面（不可點）。
class AicdeBreadcrumb extends StatelessWidget {
  const AicdeBreadcrumb({super.key, required this.items, this.separator = '/', this.semanticLabel = '麵包屑'});
  final List<AicdeBreadcrumbItem> items;
  final String separator;
  final String semanticLabel;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    return Semantics(
      container: true,
      label: semanticLabel,
      child: Wrap(
        crossAxisAlignment: WrapCrossAlignment.center,
        runSpacing: 4,
        children: [
          for (var i = 0; i < items.length; i++) ...[
            if (i > 0)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 6),
                child: ExcludeSemantics(child: Text(separator, style: t.body(color: c.lineStrong))),
              ),
            if (i == items.length - 1)
              Semantics(
                label: '目前頁面',
                child: Text(items[i].label, style: t.body(color: c.ink).copyWith(fontWeight: FontWeight.w500)),
              )
            else
              AicdePressable(
                onTap: items[i].onTap,
                isButton: false,
                semanticLabel: items[i].label,
                builder: (context, s) => AicdeBox(
                  kind: AicdeBoxKind.chip,
                  emphasis: AicdeEmphasis.ghost,
                  radius: t.rXs,
                  states: AicdeStates(focused: s.focused),
                  child: Text(
                    items[i].label,
                    style: t.body(color: s.hovered ? t.focusColor : c.ink2),
                  ),
                ),
              ),
          ],
        ],
      ),
    );
  }
}
