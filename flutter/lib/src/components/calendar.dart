import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/pressable.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';
import 'button.dart';
import 'date_utils.dart';

/// 月曆／範圍選擇共用的外框：月份標題、上下月按鈕、星期列，切換月份時日期格朝方向滑入。
class AicdeMonthFrame extends StatelessWidget {
  const AicdeMonthFrame({
    super.key,
    required this.year,
    required this.month,
    required this.direction,
    required this.onMove,
    required this.dayBuilder,
    this.columnGap = 2,
    this.kind = AicdeBoxKind.panel,
    this.onExit,
  });

  final int year, month;

  /// 1 = 往下個月、-1 = 往上個月、0 = 不動畫
  final int direction;
  final ValueChanged<int> onMove;
  final Widget Function(BuildContext context, DateTime day, bool outside)
  dayBuilder;
  final double columnGap;
  final AicdeBoxKind kind;
  final VoidCallback? onExit;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final days = aicdeMonthGrid(year, month);

    Widget grid = Column(
      key: ValueKey(year * 12 + month),
      mainAxisSize: MainAxisSize.min,
      children: [
        for (var r = 0; r < 6; r++)
          Padding(
            padding: EdgeInsets.only(top: r == 0 ? 0 : 2),
            child: Row(
              children: [
                for (var i = 0; i < 7; i++) ...[
                  if (i > 0) SizedBox(width: columnGap),
                  Expanded(
                    child: AspectRatio(
                      aspectRatio: 1,
                      child: dayBuilder(
                        context,
                        days[r * 7 + i],
                        days[r * 7 + i].month != month,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
      ],
    );

    return AicdeBox(
      kind: kind,
      width: 304,
      padding: const EdgeInsets.all(16),
      clip: true,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              AicdeButton(
                semanticLabel: '上個月',
                icon: const Icon(Icons.chevron_left),
                variant: AicdeButtonVariant.ghost,
                size: AicdeButtonSize.sm,
                onPressed: () => onMove(-1),
              ),
              Expanded(
                child: Semantics(
                  liveRegion: true,
                  child: Text(
                    '$year 年 $month 月',
                    textAlign: TextAlign.center,
                    style: t.number(
                      size: 14,
                      weight: FontWeight.w600,
                      color: c.ink,
                    ),
                  ),
                ),
              ),
              AicdeButton(
                semanticLabel: '下個月',
                icon: const Icon(Icons.chevron_right),
                variant: AicdeButtonVariant.ghost,
                size: AicdeButtonSize.sm,
                onPressed: () => onMove(1),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ExcludeSemantics(
            child: Row(
              children: [
                for (final w in aicdeWeekLabels)
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: Text(
                        w,
                        textAlign: TextAlign.center,
                        style: t.caption(size: 12, color: c.ink3),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 4),
          MouseRegion(
            onExit: onExit == null ? null : (_) => onExit!(),
            child: AnimatedSwitcher(
              duration: reduce || direction == 0
                  ? Duration.zero
                  : const Duration(milliseconds: 260),
              switchInCurve: t.curve,
              layoutBuilder: (cur, prev) => Stack(
                alignment: Alignment.topCenter,
                children: [...prev, ?cur],
              ),
              transitionBuilder: (child, anim) {
                final incoming = child.key == ValueKey(year * 12 + month);
                final from = (incoming ? direction : -direction) * .25;
                return FadeTransition(
                  opacity: anim,
                  child: SlideTransition(
                    position: Tween(
                      begin: Offset(from, 0),
                      end: Offset.zero,
                    ).animate(anim),
                    child: child,
                  ),
                );
              },
              child: grid,
            ),
          ),
        ],
      ),
    );
  }
}

/// 日期格（月曆與範圍選擇共用）
class AicdeDayCell extends StatelessWidget {
  const AicdeDayCell({
    super.key,
    required this.day,
    required this.outside,
    required this.onTap,
    this.selected = false,
    this.inRange = false,
    this.joinLeft = false,
    this.joinRight = false,
    this.disabled = false,
    this.onHover,
    this.child,
  });

  final DateTime day;
  final bool outside, selected, inRange, joinLeft, joinRight, disabled;
  final VoidCallback onTap;
  final VoidCallback? onHover;
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final isToday = aicdeDateKey(day) == aicdeDateKey(DateTime.now());
    return Semantics(
      label: '${day.month} 月 ${day.day} 日',
      selected: selected,
      child: MouseRegion(
        onEnter: onHover == null ? null : (_) => onHover!(),
        child: AicdePressable(
          onTap: disabled ? null : onTap,
          selected: selected,
          builder: (context, s) => LayoutBuilder(
            builder: (context, box) {
              final full = math.min(t.rPill, box.maxWidth / 2);
              final r = Radius.circular(full);
              final radius = inRange && !selected
                  ? BorderRadius.zero
                  : BorderRadius.horizontal(
                      left: joinLeft ? Radius.zero : r,
                      right: joinRight ? Radius.zero : r,
                    );
              final bg = selected
                  ? t.primary
                  : inRange
                  ? t.primary.withValues(alpha: .12)
                  : s.hovered
                  ? c.surface2
                  : const Color(0x00000000);
              final fg = selected ? t.onPrimary : c.inkBody;
              final border = s.focused
                  ? Border.all(color: t.focusColor, width: 2)
                  : isToday && !selected
                  ? Border.all(color: c.band, width: 1.5)
                  : null;
              return AnimatedScale(
                scale: s.pressed ? .9 : 1,
                duration:
                    (MediaQuery.maybeDisableAnimationsOf(context) ?? false)
                    ? Duration.zero
                    : t.motion,
                child: AnimatedContainer(
                  duration: t.motion,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: bg,
                    borderRadius: radius,
                    border: border,
                  ),
                  child: Opacity(
                    opacity: outside && !selected ? .55 : 1,
                    child: DefaultTextStyle.merge(
                      style: t.number(
                        size: 14,
                        weight: selected || isToday
                            ? FontWeight.w600
                            : FontWeight.w400,
                        color: outside && !selected ? c.ink3 : fg,
                      ),
                      child: child ?? Text('${day.day}'),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

/// 月曆。日期格式 `YYYY-MM-DD`。
///
/// ```dart
/// AicdeCalendar(value: date, onChanged: (d) => setState(() => date = d))
/// ```
/// 不傳 [value] 時為非受控，以 [defaultValue] 起始。
class AicdeCalendar extends StatefulWidget {
  const AicdeCalendar({
    super.key,
    this.value,
    this.defaultValue = '',
    this.onChanged,
    this.defaultMonth,
    this.disabledDate,
    this.dayBuilder,
    this.kind = AicdeBoxKind.panel,
  });

  final String? value;
  final String defaultValue;
  final ValueChanged<String>? onChanged;

  /// 一開始顯示的月份（任一天），預設為選取日或今天
  final String? defaultMonth;

  /// 回傳 true 的日期不可點
  final bool Function(String date)? disabledDate;

  /// 自訂日期格內容
  final Widget Function(DateTime date, String key)? dayBuilder;

  /// 外框類型；放在彈出層時用 [AicdeBoxKind.overlay]
  final AicdeBoxKind kind;

  @override
  State<AicdeCalendar> createState() => _AicdeCalendarState();
}

class _AicdeCalendarState extends State<AicdeCalendar> {
  late String _inner = widget.defaultValue;
  late int _y, _m;
  int _dir = 0;

  String get _sel => widget.value ?? _inner;

  @override
  void initState() {
    super.initState();
    final init =
        aicdeParseDateKey(widget.defaultMonth) ??
        aicdeParseDateKey(_sel) ??
        DateTime.now();
    _y = init.year;
    _m = init.month;
  }

  void _move(int d) => setState(() {
    final n = DateTime(_y, _m + d, 1);
    _y = n.year;
    _m = n.month;
    _dir = d;
  });

  void _pick(DateTime d, bool outside) {
    final k = aicdeDateKey(d);
    if (widget.value == null) setState(() => _inner = k);
    widget.onChanged?.call(k);
    if (outside) _move(d.isBefore(DateTime(_y, _m, 1)) ? -1 : 1);
  }

  @override
  Widget build(BuildContext context) {
    return AicdeMonthFrame(
      year: _y,
      month: _m,
      direction: _dir,
      onMove: _move,
      kind: widget.kind,
      dayBuilder: (context, d, out) {
        final k = aicdeDateKey(d);
        return AicdeDayCell(
          day: d,
          outside: out,
          selected: k == _sel,
          disabled: widget.disabledDate?.call(k) ?? false,
          onTap: () => _pick(d, out),
          child: widget.dayBuilder?.call(d, k),
        );
      },
    );
  }
}
