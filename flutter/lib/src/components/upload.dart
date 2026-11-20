import 'package:flutter/material.dart';

import '../foundation/painters.dart';
import '../foundation/pressable.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';

/// 上傳清單裡的一個檔案
@immutable
class AicdeUploadFile {
  const AicdeUploadFile({required this.name, this.size, this.progress, this.error, this.id});

  /// 唯一識別，預設用檔名
  final String? id;
  final String name;

  /// 位元組數
  final int? size;

  /// 0–1 上傳進度；null 表示已完成或不顯示
  final double? progress;

  /// 失敗訊息
  final String? error;

  String get key => id ?? name;

  AicdeUploadFile copyWith({double? progress, String? error, bool clearProgress = false}) => AicdeUploadFile(
        id: id, name: name, size: size,
        progress: clearProgress ? null : (progress ?? this.progress),
        error: error ?? this.error,
      );
}

String _fmtSize(int b) => b < 1024
    ? '$b B'
    : b < 1048576
        ? '${(b / 1024).round()} KB'
        : '${(b / 1048576).toStringAsFixed(1)} MB';

/// 上傳區＋檔案清單。
///
/// 元件本身不依賴任何套件：點擊時呼叫 [onPick]，由 App 用自己喜歡的方式（例如 `file_picker`）選檔，
/// 回傳的檔案會加進清單。進度、錯誤、刪除都由 [files] / [onChanged] 控制。
/// 桌面拖放可搭配 `desktop_drop` 等套件，把拖曳狀態傳給 [dragging]。
class AicdeUpload extends StatefulWidget {
  const AicdeUpload({
    super.key,
    this.onPick,
    this.files,
    this.onChanged,
    this.multiple = false,
    this.enabled = true,
    this.title,
    this.hint,
    this.showList = true,
    this.dragging = false,
    this.maxWidth = 420,
  });

  /// 點擊上傳區時呼叫；回傳 null 或空清單代表取消
  final Future<List<AicdeUploadFile>?> Function()? onPick;

  /// 受控的檔案清單；null 時元件自己管理
  final List<AicdeUploadFile>? files;
  final ValueChanged<List<AicdeUploadFile>>? onChanged;

  /// false 時一次只保留一個檔案
  final bool multiple;
  final bool enabled;
  final Widget? title;
  final String? hint;
  final bool showList;

  /// 外部拖放套件回報「檔案正拖在上面」
  final bool dragging;
  final double maxWidth;

  @override
  State<AicdeUpload> createState() => _AicdeUploadState();
}

class _AicdeUploadState extends State<AicdeUpload> {
  List<AicdeUploadFile> _own = [];
  bool _busy = false;
  List<AicdeUploadFile> get _files => widget.files ?? _own;

  void _set(List<AicdeUploadFile> next) {
    if (widget.files == null) setState(() => _own = next);
    widget.onChanged?.call(next);
  }

  Future<void> _pick() async {
    if (_busy || widget.onPick == null) return;
    setState(() => _busy = true);
    try {
      final got = await widget.onPick!();
      if (got == null || got.isEmpty || !mounted) return;
      _set(widget.multiple ? [..._files, ...got] : [got.first]);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final dur = reduce ? Duration.zero : t.motion;
    final enabled = widget.enabled && widget.onPick != null;
    final r = t.rMd.clamp(0, 24).toDouble();

    return ConstrainedBox(
      constraints: BoxConstraints(maxWidth: widget.maxWidth),
      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        AicdePressable(
          onTap: enabled ? _pick : null,
          semanticLabel: '上傳檔案',
          builder: (context, s) {
            final hot = widget.dragging || s.hovered;
            final edge = widget.dragging || s.focused ? c.coral : (hot ? c.coral.withValues(alpha: .7) : (t.strokeAll ? t.strokeColor : c.lineStrong));
            return AnimatedScale(
              scale: widget.dragging ? 1.01 : 1,
              duration: dur,
              curve: t.curve,
              child: Opacity(
                opacity: s.disabled ? .55 : 1,
                child: CustomPaint(
                  foregroundPainter: DashedRRectPainter(
                    color: edge,
                    radius: BorderRadius.circular(r),
                    inset: .75,
                    strokeWidth: t.strokeAll ? t.strokeWidth.clamp(1.5, 2.5) : 1.5,
                    dash: 6,
                    gap: 4,
                  ),
                  child: AnimatedContainer(
                    duration: dur,
                    padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
                    decoration: BoxDecoration(
                      color: widget.dragging ? Color.lerp(c.surface, c.coral, .05) : c.surface,
                      borderRadius: BorderRadius.circular(r),
                      boxShadow: s.focused ? [BoxShadow(color: c.surface, spreadRadius: 2), BoxShadow(color: t.focusColor, spreadRadius: 4)] : null,
                    ),
                    child: Column(mainAxisSize: MainAxisSize.min, children: [
                      AnimatedContainer(
                        duration: dur,
                        curve: t.curve,
                        width: 44,
                        height: 44,
                        margin: const EdgeInsets.only(bottom: 12),
                        transform: Matrix4.translationValues(0, hot && !reduce ? -3 : 0, 0),
                        decoration: BoxDecoration(color: c.surface2, borderRadius: BorderRadius.circular(r)),
                        child: _busy
                            ? Padding(padding: const EdgeInsets.all(12), child: CircularProgressIndicator(strokeWidth: 2, color: c.band))
                            : Icon(Icons.file_upload_outlined, size: 22, color: c.band),
                      ),
                      DefaultTextStyle.merge(
                        textAlign: TextAlign.center,
                        style: t.body(size: 14, color: c.ink).copyWith(fontWeight: FontWeight.w500, height: 1.5),
                        child: widget.title ??
                            Text.rich(TextSpan(children: [
                              const TextSpan(text: '把檔案拖到這裡，或 '),
                              TextSpan(text: '點擊選擇', style: TextStyle(color: c.coral, fontWeight: FontWeight.w700)),
                            ])),
                      ),
                      if (widget.hint != null) ...[
                        const SizedBox(height: 6),
                        Text(widget.hint!, textAlign: TextAlign.center, style: t.caption(size: 12, color: c.ink3)),
                      ],
                    ]),
                  ),
                ),
              ),
            );
          },
        ),
        if (widget.showList && _files.isNotEmpty) ...[
          const SizedBox(height: 8),
          for (final f in _files)
            Padding(
              key: ValueKey(f.key),
              padding: const EdgeInsets.only(bottom: 6),
              child: _FileRow(file: f, reduce: reduce, onRemove: widget.enabled ? () => _set(_files.where((x) => x.key != f.key).toList()) : null),
            ),
        ],
      ]),
    );
  }
}

class _FileRow extends StatelessWidget {
  const _FileRow({required this.file, required this.reduce, this.onRemove});
  final AicdeUploadFile file;
  final bool reduce;
  final VoidCallback? onRemove;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final err = file.error != null;
    final row = Container(
      padding: const EdgeInsets.fromLTRB(12, 8, 4, 8),
      decoration: BoxDecoration(
        color: c.surface,
        border: Border.all(color: err ? c.danger : (t.strokeAll ? t.strokeColor : c.line), width: t.strokeAll ? t.strokeWidth.clamp(1, 2) : 1),
        borderRadius: BorderRadius.circular(t.rSm.clamp(0, 12)),
      ),
      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Row(children: [
          Icon(err ? Icons.error_outline_rounded : Icons.insert_drive_file_outlined, size: 16, color: err ? c.danger : c.ink3),
          const SizedBox(width: 8),
          Expanded(child: Text(file.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: t.body(size: 13, color: err ? c.danger : c.inkBody).copyWith(height: 1.4))),
          if (file.size != null) ...[
            const SizedBox(width: 10),
            Text(_fmtSize(file.size!), style: t.number(size: 12, weight: FontWeight.w400, color: c.ink3)),
          ],
          AicdePressable(
            onTap: onRemove,
            semanticLabel: '移除${file.name}',
            builder: (context, s) => AnimatedContainer(
              duration: t.motion,
              margin: const EdgeInsets.only(left: 4),
              width: 26, height: 26,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: s.hovered ? c.coral.withValues(alpha: .14) : null,
                border: s.focused ? Border.all(color: t.focusColor, width: 2) : null,
              ),
              child: Icon(Icons.close_rounded, size: 15, color: s.hovered ? c.coralDark : c.ink3),
            ),
          ),
        ]),
        if (err)
          Padding(padding: const EdgeInsets.only(top: 4, left: 24), child: Text(file.error!, style: t.caption(size: 12, color: c.danger)))
        else if (file.progress != null)
          Padding(
            padding: const EdgeInsets.only(top: 6, left: 24, right: 8),
            child: Semantics(
              label: '上傳進度',
              value: '${(file.progress! * 100).round()}%',
              child: ClipRRect(
                borderRadius: BorderRadius.circular(t.rPill == 0 ? 0 : 3),
                child: TweenAnimationBuilder<double>(
                  tween: Tween(end: file.progress!.clamp(0, 1)),
                  duration: reduce ? Duration.zero : const Duration(milliseconds: 240),
                  builder: (context, v, _) => LinearProgressIndicator(value: v, minHeight: 4, color: t.primary, backgroundColor: c.surface2),
                ),
              ),
            ),
          ),
      ]),
    );
    if (reduce) return row;
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: const Duration(milliseconds: 220),
      curve: t.curve,
      builder: (context, v, child) => Opacity(opacity: v.clamp(0, 1), child: Transform.translate(offset: Offset(0, 6 * (1 - v)), child: child)),
      child: row,
    );
  }
}
