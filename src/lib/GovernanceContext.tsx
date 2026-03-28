import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  clearStoredGovernanceContent,
  defaultGovernanceContent,
  loadGovernanceContent,
  persistGovernanceContent,
  syncGovernanceFromSupabase,
} from './governance';
import { supabase } from './supabase';
import type { GovernanceContent } from '../types/governance';

const CLOUD_TIMEOUT = 4000;

type GovernanceContextValue = {
  content: GovernanceContent;
  saveContent: (nextContent: GovernanceContent) => GovernanceContent;
  resetContent: () => GovernanceContent;
  defaultContent: GovernanceContent;
  isInitialized: boolean;
};

const GovernanceContext = createContext<GovernanceContextValue | null>(null);

export function GovernanceProvider({ children }: PropsWithChildren) {
  const [isInitialized, setIsInitialized] = useState(!supabase);
  const [content, setContent] = useState<GovernanceContent>(() =>
    supabase ? defaultGovernanceContent : loadGovernanceContent()
  );

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    const timeoutId = setTimeout(() => {
      if (cancelled) return;
      setContent(loadGovernanceContent());
      setIsInitialized(true);
    }, CLOUD_TIMEOUT);

    syncGovernanceFromSupabase()
      .then((cloudContent) => {
        if (cancelled) return;
        clearTimeout(timeoutId);
        setContent(cloudContent ?? loadGovernanceContent());
        setIsInitialized(true);
      })
      .catch(() => {
        if (cancelled) return;
        clearTimeout(timeoutId);
        setContent(loadGovernanceContent());
        setIsInitialized(true);
      });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  function saveContent(nextContent: GovernanceContent) {
    const persistedContent = persistGovernanceContent(nextContent);
    setContent(persistedContent);
    return persistedContent;
  }

  function resetContent() {
    clearStoredGovernanceContent();
    setContent(defaultGovernanceContent);
    return defaultGovernanceContent;
  }

  const value = useMemo(
    () => ({
      content,
      saveContent,
      resetContent,
      defaultContent: defaultGovernanceContent,
      isInitialized,
    }),
    [content, isInitialized]
  );

  return <GovernanceContext.Provider value={value}>{children}</GovernanceContext.Provider>;
}

export function useGovernance() {
  const context = useContext(GovernanceContext);

  if (!context) {
    throw new Error('useGovernance deve ser usado dentro de GovernanceProvider');
  }

  return context;
}
