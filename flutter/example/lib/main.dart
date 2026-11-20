import 'package:aicde_ui/aicde_ui.dart';
import 'package:flutter/material.dart';

import 'pages/display_basic.dart';
import 'pages/display_rich.dart';
import 'pages/entry_advanced.dart';
import 'pages/entry_basic.dart';
import 'pages/feedback.dart';
import 'pages/nav.dart';
import 'pages/overview.dart';

void main() => runApp(const GalleryApp());

/// 網址參數：?style=brutal&dark&c=Table（截圖、分享用）
final _q = Uri.base.queryParameters;

final groups = <(String, List<(String, WidgetBuilder)>)>[
  ('輸入', [...entryBasicDemos, ...entryAdvancedDemos]),
  ('展示', [...displayBasicDemos, ...displayRichDemos]),
  ('回饋', feedbackDemos),
  ('導覽', navDemos),
];

class GalleryApp extends StatefulWidget {
  const GalleryApp({super.key});
  @override
  State<GalleryApp> createState() => _GalleryAppState();
}

class _GalleryAppState extends State<GalleryApp> {
  late AicdeThemeStyle style = AicdeThemeStyle.values.firstWhere((s) => s.name == _q['style'], orElse: () => AicdeThemeStyle.paperCut);
  late bool dark = _q.containsKey('dark');

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'aicde_ui',
      theme: aicdeThemeData(style: style),
      darkTheme: aicdeThemeData(style: style, brightness: Brightness.dark),
      themeMode: dark ? ThemeMode.dark : ThemeMode.light,
      builder: (context, child) => AicdeToaster(child: child!),
      home: _q.containsKey('overview')
          ? const OverviewPage()
          : _q.containsKey('all')
              ? const AllDemosPage()
              : GalleryHome(
              style: style,
              dark: dark,
              onStyle: (s) => setState(() => style = s),
              onDark: (d) => setState(() => dark = d),
            ),
    );
  }
}

class OverviewPage extends StatelessWidget {
  const OverviewPage({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Wrap(spacing: 20, runSpacing: 20, children: [for (final s in AicdeThemeStyle.values) ThemePanel(style: s)]),
        ),
      );
}

class GalleryHome extends StatefulWidget {
  const GalleryHome({super.key, required this.style, required this.dark, required this.onStyle, required this.onDark});
  final AicdeThemeStyle style;
  final bool dark;
  final ValueChanged<AicdeThemeStyle> onStyle;
  final ValueChanged<bool> onDark;
  @override
  State<GalleryHome> createState() => _GalleryHomeState();
}

class _GalleryHomeState extends State<GalleryHome> {
  late String current = _q['c'] ?? groups.first.$2.first.$1;

  WidgetBuilder get _builder =>
      groups.expand((g) => g.$2).firstWhere((d) => d.$1 == current, orElse: () => groups.first.$2.first).$2;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final wide = MediaQuery.sizeOf(context).width >= 760;
    final sidebar = AicdeMenu(
      value: current,
      onChanged: (v) {
        setState(() => current = v);
        if (!wide) Navigator.of(context).maybePop();
      },
      items: [
        for (final g in groups)
          AicdeMenuItem.group(label: '${g.$1}（${g.$2.length}）', children: [
            for (final d in g.$2) AicdeMenuItem(id: d.$1, label: d.$1),
          ]),
      ],
    );
    final toolbar = Row(children: [
      Expanded(
        child: Text(current, style: t.heading(size: 22), overflow: TextOverflow.ellipsis),
      ),
      SizedBox(
        width: 180,
        child: AicdeSelect(
          options: [for (final s in AicdeThemeStyle.values) AicdeOption(s.name, label: themeNames[s] ?? s.name)],
          value: widget.style.name,
          onChanged: (v) => widget.onStyle(AicdeThemeStyle.values.byName(v)),
        ),
      ),
      const SizedBox(width: 12),
      AicdeSwitch(value: widget.dark, onChanged: widget.onDark, label: '深色'),
    ]);
    final body = ListView(
      padding: const EdgeInsets.fromLTRB(28, 24, 28, 60),
      children: [
        toolbar,
        const SizedBox(height: 24),
        AicdeBox(
          kind: AicdeBoxKind.panel,
          padding: const EdgeInsets.all(24),
          child: Builder(key: ValueKey(current), builder: _builder),
        ),
      ],
    );
    return Scaffold(
      drawer: wide ? null : Drawer(child: SafeArea(child: SingleChildScrollView(child: sidebar))),
      appBar: wide ? null : AppBar(title: const Text('aicde_ui')),
      body: wide
          ? Row(children: [
              Container(
                width: 240,
                color: t.colors.surface,
                child: ListView(padding: const EdgeInsets.all(12), children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(8, 8, 8, 16),
                    child: Text('aicde_ui', style: t.heading(size: 20)),
                  ),
                  sidebar,
                ]),
              ),
              Expanded(child: body),
            ])
          : body,
    );
  }
}

/// 所有範例排在同一頁（截圖檢查用）：?all&style=brutal&dark
class AllDemosPage extends StatelessWidget {
  const AllDemosPage({super.key});
  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final demos = groups.expand((g) => g.$2).toList();
    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Wrap(spacing: 16, runSpacing: 16, children: [
          for (final d in demos)
            SizedBox(
              width: 560,
              child: AicdeBox(
                kind: AicdeBoxKind.panel,
                padding: const EdgeInsets.all(18),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(d.$1, style: t.caption()),
                  const SizedBox(height: 10),
                  Builder(builder: d.$2),
                ]),
              ),
            ),
        ]),
      ),
    );
  }
}
