import 'package:flutter/material.dart';

import '../foundation/text.dart';
import '../theme/theme.dart';

enum AicdeTrendDirection { up, down }

enum AicdeTrendTone { good, bad }

/// 統計卡的趨勢
@immutable
class AicdeStatisticTrend {
  const AicdeStatisticTrend({required this.value, this.direction = AicdeTrendDirection.up, this.tone});
  final String value;
  final AicdeTrendDirection direction;

  /// 預設：往上 = 好、往下 = 不好
  final AicdeTrendTone? tone;
}

/// 統計數字：預設會從 0 數到 [value]（減少動態時直接顯示）。
class AicdeStatistic extends StatelessWidget {
  const AicdeStatistic({
    super.key,
    required this.label,
    required this.value,
    this.decimals = 0,
    this.prefix,
    this.suffix,
    this.trend,
    this.animate = true,
    this.duration = const Duration(milliseconds: 900),
    this.formatter,
  });

  final String label;
  final num value;
  final int decimals;
  final String? prefix;
  final String? suffix;
  final AicdeStatisticTrend? trend;
  final bool animate;
  final Duration duration;
  final String Function(num value)? formatter;

  /// 千分位格式
  static String format(num n, int decimals) {
    final neg = n < 0;
    final s = n.abs().toStringAsFixed(decimals);
    final parts = s.split('.');
    final buf = StringBuffer();
    final i = parts[0];
    for (var k = 0; k < i.length; k++) {
      if (k > 0 && (i.length - k) % 3 == 0) buf.write(',');
      buf.write(i[k]);
    }
    return '${neg ? '-' : ''}$buf${parts.length > 1 ? '.${parts[1]}' : ''}';
  }

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final fmt = formatter ?? (n) => format(n, decimals);
    final good = trend == null
        ? true
        : (trend!.tone ?? (trend!.direction == AicdeTrendDirection.up ? AicdeTrendTone.good : AicdeTrendTone.bad)) == AicdeTrendTone.good;
    return Semantics(
      label: '$label ${prefix ?? ''}${fmt(value)}${suffix ?? ''}',
      child: ExcludeSemantics(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(t.labelText(label), style: t.caption(size: 12).copyWith(letterSpacing: t.upperLabels ? .6 : 0)),
            const SizedBox(height: 6),
            Row(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                if (prefix != null) Text(prefix!, style: t.number(size: 16, color: c.ink2)),
                TweenAnimationBuilder<double>(
                  tween: Tween(begin: animate && !reduce ? 0 : value.toDouble(), end: value.toDouble()),
                  duration: animate && !reduce ? duration : Duration.zero,
                  curve: Curves.easeOutCubic,
                  builder: (context, v, _) => Text(fmt(v), style: t.number(size: 28, weight: FontWeight.w700).copyWith(fontFamily: t.tabularNumbers ? t.monoFamily : t.headingFamily)),
                ),
                if (suffix != null) Padding(padding: const EdgeInsets.only(left: 4), child: Text(suffix!, style: t.number(size: 14, color: c.ink2))),
              ],
            ),
            if (trend != null) ...[
              const SizedBox(height: 4),
              Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(trend!.direction == AicdeTrendDirection.up ? Icons.arrow_upward : Icons.arrow_downward,
                    size: 14, color: good ? c.success : c.danger),
                const SizedBox(width: 2),
                Text(trend!.value, style: t.number(size: 12, color: good ? c.success : c.danger)),
              ]),
            ],
          ],
        ),
      ),
    );
  }
}
