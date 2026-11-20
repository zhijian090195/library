import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/pressable.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';

@immutable
class AicdeCollapseItem {
  const AicdeCollapseItem({required this.key, required this.title, required this.content, this.disabled = false});
  final String key;
  final String title;
  final Widget content;
  final bool disabled;
}

/// 折疊面板。可受控（[activeKeys] + [onChange]）或不受控（[defaultActiveKeys]）。
class AicdeCollapse extends StatefulWidget {
  const AicdeCollapse({
    super.key,
    required this.items,
    this.accordion = false,
    this.activeKeys,
    this.defaultActiveKeys = const [],
    this.onChange,
  });

  final List<AicdeCollapseItem> items;

  /// 一次只展開一個
  final bool accordion;
  final List<String>? activeKeys;
  final List<String> defaultActiveKeys;
  final ValueChanged<List<String>>? onChange;

  @override
  State<AicdeCollapse> createState() => _AicdeCollapseState();
}

class _AicdeCollapseState extends State<AicdeCollapse> {
  late List<String> _inner = [...widget.defaultActiveKeys];
  List<String> get _keys => widget.activeKeys ?? _inner;

  void _toggle(String k) {
    final open = _keys.contains(k);
    final next = widget.accordion ? (open ? <String>[] : [k]) : (open ? (_keys.where((e) => e != k).toList()) : [..._keys, k]);
    if (widget.activeKeys == null) setState(() => _inner = next);
    widget.onChange?.call(next);
  }

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final dur = reduce ? Duration.zero : t.motion * 1.5;
    return AicdeBox(
      kind: AicdeBoxKind.panel,
      clip: true,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          for (var i = 0; i < widget.items.length; i++)
            Builder(builder: (context) {
              final it = widget.items[i];
              final open = _keys.contains(it.key);
              return DecoratedBox(
                decoration: BoxDecoration(
                  border: i == 0 ? null : Border(top: BorderSide(color: t.strokeAll ? t.strokeColor : c.line, width: t.strokeAll ? t.strokeWidth : 1)),
                ),
                child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                  Semantics(
                    expanded: open,
                    child: AicdePressable(
                      onTap: it.disabled ? null : () => _toggle(it.key),
                      semanticLabel: it.title,
                      builder: (context, s) => AnimatedContainer(
                        duration: dur,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                          color: s.hovered || s.focused ? c.surface2 : Colors.transparent,
                          border: s.focused ? Border(left: BorderSide(color: t.focusColor, width: 3)) : null,
                        ),
                        child: Opacity(
                          opacity: s.disabled ? .45 : 1,
                          child: Row(children: [
                            Expanded(child: Text(it.title, style: t.heading(size: 14))),
                            AnimatedRotation(
                              turns: open ? .5 : 0,
                              duration: dur,
                              curve: t.curve,
                              child: Icon(Icons.expand_more, size: 20, color: open ? t.primary : c.ink3),
                            ),
                          ]),
                        ),
                      ),
                    ),
                  ),
                  ClipRect(
                    child: AnimatedSize(
                      duration: dur,
                      curve: t.curve,
                      alignment: Alignment.topCenter,
                      child: open
                          ? Padding(
                              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                              child: DefaultTextStyle.merge(style: t.body(size: 13), child: it.content),
                            )
                          : const SizedBox(width: double.infinity),
                    ),
                  ),
                ]),
              );
            }),
        ],
      ),
    );
  }
}
