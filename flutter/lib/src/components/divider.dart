import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import '../foundation/text.dart';
import '../theme/theme.dart';
import '../theme/tokens.dart';

enum AicdeDividerAlign { center, left }

/// 分隔線，可以帶文字。手縫與票根主題會畫成虛線。
class AicdeDivider extends StatelessWidget {
  const AicdeDivider({super.key, this.label, this.vertical = false, this.align = AicdeDividerAlign.center, this.margin});
  final String? label;
  final bool vertical;
  final AicdeDividerAlign align;
  final EdgeInsetsGeometry? margin;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final dashed = t.texture == AicdeTexture.stitch || t.texture == AicdeTexture.notch;
    final color = t.strokeAll ? t.strokeColor : t.colors.line;
    final w = t.strokeAll ? math.min(t.strokeWidth, 2.0) : 1.0;
    Widget line() => CustomPaint(
          size: vertical ? Size(w, 16) : Size(double.infinity, w),
          painter: _LinePainter(color: color, width: w, dashed: dashed, vertical: vertical),
        );
    if (vertical) {
      return Semantics(
        container: true,
        child: Padding(padding: margin ?? const EdgeInsets.symmetric(horizontal: 8), child: SizedBox(width: w, height: 16, child: line())),
      );
    }
    final hasLabel = label != null;
    return Semantics(
      container: true,
      child: Padding(
        padding: margin ?? const EdgeInsets.symmetric(vertical: 16),
        child: Row(children: [
          if (!hasLabel || align == AicdeDividerAlign.center) Expanded(child: line()) else SizedBox(width: 16, child: line()),
          if (hasLabel) ...[
            const SizedBox(width: 12),
            Text(t.labelText(label!), style: t.label(size: 12, weight: FontWeight.w500, color: t.colors.ink3)),
            const SizedBox(width: 12),
            Expanded(child: line()),
          ],
        ]),
      ),
    );
  }
}

class _LinePainter extends CustomPainter {
  _LinePainter({required this.color, required this.width, required this.dashed, required this.vertical});
  final Color color;
  final double width;
  final bool dashed, vertical;

  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()
      ..color = color
      ..strokeWidth = width;
    final len = vertical ? size.height : size.width;
    final step = dashed ? 9.0 : len;
    for (double d = 0; d < len; d += step) {
      final e = math.min(d + (dashed ? 5 : len), len);
      if (vertical) {
        canvas.drawLine(Offset(width / 2, d), Offset(width / 2, e), p);
      } else {
        canvas.drawLine(Offset(d, width / 2), Offset(e, width / 2), p);
      }
    }
  }

  @override
  bool shouldRepaint(_LinePainter o) => o.color != color || o.dashed != dashed || o.width != width;
}
