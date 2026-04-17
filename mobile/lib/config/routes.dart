import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../features/home/home_screen.dart';
import '../features/chapter_list/chapter_list_screen.dart';
import '../features/chapter_detail/chapter_detail_screen.dart';
import '../features/flashcards/flashcard_screen.dart';
import '../features/quiz/quiz_screen.dart';
import '../features/exam/exam_setup_screen.dart';
import '../features/exam/exam_screen.dart';
import '../features/sergeant_focus/sergeant_focus_screen.dart';
import '../features/key_terms/key_terms_screen.dart';
import '../features/settings/settings_screen.dart';
import '../features/weak_areas/weak_areas_screen.dart';

class AppRouter {
  AppRouter._();

  static final _rootNavigatorKey = GlobalKey<NavigatorState>();
  static final _shellNavigatorKey = GlobalKey<NavigatorState>();

  static final router = GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    debugLogDiagnostics: true,
    routes: [
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) {
          return _MainScaffold(child: child);
        },
        routes: [
          GoRoute(
            name: 'home',
            path: '/',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            name: 'chapters',
            path: '/chapters',
            builder: (context, state) => const ChapterListScreen(),
            routes: [
              GoRoute(
                name: 'chapterDetail',
                path: ':id',
                builder: (context, state) {
                  final id = state.pathParameters['id'] ?? '';
                  return ChapterDetailScreen(chapterId: id);
                },
                routes: [
                  GoRoute(
                    name: 'chapterQuiz',
                    path: 'quiz',
                    builder: (context, state) {
                      final id = state.pathParameters['id'] ?? '';
                      return ChapterDetailScreen(chapterId: id);
                    },
                  ),
                ],
              ),
            ],
          ),
          GoRoute(
            name: 'flashcards',
            path: '/flashcards',
            builder: (context, state) => const FlashcardScreen(),
          ),
          GoRoute(
            name: 'sergeantFocus',
            path: '/sergeant-focus',
            builder: (context, state) =>
                const SergeantFocusScreen(),
          ),
          GoRoute(
            name: 'keyTerms',
            path: '/key-terms',
            builder: (context, state) =>
                const KeyTermsScreen(),
          ),
          GoRoute(
            name: 'weakAreas',
            path: '/weak-areas',
            builder: (context, state) =>
                const WeakAreasScreen(),
          ),
          GoRoute(
            name: 'settings',
            path: '/settings',
            builder: (context, state) =>
                const SettingsScreen(),
          ),
        ],
      ),
      // Exam routes are outside the shell (no bottom nav during exam)
      GoRoute(
        name: 'exam',
        path: '/exam',
        builder: (context, state) => const ExamSetupScreen(),
        routes: [
          GoRoute(
            name: 'examActive',
            path: 'active',
            builder: (context, state) => const ExamScreen(),
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.error}'),
      ),
    ),
  );
}

class _MainScaffold extends StatelessWidget {
  final Widget child;

  const _MainScaffold({required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex(context),
        onTap: (index) => _onTap(context, index),
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.menu_book_outlined),
            activeIcon: Icon(Icons.menu_book),
            label: 'Chapters',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.style_outlined),
            activeIcon: Icon(Icons.style),
            label: 'Cards',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.star_outline),
            activeIcon: Icon(Icons.star),
            label: 'Sgt Focus',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.trending_up_outlined),
            activeIcon: Icon(Icons.trending_up),
            label: 'Weak Areas',
          ),
        ],
      ),
    );
  }

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    if (location.startsWith('/chapters')) return 1;
    if (location.startsWith('/flashcards')) return 2;
    if (location.startsWith('/sergeant-focus')) return 3;
    if (location.startsWith('/weak-areas')) return 4;
    if (location.startsWith('/exam')) return 1; // Exam shows under chapters
    if (location == '/') return 0;
    return 0;
  }

  void _onTap(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/');
      case 1:
        context.go('/chapters');
      case 2:
        context.go('/flashcards');
      case 3:
        context.go('/sergeant-focus');
      case 4:
        context.go('/weak-areas');
    }
  }
}