import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SessionStore {
  SessionStore._();

  static final instance = SessionStore._();

  static const _tokenKey = 'saiyfon_token';
  static const _localeKey = 'saiyfon_locale';
  static const _onboardedKey = 'saiyfon_onboarded';

  final _secure = const FlutterSecureStorage();

  Future<String?> readToken() async {
    try {
      return await _secure.read(key: _tokenKey);
    } catch (_) {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString(_tokenKey);
    }
  }

  Future<void> writeToken(String token) async {
    try {
      await _secure.write(key: _tokenKey, value: token);
    } catch (_) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_tokenKey, token);
    }
  }

  Future<void> clearToken() async {
    try {
      await _secure.delete(key: _tokenKey);
    } catch (_) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_tokenKey);
    }
  }

  Future<String> readLocale() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_localeKey) ?? 'lo';
  }

  Future<void> writeLocale(String locale) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_localeKey, locale);
  }

  Future<bool> readOnboarded() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_onboardedKey) ?? false;
  }

  Future<void> writeOnboarded() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_onboardedKey, true);
  }
}
