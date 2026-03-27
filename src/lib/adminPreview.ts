import { useEffect, useMemo, useState } from 'react';

export const ADMIN_DRAFT_STORAGE_KEYS = {
  home: 'magnatas_admin_draft_home',
  magnatas: 'magnatas_admin_draft_magnatas',
  branding: 'magnatas_admin_draft_branding',
  events: 'magnatas_admin_draft_events_page',
  governance: 'magnatas_admin_draft_governance',
} as const;

export const ADMIN_PREVIEW_ROUTES = {
  home: '/admin/preview/home',
  magnatas: '/admin/preview/magnatas',
  branding: '/admin/preview/branding',
  events: '/admin/preview/eventos',
} as const;

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function loadPreviewValue<T>(
  draftStorageKey: string,
  sourceValue: T,
  sanitizeDraft?: (candidate: unknown) => T
) {
  if (typeof window === 'undefined') {
    return cloneValue(sourceValue);
  }

  try {
    const storedValue = window.localStorage.getItem(draftStorageKey);
    if (!storedValue) {
      return cloneValue(sourceValue);
    }

    const parsedValue = JSON.parse(storedValue) as unknown;
    return sanitizeDraft ? sanitizeDraft(parsedValue) : (parsedValue as T);
  } catch {
    return cloneValue(sourceValue);
  }
}

type UseAdminDraftPreviewValueOptions<T> = {
  draftStorageKey: string;
  sourceValue: T;
  sanitizeDraft?: (candidate: unknown) => T;
  pollIntervalMs?: number;
};

export function useAdminDraftPreviewValue<T>({
  draftStorageKey,
  sourceValue,
  sanitizeDraft,
  pollIntervalMs = 360,
}: UseAdminDraftPreviewValueOptions<T>) {
  const sourceSnapshot = useMemo(() => JSON.stringify(sourceValue), [sourceValue]);
  const [value, setValue] = useState<T>(() =>
    loadPreviewValue(draftStorageKey, sourceValue, sanitizeDraft)
  );

  useEffect(() => {
    setValue(loadPreviewValue(draftStorageKey, sourceValue, sanitizeDraft));
  }, [draftStorageKey, sanitizeDraft, sourceSnapshot, sourceValue]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const syncDraft = () => {
      const nextValue = loadPreviewValue(draftStorageKey, sourceValue, sanitizeDraft);
      const nextSnapshot = JSON.stringify(nextValue);

      setValue((currentValue) =>
        JSON.stringify(currentValue) === nextSnapshot ? currentValue : nextValue
      );
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== draftStorageKey) {
        return;
      }

      syncDraft();
    };

    syncDraft();
    window.addEventListener('storage', handleStorage);

    const intervalId = window.setInterval(syncDraft, pollIntervalMs);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.clearInterval(intervalId);
    };
  }, [draftStorageKey, pollIntervalMs, sanitizeDraft, sourceSnapshot, sourceValue]);

  return value;
}
