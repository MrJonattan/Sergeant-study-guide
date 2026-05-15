import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

/// Utility class providing haptic feedback for study interactions.
///
/// Uses platform haptics for tactile confirmation of user actions.
class StudyHaptics {
  StudyHaptics._();

  /// Feedback for selecting a correct answer.
  static Future<void> correctAnswer() async {
    try {
      await HapticFeedback.mediumImpact();
    } catch (e) {
      debugPrint('Haptics: correctAnswer failed - $e');
    }
  }

  /// Feedback for selecting an incorrect answer.
  static Future<void> incorrectAnswer() async {
    try {
      await HapticFeedback.heavyImpact();
      await HapticFeedback.vibrate();
    } catch (e) {
      debugPrint('Haptics: incorrectAnswer failed - $e');
    }
  }

  /// Feedback for flipping a flashcard.
  static Future<void> cardFlip() async {
    try {
      await HapticFeedback.lightImpact();
    } catch (e) {
      debugPrint('Haptics: cardFlip failed - $e');
    }
  }

  /// Feedback for selecting an option (light tap).
  static Future<void> selection() async {
    try {
      await HapticFeedback.selectionClick();
    } catch (e) {
      debugPrint('Haptics: selection failed - $e');
    }
  }

  /// Heavy impact feedback for exam submissions.
  static Future<void> heavyImpact() async {
    try {
      await HapticFeedback.heavyImpact();
    } catch (e) {
      debugPrint('Haptics: heavyImpact failed - $e');
    }
  }
}