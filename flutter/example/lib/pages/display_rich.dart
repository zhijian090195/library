import 'dart:ui' as ui;

import 'package:aicde_ui/aicde_ui.dart';
// 父套件尚未在 aicde_ui.dart 匯出這一組時，先直接匯入
import 'package:flutter/material.dart';

/// 日期、樹狀、輪播、圖片預覽的範例
final List<(String, WidgetBuilder)> displayRichDemos = [
  ('Calendar 月曆', (_) => const _CalendarDemo()),
  ('RangePicker 日期範圍', (_) => const _RangeDemo()),
  ('DatePicker 日期輸入', (_) => const _DatePickerDemo()),
  ('Tree 樹狀結構', (_) => const _TreeDemo()),
  ('Carousel 輪播', (_) => const _CarouselDemo()),
  ('ImagePreview 圖片預覽', (_) => const _ImageDemo()),
];

class _CalendarDemo extends StatefulWidget {
  const _CalendarDemo();
  @override
  State<_CalendarDemo> createState() => _CalendarDemoState();
}

class _CalendarDemoState extends State<_CalendarDemo> {
  String date = aicdeDateKey(DateTime.now());
  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      AicdeCalendar(
        value: date,
        onChanged: (d) => setState(() => date = d),
        disabledDate: (d) => DateTime.parse(d).weekday == DateTime.sunday,
      ),
      const SizedBox(height: 8),
      Text('已選：$date（週日不可選）', style: t.caption()),
    ]);
  }
}

class _RangeDemo extends StatefulWidget {
  const _RangeDemo();
  @override
  State<_RangeDemo> createState() => _RangeDemoState();
}

class _RangeDemoState extends State<_RangeDemo> {
  AicdeDateRange range = ('', '');
  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      AicdeRangePicker(value: range, onChanged: (r) => setState(() => range = r)),
      const SizedBox(height: 8),
      Text('${range.$1.isEmpty ? '—' : range.$1} → ${range.$2.isEmpty ? '—' : range.$2}', style: t.caption()),
    ]);
  }
}

class _DatePickerDemo extends StatefulWidget {
  const _DatePickerDemo();
  @override
  State<_DatePickerDemo> createState() => _DatePickerDemoState();
}

class _DatePickerDemoState extends State<_DatePickerDemo> {
  String one = '', start = '', end = '';
  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      AicdeDatePicker(value: one, onChanged: (d) => setState(() => one = d)),
      const SizedBox(height: 16),
      AicdeDateRangeInputs(
        start: start,
        end: end,
        onStartChanged: (d) => setState(() => start = d),
        onEndChanged: (d) => setState(() => end = d),
      ),
      const SizedBox(height: 16),
      const AicdeDatePicker(value: '', onChanged: null, placeholder: '停用'),
    ]);
  }
}

class _TreeDemo extends StatelessWidget {
  const _TreeDemo();
  @override
  Widget build(BuildContext context) {
    return const AicdeTree(
      defaultExpandedKeys: ['src', 'components'],
      defaultSelectedKey: 'button',
      data: [
        AicdeTreeNode(key: 'src', label: 'src', children: [
          AicdeTreeNode(key: 'components', label: 'components', children: [
            AicdeTreeNode(key: 'button', label: 'button.dart'),
            AicdeTreeNode(key: 'calendar', label: 'calendar.dart'),
          ]),
          AicdeTreeNode(key: 'theme', label: 'theme', children: [AicdeTreeNode(key: 'tokens', label: 'tokens.dart')]),
          AicdeTreeNode(key: 'main', label: 'main.dart'),
        ]),
        AicdeTreeNode(key: 'pubspec', label: 'pubspec.yaml'),
        AicdeTreeNode(key: 'readme', label: 'README.md'),
      ],
    );
  }
}

class _CarouselDemo extends StatelessWidget {
  const _CarouselDemo();
  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final slides = [
      ('暖白分層剪紙', c.sky, c.navy),
      ('網點絲印', c.coral, Colors.white),
      ('啞光積木', c.navy, Colors.white),
      ('水彩票根', c.surface2, c.ink),
    ];
    Widget slide((String, Color, Color) s) => Padding(
          padding: const EdgeInsets.all(8),
          child: AicdeBox(
            kind: AicdeBoxKind.card,
            fill: s.$2,
            alignment: Alignment.center,
            child: Text(s.$1, style: t.heading(size: 20, color: s.$3)),
          ),
        );
    return SizedBox(
      width: 380,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        AicdeCarousel(autoplay: const Duration(seconds: 4), children: [for (final s in slides) slide(s)]),
        const SizedBox(height: 24),
        Text('peek：露出下一張', style: t.caption()),
        const SizedBox(height: 8),
        AicdeCarousel(peek: true, height: 160, showArrows: false, children: [for (final s in slides) slide(s)]),
      ]),
    );
  }
}

class _ImageDemo extends StatefulWidget {
  const _ImageDemo();
  @override
  State<_ImageDemo> createState() => _ImageDemoState();
}

class _ImageDemoState extends State<_ImageDemo> {
  List<ImageProvider>? images;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (images != null) return;
    final c = AicdeTheme.of(context).colors;
    Future.wait([
      _paint([c.sky, c.navy], c.coral),
      _paint([c.coral, c.coralDark], c.surface),
      _paint([c.surface2, c.band], c.coral),
    ]).then((v) {
      if (mounted) setState(() => images = v);
    });
  }

  /// 不連網：在本機畫幾張示意圖
  static Future<ImageProvider> _paint(List<Color> bg, Color sun) async {
    const w = 960.0, h = 640.0;
    final rec = ui.PictureRecorder();
    final canvas = Canvas(rec);
    canvas.drawRect(
      const Rect.fromLTWH(0, 0, w, h),
      Paint()..shader = ui.Gradient.linear(Offset.zero, const Offset(0, h), bg),
    );
    canvas.drawCircle(const Offset(w * .7, h * .35), 90, Paint()..color = sun);
    final hill = Path()
      ..moveTo(0, h * .75)
      ..quadraticBezierTo(w * .3, h * .5, w * .6, h * .72)
      ..quadraticBezierTo(w * .8, h * .85, w, h * .7)
      ..lineTo(w, h)
      ..lineTo(0, h)
      ..close();
    canvas.drawPath(hill, Paint()..color = const Color(0xCCFFFFFF));
    final img = await rec.endRecording().toImage(w.toInt(), h.toInt());
    final bytes = await img.toByteData(format: ui.ImageByteFormat.png);
    return MemoryImage(bytes!.buffer.asUint8List());
  }

  @override
  Widget build(BuildContext context) {
    final list = images;
    if (list == null) return const SizedBox(height: 110);
    return Wrap(spacing: 16, runSpacing: 16, children: [
      AicdeImagePreview(image: list[0], alt: '遠山與夕陽'),
      AicdeImagePreview(image: list[1], alt: '珊瑚色的午後'),
      AicdeImagePreview(image: list[2], alt: '海藍的早晨', width: 110),
    ]);
  }
}
