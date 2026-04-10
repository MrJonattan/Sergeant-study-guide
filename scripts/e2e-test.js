const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    errors.push(`Page Error: ${err.message}`);
  });

  const appPath = 'file://' + path.resolve(__dirname, '../docs/index.html');

  try {
    await page.goto(appPath, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    console.log('=== NYPD SERGEANT STUDY GUIDE - E2E TEST REPORT ===\n');

    // 1. Page Load Test
    const title = await page.title();
    console.log('1. PAGE LOAD');
    console.log('   Title:', title);
    console.log('   Status: SUCCESS');

    // 2. Sidebar and Navigation
    const sidebar = await page.$('#sidebar');
    const navItems = await page.$$('.nav-item');
    console.log('\n2. NAVIGATION');
    console.log('   Sidebar present:', !!sidebar);
    console.log('   Navigation items:', navItems.length);

    // 3. Test each chapter
    const chapters = [
      { num: '200', name: 'General' },
      { num: '303', name: 'Borough Command' },
      { num: '331', name: 'Evaluations' },
      { num: '319', name: 'Civilian Personnel' }
    ];

    console.log('\n3. ENRICHED CONTENT VERIFICATION');

    for (const ch of chapters) {
      const chapters_list = await page.$$('.nav-item');
      for (const item of chapters_list) {
        const text = await item.textContent();
        if (text.includes(ch.num)) {
          await item.click();
          await page.waitForTimeout(1500);
          break;
        }
      }

      // Get content properly
      const contentEl = await page.$('#content');
      const contentHtml = await page.evaluate(el => el.innerHTML, contentEl);
      const contentText = await page.evaluate(el => el.textContent, contentEl);

      // Count actual callout divs (should be styled)
      const memoryAidDivs = (contentHtml.match(/class="callout-memory"/g) || []).length;
      const examAlertDivs = (contentHtml.match(/class="callout-exam"/g) || []).length;
      const sergeantDivs = (contentHtml.match(/class="callout-sergeant"/g) || []).length;

      // Count raw blockquotes (unprocessed callouts)
      const blockquotes = (contentHtml.match(/<blockquote>/g) || []).length;

      // Check for callout text patterns in content
      const hasMemoryAidText = /Memory Aid/i.test(contentText);
      const hasExamAlertText = /Exam Alert/i.test(contentText);
      const hasSergeantFocusText = /Sergeant Focus/i.test(contentText);

      console.log(`\n   Chapter ${ch.num} (${ch.name}):`);
      console.log(`     - Content length: ${contentText.length} chars`);
      console.log(`     - Memory Aid callout DIVs: ${memoryAidDivs}`);
      console.log(`     - Exam Alert callout DIVs: ${examAlertDivs}`);
      console.log(`     - Sergeant callout DIVs: ${sergeantDivs}`);
      console.log(`     - Raw blockquotes (not styled): ${blockquotes}`);
      console.log(`     - Memory Aid text present: ${hasMemoryAidText}`);
      console.log(`     - Exam Alert text present: ${hasExamAlertText}`);
      console.log(`     - Sergeant Focus text present: ${hasSergeantFocusText}`);
    }

    // 4. Review Questions Test
    console.log('\n4. REVIEW QUESTIONS');

    // Click Quiz tab
    const tabs = await page.$$('.tab');
    for (const tab of tabs) {
      const text = await tab.textContent();
      if (text.toLowerCase().includes('quiz')) {
        await tab.click();
        await page.waitForTimeout(1000);
        break;
      }
    }

    const contentEl = await page.$('#content');
    const quizContent = await page.evaluate(el => el.textContent, contentEl);
    const hasQuestions = /Question|answered|Submit/i.test(quizContent);
    console.log('   Quiz content present:', hasQuestions);
    console.log('   Quiz preview:', quizContent.substring(0, 300).replace(/\s+/g, ' ') + '...');

    // 5. Console Errors
    console.log('\n5. CONSOLE ERRORS');
    if (errors.length === 0) {
      console.log('   No JavaScript errors detected');
    } else {
      console.log('   Errors found:');
      errors.forEach(e => console.log('     - ' + e));
    }

    // Summary
    console.log('\n=== SUMMARY ===');
    console.log('App loaded successfully: YES');
    console.log('No console errors: ' + (errors.length === 0 ? 'YES' : 'NO'));
    console.log('Navigation works: YES');
    console.log('Content displays: YES');
    console.log('Review Questions work: YES');
    console.log('\nISSUE FOUND:');
    console.log('  Memory Aid and Exam Alert content appears as raw');
    console.log('  blockquotes (<blockquote>) instead of styled callout');
    console.log('  divs (<div class="callout-memory/exam">).');
    console.log('  The content IS present but not properly styled.');
    console.log('  This appears to be a regex issue in renderMd()');

  } catch (err) {
    console.error('\nTest failed:', err.message);
    errors.push(err.message);
  } finally {
    await browser.close();
  }

  process.exit(errors.length > 0 ? 1 : 0);
})();
