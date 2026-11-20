import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../foundation/box.dart';
import '../foundation/pressable.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';
import 'anchored_overlay.dart';

/// `#RRGGBB` → Color；格式不對回傳 null
Color? aicdeParseHex(String s) {
  var h = s.trim().replaceFirst('#', '');
  if (h.length == 3) h = h.split('').map((x) => '$x$x').join();
  if (h.length != 6) return null;
  final v = int.tryParse(h, radix: 16);
  return v == null ? null : Color(0xFF000000 | v);
}

/// Color → `#RRGGBB`（大寫）
String aicdeToHex(Color c) =>
    '#${(c.toARGB32() & 0xFFFFFF).toRadixString(16).padLeft(6, '0').toUpperCase()}';

/// 自由選色：色塊＋色碼，點開是飽和度／明度面板、色相條與色碼輸入。
class AicdeColorPicker extends StatefulWidget {
  const AicdeColorPicker({
    super.key,
    this.value,
    this.initialValue = '#FC5454',
    this.onChanged,
    this.showValue = true,
    this.enabled = true,
    this.semanticLabel = '選擇顏色',
  });

  /// 受控的 `#RRGGBB`；null 時元件自己管理
  final String? value;
  final String initialValue;
  final ValueChanged<String>? onChanged;
  final bool showValue;
  final bool enabled;
  final String semanticLabel;

  @override
  State<AicdeColorPicker> createState() => _AicdeColorPickerState();
}

class _AicdeColorPickerState extends State<AicdeColorPicker> {
  late String _own = aicdeToHex(aicdeParseHex(widget.initialValue) ?? const Color(0xFFFC5454));
  bool _open = false;
  HSVColor? _hsv;
  final _hexCtrl = TextEditingController();
  final _trigger = FocusNode();

  String get _hex => aicdeToHex(aicdeParseHex(widget.value ?? _own) ?? const Color(0xFFFC5454));

  @override
  void dispose() {
    _hexCtrl.dispose();
    _trigger.dispose();
    super.dispose();
  }

  void _emit(HSVColor hsv) {
    final hex = aicdeToHex(hsv.toColor());
    final prev = _hex;
    setState(() {
      _hsv = hsv;
      if (widget.value == null) _own = hex;
      _hexCtrl.value = TextEditingValue(text: hex, selection: TextSelection.collapsed(offset: hex.length));
    });
    if (hex != prev) widget.onChanged?.call(hex);
  }

  void _toggle() {
    setState(() {
      _open = !_open;
      _hsv = HSVColor.fromColor(aicdeParseHex(_hex)!);
      _hexCtrl.text = _hex;
    });
  }

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final color = aicdeParseHex(_hex)!;

    return AicdeAnchoredOverlay(
      open: _open,
      matchWidth: false,
      padding: const EdgeInsets.all(12),
      onDismiss: () => setState(() => _open = false),
      overlayBuilder: (ctx, w) {
        final hsv = _hsv ?? HSVColor.fromColor(color);
        return SizedBox(
          width: 220,
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            _SvPanel(hsv: hsv, onChanged: _emit, radius: t.rSm.clamp(0, 10)),
            const SizedBox(height: 12),
            _HueBar(hsv: hsv, onChanged: _emit, focusColor: t.focusColor),
            const SizedBox(height: 12),
            Row(children: [
              Container(
                width: 28, height: 28,
                decoration: BoxDecoration(color: hsv.toColor(), shape: BoxShape.circle, border: Border.all(color: c.line)),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: AicdeBox(
                  kind: AicdeBoxKind.field,
                  height: 32,
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  alignment: Alignment.centerLeft,
                  child: Semantics(
                    label: '色碼',
                    textField: true,
                    child: TextField(
                      controller: _hexCtrl,
                      style: t.number(size: 13, weight: FontWeight.w500, color: c.inkBody).copyWith(fontFamily: t.monoFamily, height: 1.2),
                      cursorColor: t.focusColor,
                      inputFormatters: [FilteringTextInputFormatter.allow(RegExp('[#0-9a-fA-F]')), LengthLimitingTextInputFormatter(7)],
                      decoration: aicdeBareDecoration(hintText: '#RRGGBB'),
                      onSubmitted: (v) {
                        final p = aicdeParseHex(v);
                        if (p != null) _emit(HSVColor.fromColor(p));
                      },
                      onChanged: (v) {
                        final p = aicdeParseHex(v);
                        if (p != null && v.replaceFirst('#', '').length == 6) _emit(HSVColor.fromColor(p));
                      },
                    ),
                  ),
                ),
              ),
            ]),
          ]),
        );
      },
      child: Semantics(
        label: widget.semanticLabel,
        value: _hex,
        expanded: _open,
        child: AicdePressable(
          focusNode: _trigger,
          onTap: widget.enabled ? _toggle : null,
          builder: (context, s) => AicdeBox(
            kind: AicdeBoxKind.field,
            states: AicdeStates(focused: s.focused || _open, hovered: s.hovered, disabled: s.disabled),
            height: t.controlHeight,
            padding: EdgeInsets.only(left: 6, right: widget.showValue ? 12 : 6),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              AnimatedContainer(
                duration: t.motion,
                width: t.controlHeight - 14,
                height: t.controlHeight - 14,
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(t.inputRadius >= 999 ? 999 : (t.rSm - 2).clamp(0, 10)),
                  border: Border.all(color: Colors.black.withValues(alpha: .08)),
                ),
              ),
              if (widget.showValue) ...[
                const SizedBox(width: 10),
                Text(_hex, style: t.number(size: 13, weight: FontWeight.w500, color: c.inkBody).copyWith(fontFamily: t.monoFamily)),
              ],
            ]),
          ),
        ),
      ),
    );
  }
}

class _SvPanel extends StatelessWidget {
  const _SvPanel({required this.hsv, required this.onChanged, required this.radius});
  final HSVColor hsv;
  final ValueChanged<HSVColor> onChanged;
  final double radius;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, box) {
      const h = 140.0;
      final w = box.maxWidth;
      void at(Offset p) => onChanged(hsv.withSaturation((p.dx / w).clamp(0, 1)).withValue(1 - (p.dy / h).clamp(0, 1)));
      return Semantics(
        label: '飽和度與明度',
        value: '${(hsv.saturation * 100).round()}%, ${(hsv.value * 100).round()}%',
        child: GestureDetector(
          onPanDown: (d) => at(d.localPosition),
          onPanUpdate: (d) => at(d.localPosition),
          child: SizedBox(
            width: w,
            height: h,
            child: Stack(clipBehavior: Clip.none, children: [
              Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(radius),
                    gradient: LinearGradient(colors: [Colors.white, HSVColor.fromAHSV(1, hsv.hue, 1, 1).toColor()]),
                  ),
                ),
              ),
              Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(radius),
                    gradient: const LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Color(0x00000000), Color(0xFF000000)]),
                  ),
                ),
              ),
              Positioned(
                left: hsv.saturation * w - 8,
                top: (1 - hsv.value) * h - 8,
                child: Container(
                  width: 16, height: 16,
                  decoration: BoxDecoration(
                    color: hsv.toColor(),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2.5),
                    boxShadow: const [BoxShadow(color: Color(0x55000000), blurRadius: 4)],
                  ),
                ),
              ),
            ]),
          ),
        ),
      );
    });
  }
}

class _HueBar extends StatefulWidget {
  const _HueBar({required this.hsv, required this.onChanged, required this.focusColor});
  final HSVColor hsv;
  final ValueChanged<HSVColor> onChanged;
  final Color focusColor;
  @override
  State<_HueBar> createState() => _HueBarState();
}

class _HueBarState extends State<_HueBar> {
  bool _focused = false;
  @override
  Widget build(BuildContext context) {
    final hsv = widget.hsv;
    void nudge(double d) => widget.onChanged(hsv.withHue((hsv.hue + d) % 360));
    return LayoutBuilder(builder: (context, box) {
      final w = box.maxWidth;
      void at(Offset p) => widget.onChanged(hsv.withHue((p.dx / w).clamp(0, .9999) * 360));
      return Semantics(
        slider: true,
        label: '色相',
        value: '${hsv.hue.round()}°',
        increasedValue: '${((hsv.hue + 10) % 360).round()}°',
        decreasedValue: '${((hsv.hue - 10) % 360).round()}°',
        onIncrease: () => nudge(10),
        onDecrease: () => nudge(-10),
        child: Focus(
          onFocusChange: (f) => setState(() => _focused = f),
          onKeyEvent: (n, e) {
            if (e is! KeyDownEvent && e is! KeyRepeatEvent) return KeyEventResult.ignored;
            if (e.logicalKey == LogicalKeyboardKey.arrowRight) { nudge(5); return KeyEventResult.handled; }
            if (e.logicalKey == LogicalKeyboardKey.arrowLeft) { nudge(-5); return KeyEventResult.handled; }
            return KeyEventResult.ignored;
          },
          child: GestureDetector(
            onPanDown: (d) => at(d.localPosition),
            onPanUpdate: (d) => at(d.localPosition),
            child: SizedBox(
              height: 14,
              width: w,
              child: Stack(clipBehavior: Clip.none, children: [
                Positioned.fill(
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(7),
                      gradient: LinearGradient(colors: [for (var i = 0; i <= 6; i++) HSVColor.fromAHSV(1, i * 60.0 % 360, 1, 1).toColor()]),
                    ),
                  ),
                ),
                Positioned(
                  left: hsv.hue / 360 * w - 9,
                  top: -2,
                  child: Container(
                    width: 18, height: 18,
                    decoration: BoxDecoration(
                      color: HSVColor.fromAHSV(1, hsv.hue, 1, 1).toColor(),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 3),
                      boxShadow: [
                        const BoxShadow(color: Color(0x55000000), blurRadius: 4),
                        if (_focused) BoxShadow(color: widget.focusColor, spreadRadius: 2),
                      ],
                    ),
                  ),
                ),
              ]),
            ),
          ),
        ),
      );
    });
  }
}

/// 預設色票（品牌色限定時使用），單選；鍵盤 Tab 移動、Enter／Space 選取。
class AicdeColorSwatches extends StatefulWidget {
  const AicdeColorSwatches({
    super.key,
    required this.colors,
    this.labels,
    this.value,
    this.initialValue,
    this.onChanged,
    this.size = 28,
  });

  /// `#RRGGBB` 清單
  final List<String> colors;

  /// 給螢幕閱讀器的名稱（與 [colors] 對應），預設為色碼
  final List<String>? labels;
  final String? value;

  /// 預設為第一個顏色
  final String? initialValue;
  final ValueChanged<String>? onChanged;
  final double size;

  @override
  State<AicdeColorSwatches> createState() => _AicdeColorSwatchesState();
}

class _AicdeColorSwatchesState extends State<AicdeColorSwatches> {
  late String _own = widget.initialValue ?? (widget.colors.isEmpty ? '' : widget.colors.first);
  String get _val => widget.value ?? _own;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    return Wrap(spacing: 8, runSpacing: 8, children: [
      for (var i = 0; i < widget.colors.length; i++)
        Builder(builder: (context) {
          final hex = widget.colors[i];
          final col = aicdeParseHex(hex) ?? c.line;
          final on = hex.toUpperCase() == _val.toUpperCase();
          return Semantics(
            inMutuallyExclusiveGroup: true,
            checked: on,
            child: AicdePressable(
              selected: on,
              semanticLabel: widget.labels != null && i < widget.labels!.length ? widget.labels![i] : hex,
              onTap: () {
                if (widget.value == null) setState(() => _own = hex);
                widget.onChanged?.call(hex);
              },
              builder: (context, s) => AnimatedScale(
                scale: on ? .9 : (s.hovered ? 1.08 : 1),
                duration: reduce ? Duration.zero : t.motion,
                curve: t.curve,
                child: AnimatedContainer(
                  duration: reduce ? Duration.zero : t.motion,
                  width: widget.size,
                  height: widget.size,
                  decoration: BoxDecoration(
                    color: col,
                    shape: t.rPill == 0 ? BoxShape.rectangle : BoxShape.circle,
                    border: t.strokeAll ? Border.all(color: t.strokeColor, width: t.strokeWidth.clamp(1, 2)) : Border.all(color: Colors.black.withValues(alpha: .08)),
                    boxShadow: [
                      if (on) BoxShadow(color: c.surface, spreadRadius: 2),
                      if (on) BoxShadow(color: col, spreadRadius: 4),
                      if (s.focused) BoxShadow(color: t.focusColor, spreadRadius: on ? 6 : 3),
                    ],
                  ),
                ),
              ),
            ),
          );
        }),
    ]);
  }
}
