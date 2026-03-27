import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ExternalLink,
  MapPin,
  Star,
  Ticket,
} from 'lucide-react';
import { useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { PageMeta } from '../components/PageMeta';
import { useAnalytics } from '../lib/AnalyticsContext';
import { useBranding } from '../lib/BrandingContext';
import { formatCurrency } from '../lib/formatCurrency';
import {
  formatEventDateLabel,
  formatEventTimeRange,
  getEventActionConfig,
  getEventCategoryLabel,
  getEventStatusKey,
  getEventStatusLabel,
  getUpcomingVisibleEvents,
  isExternalNavigationTarget,
} from '../lib/events';
import { useEvents } from '../lib/EventsContext';
import { hasVisibleText } from '../lib/siteContent';

export default function EventDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { resolvedBranding } = useBranding();
  const { getEventById, categories, visibleEvents } = useEvents();
  const { trackEventLinkClick } = useAnalytics();

  const event = id ? getEventById(id) : null;
  const availableEvent = event?.visible ? event : null;

  const relatedEvents = useMemo(() => {
    if (!availableEvent) {
      return [];
    }

    const upcomingEvents = getUpcomingVisibleEvents(visibleEvents).filter(
      (candidate) => candidate.id !== availableEvent.id
    );

    if (upcomingEvents.length > 0) {
      return upcomingEvents.slice(0, 3);
    }

    return visibleEvents
      .filter((candidate) => candidate.id !== availableEvent.id)
      .slice(0, 3);
  }, [availableEvent, visibleEvents]);

  if (!availableEvent) {
    return (
      <div className="page">
        <section className="container narrow">
          <div className="card empty-state">
            <p className="kicker">Evento nao encontrado</p>
            <h1 className="section-title">Esse evento nao esta disponivel na agenda publica.</h1>
            <p className="lead">
              Volte para a programacao da {resolvedBranding.siteName} para acompanhar os proximos
              encontros abertos.
            </p>
            <Link to="/eventos" className="button">
              Ir para Eventos
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const currentEvent = availableEvent;
  const categoryLabel = getEventCategoryLabel(currentEvent.categoryId, categories);
  const action = getEventActionConfig(currentEvent);
  const statusKey = getEventStatusKey(currentEvent);
  const statusLabel = getEventStatusLabel(currentEvent);
  const hasExternalInfoLink = hasVisibleText(currentEvent.externalUrl);
  const hasTicketPrice = typeof currentEvent.ticketPrice === 'number' && currentEvent.ticketPrice > 0;

  function handleEventActionClick(destination: string) {
    trackEventLinkClick(
      currentEvent.id,
      currentEvent.title,
      currentEvent.categoryId,
      destination,
      location.pathname
    );
  }

  return (
    <div className="page">
      <PageMeta
        title={currentEvent.title}
        description={currentEvent.shortDescription || `${currentEvent.title} — agenda oficial da ${resolvedBranding.siteName}.`}
        imageUrl={currentEvent.imageUrl || undefined}
        path={`/eventos/${currentEvent.id}`}
      />
      <section className="container">
        <Breadcrumb
          items={[
            { label: 'Eventos', to: '/eventos' },
            { label: currentEvent.title },
          ]}
        />
      </section>
      <section className="container event-detail">
        <div className="card event-gallery-card">
          <div className="event-gallery-stage">
            {hasVisibleText(currentEvent.imageUrl) ? (
              <img
                className="event-gallery-image"
                src={currentEvent.imageUrl}
                alt={currentEvent.title}
                decoding="async"
              />
            ) : (
              <div className="event-gallery-placeholder">
                <CalendarDays size={34} />
                <span>Sem imagem principal cadastrada</span>
              </div>
            )}
          </div>
        </div>

        <div className="card event-summary">
          <div className="badge-row">
            <span className="pill">{categoryLabel}</span>
            {currentEvent.featured && (
              <span className="pill pill-accent">
                <Star size={14} />
                Destaque
              </span>
            )}
            <span className={`pill event-status-pill event-status-pill-${statusKey}`}>
              {statusLabel}
            </span>
            {hasTicketPrice && (
              <span className="pill pill-accent">
                <Ticket size={14} />
                {formatCurrency(currentEvent.ticketPrice!)}
              </span>
            )}
          </div>

          <div className="event-summary-head">
            <p className="kicker">Agenda {resolvedBranding.siteName}</p>
            <h1 className="section-title">{currentEvent.title}</h1>
          </div>

          {hasVisibleText(currentEvent.shortDescription) && (
            <p className="lead">{currentEvent.shortDescription}</p>
          )}

          <div className="event-meta-grid">
            <div className="event-meta-card">
              <CalendarDays size={18} />
              <div>
                <strong>Data</strong>
                <span>{formatEventDateLabel(currentEvent.date)}</span>
              </div>
            </div>

            <div className="event-meta-card">
              <Clock3 size={18} />
              <div>
                <strong>Horario</strong>
                <span>{formatEventTimeRange(currentEvent)}</span>
              </div>
            </div>

            {hasVisibleText(currentEvent.location) && (
              <div className="event-meta-card">
                <MapPin size={18} />
                <div>
                  <strong>Local</strong>
                  <span>{currentEvent.location}</span>
                </div>
              </div>
            )}
          </div>

          {hasTicketPrice && (
            <div className="event-ticket-price-block">
              <span className="kicker">Valor de referencia</span>
              <strong className="detail-price event-ticket-price">
                {formatCurrency(currentEvent.ticketPrice!)}
              </strong>
            </div>
          )}

          {hasVisibleText(currentEvent.fullDescription) && (
            <div className="event-rich-copy">
              <h2 className="section-title">Sobre o evento</h2>
              <p className="lead">{currentEvent.fullDescription}</p>
            </div>
          )}

          <div className="button-row">
            {action.canRender && action.isEnabled && (
              <>
                {action.isExternal ? (
                  <a
                    href={action.url}
                    className="button"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleEventActionClick(action.url)}
                  >
                    {action.label}
                    <ExternalLink size={16} />
                  </a>
                ) : (
                  <Link
                    to={action.url}
                    className="button"
                    onClick={() => handleEventActionClick(action.url)}
                  >
                    {action.label}
                  </Link>
                )}
              </>
            )}

            {action.canRender && !action.isEnabled && (
              <button type="button" className="button" disabled>
                {action.isSoldOut ? 'Ingressos esgotados' : 'Evento encerrado'}
              </button>
            )}

            {hasExternalInfoLink &&
              (isExternalNavigationTarget(currentEvent.externalUrl) ? (
                <a
                  href={currentEvent.externalUrl}
                  className="button button-outline"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleEventActionClick(currentEvent.externalUrl)}
                >
                  Link externo do evento
                  <ExternalLink size={16} />
                </a>
              ) : (
                <Link
                  to={currentEvent.externalUrl}
                  className="button button-outline"
                  onClick={() => handleEventActionClick(currentEvent.externalUrl)}
                >
                  Link externo do evento
                </Link>
              ))}

            <Link to="/eventos" className="button button-outline">
              <ArrowLeft size={16} />
              Voltar para Eventos
            </Link>
          </div>

          {(action.isExternal || hasVisibleText(currentEvent.externalTicketProvider)) && (
            <p className="muted event-cta-note">
              {hasVisibleText(currentEvent.externalTicketProvider)
                ? `A acao principal direciona para ${currentEvent.externalTicketProvider}.`
                : 'A acao principal abre uma pagina externa para concluir a compra ou reserva.'}
            </p>
          )}
        </div>
      </section>

      {relatedEvents.length > 0 && (
        <section className="container page-section">
          <div className="page-header">
            <div>
              <p className="kicker">Proximos eventos</p>
              <h2 className="section-title">Outros encontros confirmados da Magnatas.</h2>
            </div>
            <Link to="/eventos" className="button button-outline">
              Ver agenda completa
            </Link>
          </div>

          <div className="events-card-grid">
            {relatedEvents.map((relatedEvent) => (
              <article key={relatedEvent.id} className="preview-card events-card">
                {hasVisibleText(relatedEvent.imageUrl) && (
                  <img
                    className="product-media"
                    src={relatedEvent.imageUrl}
                    alt={relatedEvent.title}
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div className="product-body">
                  <div className="product-title-row">
                    <h3 className="events-event-title">{relatedEvent.title}</h3>
                    <span className="pill">
                      {getEventCategoryLabel(relatedEvent.categoryId, categories)}
                    </span>
                  </div>

                  {hasVisibleText(relatedEvent.shortDescription) && (
                    <p className="muted">{relatedEvent.shortDescription}</p>
                  )}

                  <div className="events-meta-list">
                    <span>
                      <CalendarDays size={16} />
                      {formatEventDateLabel(relatedEvent.date)}
                    </span>
                    <span>
                      <Clock3 size={16} />
                      {formatEventTimeRange(relatedEvent)}
                    </span>
                    {hasVisibleText(relatedEvent.location) && (
                      <span>
                        <MapPin size={16} />
                        {relatedEvent.location}
                      </span>
                    )}
                  </div>

                  <div className="product-actions">
                    <Link to={`/eventos/${relatedEvent.id}`} className="button button-outline">
                      Ver evento
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
