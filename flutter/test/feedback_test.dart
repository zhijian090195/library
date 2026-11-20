import 'package:aicde_ui/aicde_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

Widget app(Widget child, {AicdeThemeStyle style = AicdeThemeStyle.paperCut, Brightness b = Brightness.light}) => MaterialApp(
      theme: aicdeThemeData(style: style, brightness: b),
      builder: (context, c) => AicdeToaster(child: c!),
      home: Scaffold(body: Center(child: child)),
    );

void main() {
  testWidgets('Modal：開啟、按鈕回傳值、Esc、點背景關閉', (tester) async {
    Future<bool?>? result;
    await tester.pumpWidget(app(Builder(
      builder: (context) => AicdeButton(
        label: '開啟',
        onPressed: () => result = showAicdeModal<bool>(
          context,
          title: '刪除專案？',
          builder: (_) => const Text('無法復原'),
          footer: (ctx) => [AicdeButton(label: '確認', onPressed: () => Navigator.pop(ctx, true))],
        ),
      ),
    )));
    await tester.tap(find.text('開啟'));
    await tester.pumpAndSettle();
    expect(find.text('刪除專案？'), findsOneWidget);
    await tester.tap(find.text('確認'));
    await tester.pumpAndSettle();
    expect(await result, isTrue);
    expect(find.text('刪除專案？'), findsNothing);

    await tester.tap(find.text('開啟'));
    await tester.pumpAndSettle();
    await tester.sendKeyEvent(LogicalKeyboardKey.escape);
    await tester.pumpAndSettle();
    expect(find.text('刪除專案？'), findsNothing);

    await tester.tap(find.text('開啟'));
    await tester.pumpAndSettle();
    await tester.tapAt(const Offset(5, 5));
    await tester.pumpAndSettle();
    expect(find.text('刪除專案？'), findsNothing);

    await tester.tap(find.text('開啟'));
    await tester.pumpAndSettle();
    await tester.tap(find.bySemanticsLabel('關閉').last);
    await tester.pumpAndSettle();
    expect(find.text('刪除專案？'), findsNothing);
  });

  testWidgets('Modal：closeOnBackdrop=false 時點背景不關，Esc 仍可關', (tester) async {
    await tester.pumpWidget(app(Builder(
      builder: (context) => AicdeButton(label: '開啟', onPressed: () => showAicdeModal(context, title: 'T', closeOnBackdrop: false, builder: (_) => const Text('x'))),
    )));
    await tester.tap(find.text('開啟'));
    await tester.pumpAndSettle();
    await tester.tapAt(const Offset(5, 5));
    await tester.pumpAndSettle();
    expect(find.text('T'), findsOneWidget);
    await tester.sendKeyEvent(LogicalKeyboardKey.escape);
    await tester.pumpAndSettle();
    expect(find.text('T'), findsNothing);
  });

  testWidgets('Drawer：左右兩側開關', (tester) async {
    for (final side in AicdeDrawerSide.values) {
      await tester.pumpWidget(app(Builder(
        builder: (context) => AicdeButton(label: '抽屜', onPressed: () => showAicdeDrawer(context, title: '設定', side: side, builder: (_) => const Text('內容'))),
      )));
      await tester.tap(find.text('抽屜'));
      await tester.pumpAndSettle();
      final x = tester.getCenter(find.text('設定')).dx;
      expect(side == AicdeDrawerSide.right ? x > 400 : x < 400, isTrue);
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();
      expect(find.text('設定'), findsNothing);
    }
  });

  testWidgets('Toast：自動消失、手動關閉、duration 0 不自動關', (tester) async {
    late BuildContext ctx;
    await tester.pumpWidget(app(Builder(builder: (c) {
      ctx = c;
      return const SizedBox();
    })));
    AicdeToast.show(ctx, '已儲存', type: AicdeFeedbackType.success);
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('已儲存'), findsOneWidget);
    await tester.pump(const Duration(milliseconds: 3000));
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('已儲存'), findsNothing);

    final close = AicdeToast.show(ctx, '常駐', duration: Duration.zero);
    await tester.pump();
    await tester.pump(const Duration(seconds: 10));
    expect(find.text('常駐'), findsOneWidget);
    close();
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('常駐'), findsNothing);

    var undone = 0;
    AicdeToast.notify(ctx, title: '已刪除 3 個檔案', text: '可在 30 天內還原', actions: [AicdeNotifyAction(label: '復原', onPressed: () => undone++)]);
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));
    await tester.tap(find.text('復原'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));
    expect(undone, 1);
    expect(find.text('已刪除 3 個檔案'), findsNothing);
  });

  testWidgets('Popover：開啟、點外面關、Esc 關、受控', (tester) async {
    await tester.pumpWidget(app(Column(mainAxisSize: MainAxisSize.min, children: [
      AicdePopover(title: '分享', content: const Text('複製連結'), trigger: (c, toggle) => AicdeButton(label: '分享鈕', onPressed: toggle)),
      const SizedBox(height: 200),
    ])));
    await tester.tap(find.text('分享鈕'));
    await tester.pumpAndSettle();
    expect(find.text('複製連結'), findsOneWidget);
    await tester.tapAt(const Offset(5, 5));
    await tester.pumpAndSettle();
    expect(find.text('複製連結'), findsNothing);
    await tester.tap(find.text('分享鈕'));
    await tester.pumpAndSettle();
    await tester.sendKeyEvent(LogicalKeyboardKey.escape);
    await tester.pumpAndSettle();
    expect(find.text('複製連結'), findsNothing);

    final changes = <bool>[];
    await tester.pumpWidget(app(AicdePopover(open: true, onOpenChange: changes.add, content: const Text('受控'), trigger: (c, toggle) => AicdeButton(label: 'X', onPressed: toggle))));
    await tester.pumpAndSettle();
    expect(find.text('受控'), findsOneWidget);
    await tester.tap(find.text('X'));
    await tester.pumpAndSettle();
    expect(changes, [false]);
    expect(find.text('受控'), findsOneWidget);
  });

  testWidgets('Banner 自己收起、Alert 關閉', (tester) async {
    var closed = 0;
    await tester.pumpWidget(app(Column(mainAxisSize: MainAxisSize.min, children: [
      const AicdeBanner(tag: '新', child: Text('新版上線')),
      AicdeAlert(type: AicdeFeedbackType.warning, title: '注意', message: '即將到期', onClose: () => closed++),
    ])));
    final h = tester.ensureSemantics();
    expect(find.bySemanticsLabel('關閉'), findsNWidgets(2));
    h.dispose();
    await tester.tap(find.byType(AicdeCloseButton).first);
    await tester.pumpAndSettle();
    expect(find.text('新版上線'), findsNothing);
    await tester.tap(find.byType(AicdeCloseButton).first);
    expect(closed, 1);
  });

  testWidgets('BackTop 超過門檻才出現', (tester) async {
    final sc = ScrollController();
    await tester.pumpWidget(MaterialApp(
      theme: aicdeThemeData(),
      home: Scaffold(
        floatingActionButton: AicdeBackTop(controller: sc),
        body: ListView(controller: sc, children: [for (var i = 0; i < 80; i++) SizedBox(height: 40, child: Text('$i'))]),
      ),
    ));
    final op = find.descendant(of: find.byType(AicdeBackTop), matching: find.byType(AnimatedOpacity));
    expect(tester.widget<AnimatedOpacity>(op).opacity, 0);
    sc.jumpTo(800);
    await tester.pumpAndSettle();
    expect(tester.widget<AnimatedOpacity>(op).opacity, 1);
    await tester.tap(find.byType(AicdeFloatButton));
    await tester.pumpAndSettle();
    expect(sc.offset, 0);
  });

  testWidgets('所有元件 × 15 主題 × 深淺色都能畫出來', (tester) async {
    tester.view.physicalSize = const Size(1000, 1800);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    for (final s in AicdeThemeStyle.values) {
      for (final b in Brightness.values) {
        await tester.pumpWidget(app(
          SingleChildScrollView(
            child: SizedBox(
              width: 600,
              child: Column(children: [
                for (final ty in AicdeFeedbackType.values) AicdeAlert(type: ty, title: '標題', message: '內容'),
                const AicdeBanner(tag: 'NEW', child: Text('公告')),
                const AicdeBanner(color: AicdeBannerColor.coral, flush: true, child: Text('公告')),
                const AicdeDivider(),
                const AicdeDivider(label: '或'),
                const AicdeDivider(label: '左', align: AicdeDividerAlign.left),
                const SizedBox(height: 20, child: AicdeDivider(vertical: true)),
                const AicdeProgress(value: 40),
                const AicdeProgress(value: 80, color: AicdeProgressColor.success),
                const AicdeProgress(indeterminate: true),
                const Row(children: [AicdeCircleProgress(value: 65), AicdeSpinner(size: AicdeSpinnerSize.sm), AicdeSpinner(), AicdeSpinner(size: AicdeSpinnerSize.lg)]),
                const AicdeSkeletonGroup(children: [AicdeSkeleton(variant: AicdeSkeletonVariant.circle), AicdeSkeleton(variant: AicdeSkeletonVariant.title), AicdeSkeleton(), AicdeSkeleton(variant: AicdeSkeletonVariant.block)]),
                for (final st in AicdeResultStatus.values) AicdeResult(status: st, title: '完成', description: '說明', actions: [AicdeButton(label: '返回', onPressed: () {})]),
                Row(children: [
                  AicdeFloatButton(onPressed: () {}, label: '新增'),
                  AicdeFloatButton(onPressed: () {}, label: '新增', extended: true, color: AicdeFloatButtonColor.navy),
                  AicdeFloatButton(onPressed: () {}, size: AicdeFloatButtonSize.sm),
                ]),
                const AicdeModal(title: '對話框', footer: [Text('footer')], child: Text('內容')),
                const SizedBox(height: 200, child: AicdeDrawer(title: '抽屜', child: Text('內容'))),
                AicdePopover(defaultOpen: true, title: '彈出', content: const Text('內容'), trigger: (c, t) => AicdeButton(label: 'P', onPressed: t)),
              ]),
            ),
          ),
          style: s,
          b: b,
        ));
        final ctx = tester.element(find.byType(AicdeDivider).first);
        AicdeToast.show(ctx, 'toast');
        AicdeToast.notify(ctx, title: 'notice', text: 't', actions: const [AicdeNotifyAction(label: 'OK')]);
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull, reason: '$s $b');
        await tester.pump(const Duration(seconds: 6));
        await tester.pump(const Duration(milliseconds: 300));
      }
    }
  });
}
