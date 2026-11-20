import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../foundation/box.dart';
import '../../foundation/text.dart';
import '../../theme/theme.dart';
import '../../theme/tokens.dart';
import 'menu_row.dart';

@immutable
class AicdeStepItem {
  const AicdeStepItem({required this.title, this.description});
  final String title;
  final String? description;
}

enum AicdeStepsDirection { horizontal, vertical }

/// 步驟條。[current] 之前的步驟為已完成，[current] 為進行中。
///
/// [direction] 為 null 時依寬度自動切換（每步不足 120px 就改直向）。
class AicdeSteps extends StatelessWidget {
  const AicdeSteps({super.key, required this.items, this.current = 0, this.direction});
  final List<AicdeStepItem> items;
  final int current;
  final AicdeStepsDirection? direction;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, box) {
      final vertical = direction == AicdeStepsDirection.vertical ||
          (direction == null && box.maxWidth.isFinite && box.maxWidth / math.max(1, items.length) < 120);
      final t = AicdeTheme.of(context);
      if (vertical) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            for (var i = 0; i < items.length; i++)
              IntrinsicHeight(
                child: Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                  Column(children: [
                    _Dot(index: i, current: current),
                    if (i < items.length - 1)
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: _Line(done: i < current, vertical: true),
                        ),
                      ),
                  ]),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Padding(
                      padding: EdgeInsets.only(top: 4, bottom: i < items.length - 1 ? 18 : 0),
                      child: _Text(item: items[i], index: i, current: current, t: t),
                    ),
                  ),
                ]),
              ),
          ],
        );
      }
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (var i = 0; i < items.length; i++)
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(right: 12),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    _Dot(index: i, current: current),
                    if (i < items.length - 1)
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.only(left: 8),
                          child: _Line(done: i < current),
                        ),
                      ),
                  ]),
                  const SizedBox(height: 8),
                  _Text(item: items[i], index: i, current: current, t: t),
                ]),
              ),
            ),
        ],
      );
    });
  }
}

class _Dot extends StatelessWidget {
  const _Dot({required this.index, required this.current});
  final int index, current;
  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final done = index < current, now = index == current;
    return ExcludeSemantics(
      child: AicdeBox(
        kind: AicdeBoxKind.chip,
        emphasis: done || now ? AicdeEmphasis.solid : AicdeEmphasis.outline,
        fill: done ? t.secondary : (now ? t.primary : c.surface),
        width: 30,
        height: 30,
        alignment: Alignment.center,
        child: done
            ? Icon(Icons.check_rounded, size: 17, color: t.onSecondary)
            : Text('${index + 1}', style: t.number(size: 13, weight: FontWeight.w700, color: now ? t.onPrimary : c.ink3)),
      ),
    );
  }
}

class _Line extends StatelessWidget {
  const _Line({required this.done, this.vertical = false});
  final bool done, vertical;
  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final w = math.max(2.0, t.strokeWidth);
    return AnimatedContainer(
      duration: navMotion(context, 1.6),
      width: vertical ? w : null,
      height: vertical ? null : w,
      decoration: BoxDecoration(
        color: done ? t.primary : t.colors.line,
        borderRadius: BorderRadius.circular(t.rXs),
      ),
    );
  }
}

class _Text extends StatelessWidget {
  const _Text({required this.item, required this.index, required this.current, required this.t});
  final AicdeStepItem item;
  final int index, current;
  final AicdeTokens t;
  @override
  Widget build(BuildContext context) {
    final c = t.colors;
    final status = index < current ? '已完成' : (index == current ? '進行中' : '未開始');
    return Semantics(
      label: '步驟 ${index + 1}，$status',
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
        Text(
          item.title,
          style: t.body(size: 14, color: index <= current ? c.ink : c.ink3)
              .copyWith(fontWeight: index == current ? FontWeight.w700 : FontWeight.w500, height: 1.4),
        ),
        if (item.description != null) ...[
          const SizedBox(height: 2),
          Text(item.description!, style: t.caption()),
        ],
      ]),
    );
  }
}
