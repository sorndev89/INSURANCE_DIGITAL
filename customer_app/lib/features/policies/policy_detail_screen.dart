import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/app_widgets.dart';
import '../../data/models.dart';

class PolicyDetailScreen extends ConsumerWidget {
  const PolicyDetailScreen({super.key, required this.id});

  final String id;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(policiesControllerProvider);
    final policy = state.value?.where((item) => item.id == id).firstOrNull;

    if (policy == null) {
      return Scaffold(
        appBar: GreenAppBar(
          title: 'ລາຍລະອຽດສັນຍາ',
          leading: IconButton(
            onPressed: () => context.pop(),
            icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          ),
        ),
        body: const EmptyState(title: 'ບໍ່ພົບສັນຍານີ້'),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: GreenAppBar(
        title: 'ລາຍລະອຽດສັນຍາ',
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: Colors.white),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 18, 16, 28),
        children: [
          _TicketCard(policy: policy),
          const SizedBox(height: 16),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'ຂໍ້ມູນຜູ້ເອົາປະກັນໄພ',
                  style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 10),
                InfoRow(label: 'ຊື່ຜູ້ເອົາປະກັນ', value: policy.customerName),
                InfoRow(label: 'ວັນເດືອນປີເກີດ', value: policy.customerDob),
                InfoRow(label: 'ປະເພດປະກັນໄພ', value: policy.category),
                if (policy.vehicleType.isNotEmpty)
                  InfoRow(label: 'ປະເພດລົດ', value: policy.vehicleType),
              ],
            ),
          ),
          const SizedBox(height: 12),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'ການຊຳລະເງິນ',
                  style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 10),
                InfoRow(label: 'ຍອດຊຳລະທັງໝົດ', value: Fmt.kip(policy.totalPremium), valueColor: AppColors.primary),
                InfoRow(label: 'ຊຳລະຜ່ານ', value: policy.paidVia),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Image.asset('assets/icons/bcel.png', width: 26, height: 26),
                    const SizedBox(width: 8),
                    const Text(
                      'BCEL One',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                    const Spacer(),
                    const StatusChip(
                      label: 'ຊຳລະແລ້ວ',
                      icon: Icons.check_rounded,
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
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
                    'ເອກະສານສັນຍາສະບັບເຕັມ ສາມາດດາວໂຫຼດເປັນ PDF ໄດ້. ຫາກຕ້ອງການຄວາມຊ່ວຍເຫຼືອ ກະລຸນາຕິດຕໍ່ 021 633 222.',
                    style: TextStyle(fontSize: 11.5, color: AppColors.muted, height: 1.6),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          PrimaryButton(
            label: 'ຂໍ້ມູນສັນຍາ PDF',
            icon: Icons.download_rounded,
            onPressed: () => _showPdfSheet(context, policy),
          ),
        ],
      ),
    );
  }

  void _showPdfSheet(BuildContext context, Policy policy) {
    showModalBottomSheet<void>(
      context: context,
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 14, 20, 26),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 42,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(99),
                ),
              ),
              const SizedBox(height: 20),
              const Icon(Icons.picture_as_pdf_rounded, size: 44, color: AppColors.danger),
              const SizedBox(height: 12),
              Text(
                'ເອກະສານສັນຍາ ${policy.number}',
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 6),
              const Text(
                'ໃນເວີຊັນ Demo ນີ້ ຈະສະແດງຕົວຢ່າງໄຟລ໌ PDF.\nເມື່ອເຊື່ອມຕໍ່ API ຈິງ ລະບົບຈະດາວໂຫຼດຈາກເຊີບເວີ.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 11.5, color: AppColors.muted, height: 1.6),
              ),
              const SizedBox(height: 18),
              PrimaryButton(
                label: 'ເປີດໄຟລ໌ຕົວຢ່າງ',
                onPressed: () {
                  Navigator.of(context).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('PDF ຕົວຢ່າງ: WEC-policy-demo.pdf')),
                  );
                },
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('ປິດ'),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _TicketCard extends StatelessWidget {
  const _TicketCard({required this.policy});

  final Policy policy;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: const BoxDecoration(
              gradient: AppColors.headerGradient,
              borderRadius: BorderRadius.vertical(top: Radius.circular(19)),
            ),
            child: Row(
              children: [
                Container(
                  width: 52,
                  height: 52,
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: policy.companyLogo.isEmpty
                      ? const Icon(Icons.business_rounded, color: AppColors.primary)
                      : Image.asset(
                          policy.companyLogo,
                          fit: BoxFit.contain,
                          errorBuilder: (_, _, _) => const Icon(
                            Icons.business_rounded,
                            color: AppColors.primary,
                          ),
                        ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        policy.productName,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        policy.companyName,
                        style: const TextStyle(color: Colors.white70, fontSize: 10.5),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: .18),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    policy.status.label,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 9.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 16, 18, 4),
            child: Column(
              children: [
                InfoRow(label: 'ເລກທີສັນຍາ', value: policy.number),
                InfoRow(label: 'ວັນທີເລີ່ມຄຸ້ມຄອງ', value: Fmt.dateTimeSeconds(policy.startDate)),
                InfoRow(label: 'ວັນສິ້ນສຸດການຄຸ້ມຄອງ', value: Fmt.dateTimeSeconds(policy.endDate)),
              ],
            ),
          ),
          const _PerforatedDivider(),
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 10, 18, 18),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'ຍອດຊຳລະຄ່າປະກັນໄພ',
                        style: TextStyle(fontSize: 10.5, color: AppColors.muted),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        Fmt.kip(policy.totalPremium),
                        style: const TextStyle(
                          fontSize: 19,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text(
                      'ຊຳລະຜ່ານ',
                      style: TextStyle(fontSize: 10.5, color: AppColors.muted),
                    ),
                    const SizedBox(height: 5),
                    Image.asset('assets/icons/bcel.png', height: 24),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PerforatedDivider extends StatelessWidget {
  const _PerforatedDivider();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 20,
      child: Row(
        children: [
          Container(
            width: 10,
            height: 20,
            decoration: const BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.horizontal(right: Radius.circular(20)),
            ),
          ),
          Expanded(
            child: CustomPaint(
              painter: _DashPainter(),
              child: const SizedBox(height: 20),
            ),
          ),
          Container(
            width: 10,
            height: 20,
            decoration: const BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.horizontal(left: Radius.circular(20)),
            ),
          ),
        ],
      ),
    );
  }
}

class _DashPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.border
      ..strokeWidth = 1.4;
    const dash = 6.0;
    const gap = 5.0;
    var x = 0.0;
    while (x < size.width) {
      canvas.drawLine(Offset(x, size.height / 2), Offset(x + dash, size.height / 2), paint);
      x += dash + gap;
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
