import 'package:flutter/material.dart';

export '../foundation/field.dart';
import 'package:flutter/services.dart';

import '../foundation/box.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';

/// 錨定在觸發元件下方的浮層（下拉清單、級聯面板、選色面板共用）。
///
/// 點外面或按 Esc 會呼叫 [onDismiss]；浮層用 [AicdeBoxKind.overlay] 畫外觀，
/// 會自動繼承觸發元件所在位置的主題。
class AicdeAnchoredOverlay extends StatefulWidget {
  const AicdeAnchoredOverlay({
    super.key,
    required this.open,
    required this.onDismiss,
    required this.overlayBuilder,
    required this.child,
    this.gap = 6,
    this.matchWidth = true,
    this.padding = const EdgeInsets.all(4),
  });

  final bool open;
  final VoidCallback onDismiss;

  /// [anchorWidth] 為觸發元件寬度
  final Widget Function(BuildContext context, double anchorWidth) overlayBuilder;
  final Widget child;
  final double gap;

  /// 浮層最小寬度等於觸發元件
  final bool matchWidth;
  final EdgeInsetsGeometry padding;

  @override
  State<AicdeAnchoredOverlay> createState() => _AicdeAnchoredOverlayState();
}

class _AicdeAnchoredOverlayState extends State<AicdeAnchoredOverlay> {
  final _link = LayerLink();
  final _ctrl = OverlayPortalController();
  final _key = GlobalKey();
  late final Object _group = Object();

  @override
  void initState() {
    super.initState();
    // 浮層容器常駐（不在 build 期間 show/hide），開關只決定裡面畫不畫東西
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted && !_ctrl.isShowing) _ctrl.show();
    });
  }

  double get _anchorWidth => (_key.currentContext?.findRenderObject() as RenderBox?)?.size.width ?? 200;

  @override
  Widget build(BuildContext context) {
    return CallbackShortcuts(
      bindings: {const SingleActivator(LogicalKeyboardKey.escape): widget.onDismiss},
      child: OverlayPortal(
        controller: _ctrl,
        overlayChildBuilder: (ctx) {
          if (!widget.open) return const SizedBox.shrink();
          final w = _anchorWidth;
          return Align(
            alignment: Alignment.topLeft,
            child: CompositedTransformFollower(
              link: _link,
              showWhenUnlinked: false,
              targetAnchor: Alignment.bottomLeft,
              offset: Offset(0, widget.gap),
              child: TapRegion(
                groupId: _group,
                onTapOutside: (_) => widget.onDismiss(),
                child: ConstrainedBox(
                  constraints: BoxConstraints(minWidth: widget.matchWidth ? w : 0),
                  child: AicdeBox(
                    kind: AicdeBoxKind.overlay,
                    padding: widget.padding,
                    child: widget.overlayBuilder(ctx, w),
                  ),
                ),
              ),
            ),
          );
        },
        child: TapRegion(
          groupId: _group,
          child: CompositedTransformTarget(link: _link, child: KeyedSubtree(key: _key, child: widget.child)),
        ),
      ),
    );
  }
}

/// 觸發元件旁的小箭頭
class AicdeOverlayChevron extends StatelessWidget {
  const AicdeOverlayChevron({super.key, required this.open, required this.color, this.duration = const Duration(milliseconds: 160)});
  final bool open;
  final Color color;
  final Duration duration;
  @override
  Widget build(BuildContext context) => AnimatedRotation(
        turns: open ? .5 : 0,
        duration: duration,
        child: Icon(Icons.keyboard_arrow_down_rounded, size: 20, color: color),
      );
}

/// 浮層裡的一列選項（自動完成、級聯）：滑過或鍵盤選中時用主題的選取色
class AicdeOptionRow extends StatefulWidget {
  const AicdeOptionRow({
    super.key,
    required this.child,
    this.onTap,
    this.active = false,
    this.selected = false,
    this.trailing,
    this.onHover,
  });
  final Widget child;
  final VoidCallback? onTap;

  /// 鍵盤游標所在
  final bool active;

  /// 目前已選的值
  final bool selected;
  final Widget? trailing;
  final VoidCallback? onHover;

  @override
  State<AicdeOptionRow> createState() => _AicdeOptionRowState();
}

class _AicdeOptionRowState extends State<AicdeOptionRow> {
  bool _hover = false;
  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final on = widget.active || _hover || widget.selected;
    final disabled = widget.onTap == null;
    final fg = disabled ? c.ink3 : (on && (widget.selected || widget.active) ? t.selectionFg : c.inkBody);
    final transparentSel = t.selectionBg.a == 0;
    return MouseRegion(
      cursor: disabled ? SystemMouseCursors.forbidden : SystemMouseCursors.click,
      onEnter: (_) {
        setState(() => _hover = true);
        widget.onHover?.call();
      },
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 100),
          constraints: const BoxConstraints(minHeight: 34),
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
          decoration: BoxDecoration(
            color: disabled
                ? null
                : (widget.selected || widget.active)
                    ? (transparentSel ? c.surface2 : t.selectionBg)
                    : (_hover ? c.surface2 : null),
            borderRadius: BorderRadius.circular(t.rSm.clamp(0, 10)),
          ),
          child: DefaultTextStyle.merge(
            style: t.body(size: 14, color: fg).copyWith(
                  fontWeight: widget.selected ? FontWeight.w600 : FontWeight.w400,
                  height: 1.3,
                ),
            child: Row(children: [
              Expanded(child: widget.child),
              if (widget.trailing != null) ...[const SizedBox(width: 8), IconTheme.merge(data: IconThemeData(color: fg, size: 16), child: widget.trailing!)],
            ]),
          ),
        ),
      ),
    );
  }
}

