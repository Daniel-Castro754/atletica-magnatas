import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

type ToastContextValue = {
  toasts: Toast[];
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4000;

function generateId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = 'info', duration = DEFAULT_DURATION) => {
      const id = generateId();
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, timer);
      }
    },
    [dismiss]
  );

  const success = useCallback(
    (message: string, duration?: number) => toast(message, 'success', duration),
    [toast]
  );
  const error = useCallback(
    (message: string, duration?: number) => toast(message, 'error', duration),
    [toast]
  );
  const info = useCallback(
    (message: string, duration?: number) => toast(message, 'info', duration),
    [toast]
  );
  const warning = useCallback(
    (message: string, duration?: number) => toast(message, 'warning', duration),
    [toast]
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, info, warning, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
}

const TOAST_ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (!toasts.length) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notificações" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} role="alert">
          <span className="toast-icon" aria-hidden="true">
            {TOAST_ICONS[t.type]}
          </span>
          <p className="toast-message">{t.message}</p>
          <button
            type="button"
            className="toast-close"
            aria-label="Fechar notificação"
            onClick={() => onDismiss(t.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
