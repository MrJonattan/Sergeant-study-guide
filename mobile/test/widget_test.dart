import 'package:flutter_test/flutter_test.dart';

import 'package:nypd_study_guide/app.dart';
import 'package:nypd_study_guide/main.dart';

void main() {
  testWidgets('App initializes without error', (WidgetTester tester) async {
    await tester.pumpWidget(const NypdStudyGuideApp());
    await tester.pump();
    expect(find.text('NYPD Study Guide'), findsOneWidget);
  });
}