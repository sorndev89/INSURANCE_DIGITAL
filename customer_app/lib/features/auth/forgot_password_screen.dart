import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/utils/validators.dart';
import '../../core/widgets/app_widgets.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  bool _sent = false;

  @override
  void dispose() {
    _email.dispose();
    super.dispose();
  }

  void _submit() {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() => _sent = true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.text,
        elevation: 0,
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
        ),
      ),
      body: SafeArea(
        child: AppPage(
          child: _sent
              ? Column(
                  children: [
                    const SizedBox(height: 60),
                    Container(
                      width: 84,
                      height: 84,
                      decoration: const BoxDecoration(
                        color: AppColors.successSoft,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.mark_email_read_outlined,
                        size: 42,
                        color: AppColors.success,
                      ),
                    ),
                    const SizedBox(height: 22),
                    Text('ກວດສອບອີເມວຂອງທ່ານ', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 8),
                    Text(
                      'ພວກເຮົາໄດ້ສົ່ງລິ້ງສຳລັບສ້າງລະຫັດຜ່ານໃໝ່ໄປທີ່\n${_email.text.trim()}',
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 13, color: AppColors.muted, height: 1.6),
                    ),
                    const SizedBox(height: 28),
                    PrimaryButton(
                      label: 'ກັບໄປເຂົ້າສູ່ລະບົບ',
                      onPressed: () => context.go('/login'),
                    ),
                  ],
                )
              : Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('ລືມລະຫັດຜ່ານ', style: Theme.of(context).textTheme.headlineMedium),
                      const SizedBox(height: 10),
                      const Text(
                        'ກະລຸນາ, ໃສ່ບັນຊີ Email. ທ່ານຈະໄດ້ຮັບລິ້ງເພື່ອສ້າງລະຫັດຜ່ານໃໝ່ຜ່ານທາງ email.',
                        style: TextStyle(fontSize: 13.5, color: AppColors.muted, height: 1.65),
                      ),
                      const SizedBox(height: 26),
                      AppTextField(
                        controller: _email,
                        label: 'Email',
                        hint: 'banktsp9900.t@gmail.com',
                        prefixIcon: Icons.mail_outline_rounded,
                        keyboardType: TextInputType.emailAddress,
                        validator: Validators.email,
                        suffix: IconButton(
                          onPressed: _email.clear,
                          icon: const Icon(Icons.close_rounded, size: 20),
                        ),
                      ),
                      const SizedBox(height: 22),
                      PrimaryButton(label: 'ສົ່ງ', onPressed: _submit),
                    ],
                  ),
                ),
        ),
      ),
    );
  }
}
