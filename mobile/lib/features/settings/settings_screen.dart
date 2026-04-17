import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../config/constants.dart';
import '../../config/theme.dart';
import '../../providers/theme_provider.dart';
import '../../shared/utils/notification_helper.dart';

/// Settings screen: theme toggle, daily goal, font size, reset progress, notifications.
class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  double _dailyGoal = AppConstants.dailyGoalDefault.toDouble();
  double _fontSize = 16.0;
  bool _notificationsEnabled = false;
  TimeOfDay _reminderTime = const TimeOfDay(hour: 19, minute: 0);
  bool _isLoading = true;

  @override
  void initState() { super.initState(); _loadSettings(); }

  Future<void> _loadSettings() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedGoal = prefs.getInt(AppConstants.settingsBoxName + '_daily_goal');
      final savedFontSize = prefs.getDouble(AppConstants.settingsBoxName + '_font_size');
      final reminderEnabled = prefs.getBool(AppConstants.settingsBoxName + '_reminder_enabled');
      final reminderHour = prefs.getInt(AppConstants.settingsBoxName + '_reminder_hour');
      final reminderMinute = prefs.getInt(AppConstants.settingsBoxName + '_reminder_minute');
      if (mounted) setState(() {
        _dailyGoal = (savedGoal ?? AppConstants.dailyGoalDefault).toDouble();
        _fontSize = savedFontSize ?? 16.0;
        _notificationsEnabled = reminderEnabled ?? false;
        if (reminderHour != null && reminderMinute != null) _reminderTime = TimeOfDay(hour: reminderHour, minute: reminderMinute);
        _isLoading = false;
      });
    } catch (_) { if (mounted) setState(() => _isLoading = false); }
  }

  @override
  Widget build(BuildContext context) {
    final themeMode = ref.watch(themeProvider);
    if (_isLoading) return Scaffold(appBar: AppBar(title: const Text('Settings')), body: const Center(child: CircularProgressIndicator()));

    return Scaffold(appBar: AppBar(title: const Text('Settings')),
      body: SingleChildScrollView(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        _SectionHeader(title: 'Appearance'),
        _ThemeSelector(currentMode: themeMode, onModeChanged: (mode) => ref.read(themeProvider.notifier).setThemeMode(mode)),
        const SizedBox(height: 24),
        _SectionHeader(title: 'Study'),
        _DailyGoalSlider(value: _dailyGoal, onChanged: (v) { setState(() => _dailyGoal = v); _saveDailyGoal(v.toInt()); }),
        const SizedBox(height: 16),
        _FontSizeSlider(value: _fontSize, onChanged: (v) { setState(() => _fontSize = v); _saveFontSize(v); }),
        const SizedBox(height: 24),
        _SectionHeader(title: 'Notifications'),
        _NotificationToggle(enabled: _notificationsEnabled, reminderTime: _reminderTime,
          onToggle: (enabled) async { setState(() => _notificationsEnabled = enabled); if (enabled) await NotificationHelper.enableReminder(hour: _reminderTime.hour, minute: _reminderTime.minute); else await NotificationHelper.disableReminder(); },
          onTimeChanged: (time) async { setState(() => _reminderTime = time); if (_notificationsEnabled) await NotificationHelper.scheduleDailyReminder(hour: time.hour, minute: time.minute); }),
        const SizedBox(height: 24),
        _SectionHeader(title: 'Data'),
        _ResetProgressButton(onReset: _showResetConfirm),
        const SizedBox(height: 32),
        Center(child: Text('${AppConstants.appName} v${AppConstants.appVersion}', style: Theme.of(context).textTheme.bodySmall)),
      ])),
    );
  }

  Future<void> _saveDailyGoal(int goal) async { try { final prefs = await SharedPreferences.getInstance(); await prefs.setInt(AppConstants.settingsBoxName + '_daily_goal', goal); } catch (_) {} }
  Future<void> _saveFontSize(double size) async { try { final prefs = await SharedPreferences.getInstance(); await prefs.setDouble(AppConstants.settingsBoxName + '_font_size', size); } catch (_) {} }

  void _showResetConfirm() => showDialog(context: context, builder: (ctx) => AlertDialog(
    title: const Text('Reset All Progress?'),
    content: const Text('This will permanently delete all your study progress, quiz scores, flashcard states, and exam history. This action cannot be undone.'),
    actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
      FilledButton(onPressed: () { Navigator.pop(ctx); _resetProgress(); }, style: FilledButton.styleFrom(backgroundColor: AppTheme.examAlert), child: const Text('Reset'))],
  ));

  Future<void> _resetProgress() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(AppConstants.settingsBoxName + '_daily_goal');
      await prefs.remove(AppConstants.settingsBoxName + '_font_size');
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('All progress has been reset.')));
    } catch (e) { if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to reset: $e'))); }
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});
  @override
  Widget build(BuildContext context) => Padding(padding: const EdgeInsets.only(bottom: 8), child: Text(title.toUpperCase(), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 1.5, color: AppTheme.accent)));
}

class _ThemeSelector extends StatelessWidget {
  final ThemeMode currentMode;
  final ValueChanged<ThemeMode> onModeChanged;
  const _ThemeSelector({required this.currentMode, required this.onModeChanged});

  @override
  Widget build(BuildContext context) {
    return Card(child: Padding(padding: const EdgeInsets.all(12), child: Row(children: [
      Expanded(child: _ThemeOption(icon: Icons.light_mode_outlined, label: 'Light', isSelected: currentMode == ThemeMode.light, onTap: () => onModeChanged(ThemeMode.light))),
      Expanded(child: _ThemeOption(icon: Icons.dark_mode_outlined, label: 'Dark', isSelected: currentMode == ThemeMode.dark, onTap: () => onModeChanged(ThemeMode.dark))),
      Expanded(child: _ThemeOption(icon: Icons.brightness_auto_outlined, label: 'System', isSelected: currentMode == ThemeMode.system, onTap: () => onModeChanged(ThemeMode.system))),
    ])));
  }
}

class _ThemeOption extends StatelessWidget {
  final IconData icon; final String label; final bool isSelected; final VoidCallback onTap;
  const _ThemeOption({required this.icon, required this.label, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(onTap: onTap, child: Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(color: isSelected ? AppTheme.accent.withValues(alpha: 0.1) : Colors.transparent, borderRadius: BorderRadius.circular(8),
        border: Border.all(color: isSelected ? AppTheme.accent : Colors.transparent, width: 2)),
      child: Column(children: [
        Icon(icon, size: 24, color: isSelected ? AppTheme.accent : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5)),
        const SizedBox(height: 4),
        Text(label, style: TextStyle(fontSize: 12, fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal, color: isSelected ? AppTheme.accent : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5))),
      ]),
    ));
  }
}

class _DailyGoalSlider extends StatelessWidget {
  final double value; final ValueChanged<double> onChanged;
  const _DailyGoalSlider({required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Card(child: Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text('Daily Goal', style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
        Text('${value.toInt()} activities', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.accent))]),
      Slider(value: value, min: 5, max: 50, divisions: 9, label: '${value.toInt()}', onChanged: onChanged),
    ])));
  }
}

class _FontSizeSlider extends StatelessWidget {
  final double value; final ValueChanged<double> onChanged;
  const _FontSizeSlider({required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Card(child: Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text('Font Size', style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
        Text('${value.round()}px', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.accent))]),
      Slider(value: value, min: 12, max: 24, divisions: 6, label: '${value.round()}px', onChanged: onChanged),
      Text('The quick brown fox jumps over the lazy dog', style: TextStyle(fontSize: value, height: 1.5)),
    ])));
  }
}

class _NotificationToggle extends StatelessWidget {
  final bool enabled; final TimeOfDay reminderTime; final ValueChanged<bool> onToggle; final ValueChanged<TimeOfDay> onTimeChanged;
  const _NotificationToggle({required this.enabled, required this.reminderTime, required this.onToggle, required this.onTimeChanged});

  @override
  Widget build(BuildContext context) {
    return Card(child: Padding(padding: const EdgeInsets.all(12), child: Column(children: [
      SwitchListTile(title: const Text('Daily Study Reminder'), subtitle: const Text('Get a notification to study each day'),
        value: enabled, onChanged: onToggle, contentPadding: EdgeInsets.zero, controlAffinity: ListTileControlAffinity.leading),
      if (enabled) ListTile(title: const Text('Reminder Time'), subtitle: Text(reminderTime.format(context), style: TextStyle(color: AppTheme.accent, fontWeight: FontWeight.w600)),
        trailing: const Icon(Icons.access_time), onTap: () async { final time = await showTimePicker(context: context, initialTime: reminderTime); if (time != null) onTimeChanged(time); }, contentPadding: EdgeInsets.zero),
    ])));
  }
}

class _ResetProgressButton extends StatelessWidget {
  final VoidCallback onReset;
  const _ResetProgressButton({required this.onReset});

  @override
  Widget build(BuildContext context) {
    return Card(color: AppTheme.examAlert.withValues(alpha: 0.05),
      child: ListTile(leading: const Icon(Icons.delete_forever, color: AppTheme.examAlert),
        title: const Text('Reset All Progress', style: TextStyle(color: AppTheme.examAlert)),
        subtitle: const Text('Delete all study data, scores, and history'),
        onTap: onReset));
  }
}