// Dates in front matter have no time zone. Format them in UTC so the build
// machine's time zone does not shift the day. RSS and XML dates keep the
// format their specifications ask for (formatXmlDate, @astrojs/rss).

/** "2026-07-22": the one date format of the UI (ISO 8601, in UTC). */
export const formatDate = (date: Date) => date.toISOString().slice(0, 10);

/** Kept for older callers. The UI has one date format, so it is the ISO one. */
export const formatLongDate = formatDate;

/** "5 min": a number, a space, the unit. */
export const formatMinutes = (minutes: number) => `${minutes} min`;

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

type Heading = { depth: number; slug: string; text: string };

/** Headings from render() with the markdown source of each heading as its
 * text, so the contents keep emphasis and strikethrough. render() gives plain
 * text, which also keeps footnote numbers ("computer1"). The source drops
 * footnote references and comments. The headings match the source in order
 * (fenced code skipped); if the counts differ, the headings stay as they are. */
export function withSourceHeadings(headings: Heading[], body = ''): Heading[] {
  const source: string[] = [];
  let fence = false;
  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const match = !fence && /^#{1,6}\s+(.*?)\s*#*\s*$/.exec(line);
    if (match) {
      source.push(match[1].replace(/<!--.*?-->/g, '').replace(/\[\^[^\]]+\]/g, '').trim());
    }
  }
  const isFootnotes = (h: Heading) => h.slug === 'footnotes' || h.slug === 'footnote-label';
  if (headings.filter((h) => !isFootnotes(h)).length !== source.length) return headings;
  let i = 0;
  return headings.map((h) => (isFootnotes(h) ? h : { ...h, text: source[i++] }));
}
