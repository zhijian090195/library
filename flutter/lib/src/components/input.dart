import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../foundation/field.dart';
import '../foundation/box.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';

enum AicdeInputSize { sm, md, lg }

/// 欄位外框：標題、說明、錯誤訊息。對應 React 的 `Field`。
///
/// 包住 [AicdeInput]、[AicdeTextarea] 或 [AicdeSelect] 時，標題會成為輸入框的讀屏名稱、
/// 說明或錯誤會成為讀屏的補充說明，錯誤狀態也會自動套到輸入框（不用再另外傳 `error: true`）。
/// 錯誤訊息出現時會主動念出（live region）。
class AicdeField extends StatelessWidget {
  const AicdeField({
    super.key,
    this.label,
    this.help,
    this.error,
    required this.child,
  });
  final String? label;
  final String? help;

  /// 有值時以危險色顯示，取代 [help]
  final String? error;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final msg = error ?? help;
    return AicdeFieldScope(
      label: label,
      message: msg,
      error: error != null,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (label != null) ...[
            // 讀屏從輸入框本身念出標題，這裡不重複
            ExcludeSemantics(
              child: Text(t.labelText(label!), style: t.label(size: 13)),
            ),
            const SizedBox(height: 6),
          ],
          child,
          if (msg != null) ...[
            const SizedBox(height: 6),
            if (error != null)
              Semantics(
                liveRegion: true,
                child: Text(msg, style: t.caption(color: t.colors.danger)),
              )
            else
              ExcludeSemantics(child: Text(msg, style: t.caption())),
          ],
        ],
      ),
    );
  }
}

/// [AicdeField] 傳給裡面輸入元件的標題、說明與錯誤狀態
class AicdeFieldScope extends InheritedWidget {
  const AicdeFieldScope({
    super.key,
    this.label,
    this.message,
    this.error = false,
    required super.child,
  });
  final String? label;
  final String? message;
  final bool error;

  static AicdeFieldScope? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<AicdeFieldScope>();

  @override
  bool updateShouldNotify(AicdeFieldScope old) =>
      old.label != label || old.message != message || old.error != error;
}

/// 文字輸入框。
///
/// ```dart
/// AicdeInput(value: name, onChanged: (v) => setState(() => name = v), placeholder: '姓名')
/// ```
class AicdeInput extends StatefulWidget {
  const AicdeInput({
    super.key,
    this.value,
    this.controller,
    this.onChanged,
    this.onSubmitted,
    this.placeholder,
    this.prefix,
    this.suffix,
    this.size = AicdeInputSize.md,
    this.enabled = true,
    this.error = false,
    this.obscureText = false,
    this.keyboardType,
    this.inputFormatters,
    this.focusNode,
    this.autofocus = false,
    this.minLines,
    this.maxLines = 1,
    this.maxLength,
    this.textAlign = TextAlign.start,
    this.semanticLabel,
    this.width,
  });

  /// 受控值；為 null 時由 [controller] 或內部狀態管理
  final String? value;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final String? placeholder;
  final Widget? prefix, suffix;
  final AicdeInputSize size;
  final bool enabled;
  final bool error;
  final bool obscureText;
  final TextInputType? keyboardType;
  final List<TextInputFormatter>? inputFormatters;
  final FocusNode? focusNode;
  final bool autofocus;
  final int? minLines;
  final int? maxLines;
  final int? maxLength;
  final TextAlign textAlign;
  final String? semanticLabel;
  final double? width;

  @override
  State<AicdeInput> createState() => _AicdeInputState();
}

class _AicdeInputState extends State<AicdeInput> {
  late TextEditingController _ctrl =
      widget.controller ?? TextEditingController(text: widget.value ?? '');
  late FocusNode _focus = widget.focusNode ?? FocusNode();
  bool _hovered = false;

  @override
  void initState() {
    super.initState();
    _focus.addListener(_onFocus);
  }

  void _onFocus() => setState(() {});

  @override
  void didUpdateWidget(AicdeInput old) {
    super.didUpdateWidget(old);
    if (widget.controller != old.controller) {
      if (old.controller == null) _ctrl.dispose();
      _ctrl =
          widget.controller ?? TextEditingController(text: widget.value ?? '');
    }
    if (widget.focusNode != old.focusNode) {
      _focus.removeListener(_onFocus);
      if (old.focusNode == null) _focus.dispose();
      _focus = widget.focusNode ?? FocusNode();
      _focus.addListener(_onFocus);
    }
    final v = widget.value;
    if (v != null && v != _ctrl.text) {
      _ctrl.value = TextEditingValue(
        text: v,
        selection: TextSelection.collapsed(offset: v.length),
      );
    }
  }

  @override
  void dispose() {
    _focus.removeListener(_onFocus);
    if (widget.focusNode == null) _focus.dispose();
    if (widget.controller == null) _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final scope = AicdeFieldScope.maybeOf(context);
    final error = widget.error || (scope?.error ?? false);
    final multi = widget.maxLines != 1;
    final h = switch (widget.size) {
      AicdeInputSize.sm => t.controlHeight - 8,
      AicdeInputSize.md => t.controlHeight,
      AicdeInputSize.lg => t.controlHeight + 8,
    };
    final fs = widget.size == AicdeInputSize.lg ? 16.0 : 14.0;
    final pill = t.inputRadius >= 999;
    final hPad = t.underlineInputs ? 2.0 : (pill ? 16.0 : 12.0);
    final style = t
        .body(size: fs)
        .copyWith(height: 1.4, color: widget.enabled ? c.inkBody : c.ink3);

    final field = TextField(
      controller: _ctrl,
      focusNode: _focus,
      enabled: widget.enabled,
      autofocus: widget.autofocus,
      obscureText: widget.obscureText,
      keyboardType:
          widget.keyboardType ?? (multi ? TextInputType.multiline : null),
      inputFormatters: widget.inputFormatters,
      minLines: widget.minLines,
      maxLines: widget.maxLines,
      maxLength: widget.maxLength,
      textAlign: widget.textAlign,
      style: style,
      cursorColor: t.focusColor,
      cursorWidth: 1.5,
      onChanged: widget.onChanged,
      onSubmitted: widget.onSubmitted,
      decoration: aicdeBareDecoration(
        hintText: widget.placeholder,
        hintStyle: style.copyWith(color: c.ink3),
      ).copyWith(counterText: ''),
    );

    Widget box = MouseRegion(
      onEnter: (_) => setState(() => _hovered = true),
      onExit: (_) => setState(() => _hovered = false),
      cursor: widget.enabled
          ? SystemMouseCursors.text
          : SystemMouseCursors.forbidden,
      child: AicdeBox(
        kind: AicdeBoxKind.field,
        width: widget.width,
        height: multi ? null : h,
        states: AicdeStates(
          focused: _focus.hasFocus,
          hovered: _hovered,
          disabled: !widget.enabled,
          error: error,
        ),
        padding: EdgeInsets.symmetric(
          horizontal: hPad,
          vertical: multi ? 10 : 0,
        ),
        child: IconTheme.merge(
          data: IconThemeData(color: c.ink3, size: fs + 4),
          child: Row(
            crossAxisAlignment: multi
                ? CrossAxisAlignment.start
                : CrossAxisAlignment.center,
            children: [
              if (widget.prefix != null) ...[
                widget.prefix!,
                const SizedBox(width: 8),
              ],
              Expanded(child: field),
              if (widget.suffix != null) ...[
                const SizedBox(width: 8),
                widget.suffix!,
              ],
            ],
          ),
        ),
      ),
    );
    return Semantics(
      label: widget.semanticLabel ?? scope?.label ?? widget.placeholder,
      hint: scope?.message,
      child: box,
    );
  }
}
