import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/utils/validators.dart';
import '../../core/widgets/app_widgets.dart';

class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _oldPassword = TextEditingController();
  final _newPassword = TextEditingController();
  final _confirmPassword = TextEditingController();
  int _step = 1;
  bool _obscureOld = true;
  bool _obscureNew = true;
  bool _obscureConfirm = true;

  @override
  void dispose() {
    _oldPassword.dispose();
    _newPassword.dispose();
    _confirmPassword.dispose();
    super.dispose();
  }

  void _next() {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() => _step = 2);
  }

  Future<void> _finish() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        icon: const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 48),
        title: const Text('ປ່ຽນລະຫັດຜ່ານສຳເລັດ'),
        content: const Text('ລະຫັດຜ່ານໃໝ່ຂອງທ່ານຖືກບັນທຶກແລ້ວ'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('ຕົກລົງ'),
          ),
        ],
      ),
    );
    if (mounted) context.pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: GreenAppBar(
        title: 'ປ່ຽນລະຫັດຜ່ານ',
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
                Row(
                  children: [
                    _StageBadge(index: 1, active: _step == 1, label: 'ລະຫັດເກົ່າ'),
                    Expanded(
                      child: Container(
                        height: 2,
                        margin: const EdgeInsets.symmetric(horizontal: 8),
                        color: _step == 2 ? AppColors.primary : AppColors.border,
                      ),
                    ),
                    _StageBadge(index: 2, active: _step == 2, label: 'ລະຫັດໃໝ່'),
                  ],
                ),
                const SizedBox(height: 28),
                if (_step == 1) ...[
                  Text(
                    'ຂັ້ນຕອນທີ 1',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'ປ້ອນລະຫັດຜ່ານເກົ່າເພື່ອຢືນຢັນຕົວຕົນ',
                    style: TextStyle(fontSize: 12.5, color: AppColors.muted),
                  ),
                  const SizedBox(height: 22),
                  AppTextField(
                    controller: _oldPassword,
                    label: 'ລະຫັດຜ່ານເກົ່າ',
                    hint: '••••••••',
                    prefixIcon: Icons.lock_outline_rounded,
                    obscure: _obscureOld,
                    validator: (value) => Validators.password(value),
                    suffix: IconButton(
                      onPressed: () => setState(() => _obscureOld = !_obscureOld),
                      icon: Icon(
                        _obscureOld ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                        size: 20,
                      ),
                    ),
                  ),
                  const SizedBox(height: 26),
                  PrimaryButton(label: 'ໄປຕໍ່', onPressed: _next),
                ] else ...[
                  Text(
                    'ຂັ້ນຕອນທີ 2',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'ສ້າງລະຫັດຜ່ານໃໝ່ ແລະ ຢືນຢັນ',
                    style: TextStyle(fontSize: 12.5, color: AppColors.muted),
                  ),
                  const SizedBox(height: 22),
                  AppTextField(
                    controller: _newPassword,
                    label: 'ລະຫັດຜ່ານໃໝ່',
                    hint: '••••••••',
                    prefixIcon: Icons.lock_reset_rounded,
                    obscure: _obscureNew,
                    validator: (value) => Validators.password(value, strong: true),
                    suffix: IconButton(
                      onPressed: () => setState(() => _obscureNew = !_obscureNew),
                      icon: Icon(
                        _obscureNew ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                        size: 20,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  AppTextField(
                    controller: _confirmPassword,
                    label: 'ຢືນຢັນລະຫັດຜ່ານ',
                    hint: '••••••••',
                    prefixIcon: Icons.lock_outline_rounded,
                    obscure: _obscureConfirm,
                    validator: (value) => Validators.confirmPassword(value, _newPassword.text),
                    suffix: IconButton(
                      onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
                      icon: Icon(
                        _obscureConfirm ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                        size: 20,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  AppCard(
                    color: AppColors.background,
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'ໝາຍເຫດແນະນຳ',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
                        ),
                        SizedBox(height: 8),
                        _Rule(text: 'ຕ້ອງມີຕົວອັກສອນໃຫຍ່ ແລະ ນ້ອຍ'),
                        _Rule(text: 'ຕ້ອງມີຕົວເລກຢ່າງໜ້ອຍໜຶ່ງໂຕຂຶ້ນໄປ'),
                        _Rule(text: 'ຕ້ອງມີລະຫັດ 8 ໂຕຂຶ້ນໄປ'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  PrimaryButton(label: 'ຕົກລົງ', onPressed: _finish),
                  const SizedBox(height: 8),
                  TextButton(
                    onPressed: () => setState(() => _step = 1),
                    child: const Text('ກັບຄືນ'),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _StageBadge extends StatelessWidget {
  const _StageBadge({required this.index, required this.active, required this.label});

  final int index;
  final bool active;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            color: active ? AppColors.primary : AppColors.accentSoft,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              '$index',
              style: TextStyle(
                fontSize: 10.5,
                fontWeight: FontWeight.w800,
                color: active ? Colors.white : AppColors.primary,
              ),
            ),
          ),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: TextStyle(
            fontSize: 10.5,
            fontWeight: FontWeight.w700,
            color: active ? AppColors.primary : AppColors.muted,
          ),
        ),
      ],
    );
  }
}

class _Rule extends StatelessWidget {
  const _Rule({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          const Icon(Icons.check_circle_outline_rounded, size: 13, color: AppColors.primary),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 11, color: AppColors.muted),
            ),
          ),
        ],
      ),
    );
  }
}
