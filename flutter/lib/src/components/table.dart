import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/pressable.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';

enum AicdeColumnAlign { left, right }

/// 表格欄位
@immutable
class AicdeTableColumn<T> {
  const AicdeTableColumn({
    required this.key,
    required this.title,
    this.value,
    this.render,
    this.align = AicdeColumnAlign.left,
    this.width,
    this.flex = 1,
    this.sortable = false,
    this.sortValue,
  });

  final String key;
  final String title;

  /// 取值（顯示與排序用）
  final Object? Function(T row)? value;

  /// 自訂儲存格
  final Widget Function(T row, int index)? render;
  final AicdeColumnAlign align;

  /// 固定寬度；不給時用 [flex] 分配
  final double? width;
  final int flex;
  final bool sortable;
  final Comparable<Object?>? Function(T row)? sortValue;
}

/// 表格：排序（點表頭）、勾選列、斑馬紋、滑過列。
///
/// 選取可受控（[selectedKeys] + [onSelectionChange]）或不受控（[defaultSelectedKeys]）。
class AicdeTable<T> extends StatefulWidget {
  const AicdeTable({
    super.key,
    required this.columns,
    required this.rows,
    required this.rowKey,
    this.striped = false,
    this.hover = true,
    this.compact = false,
    this.empty = '沒有資料',
    this.selectable = false,
    this.selectedKeys,
    this.defaultSelectedKeys = const [],
    this.onSelectionChange,
    this.onRowTap,
  });

  final List<AicdeTableColumn<T>> columns;
  final List<T> rows;
  final String Function(T row) rowKey;
  final bool striped, hover, compact;
  final String empty;
  final bool selectable;
  final List<String>? selectedKeys;
  final List<String> defaultSelectedKeys;
  final ValueChanged<List<String>>? onSelectionChange;
  final void Function(T row)? onRowTap;

  @override
  State<AicdeTable<T>> createState() => _AicdeTableState<T>();
}

class _AicdeTableState<T> extends State<AicdeTable<T>> {
  String? _sortKey;
  bool _asc = true;
  late List<String> _innerSel = [...widget.defaultSelectedKeys];
  List<String> get _sel => widget.selectedKeys ?? _innerSel;

  void _setSel(List<String> next) {
    if (widget.selectedKeys == null) setState(() => _innerSel = next);
    widget.onSelectionChange?.call(next);
  }

  void _sortBy(String key) => setState(() {
    if (_sortKey == key) {
      if (_asc) {
        _asc = false;
      } else {
        _sortKey = null;
      }
    } else {
      _sortKey = key;
      _asc = true;
    }
  });

  List<T> get _sorted {
    if (_sortKey == null) return widget.rows;
    final col = widget.columns.firstWhere((c) => c.key == _sortKey);
    Object? v(T r) => col.sortValue?.call(r) ?? col.value?.call(r);
    final list = [...widget.rows];
    list.sort((a, b) {
      final x = v(a), y = v(b);
      int r;
      if (x is num && y is num) {
        r = x.compareTo(y);
      } else {
        r = '${x ?? ''}'.compareTo('${y ?? ''}');
      }
      return _asc ? r : -r;
    });
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final rows = _sorted;
    final keys = widget.rows.map(widget.rowKey).toList();
    final allSel = keys.isNotEmpty && keys.every(_sel.contains);
    final someSel = keys.any(_sel.contains);
    final vPad = widget.compact || t.controlHeight < 40 ? 8.0 : 12.0;
    final line = t.strokeAll ? t.strokeColor : c.line;

    Widget cell(AicdeTableColumn<T> col, Widget child) {
      final aligned = Align(
        alignment: col.align == AicdeColumnAlign.right
            ? Alignment.centerRight
            : Alignment.centerLeft,
        child: child,
      );
      return col.width != null
          ? SizedBox(width: col.width, child: aligned)
          : Expanded(flex: col.flex, child: aligned);
    }

    // 醫療主題要 44px 以上的點擊範圍，其他主題用緊湊尺寸
    final roomy = t.controlHeight >= 44;
    Widget check(bool? v, ValueChanged<bool?> on, String label) => SizedBox(
      width: roomy ? 48 : 40,
      // MergeSemantics：讓「名稱」和勾選框本身合成同一個讀屏節點
      child: MergeSemantics(
        child: Semantics(
          label: label,
          child: Checkbox(
            value: v,
            tristate: v == null,
            onChanged: on,
            visualDensity: roomy
                ? VisualDensity.standard
                : VisualDensity.compact,
          ),
        ),
      ),
    );
    String rowName(T row, int i) {
      final first = widget.columns.firstOrNull?.value?.call(row);
      return first == null || '$first'.isEmpty ? '第 ${i + 1} 列' : '$first';
    }

    final header = Container(
      color: c.surface2,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      constraints: BoxConstraints(minHeight: widget.compact ? 36 : 42),
      child: Row(
        children: [
          if (widget.selectable)
            check(
              allSel ? true : (someSel ? null : false),
              (_) => _setSel(allSel ? [] : keys),
              '全選',
            ),
          for (final col in widget.columns)
            cell(
              col,
              col.sortable
                  ? AicdePressable(
                      onTap: () => _sortBy(col.key),
                      semanticLabel: col.title,
                      // 對應 aria-sort：念出目前排序狀態，提示按下會怎樣
                      semanticValue: _sortKey != col.key
                          ? '未排序'
                          : (_asc ? '遞增排序' : '遞減排序'),
                      semanticHint: '按下切換排序',
                      builder: (context, s) => Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 4,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(t.rXs),
                          color: s.hovered || s.focused
                              ? c.line
                              : Colors.transparent,
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              t.labelText(col.title),
                              style: t.label(
                                size: 12,
                                color: _sortKey == col.key ? c.ink : c.ink2,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Icon(
                              _sortKey != col.key
                                  ? Icons.unfold_more
                                  : (_asc
                                        ? Icons.arrow_upward
                                        : Icons.arrow_downward),
                              size: 14,
                              color: _sortKey == col.key ? t.primary : c.ink3,
                            ),
                          ],
                        ),
                      ),
                    )
                  : Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: Text(
                        t.labelText(col.title),
                        style: t.label(size: 12, color: c.ink2),
                      ),
                    ),
            ),
        ],
      ),
    );

    return AicdeBox(
      kind: AicdeBoxKind.panel,
      clip: true,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          header,
          if (rows.isEmpty)
            Padding(
              padding: const EdgeInsets.all(28),
              child: Text(
                widget.empty,
                textAlign: TextAlign.center,
                style: t.caption(size: 13),
              ),
            ),
          for (var i = 0; i < rows.length; i++)
            _TableRow(
              key: ValueKey(widget.rowKey(rows[i])),
              hover: widget.hover,
              selected: _sel.contains(widget.rowKey(rows[i])),
              striped: widget.striped && i.isOdd,
              line: line,
              onTap: widget.onRowTap == null
                  ? null
                  : () => widget.onRowTap!(rows[i]),
              child: Padding(
                padding: EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: widget.selectable ? vPad - 6 : vPad,
                ),
                child: Row(
                  children: [
                    if (widget.selectable)
                      Builder(
                        builder: (context) {
                          final k = widget.rowKey(rows[i]);
                          final on = _sel.contains(k);
                          return check(
                            on,
                            (_) => _setSel(
                              on
                                  ? _sel.where((e) => e != k).toList()
                                  : [..._sel, k],
                            ),
                            '選取 ${rowName(rows[i], i)}',
                          );
                        },
                      ),
                    for (final col in widget.columns)
                      cell(
                        col,
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child:
                              col.render?.call(rows[i], i) ??
                              Text(
                                '${col.value?.call(rows[i]) ?? ''}',
                                style: col.value?.call(rows[i]) is num
                                    ? t.number(
                                        size: 13,
                                        weight: FontWeight.w500,
                                        color: c.inkBody,
                                      )
                                    : t.body(size: 13),
                              ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _TableRow extends StatefulWidget {
  const _TableRow({
    super.key,
    required this.child,
    required this.hover,
    required this.selected,
    required this.striped,
    required this.line,
    this.onTap,
  });
  final Widget child;
  final bool hover, selected, striped;
  final Color line;
  final VoidCallback? onTap;

  @override
  State<_TableRow> createState() => _TableRowState();
}

class _TableRowState extends State<_TableRow> {
  bool _h = false;
  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final bg = widget.selected
        ? (t.selectionBg.a == 0
              ? c.surface2
              : t.selectionBg.withValues(alpha: t.selectionBg.a.clamp(0, .16)))
        : (widget.hover && _h
              ? c.surface2
              : (widget.striped
                    ? c.surface2.withValues(alpha: .5)
                    : Colors.transparent));
    return MouseRegion(
      onEnter: (_) => setState(() => _h = true),
      onExit: (_) => setState(() => _h = false),
      cursor: widget.onTap != null
          ? SystemMouseCursors.click
          : MouseCursor.defer,
      child: GestureDetector(
        onTap: widget.onTap,
        behavior: HitTestBehavior.opaque,
        child: Container(
          decoration: BoxDecoration(
            color: bg,
            border: Border(
              top: BorderSide(
                color: widget.line,
                width: t.strokeAll ? t.strokeWidth : 1,
              ),
            ),
          ),
          child: widget.child,
        ),
      ),
    );
  }
}
