import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';
import 'feedback_common.dart';

enum AicdeResultStatus { success, error, info }

/// 結果頁：大圖示 + 標題 + 說明 + 動作按鈕
class AicdeResult extends StatelessWidget {
  const AicdeResult({super.key, this.status = AicdeResultStatus.success, required this.title, this.description, this.actions = const [], this.icon});
  final AicdeResultStatus status;
  final String title;
  final String? description;
  final List<Widget> actions;
  final Widget? icon;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = aicdeFeedbackColor(t, switch (status) {
      AicdeResultStatus.success => AicdeFeedbackType.success,
      AicdeResultStatus.error => AicdeFeedbackType.error,
      AicdeResultStatus.info => AicdeFeedbackType.info,
    });
    final glyph = switch (status) {
      AicdeResultStatus.success => Icons.check_rounded,
      AicdeResultStatus.error => Icons.close_rounded,
      AicdeResultStatus.info => Icons.priority_high_rounded,
    };
    return Semantics(
      container: true,
      liveRegion: true,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          AicdeBox(
            kind: AicdeBoxKind.chip,
            fill: c,
            width: 64,
            height: 64,
            radius: t.rPill >= 999 ? 999 : t.rLg,
            alignment: Alignment.center,
            child: IconTheme.merge(data: const IconThemeData(color: Color(0xFFFFFFFF), size: 34), child: icon ?? Icon(glyph)),
          ),
          const SizedBox(height: 18),
          Text(title, textAlign: TextAlign.center, style: t.heading(size: 20)),
          if (description != null) ...[
            const SizedBox(height: 6),
            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Text(description!, textAlign: TextAlign.center, style: t.body(color: t.colors.ink2)),
            ),
          ],
          if (actions.isNotEmpty) ...[
            const SizedBox(height: 18),
            Wrap(spacing: 12, runSpacing: 12, alignment: WrapAlignment.center, children: actions),
          ],
        ]),
      ),
    );
  }
}
