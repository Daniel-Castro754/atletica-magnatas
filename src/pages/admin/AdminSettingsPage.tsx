import { useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { useBranding } from '../../lib/BrandingContext';
import { useEvents } from '../../lib/EventsContext';
import { useProductCatalog } from '../../lib/ProductCatalogContext';
import { useSiteContent } from '../../lib/SiteContentContext';

export default function AdminSettingsPage() {
  const { authStatus, signOut } = useAuth();
  const { resetBranding, resolvedBranding } = useBranding();
  const { resetContent } = useSiteContent();
  const { resetProducts } = useProductCatalog();
  const { resetEvents } = useEvents();
  const [statusMessage, setStatusMessage] = useState('');

  function handleResetBranding() {
    resetBranding();
    setStatusMessage('Branding restaurado para o padrao atual do projeto.');
  }

  function handleResetContent() {
    resetContent();
    setStatusMessage('Conteudos de Home e Institucional restaurados para o padrao atual.');
  }

  function handleResetProducts() {
    resetProducts();
    setStatusMessage('Catalogo de produtos restaurado para o padrao inicial.');
  }

  function handleResetEvents() {
    resetEvents();
    setStatusMessage('Agenda e configuracoes da pagina de eventos restauradas.');
  }

  return (
    <section className="admin-page-grid">
      <article className="card admin-page-intro">
        <p className="kicker">Configuracoes</p>
        <h2 className="section-title">Controle operacional do painel.</h2>
        <p className="lead">
          Esta area combina funcoes reais de sessao e restauracao com espaco para futuras
          configuracoes de permissao, integracoes e ambiente.
        </p>
      </article>

      {statusMessage && <div className="status-banner">{statusMessage}</div>}

      <div className="admin-card-grid">
        <article className="card admin-subcard">
          <p className="kicker">Sessao atual</p>
          <h3 className="section-title">Perfil: {authStatus}</h3>
          <p className="muted">
            O login administrativo local ja protege a area <code>/admin</code>, persiste a
            sessao no navegador e permite sair por aqui.
          </p>
          <div className="button-row">
            <button type="button" className="button button-secondary" onClick={signOut}>
              Encerrar sessao
            </button>
          </div>
        </article>

        <article className="card admin-subcard">
          <p className="kicker">Restauracoes</p>
          <h3 className="section-title">Reset rapido da experiencia</h3>
          <p className="muted">
            Use estes atalhos para voltar ao branding e aos conteudos padrao sem mexer na
            estrutura do projeto.
          </p>
          <div className="button-row">
            <button type="button" className="button button-outline" onClick={handleResetBranding}>
              Restaurar aparencia
            </button>
            <button type="button" className="button button-outline" onClick={handleResetContent}>
              Restaurar conteudos
            </button>
            <button type="button" className="button button-outline" onClick={handleResetProducts}>
              Restaurar produtos
            </button>
            <button type="button" className="button button-outline" onClick={handleResetEvents}>
              Restaurar eventos
            </button>
          </div>
        </article>

        <article className="card admin-subcard">
          <p className="kicker">Instancia atual</p>
          <h3 className="section-title">{resolvedBranding.siteName}</h3>
          <ul className="check-list">
            <li>Login local funcionando com protecao de rota.</li>
            <li>Branding configuravel aplicado na area publica e no navegador.</li>
            <li>Home e Institucional editaveis e persistidos localmente.</li>
            <li>Catalogo com CRUD, filtros, estoque e reordenacao visual no admin.</li>
            <li>Agenda de eventos com calendario, visibilidade e importacao por planilha.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
