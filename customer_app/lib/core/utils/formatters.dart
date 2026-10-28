import 'package:intl/intl.dart';

class Fmt {
  Fmt._();

  static final NumberFormat _decimal = NumberFormat.decimalPattern('en_US');

  static String number(num value) => _decimal.format(value);

  static String kip(num value) => '${_decimal.format(value)} LAK';

  static String date(DateTime value) => DateFormat('dd/MM/yyyy').format(value);

  static String dateTime(DateTime value) =>
      DateFormat('dd/MM/yyyy HH:mm').format(value);

  static String dateTimeSeconds(DateTime value) =>
      DateFormat('dd/MM/yyyy HH:mm:ss').format(value);

  static String shortDate(DateTime value) =>
      DateFormat('dd/MM/yy').format(value);

  static String minutes(int value) =>
      value < 10 ? '0$value' : value.toString();

  static String phone(String value) {
    final digits = value.replaceAll(RegExp(r'[^0-9+]'), '');
    if (digits.startsWith('+856')) {
      final rest = digits.substring(4);
      return rest.isEmpty ? '+856' : '+856 $rest';
    }
    if (digits.startsWith('856')) {
      final rest = digits.substring(3);
      return rest.isEmpty ? '+856' : '+856 $rest';
    }
    if (digits.startsWith('0')) return '+856 ${digits.substring(1)}';
    return value;
  }
}

class PremiumCalculator {
  PremiumCalculator._();

  static const vatRate = 0.07;
  static const registrationFee = 20000;

  static PremiumQuote calculate({
    required num basePremium,
    required num discountPercent,
    num extraPremium = 0,
  }) {
    final discount = (basePremium * discountPercent / 100).round();
    final net = basePremium - discount;
    final vat = (net * vatRate).round();
    final total = net + extraPremium + vat + registrationFee;
    return PremiumQuote(
      basePremium: basePremium,
      discountPercent: discountPercent,
      discountAmount: discount,
      netPremium: net,
      extraPremium: extraPremium,
      vat: vat,
      registrationFee: registrationFee,
      total: total,
    );
  }
}

class PremiumQuote {
  const PremiumQuote({
    required this.basePremium,
    required this.discountPercent,
    required this.discountAmount,
    required this.netPremium,
    required this.extraPremium,
    required this.vat,
    required this.registrationFee,
    required this.total,
  });

  final num basePremium;
  final num discountPercent;
  final num discountAmount;
  final num netPremium;
  final num extraPremium;
  final num vat;
  final num registrationFee;
  final num total;
}
