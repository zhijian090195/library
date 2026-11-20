import 'package:aicde_ui/aicde_ui.dart';
import 'dart:math' as math;

import 'package:flutter/material.dart';

const _regions = [
  AicdeCascaderOption('tw', label: '台灣', children: [
    AicdeCascaderOption('tpe', label: '台北市', children: [
      AicdeCascaderOption('xy', label: '信義區'),
      AicdeCascaderOption('da', label: '大安區'),
      AicdeCascaderOption('zs', label: '中山區'),
    ]),
    AicdeCascaderOption('khh', label: '高雄市', children: [
      AicdeCascaderOption('ly', label: '苓雅區'),
      AicdeCascaderOption('gs', label: '鼓山區'),
    ]),
    AicdeCascaderOption('hl', label: '花蓮縣'),
  ]),
  AicdeCascaderOption('jp', label: '日本', children: [AicdeCascaderOption('tky', label: '東京')]),
  AicdeCascaderOption('kr', label: '韓國（暫不開放）', disabled: true),
];

/// 進階輸入元件的範例：(名稱, builder)
final List<(String, WidgetBuilder)> entryAdvancedDemos = [
  ('Upload 上傳', (_) => const _UploadDemo()),
  ('Rating 評分', (_) => const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        AicdeRating(initialValue: 4),
        SizedBox(height: 8),
        AicdeRating(initialValue: 3, size: AicdeRatingSize.sm, readOnly: true),
        SizedBox(height: 8),
        AicdeRating(initialValue: 2, count: 3, character: Icon(Icons.favorite_rounded)),
      ])),
  ('Autocomplete 自動完成', (_) => SizedBox(
        width: 280,
        child: AicdeAutocomplete(
          placeholder: '輸入城市',
          options: AicdeAutocomplete.strings(['台北', '新北', '台中', '台南', '高雄', '花蓮', '台東']),
        ),
      )),
  ('ColorPicker 選色', (_) => const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        AicdeColorPicker(),
        SizedBox(height: 14),
        AicdeColorSwatches(
          colors: ['#173F50', '#246078', '#FC5454', '#A8C8D4', '#1F9D6B', '#D98A00'],
          labels: ['深藍', '海藍', '珊瑚', '天藍', '綠', '橘'],
        ),
      ])),
  ('Cascader 級聯選擇', (_) => const SizedBox(width: 280, child: AicdeCascader(options: _regions, initialValue: ['tw', 'tpe', 'da']))),
  ('Transfer 穿梭框', (_) => const AicdeTransfer(
        items: [
          AicdeTransferItem('a', label: '首頁'),
          AicdeTransferItem('b', label: '作品集'),
          AicdeTransferItem('c', label: '部落格'),
          AicdeTransferItem('d', label: '關於我們'),
          AicdeTransferItem('e', label: '後台（需權限）', disabled: true),
        ],
        initialValue: ['b'],
        listWidth: 170,
        listHeight: 200,
      )),
  ('TagInput 標籤輸入', (_) => const SizedBox(width: 340, child: AicdeTagInput(initialValue: ['設計', 'Flutter'], max: 6))),
];

/// 模擬選檔與上傳進度（真實 App 請在 onPick 裡呼叫 file_picker 之類的套件）
class _UploadDemo extends StatefulWidget {
  const _UploadDemo();
  @override
  State<_UploadDemo> createState() => _UploadDemoState();
}

class _UploadDemoState extends State<_UploadDemo> {
  var _files = <AicdeUploadFile>[
    const AicdeUploadFile(name: '封面.png', size: 284000),
    const AicdeUploadFile(name: '簡報.pdf', size: 3400000, progress: .6),
  ];
  var _n = 0;

  Future<List<AicdeUploadFile>?> _pick() async {
    _n++;
    final f = AicdeUploadFile(name: '新檔案-$_n.jpg', size: 120000 + math.Random().nextInt(900000), progress: 0);
    _simulate(f.key);
    return [f];
  }

  Future<void> _simulate(String key) async {
    for (var p = .2; p <= 1.01; p += .2) {
      await Future<void>.delayed(const Duration(milliseconds: 300));
      if (!mounted) return;
      setState(() => _files = [
            for (final f in _files) f.key == key ? (p >= 1 ? f.copyWith(clearProgress: true) : f.copyWith(progress: p)) : f,
          ]);
    }
  }

  @override
  Widget build(BuildContext context) => AicdeUpload(
        multiple: true,
        hint: 'PNG、JPG、PDF，單檔 10 MB 以內',
        files: _files,
        onChanged: (v) => setState(() => _files = v),
        onPick: _pick,
      );
}
