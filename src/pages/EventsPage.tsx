import { CalendarDays, Clock3, ExternalLink, MapPin, Star, Ticket } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAnalytics } from '../lib/AnalyticsContext';
import { useBranding } from '../lib/BrandingContext';
import { createSiteTypographyClassName } from '../lib/brandingTypography';
import { useEvents } from '../lib/EventsContext';
import {
  formatEventDateLabel,
  formatEventMonthLabel,
  formatEventTimeRange,
  getEventActionConfig,
  getEventCategoryLabel,
  getEventStartDateTime,
  getEventStatusKey,
  getEventStatusLabel,
  getEventsByMonth,
  getEventsForDate,
  getFeaturedUpcomingEvent,
  getUpcomingVisibleEvents,
  isExternalNavigationTarget,
} from '../lib/events';
import { formatCurrency } from '../lib/formatCurrency';
import { hasVisibleText } from '../lib/siteContent';

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

function buildCalendarDays(referenceMonth: Date, dateKeysWithEvents: Set<string>) {
  const firstDayOfMonth = new Date(referenceMonth.getFullYear(), referenceMonth.getMonth(), 1);
  const firstWeekday = (firstDayOfMonth.getDay() + 6) % 7;
  const firstCellDate = new Date(firstDayOfMonth);
  firstCellDate.setDate(firstDayOfMonth.getDate() - firstWeekday);

  return Array.from({ length: 42 }, (_, index) => {
    const cellDate = new Date(firstCellDate);
    cellDate.setDate(firstCellDate.getDate() + index);

    const dateKey = [
      cellDate.getFullYear(),
      String(cellDate.getMonth() + 1).padStart(2, '0'),
      String(cellDate.getDate()).padStart(2, '0'),
    ].join('-');

    return {
      dateKey,
      dayNumber: cellDate.getDate(),
      isCurrentMonth: cellDate.getMonth() === referenceMonth.getMonth(),
      hasEvents: dateKeysWithEvents.has(dateKey),
    };
  });
}

export default function EventsPage() {
  const { resolvedBranding } = useBranding();
  const { visibleEvents, categories, pageContent } = useEvents();
  const { trackEventLinkClick } = useAnalytics();
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const featuredEvent = getFeaturedUpcomingEvent(visibleEvents);
    return featuredEvent ? getEventStartDateTime(featuredEvent) : new Date();
  });
  const [selectedDayKey, setSelectedDayKey] = useState('');

  const sectionVisibility = useMemo(
    () =>
      new Map(pageContent.sections.map((section) => [section.id, section.visible] as const)),
    [pageContent.sections]
  );
  const tx = (
    kind: 'title' | 'subtitle' | 'description',
    className: string
  ) => createSiteTypographyClassName(resolvedBranding.typography, kind, className);

  const visibleCategories = useMemo(
    () => categories.filter((category) => category.visible),
    [categories]
  );

  const filteredVisibleEvents = useMemo(
    () =>
      selectedCategoryId === 'all'
        ? visibleEvents
        : visibleEvents.filter((event) => event.categoryId === selectedCategoryId),
    [selectedCategoryId, visibleEvents]
  );

  const featuredEvent = useMemo(
    () => getFeaturedUpcomingEvent(filteredVisibleEvents),
    [filteredVisibleEvents]
  );

  const upcomingEvents = useMemo(
    () => getUpcomingVisibleEvents(filteredVisibleEvents).slice(0, 8),
    [filteredVisibleEvents]
  );

  const monthEvents = useMemo(
    () => getEventsByMonth(filteredVisibleEvents, currentMonth.getFullYear(), currentMonth.getMonth()),
    [currentMonth, filteredVisibleEvents]
  );

  const dateKeysWithEvents = useMemo(
    () => new Set(monthEvents.map((event) => event.date)),
    [monthEvents]
  );

  const calendarDays = useMemo(
    () => buildCalendarDays(currentMonth, dateKeysWithEvents),
    [currentMonth, dateKeysWithEvents]
  );

  useEffect(() => {
    if (selectedDayKey && dateKeysWithEvents.has(selectedDayKey)) {
      return;
    }

    const firstMonthEvent = monthEvents[0];
    setSelectedDayKey(firstMonthEvent?.date || '');
  }, [dateKeysWithEvents, monthEvents, selectedDayKey]);

  const selectedDayEvents = useMemo(
    () => (selectedDayKey ? getEventsForDate(filteredVisibleEvents, selectedDayKey) : []),
    [filteredVisibleEvents, selectedDayKey]
  );

  function changeMonth(direction: 'previous' | 'next') {
    setCurrentMonth((currentValue) => {
      const nextMonth = new Date(currentValue);
      nextMonth.setMonth(currentValue.getMonth() + (direction === 'next' ? 1 : -1));
      return nextMonth;
    });
  }

  function handleEventLinkClick(eventId: string, eventTitle: string, categoryId: string, link: string) {
    trackEventLinkClick(eventId, eventTitle, categoryId, link, '/eventos');
  }

  return (
    <div className="page events-page">
      {sectionVisibility.get('hero') && (
        <section className="container events-hero-section">
          <article
            className="card events-hero"
            style={{
              backgroundImage: `linear-gradient(145deg, rgba(5, 7, 13, 0.76), rgba(13, 74, 165, 0.46)), url("${pageContent.bannerImageUrl || resolvedBranding.homeCoverUrl}")`,
            }}
          >
            <div className="events-hero-copy">
              {hasVisibleText(pageContent.heroKicker) && (
                <p className="kicker events-hero-kicker">
                  {pageContent.heroKicker}
                </p>
              )}
              {hasVisibleText(pageContent.title) && (
                <h1 className={tx('title', 'display-title events-display-title')}>
                  {pageContent.title}
                </h1>
              )}
              {hasVisibleText(pageContent.subtitle) && (
                <p className={tx('subtitle', 'home-subtitle events-hero-subtitle')}>
                  {pageContent.subtitle}
                </p>
              )}
              {hasVisibleText(pageContent.introText) && (
                <p className={tx('description', 'lead events-hero-lead')}>
                  {pageContent.introText}
                </p>
              )}
            </div>
          </article>
        </section>
      )}

      {sectionVisibility.get('filters') && (
        <section className="container page-section">
          <div className="page-header page-header-stack">
            <div className="home-section-copy">
              {hasVisibleText(pageContent.filtersKicker) && (
                <p className="kicker">{pageContent.filtersKicker}</p>
              )}
              {hasVisibleText(pageContent.filtersTitle) && (
                <h2 className={tx('title', 'section-title')}>{pageContent.filtersTitle}</h2>
              )}
            </div>
          </div>

          <div className="filters">
            <button
              type="button"
              className={selectedCategoryId === 'all' ? 'chip chip-active' : 'chip'}
              onClick={() => setSelectedCategoryId('all')}
            >
              Todos
            </button>
            {visibleCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={
                  selectedCategoryId === category.id ? 'chip chip-active' : 'chip'
                }
                onClick={() => setSelectedCategoryId(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {sectionVisibility.get('featured_event') && featuredEvent && (
        <section className="container page-section">
          <div className="page-header page-header-stack">
            <div className="home-section-copy">
              {hasVisibleText(pageContent.featuredSectionKicker) && (
                <p className="kicker">
                  {pageContent.featuredSectionKicker}
                </p>
              )}
              {hasVisibleText(pageContent.featuredSectionTitle) && (
                <h2 className={tx('title', 'section-title')}>
                  {pageContent.featuredSectionTitle}
                </h2>
              )}
            </div>
          </div>

          <article className="card events-featured-card">
            {hasVisibleText(featuredEvent.imageUrl) && (
              <img
                className="events-featured-image"
                src={featuredEvent.imageUrl}
                alt={featuredEvent.title}
              />
            )}

            <div className="events-featured-body">
              <span className="pill pill-accent">
                <Star size={14} />
                Em destaque
              </span>
              <span className="pill">{getEventCategoryLabel(featuredEvent.categoryId, categories)}</span>
              <span
                className={`pill event-status-pill event-status-pill-${getEventStatusKey(featuredEvent)}`}
              >
                {getEventStatusLabel(featuredEvent)}
              </span>
              <h3 className={tx('title', 'section-title')}>{featuredEvent.title}</h3>
              {hasVisibleText(featuredEvent.shortDescription) && (
                <p className={tx('description', 'lead')}>{featuredEvent.shortDescription}</p>
              )}
              {hasVisibleText(featuredEvent.fullDescription) && (
                <p className={tx('description', 'muted')}>{featuredEvent.fullDescription}</p>
              )}

              <div className="events-meta-list">
                <span>
                  <CalendarDays size={16} />
                  {formatEventDateLabel(featuredEvent.date)}
                </span>
                <span>
                  <Clock3 size={16} />
                  {formatEventTimeRange(featuredEvent)}
                </span>
                {hasVisibleText(featuredEvent.location) && (
                  <span>
                    <MapPin size={16} />
                    {featuredEvent.location}
                  </span>
                )}
              </div>

              {typeof featuredEvent.ticketPrice === 'number' && featuredEvent.ticketPrice > 0 && (
                <strong className="event-inline-price">
                  <Ticket size={18} />
                  {formatCurrency(featuredEvent.ticketPrice)}
                </strong>
              )}

              <div className="button-row">
                <Link to={`/eventos/${featuredEvent.id}`} className="button">
                  Ver evento
                </Link>

                {(() => {
                  const action = getEventActionConfig(featuredEvent);

                  if (!action.canRender || !action.isEnabled) {
                    return null;
                  }

                  return isExternalNavigationTarget(action.url) ? (
                    <a
                      href={action.url}
                      className="button button-outline"
                      target="_blank"
                      rel="noreferrer"
                      onClick={() =>
                        handleEventLinkClick(
                          featuredEvent.id,
                          featuredEvent.title,
                          featuredEvent.categoryId,
                          action.url
                        )
                      }
                    >
                      {action.label}
                      <ExternalLink size={16} />
                    </a>
                  ) : (
                    <Link
                      to={action.url}
                      className="button button-outline"
                      onClick={() =>
                        handleEventLinkClick(
                          featuredEvent.id,
                          featuredEvent.title,
                          featuredEvent.categoryId,
                          action.url
                        )
                      }
                    >
                      {action.label}
                    </Link>
                  );
                })()}
              </div>
            </div>
          </article>
        </section>
      )}

      {(sectionVisibility.get('calendar') || sectionVisibility.get('upcoming_list')) && (
        <section className="container page-section events-calendar-section">
          {sectionVisibility.get('calendar') && (
            <div className="page-header page-header-stack">
              <div className="home-section-copy">
                {hasVisibleText(pageContent.calendarSectionKicker) && (
                  <p className="kicker">
                    {pageContent.calendarSectionKicker}
                  </p>
                )}
                {hasVisibleText(pageContent.calendarSectionTitle) && (
                  <h2 className={tx('title', 'section-title')}>
                    {pageContent.calendarSectionTitle}
                  </h2>
                )}
              </div>
            </div>
          )}

          <div className="events-calendar-layout">
            {sectionVisibility.get('calendar') && (
              <article className="card events-calendar-card">
                <div className="events-calendar-head">
                  <strong>{formatEventMonthLabel(currentMonth)}</strong>
                  <div className="events-calendar-actions">
                    <button
                      type="button"
                      className="chip"
                      onClick={() => changeMonth('previous')}
                    >
                      Mes anterior
                    </button>
                    <button
                      type="button"
                      className="chip"
                      onClick={() => changeMonth('next')}
                    >
                      Proximo mes
                    </button>
                  </div>
                </div>

                <div className="events-calendar-grid">
                  {WEEKDAY_LABELS.map((label) => (
                    <span key={label} className="events-calendar-weekday">
                      {label}
                    </span>
                  ))}

                  {calendarDays.map((day) => {
                    const isSelected = day.dateKey === selectedDayKey;
                    const className = [
                      'events-calendar-day',
                      day.isCurrentMonth ? 'events-calendar-day-current' : 'events-calendar-day-muted',
                      day.hasEvents ? 'events-calendar-day-has-events' : '',
                      isSelected ? 'events-calendar-day-selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ');

                    return day.hasEvents ? (
                      <button
                        key={day.dateKey}
                        type="button"
                        className={className}
                        onClick={() => setSelectedDayKey(day.dateKey)}
                      >
                        {day.dayNumber}
                      </button>
                    ) : (
                      <span key={day.dateKey} className={className}>
                        {day.dayNumber}
                      </span>
                    );
                  })}
                </div>
              </article>
            )}

            <article className="card events-day-panel">
              <div className="admin-subcard-head">
                <CalendarDays size={18} />
                <strong>
                  {selectedDayKey
                    ? `Eventos de ${formatEventDateLabel(selectedDayKey)}`
                    : 'Selecione uma data com evento'}
                </strong>
              </div>

              {!selectedDayEvents.length ? (
                <div className="empty-state">
                  {hasVisibleText(pageContent.emptyStateTitle) && (
                    <h3 className={tx('title', 'section-title')}>
                      {pageContent.emptyStateTitle}
                    </h3>
                  )}
                  {hasVisibleText(pageContent.emptyStateText) && (
                    <p className={tx('description', 'muted')}>
                      {pageContent.emptyStateText}
                    </p>
                  )}
                </div>
              ) : (
                <div className="events-day-list">
                  {selectedDayEvents.map((event) => (
                    <article key={event.id} className="events-day-item">
                      <div className="events-day-item-head">
                        <strong className={tx('title', 'events-event-title')}>
                          {event.title}
                        </strong>
                        <span className="pill">{getEventCategoryLabel(event.categoryId, categories)}</span>
                      </div>
                      {hasVisibleText(event.shortDescription) && (
                        <p className={tx('description', 'muted')}>
                          {event.shortDescription}
                        </p>
                      )}
                      <div className="events-meta-list">
                        <span>
                          <Clock3 size={16} />
                          {formatEventTimeRange(event)}
                        </span>
                        {hasVisibleText(event.location) && (
                          <span>
                            <MapPin size={16} />
                            {event.location}
                          </span>
                        )}
                      </div>
                      <div className="product-actions">
                        <Link to={`/eventos/${event.id}`} className="button button-outline">
                          Ver evento
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </article>
          </div>
        </section>
      )}

      {sectionVisibility.get('upcoming_list') && (
        <section className="container page-section">
          <div className="page-header page-header-stack">
            <div className="home-section-copy">
              {hasVisibleText(pageContent.upcomingSectionKicker) && (
                <p className="kicker">
                  {pageContent.upcomingSectionKicker}
                </p>
              )}
              {hasVisibleText(pageContent.upcomingSectionTitle) && (
                <h2 className={tx('title', 'section-title')}>
                  {pageContent.upcomingSectionTitle}
                </h2>
              )}
            </div>
          </div>

          {!upcomingEvents.length ? (
            <article className="card empty-state">
              {hasVisibleText(pageContent.emptyStateTitle) && (
                <h3 className={tx('title', 'section-title')}>
                  {pageContent.emptyStateTitle}
                </h3>
              )}
              {hasVisibleText(pageContent.emptyStateText) && (
                <p className={tx('description', 'muted')}>
                  {pageContent.emptyStateText}
                </p>
              )}
            </article>
          ) : (
            <div className="events-card-grid">
              {upcomingEvents.map((event) => (
                <article key={event.id} className="preview-card events-card">
                  {hasVisibleText(event.imageUrl) && (
                    <img className="product-media" src={event.imageUrl} alt={event.title} />
                  )}
                  <div className="product-body">
                    <div className="product-title-row">
                      <h3 className={tx('title', 'events-event-title')}>{event.title}</h3>
                      <span className="pill">{getEventCategoryLabel(event.categoryId, categories)}</span>
                    </div>

                    {hasVisibleText(event.shortDescription) && (
                      <p className={tx('description', 'muted')}>
                        {event.shortDescription}
                      </p>
                    )}

                    <div className="badge-row">
                      <span
                        className={`pill event-status-pill event-status-pill-${getEventStatusKey(event)}`}
                      >
                        {getEventStatusLabel(event)}
                      </span>
                      {typeof event.ticketPrice === 'number' && event.ticketPrice > 0 && (
                        <span className="pill">
                          <Ticket size={14} />
                          {formatCurrency(event.ticketPrice)}
                        </span>
                      )}
                    </div>

                    <div className="events-meta-list">
                      <span>
                        <CalendarDays size={16} />
                        {formatEventDateLabel(event.date)}
                      </span>
                      <span>
                        <Clock3 size={16} />
                        {formatEventTimeRange(event)}
                      </span>
                      {hasVisibleText(event.location) && (
                        <span>
                          <MapPin size={16} />
                          {event.location}
                        </span>
                      )}
                    </div>

                    <div className="product-actions">
                      <Link to={`/eventos/${event.id}`} className="button button-outline">
                        Ver evento
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
