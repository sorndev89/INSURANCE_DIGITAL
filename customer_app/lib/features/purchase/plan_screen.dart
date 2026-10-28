import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/app_widgets.dart';

class PlanScreen extends ConsumerWidget {
  const PlanScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final draft = ref.watch(purchaseDraftProvider);
    final plans = ref.watch(plansProvider(draft.category));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: GreenAppBar(
        title: 'ເລືອກແບບປະກັນໄພ',
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
        ),
      ),
      body: plans.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => ErrorState(message: '$error'),
        data: (items) {
          return Column(
            children: [
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 20),
                  children: [
                    Text(
                      draft.categoryLabel,
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 5),
                    const Text(
                      'ເລືອກແຜນທີ່ເໝາະສົມກັບຄວາມຕ້ອງການຂອງທ່ານ',
                      style: TextStyle(fontSize: 12.5, color: AppColors.muted),
                    ),
                    const SizedBox(height: 18),
                    for (final plan in items) ...[
                      _PlanCard(
                        plan: plan,
                        selected: draft.plan?.id == plan.id,
                        onTap: () =>
                            ref.read(purchaseDraftProvider.notifier).setPlan(plan),
                      ),
                      const SizedBox(height: 12),
                    ],
                  ],
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
                    onPressed: draft.plan == null
                        ? null
                        : () {
                            if (draft.isMotor) {
                              context.push('/purchase/vehicle-type');
                            } else {
                              context.push('/purchase/wizard');
                            }
                          },
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  const _PlanCard({
    required this.plan,
    required this.selected,
    required this.onTap,
  });

  final dynamic plan;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: selected ? AppColors.primary : AppColors.border,
          width: selected ? 1.8 : 1,
        ),
        boxShadow: selected
            ? [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: .12),
                  blurRadius: 18,
                  offset: const Offset(0, 6),
                ),
              ]
            : null,
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(15),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          plan.title as String,
                          style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w800),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          plan.subtitle as String,
                          style: const TextStyle(
                            fontSize: 10,
                            color: AppColors.primary,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if ((plan.discount as num) > 0) DiscountBadge(value: plan.discount as num),
                  const SizedBox(width: 8),
                  Container(
                    width: 22,
                    height: 22,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: selected ? AppColors.primary : AppColors.border,
                        width: selected ? 6 : 1.5,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                plan.description as String,
                style: const TextStyle(fontSize: 11.5, color: AppColors.muted, height: 1.5),
              ),
              const SizedBox(height: 10),
              for (final feature in (plan.features as List<String>))
                Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    children: [
                      const Icon(Icons.check_rounded, size: 13, color: AppColors.success),
                      const SizedBox(width: 5),
                      Expanded(
                        child: Text(
                          feature,
                          style: const TextStyle(fontSize: 10.5, color: AppColors.muted),
                        ),
                      ),
                    ],
                  ),
                ),
              const Divider(height: 20),
              Row(
                children: [
                  const Text(
                    'ຄ່າປະກັນໄພເລີ່ມຕົ້ນ',
                    style: TextStyle(fontSize: 10.5, color: AppColors.muted),
                  ),
                  const Spacer(),
                  Text(
                    Fmt.kip(plan.basePremium as num),
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
