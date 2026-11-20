import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../foundation/box.dart';
import '../../foundation/field.dart';
import '../../foundation/text.dart';
import '../../theme/theme.dart';
import 'menu_row.dart';

@immutable
class AicdeCommandItem {
  const AicdeCommandItem({required this.id, required this.label, this.keywords, this.shortcut, this.icon, this.onSelect});
  final String id;
  final String label;

  /// 額外的搜尋關鍵字（不顯示）
  final String? keywords;
  final String? shortcut;
  final Widget? icon;
  final VoidCallback? onSelect;
}

@immutable
class AicdeCommandGroup {
  const AicdeCommandGroup({required this.label, required this.items});
  final String label;
  final List<AicdeCommandItem> items;
}

/// 模糊比對分數；不符合回傳 null。
///
/// 連續子字串命中分數最高（越前面越高），否則依序比對每個字元（子序列），
/// 連續命中加分。例：`stg` 符合 `Settings`。
int? aicdeFuzzyScore(String query, String text) {
  final q = query.trim().toLowerCase().replaceAll(RegExp(r'\s+'), ' ');
  if (q.isEmpty) return 0;
  final s = text.toLowerCase();
  final idx = s.indexOf(q);
  if (idx >= 0) return 10000 - idx;
  var score = 0, from = 0, last = -2;
  for (final ch in q.replaceAll(' ', '').split('')) {
    final found = s.indexOf(ch, from);
    if (found < 0) return null;
    score += found == last + 1 ? 10 : 1;
    if (found == 0 || s[found - 1] == ' ') score += 5;
    last = found;
    from = found + 1;
  }
  return score;
}

/// 開啟指令面板。輸入即時模糊搜尋，↑↓ 選擇、Enter 執行、Esc 關閉。
///
/// 回傳被選的項目（關閉則為 null）；項目的 `onSelect` 會在面板關閉後呼叫。
Future<AicdeCommandItem?> showAicdeCommandPalette(
  BuildContext context, {
  required List<AicdeCommandGroup> groups,
  String placeholder = '輸入指令或搜尋…',
  String emptyText = '找不到符合的項目',
  bool showFooter = true,
}) async {
  final t = AicdeTheme.of(context);
  final nav = Navigator.of(context, rootNavigator: true);
  final themes = InheritedTheme.capture(from: context, to: nav.context);
  final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
  final picked = await showGeneralDialog<AicdeCommandItem>(
    context: context,
    useRootNavigator: true,
    barrierDismissible: true,
    barrierLabel: '關閉指令面板',
    barrierColor: t.colors.navy.withValues(alpha: t.isDark ? .6 : .35),
    transitionDuration: reduce ? Duration.zero : t.motion * 1.4,
    pageBuilder: (context, _, _) => themes.wrap(_Palette(
      groups: groups,
      placeholder: placeholder,
      emptyText: emptyText,
      showFooter: showFooter,
    )),
    transitionBuilder: (context, a, _, child) {
      final v = Curves.easeOutCubic.transform(a.value);
      return Opacity(opacity: v, child: Transform.translate(offset: Offset(0, (1 - v) * -8), child: child));
    },
  );
  picked?.onSelect?.call();
  return picked;
}

/// 包住 App 的一部分，按 ⌘K / Ctrl+K 開啟指令面板
class AicdeCommandPalette extends StatefulWidget {
  const AicdeCommandPalette({
    super.key,
    required this.groups,
    required this.child,
    this.hotkey = true,
    this.placeholder = '輸入指令或搜尋…',
    this.emptyText = '找不到符合的項目',
    this.showFooter = true,
    this.onSelected,
  });

  final List<AicdeCommandGroup> groups;
  final Widget child;
  final bool hotkey;
  final String placeholder, emptyText;
  final bool showFooter;
  final ValueChanged<String>? onSelected;

  @override
  State<AicdeCommandPalette> createState() => AicdeCommandPaletteState();
}

class AicdeCommandPaletteState extends State<AicdeCommandPalette> {
  bool _open = false;

  /// 程式開啟
  Future<void> open() async {
    if (_open) return;
    _open = true;
    final it = await showAicdeCommandPalette(
      context,
      groups: widget.groups,
      placeholder: widget.placeholder,
      emptyText: widget.emptyText,
      showFooter: widget.showFooter,
    );
    _open = false;
    if (it != null) widget.onSelected?.call(it.id);
  }

  bool _onKey(KeyEvent e) {
    if (!widget.hotkey || e is! KeyDownEvent || e.logicalKey != LogicalKeyboardKey.keyK) return false;
    final k = HardwareKeyboard.instance;
    if (!(k.isMetaPressed || k.isControlPressed)) return false;
    if (_open) {
      Navigator.of(context, rootNavigator: true).maybePop();
    } else {
      open();
    }
    return true;
  }

  @override
  void initState() {
    super.initState();
    HardwareKeyboard.instance.addHandler(_onKey);
  }

  @override
  void dispose() {
    HardwareKeyboard.instance.removeHandler(_onKey);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => widget.child;
}

class _Palette extends StatefulWidget {
  const _Palette({required this.groups, required this.placeholder, required this.emptyText, required this.showFooter});
  final List<AicdeCommandGroup> groups;
  final String placeholder, emptyText;
  final bool showFooter;
  @override
  State<_Palette> createState() => _PaletteState();
}

class _PaletteState extends State<_Palette> {
  final _q = TextEditingController();
  final _scroll = ScrollController();
  int _index = 0;
  List<GlobalKey> _keys = [];

  @override
  void dispose() {
    _q.dispose();
    _scroll.dispose();
    super.dispose();
  }

  List<AicdeCommandGroup> get _filtered {
    final out = <AicdeCommandGroup>[];
    for (final g in widget.groups) {
      final scored = <(AicdeCommandItem, int)>[];
      for (final it in g.items) {
        final s = aicdeFuzzyScore(_q.text, '${it.label} ${it.keywords ?? ''}');
        if (s != null) scored.add((it, s));
      }
      if (_q.text.trim().isNotEmpty) scored.sort((a, b) => b.$2.compareTo(a.$2));
      if (scored.isNotEmpty) out.add(AicdeCommandGroup(label: g.label, items: [for (final s in scored) s.$1]));
    }
    return out;
  }

  void _move(int dir, int count) {
    if (count == 0) return;
    setState(() => _index = (_index + dir + count) % count);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final ctx = _index < _keys.length ? _keys[_index].currentContext : null;
      if (ctx != null) Scrollable.ensureVisible(ctx, alignmentPolicy: dir > 0 ? ScrollPositionAlignmentPolicy.keepVisibleAtEnd : ScrollPositionAlignmentPolicy.keepVisibleAtStart);
    });
  }

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final groups = _filtered;
    final flat = [for (final g in groups) ...g.items];
    if (_index >= flat.length) _index = math.max(0, flat.length - 1);
    if (_keys.length != flat.length) _keys = [for (var i = 0; i < flat.length; i++) GlobalKey()];
    void pick(AicdeCommandItem it) => Navigator.of(context).pop(it);

    var n = 0;
    final rows = <Widget>[];
    for (final g in groups) {
      rows.add(Padding(
        padding: const EdgeInsets.fromLTRB(12, 10, 12, 4),
        child: Semantics(header: true, child: Text(t.labelText(g.label), style: t.label(size: 11, weight: FontWeight.w700, color: c.ink3))),
      ));
      for (final it in g.items) {
        final i = n++;
        rows.add(KeyedSubtree(
          key: _keys[i],
          child: MouseRegion(
            onEnter: (_) => setState(() => _index = i),
            child: AicdeMenuRow(
              label: Text(it.label),
              icon: it.icon,
              highlighted: i == _index,
              trailing: it.shortcut == null ? null : NavShortcutText(it.shortcut!),
              onTap: () => pick(it),
            ),
          ),
        ));
      }
    }

    final input = Focus(
      onKeyEvent: (node, e) {
        if (e is! KeyDownEvent && e is! KeyRepeatEvent) return KeyEventResult.ignored;
        if (e.logicalKey == LogicalKeyboardKey.arrowDown) {
          _move(1, flat.length);
        } else if (e.logicalKey == LogicalKeyboardKey.arrowUp) {
          _move(-1, flat.length);
        } else if (e.logicalKey == LogicalKeyboardKey.enter || e.logicalKey == LogicalKeyboardKey.numpadEnter) {
          if (flat.isNotEmpty) pick(flat[_index]);
        } else {
          return KeyEventResult.ignored;
        }
        return KeyEventResult.handled;
      },
      child: TextField(
        controller: _q,
        autofocus: true,
        onChanged: (_) => setState(() => _index = 0),
        style: t.body(size: 15, color: c.ink),
        cursorColor: t.focusColor,
        decoration: aicdeBareDecoration(hintText: widget.placeholder, hintStyle: t.body(size: 15, color: c.ink3)),
      ),
    );

    return SafeArea(
      child: Align(
        alignment: const Alignment(0, -.55),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 560),
            child: Semantics(
              scopesRoute: true,
              explicitChildNodes: true,
              namesRoute: true,
              label: '指令面板',
              child: AicdeBox(
                kind: AicdeBoxKind.overlay,
                radius: t.rLg,
                clip: true,
                child: Material(
                  type: MaterialType.transparency,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        child: Row(children: [
                          Icon(Icons.search, size: 20, color: c.ink3),
                          const SizedBox(width: 10),
                          Expanded(child: input),
                        ]),
                      ),
                      Container(height: 1, color: c.line),
                      Flexible(
                        child: ConstrainedBox(
                          constraints: const BoxConstraints(maxHeight: 360),
                          child: flat.isEmpty
                              ? Padding(
                                  padding: const EdgeInsets.all(28),
                                  child: Text(widget.emptyText, textAlign: TextAlign.center, style: t.caption(size: 13)),
                                )
                              : ListView(
                                  controller: _scroll,
                                  shrinkWrap: true,
                                  padding: const EdgeInsets.all(6),
                                  children: rows,
                                ),
                        ),
                      ),
                      if (widget.showFooter)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
                          decoration: BoxDecoration(border: Border(top: BorderSide(color: c.line))),
                          child: Wrap(spacing: 16, runSpacing: 4, children: [
                            for (final (k, v) in [('↑↓', '選擇'), ('Enter', '執行'), ('Esc', '關閉')])
                              Row(mainAxisSize: MainAxisSize.min, children: [
                                NavShortcutText(k),
                                const SizedBox(width: 6),
                                Text(v, style: t.caption()),
                              ]),
                          ]),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
