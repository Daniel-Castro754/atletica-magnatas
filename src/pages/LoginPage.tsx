import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useBranding } from '../lib/BrandingContext';
import { ADMIN_DEMO_EMAIL, BLOCKED_DEMO_EMAIL, useAuth } from '../lib/AuthContext';

type LoginState = {
  from?: string;
};

export default function LoginPage() {
  const { authError, authStatus, loginMessage, signIn, signOut, clearLoginMessage, isDemoMode } =
    useAuth();
  const { resolvedBranding } = useBranding();
  const location = useLocation();
  const [email, setEmail] = useState(isDemoMode ? ADMIN_DEMO_EMAIL : '');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const locationState = location.state as LoginState | null;
  const redirectTo = typeof locationState?.from === 'string' ? locationState.from : '/admin';
  const statusMessage =
    authError?.type === 'user_not_registered' ? authError.message : loginMessage;

  if (authStatus === 'admin') {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSigningIn(true);
    await signIn({ email, password });
    setIsSigningIn(false);
  }

  function handleEmailChange(value: string) {
    clearLoginMessage();
    setEmail(value);
  }

  function handlePasswordChange(value: string) {
    clearLoginMessage();
    setPassword(value);
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="kicker">Diretoria Magnatas</p>
        <h1 className="section-title">Acesso administrativo da {resolvedBranding.siteName}.</h1>
        <p className="lead">
          Esta entrada concentra o acesso ao painel interno da diretoria e mantem a area
          publica livre para navegacao.
        </p>

        {statusMessage && <div className="status-banner">{statusMessage}</div>}

        <form className="branding-form" onSubmit={handleSubmit}>
          <div className="branding-grid">
            <label className="field field-full">
              <span className="field-label">E-mail administrativo</span>
              <input
                className="input"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => handleEmailChange(event.target.value)}
                disabled={isSigningIn}
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Senha</span>
              <input
                className="input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => handlePasswordChange(event.target.value)}
                disabled={isSigningIn}
              />
            </label>
          </div>

          <div className="button-row">
            <button type="submit" className="button" disabled={isSigningIn}>
              {isSigningIn ? 'Entrando...' : 'Entrar no painel'}
            </button>
            <button type="button" className="button button-outline" onClick={signOut}>
              Limpar estado
            </button>
            <Link to="/" className="button button-outline">
              Voltar ao site
            </Link>
          </div>
        </form>

        {isDemoMode && (
          <div className="card admin-preview-card">
            <p className="kicker">Credenciais demo locais</p>
            <ul className="check-list">
              <li>
                E-mail de acesso: <code>{ADMIN_DEMO_EMAIL}</code>
              </li>
              <li>
                Senha de acesso: <code>Magnatas123</code>
              </li>
              <li>
                E-mail bloqueado para teste: <code>{BLOCKED_DEMO_EMAIL}</code>
              </li>
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
