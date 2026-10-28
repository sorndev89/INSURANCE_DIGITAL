import 'package:customer_app/core/utils/validators.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Validators', () {
    test('validates email', () {
      expect(Validators.email('customer@saiyfon.com'), isNull);
      expect(Validators.email('not-an-email'), isNotNull);
      expect(Validators.email(''), isNotNull);
    });

    test('validates strong password', () {
      expect(Validators.password('Demo@1234', strong: true), isNull);
      expect(Validators.password('password', strong: true), isNotNull);
      expect(Validators.password('Password1', strong: true), isNull);
      expect(Validators.password('Short1', strong: true), isNotNull);
    });

    test('validates phone numbers', () {
      expect(Validators.phone('2077643515'), isNull);
      expect(Validators.phone('123'), isNotNull);
    });

    test('confirms matching passwords', () {
      expect(Validators.confirmPassword('Demo@1234', 'Demo@1234'), isNull);
      expect(Validators.confirmPassword('Demo@4321', 'Demo@1234'), isNotNull);
    });
  });
}
