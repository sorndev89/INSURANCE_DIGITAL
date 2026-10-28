import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/app_widgets.dart';
import '../../data/mock_data.dart';

class VehicleTypeScreen extends ConsumerWidget {
  const VehicleTypeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final draft = ref.watch(purchaseDraftProvider);
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: GreenAppBar(
        title: 'ເລືອກປະເພດລົດ',
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 18),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.03,
              ),
              itemCount: MockData.vehicleTypes.length,
              itemBuilder: (context, index) {
                final type = MockData.vehicleTypes[index];
                final selected = draft.vehicleType?.id == type.id;
                return AppCard(
                  onTap: () =>
                      ref.read(purchaseDraftProvider.notifier).setVehicleType(type),
                  borderColor: selected ? AppColors.primary : AppColors.border,
                  color: selected ? AppColors.mint : AppColors.surface,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 62,
                        height: 62,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: selected ? AppColors.primary : AppColors.accentSoft,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: SvgIcon(
                          type.icon,
                          size: 38,
                          color: selected ? Colors.white : AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        type.label,
                        maxLines: 2,
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        type.description,
                        style: const TextStyle(fontSize: 9.5, color: AppColors.muted),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            decoration: const BoxDecoration(
              color: AppColors.surface,
              border: Border(top: BorderSide(color: AppColors.border)),
            ),
            child: SafeArea(
              top: false,
              child: PrimaryButton(
                label: 'ໄປຕໍ່',
                onPressed: draft.vehicleType == null
                    ? null
                    : () => context.push('/purchase/wizard'),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
