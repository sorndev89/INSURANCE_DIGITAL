import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/app_widgets.dart';
import '../../data/models.dart';

class ServicesScreen extends ConsumerWidget {
  const ServicesScreen({super.key});

  Color _accent(ServiceOffer offer) {
    final hex = offer.accent.replaceFirst('#', '');
    return Color(int.parse('FF$hex', radix: 16));
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final services = ref.watch(servicesProvider);
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          Container(
            width: double.infinity,
            color: AppColors.primary,
            child: SafeArea(
              bottom: false,
              child: const Padding(
                padding: EdgeInsets.fromLTRB(16, 16, 16, 18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'ການບໍລິການ',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'ບໍລິການປະກັນໄພ ແລະ ຄູ່ຮ່ວມທຸລະກິດ',
                      style: TextStyle(color: Colors.white70, fontSize: 11.5),
                    ),
                  ],
                ),
              ),
            ),
          ),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 18, 16, 24),
              itemCount: services.length,
              separatorBuilder: (_, _) => const SizedBox(height: 14),
              itemBuilder: (context, index) {
                final offer = services[index];
                return _ServiceCard(
                  offer: offer,
                  accent: _accent(offer),
                  onTap: () {
                    final category = offer.company == 'FORTE TOKO'
                        ? 'motor'
                        : offer.company == 'FigTree Blue'
                            ? 'health'
                            : 'property';
                    ref.read(purchaseDraftProvider.notifier).setCategory(category);
                    context.push('/purchase/plan');
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _ServiceCard extends StatelessWidget {
  const _ServiceCard({
    required this.offer,
    required this.accent,
    required this.onTap,
  });

  final ServiceOffer offer;
  final Color accent;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            height: 112,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [accent.withValues(alpha: .96), accent.withValues(alpha: .68)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        offer.company,
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        offer.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14.5,
                          height: 1.35,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  width: 62,
                  height: 62,
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: offer.image.isEmpty
                      ? const Icon(Icons.health_and_safety_rounded,
                          color: AppColors.primary, size: 30)
                      : Image.asset(offer.image, fit: BoxFit.contain),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    offer.description,
                    style: const TextStyle(
                      fontSize: 12.5,
                      color: AppColors.muted,
                      height: 1.5,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Icon(Icons.arrow_forward_ios_rounded, size: 14, color: accent),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
