import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/app_widgets.dart';

class CategoryScreen extends ConsumerWidget {
  const CategoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final draft = ref.watch(purchaseDraftProvider);
    final categories = [
      _Category(
        id: 'motor',
        title: 'ປະກັນໄພລົດ',
        subtitle: 'Vehicle Insurance',
        description: 'ລົດເກັງ, ລົດກະບະ, ລົດຈິບ, ລົດຕູ້, ລົດບັນທຸກ ແລະ ລົດເມ',
        icon: Icons.directions_car_filled_rounded,
        color: AppColors.primary,
        background: AppColors.accentSoft,
      ),
      _Category(
        id: 'health',
        title: 'ປະກັນໄພສຸຂະພາບ',
        subtitle: 'Health Insurance',
        description: 'ຄຸ້ມຄອງການປິ່ນປົວ, ນອນໂຮງໝໍ ແລະ ສຸຂະພາບຄອບຄົວ',
        icon: Icons.health_and_safety_rounded,
        color: const Color(0xFF0284C7),
        background: const Color(0xFFE0F2FE),
      ),
      _Category(
        id: 'property',
        title: 'ປະກັນໄພຊັບສິນ',
        subtitle: 'Property / Asset Insurance',
        description: 'ເຮືອນ, ອາຄານ, ທຸລະກິດ ແລະ ອຸດສາຫະກຳ',
        icon: Icons.home_work_rounded,
        color: AppColors.amber,
        background: AppColors.amberSoft,
      ),
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: GreenAppBar(
        title: 'ເລືອກປະກັນໄພ',
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
        ),
      ),
      body: AppPage(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'ເລືອກປະເພດປະກັນໄພ',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 6),
            const Text(
              'ທ່ານຕ້ອງການຄຸ້ມຄອງສິ່ງໃດ?',
              style: TextStyle(fontSize: 12.5, color: AppColors.muted),
            ),
            const SizedBox(height: 20),
            for (final category in categories) ...[
              AppCard(
                onTap: () {
                  ref.read(purchaseDraftProvider.notifier).setCategory(category.id);
                  context.push('/purchase/plan');
                },
                borderColor: draft.category == category.id ? category.color : AppColors.border,
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: [
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        color: category.background,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Icon(category.icon, color: category.color, size: 30),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            category.title,
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            category.subtitle,
                            style: TextStyle(
                              fontSize: 10.5,
                              color: category.color,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 5),
                          Text(
                            category.description,
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.muted,
                              height: 1.45,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Icon(Icons.chevron_right_rounded, color: category.color),
                  ],
                ),
              ),
              const SizedBox(height: 12),
            ],
            const SizedBox(height: 8),
            AppCard(
              color: AppColors.mint,
              borderColor: const Color(0xFFCDEBD8),
              child: const Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.verified_user_outlined, size: 19, color: AppColors.primary),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'ທຸກແຜນປະກັນໄພຖືກສະເໜີໂດຍບໍລິສັດປະກັນໄພທີ່ໄດ້ຮັບອະນຸຍາດ ແລະ ເປັນຄູ່ຮ່ວມຂອງສາຍຝົນ.',
                      style: TextStyle(fontSize: 11, color: AppColors.muted, height: 1.6),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Category {
  const _Category({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.icon,
    required this.color,
    required this.background,
  });

  final String id;
  final String title;
  final String subtitle;
  final String description;
  final IconData icon;
  final Color color;
  final Color background;
}
