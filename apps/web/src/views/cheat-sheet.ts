/**
 * Cheat Sheet view - Quick reference guide with collapsible sections
 */

import { updateBreadcrumbs } from '../components/topbar';
import { appState } from '../main';

export function renderCheatSheet() {
  updateBreadcrumbs([{ label: 'Home', route: 'home' }, { label: 'Cheat Sheet' }]);

  const content = document.getElementById('content');
  if (!content) return;

  const cheatSheetMd = appState.data?.cheatSheet || '';
  const sections = parseCheatSheetSections(cheatSheetMd);

  content.innerHTML = `
    <div class="cheatsheet-container">
      <div class="cheatsheet-header">
        <h1>Quick Reference Cheat Sheet</h1>
        <p class="cheatsheet-subtitle">Essential tables, timeframes, and memory aids for the Sergeant Exam</p>
      </div>

      <nav class="cheatsheet-nav">
        <details class="cheatsheet-toc">
          <summary>📑 Jump to Section</summary>
          <div class="cheatsheet-toc-list">
            ${sections
              .map(
                (s, i) => `
              <a href="#section-${i}" class="cheatsheet-toc-link">${s.title}</a>
            `
              )
              .join('')}
          </div>
        </details>
      </nav>

      <div class="cheatsheet-content">
        ${sections.map((section, i) => renderSection(section, i)).join('')}
      </div>
    </div>
  `;

  // Add smooth scroll
  document.querySelectorAll('.cheatsheet-toc-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.getAttribute('href')?.slice(1);
      const target = document.getElementById(targetId || '');
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

interface CheatSheetSection {
  title: string;
  content: string;
}

function parseCheatSheetSections(md: string): CheatSheetSection[] {
  const sections: CheatSheetSection[] = [];
  const lines = md.split('\n');
  let currentSection: CheatSheetSection | null = null;

  for (const line of lines) {
    const headerMatch = line.match(/^## (.+)$/);
    if (headerMatch) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: headerMatch[1],
        content: '',
      };
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

function renderSection(section: CheatSheetSection, index: number): string {
  const contentHtml = renderMarkdown(section.content);

  return `
    <section id="section-${index}" class="cheatsheet-section">
      <h2 class="cheatsheet-section-title">
        <span class="cheatsheet-section-number">${String(index + 1).padStart(2, '0')}</span>
        ${section.title}
      </h2>
      <div class="cheatsheet-section-content">
        ${contentHtml}
      </div>
    </section>
  `;
}

function renderMarkdown(md: string): string {
  if (!md) return '';

  const lines = md.split('\n');
  const output: string[] = [];
  let inTable = false;
  let tableRows: string[] = [];
  let inList = false;
  let listItems: string[] = [];
  let listIsOrdered = false;
  let orderedListStart = 1;

  function flushTable() {
    if (tableRows.length > 0) {
      const hasHeader = tableRows.some(r => r.includes('|---'));
      const isSeparator = (row: string) => row.includes('|---');

      const dataRows = tableRows.filter(r => !isSeparator(r));
      if (dataRows.length > 0) {
        let html = '<table class="cheatsheet-table">';
        if (hasHeader && dataRows.length > 1) {
          const headers = dataRows[0]
            .split('|')
            .filter(c => c.trim())
            .map(c => `<th>${parseInline(c.trim())}</th>`)
            .join('');
          html += `<thead><tr>${headers}</tr></thead><tbody>`;
          for (let i = 1; i < dataRows.length; i++) {
            const cells = dataRows[i]
              .split('|')
              .filter(c => c.trim())
              .map(c => `<td>${parseInline(c.trim())}</td>`)
              .join('');
            html += `<tr>${cells}</tr>`;
          }
          html += '</tbody></table>';
        } else {
          for (const row of dataRows) {
            const cells = row
              .split('|')
              .filter(c => c.trim())
              .map(c => `<td>${parseInline(c.trim())}</td>`)
              .join('');
            html += `<tr>${cells}</tr>`;
          }
          html += '</table>';
        }
        output.push(html);
      }
    }
    tableRows = [];
    inTable = false;
  }

  function flushList() {
    if (listItems.length > 0) {
      if (listIsOrdered) {
        output.push(
          `<ol class="cheatsheet-list" start="${orderedListStart}">${listItems.join('')}</ol>`
        );
      } else {
        output.push(`<ul class="cheatsheet-list">${listItems.join('')}</ul>`);
      }
    }
    listItems = [];
    inList = false;
    listIsOrdered = false;
    orderedListStart = 1;
  }

  for (const line of lines) {
    const trimmed = line.trim();

    // Empty line - flush buffers
    if (trimmed === '') {
      flushTable();
      flushList();
      continue;
    }

    // Table row
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!inTable) {
        flushList();
        inTable = true;
      }
      tableRows.push(trimmed);
      continue;
    }

    // Unordered list item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushTable();
      if (!inList || listIsOrdered) {
        flushList();
        inList = true;
        listIsOrdered = false;
      }
      listItems.push(`<li class="cheatsheet-list-item">${parseInline(trimmed.slice(2))}</li>`);
      continue;
    }

    // Ordered list item (1. 2. 3. etc)
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (orderedMatch) {
      flushTable();
      if (!inList || !listIsOrdered) {
        flushList();
        inList = true;
        listIsOrdered = true;
        orderedListStart = parseInt(orderedMatch[1], 10);
      }
      listItems.push(`<li class="cheatsheet-list-item">${parseInline(orderedMatch[2])}</li>`);
      continue;
    }

    // Blockquote with callout detection
    if (trimmed.startsWith('>')) {
      flushTable();
      flushList();
      const quoteContent = trimmed.slice(1).trim();

      // Detect callout types
      if (quoteContent.includes('**Exam Alert')) {
        const text = quoteContent.replace(/\*\*Exam Alert[^*]*\*\*/g, '');
        output.push(
          `<div class="callout callout-exam"><div class="callout-title">Exam Alert</div><p>${parseInline(text)}</p></div>`
        );
      } else if (quoteContent.includes('**Memory Aid')) {
        const text = quoteContent.replace(/\*\*Memory Aid[^*]*\*\*/g, '');
        output.push(
          `<div class="callout callout-memory"><div class="callout-title">Memory Aid</div><p>${parseInline(text)}</p></div>`
        );
      } else if (quoteContent.includes('**Prior Test')) {
        const text = quoteContent.replace(/\*\*Prior Test[^*]*\*\*/g, '');
        output.push(
          `<div class="callout callout-prior"><div class="callout-title">Prior Test</div><p>${parseInline(text)}</p></div>`
        );
      } else if (quoteContent.includes('**PG Conflict')) {
        const text = quoteContent.replace(/\*\*PG Conflict[^*]*\*\*/g, '');
        output.push(
          `<div class="callout callout-conflict"><div class="callout-title">PG Conflict</div><p>${parseInline(text)}</p></div>`
        );
      } else if (quoteContent.includes('**See Also')) {
        const text = quoteContent.replace(/\*\*See Also[^*]*\*\*/g, '');
        output.push(
          `<div class="callout callout-seealso"><div class="callout-title">See Also</div><p>${parseInline(text)}</p></div>`
        );
      } else if (quoteContent.includes('**Sergeant Focus')) {
        const text = quoteContent.replace(/\*\*Sergeant Focus[^*]*\*\*/g, '');
        output.push(
          `<div class="callout callout-sergeant"><div class="callout-title">Sergeant Focus</div><p>${parseInline(text)}</p></div>`
        );
      } else if (quoteContent.includes('**NOTE:**')) {
        const text = quoteContent.replace(/\*\*NOTE:\*\*/g, '');
        output.push(
          `<div class="callout callout-note"><div class="callout-title">Note</div><p>${parseInline(text)}</p></div>`
        );
      } else if (quoteContent.startsWith('**Memory Aid')) {
        // Handle bold memory aid without colon format - DON'T double-process bold
        output.push(
          `<div class="callout callout-memory"><div class="callout-title">Memory Aid</div><p>${parseInline(quoteContent)}</p></div>`
        );
      } else {
        output.push(
          `<blockquote class="cheatsheet-blockquote">${parseInline(quoteContent)}</blockquote>`
        );
      }
      continue;
    }

    // Horizontal rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushTable();
      flushList();
      continue;
    }

    // Regular paragraph
    flushTable();
    flushList();
    output.push(`<p class="cheatsheet-paragraph">${parseInline(trimmed)}</p>`);
  }

  // Flush remaining
  flushTable();
  flushList();

  return output.join('');
}

function parseInline(text: string): string {
  if (!text) return '';

  let result = text;

  // Bold **text**
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic *text*
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Inline code `text`
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');

  return result;
}
