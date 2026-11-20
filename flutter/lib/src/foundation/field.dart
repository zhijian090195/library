import 'package:flutter/material.dart';

/// 嵌在 [AicdeBox] 裡的輸入框用：清掉全域 InputDecorationTheme 的外框與底色，外觀交給 AicdeBox
InputDecoration aicdeBareDecoration({String? hintText, TextStyle? hintStyle}) => InputDecoration(
      hintText: hintText,
      hintStyle: hintStyle,
      isDense: true,
      isCollapsed: true,
      filled: false,
      contentPadding: EdgeInsets.zero,
      border: InputBorder.none,
      enabledBorder: InputBorder.none,
      focusedBorder: InputBorder.none,
      disabledBorder: InputBorder.none,
      errorBorder: InputBorder.none,
      focusedErrorBorder: InputBorder.none,
    );
