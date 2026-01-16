/**
 * Parses a very limited subset of inline Markdown.
 *
 * Assumes trusted input only.
 * Do NOT use with user-generated or untrusted content.
 */
export function parseInlineMarkdown(text: string): string {
  if (!text) return text;

  let html = text;

  // **bold**
  html = html.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong class="font-bold">$1</strong>',
  );

  // [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-blue-600 hover:text-blue-800 underline">$1</a>',
  );

  // `code`
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 bg-slate-100 text-slate-900 rounded text-sm font-mono border border-slate-200">$1</code>',
  );

  return html;
}
