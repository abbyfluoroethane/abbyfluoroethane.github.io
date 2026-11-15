/** A CSS time ("600ms", "0.55s") in milliseconds, or the fallback. */
export function parseMs(value: string, fallback: number): number {
  const match = /^\s*(-?\d*\.?\d+)(ms|s)\s*$/.exec(value);
  if (!match) return fallback;
  return parseFloat(match[1]) * (match[2] === 's' ? 1000 : 1);
}

/** A duration custom property read off the root element, so a script's
 * timers follow the stylesheet instead of repeating its numbers. */
export function cssMs(name: string, fallback: number): number {
  return parseMs(getComputedStyle(document.documentElement).getPropertyValue(name), fallback);
}
