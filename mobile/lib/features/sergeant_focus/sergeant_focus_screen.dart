import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/theme.dart';
import '../../data/models/sergeant_focus.dart';
import '../../providers/chapter_provider.dart';

/// Sergeant Focus categories and their chapter mappings.
/// Matches the web app's SERGEANT_CATEGORIES from build-web.js.
const List<SergeantCategory> kSergeantCategories = [
  SergeantCategory(id: 'prisoner-mgmt', label: 'Prisoner Management', chapters: ['210-prisoners']),
  SergeantCategory(id: 'arrest-processing', label: 'Arrest Processing', chapters: ['208-arrests']),
  SergeantCategory(id: 'supervisor-response', label: 'Supervisor Response', chapters: ['212-command-operations']),
  SergeantCategory(id: 'documentation', label: 'Documentation & Reports', chapters: ['212-command-operations']),
  SergeantCategory(id: 'property-evidence', label: 'Property & Evidence', chapters: ['218-property-general', '219-department-property']),
  SergeantCategory(id: 'court-legal', label: 'Court & Legal', chapters: ['211-court-appearances']),
  SergeantCategory(id: 'use-of-force', label: 'Use of Force', chapters: ['221-tactical-operations']),
  SergeantCategory(id: 'juvenile', label: 'Juvenile Procedures', chapters: ['215-juvenile-matters']),
  SergeantCategory(id: 'personnel-leave', label: 'Personnel & Leave', chapters: ['319-civilian-personnel', '324-leave-payroll-timekeeping', '329-career-development']),
  SergeantCategory(id: 'equipment-uniforms', label: 'Equipment & Uniforms', chapters: ['305-uniforms-equipment']),
  SergeantCategory(id: 'command-ops', label: 'Command Operations', chapters: ['212-command-operations', '220-citywide-incident-mgmt']),
  SergeantCategory(id: 'qol-enforcement', label: 'Quality of Life', chapters: ['214-quality-of-life']),
  SergeantCategory(id: 'mobilization', label: 'Mobilization & Emergency', chapters: ['213-mobilization-emergency']),
  SergeantCategory(id: 'disciplinary', label: 'Disciplinary Matters', chapters: ['318-disciplinary-matters', '332-employee-rights']),
  SergeantCategory(id: 'complaints', label: 'Complaints & Investigations', chapters: ['207-complaints']),
  SergeantCategory(id: 'medical-wellness', label: 'Medical & Wellness', chapters: ['330-medical-health-wellness']),
  SergeantCategory(id: 'general-regulations', label: 'General Regulations', chapters: ['304-general-regulations']),
];

/// Sergeant Focus category data model.
class SergeantCategory {
  final String id;
  final String label;
  final List<String> chapters;

  const SergeantCategory({
    required this.id,
    required this.label,
    required this.chapters,
  });
}

/// Expandable category list of sergeant-specific callouts.
class SergeantFocusScreen extends ConsumerWidget {
  const SergeantFocusScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final focusAsync = ref.watch(allSergeantFocusProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Sergeant Focus')),
      body: focusAsync.when(
        data: (focusData) {
          if (focusData.isEmpty) {
            return const Center(child: Text('No sergeant focus items available'));
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(allSergeantFocusProvider),
            child: ListView.builder(
              padding: const EdgeInsets.only(bottom: 80),
              itemCount: kSergeantCategories.length,
              itemBuilder: (context, index) {
                final category = kSergeantCategories[index];
                final categoryItems = _getCategoryItems(category, focusData);
                return _CategoryExpansionTile(
                  category: category,
                  items: categoryItems,
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => _ErrorView(
          message: error.toString(),
          onRetry: () => ref.invalidate(allSergeantFocusProvider),
        ),
      ),
    );
  }

  /// Maps focus data entries to this category by matching chapter IDs.
  List<SergeantFocusItem> _getCategoryItems(
    SergeantCategory category,
    List<MapEntry<String, List<dynamic>>> focusData,
  ) {
    final items = <SergeantFocusItem>[];
    for (final entry in focusData) {
      for (final chapterId in category.chapters) {
        if (entry.key.contains(chapterId)) {
          for (final item in entry.value) {
            if (item is SergeantFocusItem) {
              items.add(item);
            }
          }
        }
      }
    }
    return items;
  }
}

/// Expandable tile for a single category.
class _CategoryExpansionTile extends StatelessWidget {
  final SergeantCategory category;
  final List<SergeantFocusItem> items;

  const _CategoryExpansionTile({
    required this.category,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: ExpansionTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppTheme.sergeant.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            Icons.star_rounded,
            color: AppTheme.sergeant,
            size: 20,
          ),
        ),
        title: Text(
          category.label,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
        subtitle: Text(
          '${items.length} item${items.length == 1 ? '' : 's'}',
          style: Theme.of(context).textTheme.bodySmall,
        ),
        children: items.isEmpty
            ? [const Padding(padding: EdgeInsets.all(16), child: Text('No items found for this category'))]
            : items.map((item) => _FocusItemTile(item: item)).toList(),
      ),
    );
  }
}

/// Individual sergeant focus item display.
class _FocusItemTile extends StatelessWidget {
  final SergeantFocusItem item;

  const _FocusItemTile({required this.item});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.sergeant.withValues(alpha: 0.05),
        border: Border(
          left: BorderSide(width: 4, color: AppTheme.sergeant),
        ),
        borderRadius: const BorderRadius.only(
          topRight: Radius.circular(4),
          bottomRight: Radius.circular(4),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.star_rounded, size: 14, color: AppTheme.sergeant),
              const SizedBox(width: 4),
              Text(
                'SERGEANT FOCUS',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1.5,
                  color: AppTheme.sergeant,
                ),
              ),
              const Spacer(),
              Text(
                item.procedureNumber,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      fontFamily: 'monospace',
                    ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            item.text,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5),
          ),
        ],
      ),
    );
  }
}

/// Error view with retry.
class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: AppTheme.examAlert),
            const SizedBox(height: 16),
            Text('Failed to load focus items', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Text(message, style: Theme.of(context).textTheme.bodySmall, textAlign: TextAlign.center),
            const SizedBox(height: 24),
            FilledButton.icon(onPressed: onRetry, icon: const Icon(Icons.refresh), label: const Text('Retry')),
          ],
        ),
      ),
    );
  }
}