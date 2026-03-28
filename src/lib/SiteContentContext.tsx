import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { clearStoredSiteContent, defaultSiteContent, loadSiteContent, persistSiteContent, syncSiteContentFromSupabase } from './siteContent';
import { supabase } from './supabase';
import type { SiteContentConfig } from '../types/siteContent';

const CLOUD_TIMEOUT = 4000;

type SiteContentContextValue = {
  content: SiteContentConfig;
  saveContent: (nextContent: SiteContentConfig) => SiteContentConfig;
  resetContent: () => SiteContentConfig;
  defaultContent: SiteContentConfig;
  isInitialized: boolean;
};

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export function SiteContentProvider({ children }: PropsWithChildren) {
  const [isInitialized, setIsInitialized] = useState(!supabase);
  const [content, setContent] = useState<SiteContentConfig>(() =>
    supabase ? defaultSiteContent : loadSiteContent()
  );

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    const timeoutId = setTimeout(() => {
      if (cancelled) return;
      setContent(loadSiteContent());
      setIsInitialized(true);
    }, CLOUD_TIMEOUT);

    syncSiteContentFromSupabase()
      .then((cloudContent) => {
        if (cancelled) return;
        clearTimeout(timeoutId);
        setContent(cloudContent ?? loadSiteContent());
        setIsInitialized(true);
      })
      .catch(() => {
        if (cancelled) return;
        clearTimeout(timeoutId);
        setContent(loadSiteContent());
        setIsInitialized(true);
      });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  function saveContent(nextContent: SiteContentConfig) {
    const persistedContent = persistSiteContent(nextContent);
    setContent(persistedContent);
    return persistedContent;
  }

  function resetContent() {
    clearStoredSiteContent();
    setContent(defaultSiteContent);
    return defaultSiteContent;
  }

  const value = useMemo(
    () => ({
      content,
      saveContent,
      resetContent,
      defaultContent: defaultSiteContent,
      isInitialized,
    }),
    [content, isInitialized]
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function SiteContentPreviewProvider({
  content,
  children,
}: PropsWithChildren<{ content: SiteContentConfig }>) {
  const value = useMemo(
    () => ({
      content,
      saveContent: (nextContent: SiteContentConfig) => nextContent,
      resetContent: () => defaultSiteContent,
      defaultContent: defaultSiteContent,
      isInitialized: true,
    }),
    [content]
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);

  if (!context) {
    throw new Error('useSiteContent deve ser usado dentro de SiteContentProvider');
  }

  return context;
}
