import { describe, expect, it } from 'vitest';
import { validateOptions } from '../src/crop';
describe('output contract', () => {
  it('derives the ratio and allows matching explicit ratios', () => {
    expect(validateOptions({ width: 1920, height: 1080 })).toBe(16 / 9);
    expect(validateOptions({ width: 1920, height: 1080 }, 16 / 9)).toBe(16 / 9);
  });
  it('rejects conflicting ratio and dimensions instead of stretching', () => {
    expect(() => validateOptions({ width: 512, height: 512 }, 16 / 9)).toThrow('Aspect ratio');
  });
  it.each([0, -1, NaN, Infinity, 1.5, 8193])('rejects invalid dimensions %s', width => {
    expect(() => validateOptions({ width, height: 512 })).toThrow();
  });
  it('bounds canvas allocation and validates quality and byte ceiling', () => {
    expect(() => validateOptions({ width: 8192, height: 8192 })).toThrow('megapixels');
    expect(() => validateOptions({ width: 512, height: 512, quality: 1.1 })).toThrow('Quality');
    expect(() => validateOptions({ width: 512, height: 512, maxBytes: 0 })).toThrow('File-size');
  });
});
