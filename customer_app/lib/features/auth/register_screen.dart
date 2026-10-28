import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/validators.dart';
import '../../core/widgets/app_widgets.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _phone = TextEditingController();
  bool _obscure = true;
  bool _agreed = false;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    _phone.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    if (!_agreed) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('ກະລຸນາຍອມຮັບເງື່ອນໄຂ ແລະ ຂໍ້ກຳນົດ')),
      );
      return;
    }
    FocusScope.of(context).unfocus();
    await ref.read(authControllerProvider.notifier).register(
      name: _name.text.trim(),
      email: _email.text.trim(),
      password: _password.text,
      phone: _phone.text.trim(),
    );
    if (!mounted) return;
    final auth = ref.read(authControllerProvider);
    if (auth.hasError) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${auth.error}')),
      );
      return;
    }
    context.push('/otp');
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
                Text('ສ້າງບັນຊີໃໝ່', style: Theme.of(context).textTheme.headlineMedium),
                const SizedBox(height: 6),
                const Text(
                  'ເລີ່ມຕົ້ນໃຊ້ບໍລິການປະກັນໄພຄົບວົງຈອນ',
                  style: TextStyle(fontSize: 13, color: AppColors.muted),
                ),
                const SizedBox(height: 26),
                AppTextField(
                  controller: _name,
                  label: 'ຊື່ ແລະ ນາມສະກຸນ',
                  hint: 'ຊື່ ແລະ ນາມສະກຸນ',
                  prefixIcon: Icons.person_outline_rounded,
                  validator: (value) => Validators.required(value, 'ກະລຸນາປ້ອນຊື່ ແລະ ນາມສະກຸນ'),
                ),
                const SizedBox(height: 16),
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
                  hint: 'ຢ່າງໜ້ອຍ 6 ໂຕ',
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
                const SizedBox(height: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'ເບີໂທລະສັບ',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.muted,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 7),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          height: 54,
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          decoration: BoxDecoration(
                            color: AppColors.mint,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Row(
                            children: [
                              Image.asset('assets/icons/laos.png', width: 22),
                              const SizedBox(width: 8),
                              const Text(
                                '+856',
                                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextFormField(
                            controller: _phone,
                            keyboardType: TextInputType.phone,
                            validator: Validators.phone,
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                            decoration: const InputDecoration(hintText: '20 77643515'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                GestureDetector(
                  onTap: () => setState(() => _agreed = !_agreed),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        width: 24,
                        height: 24,
                        child: Checkbox(
                          value: _agreed,
                          onChanged: (value) => setState(() => _agreed = value ?? false),
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          activeColor: AppColors.primary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(5),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      const Expanded(
                        child: Text(
                          'ຂ້ອຍຍອມຮັບເງື່ອນໄຂ ແລະ ຂໍ້ກຳນົດຂອງການໃຊ້ບໍລິການ',
                          style: TextStyle(fontSize: 12.5, color: AppColors.muted, height: 1.5),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 26),
                PrimaryButton(
                  label: 'ລົງຊື່ເຂົ້າໃຊ້',
                  loading: auth.isLoading,
                  onPressed: _submit,
                ),
                const SizedBox(height: 12),
                Center(
                  child: TextButton(
                    onPressed: () => context.push('/login'),
                    child: const Text('ທ່ານມີບັນຊີແລ້ວ? ເຂົ້າສູ່ລະບົບ'),
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
