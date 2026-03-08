import { isValidLocation } from './location.utils';

describe('isValidLocation', () => {
  it('returns true for valid coordinates', () => {
    expect(isValidLocation(56.946285, 24.105186)).toBe(true);
  });

  it('returns false for (0, 0)', () => {
    expect(isValidLocation(0, 0)).toBe(false);
  });

  it('returns true for boundary latitude values', () => {
    expect(isValidLocation(90, 0.1)).toBe(true);
    expect(isValidLocation(-90, 0.1)).toBe(true);
  });

  it('returns true for boundary longitude values', () => {
    expect(isValidLocation(0.1, 180)).toBe(true);
    expect(isValidLocation(0.1, -180)).toBe(true);
  });

  it('returns false for latitude above 90', () => {
    expect(isValidLocation(90.1, 0)).toBe(false);
  });

  it('returns false for latitude below -90', () => {
    expect(isValidLocation(-90.1, 0)).toBe(false);
  });

  it('returns false for longitude above 180', () => {
    expect(isValidLocation(0, 180.1)).toBe(false);
  });

  it('returns false for longitude below -180', () => {
    expect(isValidLocation(0, -180.1)).toBe(false);
  });

  it('returns false for non-finite latitude', () => {
    expect(isValidLocation(Infinity, 24)).toBe(false);
    expect(isValidLocation(NaN, 24)).toBe(false);
  });

  it('returns false for non-finite longitude', () => {
    expect(isValidLocation(56, Infinity)).toBe(false);
    expect(isValidLocation(56, NaN)).toBe(false);
  });

  it('returns false for non-number inputs', () => {
    expect(isValidLocation('56' as unknown as number, 24)).toBe(false);
    expect(isValidLocation(56, null as unknown as number)).toBe(false);
  });
});
