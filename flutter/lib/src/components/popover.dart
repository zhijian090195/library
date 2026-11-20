import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../foundation/box.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';

/// 點擊觸發的彈出卡片。點外面或按 Esc 關閉。
///
/// ```dart
/// AicdePopover(
///   title: '分享',
///   content: const Text('複製連結給同事'),
///   trigger: (context, toggle) => AicdeButton(label: '分享', onPressed: toggle),
/// )
/// ```
/// 可受控（[open] + [onOpenChange]）或不受控（[defaultOpen]）。
class AicdePopover extends StatefulWidget {
  const AicdePopover({
    super.key,
    required this.trigger,
    required this.content,
    this.title,
    this.footer,
    this.open,
    this.defaultOpen = false,
    this.onOpenChange,
    this.width = 280,
  });

  final Widget Function(BuildContext context, VoidCallback toggle) trigger;
  final Widget content;
  final String? title;
  final Widget? footer;
  final bool? open;
  final bool defaultOpen;
  final ValueChanged<bool>? onOpenChange;
  final double width;

  @override
  State<AicdePopover> createState() => _AicdePopoverState();
}

class _AicdePopoverState extends State<AicdePopover> {
  final _link = LayerLink();
  final _portal = OverlayPortalController();
  late bool _inner = widget.defaultOpen;
  bool get _open => widget.open ?? _inner;

  void _set(bool v) {
    if (v == _open) return;
    if (widget.open == null) setState(() => _inner = v);
    widget.onOpenChange?.call(v);
  }

  void _sync() {
    if (_open && !_portal.isShowing) _portal.show();
    if (!_open && _portal.isShowing) _portal.hide();
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _sync();
    });
  }

  @override
  void didUpdateWidget(AicdePopover old) {
    super.didUpdateWidget(old);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _sync();
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_portal.isShowing != _open) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _sync();
      });
    }
    final t = AicdeTheme.of(context);
    final theme = Theme.of(context);
    final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    return CallbackShortcuts(
      bindings: {const SingleActivator(LogicalKeyboardKey.escape): () => _set(false)},
      child: TapRegion(
        groupId: this,
        onTapOutside: (_) => _set(false),
        child: CompositedTransformTarget(
          link: _link,
          child: OverlayPortal(
            controller: _portal,
            overlayChildBuilder: (_) => CompositedTransformFollower(
              link: _link,
              targetAnchor: Alignment.bottomCenter,
              followerAnchor: Alignment.topCenter,
              offset: const Offset(0, 10),
              child: Align(
                alignment: Alignment.topLeft,
                child: TapRegion(
                  groupId: this,
                  child: Theme(
                    data: theme,
                    child: CallbackShortcuts(
                      bindings: {const SingleActivator(LogicalKeyboardKey.escape): () => _set(false)},
                      child: Focus(
                        autofocus: true,
                        child: TweenAnimationBuilder<double>(
                          tween: Tween(begin: reduce ? 1 : 0, end: 1),
                          duration: t.motion,
                          curve: t.curve,
                          builder: (context, v, child) => Opacity(
                            opacity: v.clamp(0, 1),
                            child: Transform.translate(offset: Offset(0, (1 - v) * -6), child: child),
                          ),
                          child: Material(
                            type: MaterialType.transparency,
                            child: Semantics(
                              container: true,
                              scopesRoute: true,
                              explicitChildNodes: true,
                              child: SizedBox(
                                width: widget.width,
                                child: AicdeBox(
                                  kind: AicdeBoxKind.overlay,
                                  padding: const EdgeInsets.all(16),
                                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
                                    if (widget.title != null) ...[Text(widget.title!, style: t.heading(size: 15)), const SizedBox(height: 6)],
                                    DefaultTextStyle.merge(style: t.body(size: 13), child: widget.content),
                                    if (widget.footer != null) ...[const SizedBox(height: 12), widget.footer!],
                                  ]),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            child: widget.trigger(context, () => _set(!_open)),
          ),
        ),
      ),
    );
  }
}
