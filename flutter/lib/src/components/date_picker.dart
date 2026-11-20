import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../foundation/box.dart';
import '../foundation/pressable.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';
import 'calendar.dart';

/// 日期輸入：點開後在下方彈出 [AicdeCalendar]。值格式 `YYYY-MM-DD`（例如 2026-11-20）。
///
/// [min] / [max] 之外的日期不可選；Esc 或點外面關閉。
class AicdeDatePicker extends StatefulWidget {
  const AicdeDatePicker({
    super.key,
    required this.value,
    required this.onChanged,
    this.placeholder = '選擇日期',
    this.min,
    this.max,
    this.disabledDate,
    this.width = 220,
    this.semanticLabel,
  });

  /// 空字串 = 尚未選擇
  final String value;

  /// 傳 null 代表停用
  final ValueChanged<String>? onChanged;
  final String placeholder;
  final String? min, max;
  final bool Function(String date)? disabledDate;
  final double? width;
  final String? semanticLabel;

  @override
  State<AicdeDatePicker> createState() => _AicdeDatePickerState();
}

class _AicdeDatePickerState extends State<AicdeDatePicker> {
  final _portal = OverlayPortalController();
  final _link = LayerLink();
  final _group = Object();

  void _toggle() => setState(() => _portal.isShowing ? _portal.hide() : _portal.show());
  void _close() {
    if (_portal.isShowing) setState(_portal.hide);
  }

  bool _disabled(String k) =>
      (widget.min != null && widget.min!.isNotEmpty && k.compareTo(widget.min!) < 0) ||
      (widget.max != null && widget.max!.isNotEmpty && k.compareTo(widget.max!) > 0) ||
      (widget.disabledDate?.call(k) ?? false);

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final empty = widget.value.isEmpty;
    return TapRegion(
      groupId: _group,
      onTapOutside: (_) => _close(),
      child: CallbackShortcuts(
        bindings: {const SingleActivator(LogicalKeyboardKey.escape): _close},
        child: CompositedTransformTarget(
          link: _link,
          child: OverlayPortal(
            controller: _portal,
            overlayChildBuilder: (_) => CompositedTransformFollower(
              link: _link,
              targetAnchor: Alignment.bottomLeft,
              offset: const Offset(0, 8),
              child: Align(
                alignment: Alignment.topLeft,
                child: TapRegion(
                  groupId: _group,
                  child: AicdeTheme(
                    style: t.style,
                    mode: t.isDark ? ThemeMode.dark : ThemeMode.light,
                    child: CallbackShortcuts(
                      bindings: {const SingleActivator(LogicalKeyboardKey.escape): _close},
                      child: FocusScope(
                        autofocus: true,
                        child: AicdeCalendar(
                          kind: AicdeBoxKind.overlay,
                          value: widget.value,
                          defaultMonth: empty ? widget.min : widget.value,
                          disabledDate: _disabled,
                          onChanged: (k) {
                            widget.onChanged?.call(k);
                            _close();
                          },
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            child: AicdePressable(
              onTap: widget.onChanged == null ? null : _toggle,
              semanticLabel: widget.semanticLabel ?? (empty ? widget.placeholder : widget.value),
              builder: (context, s) => AicdeBox(
                kind: AicdeBoxKind.field,
                states: AicdeStates(
                  focused: s.focused || _portal.isShowing,
                  hovered: s.hovered,
                  disabled: s.disabled,
                ),
                width: widget.width,
                height: t.controlHeight,
                padding: EdgeInsets.symmetric(horizontal: t.underlineInputs ? 4 : 12),
                child: Row(children: [
                  Expanded(
                    child: Text(
                      empty ? widget.placeholder : widget.value,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: empty ? t.body(color: c.ink3) : t.number(weight: FontWeight.w400, color: c.inkBody),
                    ),
                  ),
                  Icon(Icons.calendar_today_outlined, size: 16, color: c.ink2),
                ]),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// 兩個日期輸入並排；結束日自動以開始日作為 min。
class AicdeDateRangeInputs extends StatelessWidget {
  const AicdeDateRangeInputs({
    super.key,
    required this.start,
    required this.end,
    required this.onStartChanged,
    required this.onEndChanged,
    this.separator = '→',
    this.fieldWidth = 160,
  });

  final String start, end;
  final ValueChanged<String>? onStartChanged, onEndChanged;
  final String separator;
  final double fieldWidth;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        AicdeDatePicker(value: start, onChanged: onStartChanged, placeholder: '開始日期', width: fieldWidth),
        ExcludeSemantics(child: Text(separator, style: t.body(color: t.colors.ink3))),
        AicdeDatePicker(value: end, onChanged: onEndChanged, placeholder: '結束日期', min: start, width: fieldWidth),
      ],
    );
  }
}
