/**
 * Content Sanitization Utilities
 * Protects against Stored XSS and malicious script injections
 * while allowing safe rich text formatting for campaign stories.
 */

// Disallowed tags that could execute scripts or compromise the page
const DANGEROUS_TAGS_REGEX = /<\s*\/?\s*(script|iframe|object|embed|applet|meta|link|style|form|input|button|svg|math)[^>]*>/gi;

// Disallowed attributes like onerror, onclick, onload, etc.
const DANGEROUS_ATTRS_REGEX = /\s*(on[a-z]+|javascript:|data:text\/html)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;

// Disallowed href schemes
const DANGEROUS_HREF_REGEX = /href\s*=\s*["']?\s*(javascript|vbscript|data):[^"'>\s]*/gi;

/**
 * Sanitize rich text / HTML content for campaign stories and updates.
 * Removes script tags, malicious event handlers, and unsafe URI schemes.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return "";

  let cleaned = dirty
    .replace(DANGEROUS_TAGS_REGEX, "")
    .replace(DANGEROUS_ATTRS_REGEX, "")
    .replace(DANGEROUS_HREF_REGEX, 'href="#"');

  // Ensure external links have safe rel attributes
  cleaned = cleaned.replace(
    /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi,
    '<a href="$2" target="_blank" rel="noopener noreferrer"'
  );

  return cleaned.trim();
}

/**
 * Strip all HTML tags completely for plain text fields (names, prayers, short descriptions).
 */
export function sanitizePlainText(text: string): string {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, "") // strip html tags
    .replace(/&[a-z]+;/gi, " ") // strip html entities
    .replace(/\s+/g, " ") // normalize whitespace
    .trim();
}

/**
 * Truncate string to max length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}
