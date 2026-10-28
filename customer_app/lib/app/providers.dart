import 'dart:ui';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/config/app_config.dart';
import '../core/network/api_client.dart';
import '../core/storage/session_store.dart';
import '../data/mock_data.dart';
import '../data/models.dart';
import '../data/repositories.dart';

final sessionStoreProvider = Provider<SessionStore>((ref) => SessionStore.instance);

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  if (AppConfig.useMock) return MockAuthRepository();
  return ApiAuthRepository(ref.watch(apiClientProvider));
});

final catalogRepositoryProvider = Provider<CatalogRepository>((ref) {
  if (AppConfig.useMock) return MockCatalogRepository();
  return ApiCatalogRepository(ref.watch(apiClientProvider));
});

final policyRepositoryProvider = Provider<PolicyRepository>((ref) {
  if (AppConfig.useMock) return MockPolicyRepository();
  return ApiPolicyRepository(ref.watch(apiClientProvider));
});

final uploadRepositoryProvider = Provider<UploadRepository>((ref) {
  if (AppConfig.useMock) return MockUploadRepository();
  return ApiUploadRepository(ref.watch(apiClientProvider));
});

final companiesProvider = FutureProvider<List<InsuranceCompany>>((ref) {
  return ref.watch(catalogRepositoryProvider).companies();
});

final plansProvider = FutureProvider.family<List<InsurancePlan>, String>(
  (ref, category) => ref.watch(catalogRepositoryProvider).plans(category),
);

final claimsProvider = FutureProvider<List<ClaimRecord>>(
  (ref) => ref.watch(policyRepositoryProvider).claims(),
);

final newsProvider = Provider<List<NewsArticle>>((ref) => MockData.news);
final promotionsProvider = Provider<List<Promotion>>((ref) => MockData.promotions);
final servicesProvider = Provider<List<ServiceOffer>>((ref) => MockData.services);

class AuthState {
  const AuthState({
    this.user,
    this.token,
    this.pendingUser,
    this.otpVerified = false,
  });

  final AppUser? user;
  final String? token;
  final AppUser? pendingUser;
  final bool otpVerified;

  bool get isAuthenticated => token != null && user != null;

  AuthState copyWith({
    AppUser? user,
    String? token,
    AppUser? pendingUser,
    bool? otpVerified,
  }) {
    return AuthState(
      user: user ?? this.user,
      token: token ?? this.token,
      pendingUser: pendingUser ?? this.pendingUser,
      otpVerified: otpVerified ?? this.otpVerified,
    );
  }
}

class AuthController extends AsyncNotifier<AuthState> {
  String? _pendingPassword;

  @override
  Future<AuthState> build() async {
    final token = await ref.read(sessionStoreProvider).readToken();
    if (token == null || token.isEmpty) return const AuthState();
    final repo = ref.read(authRepositoryProvider);
    final client = ref.read(apiClientProvider);
    client.token = token;
    try {
      final user = AppConfig.useMock
          ? MockData.user
          : await repo.me(MockData.user);
      return AuthState(user: user, token: token);
    } catch (_) {
      await ref.read(sessionStoreProvider).clearToken();
      return const AuthState();
    }
  }

  Future<void> login(String email, String password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final session = await ref
          .read(authRepositoryProvider)
          .login(email: email, password: password);
      await ref.read(sessionStoreProvider).writeToken(session.token);
      ref.read(apiClientProvider).token = session.token;
      return AuthState(user: session.user, token: session.token);
    });
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
    required String phone,
  }) async {
    _pendingPassword = password;
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final user = await ref
          .read(authRepositoryProvider)
          .register(name: name, email: email, password: password, phone: phone);
      return AuthState(user: null, pendingUser: user);
    });
  }

  Future<bool> verifyOtp(String code) async {
    final ok = await ref.read(authRepositoryProvider).verifyOtp(code);
    final current = state.value ?? const AuthState();
    if (ok) {
      state = AsyncData(current.copyWith(otpVerified: true));
    }
    return ok;
  }

  Future<void> completeRegistration(AppUser user) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      if (AppConfig.useMock) {
        const token = 'mock.session';
        await ref.read(sessionStoreProvider).writeToken(token);
        ref.read(apiClientProvider).token = token;
        return AuthState(user: user, token: token);
      }
      final password = _pendingPassword ?? 'Demo@1234';
      final session = await ref
          .read(authRepositoryProvider)
          .login(email: user.email, password: password);
      await ref.read(sessionStoreProvider).writeToken(session.token);
      ref.read(apiClientProvider).token = session.token;
      return AuthState(user: user, token: session.token);
    });
  }

  Future<void> updateProfile(Map<String, dynamic> patch) async {
    final current = state.value;
    final user = current?.user;
    if (user == null) return;
    final updated = await ref
        .read(authRepositoryProvider)
        .updateProfile(user, patch);
    state = AsyncData(current!.copyWith(user: updated));
  }

  Future<void> logout() async {
    await ref.read(sessionStoreProvider).clearToken();
    ref.read(apiClientProvider).token = null;
    state = const AsyncData(AuthState());
  }
}

final authControllerProvider =
    AsyncNotifierProvider<AuthController, AuthState>(AuthController.new);

class PoliciesController extends AsyncNotifier<List<Policy>> {
  @override
  Future<List<Policy>> build() => ref.read(policyRepositoryProvider).policies();

  void add(Policy policy) {
    final current = state.value ?? const <Policy>[];
    state = AsyncData([policy, ...current]);
  }
}

final policiesControllerProvider =
    AsyncNotifierProvider<PoliciesController, List<Policy>>(
      PoliciesController.new,
    );

class PurchaseDraftNotifier extends Notifier<PurchaseDraft> {
  @override
  PurchaseDraft build() => const PurchaseDraft();

  void reset() => state = const PurchaseDraft();

  void setCategory(String category) {
    final plans = MockData.plansFor(category);
    state = state.copyWith(
      category: category,
      plan: plans.first,
      vehicleType: null,
    );
  }

  void setPlan(InsurancePlan plan) => state = state.copyWith(plan: plan);

  void setVehicleType(VehicleType type) =>
      state = state.copyWith(vehicleType: type);

  void patch({
    String? insuredName,
    String? phone,
    String? address,
    String? dob,
    String? gender,
    String? documentType,
    String? documentNumber,
    String? vehicleUsage,
    String? vehicleBrand,
    String? vehicleModel,
    String? plateNumber,
    String? engineNumber,
    String? chassisNumber,
    String? capacity,
    bool? idCardUploaded,
    bool? vehicleBookUploaded,
    String? propertyAddress,
    String? propertyValue,
    String? healthMembers,
  }) {
    state = state.copyWith(
      insuredName: insuredName,
      phone: phone,
      address: address,
      dob: dob,
      gender: gender,
      documentType: documentType,
      documentNumber: documentNumber,
      vehicleUsage: vehicleUsage,
      vehicleBrand: vehicleBrand,
      vehicleModel: vehicleModel,
      plateNumber: plateNumber,
      engineNumber: engineNumber,
      chassisNumber: chassisNumber,
      capacity: capacity,
      idCardUploaded: idCardUploaded,
      vehicleBookUploaded: vehicleBookUploaded,
      propertyAddress: propertyAddress,
      propertyValue: propertyValue,
      healthMembers: healthMembers,
    );
  }
}

final purchaseDraftProvider =
    NotifierProvider<PurchaseDraftNotifier, PurchaseDraft>(
      PurchaseDraftNotifier.new,
    );

class LocaleNotifier extends Notifier<Locale> {
  @override
  Locale build() => const Locale('lo');

  Future<void> load() async {
    final code = await ref.read(sessionStoreProvider).readLocale();
    state = Locale(code);
  }

  Future<void> setLocale(String code) async {
    state = Locale(code);
    await ref.read(sessionStoreProvider).writeLocale(code);
  }
}

final localeProvider = NotifierProvider<LocaleNotifier, Locale>(
  LocaleNotifier.new,
);
