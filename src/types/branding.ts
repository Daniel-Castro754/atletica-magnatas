import type { TypographyStyleMap } from './typography';

export type BrandingColors = {
  primary: string;
  accent: string;
  support: string;
  background: string;
};

export type BrandingTypographySlot =
  | 'brand_tag'
  | 'brand_title'
  | 'brand_subtitle'
  | 'site_title'
  | 'site_subtitle'
  | 'site_description';

export type BrandingConfig = {
  siteName: string;
  shortName: string;
  subtitle: string;
  browserTitle: string;
  customLogoUrl: string;
  customFaviconUrl: string;
  customHomeCoverUrl: string;
  colors: BrandingColors;
  typography: TypographyStyleMap<BrandingTypographySlot>;
};

export type ResolvedBrandingConfig = BrandingConfig & {
  logoUrl: string;
  faviconUrl: string;
  homeCoverUrl: string;
};
