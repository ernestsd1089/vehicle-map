import { contrastColor } from './color.utils';

describe('contrastColor', () => {
  it('returns black for white', () => {
    expect(contrastColor('#ffffff')).toBe('black');
  });

  it('returns white for black', () => {
    expect(contrastColor('#000000')).toBe('white');
  });

  it('returns white for the azure blue design token', () => {
    expect(contrastColor('#005cbb')).toBe('white');
  });

  it('returns black for a light gray', () => {
    expect(contrastColor('#f5f5f5')).toBe('black');
  });

  it('returns white for a dark red', () => {
    expect(contrastColor('#8b0000')).toBe('white');
  });

  it('returns black for a bright yellow', () => {
    expect(contrastColor('#ffff00')).toBe('black');
  });

  it('returns white for a dark green', () => {
    expect(contrastColor('#1b5e20')).toBe('white');
  });

  it('returns black for a light blue', () => {
    expect(contrastColor('#90caf9')).toBe('black');
  });
});
