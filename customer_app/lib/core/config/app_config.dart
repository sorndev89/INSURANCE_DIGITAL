class AppConfig {
  AppConfig._();

  static const appName = 'SAIYFON INSURANCE DIGITAL';
  static const slogan = 'ເລື່ອງປະກັນໄພ ຄົບ ແລະ ຈົບຢູ່ບ່ອນດຽວ';
  static const version = '1.0.2';

  static const useMock = bool.fromEnvironment('USE_MOCK', defaultValue: true);
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:5055/api',
  );
  static const tenantSlug = String.fromEnvironment(
    'TENANT_SLUG',
    defaultValue: 'saiyfon',
  );

  static const supportPhone = '021 633 222';
  static const supportMobile = '030 5054 234';
}
