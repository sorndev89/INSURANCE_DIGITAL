import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/validators.dart';
import '../../core/widgets/app_widgets.dart';
import '../../data/models.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _firstName;
  late final TextEditingController _lastName;
  late final TextEditingController _phone;
  String _gender = 'ຊາຍ';
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authControllerProvider).value?.user ?? const AppUser();
    final parts = user.name.split(' ');
    _firstName = TextEditingController(text: parts.first);
    _lastName = TextEditingController(
      text: parts.length > 1 ? parts.sublist(1).join(' ') : '',
    );
    _phone = TextEditingController(text: user.phone);
    _gender = user.gender;
  }

  @override
  void dispose() {
    _firstName.dispose();
    _lastName.dispose();
    _phone.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() => _saving = true);
    await ref.read(authControllerProvider.notifier).updateProfile({
      'name': '${_firstName.text.trim()} ${_lastName.text.trim()}'.trim(),
      'phone': _phone.text.trim(),
      'gender': _gender,
    });
    if (!mounted) return;
    setState(() => _saving = false);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('ບັນທຶກຂໍ້ມູນສຳເລັດ')),
    );
    context.pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: GreenAppBar(
        title: 'ແກ້ໄຂຂໍ້ມູນສ່ວນຕົວ',
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.close_rounded, color: Colors.white),
        ),
      ),
      body: SafeArea(
        child: AppPage(
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                const SizedBox(height: 6),
                Container(
                  width: 96,
                  height: 96,
                  decoration: BoxDecoration(
                    color: AppColors.accentSoft,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.border, width: 2),
                  ),
                  child: const Icon(Icons.person_rounded, size: 48, color: AppColors.primary),
                ),
                const SizedBox(height: 8),
                TextButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('ເລືອກຮູບພາບຈາກອຸປະກອນ (Demo)')),
                    );
                  },
                  icon: const Icon(Icons.upload_outlined, size: 17),
                  label: const Text('ອັບໂຫຼດຮູບພາບ'),
                ),
                const SizedBox(height: 18),
                AppTextField(
                  controller: _firstName,
                  label: 'ຊື່ແທ້',
                  prefixIcon: Icons.person_outline_rounded,
                  validator: (value) => Validators.required(value, 'ກະລຸນາປ້ອນຊື່'),
                ),
                const SizedBox(height: 16),
                AppTextField(
                  controller: _lastName,
                  label: 'ນາມສະກຸນ',
                  prefixIcon: Icons.person_outline_rounded,
                  validator: (value) => Validators.required(value, 'ກະລຸນາປ້ອນນາມສະກຸນ'),
                ),
                const SizedBox(height: 16),
                AppTextField(
                  controller: _phone,
                  label: 'ເບີໂທລະສັບ',
                  prefixIcon: Icons.phone_outlined,
                  keyboardType: TextInputType.phone,
                  validator: Validators.phone,
                ),
                const SizedBox(height: 16),
                AppDropdownField<String>(
                  label: 'ເພດ',
                  value: _gender,
                  items: const [
                    DropdownMenuItem(value: 'ຊາຍ', child: Text('ຊາຍ')),
                    DropdownMenuItem(value: 'ຍິງ', child: Text('ຍິງ')),
                  ],
                  onChanged: (value) => setState(() => _gender = value ?? 'ຊາຍ'),
                ),
                const SizedBox(height: 26),
                PrimaryButton(
                  label: 'ບັນທຶກ',
                  loading: _saving,
                  onPressed: _save,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
