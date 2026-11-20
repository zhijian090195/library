import 'package:aicde_ui/aicde_ui.dart';

import 'package:flutter/material.dart';

class _Row {
  const _Row(this.name, this.role, this.score);
  final String name, role;
  final int score;
}

const _rows = [_Row('林小雨', '設計', 92), _Row('陳大明', '工程', 78), _Row('王美玲', '行銷', 85)];

/// 顯示類（基礎）元件範例
final List<(String, WidgetBuilder)> displayBasicDemos = [
  ('Card', (_) => const SizedBox(
        width: 280,
        child: AicdeCard(eyebrow: '案例', title: '暖白分層剪紙', interactive: true, child: Text('用少量紙片建立遠近層次。')),
      )),
  ('Tag', (_) => Wrap(spacing: 8, runSpacing: 8, children: [
        const AicdeTag(label: '預設'),
        const AicdeTag(label: '熱門', color: AicdeTagColor.coral, dot: true),
        const AicdeTag(label: '深藍', color: AicdeTagColor.navy),
        const AicdeTag(label: '完成', color: AicdeTagColor.success),
        AicdeTag(label: '可關閉', color: AicdeTagColor.outline, closable: true, onClose: () {}),
      ])),
  ('Badge', (_) => Wrap(spacing: 24, children: [
        AicdeBadge(count: 5, child: AicdeButton(icon: const Icon(Icons.notifications_none), onPressed: () {})),
        AicdeBadge(count: 120, child: AicdeButton(icon: const Icon(Icons.mail_outline), onPressed: () {})),
        const AicdeBadge(dot: true, child: Icon(Icons.chat_bubble_outline)),
        const AicdeBadge(count: 3, color: AicdeBadgeColor.navy),
      ])),
  ('Avatar', (_) => Wrap(spacing: 12, crossAxisAlignment: WrapCrossAlignment.center, children: const [
        AicdeAvatar(name: '林', size: AicdeAvatar.sm),
        AicdeAvatar(name: 'Amy', color: AicdeAvatarColor.coral),
        AicdeAvatar(name: '陳', color: AicdeAvatarColor.navy, size: AicdeAvatar.lg, shape: AicdeAvatarShape.square),
        AicdeAvatarGroup(max: 3, children: [AicdeAvatar(name: 'A'), AicdeAvatar(name: 'B', color: AicdeAvatarColor.coral), AicdeAvatar(name: 'C', color: AicdeAvatarColor.navy), AicdeAvatar(name: 'D'), AicdeAvatar(name: 'E')]),
      ])),
  ('Tooltip', (_) => AicdeTooltip(message: '儲存目前的草稿', child: AicdeButton(label: '滑過看看', onPressed: () {}))),
  ('Collapse', (_) => const AicdeCollapse(accordion: true, defaultActiveKeys: ['a'], items: [
        AicdeCollapseItem(key: 'a', title: '什麼是紙雕分層？', content: Text('以多層紙片疊出深度。')),
        AicdeCollapseItem(key: 'b', title: '可以換主題嗎？', content: Text('15 種主題隨時切換。')),
        AicdeCollapseItem(key: 'c', title: '停用項目', content: Text('-'), disabled: true),
      ])),
  ('Table', (_) => AicdeTable<_Row>(
        selectable: true,
        striped: true,
        rowKey: (r) => r.name,
        rows: _rows,
        columns: [
          AicdeTableColumn(key: 'name', title: '姓名', value: (r) => r.name, sortable: true),
          AicdeTableColumn(key: 'role', title: '部門', value: (r) => r.role),
          AicdeTableColumn(key: 'score', title: '分數', value: (r) => r.score, sortable: true, align: AicdeColumnAlign.right),
        ],
      )),
  ('Empty', (_) => AicdeEmpty(title: '還沒有專案', description: '建立第一個專案開始吧。', action: AicdeButton(label: '新增專案', variant: AicdeButtonVariant.primary, onPressed: () {}))),
  ('Statistic', (_) => const Wrap(spacing: 32, runSpacing: 16, children: [
        AicdeStatistic(label: '本月營收', value: 1284000, prefix: r'$', trend: AicdeStatisticTrend(value: '12.5%')),
        AicdeStatistic(label: '跳出率', value: 32.4, decimals: 1, suffix: '%', trend: AicdeStatisticTrend(value: '3.1%', direction: AicdeTrendDirection.up, tone: AicdeTrendTone.bad)),
      ])),
  ('Timeline', (_) => const AicdeTimeline(items: [
        AicdeTimelineItem(title: '建立專案', time: '09:12', content: '設定主題與色票'),
        AicdeTimelineItem(title: '設計審查', time: '13:40', status: AicdeTimelineStatus.active),
        AicdeTimelineItem(title: '上線', time: '待定', status: AicdeTimelineStatus.muted),
      ])),
  ('List', (_) => AicdeList(items: [
        AicdeListItem(avatar: const AicdeAvatar(name: '林'), title: '林小雨', description: '更新了設計稿', extra: const Text('2 分鐘前'), onTap: () {}),
        AicdeListItem(avatar: const AicdeAvatar(name: '陳', color: AicdeAvatarColor.coral), title: '陳大明', description: '留言：看起來很棒', extra: const Text('1 小時前'), onTap: () {}),
      ])),
  ('Descriptions', (_) => const AicdeDescriptions(items: [
        AicdeDescriptionsItem(label: '訂單編號', child: Text('A-20261120')),
        AicdeDescriptionsItem(label: '狀態', child: AicdeTag(label: '已付款', color: AicdeTagColor.success)),
        AicdeDescriptionsItem(label: '地址', child: Text('台北市信義區松仁路 100 號'), wide: true),
      ])),
  ('Kbd', (_) => const Wrap(spacing: 16, children: [AicdeKbd('Esc'), AicdeKbdCombo(keys: ['⌘', 'K']), AicdeKbdCombo(keys: ['Ctrl', 'Shift', 'P'])])),
];
