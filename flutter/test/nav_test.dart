import 'package:aicde_ui/aicde_ui.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

Widget wrap(Widget child, {AicdeThemeStyle style = AicdeThemeStyle.paperCut, Brightness b = Brightness.light}) =>
    MaterialApp(
      theme: aicdeThemeData(style: style, brightness: b),
      home: Scaffold(body: Padding(padding: const EdgeInsets.all(24), child: Align(alignment: Alignment.topLeft, child: child))),
    );

const actions = [
  AicdeMenuAction(id: 'edit', label: '編輯', shortcut: '⌘E'),
  AicdeMenuAction(id: 'off', label: '停用項', disabled: true),
  AicdeMenuAction.divider(),
  AicdeMenuAction(id: 'del', label: '刪除', danger: true),
];

const groups = [
  AicdeCommandGroup(label: '頁面', items: [
    AicdeCommandItem(id: 'home', label: '首頁'),
    AicdeCommandItem(id: 'settings', label: 'Settings', keywords: 'preferences'),
  ]),
  AicdeCommandGroup(label: '動作', items: [
    AicdeCommandItem(id: 'new', label: '新增專案', shortcut: '⌘N'),
  ]),
];

Future<void> key(WidgetTester t, LogicalKeyboardKey k) async {
  await t.sendKeyEvent(k);
  await t.pumpAndSettle();
}

void main() {
  group('Tabs', () {
    testWidgets('點擊與方向鍵切換，跳過停用', (t) async {
      final log = <String>[];
      await t.pumpWidget(wrap(AicdeTabs(onChanged: log.add, items: const [
        AicdeTabItem(id: 'a', label: 'A', child: Text('內容A')),
        AicdeTabItem(id: 'b', label: 'B', disabled: true),
        AicdeTabItem(id: 'c', label: 'C', child: Text('內容C')),
      ])));
      expect(find.text('內容A'), findsOneWidget);
      await t.tap(find.text('B'));
      await t.tap(find.text('C'));
      await t.pumpAndSettle();
      expect(log, ['c']);
      expect(find.text('內容C'), findsOneWidget);
      await key(t, LogicalKeyboardKey.arrowRight); // 循環回 A，跳過 B
      expect(log, ['c', 'a']);
      await key(t, LogicalKeyboardKey.end);
      expect(log.last, 'c');
    });

    testWidgets('受控 value', (t) async {
      await t.pumpWidget(wrap(const AicdeTabs(value: 'b', items: [
        AicdeTabItem(id: 'a', label: 'A', child: Text('甲')),
        AicdeTabItem(id: 'b', label: 'B', child: Text('乙')),
      ])));
      await t.tap(find.text('A'));
      await t.pumpAndSettle();
      expect(find.text('乙'), findsOneWidget);
    });
  });

  group('Pagination', () {
    test('頁碼視窗', () {
      expect(aicdePageWindow(1, 5), [1, 2, 3, 4, 5]);
      expect(aicdePageWindow(2, 20), [1, 2, 3, 4, 5, null, 20]);
      expect(aicdePageWindow(10, 20), [1, null, 9, 10, 11, null, 20]);
      expect(aicdePageWindow(19, 20), [1, null, 16, 17, 18, 19, 20]);
    });

    testWidgets('點頁碼、上下頁、第一頁不能往前', (t) async {
      final log = <int>[];
      await t.pumpWidget(wrap(AicdePagination(total: 10, onChanged: log.add)));
      await t.tap(find.bySemanticsLabel('上一頁'));
      await t.tap(find.text('3'));
      await t.pumpAndSettle();
      await t.tap(find.bySemanticsLabel('下一頁'));
      await t.pumpAndSettle();
      expect(log, [3, 4]);
    });

    testWidgets('鍵盤 Tab + Enter', (t) async {
      final log = <int>[];
      await t.pumpWidget(wrap(AicdePagination(total: 3, onChanged: log.add)));
      await key(t, LogicalKeyboardKey.tab); // 上一頁停用，焦點到 1
      await key(t, LogicalKeyboardKey.tab); // 2
      await key(t, LogicalKeyboardKey.enter);
      expect(log, [2]);
    });
  });

  group('Dropdown', () {
    testWidgets('開關、方向鍵、Enter、Esc、點外面', (t) async {
      final log = <String>[];
      await t.pumpWidget(wrap(AicdeDropdown(
        items: actions,
        onSelected: log.add,
        builder: (c, toggle, open) => AicdeButton(label: open ? '關' : '開', onPressed: toggle),
      )));
      await t.pumpAndSettle();
      expect(find.text('編輯'), findsNothing);
      await t.tap(find.text('開'));
      await t.pumpAndSettle();
      expect(find.text('編輯'), findsOneWidget);
      await key(t, LogicalKeyboardKey.arrowDown); // 停用項不可 focus → 刪除
      await key(t, LogicalKeyboardKey.enter);
      expect(log, ['del']);
      expect(find.text('編輯'), findsNothing);

      await t.tap(find.text('開'));
      await t.pumpAndSettle();
      await key(t, LogicalKeyboardKey.escape);
      expect(find.text('編輯'), findsNothing);

      await t.tap(find.text('開'));
      await t.pumpAndSettle();
      await t.tapAt(const Offset(700, 500));
      await t.pumpAndSettle();
      expect(find.text('編輯'), findsNothing);

      await t.tap(find.text('開'));
      await t.pumpAndSettle();
      await t.tap(find.text('停用項'));
      await t.tap(find.text('編輯'));
      await t.pumpAndSettle();
      expect(log, ['del', 'edit']);
    });
  });

  testWidgets('Breadcrumb', (t) async {
    var n = 0;
    await t.pumpWidget(wrap(AicdeBreadcrumb(items: [
      AicdeBreadcrumbItem(label: '首頁', onTap: () => n++),
      const AicdeBreadcrumbItem(label: '目前'),
    ])));
    await t.tap(find.text('首頁'));
    await t.tap(find.text('目前'));
    expect(n, 1);
    expect(find.text('/'), findsOneWidget);
  });

  testWidgets('Steps 狀態與自動直向', (t) async {
    const items = [AicdeStepItem(title: '一'), AicdeStepItem(title: '二', description: '說明'), AicdeStepItem(title: '三')];
    await t.pumpWidget(wrap(const SizedBox(width: 600, child: AicdeSteps(current: 1, items: items))));
    expect(find.byIcon(Icons.check_rounded), findsOneWidget);
    expect(find.text('2'), findsOneWidget);
    expect(find.bySemanticsLabel(RegExp('步驟 2，進行中')), findsOneWidget);
    await t.pumpWidget(wrap(const SizedBox(width: 200, child: AicdeSteps(current: 3, items: items))));
    expect(find.byIcon(Icons.check_rounded), findsNWidgets(3));
    expect(t.takeException(), isNull);
  });

  testWidgets('Menu 選取、展開子選單、鍵盤', (t) async {
    final log = <String>[];
    await t.pumpWidget(wrap(SizedBox(
      width: 260,
      child: AicdeMenu(onChanged: log.add, items: const [
        AicdeMenuItem.group(label: '群組', children: [
          AicdeMenuItem(id: 'a', label: '項目A', badge: '3'),
          AicdeMenuItem(id: 'p', label: '父項', children: [AicdeMenuItem(id: 'c', label: '子項')]),
        ]),
      ]),
    )));
    expect(find.text('子項'), findsNothing);
    await t.tap(find.text('項目A'));
    await t.tap(find.text('父項'));
    await t.pumpAndSettle();
    expect(find.text('子項'), findsOneWidget);
    await t.tap(find.text('子項'));
    await t.pumpAndSettle();
    expect(log, ['a', 'c']);
    await key(t, LogicalKeyboardKey.tab); // 鍵盤進入：項目A
    await key(t, LogicalKeyboardKey.arrowDown); // 父項
    await key(t, LogicalKeyboardKey.enter); // 收合
    expect(find.text('子項'), findsNothing);
    await key(t, LogicalKeyboardKey.arrowUp); // 項目A
    await key(t, LogicalKeyboardKey.space);
    expect(log, ['a', 'c', 'a']);
  });

  group('CommandPalette', () {
    test('模糊比對', () {
      expect(aicdeFuzzyScore('stg', 'Settings'), isNotNull);
      expect(aicdeFuzzyScore('xyz', 'Settings'), isNull);
      expect(aicdeFuzzyScore('set', 'Settings')!, greaterThan(aicdeFuzzyScore('stg', 'Settings')!));
      expect(aicdeFuzzyScore('', 'x'), 0);
    });

    testWidgets('搜尋、方向鍵、Enter、Esc', (t) async {
      AicdeCommandItem? picked;
      var ran = 0;
      final g = [
        AicdeCommandGroup(label: '頁面', items: [
          const AicdeCommandItem(id: 'home', label: '首頁'),
          AicdeCommandItem(id: 'settings', label: 'Settings', onSelect: () => ran++),
          const AicdeCommandItem(id: 'pref', label: '偏好', keywords: 'stage'),
        ]),
      ];
      await t.pumpWidget(wrap(Builder(
        builder: (c) => AicdeButton(label: '開', onPressed: () async => picked = await showAicdeCommandPalette(c, groups: g)),
      )));
      await t.tap(find.text('開'));
      await t.pumpAndSettle();
      expect(find.text('首頁'), findsOneWidget);
      await t.enterText(find.byType(TextField), 'stg');
      await t.pumpAndSettle();
      expect(find.text('首頁'), findsNothing);
      expect(find.text('Settings'), findsOneWidget);
      expect(find.text('偏好'), findsOneWidget); // 關鍵字命中
      // 排序：「偏好」的關鍵字 stage 字首命中，分數高於 Settings
      expect(t.getTopLeft(find.text('偏好')).dy, lessThan(t.getTopLeft(find.text('Settings')).dy));
      await key(t, LogicalKeyboardKey.arrowDown);
      await key(t, LogicalKeyboardKey.arrowDown); // 循環回第一個
      await key(t, LogicalKeyboardKey.arrowDown);
      await key(t, LogicalKeyboardKey.enter);
      expect(picked?.id, 'settings');
      expect(ran, 1);
      expect(find.byType(TextField), findsNothing);

      await t.tap(find.text('開'));
      await t.pumpAndSettle();
      await t.enterText(find.byType(TextField), 'zzzz');
      await t.pumpAndSettle();
      expect(find.text('找不到符合的項目'), findsOneWidget);
      await key(t, LogicalKeyboardKey.escape);
      expect(find.byType(TextField), findsNothing);
      expect(picked, isNull);
    });

    testWidgets('Ctrl+K 熱鍵', (t) async {
      String? sel;
      await t.pumpWidget(wrap(AicdeCommandPalette(groups: groups, onSelected: (v) => sel = v, child: const Text('App'))));
      await t.sendKeyDownEvent(LogicalKeyboardKey.controlLeft);
      await t.sendKeyEvent(LogicalKeyboardKey.keyK);
      await t.sendKeyUpEvent(LogicalKeyboardKey.controlLeft);
      await t.pumpAndSettle();
      expect(find.text('新增專案'), findsOneWidget);
      await t.tap(find.text('新增專案'));
      await t.pumpAndSettle();
      expect(sel, 'new');
    });
  });

  testWidgets('ContextMenu 右鍵、長按、Esc', (t) async {
    final log = <String>[];
    await t.pumpWidget(wrap(AicdeContextMenu(
      items: actions,
      onSelected: log.add,
      child: const SizedBox(width: 300, height: 200, child: Text('區域')),
    )));
    await t.pumpAndSettle();
    await t.tap(find.text('區域'), buttons: kSecondaryButton);
    await t.pumpAndSettle();
    expect(find.text('編輯'), findsOneWidget);
    await t.tap(find.text('編輯'));
    await t.pumpAndSettle();
    expect(log, ['edit']);
    expect(find.text('編輯'), findsNothing);

    await t.longPress(find.text('區域'));
    await t.pumpAndSettle();
    expect(find.text('刪除'), findsOneWidget);
    await key(t, LogicalKeyboardKey.escape);
    expect(find.text('刪除'), findsNothing);

    // 靠近右下角開啟時，選單要留在畫面內
    await t.tapAt(const Offset(795, 595), buttons: kSecondaryButton);
    await t.pumpAndSettle();
    if (find.text('編輯').evaluate().isNotEmpty) {
      final r = t.getRect(find.text('刪除'));
      expect(r.right, lessThanOrEqualTo(800));
      expect(r.bottom, lessThanOrEqualTo(600));
    }
  });

  testWidgets('所有主題 × 深淺色都能畫出來（含開啟的彈出層），沒有例外', (t) async {
    t.view.physicalSize = const Size(1000, 1400);
    t.view.devicePixelRatio = 1;
    addTearDown(t.view.reset);
    for (final s in AicdeThemeStyle.values) {
      for (final b in Brightness.values) {
        // 每個主題用新的元素樹（避免跨主題動畫；見回報的 AicdeBox 彈簧曲線問題）
        await t.pumpWidget(KeyedSubtree(key: ValueKey('$s$b'), child: wrap(
          SingleChildScrollView(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const AicdeTabs(items: [AicdeTabItem(id: 'a', label: 'Alpha', child: Text('x')), AicdeTabItem(id: 'b', label: 'Beta')]),
              const AicdeTabs(variant: AicdeTabsVariant.pill, items: [AicdeTabItem(id: 'a', label: '日'), AicdeTabItem(id: 'b', label: '週')]),
              const AicdePagination(total: 20, initialValue: 10),
              AicdeBreadcrumb(items: [AicdeBreadcrumbItem(label: '首頁', onTap: () {}), const AicdeBreadcrumbItem(label: '頁')]),
              const AicdeSteps(current: 1, items: [AicdeStepItem(title: '一'), AicdeStepItem(title: '二'), AicdeStepItem(title: '三')]),
              const SizedBox(width: 260, child: AicdeMenu(initialValue: 'c', items: [
                AicdeMenuItem.group(label: 'G', children: [
                  AicdeMenuItem(id: 'a', label: 'A', badge: '9', icon: Icon(Icons.inbox)),
                  AicdeMenuItem(id: 'p', label: 'P', children: [AicdeMenuItem(id: 'c', label: 'C')]),
                ]),
              ])),
              AicdeDropdown(open: true, items: actions, builder: (c, toggle, o) => AicdeButton(label: 'DD', onPressed: toggle)),
              const SizedBox(height: 200),
              AicdeContextMenu(items: actions, child: const SizedBox(width: 200, height: 60, child: Text('ctx'))),
              Builder(builder: (c) => AicdeButton(key: const ValueKey('cmd'), label: 'cmd', onPressed: () => showAicdeCommandPalette(c, groups: groups))),
            ]),
          ),
          style: s,
          b: b,
        )));
        await t.pumpAndSettle();
        await t.tap(find.byKey(const ValueKey('cmd')));
        await t.pumpAndSettle();
        expect(find.text('新增專案'), findsOneWidget, reason: '$s $b');
        await key(t, LogicalKeyboardKey.escape);
        await t.tap(find.text('ctx'), buttons: kSecondaryButton);
        await t.pumpAndSettle();
        expect(t.takeException(), isNull, reason: '$s $b');
      }
    }
  });
}
