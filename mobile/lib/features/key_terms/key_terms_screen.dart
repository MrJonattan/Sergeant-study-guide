import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/theme.dart';
import '../../data/models/key_term.dart';
import '../../providers/chapter_provider.dart';

/// Searchable list of all key terms across chapters, grouped by chapter.
class KeyTermsScreen extends ConsumerStatefulWidget {
  const KeyTermsScreen({super.key});

  @override
  ConsumerState<KeyTermsScreen> createState() => _KeyTermsScreenState();
}

class _KeyTermsScreenState extends ConsumerState<KeyTermsScreen> {
  String _searchQuery = '';
  bool _isSearching = false;

  @override
  Widget build(BuildContext context) {
    final termsAsync = ref.watch(allKeyTermsProvider);

    return Scaffold(
      appBar: AppBar(
        title: _isSearching
            ? TextField(
                controller: TextEditingController(text: _searchQuery),
                onChanged: (value) => setState(() => _searchQuery = value),
                autofocus: true,
                decoration: const InputDecoration(
                  hintText: 'Search terms...',
                  border: InputBorder.none,
                ),
                style: const TextStyle(fontSize: 16),
              )
            : const Text('Key Terms'),
        actions: [
          IconButton(
            icon: Icon(_isSearching ? Icons.close : Icons.search),
            onPressed: () {
              setState(() {
                _isSearching = !_isSearching;
                if (!_isSearching) _searchQuery = '';
              });
            },
          ),
        ],
      ),
      body: termsAsync.when(
        data: (termsData) {
          if (termsData.isEmpty) {
            return const Center(child: Text('No key terms available'));
          }

          // Filter terms by search query
          final filteredData = _filterTerms(termsData);

          if (filteredData.isEmpty && _searchQuery.isNotEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.search_off, size: 64, color: Theme.of(context).disabledColor),
                  const SizedBox(height: 16),
                  Text('No terms found for "$_searchQuery"', style: Theme.of(context).textTheme.bodyLarge),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(allKeyTermsProvider),
            child: ListView.builder(
              padding: const EdgeInsets.only(bottom: 80),
              itemCount: filteredData.length,
              itemBuilder: (context, index) {
                final entry = filteredData[index];
                return _ChapterTermsSection(
                  chapterLabel: entry.key,
                  terms: entry.value,
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => _ErrorView(
          message: error.toString(),
          onRetry: () => ref.invalidate(allKeyTermsProvider),
        ),
      ),
    );
  }

  List<MapEntry<String, List<dynamic>>> _filterTerms(List<MapEntry<String, List<dynamic>>> data) {
    if (_searchQuery.isEmpty) return data;

    final query = _searchQuery.toLowerCase();
    final filtered = <MapEntry<String, List<dynamic>>>[];

    for (final entry in data) {
      final matchingTerms = entry.value.where((item) {
        if (item is KeyTerm) {
          return item.term.toLowerCase().contains(query) ||
              item.definition.toLowerCase().contains(query);
        }
        return false;
      }).toList();

      if (matchingTerms.isNotEmpty) {
        filtered.add(MapEntry(entry.key, matchingTerms));
      }
    }

    return filtered;
  }
}

/// Section showing all terms for a single chapter.
class _ChapterTermsSection extends StatelessWidget {
  final String chapterLabel;
  final List<dynamic> terms;

  const _ChapterTermsSection({
    required this.chapterLabel,
    required this.terms,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Chapter header
        Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          color: AppTheme.primary.withValues(alpha: 0.05),
          child: Text(
            chapterLabel,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: AppTheme.primary,
                ),
          ),
        ),
        // Terms list
        ...terms.map((item) {
          if (item is KeyTerm) {
            return _KeyTermTile(term: item);
          }
          return const SizedBox.shrink();
        }),
        const Divider(height: 1),
      ],
    );
  }
}

/// Individual key term tile.
class _KeyTermTile extends StatelessWidget {
  final KeyTerm term;

  const _KeyTermTile({required this.term});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => _showDefinitionDialog(context),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    term.term,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppTheme.accent.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    term.source,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppTheme.accent,
                          fontWeight: FontWeight.w500,
                          fontSize: 10,
                        ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              term.definition,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7),
                  ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  void _showDefinitionDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Row(
          children: [
            Expanded(child: Text(term.term)),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: AppTheme.accent.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                term.source,
                style: TextStyle(
                  color: AppTheme.accent,
                  fontWeight: FontWeight.w600,
                  fontSize: 12,
                ),
              ),
            ),
          ],
        ),
        content: Text(
          term.definition,
          style: const TextStyle(height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close'),
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
            Text('Failed to load key terms', style: Theme.of(context).textTheme.titleMedium),
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