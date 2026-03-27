import { Menu, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogo from '../branding/BrandLogo';
import { useBranding } from '../../lib/BrandingContext';
import { hasVisibleText } from '../../lib/siteContent';
import { createTypographyClassName } from '../../lib/typography';
import { useCart } from './AppLayout';

const navLinks = [
  {
    label: 'Inicio',
    path: '/',
    isActive: (pathname: string) => pathname === '/',
  },
  {
    label: 'Loja',
    path: '/loja',
    isActive: (pathname: string) => pathname === '/loja' || pathname.startsWith('/produto/'),
  },
  {
    label: 'Eventos',
    path: '/eventos',
    isActive: (pathname: string) => pathname === '/eventos' || pathname.startsWith('/eventos/'),
  },
  {
    label: 'Institucional',
    path: '/magnatas',
    isActive: (pathname: string) => pathname === '/magnatas',
  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount } = useCart();
  const { resolvedBranding } = useBranding();
  const location = useLocation();
  const cartLabel = cartCount > 99 ? '99+' : String(cartCount);
  const showBrandTag = hasVisibleText(resolvedBranding.shortName);
  const showBrandSubtitle = hasVisibleText(resolvedBranding.subtitle);
  const tx = (slot: keyof typeof resolvedBranding.typography, className: string) =>
    createTypographyClassName(resolvedBranding.typography[slot], className);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [mobileOpen]);

  return (
    <header className="site-header">
      <div className="container">
        <div className="site-nav">
          <Link to="/" className="brand" aria-label="Ir para a pagina inicial">
            <BrandLogo className="brand-image-shell" imageClassName="brand-image" />
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
          </Link>

          <nav className="desktop-nav" aria-label="Navegacao principal">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={
                  link.isActive(location.pathname) ? 'nav-link nav-link-active' : 'nav-link'
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="nav-actions">
            <Link
              to="/carrinho"
              className={
                location.pathname === '/carrinho' ? 'cart-link cart-link-active' : 'cart-link'
              }
              aria-label="Abrir carrinho"
            >
              <ShoppingBag size={16} />
              {cartCount > 0 && <span className="cart-badge">{cartLabel}</span>}
            </Link>

            <button
              type="button"
              className="icon-button menu-toggle"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-nav">
          <div className="container mobile-nav-list">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={
                  link.isActive(location.pathname)
                    ? 'mobile-nav-link mobile-nav-link-active'
                    : 'mobile-nav-link'
                }
              >
                {link.label}
              </Link>
            ))}

            <Link
              to="/carrinho"
              className={
                location.pathname === '/carrinho'
                  ? 'mobile-nav-link mobile-nav-link-active'
                  : 'mobile-nav-link'
              }
            >
              Carrinho {cartCount > 0 ? `(${cartLabel})` : ''}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
