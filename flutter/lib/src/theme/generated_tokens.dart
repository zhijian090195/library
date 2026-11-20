// 由 tokens/build.mjs 從 tokens/tokens.json 產生，請勿手動修改。
// ignore_for_file: lines_longer_than_80_chars
import 'package:flutter/widgets.dart';

import 'colors.dart';
import 'tokens.dart';

/// 淺色模式色票
const kAicdeLight = AicdeColors(
  navy: Color(0xFF173F50),
  band: Color(0xFF246078),
  coral: Color(0xFFFC5454),
  coralDark: Color(0xFFE43F3F),
  sky: Color(0xFFA8C8D4),
  surface: Color(0xFFFFFFFF),
  surface2: Color(0xFFE6EDF0),
  ink: Color(0xFF173F50),
  inkBody: Color(0xFF1D1D1F),
  ink2: Color(0xFF55595F),
  ink3: Color(0xFF7F8B91),
  line: Color(0xFFE3E6EA),
  lineStrong: Color(0xFFCFD6DB),
  danger: Color(0xFFE43F3F),
  success: Color(0xFF1F9D6B),
  warning: Color(0xFFD98A00),
);

/// 深色模式色票
const kAicdeDark = AicdeColors(
  navy: Color(0xFF2B6A85),
  band: Color(0xFF4F93AD),
  coral: Color(0xFFFC5454),
  coralDark: Color(0xFFE43F3F),
  sky: Color(0xFFA8C8D4),
  surface: Color(0xFF112631),
  surface2: Color(0xFF17323E),
  ink: Color(0xFFEEF4F6),
  inkBody: Color(0xFFE3EAED),
  ink2: Color(0xFFA3B6BE),
  ink3: Color(0xFF6C8590),
  line: Color(0xFF1D3A46),
  lineStrong: Color(0xFF2B4C59),
  danger: Color(0xFFFF6B6B),
  success: Color(0xFF3CC48D),
  warning: Color(0xFFF0A92B),
);

/// 主題淺色模式下覆寫的底色；null 表示沿用色票
typedef AicdeSurfaceOverride = ({Color? surface, Color? surface2, Color? line, Color? lineStrong});

/// 各主題共用的 token（和網頁版 CSS 同一份來源）
typedef AicdeSharedTokens = ({double rXs, double rSm, double rMd, double rLg, double rPill, double controlHeight, AicdeSurfaceOverride surfaceLight});

const Map<AicdeThemeStyle, AicdeSharedTokens> kAicdeThemeTokens = {
  AicdeThemeStyle.paperCut: (rXs: 4, rSm: 8, rMd: 12, rLg: 16, rPill: 999, controlHeight: 40, surfaceLight: (surface: null, surface2: null, line: null, lineStrong: null)),
  AicdeThemeStyle.clean: (rXs: 4, rSm: 8, rMd: 12, rLg: 16, rPill: 999, controlHeight: 40, surfaceLight: (surface: null, surface2: null, line: null, lineStrong: null)),
  AicdeThemeStyle.paper: (rXs: 4, rSm: 8, rMd: 12, rLg: 16, rPill: 999, controlHeight: 40, surfaceLight: (surface: Color(0xFFFFFDF8), surface2: Color(0xFFF3ECDF), line: Color(0xFFECE2CF), lineStrong: Color(0xFFDCCBAD))),
  AicdeThemeStyle.ink: (rXs: 4, rSm: 8, rMd: 12, rLg: 16, rPill: 999, controlHeight: 40, surfaceLight: (surface: Color(0xFFFFFAF0), surface2: Color(0xFFF6ECD9), line: null, lineStrong: null)),
  AicdeThemeStyle.soft: (rXs: 6, rSm: 10, rMd: 14, rLg: 20, rPill: 999, controlHeight: 40, surfaceLight: (surface: Color(0xFFFBFDFE), surface2: Color(0xFFE8EFF2), line: null, lineStrong: null)),
  AicdeThemeStyle.riso: (rXs: 3, rSm: 6, rMd: 8, rLg: 10, rPill: 999, controlHeight: 40, surfaceLight: (surface: Color(0xFFFFFDF8), surface2: Color(0xFFF1EBE0), line: null, lineStrong: null)),
  AicdeThemeStyle.brutal: (rXs: 0, rSm: 0, rMd: 0, rLg: 0, rPill: 0, controlHeight: 40, surfaceLight: (surface: null, surface2: null, line: null, lineStrong: null)),
  AicdeThemeStyle.stitch: (rXs: 4, rSm: 8, rMd: 12, rLg: 16, rPill: 999, controlHeight: 40, surfaceLight: (surface: Color(0xFFF8F2E8), surface2: Color(0xFFEBE1D2), line: Color(0xFFE2D6C3), lineStrong: Color(0xFFCDBDA4))),
  AicdeThemeStyle.ticket: (rXs: 4, rSm: 8, rMd: 12, rLg: 16, rPill: 999, controlHeight: 40, surfaceLight: (surface: Color(0xFFFFFDF9), surface2: Color(0xFFF4EFE8), line: null, lineStrong: null)),
  AicdeThemeStyle.block: (rXs: 4, rSm: 6, rMd: 8, rLg: 12, rPill: 999, controlHeight: 40, surfaceLight: (surface: null, surface2: null, line: null, lineStrong: null)),
  AicdeThemeStyle.blueprint: (rXs: 1, rSm: 2, rMd: 2, rLg: 2, rPill: 2, controlHeight: 40, surfaceLight: (surface: null, surface2: null, line: null, lineStrong: null)),
  AicdeThemeStyle.clinical: (rXs: 4, rSm: 8, rMd: 10, rLg: 14, rPill: 999, controlHeight: 44, surfaceLight: (surface: null, surface2: Color(0xFFEEF4F7), line: Color(0xFFDBE6EB), lineStrong: Color(0xFFB9CCD5))),
  AicdeThemeStyle.cute: (rXs: 8, rSm: 12, rMd: 16, rLg: 22, rPill: 999, controlHeight: 40, surfaceLight: (surface: Color(0xFFFFFAFA), surface2: Color(0xFFFDEEEE), line: Color(0xFFF6DEDE), lineStrong: Color(0xFFEFC8C8))),
  AicdeThemeStyle.finance: (rXs: 2, rSm: 3, rMd: 4, rLg: 6, rPill: 4, controlHeight: 34, surfaceLight: (surface: null, surface2: null, line: null, lineStrong: null)),
  AicdeThemeStyle.editorial: (rXs: 0, rSm: 0, rMd: 0, rLg: 0, rPill: 0, controlHeight: 40, surfaceLight: (surface: Color(0xFFFCFBF8), surface2: Color(0xFFF2EFE8), line: Color(0xFFE4DFD4), lineStrong: Color(0xFFB9B2A5))),
};
