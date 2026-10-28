class Validators {
  Validators._();

  static final _email = RegExp(r'^[\w.+-]+@[\w-]+\.[\w.-]+$');
  static final _upper = RegExp(r'[A-Z]');
  static final _lower = RegExp(r'[a-z]');
  static final _digit = RegExp(r'[0-9]');

  static String? email(String? value) {
    final input = (value ?? '').trim();
    if (input.isEmpty) return 'ກະລຸນາປ້ອນອີເມວ';
    if (!_email.hasMatch(input)) return 'ຮູບແບບອີເມວບໍ່ຖືກຕ້ອງ';
    return null;
  }

  static String? password(String? value, {bool strong = false}) {
    final input = value ?? '';
    if (input.isEmpty) return 'ກະລຸນາປ້ອນລະຫັດຜ່ານ';
    if (input.length < (strong ? 8 : 6)) {
      return strong ? 'ລະຫັດຜ່ານຕ້ອງ 8 ໂຕຂຶ້ນໄປ' : 'ລະຫັດຜ່ານຕ້ອງ 6 ໂຕຂຶ້ນໄປ';
    }
    if (strong) {
      if (!_upper.hasMatch(input) || !_lower.hasMatch(input)) {
        return 'ຕ້ອງມີຕົວອັກສອນໃຫຍ່ ແລະ ນ້ອຍ';
      }
      if (!_digit.hasMatch(input)) return 'ຕ້ອງມີຕົວເລກຢ່າງໜ້ອຍ 1 ໂຕ';
    }
    return null;
  }

  static String? phone(String? value) {
    final digits = (value ?? '').replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.isEmpty) return 'ກະລຸນາປ້ອນເບີໂທ';
    if (digits.length < 8 || digits.length > 12) return 'ເບີໂທບໍ່ຖືກຕ້ອງ';
    return null;
  }

  static String? required(String? value, [String message = 'ກະລຸນາປ້ອນຂໍ້ມູນ']) {
    if ((value ?? '').trim().isEmpty) return message;
    return null;
  }

  static String? confirmPassword(String? value, String original) {
    if ((value ?? '').isEmpty) return 'ກະລຸນາຢືນຢັນລະຫັດຜ່ານ';
    if (value != original) return 'ລະຫັດຜ່ານບໍ່ກົງກັນ';
    return null;
  }
}
