import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;

import '../../config/constants.dart';

/// Manages daily study reminder notifications using flutter_local_notifications.
///
/// Provides methods to schedule, cancel, and reschedule daily study reminders.
/// Requires initialization during app startup via [initialize].
class NotificationHelper {
  NotificationHelper._();

  static final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();

  static bool _initialized = false;

  /// Initializes the notification plugin. Must be called once during app startup.
  ///
  /// On iOS, this requests notification permissions. On Android, it creates
  /// the default notification channel.
  static Future<void> initialize() async {
    if (_initialized) return;

    const androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    try {
      await _plugin.initialize(
        initSettings,
        onDidReceiveNotificationResponse: _onNotificationTapped,
      );
      _initialized = true;
    } catch (e) {
      debugPrint('NotificationHelper: Failed to initialize - $e');
      _initialized = false;
    }
  }

  /// Schedules a daily study reminder at the given [hour] and [minute].
  ///
  /// Uses a fixed notification ID (0) for the daily reminder so that
  /// rescheduling replaces the previous one.
  static Future<void> scheduleDailyReminder({
    required int hour,
    required int minute,
  }) async {
    if (!_initialized) {
      await initialize();
    }

    if (!_initialized) return;

    const channelId = 'nypd_study_reminders';
    const channelName = 'Study Reminders';
    const channelDescription = 'Daily study reminder notifications';

    const androidDetails = AndroidNotificationDetails(
      channelId,
      channelName,
      channelDescription: channelDescription,
      importance: Importance.high,
      priority: Priority.high,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const platformDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    try {
      // Calculate the next occurrence of the specified time
      tz.initializeTimeZones();
      final now = tz.TZDateTime.now(tz.local);
      var scheduled = tz.TZDateTime(tz.local, now.year, now.month, now.day, hour, minute);
      if (scheduled.isBefore(now)) {
        scheduled = scheduled.add(const Duration(days: 1));
      }

      await _plugin.zonedSchedule(
        0, // Fixed ID for daily reminder
        'Time to Study!',
        'Keep your streak going — review some flashcards or take a quiz.',
        scheduled,
        platformDetails,
        androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
        matchDateTimeComponents: DateTimeComponents.time,
      );

      await _saveReminderTime(hour, minute);
    } catch (e) {
      debugPrint('NotificationHelper: Failed to schedule reminder - $e');
    }
  }

  /// Cancels the daily study reminder.
  static Future<void> cancelDailyReminder() async {
    try {
      await _plugin.cancel(0);
      await _clearReminderTime();
    } catch (e) {
      debugPrint('NotificationHelper: Failed to cancel reminder - $e');
    }
  }

  /// Reschedules the reminder if a saved preference exists.
  /// Call this on app startup and when settings change.
  static Future<void> rescheduleIfEnabled() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final enabled = prefs.getBool(AppConstants.settingsBoxName + '_reminder_enabled');
      if (enabled == null || !enabled) return;

      final hour = prefs.getInt(AppConstants.settingsBoxName + '_reminder_hour');
      final minute = prefs.getInt(AppConstants.settingsBoxName + '_reminder_minute');

      if (hour != null && minute != null) {
        await scheduleDailyReminder(hour: hour, minute: minute);
      }
    } catch (e) {
      debugPrint('NotificationHelper: Failed to reschedule - $e');
    }
  }

  /// Enables reminders and schedules at the given time.
  static Future<void> enableReminder({required int hour, required int minute}) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(AppConstants.settingsBoxName + '_reminder_enabled', true);
    await prefs.setInt(AppConstants.settingsBoxName + '_reminder_hour', hour);
    await prefs.setInt(AppConstants.settingsBoxName + '_reminder_minute', minute);
    await scheduleDailyReminder(hour: hour, minute: minute);
  }

  /// Disables reminders entirely.
  static Future<void> disableReminder() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(AppConstants.settingsBoxName + '_reminder_enabled', false);
    await cancelDailyReminder();
  }

  /// Returns the saved reminder time, or null if not set.
  static Future<({int hour, int minute})?> getReminderTime() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final hour = prefs.getInt(AppConstants.settingsBoxName + '_reminder_hour');
      final minute = prefs.getInt(AppConstants.settingsBoxName + '_reminder_minute');
      if (hour != null && minute != null) {
        return (hour: hour, minute: minute);
      }
    } catch (e) {
      debugPrint('NotificationHelper: Failed to get reminder time - $e');
    }
    return null;
  }

  /// Returns whether reminders are currently enabled.
  static Future<bool> isReminderEnabled() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getBool(AppConstants.settingsBoxName + '_reminder_enabled') ?? false;
    } catch (e) {
      debugPrint('NotificationHelper: Failed to check reminder status - $e');
      return false;
    }
  }

  // ── Private helpers ──────────────────────────────────────────────────

  static Future<void> _saveReminderTime(int hour, int minute) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt(AppConstants.settingsBoxName + '_reminder_hour', hour);
      await prefs.setInt(AppConstants.settingsBoxName + '_reminder_minute', minute);
    } catch (e) {
      debugPrint('NotificationHelper: Failed to save reminder time - $e');
    }
  }

  static Future<void> _clearReminderTime() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(AppConstants.settingsBoxName + '_reminder_hour');
      await prefs.remove(AppConstants.settingsBoxName + '_reminder_minute');
    } catch (e) {
      debugPrint('NotificationHelper: Failed to clear reminder time - $e');
    }
  }

  static void _onNotificationTapped(NotificationResponse response) {
    // Handle notification tap — navigate to home screen
    // The app router will handle deep link via the payload
  }
}