import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import '../theme/theme.dart';
import '../theme/tokens.dart';
import 'feedback_common.dart';

enum AicdeSpinnerSize { sm, md, lg }

/// 載入中轉圈。依主題換形狀：直角主題（粗野、編輯）是旋轉方框，
/// 藍圖與手縫是虛線圈，其他為圓弧。
class AicdeSpinner extends StatefulWidget {
  const AicdeSpinner({super.key, this.size = AicdeSpinnerSize.md, this.color, this.semanticLabel = '載入中'});
  final AicdeSpinnerSize size;
  final Color? color;
  final String semanticLabel;

  @override
  State<AicdeSpinner> createState() => _AicdeSpinnerState();
}

enum _Shape { ring, square, dashed }

class _AicdeSpinnerState extends State<AicdeSpinner> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 700));

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // 減少動態：放慢到 1.6 秒，和網頁版一致
    _c.duration = Duration(milliseconds: aicdeReduceMotion(context) ? 1600 : 700);
    _c.repeat();
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final d = switch (widget.size) {
      AicdeSpinnerSize.sm => 16.0,
      AicdeSpinnerSize.md => 24.0,
      AicdeSpinnerSize.lg => 36.0,
    };
    final shape = t.texture == AicdeTexture.corners || t.texture == AicdeTexture.stitch
        ? _Shape.dashed
        : (t.rPill == 0 ? _Shape.square : _Shape.ring);
    return Semantics(
      label: widget.semanticLabel,
      liveRegion: true,
      child: SizedBox.square(
        dimension: d,
        child: AnimatedBuilder(
          animation: _c,
          builder: (context, _) => CustomPaint(
            painter: _SpinnerPainter(
              progress: _c.value,
              shape: shape,
              color: widget.color ?? t.primary,
              track: t.strokeAll ? t.strokeColor.withValues(alpha: .25) : t.colors.surface2,
              width: math.max(2.5, math.min(t.strokeWidth, 3.0)) * (d / 24).clamp(.8, 1.4),
            ),
          ),
        ),
      ),
    );
  }
}

class _SpinnerPainter extends CustomPainter {
  _SpinnerPainter({required this.progress, required this.shape, required this.color, required this.track, required this.width});
  final double progress, width;
  final _Shape shape;
  final Color color, track;

  @override
  void paint(Canvas canvas, Size size) {
    final rect = (Offset.zero & size).deflate(width / 2);
    final p = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = width
      ..strokeCap = shape == _Shape.square ? StrokeCap.square : StrokeCap.round;
    final angle = progress * math.pi * 2;
    switch (shape) {
      case _Shape.ring:
        canvas.drawOval(rect, p..color = track);
        canvas.drawArc(rect, angle - math.pi / 2, math.pi / 2, false, p..color = color);
      case _Shape.dashed:
        canvas.save();
        canvas.translate(size.width / 2, size.height / 2);
        canvas.rotate(angle);
        canvas.translate(-size.width / 2, -size.height / 2);
        const n = 8;
        for (var i = 0; i < n; i++) {
          final a = i * math.pi * 2 / n;
          canvas.drawArc(rect, a, math.pi / n * .9, false, p..color = Color.lerp(track, color, i / (n - 1))!);
        }
        canvas.restore();
      case _Shape.square:
        canvas.save();
        canvas.translate(size.width / 2, size.height / 2);
        canvas.rotate(angle / 2);
        canvas.translate(-size.width / 2, -size.height / 2);
        final r = rect.deflate(size.width * .1);
        canvas.drawRect(r, p..color = track);
        canvas.drawLine(r.topLeft, r.topRight, p..color = color);
        canvas.drawLine(r.topRight, r.bottomRight, p);
        canvas.restore();
    }
  }

  @override
  bool shouldRepaint(_SpinnerPainter o) => o.progress != progress || o.color != color || o.shape != shape;
}
