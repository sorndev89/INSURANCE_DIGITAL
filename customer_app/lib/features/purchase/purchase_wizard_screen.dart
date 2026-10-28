import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/providers.dart';
import '../../core/config/app_config.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../core/utils/validators.dart';
import '../../core/widgets/app_widgets.dart';
import '../../data/mock_data.dart';
import '../../data/models.dart';
import '../../data/repositories.dart';

class PurchaseWizardScreen extends ConsumerStatefulWidget {
  const PurchaseWizardScreen({super.key});

  @override
  ConsumerState<PurchaseWizardScreen> createState() => _PurchaseWizardScreenState();
}

class _PurchaseWizardScreenState extends ConsumerState<PurchaseWizardScreen> {
  int _step = 1;
  final _stepOneKey = GlobalKey<FormState>();
  final _stepTwoKey = GlobalKey<FormState>();

  late final TextEditingController _name;
  late final TextEditingController _phone;
  late final TextEditingController _address;
  late final TextEditingController _dob;
  late final TextEditingController _docNumber;
  late final TextEditingController _brand;
  late final TextEditingController _model;
  late final TextEditingController _plate;
  late final TextEditingController _engine;
  late final TextEditingController _chassis;
  late final TextEditingController _propertyAddress;
  late final TextEditingController _propertyValue;

  String _gender = 'ຊາຍ';
  String _documentType = 'ບັດປະຈຳໂຕ';
  String _vehicleUsage = 'ສ່ວນຕົວ';
  String _capacity = '1,500 - 2,000 CC';
  String _healthMembers = '1';
  bool _idUploaded = false;
  bool _bookUploaded = false;
  bool _paying = false;
  Policy? _policy;

  late DateTime _startDate;
  late DateTime _endDate;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authControllerProvider).value?.user ?? const AppUser();
    final draft = ref.read(purchaseDraftProvider);
    _name = TextEditingController(text: draft.insuredName.isEmpty ? user.name : draft.insuredName);
    _phone = TextEditingController(text: draft.phone.isEmpty ? user.phone : draft.phone);
    _address = TextEditingController(text: draft.address.isEmpty ? user.address : draft.address);
    _dob = TextEditingController(text: draft.dob.isEmpty ? user.dob : draft.dob);
    _docNumber = TextEditingController(text: draft.documentNumber);
    _brand = TextEditingController(text: draft.vehicleBrand);
    _model = TextEditingController(text: draft.vehicleModel);
    _plate = TextEditingController(text: draft.plateNumber);
    _engine = TextEditingController(text: draft.engineNumber);
    _chassis = TextEditingController(text: draft.chassisNumber);
    _propertyAddress = TextEditingController(text: draft.propertyAddress);
    _propertyValue = TextEditingController(text: draft.propertyValue);
    _gender = draft.gender;
    _documentType = draft.documentType;
    _healthMembers = draft.healthMembers;
    _startDate = DateTime.now();
    _endDate = DateTime(_startDate.year + 1, _startDate.month, _startDate.day, 23, 59);
    if (draft.plan == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final plans = MockData.plansFor(draft.category);
        if (plans.isNotEmpty) {
          ref.read(purchaseDraftProvider.notifier).setPlan(plans.first);
        }
      });
    }
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _address.dispose();
    _dob.dispose();
    _docNumber.dispose();
    _brand.dispose();
    _model.dispose();
    _plate.dispose();
    _engine.dispose();
    _chassis.dispose();
    _propertyAddress.dispose();
    _propertyValue.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final initial = DateTime.tryParse(_dob.text.split('/').reversed.join('-')) ??
        DateTime(2001, 1, 1);
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(1940),
      lastDate: DateTime.now(),
      helpText: 'ເລືອກວັນເດືອນປີເກີດ',
    );
    if (picked != null) _dob.text = Fmt.date(picked);
  }

  void _saveStepOne() {
    ref.read(purchaseDraftProvider.notifier).patch(
      insuredName: _name.text.trim(),
      phone: _phone.text.trim(),
      address: _address.text.trim(),
      dob: _dob.text,
      gender: _gender,
      documentType: _documentType,
      documentNumber: _docNumber.text.trim(),
      idCardUploaded: _idUploaded,
    );
  }

  void _saveStepTwo() {
    ref.read(purchaseDraftProvider.notifier).patch(
      vehicleUsage: _vehicleUsage,
      vehicleBrand: _brand.text.trim(),
      vehicleModel: _model.text.trim(),
      plateNumber: _plate.text.trim(),
      engineNumber: _engine.text.trim(),
      chassisNumber: _chassis.text.trim(),
      capacity: _capacity,
      vehicleBookUploaded: _bookUploaded,
      propertyAddress: _propertyAddress.text.trim(),
      propertyValue: _propertyValue.text.trim(),
      healthMembers: _healthMembers,
    );
  }

  Future<void> _next() async {
    FocusScope.of(context).unfocus();
    if (_step == 1) {
      if (!(_stepOneKey.currentState?.validate() ?? false)) return;
      _saveStepOne();
      setState(() => _step = 2);
      return;
    }
    if (_step == 2) {
      if (!(_stepTwoKey.currentState?.validate() ?? false)) return;
      _saveStepTwo();
      setState(() => _step = 3);
      return;
    }
    if (_step == 3) {
      setState(() => _step = 4);
      return;
    }
    if (_step == 4) {
      await _pay();
      return;
    }
    context.go('/home');
  }

  void _back() {
    if (_step > 1) {
      setState(() => _step -= 1);
    } else {
      context.pop();
    }
  }

  Future<void> _pay() async {
    setState(() => _paying = true);
    await Future<void>.delayed(const Duration(milliseconds: 900));
    await ref.read(policiesControllerProvider.future);
    if (!mounted) return;
    final draft = ref.read(purchaseDraftProvider);
    final quote = draft.quote;
    final policy = Policy(
      id: 'policy-${DateTime.now().millisecondsSinceEpoch}',
      number: mockPolicyNumber(),
      productName: draft.plan?.title ?? 'ປະກັນໄພໃໝ່',
      category: draft.categoryLabel,
      companyName: 'ອາລິອັນສ໌ປະກັນໄພລາວ',
      companyLogo: 'assets/images/insurers/allianz.jpg',
      customerName: _name.text.trim(),
      customerDob: _dob.text,
      totalPremium: quote.total,
      startDate: _startDate,
      endDate: _endDate,
      status: PolicyStatus.active,
      vehicleType: draft.vehicleType?.label ?? '',
    );
    ref.read(policiesControllerProvider.notifier).add(policy);
    setState(() {
      _paying = false;
      _policy = policy;
      _step = 5;
    });
  }

  @override
  Widget build(BuildContext context) {
    final draft = ref.watch(purchaseDraftProvider);
    final quote = draft.quote;
    final plans = MockData.plansFor(draft.category);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: GreenAppBar(
        title: 'ຊື້ປະກັນໄພ',
        leading: IconButton(
          onPressed: _back,
          icon: Icon(
            _step == 1 ? Icons.close_rounded : Icons.arrow_back_ios_new_rounded,
            size: 20,
          ),
        ),
      ),
      body: Column(
        children: [
          Container(
            color: AppColors.surface,
            padding: const EdgeInsets.fromLTRB(18, 14, 18, 14),
            child: StepIndicator(current: _step),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 20),
              children: [
                if (_step == 1) _stepOne(draft),
                if (_step == 2) _stepTwo(draft),
                if (_step == 3) _stepThree(draft, plans),
                if (_step == 4) _stepFour(quote, draft),
                if (_step == 5) _stepFive(quote, draft),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildFooter(draft),
    );
  }

  Widget _stepTitle(String title, String subtitle) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          Text(subtitle, style: const TextStyle(fontSize: 11.5, color: AppColors.muted)),
        ],
      ),
    );
  }

  Widget _stepOne(PurchaseDraft draft) {
    return Form(
      key: _stepOneKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _stepTitle(
            'ຂໍ້ມູນຜູ້ສະເໜີເອົາປະກັນໄພ',
            'ຂໍ້ມູນຈະຖືກນຳໃຊ້ໃນການອອກສັນຍາ ແລະ ຢືນຢັນຕົວຕົນ',
          ),
          AppTextField(
            controller: _name,
            label: 'ຊື່ ແລະ ນາມສະກຸນ',
            hint: '--ຊື່ ແລະ ນາມສະກຸນ--',
            prefixIcon: Icons.person_outline_rounded,
            validator: (value) => Validators.required(value, 'ກະລຸນາປ້ອນຊື່ ແລະ ນາມສະກຸນ'),
          ),
          const SizedBox(height: 14),
          AppTextField(
            controller: _phone,
            label: 'ເບີໂທລະສັບ',
            hint: '020 xxxxx',
            prefixIcon: Icons.phone_outlined,
            keyboardType: TextInputType.phone,
            validator: Validators.phone,
          ),
          const SizedBox(height: 14),
          AppTextField(
            controller: _address,
            label: 'ທີ່ຢູ່',
            hint: 'ບ້ານ, ເມືອງ, ແຂວງ',
            prefixIcon: Icons.location_on_outlined,
            validator: (value) => Validators.required(value, 'ກະລຸນາປ້ອນທີ່ຢູ່'),
          ),
          const SizedBox(height: 14),
          AppTextField(
            controller: _dob,
            label: 'ວັນ/ເດືອນ/ປີ ເກີດ',
            hint: 'ວວ/ດດ/ປປ',
            prefixIcon: Icons.cake_outlined,
            readOnly: true,
            onTap: _pickDate,
            validator: (value) => Validators.required(value, 'ກະລຸນາເລືອກວັນເດືອນປີເກີດ'),
          ),
          const SizedBox(height: 14),
          AppDropdownField<String>(
            label: 'ເພດ',
            value: _gender,
            items: const [
              DropdownMenuItem(value: 'ຊາຍ', child: Text('ຊາຍ')),
              DropdownMenuItem(value: 'ຍິງ', child: Text('ຍິງ')),
            ],
            onChanged: (value) => setState(() => _gender = value ?? 'ຊາຍ'),
          ),
          const SizedBox(height: 14),
          AppDropdownField<String>(
            label: 'ປະເພດເອກະສານຢັ້ງຢືນ',
            value: _documentType,
            items: const [
              DropdownMenuItem(value: 'ບັດປະຈຳໂຕ', child: Text('ບັດປະຈຳໂຕ')),
              DropdownMenuItem(value: 'Passport', child: Text('Passport')),
            ],
            onChanged: (value) => setState(() => _documentType = value ?? 'ບັດປະຈຳໂຕ'),
          ),
          const SizedBox(height: 14),
          AppTextField(
            controller: _docNumber,
            label: 'ເລກທີ່ບັດປະຈຳໂຕ/Passport',
            hint: '855265',
            prefixIcon: Icons.badge_outlined,
            validator: (value) => Validators.required(value, 'ກະລຸນາປ້ອນເລກເອກະສານ'),
          ),
          const SizedBox(height: 16),
          _UploadButton(
            label: _idUploaded ? 'ອັບໂຫຼດບັດປະຈຳໂຕແລ້ວ' : 'ອັບໂຫຼດບັດປະຈຳໂຕ',
            uploaded: _idUploaded,
            onPressed: () {
              setState(() => _idUploaded = true);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('ແນບເອກະສານສຳເລັດ (Demo)')),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _stepTwo(PurchaseDraft draft) {
    return Form(
      key: _stepTwoKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _stepTitle(
            draft.isMotor
                ? 'ຂໍ້ມູນລົດທີ່ຊື້ປະກັນໄພ'
                : draft.isHealth
                    ? 'ຂໍ້ມູນສຸຂະພາບ'
                    : 'ຂໍ້ມູນຊັບສິນ',
            draft.isMotor
                ? 'ກະລຸນາປ້ອນຂໍ້ມູນລົດໃຫ້ຄົບຖ້ວນ ເພື່ອປະເມີນຄວາມສ່ຽງ'
                : 'ຂໍ້ມູນເພີ່ມເຕີມສຳລັບການຄຸ້ມຄອງ',
          ),
          if (draft.isMotor) ...[
            AppDropdownField<String>(
              label: 'ການນຳໃຊ້',
              value: _vehicleUsage,
              items: const [
                DropdownMenuItem(value: 'ສ່ວນຕົວ', child: Text('ສ່ວນຕົວ')),
                DropdownMenuItem(value: 'ທຸລະກິດ', child: Text('ທຸລະກິດ')),
                DropdownMenuItem(value: 'ເຊົ່າ', child: Text('ເຊົ່າ')),
              ],
              onChanged: (value) => setState(() => _vehicleUsage = value ?? 'ສ່ວນຕົວ'),
            ),
            const SizedBox(height: 14),
            _ReadOnlyField(
              label: 'ປະເພດລົດ',
              value: draft.vehicleType?.label ?? '-',
              icon: Icons.directions_car_outlined,
            ),
            const SizedBox(height: 14),
            AppTextField(
              controller: _brand,
              label: 'ຍີ່ຫໍ້',
              hint: 'HONDA, BMW',
              prefixIcon: Icons.branding_watermark_outlined,
              validator: (value) => Validators.required(value, 'ກະລຸນາປ້ອນຍີ່ຫໍ້'),
            ),
            const SizedBox(height: 14),
            AppTextField(
              controller: _model,
              label: 'ລຸ້ນ',
              hint: 'City, X5',
              prefixIcon: Icons.directions_car_filled_outlined,
              validator: (value) => Validators.required(value, 'ກະລຸນາປ້ອນລຸ້ນ'),
            ),
            const SizedBox(height: 14),
            AppTextField(
              controller: _plate,
              label: 'ທະບຽນລົດ',
              hint: 'xx 9998',
              prefixIcon: Icons.pin_outlined,
              validator: (value) => Validators.required(value, 'ກະລຸນາປ້ອນທະບຽນລົດ'),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: AppTextField(
                    controller: _engine,
                    label: 'ເລກຈັກ',
                    hint: 'Engine No.',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: AppTextField(
                    controller: _chassis,
                    label: 'ເລກຖັງ',
                    hint: 'Chassis No.',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            AppDropdownField<String>(
              label: 'ຄວາມແຮງ / ບ່ອນນັ່ງ / ນ້ຳໜັກບັນທຸກ',
              value: _capacity,
              items: const [
                DropdownMenuItem(value: '1,000 CC', child: Text('1,000 CC')),
                DropdownMenuItem(value: '1,500 - 2,000 CC', child: Text('1,500 - 2,000 CC')),
                DropdownMenuItem(value: '2,000 - 3,000 CC', child: Text('2,000 - 3,000 CC')),
                DropdownMenuItem(value: '3,000 CC ຂຶ້ນໄປ', child: Text('3,000 CC ຂຶ້ນໄປ')),
                DropdownMenuItem(value: 'ບັນທຸກ 5 ໂຕນ', child: Text('ບັນທຸກ 5 ໂຕນ')),
              ],
              onChanged: (value) => setState(() => _capacity = value ?? _capacity),
            ),
            const SizedBox(height: 16),
            _UploadButton(
              label: _bookUploaded ? 'ອັບໂຫຼດທະບຽນລົດແລ້ວ' : 'ອັບໂຫຼດ ທະບຽນລົດ',
              uploaded: _bookUploaded,
              onPressed: () {
                setState(() => _bookUploaded = true);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('ແນບປຶ້ມທະບຽນລົດສຳເລັດ (Demo)')),
                );
              },
            ),
          ] else if (draft.isHealth) ...[
            AppDropdownField<String>(
              label: 'ຈຳນວນສະມາຊິກທີ່ຄຸ້ມຄອງ',
              value: _healthMembers,
              items: const [
                DropdownMenuItem(value: '1', child: Text('1 ຄົນ')),
                DropdownMenuItem(value: '2', child: Text('2 ຄົນ')),
                DropdownMenuItem(value: '3', child: Text('3 ຄົນ')),
                DropdownMenuItem(value: '4', child: Text('4 ຄົນ')),
                DropdownMenuItem(value: '5', child: Text('5 ຄົນ')),
              ],
              onChanged: (value) => setState(() => _healthMembers = value ?? '1'),
            ),
            const SizedBox(height: 14),
            AppTextField(
              controller: _address,
              label: 'ທີ່ຢູ່ສຳລັບການຮັກສາ',
              prefixIcon: Icons.local_hospital_outlined,
              validator: (value) => Validators.required(value, 'ກະລຸນາປ້ອນທີ່ຢູ່'),
            ),
          ] else ...[
            AppTextField(
              controller: _propertyAddress,
              label: 'ທີ່ຢູ່ຊັບສິນ',
              hint: 'ບ້ານ, ເມືອງ, ແຂວງ',
              prefixIcon: Icons.home_outlined,
              validator: (value) => Validators.required(value, 'ກະລຸນາປ້ອນທີ່ຢູ່ຊັບສິນ'),
            ),
            const SizedBox(height: 14),
            AppTextField(
              controller: _propertyValue,
              label: 'ມູນຄ່າຊັບສິນ (LAK)',
              hint: '500,000,000',
              prefixIcon: Icons.payments_outlined,
              keyboardType: TextInputType.number,
              validator: (value) => Validators.required(value, 'ກະລຸນາປ້ອນມູນຄ່າຊັບສິນ'),
            ),
          ],
        ],
      ),
    );
  }

  Widget _stepThree(PurchaseDraft draft, List<InsurancePlan> plans) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _stepTitle(
          'ລາຍລະອຽດການຄຸ້ມຄອງ',
          'ກວດສອບໄລຍະເວລາ ແລະ ຂອບເຂດການຄຸ້ມຄອງ',
        ),
        AppCard(
          child: Column(
            children: [
              InfoRow(
                label: 'ວັນທີເລີ່ມຄຸ້ມຄອງ',
                value: Fmt.dateTimeSeconds(_startDate),
                dense: true,
              ),
              InfoRow(
                label: 'ວັນສິ້ນສຸດການຄຸ້ມຄອງ',
                value: Fmt.dateTimeSeconds(_endDate),
                dense: true,
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        AppDropdownField<String>(
          label: 'ແຜນຄຸ້ມຄອງ',
          value: draft.plan?.id,
          items: [
            for (final plan in plans)
              DropdownMenuItem(value: plan.id, child: Text(plan.title)),
          ],
          onChanged: (value) {
            final plan = plans.where((item) => item.id == value).firstOrNull;
            if (plan != null) {
              ref.read(purchaseDraftProvider.notifier).setPlan(plan);
            }
          },
        ),
        const SizedBox(height: 16),
        AppCard(
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(15)),
                ),
                child: const Row(
                  children: [
                    Expanded(
                      flex: 6,
                      child: Text(
                        'ລາຍລະອຽດການຄຸ້ມຄອງ',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    Expanded(
                      flex: 4,
                      child: Text(
                        'ວົງເງິນສູງສຸດ',
                        textAlign: TextAlign.right,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              for (var i = 0; i < MockData.coverageRows.length; i++)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                  color: MockData.coverageRows[i].isHeader
                      ? AppColors.mint
                      : (i.isEven ? AppColors.surface : const Color(0xFFFAFBFC)),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        flex: 6,
                        child: Text(
                          MockData.coverageRows[i].title,
                          style: TextStyle(
                            fontSize: 10.5,
                            height: 1.45,
                            fontWeight: MockData.coverageRows[i].isHeader
                                ? FontWeight.w800
                                : FontWeight.w500,
                            color: MockData.coverageRows[i].isHeader
                                ? AppColors.primary
                                : AppColors.text,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        flex: 4,
                        child: Text(
                          MockData.coverageRows[i].limit,
                          textAlign: TextAlign.right,
                          style: const TextStyle(
                            fontSize: 10,
                            height: 1.45,
                            fontWeight: FontWeight.w700,
                            color: AppColors.muted,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
        Align(
          alignment: Alignment.centerRight,
          child: TextButton(
            onPressed: () => _showCoverageInfo(draft),
            child: const Text('ອ່ານຂໍ້ມູນເພີ່ມເຕີມ >'),
          ),
        ),
      ],
    );
  }

  Widget _stepFour(PremiumQuote quote, PurchaseDraft draft) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _stepTitle(
          'ລາຍລະອຽດຄ່າປະກັນໄພ',
          'ກວດສອບລາຍການ ແລະ ຊຳລະຜ່ານ BCEL One',
        ),
        AppCard(
          child: Column(
            children: [
              _InvoiceRow(label: 'ຄ່າປະກັນໄພພື້ນຖານ', value: Fmt.kip(quote.basePremium)),
              _InvoiceRow(
                label: 'ສ່ວນຫຼຸດ (${quote.discountPercent.toInt()}%)',
                value: '- ${Fmt.kip(quote.discountAmount)}',
                valueColor: AppColors.danger,
              ),
              _InvoiceRow(label: 'ຄ່າປະກັນໄພຫຼັງຫຼຸດ', value: Fmt.kip(quote.netPremium)),
              _InvoiceRow(label: 'ຄ່າປະກັນໄພເພີ່ມເຕີມ', value: Fmt.kip(quote.extraPremium)),
              _InvoiceRow(label: 'ອາກອນມູນຄ່າເພີ່ມ (7% VAT)', value: Fmt.kip(quote.vat)),
              _InvoiceRow(label: 'ຄ່າຂຶ້ນທະບຽນ', value: Fmt.kip(quote.registrationFee)),
              const Divider(height: 22),
              Row(
                children: [
                  const Expanded(
                    child: Text(
                      'ຄ່າປະກັນໄພລວມ (Total)',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
                    ),
                  ),
                  Text(
                    Fmt.kip(quote.total),
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        AppCard(
          child: Row(
            children: [
              Container(
                width: 54,
                height: 54,
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Image.asset('assets/icons/bcel.png', fit: BoxFit.contain),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'BCEL One',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
                    ),
                    SizedBox(height: 3),
                    Text(
                      'ຊຳລະທັນທີຜ່ານແອັບ BCEL One ຫຼື QR Code',
                      style: TextStyle(fontSize: 10.5, color: AppColors.muted),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 22),
            ],
          ),
        ),
        const SizedBox(height: 14),
        AppCard(
          color: AppColors.amberSoft,
          borderColor: const Color(0xFFFDE68A),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.lock_outline_rounded, size: 17, color: AppColors.amber),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  'ການຊຳລະເງິນຖືກປົກປ້ອງດ້ວຍມາດຕະຖານ BCEL One. ຫຼັງຊຳລະສຳເລັດ ທ່ານຈະໄດ້ຮັບໃບຢັ້ງຢືນສັນຍາທັນທີ.',
                  style: TextStyle(fontSize: 10.5, color: AppColors.muted, height: 1.6),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _stepFive(PremiumQuote quote, PurchaseDraft draft) {
    final policy = _policy;
    return Column(
      children: [
        const SizedBox(height: 10),
        Container(
          width: 76,
          height: 76,
          decoration: const BoxDecoration(
            color: AppColors.successSoft,
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.check_rounded, size: 44, color: AppColors.success),
        ),
        const SizedBox(height: 14),
        const Text(
          'ຊຳລະເງິນສຳເລັດ',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 4),
        const Text(
          'ໃບຢັ້ງຢືນສັນຍາປະກັນໄພຖືກອອກແລ້ວ',
          style: TextStyle(fontSize: 11.5, color: AppColors.muted),
        ),
        const SizedBox(height: 18),
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Expanded(
                    child: Text(
                      'ໃບຢັ້ງຢືນສັນຍາປະກັນໄພ',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
                    ),
                  ),
                  Text(
                    policy?.number ?? 'WEC-000000',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              const Divider(),
              const SizedBox(height: 4),
              InfoRow(
                label: 'ວັນທີເລີ່ມຄຸ້ມຄອງ',
                value: Fmt.dateTimeSeconds(_startDate),
                dense: true,
              ),
              InfoRow(
                label: 'ວັນສິ້ນສຸດການຄຸ້ມຄອງ',
                value: Fmt.dateTimeSeconds(_endDate),
                dense: true,
              ),
              const Divider(),
              InfoRow(label: 'ຊື່ຜູ້ໄດ້ຮັບປະກັນໄພ', value: _name.text, dense: true),
              InfoRow(label: 'ເບີໂທລະສັບ', value: _phone.text, dense: true),
              InfoRow(label: 'ວັນ/ເດືອນ/ປີ ເກີດ', value: _dob.text, dense: true),
              InfoRow(label: 'ທີ່ຢູ່', value: _address.text, dense: true),
              InfoRow(label: 'ປະເພດເອກະສານ', value: _documentType, dense: true),
              InfoRow(label: 'ເລກທີ', value: _docNumber.text, dense: true),
              if (draft.isMotor) ...[
                const Divider(),
                InfoRow(
                  label: 'ປະເພດລົດ',
                  value: draft.vehicleType?.label ?? '-',
                  dense: true,
                ),
                InfoRow(
                  label: 'ຍີ່ຫໍ້ / ລຸ້ນ',
                  value: '${_brand.text} ${_model.text}'.trim(),
                  dense: true,
                ),
                InfoRow(label: 'ທະບຽນລົດ', value: _plate.text, dense: true),
              ],
              if (draft.isProperty) ...[
                const Divider(),
                InfoRow(label: 'ທີ່ຢູ່ຊັບສິນ', value: _propertyAddress.text, dense: true),
                InfoRow(label: 'ມູນຄ່າຊັບສິນ', value: _propertyValue.text, dense: true),
              ],
              const Divider(),
              Row(
                children: [
                  const Expanded(
                    child: Text(
                      'ຄ່າປະກັນໄພລວມ',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                  ),
                  Text(
                    Fmt.kip(quote.total),
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),
        TextButton.icon(
          onPressed: policy == null ? null : () => context.push('/policies/${policy.id}'),
          icon: const Icon(Icons.description_outlined, size: 16),
          label: const Text('ເບິ່ງລາຍລະອຽດສັນຍາ'),
        ),
      ],
    );
  }

  Widget _buildFooter(PurchaseDraft draft) {
    final isLast = _step == 5;
    final isPay = _step == 4;
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            if (_step > 1 && !isLast) ...[
              Expanded(
                child: SizedBox(
                  height: 52,
                  child: OutlinedButton(
                    onPressed: _paying ? null : _back,
                    child: const Text('ກັບຄືນ'),
                  ),
                ),
              ),
              const SizedBox(width: 10),
            ],
            Expanded(
              flex: _step > 1 && !isLast ? 2 : 1,
              child: PrimaryButton(
                label: isLast
                    ? 'ຢືນຢັນ'
                    : isPay
                        ? 'ກົດຊຳລະຄ່າປະກັນໄພ'
                        : 'ໄປຕໍ່',
                loading: _paying,
                onPressed: _next,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showCoverageInfo(PurchaseDraft draft) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return Padding(
          padding: EdgeInsets.fromLTRB(
            20,
            14,
            20,
            MediaQuery.of(context).viewInsets.bottom + 26,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 42,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(99),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              const Text(
                'ຂໍ້ມູນເພີ່ມເຕີມ',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 10),
              const Text(
                'ການຄຸ້ມຄອງເປັນໄປຕາມເງື່ອນໄຂຂອງແຜນທີ່ເລືອກ. ຂອບເຂດຄຸ້ມຄອງອາດມີການປ່ຽນແປງຕາມບໍລິສັດປະກັນໄພ ແລະ ປະເພດລົດ.',
                style: TextStyle(fontSize: 12, color: AppColors.muted, height: 1.7),
              ),
              const SizedBox(height: 14),
              const InfoRow(label: 'ສາຍດ່ວນ', value: AppConfig.supportPhone),
              const InfoRow(label: 'ມືຖື', value: AppConfig.supportMobile),
              const InfoRow(label: 'ເວລາເຮັດວຽກ', value: '08:00 - 17:00 (ຈັນ - ສຸກ)'),
              const SizedBox(height: 16),
              PrimaryButton(
                label: 'ຕົກລົງ',
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _InvoiceRow extends StatelessWidget {
  const _InvoiceRow({required this.label, required this.value, this.valueColor});

  final String label;
  final String value;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Text(
              label,
              style: const TextStyle(fontSize: 11.5, color: AppColors.muted),
            ),
          ),
          const SizedBox(width: 12),
          Text(
            value,
            style: TextStyle(
              fontSize: 11.5,
              fontWeight: FontWeight.w700,
              color: valueColor ?? AppColors.text,
            ),
          ),
        ],
      ),
    );
  }
}

class _UploadButton extends StatelessWidget {
  const _UploadButton({
    required this.label,
    required this.uploaded,
    required this.onPressed,
  });

  final String label;
  final bool uploaded;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 48,
      child: OutlinedButton.icon(
        onPressed: onPressed,
        icon: Icon(
          uploaded ? Icons.check_circle_rounded : Icons.upload_file_rounded,
          size: 19,
          color: uploaded ? AppColors.success : AppColors.slate,
        ),
        label: Text(
          label,
          style: TextStyle(
            color: uploaded ? AppColors.success : AppColors.slate,
            fontSize: 12.5,
          ),
        ),
        style: OutlinedButton.styleFrom(
          side: BorderSide(color: uploaded ? AppColors.success : AppColors.slate),
          foregroundColor: uploaded ? AppColors.success : AppColors.slate,
        ),
      ),
    );
  }
}


class _ReadOnlyField extends StatelessWidget {
  const _ReadOnlyField({
    required this.label,
    required this.value,
    required this.icon,
  });

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 13,
            color: AppColors.muted,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 7),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 15),
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              Icon(icon, size: 20, color: AppColors.muted),
              const SizedBox(width: 12),
              Text(
                value,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
