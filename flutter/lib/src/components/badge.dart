import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';

enum AicdeBadgeColor { coral, navy }

/// 徽章：疊在 [child] 右上角的數字或小紅點；沒有 [child] 時直接顯示（inline）。
class AicdeBadge extends StatelessWidget {
  const AicdeBadge({
    super.key,
    this.count,
    this.max = 99,
    this.dot = false,
    this.color = AicdeBadgeColor.coral,
    this.showZero = false,
    this.semanticLabel,
    this.child,
  });

  final int? count;
  final int max;
  final bool dot;
  final AicdeBadgeColor color;
  final bool showZero;
  final String? semanticLabel;
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final fill = color == AicdeBadgeColor.coral ? t.colors.coral : t.colors.navy;
    final hidden = !dot && (count == null || (count == 0 && !showZero));
    final text = count == null ? '' : (count! > max ? '$max+' : '$count');
    final badge = hidden
        ? const SizedBox.shrink()
        : Semantics(
            label: semanticLabel ?? (dot ? '有新通知' : '$text 則'),
            child: ExcludeSemantics(
              child: dot
                  ? Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        color: fill,
                        shape: BoxShape.circle,
                        border: Border.all(color: t.colors.surface, width: 2),
                      ),
                    )
                  : ConstrainedBox(
                      constraints: const BoxConstraints(minWidth: 20),
                      child: AicdeBox(
                        kind: AicdeBoxKind.chip,
                        fill: fill,
                        height: 20,
                        radius: t.tagRadius >= 10 ? 10 : t.tagRadius,
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        alignment: Alignment.center,
                        child: Text(text, style: t.number(size: 11, weight: FontWeight.w700, color: Colors.white)),
                      ),
                    ),
            ),
          );
    if (child == null) return badge;
    return Stack(
      clipBehavior: Clip.none,
      children: [
        child!,
        if (!hidden) Positioned(top: dot ? -2 : -8, right: dot ? -2 : -10, child: badge),
      ],
    );
  }
}
