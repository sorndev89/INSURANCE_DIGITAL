import '../core/utils/formatters.dart';

class AppUser {
  const AppUser({
    this.id = 'demo-user',
    this.name = 'Thadsaphone CHANJALERN',
    this.email = 'banktsp9900.t@gmail.com',
    this.phone = '+856 207788445',
    this.dob = '18/8/2001',
    this.gender = 'ຊາຍ',
    this.address = 'ນະຄອນຫຼວງວຽງຈັນ',
    this.idNumber = '575158756',
    this.occupation = 'student',
    this.avatar = '',
    this.points = 2450,
    this.isAgent = false,
  });

  final String id;
  final String name;
  final String email;
  final String phone;
  final String dob;
  final String gender;
  final String address;
  final String idNumber;
  final String occupation;
  final String avatar;
  final int points;
  final bool isAgent;

  String get firstName => name.split(' ').first;
  String get lastName =>
      name.split(' ').length > 1 ? name.split(' ').sublist(1).join(' ') : '';

  AppUser copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    String? dob,
    String? gender,
    String? address,
    String? idNumber,
    String? occupation,
    String? avatar,
    int? points,
    bool? isAgent,
  }) {
    return AppUser(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      dob: dob ?? this.dob,
      gender: gender ?? this.gender,
      address: address ?? this.address,
      idNumber: idNumber ?? this.idNumber,
      occupation: occupation ?? this.occupation,
      avatar: avatar ?? this.avatar,
      points: points ?? this.points,
      isAgent: isAgent ?? this.isAgent,
    );
  }
}

class InsuranceCompany {
  const InsuranceCompany({
    required this.id,
    required this.name,
    required this.shortName,
    required this.logo,
    this.discount = 0,
  });

  final String id;
  final String name;
  final String shortName;
  final String logo;
  final num discount;

  bool get hasLogo => logo.isNotEmpty;
}

class InsurancePlan {
  const InsurancePlan({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.category,
    required this.basePremium,
    required this.discount,
    required this.description,
    required this.features,
  });

  final String id;
  final String title;
  final String subtitle;
  final String category;
  final num basePremium;
  final num discount;
  final String description;
  final List<String> features;

  PremiumQuote get quote => PremiumCalculator.calculate(
    basePremium: basePremium,
    discountPercent: discount,
  );
}

class VehicleType {
  const VehicleType({
    required this.id,
    required this.label,
    required this.icon,
    this.description = '',
  });

  final String id;
  final String label;
  final String icon;
  final String description;
}

class CoverageRow {
  const CoverageRow({
    required this.title,
    required this.limit,
    this.isHeader = false,
  });

  final String title;
  final String limit;
  final bool isHeader;
}

class NewsArticle {
  const NewsArticle({
    required this.id,
    required this.title,
    required this.summary,
    required this.body,
    required this.date,
    required this.image,
    required this.tags,
    this.logo = 'assets/images/insurers/allianz.jpg',
  });

  final String id;
  final String title;
  final String summary;
  final String body;
  final DateTime date;
  final String image;
  final List<String> tags;
  final String logo;
}

class Promotion {
  const Promotion({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.badge,
    required this.image,
  });

  final String id;
  final String title;
  final String subtitle;
  final String badge;
  final String image;
}

class ServiceOffer {
  const ServiceOffer({
    required this.title,
    required this.company,
    required this.description,
    required this.image,
    required this.accent,
  });

  final String title;
  final String company;
  final String description;
  final String image;
  final String accent;
}

enum PolicyStatus {
  active('ກຳລັງຄຸ້ມຄອງ'),
  expired('ໝົດອາຍຸ');

  const PolicyStatus(this.label);
  final String label;
}

class Policy {
  const Policy({
    required this.id,
    required this.number,
    required this.productName,
    required this.category,
    required this.companyName,
    required this.companyLogo,
    required this.customerName,
    required this.customerDob,
    required this.totalPremium,
    required this.startDate,
    required this.endDate,
    required this.status,
    this.vehicleType = '',
    this.paidVia = 'BCEL One',
  });

  final String id;
  final String number;
  final String productName;
  final String category;
  final String companyName;
  final String companyLogo;
  final String customerName;
  final String customerDob;
  final num totalPremium;
  final DateTime startDate;
  final DateTime endDate;
  final PolicyStatus status;
  final String vehicleType;
  final String paidVia;
}

enum ClaimStatus {
  pending('ລໍຖ້າດຳເນີນການ'),
  approved('ອະນຸມັດ'),
  rejected('ປະຕິເສດ');

  const ClaimStatus(this.label);
  final String label;
}

class ClaimRecord {
  const ClaimRecord({
    required this.number,
    required this.policyNumber,
    required this.title,
    required this.amount,
    required this.date,
    required this.status,
  });

  final String number;
  final String policyNumber;
  final String title;
  final num amount;
  final DateTime date;
  final ClaimStatus status;
}

class PurchaseDraft {
  const PurchaseDraft({
    this.category = 'motor',
    this.plan,
    this.vehicleType,
    this.insuredName = '',
    this.phone = '',
    this.address = '',
    this.dob = '',
    this.gender = 'ຊາຍ',
    this.documentType = 'ບັດປະຈຳໂຕ',
    this.documentNumber = '',
    this.vehicleUsage = '',
    this.vehicleBrand = '',
    this.vehicleModel = '',
    this.plateNumber = '',
    this.engineNumber = '',
    this.chassisNumber = '',
    this.capacity = '',
    this.idCardUploaded = false,
    this.vehicleBookUploaded = false,
    this.propertyAddress = '',
    this.propertyValue = '',
    this.healthMembers = '1',
  });

  final String category;
  final InsurancePlan? plan;
  final VehicleType? vehicleType;

  final String insuredName;
  final String phone;
  final String address;
  final String dob;
  final String gender;
  final String documentType;
  final String documentNumber;

  final String vehicleUsage;
  final String vehicleBrand;
  final String vehicleModel;
  final String plateNumber;
  final String engineNumber;
  final String chassisNumber;
  final String capacity;
  final bool idCardUploaded;
  final bool vehicleBookUploaded;

  final String propertyAddress;
  final String propertyValue;
  final String healthMembers;

  bool get isMotor => category == 'motor';
  bool get isHealth => category == 'health';
  bool get isProperty => category == 'property';

  String get categoryLabel {
    switch (category) {
      case 'health':
        return 'ປະກັນໄພສຸຂະພາບ';
      case 'property':
        return 'ປະກັນໄພຊັບສິນ';
      default:
        return 'ປະກັນໄພລົດ';
    }
  }

  PremiumQuote get quote =>
      plan?.quote ??
      PremiumCalculator.calculate(basePremium: 1945455, discountPercent: 30);

  PurchaseDraft copyWith({
    String? category,
    InsurancePlan? plan,
    VehicleType? vehicleType,
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
    return PurchaseDraft(
      category: category ?? this.category,
      plan: plan ?? this.plan,
      vehicleType: vehicleType ?? this.vehicleType,
      insuredName: insuredName ?? this.insuredName,
      phone: phone ?? this.phone,
      address: address ?? this.address,
      dob: dob ?? this.dob,
      gender: gender ?? this.gender,
      documentType: documentType ?? this.documentType,
      documentNumber: documentNumber ?? this.documentNumber,
      vehicleUsage: vehicleUsage ?? this.vehicleUsage,
      vehicleBrand: vehicleBrand ?? this.vehicleBrand,
      vehicleModel: vehicleModel ?? this.vehicleModel,
      plateNumber: plateNumber ?? this.plateNumber,
      engineNumber: engineNumber ?? this.engineNumber,
      chassisNumber: chassisNumber ?? this.chassisNumber,
      capacity: capacity ?? this.capacity,
      idCardUploaded: idCardUploaded ?? this.idCardUploaded,
      vehicleBookUploaded: vehicleBookUploaded ?? this.vehicleBookUploaded,
      propertyAddress: propertyAddress ?? this.propertyAddress,
      propertyValue: propertyValue ?? this.propertyValue,
      healthMembers: healthMembers ?? this.healthMembers,
    );
  }
}

class AgentApplication {
  const AgentApplication({
    required this.fullName,
    required this.phone,
    required this.email,
    required this.province,
    required this.experience,
    required this.motivation,
  });

  final String fullName;
  final String phone;
  final String email;
  final String province;
  final String experience;
  final String motivation;
}
