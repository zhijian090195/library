import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';
import 'feedback_common.dart';

/// 提示框：info / success / warning / error。error 會以 alert 角色朗讀，其他為 status。
class AicdeAlert extends StatelessWidget {
  const AicdeAlert({super.key, this.type = AicdeFeedbackType.info, this.title, this.child, this.message, this.icon, this.showIcon = true, this.onClose});
  final AicdeFeedbackType type;
  final String? title;

  /// 內文文字；需要複雜內容時改用 [child]
  final String? message;
  final Widget? child;

  /// 自訂圖示；[showIcon] = false 隱藏
  final Widget? icon;
  final bool showIcon;

  /// 傳入時右側出現關閉鈕
  final VoidCallback? onClose;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = aicdeFeedbackColor(t, type);
    final fill = Color.lerp(t.colors.surface, c, t.isDark ? .16 : .08)!;
    return Semantics(
      liveRegion: true,
      container: true,
      child: AicdeBox(
        kind: AicdeBoxKind.panel,
        emphasis: AicdeEmphasis.outline,
        fill: fill,
        radius: t.rMd,
        padding: const EdgeInsets.fromLTRB(16, 12, 12, 12),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          if (showIcon) ...[
            Padding(
              padding: const EdgeInsets.only(top: 2),
              child: IconTheme.merge(data: IconThemeData(color: c, size: 20), child: icon ?? Icon(aicdeFeedbackIcon(type))),
            ),
            const SizedBox(width: 12),
          ],
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
              if (title != null) Text(title!, style: t.heading(size: 14)),
              if (message != null) Text(message!, style: t.body()),
              if (child != null) DefaultTextStyle.merge(style: t.body(), child: child!),
            ]),
          ),
          if (onClose != null) ...[const SizedBox(width: 8), AicdeCloseButton(onPressed: onClose, size: 24)],
        ]),
      ),
    );
  }
}
