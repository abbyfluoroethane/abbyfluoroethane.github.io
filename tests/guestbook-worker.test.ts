import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { base64Utf8, clean, entryId, entryYaml, hasLink, prBody, prTitle } from '../worker/src/entry';
import { parseGuestbook } from '../src/lib/guestbook';

describe('hasLink', () => {
  it.each([
    'see https://atpimety.com',
    'HTTP://EXAMPLE.ORG',
    'go to www.example',
    'visit atpimety.com today',
    'sub.domain.co.uk/page',
    '<a href="x">hi</a>',
    '[url=x]hi[/url]',
    'ftp://files',
  ])('finds a link in %j', (text) => expect(hasLink(text)).toBe(true));

  it.each([
    'silentbarker? yeah sometimes they\'re just like that',
    'updog',
    'e.g. this, i.e. that',
    'node.js and vue.js are fine',
    'version 1.2.3',
    'hi!!! :3',
  ])('finds no link in %j', (text) => expect(hasLink(text)).toBe(false));
});

describe('clean', () => {
  it('strips tags, normalizes line ends, trims and cuts', () => {
    expect(clean('  <b>hi</b>\r\nthere  ', 100)).toBe('hi\nthere');
    expect(clean('abcdef', 3)).toBe('abc');
    expect(clean(null, 10)).toBe('');
  });
});

describe('entryYaml', () => {
  it('writes a file parseGuestbook reads back unchanged', () => {
    const entry = {
      name: 'a "quoted" name: \\ #x',
      website: 'https://example.com',
      date: '2026-11-20',
      message: 'line one\nline two – ’ 🚀\t- not a list',
    };
    expect(parseGuestbook(entryYaml(entry), () => {})).toEqual([entry]);
    expect(parse(entryYaml({ ...entry, website: undefined }))[0]).not.toHaveProperty('website');
  });
});

describe('entryId', () => {
  it('is sortable by time and safe as a file and branch name', () => {
    const a = entryId(new Date('2026-11-20T01:02:03.004Z'), new Uint8Array([0, 15, 255]));
    const b = entryId(new Date('2026-11-20T01:02:04.000Z'), new Uint8Array([0, 0, 0]));
    expect(a).toBe('2026-11-20T01-02-03-004Z-000fff');
    expect(a < b).toBe(true);
    expect(a).toMatch(/^[A-Za-z0-9-]+$/);
  });
});

describe('base64Utf8', () => {
  it('encodes UTF-8 bytes', () => {
    expect(Buffer.from(base64Utf8('’ 🚀'), 'base64').toString('utf8')).toBe('’ 🚀');
  });
});

describe('PR text', () => {
  it('drops @ from the title', () => {
    expect(prTitle('@octocat hi')).toBe('guestbook: new entry from octocat hi');
  });

  it('indents every line of visitor text into a code block', () => {
    const body = prBody({ name: 'x', date: '2026-11-20', message: 'a\n```\n@someone' });
    expect(body).toContain('    a\n    ```\n    @someone');
  });
});
