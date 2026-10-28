import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/app_widgets.dart';

class LanguageScreen extends ConsumerStatefulWidget {
  const LanguageScreen({super.key});

  @override
  ConsumerState<LanguageScreen> createState() => _LanguageScreenState();
}

class _LanguageScreenState extends ConsumerState<LanguageScreen> {
  late String _selected;

  @override
  void initState() {
    super.initState();
    _selected = ref.read(localeProvider).languageCode;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: GreenAppBar(
        title: 'ເລືອກພາສາ',
        actions: [
          TextButton(
            onPressed: () async {
              final messenger = ScaffoldMessenger.of(context);
              final router = GoRouter.of(context);
              await ref.read(localeProvider.notifier).setLocale(_selected);
              messenger.showSnackBar(
                const SnackBar(content: Text('ປ່ຽນພາສາສຳເລັດ')),
              );
              router.pop();
            },
            child: const Text(
              'ຕົກລົງ',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
      body: AppPage(
        child: Column(
          children: [
            _LanguageTile(
              flag: 'assets/icons/laos.png',
              title: 'ພາສາລາວ',
              subtitle: 'Lao',
              selected: _selected == 'lo',
              onTap: () => setState(() => _selected = 'lo'),
            ),
            const SizedBox(height: 12),
            _LanguageTile(
              flag: 'assets/icons/england.png',
              title: 'ພາສາອັງກິດ',
              subtitle: 'English (UK)',
              selected: _selected == 'en',
              onTap: () => setState(() => _selected = 'en'),
            ),
            const SizedBox(height: 18),
            const Text(
              'ພາສາລາວເປັນພາສາຫຼັກຂອງແອັບ. ການປ່ຽນພາສາຈະມີຜົນກັບບາງສ່ວນຂອງແອັບ.',
              style: TextStyle(fontSize: 11.5, color: AppColors.muted, height: 1.6),
            ),
          ],
        ),
      ),
    );
  }
}

class _LanguageTile extends StatelessWidget {
  const _LanguageTile({
    required this.flag,
    required this.title,
    required this.subtitle,
    required this.selected,
    required this.onTap,
  });

  final String flag;
  final String title;
  final String subtitle;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      borderColor: selected ? AppColors.primary : AppColors.border,
      child: Row(
        children: [
          Image.asset(flag, width: 34, height: 24, fit: BoxFit.cover),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 2),
                Text(subtitle, style: const TextStyle(fontSize: 10.5, color: AppColors.muted)),
              ],
            ),
          ),
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
    );
  }
}
