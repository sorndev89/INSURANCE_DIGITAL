import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/config/app_config.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/app_widgets.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 32, 24, 28),
          child: Column(
            children: [
              const Spacer(flex: 2),
              const AppLogo(size: 132, radius: 34),
              const SizedBox(height: 28),
              Text(
                'ຍິນດີຕ້ອນຮັບ!',
                style: Theme.of(context).textTheme.headlineLarge,
              ),
              const SizedBox(height: 12),
              const Text(
                AppConfig.appName,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.6,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 14),
              const Text(
                AppConfig.slogan,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.muted,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const Spacer(flex: 3),
              OutlinedButton(
                onPressed: () => context.go('/onboarding'),
                child: const Text('ເລີ່ມຕົ້ນ'),
              ),
              const SizedBox(height: 10),
              const Text(
                'ເລື່ອງປະກັນໄພ ຄົບ ແລະ ຈົບຢູ່ບ່ອນດຽວ',
                style: TextStyle(fontSize: 11, color: AppColors.hint),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
