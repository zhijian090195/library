import 'package:aicde_ui/aicde_ui.dart';
import 'package:flutter/material.dart';

Widget _gap([double h = 12]) => SizedBox(height: h, width: h);

/// 回饋類元件的範例，(名稱, builder)
final List<(String, WidgetBuilder)> feedbackDemos = [
  ('Modal 對話框', (context) => AicdeButton(
        label: '開啟對話框',
        variant: AicdeButtonVariant.primary,
        onPressed: () => showAicdeModal<bool>(
          context,
          title: '刪除這個專案？',
          builder: (_) => const Text('刪除後，專案內的檔案與紀錄都無法復原。'),
          footer: (ctx) => [
            AicdeButton(label: '取消', onPressed: () => Navigator.pop(ctx, false)),
            AicdeButton(label: '刪除', variant: AicdeButtonVariant.danger, onPressed: () => Navigator.pop(ctx, true)),
          ],
        ),
      )),
  ('Drawer 抽屜', (context) => Wrap(spacing: 12, children: [
        AicdeButton(label: '從右側', onPressed: () => showAicdeDrawer(context, title: '篩選條件', builder: (_) => const Text('在這裡放表單欄位。'), footer: (ctx) => [AicdeButton(label: '套用', variant: AicdeButtonVariant.primary, onPressed: () => Navigator.pop(ctx))])),
        AicdeButton(label: '從左側', onPressed: () => showAicdeDrawer(context, title: '選單', side: AicdeDrawerSide.left, builder: (_) => const Text('導覽項目'))),
      ])),
  ('Toast 與通知', (context) => SizedBox(
        height: 220,
        child: AicdeToaster(
          child: Builder(
            builder: (ctx) => Wrap(spacing: 12, runSpacing: 12, children: [
              AicdeButton(label: '已儲存', onPressed: () => AicdeToast.show(ctx, '已儲存變更', type: AicdeFeedbackType.success)),
              AicdeButton(label: '錯誤', onPressed: () => AicdeToast.show(ctx, '上傳失敗，請再試一次', type: AicdeFeedbackType.error)),
              AicdeButton(
                label: '通知',
                variant: AicdeButtonVariant.primary,
                onPressed: () => AicdeToast.notify(ctx, title: '已刪除 3 個檔案', text: '可在 30 天內從垃圾桶還原。', actions: const [AicdeNotifyAction(label: '復原'), AicdeNotifyAction(label: '查看')]),
              ),
            ]),
          ),
        ),
      )),
  ('Alert 提示', (context) => Column(children: [
        const AicdeAlert(title: '新功能', message: '現在可以一次匯出多個專案。'),
        _gap(),
        const AicdeAlert(type: AicdeFeedbackType.success, message: '付款完成，收據已寄到你的信箱。'),
        _gap(),
        AicdeAlert(type: AicdeFeedbackType.warning, title: '方案即將到期', message: '剩下 3 天，到期後將無法新增成員。', onClose: () {}),
        _gap(),
        const AicdeAlert(type: AicdeFeedbackType.error, title: '無法連線', message: '請檢查網路後重新整理。'),
      ])),
  ('Progress 進度', (context) => const Column(children: [
        AicdeProgress(value: 32),
        SizedBox(height: 14),
        AicdeProgress(value: 76, color: AicdeProgressColor.success),
        SizedBox(height: 14),
        AicdeProgress(indeterminate: true),
        SizedBox(height: 18),
        Row(children: [AicdeCircleProgress(value: 64), SizedBox(width: 20), AicdeCircleProgress(value: 100, size: 56, color: AicdeProgressColor.success)]),
      ])),
  ('Spinner 轉圈', (context) => const Row(children: [
        AicdeSpinner(size: AicdeSpinnerSize.sm), SizedBox(width: 20), AicdeSpinner(), SizedBox(width: 20), AicdeSpinner(size: AicdeSpinnerSize.lg),
      ])),
  ('Skeleton 骨架', (context) => const Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        AicdeSkeleton(variant: AicdeSkeletonVariant.circle, width: 48),
        SizedBox(width: 14),
        Expanded(child: AicdeSkeletonGroup(children: [AicdeSkeleton(variant: AicdeSkeletonVariant.title), AicdeSkeleton(), AicdeSkeleton(width: 160)])),
      ])),
  ('Popover 彈出卡片', (context) => AicdePopover(
        title: '分享這份文件',
        content: const Text('任何拿到連結的人都可以檢視。'),
        footer: Align(alignment: Alignment.centerRight, child: AicdeButton(label: '複製連結', size: AicdeButtonSize.sm, variant: AicdeButtonVariant.primary, onPressed: () {})),
        trigger: (c, toggle) => AicdeButton(label: '分享', icon: const Icon(Icons.ios_share_rounded), onPressed: toggle),
      )),
  ('Result 結果', (context) => AicdeResult(
        title: '訂單已送出',
        description: '我們會在 1–2 個工作天內出貨，並以 Email 通知你。',
        actions: [AicdeButton(label: '查看訂單', variant: AicdeButtonVariant.primary, onPressed: () {}), AicdeButton(label: '回首頁', onPressed: () {})],
      )),
  ('Banner 橫幅', (context) => const Column(children: [
        AicdeBanner(tag: '新', child: Text('AICDE 2.0 上線：15 種元件主題')),
        SizedBox(height: 12),
        AicdeBanner(color: AicdeBannerColor.coral, child: Text('系統將於今晚 23:00 維護 30 分鐘')),
      ])),
  ('Divider 分隔線', (context) => const Column(children: [
        AicdeDivider(),
        AicdeDivider(label: '或'),
        AicdeDivider(label: '進階設定', align: AicdeDividerAlign.left),
        Row(children: [Text('編輯'), AicdeDivider(vertical: true), Text('分享'), AicdeDivider(vertical: true), Text('刪除')]),
      ])),
  ('FloatButton 浮動按鈕', (context) => Wrap(spacing: 16, crossAxisAlignment: WrapCrossAlignment.center, children: [
        AicdeFloatButton(label: '新增', onPressed: () {}),
        AicdeFloatButton(label: '新增專案', extended: true, color: AicdeFloatButtonColor.navy, onPressed: () {}),
        AicdeFloatButton(label: '聊天', size: AicdeFloatButtonSize.sm, icon: const Icon(Icons.chat_bubble_outline_rounded), onPressed: () {}),
      ])),
];
