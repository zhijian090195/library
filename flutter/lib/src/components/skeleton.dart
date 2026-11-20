import 'package:flutter/widgets.dart';

import '../theme/theme.dart';
import 'feedback_common.dart';

enum AicdeSkeletonVariant { text, title, circle, block }

/// 載入骨架，帶一道掃過的微光（減少動態時不動）
class AicdeSkeleton extends StatefulWidget {
  const AicdeSkeleton({super.key, this.variant = AicdeSkeletonVariant.text, this.width, this.height});
  final AicdeSkeletonVariant variant;
  final double? width, height;

  @override
  State<AicdeSkeleton> createState() => _AicdeSkeletonState();
}

class _AicdeSkeletonState extends State<AicdeSkeleton> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400));

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (aicdeReduceMotion(context)) {
      _c.stop();
    } else if (!_c.isAnimating) {
      _c.repeat();
    }
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final (w, h) = switch (widget.variant) {
      AicdeSkeletonVariant.text => (widget.width, widget.height ?? 12.0),
      AicdeSkeletonVariant.title => (widget.width ?? 180.0, widget.height ?? 18.0),
      AicdeSkeletonVariant.circle => (widget.width ?? 40.0, widget.height ?? widget.width ?? 40.0),
      AicdeSkeletonVariant.block => (widget.width, widget.height ?? 96.0),
    };
    final r = widget.variant == AicdeSkeletonVariant.circle ? 999.0 : (widget.variant == AicdeSkeletonVariant.block ? t.rMd : t.rSm);
    final base = t.colors.surface2;
    final hi = Color.lerp(base, t.colors.surface, .7)!;
    return ExcludeSemantics(
      child: SizedBox(
        width: w ?? double.infinity,
        height: h,
        child: AnimatedBuilder(
          animation: _c,
          builder: (context, _) {
            final x = -1.5 + _c.value * 3;
            return DecoratedBox(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(widget.variant == AicdeSkeletonVariant.circle ? h / 2 : r.clamp(0, h / 2)),
                gradient: LinearGradient(
                  begin: Alignment(x - .5, 0),
                  end: Alignment(x + .5, 0),
                  colors: [base, _c.isAnimating ? hi : base, base],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

/// 多個骨架的垂直排列
class AicdeSkeletonGroup extends StatelessWidget {
  const AicdeSkeletonGroup({super.key, required this.children, this.gap = 10});
  final List<Widget> children;
  final double gap;

  @override
  Widget build(BuildContext context) => Semantics(
        label: '載入中',
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
          for (var i = 0; i < children.length; i++) ...[if (i > 0) SizedBox(height: gap), children[i]],
        ]),
      );
}
