import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../foundation/box.dart';
import '../foundation/pressable.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';
import 'anchored_overlay.dart';

/// 級聯選項
@immutable
class AicdeCascaderOption {
  const AicdeCascaderOption(this.value, {this.label, this.children = const [], this.disabled = false});
  final String value;
  final String? label;
  final List<AicdeCascaderOption> children;
  final bool disabled;
  String get text => label ?? value;
  bool get isParent => children.isNotEmpty;
}

List<AicdeCascaderOption> _resolve(List<AicdeCascaderOption> opts, List<String> path) {
  final out = <AicdeCascaderOption>[];
  var level = opts;
  for (final v in path) {
    final hit = level.where((o) => o.value == v).firstOrNull;
    if (hit == null) break;
    out.add(hit);
    level = hit.children;
  }
  return out;
}

/// 級聯選擇（地區、分類）：一欄一層，選到最末層才確定。
///
/// 鍵盤：開啟後上下鍵移動、右鍵／Enter 進入下一層、左鍵回上一層、Esc 關閉。
class AicdeCascader extends StatefulWidget {
  const AicdeCascader({
    super.key,
    required this.options,
    this.value,
    this.initialValue = const [],
    this.onChanged,
    this.placeholder = '請選擇',
    this.enabled = true,
    this.separator = ' / ',
    this.semanticLabel,
  });

  final List<AicdeCascaderOption> options;

  /// 受控的路徑；null 時元件自己管理
  final List<String>? value;
  final List<String> initialValue;

  /// 回傳 value 路徑與對應的顯示文字
  final void Function(List<String> path, List<String> labels)? onChanged;
  final String placeholder;
  final bool enabled;
  final String separator;
  final String? semanticLabel;

  @override
  State<AicdeCascader> createState() => _AicdeCascaderState();
}

class _AicdeCascaderState extends State<AicdeCascader> {
  late List<String> _own = widget.initialValue;
  List<String> _active = const [];
  bool _open = false;
  final _trigger = FocusNode();
  final _panel = FocusNode(debugLabel: 'cascader-panel');

  /// 鍵盤游標：所在欄位與列
  int _col = 0, _row = 0;

  List<String> get _path => widget.value ?? _own;

  @override
  void dispose() {
    _trigger.dispose();
    _panel.dispose();
    super.dispose();
  }

  List<List<AicdeCascaderOption>> get _cols {
    final cols = [widget.options];
    for (final o in _resolve(widget.options, _active)) {
      if (o.isParent) cols.add(o.children);
    }
    return cols;
  }

  void _toggle() {
    setState(() {
      _active = List.of(_path);
      _open = !_open;
      _col = _active.isEmpty ? 0 : _active.length - 1;
      final list = _cols[_col.clamp(0, _cols.length - 1)];
      _row = _active.isEmpty ? 0 : list.indexWhere((o) => o.value == _active[_col]).clamp(0, list.length - 1);
    });
    if (_open) WidgetsBinding.instance.addPostFrameCallback((_) => _panel.requestFocus());
  }

  void _close({bool refocus = true}) {
    setState(() => _open = false);
    if (refocus) _trigger.requestFocus();
  }

  void _choose(int depth, AicdeCascaderOption o) {
    if (o.disabled) return;
    final next = [..._active.take(depth), o.value];
    setState(() {
      _active = next;
      _col = depth;
      _row = _cols[depth].indexOf(o);
    });
    if (!o.isParent) {
      final labels = _resolve(widget.options, next).map((e) => e.text).toList();
      if (widget.value == null) setState(() => _own = next);
      widget.onChanged?.call(next, labels);
      _close();
    }
  }

  KeyEventResult _onKey(FocusNode n, KeyEvent e) {
    if (e is! KeyDownEvent && e is! KeyRepeatEvent) return KeyEventResult.ignored;
    final cols = _cols;
    final list = cols[_col];
    final k = e.logicalKey;
    if (k == LogicalKeyboardKey.arrowDown || k == LogicalKeyboardKey.arrowUp) {
      setState(() => _row = (_row + (k == LogicalKeyboardKey.arrowDown ? 1 : -1)).clamp(0, list.length - 1));
      return KeyEventResult.handled;
    }
    if (k == LogicalKeyboardKey.arrowRight || k == LogicalKeyboardKey.enter || k == LogicalKeyboardKey.space) {
      final o = list[_row];
      if (o.isParent && !o.disabled) {
        setState(() {
          _active = [..._active.take(_col), o.value];
          _col++;
          _row = 0;
        });
      } else if (k != LogicalKeyboardKey.arrowRight) {
        _choose(_col, o);
      }
      return KeyEventResult.handled;
    }
    if (k == LogicalKeyboardKey.arrowLeft && _col > 0) {
      setState(() {
        _col--;
        _row = cols[_col].indexWhere((o) => o.value == _active[_col]).clamp(0, cols[_col].length - 1);
        _active = _active.take(_col + 1).toList();
      });
      return KeyEventResult.handled;
    }
    if (k == LogicalKeyboardKey.escape) {
      _close();
      return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final chosen = _resolve(widget.options, _path);
    final text = chosen.isEmpty ? widget.placeholder : chosen.map((e) => e.text).join(widget.separator);
    final cols = _cols;

    return AicdeAnchoredOverlay(
      open: _open,
      matchWidth: false,
      onDismiss: () => _close(refocus: false),
      overlayBuilder: (ctx, w) => Focus(
        focusNode: _panel,
        onKeyEvent: _onKey,
        child: IntrinsicHeight(
          child: Row(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (var d = 0; d < cols.length; d++) ...[
                if (d > 0) Container(width: 1, margin: const EdgeInsets.symmetric(horizontal: 4), color: c.line),
                ConstrainedBox(
                  constraints: const BoxConstraints(minWidth: 140, maxWidth: 200, maxHeight: 260),
                  child: SingleChildScrollView(
                    child: Semantics(
                      container: true,
                      label: '第 ${d + 1} 層',
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          for (var i = 0; i < cols[d].length; i++)
                            _optionAt(d, i, cols[d][i]),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
      child: Semantics(
        label: widget.semanticLabel,
        value: chosen.isEmpty ? null : text,
        expanded: _open,
        child: AicdePressable(
          focusNode: _trigger,
          onTap: widget.enabled ? _toggle : null,
          builder: (context, s) => AicdeBox(
            kind: AicdeBoxKind.field,
            states: AicdeStates(focused: s.focused || _open, hovered: s.hovered, disabled: s.disabled),
            height: t.controlHeight,
            padding: const EdgeInsets.only(left: 12, right: 8),
            child: Row(children: [
              Flexible(
                fit: FlexFit.tight,
                child: Text(text,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: t.body(size: 14, color: chosen.isEmpty ? c.ink3 : c.inkBody).copyWith(height: 1.2)),
              ),
              AicdeOverlayChevron(open: _open, color: c.ink2),
            ]),
          ),
        ),
      ),
    );
  }

  Widget _optionAt(int d, int i, AicdeCascaderOption o) {
    final on = d < _active.length && _active[d] == o.value;
    return Semantics(
      selected: !o.isParent && on,
      expanded: o.isParent ? on : null,
      button: true,
      child: AicdeOptionRow(
        selected: on,
        active: _panel.hasFocus && d == _col && i == _row,
        onTap: o.disabled ? null : () => _choose(d, o),
        trailing: o.isParent ? const Icon(Icons.chevron_right_rounded) : null,
        child: Text(o.text, maxLines: 1, overflow: TextOverflow.ellipsis),
      ),
    );
  }
}
