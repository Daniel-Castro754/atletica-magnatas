import type { ReactNode } from 'react';
import {
  ArrowRight,
  ExternalLink,
  Instagram,
  Mail,
  Megaphone,
  MessageCircle,
  ShoppingBag,
  Trophy,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/branding/BrandLogo';
import { useBranding } from '../lib/BrandingContext';
import { createSiteTypographyClassName } from '../lib/brandingTypography';
import { rgbaFromHex } from '../lib/colorUtils';
import { hasVisibleText, replaceSiteNameToken } from '../lib/siteContent';
import { useSiteContent } from '../lib/SiteContentContext';
import type {
  HomeContactKind,
  HomeCtaVariant,
  HomeHighlightIcon,
  HomeSectionId,
} from '../types/siteContent';

const highlightIconMap: Record<HomeHighlightIcon, typeof ShoppingBag> = {
  shopping_bag: ShoppingBag,
  trophy: Trophy,
  users: Users,
  megaphone: Megaphone,
};

const contactIconMap: Record<HomeContactKind, typeof Instagram> = {
  instagram: Instagram,
  whatsapp: MessageCircle,
  email: Mail,
  link: ExternalLink,
};

function resolveButtonClass(variant: HomeCtaVariant) {
  if (variant === 'secondary') {
    return 'button button-secondary';
  }

  if (variant === 'outline') {
    return 'button button-outline';
  }

  return 'button';
}

function isInternalHref(href: string) {
  return href.startsWith('/') && !href.startsWith('//');
}

function ActionLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  if (isInternalHref(href)) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

export default function HomePage() {
  const { resolvedBranding } = useBranding();
  const {
    content: { home },
  } = useSiteContent();
  const heroSupportItems = [
    'Esporte',
    'Integracao',
    'Identidade',
    'Presenca universitaria',
  ];
  const siteName = resolvedBranding.siteName;
  const heroSurfaceStart = rgbaFromHex(resolvedBranding.colors.primary, 0.07);
  const heroSurfaceEnd = rgbaFromHex(resolvedBranding.colors.accent, 0.05);
  const heroImageUrl = home.coverImageUrl || resolvedBranding.homeCoverUrl;

  const applySiteName = (value: string) => replaceSiteNameToken(value, siteName);
  const resolveText = (value: string) => applySiteName(value);
  const hasText = (value: string) => hasVisibleText(resolveText(value));
  const tx = (
    kind: 'title' | 'subtitle' | 'description',
    className: string
  ) => createSiteTypographyClassName(resolvedBranding.typography, kind, className);

  const visibleCtas = home.ctas.filter(
    (cta) => cta.visible && hasText(cta.label) && hasVisibleText(cta.href)
  );
  const visibleHighlights = home.highlights.filter((highlight) => highlight.visible);
  const visibleContacts = home.contacts.filter((contact) => contact.visible);
  const showHeroCopy =
    [home.heroKicker, home.title, home.subtitle, home.institutionalText].some(hasText) ||
    visibleCtas.length > 0;
  const showHeroCoverCopy = [home.coverKicker, home.coverTitle, home.coverText].some(hasText);
  const showHighlightsHeader = [
    home.highlightsSectionKicker,
    home.highlightsSectionTitle,
    home.highlightsSectionText,
  ].some(hasText);
  const showContactsHeader = [
    home.contactsSectionKicker,
    home.contactsSectionTitle,
    home.contactsSectionText,
  ].some(hasText);

  const sectionMap: Record<HomeSectionId, ReactNode> = {
    hero: (
      <section
        key="hero"
        className={showHeroCopy ? 'container home-hero home-hero-refined' : 'container'}
      >
        {showHeroCopy && (
          <div
            className="hero-copy hero-copy-surface"
            style={{
              backgroundImage: `linear-gradient(145deg, ${heroSurfaceStart}, ${heroSurfaceEnd})`,
            }}
          >
            {hasText(home.heroKicker) && (
              <p className="kicker">{resolveText(home.heroKicker)}</p>
            )}
            {hasText(home.title) && (
              <h1 className={tx('title', 'display-title')}>{resolveText(home.title)}</h1>
            )}
            {hasText(home.subtitle) && (
              <p className={tx('subtitle', 'home-subtitle')}>
                {resolveText(home.subtitle)}
              </p>
            )}
            {hasText(home.institutionalText) && (
              <p className={tx('description', 'lead')}>{resolveText(home.institutionalText)}</p>
            )}

            {visibleCtas.length > 0 && (
              <div className="button-row">
                {visibleCtas.map((cta) => {
                  const ctaLabel = resolveText(cta.label);

                  return (
                    <ActionLink
                      key={cta.id}
                      href={cta.href}
                      className={resolveButtonClass(cta.variant)}
                    >
                      {ctaLabel}
                      <ArrowRight size={18} />
                    </ActionLink>
                  );
                })}
              </div>
            )}

            <div className="hero-support-block" aria-label="Frentes da atletica">
              <div className="hero-support-row">
                {heroSupportItems.map((item) => (
                  <span key={item} className="pill hero-support-pill">
                    {item}
                  </span>
                ))}
              </div>
              <p className="muted hero-support-note">
                Economia em movimento com integracao, representacao e vida universitaria.
              </p>
            </div>
          </div>
        )}

        <aside className="hero-visual-shell">
          <div className="hero-image-card card">
            <div className="hero-image-frame">
              <video
                className="hero-cover-image hero-mascote-video"
                autoPlay
                loop
                muted
                playsInline
                preload="none"
                poster={heroImageUrl}
                aria-hidden="true"
              >
                <source src="/videos/Video_Mascote1.mp4" type="video/mp4" />
              </video>
              <img
                className="hero-cover-image hero-mascote-fallback"
                src={heroImageUrl}
                alt={hasText(home.coverTitle) ? resolveText(home.coverTitle) : siteName}
              />
            </div>
          </div>

          {showHeroCoverCopy && (
            <div className="hero-cover-note card">
              <div className="hero-cover-note-head">
                <BrandLogo className="hero-logo-shell" imageClassName="hero-logo" />
                <div className="hero-cover-note-copy">
                  {hasText(home.coverKicker) && (
                    <p className="kicker hero-cover-kicker">
                      {resolveText(home.coverKicker)}
                    </p>
                  )}
                  {hasText(home.coverTitle) && (
                    <h2 className={tx('title', 'section-title hero-cover-note-title')}>
                      {resolveText(home.coverTitle)}
                    </h2>
                  )}
                </div>
              </div>

              {hasText(home.coverText) && (
                <p className={tx('description', 'muted hero-cover-note-text')}>
                  {resolveText(home.coverText)}
                </p>
              )}
            </div>
          )}
        </aside>
      </section>
    ),
    highlights: (
      <section key="highlights" className="container page-section">
        {showHighlightsHeader && (
          <div className="page-header page-header-stack">
            <div className="home-section-copy home-section-copy-center">
              {hasText(home.highlightsSectionKicker) && (
                <p className="kicker">
                  {resolveText(home.highlightsSectionKicker)}
                </p>
              )}
              {hasText(home.highlightsSectionTitle) && (
                <h2 className={tx('title', 'section-title')}>
                  {resolveText(home.highlightsSectionTitle)}
                </h2>
              )}
              {hasText(home.highlightsSectionText) && (
                <p className={tx('description', 'lead')}>
                  {resolveText(home.highlightsSectionText)}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="feature-grid home-feature-grid">
          {!visibleHighlights.length && (
            <article className="card empty-state">
              <h3 className="section-title">A narrativa da {siteName} esta sendo reorganizada.</h3>
              <p className="muted">
                A diretoria pode publicar novos blocos institucionais assim que quiser.
              </p>
            </article>
          )}

          {visibleHighlights.map((highlight) => {
            const Icon = highlightIconMap[highlight.icon];
            const highlightTitle = resolveText(highlight.title);
            const highlightDescription = resolveText(highlight.description);

            return (
              <article key={highlight.id} className="card home-highlight-card">
                <span className="home-highlight-icon-shell" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <div className="home-highlight-copy">
                  {hasVisibleText(highlightTitle) && (
                    <h3 className={tx('title', 'section-title home-highlight-title')}>
                      {highlightTitle}
                    </h3>
                  )}
                  {hasVisibleText(highlightDescription) && (
                    <p className={tx('description', 'muted home-highlight-text')}>
                      {highlightDescription}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    ),
    featured_products: null,
    contact_highlights: (
      <section key="contact_highlights" className="container page-section">
        <div className="card home-contact-panel">
          {showContactsHeader && (
            <div className="page-header page-header-stack home-contact-panel-head">
              <div className="home-section-copy home-section-copy-center">
                {hasText(home.contactsSectionKicker) && (
                  <p className="kicker">
                    {resolveText(home.contactsSectionKicker)}
                  </p>
                )}
                {hasText(home.contactsSectionTitle) && (
                  <h2 className={tx('title', 'section-title')}>
                    {resolveText(home.contactsSectionTitle)}
                  </h2>
                )}
                {hasText(home.contactsSectionText) && (
                  <p className={tx('description', 'lead')}>
                    {resolveText(home.contactsSectionText)}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="home-contact-grid">
            {!visibleContacts.length && (
              <article className="card empty-state">
                <h3 className="section-title">Os canais da {siteName} serao destacados aqui.</h3>
                <p className="muted">
                  A diretoria ainda nao selecionou contatos ou redes para esta secao.
                </p>
              </article>
            )}

            {visibleContacts.map((contact) => {
              const Icon = contactIconMap[contact.kind];
              const contactLabel = resolveText(contact.label);
              const contactValue = resolveText(contact.value);
              const showContactAction = hasVisibleText(contact.href);

              return (
                <article key={contact.id} className="card home-contact-card" data-kind={contact.kind}>
                  <div className="home-contact-head">
                    <span className="home-contact-icon-shell" aria-hidden="true">
                      <Icon size={16} />
                    </span>
                    {hasVisibleText(contactLabel) && (
                      <strong className={tx('subtitle', '')}>{contactLabel}</strong>
                    )}
                  </div>
                  {hasVisibleText(contactValue) && (
                    <p className={tx('description', 'home-contact-value')}>{contactValue}</p>
                  )}
                  {showContactAction && (
                    <ActionLink href={contact.href} className="button button-outline">
                      Abrir canal
                    </ActionLink>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>
    ),
  };

  const orderedSections = home.sections
    .filter((section) => section.visible)
    .map((section) => sectionMap[section.id])
    .filter(Boolean);

  return <div className="page">{orderedSections}</div>;
}
