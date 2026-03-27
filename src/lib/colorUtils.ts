function expandHex(hex: string) {
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }

  return hex;
}

export function normalizeHexColor(value: string, fallback: string) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmedValue = value.trim();
  const expandedValue = expandHex(trimmedValue);
  const isValidHex = /^#[0-9a-fA-F]{6}$/.test(expandedValue);

  return isValidHex ? expandedValue.toLowerCase() : fallback;
}

export function hexToRgb(hex: string) {
  const normalizedHex = normalizeHexColor(hex, '#000000');
  const sanitizedHex = normalizedHex.slice(1);

  return {
    r: Number.parseInt(sanitizedHex.slice(0, 2), 16),
    g: Number.parseInt(sanitizedHex.slice(2, 4), 16),
    b: Number.parseInt(sanitizedHex.slice(4, 6), 16),
  };
}

function clampChannel(value: number) {
  return Math.min(255, Math.max(0, Math.round(value)));
}

export function rgbaFromHex(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function mixHexColors(baseHex: string, mixHex: string, weight = 0.5) {
  const base = hexToRgb(baseHex);
  const mix = hexToRgb(mixHex);
  const safeWeight = Math.min(1, Math.max(0, weight));

  const r = clampChannel(base.r + (mix.r - base.r) * safeWeight);
  const g = clampChannel(base.g + (mix.g - base.g) * safeWeight);
  const b = clampChannel(base.b + (mix.b - base.b) * safeWeight);

  return `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}

