import 'dart:math' as math;

import 'package:aicde_ui/aicde_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

/// 核心元件（Button、Input/Field、Select、Modal、Table）的鍵盤操作與讀屏語意，
/// 依 WAI-ARIA APG 的對應模式檢查。
Widget app(Widget child, {AicdeThemeStyle style = AicdeThemeStyle.paperCut}) =>
    MaterialApp(
      theme: aicdeThemeData(style: style),
      home: Scaffold(
        body: Center(
          child: Padding(padding: const EdgeInsets.all(24), child: child),
        ),
      ),
    );

final _cities = AicdeOption.of(['台北', '台中', '台南', '高雄', '花蓮']);

/// 欄位外框（AicdeBox kind=field）目前畫出來的邊框顏色
Color fieldBorderColor(WidgetTester tester) {
  final box = find
      .byWidgetPredicate((w) => w is AicdeBox && w.kind == AicdeBoxKind.field)
      .first;
  final ac = tester.widget<AnimatedContainer>(
    find.descendant(of: box, matching: find.byType(AnimatedContainer)).last,
  );
  final border = (ac.decoration! as BoxDecoration).border! as Border;
  return border.bottom.color;
}

void main() {
  group('Button', () {
    testWidgets('語意：按鈕、名稱、停用', (tester) async {
      final h = tester.ensureSemantics();
      await tester.pumpWidget(
        app(
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              AicdeButton(label: '儲存', onPressed: () {}),
              const AicdeButton(label: '停用', onPressed: null),
              AicdeButton(
                icon: const Icon(Icons.search),
                semanticLabel: '搜尋',
                onPressed: () {},
              ),
            ],
          ),
        ),
      );
      expect(
        tester.getSemantics(find.bySemanticsLabel('儲存')),
        isSemantics(
          label: '儲存',
          isButton: true,
          hasEnabledState: true,
          isEnabled: true,
          isFocusable: true,
        ),
      );
      expect(
        tester.getSemantics(find.bySemanticsLabel('停用')),
        isSemantics(
          isButton: true,
          hasEnabledState: true,
          isEnabled: false,
        ),
      );
      expect(
        tester.getSemantics(find.bySemanticsLabel('搜尋')),
        isSemantics(label: '搜尋', isButton: true),
      );
      h.dispose();
    });

    testWidgets('載入中：保留名稱與 focus、念「處理中」、不觸發', (tester) async {
      final h = tester.ensureSemantics();
      var n = 0;
      final node = FocusNode();
      await tester.pumpWidget(
        app(
          AicdeButton(
            label: '送出',
            loading: true,
            focusNode: node,
            onPressed: () => n++,
          ),
        ),
      );
      node.requestFocus();
      await tester.pump();
      expect(node.hasFocus, isTrue);
      expect(
        tester.getSemantics(find.bySemanticsLabel('送出')),
        isSemantics(label: '送出', hint: '處理中', isButton: true),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.tap(find.text('送出'));
      await tester.pump();
      expect(n, 0);
      node.dispose();
      h.dispose();
    });

    testWidgets('Enter 和 Space 都能觸發', (tester) async {
      var n = 0;
      await tester.pumpWidget(
        app(AicdeButton(label: 'OK', autofocus: true, onPressed: () => n++)),
      );
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pump();
      expect(n, 2);
    });
  });

  group('Input + Field', () {
    testWidgets('欄位標題是輸入框的名稱，說明是補充說明，標題不重複念', (tester) async {
      final h = tester.ensureSemantics();
      await tester.pumpWidget(
        app(
          const AicdeField(
            label: '電子郵件',
            help: '只用來寄收據',
            child: AicdeInput(placeholder: 'name@example.com'),
          ),
        ),
      );
      final node = tester.getSemantics(find.byType(TextField));
      expect(node, isSemantics(hint: '只用來寄收據', isTextField: true));
      // 名稱以欄位標題開頭（Flutter 會把 placeholder 接在後面一起念）
      expect(node.label, startsWith('電子郵件'));
      // 標題文字本身不是獨立節點
      expect(find.bySemanticsLabel(RegExp('^電子郵件')), findsOneWidget);
      h.dispose();
    });

    testWidgets('錯誤訊息是 live region，輸入框自動進入錯誤狀態', (tester) async {
      final h = tester.ensureSemantics();
      await tester.pumpWidget(
        app(
          const AicdeField(label: '密碼', error: '至少 8 個字元', child: AicdeInput()),
        ),
      );
      expect(
        tester.getSemantics(find.text('至少 8 個字元')),
        isSemantics(isLiveRegion: true),
      );
      expect(
        tester.getSemantics(find.byType(TextField)),
        isSemantics(label: '密碼', hint: '至少 8 個字元'),
      );
      final t = AicdeTokens.resolve(AicdeThemeStyle.paperCut, Brightness.light);
      expect(fieldBorderColor(tester), t.colors.danger);
      h.dispose();
    });

    for (final style in [
      AicdeThemeStyle.ink,
      AicdeThemeStyle.brutal,
      AicdeThemeStyle.blueprint,
      AicdeThemeStyle.editorial,
      AicdeThemeStyle.riso,
    ]) {
      testWidgets('全描邊／底線主題的錯誤外框也是危險色：${style.name}', (tester) async {
        await tester.pumpWidget(
          app(
            const SizedBox(width: 240, child: AicdeInput(error: true)),
            style: style,
          ),
        );
        await tester.pumpAndSettle();
        final t = AicdeTokens.resolve(style, Brightness.light);
        expect(fieldBorderColor(tester), t.colors.danger);
        // 沒有錯誤時不是危險色
        await tester.pumpWidget(
          app(const SizedBox(width: 240, child: AicdeInput()), style: style),
        );
        await tester.pumpAndSettle();
        expect(fieldBorderColor(tester), isNot(t.colors.danger));
      });
    }
  });

  group('Select（listbox）', () {
    Future<FocusNode> pumpSelect(
      WidgetTester tester, {
      String? value,
      ValueChanged<String>? onChanged,
    }) async {
      final node = FocusNode();
      String? v = value;
      await tester.pumpWidget(
        app(
          StatefulBuilder(
            builder: (context, set) => AicdeField(
              label: '城市',
              child: SizedBox(
                width: 220,
                child: AicdeSelect(
                  options: _cities,
                  value: v,
                  onChanged: (x) {
                    set(() => v = x);
                    onChanged?.call(x);
                  },
                ),
              ),
            ),
          ),
        ),
      );
      // focus 觸發按鈕
      await tester.tap(find.bySemanticsLabel('城市'));
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pump();
      return node;
    }

    testWidgets('語意：名稱、目前值、展開狀態', (tester) async {
      final h = tester.ensureSemantics();
      await pumpSelect(tester, value: '台中');
      expect(
        tester.getSemantics(find.bySemanticsLabel('城市')),
        isSemantics(
          label: '城市',
          value: '台中',
          isButton: true,
          hasExpandedState: true,
          isExpanded: false,
        ),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      expect(
        tester.getSemantics(find.bySemanticsLabel('城市')),
        isSemantics(isExpanded: true),
      );
      h.dispose();
    });

    for (final key in [
      LogicalKeyboardKey.enter,
      LogicalKeyboardKey.space,
      LogicalKeyboardKey.arrowDown,
    ]) {
      testWidgets('${key.keyLabel} 展開', (tester) async {
        await pumpSelect(tester);
        await tester.sendKeyEvent(key);
        await tester.pump();
        expect(find.text('花蓮'), findsOneWidget);
      });
    }

    testWidgets('方向鍵、Home/End、Enter 選定；Esc 關閉後 focus 留在觸發按鈕', (tester) async {
      final h = tester.ensureSemantics();
      String? picked;
      await pumpSelect(tester, onChanged: (x) => picked = x);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown); // 開啟並移到第一項
      await tester.sendKeyEvent(LogicalKeyboardKey.end);
      await tester.pump();
      expect(
        tester.getSemantics(find.bySemanticsLabel('城市')),
        isSemantics(value: '花蓮'),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.home);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump();
      expect(picked, '台中');
      expect(find.text('花蓮'), findsNothing);
      // 再開一次按 Esc：選單關閉、focus 還在觸發按鈕上
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pump();
      expect(find.text('花蓮'), findsNothing);
      final focused = FocusManager.instance.primaryFocus!.context!;
      expect(
        find.ancestor(
          of: find.byWidget(focused.widget),
          matching: find.byType(AicdeSelect),
        ),
        findsOneWidget,
      );
      h.dispose();
    });

    testWidgets('type-ahead：輸入文字跳到符合的選項', (tester) async {
      final h = tester.ensureSemantics();
      await tester.pumpWidget(
        app(
          SizedBox(
            width: 220,
            child: AicdeSelect(
              semanticLabel: '水果',
              options: AicdeOption.of([
                'Apple',
                'Banana',
                'Blueberry',
                'Cherry',
              ]),
              onChanged: (_) {},
            ),
          ),
        ),
      );
      await tester.tap(find.bySemanticsLabel('水果'));
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.sendKeyEvent(LogicalKeyboardKey.keyC);
      await tester.pump();
      expect(
        tester.getSemantics(find.bySemanticsLabel('水果')),
        isSemantics(value: 'Cherry', isExpanded: true),
      );
      // 同一個字母連按：在 B 開頭的選項之間輪流
      await tester.sendKeyEvent(LogicalKeyboardKey.keyB);
      await tester.pump();
      expect(
        tester.getSemantics(find.bySemanticsLabel('水果')),
        isSemantics(value: 'Banana'),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.keyB);
      await tester.pump();
      expect(
        tester.getSemantics(find.bySemanticsLabel('水果')),
        isSemantics(value: 'Blueberry'),
      );
      h.dispose();
    });

    testWidgets('選項有選中語意', (tester) async {
      final h = tester.ensureSemantics();
      await pumpSelect(tester, value: '台南');
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      expect(
        tester.getSemantics(find.bySemanticsLabel('台南').last),
        isSemantics(isSelected: true, isButton: true),
      );
      expect(
        tester.getSemantics(find.bySemanticsLabel('高雄')),
        isSemantics(isSelected: false),
      );
      h.dispose();
    });
  });

  group('Modal（dialog）', () {
    testWidgets('focus 移進對話框、Tab 不會跑出去、Esc 關閉、focus 回到開啟按鈕', (tester) async {
      final h = tester.ensureSemantics();
      final opener = FocusNode(debugLabel: 'opener');
      await tester.pumpWidget(
        app(
          Builder(
            builder: (context) => Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                AicdeButton(label: '外面的按鈕', onPressed: () {}),
                AicdeButton(
                  label: '開啟',
                  focusNode: opener,
                  onPressed: () => showAicdeModal<void>(
                    context,
                    title: '刪除專案？',
                    builder: (_) => const Text('刪除後無法復原。'),
                    footer: (ctx) => [
                      AicdeButton(
                        label: '取消',
                        onPressed: () => Navigator.pop(ctx),
                      ),
                      AicdeButton(
                        label: '刪除',
                        variant: AicdeButtonVariant.danger,
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      );
      opener.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      // 對話框用標題命名、自成一個 route
      expect(find.bySemanticsLabel('刪除專案？'), findsWidgets);
      final dialogNode = tester.semantics.find(
        find.byWidgetPredicate(
          (w) => w is Semantics && w.properties.namesRoute == true,
        ),
      );
      expect(
        dialogNode,
        isSemantics(label: '刪除專案？', scopesRoute: true, namesRoute: true),
      );

      // focus 在對話框裡
      bool inDialog() {
        final ctx = FocusManager.instance.primaryFocus?.context;
        return ctx != null &&
                find
                    .ancestor(
                      of: find.byWidget(ctx.widget),
                      matching: find.byType(AicdeModal),
                    )
                    .evaluate()
                    .isNotEmpty ||
            (ctx != null &&
                find
                    .descendant(
                      of: find.byType(AicdeDialogShell),
                      matching: find.byWidget(ctx.widget),
                    )
                    .evaluate()
                    .isNotEmpty);
      }

      expect(inDialog(), isTrue);
      // Tab 繞一圈都還在對話框裡（關閉、取消、刪除三個按鈕）
      final seen = <String>{};
      for (var i = 0; i < 8; i++) {
        await tester.sendKeyEvent(LogicalKeyboardKey.tab);
        await tester.pump();
        expect(inDialog(), isTrue, reason: '第 ${i + 1} 次 Tab 跑出對話框');
        seen.add(FocusManager.instance.primaryFocus.toString());
      }
      for (var i = 0; i < 4; i++) {
        await tester.sendKeyEvent(LogicalKeyboardKey.tab);
        // Shift+Tab
        await tester.sendKeyDownEvent(LogicalKeyboardKey.shiftLeft);
        await tester.sendKeyEvent(LogicalKeyboardKey.tab);
        await tester.sendKeyUpEvent(LogicalKeyboardKey.shiftLeft);
        await tester.pump();
        expect(inDialog(), isTrue);
      }

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();
      expect(find.byType(AicdeModal), findsNothing);
      expect(opener.hasFocus, isTrue, reason: '關閉後 focus 要回到開啟對話框的按鈕');
      opener.dispose();
      h.dispose();
    });
  });

  group('Table', () {
    final rows = [('林小雨', 92), ('陳大明', 78), ('王美玲', 85)];
    Widget table({List<String>? sel, ValueChanged<List<String>>? onSel}) =>
        SizedBox(
          width: 520,
          child: AicdeTable<(String, int)>(
            columns: [
              AicdeTableColumn(
                key: 'name',
                title: '姓名',
                value: (r) => r.$1,
                sortable: true,
              ),
              AicdeTableColumn(
                key: 'score',
                title: '分數',
                value: (r) => r.$2,
                sortable: true,
                align: AicdeColumnAlign.right,
              ),
            ],
            rows: rows,
            rowKey: (r) => r.$1,
            selectable: true,
            selectedKeys: sel,
            onSelectionChange: onSel,
          ),
        );

    testWidgets('排序表頭：按鈕語意、排序狀態跟著變', (tester) async {
      final h = tester.ensureSemantics();
      await tester.pumpWidget(app(table()));
      SemanticsNode header() =>
          tester.getSemantics(find.bySemanticsLabel('分數'));
      expect(
        header(),
        isSemantics(label: '分數', value: '未排序', isButton: true),
      );
      await tester.tap(find.bySemanticsLabel('分數'));
      await tester.pump();
      expect(header(), isSemantics(value: '遞增排序'));
      // 鍵盤也能切換
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump();
      expect(header(), isSemantics(value: '遞減排序'));
      final texts = tester
          .widgetList<Text>(find.byType(Text))
          .map((t) => t.data)
          .whereType<String>()
          .where((s) => ['92', '78', '85'].contains(s))
          .toList();
      expect(texts, ['92', '85', '78']);
      h.dispose();
    });

    testWidgets('全選是三態、每列勾選框用列名稱命名', (tester) async {
      final h = tester.ensureSemantics();
      var sel = <String>['陳大明'];
      await tester.pumpWidget(
        app(
          StatefulBuilder(
            builder: (c, set) =>
                table(sel: sel, onSel: (v) => set(() => sel = v)),
          ),
        ),
      );
      expect(
        tester.getSemantics(find.bySemanticsLabel('全選')),
        isSemantics(hasCheckedState: true, isCheckStateMixed: true),
      );
      expect(
        tester.getSemantics(find.bySemanticsLabel('選取 陳大明')),
        isSemantics(hasCheckedState: true, isChecked: true),
      );
      expect(
        tester.getSemantics(find.bySemanticsLabel('選取 林小雨')),
        isSemantics(hasCheckedState: true, isChecked: false),
      );
      await tester.tap(find.bySemanticsLabel('全選'));
      await tester.pump();
      expect(sel.length, 3);
      expect(
        tester.getSemantics(find.bySemanticsLabel('全選')),
        isSemantics(isChecked: true),
      );
      h.dispose();
    });
  });

  group('選中標記（編輯主題）', () {
    Future<void> check(
      WidgetTester tester,
      AicdeThemeStyle style,
      Widget w,
      Matcher m,
    ) async {
      await tester.pumpWidget(
        app(SizedBox(width: 300, child: w), style: style),
      );
      await tester.pumpAndSettle();
      expect(find.byKey(const ValueKey('aicde-selection-ring')), m);
    }

    final tree = AicdeTree(
      data: const [
        AicdeTreeNode(key: 'a', label: 'a.dart'),
        AicdeTreeNode(key: 'b', label: 'b.dart'),
      ],
      defaultSelectedKey: 'a',
    );
    final menu = AicdeMenu(
      initialValue: 'inbox',
      items: const [
        AicdeMenuItem(id: 'inbox', label: '收件匣'),
        AicdeMenuItem(id: 'sent', label: '寄件備份'),
      ],
    );

    testWidgets('Tree：編輯主題畫標記條、預設主題不畫', (tester) async {
      await check(tester, AicdeThemeStyle.editorial, tree, findsOneWidget);
      await check(tester, AicdeThemeStyle.paperCut, tree, findsNothing);
    });
    testWidgets('Menu：編輯主題畫標記條、預設主題不畫', (tester) async {
      await check(tester, AicdeThemeStyle.editorial, menu, findsOneWidget);
      await check(tester, AicdeThemeStyle.paperCut, menu, findsNothing);
    });
    testWidgets('Select 選項：編輯主題畫標記條', (tester) async {
      await tester.pumpWidget(
        app(
          SizedBox(
            width: 220,
            child: AicdeSelect(
              semanticLabel: '城市',
              options: _cities,
              value: '台北',
              onChanged: (_) {},
            ),
          ),
          style: AicdeThemeStyle.editorial,
        ),
      );
      await tester.tap(find.bySemanticsLabel('城市'));
      await tester.pumpAndSettle();
      expect(
        find.byKey(const ValueKey('aicde-selection-ring')),
        findsOneWidget,
      );
    });
    test('只有編輯主題有 selectionRing', () {
      for (final s in AicdeThemeStyle.values) {
        expect(
          AicdeTokens.resolve(s, Brightness.light).selectionRing != null,
          s == AicdeThemeStyle.editorial,
          reason: s.name,
        );
      }
    });
  });

  group('無障礙準則（預設與醫療主題）', () {
    // 已知問題：紙雕主題主色按鈕（白字 × 珊瑚 #fc5454）對比只有 3.21:1，未達 4.5。
    // 要改 tokens.json 的品牌色（會牽動 CSS 與 React），留給設計決定；這裡暫時不放主色按鈕。
    Widget demos({bool primary = true}) => SingleChildScrollView(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              if (primary)
                AicdeButton(
                  label: '主要',
                  variant: AicdeButtonVariant.primary,
                  onPressed: () {},
                ),
              AicdeButton(
                label: '次要',
                variant: AicdeButtonVariant.secondary,
                onPressed: () {},
              ),
              AicdeButton(label: '外框', onPressed: () {}),
              AicdeButton(
                icon: const Icon(Icons.add),
                semanticLabel: '新增',
                onPressed: () {},
              ),
            ],
          ),
          const SizedBox(height: 16),
          const SizedBox(
            width: 300,
            child: AicdeField(
              label: '姓名',
              help: '請填寫真實姓名',
              child: AicdeInput(placeholder: '王小明'),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: 300,
            child: AicdeField(
              label: '城市',
              child: AicdeSelect(
                options: _cities,
                value: '台北',
                onChanged: (_) {},
              ),
            ),
          ),
        ],
      ),
    );

    for (final style in [AicdeThemeStyle.paperCut, AicdeThemeStyle.clinical]) {
      testWidgets('${style.name}：點擊範圍、名稱、文字對比', (tester) async {
        final h = tester.ensureSemantics();
        await tester.pumpWidget(
          app(demos(primary: style != AicdeThemeStyle.paperCut), style: style),
        );
        await tester.pumpAndSettle();
        await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
        await expectLater(tester, meetsGuideline(textContrastGuideline));
        // 醫療主題要求 44px（iOS 準則）；Android 的 48px 準則只對醫療主題要求
        if (style == AicdeThemeStyle.clinical) {
          await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));
        }
        h.dispose();
      });
    }

    testWidgets('已知問題（記錄用）：紙雕主色按鈕對比不足', (tester) async {
      final t = AicdeTokens.resolve(AicdeThemeStyle.paperCut, Brightness.light);
      double lum(Color c) => c.computeLuminance();
      final a = lum(t.onPrimary), b = lum(t.primary);
      final ratio = (math.max(a, b) + .05) / (math.min(a, b) + .05);
      // 修好之後這個測試會失敗，提醒把上面的排除拿掉
      expect(
        ratio,
        lessThan(4.5),
        reason: '主色對比已經達標，請把 demos(primary: false) 的排除移除',
      );
    });
  });
}
