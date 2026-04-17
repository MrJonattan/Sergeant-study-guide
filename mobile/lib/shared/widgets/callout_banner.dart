import 'package:flutter/material.dart';

/// Callout types matching the web app's callout styles.
enum CalloutType {
  examAlert,
  sergeantFocus,
  memoryAid,
  priorTest,
  seeAlso,
}

/// Configuration for each callout type: icon, label, and colors.
class _CalloutConfig {
  final IconData icon;
  final String label;
  final Color borderColor;
  final Color backgroundColor;
  final Color labelColor;

  const _CalloutConfig({
    required this.icon,
    required this.label,
    required this.borderColor,
    required this.backgroundColor,
    required this.labelColor,
  });
}

/// Maps callout types to their visual configuration.
const _calloutConfigs = <CalloutType, _CalloutConfig>{
  CalloutType.examAlert: _CalloutConfig(
    icon: Icons.warning_amber_rounded,
    label: 'EXAM ALERT',
    borderColor: Color(0xFFCA8A04),
    backgroundColor: Color(0xFFFFFDE6),
    labelColor: Color(0xFF8A7000),
  ),
  CalloutType.sergeantFocus: _CalloutConfig(
    icon: Icons.star_rounded,
    label: 'SERGEANT FOCUS',
    borderColor: Color(0xFFCA8A04),
    backgroundColor: Color(0xFF1A1B26),
    labelColor: Color(0xFF5DADE2),
  ),
  CalloutType.memoryAid: _CalloutConfig(
    icon: Icons.psychology_outlined,
    label: 'MEMORY AID',
    borderColor: Color(0xFF2E7D32),
    backgroundColor: Color(0xFFE8F5E9),
    labelColor: Color(0xFF1B5E20),
  ),
  CalloutType.priorTest: _CalloutConfig(
    icon: Icons.clipboard_outlined,
    label: 'PRIOR TEST',
    borderColor: Color(0xFF1565C0),
    backgroundColor: Color(0xFFE3F2FD),
    labelColor: Color(0xFF0D47A1),
  ),
  CalloutType.seeAlso: _CalloutConfig(
    icon: Icons.link_outlined,
    label: 'SEE ALSO',
    borderColor: Color(0xFF6A1B9A),
    backgroundColor: Color(0xFFF3E5F5),
    labelColor: Color(0xFF4A148C),
  ),
};

/// Colored banner widget for callouts with icon, label, and text content.
///
/// Matches the web app styling: colored left border (5px), bold label header,
/// and themed background color. Dark mode variants are handled via
/// the theme's brightness.
class CalloutBanner extends StatelessWidget {
  final CalloutType type;
  final String text;
  final VoidCallback? onTap;

  const CalloutBanner({
    super.key,
    required this.type,
    required this.text,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final config = _calloutConfigs[type]!;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final effectiveBg = isDark
        ? _darkBackground(type, config.backgroundColor)
        : config.backgroundColor;
    final effectiveBorderColor = isDark
        ? _darkBorderColor(type, config.borderColor)
        : config.borderColor;
    final effectiveLabelColor = isDark
        ? _darkLabelColor(type, config.labelColor)
        : config.labelColor;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 8),
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
        decoration: BoxDecoration(
          color: effectiveBg,
          border: Border(
            left: BorderSide(width: 5, color: effectiveBorderColor),
            top: BorderSide(width: 1, color: effectiveBorderColor),
            right: BorderSide(width: 1, color: effectiveBorderColor),
            bottom: BorderSide(width: 1, color: effectiveBorderColor),
          ),
          borderRadius: const BorderRadius.only(
            topRight: Radius.circular(4),
            bottomRight: Radius.circular(4),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Label row: icon + uppercase label text
            Row(
              children: [
                Icon(config.icon, size: 14, color: effectiveLabelColor),
                const SizedBox(width: 6),
                Text(
                  config.label,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 1.8,
                    color: effectiveLabelColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Divider(
              height: 1,
              thickness: 1,
              color: effectiveBorderColor.withValues(alpha: 0.4),
            ),
            const SizedBox(height: 8),
            // Content text with bold support
            Text(
              text,
              style: TextStyle(
                fontSize: 14,
                height: 1.65,
                color: isDark ? const Color(0xFFE2E8F0) : const Color(0xFF1A1A2E),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Dark mode background overrides matching the web app CSS.
  static Color _darkBackground(CalloutType type, Color fallback) {
    switch (type) {
      case CalloutType.examAlert:
        return const Color(0xFF1C1A0E);
      case CalloutType.sergeantFocus:
        return const Color(0xFF1A1B26);
      case CalloutType.memoryAid:
        return const Color(0xFF0E1A0E);
      case CalloutType.priorTest:
        return const Color(0xFF0E131A);
      case CalloutType.seeAlso:
        return const Color(0xFF160E1A);
    }
  }

  static Color _darkBorderColor(CalloutType type, Color fallback) {
    switch (type) {
      case CalloutType.examAlert:
        return const Color(0xFF7A6A00);
      case CalloutType.sergeantFocus:
        return const Color(0xFFCA8A04);
      case CalloutType.memoryAid:
        return const Color(0xFF2E7D32);
      case CalloutType.priorTest:
        return const Color(0xFF1565C0);
      case CalloutType.seeAlso:
        return const Color(0xFF6A1B9A);
    }
  }

  static Color _darkLabelColor(CalloutType type, Color fallback) {
    switch (type) {
      case CalloutType.examAlert:
        return const Color(0xFFC4A000);
      case CalloutType.sergeantFocus:
        return const Color(0xFF5DADE2);
      case CalloutType.memoryAid:
        return const Color(0xFF66BB6A);
      case CalloutType.priorTest:
        return const Color(0xFF64B5F6);
      case CalloutType.seeAlso:
        return const Color(0xFFBA68C8);
    }
  }
}