import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

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
  signIn: (credentials: LoginCredentials) => LoginResult;
  signOut: () => void;
  clearLoginMessage: () => void;
};

const AUTH_STORAGE_KEY = 'magnatas_auth_status';
export const ADMIN_DEMO_EMAIL = 'diretoria@magnatas.local';
export const ADMIN_DEMO_PASSWORD = 'Magnatas123';
export const BLOCKED_DEMO_EMAIL = 'semcadastro@magnatas.local';

const AuthContext = createContext<AuthContextValue | null>(null);

function loadAuthStatus(): AuthStatus {
  if (typeof window === 'undefined') {
    return 'guest';
  }

  try {
    const savedStatus = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (
      savedStatus === 'admin' ||
      savedStatus === 'guest' ||
      savedStatus === 'user_not_registered'
    ) {
      return savedStatus;
    }
  } catch {
    return 'guest';
  }

  return 'guest';
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(loadAuthStatus);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);

  useEffect(() => {
    const authTimer = window.setTimeout(() => setIsLoadingAuth(false), 250);
    const settingsTimer = window.setTimeout(() => setIsLoadingPublicSettings(false), 180);

    return () => {
      window.clearTimeout(authTimer);
      window.clearTimeout(settingsTimer);
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, authStatus);
    } catch {
      return;
    }
  }, [authStatus]);

  let authError: AuthError | null = null;

  if (authStatus === 'guest') {
    authError = {
      type: 'auth_required',
      message: 'Faca login para acessar a area administrativa.',
    };
  }

  if (authStatus === 'user_not_registered') {
    authError = {
      type: 'user_not_registered',
      message: 'Seu usuario ainda nao foi liberado para a area administrativa.',
    };
  }

  function signIn(credentials: LoginCredentials): LoginResult {
    const normalizedEmail = credentials.email.trim().toLowerCase();
    const trimmedPassword = credentials.password.trim();

    if (normalizedEmail === BLOCKED_DEMO_EMAIL) {
      setAuthStatus('user_not_registered');
      setLoginMessage('Seu perfil ainda nao foi liberado para a area administrativa.');

      return {
        status: 'user_not_registered',
        message: 'Seu perfil ainda nao foi liberado para a area administrativa.',
      };
    }

    if (normalizedEmail === ADMIN_DEMO_EMAIL && trimmedPassword === ADMIN_DEMO_PASSWORD) {
      setAuthStatus('admin');
      setLoginMessage(null);

      return {
        status: 'success',
        message: 'Acesso administrativo liberado.',
      };
    }

    setAuthStatus('guest');
    setLoginMessage('Credenciais invalidas. Confira o e-mail e a senha informados.');

    return {
      status: 'invalid_credentials',
      message: 'Credenciais invalidas. Confira o e-mail e a senha informados.',
    };
  }

  function signOut() {
    setAuthStatus('guest');
    setLoginMessage(null);
  }

  const value: AuthContextValue = {
    authStatus,
    authError,
    loginMessage,
    isLoadingAuth,
    isLoadingPublicSettings,
    signIn,
    signOut,
    clearLoginMessage: () => setLoginMessage(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return context;
}
