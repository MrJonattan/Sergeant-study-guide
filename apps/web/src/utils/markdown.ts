/**
 * Simple markdown renderer with callout detection
 */

export function renderMarkdown(md: string): string {
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
        // Handle bold memory aid without colon format
        const text = quoteContent.replace(
          /\*\*[^*]+\*\*/g,
          m => `<strong>${m.replace(/\*\*/g, '')}</strong>`
        );
        output.push(
          `<div class="callout callout-memory"><div class="callout-title">Memory Aid</div><p>${parseInline(text)}</p></div>`
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

    // Headers
    const h1Match = trimmed.match(/^# (.+)$/);
    const h2Match = trimmed.match(/^## (.+)$/);
    const h3Match = trimmed.match(/^### (.+)$/);
    const h4Match = trimmed.match(/^#### (.+)$/);
    const h5Match = trimmed.match(/^##### (.+)$/);
    const h6Match = trimmed.match(/^###### (.+)$/);

    if (h1Match) {
      flushTable();
      flushList();
      output.push(`<h1 class="cheatsheet-h1">${parseInline(h1Match[1])}</h1>`);
      continue;
    }
    if (h2Match) {
      flushTable();
      flushList();
      output.push(`<h2 class="cheatsheet-h2">${parseInline(h2Match[1])}</h2>`);
      continue;
    }
    if (h3Match) {
      flushTable();
      flushList();
      output.push(`<h3 class="cheatsheet-h3">${parseInline(h3Match[1])}</h3>`);
      continue;
    }
    if (h4Match) {
      flushTable();
      flushList();
      output.push(`<h4 class="cheatsheet-h4">${parseInline(h4Match[1])}</h4>`);
      continue;
    }
    if (h5Match || h6Match) {
      flushTable();
      flushList();
      output.push(
        `<p class="cheatsheet-paragraph"><strong>${parseInline(h5Match ? h5Match[1] : h6Match[1])}</strong></p>`
      );
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

  // Escape HTML first
  result = result.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Bold **text**
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic *text*
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Inline code `text`
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');

  return result;
}
