import { describe, expect, it } from 'vitest';
import { parseMs } from '../src/lib/cssTime';

describe('parseMs', () => {
  it('reads milliseconds and seconds', () => {
    expect(parseMs('600ms', 1)).toBe(600);
    expect(parseMs(' 0.55s ', 1)).toBe(550);
    expect(parseMs('.2s', 1)).toBe(200);
  });
  it('falls back when the value is missing or not a time', () => {
    expect(parseMs('', 600)).toBe(600);
    expect(parseMs('12px', 600)).toBe(600);
  });
});
