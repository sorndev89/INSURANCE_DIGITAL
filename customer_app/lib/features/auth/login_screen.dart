import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/validators.dart';
import '../../core/widgets/app_widgets.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    FocusScope.of(context).unfocus();
    await ref.read(authControllerProvider.notifier).login(
      _email.text.trim(),
      _password.text,
    );
    if (!mounted) return;
    final auth = ref.read(authControllerProvider);
    if (auth.hasError) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${auth.error}')),
      );
      return;
    }
    context.go('/home');
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);
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
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 8),
                Text('ເຂົ້າສູ່ລະບົບ', style: Theme.of(context).textTheme.headlineMedium),
                const SizedBox(height: 6),
                const Text(
                  'ຍິນດີຕ້ອນຮັບກັບຄືນ ເຂົ້າສູ່ບັນຊີຂອງທ່ານ',
                  style: TextStyle(fontSize: 13, color: AppColors.muted),
                ),
                const SizedBox(height: 28),
                AppTextField(
                  controller: _email,
                  label: 'Email',
                  hint: 'banktsp9900.t@gmail.com',
                  prefixIcon: Icons.mail_outline_rounded,
                  keyboardType: TextInputType.emailAddress,
                  validator: Validators.email,
                ),
                const SizedBox(height: 16),
                AppTextField(
                  controller: _password,
                  label: 'ລະຫັດຜ່ານ',
                  hint: '••••••••••••',
                  prefixIcon: Icons.lock_outline_rounded,
                  obscure: _obscure,
                  validator: (value) => Validators.password(value),
                  suffix: IconButton(
                    onPressed: () => setState(() => _obscure = !_obscure),
                    icon: Icon(
                      _obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                      size: 20,
                    ),
                  ),
                ),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () => context.push('/forgot-password'),
                    child: const Text('ລືມລະຫັດຜ່ານ?'),
                  ),
                ),
                const SizedBox(height: 10),
                PrimaryButton(
                  label: 'ເຂົ້າສູ່ລະບົບ',
                  loading: auth.isLoading,
                  onPressed: _submit,
                ),
                const SizedBox(height: 24),
                AppCard(
                  color: AppColors.mint,
                  borderColor: const Color(0xFFCDEBD8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: const [
                          Icon(Icons.info_outline_rounded, size: 18, color: AppColors.primary),
                          SizedBox(width: 8),
                          Text(
                            'ບັນຊີທົດລອງ',
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                              color: AppColors.primary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'customer@saiyfon.com  ·  Demo@1234\nຫຼື ໃຊ້ອີເມວໃດກໍ່ໄດ້ ກັບລະຫັດຜ່ານ 6 ໂຕຂຶ້ນໄປ',
                        style: TextStyle(fontSize: 12, color: AppColors.muted, height: 1.6),
                      ),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: () {
                          _email.text = 'customer@saiyfon.com';
                          _password.text = 'Demo@1234';
                        },
                        style: TextButton.styleFrom(
                          padding: EdgeInsets.zero,
                          minimumSize: const Size(0, 28),
                        ),
                        child: const Text('ໃຊ້ບັນຊີທົດລອງ', style: TextStyle(fontSize: 12)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 28),
                Center(
                  child: TextButton(
                    onPressed: () => context.push('/register'),
                    child: const Text('ຍັງບໍ່ມີບັນຊີ? ສ້າງບັນຊີໃໝ່'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
