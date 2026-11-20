import 'package:aicde_ui/aicde_ui.dart';
import 'package:flutter/services.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

Widget wrap(Widget child, {AicdeThemeStyle style = AicdeThemeStyle.paperCut, Brightness b = Brightness.light}) =>
    MaterialApp(theme: aicdeThemeData(style: style, brightness: b), home: Scaffold(body: Center(child: child)));

void main() {
  test('每個主題 × 深淺色都能產生 token', () {
    for (final s in AicdeThemeStyle.values) {
      for (final b in Brightness.values) {
        final t = AicdeTokens.resolve(s, b);
        expect(t.style, s);
        expect(t.brightness, b);
        expect(t.controlHeight, greaterThan(30));
      }
    }
  });

  test('主題切換的 lerp 不會出錯', () {
    final a = AicdeTokens.resolve(AicdeThemeStyle.brutal, Brightness.light);
    final b = AicdeTokens.resolve(AicdeThemeStyle.cute, Brightness.dark);
    for (final t in [0.0, .3, .5, .7, 1.0]) {
      a.lerp(b, t);
    }
    expect(a.lerp(b, 1).style, AicdeThemeStyle.cute);
  });

  testWidgets('點擊與停用', (tester) async {
    var n = 0;
    await tester.pumpWidget(wrap(Column(mainAxisSize: MainAxisSize.min, children: [
      AicdeButton(label: '儲存', variant: AicdeButtonVariant.primary, onPressed: () => n++),
      const AicdeButton(label: '停用', onPressed: null),
    ])));
    await tester.tap(find.text('儲存'));
    await tester.tap(find.text('停用'));
    await tester.pumpAndSettle();
    expect(n, 1);
  });

  testWidgets('鍵盤 Enter 觸發', (tester) async {
    var n = 0;
    await tester.pumpWidget(wrap(AicdeButton(label: 'OK', autofocus: true, onPressed: () => n++)));
    await tester.pump();
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pump();
    expect(n, 1);
  });

  testWidgets('載入中不能點', (tester) async {
    var n = 0;
    await tester.pumpWidget(wrap(AicdeButton(label: '送出', loading: true, onPressed: () => n++)));
    await tester.tap(find.text('送出'));
    await tester.pump();
    expect(n, 0);
  });

  testWidgets('所有主題 × 深淺色 × 變體都能畫出來，沒有溢出', (tester) async {
    for (final s in AicdeThemeStyle.values) {
      for (final b in Brightness.values) {
        await tester.pumpWidget(wrap(
          Wrap(children: [
            for (final v in AicdeButtonVariant.values) AicdeButton(label: '按鈕', variant: v, onPressed: () {}),
            AicdeButton(icon: const Icon(Icons.add), onPressed: () {}),
            const AicdeBox(kind: AicdeBoxKind.card, child: SizedBox(width: 120, height: 60)),
            const AicdeBox(kind: AicdeBoxKind.field, states: AicdeStates(focused: true), child: SizedBox(width: 120, height: 40)),
          ]),
          style: s,
          b: b,
        ));
        await tester.pump(const Duration(milliseconds: 400));
        expect(tester.takeException(), isNull, reason: '$s $b');
      }
    }
  });

  testWidgets('AicdeTheme 只影響包住的區塊', (tester) async {
    late AicdeTokens inner, outer;
    await tester.pumpWidget(wrap(Column(children: [
      Builder(builder: (c) { outer = AicdeTheme.of(c); return const SizedBox(); }),
      AicdeTheme(style: AicdeThemeStyle.brutal, child: Builder(builder: (c) { inner = AicdeTheme.of(c); return const SizedBox(); })),
    ])));
    expect(outer.style, AicdeThemeStyle.paperCut);
    expect(inner.style, AicdeThemeStyle.brutal);
  });

  testWidgets('主題即時切換到可愛（彈跳曲線）時陰影不會報錯', (tester) async {
    for (final from in [AicdeThemeStyle.clinical, AicdeThemeStyle.brutal, AicdeThemeStyle.paperCut]) {
      for (final to in [AicdeThemeStyle.cute, from]) {
        await tester.pumpWidget(wrap(AicdeButton(label: 'A', variant: AicdeButtonVariant.primary, onPressed: () {}), style: to));
        for (var i = 0; i < 12; i++) {
          await tester.pump(const Duration(milliseconds: 30));
        }
        expect(tester.takeException(), isNull);
      }
    }
  });

  testWidgets('疊材質的主題：外框跟著父層給的寬度', (tester) async {
    for (final s in [AicdeThemeStyle.blueprint, AicdeThemeStyle.stitch, AicdeThemeStyle.riso, AicdeThemeStyle.block]) {
      await tester.pumpWidget(wrap(
        const SizedBox(width: 300, child: AicdeBox(kind: AicdeBoxKind.panel, child: Text('x'))),
        style: s,
      ));
      final box = tester.getSize(find.byType(AnimatedContainer).last);
      expect(box.width, 300, reason: '$s');
    }
  });
}
