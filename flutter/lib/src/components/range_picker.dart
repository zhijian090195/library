import 'package:flutter/widgets.dart';

import '../foundation/box.dart';
import 'calendar.dart';
import 'date_utils.dart';

/// 日期範圍 `(開始, 結束)`，格式 `YYYY-MM-DD`；尚未選完時結束為空字串
typedef AicdeDateRange = (String start, String end);

/// 日期範圍：點第一下設開始、第二下設結束；選了開始後滑鼠移動會預覽範圍。
class AicdeRangePicker extends StatefulWidget {
  const AicdeRangePicker({
    super.key,
    this.value,
    this.defaultValue = ('', ''),
    this.onChanged,
    this.defaultMonth,
    this.disabledDate,
    this.kind = AicdeBoxKind.panel,
  });

  final AicdeDateRange? value;
  final AicdeDateRange defaultValue;
  final ValueChanged<AicdeDateRange>? onChanged;
  final String? defaultMonth;
  final bool Function(String date)? disabledDate;
  final AicdeBoxKind kind;

  @override
  State<AicdeRangePicker> createState() => _AicdeRangePickerState();
}

class _AicdeRangePickerState extends State<AicdeRangePicker> {
  late AicdeDateRange _inner = widget.defaultValue;
  String _hover = '';
  late int _y, _m;
  int _dir = 0;

  AicdeDateRange get _range => widget.value ?? _inner;

  @override
  void initState() {
    super.initState();
    final init = aicdeParseDateKey(widget.defaultMonth) ?? aicdeParseDateKey(_range.$1) ?? DateTime.now();
    _y = init.year;
    _m = init.month;
  }

  void _move(int d) => setState(() {
        final n = DateTime(_y, _m + d, 1);
        _y = n.year;
        _m = n.month;
        _dir = d;
      });

  void _set(AicdeDateRange r) {
    if (widget.value == null) setState(() => _inner = r);
    widget.onChanged?.call(r);
  }

  void _pick(String k) {
    final (start, end) = _range;
    if (start.isEmpty || end.isNotEmpty || k.compareTo(start) < 0) {
      _set((k, ''));
    } else {
      _set((start, k));
    }
    setState(() => _hover = '');
  }

  @override
  Widget build(BuildContext context) {
    final (start, end) = _range;
    final shownEnd = end.isNotEmpty ? end : (start.isNotEmpty && _hover.compareTo(start) >= 0 ? _hover : '');
    return AicdeMonthFrame(
      year: _y,
      month: _m,
      direction: _dir,
      onMove: _move,
      kind: widget.kind,
      columnGap: 0,
      onExit: () => setState(() => _hover = ''),
      dayBuilder: (context, d, out) {
        final k = aicdeDateKey(d);
        final isStart = k == start;
        final isEnd = shownEnd.isNotEmpty && k == shownEnd;
        final inRange = start.isNotEmpty && shownEnd.isNotEmpty && k.compareTo(start) > 0 && k.compareTo(shownEnd) < 0;
        return AicdeDayCell(
          day: d,
          outside: out,
          selected: isStart || isEnd,
          inRange: inRange,
          joinRight: isStart && shownEnd.isNotEmpty && shownEnd != start,
          joinLeft: isEnd && !isStart,
          disabled: widget.disabledDate?.call(k) ?? false,
          onHover: start.isNotEmpty && end.isEmpty ? () => setState(() => _hover = k) : null,
          onTap: () => _pick(k),
        );
      },
    );
  }
}
