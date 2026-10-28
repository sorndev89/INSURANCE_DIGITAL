import 'models.dart';

class MockData {
  MockData._();

  static const user = AppUser();

  static const companies = <InsuranceCompany>[
    InsuranceCompany(
      id: 'dhipaya',
      name: 'ທິບພະຍະປະກັນໄພ',
      shortName: 'Dhipaya',
      logo: 'assets/images/insurers/dhipaya.jpeg',
      discount: 25,
    ),
    InsuranceCompany(
      id: 'lanexang',
      name: 'ລ້ານຊ້າງປະກັນໄພ',
      shortName: 'Lanexang',
      logo: 'assets/images/insurers/lanexang.png',
      discount: 10,
    ),
    InsuranceCompany(
      id: 'apa',
      name: 'ພົງສະຫວັນປະກັນໄພ',
      shortName: 'APA',
      logo: 'assets/images/insurers/apa.png',
      discount: 10,
    ),
    InsuranceCompany(
      id: 'forte',
      name: 'ຟໍເຕ-ໂຕໂກປະກັນໄພ',
      shortName: 'Forte Toko',
      logo: 'assets/images/insurers/forte.jpg',
      discount: 10,
    ),
    InsuranceCompany(
      id: 'allianz',
      name: 'ອາລິອັນສ໌ປະກັນໄພລາວ',
      shortName: 'Allianz',
      logo: 'assets/images/insurers/allianz.jpg',
      discount: 30,
    ),
    InsuranceCompany(
      id: 'lvi',
      name: 'ລາວ-ຫວຽດປະກັນໄພ',
      shortName: 'LVI',
      logo: 'assets/images/insurers/lvi.jpg',
      discount: 15,
    ),
    InsuranceCompany(
      id: 'sokxay',
      name: 'ໂຊກໄຊປະກັນໄພ',
      shortName: 'Sokxay',
      logo: 'assets/images/insurers/sokxay.jpg',
      discount: 10,
    ),
    InsuranceCompany(
      id: 'vientiane',
      name: 'ວຽງຈັນປະກັນໄພ',
      shortName: 'Vientiane',
      logo: 'assets/images/insurers/viengchan.jpg',
    ),
    InsuranceCompany(
      id: 'stthai',
      name: 'ເອັສທີ-ເມືອງໄທປະກັນໄພ',
      shortName: 'ST-Muang Thai',
      logo: 'assets/images/insurers/stthai.png',
      discount: 15,
    ),
    InsuranceCompany(
      id: 'laovivat',
      name: 'ລາວວິວັດປະກັນໄພ',
      shortName: 'Lao Vivat',
      logo: '',
    ),
    InsuranceCompany(
      id: 'zhongji',
      name: 'ຈົງຈິງປະກັນໄພ',
      shortName: 'Zhongji',
      logo: '',
    ),
    InsuranceCompany(
      id: 'laothep',
      name: 'ລາວເທບຈະເລີນ',
      shortName: 'Laothepchalern',
      logo: 'assets/images/insurers/laothepchalern.png',
    ),
    InsuranceCompany(
      id: 'bangkok',
      name: 'ກຸງເທບປະກັນໄພ',
      shortName: 'Bangkok',
      logo: '',
    ),
    InsuranceCompany(
      id: 'tki',
      name: 'ທີເຄໄອປະກັນໄພ',
      shortName: 'TKI',
      logo: '',
    ),
    InsuranceCompany(
      id: 'bsh',
      name: 'ບີເອັສເຮັສປະກັນໄພ',
      shortName: 'BSH',
      logo: 'assets/images/insurers/bsh.jpg',
    ),
    InsuranceCompany(
      id: 'gic',
      name: 'ສາກົນປະກັນໄພ',
      shortName: 'GIC',
      logo: '',
    ),
    InsuranceCompany(
      id: 'laochina',
      name: 'ລາວຈີນປາຊີຟິກ',
      shortName: 'Lao-China Pacific',
      logo: '',
    ),
  ];

  static const motorPlans = <InsurancePlan>[
    InsurancePlan(
      id: 'motor-third-party',
      title: 'ປະກັນຮັບຜິດຊອບຕໍ່ບຸກຄົນທີສາມ',
      subtitle: 'Third-Party Liability',
      category: 'motor',
      basePremium: 1945455,
      discount: 30,
      description: 'ຄຸ້ມຄອງຄວາມຮັບຜິດຊອບທາງແພ່ງຕໍ່ບຸກຄົນທີສາມ ແລະ ຜູ້ຂັບຂີ່',
      features: [
        'ຄວາມເສຍຫາຍດ້ານຮ່າງກາຍ 101,400,000 ກີບ',
        'ເສຍຊີວິດ/ພິການ 12,000,000 ກີບ/ຄົນ',
        'ຄ່າປິ່ນປົວ 1,800,000 ກີບ/ຄົນ',
        'ຄຸ້ມຄອງຜູ້ຂັບຂີ່ 30,000,000 ກີບ',
      ],
    ),
    InsurancePlan(
      id: 'motor-type-2',
      title: 'ປະກັນຮັບຜິດຊອບຊັ້ນສອງ',
      subtitle: 'Type 2',
      category: 'motor',
      basePremium: 2890000,
      discount: 25,
      description: 'ຄຸ້ມຄອງຄວາມຮັບຜິດຊອບຕໍ່ບຸກຄົນທີສາມ ແລະ ຕົວລົດ',
      features: [
        'ຄຸ້ມຄອງຄວາມຮັບຜິດຊອບຕໍ່ບຸກຄົນທີສາມ',
        'ຄຸ້ມຄອງຕົວລົດໃນກໍລະນີລົດຊົນກັນ',
        'ບໍ່ລວມການສູນເສຍຈາກໄຟໄໝ້ ແລະ ການລັກ',
      ],
    ),
    InsurancePlan(
      id: 'motor-type-1-package',
      title: 'ປະກັນຊັ້ນໜຶ່ງແບບ Package',
      subtitle: 'Type 1 Package',
      category: 'motor',
      basePremium: 3780000,
      discount: 20,
      description: 'ປະກັນຊັ້ນໜຶ່ງແບບກຳຈັດວົງເງິນ ເໝາະສຳລັບລົດໃໝ່',
      features: [
        'ຄຸ້ມຄອງຕົວລົດຄົບຖ້ວນ',
        'ຄຸ້ມຄອງບຸກຄົນທີສາມ',
        'ບໍລິການລາກລົດ 24 ຊົ່ວໂມງ',
        'ວົງເງິນຄຸ້ມຄອງສູງສຸດ 3,000,000 ກີບ',
      ],
    ),
    InsurancePlan(
      id: 'motor-type-1-comprehensive',
      title: 'ປະກັນຊັ້ນໜຶ່ງແບບຮອບດ້ານ',
      subtitle: 'Type 1 Comprehensive',
      category: 'motor',
      basePremium: 4680000,
      discount: 15,
      description: 'ຄຸ້ມຄອງຮອບດ້ານ ລວມໄພທຳມະຊາດ ແລະ ອຸບັດຕິເຫດ',
      features: [
        'ຄຸ້ມຄອງຕົວລົດແບບຮອບດ້ານ',
        'ຄຸ້ມຄອງໄພທຳມະຊາດ',
        'ຄຸ້ມຄອງບຸກຄົນທີສາມສູງສຸດ',
        'ບໍລິການຊ່ວຍເຫຼືອສຸກເສີນ',
      ],
    ),
  ];

  static const healthPlans = <InsurancePlan>[
    InsurancePlan(
      id: 'health-basic',
      title: 'ແຜນສຸຂະພາບ Basics',
      subtitle: 'Health Basic',
      category: 'health',
      basePremium: 1200000,
      discount: 10,
      description: 'ຄຸ້ມຄອງການປິ່ນປົວພື້ນຖານ ແລະ ອຸບັດຕິເຫດ',
      features: ['ຄຸ້ມຄອງຜູ້ເອົາປະກັນ 1 ຄົນ', 'ວົງເງິນສູງສຸດ 50,000,000 ກີບ'],
    ),
    InsurancePlan(
      id: 'health-plus',
      title: 'ແຜນສຸຂະພາບ Plus',
      subtitle: 'Health Plus',
      category: 'health',
      basePremium: 2400000,
      discount: 15,
      description: 'ຄຸ້ມຄອງການປິ່ນປົວຄົບຖ້ວນ ລວມການນອນໂຮງໝໍ',
      features: ['ວົງເງິນສູງສຸດ 120,000,000 ກີບ', 'ກວດສຸຂະພາບປະຈຳປີ'],
    ),
    InsurancePlan(
      id: 'health-family',
      title: 'ແຜນສຸຂະພາບ ຄອບຄົວ',
      subtitle: 'Health Family',
      category: 'health',
      basePremium: 4800000,
      discount: 20,
      description: 'ຄຸ້ມຄອງສະມາຊິກໃນຄອບຄົວສູງສຸດ 5 ຄົນ',
      features: ['ຄຸ້ມຄອງສະມາຊິກໃນຄອບຄົວ', 'ວົງເງິນສູງສຸດ 250,000,000 ກີບ'],
    ),
  ];

  static const propertyPlans = <InsurancePlan>[
    InsurancePlan(
      id: 'property-home',
      title: 'ປະກັນໄພທີ່ຢູ່ອາໄສ',
      subtitle: 'Home Insurance',
      category: 'property',
      basePremium: 1500000,
      discount: 10,
      description: 'ຄຸ້ມຄອງເຮືອນ ແລະ ຊັບສິນພາຍໃນ',
      features: ['ອັກຄີໄພ ແລະ ລັກຊັບສິນ', 'ຄວາມເສຍຫາຍຈາກນ້ຳ-ລົມພາຍຸ'],
    ),
    InsurancePlan(
      id: 'property-business',
      title: 'ປະກັນໄພຊັບສິນ ຮອບດ້ານ',
      subtitle: 'Business Property',
      category: 'property',
      basePremium: 3000000,
      discount: 15,
      description: 'ຄຸ້ມຄອງທຸລະກິດ ແລະ ອຸດສາຫະກຳ',
      features: ['ຄຸ້ມຄອງອາຄານ ແລະ ເຄື່ອງຈັກ', 'ຄວາມຮັບຜິດຊອບຕໍ່ບຸກຄົນທີສາມ'],
    ),
    InsurancePlan(
      id: 'property-premium',
      title: 'ປະກັນໄພຊັບສິນ Premium',
      subtitle: 'Property Premium',
      category: 'property',
      basePremium: 6000000,
      discount: 20,
      description: 'ຄຸ້ມຄອງຊັບສິນມູນຄ່າສູງ ແລະ ທຸລະກິດຂະໜາດໃຫຍ່',
      features: ['ວົງເງິນຄຸ້ມຄອງສູງສຸດ 2,000,000,000 ກີບ', 'ບໍລິການປະເມີນຄວາມສ່ຽງ'],
    ),
  ];

  static List<InsurancePlan> plansFor(String category) {
    switch (category) {
      case 'health':
        return healthPlans;
      case 'property':
        return propertyPlans;
      default:
        return motorPlans;
    }
  }

  static const vehicleTypes = <VehicleType>[
    VehicleType(id: 'sedan', label: 'ລົດເກັງ', icon: 'assets/icons/car.svg', description: 'Sedan'),
    VehicleType(id: 'pickup', label: 'ລົດກະບະ', icon: 'assets/icons/pickup-truck.svg', description: 'Pickup'),
    VehicleType(id: 'suv', label: 'ລົດຈິບ', icon: 'assets/icons/car.svg', description: 'SUV / Jeep'),
    VehicleType(id: 'van', label: 'ລົດຕູ້', icon: 'assets/icons/van.svg', description: 'Van'),
    VehicleType(id: 'truck', label: 'ລົດບັນທຸກ', icon: 'assets/icons/pickup-truck.svg', description: 'Truck'),
    VehicleType(id: 'bus', label: 'ລົດເມ 10-45 ບ່ອນ', icon: 'assets/icons/bus.svg', description: 'Bus'),
  ];

  static const coverageRows = <CoverageRow>[
    CoverageRow(title: '1. ຄວາມຮັບຜິດຊອບທາງແພ່ງຕໍ່ບຸກຄົນທີສາມ', limit: '', isHeader: true),
    CoverageRow(title: 'ຄວາມເສຍຫາຍດ້ານຮ່າງກາຍສູງສຸດ/ອຸບັດຕິເຫດ', limit: '101,400,000 ກີບ'),
    CoverageRow(title: 'ເສຍຊີວິດ / ພິການຖາວອນ, ສູງສຸດຕໍ່ຄົນ', limit: '12,000,000 ກີບ'),
    CoverageRow(title: 'ຄ່າປິ່ນປົວ, ສູງສຸດ / ຄົນ', limit: '1,800,000 ກີບ'),
    CoverageRow(title: 'ຄ່າອອກໂຮງໝໍ', limit: '100,000 ກີບ'),
    CoverageRow(title: 'ຄວາມເສຍຫາຍດ້ານວັດຖຸ, ສູງສຸດ / ຄົນ', limit: '5,200,000 ກີບ'),
    CoverageRow(title: '2. ຜູ້ຂັບຂີ່', limit: '', isHeader: true),
    CoverageRow(title: 'ເສຍຊີວິດ / ພິການຖາວອນ, ສູງສຸດ', limit: '30,000,000 ກີບ'),
    CoverageRow(title: 'ຄ່າປິ່ນປົວ, ສູງສຸດ', limit: '3,000,000 ກີບ'),
    CoverageRow(title: '3. ຄ້ຳປະກັນການປົກປ້ອງສິດ ສູງສຸດ/ອຸບັດຕິເຫດ', limit: '150,000 ກີບ'),
    CoverageRow(title: '4. ຄວາມເສຍຫາຍຕໍ່ຕົວລົດທີ່ເອົາປະກັນໄພ', limit: '0 ກີບ'),
    CoverageRow(title: '5. ການເສຍຊີວິດຂອງຄົນໃນຄອບຄົວ', limit: '0 ກີບ'),
    CoverageRow(title: '6. ຄ່າປິ່ນປົວຄົນໃນຄອບຄົວ', limit: '0 ກີບ'),
  ];

  static final news = <NewsArticle>[
    NewsArticle(
      id: 'home-insurance',
      title: 'Home Insurance ໃຫ້ທ່ານອຸ່ນໃຈ ແລະ ໝັ້ນໃຈ ຈາກອັກຄີໄພ ແລະ ໄພອື່ນໆ',
      summary:
          'ປະກັນໄພທີ່ຢູ່ອາໄສ ໃຫ້ທ່ານອຸ່ນໃຈ ແລະ ໝັ້ນໃຈ ຖ້າມີຄວາມເສຍຫາຍເກີດຂຶ້ນກັບຊັບສິນ...',
      body:
          'ບໍ່ວ່າຈະເປັນອັກຄີໄພ, ຄວາມເສຍຫາຍຈາກນ້ຳ ແລະ ລົມພາຍຸ, ແກ້ວແວ່ນແຕກ, ຫຼື ການລັກຊັບສິນ, ປະກັນໄພທີ່ຢູ່ອາໄສ ຈະຊ່ວຍໃຫ້ທ່ານອຸ່ນໃຈ ແລະ ກັບຄືນສູ່ຊີວິດປະຈຳວັນໄດ້ໄວຂຶ້ນ.',
      date: DateTime(2026, 10, 11, 10, 30),
      image: 'assets/images/promos/promo_2.png',
      tags: ['#MyInsuranceApp', '#AllianzLaos', '#HomeInsurance'],
    ),
    NewsArticle(
      id: 'life-protection',
      title: 'ປະກັນຊີວິດແບບອຸ່ນໃຈ-ຫາຍຫ່ວງ ຄຸ້ມຄອງສູງສຸດ 500 ລ້ານກີບ',
      summary:
          'Life Protection Insurance ຄຸ້ມຄອງສູງສຸດ 500 ລ້ານກີບ ພ້ອມຜົນປະໂຫຍດຄອບຄົວ...',
      body:
          'ແຜນປະກັນຊີວິດແບບໃໝ່ ມອບຄວາມສະຫງົບໃຈໃຫ້ຄອບຄົວ ດ້ວຍຄວາມຄຸ້ມຄອງສູງສຸດ 500 ລ້ານກີບ ແລະ ຕົວເລືອກການຈ່າຍເບ້ຍທີ່ຍືດຫຍຸ່ນ.',
      date: DateTime(2026, 10, 9, 9, 15),
      image: 'assets/images/promos/promo_4.png',
      tags: ['#LifeProtection', '#FamilyFirst'],
    ),
    NewsArticle(
      id: 'allianz-run',
      title: 'ທີມງານອາລິອັນສ໌ ຮ່ວມແລ່ນເພື່ອເດັກນ້ອຍ 385 ກິໂລແມັດ',
      summary:
          'ທີມງານອາລິອັນສ໌ຂໍເປັນສ່ວນຮ່ວມຕ້ອນຮັບທີມນັກກິລາແລ່ນ 385 ກິໂລແມັດ...',
      body:
          'ກິດຈະກຳແລ່ນເພື່ອສະຫະສະມາຄົມເດັກນ້ອຍ ໄດ້ຮັບການສະໜັບສະໜູນຈາກອາລິອັນສ໌ ລາວ ດ້ວຍການສະໜອງປະກັນໄພອຸບັດຕິເຫດໃຫ້ນັກກິລາທຸກຄົນ.',
      date: DateTime(2026, 10, 6, 14, 0),
      image: 'assets/images/promos/promo_7.png',
      tags: ['#AllianzLaos', '#RunForChildren'],
    ),
  ];

  static const promotions = <Promotion>[
    Promotion(
      id: 'promo-coffee',
      title: 'ຮັບຟຣີ! ຈອກໃສ່ກາເຟ ສຸດ Premium 1 ໜ່ວຍ',
      subtitle: 'ພຽງຊື້ ຫຼື ຕໍ່ສັນຍາປະກັນໄພໃໝ່',
      badge: 'Allianz',
      image: 'assets/images/promos/promo_1.png',
    ),
    Promotion(
      id: 'promo-property',
      title: 'ອຸ່ນໃຈກັບ ປະກັນໄພຊັບສິນ ຮອບດ້ານ',
      subtitle: 'ຄຸ້ມກັນທຸລະກິດ ແລະ ອຸດສາຫະກຳຂອງທ່ານຢ່າງຮອບດ້ານ',
      badge: 'Allianz',
      image: 'assets/images/promos/promo_5.png',
    ),
    Promotion(
      id: 'promo-home',
      title: 'The Best PRODUCT FOR YOUR HOME',
      subtitle: '50% DISCOUNT 24/7',
      badge: 'Home',
      image: 'assets/images/promos/promo_2.png',
    ),
  ];

  static const services = <ServiceOffer>[
    ServiceOffer(
      title: 'ອຸ່ນໃຈກັບ ປະກັນໄພຊັບສິນ ຮອບດ້ານ',
      company: 'Allianz',
      description: 'ຄຸ້ມກັນທຸລະກິດ ແລະ ອຸດສາຫະກຳ ຢ່າງຮອບດ້ານ',
      image: 'assets/images/insurers/allianz.jpg',
      accent: '#006838',
    ),
    ServiceOffer(
      title: 'ເດີນທາງແບບສະບາຍໃຈ ກັບປະກັນໄພຍານພາຫະນະ',
      company: 'FORTE TOKO',
      description: 'ຄຸ້ມຄອງລົດຂອງທ່ານ ພ້ອມບໍລິການຊ່ວຍເຫຼືອ 24/7',
      image: 'assets/images/insurers/forte.jpg',
      accent: '#2D3142',
    ),
    ServiceOffer(
      title: 'ປະກັນໄພສຸຂະພາບລະຫວ່າງປະເທດ',
      company: 'FigTree Blue',
      description: 'ເລີ່ມຕົ້ນ 0.55\$ / ມື້, ຄຸ້ມກັນ 30,000\$',
      image: '',
      accent: '#0B6B3A',
    ),
  ];

  static final policies = <Policy>[
    Policy(
      id: 'policy-1',
      number: 'WEC-176482',
      productName: 'ປະກັນໄພລົດກະບະ',
      category: 'ປະກັນໄພລົດ',
      companyName: 'ອາລິອັນສ໌ປະກັນໄພລາວ',
      companyLogo: 'assets/images/insurers/allianz.jpg',
      customerName: 'thadsaphone',
      customerDob: '18/8/2001',
      totalPremium: 1400000,
      startDate: DateTime(2026, 10, 20),
      endDate: DateTime(2027, 10, 19),
      status: PolicyStatus.active,
      vehicleType: 'ລົດກະບະ',
    ),
    Policy(
      id: 'policy-2',
      number: 'WEC-176519',
      productName: 'ປະກັນໄພລົດຈິບ',
      category: 'ປະກັນໄພລົດ',
      companyName: 'ທິບພະຍະປະກັນໄພ',
      companyLogo: 'assets/images/insurers/dhipaya.jpeg',
      customerName: 'thadsaphone',
      customerDob: '18/8/2001',
      totalPremium: 2450000,
      startDate: DateTime(2026, 8, 1),
      endDate: DateTime(2027, 7, 31),
      status: PolicyStatus.active,
      vehicleType: 'ລົດຈິບ',
    ),
    Policy(
      id: 'policy-3',
      number: 'WEC-162011',
      productName: 'ປະກັນໄພສຸຂະພາບ Plus',
      category: 'ປະກັນໄພສຸຂະພາບ',
      companyName: 'ພົງສະຫວັນປະກັນໄພ',
      companyLogo: 'assets/images/insurers/apa.png',
      customerName: 'thadsaphone',
      customerDob: '18/8/2001',
      totalPremium: 1980000,
      startDate: DateTime(2025, 5, 12),
      endDate: DateTime(2026, 5, 11),
      status: PolicyStatus.expired,
    ),
    Policy(
      id: 'policy-4',
      number: 'WEC-150895',
      productName: 'ປະກັນໄພທີ່ຢູ່ອາໄສ',
      category: 'ປະກັນໄພຊັບສິນ',
      companyName: 'ລ້ານຊ້າງປະກັນໄພ',
      companyLogo: 'assets/images/insurers/lanexang.png',
      customerName: 'thadsaphone',
      customerDob: '18/8/2001',
      totalPremium: 1350000,
      startDate: DateTime(2024, 11, 5),
      endDate: DateTime(2025, 11, 4),
      status: PolicyStatus.expired,
    ),
  ];

  static final claims = <ClaimRecord>[
    ClaimRecord(
      number: 'CLM-2026-0081',
      policyNumber: 'WEC-176482',
      title: 'ຄວາມເສຍຫາຍບໍລິເວນປະຕູລົດ',
      amount: 850000,
      date: DateTime(2026, 10, 18),
      status: ClaimStatus.pending,
    ),
    ClaimRecord(
      number: 'CLM-2026-0074',
      policyNumber: 'WEC-176519',
      title: 'ອຸບັດຕິເຫດນ້ອຍ ກະຈົກຫຼັງ',
      amount: 420000,
      date: DateTime(2026, 9, 2),
      status: ClaimStatus.approved,
    ),
    ClaimRecord(
      number: 'CLM-2025-0198',
      policyNumber: 'WEC-162011',
      title: 'ການກວດສຸຂະພາບປະຈຳປີ',
      amount: 300000,
      date: DateTime(2025, 12, 14),
      status: ClaimStatus.rejected,
    ),
  ];
}
