import 'package:aicde_ui/aicde_ui.dart';
import 'package:flutter/material.dart';

/// 範例：基本輸入元件
final List<(String, WidgetBuilder)> entryBasicDemos = [
  ('Input', (_) => const _InputDemo()),
  ('Textarea', (_) => const _Stateful(builder: _textarea)),
  ('Select', (_) => const _SelectDemo()),
  ('Switch', (_) => const _SwitchDemo()),
  ('Checkbox', (_) => const _CheckDemo()),
  ('Radio', (_) => const _RadioDemo()),
  ('Segmented', (_) => const _SegDemo()),
  ('Slider', (_) => const _SliderDemo()),
  ('InputNumber', (_) => const _NumDemo()),
  ('OtpInput', (_) => const _OtpDemo()),
];

const _cities = ['台北', '台中', '高雄', '花蓮'];

Widget _textarea(BuildContext c, String v, ValueChanged<String> set) =>
    AicdeTextarea(value: v, onChanged: set, placeholder: '想說的話…', maxLength: 120, showCount: true);

class _Stateful extends StatefulWidget {
  const _Stateful({required this.builder});
  final Widget Function(BuildContext, String, ValueChanged<String>) builder;
  @override
  State<_Stateful> createState() => _StatefulState();
}

class _StatefulState extends State<_Stateful> {
  String v = '';
  @override
  Widget build(BuildContext context) => widget.builder(context, v, (n) => setState(() => v = n));
}

class _InputDemo extends StatefulWidget {
  const _InputDemo();
  @override
  State<_InputDemo> createState() => _InputDemoState();
}

class _InputDemoState extends State<_InputDemo> {
  String name = '';
  @override
  Widget build(BuildContext context) => Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, spacing: 14, children: [
        AicdeField(label: '名稱', help: '最多 20 字', child: AicdeInput(value: name, onChanged: (v) => setState(() => name = v), placeholder: '輸入名稱')),
        const AicdeInput(placeholder: '搜尋', prefix: Icon(Icons.search)),
        const AicdeField(error: '格式不正確', child: AicdeInput(value: 'abc@', error: true)),
        const AicdeInput(placeholder: '停用', enabled: false),
      ]);
}

class _SelectDemo extends StatefulWidget {
  const _SelectDemo();
  @override
  State<_SelectDemo> createState() => _SelectDemoState();
}

class _SelectDemoState extends State<_SelectDemo> {
  String? v;
  @override
  Widget build(BuildContext context) => AicdeSelect(
        options: [...AicdeOption.of(_cities), const AicdeOption('tt', label: '台東（暫停）', disabled: true)],
        value: v,
        onChanged: (n) => setState(() => v = n),
        width: 220,
      );
}

class _SwitchDemo extends StatefulWidget {
  const _SwitchDemo();
  @override
  State<_SwitchDemo> createState() => _SwitchDemoState();
}

class _SwitchDemoState extends State<_SwitchDemo> {
  bool a = true, b = false;
  @override
  Widget build(BuildContext context) => Wrap(spacing: 20, runSpacing: 12, children: [
        AicdeSwitch(value: a, onChanged: (v) => setState(() => a = v), label: '通知'),
        AicdeSwitch(value: b, onChanged: (v) => setState(() => b = v), size: AicdeSwitchSize.sm, label: '小'),
        const AicdeSwitch(value: true, onChanged: null, label: '停用'),
      ]);
}

class _CheckDemo extends StatefulWidget {
  const _CheckDemo();
  @override
  State<_CheckDemo> createState() => _CheckDemoState();
}

class _CheckDemoState extends State<_CheckDemo> {
  List<String> v = ['台北'];
  @override
  Widget build(BuildContext context) => Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, spacing: 12, children: [
        AicdeCheckbox(
          label: '全選',
          value: v.length == _cities.length,
          indeterminate: v.isNotEmpty && v.length < _cities.length,
          onChanged: (on) => setState(() => v = on ? [..._cities] : []),
        ),
        AicdeCheckboxGroup(options: AicdeOption.of(_cities), value: v, onChanged: (n) => setState(() => v = n)),
      ]);
}

class _RadioDemo extends StatefulWidget {
  const _RadioDemo();
  @override
  State<_RadioDemo> createState() => _RadioDemoState();
}

class _RadioDemoState extends State<_RadioDemo> {
  String v = '月繳';
  @override
  Widget build(BuildContext context) =>
      AicdeRadioGroup(options: AicdeOption.of(['月繳', '年繳', '一次付清']), value: v, onChanged: (n) => setState(() => v = n));
}

class _SegDemo extends StatefulWidget {
  const _SegDemo();
  @override
  State<_SegDemo> createState() => _SegDemoState();
}

class _SegDemoState extends State<_SegDemo> {
  String v = '週';
  @override
  Widget build(BuildContext context) =>
      AicdeSegmented(options: AicdeOption.of(['日', '週', '月', '年']), value: v, onChanged: (n) => setState(() => v = n));
}

class _SliderDemo extends StatefulWidget {
  const _SliderDemo();
  @override
  State<_SliderDemo> createState() => _SliderDemoState();
}

class _SliderDemoState extends State<_SliderDemo> {
  double v = 40;
  @override
  Widget build(BuildContext context) =>
      SizedBox(width: 320, child: AicdeSlider(value: v, onChanged: (n) => setState(() => v = n), showValue: true, unit: '%'));
}

class _NumDemo extends StatefulWidget {
  const _NumDemo();
  @override
  State<_NumDemo> createState() => _NumDemoState();
}

class _NumDemoState extends State<_NumDemo> {
  num v = 3;
  @override
  Widget build(BuildContext context) => AicdeInputNumber(value: v, min: 0, max: 10, onChanged: (n) => setState(() => v = n));
}

class _OtpDemo extends StatefulWidget {
  const _OtpDemo();
  @override
  State<_OtpDemo> createState() => _OtpDemoState();
}

class _OtpDemoState extends State<_OtpDemo> {
  String v = '12';
  bool err = false;
  @override
  Widget build(BuildContext context) => AicdeOtpInput(
        value: v,
        groupSize: 3,
        error: err,
        onChanged: (n) => setState(() {
          v = n;
          err = false;
        }),
        onComplete: (c) => setState(() => err = c != '123456'),
      );
}
