import 'dart:convert';

import 'package:aicde_ui/aicde_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

final png = MemoryImage(base64Decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='));

Widget wrap(Widget child, {AicdeThemeStyle style = AicdeThemeStyle.paperCut, Brightness b = Brightness.light}) => MaterialApp(
      theme: aicdeThemeData(style: style, brightness: b),
      home: Scaffold(body: SingleChildScrollView(child: Center(child: child))),
    );

const treeData = [
  AicdeTreeNode(key: 'src', label: 'src', children: [
    AicdeTreeNode(key: 'app', label: 'app.dart'),
    AicdeTreeNode(key: 'ui', label: 'ui', children: [AicdeTreeNode(key: 'btn', label: 'button.dart')]),
  ]),
  AicdeTreeNode(key: 'readme', label: 'README.md'),
];

void main() {
  test('monthGrid：42 格、從週日開始、包含當月 1 號', () {
    final g = aicdeMonthGrid(2026, 11);
    expect(g.length, 42);
    expect(g.first.weekday, DateTime.sunday);
    expect(g.any((d) => aicdeDateKey(d) == '2026-11-01'), isTrue);
    expect(aicdeParseDateKey('2026-02-03'), DateTime(2026, 2, 3));
    expect(aicdeDateKey(DateTime(2026, 1, 5)), '2026-01-05');
  });

  testWidgets('Calendar：點日期、切換月份、停用日期', (tester) async {
    String? picked;
    await tester.pumpWidget(wrap(AicdeCalendar(
      defaultValue: '2026-11-20',
      onChanged: (d) => picked = d,
      disabledDate: (d) => d == '2026-11-25',
    )));
    expect(find.text('2026 年 11 月'), findsOneWidget);
    await tester.tap(find.bySemanticsLabel('11 月 12 日'));
    await tester.pump();
    expect(picked, '2026-11-12');
    picked = null;
    await tester.tap(find.bySemanticsLabel('11 月 25 日'));
    await tester.pump();
    expect(picked, isNull);
    await tester.tap(find.bySemanticsLabel('下個月'));
    await tester.pumpAndSettle();
    expect(find.text('2026 年 12 月'), findsOneWidget);
    await tester.tap(find.bySemanticsLabel('上個月'));
    await tester.pumpAndSettle();
    expect(find.text('2026 年 11 月'), findsOneWidget);
  });

  testWidgets('Calendar：點上個月的日期會跟著翻頁', (tester) async {
    await tester.pumpWidget(wrap(const AicdeCalendar(defaultValue: '2026-12-10')));
    await tester.tap(find.bySemanticsLabel('11 月 30 日'));
    await tester.pumpAndSettle();
    expect(find.text('2026 年 11 月'), findsOneWidget);
  });

  testWidgets('RangePicker：兩下選範圍，比開始早的日期重新起算', (tester) async {
    final log = <AicdeDateRange>[];
    await tester.pumpWidget(wrap(AicdeRangePicker(defaultMonth: '2026-11-01', onChanged: log.add)));
    await tester.tap(find.bySemanticsLabel('11 月 10 日'));
    await tester.pump();
    await tester.tap(find.bySemanticsLabel('11 月 14 日'));
    await tester.pump();
    expect(log.last, ('2026-11-10', '2026-11-14'));
    await tester.tap(find.bySemanticsLabel('11 月 3 日'));
    await tester.pump();
    expect(log.last, ('2026-11-03', ''));
    await tester.tap(find.bySemanticsLabel('11 月 1 日'));
    await tester.pump();
    expect(log.last, ('2026-11-01', ''));
  });

  testWidgets('DatePicker：開啟、選日期、關閉；min 之前不可選；Esc 關閉', (tester) async {
    var v = '';
    await tester.pumpWidget(wrap(StatefulBuilder(
      builder: (c, set) => AicdeDatePicker(value: v, min: '2026-11-10', onChanged: (d) => set(() => v = d)),
    )));
    await tester.tap(find.text('選擇日期'));
    await tester.pumpAndSettle();
    expect(find.text('2026 年 11 月'), findsOneWidget);
    await tester.tap(find.bySemanticsLabel('11 月 5 日'));
    await tester.pump();
    expect(v, '');
    await tester.tap(find.bySemanticsLabel('11 月 18 日'));
    await tester.pumpAndSettle();
    expect(v, '2026-11-18');
    expect(find.text('2026 年 11 月'), findsNothing);
    await tester.tap(find.text('2026-11-18'));
    await tester.pumpAndSettle();
    expect(find.text('2026 年 11 月'), findsOneWidget);
    await tester.sendKeyEvent(LogicalKeyboardKey.escape);
    await tester.pumpAndSettle();
    expect(find.text('2026 年 11 月'), findsNothing);
  });

  testWidgets('DateRangeInputs：結束日以開始日為 min', (tester) async {
    var end = '';
    await tester.pumpWidget(wrap(AicdeDateRangeInputs(
      start: '2026-11-15',
      end: end,
      onStartChanged: (_) {},
      onEndChanged: (d) => end = d,
    )));
    await tester.tap(find.text('結束日期'));
    await tester.pumpAndSettle();
    await tester.tap(find.bySemanticsLabel('11 月 10 日'));
    await tester.pump();
    expect(end, '');
    await tester.tap(find.bySemanticsLabel('11 月 20 日'));
    await tester.pumpAndSettle();
    expect(end, '2026-11-20');
  });

  testWidgets('Tree：展開資料夾、選取檔案、Enter 操作', (tester) async {
    String? sel;
    List<String>? expanded;
    await tester.pumpWidget(wrap(AicdeTree(
      data: treeData,
      defaultExpandedKeys: const ['src'],
      onSelect: (k, _) => sel = k,
      onExpandChange: (k) => expanded = k,
    )));
    expect(find.text('app.dart'), findsOneWidget);
    expect(find.text('button.dart'), findsNothing);
    await tester.tap(find.text('ui'));
    await tester.pumpAndSettle();
    expect(expanded, ['src', 'ui']);
    expect(find.text('button.dart'), findsOneWidget);
    await tester.tap(find.text('button.dart'));
    await tester.pump();
    expect(sel, 'btn');
    await tester.tap(find.text('src'));
    await tester.pumpAndSettle();
    expect(find.text('app.dart'), findsNothing);
    // 鍵盤：Tab 到 README 後按 Enter
    for (var i = 0; i < 5 && sel != 'readme'; i++) {
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();
    }
    expect(sel, 'readme');
  });

  testWidgets('Carousel：箭頭、圓點、方向鍵、自動播放', (tester) async {
    final key = GlobalKey<AicdeCarouselState>();
    final changes = <int>[];
    await tester.pumpWidget(wrap(SizedBox(
      width: 400,
      child: AicdeCarousel(
        key: key,
        onChanged: changes.add,
        children: [for (var i = 0; i < 3; i++) Center(child: Text('slide $i'))],
      ),
    )));
    await tester.tap(find.bySemanticsLabel('下一張'));
    await tester.pumpAndSettle();
    expect(key.currentState!.index, 1);
    await tester.tap(find.bySemanticsLabel('第 3 張'));
    await tester.pumpAndSettle();
    expect(key.currentState!.index, 2);
    key.currentState!.prev();
    await tester.pumpAndSettle();
    expect(key.currentState!.index, 1);
    expect(changes, isNotEmpty);
    // 方向鍵
    Focus.of(tester.element(find.text('slide 1'))).requestFocus();
    await tester.pump();
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await tester.pumpAndSettle();
    expect(key.currentState!.index, 2);
  });

  testWidgets('Carousel：自動播放到最後一張後回到第一張', (tester) async {
    final key = GlobalKey<AicdeCarouselState>();
    await tester.pumpWidget(wrap(SizedBox(
      width: 400,
      child: AicdeCarousel(
        key: key,
        autoplay: const Duration(seconds: 2),
        children: [for (var i = 0; i < 3; i++) Text('slide $i')],
      ),
    )));
    for (final want in [1, 2, 0]) {
      await tester.pump(const Duration(seconds: 2));
      await tester.pump(const Duration(milliseconds: 600));
      expect(key.currentState!.index, want);
    }
  });

  testWidgets('ImagePreview：開啟大圖、Esc 關閉、點 × 關閉', (tester) async {
    await tester.pumpWidget(wrap(AicdeImagePreview(image: png, alt: '封面')));
    await tester.tap(find.byType(AicdeImagePreview));
    await tester.pumpAndSettle();
    expect(find.text('封面'), findsOneWidget);
    await tester.sendKeyEvent(LogicalKeyboardKey.escape);
    await tester.pumpAndSettle();
    expect(find.text('封面'), findsNothing);
    await tester.tap(find.byType(AicdeImagePreview));
    await tester.pumpAndSettle();
    await tester.tap(find.text('×'));
    await tester.pumpAndSettle();
    expect(find.text('封面'), findsNothing);
  });

  testWidgets('所有主題 × 深淺色都能畫出來，沒有例外', (tester) async {
    tester.view.physicalSize = const Size(1400, 2000);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    for (final s in AicdeThemeStyle.values) {
      for (final b in Brightness.values) {
        await tester.pumpWidget(wrap(
          Wrap(spacing: 16, runSpacing: 16, children: [
            const AicdeCalendar(defaultValue: '2026-11-20'),
            const AicdeRangePicker(defaultValue: ('2026-11-08', '2026-11-14')),
            AicdeDatePicker(value: '2026-11-20', onChanged: (_) {}),
            const AicdeDatePicker(value: '', onChanged: null),
            const AicdeTree(data: treeData, defaultExpandedKeys: ['src', 'ui'], defaultSelectedKey: 'app'),
            SizedBox(width: 320, child: AicdeCarousel(peek: true, children: [for (var i = 0; i < 3; i++) Text('$i')])),
            AicdeImagePreview(image: png, alt: '圖'),
          ]),
          style: s,
          b: b,
        ));
        await tester.pump(const Duration(milliseconds: 400));
        expect(tester.takeException(), isNull, reason: '$s $b');
      }
    }
    // 開啟彈出日曆也試一次
    await tester.tap(find.text('2026-11-20'));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
  });

  testWidgets('減少動態時切換月份沒有動畫', (tester) async {
    await tester.pumpWidget(MediaQuery(
      data: const MediaQueryData(disableAnimations: true),
      child: wrap(const AicdeCalendar(defaultValue: '2026-11-20')),
    ));
    await tester.tap(find.bySemanticsLabel('下個月'));
    await tester.pump();
    expect(find.text('2026 年 12 月'), findsOneWidget);
    expect(find.text('2026 年 11 月'), findsNothing);
  });
}
