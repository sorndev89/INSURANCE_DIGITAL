import 'package:flutter/material.dart';

import 'app_colors.dart';

class AppTheme {
  AppTheme._();

  static const fontFamily = 'NotoSansLaoUI';

  static ThemeData get light {
    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: Brightness.light,
      primary: AppColors.primary,
      secondary: AppColors.slate,
      surface: AppColors.surface,
      error: AppColors.danger,
    );

    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: scheme,
      fontFamily: fontFamily,
      scaffoldBackgroundColor: AppColors.background,
      splashFactory: InkSparkle.splashFactory,
    );

    return base.copyWith(
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        surfaceTintColor: Colors.transparent,
        titleTextStyle: TextStyle(
          fontFamily: fontFamily,
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: Colors.white,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surface,
        hintStyle: const TextStyle(
          fontFamily: fontFamily,
          color: AppColors.hint,
          fontSize: 14,
        ),
        labelStyle: const TextStyle(
          fontFamily: fontFamily,
          color: AppColors.muted,
          fontSize: 14,
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.6),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.danger),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.danger, width: 1.6),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          minimumSize: const Size.fromHeight(52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(
            fontFamily: fontFamily,
            fontSize: 16,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          minimumSize: const Size.fromHeight(52),
          side: const BorderSide(color: AppColors.primary, width: 1.4),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(
            fontFamily: fontFamily,
            fontSize: 16,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          textStyle: const TextStyle(
            fontFamily: fontFamily,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.divider,
        thickness: 1,
        space: 1,
      ),
      cardTheme: CardThemeData(
        color: AppColors.surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.border),
        ),
      ),
      chipTheme: base.chipTheme.copyWith(
        backgroundColor: AppColors.accentSoft,
        labelStyle: const TextStyle(
          fontFamily: fontFamily,
          color: AppColors.primary,
          fontWeight: FontWeight.w600,
        ),
        side: BorderSide.none,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.slate,
        contentTextStyle: const TextStyle(fontFamily: fontFamily, color: Colors.white),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      textTheme: base.textTheme
          .apply(
            fontFamily: fontFamily,
            bodyColor: AppColors.text,
            displayColor: AppColors.text,
          )
          .copyWith(
            headlineLarge: const TextStyle(
              fontFamily: fontFamily,
              fontSize: 30,
              fontWeight: FontWeight.w800,
              height: 1.25,
              color: AppColors.text,
            ),
            headlineMedium: const TextStyle(
              fontFamily: fontFamily,
              fontSize: 24,
              fontWeight: FontWeight.w800,
              height: 1.3,
              color: AppColors.text,
            ),
            titleLarge: const TextStyle(
              fontFamily: fontFamily,
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: AppColors.text,
            ),
            titleMedium: const TextStyle(
              fontFamily: fontFamily,
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.text,
            ),
            bodyLarge: const TextStyle(
              fontFamily: fontFamily,
              fontSize: 15,
              height: 1.55,
              color: AppColors.text,
            ),
            bodyMedium: const TextStyle(
              fontFamily: fontFamily,
              fontSize: 14,
              height: 1.5,
              color: AppColors.text,
            ),
            bodySmall: const TextStyle(
              fontFamily: fontFamily,
              fontSize: 12,
              height: 1.45,
              color: AppColors.muted,
            ),
          ),
    );
  }
}
