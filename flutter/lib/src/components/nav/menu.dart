import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../foundation/box.dart';
import '../../foundation/text.dart';
import '../../theme/theme.dart';
import 'menu_row.dart';

@immutable
class AicdeMenuItem {
  const AicdeMenuItem({
    required this.id,
    required this.label,
    this.icon,
    this.badge,
    this.children = const [],
    this.initiallyExpanded = false,
  }) : isGroup = false;

  /// 分組標題（不可點，底下列出 [children]）
  const AicdeMenuItem.group({required this.label, required this.children})
      : id = '',
        icon = null,
        badge = null,
        initiallyExpanded = true,
        isGroup = true;

  final String id;
  final String label;
  final Widget? icon;

  /// 右側的小徽章，例如未讀數
  final String? badge;

  /// 子選單；非空時這一項變成可展開的
  final List<AicdeMenuItem> children;
  final bool initiallyExpanded;
  final bool isGroup;
}

/// 側邊導覽選單：分組、可展開的子選單、徽章。上下鍵移動，Enter 選取或展開。
class AicdeMenu extends StatefulWidget {
  const AicdeMenu({
    super.key,
    required this.items,
    this.value,
    this.initialValue,
    this.onChanged,
    this.semanticLabel = '選單',
  });

  final List<AicdeMenuItem> items;

  /// 受控的選中 id
  final String? value;
  final String? initialValue;
  final ValueChanged<String>? onChanged;
  final String semanticLabel;

  @override
  State<AicdeMenu> createState() => _AicdeMenuState();
}

class _AicdeMenuState extends State<AicdeMenu> {
  String? _inner;
  final _expanded = <String>{};

  String? get _current => widget.value ?? _inner ?? widget.initialValue;

  @override
  void initState() {
    super.initState();
    void walk(List<AicdeMenuItem> items, List<String> parents) {
      for (final it in items) {
        if (it.children.isNotEmpty && !it.isGroup && it.initiallyExpanded) _expanded.add(it.id);
        if (it.id == _current) _expanded.addAll(parents);
        walk(it.children, [...parents, if (!it.isGroup) it.id]);
      }
    }

    walk(widget.items, []);
  }

  void _select(String id) {
    if (widget.value == null) setState(() => _inner = id);
    widget.onChanged?.call(id);
  }

  bool _contains(AicdeMenuItem it, String? id) =>
      id != null && it.children.any((c) => c.id == id || _contains(c, id));

  List<Widget> _build(BuildContext context, List<AicdeMenuItem> items, double indent) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final out = <Widget>[];
    for (final it in items) {
      if (it.isGroup) {
        out.add(Padding(
          padding: EdgeInsets.fromLTRB(12 + indent, out.isEmpty ? 4 : 14, 12, 6),
          child: Semantics(
            header: true,
            child: Text(t.labelText(it.label), style: t.label(size: 11, weight: FontWeight.w700, color: c.ink3)),
          ),
        ));
        out.addAll(_build(context, it.children, indent));
        continue;
      }
      if (it.children.isNotEmpty) {
        final open = _expanded.contains(it.id);
        out.add(AicdeMenuRow(
          label: Text(it.label, style: _contains(it, _current) ? TextStyle(color: c.ink, fontWeight: FontWeight.w700) : null),
          icon: it.icon,
          indent: indent,
          expanded: open,
          trailing: AnimatedRotation(
            turns: open ? .5 : 0,
            duration: navMotion(context, 1.4),
            child: const Icon(Icons.expand_more),
          ),
          onTap: () => setState(() => open ? _expanded.remove(it.id) : _expanded.add(it.id)),
        ));
        out.add(ClipRect(
          child: AnimatedSize(
            duration: navMotion(context, 1.4),
            curve: t.curve,
            alignment: Alignment.topCenter,
            child: open
                ? Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: _build(context, it.children, indent + (it.icon != null ? 28 : 16)),
                  )
                : const SizedBox(width: double.infinity),
          ),
        ));
        continue;
      }
      out.add(AicdeMenuRow(
        label: Text(it.label),
        icon: it.icon,
        indent: indent,
        selected: it.id == _current,
        trailing: it.badge == null
            ? null
            : AicdeBox(
                kind: AicdeBoxKind.chip,
                fill: t.primary,
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                child: Text(it.badge!, style: t.number(size: 11, weight: FontWeight.w700, color: t.onPrimary)),
              ),
        onTap: () => _select(it.id),
      ));
    }
    return out;
  }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      container: true,
      label: widget.semanticLabel,
      explicitChildNodes: true,
      child: FocusTraversalGroup(
        child: Shortcuts(
          shortcuts: const {
            SingleActivator(LogicalKeyboardKey.arrowDown): NextFocusIntent(),
            SingleActivator(LogicalKeyboardKey.arrowUp): PreviousFocusIntent(),
          },
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (final w in _build(context, widget.items, 0))
                Padding(padding: const EdgeInsets.only(bottom: 2), child: w),
            ],
          ),
        ),
      ),
    );
  }
}
