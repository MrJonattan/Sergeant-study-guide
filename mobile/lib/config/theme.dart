import 'package:flutter/material.dart';

class AppTheme {
  AppTheme._();

  // Brand colors matching web app CSS
  static const Color primary = Color(0xFF1E3A5F);
  static const Color accent = Color(0xFF3B82F6);
  static const Color sergeant = Color(0xFFCA8A04);
  static const Color examAlert = Color(0xFFDC2626);

  // Light mode
  static const Color lightBackground = Color(0xFFFAFAFA);
  static const Color lightCard = Color(0xFFFFFFFF);
  static const Color lightSurface = Color(0xFFF5F5F5);
  static const Color lightText = Color(0xFF1A1A2E);
  static const Color lightTextSecondary = Color(0xFF6B7280);

  // Dark mode
  static const Color darkBackground = Color(0xFF0F1117);
  static const Color darkCard = Color(0xFF1A1B26);
  static const Color darkSurface = Color(0xFF24253A);
  static const Color darkText = Color(0xFFE2E8F0);
  static const Color darkTextSecondary = Color(0xFF94A3B8);

  static final ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: ColorScheme.light(
      primary: primary,
      secondary: accent,
      error: examAlert,
      surface: lightSurface,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: lightText,
    ),
    scaffoldBackgroundColor: lightBackground,
    cardTheme: const CardThemeData(
      color: lightCard,
      elevation: 1,
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(12)),
      ),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: primary,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: Colors.white,
      ),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: lightCard,
      selectedItemColor: primary,
      unselectedItemColor: lightTextSecondary,
      type: BottomNavigationBarType.fixed,
      elevation: 8,
    ),
    chipTheme: ChipThemeData(
      backgroundColor: lightSurface,
      selectedColor: accent.withValues(alpha: 0.2),
      labelStyle: const TextStyle(color: lightText),
    ),
    textTheme: const TextTheme(
      headlineLarge: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: lightText),
      headlineMedium: TextStyle(fontSize: 24, fontWeight: FontWeight.w600, color: lightText),
      headlineSmall: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: lightText),
      titleLarge: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: lightText),
      titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: lightText),
      bodyLarge: TextStyle(fontSize: 16, color: lightText),
      bodyMedium: TextStyle(fontSize: 14, color: lightText),
      bodySmall: TextStyle(fontSize: 12, color: lightTextSecondary),
    ),
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: accent,
      foregroundColor: Colors.white,
    ),
  );

  static final ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: ColorScheme.dark(
      primary: accent,
      secondary: sergeant,
      error: examAlert,
      surface: darkSurface,
      onPrimary: Colors.white,
      onSecondary: Colors.black,
      onSurface: darkText,
    ),
    scaffoldBackgroundColor: darkBackground,
    cardTheme: const CardThemeData(
      color: darkCard,
      elevation: 2,
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(12)),
      ),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: darkCard,
      foregroundColor: darkText,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: darkText,
      ),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: darkCard,
      selectedItemColor: accent,
      unselectedItemColor: darkTextSecondary,
      type: BottomNavigationBarType.fixed,
      elevation: 8,
    ),
    chipTheme: ChipThemeData(
      backgroundColor: darkSurface,
      selectedColor: accent.withValues(alpha: 0.3),
      labelStyle: const TextStyle(color: darkText),
    ),
    textTheme: const TextTheme(
      headlineLarge: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: darkText),
      headlineMedium: TextStyle(fontSize: 24, fontWeight: FontWeight.w600, color: darkText),
      headlineSmall: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: darkText),
      titleLarge: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: darkText),
      titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: darkText),
      bodyLarge: TextStyle(fontSize: 16, color: darkText),
      bodyMedium: TextStyle(fontSize: 14, color: darkText),
      bodySmall: TextStyle(fontSize: 12, color: darkTextSecondary),
    ),
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: accent,
      foregroundColor: Colors.white,
    ),
  );
}