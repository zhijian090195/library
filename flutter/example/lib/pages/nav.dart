import 'package:aicde_ui/aicde_ui.dart';
import 'package:flutter/material.dart';

const _menuActions = [
  AicdeMenuAction(id: 'edit', label: '編輯', icon: Icon(Icons.edit_outlined), shortcut: '⌘E'),
  AicdeMenuAction(id: 'copy', label: '複製連結', icon: Icon(Icons.link)),
  AicdeMenuAction(id: 'archive', label: '封存', icon: Icon(Icons.archive_outlined), disabled: true),
  AicdeMenuAction.divider(),
  AicdeMenuAction(id: 'delete', label: '刪除', icon: Icon(Icons.delete_outline), danger: true),
];

final _commandGroups = [
  const AicdeCommandGroup(label: '頁面', items: [
    AicdeCommandItem(id: 'home', label: '首頁', icon: Icon(Icons.home_outlined), shortcut: 'G H'),
    AicdeCommandItem(id: 'settings', label: 'Settings 設定', icon: Icon(Icons.settings_outlined), keywords: 'preferences'),
    AicdeCommandItem(id: 'billing', label: '帳單與付款', icon: Icon(Icons.receipt_long_outlined)),
  ]),
  const AicdeCommandGroup(label: '動作', items: [
    AicdeCommandItem(id: 'new', label: '新增專案', icon: Icon(Icons.add), shortcut: '⌘N'),
    AicdeCommandItem(id: 'theme', label: '切換深色模式', icon: Icon(Icons.dark_mode_outlined)),
  ]),
];

/// 導覽類元件的範例
final List<(String, WidgetBuilder)> navDemos = [
  (
    'Tabs 標籤頁',
    (context) => Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
          AicdeTabs(items: [
            AicdeTabItem(id: 'a', label: '概覽', child: Text('專案摘要與最近活動。')),
            AicdeTabItem(id: 'b', label: '成員', child: Text('三位成員，兩位待邀請。')),
            AicdeTabItem(id: 'c', label: '封存', disabled: true),
            AicdeTabItem(id: 'd', label: '設定', child: Text('名稱、權限與通知。')),
          ]),
          SizedBox(height: 20),
          AicdeTabs(variant: AicdeTabsVariant.pill, items: [
            AicdeTabItem(id: 'd', label: '日'),
            AicdeTabItem(id: 'w', label: '週'),
            AicdeTabItem(id: 'm', label: '月'),
          ]),
        ]),
  ),
  ('Pagination 分頁', (context) => const AicdePagination(total: 12, initialValue: 6)),
  (
    'Dropdown 下拉選單',
    (context) => Wrap(spacing: 12, children: [
          AicdeDropdown(
            items: _menuActions,
            builder: (context, toggle, open) => AicdeButton(
              label: '更多動作',
              icon: Icon(open ? Icons.expand_less : Icons.expand_more),
              onPressed: toggle,
            ),
          ),
          AicdeDropdown(
            align: AicdeDropdownAlign.right,
            items: _menuActions,
            builder: (context, toggle, open) => AicdeButton(icon: const Icon(Icons.more_horiz), onPressed: toggle),
          ),
        ]),
  ),
  (
    'Breadcrumb 麵包屑',
    (context) => AicdeBreadcrumb(items: [
          AicdeBreadcrumbItem(label: '首頁', onTap: () {}),
          AicdeBreadcrumbItem(label: '專案', onTap: () {}),
          const AicdeBreadcrumbItem(label: '暖白分層剪紙'),
        ]),
  ),
  (
    'Steps 步驟條',
    (context) => const AicdeSteps(current: 1, items: [
          AicdeStepItem(title: '填寫資料', description: '基本資訊'),
          AicdeStepItem(title: '確認方案', description: '選擇方案'),
          AicdeStepItem(title: '完成'),
        ]),
  ),
  (
    'Menu 選單',
    (context) => const SizedBox(
          width: 260,
          child: AicdeMenu(initialValue: 'inbox', items: [
            AicdeMenuItem.group(label: '工作區', children: [
              AicdeMenuItem(id: 'inbox', label: '收件匣', icon: Icon(Icons.inbox_outlined), badge: '12'),
              AicdeMenuItem(id: 'projects', label: '專案', icon: Icon(Icons.folder_outlined), initiallyExpanded: true, children: [
                AicdeMenuItem(id: 'p1', label: '品牌更新'),
                AicdeMenuItem(id: 'p2', label: '官網改版'),
              ]),
            ]),
            AicdeMenuItem.group(label: '帳號', children: [
              AicdeMenuItem(id: 'settings', label: '設定', icon: Icon(Icons.settings_outlined)),
            ]),
          ]),
        ),
  ),
  (
    'CommandPalette 指令面板',
    (context) => AicdeCommandPalette(
          groups: _commandGroups,
          child: Builder(
            builder: (context) => AicdeButton(
              label: '開啟指令面板（⌘K）',
              icon: const Icon(Icons.search),
              onPressed: () => showAicdeCommandPalette(context, groups: _commandGroups),
            ),
          ),
        ),
  ),
  (
    'ContextMenu 右鍵選單',
    (context) {
      final t = AicdeTheme.of(context);
      return AicdeContextMenu(
        items: _menuActions,
        child: AicdeBox(
          kind: AicdeBoxKind.card,
          height: 120,
          width: double.infinity,
          alignment: Alignment.center,
          child: Text('在這裡按右鍵或長按', style: t.caption(size: 13)),
        ),
      );
    },
  ),
];
