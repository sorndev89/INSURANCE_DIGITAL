import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  static const primary = Color(0xFF006838);
  static const primaryDark = Color(0xFF044D29);
  static const primaryLight = Color(0xFF0B8A4C);
  static const accentSoft = Color(0xFFE8F5E9);
  static const mint = Color(0xFFF0FDF4);
  static const slate = Color(0xFF2D3142);
  static const danger = Color(0xFFD32F2F);
  static const dangerSoft = Color(0xFFFEE2E2);
  static const amber = Color(0xFFF59E0B);
  static const amberSoft = Color(0xFFFEF3C7);
  static const success = Color(0xFF10B981);
  static const successSoft = Color(0xFFD1FAE5);
  static const text = Color(0xFF1E293B);
  static const muted = Color(0xFF64748B);
  static const hint = Color(0xFF94A3B8);
  static const border = Color(0xFFE2E8F0);
  static const divider = Color(0xFFF1F5F9);
  static const surface = Color(0xFFFFFFFF);
  static const background = Color(0xFFF8FAFC);

  static const headerGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primaryDark, primary, primaryLight],
  );

  static const promoGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF044D29), Color(0xFF0B8A4C)],
  );
}
