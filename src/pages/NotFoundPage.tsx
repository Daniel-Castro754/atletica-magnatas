import { Link } from 'react-router-dom';
import { useBranding } from '../lib/BrandingContext';

export default function NotFoundPage() {
  const { resolvedBranding } = useBranding();

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="kicker">404</p>
        <h1 className="section-title">Pagina nao encontrada.</h1>
        <p className="lead">
          O endereco solicitado nao faz parte da navegacao atual da {resolvedBranding.siteName}.
        </p>
        <Link to="/" className="button">
          Voltar ao inicio
        </Link>
      </section>
    </main>
  );
}
