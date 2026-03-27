import type {
  TextTypographyStyle,
  TypographyFontFamily,
  TypographyFontSize,
  TypographyStyleMap,
} from '../types/typography';

export const TYPOGRAPHY_FONT_OPTIONS: Array<{ value: TypographyFontFamily; label: string }> = [
  { value: 'serif_display', label: 'Serifada forte' },
  { value: 'sans_clean', label: 'Sans limpa' },
  { value: 'serif_editorial', label: 'Serifada editorial' },
  { value: 'sans_compact', label: 'Sans compacta' },
];

export const TYPOGRAPHY_SIZE_OPTIONS: Array<{ value: TypographyFontSize; label: string }> = [
  { value: 'sm', label: 'Pequeno' },
  { value: 'md', label: 'Medio' },
  { value: 'lg', label: 'Grande' },
  { value: 'xl', label: 'Extra grande' },
];

export const DEFAULT_TEXT_TYPOGRAPHY: TextTypographyStyle = {
  fontFamily: 'sans_clean',
  fontSize: 'md',
};

export function normalizeTextTypographyStyle(
  input: Partial<TextTypographyStyle> | null | undefined,
  fallback: TextTypographyStyle = DEFAULT_TEXT_TYPOGRAPHY
): TextTypographyStyle {
  const fontFamily = TYPOGRAPHY_FONT_OPTIONS.some((option) => option.value === input?.fontFamily)
    ? (input?.fontFamily as TypographyFontFamily)
    : fallback.fontFamily;
  const fontSize = TYPOGRAPHY_SIZE_OPTIONS.some((option) => option.value === input?.fontSize)
    ? (input?.fontSize as TypographyFontSize)
    : fallback.fontSize;

  return {
    fontFamily,
    fontSize,
  };
}

export function cloneTypographyMap<T extends string>(
  map: TypographyStyleMap<T>
): TypographyStyleMap<T> {
  return { ...map };
}

export function createTypographyClassName(
  style: TextTypographyStyle,
  baseClassName = ''
) {
  return [baseClassName, `typography-family-${style.fontFamily}`, `typography-size-${style.fontSize}`]
    .filter(Boolean)
    .join(' ');
}
