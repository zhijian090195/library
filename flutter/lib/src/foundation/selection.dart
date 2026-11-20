import 'package:flutter/widgets.dart';

import '../theme/tokens.dart';

/// 選中項目的左側標記條（對應 CSS 的 `--a-sel-ring`）。
///
/// 只有設定了 [AicdeTokens.selectionRing] 的主題（目前是編輯）會畫；
/// 這些主題的選中底色是透明的，沒有標記條就看不出哪一項被選中。
/// 用 Stack 疊一條色塊，不動原本的外框，所以圓角和 focus 外框都不受影響。
class AicdeSelectionMark extends StatelessWidget {
  const AicdeSelectionMark({
    super.key,
    required this.tokens,
    required this.selected,
    required this.child,
  });
  final AicdeTokens tokens;
  final bool selected;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final ring = tokens.selectionRing;
    if (!selected || ring == null) return child;
    return Stack(
      fit: StackFit.passthrough,
      children: [
        child,
        Positioned(
          left: 0,
          top: 4,
          bottom: 4,
          width: 3,
          child: IgnorePointer(
            child: ColoredBox(
              key: const ValueKey('aicde-selection-ring'),
              color: ring,
            ),
          ),
        ),
      ],
    );
  }
}
