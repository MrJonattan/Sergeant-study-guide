import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../config/constants.dart';

class ThemeNotifier extends StateNotifier<ThemeMode> {
  ThemeNotifier() : super(ThemeMode.system) {
    _loadSavedTheme();
  }

  /// Loads the previously saved theme preference.
  Future<void> _loadSavedTheme() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedTheme = prefs.getString(AppConstants.settingsBoxName + '_theme');

      if (savedTheme != null) {
        state = _parseThemeMode(savedTheme);
      }
    } catch (e) {
      debugPrint('Failed to load theme preference: $e');
      // Default to system theme on error
    }
  }

  /// Sets the theme to light mode.
  Future<void> setLightMode() async {
    state = ThemeMode.light;
    await _saveTheme('light');
  }

  /// Sets the theme to dark mode.
  Future<void> setDarkMode() async {
    state = ThemeMode.dark;
    await _saveTheme('dark');
  }

  /// Sets the theme to follow the system setting.
  Future<void> setSystemMode() async {
    state = ThemeMode.system;
    await _saveTheme('system');
  }

  /// Toggles between light and dark (ignoring system).
  Future<void> toggle() async {
    final newMode = state == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
    state = newMode;
    await _saveTheme(newMode == ThemeMode.light ? 'light' : 'dark');
  }

  /// Sets theme from a ThemeMode value.
  Future<void> setThemeMode(ThemeMode mode) async {
    state = mode;
    await _saveTheme(_themeModeToString(mode));
  }

  Future<void> _saveTheme(String value) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(AppConstants.settingsBoxName + '_theme', value);
    } catch (e) {
      debugPrint('Failed to save theme preference: $e');
    }
  }

  static ThemeMode _parseThemeMode(String value) {
    switch (value) {
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      case 'system':
        return ThemeMode.system;
      default:
        return ThemeMode.system;
    }
  }

  static String _themeModeToString(ThemeMode mode) {
    switch (mode) {
      case ThemeMode.light:
        return 'light';
      case ThemeMode.dark:
        return 'dark';
      case ThemeMode.system:
        return 'system';
    }
  }
}

final themeProvider = StateNotifierProvider<ThemeNotifier, ThemeMode>((ref) {
  return ThemeNotifier();
});