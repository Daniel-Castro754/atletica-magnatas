import {
  ArrowUpRight,
  CalendarDays,
  Crown,
  DollarSign,
  FileText,
  Instagram,
  ListChecks,
  Mail,
  Megaphone,
  MessageCircle,
  MessageSquare,
  ShieldCheck,
  ShoppingBag,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import BrandLogo from '../components/branding/BrandLogo';
import { useBranding } from '../lib/BrandingContext';
import { createSiteTypographyClassName } from '../lib/brandingTypography';
import { useGovernance } from '../lib/GovernanceContext';
import type { GovernanceSectionId } from '../types/governance';

function hasVisibleValue(value: string) {
  return value.trim().length > 0;
}

function formatDateLabel(value: string) {
  if (!value.trim()) {
    return '';
  }

  const parsedDate = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(parsedDate);
}

function renderLink({
  href,
  className,
  children,
  download,
}: {
  href: string;
  className: string;
  children: ReactNode;
  download?: string;
}) {
  return (
    <a
      href={href}
      className={className}
      target={href.startsWith('data:') ? undefined : '_blank'}
      rel={href.startsWith('data:') ? undefined : 'noreferrer'}
      download={download}
    >
      {children}
    </a>
  );
}

function getMemberInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function getRoleIcon(title: string): typeof ShieldCheck {
  const lower = title.toLowerCase();
  if (lower.includes('vice')) return Users;
  if (lower.includes('president')) return Crown;
  if (lower.includes('tesourei')) return DollarSign;
  if (lower.includes('event')) return CalendarDays;
  if (lower.includes('produto')) return ShoppingBag;
  if (lower.includes('marketing') || lower.includes('comunicac')) return Megaphone;
  return ShieldCheck;
}

const COMMITMENT_ICONS: { Icon: typeof ListChecks; color: string }[] = [
  { Icon: ListChecks, color: '#1a3a5c' },
  { Icon: MessageSquare, color: '#1a3a5c' },
  { Icon: FileText, color: '#c0392b' },
  { Icon: Users, color: '#c0392b' },
];

function getMandateProgress(startDate: string, endDate: string): number | null {
  if (!startDate || !endDate) return null;
  const start = new Date(`${startDate}T00:00:00`).getTime();
  const end = new Date(`${endDate}T00:00:00`).getTime();
  const now = Date.now();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;
  return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
}

export default function GovernancePage() {
  const { resolvedBranding } = useBranding();
  const { content } = useGovernance();
  const tx = (kind: 'title' | 'subtitle' | 'description', className: string) =>
    createSiteTypographyClassName(resolvedBranding.typography, kind, className);

  const orderedSections = content.sections.filter((section) => section.visible).map((section) => section.id);
  const visibleMembers = content.members.filter((member) => member.visible);
  const visibleRoles = content.roles.filter((item) => item.visible);
  const visibleCommitments = content.commitments.filter((item) => item.visible);
  const visibleDocuments = content.documents.filter((item) => item.visible);

  function renderSection(sectionId: GovernanceSectionId) {
    switch (sectionId) {
      case 'hero':
        return (
          <section key={sectionId} className="container governance-hero">
            <div className="governance-hero-copy">
              <h1 className={tx('title', 'governance-hero-title')}>{content.title}</h1>
              {hasVisibleValue(content.subtitle) && (
                <p className={tx('subtitle', 'governance-hero-subtitle')}>{content.subtitle}</p>
              )}
            </div>

            <aside className="governance-hero-side">
              <div className="governance-brand-card">
                <BrandLogo
                  className="governance-brand-logo-shell"
                  imageClassName="governance-brand-logo"
                />
                <div className="governance-brand-copy">
                  <strong>{resolvedBranding.siteName}</strong>
                  <span>Gestao organizada, comunicacao clara e presenca estudantil.</span>
                </div>
              </div>

              <div className="governance-hero-term">
                <span className="pill pill-accent">Mandato atual</span>
                <strong>{content.currentTerm.managementName}</strong>
                <span>{content.currentTerm.mandateLabel}</span>
              </div>
            </aside>
          </section>
        );

      case 'current_board':
        if (!visibleMembers.length) {
          return null;
        }

        return (
          <section key={sectionId} className="container page-section governance-section">
            <div className="governance-section-head">
              <p className="kicker">{content.currentBoardKicker}</p>
              <h2 className={tx('title', 'governance-section-title')}>{content.currentBoardTitle}</h2>
              {hasVisibleValue(content.currentBoardText) && (
                <p className={tx('description', 'governance-section-text')}>{content.currentBoardText}</p>
              )}
            </div>

            <div className="governance-members-grid">
              {visibleMembers.map((member) => (
                <article key={member.id} className="governance-member-card">
                  <div className="governance-member-photo-shell">
                    {hasVisibleValue(member.photoUrl) ? (
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="governance-member-photo"
                      />
                    ) : (
                      <div className="governance-member-photo governance-member-photo-placeholder governance-member-avatar">
                        {getMemberInitials(member.name)}
                      </div>
                    )}
                  </div>

                  <div className="governance-member-copy">
                    <span className="pill">{member.role}</span>
                    <h3>{member.name}</h3>
                    {hasVisibleValue(member.bio) && <p>{member.bio}</p>}
                    {hasVisibleValue(member.contactHref) && hasVisibleValue(member.contactLabel) && (
                      renderLink({
                        href: member.contactHref,
                        className: 'governance-inline-link',
                        children: (
                          <>
                            {member.contactLabel}
                            <ArrowUpRight size={14} />
                          </>
                        ),
                      })
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        );

      case 'roles':
        if (!visibleRoles.length) {
          return null;
        }

        return (
          <section key={sectionId} className="container page-section governance-section">
            <div className="governance-section-head governance-section-head-center">
              <p className="kicker">{content.rolesKicker}</p>
              <h2 className={tx('title', 'governance-section-title')}>{content.rolesTitle}</h2>
              {hasVisibleValue(content.rolesText) && (
                <p className={tx('description', 'governance-section-text')}>{content.rolesText}</p>
              )}
            </div>

            <div className="governance-role-grid">
              {visibleRoles.map((role) => {
                const RoleIcon = getRoleIcon(role.title);
                return (
                  <article key={role.id} className="governance-role-card">
                    <span className="governance-card-icon" aria-hidden="true">
                      <RoleIcon size={16} />
                    </span>
                    <h3>{role.title}</h3>
                    <p>{role.description}</p>
                  </article>
                );
              })}
            </div>
          </section>
        );

      case 'term':
        return (
          <section key={sectionId} className="container page-section governance-section">
            <div className="governance-section-head">
              <p className="kicker">{content.termKicker}</p>
              <h2 className={tx('title', 'governance-section-title')}>{content.termTitle}</h2>
              {hasVisibleValue(content.termText) && (
                <p className={tx('description', 'governance-section-text')}>{content.termText}</p>
              )}
            </div>

            <article className="governance-term-card">
              <div className="governance-term-main">
                <span className="pill pill-accent">{content.currentTerm.managementName}</span>
                <strong>{content.currentTerm.mandateLabel}</strong>
                {hasVisibleValue(content.currentTerm.notes) && <p>{content.currentTerm.notes}</p>}
                {(() => {
                  const pct = getMandateProgress(content.currentTerm.startDate, content.currentTerm.endDate);
                  if (pct === null) return null;
                  return (
                    <div className="governance-term-progress">
                      <p className="governance-term-progress-label">{pct}% do mandato concluido</p>
                      <div className="governance-term-progress-bar-track">
                        <div
                          className="governance-term-progress-bar-fill"
                          style={{ width: `${pct}%` }}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="governance-term-meta">
                <div>
                  <span>Inicio</span>
                  <strong>{formatDateLabel(content.currentTerm.startDate) || 'Nao informado'}</strong>
                </div>
                <div>
                  <span>Fim</span>
                  <strong>{formatDateLabel(content.currentTerm.endDate) || 'Nao informado'}</strong>
                </div>
              </div>
            </article>
          </section>
        );

      case 'commitments':
        if (!visibleCommitments.length) {
          return null;
        }

        return (
          <section key={sectionId} className="container page-section governance-section">
            <div className="governance-section-head governance-section-head-center">
              <p className="kicker">{content.commitmentsKicker}</p>
              <h2 className={tx('title', 'governance-section-title')}>{content.commitmentsTitle}</h2>
              {hasVisibleValue(content.commitmentsText) && (
                <p className={tx('description', 'governance-section-text')}>{content.commitmentsText}</p>
              )}
            </div>

            <div className="governance-commitments-grid">
              {visibleCommitments.map((item, index) => {
                const iconDef = COMMITMENT_ICONS[index % COMMITMENT_ICONS.length];
                const CommitmentIcon = iconDef.Icon;
                return (
                  <article key={item.id} className="governance-commitment-card">
                    <span className="governance-commitment-icon" aria-hidden="true" style={{ color: iconDef.color }}>
                      <CommitmentIcon size={18} />
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                );
              })}
            </div>
          </section>
        );

      case 'documents':
        if (!visibleDocuments.length) {
          return null;
        }

        return (
          <section key={sectionId} className="container page-section governance-section">
            <div className="governance-section-head">
              <p className="kicker">{content.documentsKicker}</p>
              <h2 className={tx('title', 'governance-section-title')}>{content.documentsTitle}</h2>
              {hasVisibleValue(content.documentsText) && (
                <p className={tx('description', 'governance-section-text')}>{content.documentsText}</p>
              )}
            </div>

            <div className="governance-documents-list">
              {visibleDocuments.map((document) => (
                <article key={document.id} className="governance-document-card">
                  <div className="governance-document-copy">
                    <div className="badge-row">
                      {hasVisibleValue(document.category) && <span className="pill">{document.category}</span>}
                      {hasVisibleValue(document.date) && (
                        <span className="pill">{formatDateLabel(document.date)}</span>
                      )}
                    </div>
                    <h3>{document.title}</h3>
                    {hasVisibleValue(document.description) && <p>{document.description}</p>}
                    {hasVisibleValue(document.fileName) && (
                      <span className="governance-document-file">{document.fileName}</span>
                    )}
                  </div>

                  {hasVisibleValue(document.href) &&
                    renderLink({
                      href: document.href,
                      className: 'button button-outline governance-document-link',
                      download: document.href.startsWith('data:') ? document.fileName || document.title : undefined,
                      children: (
                        <>
                          <FileText size={14} />
                          Abrir documento
                        </>
                      ),
                    })}
                </article>
              ))}
            </div>
          </section>
        );

      case 'contact': {
        const contactItems = [
          {
            id: 'email',
            label: 'E-mail institucional',
            value: content.contact.email,
            href: content.contact.email ? `mailto:${content.contact.email}` : '',
            Icon: Mail,
          },
          {
            id: 'instagram',
            label: 'Instagram',
            value: content.contact.instagram,
            href: content.contact.instagram,
            Icon: Instagram,
          },
          {
            id: 'whatsapp',
            label: 'WhatsApp',
            value: content.contact.whatsapp,
            href: content.contact.whatsapp,
            Icon: MessageCircle,
          },
        ].filter((item) => hasVisibleValue(item.value) && hasVisibleValue(item.href));

        return (
          <section key={sectionId} className="container page-section governance-section">
            <div className="governance-section-head">
              <p className="kicker">{content.contactKicker}</p>
              <h2 className={tx('title', 'governance-section-title')}>{content.contactTitle}</h2>
              {hasVisibleValue(content.contactText) && (
                <p className={tx('description', 'governance-section-text')}>{content.contactText}</p>
              )}
            </div>

            <div className="governance-contact-grid">
              {contactItems.map((item) =>
                renderLink({
                  href: item.href,
                  className: `governance-contact-card governance-contact-card-${item.id}`,
                  children: (
                    <>
                      <span className="governance-card-icon" aria-hidden="true">
                        <item.Icon size={16} />
                      </span>
                      <div className="governance-contact-copy">
                        <strong>{item.label}</strong>
                        <span>{item.value}</span>
                      </div>
                      <ArrowUpRight size={14} />
                    </>
                  ),
                })
              )}
            </div>

            {hasVisibleValue(content.contact.closingText) && (
              <p className="governance-contact-note">{content.contact.closingText}</p>
            )}
          </section>
        );
      }

      default:
        return null;
    }
  }

  return <div className="page governance-page">{orderedSections.map(renderSection)}</div>;
}
