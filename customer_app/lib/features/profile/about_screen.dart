import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/config/app_config.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/app_widgets.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: GreenAppBar(
        title: 'ກ່ຽວກັບພວກເຮົາ',
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
        ),
      ),
      body: AppPage(
        child: Column(
          children: [
            const SizedBox(height: 14),
            const AppLogo(size: 94, radius: 24),
            const SizedBox(height: 16),
            const Text(
              'SAIYFON INSURANCE DIGITAL',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w800,
                letterSpacing: 1.2,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'ເລື່ອງປະກັນໄພ ຄົບ ແລະ ຈົບຢູ່ບ່ອນດຽວ',
              style: TextStyle(fontSize: 12, color: AppColors.muted),
            ),
            const SizedBox(height: 24),
            AppCard(
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'ບໍລິສັດ ສາຍຝົນ ນາຍໜ້າປະກັນໄພ',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'ເປັນ One-Stop Insurance Platform ທີ່ເຕົ້າໂຮມບັນດາບໍລິສັດປະກັນໄພຊັ້ນນຳໃນ ສປປ ລາວ ໃຫ້ຜູ້ໃຊ້ສາມາດເລືອກ, ປຽບທຽບ, ຊື້ ແລະ ຈັດການປະກັນໄພໄດ້ໃນແອັບດຽວ.',
                    style: TextStyle(fontSize: 12.5, color: AppColors.muted, height: 1.75),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            AppCard(
              child: Column(
                children: const [
                  InfoRow(label: 'ເວີຊັນແອັບ', value: 'v${AppConfig.version}'),
                  Divider(),
                  InfoRow(label: 'ໂທລະສັບ', value: AppConfig.supportPhone),
                  Divider(),
                  InfoRow(label: 'ມືຖື', value: AppConfig.supportMobile),
                  Divider(),
                  InfoRow(label: 'ອີເມວ', value: 'support@saiyfon.com'),
                  Divider(),
                  InfoRow(label: 'ທີ່ຢູ່', value: 'ນະຄອນຫຼວງວຽງຈັນ, ສປປ ລາວ'),
                ],
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              '© 2026 @Sayfon insurance broker. All rights reserved.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 10, color: AppColors.hint),
            ),
          ],
        ),
      ),
    );
  }
}
