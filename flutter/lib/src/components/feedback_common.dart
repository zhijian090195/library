import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/pressable.dart';
import '../theme/theme.dart';
import '../theme/tokens.dart';

/// 回饋類元件共用的狀態類型
enum AicdeFeedbackType { info, success, warning, error }

/// 狀態色：info 用海藍、success 綠、warning 橘、error 紅
Color aicdeFeedbackColor(AicdeTokens t, AicdeFeedbackType type) => switch (type) {
  AicdeFeedbackType.info => t.colors.band,
  AicdeFeedbackType.success => t.colors.success,
  AicdeFeedbackType.warning => t.colors.warning,
  AicdeFeedbackType.error => t.colors.danger,
};

IconData aicdeFeedbackIcon(AicdeFeedbackType type) => switch (type) {
  AicdeFeedbackType.info => Icons.info_outline_rounded,
  AicdeFeedbackType.success => Icons.check_circle_outline_rounded,
  AicdeFeedbackType.warning => Icons.warning_amber_rounded,
  AicdeFeedbackType.error => Icons.highlight_off_rounded,
};

/// 對話框、抽屜、Toast、橫幅共用的關閉按鈕（×）
class AicdeCloseButton extends StatelessWidget {
  const AicdeCloseButton({super.key, required this.onPressed, this.color, this.size = 28, this.semanticLabel = '關閉'});
  final VoidCallback? onPressed;
  final Color? color;
  final double size;
  final String semanticLabel;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    // container：讓關閉鈕成為獨立的語意節點，不和外層的提示文字合併
    return Semantics(
      container: true,
      child: AicdePressable(
        onTap: onPressed,
        semanticLabel: semanticLabel,
        builder: (context, s) => AicdeBox(
          kind: AicdeBoxKind.control,
          emphasis: AicdeEmphasis.ghost,
          states: s,
          width: size,
          height: size,
          radius: t.rSm,
          alignment: Alignment.center,
          child: AnimatedContainer(
            duration: t.motion,
            width: size,
            height: size,
            decoration: BoxDecoration(
              color: s.hovered ? (color ?? t.colors.ink).withValues(alpha: .1) : const Color(0x00000000),
              borderRadius: BorderRadius.circular(t.rSm.clamp(0, size / 2)),
            ),
            alignment: Alignment.center,
            child: Icon(Icons.close_rounded, size: size * .6, color: color ?? t.colors.ink3),
          ),
        ),
      ),
    );
  }
}

bool aicdeReduceMotion(BuildContext context) => MediaQuery.maybeDisableAnimationsOf(context) ?? false;
