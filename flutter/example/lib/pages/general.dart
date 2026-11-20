import 'package:aicde_ui/aicde_ui.dart';
import 'package:flutter/material.dart';

/// 範例：通用元件
final List<(String, WidgetBuilder)> generalDemos = [
  ('Button 按鈕', (_) => const _ButtonDemo()),
];

class _ButtonDemo extends StatefulWidget {
  const _ButtonDemo();
  @override
  State<_ButtonDemo> createState() => _ButtonDemoState();
}

class _ButtonDemoState extends State<_ButtonDemo> {
  bool saving = false;

  Future<void> _save() async {
    setState(() => saving = true);
    await Future<void>.delayed(const Duration(milliseconds: 1600));
    if (mounted) setState(() => saving = false);
  }

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    Widget row(String title, List<Widget> children) => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          spacing: 10,
          children: [
            Text(title, style: t.caption(size: 12.5)),
            Wrap(spacing: 12, runSpacing: 12, crossAxisAlignment: WrapCrossAlignment.center, children: children),
          ],
        );
    void noop() {}
    return Column(crossAxisAlignment: CrossAxisAlignment.start, spacing: 22, children: [
      row('變體', [
        AicdeButton(label: '主要', variant: AicdeButtonVariant.primary, onPressed: noop),
        AicdeButton(label: '次要', variant: AicdeButtonVariant.secondary, onPressed: noop),
        AicdeButton(label: '外框', onPressed: noop),
        AicdeButton(label: '文字', variant: AicdeButtonVariant.ghost, onPressed: noop),
        AicdeButton(label: '刪除', variant: AicdeButtonVariant.danger, onPressed: noop),
      ]),
      row('尺寸', [
        AicdeButton(label: '小', size: AicdeButtonSize.sm, onPressed: noop),
        AicdeButton(label: '中', onPressed: noop),
        AicdeButton(label: '大', size: AicdeButtonSize.lg, onPressed: noop),
      ]),
      row('圖示與狀態', [
        AicdeButton(label: '新增', icon: const Icon(Icons.add), variant: AicdeButtonVariant.primary, onPressed: noop),
        AicdeButton(icon: const Icon(Icons.settings_outlined), semanticLabel: '設定', onPressed: noop),
        AicdeButton(label: saving ? '儲存中' : '儲存（點我）', loading: saving, variant: AicdeButtonVariant.secondary, onPressed: _save),
        const AicdeButton(label: '停用', onPressed: null),
      ]),
    ]);
  }
}
