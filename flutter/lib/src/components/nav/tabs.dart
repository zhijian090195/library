import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../foundation/box.dart';
import '../../foundation/pressable.dart';
import '../../foundation/text.dart';
import '../../theme/theme.dart';
import 'menu_row.dart';

@immutable
class AicdeTabItem {
  const AicdeTabItem({required this.id, required this.label, this.child, this.disabled = false});
  final String id;
  final String label;

  /// 選中時顯示在標籤列下方的內容
  final Widget? child;
  final bool disabled;
}

enum AicdeTabsVariant {
  /// 底線指示
  line,

  /// 膠囊分頁（選中塊浮在灰底上）
  pill,
}

/// 標籤頁。左右方向鍵切換（跳過停用的），Home / End 跳到頭尾。
class AicdeTabs extends StatefulWidget {
  const AicdeTabs({
    super.key,
    required this.items,
    this.value,
    this.initialValue,
    this.onChanged,
    this.variant = AicdeTabsVariant.line,
  });

  final List<AicdeTabItem> items;

  /// 受控的選中 id；null 則由元件自己管理
  final String? value;
  final String? initialValue;
  final ValueChanged<String>? onChanged;
  final AicdeTabsVariant variant;

  @override
  State<AicdeTabs> createState() => _AicdeTabsState();
}

class _AicdeTabsState extends State<AicdeTabs> {
  String? _inner;
  final _nodes = <FocusNode>[];

  String get _current {
    final v = widget.value ?? _inner ?? widget.initialValue;
    if (v != null) return v;
    return widget.items.firstWhere((i) => !i.disabled, orElse: () => widget.items.first).id;
  }

  void _syncNodes() {
    while (_nodes.length < widget.items.length) {
      _nodes.add(FocusNode());
    }
    while (_nodes.length > widget.items.length) {
      _nodes.removeLast().dispose();
    }
  }

  @override
  void dispose() {
    for (final n in _nodes) {
      n.dispose();
    }
    super.dispose();
  }

  void _select(String id) {
    if (id == _current) return;
    if (widget.value == null) setState(() => _inner = id);
    widget.onChanged?.call(id);
  }

  void _move(int dir, {bool edge = false}) {
    final enabled = [for (var i = 0; i < widget.items.length; i++) if (!widget.items[i].disabled) i];
    if (enabled.isEmpty) return;
    int next;
    if (edge) {
      next = dir > 0 ? enabled.last : enabled.first;
    } else {
      final focusedIdx = _nodes.indexWhere((n) => n.hasFocus);
      final from = focusedIdx >= 0 ? focusedIdx : widget.items.indexWhere((i) => i.id == _current);
      final k = math.max(0, enabled.indexOf(from));
      next = enabled[(k + dir + enabled.length) % enabled.length];
    }
    _select(widget.items[next].id);
    _nodes[next].requestFocus();
  }

  @override
  Widget build(BuildContext context) {
    _syncNodes();
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final pill = widget.variant == AicdeTabsVariant.pill;
    final current = _current;
    final active = widget.items.where((i) => i.id == current).firstOrNull;

    final tabs = [
      for (var i = 0; i < widget.items.length; i++)
        _Tab(
          item: widget.items[i],
          selected: widget.items[i].id == current,
          pill: pill,
          focusNode: _nodes[i],
          onTap: () {
            _nodes[i].requestFocus();
            _select(widget.items[i].id);
          },
        ),
    ];

    Widget list = Row(mainAxisSize: MainAxisSize.min, children: [
      for (final tab in tabs) Padding(padding: EdgeInsets.only(right: pill ? 0 : 4), child: tab),
    ]);
    if (pill) {
      list = AicdeBox(
        kind: AicdeBoxKind.panel,
        fill: c.surface2,
        radius: t.rMd,
        padding: const EdgeInsets.all(4),
        child: list,
      );
    } else {
      list = DecoratedBox(
        decoration: BoxDecoration(border: Border(bottom: BorderSide(color: c.line))),
        child: Align(alignment: Alignment.centerLeft, child: list),
      );
    }

    list = CallbackShortcuts(
      bindings: {
        const SingleActivator(LogicalKeyboardKey.arrowRight): () => _move(1),
        const SingleActivator(LogicalKeyboardKey.arrowLeft): () => _move(-1),
        const SingleActivator(LogicalKeyboardKey.home): () => _move(-1, edge: true),
        const SingleActivator(LogicalKeyboardKey.end): () => _move(1, edge: true),
      },
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        clipBehavior: Clip.none,
        child: list,
      ),
    );

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (pill) Align(alignment: Alignment.centerLeft, child: list) else list,
        if (active?.child != null)
          Padding(
            padding: const EdgeInsets.only(top: 16),
            child: AnimatedSwitcher(
              duration: navMotion(context, 1.4),
              switchInCurve: t.curve,
              child: DefaultTextStyle.merge(
                key: ValueKey(current),
                style: t.body(),
                child: active!.child!,
              ),
            ),
          ),
      ],
    );
  }
}

class _Tab extends StatelessWidget {
  const _Tab({required this.item, required this.selected, required this.pill, required this.focusNode, required this.onTap});
  final AicdeTabItem item;
  final bool selected, pill;
  final FocusNode focusNode;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    return AicdePressable(
      onTap: item.disabled ? null : onTap,
      focusNode: focusNode,
      selected: selected,
      semanticLabel: item.label,
      builder: (context, s) {
        final color = selected || s.hovered ? c.ink : c.ink2;
        final text = Text(
          t.labelText(item.label),
          style: t.label(size: 14, weight: selected ? FontWeight.w700 : FontWeight.w500, color: color),
        );
        if (pill) {
          return AicdeBox(
            kind: AicdeBoxKind.control,
            emphasis: selected ? AicdeEmphasis.solid : AicdeEmphasis.ghost,
            fill: c.surface,
            radius: t.rSm,
            states: AicdeStates(focused: s.focused, disabled: s.disabled, hovered: s.hovered && !selected),
            height: math.max(32, t.controlHeight - 8),
            padding: const EdgeInsets.symmetric(horizontal: 14),
            alignment: Alignment.center,
            child: text,
          );
        }
        return AicdeBox(
          kind: AicdeBoxKind.chip,
          emphasis: AicdeEmphasis.ghost,
          radius: t.rXs,
          states: AicdeStates(focused: s.focused, disabled: s.disabled),
          child: AnimatedContainer(
            duration: navMotion(context, 1.6),
            curve: t.curve,
            height: t.controlHeight,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            alignment: Alignment.center,
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(
                  color: selected ? t.primary : t.primary.withValues(alpha: 0),
                  width: math.max(2.5, t.strokeWidth),
                ),
              ),
            ),
            child: text,
          ),
        );
      },
    );
  }
}
