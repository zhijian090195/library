import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/pressable.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';

@immutable
class AicdeListItem {
  const AicdeListItem({this.key, this.avatar, required this.title, this.description, this.extra, this.onTap});
  final String? key;
  final Widget? avatar;
  final String title;
  final String? description;
  final Widget? extra;
  final VoidCallback? onTap;
}

/// 清單
class AicdeList extends StatelessWidget {
  const AicdeList({super.key, required this.items, this.hover = true});
  final List<AicdeListItem> items;

  /// 有 onTap 的項目滑過時加底色
  final bool hover;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    return AicdeBox(
      kind: AicdeBoxKind.panel,
      clip: true,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          for (var i = 0; i < items.length; i++)
            DecoratedBox(
              key: items[i].key == null ? null : ValueKey(items[i].key),
              decoration: BoxDecoration(
                border: i == 0 ? null : Border(top: BorderSide(color: t.strokeAll ? t.strokeColor : c.line, width: t.strokeAll ? t.strokeWidth : 1)),
              ),
              child: _row(context, items[i]),
            ),
        ],
      ),
    );
  }

  Widget _row(BuildContext context, AicdeListItem it) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    Widget body(AicdeStates s) => AnimatedContainer(
          duration: (MediaQuery.maybeDisableAnimationsOf(context) ?? false) ? Duration.zero : t.motion,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: hover && (s.hovered || s.focused) ? c.surface2 : Colors.transparent,
            border: s.focused ? Border(left: BorderSide(color: t.focusColor, width: 3)) : null,
          ),
          child: Row(children: [
            if (it.avatar != null) ...[it.avatar!, const SizedBox(width: 12)],
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(it.title, style: t.heading(size: 14), maxLines: 1, overflow: TextOverflow.ellipsis),
                if (it.description != null) Text(it.description!, style: t.caption(size: 13), maxLines: 2, overflow: TextOverflow.ellipsis),
              ]),
            ),
            if (it.extra != null) ...[const SizedBox(width: 12), DefaultTextStyle.merge(style: t.caption(), child: it.extra!)],
          ]),
        );
    if (it.onTap == null) return body(AicdeStates.none);
    return AicdePressable(onTap: it.onTap, semanticLabel: it.title, builder: (context, s) => body(s));
  }
}
