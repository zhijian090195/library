import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';
import 'feedback_common.dart';
import 'modal.dart';

enum AicdeDrawerSide { right, left }

/// 抽屜面板的外觀。通常用 [showAicdeDrawer] 開啟。
class AicdeDrawer extends StatelessWidget {
  const AicdeDrawer({super.key, this.title, this.footer = const [], this.onClose, this.width = 380, required this.child});
  final String? title;
  final List<Widget> footer;
  final VoidCallback? onClose;
  final double width;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    return SizedBox(
      width: math.min(width, MediaQuery.sizeOf(context).width * .9),
      child: AicdeBox(
        kind: AicdeBoxKind.overlay,
        radius: 0,
        clip: true,
        child: SafeArea(
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Container(
              padding: const EdgeInsets.fromLTRB(22, 16, 14, 14),
              decoration: BoxDecoration(border: Border(bottom: BorderSide(color: t.strokeAll ? t.strokeColor : t.colors.line))),
              child: Row(children: [
                Expanded(child: Semantics(header: true, child: Text(title ?? '', style: t.heading(size: 17)))),
                if (onClose != null) AicdeCloseButton(onPressed: onClose),
              ]),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(22),
                child: DefaultTextStyle.merge(style: t.body(), child: child),
              ),
            ),
            if (footer.isNotEmpty)
              Container(
                padding: const EdgeInsets.fromLTRB(22, 12, 22, 16),
                decoration: BoxDecoration(border: Border(top: BorderSide(color: t.strokeAll ? t.strokeColor : t.colors.line))),
                child: Wrap(alignment: WrapAlignment.end, spacing: 10, runSpacing: 10, children: footer),
              ),
          ]),
        ),
      ),
    );
  }
}

/// 從側邊滑出抽屜，關閉時回傳 `Navigator.pop` 的值
Future<T?> showAicdeDrawer<T>(
  BuildContext context, {
  String? title,
  required WidgetBuilder builder,
  List<Widget> Function(BuildContext context)? footer,
  AicdeDrawerSide side = AicdeDrawerSide.right,
  bool closeOnBackdrop = true,
  bool showClose = true,
  double width = 380,
}) {
  final t = AicdeTheme.of(context);
  final theme = Theme.of(context);
  final right = side == AicdeDrawerSide.right;
  return showGeneralDialog<T>(
    context: context,
    barrierDismissible: closeOnBackdrop,
    barrierLabel: '關閉',
    barrierColor: aicdeBarrierColor(t),
    transitionDuration: aicdeDialogDuration(context),
    pageBuilder: (ctx, _, _) => Theme(
      data: theme,
      child: Builder(builder: (ctx) {
        void close() => Navigator.of(ctx).maybePop();
        return AicdeDialogShell(
          onDismiss: close,
          child: Align(
            alignment: right ? Alignment.centerRight : Alignment.centerLeft,
            child: AicdeDrawer(
              title: title,
              width: width,
              onClose: showClose ? close : null,
              footer: footer?.call(ctx) ?? const [],
              child: builder(ctx),
            ),
          ),
        );
      }),
    ),
    transitionBuilder: (ctx, a, _, child) => SlideTransition(
      position: Tween(begin: Offset(right ? 1 : -1, 0), end: Offset.zero).animate(CurvedAnimation(parent: a, curve: t.curve, reverseCurve: Curves.easeIn)),
      child: child,
    ),
  );
}
