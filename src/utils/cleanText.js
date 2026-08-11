/**
 * Decodes HTML entities (e.g. &amp;, &#39;, &lt;, &gt;) and cleans up string whitespace.
 */
export function cleanText(str) {
  if (!str) return '';
  let txt = String(str);

  // Decode common HTML entities
  txt = txt
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ');

  // Collapse multiple newlines into clean space for inline bio preview
  txt = txt.replace(/\s+/g, ' ').strip?.() || txt.replace(/\s+/g, ' ').trim();
  return txt;
}
