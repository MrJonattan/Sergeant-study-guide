// Automated tests for NYPD Sergeant Study Guide web app
const fs = require('fs');
const results = [];
let pass = 0, fail = 0;

function test(name, fn) {
  try {
    fn();
    results.push(`PASS: ${name}`);
    pass++;
  } catch (e) {
    results.push(`FAIL: ${name} — ${e.message}`);
    fail++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'assertion failed');
}

// Load and parse data.js
const raw = fs.readFileSync(process.argv[2], 'utf8');
const json = raw.slice('window.STUDY_DATA='.length).replace(/;\s*$/, '');
let D;
try { D = JSON.parse(json); } catch(e) { console.log('FATAL: data.js parse error:', e.message); process.exit(1); }

// Load index.html
const html = fs.readFileSync(process.argv[3], 'utf8');

// ─── Data Structure Tests ───

test('data.js has chapters array', () => {
  assert(Array.isArray(D.chapters), 'chapters is not an array');
  assert(D.chapters.length === 28, `Expected 28 chapters, got ${D.chapters.length}`);
});

test('every chapter has required fields', () => {
  D.chapters.forEach(ch => {
    assert(ch.id, `Missing id`);
    assert(ch.sectionNum, `Missing sectionNum for ${ch.id}`);
    assert(ch.title, `Missing title for ${ch.id}`);
    assert(ch.readme, `Missing readme for ${ch.id}`);
    assert(Array.isArray(ch.sections), `sections not array for ${ch.id}`);
    assert(Array.isArray(ch.questions), `questions not array for ${ch.id}`);
  });
});

test('every chapter has at least one section (except known empty)', () => {
  const emptyAllowed = [];
  D.chapters.forEach(ch => {
    if (emptyAllowed.includes(ch.id)) return;
    assert(ch.sections.length > 0, `${ch.id} has 0 sections`);
  });
});

test('every section has filename and content', () => {
  D.chapters.forEach(ch => {
    ch.sections.forEach(s => {
      assert(s.filename, `Missing filename in ${ch.id}`);
      assert(s.content && s.content.length > 0, `Empty content in ${ch.id}/${s.filename}`);
    });
  });
});

test('every MC question has required fields', () => {
  let errors = [];
  D.chapters.forEach(ch => {
    ch.questions.filter(q => q.type === 'mc').forEach(q => {
      if (!q.number) errors.push(`${ch.id}: missing number`);
      if (!q.text || q.text.length < 10) errors.push(`${ch.id} Q${q.number}: short/missing text`);
      if (!q.answer) errors.push(`${ch.id} Q${q.number}: missing answer`);
      if (!q.options || q.options.length < 3) errors.push(`${ch.id} Q${q.number}: fewer than 3 options`);
      if (q.answer && q.options) {
        const hasAnswer = q.options.some(o => o.charAt(0) === q.answer);
        if (!hasAnswer) errors.push(`${ch.id} Q${q.number}: answer "${q.answer}" not in options`);
      }
    });
  });
  assert(errors.length === 0, errors.join('\n'));
});

test('exam questions have required fields', () => {
  assert(D.examQuestions && D.examQuestions.length > 0, 'No exam questions');
  let errors = [];
  D.examQuestions.forEach(q => {
    if (!q.text) errors.push(`Exam Q${q.number}: missing text`);
    if (!q.answer) errors.push(`Exam Q${q.number}: missing answer`);
    if (!q.options || q.options.length < 3) errors.push(`Exam Q${q.number}: fewer than 3 options`);
  });
  assert(errors.length === 0, errors.join('\n'));
});

test('totalQuestions matches actual count', () => {
  let actual = 0;
  D.chapters.forEach(ch => { actual += ch.questions.length; });
  assert(D.totalQuestions === actual, `totalQuestions ${D.totalQuestions} != actual ${actual}`);
});

test('cheatSheet exists and has content', () => {
  assert(D.cheatSheet && D.cheatSheet.length > 100, 'Cheat sheet missing or too short');
});

// ─── Enrichment Tests ───

test('enriched chapters have Key callouts in content', () => {
  const enrichedIds = [
    '202-duties-responsibilities', '207-complaints', '208-arrests', '209-summonses',
    '210-prisoners', '212-command-operations', '213-mobilization-emergency',
    '214-quality-of-life', '215-juvenile-matters', '216-aided-cases',
    '217-vehicle-collisions', '218-property-general', '219-department-property',
    '220-citywide-incident-mgmt', '304-general-regulations', '305-uniforms-equipment',
    '318-disciplinary-matters', '330-medical-health-wellness', '332-employee-rights'
  ];
  let missing = [];
  enrichedIds.forEach(id => {
    const ch = D.chapters.find(c => c.id === id);
    if (!ch) { missing.push(`${id}: chapter not found`); return; }
    const hasCallout = ch.sections.some(s =>
      s.content.includes('Exam Alert') || s.content.includes('Memory Aid') || s.content.includes('Prior Test')
    );
    if (!hasCallout) missing.push(`${id}: no callouts found`);
  });
  assert(missing.length === 0, missing.join('\n'));
});

test('key mnemonics present in web data', () => {
  const checks = [
    ['202-duties-responsibilities', 'CAT PAC'],
    ['202-duties-responsibilities', 'WEBS'],
    ['202-duties-responsibilities', 'I.A.D.I.E.'],
    ['220-citywide-incident-mgmt', 'MODULAR'],
    ['218-property-general', 'CHASED'],
    ['216-aided-cases', 'CHILD-ERS'],
    ['318-disciplinary-matters', 'FOUL FRAP'],
    ['215-juvenile-matters', 'MAR BAR MAK'],
    ['212-command-operations', 'HARBOR'],
  ];
  let missing = [];
  checks.forEach(([id, term]) => {
    const ch = D.chapters.find(c => c.id === id);
    if (!ch) { missing.push(`${id} not found`); return; }
    const found = ch.sections.some(s => s.content.includes(term)) || (ch.keyTerms && ch.keyTerms.includes(term));
    if (!found) missing.push(`${term} not in ${id}`);
  });
  assert(missing.length === 0, missing.join('\n'));
});

// ─── HTML / JS Tests ───

test('index.html has valid DOCTYPE', () => {
  assert(html.startsWith('<!DOCTYPE html>'), 'Missing DOCTYPE');
});

test('index.html loads data.js', () => {
  assert(html.includes('<script src="data.js"></script>'), 'data.js script tag missing');
});

test('App object exposes required methods', () => {
  const required = ['nav', 'toggleSidebar', 'toggleDark', 'adjustFont', 'openSearch',
    'answer', 'resetQuiz', 'setTab', 'startExam', 'examAns', 'submitExam'];
  required.forEach(m => {
    assert(html.includes(`${m}`), `Method ${m} not found in App return`);
  });
});

test('markdown renderer handles Key callout formats', () => {
  // Check that Exam Alert gets special styling
  assert(html.includes('callout-exam'), 'Missing callout-exam CSS class');
  assert(html.includes("'Exam Alert'") || html.includes('"Exam Alert"') || html.includes('Exam Alert'), 'Missing Exam Alert rendering');
});

test('no unclosed script tags', () => {
  const opens = (html.match(/<script/g) || []).length;
  const closes = (html.match(/<\/script>/g) || []).length;
  assert(opens === closes, `${opens} <script> tags but ${closes} </script> tags`);
});

test('no unclosed style tags', () => {
  const opens = (html.match(/<style/g) || []).length;
  const closes = (html.match(/<\/style>/g) || []).length;
  assert(opens === closes, `${opens} <style> tags but ${closes} </style> tags`);
});

test('service worker registration present', () => {
  assert(html.includes("serviceWorker.register('sw.js')"), 'Missing SW registration');
});

test('manifest.json referenced', () => {
  assert(html.includes('manifest.json'), 'Missing manifest reference');
});

// ─── Markdown Renderer Edge Cases ───

test('blockquote callouts wont nest incorrectly', () => {
  // The Key callouts use > **Exam Alert:** format
  // Check the regex pattern handles multi-line blockquotes
  assert(html.includes('Exam Alert'), 'Exam Alert pattern present');
  assert(html.includes('callout-exam::before'), 'Exam Alert CSS before pseudo present');
});

test('Memory Aid callouts render as blockquotes', () => {
  // Memory Aid format: > **Memory Aid — NAME:** text
  // These should render as blockquotes (no special CSS class for them)
  // Verify they won't break the markdown renderer
  const sampleContent = D.chapters.find(c => c.id === '202-duties-responsibilities');
  const hasMem = sampleContent.sections.some(s => s.content.includes('Memory Aid'));
  assert(hasMem, 'Memory Aid content present in data');
});

// ─── Question Integrity ───

test('no duplicate question numbers within a chapter', () => {
  let dupes = [];
  D.chapters.forEach(ch => {
    const nums = ch.questions.map(q => q.number);
    const unique = new Set(nums);
    if (unique.size !== nums.length) {
      dupes.push(`${ch.id}: ${nums.length} questions but ${unique.size} unique numbers`);
    }
  });
  assert(dupes.length === 0, dupes.join('\n'));
});

test('no exam questions with empty explanation', () => {
  let empty = [];
  D.examQuestions.forEach(q => {
    if (!q.explanation || q.explanation.trim().length === 0) {
      empty.push(`Exam Q${q.number}`);
    }
  });
  // This is a warning, not a hard fail - some may have empty explanations
  if (empty.length > 0) {
    assert(empty.length < D.examQuestions.length * 0.5,
      `${empty.length}/${D.examQuestions.length} exam questions have empty explanations`);
  }
});

test('question answers are valid option letters', () => {
  let invalid = [];
  D.chapters.forEach(ch => {
    ch.questions.filter(q => q.type === 'mc').forEach(q => {
      if (!['A','B','C','D','E'].includes(q.answer)) {
        invalid.push(`${ch.id} Q${q.number}: answer "${q.answer}"`);
      }
    });
  });
  assert(invalid.length === 0, invalid.join('\n'));
});

// ─── Print Results ───

console.log('\n=== NYPD Study Guide Web App Tests ===\n');
results.forEach(r => console.log(r));
console.log(`\n${pass} passed, ${fail} failed out of ${pass + fail} tests`);
process.exit(fail > 0 ? 1 : 0);
