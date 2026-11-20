import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/pressable.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';

/// 卡片：可放封面、眉標、標題、內文與底部。
///
/// 傳 [onTap] 或 `interactive: true` 時會有滑過／按下回饋。
class AicdeCard extends StatelessWidget {
  const AicdeCard({
    super.key,
    this.cover,
    this.eyebrow,
    this.title,
    this.child,
    this.footer,
    this.interactive = false,
    this.outline = false,
    this.horizontal = false,
    this.onTap,
    this.padding = const EdgeInsets.all(16),
    this.width,
  });

  /// 封面（通常是 `Image`）；會依卡片圓角裁切
  final Widget? cover;
  final String? eyebrow;
  final String? title;
  final Widget? child;
  final Widget? footer;
  final bool interactive;

  /// 外框樣式（不畫紙邊）
  final bool outline;

  /// 封面放左側
  final bool horizontal;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry padding;
  final double? width;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final body = Padding(
      padding: padding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (eyebrow != null) ...[
            Text(t.labelText(eyebrow!), style: t.label(size: 11, color: t.colors.coralDark)),
            const SizedBox(height: 6),
          ],
          if (title != null) Text(title!, style: t.heading()),
          if (child != null) ...[
            if (title != null) const SizedBox(height: 4),
            DefaultTextStyle.merge(style: t.body(size: 13), child: child!),
          ],
          if (footer != null) ...[const SizedBox(height: 12), footer!],
        ],
      ),
    );
    Widget content(AicdeStates s) {
      final inner = horizontal && cover != null
          ? IntrinsicHeight(
              child: Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                SizedBox(width: 120, child: cover!),
                Expanded(child: body),
              ]),
            )
          : Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisSize: MainAxisSize.min,
              children: [?cover, body],
            );
      return AicdeBox(
        kind: AicdeBoxKind.card,
        emphasis: outline ? AicdeEmphasis.outline : AicdeEmphasis.solid,
        states: s,
        width: width,
        clip: cover != null,
        child: inner,
      );
    }

    if (onTap == null && !interactive) return content(AicdeStates.none);
    return AicdePressable(
      onTap: onTap ?? () {},
      semanticLabel: title,
      builder: (context, s) => content(s),
    );
  }
}
