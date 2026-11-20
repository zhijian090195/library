import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import '../foundation/painters.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';
import '../theme/tokens.dart';
import 'feedback_common.dart';

enum AicdeProgressColor { primary, coral, navy, success }

Color _barColor(AicdeTokens t, AicdeProgressColor c) => switch (c) {
      AicdeProgressColor.primary => t.primary,
      AicdeProgressColor.coral => t.colors.coral,
      AicdeProgressColor.navy => t.colors.navy,
      AicdeProgressColor.success => t.colors.success,
    };

/// 條狀進度。軌道粗細、紋路（網點、斜紋、刻度）跟著主題。
///
/// 預設右側顯示百分比；[label] 傳自訂文字，[showLabel] = false 隱藏。
class AicdeProgress extends StatelessWidget {
  const AicdeProgress({super.key, this.value = 0, this.color = AicdeProgressColor.primary, this.indeterminate = false, this.label, this.showLabel = true, this.semanticLabel});

  /// 0–100
  final double value;
  final AicdeProgressColor color;
  final bool indeterminate;
  final String? label;
  final bool showLabel;
  final String? semanticLabel;

  /// 主題的軌道粗細（網頁版各主題的 .a-progress__track height）
  static double trackHeight(AicdeTokens t) => switch (t.style) {
        AicdeThemeStyle.ink || AicdeThemeStyle.block => 12,
        AicdeThemeStyle.brutal || AicdeThemeStyle.cute => 14,
        AicdeThemeStyle.soft || AicdeThemeStyle.stitch || AicdeThemeStyle.blueprint || AicdeThemeStyle.clinical => 10,
        AicdeThemeStyle.finance => 6,
        AicdeThemeStyle.editorial => 2,
        _ => 8,
      };

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final v = value.clamp(0, 100).toDouble();
    final h = trackHeight(t);
    final r = math.min(t.rPill, h / 2);
    final fill = _barColor(t, color);
    final text = label ?? (indeterminate ? null : '${v.round()}%');
    return Semantics(
      label: semanticLabel,
      value: indeterminate ? null : '${v.round()}%',
      child: Row(children: [
        Expanded(
          child: Container(
            height: h,
            decoration: BoxDecoration(
              color: t.style == AicdeThemeStyle.cute ? Color.lerp(t.colors.surface, t.colors.coral, .15) : t.colors.surface2,
              borderRadius: BorderRadius.circular(r),
              border: t.strokeAll ? Border.all(color: t.strokeColor, width: math.min(t.strokeWidth, 2)) : null,
            ),
            clipBehavior: Clip.antiAlias,
            child: _Bar(value: v / 100, indeterminate: indeterminate, color: fill, radius: r),
          ),
        ),
        if (showLabel && text != null) ...[
          const SizedBox(width: 10),
          Text(text, style: t.number(size: 13, color: t.colors.ink2)),
        ],
      ]),
    );
  }
}

class _Bar extends StatefulWidget {
  const _Bar({required this.value, required this.indeterminate, required this.color, required this.radius});
  final double value, radius;
  final bool indeterminate;
  final Color color;
  @override
  State<_Bar> createState() => _BarState();
}

class _BarState extends State<_Bar> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400));

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _sync();
  }

  @override
  void didUpdateWidget(_Bar old) {
    super.didUpdateWidget(old);
    _sync();
  }

  void _sync() {
    if (widget.indeterminate && !aicdeReduceMotion(context)) {
      if (!_c.isAnimating) _c.repeat();
    } else {
      _c.stop();
    }
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  Widget _fill(AicdeTokens t) {
    final layers = <Widget>[Container(color: widget.color)];
    if (t.texture == AicdeTexture.gloss) {
      layers.add(Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Color(0x40FFFFFF), Color(0x14000000)]),
        ),
      ));
    }
    if (t.texture == AicdeTexture.halftone) layers.add(CustomPaint(painter: HalftonePainter(color: const Color(0x33000000), step: 3.5, dot: .8)));
    if (t.style == AicdeThemeStyle.blueprint || t.style == AicdeThemeStyle.cute) {
      final cute = t.style == AicdeThemeStyle.cute;
      layers.add(CustomPaint(painter: _StripePainter(color: cute ? const Color(0x33FFFFFF) : t.colors.coralDark, gap: cute ? 16 : 6)));
    }
    if (t.texture == AicdeTexture.bevel) layers.add(Container(decoration: const BoxDecoration(border: Border(top: BorderSide(color: Color(0x47FFFFFF), width: 2), bottom: BorderSide(color: Color(0x29000000), width: 2)))));
    return ClipRRect(borderRadius: BorderRadius.circular(widget.radius), child: Stack(fit: StackFit.expand, children: layers));
  }

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final reduce = aicdeReduceMotion(context);
    if (widget.indeterminate) {
      return LayoutBuilder(builder: (context, box) {
        final w = box.maxWidth * .35;
        return AnimatedBuilder(
          animation: _c,
          builder: (context, child) => Stack(children: [
            Positioned(left: reduce ? 0 : -w + (box.maxWidth + w) * _c.value, top: 0, bottom: 0, width: w, child: child!),
          ]),
          child: _fill(t),
        );
      });
    }
    return TweenAnimationBuilder<double>(
      tween: Tween(end: widget.value),
      duration: reduce ? Duration.zero : const Duration(milliseconds: 400),
      curve: t.curve,
      builder: (context, v, child) => FractionallySizedBox(alignment: Alignment.centerLeft, widthFactor: v.clamp(0, 1), child: child),
      child: _fill(t),
    );
  }
}

class _StripePainter extends CustomPainter {
  _StripePainter({required this.color, required this.gap});
  final Color color;
  final double gap;
  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()
      ..color = color
      ..strokeWidth = gap / 3;
    for (double x = -size.height; x < size.width + size.height; x += gap) {
      canvas.drawLine(Offset(x, size.height), Offset(x + size.height, 0), p);
    }
  }

  @override
  bool shouldRepaint(_StripePainter o) => o.color != color;
}

/// 環形進度，中間顯示百分比
class AicdeCircleProgress extends StatelessWidget {
  const AicdeCircleProgress({super.key, this.value = 0, this.size = 72, this.color = AicdeProgressColor.primary, this.label, this.semanticLabel});
  final double value, size;
  final AicdeProgressColor color;
  final String? label;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final v = value.clamp(0, 100).toDouble();
    final stroke = math.max(4.0, AicdeProgress.trackHeight(t) * .75).clamp(3.0, size / 6);
    final reduce = aicdeReduceMotion(context);
    return Semantics(
      label: semanticLabel,
      value: '${v.round()}%',
      child: SizedBox.square(
        dimension: size,
        child: TweenAnimationBuilder<double>(
          tween: Tween(end: v / 100),
          duration: reduce ? Duration.zero : const Duration(milliseconds: 500),
          curve: t.curve,
          builder: (context, p, _) => CustomPaint(
            painter: _RingPainter(
              progress: p.clamp(0, 1),
              color: _barColor(t, color),
              track: t.colors.surface2,
              outline: t.strokeAll ? t.strokeColor : null,
              width: stroke,
              cap: t.rPill == 0 ? StrokeCap.butt : StrokeCap.round,
              dashed: t.texture == AicdeTexture.corners || t.texture == AicdeTexture.notch,
            ),
            child: Center(child: Text(label ?? '${v.round()}%', style: t.number(size: size * .2))),
          ),
        ),
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  _RingPainter({required this.progress, required this.color, required this.track, required this.outline, required this.width, required this.cap, required this.dashed});
  final double progress, width;
  final Color color, track;
  final Color? outline;
  final StrokeCap cap;
  final bool dashed;

  @override
  void paint(Canvas canvas, Size size) {
    final rect = (Offset.zero & size).deflate(width / 2 + 1);
    final p = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = width;
    if (dashed) {
      const n = 40;
      for (var i = 0; i < n; i++) {
        canvas.drawArc(rect, -math.pi / 2 + i * math.pi * 2 / n, math.pi / n, false, p..color = track);
      }
    } else {
      canvas.drawOval(rect, p..color = track);
    }
    if (outline != null) {
      final o = Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5
        ..color = outline!;
      canvas.drawOval(rect.inflate(width / 2), o);
      canvas.drawOval(rect.deflate(width / 2), o);
    }
    if (progress > 0) canvas.drawArc(rect, -math.pi / 2, math.pi * 2 * progress, false, p..color = color..strokeCap = cap);
  }

  @override
  bool shouldRepaint(_RingPainter o) => o.progress != progress || o.color != color || o.track != track;
}
