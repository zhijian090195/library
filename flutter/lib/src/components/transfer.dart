import 'dart:async';

import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/pressable.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';
import '../theme/tokens.dart';
import 'button.dart';

/// 穿梭框的項目
@immutable
class AicdeTransferItem {
  const AicdeTransferItem(this.value, {this.label, this.disabled = false});
  final String value;
  final String? label;
  final bool disabled;
  String get text => label ?? value;
}

/// 穿梭框：勾選後用中間按鈕移到另一邊；剛移過去的項目會短暫亮起。
class AicdeTransfer extends StatefulWidget {
  const AicdeTransfer({
    super.key,
    required this.items,
    this.value,
    this.initialValue = const [],
    this.onChanged,
    this.titles = const ('可選', '已選'),
    this.listWidth = 200,
    this.listHeight = 220,
  });

  final List<AicdeTransferItem> items;

  /// 受控的右側（已選）值；null 時元件自己管理
  final List<String>? value;
  final List<String> initialValue;
  final ValueChanged<List<String>>? onChanged;
  final (String, String) titles;
  final double listWidth, listHeight;

  @override
  State<AicdeTransfer> createState() => _AicdeTransferState();
}

class _AicdeTransferState extends State<AicdeTransfer> {
  late List<String> _own = List.of(widget.initialValue);
  List<String> _checkL = [], _checkR = [], _fresh = [];
  Timer? _freshTimer;

  List<String> get _right => widget.value ?? _own;

  @override
  void dispose() {
    _freshTimer?.cancel();
    super.dispose();
  }

  void _move(List<String> next, List<String> moved) {
    if (widget.value == null) _own = next;
    widget.onChanged?.call(next);
    _freshTimer?.cancel();
    setState(() {
      _fresh = moved;
      _checkL = [];
      _checkR = [];
    });
    _freshTimer = Timer(const Duration(milliseconds: 900), () {
      if (mounted) setState(() => _fresh = []);
    });
  }

  @override
  Widget build(BuildContext context) {
    final right = _right;
    final leftList = widget.items
        .where((o) => !right.contains(o.value))
        .toList();
    final rightList = widget.items
        .where((o) => right.contains(o.value))
        .toList();
    final toRight = _checkL
        .where((v) => leftList.any((o) => o.value == v))
        .toList();
    final toLeft = _checkR
        .where((v) => rightList.any((o) => o.value == v))
        .toList();

    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: 10,
      runSpacing: 10,
      children: [
        _List(
          title: widget.titles.$1,
          list: leftList,
          checked: _checkL,
          fresh: _fresh,
          width: widget.listWidth,
          height: widget.listHeight,
          onChanged: (v) => setState(() => _checkL = v),
        ),
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AicdeButton(
              semanticLabel: '移到右邊',
              icon: const Icon(Icons.chevron_right_rounded),
              size: AicdeButtonSize.sm,
              onPressed: toRight.isEmpty
                  ? null
                  : () => _move([...right, ...toRight], toRight),
            ),
            const SizedBox(height: 8),
            AicdeButton(
              semanticLabel: '移到左邊',
              icon: const Icon(Icons.chevron_left_rounded),
              size: AicdeButtonSize.sm,
              onPressed: toLeft.isEmpty
                  ? null
                  : () => _move(
                      right.where((v) => !toLeft.contains(v)).toList(),
                      toLeft,
                    ),
            ),
          ],
        ),
        _List(
          title: widget.titles.$2,
          list: rightList,
          checked: _checkR,
          fresh: _fresh,
          width: widget.listWidth,
          height: widget.listHeight,
          onChanged: (v) => setState(() => _checkR = v),
        ),
      ],
    );
  }
}

class _List extends StatelessWidget {
  const _List({
    required this.title,
    required this.list,
    required this.checked,
    required this.fresh,
    required this.onChanged,
    required this.width,
    required this.height,
  });
  final String title;
  final List<AicdeTransferItem> list;
  final List<String> checked, fresh;
  final ValueChanged<List<String>> onChanged;
  final double width, height;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final pick = list.where((o) => !o.disabled).map((o) => o.value).toList();
    final on = checked.where(pick.contains).toList();
    final all = pick.isNotEmpty && on.length == pick.length;
    final some = on.isNotEmpty && !all;

    return AicdeBox(
      kind: AicdeBoxKind.panel,
      width: width,
      height: height,
      clip: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            height: 40,
            padding: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              color: c.surface2,
              border: Border(bottom: BorderSide(color: c.line)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: _CheckRow(
                    label: Text(
                      t.labelText(title),
                      style: t.label(size: 13, color: c.ink),
                    ),
                    value: all ? true : (some ? null : false),
                    semanticLabel: '全選',
                    onTap: pick.isEmpty
                        ? null
                        : () => onChanged(all ? [] : pick),
                  ),
                ),
                Text(
                  on.isNotEmpty
                      ? '${on.length} / ${list.length}'
                      : '${list.length}',
                  style: t.number(
                    size: 12,
                    weight: FontWeight.w500,
                    color: c.ink2,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(4),
              children: [
                for (final o in list)
                  _Fresh(
                    on: fresh.contains(o.value),
                    child: _CheckRow(
                      label: Text(
                        o.text,
                        style: t
                            .body(
                              size: 14,
                              color: o.disabled ? c.ink3 : c.inkBody,
                            )
                            .copyWith(height: 1.2),
                      ),
                      value: checked.contains(o.value),
                      onTap: o.disabled
                          ? null
                          : () => onChanged(
                              checked.contains(o.value)
                                  ? checked.where((v) => v != o.value).toList()
                                  : [...checked, o.value],
                            ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Fresh extends StatelessWidget {
  const _Fresh({required this.on, required this.child});
  final bool on;
  final Widget child;
  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final sel = t.selectionBg.a == 0 ? t.colors.surface2 : t.selectionBg;
    return AnimatedContainer(
      duration: reduce ? Duration.zero : Duration(milliseconds: on ? 120 : 700),
      decoration: BoxDecoration(
        color: on
            ? Color.lerp(sel, t.colors.coral, .15)
            : sel.withValues(alpha: 0),
        borderRadius: BorderRadius.circular(t.rSm.clamp(0, 10)),
      ),
      child: child,
    );
  }
}

/// 列表內的勾選列（自帶小型核取方塊，跟著主題的圓角、描邊與主色）
class _CheckRow extends StatelessWidget {
  const _CheckRow({
    required this.label,
    required this.value,
    this.onTap,
    this.semanticLabel,
  });
  final Widget label;

  /// null = 部分選取
  final bool? value;
  final VoidCallback? onTap;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    return Semantics(
      checked: value == true,
      mixed: value == null,
      label: semanticLabel,
      child: AicdePressable(
        onTap: onTap,
        isButton: false,
        mouseCursor: onTap == null
            ? SystemMouseCursors.basic
            : SystemMouseCursors.click,
        builder: (context, s) {
          final checked = value != false;
          final box = AnimatedContainer(
            duration: t.motion,
            width: 16,
            height: 16,
            decoration: BoxDecoration(
              color: checked ? t.primary : c.surface,
              borderRadius: BorderRadius.circular(
                t.style == AicdeThemeStyle.cute ? 6 : t.rXs.clamp(0, 5),
              ),
              border: Border.all(
                color: checked
                    ? t.primary
                    : (t.strokeAll ? t.strokeColor : c.lineStrong),
                width: t.strokeAll ? t.strokeWidth.clamp(1.5, 2.5) : 1.5,
              ),
              boxShadow: s.focused
                  ? [BoxShadow(color: t.focusColor, spreadRadius: 2)]
                  : null,
            ),
            child: checked
                ? Icon(
                    value == null ? Icons.remove_rounded : Icons.check_rounded,
                    size: 13,
                    color: t.onPrimary,
                  )
                : null,
          );
          return Opacity(
            opacity: onTap == null && value == false ? .55 : 1,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 7),
              decoration: BoxDecoration(
                color: s.hovered ? c.surface2 : null,
                borderRadius: BorderRadius.circular(t.rSm.clamp(0, 10)),
              ),
              child: Row(
                children: [
                  box,
                  const SizedBox(width: 8),
                  Flexible(child: label),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
