function hexToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function contrastColor(hex: string): 'black' | 'white' {
  const raw = hex.replace('#', '');
  const r = hexToLinear(parseInt(raw.substring(0, 2), 16));
  const g = hexToLinear(parseInt(raw.substring(2, 4), 16));
  const b = hexToLinear(parseInt(raw.substring(4, 6), 16));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.179 ? 'black' : 'white';
}
