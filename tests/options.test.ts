import { describe, expect, it } from 'vitest';
import { getOutputDimensions, validateOptions } from '../src/crop';
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

describe('custom size, resolution and aspect ratios', () => {
  it.each([
    [1200, 800, 3 / 2], [1400, 600, 7 / 3], [1300, 700, 13 / 7],
    [628, 1200, 628 / 1200], [3840, 2160, 16 / 9], [1001, 667, 1001 / 667]
  ])('accepts custom %s × %s at ratio %s', (width, height, aspect) => {
    expect(validateOptions({ width, height }, aspect)).toBe(aspect);
  });
  it.each([
    [1, 1200, 800], [2, 2400, 1600], [3, 3600, 2400], [0.5, 600, 400], [1.25, 1500, 1000]
  ])('resolves %s× export without changing the requested ratio', (pixelRatio, width, height) => {
    expect(getOutputDimensions({ width: 1200, height: 800, pixelRatio })).toEqual({ width, height });
    expect(validateOptions({ width: 1200, height: 800, pixelRatio }, 3 / 2)).toBe(3 / 2);
  });
  it('rounds fractional pixels consistently', () => {
    expect(getOutputDimensions({ width: 1001, height: 667, pixelRatio: 1.5 })).toEqual({ width: 1502, height: 1001 });
  });
  it.each([0, -1, NaN, Infinity])('rejects invalid resolution scale %s', pixelRatio => {
    expect(() => validateOptions({ width: 100, height: 100, pixelRatio })).toThrow('pixelRatio');
  });
  it('applies safety limits after export scaling, not just before', () => {
    expect(() => validateOptions({ width: 4097, height: 100, pixelRatio: 2 })).toThrow('8192');
    expect(() => validateOptions({ width: 3000, height: 3000, pixelRatio: 2 })).toThrow('megapixels');
    expect(() => validateOptions({ width: 1, height: 1, pixelRatio: 0.1 })).toThrow('Output dimensions');
  });
  it('continues to reject a mismatched explicit ratio when scaled', () => {
    expect(() => validateOptions({ width: 1200, height: 800, pixelRatio: 2 }, 16 / 9)).toThrow('Aspect ratio');
  });
});
