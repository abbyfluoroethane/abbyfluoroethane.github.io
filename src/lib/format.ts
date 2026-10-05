// Dates in front matter have no time zone. Format them in UTC so the build
// machine's time zone does not shift the day.

/** "July 22, 2026" (Jekyll's "%B %-d, %Y") */
export const formatLongDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

/** "2026-07-22T00:00:00+00:00" (Jekyll's date_to_xmlschema) */
export const formatXmlDate = (date: Date) =>
  date.toISOString().replace(/\.\d+Z$/, '+00:00');

/** Plain text of the first paragraph of a markdown body. */
export function excerpt(body = ''): string {
  const first = body.trim().split(/\n\s*\n/)[0] ?? '';
  return first
    .replace(/^#{1,6}\s+/, '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/(\*\*|__)(.+?)\1/gs, '$2')
    .replace(/(\*|_)(.+?)\1/gs, '$2')
    .replace(/`([^`]*)`/g, '$1');
}

/** Keep the first `n` words. Add `suffix` only when words were cut. */
export function truncateWords(text: string, n: number, suffix = '...'): string {
  const words = text.split(/\s+/).filter(Boolean);
  return words.length > n ? words.slice(0, n).join(' ') + suffix : words.join(' ');
}
