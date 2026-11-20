import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'dropdown.dart';
import 'menu_row.dart';

typedef AicdeContextMenuItem = AicdeMenuAction;

/// 右鍵選單：在 [child] 上按右鍵（或觸控長按）時，在指標位置開啟。
///
/// 鍵盤：[child] 內有焦點時按 Shift+F10 或選單鍵，在中央開啟。
class AicdeContextMenu extends StatefulWidget {
  const AicdeContextMenu({super.key, required this.items, required this.child, this.onSelected});

  final List<AicdeContextMenuItem> items;
  final ValueChanged<String>? onSelected;
  final Widget child;

  @override
  State<AicdeContextMenu> createState() => _AicdeContextMenuState();
}

class _AicdeContextMenuState extends State<AicdeContextMenu> {
  final _controller = OverlayPortalController();
  Offset? _pos;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _controller.show();
    });
  }

  void _openAt(Offset global) => setState(() => _pos = global);
  void _close() {
    if (_pos != null) setState(() => _pos = null);
  }

  void _openCenter() {
    final box = context.findRenderObject() as RenderBox?;
    if (box == null) return;
    _openAt(box.localToGlobal(box.size.center(Offset.zero)));
  }

  @override
  Widget build(BuildContext context) {
    return OverlayPortal(
      controller: _controller,
      overlayChildBuilder: (context) {
        if (_pos == null) return const SizedBox.shrink();
        final overlay = Overlay.of(context).context.findRenderObject() as RenderBox;
        final local = overlay.globalToLocal(_pos!);
        return Positioned.fill(
          child: CustomSingleChildLayout(
            delegate: _AtPoint(local),
            child: TapRegion(
              onTapOutside: (_) => _close(),
              child: CallbackShortcuts(
                bindings: {const SingleActivator(LogicalKeyboardKey.escape): _close},
                child: NavPopIn(
                  child: AicdeMenuPanel(
                    items: widget.items,
                    onSelect: (it) {
                      _close();
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
      child: CallbackShortcuts(
        bindings: {
          const SingleActivator(LogicalKeyboardKey.f10, shift: true): _openCenter,
          const SingleActivator(LogicalKeyboardKey.contextMenu): _openCenter,
        },
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onSecondaryTapDown: (d) => _openAt(d.globalPosition),
          onLongPressStart: (d) => _openAt(d.globalPosition),
          child: widget.child,
        ),
      ),
    );
  }
}

/// 把選單放在指標位置，超出畫面時往內推
class _AtPoint extends SingleChildLayoutDelegate {
  _AtPoint(this.point);
  final Offset point;

  @override
  BoxConstraints getConstraintsForChild(BoxConstraints constraints) => constraints.loosen();

  @override
  Offset getPositionForChild(Size size, Size child) {
    const m = 8.0;
    final x = math.max(m, math.min(point.dx, size.width - child.width - m));
    final y = math.max(m, math.min(point.dy, size.height - child.height - m));
    return Offset(x, y);
  }

  @override
  bool shouldRelayout(_AtPoint old) => old.point != point;
}
