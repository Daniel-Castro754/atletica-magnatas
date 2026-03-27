import { useEffect, useMemo, useRef, useState } from 'react';

export type AdminEditorStatusTone = 'info' | 'success' | 'error';

export type AdminEditorStatus = {
  tone: AdminEditorStatusTone;
  message: string;
};

type UseAdminEditorPersistenceOptions<T> = {
  draftStorageKey: string;
  sourceValue: T;
  sanitizeDraft?: (candidate: unknown) => T;
  onSave: (value: T) => T | Promise<T>;
  onReset: () => T | Promise<T>;
  saveSuccessMessage: string;
  resetSuccessMessage: string;
  restoredDraftMessage?: string;
};

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function loadDraftValue<T>(
  draftStorageKey: string,
  sourceValue: T,
  sanitizeDraft?: (candidate: unknown) => T
) {
  if (typeof window === 'undefined') {
    return {
      value: cloneValue(sourceValue),
      restored: false,
    };
  }

  try {
    const storedValue = window.localStorage.getItem(draftStorageKey);
    if (!storedValue) {
      return {
        value: cloneValue(sourceValue),
        restored: false,
      };
    }

    const parsedValue = JSON.parse(storedValue) as unknown;
    return {
      value: sanitizeDraft ? sanitizeDraft(parsedValue) : (parsedValue as T),
      restored: true,
    };
  } catch {
    return {
      value: cloneValue(sourceValue),
      restored: false,
    };
  }
}

async function waitForNextPaint() {
  await new Promise<void>((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    window.requestAnimationFrame(() => resolve());
  });
}

export function useAdminEditorPersistence<T>({
  draftStorageKey,
  sourceValue,
  sanitizeDraft,
  onSave,
  onReset,
  saveSuccessMessage,
  resetSuccessMessage,
  restoredDraftMessage = 'Rascunho local restaurado nesta guia.',
}: UseAdminEditorPersistenceOptions<T>) {
  const initialDraft = useMemo(
    () => loadDraftValue(draftStorageKey, sourceValue, sanitizeDraft),
    [draftStorageKey, sanitizeDraft, sourceValue]
  );

  const [savedValue, setSavedValue] = useState<T>(() => cloneValue(sourceValue));
  const [formState, setFormState] = useState<T>(() => initialDraft.value);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<AdminEditorStatus | null>(() =>
    initialDraft.restored
      ? { tone: 'info', message: restoredDraftMessage }
      : null
  );

  const sourceSnapshot = useMemo(() => JSON.stringify(sourceValue), [sourceValue]);
  const savedSnapshot = useMemo(() => JSON.stringify(savedValue), [savedValue]);
  const formSnapshot = useMemo(() => JSON.stringify(formState), [formState]);
  const isDirty = formSnapshot !== savedSnapshot;
  const lastSourceSnapshotRef = useRef(sourceSnapshot);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      if (isDirty) {
        window.localStorage.setItem(draftStorageKey, JSON.stringify(formState));
        return;
      }

      window.localStorage.removeItem(draftStorageKey);
    } catch {
      return;
    }
  }, [draftStorageKey, formState, isDirty]);

  useEffect(() => {
    if (typeof window === 'undefined' || !isDirty) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (sourceSnapshot === lastSourceSnapshotRef.current) {
      return;
    }

    lastSourceSnapshotRef.current = sourceSnapshot;

    if (isDirty) {
      return;
    }

    const nextSourceValue = cloneValue(sourceValue);
    setSavedValue(nextSourceValue);
    setFormState(nextSourceValue);
  }, [isDirty, sourceSnapshot, sourceValue]);

  async function handleSave() {
    setIsSaving(true);
    setStatus({ tone: 'info', message: 'Salvando alteracoes...' });

    try {
      await waitForNextPaint();
      const preparedValue = sanitizeDraft ? sanitizeDraft(formState) : cloneValue(formState);
      const persistedValue = await onSave(preparedValue);
      const nextSavedValue = sanitizeDraft
        ? sanitizeDraft(persistedValue)
        : cloneValue(persistedValue);

      setSavedValue(nextSavedValue);
      setFormState(nextSavedValue);
      setStatus({ tone: 'success', message: saveSuccessMessage });
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Nao foi possivel salvar as alteracoes.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReset() {
    setIsSaving(true);
    setStatus({ tone: 'info', message: 'Restaurando conteudo salvo...' });

    try {
      await waitForNextPaint();
      const resetValue = await onReset();
      const nextSavedValue = sanitizeDraft ? sanitizeDraft(resetValue) : cloneValue(resetValue);

      setSavedValue(nextSavedValue);
      setFormState(nextSavedValue);
      setStatus({ tone: 'success', message: resetSuccessMessage });
    } catch (error) {
      setStatus({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Nao foi possivel restaurar os dados padrao.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  function setEditorStatus(message: string, tone: AdminEditorStatusTone = 'info') {
    setStatus({ tone, message });
  }

  return {
    formState,
    setFormState,
    isDirty,
    isSaving,
    status,
    handleSave,
    handleReset,
    setEditorStatus,
  };
}
