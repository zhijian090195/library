import 'dart:convert';
import 'dart:io';

import 'package:aicde_ui/aicde_ui.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';

/// 確認 Flutter 的 token 和 tokens/tokens.json（網頁版也從這裡產生）一致
void main() {
  final json = jsonDecode(File('../tokens/tokens.json').readAsStringSync()) as Map<String, dynamic>;
  Color hex(String s) => Color(int.parse('FF${s.substring(1)}', radix: 16));
  final themes = json['themes'] as Map<String, dynamic>;
  final baseR = json['radius'] as Map<String, dynamic>;

  for (final entry in themes.entries) {
    final id = entry.key;
    final th = entry.value as Map<String, dynamic>;
    final style = AicdeThemeStyle.values.byName((th['flutter'] as String?) ?? id);

    test('$id：圓角、高度、底色和 tokens.json 一致', () {
      final r = {...baseR, ...?(th['radius'] as Map<String, dynamic>?)};
      final light = AicdeTokens.resolve(style, Brightness.light);
      final dark = AicdeTokens.resolve(style, Brightness.dark);
      for (final t in [light, dark]) {
        expect([t.rXs, t.rSm, t.rMd, t.rLg, t.rPill], [r['xs'], r['sm'], r['md'], r['lg'], r['pill']].map((v) => (v as num).toDouble()).toList());
        expect(t.controlHeight, ((th['controlHeight'] ?? json['controlHeight']) as num).toDouble());
      }
      final colors = json['color'] as Map<String, dynamic>;
      final lightC = {...colors['light'] as Map<String, dynamic>, ...?(th['surfaceLight'] as Map<String, dynamic>?)};
      final darkC = {...colors['light'] as Map<String, dynamic>, ...colors['dark'] as Map<String, dynamic>};
      Map<String, Color> asMap(AicdeColors c) => {
            'navy': c.navy, 'band': c.band, 'coral': c.coral, 'coralDark': c.coralDark, 'sky': c.sky,
            'surface': c.surface, 'surface2': c.surface2, 'ink': c.ink, 'inkBody': c.inkBody, 'ink2': c.ink2, 'ink3': c.ink3,
            'line': c.line, 'lineStrong': c.lineStrong, 'danger': c.danger, 'success': c.success, 'warning': c.warning,
          };
      expect(asMap(light.colors), {for (final e in lightC.entries) e.key: hex(e.value as String)});
      expect(asMap(dark.colors), {for (final e in darkC.entries) e.key: hex(e.value as String)});
    });
  }
}
