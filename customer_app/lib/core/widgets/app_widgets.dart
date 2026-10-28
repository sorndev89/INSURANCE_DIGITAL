import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

class AppLogo extends StatelessWidget {
  const AppLogo({super.key, this.size = 72, this.radius = 20});

  final double size;
  final double radius;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: Image.asset(
        'assets/images/logo.jpg',
        width: size,
        height: size,
        fit: BoxFit.cover,
      ),
    );
  }
}

class PrimaryButton extends StatelessWidget {
  const PrimaryButton({
    super.key,
    required this.label,
    this.onPressed,
    this.loading = false,
    this.icon,
    this.color,
    this.height = 52,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final IconData? icon;
  final Color? color;
  final double height;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      child: ElevatedButton(
        onPressed: loading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: color ?? AppColors.primary,
          disabledBackgroundColor: (color ?? AppColors.primary).withValues(alpha: .55),
        ),
        child: loading
            ? const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2.2,
                  color: Colors.white,
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (icon != null) ...[
                    Icon(icon, size: 19),
                    const SizedBox(width: 8),
                  ],
                  Flexible(child: Text(label, overflow: TextOverflow.ellipsis)),
                ],
              ),
      ),
    );
  }
}

class SecondaryButton extends StatelessWidget {
  const SecondaryButton({
    super.key,
    required this.label,
    this.onPressed,
    this.icon,
    this.dark = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool dark;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 52,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: dark ? AppColors.slate : AppColors.accentSoft,
          foregroundColor: dark ? Colors.white : AppColors.primary,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 19),
              const SizedBox(width: 8),
            ],
            Flexible(child: Text(label, overflow: TextOverflow.ellipsis)),
          ],
        ),
      ),
    );
  }
}

class AppTextField extends StatelessWidget {
  const AppTextField({
    super.key,
    this.controller,
    this.label,
    this.hint,
    this.prefixIcon,
    this.suffix,
    this.obscure = false,
    this.keyboardType,
    this.validator,
    this.onChanged,
    this.maxLines = 1,
    this.readOnly = false,
    this.onTap,
    this.inputFormatters,
    this.textInputAction,
  });

  final TextEditingController? controller;
  final String? label;
  final String? hint;
  final IconData? prefixIcon;
  final Widget? suffix;
  final bool obscure;
  final TextInputType? keyboardType;
  final String? Function(String?)? validator;
  final ValueChanged<String>? onChanged;
  final int maxLines;
  final bool readOnly;
  final VoidCallback? onTap;
  final List<TextInputFormatter>? inputFormatters;
  final TextInputAction? textInputAction;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null) ...[
          Text(
            label!,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.muted,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 7),
        ],
        TextFormField(
          controller: controller,
          obscureText: obscure,
          keyboardType: keyboardType,
          validator: validator,
          onChanged: onChanged,
          maxLines: maxLines,
          readOnly: readOnly,
          onTap: onTap,
          inputFormatters: inputFormatters,
          textInputAction: textInputAction,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: prefixIcon != null
                ? Icon(prefixIcon, size: 20, color: AppColors.muted)
                : null,
            suffixIcon: suffix,
          ),
        ),
      ],
    );
  }
}

class AppDropdownField<T> extends StatelessWidget {
  const AppDropdownField({
    super.key,
    required this.label,
    required this.value,
    required this.items,
    required this.onChanged,
    this.hint = '--ກະລຸນາເລືອກ--',
  });

  final String label;
  final T? value;
  final List<DropdownMenuItem<T>> items;
  final ValueChanged<T?> onChanged;
  final String hint;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 13,
            color: AppColors.muted,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 7),
        DropdownButtonFormField<T>(
          key: ValueKey<T?>(value),
          initialValue: value,
          items: items,
          onChanged: onChanged,
          hint: Text(hint, style: const TextStyle(color: AppColors.hint, fontSize: 14)),
          icon: const Icon(Icons.keyboard_arrow_down_rounded),
          style: const TextStyle(
            fontFamily: AppTheme.fontFamily,
            fontSize: 14,
            color: AppColors.text,
            fontWeight: FontWeight.w500,
          ),
          decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 4)),
        ),
      ],
    );
  }
}

class AppCard extends StatelessWidget {
  const AppCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.onTap,
    this.borderColor,
    this.color,
    this.radius = 16,
  });

  final Widget child;
  final EdgeInsets padding;
  final VoidCallback? onTap;
  final Color? borderColor;
  final Color? color;
  final double radius;

  @override
  Widget build(BuildContext context) {
    final content = Container(
      padding: padding,
      decoration: BoxDecoration(
        color: color ?? AppColors.surface,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: borderColor ?? AppColors.border),
      ),
      child: child,
    );
    if (onTap == null) return content;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(radius),
        onTap: onTap,
        child: content,
      ),
    );
  }
}

class SectionHeader extends StatelessWidget {
  const SectionHeader({
    super.key,
    required this.title,
    this.action,
    this.onAction,
    this.description,
  });

  final String title;
  final String? action;
  final VoidCallback? onAction;
  final String? description;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: AppColors.text,
                ),
              ),
              if (description != null) ...[
                const SizedBox(height: 3),
                Text(
                  description!,
                  style: const TextStyle(fontSize: 12, color: AppColors.muted),
                ),
              ],
            ],
          ),
        ),
        if (action != null)
          TextButton(
            onPressed: onAction,
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              minimumSize: const Size(0, 32),
            ),
            child: Text(
              action!,
              style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700),
            ),
          ),
      ],
    );
  }
}

class DiscountBadge extends StatelessWidget {
  const DiscountBadge({super.key, required this.value});

  final num value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.danger,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        '-${value.toInt()}%',
        style: const TextStyle(
          color: Colors.white,
          fontSize: 10.5,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}

class StatusChip extends StatelessWidget {
  const StatusChip({
    super.key,
    required this.label,
    this.color = AppColors.success,
    this.background = AppColors.successSoft,
    this.icon,
  });

  final String label;
  final Color color;
  final Color background;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: color),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 10.5,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

class InfoRow extends StatelessWidget {
  const InfoRow({
    super.key,
    required this.label,
    required this.value,
    this.valueColor,
    this.dense = false,
  });

  final String label;
  final String value;
  final Color? valueColor;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: dense ? 5 : 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 4,
            child: Text(
              label,
              style: const TextStyle(fontSize: 12.5, color: AppColors.muted),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 6,
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: TextStyle(
                fontSize: 12.5,
                fontWeight: FontWeight.w700,
                color: valueColor ?? AppColors.text,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class EmptyState extends StatelessWidget {
  const EmptyState({
    super.key,
    required this.title,
    this.description,
    this.icon = Icons.inbox_outlined,
    this.action,
  });

  final String title;
  final String? description;
  final IconData icon;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: const BoxDecoration(
              color: AppColors.accentSoft,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 34, color: AppColors.primary),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.text,
            ),
          ),
          if (description != null) ...[
            const SizedBox(height: 6),
            Text(
              description!,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: AppColors.muted),
            ),
          ],
          if (action != null) ...[
            const SizedBox(height: 18),
            action!,
          ],
        ],
      ),
    );
  }
}

class ErrorState extends StatelessWidget {
  const ErrorState({super.key, required this.message, this.onRetry});

  final String message;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return EmptyState(
      icon: Icons.wifi_off_rounded,
      title: 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້',
      description: message,
      action: onRetry == null
          ? null
          : TextButton(onPressed: onRetry, child: const Text('ລອງໃໝ່')),
    );
  }
}

class StepIndicator extends StatelessWidget {
  const StepIndicator({super.key, required this.current, this.total = 5});

  final int current;
  final int total;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        for (var index = 1; index <= total; index++) ...[
          _StepDot(index: index, current: current),
          if (index != total)
            Expanded(
              child: Container(
                height: 2,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                color: index < current ? AppColors.primary : AppColors.border,
              ),
            ),
        ],
      ],
    );
  }
}

class _StepDot extends StatelessWidget {
  const _StepDot({required this.index, required this.current});

  final int index;
  final int current;

  @override
  Widget build(BuildContext context) {
    final done = index < current;
    final active = index == current;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      width: 28,
      height: 28,
      decoration: BoxDecoration(
        color: done || active ? AppColors.primary : AppColors.surface,
        shape: BoxShape.circle,
        border: Border.all(
          color: done || active ? AppColors.primary : AppColors.border,
          width: 1.4,
        ),
      ),
      child: Center(
        child: done
            ? const Icon(Icons.check_rounded, size: 16, color: Colors.white)
            : Text(
                '$index',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: active ? Colors.white : AppColors.hint,
                ),
              ),
      ),
    );
  }
}

class GreenAppBar extends StatelessWidget implements PreferredSizeWidget {
  const GreenAppBar({
    super.key,
    required this.title,
    this.actions,
    this.leading,
    this.showBack = true,
    this.bottom,
  });

  final String title;
  final List<Widget>? actions;
  final Widget? leading;
  final bool showBack;
  final PreferredSizeWidget? bottom;

  @override
  Size get preferredSize => Size.fromHeight(kToolbarHeight + (bottom?.preferredSize.height ?? 0));

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Text(title),
      centerTitle: true,
      leading: showBack
          ? (leading ??
              IconButton(
                onPressed: () => Navigator.of(context).maybePop(),
                icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
              ))
          : null,
      actions: actions,
      bottom: bottom,
    );
  }
}

class SvgIcon extends StatelessWidget {
  const SvgIcon(this.asset, {super.key, this.size = 24, this.color});

  final String asset;
  final double size;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return SvgPicture.asset(
      asset,
      width: size,
      height: size,
      colorFilter: color == null
          ? null
          : ColorFilter.mode(color!, BlendMode.srcIn),
    );
  }
}

class AppPage extends StatelessWidget {
  const AppPage({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.fromLTRB(16, 16, 16, 24),
    this.scrollable = true,
  });

  final Widget child;
  final EdgeInsets padding;
  final bool scrollable;

  @override
  Widget build(BuildContext context) {
    if (!scrollable) return Padding(padding: padding, child: child);
    return SingleChildScrollView(
      padding: padding,
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 560),
          child: child,
        ),
      ),
    );
  }
}
