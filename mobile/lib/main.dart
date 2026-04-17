import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'app.dart';
import 'data/repositories/progress_repository.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await Hive.initFlutter();
    await ProgressRepository.initialize();
  } catch (e) {
    debugPrint('Failed to initialize storage: $e');
  }

  runApp(
    const ProviderScope(
      child: NypdStudyGuideApp(),
    ),
  );
}