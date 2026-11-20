import 'package:flutter/material.dart';

import '../foundation/box.dart';
import '../foundation/text.dart';
import '../theme/theme.dart';

enum AicdeAvatarShape { circle, square }

enum AicdeAvatarColor { sky, coral, navy }

/// 頭像：有圖片就顯示圖片（載入失敗改顯示名字首字），否則顯示 [name] 的第一個字。
class AicdeAvatar extends StatelessWidget {
  const AicdeAvatar({
    super.key,
    this.image,
    this.name,
    this.size = 40,
    this.shape = AicdeAvatarShape.circle,
    this.color = AicdeAvatarColor.sky,
    this.child,
  });

  /// 常用尺寸
  static const double sm = 28, md = 40, lg = 56;

  final ImageProvider? image;
  final String? name;
  final double size;
  final AicdeAvatarShape shape;
  final AicdeAvatarColor color;
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final c = t.colors;
    final (fill, fg) = switch (color) {
      AicdeAvatarColor.sky => (c.sky, const Color(0xFF173F50)),
      AicdeAvatarColor.coral => (c.coral, Colors.white),
      AicdeAvatarColor.navy => (c.navy, Colors.white),
    };
    final initial = name == null || name!.trim().isEmpty ? '' : name!.trim().characters.first.toUpperCase();
    final fallback = child ?? Text(initial, style: t.label(size: size * .42, weight: FontWeight.w700, color: fg));
    final radius = shape == AicdeAvatarShape.circle ? size / 2 : (t.rSm < size / 2 ? t.rSm : size / 4);
    return Semantics(
      label: name,
      image: image != null,
      child: ExcludeSemantics(
        child: AicdeBox(
          kind: AicdeBoxKind.chip,
          fill: fill,
          width: size,
          height: size,
          radius: radius,
          clip: true,
          alignment: Alignment.center,
          child: image == null
              ? fallback
              : Image(
                  image: image!,
                  width: size,
                  height: size,
                  fit: BoxFit.cover,
                  errorBuilder: (_, _, _) => Center(child: fallback),
                ),
        ),
      ),
    );
  }
}

/// 頭像群組：彼此重疊，超過 [max] 個時顯示「+N」。
class AicdeAvatarGroup extends StatelessWidget {
  const AicdeAvatarGroup({super.key, required this.children, this.max, this.size = 40});

  final List<AicdeAvatar> children;
  final int? max;
  final double size;

  @override
  Widget build(BuildContext context) {
    final t = AicdeTheme.of(context);
    final shown = max != null && children.length > max! ? children.sublist(0, max) : children;
    final rest = children.length - shown.length;
    final items = <Widget>[
      for (final a in shown)
        AicdeAvatar(image: a.image, name: a.name, size: size, shape: a.shape, color: a.color, child: a.child),
      if (rest > 0)
        Semantics(
          label: '還有 $rest 位',
          child: ExcludeSemantics(
            child: AicdeBox(
              kind: AicdeBoxKind.chip,
              fill: t.colors.surface2,
              width: size,
              height: size,
              radius: size / 2,
              alignment: Alignment.center,
              child: Text('+$rest', style: t.number(size: size * .34, color: t.colors.ink2)),
            ),
          ),
        ),
    ];
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (var i = 0; i < items.length; i++)
          Align(
            widthFactor: i == items.length - 1 ? 1 : .72,
            alignment: Alignment.centerLeft,
            child: DecoratedBox(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: t.colors.surface, width: 2),
              ),
              child: items[i],
            ),
          ),
      ],
    );
  }
}
