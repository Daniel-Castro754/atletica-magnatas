export type TypographyFontFamily =
  | 'serif_display'
  | 'sans_clean'
  | 'serif_editorial'
  | 'sans_compact';

export type TypographyFontSize = 'sm' | 'md' | 'lg' | 'xl';

export type TextTypographyStyle = {
  fontFamily: TypographyFontFamily;
  fontSize: TypographyFontSize;
};

export type TypographyStyleMap<T extends string = string> = Record<T, TextTypographyStyle>;
