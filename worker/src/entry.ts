// Pure helpers for the guestbook worker: input checks and the files and text
// the worker sends to GitHub. Kept apart from index.ts so the tests can run
// them without a Workers runtime.

export const MAX_NAME = 100;
export const MAX_WEBSITE = 200;
export const MAX_MESSAGE = 1000;

export interface Entry {
  name: string;
  website?: string;
  date: string;
  message: string;
}

/** True when the text holds a link: a scheme (https://), "www.", HTML or
 * BBCode link markup, or a bare domain with a common TLD (example.com). */
const LINK =
  /[a-z][a-z0-9+.-]*:\/\/|\bwww\.|<a[\s>]|\[url|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|info|biz|io|co|app|xyz|ru|top|site|online|shop|store|club|live|me|us|uk|de|cn|in|pro|link|click|cc|tk|ly|gg|ai|dev)\b/i;

export const hasLink = (text: string): boolean => LINK.test(text);

const stripHtml = (s: string) => s.replace(/<[^>]*>/g, '');

/** Strips tags, normalizes line ends, trims, and cuts to the limit. */
export const clean = (raw: unknown, max: number): string =>
  typeof raw === 'string' ? stripHtml(raw).replace(/\r\n?/g, '\n').trim().slice(0, max) : '';

export function isHttpUrl(s: string): boolean {
  try {
    const url = new URL(s);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** One entry as a one-item YAML list, the shape parseGuestbook reads. A JSON
 * string is a valid YAML double-quoted scalar, so JSON.stringify escapes
 * every value. */
export function entryYaml(e: Entry): string {
  const q = JSON.stringify;
  return (
    `- name: ${q(e.name)}\n` +
    (e.website ? `  website: ${q(e.website)}\n` : '') +
    `  date: ${q(e.date)}\n` +
    `  message: ${q(e.message)}\n`
  );
}

/** A sortable, unique id: the UTC time plus 6 random hex digits. It names
 * both the entry file and the PR branch. */
export function entryId(now: Date, random: Uint8Array): string {
  const stamp = now.toISOString().replace(/[:.]/g, '-');
  const hex = Array.from(random.slice(0, 3), (b) => b.toString(16).padStart(2, '0')).join('');
  return `${stamp}-${hex}`;
}

/** GitHub wants base64 of the UTF-8 bytes. btoa alone takes Latin-1. */
export function base64Utf8(s: string): string {
  let bin = '';
  for (const b of new TextEncoder().encode(s)) bin += String.fromCharCode(b);
  return btoa(bin);
}

/** PR title. "@" is removed so a name cannot mention a GitHub user. */
export const prTitle = (name: string): string =>
  `guestbook: new entry from ${name.replace(/@/g, '').slice(0, 60)}`;

/** PR body. The visitor's text goes in an indented code block: GitHub does
 * not render markdown, links or @mentions inside one, and the text cannot
 * close it. */
export function prBody(e: Entry): string {
  const indent = (s: string) => s.split('\n').map((l) => `    ${l}`).join('\n');
  return [
    'A visitor signed the guestbook. Merge this PR to publish the entry. Close it to drop the entry.',
    '',
    `Name:\n\n${indent(e.name)}\n`,
    e.website ? `Website:\n\n${indent(e.website)}\n` : '',
    `Message:\n\n${indent(e.message)}\n`,
  ].join('\n');
}
