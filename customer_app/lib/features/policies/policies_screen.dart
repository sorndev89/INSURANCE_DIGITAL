import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/app_widgets.dart';
import '../../data/models.dart';

class PoliciesScreen extends ConsumerWidget {
  const PoliciesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final policies = ref.watch(policiesControllerProvider);
    final claims = ref.watch(claimsProvider);

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: Column(
          children: [
            Container(
              color: AppColors.primary,
              child: SafeArea(
                bottom: false,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Padding(
                      padding: EdgeInsets.fromLTRB(16, 16, 16, 14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'ປະກັນໄພຂອງຂ້ອຍ',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          SizedBox(height: 4),
                          Text(
                            'ຈັດການສັນຍາ ແລະ ປະຫວັດການເຄມ',
                            style: TextStyle(color: Colors.white70, fontSize: 11.5),
                          ),
                        ],
                      ),
                    ),
                    TabBar(
                      labelColor: Colors.white,
                      unselectedLabelColor: Colors.white60,
                      indicatorColor: Colors.white,
                      indicatorWeight: 3,
                      labelStyle: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700),
                      unselectedLabelStyle: const TextStyle(fontSize: 11.5),
                      tabs: const [
                        Tab(text: 'ກຳລັງຄຸ້ມຄອງ'),
                        Tab(text: 'ໝົດອາຍຸ'),
                        Tab(text: 'ປະຫວັດເຄມ'),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            Expanded(
              child: policies.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (error, _) => ErrorState(
                  message: '$error',
                  onRetry: () => ref.invalidate(policiesControllerProvider),
                ),
                data: (items) {
                  final active = items.where((p) => p.status == PolicyStatus.active).toList();
                  final expired = items.where((p) => p.status == PolicyStatus.expired).toList();
                  return TabBarView(
                    children: [
                      _PolicyList(items: active, emptyTitle: 'ຍັງບໍ່ມີສັນຍາທີ່ກຳລັງຄຸ້ມຄອງ'),
                      _PolicyList(items: expired, emptyTitle: 'ຍັງບໍ່ມີສັນຍາທີ່ໝົດອາຍຸ'),
                      claims.when(
                        loading: () => const Center(child: CircularProgressIndicator()),
                        error: (error, _) => ErrorState(
                          message: '$error',
                          onRetry: () => ref.invalidate(claimsProvider),
                        ),
                        data: (items) => items.isEmpty
                            ? const EmptyState(
                                title: 'ຍັງບໍ່ມີປະຫວັດການເຄມ',
                                icon: Icons.assignment_outlined,
                              )
                            : ListView.separated(
                                padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
                                itemCount: items.length,
                                separatorBuilder: (_, _) => const SizedBox(height: 10),
                                itemBuilder: (context, index) =>
                                    _ClaimCard(claim: items[index]),
                              ),
                      ),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PolicyList extends StatelessWidget {
  const _PolicyList({required this.items, required this.emptyTitle});

  final List<Policy> items;
  final String emptyTitle;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return EmptyState(
        title: emptyTitle,
        description: 'ເລີ່ມຊື້ປະກັນໄພຈາກໜ້າຫຼັກໄດ້ເລີຍ',
        icon: Icons.shield_outlined,
        action: TextButton(
          onPressed: () => context.push('/purchase/category'),
          child: const Text('ຊື້ປະກັນໄພ'),
        ),
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      itemCount: items.length,
      separatorBuilder: (_, _) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final policy = items[index];
        final active = policy.status == PolicyStatus.active;
        return AppCard(
          onTap: () => context.push('/policies/${policy.id}'),
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    width: 46,
                    height: 46,
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
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
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w800),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          '${policy.number} · ${policy.companyName}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 10.5, color: AppColors.muted),
                        ),
                      ],
                    ),
                  ),
                  StatusChip(
                    label: policy.status.label,
                    color: active ? AppColors.success : AppColors.muted,
                    background: active ? AppColors.successSoft : AppColors.divider,
                    icon: active ? Icons.verified_rounded : Icons.schedule_rounded,
                  ),
                ],
              ),
              const SizedBox(height: 14),
              const Divider(),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: _Meta(
                      label: 'ເລີ່ມຄຸ້ມຄອງ',
                      value: Fmt.date(policy.startDate),
                    ),
                  ),
                  Expanded(
                    child: _Meta(
                      label: 'ສິ້ນສຸດ',
                      value: Fmt.date(policy.endDate),
                    ),
                  ),
                  Expanded(
                    child: _Meta(
                      label: 'ຄ່າປະກັນໄພ',
                      value: Fmt.kip(policy.totalPremium),
                      alignEnd: true,
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

class _Meta extends StatelessWidget {
  const _Meta({required this.label, required this.value, this.alignEnd = false});

  final String label;
  final String value;
  final bool alignEnd;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: alignEnd ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 9.5, color: AppColors.muted)),
        const SizedBox(height: 3),
        Text(
          value,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700),
        ),
      ],
    );
  }
}

class _ClaimCard extends StatelessWidget {
  const _ClaimCard({required this.claim});

  final ClaimRecord claim;

  @override
  Widget build(BuildContext context) {
    final (color, background, icon) = switch (claim.status) {
      ClaimStatus.approved => (AppColors.success, AppColors.successSoft, Icons.check_circle_rounded),
      ClaimStatus.rejected => (AppColors.danger, AppColors.dangerSoft, Icons.cancel_rounded),
      ClaimStatus.pending => (AppColors.amber, AppColors.amberSoft, Icons.schedule_rounded),
    };
    return AppCard(
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(color: background, shape: BoxShape.circle),
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      claim.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '${claim.number} · ${claim.policyNumber}',
                      style: const TextStyle(fontSize: 10, color: AppColors.muted),
                    ),
                  ],
                ),
              ),
              StatusChip(
                label: claim.status.label,
                color: color,
                background: background,
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.event_outlined, size: 14, color: AppColors.hint),
              const SizedBox(width: 5),
              Text(
                Fmt.date(claim.date),
                style: const TextStyle(fontSize: 10.5, color: AppColors.muted),
              ),
              const Spacer(),
              Text(
                Fmt.kip(claim.amount),
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
