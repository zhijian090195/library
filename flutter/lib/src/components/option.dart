import 'package:flutter/widgets.dart';

/// 選項（Select、CheckboxGroup、RadioGroup、Segmented 共用），對應 React 的 `CheckOption`。
@immutable
class AicdeOption {
  const AicdeOption(this.value, {this.label, this.disabled = false});
  final String value;

  /// 顯示文字；預設等於 [value]
  final String? label;
  final bool disabled;

  String get text => label ?? value;

  /// 把字串清單轉成選項
  static List<AicdeOption> of(Iterable<String> values) => [for (final v in values) AicdeOption(v)];
}
