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
import type { GovernanceContent } from '../types/governance';

type GovernanceContextValue = {
  content: GovernanceContent;
  saveContent: (nextContent: GovernanceContent) => GovernanceContent;
  resetContent: () => GovernanceContent;
  defaultContent: GovernanceContent;
};

const GovernanceContext = createContext<GovernanceContextValue | null>(null);

export function GovernanceProvider({ children }: PropsWithChildren) {
  const [content, setContent] = useState<GovernanceContent>(loadGovernanceContent);

  useEffect(() => {
    syncGovernanceFromSupabase().then((cloudContent) => {
      if (cloudContent) setContent(cloudContent);
    });
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
    }),
    [content]
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
