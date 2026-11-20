import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../foundation/box.dart';
import '../../foundation/pressable.dart';
import '../../foundation/selection.dart';
import '../../foundation/text.dart';
import '../../theme/theme.dart';

/// 依「減少動態效果」設定回傳主題動畫時間
Duration navMotion(BuildContext context, [double factor = 1]) {
  final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
  return reduce ? Duration.zero : AicdeTheme.of(context).motion * factor;
}

/// 下拉選單、右鍵選單共用的項目
@immutable
class AicdeMenuAction {
  const AicdeMenuAction({
    required this.id,
    required this.label,
    this.icon,
    this.shortcut,
    this.danger = false,
    this.disabled = false,
    this.onTap,
  }) : divider = false;

  /// 分隔線
  const AicdeMenuAction.divider()
    : id = '',
      label = '',
      icon = null,
      shortcut = null,
      danger = false,
      disabled = false,
      onTap = null,
      divider = true;

  final String id;
  final String label;
  final Widget? icon;

  /// 右側顯示的快捷鍵文字，例如 `⌘C`
  final String? shortcut;
  final bool danger, disabled, divider;
  final VoidCallback? onTap;
}

/// 清單中的一列（選單、下拉、指令面板）。
///
/// 選中時用 `selectionBg / selectionFg`，滑過或 focus 時用 surface2 底色，
/// 鍵盤 focus 另外加 focusColor 外框。
class AicdeMenuRow extends StatelessWidget {
  const AicdeMenuRow({
    super.key,
    required this.label,
    this.icon,
    this.trailing,
    this.selected = false,
    this.highlighted = false,
    this.danger = false,
    this.expanded,
    this.onTap,
    this.focusNode,
    this.autofocus = false,
    this.indent = 0,
  });

  final Widget label;
  final Widget? icon, trailing;
  final bool selected;

  /// 由外部（例如指令面板的方向鍵）指定的高亮
  final bool highlighted;
  final bool danger;

  /// 有子選單時的展開狀態（給輔助技術）
  final bool? expanded;
  final VoidCallback? onTap;
  final FocusNode? focusNode;
  final bool autofocus;
  final double indent;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    return Semantics(
      expanded: expanded,
      child: AicdePressable(
        onTap: onTap,
        focusNode: focusNode,
        autofocus: autofocus,
        selected: selected,
        builder: (context, s) {
          final active = s.hovered || s.focused || highlighted;
          final bg = selected
              ? t.selectionBg
              : (active ? c.surface2 : c.surface2.withValues(alpha: 0));
          final fg = s.disabled
              ? c.ink3
              : (danger ? c.danger : (selected ? t.selectionFg : c.ink));
          return AicdeSelectionMark(
            tokens: t,
            selected: selected,
            child: AnimatedContainer(
              duration: navMotion(context),
              curve: t.curve,
              constraints: BoxConstraints(
                minHeight: math.max(34, t.controlHeight - 4),
              ),
              padding: EdgeInsets.only(
                left: 10 + indent,
                right: 10,
                top: 6,
                bottom: 6,
              ),
              decoration: BoxDecoration(
                color: bg,
                borderRadius: t.radius(t.rSm),
                border: Border.all(
                  color: s.focused
                      ? t.focusColor
                      : t.focusColor.withValues(alpha: 0),
                  width: 1.5,
                ),
              ),
              child: Row(
                children: [
                  if (icon != null) ...[
                    IconTheme.merge(
                      data: IconThemeData(color: fg, size: 18),
                      child: icon!,
                    ),
                    const SizedBox(width: 10),
                  ],
                  Expanded(
                    child: DefaultTextStyle.merge(
                      style: t
                          .body(size: 14, color: fg)
                          .copyWith(
                            height: 1.3,
                            fontWeight: selected
                                ? FontWeight.w700
                                : FontWeight.w500,
                          ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      child: label,
                    ),
                  ),
                  if (trailing != null) ...[
                    const SizedBox(width: 12),
                    IconTheme.merge(
                      data: IconThemeData(color: c.ink3, size: 18),
                      child: trailing!,
                    ),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

/// 快捷鍵小字
class NavShortcutText extends StatelessWidget {
  const NavShortcutText(this.text, {super.key});
  final String text;
  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        border: Border.all(color: t.colors.line),
        borderRadius: BorderRadius.circular(t.rXs),
      ),
      child: Text(
        text,
        style: t.number(
          size: 11,
          weight: FontWeight.w500,
          color: t.colors.ink2,
        ),
      ),
    );
  }
}

/// 下拉／右鍵選單的面板：上下鍵在項目間移動（循環），Enter / Space 執行
class AicdeMenuPanel extends StatelessWidget {
  const AicdeMenuPanel({
    super.key,
    required this.items,
    required this.onSelect,
    this.autofocus = true,
    this.minWidth = 180,
  });

  final List<AicdeMenuAction> items;
  final ValueChanged<AicdeMenuAction> onSelect;
  final bool autofocus;
  final double minWidth;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final first = items.indexWhere((i) => !i.divider && !i.disabled);
    return Semantics(
      container: true,
      explicitChildNodes: true,
      child: AicdeBox(
        kind: AicdeBoxKind.overlay,
        padding: const EdgeInsets.all(6),
        child: ConstrainedBox(
          constraints: BoxConstraints(minWidth: minWidth, maxWidth: 320),
          child: IntrinsicWidth(
            child: FocusScope(
              child: Shortcuts(
                shortcuts: const {
                  SingleActivator(LogicalKeyboardKey.arrowDown):
                      NextFocusIntent(),
                  SingleActivator(LogicalKeyboardKey.arrowUp):
                      PreviousFocusIntent(),
                },
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    for (var i = 0; i < items.length; i++)
                      if (items[i].divider)
                        Container(
                          height: 1,
                          margin: const EdgeInsets.symmetric(
                            vertical: 5,
                            horizontal: 4,
                          ),
                          color: t.colors.line,
                        )
                      else
                        AicdeMenuRow(
                          label: Text(items[i].label),
                          icon: items[i].icon,
                          danger: items[i].danger,
                          autofocus: autofocus && i == first,
                          trailing: items[i].shortcut == null
                              ? null
                              : NavShortcutText(items[i].shortcut!),
                          onTap: items[i].disabled
                              ? null
                              : () => onSelect(items[i]),
                        ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
