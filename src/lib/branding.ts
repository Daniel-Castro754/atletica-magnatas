import { mixHexColors, normalizeHexColor } from './colorUtils';
import {
  DEFAULT_BRANDING_TYPOGRAPHY,
  mergeBrandingTypographyMap,
} from './brandingTypography';
import type { BrandingConfig, BrandingColors, ResolvedBrandingConfig } from '../types/branding';
import { getSupabaseConfig, setSupabaseConfig } from './supabase';

export const BRANDING_STORAGE_KEY = 'magnatas_branding_config';

const DEFAULT_COLORS: BrandingColors = {
  primary: '#1a3a5c',
  accent: '#c0392b',
  support: '#0d1117',
  background: '#f8f9fa',
};

export const defaultBrandingConfig: BrandingConfig = {
  siteName: 'Atletica Magnatas',
  shortName: 'A.A.A.E. Economia',
  subtitle: 'Ciencias Economicas - UNESC',
  browserTitle: 'Atletica Magnatas',
  customLogoUrl: '',
  customFaviconUrl: '',
  customHomeCoverUrl: '',
  colors: DEFAULT_COLORS,
  typography: DEFAULT_BRANDING_TYPOGRAPHY,
};

function encodeSvg(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createMonogramLabel(siteName: string) {
  const trimmedName = siteName.trim();
  return trimmedName ? trimmedName.charAt(0).toUpperCase() : 'M';
}

function createGeneratedLogoUrl(config: BrandingConfig) {
  const monogram = escapeSvgText(createMonogramLabel(config.siteName));
  const safeSiteName = escapeSvgText(config.siteName);
  const safeSubtitle = escapeSvgText(config.subtitle);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="220" viewBox="0 0 640 220" fill="none">
      <defs>
        <linearGradient id="brandGradient" x1="40" y1="20" x2="220" y2="200" gradientUnits="userSpaceOnUse">
          <stop stop-color="${config.colors.primary}" />
          <stop offset="1" stop-color="${config.colors.accent}" />
        </linearGradient>
      </defs>
      <rect width="640" height="220" rx="42" fill="${config.colors.background}" />
      <rect x="28" y="28" width="164" height="164" rx="38" fill="url(#brandGradient)" />
      <text x="110" y="132" text-anchor="middle" fill="#ffffff" font-size="82" font-family="Georgia, serif" font-weight="700">${monogram}</text>
      <text x="228" y="96" fill="${config.colors.support}" font-size="44" font-family="Arial, sans-serif" font-weight="700">${safeSiteName}</text>
      <text x="228" y="142" fill="${mixHexColors(config.colors.support, config.colors.background, 0.35)}" font-size="24" font-family="Arial, sans-serif">${safeSubtitle}</text>
    </svg>
  `;

  return encodeSvg(svg);
}

function createGeneratedFaviconUrl(config: BrandingConfig) {
  const monogram = escapeSvgText(createMonogramLabel(config.siteName));
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="faviconGradient" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop stop-color="${config.colors.primary}" />
          <stop offset="1" stop-color="${config.colors.accent}" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#faviconGradient)" />
      <text x="32" y="40" text-anchor="middle" fill="#ffffff" font-size="28" font-family="Georgia, serif" font-weight="700">${monogram}</text>
    </svg>
  `;

  return encodeSvg(svg);
}

function createGeneratedHomeCoverUrl(config: BrandingConfig) {
  const supportTint = mixHexColors(config.colors.support, config.colors.background, 0.18);
  const safeSiteName = escapeSvgText(config.siteName);
  const safeSubtitle = escapeSvgText(config.subtitle);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" fill="none">
      <rect width="1200" height="900" fill="${config.colors.support}" />
      <circle cx="240" cy="180" r="260" fill="${config.colors.primary}" fill-opacity="0.9" />
      <circle cx="1040" cy="120" r="220" fill="${config.colors.accent}" fill-opacity="0.82" />
      <circle cx="980" cy="740" r="320" fill="${supportTint}" fill-opacity="0.72" />
      <path d="M0 720C182 652 286 596 432 552C598 502 734 516 1200 690V900H0V720Z" fill="${config.colors.background}" fill-opacity="0.14" />
      <text x="92" y="650" fill="#ffffff" font-size="84" font-family="Georgia, serif" font-weight="700">${safeSiteName}</text>
      <text x="96" y="720" fill="rgba(255,255,255,0.88)" font-size="32" font-family="Arial, sans-serif">${safeSubtitle}</text>
    </svg>
  `;

  return encodeSvg(svg);
}

function mergeBrandingColors(input: Partial<BrandingColors> | undefined): BrandingColors {
  return {
    primary: normalizeHexColor(input?.primary ?? DEFAULT_COLORS.primary, DEFAULT_COLORS.primary),
    accent: normalizeHexColor(input?.accent ?? DEFAULT_COLORS.accent, DEFAULT_COLORS.accent),
    support: normalizeHexColor(input?.support ?? DEFAULT_COLORS.support, DEFAULT_COLORS.support),
    background: normalizeHexColor(
      input?.background ?? DEFAULT_COLORS.background,
      DEFAULT_COLORS.background
    ),
  };
}

export function mergeBrandingConfig(input?: Partial<BrandingConfig> | null): BrandingConfig {
  return {
    siteName: typeof input?.siteName === 'string' && input.siteName.trim()
      ? input.siteName.trim()
      : defaultBrandingConfig.siteName,
    shortName:
      typeof input?.shortName === 'string'
        ? input.shortName.trim()
        : defaultBrandingConfig.shortName,
    subtitle:
      typeof input?.subtitle === 'string'
        ? input.subtitle.trim()
        : defaultBrandingConfig.subtitle,
    browserTitle:
      typeof input?.browserTitle === 'string'
        ? input.browserTitle.trim()
        : defaultBrandingConfig.browserTitle,
    customLogoUrl:
      typeof input?.customLogoUrl === 'string' ? input.customLogoUrl.trim() : '',
    customFaviconUrl:
      typeof input?.customFaviconUrl === 'string' ? input.customFaviconUrl.trim() : '',
    customHomeCoverUrl:
      typeof input?.customHomeCoverUrl === 'string' ? input.customHomeCoverUrl.trim() : '',
    colors: mergeBrandingColors(input?.colors),
    typography: mergeBrandingTypographyMap(input?.typography),
  };
}

export function resolveBrandingConfig(config: BrandingConfig): ResolvedBrandingConfig {
  const mergedConfig = mergeBrandingConfig(config);

  return {
    ...mergedConfig,
    logoUrl: mergedConfig.customLogoUrl || createGeneratedLogoUrl(mergedConfig),
    faviconUrl: mergedConfig.customFaviconUrl || createGeneratedFaviconUrl(mergedConfig),
    homeCoverUrl: mergedConfig.customHomeCoverUrl || createGeneratedHomeCoverUrl(mergedConfig),
  };
}

export function loadBrandingConfig() {
  if (typeof window === 'undefined') {
    return defaultBrandingConfig;
  }

  try {
    const savedValue = window.localStorage.getItem(BRANDING_STORAGE_KEY);
    if (!savedValue) {
      return defaultBrandingConfig;
    }

    const parsedValue = JSON.parse(savedValue) as Partial<BrandingConfig>;
    if (parsedValue.colors?.background === '#ffccd5') {
      parsedValue.colors.background = DEFAULT_COLORS.background;
    }
    return mergeBrandingConfig(parsedValue);
  } catch {
    return defaultBrandingConfig;
  }
}

export function persistBrandingConfig(config: BrandingConfig) {
  const mergedConfig = mergeBrandingConfig(config);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(mergedConfig));
    } catch {
      return mergedConfig;
    }
  }

  setSupabaseConfig(BRANDING_STORAGE_KEY, mergedConfig);
  return mergedConfig;
}

export async function syncBrandingFromSupabase(): Promise<BrandingConfig | null> {
  const cloudData = await getSupabaseConfig<Partial<BrandingConfig>>(BRANDING_STORAGE_KEY);
  if (!cloudData) return null;
  if (cloudData.colors?.background === '#ffccd5') {
    cloudData.colors.background = DEFAULT_COLORS.background;
  }
  const merged = mergeBrandingConfig(cloudData);
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(merged));
    }
  } catch {}
  return merged;
}

export function clearStoredBrandingConfig() {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(BRANDING_STORAGE_KEY);
    } catch {
      return;
    }
  }
}
