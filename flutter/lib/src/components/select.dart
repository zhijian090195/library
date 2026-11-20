import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../foundation/box.dart';
import '../foundation/pressable.dart';
import '../foundation/selection.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';
import 'input.dart';
import 'option.dart';

/// 下拉選擇。點擊或 Enter 展開，方向鍵移動、Enter 選定、Esc 關閉。
///
/// ```dart
/// AicdeSelect(options: AicdeOption.of(['台北', '台中']), value: city, onChanged: (v) => ...)
/// ```
class AicdeSelect extends StatefulWidget {
  const AicdeSelect({
    super.key,
    required this.options,
    this.value,
    this.onChanged,
    this.placeholder = '請選擇',
    this.size = AicdeInputSize.md,
    this.error = false,
    this.width,
    this.focusNode,
    this.semanticLabel,
  });

  final List<AicdeOption> options;
  final String? value;

  /// 傳 null 代表停用
  final ValueChanged<String>? onChanged;
  final String placeholder;
  final AicdeInputSize size;
  final bool error;
  final double? width;
  final FocusNode? focusNode;

  /// 讀屏名稱；放在 [AicdeField] 裡時預設用欄位標題
  final String? semanticLabel;

  @override
  State<AicdeSelect> createState() => _AicdeSelectState();
}

class _AicdeSelectState extends State<AicdeSelect> {
  final _portal = OverlayPortalController();
  final _link = LayerLink();
  int _active = -1;
  double _w = 200;

  bool get _open => _portal.isShowing;

  void _show() {
    if (widget.onChanged == null) return;
    final box = context.findRenderObject() as RenderBox?;
    if (box != null && box.hasSize) _w = box.size.width;
    _active = widget.options.indexWhere((o) => o.value == widget.value);
    setState(_portal.show);
  }

  void _hide() {
    if (_open) setState(_portal.hide);
  }

  void _pick(AicdeOption o) {
    if (o.disabled) return;
    widget.onChanged?.call(o.value);
    _hide();
  }

  void _move(int d) {
    final n = widget.options.length;
    if (n == 0) return;
    var i = _active;
    for (var k = 0; k < n; k++) {
      i = (i + d + n) % n;
      if (!widget.options[i].disabled) break;
    }
    setState(() => _active = i);
  }

  String _typed = '';
  DateTime _typedAt = DateTime(0);

  /// 輸入字母時跳到第一個符合的選項（APG listbox 的 type-ahead）
  bool _typeAhead(String ch) {
    final now = DateTime.now();
    _typed = now.difference(_typedAt) > const Duration(milliseconds: 600)
        ? ch
        : _typed + ch;
    _typedAt = now;
    // 累積的字找不到時，改用這次按的字重新找（和瀏覽器原生 select 一樣）
    if (_findTyped(_typed)) return true;
    _typed = ch;
    return _findTyped(ch);
  }

  bool _findTyped(String typed) {
    final q = typed.toLowerCase();
    final n = widget.options.length;
    // 同一個字母重複按：從目前位置往下找，在同字母開頭的選項間輪流
    final same = q.split('').every((x) => x == q[0]);
    final needle = same ? q[0] : q;
    final start = same && _active >= 0 ? _active + 1 : 0;
    for (var k = 0; k < n; k++) {
      final i = (start + k) % n;
      final o = widget.options[i];
      if (!o.disabled && o.text.toLowerCase().startsWith(needle)) {
        if (!_open) _show();
        setState(() => _active = i);
        return true;
      }
    }
    return false;
  }

  void _edge(bool first) {
    final idx = List.generate(
      widget.options.length,
      (i) => i,
    ).where((i) => !widget.options[i].disabled);
    if (idx.isEmpty) return;
    setState(() => _active = first ? idx.first : idx.last);
  }

  KeyEventResult _onKey(FocusNode _, KeyEvent e) {
    if (e is! KeyDownEvent && e is! KeyRepeatEvent) {
      return KeyEventResult.ignored;
    }
    final k = e.logicalKey;
    if (widget.onChanged == null) return KeyEventResult.ignored;
    if (_open &&
        (k == LogicalKeyboardKey.home || k == LogicalKeyboardKey.end)) {
      _edge(k == LogicalKeyboardKey.home);
      return KeyEventResult.handled;
    }
    if (_open && k == LogicalKeyboardKey.tab) {
      _hide();
      return KeyEventResult.ignored;
    }
    final ch = e.character;
    if (ch != null &&
        ch.trim().isNotEmpty &&
        ch.length == 1 &&
        !HardwareKeyboard.instance.isControlPressed &&
        !HardwareKeyboard.instance.isMetaPressed) {
      if (_typeAhead(ch)) return KeyEventResult.handled;
    }
    if (k == LogicalKeyboardKey.arrowDown || k == LogicalKeyboardKey.arrowUp) {
      if (!_open) _show();
      _move(k == LogicalKeyboardKey.arrowDown ? 1 : -1);
      return KeyEventResult.handled;
    }
    if (_open &&
        (k == LogicalKeyboardKey.enter || k == LogicalKeyboardKey.space)) {
      if (_active >= 0) _pick(widget.options[_active]);
      return KeyEventResult.handled;
    }
    if (_open && k == LogicalKeyboardKey.escape) {
      _hide();
      return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final sel = widget.options
        .where((o) => o.value == widget.value)
        .firstOrNull;
    final h = switch (widget.size) {
      AicdeInputSize.sm => t.controlHeight - 8,
      AicdeInputSize.md => t.controlHeight,
      AicdeInputSize.lg => t.controlHeight + 8,
    };
    final enabled = widget.onChanged != null;
    final pill = t.inputRadius >= 999;
    final scope = AicdeFieldScope.maybeOf(context);
    final error = widget.error || (scope?.error ?? false);
    final activeText = _open && _active >= 0
        ? widget.options[_active].text
        : null;

    final trigger = Focus(
      focusNode: widget.focusNode,
      canRequestFocus: false,
      skipTraversal: true,
      onKeyEvent: _onKey,
      child: AicdePressable(
        onTap: enabled ? () => _open ? _hide() : _show() : null,
        semanticLabel:
            widget.semanticLabel ?? scope?.label ?? widget.placeholder,
        // 展開時念目前反白的選項（焦點留在觸發按鈕上，對應 aria-activedescendant）
        semanticValue: activeText ?? sel?.text,
        semanticHint: scope?.message,
        expanded: _open,
        builder: (context, s) => AicdeBox(
          kind: AicdeBoxKind.field,
          width: widget.width,
          height: h,
          states: AicdeStates(
            focused: s.focused || _open,
            hovered: s.hovered,
            disabled: s.disabled,
            error: error,
          ),
          padding: EdgeInsets.only(
            left: t.underlineInputs ? 2 : (pill ? 16 : 12),
            right: t.underlineInputs ? 0 : (pill ? 12 : 8),
          ),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  sel?.text ?? widget.placeholder,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: t
                      .body(
                        size: widget.size == AicdeInputSize.lg ? 16 : 14,
                        color: sel == null ? c.ink3 : c.inkBody,
                      )
                      .copyWith(height: 1.2),
                ),
              ),
              AnimatedRotation(
                turns: _open ? .5 : 0,
                duration:
                    (MediaQuery.maybeDisableAnimationsOf(context) ?? false)
                    ? Duration.zero
                    : t.motion,
                child: Icon(
                  Icons.keyboard_arrow_down_rounded,
                  size: 20,
                  color: c.ink2,
                ),
              ),
            ],
          ),
        ),
      ),
    );

    return TapRegion(
      groupId: this,
      onTapOutside: (_) => _hide(),
      child: CompositedTransformTarget(
        link: _link,
        child: OverlayPortal(
          controller: _portal,
          overlayChildBuilder: (ctx) => _menu(context),
          child: trigger,
        ),
      ),
    );
  }

  Widget _menu(BuildContext context) {
    final theme = Theme.of(context);
    return Theme(
      data: theme,
      child: CompositedTransformFollower(
        link: _link,
        targetAnchor: Alignment.bottomLeft,
        offset: const Offset(0, 6),
        child: Align(
          alignment: Alignment.topLeft,
          child: TapRegion(
            groupId: this,
            child: SizedBox(
              width: _w,
              child: AicdeBox(
                kind: AicdeBoxKind.overlay,
                padding: const EdgeInsets.all(4),
                clip: true,
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxHeight: 280),
                  child: ListView(
                    shrinkWrap: true,
                    padding: EdgeInsets.zero,
                    children: [
                      for (var i = 0; i < widget.options.length; i++) _item(i),
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

  Widget _item(int i) {
    final tk = AicdeTheme.of(context);
    final o = widget.options[i];
    final selected = o.value == widget.value;
    return AicdePressable(
      onTap: o.disabled ? null : () => _pick(o),
      selected: selected,
      semanticLabel: o.text,
      builder: (context, s) {
        final hl = s.hovered || i == _active;
        return AicdeSelectionMark(
          tokens: tk,
          selected: selected,
          child: AnimatedContainer(
            duration: tk.motion,
            constraints: BoxConstraints(
              minHeight: tk.controlHeight >= 44 ? 44 : 0,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9),
            decoration: BoxDecoration(
              color: selected
                  ? tk.selectionBg
                  : (hl ? tk.colors.surface2 : const Color(0x00000000)),
              borderRadius: BorderRadius.circular(tk.rSm.clamp(0, 12)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    o.text,
                    style: tk
                        .body(
                          color: o.disabled
                              ? tk.colors.ink3
                              : (selected ? tk.selectionFg : tk.colors.inkBody),
                        )
                        .copyWith(
                          height: 1.2,
                          fontWeight: selected
                              ? FontWeight.w600
                              : FontWeight.w400,
                        ),
                  ),
                ),
                if (selected)
                  Icon(Icons.check_rounded, size: 16, color: tk.selectionFg),
              ],
            ),
          ),
        );
      },
    );
  }
}
