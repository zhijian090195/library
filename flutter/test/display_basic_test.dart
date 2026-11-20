import 'package:aicde_ui/aicde_ui.dart';
// ignore_for_file: avoid_relative_lib_imports

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../example/lib/pages/display_basic.dart';

Widget wrap(Widget child, {AicdeThemeStyle style = AicdeThemeStyle.paperCut, Brightness b = Brightness.light}) => MaterialApp(
      theme: aicdeThemeData(style: style, brightness: b),
      home: Scaffold(body: SingleChildScrollView(child: Padding(padding: const EdgeInsets.all(24), child: child))),
    );

class R {
  const R(this.n, this.v);
  final String n;
  final int v;
}

void main() {
  testWidgets('所有範例 × 15 主題 × 深淺色都能畫出來，沒有例外', (tester) async {
    tester.view.physicalSize = const Size(1000, 3000);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    for (final s in AicdeThemeStyle.values) {
      for (final b in Brightness.values) {
        await tester.pumpWidget(wrap(
          Builder(builder: (c) => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                for (final d in displayBasicDemos) Padding(padding: const EdgeInsets.only(bottom: 16), child: d.$2(c)),
              ])),
          style: s,
          b: b,
        ));
        await tester.pump(const Duration(seconds: 1));
        expect(tester.takeException(), isNull, reason: '$s $b');
      }
    }
  });

  testWidgets('Collapse 手風琴：一次只開一個，停用項目不能開', (tester) async {
    List<String>? last;
    await tester.pumpWidget(wrap(AicdeCollapse(accordion: true, onChange: (k) => last = k, items: const [
      AicdeCollapseItem(key: 'a', title: 'A', content: Text('內容A')),
      AicdeCollapseItem(key: 'b', title: 'B', content: Text('內容B')),
      AicdeCollapseItem(key: 'c', title: 'C', content: Text('內容C'), disabled: true),
    ])));
    expect(find.text('內容A'), findsNothing);
    await tester.tap(find.text('A'));
    await tester.pumpAndSettle();
    expect(find.text('內容A'), findsOneWidget);
    await tester.tap(find.text('B'));
    await tester.pumpAndSettle();
    expect(last, ['b']);
    expect(find.text('內容A'), findsNothing);
    await tester.tap(find.text('C'));
    await tester.pumpAndSettle();
    expect(find.text('內容C'), findsNothing);
  });

  testWidgets('Table 排序與勾選', (tester) async {
    List<String>? sel;
    await tester.pumpWidget(wrap(AicdeTable<R>(
      selectable: true,
      onSelectionChange: (k) => sel = k,
      rowKey: (r) => r.n,
      rows: const [R('b', 2), R('a', 3), R('c', 1)],
      columns: [
        AicdeTableColumn(key: 'n', title: 'N', value: (r) => r.n, sortable: true),
        AicdeTableColumn(key: 'v', title: 'V', value: (r) => r.v, sortable: true),
      ],
    )));
    double y(String s) => tester.getTopLeft(find.text(s)).dy;
    await tester.tap(find.text('V'));
    await tester.pump();
    expect(y('1') < y('2') && y('2') < y('3'), isTrue);
    await tester.tap(find.text('V'));
    await tester.pump();
    expect(y('3') < y('2') && y('2') < y('1'), isTrue);
    await tester.tap(find.byType(Checkbox).first);
    await tester.pump();
    expect(sel, unorderedEquals(['a', 'b', 'c']));
    await tester.tap(find.byType(Checkbox).at(1));
    await tester.pump();
    expect(sel!.length, 2);
  });

  testWidgets('Table 空資料', (tester) async {
    await tester.pumpWidget(wrap(AicdeTable<R>(rowKey: (r) => r.n, rows: const [], columns: [AicdeTableColumn(key: 'n', title: 'N', value: (r) => r.n)])));
    expect(find.text('沒有資料'), findsOneWidget);
  });

  testWidgets('Tag 關閉、List 點擊、Card 點擊', (tester) async {
    var closed = 0, tapped = 0, card = 0;
    await tester.pumpWidget(wrap(Column(children: [
      AicdeTag(label: 'x', closable: true, onClose: () => closed++),
      AicdeList(items: [AicdeListItem(title: '項目', onTap: () => tapped++)]),
      AicdeCard(title: '卡', onTap: () => card++),
    ])));
    await tester.tap(find.byIcon(Icons.close));
    await tester.tap(find.text('項目'));
    await tester.tap(find.text('卡'));
    await tester.pump();
    expect([closed, tapped, card], [1, 1, 1]);
  });

  testWidgets('Badge 上限、0 隱藏、Statistic 格式', (tester) async {
    await tester.pumpWidget(wrap(const Column(children: [
      AicdeBadge(count: 120),
      AicdeBadge(count: 0),
      AicdeStatistic(label: '營收', value: 1234567.5, decimals: 1, animate: false),
    ])));
    expect(find.text('99+'), findsOneWidget);
    expect(find.text('0'), findsNothing);
    expect(find.text('1,234,567.5'), findsOneWidget);
    expect(AicdeStatistic.format(-1000, 0), '-1,000');
  });

  testWidgets('Statistic 數字動畫結束在目標值；減少動態時直接顯示', (tester) async {
    await tester.pumpWidget(wrap(const AicdeStatistic(label: 'n', value: 500)));
    await tester.pump(const Duration(seconds: 2));
    expect(find.text('500'), findsOneWidget);
    await tester.pumpWidget(MediaQuery(
      data: const MediaQueryData(disableAnimations: true),
      child: wrap(const AicdeStatistic(label: 'm', value: 42)),
    ));
    await tester.pump();
    expect(find.text('42'), findsOneWidget);
  });

  testWidgets('Avatar 首字與群組 +N', (tester) async {
    await tester.pumpWidget(wrap(const AicdeAvatarGroup(max: 2, children: [AicdeAvatar(name: 'amy'), AicdeAvatar(name: '林'), AicdeAvatar(name: 'c')])));
    expect(find.text('A'), findsOneWidget);
    expect(find.text('林'), findsOneWidget);
    expect(find.text('+1'), findsOneWidget);
  });

  testWidgets('Tooltip 長按顯示', (tester) async {
    await tester.pumpWidget(wrap(AicdeTooltip(message: '說明', child: AicdeButton(label: 'b', onPressed: () {}))));
    await tester.longPress(find.text('b'));
    await tester.pump(const Duration(milliseconds: 500));
    expect(find.text('說明'), findsOneWidget);
  });
}
