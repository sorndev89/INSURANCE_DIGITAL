import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../app/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../core/utils/validators.dart';
import '../../core/widgets/app_widgets.dart';
import '../../data/mock_data.dart';
import '../../data/models.dart';

class KycScreen extends ConsumerStatefulWidget {
  const KycScreen({super.key});

  @override
  ConsumerState<KycScreen> createState() => _KycScreenState();
}

class _KycScreenState extends ConsumerState<KycScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _firstName;
  late final TextEditingController _lastName;
  late final TextEditingController _dob;
  late final TextEditingController _address;
  late final TextEditingController _idNumber;
  late final TextEditingController _email;
  late final TextEditingController _occupation;
  String _gender = 'ຊາຍ';
  String _avatarPath = '';
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    final state = ref.read(authControllerProvider).value;
    final user = state?.pendingUser ?? state?.user ?? MockData.user;
    final names = user.name.split(' ');
    _firstName = TextEditingController(text: names.first);
    _lastName = TextEditingController(
      text: names.length > 1 ? names.sublist(1).join(' ') : '',
    );
    _dob = TextEditingController(text: user.dob);
    _address = TextEditingController(text: user.address);
    _idNumber = TextEditingController(text: user.idNumber);
    _email = TextEditingController(text: user.email);
    _occupation = TextEditingController(text: user.occupation);
    _gender = user.gender;
  }

  @override
  void dispose() {
    _firstName.dispose();
    _lastName.dispose();
    _dob.dispose();
    _address.dispose();
    _idNumber.dispose();
    _email.dispose();
    _occupation.dispose();
    super.dispose();
  }

  Future<void> _pickAvatar() async {
    final picked = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      imageQuality: 82,
    );
    if (picked != null && mounted) {
      setState(() => _avatarPath = picked.path);
    }
  }

  Future<void> _pickDate() async {
    final initial = DateTime.tryParse(
      _dob.text.split('/').reversed.join('-'),
    ) ??
        DateTime(2001, 8, 18);
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(1940),
      lastDate: DateTime.now(),
      helpText: 'ເລືອກວັນເດືອນປີເກີດ',
    );
    if (picked != null) {
      _dob.text = Fmt.date(picked);
    }
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    final state = ref.read(authControllerProvider).value;
    final base = state?.pendingUser ?? state?.user ?? MockData.user;
    final user = AppUser(
      id: base.id,
      name: '${_firstName.text.trim()} ${_lastName.text.trim()}'.trim(),
      email: _email.text.trim(),
      phone: base.phone,
      dob: _dob.text.isNotEmpty ? _dob.text : base.dob,
      gender: _gender,
      address: _address.text.trim(),
      idNumber: _idNumber.text.trim(),
      occupation: _occupation.text.trim(),
      avatar: _avatarPath,
      points: base.points,
    );
    setState(() => _submitting = true);
    await ref.read(authControllerProvider.notifier).completeRegistration(user);
    if (!mounted) return;
    setState(() => _submitting = false);
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
                Text('ລົງທະບຽນ', style: Theme.of(context).textTheme.headlineMedium),
                const SizedBox(height: 6),
                const Text(
                  'ຕື່ມຂໍ້ມູນສ່ວນຕົວເພື່ອຢືນຢັນຕົວຕົນ (KYC)',
                  style: TextStyle(fontSize: 13, color: AppColors.muted),
                ),
                const SizedBox(height: 20),
                Center(
                  child: Column(
                    children: [
                      Container(
                        width: 92,
                        height: 92,
                        decoration: BoxDecoration(
                          color: AppColors.accentSoft,
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.border, width: 2),
                        ),
                        child: Icon(
                          _avatarPath.isEmpty
                              ? Icons.person_rounded
                              : Icons.check_circle_rounded,
                          size: 44,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextButton.icon(
                        onPressed: _pickAvatar,
                        icon: const Icon(Icons.add_a_photo_outlined, size: 17),
                        label: const Text('ເພີ່ມຮູບໂປຣຟາຍ'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: AppTextField(
                        controller: _firstName,
                        label: 'ຊື່ແທ້',
                        hint: 'thadsaphone',
                        validator: (value) => Validators.required(value, 'ກະລຸນາປ້ອນຊື່'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: AppTextField(
                        controller: _lastName,
                        label: 'ນາມສະກຸນ',
                        hint: 'chanjalern',
                        validator: (value) => Validators.required(value, 'ກະລຸນາປ້ອນນາມສະກຸນ'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                AppTextField(
                  controller: _dob,
                  label: 'ວັນເດືອນປີເກີດ',
                  hint: 'ວວ/ດດ/ປປ',
                  prefixIcon: Icons.cake_outlined,
                  readOnly: true,
                  onTap: _pickDate,
                  validator: (value) => Validators.required(value, 'ກະລຸນາເລືອກວັນເດືອນປີເກີດ'),
                ),
                const SizedBox(height: 16),
                AppTextField(
                  controller: _address,
                  label: 'ທີ່ຢູ່ປະຈຸບັນ',
                  hint: 'ບ້ານ, ເມືອງ, ແຂວງ',
                  prefixIcon: Icons.location_on_outlined,
                  validator: (value) => Validators.required(value, 'ກະລຸນາປ້ອນທີ່ຢູ່'),
                ),
                const SizedBox(height: 16),
                AppTextField(
                  controller: _idNumber,
                  label: 'ໝາຍເລກ ID/Passport',
                  hint: '575158756',
                  prefixIcon: Icons.badge_outlined,
                  validator: (value) => Validators.required(value, 'ກະລຸນາປ້ອນໝາຍເລກ'),
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
                  controller: _occupation,
                  label: 'ອາຊີບ',
                  hint: 'student',
                  prefixIcon: Icons.work_outline_rounded,
                  validator: (value) => Validators.required(value, 'ກະລຸນາປ້ອນອາຊີບ'),
                ),
                const SizedBox(height: 28),
                PrimaryButton(
                  label: 'ສະໝັກ',
                  loading: _submitting,
                  onPressed: _submit,
                ),
                const SizedBox(height: 14),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
