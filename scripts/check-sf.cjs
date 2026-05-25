const fs = require('fs');
const raw = fs.readFileSync('build/data.js', 'utf8');
const json = raw.replace('window.STUDY_DATA = ', '').replace(/;.*$/, '');
const D = JSON.parse(json);
const sfChapters = D.chapters.filter(c => c.sergeantFocus && c.sergeantFocus.length > 0);
console.log('Chapters with Sergeant Focus:', sfChapters.length);
console.log('Total callouts:', sfChapters.reduce((sum, c) => sum + c.sergeantFocus.length, 0));
console.log('\nChapters with SF and questions:');
sfChapters.forEach(c => {
  const qCount = c.questions?.length || 0;
  console.log(c.id + ': ' + c.sergeantFocus.length + ' callouts, ' + qCount + ' questions');
});
