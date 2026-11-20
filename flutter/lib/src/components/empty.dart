import 'package:flutter/material.dart';

import '../foundation/text.dart';
import '../theme/theme.dart';

/// 空狀態
class AicdeEmpty extends StatelessWidget {
  const AicdeEmpty({super.key, this.icon, this.title = '沒有資料', this.description, this.action});

  final Widget? icon;
  final String? title;
  final String? description;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: c.surface2,
              borderRadius: t.radius(t.rLg >= 999 ? 32 : t.rLg),
              border: t.strokeAll ? Border.all(color: t.strokeColor, width: t.strokeWidth) : null,
            ),
            child: IconTheme.merge(
              data: IconThemeData(color: c.ink3, size: 28),
              child: icon ?? const Icon(Icons.inbox_outlined),
            ),
          ),
          if (title != null) ...[const SizedBox(height: 12), Text(title!, style: t.heading(size: 15), textAlign: TextAlign.center)],
          if (description != null) ...[
            const SizedBox(height: 4),
            Text(description!, style: t.caption(size: 13), textAlign: TextAlign.center),
          ],
          if (action != null) ...[const SizedBox(height: 16), action!],
        ],
      ),
    );
  }
}
