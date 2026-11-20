import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';

@immutable
class AicdeDescriptionsItem {
  const AicdeDescriptionsItem({required this.label, required this.child, this.wide = false});
  final String label;
  final Widget child;

  /// 佔滿整列
  final bool wide;
}

/// 描述清單（欄位：值）。寬度不足時自動減少欄數。
class AicdeDescriptions extends StatelessWidget {
  const AicdeDescriptions({super.key, required this.items, this.columns = 2, this.minColumnWidth = 180});
  final List<AicdeDescriptionsItem> items;
  final int columns;
  final double minColumnWidth;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    return AicdeBox(
      kind: AicdeBoxKind.panel,
      padding: const EdgeInsets.all(16),
      child: LayoutBuilder(builder: (context, box) {
        var cols = columns;
        while (cols > 1 && box.maxWidth / cols < minColumnWidth) {
          cols--;
        }
        const gap = 16.0;
        final w = (box.maxWidth - gap * (cols - 1)) / cols;
        return Wrap(
          spacing: gap,
          runSpacing: 14,
          children: [
            for (final it in items)
              SizedBox(
                width: it.wide ? box.maxWidth : w,
                child: Semantics(
                  label: it.label,
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(t.labelText(it.label), style: t.caption(size: 12, color: c.ink3)),
                    const SizedBox(height: 2),
                    DefaultTextStyle.merge(style: t.body(size: 14, color: c.ink).copyWith(fontWeight: FontWeight.w500), child: it.child),
                  ]),
                ),
              ),
          ],
        );
      }),
    );
  }
}
