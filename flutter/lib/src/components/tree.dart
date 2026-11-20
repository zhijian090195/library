import 'package:flutter/material.dart';

import '../foundation/pressable.dart';
import '../foundation/selection.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';

/// 樹狀資料節點；有 [children] 的是資料夾
@immutable
class AicdeTreeNode {
  const AicdeTreeNode({
    required this.key,
    required this.label,
    this.children,
    this.icon,
  });
  final String key;
  final String label;
  final List<AicdeTreeNode>? children;
  final Widget? icon;
}

/// 樹狀結構：資料夾可展開收合，檔案可選取。Enter / Space 操作。
class AicdeTree extends StatefulWidget {
  const AicdeTree({
    super.key,
    required this.data,
    this.expandedKeys,
    this.defaultExpandedKeys = const [],
    this.onExpandChange,
    this.selectedKey,
    this.defaultSelectedKey = '',
    this.onSelect,
  });

  final List<AicdeTreeNode> data;
  final List<String>? expandedKeys;
  final List<String> defaultExpandedKeys;
  final ValueChanged<List<String>>? onExpandChange;
  final String? selectedKey;
  final String defaultSelectedKey;
  final void Function(String key, AicdeTreeNode node)? onSelect;

  @override
  State<AicdeTree> createState() => _AicdeTreeState();
}

class _AicdeTreeState extends State<AicdeTree> {
  late List<String> _open = [...widget.defaultExpandedKeys];
  late String _sel = widget.defaultSelectedKey;

  List<String> get _expanded => widget.expandedKeys ?? _open;
  String get _selected => widget.selectedKey ?? _sel;

  void _toggle(String k) {
    final next = _expanded.contains(k)
        ? _expanded.where((e) => e != k).toList()
        : [..._expanded, k];
    if (widget.expandedKeys == null) setState(() => _open = next);
    widget.onExpandChange?.call(next);
  }

  void _choose(AicdeTreeNode n) {
    if (widget.selectedKey == null) setState(() => _sel = n.key);
    widget.onSelect?.call(n.key, n);
  }

  Widget _list(List<AicdeTreeNode> nodes, bool nested) {
    final t = AicdeTheme.of(context);
    final col = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [for (final n in nodes) _node(n)],
    );
    if (!nested) return col;
    return Container(
      margin: const EdgeInsets.only(left: 13),
      padding: const EdgeInsets.only(left: 8),
      decoration: BoxDecoration(
        border: Border(left: BorderSide(color: t.colors.line)),
      ),
      child: col,
    );
  }

  Widget _node(AicdeTreeNode n) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final folder = n.children != null;
    final open = folder && _expanded.contains(n.key);
    final selected = !folder && _selected == n.key;
    final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final dur = reduce ? Duration.zero : const Duration(milliseconds: 200);

    final row = Semantics(
      expanded: folder ? open : null,
      child: AicdePressable(
        onTap: () => folder ? _toggle(n.key) : _choose(n),
        selected: selected,
        semanticLabel: n.label,
        builder: (context, s) => AicdeSelectionMark(
          tokens: t,
          selected: selected,
          child: AnimatedContainer(
            duration: t.motion,
            height: 30,
            padding: EdgeInsets.only(left: folder ? 2 : 21, right: 6),
            decoration: BoxDecoration(
              color: selected
                  ? t.selectionBg
                  : (s.hovered ? c.surface2 : const Color(0x00000000)),
              borderRadius: BorderRadius.circular(t.rSm),
              border: s.focused
                  ? Border.all(color: t.focusColor, width: 2)
                  : null,
            ),
            child: Row(
              children: [
                if (folder)
                  AnimatedRotation(
                    turns: open ? .25 : 0,
                    duration: dur,
                    curve: t.curve,
                    child: Icon(Icons.chevron_right, size: 16, color: c.ink3),
                  ),
                if (folder) const SizedBox(width: 2),
                IconTheme.merge(
                  data: IconThemeData(size: 16, color: c.band),
                  child:
                      n.icon ??
                      Icon(
                        folder
                            ? Icons.folder_outlined
                            : Icons.description_outlined,
                      ),
                ),
                const SizedBox(width: 6),
                Flexible(
                  child: Text(
                    n.label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: t
                        .body(color: selected ? t.selectionFg : c.inkBody)
                        .copyWith(
                          height: 1.4,
                          fontWeight: selected
                              ? FontWeight.w500
                              : FontWeight.w400,
                        ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
    if (!folder) return row;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        row,
        AnimatedSize(
          duration: dur,
          curve: t.curve,
          alignment: Alignment.topCenter,
          child: open
              ? _list(n.children!, true)
              : const SizedBox(width: double.infinity),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 320),
      child: _list(widget.data, false),
    );
  }
}
