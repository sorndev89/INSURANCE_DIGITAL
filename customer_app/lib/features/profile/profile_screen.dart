import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/providers.dart';
import '../../core/config/app_config.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/app_widgets.dart';
import '../../data/models.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  Future<void> _logout(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('ອອກຈາກລະບົບ'),
        content: const Text('ທ່ານຕ້ອງການອອກຈາກລະບົບແທ້ບໍ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('ຍົກເລີກ'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('ອອກຈາກລະບົບ', style: TextStyle(color: AppColors.danger)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    await ref.read(authControllerProvider.notifier).logout();
    if (context.mounted) context.go('/welcome');
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).value?.user ?? const AppUser();
    return Scaffold(
      backgroundColor: AppColors.background,
      body: ListView(
        padding: EdgeInsets.zero,
        children: [
          _ProfileHeader(user: user),
          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              children: [
                _MenuItem(
                  icon: Icons.edit_outlined,
                  label: 'ແປງຂໍ້ມູນ / ແກ້ໄຂຂໍ້ມູນ',
                  onTap: () => context.push('/profile/edit'),
                ),
                _MenuItem(
                  icon: Icons.language_rounded,
                  label: 'ພາສາ / ປ່ຽນພາສາ',
                  trailing: ref.watch(localeProvider).languageCode == 'lo' ? 'ລາວ' : 'English',
                  onTap: () => context.push('/profile/language'),
                ),
                _MenuItem(
                  icon: Icons.stars_outlined,
                  label: 'ຄະແນນສະສົມ',
                  trailing: Fmt.number(user.points),
                  onTap: () => context.push('/profile/points'),
                ),
                _MenuItem(
                  icon: Icons.lock_outline_rounded,
                  label: 'ປ່ຽນລະຫັດຜ່ານ',
                  onTap: () => context.push('/profile/password'),
                ),
                _MenuItem(
                  icon: Icons.description_outlined,
                  label: 'ເງື່ອນໄຂ ແລະ ຂໍ້ກຳນົດ',
                  onTap: () => context.push('/profile/terms'),
                ),
                _MenuItem(
                  icon: Icons.groups_outlined,
                  label: 'ກ່ຽວກັບພວກເຮົາ',
                  onTap: () => context.push('/profile/about'),
                ),
                _MenuItem(
                  icon: Icons.logout_rounded,
                  label: 'ອອກຈາກລະບົບ',
                  color: AppColors.danger,
                  showChevron: false,
                  onTap: () => _logout(context, ref),
                ),
              ],
            ),
          ),
          const SizedBox(height: 22),
          const Center(
            child: Column(
              children: [
                Text(
                  '@Sayfon insurance broker',
                  style: TextStyle(fontSize: 11.5, color: AppColors.muted),
                ),
                SizedBox(height: 3),
                Text(
                  'Version: ${AppConfig.version}',
                  style: TextStyle(fontSize: 10, color: AppColors.hint),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader({required this.user});

  final AppUser user;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: AppColors.headerGradient,
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(30)),
      ),
      child: Stack(
        children: [
          Positioned(
            right: -34,
            bottom: -50,
            child: Transform.rotate(
              angle: -0.18,
              child: Icon(
                Icons.shield_rounded,
                size: 240,
                color: Colors.white.withValues(alpha: .07),
              ),
            ),
          ),
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 14, 20, 22),
              child: Column(
                children: [
                  Row(
                    children: [
                      const Expanded(
                        child: Text(
                          'ໂປຣຟາຍ ແລະ ຕັ້ງຄ່າ',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      TextButton.icon(
                        onPressed: () => context.push('/profile/edit'),
                        icon: const Icon(Icons.edit_rounded, color: Colors.white, size: 15),
                        label: const Text(
                          'ແກ້ໄຂຂໍ້ມູນ',
                          style: TextStyle(color: Colors.white, fontSize: 11.5),
                        ),
                        style: TextButton.styleFrom(
                          backgroundColor: Colors.white.withValues(alpha: .14),
                          padding: const EdgeInsets.symmetric(horizontal: 10),
                          minimumSize: const Size(0, 32),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(999),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Container(
                    width: 84,
                    height: 84,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: .2),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2.5),
                    ),
                    child: const Icon(Icons.person_rounded, size: 46, color: Colors.white),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    user.name,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    Fmt.phone(user.phone),
                    style: const TextStyle(color: Colors.white70, fontSize: 11.5),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    height: 42,
                    child: ElevatedButton.icon(
                      onPressed: () => context.push('/agent/terms'),
                      icon: const Icon(Icons.badge_outlined, size: 17),
                      label: Text(user.isAgent ? 'ຈັດການຕົວແທນ' : 'ສະໝັກອາເຈັນສິ'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppColors.primary,
                        minimumSize: const Size(double.infinity, 42),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  const _MenuItem({
    required this.icon,
    required this.label,
    required this.onTap,
    this.trailing,
    this.color,
    this.showChevron = true,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final String? trailing;
  final Color? color;
  final bool showChevron;

  @override
  Widget build(BuildContext context) {
    final iconColor = color ?? AppColors.primary;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: AppCard(
        onTap: onTap,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
        child: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: .1),
                borderRadius: BorderRadius.circular(11),
              ),
              child: Icon(icon, color: iconColor, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: color ?? AppColors.text,
                ),
              ),
            ),
            if (trailing != null)
              Padding(
                padding: const EdgeInsets.only(right: 8),
                child: Text(
                  trailing!,
                  style: const TextStyle(fontSize: 11.5, color: AppColors.muted),
                ),
              ),
            if (showChevron)
              const Icon(Icons.chevron_right_rounded, size: 20, color: AppColors.hint),
          ],
        ),
      ),
    );
  }
}
