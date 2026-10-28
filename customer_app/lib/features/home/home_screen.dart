import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/providers.dart';
import '../../core/config/app_config.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/app_widgets.dart';
import '../../data/models.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final _companiesPage = PageController();
  final _promoPage = PageController();
  int _companiesIndex = 0;
  int _promoIndex = 0;

  @override
  void dispose() {
    _companiesPage.dispose();
    _promoPage.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authControllerProvider).value?.user;
    final companies = ref.watch(companiesProvider);
    final promotions = ref.watch(promotionsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async {
          ref.invalidate(companiesProvider);
          await ref.read(companiesProvider.future);
        },
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            _Header(user: user),
            const SizedBox(height: 18),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Expanded(
                    child: _QuickCategory(
                      icon: Icons.directions_car_filled_rounded,
                      label: 'ປະກັນໄພລົດ',
                      color: AppColors.primary,
                      onTap: () {
                        ref.read(purchaseDraftProvider.notifier).setCategory('motor');
                        context.push('/purchase/plan');
                      },
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _QuickCategory(
                      icon: Icons.health_and_safety_rounded,
                      label: 'ສຸຂະພາບ',
                      color: const Color(0xFF0EA5E9),
                      onTap: () {
                        ref.read(purchaseDraftProvider.notifier).setCategory('health');
                        context.push('/purchase/plan');
                      },
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _QuickCategory(
                      icon: Icons.home_work_rounded,
                      label: 'ຊັບສິນ',
                      color: AppColors.amber,
                      onTap: () {
                        ref.read(purchaseDraftProvider.notifier).setCategory('property');
                        context.push('/purchase/plan');
                      },
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: SectionHeader(
                title: 'ປະກັນໄພ',
                action: 'ເບິ່ງທັງໝົດ >',
                onAction: () => context.push('/purchase/category'),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 288,
              child: companies.when(
                loading: () => const Center(
                  child: CircularProgressIndicator(color: AppColors.primary),
                ),
                error: (error, _) => ErrorState(
                  message: '$error',
                  onRetry: () => ref.invalidate(companiesProvider),
                ),
                data: (items) {
                  final pages = <List<InsuranceCompany>>[];
                  for (var i = 0; i < items.length; i += 6) {
                    pages.add(items.sublist(i, (i + 6).clamp(0, items.length)));
                  }
                  return Column(
                    children: [
                      Expanded(
                        child: PageView.builder(
                          controller: _companiesPage,
                          itemCount: pages.length,
                          onPageChanged: (index) => setState(() => _companiesIndex = index),
                          itemBuilder: (context, index) {
                            return GridView.builder(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              physics: const NeverScrollableScrollPhysics(),
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                mainAxisSpacing: 10,
                                crossAxisSpacing: 10,
                                childAspectRatio: 2.15,
                              ),
                              itemCount: pages[index].length,
                              itemBuilder: (context, itemIndex) {
                                final company = pages[index][itemIndex];
                                return _CompanyCard(
                                  company: company,
                                  onTap: () => context.push('/purchase/category'),
                                );
                              },
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 10),
                      _Dots(count: pages.length, index: _companiesIndex),
                    ],
                  );
                },
              ),
            ),
            const SizedBox(height: 22),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: SectionHeader(
                title: 'ໂປຣໂມຊັ່ນ',
                action: 'ເບິ່ງທັງໝົດ >',
                onAction: () => context.push('/services'),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 172,
              child: PageView.builder(
                controller: _promoPage,
                itemCount: promotions.length,
                onPageChanged: (index) => setState(() => _promoIndex = index),
                itemBuilder: (context, index) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: _PromoBanner(promotion: promotions[index]),
                  );
                },
              ),
            ),
            const SizedBox(height: 10),
            _Dots(count: promotions.length, index: _promoIndex),
            const SizedBox(height: 22),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: AppCard(
                color: AppColors.slate,
                borderColor: AppColors.slate,
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: .12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.stars_rounded, color: AppColors.amber),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'ຄະແນນສະສົມຂອງທ່ານ',
                            style: TextStyle(color: Colors.white70, fontSize: 11.5),
                          ),
                          SizedBox(height: 2),
                          Text(
                            '2,450 ຄະແນນ',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                    ),
                    TextButton(
                      onPressed: () => context.push('/profile/points'),
                      child: const Text(
                        'ເບິ່ງ',
                        style: TextStyle(color: AppColors.amber, fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 18),
            const Center(
              child: Text(
                '${AppConfig.appName} · v${AppConfig.version}',
                style: TextStyle(fontSize: 9.5, color: AppColors.hint),
              ),
            ),
            const SizedBox(height: 18),
          ],
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({this.user});

  final AppUser? user;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: AppColors.headerGradient,
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
      ),
      child: Stack(
        children: [
          Positioned(
            right: -34,
            top: -34,
            child: Transform.rotate(
              angle: -0.18,
              child: Icon(
                Icons.shield_rounded,
                size: 230,
                color: Colors.white.withValues(alpha: .07),
              ),
            ),
          ),
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 22),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        width: 46,
                        height: 46,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: .18),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white.withValues(alpha: .45)),
                        ),
                        child: const Icon(Icons.person_rounded, color: Colors.white, size: 26),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'ສະບາຍດີ, ຍິນດີຕ້ອນຮັບ',
                              style: TextStyle(fontSize: 11, color: Colors.white70),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              user?.name.split(' ').first ?? 'ຜູ້ໃຊ້',
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w800,
                                fontSize: 17,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                        decoration: BoxDecoration(
                          color: AppColors.amber,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.star_rounded, color: Colors.white, size: 13),
                            SizedBox(width: 3),
                            Text(
                              'DIGITAL',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w800,
                                fontSize: 9,
                                letterSpacing: .4,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(999),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: .08),
                          blurRadius: 14,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: TextField(
                      readOnly: true,
                      onTap: () => context.push('/purchase/category'),
                      decoration: const InputDecoration(
                        hintText: 'ຄົ້ນຫາປະກັນໄພຂອງທ່ານ',
                        prefixIcon: Icon(Icons.search_rounded, color: AppColors.muted),
                        filled: false,
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(vertical: 14),
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

class _QuickCategory extends StatelessWidget {
  const _QuickCategory({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      child: Column(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: color.withValues(alpha: .12),
              borderRadius: BorderRadius.circular(11),
            ),
            child: Icon(icon, color: color, size: 21),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
          ),
        ],
      ),
    );
  }
}

class _CompanyCard extends StatelessWidget {
  const _CompanyCard({required this.company, required this.onTap});

  final InsuranceCompany company;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      padding: const EdgeInsets.all(8),
      child: Stack(
        children: [
          Center(
            child: company.hasLogo
                ? Image.asset(
                    company.logo,
                    fit: BoxFit.contain,
                    height: 42,
                    errorBuilder: (_, _, _) => _placeholder(),
                  )
                : _placeholder(),
          ),
          if (company.discount > 0)
            Positioned(
              top: -2,
              right: -2,
              child: DiscountBadge(value: company.discount),
            ),
        ],
      ),
    );
  }

  Widget _placeholder() {
    return Center(
      child: Text(
        company.shortName,
        textAlign: TextAlign.center,
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w800,
          color: AppColors.slate,
        ),
      ),
    );
  }
}

class _PromoBanner extends StatelessWidget {
  const _PromoBanner({required this.promotion});

  final Promotion promotion;

  @override
  Widget build(BuildContext context) {
    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        gradient: AppColors.promoGradient,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Stack(
        children: [
          Positioned(
            right: -6,
            bottom: -6,
            child: Opacity(
              opacity: .2,
              child: Image.asset(promotion.image, width: 180, fit: BoxFit.contain),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: .16),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    promotion.badge,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 9.5,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  width: 240,
                  child: Text(
                    promotion.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      height: 1.35,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                const SizedBox(height: 5),
                SizedBox(
                  width: 235,
                  child: Text(
                    promotion.subtitle,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 11,
                      height: 1.4,
                    ),
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

class _Dots extends StatelessWidget {
  const _Dots({required this.count, required this.index});

  final int count;
  final int index;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(count, (i) {
        final active = i == index;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          width: active ? 18 : 6,
          height: 6,
          margin: const EdgeInsets.symmetric(horizontal: 2.5),
          decoration: BoxDecoration(
            color: active ? AppColors.primary : AppColors.border,
            borderRadius: BorderRadius.circular(999),
          ),
        );
      }),
    );
  }
}
