import { describe, expect, it } from 'vitest';
import { parseGuestbook } from '../src/lib/guestbook';

const quiet = () => {};

describe('parseGuestbook', () => {
  it('reads well-formed entries in file order', () => {
    const rows = parseGuestbook(
      '- name: "a"\n  website: "https://example.com"\n  date: "2026-03-02"\n  message: "hi"\n' +
        '- name: "b"\n  date: "2026-03-03"\n  message: "yo"\n',
      quiet,
    );
    expect(rows).toEqual([
      { name: 'a', website: 'https://example.com', date: '2026-03-02', message: 'hi' },
      { name: 'b', date: '2026-03-03', message: 'yo' },
    ]);
  });

  it('coerces numbers, booleans and bare dates to text', () => {
    const rows = parseGuestbook('- name: 58\n  date: 2026-03-02\n  message: true\n', quiet);
    expect(rows).toEqual([{ name: '58', date: '2026-03-02', message: 'true' }]);
  });

  it('drops an entry with no name or no message, and keeps the rest', () => {
    const warnings: string[] = [];
    const rows = parseGuestbook(
      '- name: ""\n  message: "x"\n- just a string\n- name: ok\n  date: "2026-01-01"\n  message: fine\n- name: [a, b]\n  message: {c: d}\n',
      (msg) => warnings.push(msg),
    );
    expect(rows).toEqual([{ name: 'ok', date: '2026-01-01', message: 'fine' }]);
    expect(warnings).toHaveLength(3);
  });

  it('keeps the good entries of a file that is not valid YAML', () => {
    const rows = parseGuestbook(
      '- name: "a"\n  date: "2026-03-02"\n  message: "hi"\n' +
        '- name: "broken\n  message: "unterminated\n' +
        '- name: "c"\n  date: "2026-03-04"\n  message: "still here"\n',
      quiet,
    );
    expect(rows.map((r) => r.name)).toEqual(['a', 'c']);
  });

  it('returns nothing for an empty file or a file that is not a list', () => {
    expect(parseGuestbook('', quiet)).toEqual([]);
    expect(parseGuestbook('name: a\nmessage: b\n', quiet)).toEqual([]);
  });

  it('reads the real guestbook without dropping an entry', async () => {
    const { readFileSync } = await import('node:fs');
    const source = readFileSync(new URL('../_data/guestbook.yml', import.meta.url), 'utf8');
    const warnings: string[] = [];
    const rows = parseGuestbook(source, (msg) => warnings.push(msg));
    expect(warnings).toEqual([]);
    expect(rows.length).toBe(source.split('\n').filter((l) => l.startsWith('- ')).length);
  });
});

describe('combineGuestbook', () => {
  it('reads each file and keeps the file order', async () => {
    const { combineGuestbook } = await import('../src/lib/guestbook');
    const rows = combineGuestbook(
      [
        '- name: "old"\n  date: "2026-01-01"\n  message: "first"\n',
        '',
        '- name: "new"\n  date: "2026-11-20"\n  message: "second"\n',
      ],
      quiet,
    );
    expect(rows.map((r) => r.name)).toEqual(['old', 'new']);
  });
});
