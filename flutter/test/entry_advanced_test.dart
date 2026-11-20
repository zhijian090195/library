import 'package:aicde_ui/aicde_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

Widget wrap(Widget child, {AicdeThemeStyle style = AicdeThemeStyle.paperCut, Brightness b = Brightness.light}) => MaterialApp(
      theme: aicdeThemeData(style: style, brightness: b),
      home: Scaffold(body: SingleChildScrollView(child: Padding(padding: const EdgeInsets.all(20), child: child))),
    );

const regions = [
  AicdeCascaderOption('tw', label: '台灣', children: [
    AicdeCascaderOption('tpe', label: '台北', children: [AicdeCascaderOption('xy', label: '信義區'), AicdeCascaderOption('da', label: '大安區')]),
    AicdeCascaderOption('khh', label: '高雄'),
  ]),
  AicdeCascaderOption('jp', label: '日本', disabled: true),
];

void main() {
  testWidgets('Rating：點擊、滑過、鍵盤、唯讀', (tester) async {
    int? got;
    await tester.pumpWidget(wrap(Column(children: [
      AicdeRating(initialValue: 2, onChanged: (v) => got = v),
      AicdeRating(value: 3, readOnly: true, onChanged: (v) => got = -1),
    ])));
    await tester.tap(find.bySemanticsLabel('4 星').first);
    expect(got, 4);
    await tester.tap(find.bySemanticsLabel('1 星').last);
    expect(got, 4);
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.pump();
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    expect(got, 5);
  });

  testWidgets('Autocomplete：篩選、上下鍵、Enter 選取', (tester) async {
    String? sel, text;
    await tester.pumpWidget(wrap(AicdeAutocomplete(
      options: AicdeAutocomplete.strings(['台北', '台中', '台南', '高雄']),
      onSelected: (v) => sel = v,
      onChanged: (v) => text = v,
    )));
    await tester.tap(find.byType(TextField));
    await tester.pumpAndSettle();
    expect(find.text('高雄'), findsOneWidget);
    await tester.enterText(find.byType(TextField), '台');
    await tester.pumpAndSettle();
    expect(find.text('高雄'), findsNothing);
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();
    expect(sel, '台中');
    expect(text, '台中');
    await tester.enterText(find.byType(TextField), 'zzz');
    await tester.pumpAndSettle();
    expect(find.text('沒有符合的結果'), findsOneWidget);
    // 滑鼠選取
    await tester.enterText(find.byType(TextField), '南');
    await tester.pumpAndSettle();
    await tester.tap(find.textContaining('台', findRichText: true).last);
    await tester.pumpAndSettle();
    expect(sel, '台南');
  });

  testWidgets('Cascader：逐層選取、停用、鍵盤', (tester) async {
    List<String>? path, labels;
    await tester.pumpWidget(wrap(AicdeCascader(options: regions, onChanged: (p, l) { path = p; labels = l; })));
    await tester.tap(find.text('請選擇'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('日本'));
    await tester.pumpAndSettle();
    expect(find.text('台北'), findsNothing);
    await tester.tap(find.text('台灣'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('台北'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('大安區'));
    await tester.pumpAndSettle();
    expect(path, ['tw', 'tpe', 'da']);
    expect(labels, ['台灣', '台北', '大安區']);
    expect(find.text('台灣 / 台北 / 大安區'), findsOneWidget);
    expect(find.text('信義區'), findsNothing);

    // 鍵盤：開啟 → 右 → 下 → Enter（高雄）
    await tester.tap(find.text('台灣 / 台北 / 大安區'));
    await tester.pumpAndSettle();
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
    await tester.pump();
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();
    expect(path, ['tw', 'khh']);

    // Esc 關閉
    await tester.tap(find.text('台灣 / 高雄'));
    await tester.pumpAndSettle();
    expect(find.text('日本'), findsOneWidget);
    await tester.sendKeyEvent(LogicalKeyboardKey.escape);
    await tester.pumpAndSettle();
    expect(find.text('日本'), findsNothing);
  });

  testWidgets('TagInput：Enter、逗號、重複、Backspace、上限、移除', (tester) async {
    List<String> tags = [];
    await tester.pumpWidget(wrap(AicdeTagInput(initialValue: const ['設計'], max: 4, onChanged: (v) => tags = v)));
    await tester.tap(find.byType(TextField));
    await tester.enterText(find.byType(TextField), 'React');
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();
    expect(tags, ['設計', 'React']);
    await tester.enterText(find.byType(TextField), 'Flutter，設計,Go');
    await tester.pumpAndSettle();
    expect(tags, ['設計', 'React', 'Flutter', 'Go']);
    await tester.enterText(find.byType(TextField), 'X');
    await tester.pump();
    final tf = tester.widget<TextField>(find.byType(TextField));
    expect(tf.enabled, isFalse);
    await tester.tap(find.bySemanticsLabel('移除React'));
    await tester.pumpAndSettle();
    expect(tags, ['設計', 'Flutter', 'Go']);
    await tester.tap(find.byType(TextField));
    await tester.enterText(find.byType(TextField), '');
    await tester.sendKeyEvent(LogicalKeyboardKey.backspace);
    await tester.pumpAndSettle();
    expect(tags, ['設計', 'Flutter']);
  });

  testWidgets('Transfer：勾選、全選、移動', (tester) async {
    List<String> right = [];
    await tester.pumpWidget(wrap(AicdeTransfer(
      items: const [AicdeTransferItem('a', label: '蘋果'), AicdeTransferItem('b', label: '香蕉'), AicdeTransferItem('c', label: '櫻桃', disabled: true)],
      onChanged: (v) => right = v,
    )));
    await tester.tap(find.text('蘋果'));
    await tester.pump();
    await tester.tap(find.bySemanticsLabel('移到右邊'));
    await tester.pumpAndSettle();
    expect(right, ['a']);
    await tester.tap(find.bySemanticsLabel(RegExp('全選')).first);
    await tester.pump();
    await tester.tap(find.bySemanticsLabel('移到右邊'));
    await tester.pumpAndSettle();
    expect(right, ['a', 'b']);
    await tester.tap(find.text('蘋果'));
    await tester.pump();
    await tester.tap(find.bySemanticsLabel('移到左邊'));
    await tester.pumpAndSettle();
    expect(right, ['b']);
  });

  testWidgets('ColorPicker / ColorSwatches', (tester) async {
    String? hex, sw;
    await tester.pumpWidget(wrap(Column(children: [
      AicdeColorPicker(onChanged: (v) => hex = v),
      AicdeColorSwatches(colors: const ['#173F50', '#FC5454', '#A8C8D4'], labels: const ['深藍', '珊瑚', '天藍'], onChanged: (v) => sw = v),
    ])));
    expect(find.text('#FC5454'), findsOneWidget);
    await tester.tap(find.text('#FC5454'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField), '#173f50');
    await tester.pumpAndSettle();
    expect(hex, '#173F50');
    final sv = find.bySemanticsLabel('飽和度與明度');
    await tester.tapAt(tester.getTopLeft(sv) + const Offset(4, 4));
    await tester.pump();
    expect(hex, isNot('#173F50'));
    await tester.sendKeyEvent(LogicalKeyboardKey.escape);
    await tester.pumpAndSettle();
    await tester.tap(find.bySemanticsLabel('天藍'));
    await tester.pump();
    expect(sw, '#A8C8D4');
  });

  testWidgets('Upload：onPick、單檔、多檔、移除、停用', (tester) async {
    var n = 0;
    List<AicdeUploadFile> files = [];
    Future<List<AicdeUploadFile>?> pick() async => [AicdeUploadFile(name: 'f${++n}.png', size: 2048)];
    await tester.pumpWidget(wrap(AicdeUpload(onPick: pick, onChanged: (v) => files = v)));
    await tester.tap(find.textContaining('點擊選擇', findRichText: true));
    await tester.pumpAndSettle();
    await tester.tap(find.bySemanticsLabel(RegExp('上傳檔案')));
    await tester.pumpAndSettle();
    expect(files.map((f) => f.name), ['f2.png']);
    expect(find.text('2 KB'), findsOneWidget);

    await tester.pumpWidget(wrap(AicdeUpload(key: const ValueKey('m'), multiple: true, onPick: pick, onChanged: (v) => files = v)));
    await tester.tap(find.bySemanticsLabel(RegExp('上傳檔案')));
    await tester.pumpAndSettle();
    await tester.tap(find.bySemanticsLabel(RegExp('上傳檔案')));
    await tester.pumpAndSettle();
    expect(files.length, 2);
    await tester.tap(find.bySemanticsLabel('移除${files.first.name}'));
    await tester.pumpAndSettle();
    expect(files.length, 1);

    await tester.pumpWidget(wrap(const AicdeUpload(files: [
      AicdeUploadFile(name: 'a.pdf', size: 3000000, progress: .4),
      AicdeUploadFile(name: 'b.zip', error: '檔案太大'),
    ], enabled: false)));
    await tester.pumpAndSettle();
    expect(find.text('2.9 MB'), findsOneWidget);
    expect(find.text('檔案太大'), findsOneWidget);
  });

  testWidgets('全部主題 × 深淺色都能畫出來（含開啟的浮層）', (tester) async {
    tester.view.physicalSize = const Size(1200, 1600);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    for (final s in AicdeThemeStyle.values) {
      for (final b in Brightness.values) {
        await tester.pumpWidget(wrap(
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const AicdeRating(initialValue: 3),
            const AicdeRating(initialValue: 2, size: AicdeRatingSize.sm, readOnly: true),
            AicdeAutocomplete(options: AicdeAutocomplete.strings(['台北', '台中'])),
            const AicdeCascader(options: regions, initialValue: ['tw', 'tpe', 'xy']),
            const AicdeTagInput(initialValue: ['設計', 'Flutter']),
            const AicdeTransfer(items: [AicdeTransferItem('a'), AicdeTransferItem('b')], initialValue: ['b']),
            const AicdeColorPicker(),
            const AicdeColorSwatches(colors: ['#173F50', '#FC5454']),
            AicdeUpload(onPick: () async => null, hint: 'PNG、JPG，10 MB 以內', files: const [AicdeUploadFile(name: 'x.png', size: 10, progress: .5)]),
          ]),
          style: s,
          b: b,
        ));
        await tester.pump(const Duration(milliseconds: 500));
        // 開啟兩個浮層
        await tester.tap(find.text('台灣 / 台北 / 信義區'));
        await tester.pump(const Duration(milliseconds: 500));
        expect(find.text('大安區'), findsOneWidget);
        await tester.tap(find.text('#FC5454').first);
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull, reason: '$s $b');
      }
    }
  });
}
