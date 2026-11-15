import { describe, expect, it } from 'vitest';
import {
  excerpt,
  formatDate,
  formatMinutes,
  formatXmlDate,
  readingMinutes,
  truncateSentences,
  truncateWords,
  withSourceHeadings,
} from '../src/lib/format';

describe('dates', () => {
  const date = new Date('2026-07-22T00:00:00Z');
  it('formats the UI date as ISO, in UTC', () => {
    expect(formatDate(date)).toBe('2026-07-22');
  });
  it('formats the XML date with an offset and no milliseconds', () => {
    expect(formatXmlDate(date)).toBe('2026-07-22T00:00:00+00:00');
  });
  it('formats minutes', () => {
    expect(formatMinutes(5)).toBe('5 min');
  });
});

describe('excerpt', () => {
  it('takes the first paragraph only', () => {
    expect(excerpt('First one.\n\nSecond one.')).toBe('First one.');
  });
  it('strips markdown and html, keeping the words', () => {
    expect(excerpt('## A **bold** and _soft_ [link](https://example.com) with `code` <br>'))
      .toBe('A bold and soft link with code ');
  });
  it('keeps the alt text of an image', () => {
    expect(excerpt('![a rocket](rocket.jpg) flies')).toBe('a rocket flies');
  });
  it('turns three dots into an ellipsis', () => {
    expect(excerpt('Wait...')).toBe('Wait…');
  });
  it('handles a missing body', () => {
    expect(excerpt()).toBe('');
  });
});

describe('truncateWords', () => {
  it('leaves a short text alone, with no suffix', () => {
    expect(truncateWords('one  two', 5)).toBe('one two');
  });
  it('cuts and adds the suffix', () => {
    expect(truncateWords('one two three', 2)).toBe('one two...');
    expect(truncateWords('one two three', 2, '')).toBe('one two');
  });
});

describe('truncateSentences', () => {
  it('leaves a short text alone', () => {
    expect(truncateSentences('Short text.', 10)).toBe('Short text.');
  });
  it('ends on a full sentence when one fits', () => {
    expect(truncateSentences('One two. Three four five six.', 4)).toBe('One two.');
  });
  it('ends a cut sentence in an ellipsis, without a trailing comma', () => {
    expect(truncateSentences('one two, three four', 2)).toBe('one two…');
  });
});

describe('readingMinutes', () => {
  it('is never under a minute', () => {
    expect(readingMinutes('')).toBe(1);
    expect(readingMinutes('a few words')).toBe(1);
  });
  it('counts 230 words a minute', () => {
    expect(readingMinutes(Array(690).fill('word').join(' '))).toBe(3);
  });
});

describe('withSourceHeadings', () => {
  const h = (slug: string, text: string, depth = 2) => ({ depth, slug, text });

  it('puts the markdown source back as the heading text', () => {
    const body = '## An *emphatic* title[^1]\n\ntext\n\n### Second ###\n';
    expect(withSourceHeadings([h('a', 'An emphatic title1'), h('b', 'Second', 3)], body)).toEqual([
      h('a', 'An *emphatic* title'),
      h('b', 'Second', 3),
    ]);
  });
  it('skips headings inside fenced code', () => {
    const body = '## Real\n\n```md\n## Not a heading\n```\n';
    expect(withSourceHeadings([h('real', 'Real')], body)).toEqual([h('real', 'Real')]);
  });
  it('leaves the generated footnotes heading alone', () => {
    const body = '## Only\n';
    const out = withSourceHeadings([h('only', 'x'), h('footnote-label', 'Footnotes')], body);
    expect(out).toEqual([h('only', 'Only'), h('footnote-label', 'Footnotes')]);
  });
  it('returns the headings unchanged when the counts differ', () => {
    const headings = [h('a', 'A'), h('b', 'B')];
    expect(withSourceHeadings(headings, '## A\n')).toBe(headings);
  });
});
