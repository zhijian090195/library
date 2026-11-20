import 'dart:math' as math;

import 'package:flutter/widgets.dart';

/// 網點（半色調）：在填色上疊一層小圓點
class HalftonePainter extends CustomPainter {
  HalftonePainter({required this.color, this.step = 4, this.dot = 1});
  final Color color;
  final double step;
  final double dot;

  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()..color = color;
    for (double y = step / 2; y < size.height; y += step) {
      for (double x = step / 2; x < size.width; x += step) {
        canvas.drawCircle(Offset(x, y), dot, p);
      }
    }
  }

  @override
  bool shouldRepaint(HalftonePainter old) => old.color != color || old.step != step || old.dot != dot;
}

/// 沿著圓角矩形畫虛線（手縫布藝的車縫線、票根撕線）
class DashedRRectPainter extends CustomPainter {
  DashedRRectPainter({
    required this.color,
    required this.radius,
    this.inset = 5,
    this.strokeWidth = 1.5,
    this.dash = 5,
    this.gap = 4,
  });
  final Color color;
  final BorderRadius radius;
  final double inset, strokeWidth, dash, gap;

  @override
  void paint(Canvas canvas, Size size) {
    final rect = (Offset.zero & size).deflate(inset);
    if (rect.width <= 0 || rect.height <= 0) return;
    final rr = radius.toRRect(rect);
    final path = Path()..addRRect(rr.scaleRadii());
    final p = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;
    for (final m in path.computeMetrics()) {
      double d = 0;
      while (d < m.length) {
        canvas.drawPath(m.extractPath(d, math.min(d + dash, m.length)), p);
        d += dash + gap;
      }
    }
  }

  @override
  bool shouldRepaint(DashedRRectPainter old) =>
      old.color != color || old.radius != radius || old.inset != inset;
}

/// 藍圖的四角裁切標記
class CornerTicksPainter extends CustomPainter {
  CornerTicksPainter({required this.color, this.length = 9, this.width = 2});
  final Color color;
  final double length, width;

  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()..color = color;
    final w = size.width, h = size.height, l = length, s = width;
    for (final r in [
      Rect.fromLTWH(0, 0, l, s), Rect.fromLTWH(0, 0, s, l),
      Rect.fromLTWH(w - l, 0, l, s), Rect.fromLTWH(w - s, 0, s, l),
      Rect.fromLTWH(0, h - s, l, s), Rect.fromLTWH(0, h - l, s, l),
      Rect.fromLTWH(w - l, h - s, l, s), Rect.fromLTWH(w - s, h - l, s, l),
    ]) {
      canvas.drawRect(r, p);
    }
  }

  @override
  bool shouldRepaint(CornerTicksPainter old) => old.color != color;
}

/// 積木的倒角：左上亮邊、右下暗邊
class BevelPainter extends CustomPainter {
  BevelPainter({required this.radius, this.depth = 3});
  final BorderRadius radius;
  final double depth;

  @override
  void paint(Canvas canvas, Size size) {
    final rr = radius.toRRect(Offset.zero & size).scaleRadii();
    canvas.save();
    canvas.clipRRect(rr);
    final hi = Paint()
      ..color = const Color(0x47FFFFFF)
      ..style = PaintingStyle.stroke
      ..strokeWidth = depth * 2;
    final lo = Paint()
      ..color = const Color(0x29000000)
      ..style = PaintingStyle.stroke
      ..strokeWidth = depth * 2;
    // 左上
    canvas.drawPath(
        Path()
          ..moveTo(0, size.height)
          ..lineTo(0, 0)
          ..lineTo(size.width, 0),
        hi);
    // 右下
    canvas.drawPath(
        Path()
          ..moveTo(size.width, 0)
          ..lineTo(size.width, size.height)
          ..lineTo(0, size.height),
        lo);
    canvas.restore();
  }

  @override
  bool shouldRepaint(BevelPainter old) => old.radius != radius;
}

/// 票根：左右兩側打一個半圓缺口
class NotchClipper extends CustomClipper<Path> {
  NotchClipper({required this.radius, this.notch = 6});
  final BorderRadius radius;
  final double notch;

  @override
  Path getClip(Size size) {
    final body = Path()..addRRect(radius.toRRect(Offset.zero & size).scaleRadii());
    final n = math.min(notch, size.height / 4);
    final holes = Path()
      ..addOval(Rect.fromCircle(center: Offset(0, size.height / 2), radius: n))
      ..addOval(Rect.fromCircle(center: Offset(size.width, size.height / 2), radius: n));
    return Path.combine(PathOperation.difference, body, holes);
  }

  @override
  bool shouldReclip(NotchClipper old) => old.radius != radius || old.notch != notch;
}

/// 文字按鈕滑過時的麥克筆底線（紙雕、混合媒材）
class MarkerPainter extends CustomPainter {
  MarkerPainter({required this.color, required this.progress});
  final Color color;
  final double progress;

  @override
  void paint(Canvas canvas, Size size) {
    if (progress <= 0) return;
    final h = size.height * .3;
    final r = Rect.fromLTWH(4, size.height * .58, (size.width - 8) * progress, h);
    canvas.save();
    canvas.translate(0, 0);
    canvas.drawRRect(RRect.fromRectAndRadius(r, const Radius.circular(2)), Paint()..color = color);
    canvas.restore();
  }

  @override
  bool shouldRepaint(MarkerPainter old) => old.progress != progress || old.color != color;
}
