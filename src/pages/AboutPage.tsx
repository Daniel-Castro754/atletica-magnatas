import type { ReactNode } from 'react';
import { ArrowRight, Shield, Star, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/branding/BrandLogo';
import { useBranding } from '../lib/BrandingContext';
import { hasVisibleText } from '../lib/siteContent';
import { useSiteContent } from '../lib/SiteContentContext';

const DEFAULT_PILLARS = [
  {
    title: 'Competitividade',
    description:
      'Levamos a competicao a serio. Cada jogo e uma oportunidade de mostrar a forca da Economia.',
    Icon: Trophy,
  },
  {
    title: 'Integracao',
    description:
      'Unimos alunos de todos os periodos em torno do esporte e da vida universitaria.',
    Icon: Users,
  },
  {
    title: 'Tradicao',
    description:
      'Carregamos o legado de geracoes de economistas que vestiram essa camisa antes de nos.',
    Icon: Shield,
  },
  {
    title: 'Excelencia',
    description:
      'Buscamos sempre o melhor, dentro e fora das quadras. Somos referencia entre as atleticas.',
    Icon: Star,
  },
] as const;

const DEFAULT_MODALITIES = [
  'Futebol Masculino',
  'Futebol Feminino',
  'Futsal Masculino',
  'Futsal Feminino',
  'Volei Masculino',
  'Volei Feminino',
  'Basquete',
  'Handebol',
  'Natacao',
  'Atletismo',
  'Tenis de Mesa',
  'E-Sports',
] as const;

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

export default function AboutPage() {
  const { resolvedBranding } = useBranding();
  const {
    content: { magnatas },
  } = useSiteContent();
  const siteName = resolvedBranding.siteName;
  const heroImageUrl = magnatas.heroImageUrl || resolvedBranding.homeCoverUrl;

  const heroTitle = `Associacao Atletica Academica de Economia ${siteName}`;
  const heroSubtitle =
    'A atletica que representa a Economia com identidade, integracao e presenca universitaria.';
  const whoWeAreParagraphs = [
    `A AAAE ${siteName} nasceu da vontade de unir os estudantes do curso de Economia em torno do esporte, da cultura e da universidade. Fundada por alunos que acreditavam no poder transformador do esporte, nossa atletica cresceu e se tornou referencia dentro da universidade.`,
    'Ao longo dos anos, construimos uma trajetoria de conquistas nos mais diversos campeonatos interatleticas. Nossos atletas carregam no peito o orgulho de representar a Economia, e cada competicao e uma chance de escrever mais um capitulo dessa historia.',
    `Mas a ${siteName} vai alem do esporte. Organizamos festas, eventos academicos, acoes solidarias e momentos de integracao que fortalecem os lacos entre os alunos e criam memorias que duram para toda a vida.`,
  ];
  const modalities = Array.from(
    new Set(
      magnatas.modalities
        .filter((item) => item.visible && hasVisibleText(item.title))
        .map((item) => item.title.trim())
    )
  );
  const visibleModalities = modalities.length > 0 ? modalities : [...DEFAULT_MODALITIES];
  const closingLinks = magnatas.ctas
    .filter((cta) => cta.visible && hasVisibleText(cta.label) && hasVisibleText(cta.href))
    .slice(0, 2);

  return (
    <div className="page page-institutional page-institutional-minimal">
      <section className="institutional-video-hero" aria-label="Hero institucional">
        <video
          className="institutional-video-bg"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          aria-hidden="true"
        >
          <source src="/videos/Video_Mascote2.mp4" type="video/mp4" />
        </video>
        <div className="institutional-video-dimmer" aria-hidden="true" />
        <div className="institutional-video-copy">
          <p className="institutional-video-kicker">Institucional</p>
          <h1 className="institutional-video-title">
            Associacao Atletica Academica de Economia
          </h1>
          <p className="institutional-video-subtitle">
            A atletica que representa a Economia com identidade, integracao e presenca
            universitaria.
          </p>
        </div>
      </section>

      <section className="container institutional-simple-hero">
        <div className="institutional-simple-copy">
          <p className="kicker">Institucional</p>
          <h1 className="institutional-simple-title">{heroTitle}</h1>
          <p className="institutional-simple-subtitle">{heroSubtitle}</p>
        </div>

        <aside className="institutional-simple-visual">
          <div className="institutional-simple-brandmark">
            <BrandLogo
              className="institutional-simple-logo-shell"
              imageClassName="institutional-simple-logo"
            />
            <div className="institutional-simple-brandcopy">
              <strong>{siteName}</strong>
              <span>Economia em movimento dentro e fora da universidade.</span>
            </div>
          </div>

          {hasVisibleText(heroImageUrl) && (
            <div className="institutional-simple-image" aria-hidden="true">
              <img
                className="institutional-simple-image-media"
                src={heroImageUrl}
                alt=""
              />
            </div>
          )}
        </aside>
      </section>

      <section className="container page-section institutional-simple-section">
        <div className="institutional-simple-section-head">
          <p className="kicker">Quem somos</p>
          <h2 className="institutional-simple-section-title">Quem somos</h2>
          <p className="institutional-simple-section-intro">
            A Magnatas representa a Economia por meio do esporte, da convivio estudantil e da
            presenca universitaria.
          </p>
        </div>

        <div className="institutional-simple-prose">
          {whoWeAreParagraphs.map((paragraph) => (
            <p key={paragraph} className="institutional-simple-text">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="container page-section institutional-simple-section">
        <div className="institutional-simple-section-head institutional-simple-section-head-center">
          <p className="kicker">O que nos move</p>
          <h2 className="institutional-simple-section-title">O que nos move</h2>
          <p className="institutional-simple-section-intro">
            Quatro ideias orientam a forma como a {siteName} atua dentro do curso e da
            universidade.
          </p>
        </div>

        <div className="institutional-simple-values">
          {DEFAULT_PILLARS.map((pillar) => (
            <article key={pillar.title} className="institutional-simple-value">
              <span className="institutional-simple-value-icon" aria-hidden="true">
                <pillar.Icon size={16} strokeWidth={1.9} />
              </span>
              <h3 className="institutional-simple-value-title">{pillar.title}</h3>
              <p className="institutional-simple-value-text">{pillar.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container page-section institutional-simple-section">
        <div className="institutional-simple-section-head institutional-simple-section-head-center">
          <p className="kicker">Modalidades</p>
          <h2 className="institutional-simple-section-title">Modalidades</h2>
          <p className="institutional-simple-section-intro">
            A Atletica {siteName} participa de diferentes modalidades esportivas e representa a
            Economia nas principais competicoes universitarias da regiao.
          </p>
        </div>

        <div className="institutional-simple-modalities" aria-label="Modalidades da atletica">
          {visibleModalities.map((modality) => (
            <span key={modality} className="institutional-simple-modality">
              {modality}
            </span>
          ))}
        </div>
      </section>

      <section className="container page-section institutional-simple-section">
        <div className="institutional-simple-closing">
          <p className="kicker">Fechamento institucional</p>
          <h2 className="institutional-simple-section-title">Presenca institucional</h2>
          <p className="institutional-simple-text">
            A {siteName} representa a forca coletiva da Economia dentro e fora da universidade,
            unindo esporte, integracao e identidade estudantil.
          </p>

          {closingLinks.length > 0 && (
            <div className="institutional-simple-links">
              {closingLinks.map((cta) => (
                <ActionLink
                  key={cta.id}
                  href={cta.href}
                  className="button button-outline institutional-simple-link"
                >
                  {cta.label}
                  <ArrowRight size={14} />
                </ActionLink>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
