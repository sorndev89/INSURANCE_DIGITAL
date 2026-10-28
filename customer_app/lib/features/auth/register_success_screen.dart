import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/widgets/app_widgets.dart';

class RegisterSuccessScreen extends StatelessWidget {
  const RegisterSuccessScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Spacer(),
              Container(
                width: 104,
                height: 104,
                decoration: const BoxDecoration(
                  color: AppColors.successSoft,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_rounded,
                  size: 58,
                  color: AppColors.success,
                ),
              ),
              const SizedBox(height: 26),
              Text(
                'ຢືນຢັນການສ້າງບັນຊີ',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 10),
              const Text(
                'ບັນຊີຂອງທ່ານຖືກຢືນຢັນສຳເລັດແລ້ວ\nກະລຸນາຕື່ມຂໍ້ມູນສ່ວນຕົວເພື່ອສຳເລັດການລົງທະບຽນ',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13.5, color: AppColors.muted, height: 1.65),
              ),
              const Spacer(),
              PrimaryButton(
                label: 'ຢືນຢັນ',
                onPressed: () => context.push('/kyc'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
