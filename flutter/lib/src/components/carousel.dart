import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../foundation/pressable.dart';
import '../theme/theme.dart';
import 'button.dart';

/// 輪播：可拖曳、觸控滑動、左右方向鍵操作。
///
/// 需要從外部控制時用 `GlobalKey<AicdeCarouselState>`，呼叫 `goTo` / `next` / `prev`。
class AicdeCarousel extends StatefulWidget {
  const AicdeCarousel({
    super.key,
    required this.children,
    this.height = 200,
    this.peek = false,
    this.autoplay,
    this.showArrows = true,
    this.showDots = true,
    this.onChanged,
  });

  final List<Widget> children;

  /// 輪播區高度（不含圓點）
  final double height;

  /// 露出下一張的一角，提示可以滑動
  final bool peek;

  /// 自動播放間隔；滑鼠移入、鍵盤聚焦或系統減少動態時暫停
  final Duration? autoplay;
  final bool showArrows, showDots;
  final ValueChanged<int>? onChanged;

  @override
  State<AicdeCarousel> createState() => AicdeCarouselState();
}

class AicdeCarouselState extends State<AicdeCarousel> {
  late PageController _ctrl = PageController(
    viewportFraction: widget.peek ? .86 : 1,
  );
  int _index = 0;
  bool _hovered = false, _focused = false;
  Timer? _timer;

  int get index => _index;
  int get _count => widget.children.length;
  bool get _reduce => MediaQuery.maybeDisableAnimationsOf(context) ?? false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _schedule();
  }

  @override
  void didUpdateWidget(AicdeCarousel oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.peek != widget.peek) {
      final old = _ctrl;
      _ctrl = PageController(
        viewportFraction: widget.peek ? .86 : 1,
        initialPage: _index,
      );
      WidgetsBinding.instance.addPostFrameCallback((_) => old.dispose());
    }
    _schedule();
  }

  void _schedule() {
    _timer?.cancel();
    _timer = null;
    final every = widget.autoplay;
    if (every == null || _reduce || _count < 2) return;
    _timer = Timer.periodic(every, (_) {
      if (_hovered || _focused || !mounted) return;
      goTo(_index >= _count - 1 ? 0 : _index + 1);
    });
  }

  /// 跳到第 [i] 張（0 起算）
  void goTo(int i) {
    if (!_ctrl.hasClients) return;
    final int target = i.clamp(0, math.max(0, _count - 1)).toInt();
    if (_reduce) {
      _ctrl.jumpToPage(target);
    } else {
      _ctrl.animateToPage(
        target,
        duration: const Duration(milliseconds: 420),
        curve: const Cubic(0.22, 1, 0.36, 1),
      );
    }
  }

  void next() => goTo(_index + 1);
  void prev() => goTo(_index - 1);

  @override
  void dispose() {
    _timer?.cancel();
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final multi = _count > 1;

    Widget arrow(bool left) => Positioned(
      left: left ? 8 : null,
      right: left ? null : 8,
      top: 0,
      bottom: 0,
      child: Center(
        child: AicdeButton(
          semanticLabel: left ? '上一張' : '下一張',
          icon: Icon(left ? Icons.chevron_left : Icons.chevron_right),
          size: AicdeButtonSize.sm,
          onPressed: (left ? _index <= 0 : _index >= _count - 1)
              ? null
              : (left ? prev : next),
        ),
      ),
    );

    return Semantics(
      container: true,
      label: '輪播',
      child: MouseRegion(
        onEnter: (_) => _hovered = true,
        onExit: (_) => _hovered = false,
        child: Focus(
          onFocusChange: (v) => _focused = v,
          onKeyEvent: (node, e) {
            if (e is! KeyDownEvent) return KeyEventResult.ignored;
            if (e.logicalKey == LogicalKeyboardKey.arrowRight) {
              next();
              return KeyEventResult.handled;
            }
            if (e.logicalKey == LogicalKeyboardKey.arrowLeft) {
              prev();
              return KeyEventResult.handled;
            }
            return KeyEventResult.ignored;
          },
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                height: widget.height,
                child: Stack(
                  children: [
                    PageView.builder(
                      controller: _ctrl,
                      padEnds: false,
                      itemCount: _count,
                      onPageChanged: (i) {
                        setState(() => _index = i);
                        widget.onChanged?.call(i);
                      },
                      itemBuilder: (context, i) => Semantics(
                        label: '${i + 1} / $_count',
                        child: Padding(
                          padding: EdgeInsets.only(right: widget.peek ? 12 : 0),
                          child: widget.children[i],
                        ),
                      ),
                    ),
                    if (widget.showArrows && multi) ...[
                      arrow(true),
                      arrow(false),
                    ],
                  ],
                ),
              ),
              if (widget.showDots && multi)
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      for (var i = 0; i < _count; i++)
                        AicdePressable(
                          onTap: () => goTo(i),
                          selected: i == _index,
                          semanticLabel: '第 ${i + 1} 張',
                          builder: (context, s) => Padding(
                            padding: const EdgeInsets.all(4),
                            child: AnimatedScale(
                              scale: i == _index ? 1.3 : (s.hovered ? 1.15 : 1),
                              duration: _reduce
                                  ? Duration.zero
                                  : const Duration(milliseconds: 240),
                              curve: t.curve,
                              child: AnimatedContainer(
                                duration: _reduce
                                    ? Duration.zero
                                    : const Duration(milliseconds: 240),
                                width: 8,
                                height: 8,
                                decoration: BoxDecoration(
                                  color: i == _index ? t.primary : c.lineStrong,
                                  borderRadius: BorderRadius.circular(
                                    math.min(t.rPill, 4),
                                  ),
                                  border: s.focused
                                      ? Border.all(
                                          color: t.focusColor,
                                          width: 1.5,
                                        )
                                      : null,
                                ),
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
