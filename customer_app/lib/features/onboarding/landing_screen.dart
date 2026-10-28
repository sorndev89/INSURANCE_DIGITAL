import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/config/app_config.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/app_widgets.dart';

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 26),
          child: Column(
            children: [
              const Spacer(flex: 2),
              const AppLogo(size: 150, radius: 38),
              const SizedBox(height: 34),
              Text(
                'ເລື່ອງປະກັນໄພ',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                  fontSize: 32,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'ຄົບ ແລະ ຈົບຢູ່ບ່ອນດຽວ',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                  fontSize: 32,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'ເລືອກ, ປຽບທຽບ ແລະ ຊື້ປະກັນໄພ\nຈາກບໍລິສັດຊັ້ນນຳໃນ ສປປ ລາວ',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13.5, color: AppColors.muted, height: 1.6),
              ),
              const Spacer(flex: 3),
              PrimaryButton(
                label: 'ເຂົ້າສູ່ລະບົບ',
                icon: Icons.login_rounded,
                onPressed: () => context.push('/login'),
              ),
              const SizedBox(height: 12),
              SecondaryButton(
                label: 'ສ້າງບັນຊີໃໝ່',
                icon: Icons.person_add_alt_1_rounded,
                dark: true,
                onPressed: () => context.push('/register'),
              ),
              const SizedBox(height: 20),
              const Text(
                'Version ${AppConfig.version} · @Sayfon insurance broker',
                style: TextStyle(fontSize: 10.5, color: AppColors.hint),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
