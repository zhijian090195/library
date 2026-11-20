import 'package:flutter/material.dart';

import '../foundation/text.dart';
import '../theme/theme.dart';

enum AicdeTooltipPlacement { top, bottom }

/// 提示：滑過或長按時顯示說明文字。鍵盤 focus 到 [child] 時也會顯示。
class AicdeTooltip extends StatelessWidget {
  const AicdeTooltip({
    super.key,
    required this.message,
    this.placement = AicdeTooltipPlacement.top,
    this.wrap = false,
    required this.child,
  });

  final String message;
  final AicdeTooltipPlacement placement;

  /// 允許換行（長文字）
  final bool wrap;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final bg = t.isDark ? c.surface2 : c.navy;
    return Tooltip(
      message: message,
      preferBelow: placement == AicdeTooltipPlacement.bottom,
      verticalOffset: 22,
      waitDuration: const Duration(milliseconds: 250),
      exitDuration: reduce ? Duration.zero : const Duration(milliseconds: 100),
      constraints: wrap ? const BoxConstraints(maxWidth: 240) : null,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: t.radius(t.rSm),
        border: t.strokeAll ? Border.all(color: t.strokeColor, width: t.strokeWidth) : null,
        boxShadow: [
          if (t.edgeDepth > 0 && t.strokeAll) BoxShadow(color: t.strokeColor, offset: Offset(t.edgeDepth * .6, t.edgeDepth * .6)),
        ],
      ),
      textStyle: t.caption(color: t.isDark ? c.ink : Colors.white).copyWith(fontWeight: FontWeight.w500),
      child: child,
    );
  }
}
