import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/app_widgets.dart';

class OtpScreen extends ConsumerStatefulWidget {
  const OtpScreen({super.key});

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final _controllers = List.generate(4, (_) => TextEditingController());
  final _focusNodes = List.generate(4, (_) => FocusNode());
  bool _verifying = false;

  @override
  void dispose() {
    for (final controller in _controllers) {
      controller.dispose();
    }
    for (final node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  String get _code => _controllers.map((c) => c.text).join();

  Future<void> _verify() async {
    if (_code.length < 4) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('ກະລຸນາປ້ອນລະຫັດ OTP ໃຫ້ຄົບ 4 ຫຼັກ')),
      );
      return;
    }
    setState(() => _verifying = true);
    final ok = await ref.read(authControllerProvider.notifier).verifyOtp(_code);
    if (!mounted) return;
    setState(() => _verifying = false);
    if (!ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('ລະຫັດ OTP ບໍ່ຖືກຕ້ອງ (ລະຫັດທົດລອງ: 1234)')),
      );
      return;
    }
    context.push('/register-success');
  }

  void _resend() {
    for (final controller in _controllers) {
      controller.clear();
    }
    _focusNodes.first.requestFocus();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('ສົ່ງລະຫັດໃໝ່ແລ້ວ · ລະຫັດທົດລອງ 1234')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pending = ref.watch(authControllerProvider).value?.pendingUser;
    final phone = pending?.phone.isNotEmpty == true ? pending!.phone : '20 77643515';
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
          child: Column(
            children: [
              const SizedBox(height: 18),
              Image.asset('assets/images/otp.png', height: 170, fit: BoxFit.contain),
              const SizedBox(height: 24),
              Text(
                'ກະລຸນາກວດສອບບັນຊີຂອງທ່ານ',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                'ພວກເຮົາໄດ້ສົ່ງລະຫັດການເຂົ້າເຖິງໃຫ້ທ່ານຜ່ານທາງ SMS\nໄປທີ່ເບີ $phone',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: AppColors.muted, height: 1.6),
              ),
              const SizedBox(height: 28),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(4, (index) {
                  return Container(
                    width: 58,
                    height: 62,
                    margin: const EdgeInsets.symmetric(horizontal: 5),
                    child: TextField(
                      controller: _controllers[index],
                      focusNode: _focusNodes[index],
                      keyboardType: TextInputType.number,
                      textAlign: TextAlign.center,
                      maxLength: 1,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primary,
                      ),
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      decoration: InputDecoration(
                        counterText: '',
                        contentPadding: EdgeInsets.zero,
                        filled: true,
                        fillColor: AppColors.mint,
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(
                            color: _controllers[index].text.isEmpty
                                ? AppColors.border
                                : AppColors.primary,
                            width: 1.4,
                          ),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: AppColors.primary, width: 1.8),
                        ),
                      ),
                      onChanged: (value) {
                        if (value.isNotEmpty && index < 3) {
                          _focusNodes[index + 1].requestFocus();
                        }
                        if (value.isEmpty && index > 0) {
                          _focusNodes[index - 1].requestFocus();
                        }
                        setState(() {});
                        if (_code.length == 4) {
                          _verify();
                        }
                      },
                    ),
                  );
                }),
              ),
              const SizedBox(height: 10),
              const Text(
                'ລະຫັດທົດລອງ: 1234',
                style: TextStyle(fontSize: 11.5, color: AppColors.hint),
              ),
              const SizedBox(height: 28),
              PrimaryButton(
                label: 'ຢືນຢັນ',
                loading: _verifying,
                onPressed: _verify,
              ),
              const SizedBox(height: 20),
              const Text(
                'ລະຫັດຍັງບໍ່ໄດ້ຮັບ?',
                style: TextStyle(fontSize: 12, color: AppColors.muted),
              ),
              const SizedBox(height: 6),
              SizedBox(
                height: 44,
                child: ElevatedButton(
                  onPressed: _resend,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.slate,
                    minimumSize: const Size(double.infinity, 44),
                  ),
                  child: const Text('ສົ່ງອີກຄັ້ງ', style: TextStyle(fontSize: 14)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
