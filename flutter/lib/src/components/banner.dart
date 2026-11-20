import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';
import 'feedback_common.dart';

enum AicdeBannerColor { navy, coral }

/// 頁面頂部的公告橫幅。可關閉；沒傳 [onClose] 時自己收起來。
class AicdeBanner extends StatefulWidget {
  const AicdeBanner({super.key, this.color = AicdeBannerColor.navy, this.flush = false, this.tag, this.closable = true, this.onClose, required this.child});
  final AicdeBannerColor color;

  /// 貼齊頁面邊緣（無圓角）
  final bool flush;
  final String? tag;
  final bool closable;
  final VoidCallback? onClose;
  final Widget child;

  @override
  State<AicdeBanner> createState() => _AicdeBannerState();
}

class _AicdeBannerState extends State<AicdeBanner> {
  bool _closed = false;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final fill = widget.color == AicdeBannerColor.navy ? t.colors.navy : t.colors.coral;
    final fg = const Color(0xFFFFFFFF);
    final dur = aicdeReduceMotion(context) ? Duration.zero : const Duration(milliseconds: 200);
    return AnimatedSize(
      duration: dur,
      child: _closed
          ? const SizedBox(width: double.infinity)
          : Semantics(
              container: true,
              child: AicdeBox(
                kind: AicdeBoxKind.panel,
                fill: fill,
                radius: widget.flush ? 0 : t.rMd,
                padding: const EdgeInsets.fromLTRB(16, 10, 12, 10),
                child: Row(children: [
                  if (widget.tag != null) ...[
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: fg.withValues(alpha: .18), borderRadius: BorderRadius.circular(t.tagRadius.clamp(0, 12))),
                      child: Text(t.labelText(widget.tag!), style: t.label(size: 11, color: fg)),
                    ),
                    const SizedBox(width: 12),
                  ],
                  Expanded(child: DefaultTextStyle.merge(style: t.body(color: fg), child: widget.child)),
                  if (widget.closable)
                    AicdeCloseButton(
                      size: 26,
                      color: fg,
                      onPressed: () {
                        if (widget.onClose != null) {
                          widget.onClose!();
                        } else {
                          setState(() => _closed = true);
                        }
                      },
                    ),
                ]),
              ),
            ),
    );
  }
}
