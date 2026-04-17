class AppConstants {
  AppConstants._();

  static const String appName = 'NYPD Sergeant Study Guide';
  static const String appVersion = '1.0.0';

  /// Leitner spaced repetition box intervals in days.
  /// Box 0 = new card (review today), Box 1 = 1 day, etc.
  static const List<int> leitnerBoxIntervals = [0, 1, 3, 7, 14, 30];

  /// Total number of Leitner boxes (0-indexed, so 6 boxes total).
  static const int leitnerBoxCount = 6;

  /// Default number of flashcards to review per day.
  static const int dailyGoalDefault = 20;

  /// Exam time limit in minutes for the full practice exam.
  static const int examTimeLimitMinutes = 180;

  /// Number of questions in the full practice exam.
  static const int examQuestionCount = 100;

  /// Quiz time limit per question in seconds.
  static const int quizTimePerQuestionSeconds = 90;

  /// Hive box names for persistence.
  static const String progressBoxName = 'study_progress';
  static const String examHistoryBoxName = 'exam_history';
  static const String flashcardStateBoxName = 'flashcard_state';
  static const String dailyLogBoxName = 'daily_log';
  static const String settingsBoxName = 'app_settings';

  /// Asset paths.
  static const String studyDataAssetPath = 'assets/data/study_data.json';
  static const String chaptersAssetPrefix = 'assets/data/chapters';

  /// Minimum passing score percentage.
  static const double passingScorePercent = 70.0;
}