import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/validators.dart';
import '../../core/widgets/app_widgets.dart';

class AgentFormScreen extends ConsumerStatefulWidget {
  const AgentFormScreen({super.key});

  @override
  ConsumerState<AgentFormScreen> createState() => _AgentFormScreenState();
}

class _AgentFormScreenState extends ConsumerState<AgentFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name;
  late final TextEditingController _phone;
  late final TextEditingController _email;
  late final TextEditingController _experience;
  late final TextEditingController _motivation;
  String _province = 'ນະຄອນຫຼວງວຽງຈັນ';
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authControllerProvider).value?.user;
    _name = TextEditingController(text: user?.name ?? '');
    _phone = TextEditingController(text: user?.phone ?? '');
    _email = TextEditingController(text: user?.email ?? '');
    _experience = TextEditingController();
    _motivation = TextEditingController();
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _email.dispose();
    _experience.dispose();
    _motivation.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() => _submitting = true);
    await Future<void>.delayed(const Duration(milliseconds: 900));
    if (!mounted) return;
    setState(() => _submitting = false);
    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        icon: const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 48),
        title: const Text('ສົ່ງໃບສະໝັກສຳເລັດ'),
        content: const Text(
          'ທີມງານສາຍຝົນຈະຕິດຕໍ່ກັບທ່ານພາຍໃນ 2 ວັນເຮັດວຽກ.',
          textAlign: TextAlign.center,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('ຕົກລົງ'),
          ),
        ],
      ),
    );
    if (mounted) context.go('/profile');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: GreenAppBar(
        title: 'ແບບຟອມສະໝັກ',
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
                const Text(
                  'ຂໍ້ມູນຜູ້ສະໝັກ',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 5),
                const Text(
                  'ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຄົບຖ້ວນເພື່ອປະເມີນໃບສະໝັກ',
                  style: TextStyle(fontSize: 11.5, color: AppColors.muted),
                ),
                const SizedBox(height: 20),
                AppTextField(
                  controller: _name,
                  label: 'ຊື່ ແລະ ນາມສະກຸນ',
                  prefixIcon: Icons.person_outline_rounded,
                  validator: (value) => Validators.required(value, 'ກະລຸນາປ້ອນຊື່'),
                ),
                const SizedBox(height: 14),
                AppTextField(
                  controller: _phone,
                  label: 'ເບີໂທລະສັບ',
                  prefixIcon: Icons.phone_outlined,
                  keyboardType: TextInputType.phone,
                  validator: Validators.phone,
                ),
                const SizedBox(height: 14),
                AppTextField(
                  controller: _email,
                  label: 'Email',
                  prefixIcon: Icons.mail_outline_rounded,
                  keyboardType: TextInputType.emailAddress,
                  validator: Validators.email,
                ),
                const SizedBox(height: 14),
                AppDropdownField<String>(
                  label: 'ແຂວງທີ່ປະຕິບັດງານ',
                  value: _province,
                  items: const [
                    DropdownMenuItem(value: 'ນະຄອນຫຼວງວຽງຈັນ', child: Text('ນະຄອນຫຼວງວຽງຈັນ')),
                    DropdownMenuItem(value: 'ຫຼວງພະບາງ', child: Text('ຫຼວງພະບາງ')),
                    DropdownMenuItem(value: 'ສະຫວັນນະເຂດ', child: Text('ສະຫວັນນະເຂດ')),
                    DropdownMenuItem(value: 'ຈຳປາສັກ', child: Text('ຈຳປາສັກ')),
                    DropdownMenuItem(value: 'ອື່ນໆ', child: Text('ອື່ນໆ')),
                  ],
                  onChanged: (value) => setState(() => _province = value ?? _province),
                ),
                const SizedBox(height: 14),
                AppTextField(
                  controller: _experience,
                  label: 'ປະສົບການດ້ານປະກັນໄພ / ການຂາຍ',
                  hint: 'ເຊັ່ນ: 2 ປີ ໃນການຂາຍປະກັນໄພ',
                  prefixIcon: Icons.workspace_premium_outlined,
                  maxLines: 2,
                  validator: (value) => Validators.required(value, 'ກະລຸນາປ້ອນປະສົບການ'),
                ),
                const SizedBox(height: 14),
                AppTextField(
                  controller: _motivation,
                  label: 'ເຫດຜົນທີ່ຕ້ອງການເປັນຕົວແທນ',
                  hint: 'ເຫດຜົນ ແລະ ເປົ້າໝາຍຂອງທ່ານ',
                  prefixIcon: Icons.flag_outlined,
                  maxLines: 3,
                  validator: (value) => Validators.required(value, 'ກະລຸນາປ້ອນເຫດຜົນ'),
                ),
                const SizedBox(height: 22),
                PrimaryButton(
                  label: 'ສົ່ງໃບສະໝັກ',
                  loading: _submitting,
                  onPressed: _submit,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
