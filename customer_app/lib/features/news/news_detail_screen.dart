import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/app_widgets.dart';

class NewsDetailScreen extends ConsumerWidget {
  const NewsDetailScreen({super.key, required this.id});

  final String id;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final article = ref
        .watch(newsProvider)
        .where((item) => item.id == id)
        .firstOrNull;

    if (article == null) {
      return Scaffold(
        appBar: const GreenAppBar(title: 'ລາຍລະອຽດ'),
        body: const EmptyState(title: 'ບໍ່ພົບຂ່າວສານ'),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: GreenAppBar(
        title: 'ລາຍລະອຽດ',
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: Colors.white),
        ),
      ),
      body: ListView(
        children: [
          Image.asset(
            article.image,
            height: 230,
            width: double.infinity,
            fit: BoxFit.cover,
            errorBuilder: (_, _, _) => Container(
              height: 230,
              color: AppColors.accentSoft,
              child: const Icon(Icons.image_outlined, size: 48, color: AppColors.primary),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  article.title,
                  style: const TextStyle(
                    fontSize: 21,
                    fontWeight: FontWeight.w800,
                    height: 1.45,
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    CircleAvatar(
                      radius: 13,
                      backgroundColor: AppColors.accentSoft,
                      child: ClipOval(
                        child: Image.asset(
                          article.logo,
                          width: 26,
                          height: 26,
                          fit: BoxFit.cover,
                          errorBuilder: (_, _, _) => const Icon(
                            Icons.business_rounded,
                            size: 14,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 7),
                    Text(
                      'Allianz Laos',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text('·', style: TextStyle(color: AppColors.hint)),
                    const SizedBox(width: 8),
                    Text(
                      Fmt.dateTime(article.date),
                      style: const TextStyle(fontSize: 10.5, color: AppColors.hint),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                Text(
                  article.body,
                  style: const TextStyle(fontSize: 14, height: 1.8, color: AppColors.text),
                ),
                if (article.id == 'home-insurance') ...[
                  const SizedBox(height: 20),
                  const Text(
                    'ລາຍການຄຸ້ມກັນ',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 10),
                  for (final item in const [
                    'ອັກຄີໄພ',
                    'ຄວາມເສຍຫາຍຍ້ອນນ້ຳ-ລົມພາຍຸ',
                    'ແກ້ວແວ່ນແຕກ',
                    'ຄວາມເສຍຫາຍຂອງເຄື່ອງໃຊ້ໄຟຟ້າ',
                    'ເຄື່ອງໃນອາຄານຖືກລັກ',
                    'ຄວາມຮັບຜິດຊອບຕໍ່ກັບເຮືອນຂ້າງຄຽງ',
                    'ຄວາມຮັບຜິດຊອບຂອງຫົວໜ້າຄອບຄົວ',
                  ])
                    Padding(
                      padding: const EdgeInsets.only(bottom: 7),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.check_circle_rounded,
                            size: 16,
                            color: AppColors.success,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              item,
                              style: const TextStyle(fontSize: 13, height: 1.5),
                            ),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      'ໝາຍເຫດ: ເງື່ອນໄຂ ແລະ ຂອບເຂດຄຸ້ມຄອງ ເປັນໄປຕາມທີ່ກຳນົດໄວ້ໃນສັນຍາປະກັນໄພ ແລະ ເອກະສານທີ່ກ່ຽວຂ້ອງ.',
                      style: TextStyle(fontSize: 11, color: AppColors.muted, height: 1.6),
                    ),
                  ),
                ],
                const SizedBox(height: 18),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final tag in article.tags)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.accentSoft,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          tag,
                          style: const TextStyle(
                            fontSize: 10.5,
                            color: AppColors.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 22),
                PrimaryButton(
                  label: 'ສົນໃຈປະກັນໄພນີ້',
                  onPressed: () => context.push('/purchase/category'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
