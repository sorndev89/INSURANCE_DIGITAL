import 'package:customer_app/app/providers.dart';
import 'package:customer_app/data/mock_data.dart';
import 'package:customer_app/features/purchase/purchase_wizard_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

class _FakeAuthController extends AuthController {
  @override
  Future<AuthState> build() async {
    return const AuthState(user: MockData.user, token: 'test-token');
  }
}

void main() {
  testWidgets('completes all five purchase wizard steps', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [authControllerProvider.overrideWith(_FakeAuthController.new)],
        child: const MaterialApp(home: PurchaseWizardScreen()),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('ຂໍ້ມູນຜູ້ສະເໜີເອົາປະກັນໄພ'), findsOneWidget);

    final stepOneFields = find.byType(TextFormField);
    await tester.enterText(stepOneFields.at(4), '855265');
    await tester.tap(find.text('ໄປຕໍ່'));
    await tester.pumpAndSettle();

    expect(find.text('ຂໍ້ມູນລົດທີ່ຊື້ປະກັນໄພ'), findsOneWidget);

    final stepTwoFields = find.byType(TextFormField);
    await tester.enterText(stepTwoFields.at(0), 'HONDA');
    await tester.enterText(stepTwoFields.at(1), 'City');
    await tester.enterText(stepTwoFields.at(2), 'ກກ 9998');
    await tester.tap(find.text('ໄປຕໍ່'));
    await tester.pumpAndSettle();

    expect(find.text('ລາຍລະອຽດການຄຸ້ມຄອງ'), findsWidgets);
    await tester.tap(find.text('ໄປຕໍ່'));
    await tester.pumpAndSettle();

    expect(find.text('ລາຍລະອຽດຄ່າປະກັນໄພ'), findsOneWidget);
    expect(find.text('1,477,145 LAK'), findsOneWidget);

    await tester.tap(find.text('ກົດຊຳລະຄ່າປະກັນໄພ'));
    await tester.pumpAndSettle(const Duration(seconds: 2));

    expect(find.text('ຊຳລະເງິນສຳເລັດ'), findsOneWidget);
    expect(find.text('ຢືນຢັນ'), findsOneWidget);
  });
}
