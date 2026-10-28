import 'dart:math';

import '../core/network/api_client.dart';
import 'mock_data.dart';
import 'models.dart';

class AuthSession {
  const AuthSession({required this.user, required this.token});

  final AppUser user;
  final String token;
}

abstract class AuthRepository {
  Future<AuthSession> login({required String email, required String password});
  Future<AppUser> register({
    required String name,
    required String email,
    required String password,
    required String phone,
  });
  Future<AppUser> me(AppUser fallback);
  Future<AppUser> updateProfile(AppUser user, Map<String, dynamic> patch);
  Future<void> sendOtp(String phone);
  Future<bool> verifyOtp(String code);
}

abstract class CatalogRepository {
  Future<List<InsuranceCompany>> companies();
  Future<List<InsurancePlan>> plans(String category);
}

abstract class PolicyRepository {
  Future<List<Policy>> policies();
  Future<List<ClaimRecord>> claims();
}

abstract class UploadRepository {
  Future<String> upload(String filePath, String fileName);
}

class MockAuthRepository implements AuthRepository {
  @override
  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    await Future<void>.delayed(const Duration(milliseconds: 650));
    if (password.length < 6) {
      throw ApiException('ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ');
    }
    final known = email.toLowerCase().trim() == 'customer@saiyfon.com';
    if (known && password != 'Demo@1234') {
      throw ApiException('ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ', statusCode: 401);
    }
    return AuthSession(
      user: MockData.user.copyWith(email: email.trim()),
      token: 'mock.${DateTime.now().millisecondsSinceEpoch}',
    );
  }

  @override
  Future<AppUser> register({
    required String name,
    required String email,
    required String password,
    required String phone,
  }) async {
    await Future<void>.delayed(const Duration(milliseconds: 700));
    return MockData.user.copyWith(
      name: name,
      email: email.trim(),
      phone: phone,
    );
  }

  @override
  Future<AppUser> me(AppUser fallback) async => fallback;

  @override
  Future<AppUser> updateProfile(
    AppUser user,
    Map<String, dynamic> patch,
  ) async {
    await Future<void>.delayed(const Duration(milliseconds: 400));
    return user.copyWith(
      name: patch['name'] as String?,
      phone: patch['phone'] as String?,
      gender: patch['gender'] as String?,
      address: patch['address'] as String?,
      dob: patch['dob'] as String?,
      occupation: patch['occupation'] as String?,
    );
  }

  @override
  Future<void> sendOtp(String phone) async {
    await Future<void>.delayed(const Duration(milliseconds: 500));
  }

  @override
  Future<bool> verifyOtp(String code) async {
    await Future<void>.delayed(const Duration(milliseconds: 500));
    return code == '1234';
  }
}

class MockCatalogRepository implements CatalogRepository {
  @override
  Future<List<InsuranceCompany>> companies() async {
    await Future<void>.delayed(const Duration(milliseconds: 250));
    return MockData.companies;
  }

  @override
  Future<List<InsurancePlan>> plans(String category) async {
    await Future<void>.delayed(const Duration(milliseconds: 200));
    return MockData.plansFor(category);
  }
}

class MockPolicyRepository implements PolicyRepository {
  @override
  Future<List<Policy>> policies() async {
    await Future<void>.delayed(const Duration(milliseconds: 250));
    return MockData.policies;
  }

  @override
  Future<List<ClaimRecord>> claims() async {
    await Future<void>.delayed(const Duration(milliseconds: 250));
    return MockData.claims;
  }
}

class MockUploadRepository implements UploadRepository {
  @override
  Future<String> upload(String filePath, String fileName) async {
    await Future<void>.delayed(const Duration(milliseconds: 450));
    return filePath;
  }
}

class ApiAuthRepository implements AuthRepository {
  ApiAuthRepository(this._client);

  final ApiClient _client;

  @override
  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    final raw = await _client.post(
      '/tenant/auth/login',
      data: {'email': email, 'password': password},
    );
    final data = (raw as Map)['data'] as Map;
    final token = data['token'] as String;
    _client.token = token;
    return AuthSession(user: _userFromJson(data['user']), token: token);
  }

  @override
  Future<AppUser> register({
    required String name,
    required String email,
    required String password,
    required String phone,
  }) async {
    final raw = await _client.post(
      '/tenant/auth/register',
      data: {
        'name': name,
        'email': email,
        'password': password,
        'phone': phone,
      },
    );
    return _userFromJson((raw as Map)['data']);
  }

  @override
  Future<AppUser> me(AppUser fallback) async {
    final raw = await _client.get('/tenant/auth/me');
    return _userFromJson((raw as Map)['data']).copyWith(
      dob: fallback.dob,
      address: fallback.address,
      idNumber: fallback.idNumber,
    );
  }

  @override
  Future<AppUser> updateProfile(
    AppUser user,
    Map<String, dynamic> patch,
  ) async {
    final raw = await _client.patch('/tenant/auth/profile', data: patch);
    return _userFromJson((raw as Map)['data']).copyWith(
      dob: patch['dob'] as String? ?? user.dob,
      gender: patch['gender'] as String? ?? user.gender,
      address: patch['address'] as String? ?? user.address,
      occupation: patch['occupation'] as String? ?? user.occupation,
    );
  }

  @override
  Future<void> sendOtp(String phone) async {
    // Backend SMS/OTP endpoint is not implemented yet.
    await Future<void>.delayed(const Duration(milliseconds: 400));
  }

  @override
  Future<bool> verifyOtp(String code) async {
    // Backend SMS/OTP endpoint is not implemented yet.
    await Future<void>.delayed(const Duration(milliseconds: 400));
    return code == '1234';
  }
}

class ApiCatalogRepository implements CatalogRepository {
  ApiCatalogRepository(this._client);

  final ApiClient _client;

  @override
  Future<List<InsuranceCompany>> companies() async {
    final raw = await _client.get('/tenant/companies');
    final list = ((raw as Map)['data'] as List?) ?? const [];
    return list.map((item) {
      final map = item as Map;
      return InsuranceCompany(
        id: '${map['id']}',
        name: '${map['name'] ?? ''}',
        shortName: '${map['code'] ?? map['name'] ?? ''}',
        logo: '',
        discount: 0,
      );
    }).toList();
  }

  @override
  Future<List<InsurancePlan>> plans(String category) async {
    final raw = await _client.get('/tenant/products', query: {'type': category});
    final list = ((raw as Map)['data'] as List?) ?? const [];
    return list.map((item) {
      final map = item as Map;
      return InsurancePlan(
        id: '${map['id']}',
        title: '${map['name'] ?? 'ແຜນປະກັນໄພ'}',
        subtitle: '${map['companyName'] ?? ''}',
        category: category,
        basePremium: 1945455,
        discount: 10,
        description: '${map['description'] ?? ''}',
        features: const [],
      );
    }).toList();
  }
}

class ApiPolicyRepository implements PolicyRepository {
  ApiPolicyRepository(this._client);

  final ApiClient _client;

  @override
  Future<List<Policy>> policies() async {
    final raw = await _client.get('/tenant/policies');
    final list = ((raw as Map)['data'] as List?) ?? const [];
    return list.map((item) {
      final map = item as Map;
      return Policy(
        id: '${map['id']}',
        number: '${map['policyNumber'] ?? ''}',
        productName: '${map['productName'] ?? 'ປະກັນໄພ'}',
        category: '${map['productType'] ?? 'ປະກັນໄພ'}',
        companyName: '${map['companyName'] ?? ''}',
        companyLogo: '',
        customerName: '${map['customerName'] ?? ''}',
        customerDob: '',
        totalPremium: _num(map['totalPremium']),
        startDate: _date(map['startDate']),
        endDate: _date(map['endDate']),
        status: '${map['status']}' == 'expired'
            ? PolicyStatus.expired
            : PolicyStatus.active,
        vehicleType: '${map['vehiclePlate'] ?? ''}',
      );
    }).toList();
  }

  @override
  Future<List<ClaimRecord>> claims() async {
    final raw = await _client.get('/tenant/claims');
    final list = ((raw as Map)['data'] as List?) ?? const [];
    return list.map((item) {
      final map = item as Map;
      return ClaimRecord(
        number: '${map['claimNumber'] ?? ''}',
        policyNumber: '${map['policyNumber'] ?? ''}',
        title: '${map['type'] ?? 'ເຄມປະກັນໄພ'}',
        amount: _num(map['amount']),
        date: _date(map['incidentDate']),
        status: switch ('${map['status']}') {
          'approved' => ClaimStatus.approved,
          'rejected' => ClaimStatus.rejected,
          _ => ClaimStatus.pending,
        },
      );
    }).toList();
  }
}

class ApiUploadRepository implements UploadRepository {
  ApiUploadRepository(this._client);

  final ApiClient _client;

  @override
  Future<String> upload(String filePath, String fileName) async {
    final raw = await _client.upload(
      '/tenant/uploads',
      filePath: filePath,
      fileName: fileName,
    );
    final data = (raw as Map)['data'];
    if (data is Map && data['path'] is String) return data['path'] as String;
    return filePath;
  }
}

AppUser _userFromJson(dynamic raw) {
  final map = (raw as Map?) ?? const {};
  final name = '${map['name'] ?? map['username'] ?? 'ຜູ້ໃຊ້'}';
  return MockData.user.copyWith(
    id: '${map['id'] ?? 'api-user'}',
    name: name,
    email: '${map['email'] ?? ''}',
    phone: '${map['phone'] ?? ''}',
    avatar: '${map['avatar'] ?? ''}',
  );
}

num _num(dynamic value) {
  if (value is num) return value;
  return num.tryParse('$value') ?? 0;
}

DateTime _date(dynamic value) {
  if (value is String) {
    return DateTime.tryParse(value) ?? DateTime.now();
  }
  return DateTime.now();
}

String mockPolicyNumber() {
  final random = Random();
  return 'WEC-${176000 + random.nextInt(9000)}';
}
