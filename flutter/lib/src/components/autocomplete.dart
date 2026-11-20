import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../foundation/box.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';
import 'anchored_overlay.dart';

/// 自動完成的選項
@immutable
class AicdeAutocompleteOption {
  const AicdeAutocompleteOption(this.value, [this.label]);
  final String value;
  final String? label;
  String get text => label ?? value;
}

enum AicdeAutocompleteSize { sm, md, lg }

/// 自動完成：邊打字邊篩選，符合的字標成珊瑚紅；上下鍵移動、Enter 選取、Esc 關閉。
class AicdeAutocomplete extends StatefulWidget {
  const AicdeAutocomplete({
    super.key,
    required this.options,
    this.value,
    this.initialValue = '',
    this.onChanged,
    this.onSelected,
    this.emptyText = '沒有符合的結果',
    this.placeholder,
    this.size = AicdeAutocompleteSize.md,
    this.enabled = true,
    this.focusNode,
    this.semanticLabel,
  });

  /// 字串清單用 `AicdeAutocomplete.strings` 較方便
  final List<AicdeAutocompleteOption> options;

  /// 受控的輸入文字；null 時元件自己管理
  final String? value;
  final String initialValue;
  final ValueChanged<String>? onChanged;

  /// 選取選項時回傳 value
  final ValueChanged<String>? onSelected;
  final String emptyText;
  final String? placeholder;
  final AicdeAutocompleteSize size;
  final bool enabled;
  final FocusNode? focusNode;
  final String? semanticLabel;

  static List<AicdeAutocompleteOption> strings(List<String> s) => [for (final x in s) AicdeAutocompleteOption(x)];

  @override
  State<AicdeAutocomplete> createState() => _AicdeAutocompleteState();
}

class _AicdeAutocompleteState extends State<AicdeAutocomplete> {
  late final TextEditingController _ctrl = TextEditingController(text: widget.value ?? widget.initialValue);
  FocusNode? _ownFocus;
  FocusNode get _focus => widget.focusNode ?? (_ownFocus ??= FocusNode());
  bool _open = false;
  int _active = -1;
  bool _hover = false;

  @override
  void initState() {
    super.initState();
    _focus.addListener(_onFocus);
    _focus.onKeyEvent = _onKey;
  }

  @override
  void didUpdateWidget(AicdeAutocomplete old) {
    super.didUpdateWidget(old);
    if (widget.value != null && widget.value != _ctrl.text) {
      _ctrl.value = TextEditingValue(text: widget.value!, selection: TextSelection.collapsed(offset: widget.value!.length));
    }
    if (old.focusNode != widget.focusNode) {
      (old.focusNode ?? _ownFocus)?.removeListener(_onFocus);
      _focus.addListener(_onFocus);
      _focus.onKeyEvent = _onKey;
    }
  }

  @override
  void dispose() {
    _focus.removeListener(_onFocus);
    _ownFocus?.dispose();
    _ctrl.dispose();
    super.dispose();
  }

  void _onFocus() => setState(() {
        _open = _focus.hasFocus;
        _active = -1;
      });

  List<AicdeAutocompleteOption> get _items {
    final q = _ctrl.text.trim().toLowerCase();
    return widget.options.where((o) => q.isEmpty || o.text.toLowerCase().contains(q)).toList();
  }

  void _pick(AicdeAutocompleteOption o) {
    _ctrl.value = TextEditingValue(text: o.text, selection: TextSelection.collapsed(offset: o.text.length));
    widget.onChanged?.call(o.text);
    widget.onSelected?.call(o.value);
    setState(() {
      _open = false;
      _active = -1;
    });
  }

  KeyEventResult _onKey(FocusNode node, KeyEvent e) {
    if (e is! KeyDownEvent && e is! KeyRepeatEvent) return KeyEventResult.ignored;
    final items = _items;
    final k = e.logicalKey;
    if (k == LogicalKeyboardKey.arrowDown) {
      setState(() {
        _open = true;
        _active = (_active + 1).clamp(0, items.length - 1);
      });
      return KeyEventResult.handled;
    }
    if (k == LogicalKeyboardKey.arrowUp) {
      setState(() => _active = (_active - 1).clamp(0, items.length - 1));
      return KeyEventResult.handled;
    }
    if ((k == LogicalKeyboardKey.enter || k == LogicalKeyboardKey.numpadEnter) && _open && _active >= 0 && _active < items.length) {
      _pick(items[_active]);
      return KeyEventResult.handled;
    }
    if (k == LogicalKeyboardKey.escape && _open) {
      setState(() {
        _open = false;
        _active = -1;
      });
      return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final h = switch (widget.size) {
      AicdeAutocompleteSize.sm => t.controlHeight - 8,
      AicdeAutocompleteSize.md => t.controlHeight,
      AicdeAutocompleteSize.lg => t.controlHeight + 8,
    };
    final q = _ctrl.text.trim();
    final items = _items;

    return Semantics(
      label: widget.semanticLabel,
      textField: true,
      expanded: _open,
      child: AicdeAnchoredOverlay(
        open: _open && widget.enabled,
        onDismiss: () => setState(() => _open = false),
        overlayBuilder: (ctx, w) => TextFieldTapRegion(
          child: ConstrainedBox(
            constraints: BoxConstraints(maxHeight: 260, maxWidth: w),
            child: items.isEmpty
                ? Padding(padding: const EdgeInsets.all(10), child: Text(widget.emptyText, style: t.caption(size: 13)))
                : ListView(
                    shrinkWrap: true,
                    padding: EdgeInsets.zero,
                    children: [
                      for (var i = 0; i < items.length; i++)
                        Semantics(
                          selected: i == _active,
                          child: AicdeOptionRow(
                            active: i == _active,
                            onHover: () => setState(() => _active = i),
                            onTap: () => _pick(items[i]),
                            child: _highlight(items[i].text, q, t.body(size: 14, color: c.inkBody), c.coralDark),
                          ),
                        ),
                    ],
                  ),
          ),
        ),
        child: MouseRegion(
          onEnter: (_) => setState(() => _hover = true),
          onExit: (_) => setState(() => _hover = false),
          child: AicdeBox(
            kind: AicdeBoxKind.field,
            states: AicdeStates(focused: _focus.hasFocus, hovered: _hover, disabled: !widget.enabled),
            height: h,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            alignment: Alignment.centerLeft,
            child: TextField(
              controller: _ctrl,
              focusNode: _focus,
              enabled: widget.enabled,
              autocorrect: false,
              enableSuggestions: false,
              style: t.body(size: widget.size == AicdeAutocompleteSize.lg ? 16 : 14).copyWith(height: 1.2),
              cursorColor: t.focusColor,
              decoration: aicdeBareDecoration(
                hintText: widget.placeholder,
                hintStyle: t.body(size: 14, color: c.ink3).copyWith(height: 1.2),
              ),
              onChanged: (v) {
                widget.onChanged?.call(v);
                setState(() {
                  _open = true;
                  _active = -1;
                });
              },
            ),
          ),
        ),
      ),
    );
  }

  Widget _highlight(String label, String q, TextStyle base, Color mark) {
    final k = q.isEmpty ? -1 : label.toLowerCase().indexOf(q.toLowerCase());
    if (k < 0) return Text(label, style: base);
    return Text.rich(TextSpan(style: base, children: [
      TextSpan(text: label.substring(0, k)),
      TextSpan(text: label.substring(k, k + q.length), style: TextStyle(color: mark, fontWeight: FontWeight.w700)),
      TextSpan(text: label.substring(k + q.length)),
    ]));
  }
}
