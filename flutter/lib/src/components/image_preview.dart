import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/pressable.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';

/// 圖片預覽：點縮圖後，大圖從縮圖的位置放大；關閉時縮回原位（Esc、點背景或 × 關閉）。
///
/// ```dart
/// AicdeImagePreview(image: AssetImage('assets/cover.webp'), alt: '封面')
/// ```
class AicdeImagePreview extends StatefulWidget {
  const AicdeImagePreview({
    super.key,
    required this.image,
    required this.alt,
    this.previewImage,
    this.width = 160,
    this.height = 110,
    this.onTap,
  });

  final ImageProvider image;

  /// 大圖，預設與 [image] 相同
  final ImageProvider? previewImage;

  /// 替代文字，也會顯示為大圖說明
  final String alt;
  final double width, height;

  /// 點縮圖時額外呼叫
  final VoidCallback? onTap;

  @override
  State<AicdeImagePreview> createState() => _AicdeImagePreviewState();
}

class _AicdeImagePreviewState extends State<AicdeImagePreview> {
  final _tag = Object();
  final _focus = FocusNode();

  @override
  void dispose() {
    _focus.dispose();
    super.dispose();
  }

  Future<void> _open() async {
    widget.onTap?.call();
    final t = AicdeTheme.of(context);
    final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    await Navigator.of(context).push(PageRouteBuilder<void>(
      opaque: false,
      barrierDismissible: true,
      barrierLabel: '關閉',
      barrierColor: const Color(0xD90B1A21),
      transitionDuration: reduce ? Duration.zero : const Duration(milliseconds: 340),
      reverseTransitionDuration: reduce ? Duration.zero : const Duration(milliseconds: 200),
      pageBuilder: (context, anim, _) => AicdeTheme(
        style: t.style,
        mode: t.isDark ? ThemeMode.dark : ThemeMode.light,
        child: _Lightbox(tag: _tag, image: widget.previewImage ?? widget.image, alt: widget.alt),
      ),
      transitionsBuilder: (context, anim, _, child) => FadeTransition(opacity: anim, child: child),
    ));
    if (mounted) _focus.requestFocus();
  }

  @override
  Widget build(BuildContext context) {
    return AicdePressable(
      onTap: _open,
      focusNode: _focus,
      semanticLabel: widget.alt,
      builder: (context, s) => AicdeBox(
        kind: AicdeBoxKind.card,
        states: s,
        width: widget.width,
        height: widget.height,
        radius: AicdeTheme.of(context).rMd,
        clip: true,
        child: Hero(
          tag: _tag,
          child: Image(image: widget.image, fit: BoxFit.cover, width: widget.width, height: widget.height, semanticLabel: widget.alt),
        ),
      ),
    );
  }
}

class _Lightbox extends StatelessWidget {
  const _Lightbox({required this.tag, required this.image, required this.alt});
  final Object tag;
  final ImageProvider image;
  final String alt;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    void close() => Navigator.of(context).maybePop();
    return Semantics(
      scopesRoute: true,
      explicitChildNodes: true,
      namesRoute: true,
      label: alt,
      child: Stack(children: [
        Positioned.fill(child: GestureDetector(behavior: HitTestBehavior.opaque, onTap: close)),
        Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: GestureDetector(
              onTap: close,
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                Flexible(
                  child: Hero(
                    tag: tag,
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(t.rMd),
                      child: Image(image: image, fit: BoxFit.contain, semanticLabel: alt),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(alt, textAlign: TextAlign.center, style: t.body(color: const Color(0xE6FFFFFF))),
              ]),
            ),
          ),
        ),
        Positioned(
          top: 16,
          right: 16,
          child: SafeArea(
            child: AicdePressable(
              onTap: close,
              semanticLabel: '關閉',
              autofocus: true,
              builder: (context, s) => AnimatedContainer(
                duration: t.motion,
                width: 40,
                height: 40,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: Color(s.hovered ? 0x40FFFFFF : 0x26FFFFFF),
                  borderRadius: BorderRadius.circular(t.rPill.clamp(0, 20)),
                  border: s.focused ? Border.all(color: t.focusColor, width: 2) : null,
                ),
                child: const Text('×', style: TextStyle(color: Color(0xFFFFFFFF), fontSize: 24, height: 1)),
              ),
            ),
          ),
        ),
      ]),
    );
  }
}
