import 'package:aicde_ui/aicde_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

Widget wrap(Widget child, {AicdeThemeStyle style = AicdeThemeStyle.paperCut, Brightness b = Brightness.light}) => MaterialApp(
      theme: aicdeThemeData(style: style, brightness: b),
      home: Scaffold(body: Center(child: SizedBox(width: 600, child: SingleChildScrollView(child: child)))),
    );

/// 可測的受控外殼
class Host<T> extends StatefulWidget {
  const Host({super.key, required this.initial, required this.builder});
  final T initial;
  final Widget Function(T value, ValueChanged<T> set) builder;
  @override
  State<Host<T>> createState() => HostState<T>();
}

class HostState<T> extends State<Host<T>> {
  late T value = widget.initial;
  @override
  Widget build(BuildContext context) => widget.builder(value, (v) => setState(() => value = v));
}

T valueOf<T>(WidgetTester tester) => tester.state<HostState<T>>(find.byType(Host<T>)).value;

void main() {
  testWidgets('Input 輸入與受控值', (tester) async {
    await tester.pumpWidget(wrap(Host<String>(initial: 'a', builder: (v, set) => AicdeInput(value: v, onChanged: set))));
    await tester.enterText(find.byType(TextField), 'hello');
    await tester.pump();
    expect(valueOf<String>(tester), 'hello');
  });

  testWidgets('Textarea 字數', (tester) async {
    await tester.pumpWidget(wrap(Host<String>(initial: '', builder: (v, set) => AicdeTextarea(value: v, onChanged: set, maxLength: 10, showCount: true))));
    await tester.enterText(find.byType(TextField), '你好');
    await tester.pump();
    expect(find.text('2 / 10'), findsOneWidget);
  });

  testWidgets('Select 點選與鍵盤', (tester) async {
    await tester.pumpWidget(wrap(Host<String?>(
      initial: null,
      builder: (v, set) => AicdeSelect(
        options: const [AicdeOption('a', label: '甲'), AicdeOption('b', label: '乙', disabled: true), AicdeOption('c', label: '丙')],
        value: v,
        onChanged: set,
      ),
    )));
    await tester.tap(find.text('請選擇'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('乙'));
    await tester.pumpAndSettle();
    expect(valueOf<String?>(tester), isNull, reason: '停用選項不能選');
    await tester.tap(find.text('丙'));
    await tester.pumpAndSettle();
    expect(valueOf<String?>(tester), 'c');
    expect(find.text('甲'), findsNothing, reason: '選完關閉');
    // 鍵盤：focus → ↓ 展開移到下一個可選 → Enter
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.pump();
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
    await tester.pumpAndSettle();
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();
    expect(valueOf<String?>(tester), 'a');
  });

  testWidgets('Switch / Checkbox / Radio 切換', (tester) async {
    await tester.pumpWidget(wrap(Column(children: [
      Host<bool>(initial: false, builder: (v, set) => AicdeSwitch(value: v, onChanged: set, label: 'sw')),
      Host<List<String>>(initial: const [], builder: (v, set) => AicdeCheckboxGroup(options: AicdeOption.of(['x', 'y']), value: v, onChanged: set)),
      Host<String>(initial: 'm', builder: (v, set) => AicdeRadioGroup(options: AicdeOption.of(['m', 'n']), value: v, onChanged: set)),
      const AicdeSwitch(value: false, onChanged: null, label: 'off'),
    ])));
    await tester.tap(find.text('sw'));
    await tester.pump();
    await tester.tap(find.text('y'));
    await tester.pump();
    await tester.tap(find.text('x'));
    await tester.pump();
    await tester.tap(find.text('n'));
    await tester.pump();
    await tester.tap(find.text('off'));
    await tester.pump();
    expect(valueOf<bool>(tester), true);
    expect(valueOf<List<String>>(tester), ['x', 'y'], reason: '依選項順序');
    expect(valueOf<String>(tester), 'n');
  });

  testWidgets('Segmented', (tester) async {
    await tester.pumpWidget(wrap(Host<String>(initial: '日', builder: (v, set) => AicdeSegmented(options: AicdeOption.of(['日', '週']), value: v, onChanged: set))));
    await tester.tap(find.text('週'));
    await tester.pump();
    expect(valueOf<String>(tester), '週');
  });

  testWidgets('Slider 點擊、拖曳、方向鍵', (tester) async {
    await tester.pumpWidget(wrap(Host<double>(initial: 50, builder: (v, set) => SizedBox(width: 220, child: AicdeSlider(value: v, onChanged: set, step: 10)))));
    final r = tester.getRect(find.byType(AicdeSlider));
    await tester.tapAt(Offset(r.left + 10, r.center.dy));
    await tester.pump();
    expect(valueOf<double>(tester), 0);
    await tester.dragFrom(Offset(r.left + 10, r.center.dy), Offset(r.width, 0));
    await tester.pump();
    expect(valueOf<double>(tester), 100);
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
    await tester.pump();
    expect(valueOf<double>(tester), 90);
  });

  testWidgets('InputNumber 加減與夾值', (tester) async {
    await tester.pumpWidget(wrap(Host<num>(initial: 9, builder: (v, set) => AicdeInputNumber(value: v, onChanged: set, min: 0, max: 10))));
    await tester.tap(find.bySemanticsLabel('增加'));
    await tester.pump();
    expect(valueOf<num>(tester), 10);
    await tester.tap(find.bySemanticsLabel('增加'));
    await tester.pump();
    expect(valueOf<num>(tester), 10);
    await tester.enterText(find.byType(TextField), '42');
    await tester.testTextInput.receiveAction(TextInputAction.done);
    await tester.pump();
    expect(valueOf<num>(tester), 10);
    await tester.tap(find.bySemanticsLabel('減少'));
    await tester.pump();
    expect(valueOf<num>(tester), 9);
  });

  testWidgets('OtpInput 貼上與完成', (tester) async {
    String? done;
    await tester.pumpWidget(wrap(Host<String>(
      initial: '',
      builder: (v, set) => AicdeOtpInput(value: v, onChanged: set, length: 4, onComplete: (c) => done = c),
    )));
    await tester.enterText(find.byType(TextField), '12a34');
    await tester.pump();
    expect(valueOf<String>(tester), '1234');
    expect(done, '1234');
    expect(find.text('3'), findsOneWidget);
  });

  testWidgets('全部元件 × 15 主題 × 深淺色都能畫', (tester) async {
    tester.view.physicalSize = const Size(1200, 1600);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    final opts = AicdeOption.of(['一', '二', '三']);
    for (final s in AicdeThemeStyle.values) {
      for (final b in Brightness.values) {
        await tester.pumpWidget(wrap(
          Column(mainAxisSize: MainAxisSize.min, spacing: 10, children: [
            const AicdeField(label: '名稱', help: '說明', child: AicdeInput(placeholder: 'x', prefix: Icon(Icons.search))),
            const AicdeInput(value: 'err', error: true),
            const AicdeInput(placeholder: 'off', enabled: false),
            AicdeTextarea(value: 'abc', onChanged: (_) {}, showCount: true, maxLength: 20),
            AicdeSelect(options: opts, value: '二', onChanged: (_) {}),
            const AicdeSelect(options: [], onChanged: null),
            Row(children: [
              AicdeSwitch(value: true, onChanged: (_) {}),
              const AicdeSwitch(value: false, onChanged: null, size: AicdeSwitchSize.sm),
              AicdeCheckbox(value: true, onChanged: (_) {}, label: 'a'),
              AicdeCheckbox(value: false, indeterminate: true, onChanged: (_) {}),
              AicdeRadio(selected: true, onSelected: () {}, label: 'r'),
            ]),
            AicdeSegmented(options: opts, value: '一', onChanged: (_) {}),
            AicdeSlider(value: 30, onChanged: (_) {}, showValue: true, unit: '%'),
            AicdeInputNumber(value: 1, onChanged: (_) {}),
            AicdeOtpInput(value: '12', onChanged: (_) {}, groupSize: 3, error: true),
            AicdeOtpInput(value: '1234', onChanged: (_) {}, length: 4, success: true),
          ]),
          style: s,
          b: b,
        ));
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull, reason: '$s $b');
      }
    }
    // 展開 Select 下拉，確認浮層也能畫
    await tester.tap(find.byType(AicdeSelect).first);
    await tester.pumpAndSettle();
    expect(find.text('三'), findsNWidgets(2), reason: '分段控制器一個 + 下拉一個');
  });
}
