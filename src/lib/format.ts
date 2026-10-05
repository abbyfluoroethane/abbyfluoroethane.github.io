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

/** Plain text of the first paragraph of a markdown body, with the same
 * ellipsis the rendered post shows. */
export function excerpt(body = ''): string {
  const first = body.trim().split(/\n\s*\n/)[0] ?? '';
  return first
    .replace(/^#{1,6}\s+/, '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/(\*\*|__)(.+?)\1/gs, '$2')
    .replace(/(\*|_)(.+?)\1/gs, '$2')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\.\.\./g, '…');
}

/** Keep the first `n` words. Add `suffix` only when words were cut. */
export function truncateWords(text: string, n: number, suffix = '...'): string {
  const words = text.split(/\s+/).filter(Boolean);
  return words.length > n ? words.slice(0, n).join(' ') + suffix : words.join(' ');
}

/** At most `n` words, ending on a full sentence when one fits. A cut in the
 * middle of a sentence ends in an ellipsis. */
export function truncateSentences(text: string, n: number): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= n) return words.join(' ');
  const head = words.slice(0, n).join(' ');
  const end = Math.max(head.lastIndexOf('. '), head.lastIndexOf('? '), head.lastIndexOf('! '));
  return end > 0 ? head.slice(0, end + 1) : head.replace(/[,;:]$/, '') + '…';
}

/** Reading time in whole minutes, at 230 words a minute. */
export const readingMinutes = (body = '') =>
  Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 230));
