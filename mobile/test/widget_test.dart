import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:nypd_study_guide/app.dart';
import 'package:nypd_study_guide/config/constants.dart';

void main() {
  testWidgets('App initializes without error', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: NypdStudyGuideApp(),
      ),
    );
    await tester.pump();
    expect(find.text(AppConstants.appName), findsOneWidget);
  });
}