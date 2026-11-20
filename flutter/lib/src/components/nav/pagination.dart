import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../foundation/box.dart';
import '../../foundation/pressable.dart';
import '../../foundation/text.dart';
import '../../theme/theme.dart';
import 'menu_row.dart';

/// 要顯示的頁碼；`null` 代表省略號。和 React 版 `pageWindow` 相同規則。
List<int?> aicdePageWindow(int current, int total) {
  if (total <= 7) return [for (var i = 1; i <= total; i++) i];
  if (current <= 4) return [1, 2, 3, 4, 5, null, total];
  if (current >= total - 3) return [1, null, total - 4, total - 3, total - 2, total - 1, total];
  return [1, null, current - 1, current, current + 1, null, total];
}

/// 分頁。[total] 為總頁數，頁碼從 1 開始。
class AicdePagination extends StatefulWidget {
  const AicdePagination({
    super.key,
    required this.total,
    this.value,
    this.initialValue = 1,
    this.onChanged,
    this.semanticLabel = '分頁',
  });

  final int total;

  /// 受控的目前頁；null 則由元件自己管理
  final int? value;
  final int initialValue;
  final ValueChanged<int>? onChanged;
  final String semanticLabel;

  @override
  State<AicdePagination> createState() => _AicdePaginationState();
}

class _AicdePaginationState extends State<AicdePagination> {
  late int _inner = widget.initialValue;

  int get _current => (widget.value ?? _inner).clamp(1, math.max(1, widget.total));

  void _go(int p) {
    p = p.clamp(1, math.max(1, widget.total));
    if (p == _current) return;
    if (widget.value == null) setState(() => _inner = p);
    widget.onChanged?.call(p);
  }

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final cur = _current;
    return Semantics(
      container: true,
      label: widget.semanticLabel,
      child: Wrap(
        spacing: 4,
        runSpacing: 4,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          _PageButton(label: '上一頁', onTap: cur > 1 ? () => _go(cur - 1) : null, child: const Icon(Icons.chevron_left)),
          for (final p in aicdePageWindow(cur, widget.total))
            if (p == null)
              SizedBox(
                width: 24,
                child: Text('…', textAlign: TextAlign.center, style: t.number(color: t.colors.ink3)),
              )
            else
              _PageButton(
                label: '第 $p 頁',
                current: p == cur,
                onTap: () => _go(p),
                child: Text('$p'),
              ),
          _PageButton(label: '下一頁', onTap: cur < widget.total ? () => _go(cur + 1) : null, child: const Icon(Icons.chevron_right)),
        ],
      ),
    );
  }
}

class _PageButton extends StatelessWidget {
  const _PageButton({required this.label, required this.child, this.onTap, this.current = false});
  final String label;
  final Widget child;
  final VoidCallback? onTap;
  final bool current;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final size = math.max(32.0, t.controlHeight - 4);
    return AicdePressable(
      onTap: onTap,
      selected: current,
      semanticLabel: label,
      builder: (context, s) {
        final fg = current ? c.surface : c.ink;
        final content = DefaultTextStyle.merge(
          style: t.number(size: 14, weight: current ? FontWeight.w700 : FontWeight.w500, color: fg),
          child: IconTheme.merge(data: IconThemeData(color: fg, size: 18), child: child),
        );
        if (current) {
          return AicdeBox(
            kind: AicdeBoxKind.control,
            fill: c.ink,
            radius: t.rSm,
            states: s,
            height: size,
            padding: const EdgeInsets.symmetric(horizontal: 8),
            alignment: Alignment.center,
            child: ConstrainedBox(constraints: BoxConstraints(minWidth: size - 16), child: Center(widthFactor: 1, child: content)),
          );
        }
        return AicdeBox(
          kind: AicdeBoxKind.control,
          emphasis: AicdeEmphasis.ghost,
          radius: t.rSm,
          states: AicdeStates(focused: s.focused, disabled: s.disabled),
          child: AnimatedContainer(
            duration: navMotion(context),
            height: size,
            constraints: BoxConstraints(minWidth: size),
            padding: const EdgeInsets.symmetric(horizontal: 8),
            decoration: BoxDecoration(
              color: s.hovered ? c.surface2 : c.surface2.withValues(alpha: 0),
              borderRadius: t.radius(t.rSm),
            ),
            child: Center(widthFactor: 1, child: content),
          ),
        );
      },
    );
  }
}
