import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/pressable.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';
import 'feedback_common.dart';

enum AicdeFloatButtonColor { coral, navy }

enum AicdeFloatButtonSize { md, sm }

/// 浮動按鈕。放在 `Scaffold.floatingActionButton` 或自行定位。
/// [label] 有值且 [extended] 為 true 時顯示文字；只有圖示時 [label] 作為朗讀文字。
class AicdeFloatButton extends StatelessWidget {
  const AicdeFloatButton({super.key, required this.onPressed, this.icon = const Icon(Icons.add_rounded), this.label, this.extended = false, this.color = AicdeFloatButtonColor.coral, this.size = AicdeFloatButtonSize.md});
  final VoidCallback? onPressed;
  final Widget icon;
  final String? label;
  final bool extended;
  final AicdeFloatButtonColor color;
  final AicdeFloatButtonSize size;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final fill = color == AicdeFloatButtonColor.coral ? t.colors.coral : t.colors.navy;
    final d = size == AicdeFloatButtonSize.md ? 52.0 : 40.0;
    final showLabel = extended && label != null;
    final round = t.rPill >= 999 || t.buttonRadius >= 999 || !t.strokeAll && t.rPill > 20;
    return Semantics(
      label: showLabel ? null : label,
      child: AicdePressable(
        onTap: onPressed,
        builder: (context, s) => AicdeBox(
          kind: AicdeBoxKind.control,
          fill: fill,
          states: s,
          height: d,
          width: showLabel ? null : d,
          radius: round ? 999 : t.buttonRadius,
          padding: showLabel ? const EdgeInsets.symmetric(horizontal: 20) : EdgeInsets.zero,
          alignment: Alignment.center,
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            IconTheme.merge(data: IconThemeData(color: const Color(0xFFFFFFFF), size: d * .46), child: icon),
            if (showLabel) ...[const SizedBox(width: 8), Text(t.labelText(label!), style: t.label(color: const Color(0xFFFFFFFF)))],
          ]),
        ),
      ),
    );
  }
}

/// 回到頂部：捲動超過 [threshold] 才出現
class AicdeBackTop extends StatefulWidget {
  const AicdeBackTop({super.key, required this.controller, this.threshold = 300, this.color = AicdeFloatButtonColor.navy, this.size = AicdeFloatButtonSize.md});
  final ScrollController controller;
  final double threshold;
  final AicdeFloatButtonColor color;
  final AicdeFloatButtonSize size;

  @override
  State<AicdeBackTop> createState() => _AicdeBackTopState();
}

class _AicdeBackTopState extends State<AicdeBackTop> {
  bool _show = false;

  void _onScroll() {
    final v = widget.controller.hasClients && widget.controller.offset > widget.threshold;
    if (v != _show) setState(() => _show = v);
  }

  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_onScroll);
  }

  @override
  void dispose() {
    widget.controller.removeListener(_onScroll);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final reduce = aicdeReduceMotion(context);
    final dur = reduce ? Duration.zero : const Duration(milliseconds: 200);
    return IgnorePointer(
      ignoring: !_show,
      child: AnimatedOpacity(
        opacity: _show ? 1 : 0,
        duration: dur,
        child: AnimatedScale(
          scale: _show ? 1 : .8,
          duration: dur,
          child: AicdeFloatButton(
            label: '回到頂部',
            color: widget.color,
            size: widget.size,
            icon: const Icon(Icons.arrow_upward_rounded),
            onPressed: () => widget.controller.animateTo(0, duration: reduce ? const Duration(milliseconds: 1) : const Duration(milliseconds: 400), curve: Curves.easeOutCubic),
          ),
        ),
      ),
    );
  }
}
