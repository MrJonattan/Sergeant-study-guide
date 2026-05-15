/**
 * Simple markdown renderer with callout detection
 */

export function renderMarkdown(md: string): string {
  if (!md) return '';

  let html = md;

  // Escape HTML
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');

  // Inline code
  html = html.replace(/`(.*?)`/gim, '<code>$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]+)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" style="max-width: 100%;">');

  // Blockquotes with callout detection
  html = html.replace(/^&gt; \*\*(Exam Alert):\*\* (.*$)/gim, '<div class="callout callout-exam"><div class="callout-title">$1</div><p>$2</p></div>');
  html = html.replace(/^&gt; \*\*(Memory Aid):\*\* (.*$)/gim, '<div class="callout callout-memory"><div class="callout-title">$1</div><p>$2</p></div>');
  html = html.replace(/^&gt; \*\*(Prior Test):\*\* (.*$)/gim, '<div class="callout callout-prior"><div class="callout-title">$1</div><p>$2</p></div>');
  html = html.replace(/^&gt; \*\*(PG Conflict):\*\* (.*$)/gim, '<div class="callout callout-conflict"><div class="callout-title">$1</div><p>$2</p></div>');
  html = html.replace(/^&gt; \*\*(See Also):\*\* (.*$)/gim, '<div class="callout callout-seealso"><div class="callout-title">$1</div><p>$2</p></div>');
  html = html.replace(/^&gt; \*\*(Sergeant Focus):\*\* (.*$)/gim, '<div class="callout callout-sergeant"><div class="callout-title">$1</div><p>$2</p></div>');

  // Regular blockquotes
  html = html.replace(/^&gt; (.*$)/gim, '<blockquote>$1</blockquote>');

  // Tables
  html = html.replace(/^\|(.+)\|/gim, '<tr><td>$1</td></tr>');
  html = html.replace(/<tr><td>(.+)<\/td><\/tr>/gim, (match, content) => {
    const cells = content.split('|').map(cell => `<td>${cell.trim()}</td>`).join('');
    return `<tr>${cells}</tr>`;
  });
  html = html.replace(/<tr>/gim, '<table><tr>');
  html = html.replace(/<\/tr>/gim, '</tr></table>');

  // Lists
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');

  // Paragraphs
  html = html.replace(/\n\n/gim, '</p><p>');
  html = '<p>' + html + '</p>';

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/gim, '');
  html = html.replace(/<p>(<h[123]>)/gim, '$1');
  html = html.replace(/(<\/h[123]>)<\/p>/gim, '$1');
  html = html.replace(/<p>(<ul>)/gim, '$1');
  html = html.replace(/(<\/ul>)<\/p>/gim, '$1');
  html = html.replace(/<p>(<table>)/gim, '$1');
  html = html.replace(/(<\/table>)<\/p>/gim, '$1');
  html = html.replace(/<p>(<pre>)/gim, '$1');
  html = html.replace(/(<\/pre>)<\/p>/gim, '$1');
  html = html.replace(/<p>(<div class="callout)/gim, '$1');
  html = html.replace(/(<\/div>)<\/p>/gim, '$1');

  // Details/Summary
  html = html.replace(/&lt;details&gt;/gim, '<details>');
  html = html.replace(/&lt;\/details&gt;/gim, '</details>');
  html = html.replace(/&lt;summary&gt;(.*?)&lt;\/summary&gt;/gim, '<summary>$1</summary>');

  return html;
}
