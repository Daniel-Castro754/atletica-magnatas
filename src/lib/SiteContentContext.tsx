import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { clearStoredSiteContent, defaultSiteContent, loadSiteContent, persistSiteContent, syncSiteContentFromSupabase } from './siteContent';
import type { SiteContentConfig } from '../types/siteContent';

type SiteContentContextValue = {
  content: SiteContentConfig;
  saveContent: (nextContent: SiteContentConfig) => SiteContentConfig;
  resetContent: () => SiteContentConfig;
  defaultContent: SiteContentConfig;
};

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export function SiteContentProvider({ children }: PropsWithChildren) {
  const [content, setContent] = useState<SiteContentConfig>(loadSiteContent);

  useEffect(() => {
    syncSiteContentFromSupabase().then((cloudContent) => {
      if (cloudContent) setContent(cloudContent);
    });
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
    }),
    [content]
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
