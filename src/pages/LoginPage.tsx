import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useBranding } from '../lib/BrandingContext';
import {
  ADMIN_DEMO_EMAIL,
  ADMIN_DEMO_PASSWORD,
  BLOCKED_DEMO_EMAIL,
  useAuth,
} from '../lib/AuthContext';

type LoginState = {
  from?: string;
};

export default function LoginPage() {
  const { authError, authStatus, loginMessage, signIn, signOut, clearLoginMessage } = useAuth();
  const { resolvedBranding } = useBranding();
  const location = useLocation();
  const [email, setEmail] = useState(ADMIN_DEMO_EMAIL);
  const [password, setPassword] = useState(ADMIN_DEMO_PASSWORD);
  const locationState = location.state as LoginState | null;
  const redirectTo = typeof locationState?.from === 'string' ? locationState.from : '/admin';
  const statusMessage = authError?.type === 'user_not_registered' ? authError.message : loginMessage;

  if (authStatus === 'admin') {
    return <Navigate to={redirectTo} replace />;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    signIn({ email, password });
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
              />
            </label>
          </div>

          <div className="button-row">
            <button type="submit" className="button">
              Entrar no painel
            </button>
            <button type="button" className="button button-outline" onClick={signOut}>
              Limpar estado
            </button>
            <Link to="/" className="button button-outline">
              Voltar ao site
            </Link>
          </div>
        </form>

        <div className="card admin-preview-card">
          <p className="kicker">Credenciais demo locais</p>
          <ul className="check-list">
            <li>
              E-mail de acesso: <code>{ADMIN_DEMO_EMAIL}</code>
            </li>
            <li>
              Senha de acesso: <code>{ADMIN_DEMO_PASSWORD}</code>
            </li>
            <li>
              E-mail bloqueado para teste: <code>{BLOCKED_DEMO_EMAIL}</code>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
