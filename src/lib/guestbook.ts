import { parse } from 'yaml';

// Visitors write the guestbook files (_data/guestbook.yml and the worker's
// per-entry files in _data/guestbook/). A PR review catches spam, not a
// subtle YAML problem. One bad entry must cost that entry, never the deploy:
// rows are parsed leniently, coerced to text, and dropped (with a warning)
// when they cannot be shown.

export interface GuestbookRow {
  name: string;
  website?: string;
  date: string;
  message: string;
}

const text = (v: unknown): string => {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
    ? String(v).trim()
    : '';
};

/** The top-level list, or, when the document as a whole does not parse, each
 * "- " entry parsed on its own so one broken entry does not take the rest. */
function rawRows(source: string, warn: (msg: string) => void): unknown[] {
  try {
    const doc: unknown = parse(source);
    if (Array.isArray(doc)) return doc;
    if (doc != null) warn('guestbook: the file is not a list; no entries shown');
    return [];
  } catch {
    warn('guestbook: the file is not valid YAML; reading it entry by entry');
  }
  const rows: unknown[] = [];
  for (const chunk of source.split(/^(?=- )/m)) {
    if (!chunk.startsWith('- ')) continue;
    try {
      const parsed: unknown = parse(chunk);
      if (Array.isArray(parsed)) rows.push(...parsed);
    } catch {
      warn(`guestbook: skipped an entry that is not valid YAML: ${chunk.slice(0, 60).trim()}`);
    }
  }
  return rows;
}

export function parseGuestbook(
  source: string,
  warn: (msg: string) => void = (msg) => console.warn(msg),
): GuestbookRow[] {
  const rows: GuestbookRow[] = [];
  rawRows(source, warn).forEach((raw, index) => {
    const entry = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    const name = text(entry.name);
    const message = text(entry.message);
    if (!name || !message) {
      warn(`guestbook: skipped entry ${index + 1} (no name or no message)`);
      return;
    }
    const website = text(entry.website);
    rows.push({ name, message, date: text(entry.date), ...(website ? { website } : {}) });
  });
  return rows;
}

/** All entries of several guestbook files, in the order the files are given. */
export const combineGuestbook = (
  sources: string[],
  warn: (msg: string) => void = (msg) => console.warn(msg),
): GuestbookRow[] => sources.flatMap((source) => parseGuestbook(source, warn));
