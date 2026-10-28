import 'package:customer_app/core/utils/formatters.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('PremiumCalculator', () {
    test('calculates the motor insurance sample from the spec', () {
      final quote = PremiumCalculator.calculate(
        basePremium: 1945455,
        discountPercent: 30,
      );

      expect(quote.discountAmount, 583637);
      expect(quote.netPremium, 1361818);
      expect(quote.vat, 95327);
      expect(quote.registrationFee, 20000);
      expect(quote.total, 1477145);
    });

    test('includes extra premium in the total', () {
      final quote = PremiumCalculator.calculate(
        basePremium: 1000000,
        discountPercent: 10,
        extraPremium: 50000,
      );

      expect(quote.netPremium, 900000);
      expect(quote.vat, 63000);
      expect(quote.total, 1033000);
    });

    test('formats kip with thousands separators', () {
      expect(Fmt.kip(1477145), '1,477,145 LAK');
    });
  });
}
