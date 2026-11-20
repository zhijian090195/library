import 'package:aicde_ui/aicde_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'meta.dart';
import 'pages/display_basic.dart';
import 'pages/display_rich.dart';
import 'pages/entry_advanced.dart';
import 'pages/entry_basic.dart';
import 'pages/feedback.dart';
import 'pages/general.dart';
import 'pages/nav.dart';
import 'pages/overview.dart';

void main() => runApp(const GalleryApp());

/// 網址參數：?c=button&style=brutal&dark（截圖、分享用）；?overview 主題總覽；?all 全部範例
final _q = Uri.base.queryParameters;

/// 一個範例頁：對應網頁版文件的元件
class Entry {
  Entry(this.id, this.group, this.name, this.en, this.desc, this.when, this.builder);
  final String id, group, name, en, desc;
  final List<String> when;
  final WidgetBuilder builder;
}

String _norm(String s) => s.toLowerCase().replaceAll(RegExp('[^a-z]'), '');
const _alias = {'imagepreview': 'image', 'datepicker': 'date', 'colorpicker': 'color', 'otpinput': 'otp'};

/// 網頁版說明裡提到 CSS class、JS 的句子，Flutter 用不到，略過
final _webOnly = RegExp(r'原生|\.js|\.css|CSS|\ba-[a-z]|is-[a-z]|data-|transform|aicde-ui');
String _flutterize(String s) => s.split('。').where((x) => x.trim().isNotEmpty && !_webOnly.hasMatch(x)).map((x) => '$x。').join();

final List<Entry> entries = () {
  final all = [...generalDemos, ...navDemos, ...entryBasicDemos, ...entryAdvancedDemos, ...displayBasicDemos, ...displayRichDemos, ...feedbackDemos];
  final list = <Entry>[];
  for (final (label, builder) in all) {
    final key = _norm(label.split(' ').first);
    final m = docs.where((d) => _norm(d.en) == key || _norm(d.id) == key || d.id == _alias[key]).firstOrNull;
    final zh = label.contains(' ') ? label.substring(label.indexOf(' ') + 1) : label;
    list.add(m == null
        ? Entry(key, 'feedback', zh, label.split(' ').first, '', const [], builder)
        : Entry(m.id, m.group, m.name, m.en, _flutterize(m.desc), [for (final w in m.when) if (!_webOnly.hasMatch(w)) w], builder));
  }
  // 依網頁版文件的分組與順序排列
  final order = {for (final (i, d) in docs.indexed) d.id: i};
  final groups = docGroups.keys.toList();
  list.sort((a, b) {
    final g = groups.indexOf(a.group).compareTo(groups.indexOf(b.group));
    return g != 0 ? g : (order[a.id] ?? 999).compareTo(order[b.id] ?? 999);
  });
  return list;
}();

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
      title: 'AICDE UI · Flutter',
      locale: const Locale('zh', 'TW'),
      supportedLocales: const [Locale('zh', 'TW'), Locale('en')],
      localizationsDelegates: GlobalMaterialLocalizations.delegates,
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
                  onDark: () => setState(() => dark = !dark),
                ),
    );
  }
}

/* ───────────────────────── 文件外框（固定深藍，和網頁版文件一致，不跟主題變） ───────────────────────── */

const _navy = Color(0xFF173F50);
const _navyDark = Color(0xFF08141A);
const _coral = Color(0xFFFC5454);
const _sideInk2 = Color(0x9EFFFFFF);
const _sideLine = Color(0x1FFFFFFF);
const _sideHover = Color(0x14FFFFFF);
const _mono = 'JetBrains Mono';

class GalleryHome extends StatefulWidget {
  const GalleryHome({super.key, required this.style, required this.dark, required this.onStyle, required this.onDark});
  final AicdeThemeStyle style;
  final bool dark;
  final ValueChanged<AicdeThemeStyle> onStyle;
  final VoidCallback onDark;
  @override
  State<GalleryHome> createState() => _GalleryHomeState();
}

class _GalleryHomeState extends State<GalleryHome> {
  /// null = 首頁
  late String? current = _resolve(_q['c']);
  final _scroll = ScrollController();
  final _scaffold = GlobalKey<ScaffoldState>();

  static String? _resolve(String? c) {
    if (c == null) return null;
    final k = _norm(c.split(' ').first);
    return entries.where((e) => e.id == c || _norm(e.id) == k || _norm(e.en) == k).firstOrNull?.id;
  }

  void _go(String? id) {
    setState(() => current = id);
    if (_scroll.hasClients) _scroll.jumpTo(0);
    if (_scaffold.currentState?.isDrawerOpen ?? false) Navigator.of(context).pop();
  }

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final wide = MediaQuery.sizeOf(context).width >= 1024;
    final side = _Sidebar(
      current: current,
      onSelect: _go,
      style: widget.style,
      onStyle: widget.onStyle,
      dark: widget.dark,
      onDark: widget.onDark,
    );
    final entry = entries.where((e) => e.id == current).firstOrNull;
    final page = ListView(
      controller: _scroll,
      padding: EdgeInsets.fromLTRB(wide ? 56 : 20, wide ? 56 : 24, wide ? 56 : 20, 96),
      children: [
        Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 860),
            child: entry == null ? _HomePage(onSelect: _go) : _DocPage(key: ValueKey(entry.id), entry: entry, onSelect: _go),
          ),
        ),
      ],
    );
    return Scaffold(
      key: _scaffold,
      drawer: wide ? null : Drawer(width: 300, backgroundColor: widget.dark ? _navyDark : _navy, child: side),
      appBar: wide
          ? null
          : AppBar(
              backgroundColor: widget.dark ? _navyDark : _navy,
              foregroundColor: Colors.white,
              title: const _Brand(compact: true),
            ),
      body: wide
          ? Row(children: [
              SizedBox(width: 288, child: ColoredBox(color: widget.dark ? _navyDark : _navy, child: side)),
              Expanded(child: page),
            ])
          : page,
    );
  }
}

class _Brand extends StatelessWidget {
  const _Brand({this.compact = false});
  final bool compact;
  @override
  Widget build(BuildContext context) => Row(mainAxisSize: MainAxisSize.min, spacing: 12, children: [
        Container(
          width: compact ? 30 : 40,
          height: compact ? 30 : 40,
          alignment: Alignment.center,
          decoration: BoxDecoration(color: _coral, borderRadius: BorderRadius.circular(compact ? 8 : 11)),
          child: Text('A', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w600, fontSize: compact ? 16 : 20, color: Colors.white)),
        ),
        Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('AICDE', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w600, fontSize: 17, letterSpacing: .3, color: Colors.white, height: 1.2)),
          if (!compact) const Text('UI for Flutter', style: TextStyle(fontSize: 12, color: _sideInk2, height: 1.6)),
        ]),
      ]);
}

class _Sidebar extends StatefulWidget {
  const _Sidebar({required this.current, required this.onSelect, required this.style, required this.onStyle, required this.dark, required this.onDark});
  final String? current;
  final ValueChanged<String?> onSelect;
  final AicdeThemeStyle style;
  final ValueChanged<AicdeThemeStyle> onStyle;
  final bool dark;
  final VoidCallback onDark;
  @override
  State<_Sidebar> createState() => _SidebarState();
}

class _SidebarState extends State<_Sidebar> {
  String query = '';

  @override
  Widget build(BuildContext context) {
    final q = query.trim().toLowerCase();
    final shown = entries.where((e) => q.isEmpty || e.name.contains(q) || e.en.toLowerCase().contains(q) || e.id.contains(q)).toList();
    return DefaultTextStyle(
      style: const TextStyle(color: Colors.white, fontSize: 14, fontFamily: 'Noto Sans TC'),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 32, 24, 20),
          child: GestureDetector(
            onTap: () => widget.onSelect(null),
            child: const MouseRegion(cursor: SystemMouseCursors.click, child: Align(alignment: Alignment.centerLeft, child: _Brand())),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 0, 24, 12),
          child: _SearchBox(onChanged: (v) => setState(() => query = v)),
        ),
        const Divider(color: _sideLine, height: 1, indent: 24, endIndent: 24),
        Expanded(
          child: ListView(padding: const EdgeInsets.fromLTRB(12, 16, 12, 16), children: [
            _SideItem(label: '總覽', active: widget.current == null, onTap: () => widget.onSelect(null)),
            for (final g in docGroups.entries)
              if (shown.any((e) => e.group == g.key)) ...[
                Padding(
                  padding: const EdgeInsets.fromLTRB(12, 22, 12, 8),
                  child: Text(g.value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white)),
                ),
                for (final e in shown.where((e) => e.group == g.key))
                  _SideItem(label: e.name, en: e.en, active: e.id == widget.current, onTap: () => widget.onSelect(e.id)),
              ],
            if (shown.isEmpty)
              const Padding(padding: EdgeInsets.all(12), child: Text('找不到符合的元件', style: TextStyle(color: _sideInk2, fontSize: 13))),
          ]),
        ),
        Container(
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 20),
          decoration: const BoxDecoration(border: Border(top: BorderSide(color: _sideLine))),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, spacing: 12, children: [
            Text('15 主題 · ${entries.length} 個範例', style: const TextStyle(fontSize: 12.5, color: _sideInk2)),
            _ThemePicker(style: widget.style, onStyle: widget.onStyle),
            _Pill(onTap: widget.onDark, child: Row(mainAxisSize: MainAxisSize.min, spacing: 6, children: [
              Icon(widget.dark ? Icons.light_mode_outlined : Icons.dark_mode_outlined, size: 15, color: Colors.white),
              Text(widget.dark ? '淺色' : '深色', style: const TextStyle(fontSize: 13)),
            ])),
          ]),
        ),
      ]),
    );
  }
}

class _SearchBox extends StatelessWidget {
  const _SearchBox({required this.onChanged});
  final ValueChanged<String> onChanged;
  @override
  Widget build(BuildContext context) => TextField(
        onChanged: onChanged,
        style: const TextStyle(color: Colors.white, fontSize: 14),
        cursorColor: _coral,
        decoration: InputDecoration(
          isDense: true,
          hintText: '搜尋元件…',
          hintStyle: const TextStyle(color: _sideInk2, fontSize: 14),
          prefixIcon: const Icon(Icons.search, size: 18, color: _sideInk2),
          prefixIconConstraints: const BoxConstraints(minWidth: 40),
          filled: true,
          fillColor: _sideHover,
          contentPadding: const EdgeInsets.symmetric(vertical: 12),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: _sideLine)),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0x80FFFFFF))),
        ),
      );
}

class _SideItem extends StatefulWidget {
  const _SideItem({required this.label, this.en, required this.active, required this.onTap});
  final String label;
  final String? en;
  final bool active;
  final VoidCallback onTap;
  @override
  State<_SideItem> createState() => _SideItemState();
}

class _SideItemState extends State<_SideItem> {
  bool hover = false;
  @override
  Widget build(BuildContext context) => Semantics(
        button: true,
        selected: widget.active,
        child: InkWell(
          onTap: widget.onTap,
          onHover: (h) => setState(() => hover = h),
          borderRadius: BorderRadius.circular(8),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 160),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
            decoration: BoxDecoration(color: widget.active || hover ? _sideHover : Colors.transparent, borderRadius: BorderRadius.circular(8)),
            child: Row(children: [
              Container(
                width: 5,
                height: 5,
                margin: const EdgeInsets.only(right: 10),
                decoration: BoxDecoration(shape: BoxShape.circle, color: widget.active ? _coral : const Color(0x40FFFFFF)),
              ),
              Expanded(
                child: Text(widget.label,
                    style: TextStyle(fontSize: 14, color: widget.active || hover ? Colors.white : const Color(0xE6FFFFFF), fontWeight: widget.active ? FontWeight.w500 : FontWeight.w400)),
              ),
              if (widget.en != null) Text(widget.en!, style: const TextStyle(fontFamily: _mono, fontSize: 11, color: _sideInk2)),
            ]),
          ),
        ),
      );
}

class _Pill extends StatelessWidget {
  const _Pill({required this.onTap, required this.child, this.expand = false});
  final VoidCallback? onTap;
  final Widget child;
  final bool expand;
  @override
  Widget build(BuildContext context) => InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: Container(
          width: expand ? double.infinity : null,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
          decoration: BoxDecoration(border: Border.all(color: const Color(0x33FFFFFF)), borderRadius: BorderRadius.circular(999)),
          child: child,
        ),
      );
}

class _ThemePicker extends StatelessWidget {
  const _ThemePicker({required this.style, required this.onStyle});
  final AicdeThemeStyle style;
  final ValueChanged<AicdeThemeStyle> onStyle;
  @override
  Widget build(BuildContext context) => PopupMenuButton<AicdeThemeStyle>(
        tooltip: '切換主題',
        initialValue: style,
        onSelected: onStyle,
        position: PopupMenuPosition.over,
        itemBuilder: (_) => [for (final s in AicdeThemeStyle.values) PopupMenuItem(value: s, height: 38, child: Text(themeNames[s] ?? s.name))],
        child: IgnorePointer(
          child: _Pill(
            onTap: () {},
            expand: true,
            child: Row(children: [
              Expanded(child: Text('主題：${themeNames[style] ?? style.name}', style: const TextStyle(fontSize: 13), overflow: TextOverflow.ellipsis)),
              const Icon(Icons.expand_more, size: 18, color: Colors.white),
            ]),
          ),
        ),
      );
}

/* ───────────────────────── 頁面 ───────────────────────── */

class _HomePage extends StatelessWidget {
  const _HomePage({required this.onSelect});
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Flutter 套件 aicde_ui', style: t.caption(size: 13, color: c.coral).copyWith(fontWeight: FontWeight.w600, letterSpacing: .4)),
      const SizedBox(height: 10),
      Text('同一套元件，15 種主題', style: t.heading(size: 38).copyWith(height: 1.25)),
      const SizedBox(height: 14),
      ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 600),
        child: Text('和網頁版、React 版共用同一份設計 token，外觀一致。左下角可以切換主題和深淺色，每個元件都會跟著換材質。',
            style: t.body(size: 16, color: c.ink2).copyWith(height: 1.75)),
      ),
      const SizedBox(height: 28),
      _Code('''dependencies:
  aicde_ui:
    git:
      url: https://github.com/zhijian090195/library.git
      path: flutter'''),
      const SizedBox(height: 12),
      _Code('''MaterialApp(
  theme: aicdeThemeData(style: AicdeThemeStyle.cute),
  darkTheme: aicdeThemeData(style: AicdeThemeStyle.cute, brightness: Brightness.dark),
)'''),
      for (final g in docGroups.entries)
        if (entries.any((e) => e.group == g.key)) ...[
          const SizedBox(height: 44),
          Row(crossAxisAlignment: CrossAxisAlignment.baseline, textBaseline: TextBaseline.alphabetic, spacing: 10, children: [
            Text(g.value, style: t.heading(size: 22)),
            Text('${entries.where((e) => e.group == g.key).length}', style: TextStyle(fontFamily: _mono, fontSize: 13, color: c.ink3)),
          ]),
          const SizedBox(height: 16),
          LayoutBuilder(builder: (context, box) {
            final cols = box.maxWidth >= 720 ? 3 : (box.maxWidth >= 460 ? 2 : 1);
            final w = (box.maxWidth - (cols - 1) * 14) / cols;
            return Wrap(spacing: 14, runSpacing: 14, children: [
              for (final e in entries.where((e) => e.group == g.key))
                SizedBox(width: w, child: _CompCard(entry: e, onTap: () => onSelect(e.id))),
            ]);
          }),
        ],
    ]);
  }
}

class _CompCard extends StatelessWidget {
  const _CompCard({required this.entry, required this.onTap});
  final Entry entry;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    return AicdePressable(
      onTap: onTap,
      semanticLabel: '${entry.name} ${entry.en}',
      builder: (context, s) => AicdeBox(
        kind: AicdeBoxKind.card,
        states: s,
        height: 116,
        padding: const EdgeInsets.fromLTRB(18, 16, 18, 14),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(crossAxisAlignment: CrossAxisAlignment.baseline, textBaseline: TextBaseline.alphabetic, spacing: 8, children: [
            Text(entry.name, style: t.heading(size: 16)),
            Flexible(child: Text(entry.en, style: TextStyle(fontFamily: _mono, fontSize: 11.5, color: t.colors.ink3), overflow: TextOverflow.ellipsis)),
          ]),
          const SizedBox(height: 8),
          Text(entry.desc.isEmpty ? ' ' : entry.desc, maxLines: 2, overflow: TextOverflow.ellipsis, style: t.body(size: 13, color: t.colors.ink2).copyWith(height: 1.6)),
        ]),
      ),
    );
  }
}

/// 表單類範例限制寬度，避免輸入框被拉到整頁寬
const _narrow = {'input', 'textarea', 'select', 'input-number', 'autocomplete', 'cascader', 'color', 'date', 'tag-input', 'range-picker'};

class _DocPage extends StatelessWidget {
  const _DocPage({super.key, required this.entry, required this.onSelect});
  final Entry entry;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final i = entries.indexOf(entry);
    final prev = i > 0 ? entries[i - 1] : null, next = i < entries.length - 1 ? entries[i + 1] : null;
    final cls = 'Aicde${entry.en.replaceAll(' ', '')}';
    Widget demo = Builder(builder: entry.builder);
    if (_narrow.contains(entry.id)) demo = Align(alignment: Alignment.topLeft, child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 380), child: demo));

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('元件 / ${docGroups[entry.group] ?? ''}', style: t.caption(size: 13, color: c.ink3)),
      const SizedBox(height: 10),
      Wrap(crossAxisAlignment: WrapCrossAlignment.end, spacing: 12, children: [
        Text(entry.name, style: t.heading(size: 34).copyWith(height: 1.2)),
        Padding(
          padding: const EdgeInsets.only(bottom: 5),
          child: Text(entry.en, style: TextStyle(fontFamily: _mono, fontSize: 20, color: c.ink3)),
        ),
      ]),
      if (entry.desc.isNotEmpty) ...[
        const SizedBox(height: 14),
        Text(entry.desc, style: t.body(size: 16, color: c.inkBody).copyWith(height: 1.75)),
      ],
      const SizedBox(height: 40),
      _H2('範例'),
      AicdeBox(kind: AicdeBoxKind.panel, padding: const EdgeInsets.all(28), child: SizedBox(width: double.infinity, child: demo)),
      if (entry.when.isNotEmpty) ...[
        const SizedBox(height: 40),
        _H2('何時使用'),
        for (final w in entry.when)
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Container(width: 6, height: 6, margin: const EdgeInsets.fromLTRB(4, 10, 14, 0), decoration: BoxDecoration(color: c.coral, shape: BoxShape.circle)),
              Expanded(child: Text(w, style: t.body(size: 15, color: c.inkBody).copyWith(height: 1.7))),
            ]),
          ),
      ],
      const SizedBox(height: 40),
      _H2('引入'),
      _Code("import 'package:aicde_ui/aicde_ui.dart';\n\n// 元件名稱\n$cls"),
      const SizedBox(height: 56),
      Row(spacing: 14, children: [
        Expanded(child: prev == null ? const SizedBox() : _PagerLink(label: '上一個', entry: prev, onTap: () => onSelect(prev.id))),
        Expanded(child: next == null ? const SizedBox() : _PagerLink(label: '下一個', entry: next, alignEnd: true, onTap: () => onSelect(next.id))),
      ]),
    ]);
  }
}

class _H2 extends StatelessWidget {
  const _H2(this.text);
  final String text;
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: Semantics(header: true, child: Text(text, style: AicdeTheme.of(context).heading(size: 22))),
      );
}

class _Code extends StatelessWidget {
  const _Code(this.code);
  final String code;
  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
        decoration: BoxDecoration(color: const Color(0xFF10232D), borderRadius: BorderRadius.circular(12)),
        child: SelectableText(code, style: const TextStyle(fontFamily: _mono, fontSize: 13, height: 1.65, color: Color(0xFFE3EAED))),
      );
}

class _PagerLink extends StatelessWidget {
  const _PagerLink({required this.label, required this.entry, required this.onTap, this.alignEnd = false});
  final String label;
  final Entry entry;
  final VoidCallback onTap;
  final bool alignEnd;
  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    return AicdePressable(
      onTap: onTap,
      semanticLabel: '$label：${entry.name}',
      builder: (context, s) => AicdeBox(
        kind: AicdeBoxKind.card,
        states: s,
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        child: Column(crossAxisAlignment: alignEnd ? CrossAxisAlignment.end : CrossAxisAlignment.start, spacing: 4, children: [
          Text(label, style: t.caption(size: 12, color: t.colors.ink3)),
          Text(entry.name, style: t.heading(size: 16)),
        ]),
      ),
    );
  }
}

/* ───────────────────────── 截圖用頁面 ───────────────────────── */

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

/// 所有範例排在同一頁（截圖檢查用）：?all&style=brutal&dark
class AllDemosPage extends StatelessWidget {
  const AllDemosPage({super.key});
  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Wrap(spacing: 16, runSpacing: 16, children: [
          for (final e in entries)
            SizedBox(
              width: 560,
              child: AicdeBox(
                kind: AicdeBoxKind.panel,
                padding: const EdgeInsets.all(18),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('${e.name} ${e.en}', style: t.caption()),
                  const SizedBox(height: 10),
                  Builder(builder: e.builder),
                ]),
              ),
            ),
        ]),
      ),
    );
  }
}
