import 'dart:async';

import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';
import 'button.dart';
import 'feedback_common.dart';

/// 通知上的動作按鈕
class AicdeNotifyAction {
  const AicdeNotifyAction({required this.label, this.onPressed});
  final String label;
  final VoidCallback? onPressed;
}

class _Entry {
  _Entry({required this.id, required this.notice, required this.type, required this.duration, this.message, this.title, this.text, this.actions = const []});
  final int id;
  final bool notice;
  final AicdeFeedbackType type;
  final Duration duration;
  final String? message, title, text;
  final List<AicdeNotifyAction> actions;
  bool leaving = false;
}

/// 放在 App 最外層，負責顯示 Toast 與通知。
///
/// ```dart
/// MaterialApp(builder: (context, child) => AicdeToaster(child: child!))
/// ```
class AicdeToaster extends StatefulWidget {
  const AicdeToaster({super.key, required this.child, this.maxVisible = 5});
  final Widget child;
  final int maxVisible;

  @override
  State<AicdeToaster> createState() => AicdeToasterState();
}

class AicdeToasterState extends State<AicdeToaster> {
  static AicdeToasterState? _last;
  final _entries = <_Entry>[];
  int _seq = 0;

  @override
  void initState() {
    super.initState();
    _last = this;
  }

  @override
  void dispose() {
    if (_last == this) _last = null;
    super.dispose();
  }

  VoidCallback _add(_Entry Function(int id) make) {
    final e = make(++_seq);
    setState(() {
      _entries.add(e);
      final live = _entries.where((x) => !x.leaving).toList();
      if (live.length > widget.maxVisible) live.first.leaving = true;
    });
    return () => dismiss(e.id);
  }

  void dismiss(int id) {
    final i = _entries.indexWhere((e) => e.id == id);
    if (i < 0 || _entries[i].leaving || !mounted) return;
    setState(() => _entries[i].leaving = true);
  }

  void _remove(int id) {
    if (mounted) setState(() => _entries.removeWhere((e) => e.id == id));
  }

  @override
  Widget build(BuildContext context) {
    final narrow = MediaQuery.sizeOf(context).width < 520;
    return Stack(children: [
      widget.child,
      Positioned(
        right: narrow ? 12 : 24,
        left: narrow ? 12 : null,
        bottom: 24,
        child: SafeArea(
          child: Material(
            type: MaterialType.transparency,
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 380),
              child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.end, children: [
                for (final e in _entries)
                  _ToastItem(key: ValueKey(e.id), entry: e, onDismiss: () => dismiss(e.id), onGone: () => _remove(e.id)),
              ]),
            ),
          ),
        ),
      ),
    ]);
  }
}

/// 命令式 API，和 React 版的 `toast()` / `notify()` 對應。回傳的函式可提早關閉。
abstract final class AicdeToast {
  static AicdeToasterState _of(BuildContext context) {
    final s = context.findAncestorStateOfType<AicdeToasterState>() ?? AicdeToasterState._last;
    assert(s != null, '找不到 AicdeToaster：請在 MaterialApp.builder 包一層 AicdeToaster');
    return s!;
  }

  /// 簡短訊息，預設 3 秒後消失；[duration] 傳 Duration.zero 則不會自動關
  static VoidCallback show(BuildContext context, String message, {AicdeFeedbackType type = AicdeFeedbackType.info, Duration duration = const Duration(milliseconds: 3000)}) =>
      _of(context)._add((id) => _Entry(id: id, notice: false, type: type, duration: duration, message: message));

  /// 帶標題、說明與動作的通知，預設 4.5 秒
  static VoidCallback notify(
    BuildContext context, {
    required String title,
    String? text,
    AicdeFeedbackType type = AicdeFeedbackType.info,
    List<AicdeNotifyAction> actions = const [],
    Duration duration = const Duration(milliseconds: 4500),
  }) =>
      _of(context)._add((id) => _Entry(id: id, notice: true, type: type, duration: duration, title: title, text: text, actions: actions));
}

class _ToastItem extends StatefulWidget {
  const _ToastItem({super.key, required this.entry, required this.onDismiss, required this.onGone});
  final _Entry entry;
  final VoidCallback onDismiss, onGone;
  @override
  State<_ToastItem> createState() => _ToastItemState();
}

class _ToastItemState extends State<_ToastItem> {
  Timer? _timer, _goneTimer;
  bool _in = false, _goneScheduled = false;

  void _start() {
    _timer?.cancel();
    if (widget.entry.duration > Duration.zero) _timer = Timer(widget.entry.duration, widget.onDismiss);
  }

  @override
  void initState() {
    super.initState();
    _start();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) setState(() => _in = true);
    });
  }

  @override
  void didUpdateWidget(_ToastItem old) {
    super.didUpdateWidget(old);
    if (widget.entry.leaving && !_goneScheduled) {
      _goneScheduled = true;
      _timer?.cancel();
      final reduce = aicdeReduceMotion(context);
      _goneTimer = Timer(reduce ? Duration.zero : const Duration(milliseconds: 200), widget.onGone);
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _goneTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final e = widget.entry;
    final c = aicdeFeedbackColor(t, e.type);
    final shown = _in && !e.leaving;
    final dur = aicdeReduceMotion(context) ? Duration.zero : (e.leaving ? const Duration(milliseconds: 200) : t.motion + const Duration(milliseconds: 100));

    final Widget body = e.notice
        ? Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Icon(aicdeFeedbackIcon(e.type), color: c, size: 22),
            const SizedBox(width: 12),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
                Text(e.title!, style: t.heading(size: 14)),
                if (e.text != null) Padding(padding: const EdgeInsets.only(top: 2), child: Text(e.text!, style: t.body(size: 13, color: t.colors.ink2))),
                if (e.actions.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 10),
                    child: Wrap(spacing: 8, runSpacing: 8, children: [
                      for (final (i, a) in e.actions.indexed)
                        AicdeButton(
                          label: a.label,
                          size: AicdeButtonSize.sm,
                          variant: i == 0 ? AicdeButtonVariant.primary : AicdeButtonVariant.ghost,
                          onPressed: () {
                            a.onPressed?.call();
                            widget.onDismiss();
                          },
                        ),
                    ]),
                  ),
              ]),
            ),
            const SizedBox(width: 4),
            AicdeCloseButton(onPressed: widget.onDismiss, size: 24),
          ])
        : Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Container(
              margin: const EdgeInsets.only(top: 7),
              width: 8,
              height: 8,
              decoration: BoxDecoration(color: c, borderRadius: BorderRadius.circular(t.rPill == 0 ? 0 : 4)),
            ),
            const SizedBox(width: 10),
            Flexible(child: Text(e.message!, style: t.body())),
            const SizedBox(width: 6),
            AicdeCloseButton(onPressed: widget.onDismiss, size: 24),
          ]);

    return Semantics(
      liveRegion: true,
      container: true,
      child: AnimatedOpacity(
        opacity: shown ? 1 : 0,
        duration: dur,
        child: AnimatedSlide(
          offset: shown ? Offset.zero : const Offset(0, .25),
          duration: dur,
          curve: t.curve,
          child: Padding(
            padding: const EdgeInsets.only(top: 10),
            child: MouseRegion(
              onEnter: (_) => _timer?.cancel(),
              onExit: (_) {
                if (!e.leaving) _start();
              },
              child: AicdeBox(
                kind: AicdeBoxKind.overlay,
                radius: e.notice ? t.rLg : t.rMd,
                padding: e.notice ? const EdgeInsets.all(16) : const EdgeInsets.fromLTRB(14, 12, 10, 12),
                child: body,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
