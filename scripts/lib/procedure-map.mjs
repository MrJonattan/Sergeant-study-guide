/**
 * procedure-map.mjs
 * Shared module for update timeline and procedure-to-section mappings.
 * Imported by ingest-updates.mjs and audit-update-ingestion.mjs
 */

// Update timeline from Update1.pdf (June 2026 - most recent first)
// These are PUBLICATION dates from Update1.pdf, not procedure effective dates.
export const UPDATES = [
  { date: '2026-06-04', procedures: ['212-125'] },
  { date: '2026-06-02', procedures: ['202-18', '202-19'] },
  { date: '2026-05-28', procedures: ['207-07'] },
  { date: '2026-05-27', procedures: ['207-01'] },
  { date: '2026-05-26', procedures: ['304-22', '330-08', '219-12'] },
  { date: '2026-05-19', procedures: ['318-09', '318-17', '202-05', '202-20'] },
  { date: '2026-05-18', procedures: ['320-04'] },
  { date: '2026-05-14', procedures: ['212-57'] },
  { date: '2026-05-13', procedures: ['207-06', '207-07', '207-33', '208-44', '214-34', '218-23', '208-14', '210-19', '213-03', '218-26', '208-69', '212-12', '212-55', '212-99'] },
  { date: '2026-05-05', procedures: ['202-06', '202-18', '202-29', '202-39', '216-12', '216-13', '216-15', '217-01', '217-07', '217-09', '217-13', '217-14', '219-23', '221-21', '221-22'] },
  { date: '2026-04-23', procedures: ['202-38', '202-39', '207-01', '303-14'] },
  { date: '2026-03-30', procedures: ['209-39'] },
  { date: '2026-03-27', procedures: ['208-83', '209-02', '209-37'] },
  { date: '2026-03-17', procedures: ['202-32', '326-09'] },
  { date: '2026-03-03', procedures: ['329-06'] },
  { date: '2026-02-26', procedures: ['219-09'] },
  { date: '2026-02-18', procedures: ['209-39'] },
  { date: '2026-02-09', procedures: ['215-01', '215-07', '215-20', '215-21'] },
  { date: '2026-02-03', procedures: ['209-39', '330-03', '217-02', '217-15'] },
  { date: '2026-02-02', procedures: ['202-10', '202-27', '213-04', '214-38', '215-13', '303-15', '303-17'] },
  { date: '2026-01-07', procedures: ['212-02', '304-24', '318-21', '319-04', '319-25', '324-07', '324-24', '332-15', '319-11', '332-17', '319-12', '319-18'] },
  { date: '2026-01-06', procedures: ['219-20', '219-26', '305-08', '324-12', '329-07'] },
  { date: '2026-01-30', procedures: ['305-19'] },
  { date: '2026-01-28', procedures: ['211-21'] },
  { date: '2026-01-14', procedures: ['210-04', '216-02'] },
  { date: '2026-01-08', procedures: ['207-12'] },
];

// Effective dates from PDF headers (used for audit CHECK 2 validation)
// These differ from publication dates for some procedures (e.g., 208-14, 210-19, 218-26)
export const EFFECTIVE_DATES = {
  // May 26, 2026 effective
  '304-22': '2026-05-26',
  '330-08': '2026-05-26',
  '219-12': '2026-05-26',
  // May 19, 2026 effective (published May 13)
  '208-14': '2026-05-19',
  '210-19': '2026-05-19',
  '218-26': '2026-05-19',
  '318-09': '2026-05-19',
  '318-17': '2026-05-19',
  '202-05': '2026-05-19',
  '202-20': '2026-05-19',
  // May 14, 2026 effective
  '212-57': '2026-05-14',
  // May 13, 2026 effective (same as publication)
  '207-06': '2026-05-13',
  '207-07': '2026-05-13',
  '207-33': '2026-05-13',
  '208-44': '2026-05-13',
  '214-34': '2026-05-13',
  '218-23': '2026-05-13',
  '213-03': '2026-05-13',
  '208-69': '2026-05-13',
  '212-12': '2026-05-13',
  '212-55': '2026-05-13',
  '212-99': '2026-05-13',
  // May 5, 2026 effective
  '202-06': '2026-05-05',
  '202-18': '2026-05-05',
  '202-29': '2026-05-05',
  '202-39': '2026-05-05',
  '216-12': '2026-05-05',
  '216-13': '2026-05-05',
  '216-15': '2026-05-05',
  '217-01': '2026-05-05',
  '217-07': '2026-05-05',
  '217-09': '2026-05-05',
  '217-13': '2026-05-05',
  '217-14': '2026-05-05',
  '219-23': '2026-05-05',
  '221-21': '2026-05-05',
  '221-22': '2026-05-05',
  // June 2026 effective
  '212-125': '2026-06-04',
  '202-19': '2026-06-02',
  '207-07': '2026-05-28',  // Second update
  '207-01': '2026-05-27',
  '320-04': '2026-05-18',
};

// Map procedure numbers to section files
export const PROCEDURE_TO_SECTION = {
  // 202 - Supervisor duties
  '202-05': 'section-202-officers.md',
  '202-06': 'section-202-officers.md',
  '202-10': 'section-202-officers.md',
  '202-18': 'section-202-supervisors.md',
  '202-19': 'section-202-supervisors.md',
  '202-20': 'section-202-supervisors.md',
  '202-27': 'section-202-supervisors.md',
  '202-29': 'section-202-supervisors.md',
  '202-32': 'section-202-supervisors.md',
  '202-38': 'section-202-supervisors.md',
  '202-39': 'section-202-supervisors.md',
  // 207 - Complaints
  '207-01': 'section-207-complaint-system.md',
  '207-06': 'section-207-notifications.md',
  '207-07': 'section-207-investigations.md',
  '207-12': 'section-207-complaint-system.md',
  '207-33': 'section-207-investigations.md',
  // 208 - Arrests
  '208-14': 'section-208-law-and-processing.md',
  '208-44': 'section-208-special-arrests.md',
  '208-69': 'section-208-notifications.md',
  '208-83': 'section-208-domestic-violence.md',
  // 209 - Summonses
  '209-02': 'section-209-conditions-and-types.md',
  '209-37': 'section-209-specialized.md',
  '209-39': 'section-209-specialized.md',
  // 210 - Prisoners
  '210-04': 'section-210-general-procedure.md',
  '210-19': 'section-210-general-procedure.md',
  // 211 - Court
  '211-21': 'section-211-department-attorney.md',
  // 212 - Command Operations
  '212-02': 'section-212-miscellaneous.md',
  '212-12': 'section-212-technology-systems.md',
  '212-55': 'section-212-special-incidents.md',
  '212-57': 'section-212-miscellaneous.md',
  '212-99': 'section-212-technology-systems.md',
  '212-125': 'section-212-miscellaneous.md',
  // 213 - Emergency
  '213-03': 'section-213-mobilization-readiness.md',
  '213-04': 'section-213-mobilization-readiness.md',
  // 214 - Quality of Life
  '214-34': 'section-214-enforcement-programs.md',
  '214-38': 'section-214-miscellaneous-qol.md',
  // 215 - Juvenile
  '215-01': 'section-215-lost-runaway-children.md',
  '215-07': 'section-215-juvenile-delinquency.md',
  '215-13': 'section-215-school-related.md',
  '215-20': 'section-215-child-protection.md',
  '215-21': 'section-215-child-protection.md',
  // 216 - Aided
  '216-02': 'section-216-general-procedure.md',
  '216-12': 'section-216-special-aided.md',
  '216-13': 'section-216-special-aided.md',
  '216-15': 'section-216-special-aided.md',
  // 217 - Vehicle Collisions
  '217-01': 'section-217-collisions-general.md',
  '217-02': 'section-217-collisions-general.md',
  '217-07': 'section-217-collisions-general.md',
  '217-09': 'section-217-collisions-general.md',
  '217-13': 'section-217-highways-chemical-test.md',
  '217-14': 'section-217-highways-chemical-test.md',
  '217-15': 'section-217-collisions-general.md',
  // 218 - Property
  '218-23': 'section-218-evidence-processing.md',
  '218-26': 'section-218-found-decedent-currency.md',
  // 219 - Department Property
  '219-09': 'section-219-vehicles-fleet.md',
  '219-12': 'section-219-fuel-facilities.md',
  '219-20': 'section-219-loss-theft.md',
  '219-23': 'section-219-it-communications.md',
  '219-26': 'section-219-it-communications.md',
  // 221 - Tactical
  '221-21': 'section-221-force-reporting.md',
  '221-22': 'section-221-force-reporting.md',
  // 303 - Duties
  '303-14': 'section-303-extended.md',
  '303-15': 'section-303-extended.md',
  '303-17': 'section-303-extended.md',
  // 304 - General Regulations
  '304-22': 'section-304-22-fraternal-organizations.md',
  '304-24': 'section-304-prohibited-conduct.md',
  // 305 - Uniforms
  '305-08': 'section-305-required-equipment.md',
  '305-19': 'section-305-firearms-regulations.md',
  // 318 - Disciplinary
  '318-09': 'section-318-mos-arrested.md',
  '318-17': 'section-318-citywide-cd-system.md',
  '318-21': 'section-318-citywide-cd-system.md',
  // 319 - Civilian
  '319-04': 'section-319-civilian-injury.md',
  '319-11': 'section-319-11.md',
  '319-12': 'section-319-civilian-injury.md',
  '319-18': 'section-319-civilian-injury.md',
  '319-25': 'section-319-civilian-injury.md',
  // 320 - Personnel
  '320-04': 'section-320-04.md',
  // 324 - Leave
  '324-07': 'section-324-sick-vacation.md',
  '324-12': 'section-324-ranking-officers.md',
  '324-24': 'section-324-authorized-leave.md',
  // 326 - Communications (BWC footage release - referenced in 202-supervisors)
  '326-09': 'section-202-supervisors.md',
  // 329 - Career
  '329-06': 'section-329-retirement.md',
  '329-07': 'section-329-retirement.md',
  // 330 - Medical
  '330-03': 'section-330-line-of-duty-injury.md',
  '330-08': 'section-330-08-work-related-fatalities.md',
  // 332 - Employee Rights
  '332-15': 'section-332-15.md',
  '332-17': 'section-332-17.md',
};

/**
 * Get chapter directory from procedure prefix
 */
export function getChapter(procNum) {
  const prefix = parseInt(procNum.split('-')[0]);
  if (prefix >= 200 && prefix <= 209) {
    if (prefix === 202) return '202-duties-responsibilities';
    if (prefix === 207) return '207-complaints';
    if (prefix === 208) return '208-arrests';
    if (prefix === 209) return '209-summonses';
    return `${prefix}-general`;
  }
  if (prefix >= 210 && prefix <= 213) {
    if (prefix === 210) return '210-prisoners';
    if (prefix === 211) return '211-court-appearances';
    if (prefix === 212) return '212-command-operations';
    if (prefix === 213) return '213-mobilization-emergency';
  }
  if (prefix >= 214 && prefix <= 217) {
    if (prefix === 214) return '214-quality-of-life';
    if (prefix === 215) return '215-juvenile-matters';
    if (prefix === 216) return '216-aided-cases';
    if (prefix === 217) return '217-vehicle-collisions';
  }
  if (prefix >= 218 && prefix <= 221) {
    if (prefix === 218) return '218-property-general';
    if (prefix === 219) return '219-department-property';
    if (prefix === 220) return '220-citywide-incident-mgmt';
    if (prefix === 221) return '221-tactical-operations';
  }
  if (prefix === 303) return '303-duties-responsibilities';
  if (prefix === 304) return '304-general-regulations';
  if (prefix === 305) return '305-uniforms-equipment';
  if (prefix >= 318 && prefix <= 319) {
    if (prefix === 318) return '318-disciplinary-matters';
    if (prefix === 319) return '319-civilian-personnel';
  }
  if (prefix >= 320 && prefix <= 324) {
    if (prefix === 320) return '320-personnel-matters';
    if (prefix === 324) return '324-leave-payroll-timekeeping';
  }
  if (prefix === 326) return '202-duties-responsibilities';
  if (prefix >= 329 && prefix <= 332) {
    if (prefix === 329) return '329-career-development';
    if (prefix === 330) return '330-medical-health-wellness';
    if (prefix === 331) return '331-evaluations';
    if (prefix === 332) return '332-employee-rights';
  }
  return null;
}

/**
 * Map procedure to most recent expected date from timeline
 */
export function getExpectedDate(procNum) {
  for (const update of UPDATES) {
    if (update.procedures.includes(procNum)) {
      return update.date;
    }
  }
  return null;
}

/**
 * Count questions in review-questions.md
 * Authoritative: counts <summary>Answer</summary> blocks (one per question)
 * Also validates numbering sequence
 */
export function countQuestions(markdown) {
  // Authoritative: one answer reveal per question. Format-independent.
  const count = (markdown.match(/<summary>\s*Answer\s*<\/summary>/gi) || []).length;

  // Independent cross-check on declared question numbers.
  const numbers = [];
  for (const line of markdown.split('\n')) {
    // Match: **1.**, **1**., ## Question 1, ### Question 1
    const m = line.match(/^###\s+Question\s+(\d+)/i) || line.match(/^##\s+Question\s+(\d+)/i) || line.match(/^\*\*(\d+)\./);
    if (m) numbers.push(parseInt(m[1], 10));
  }
  const sorted = [...numbers].sort((a, b) => a - b);
  const max = sorted.length ? sorted[sorted.length - 1] : 0;
  const missing = Array.from({ length: max }, (_, i) => i + 1).filter(n => !sorted.includes(n));
  const dupes = [...new Set(sorted.filter((n, i) => i > 0 && n === sorted[i - 1]))];

  return {
    count,                              // use THIS for the README comparison
    declared: numbers.length,
    maxNumber: max,
    missingNumbers: missing,
    duplicates: dupes,
    consistent: count === numbers.length && missing.length === 0 && dupes.length === 0,
  };
}

/**
 * Check if file contains a procedure heading for the given procedure number
 */
export function fileHasProcedureHeading(markdown, procNum) {
  const esc = procNum.replace(/-/g, '\\-');
  return new RegExp(`^#{2,4}\\s+(?:P\\.G\\.|A\\.G\\.)\\s*${esc}\\b`, 'm').test(markdown);
}

/**
 * Convert ISO date to readable format
 */
export function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
}
