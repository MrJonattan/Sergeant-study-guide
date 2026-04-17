import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';

import 'callout_banner.dart';

/// Wraps flutter_markdown with custom callout rendering for study content.
///
/// Preprocesses the markdown to extract callout blockquotes and render them
/// as [CalloutBanner] widgets alongside the regular markdown content.
/// Callout types detected:
/// - EXAM ALERT (red border)
/// - SERGEANT FOCUS (amber border)
/// - MEMORY AID (purple border)
/// - PRIOR TEST (blue border)
/// - SEE ALSO (green border)
class MarkdownRenderer extends StatelessWidget {
  final String data;
  final EdgeInsets padding;
  final VoidCallback? onLinkTap;

  const MarkdownRenderer({
    super.key,
    required this.data,
    this.padding = const EdgeInsets.symmetric(horizontal: 16),
    this.onLinkTap,
  });

  @override
  Widget build(BuildContext context) {
    final segments = _splitByCallouts(data);
    final theme = Theme.of(context);

    return Padding(
      padding: padding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: segments.map((segment) {
          if (segment.isCallout) {
            return CalloutBanner(
              type: segment.calloutType!,
              text: segment.calloutText,
            );
          }
          if (segment.text.trim().isEmpty) return const SizedBox.shrink();
          return MarkdownBody(
            data: segment.text,
            styleSheet: _buildStyleSheet(theme),
            onTapLink: (text, href, title) {
              if (onLinkTap != null) onLinkTap!();
            },
          );
        }).toList(),
      ),
    );
  }

  /// Splits markdown text into segments, extracting callout blockquotes
  /// into separate segments for rendering as CalloutBanner widgets.
  List<_MarkdownSegment> _splitByCallouts(String md) {
    final segments = <_MarkdownSegment>[];
    final lines = md.split('\n');
    final buffer = StringBuffer();
    var inCallout = false;
    String? calloutType;
    final calloutLines = <String>[];

    for (final line in lines) {
      final trimmed = line.trim();

      // Detect start of a callout blockquote
      if (!inCallout && trimmed.startsWith('>')) {
        final calloutMatch = _detectCalloutType(trimmed);
        if (calloutMatch != null) {
          // Flush accumulated markdown
          if (buffer.isNotEmpty) {
            segments.add(_MarkdownSegment(text: buffer.toString()));
            buffer.clear();
          }
          inCallout = true;
          calloutType = calloutMatch;
          // Extract text after the callout label
          var content = trimmed.substring(1).trim();
          content = _stripCalloutLabel(content, calloutMatch);
          if (content.isNotEmpty) calloutLines.add(content);
          continue;
        }
      }

      if (inCallout) {
        if (trimmed.startsWith('>')) {
          // Continuation of the callout blockquote
          var content = trimmed.substring(1).trim();
          content = _stripCalloutLabel(content, calloutType);
          if (content.isNotEmpty) calloutLines.add(content);
        } else if (trimmed.isEmpty) {
          // Empty line may end the callout block
          // But consecutive > lines might have blank lines between them
          // We'll treat the first non-> non-empty line as end
          calloutLines.add('');
        } else {
          // End of callout blockquote - flush it
          segments.add(_MarkdownSegment(
            isCallout: true,
            calloutType: _mapCalloutType(calloutType),
            calloutText: calloutLines.join('\n').trim(),
          ));
          inCallout = false;
          calloutType = null;
          calloutLines.clear();
          buffer.writeln(line);
        }
      } else {
        buffer.writeln(line);
      }
    }

    // Flush remaining content
    if (inCallout) {
      segments.add(_MarkdownSegment(
        isCallout: true,
        calloutType: _mapCalloutType(calloutType),
        calloutText: calloutLines.join('\n').trim(),
      ));
    }
    if (buffer.isNotEmpty) {
      segments.add(_MarkdownSegment(text: buffer.toString()));
    }

    return segments;
  }

  /// Detects if a blockquote line starts with a callout label.
  String? _detectCalloutType(String line) {
    final upper = line.toUpperCase();
    if (upper.contains('EXAM ALERT')) return 'EXAM ALERT';
    if (upper.contains('SERGEANT FOCUS')) return 'SERGEANT FOCUS';
    if (upper.contains('MEMORY AID')) return 'MEMORY AID';
    if (upper.contains('PRIOR TEST')) return 'PRIOR TEST';
    if (upper.contains('SEE ALSO')) return 'SEE ALSO';
    return null;
  }

  /// Strips the callout label from the beginning of a line.
  String _stripCalloutLabel(String content, String? type) {
    if (type == null) return content;
    // Remove **LABEL** or LABEL patterns
    var cleaned = content.replaceFirst(RegExp(r'\*\*\s*' + RegExp.escape(type) + r'\s*\*\*'), '');
    cleaned = cleaned.replaceFirst(RegExp.escape(type), '');
    // Remove emoji prefixes
    cleaned = cleaned.replaceFirst(RegExp(r'^[⚠★📋🔗🧠]\s*'), '');
    return cleaned.trim();
  }

  /// Maps a string callout label to a CalloutType enum value.
  CalloutType _mapCalloutType(String? label) {
    switch (label) {
      case 'EXAM ALERT': return CalloutType.examAlert;
      case 'SERGEANT FOCUS': return CalloutType.sergeantFocus;
      case 'MEMORY AID': return CalloutType.memoryAid;
      case 'PRIOR TEST': return CalloutType.priorTest;
      case 'SEE ALSO': return CalloutType.seeAlso;
      default: return CalloutType.examAlert;
    }
  }

  MarkdownStyleSheet _buildStyleSheet(ThemeData theme) {
    return MarkdownStyleSheet(
      h1: theme.textTheme.headlineLarge,
      h2: theme.textTheme.headlineMedium,
      h3: theme.textTheme.headlineSmall,
      p: theme.textTheme.bodyLarge,
      listBullet: theme.textTheme.bodyMedium,
      code: theme.textTheme.bodySmall?.copyWith(
        fontFamily: 'monospace',
        backgroundColor: theme.colorScheme.surface,
      ),
      blockquote: TextStyle(
        color: theme.colorScheme.onSurface,
        fontSize: 14,
        height: 1.65,
      ),
      blockquoteDecoration: BoxDecoration(
        color: theme.colorScheme.surface,
        border: Border(
          left: BorderSide(
            width: 4,
            color: theme.colorScheme.onSurface.withValues(alpha: 0.3),
          ),
        ),
      ),
      blockquotePadding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
    );
  }
}

/// Internal segment model for splitting markdown into regular text and callouts.
class _MarkdownSegment {
  final String text;
  final bool isCallout;
  final CalloutType? calloutType;
  final String calloutText;

  const _MarkdownSegment({
    this.text = '',
    this.isCallout = false,
    this.calloutType,
    this.calloutText = '',
  });
}