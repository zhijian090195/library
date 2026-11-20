import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'menu_row.dart';

typedef AicdeDropdownItem = AicdeMenuAction;

enum AicdeDropdownAlign { left, right }

/// 下拉選單。觸發器由 [builder] 產生，拿到 `toggle` 自己決定何時開關。
///
/// ```dart
/// AicdeDropdown(
///   items: [AicdeMenuAction(id: 'edit', label: '編輯')],
///   onSelected: (id) {},
///   builder: (context, toggle, open) => AicdeButton(label: '更多', onPressed: toggle),
/// )
/// ```
/// 開啟後焦點移到第一個項目；上下鍵移動、Enter 執行、Esc 或點外面關閉。
class AicdeDropdown extends StatefulWidget {
  const AicdeDropdown({
    super.key,
    required this.builder,
    required this.items,
    this.align = AicdeDropdownAlign.left,
    this.open,
    this.onOpenChanged,
    this.onSelected,
  });

  final Widget Function(BuildContext context, VoidCallback toggle, bool open) builder;
  final List<AicdeDropdownItem> items;
  final AicdeDropdownAlign align;

  /// 受控的開關狀態；null 則由元件自己管理
  final bool? open;
  final ValueChanged<bool>? onOpenChanged;
  final ValueChanged<String>? onSelected;

  @override
  State<AicdeDropdown> createState() => _AicdeDropdownState();
}

class _AicdeDropdownState extends State<AicdeDropdown> {
  final _controller = OverlayPortalController();
  final _link = LayerLink();
  bool _inner = false;

  bool get _isOpen => widget.open ?? _inner;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _controller.show();
    });
  }

  void _set(bool v) {
    if (v == _isOpen) return;
    if (widget.open == null) setState(() => _inner = v);
    widget.onOpenChanged?.call(v);
  }

  @override
  Widget build(BuildContext context) {
    final right = widget.align == AicdeDropdownAlign.right;
    return OverlayPortal(
      controller: _controller,
      overlayChildBuilder: (context) {
        if (!_isOpen) return const SizedBox.shrink();
        return Positioned(
          left: 0,
          top: 0,
          child: CompositedTransformFollower(
            link: _link,
            showWhenUnlinked: false,
            targetAnchor: right ? Alignment.bottomRight : Alignment.bottomLeft,
            followerAnchor: right ? Alignment.topRight : Alignment.topLeft,
            offset: const Offset(0, 8),
            child: TapRegion(
              groupId: this,
              onTapOutside: (_) => _set(false),
              child: CallbackShortcuts(
                bindings: {const SingleActivator(LogicalKeyboardKey.escape): () => _set(false)},
                child: NavPopIn(
                  alignment: right ? Alignment.topRight : Alignment.topLeft,
                  child: AicdeMenuPanel(
                    items: widget.items,
                    onSelect: (it) {
                      _set(false);
                      it.onTap?.call();
                      widget.onSelected?.call(it.id);
                    },
                  ),
                ),
              ),
            ),
          ),
        );
      },
      child: CompositedTransformTarget(
        link: _link,
        child: TapRegion(
          groupId: this,
          child: widget.builder(context, () => _set(!_isOpen), _isOpen),
        ),
      ),
    );
  }
}

/// 彈出時從錨點方向輕微放大淡入
class NavPopIn extends StatelessWidget {
  const NavPopIn({super.key, required this.child, this.alignment = Alignment.topLeft});
  final Widget child;
  final Alignment alignment;
  @override
  Widget build(BuildContext context) {
    final d = navMotion(context, 1.2);
    if (d == Duration.zero) return child;
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: d,
      curve: Curves.easeOutCubic,
      builder: (context, v, child) => Opacity(
        opacity: v,
        child: Transform.scale(scale: .96 + .04 * v, alignment: alignment, child: child),
      ),
      child: child,
    );
  }
}
