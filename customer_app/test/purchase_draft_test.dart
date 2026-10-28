import 'package:customer_app/app/providers.dart';
import 'package:customer_app/data/mock_data.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('PurchaseDraftNotifier', () {
    test('sets category and selects the first plan', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      container.read(purchaseDraftProvider.notifier).setCategory('health');
      final draft = container.read(purchaseDraftProvider);

      expect(draft.category, 'health');
      expect(draft.plan?.category, 'health');
      expect(draft.categoryLabel, 'ປະກັນໄພສຸຂະພາບ');
    });

    test('stores insured and vehicle information', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(purchaseDraftProvider.notifier);
      notifier.setCategory('motor');
      notifier.setVehicleType(MockData.vehicleTypes.first);
      notifier.patch(
        insuredName: 'Thadsaphone CHANJALERN',
        phone: '2077643515',
        plateNumber: 'ກກ 9998',
      );

      final draft = container.read(purchaseDraftProvider);
      expect(draft.insuredName, 'Thadsaphone CHANJALERN');
      expect(draft.phone, '2077643515');
      expect(draft.plateNumber, 'ກກ 9998');
      expect(draft.vehicleType?.label, 'ລົດເກັງ');
      expect(draft.isMotor, isTrue);
    });
  });

  group('Mock data', () {
    test('contains all 17 insurance partners', () {
      expect(MockData.companies, hasLength(17));
    });

    test('contains plans for every category', () {
      expect(MockData.plansFor('motor'), isNotEmpty);
      expect(MockData.plansFor('health'), isNotEmpty);
      expect(MockData.plansFor('property'), isNotEmpty);
    });

    test('contains active and expired policies', () {
      expect(
        MockData.policies.where((item) => item.status.name == 'active'),
        isNotEmpty,
      );
      expect(
        MockData.policies.where((item) => item.status.name == 'expired'),
        isNotEmpty,
      );
    });
  });
}
