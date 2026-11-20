import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/pressable.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';

enum AicdeTagColor { normal, coral, navy, success, outline }

/// 標籤
class AicdeTag extends StatelessWidget {
  const AicdeTag({
    super.key,
    required this.label,
    this.color = AicdeTagColor.normal,
    this.dot = false,
    this.closable = false,
    this.onClose,
    this.closeLabel = '移除',
  });

  final String label;
  final AicdeTagColor color;

  /// 前面加一個小圓點
  final bool dot;
  final bool closable;
  final VoidCallback? onClose;
  final String closeLabel;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final (fill, fg) = switch (color) {
      AicdeTagColor.normal => (c.surface2, c.ink),
      AicdeTagColor.coral => (c.coral, Colors.white),
      AicdeTagColor.navy => (c.navy, Colors.white),
      AicdeTagColor.success => (c.success, Colors.white),
      AicdeTagColor.outline => (c.surface, c.ink),
    };
    return Semantics(
      label: label,
      child: AicdeBox(
        kind: AicdeBoxKind.chip,
        emphasis: color == AicdeTagColor.outline ? AicdeEmphasis.outline : AicdeEmphasis.solid,
        fill: fill,
        padding: EdgeInsets.only(left: 10, right: closable ? 4 : 10, top: 4, bottom: 4),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          if (dot) ...[
            Container(width: 6, height: 6, decoration: BoxDecoration(color: color == AicdeTagColor.normal || color == AicdeTagColor.outline ? c.coral : fg, shape: BoxShape.circle)),
            const SizedBox(width: 6),
          ],
          ExcludeSemantics(child: Text(t.labelText(label), style: t.label(size: 12, color: fg))),
          if (closable)
            AicdePressable(
              onTap: onClose ?? () {},
              semanticLabel: '$closeLabel $label',
              builder: (context, s) => Container(
                margin: const EdgeInsets.only(left: 2),
                width: 18,
                height: 18,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: s.hovered || s.focused ? fg.withValues(alpha: .18) : Colors.transparent,
                ),
                child: Icon(Icons.close, size: 12, color: fg),
              ),
            ),
        ]),
      ),
    );
  }
}
