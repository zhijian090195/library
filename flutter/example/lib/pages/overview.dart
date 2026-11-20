import 'package:aicde_ui/aicde_ui.dart';
import 'package:flutter/material.dart';


const themeNames = {
  AicdeThemeStyle.paperCut: '預設・紙雕分層',
  AicdeThemeStyle.clean: '簡潔',
  AicdeThemeStyle.paper: '暖紙雕',
  AicdeThemeStyle.ink: '混合媒材',
  AicdeThemeStyle.soft: '柔光立體',
  AicdeThemeStyle.riso: '網點絲印',
  AicdeThemeStyle.brutal: '新粗野',
  AicdeThemeStyle.stitch: '手縫布藝',
  AicdeThemeStyle.ticket: '水彩票根',
  AicdeThemeStyle.block: '啞光積木',
  AicdeThemeStyle.blueprint: '藍圖線稿',
  AicdeThemeStyle.clinical: '醫療',
  AicdeThemeStyle.cute: '可愛',
  AicdeThemeStyle.finance: '金融',
  AicdeThemeStyle.editorial: '編輯',
};

class ThemePanel extends StatelessWidget {
  const ThemePanel({super.key, required this.style});
  final AicdeThemeStyle style;
  @override
  Widget build(BuildContext context) {
    return AicdeTheme(
      style: style,
      child: Builder(builder: (context) {
        final t = AicdeTheme.of(context);
        return Container(
          width: 380,
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(color: t.colors.surface, borderRadius: BorderRadius.circular(18)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('${themeNames[style]}  ', style: t.heading(size: 19)),
              Text(style.name, style: t.caption(size: 11)),
              const SizedBox(height: 18),
              Wrap(spacing: 12, runSpacing: 14, crossAxisAlignment: WrapCrossAlignment.center, children: [
                AicdeButton(label: '主要', variant: AicdeButtonVariant.primary, onPressed: () {}),
                AicdeButton(label: '次要', variant: AicdeButtonVariant.secondary, onPressed: () {}),
                AicdeButton(label: '外框', onPressed: () {}),
                AicdeButton(label: '文字', variant: AicdeButtonVariant.ghost, onPressed: () {}),
              ]),
              const SizedBox(height: 14),
              Wrap(spacing: 12, runSpacing: 14, crossAxisAlignment: WrapCrossAlignment.center, children: [
                AicdeButton(label: '新增', icon: const Icon(Icons.add), variant: AicdeButtonVariant.primary, size: AicdeButtonSize.sm, onPressed: () {}),
                const AicdeButton(label: '停用', variant: AicdeButtonVariant.primary, onPressed: null),
                AicdeButton(label: '載入中', loading: true, variant: AicdeButtonVariant.secondary, onPressed: () {}),
                AicdeButton(icon: const Icon(Icons.favorite), label: '收藏', onPressed: () {}, size: AicdeButtonSize.sm),
              ]),
              const SizedBox(height: 18),
              AicdeBox(
                kind: AicdeBoxKind.card,
                padding: const EdgeInsets.all(16),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(t.labelText('案例'), style: t.label(size: 11, color: t.colors.coralDark)),
                  const SizedBox(height: 6),
                  Text('暖白分層剪紙', style: t.heading()),
                  const SizedBox(height: 4),
                  Text('用少量紙片建立遠近層次。', style: t.body(size: 13)),
                ]),
              ),
              const SizedBox(height: 16),
              Wrap(spacing: 10, children: [
                AicdeBox(kind: AicdeBoxKind.chip, padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), fill: t.colors.sky, child: Text('設計', style: t.label(size: 12, color: const Color(0xFF173F50)))),
                AicdeBox(kind: AicdeBoxKind.chip, padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), fill: t.colors.coral, child: Text('熱門', style: t.label(size: 12, color: Colors.white))),
              ]),
            ],
          ),
        );
      }),
    );
  }
}
