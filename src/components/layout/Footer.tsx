import { CalendarDays, Instagram, Mail, Shield, ShoppingBag, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBranding } from '../../lib/BrandingContext';
import { hasVisibleText } from '../../lib/siteContent';
import { createTypographyClassName } from '../../lib/typography';
import BrandLogo from '../branding/BrandLogo';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { resolvedBranding } = useBranding();
  const showBrandTag = hasVisibleText(resolvedBranding.shortName);
  const showBrandSubtitle = hasVisibleText(resolvedBranding.subtitle);
  const tx = (slot: keyof typeof resolvedBranding.typography, className: string) =>
    createTypographyClassName(resolvedBranding.typography[slot], className);

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand footer-brand">
            <BrandLogo className="brand-image-shell footer-brand-image-shell" imageClassName="brand-image" />
            <div className="brand-copy">
              {showBrandTag && (
                <span className={tx('brand_tag', 'brand-tag')}>{resolvedBranding.shortName}</span>
              )}
              <span className={tx('brand_title', 'brand-title')}>{resolvedBranding.siteName}</span>
              {showBrandSubtitle && (
                <span className={tx('brand_subtitle', 'brand-subtitle')}>
                  {resolvedBranding.subtitle}
                </span>
              )}
            </div>
          </div>

          <p className="footer-copy">
            {resolvedBranding.siteName} representa Ciencias Economicas com presenca em jogos,
            no campus e nas acoes que fortalecem a turma ao longo do ano.
          </p>
        </div>

        <div>
          <h2 className="footer-heading">Navegacao</h2>
          <div className="footer-links">
            <Link to="/" className="footer-link">
              <Users size={14} />
              Inicio
            </Link>
            <Link to="/loja" className="footer-link">
              <ShoppingBag size={14} />
              Loja
            </Link>
            <Link to="/magnatas" className="footer-link">
              <Users size={14} />
              Institucional
            </Link>
            <Link to="/diretoria" className="footer-link">
              <Shield size={14} />
              Diretoria e Transparencia
            </Link>
            <Link to="/eventos" className="footer-link">
              <CalendarDays size={14} />
              Eventos
            </Link>
            <Link to="/carrinho" className="footer-link">
              <ShoppingBag size={14} />
              Carrinho
            </Link>
            <Link to="/admin/login" className="footer-link">
              <Shield size={14} />
              Painel
            </Link>
          </div>
        </div>

        <div>
          <h2 className="footer-heading">Contato</h2>
          <div className="footer-links">
            <a
              className="footer-link"
              href="https://instagram.com/atletica.magnatas"
              target="_blank"
              rel="noreferrer"
            >
              <Instagram size={14} />
              @atletica.magnatas
            </a>
            <a className="footer-link" href="mailto:atleticaeconomiaunesc@gmail.com">
              <Mail size={14} />
              atleticaeconomiaunesc@gmail.com
            </a>
          </div>
          <p className="footer-note">
            A colecao oficial ajuda a sustentar a presenca, a identidade e a rotina da
            comunidade {resolvedBranding.siteName}.
          </p>
        </div>
      </div>

      <div className="container footer-bottom">
        &copy; {currentYear} {resolvedBranding.siteName}
        {showBrandSubtitle ? ` | ${resolvedBranding.subtitle}` : ''}
      </div>
    </footer>
  );
}
