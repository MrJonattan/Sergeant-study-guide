#!/usr/bin/env node
/**
 * Generate personalized study schedule for NYPD Sergeant Exam
 * Creates a week-by-week plan covering all 28 chapters
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const PROJECT = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(PROJECT, 'build');
const DATA_FILE = path.join(BUILD_DIR, 'data.js');

// Chapter data with estimated study times
const CHAPTER_DATA = [
  { id: '200-general', priority: 'high', estHours: 2 },
  { id: '202-duties-responsibilities', priority: 'high', estHours: 2 },
  { id: '207-complaints', priority: 'high', estHours: 2.5 },
  { id: '208-arrests', priority: 'high', estHours: 3 },
  { id: '209-summonses', priority: 'medium', estHours: 1.5 },
  { id: '210-prisoners', priority: 'high', estHours: 3 },
  { id: '211-court-appearances', priority: 'medium', estHours: 2 },
  { id: '212-command-operations', priority: 'high', estHours: 2.5 },
  { id: '213-mobilization-emergency', priority: 'high', estHours: 2.5 },
  { id: '214-quality-of-life', priority: 'medium', estHours: 2 },
  { id: '215-juvenile-matters', priority: 'high', estHours: 2.5 },
  { id: '216-aided-cases', priority: 'high', estHours: 3 },
  { id: '217-vehicle-collisions', priority: 'medium', estHours: 2 },
  { id: '218-property-general', priority: 'medium', estHours: 1.5 },
  { id: '219-department-property', priority: 'low', estHours: 1.5 },
  { id: '220-citywide-incident-mgmt', priority: 'high', estHours: 2 },
  { id: '221-tactical-operations', priority: 'medium', estHours: 2.5 },
  { id: '303-duties-responsibilities', priority: 'high', estHours: 2 },
  { id: '304-general-regulations', priority: 'high', estHours: 2.5 },
  { id: '305-uniforms-equipment', priority: 'low', estHours: 1 },
  { id: '318-disciplinary-matters', priority: 'high', estHours: 3 },
  { id: '319-civilian-personnel', priority: 'low', estHours: 1.5 },
  { id: '320-personnel-matters', priority: 'medium', estHours: 2 },
  { id: '324-leave-payroll-timekeeping', priority: 'medium', estHours: 2 },
  { id: '329-career-development', priority: 'low', estHours: 1.5 },
  { id: '330-medical-health-wellness', priority: 'medium', estHours: 2.5 },
  { id: '331-evaluations', priority: 'medium', estHours: 2 },
  { id: '332-employee-rights', priority: 'high', estHours: 2.5 },
];

// Priority weights for scheduling
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

// Sort chapters: high priority first, then by estimated hours
const sortedChapters = [...CHAPTER_DATA].sort((a, b) => {
  const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  if (priorityDiff !== 0) return priorityDiff;
  return b.estHours - a.estHours; // Longer chapters first within same priority
});

function generateSchedule(weeks, hoursPerWeek, examDate) {
  const totalHoursNeeded = CHAPTER_DATA.reduce((sum, c) => sum + c.estHours, 0);
  const totalHoursAvailable = weeks * hoursPerWeek;
  const schedule = [];

  let weekNum = 1;
  let weekHours = 0;
  let weekChapters = [];

  for (const chapter of sortedChapters) {
    weekChapters.push(chapter);
    weekHours += chapter.estHours;

    // Check if we should start a new week
    if (weekHours >= hoursPerWeek * 0.9 || weekChapters.length >= 3) {
      schedule.push({
        week: weekNum,
        chapters: weekChapters,
        totalHours: Math.round(weekHours * 10) / 10,
        focus: weekChapters.filter(c => c.priority === 'high').length > 1 ? 'HIGH PRIORITY' : 'Standard'
      });
      weekNum++;
      weekHours = 0;
      weekChapters = [];
    }
  }

  // Add remaining chapters
  if (weekChapters.length > 0) {
    schedule.push({
      week: weekNum,
      chapters: weekChapters,
      totalHours: Math.round(weekHours * 10) / 10,
      focus: 'Review & Catch-up'
    });
  }

  // Add review weeks
  const reviewWeeks = Math.max(1, Math.floor(weeks * 0.2)); // 20% for review
  for (let i = 0; i < reviewWeeks; i++) {
    schedule.push({
      week: schedule.length + 1,
      chapters: [],
      totalHours: hoursPerWeek,
      focus: i === 0 ? 'FULL PRACTICE EXAM' : 'WEAK AREAS REVIEW',
      isReview: true
    });
  }

  return { schedule, totalHoursNeeded, totalHoursAvailable };
}

function formatMarkdown(schedule, examDate, hoursPerWeek) {
  const today = new Date();
  const exam = examDate ? new Date(examDate) : null;

  let md = `# NYPD Sergeant Exam — Study Schedule\n\n`;
  md += `**Generated:** ${today.toISOString().split('T')[0]}\n`;
  if (exam) {
    md += `**Exam Date:** ${exam.toISOString().split('T')[0]}\n`;
  }
  md += `**Weekly Commitment:** ${hoursPerWeek} hours\n`;
  md += `**Total Chapters:** 28\n\n`;
  md += `---\n\n`;

  md += `## Study Strategy\n\n`;
  md += `1. **High priority chapters first** — Most tested material\n`;
  md += `2. **3 chapters per week** — Sustainable pace\n`;
  md += `3. **Practice questions daily** — Use Quiz mode\n`;
  md += `4. **Review weeks built-in** — Retention focused\n\n`;
  md += `---\n\n`;

  for (const week of schedule) {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() + (week.week - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    md += `## Week ${week.week}: ${week.focus}\n`;
    md += `**Dates:** ${weekStart.toLocaleDateString()} — ${weekEnd.toLocaleDateString()}\n`;
    md += `**Time Commitment:** ${week.totalHours} hours\n\n`;

    if (week.isReview) {
      if (week.week === schedule.length - reviewWeeks + 1) {
        md += `### Review Plan:\n\n`;
        md += `- Take full 140-question practice exam (timed)\n`;
        md += `- Review all incorrect answers\n`;
        md += `- Focus on weak categories\n`;
      } else {
        md += `### Review Plan:\n\n`;
        md += `- Revisit bookmarked questions\n`;
        md += `- Review Sergeant Focus callouts\n`;
        md += `- Practice specific weak categories\n`;
      }
    } else {
      md += `### Chapters:\n\n`;
      md += `| Chapter | Priority | Est. Time | Study Tasks |\n`;
      md += `|---------|----------|-----------|-------------|\n`;

      for (const ch of week.chapters) {
        const chapterInfo = CHAPTER_DATA.find(c => c.id === ch.id);
        const title = ch.id.split('-').slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const tasks = [
          `Read chapter sections`,
          `${chapterInfo?.estHours || 2}h study`,
          `Quiz: ${ch.id.includes('200') || ch.id.includes('300') ? '20-25' : '15-20'} questions`,
          `Review Sergeant Focus`
        ].join(' | ');

        const priorityIcon = ch.priority === 'high' ? '🔴' : ch.priority === 'medium' ? '🟡' : '🟢';
        md += `| ${ch.id} | ${priorityIcon} ${ch.priority.toUpperCase()} | ${chapterInfo?.estHours || 2}h | ${tasks} |\n`;
      }
    }

    md += `\n---\n\n`;
  }

  md += `## Daily Study Template\n\n`;
  md += `| Day | Activity | Duration |\n`;
  md += `|-----|----------|----------|\n`;
  md += `| Mon | Read chapter sections | 45-60 min |\n`;
  md += `| Tue | Key terms + Notes | 30-45 min |\n`;
  md += `| Wed | Practice questions | 45-60 min |\n`;
  md += `| Thu | Sergeant Focus review | 30 min |\n`;
  md += `| Fri | Practice questions | 45-60 min |\n`;
  md += `| Sat | Weak areas + bookmarks | 60 min |\n`;
  md += `| Sun | Rest or catch-up | Optional |\n\n`;

  md += `## Progress Tracking\n\n`;
  md += `- [ ] Week 1 complete\n`;
  md += `- [ ] Week 2 complete\n`;
  md += `- [ ] Week 3 complete\n`;
  // Continue for all weeks...

  return md;
}

// Calculate review weeks count for the template
let reviewWeeks = 0;

// Main execution
console.log('NYPD Sergeant Exam — Study Schedule Generator\n');
console.log('='.repeat(50));

// Read data to get chapter info
const dataContent = fs.readFileSync(DATA_FILE, 'utf8');
const match = dataContent.match(/window\.STUDY_DATA=({.+});/);
if (!match) {
  console.error('Failed to parse data.js');
  process.exit(1);
}
const data = JSON.parse(match[1]);

console.log(`\nFound ${data.chapters.length} chapters`);
console.log(`Total questions: ${data.totalQuestions}`);

// Default schedule parameters
const DEFAULT_WEEKS = 12;
const DEFAULT_HOURS_PER_WEEK = 8;

console.log('\nGenerating schedule...');
const { schedule, totalHoursNeeded, totalHoursAvailable } = generateSchedule(
  DEFAULT_WEEKS,
  DEFAULT_HOURS_PER_WEEK,
  null
);

// Count review weeks
reviewWeeks = schedule.filter(s => s.isReview).length;

const md = formatMarkdown(schedule, null, DEFAULT_HOURS_PER_WEEK);
fs.writeFileSync(path.join(BUILD_DIR, 'study-schedule.md'), md);

console.log(`\n${'='.repeat(50)}`);
console.log('SCHEDULE SUMMARY');
console.log(`${'='.repeat(50)}`);
console.log(`Total study weeks: ${schedule.length}`);
console.log(`Content weeks: ${schedule.length - reviewWeeks}`);
console.log(`Review weeks: ${reviewWeeks}`);
console.log(`Hours needed: ~${totalHoursNeeded}h`);
console.log(`Hours available: ${totalHoursAvailable}h`);
console.log(`\nOutput: build/study-schedule.md`);
console.log('\nOpen with: open build/study-schedule.md\n');
