import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { mixHexColors, rgbaFromHex } from './colorUtils';
import {
  clearStoredBrandingConfig,
  defaultBrandingConfig,
  loadBrandingConfig,
  mergeBrandingConfig,
  persistBrandingConfig,
  resolveBrandingConfig,
  syncBrandingFromSupabase,
} from './branding';
import type { BrandingConfig, ResolvedBrandingConfig } from '../types/branding';

type BrandingContextValue = {
  branding: BrandingConfig;
  resolvedBranding: ResolvedBrandingConfig;
  saveBranding: (nextBranding: BrandingConfig) => BrandingConfig;
  resetBranding: () => BrandingConfig;
  defaultBranding: BrandingConfig;
};

const BrandingContext = createContext<BrandingContextValue | null>(null);

function applyBrandingToDocument(branding: ResolvedBrandingConfig) {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const { background, primary, accent, support } = branding.colors;

  root.style.setProperty('--background', background);
  root.style.setProperty('--surface', 'rgba(255, 255, 255, 0.92)');
  root.style.setProperty('--surface-strong', '#ffffff');
  root.style.setProperty('--foreground', support);
  root.style.setProperty('--muted', mixHexColors(support, background, 0.42));
  root.style.setProperty('--line', rgbaFromHex(support, 0.1));
  root.style.setProperty('--line-strong', rgbaFromHex(support, 0.16));
  root.style.setProperty('--primary', primary);
  root.style.setProperty('--primary-strong', mixHexColors(primary, support, 0.38));
  root.style.setProperty('--primary-soft', rgbaFromHex(primary, 0.12));
  root.style.setProperty('--accent', accent);
  root.style.setProperty('--accent-strong', mixHexColors(accent, support, 0.28));
  root.style.setProperty('--accent-soft', rgbaFromHex(accent, 0.12));
  root.style.setProperty('--support', support);
  root.style.setProperty('--support-soft', rgbaFromHex(support, 0.06));
  root.style.setProperty('--shadow', `0 24px 60px ${rgbaFromHex(support, 0.12)}`);
  root.style.setProperty('--body-glow-primary', rgbaFromHex(primary, 0.16));
  root.style.setProperty('--body-glow-accent', rgbaFromHex(accent, 0.1));
  root.style.setProperty('--header-background', rgbaFromHex(support, 0.92));
  root.style.setProperty('--header-border', rgbaFromHex(background, 0.12));
  root.style.setProperty('--nav-link-active-background', rgbaFromHex(primary, 0.3));
  root.style.setProperty('--cart-link-active-background', rgbaFromHex(accent, 0.22));
  root.style.setProperty('--footer-background-start', mixHexColors(support, primary, 0.18));
  root.style.setProperty('--footer-background-end', support);

  document.title = branding.browserTitle;

  let faviconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!faviconLink) {
    faviconLink = document.createElement('link');
    faviconLink.rel = 'icon';
    document.head.appendChild(faviconLink);
  }
  faviconLink.href = branding.faviconUrl;

  let themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta');
    themeColorMeta.name = 'theme-color';
    document.head.appendChild(themeColorMeta);
  }
  themeColorMeta.content = support;
}

export function BrandingProvider({ children }: PropsWithChildren) {
  const [branding, setBranding] = useState<BrandingConfig>(loadBrandingConfig);

  const resolvedBranding = useMemo(() => resolveBrandingConfig(branding), [branding]);

  useEffect(() => {
    applyBrandingToDocument(resolvedBranding);
  }, [resolvedBranding]);

  useEffect(() => {
    syncBrandingFromSupabase().then((cloudBranding) => {
      if (cloudBranding) setBranding(cloudBranding);
    });
  }, []);

  function saveBranding(nextBranding: BrandingConfig) {
    const persistedBranding = persistBrandingConfig(nextBranding);
    setBranding(persistedBranding);
    return persistedBranding;
  }

  function resetBranding() {
    clearStoredBrandingConfig();
    setBranding(defaultBrandingConfig);
    return defaultBrandingConfig;
  }

  const value: BrandingContextValue = {
    branding,
    resolvedBranding,
    saveBranding,
    resetBranding,
    defaultBranding: defaultBrandingConfig,
  };

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function BrandingPreviewProvider({
  branding,
  children,
}: PropsWithChildren<{ branding: BrandingConfig }>) {
  const mergedBranding = useMemo(() => mergeBrandingConfig(branding), [branding]);
  const resolvedBranding = useMemo(
    () => resolveBrandingConfig(mergedBranding),
    [mergedBranding]
  );

  useEffect(() => {
    applyBrandingToDocument(resolvedBranding);
  }, [resolvedBranding]);

  const value: BrandingContextValue = useMemo(
    () => ({
      branding: mergedBranding,
      resolvedBranding,
      saveBranding: (nextBranding) => mergeBrandingConfig(nextBranding),
      resetBranding: () => defaultBrandingConfig,
      defaultBranding: defaultBrandingConfig,
    }),
    [mergedBranding, resolvedBranding]
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  const context = useContext(BrandingContext);

  if (!context) {
    throw new Error('useBranding deve ser usado dentro de BrandingProvider');
  }

  return context;
}
