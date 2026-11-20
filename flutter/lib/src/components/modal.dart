import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../foundation/box.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';
import '../theme/tokens.dart';
import 'feedback_common.dart';

/// 對話框的外觀（標題列、內容、底部按鈕）。通常用 [showAicdeModal] 開啟，
/// 也可以直接放在自己的 route 裡。
class AicdeModal extends StatelessWidget {
  const AicdeModal({
    super.key,
    this.title,
    this.footer = const [],
    this.onClose,
    this.width = 480,
    required this.child,
  });
  final String? title;

  /// 右下角的按鈕，例如取消／確認
  final List<Widget> footer;
  final VoidCallback? onClose;
  final double width;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final mq = MediaQuery.sizeOf(context);
    return ConstrainedBox(
      constraints: BoxConstraints(maxWidth: width, maxHeight: mq.height - 48),
      child: AicdeBox(
        kind: AicdeBoxKind.overlay,
        radius: t.rLg + 4,
        clip: true,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (title != null || onClose != null)
              Padding(
                padding: const EdgeInsets.fromLTRB(22, 18, 14, 4),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Semantics(
                        header: true,
                        child: Text(title ?? '', style: t.heading(size: 18)),
                      ),
                    ),
                    if (onClose != null) AicdeCloseButton(onPressed: onClose),
                  ],
                ),
              ),
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(22, 8, 22, 18),
                child: DefaultTextStyle.merge(style: t.body(), child: child),
              ),
            ),
            if (footer.isNotEmpty)
              Container(
                padding: const EdgeInsets.fromLTRB(22, 12, 22, 18),
                decoration: t.style == AicdeThemeStyle.editorial || t.strokeAll
                    ? BoxDecoration(
                        border: Border(
                          top: BorderSide(
                            color: t.strokeAll ? t.strokeColor : t.colors.line,
                          ),
                        ),
                      )
                    : null,
                child: Wrap(
                  alignment: WrapAlignment.end,
                  spacing: 10,
                  runSpacing: 10,
                  children: footer,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// Esc 關閉；焦點鎖在對話框內（route 自帶 FocusScope，Tab 不會跑出去）
class AicdeDialogShell extends StatelessWidget {
  const AicdeDialogShell({
    super.key,
    required this.onDismiss,
    required this.child,
  });
  final VoidCallback onDismiss;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return CallbackShortcuts(
      bindings: {const SingleActivator(LogicalKeyboardKey.escape): onDismiss},
      child: FocusScope(
        autofocus: true,
        child: Material(type: MaterialType.transparency, child: child),
      ),
    );
  }
}

Duration aicdeDialogDuration(BuildContext context) {
  final t = AicdeTheme.of(context);
  return aicdeReduceMotion(context)
      ? const Duration(milliseconds: 1)
      : t.motion + const Duration(milliseconds: 80);
}

Color aicdeBarrierColor(AicdeTokens t) =>
    (t.isDark ? const Color(0xFF000000) : t.colors.navy).withValues(
      alpha: t.isDark ? .6 : .42,
    );

/// 開啟對話框，關閉時回傳 `Navigator.pop` 的值。
///
/// ```dart
/// final ok = await showAicdeModal<bool>(context,
///   title: '刪除專案？',
///   builder: (context) => const Text('刪除後無法復原。'),
///   footer: (context) => [
///     AicdeButton(label: '取消', onPressed: () => Navigator.pop(context, false)),
///     AicdeButton(label: '刪除', variant: AicdeButtonVariant.danger, onPressed: () => Navigator.pop(context, true)),
///   ],
/// );
/// ```
Future<T?> showAicdeModal<T>(
  BuildContext context, {
  String? title,
  required WidgetBuilder builder,
  List<Widget> Function(BuildContext context)? footer,
  bool closeOnBackdrop = true,
  bool showClose = true,
  double width = 480,
}) {
  final t = AicdeTheme.of(context);
  final theme = Theme.of(context);
  return showGeneralDialog<T>(
    context: context,
    barrierDismissible: closeOnBackdrop,
    barrierLabel: '關閉',
    barrierColor: aicdeBarrierColor(t),
    transitionDuration: aicdeDialogDuration(context),
    pageBuilder: (ctx, _, _) => Theme(
      data: theme,
      child: Builder(
        builder: (ctx) {
          void close() => Navigator.of(ctx).maybePop();
          return AicdeDialogShell(
            onDismiss: close,
            child: SafeArea(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  // 對話框的讀屏語意：自成一個 route、用標題命名（對應 role="dialog" + aria-labelledby）
                  child: Semantics(
                    scopesRoute: true,
                    namesRoute: true,
                    explicitChildNodes: true,
                    label: title,
                    child: AicdeModal(
                      title: title,
                      width: width,
                      onClose: showClose ? close : null,
                      footer: footer?.call(ctx) ?? const [],
                      child: builder(ctx),
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    ),
    transitionBuilder: (ctx, a, _, child) {
      final curved = CurvedAnimation(
        parent: a,
        curve: t.curve,
        reverseCurve: Curves.easeIn,
      );
      return FadeTransition(
        opacity: a,
        child: ScaleTransition(
          scale: Tween(begin: .94, end: 1.0).animate(curved),
          child: child,
        ),
      );
    },
  );
}
