import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { supabase } from './supabase';

export type AuthStatus = 'guest' | 'admin' | 'user_not_registered';

export type AuthError = {
  type: 'auth_required' | 'user_not_registered';
  message: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResult = {
  status: 'success' | 'invalid_credentials' | 'user_not_registered';
  message: string;
};

type AuthContextValue = {
  authStatus: AuthStatus;
  authError: AuthError | null;
  loginMessage: string | null;
  isLoadingAuth: boolean;
  isLoadingPublicSettings: boolean;
  /**
   * true quando Supabase não está configurado (desenvolvimento local sem .env.local).
   * Em produção com Supabase, é sempre false.
   */
  isDemoMode: boolean;
  signIn: (credentials: LoginCredentials) => Promise<LoginResult>;
  signOut: () => void;
  clearLoginMessage: () => void;
};

// ── Credenciais de dev (fallback quando Supabase não está configurado) ──────────
// Em produção com Supabase configurado, este bloco nunca é executado.
const DEV_ADMIN_EMAIL =
  (import.meta.env.VITE_ADMIN_EMAIL as string | undefined) ?? 'diretoria@magnatas.local';
const DEV_ADMIN_PASSWORD =
  (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? 'Magnatas123';
const DEV_BLOCKED_EMAIL =
  (import.meta.env.VITE_BLOCKED_EMAIL as string | undefined) ?? 'semcadastro@magnatas.local';

// Exportações públicas: apenas e-mails (não senhas)
export const ADMIN_DEMO_EMAIL = DEV_ADMIN_EMAIL;
export const BLOCKED_DEMO_EMAIL = DEV_BLOCKED_EMAIL;

// Chave usada somente no modo dev para persistir status entre reloads
const AUTH_STORAGE_KEY = 'magnatas_auth_status';

const AuthContext = createContext<AuthContextValue | null>(null);

function loadDevAuthStatus(): AuthStatus {
  if (typeof window === 'undefined') return 'guest';
  try {
    const saved = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved === 'admin' || saved === 'guest' || saved === 'user_not_registered') return saved;
  } catch {}
  return 'guest';
}

export function AuthProvider({ children }: PropsWithChildren) {
  // Em modo Supabase, começa como 'guest' até getSession() responder.
  // Em modo dev, restaura do localStorage para manter o login entre reloads.
  const [authStatus, setAuthStatus] = useState<AuthStatus>(() =>
    supabase ? 'guest' : loadDevAuthStatus()
  );
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);

  // ── isLoadingPublicSettings: timer fixo independente de auth ──────────────
  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoadingPublicSettings(false), 180);
    return () => window.clearTimeout(timer);
  }, []);

  // ── Inicialização de auth ─────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) {
      // Dev mode: timer curto para simular carregamento
      const timer = window.setTimeout(() => setIsLoadingAuth(false), 250);
      return () => window.clearTimeout(timer);
    }

    // Produção: restaurar sessão existente do Supabase
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setAuthStatus(data.session ? 'admin' : 'guest');
      })
      .catch(() => {
        setAuthStatus('guest');
      })
      .finally(() => {
        setIsLoadingAuth(false);
      });

    // Manter em sincronia com eventos do Supabase Auth (login, logout, refresh de token)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthStatus(session ? 'admin' : 'guest');
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Persistência de status no modo dev ────────────────────────────────────
  useEffect(() => {
    if (supabase) return; // Supabase gerencia sua própria sessão; não sobrescrever
    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, authStatus);
    } catch {}
  }, [authStatus]);

  // ── Derivados ─────────────────────────────────────────────────────────────
  let authError: AuthError | null = null;
  if (authStatus === 'guest') {
    authError = { type: 'auth_required', message: 'Faca login para acessar a area administrativa.' };
  }
  if (authStatus === 'user_not_registered') {
    authError = {
      type: 'user_not_registered',
      message: 'Seu usuario ainda nao foi liberado para a area administrativa.',
    };
  }

  // ── Ações ─────────────────────────────────────────────────────────────────
  async function signIn(credentials: LoginCredentials): Promise<LoginResult> {
    const normalizedEmail = credentials.email.trim().toLowerCase();
    const trimmedPassword = credentials.password.trim();

    if (supabase) {
      // Produção: delegar para Supabase Auth
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: trimmedPassword,
      });

      if (error) {
        setLoginMessage('Credenciais invalidas. Confira o e-mail e a senha informados.');
        return {
          status: 'invalid_credentials',
          message: 'Credenciais invalidas. Confira o e-mail e a senha informados.',
        };
      }

      // onAuthStateChange atualiza authStatus automaticamente
      setLoginMessage(null);
      return { status: 'success', message: 'Acesso administrativo liberado.' };
    }

    // Dev fallback: verificação local (nunca executada em produção com Supabase)
    if (normalizedEmail === DEV_BLOCKED_EMAIL) {
      setAuthStatus('user_not_registered');
      setLoginMessage('Seu perfil ainda nao foi liberado para a area administrativa.');
      return {
        status: 'user_not_registered',
        message: 'Seu perfil ainda nao foi liberado para a area administrativa.',
      };
    }

    if (normalizedEmail === DEV_ADMIN_EMAIL && trimmedPassword === DEV_ADMIN_PASSWORD) {
      setAuthStatus('admin');
      setLoginMessage(null);
      return { status: 'success', message: 'Acesso administrativo liberado.' };
    }

    setAuthStatus('guest');
    setLoginMessage('Credenciais invalidas. Confira o e-mail e a senha informados.');
    return {
      status: 'invalid_credentials',
      message: 'Credenciais invalidas. Confira o e-mail e a senha informados.',
    };
  }

  function signOut() {
    if (supabase) {
      supabase.auth.signOut();
      // onAuthStateChange setará authStatus = 'guest' automaticamente
      return;
    }
    setAuthStatus('guest');
    setLoginMessage(null);
  }

  const value: AuthContextValue = {
    authStatus,
    authError,
    loginMessage,
    isLoadingAuth,
    isLoadingPublicSettings,
    isDemoMode: !supabase,
    signIn,
    signOut,
    clearLoginMessage: () => setLoginMessage(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}
