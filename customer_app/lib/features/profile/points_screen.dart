import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/app_widgets.dart';

class PointsScreen extends ConsumerWidget {
  const PointsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).value?.user;
    final points = user?.points ?? 0;
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: GreenAppBar(
        title: 'ຄະແນນສະສົມ',
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 18, 16, 24),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: AppColors.headerGradient,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              children: [
                const Icon(Icons.stars_rounded, color: AppColors.amber, size: 48),
                const SizedBox(height: 8),
                Text(
                  Fmt.number(points),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 38,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const Text(
                  'ຄະແນນທັງໝົດ',
                  style: TextStyle(color: Colors.white70, fontSize: 11.5),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: .16),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: const Text(
                    'ອີກ 550 ຄະແນນ ຮັບສ່ວນຫຼຸດ 10%',
                    style: TextStyle(color: Colors.white, fontSize: 11),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          const SectionHeader(title: 'ປະຫວັດຄະແນນ'),
          const SizedBox(height: 10),
          _PointItem(
            title: 'ຊື້ປະກັນໄພລົດ WEC-176482',
            date: DateTime(2026, 10, 20),
            points: 1200,
            positive: true,
          ),
          _PointItem(
            title: 'ແນະນຳເພື່ອນສະໝັກສະມາຊິກ',
            date: DateTime(2026, 10, 2),
            points: 500,
            positive: true,
          ),
          _PointItem(
            title: 'ຕໍ່ສັນຍາປະກັນໄພສຸຂະພາບ',
            date: DateTime(2026, 9, 18),
            points: 750,
            positive: true,
          ),
          const SizedBox(height: 18),
          AppCard(
            color: AppColors.mint,
            borderColor: const Color(0xFFCDEBD8),
            child: const Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.info_outline_rounded, size: 18, color: AppColors.primary),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'ຄະແນນຈະຖືກເພີ່ມເມື່ອຊຳລະເງິນສຳເລັດ ແລະ ສາມາດແລກສ່ວນຫຼຸດໄດ້ໃນການຊື້ຄັ້ງຕໍ່ໄປ.',
                    style: TextStyle(fontSize: 11.5, color: AppColors.muted, height: 1.6),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PointItem extends StatelessWidget {
  const _PointItem({
    required this.title,
    required this.date,
    required this.points,
    required this.positive,
  });

  final String title;
  final DateTime date;
  final int points;
  final bool positive;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 9),
      child: AppCard(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: positive ? AppColors.successSoft : AppColors.dangerSoft,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                positive ? Icons.add_rounded : Icons.remove_rounded,
                color: positive ? AppColors.success : AppColors.danger,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    Fmt.date(date),
                    style: const TextStyle(fontSize: 10, color: AppColors.muted),
                  ),
                ],
              ),
            ),
            Text(
              '${positive ? '+' : '-'}${Fmt.number(points)}',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w800,
                color: positive ? AppColors.success : AppColors.danger,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
