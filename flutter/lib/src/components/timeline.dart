import 'package:flutter/material.dart';

import '../foundation/text.dart';
import '../theme/theme.dart';

enum AicdeTimelineStatus { normal, active, muted }

@immutable
class AicdeTimelineItem {
  const AicdeTimelineItem({required this.title, this.content, this.time, this.status = AicdeTimelineStatus.normal});
  final String title;
  final String? content;
  final String? time;
  final AicdeTimelineStatus status;
}

/// 時間軸
class AicdeTimeline extends StatelessWidget {
  const AicdeTimeline({super.key, required this.items});
  final List<AicdeTimelineItem> items;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    // 圓點形狀跟著主題圓角：方角主題用方點
    final dotRadius = t.rPill >= 999 ? 99.0 : t.rXs.toDouble();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (var i = 0; i < items.length; i++)
          IntrinsicHeight(
            child: Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              SizedBox(
                width: 22,
                child: Column(children: [
                  const SizedBox(height: 4),
                  Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: switch (items[i].status) {
                        AicdeTimelineStatus.active => t.primary,
                        AicdeTimelineStatus.muted => c.surface,
                        AicdeTimelineStatus.normal => c.navy,
                      },
                      borderRadius: BorderRadius.circular(dotRadius),
                      border: Border.all(
                        color: items[i].status == AicdeTimelineStatus.muted ? c.lineStrong : (t.strokeAll ? t.strokeColor : c.surface),
                        width: 2,
                      ),
                      boxShadow: [
                        if (items[i].status == AicdeTimelineStatus.active) BoxShadow(color: t.primary.withValues(alpha: .25), spreadRadius: 4),
                      ],
                    ),
                  ),
                  if (i < items.length - 1)
                    Expanded(
                      child: Container(
                        width: t.strokeAll ? t.strokeWidth : 2,
                        margin: const EdgeInsets.symmetric(vertical: 4),
                        color: t.strokeAll ? t.strokeColor : c.line,
                      ),
                    ),
                ]),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Padding(
                  padding: EdgeInsets.only(bottom: i < items.length - 1 ? 20 : 0),
                  child: Opacity(
                    opacity: items[i].status == AicdeTimelineStatus.muted ? .6 : 1,
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      if (items[i].time != null) Text(items[i].time!, style: t.number(size: 11, weight: FontWeight.w500, color: c.ink3)),
                      Text(items[i].title, style: t.heading(size: 14)),
                      if (items[i].content != null) Text(items[i].content!, style: t.body(size: 13, color: c.ink2)),
                    ]),
                  ),
                ),
              ),
            ]),
          ),
      ],
    );
  }
}
