import 'package:flutter/material.dart';

import 'box.dart';

/// 處理滑過、按下、鍵盤 focus（Enter / Space 觸發），把狀態交給 [builder]。
///
/// 搭配 [AicdeBox] 使用：
/// ```dart
/// AicdePressable(
///   onTap: () {},
///   builder: (context, states) => AicdeBox(states: states, child: Text('按我')),
/// )
/// ```
class AicdePressable extends StatefulWidget {
  const AicdePressable({
    super.key,
    required this.builder,
    this.onTap,
    this.onLongPress,
    this.focusNode,
    this.autofocus = false,
    this.selected = false,
    this.semanticLabel,
    this.semanticValue,
    this.semanticHint,
    this.expanded,
    this.isButton = true,
    this.mouseCursor,
  });

  final Widget Function(BuildContext context, AicdeStates states) builder;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final FocusNode? focusNode;
  final bool autofocus;
  final bool selected;
  final String? semanticLabel;

  /// 讀屏念出的目前值，例如下拉選單選中的項目、排序狀態
  final String? semanticValue;

  /// 讀屏念出的補充說明，例如「處理中」
  final String? semanticHint;

  /// 會展開內容的觸發元件（下拉、選單）傳目前是否展開
  final bool? expanded;
  final bool isButton;
  final MouseCursor? mouseCursor;

  @override
  State<AicdePressable> createState() => _AicdePressableState();
}

class _AicdePressableState extends State<AicdePressable> {
  bool _hovered = false, _pressed = false, _focused = false;
  FocusNode? _ownNode;
  FocusNode get _node => widget.focusNode ?? (_ownNode ??= FocusNode());

  @override
  void dispose() {
    _ownNode?.dispose();
    super.dispose();
  }

  bool get _enabled => widget.onTap != null || widget.onLongPress != null;

  void _activate() {
    if (!_enabled) return;
    widget.onTap?.call();
  }

  @override
  Widget build(BuildContext context) {
    final states = AicdeStates(
      hovered: _hovered && _enabled,
      pressed: _pressed && _enabled,
      focused: _focused && _enabled,
      disabled: !_enabled,
      selected: widget.selected,
    );
    return Semantics(
      container: true,
      button: widget.isButton,
      enabled: _enabled,
      selected: widget.selected,
      label: widget.semanticLabel,
      value: widget.semanticValue,
      hint: widget.semanticHint,
      expanded: widget.expanded,
      // 有給讀屏名稱時，用它取代內容文字，避免「名稱＋內容」重複念兩次
      excludeSemantics: widget.semanticLabel != null,
      child: FocusableActionDetector(
        enabled: _enabled,
        focusNode: _node,
        autofocus: widget.autofocus,
        mouseCursor: widget.mouseCursor ?? (_enabled ? SystemMouseCursors.click : SystemMouseCursors.forbidden),
        onShowHoverHighlight: (v) => setState(() => _hovered = v),
        onShowFocusHighlight: (v) => setState(() => _focused = v),
        actions: {
          ActivateIntent: CallbackAction<ActivateIntent>(onInvoke: (_) {
            _activate();
            return null;
          }),
        },
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTapDown: _enabled
              ? (_) {
                  // 點擊後拿到 focus，之後方向鍵等鍵盤操作才會作用在這個元件上
                  if (!_node.hasFocus) _node.requestFocus();
                  setState(() => _pressed = true);
                }
              : null,
          onTapUp: _enabled ? (_) => setState(() => _pressed = false) : null,
          onTapCancel: _enabled ? () => setState(() => _pressed = false) : null,
          onTap: _enabled ? _activate : null,
          onLongPress: widget.onLongPress,
          child: widget.builder(context, states),
        ),
      ),
    );
  }
}
