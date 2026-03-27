import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { useBranding } from '../../lib/BrandingContext';
import { adminNavigationItems } from '../../lib/adminNavigation';
import { hasVisibleText } from '../../lib/siteContent';
import { createTypographyClassName } from '../../lib/typography';
import BrandLogo from '../branding/BrandLogo';

function isItemActive(itemPath: string, pathname: string) {
  if (itemPath === '/admin') {
    return pathname === '/admin';
  }

  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { signOut } = useAuth();
  const { resolvedBranding } = useBranding();
  const location = useLocation();
  const showBrandSubtitle = hasVisibleText(resolvedBranding.subtitle);
  const tx = (slot: keyof typeof resolvedBranding.typography, className: string) =>
    createTypographyClassName(resolvedBranding.typography[slot], className);

  const currentItem = useMemo(
    () =>
      adminNavigationItems.find((item) => isItemActive(item.path, location.pathname)) ||
      adminNavigationItems[0],
    [location.pathname]
  );

  return (
    <div className={sidebarCollapsed ? 'admin-shell admin-shell-collapsed' : 'admin-shell'}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-head">
          <Link to="/admin" className="admin-brand" aria-label="Ir para o dashboard administrativo">
            <BrandLogo className="admin-brand-logo-shell" imageClassName="admin-brand-logo" />
            <div className="admin-brand-copy">
              <span className="admin-brand-tag">Diretoria</span>
              <strong className={tx('brand_title', 'admin-brand-title')}>
                {resolvedBranding.siteName}
              </strong>
              {showBrandSubtitle && (
                <span className={tx('brand_subtitle', 'admin-brand-subtitle')}>
                  {resolvedBranding.subtitle}
                </span>
              )}
            </div>
          </Link>

          <button
            type="button"
            className="icon-button admin-collapse-button"
            aria-label={sidebarCollapsed ? 'Expandir menu administrativo' : 'Recolher menu administrativo'}
            onClick={() => setSidebarCollapsed((current) => !current)}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <nav className="admin-nav" aria-label="Navegacao administrativa">
          {adminNavigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  isActive ? 'admin-nav-link admin-nav-link-active' : 'admin-nav-link'
                }
              >
                <Icon size={18} />
                <div className="admin-nav-copy">
                  <span>{item.label}</span>
                  <small>{item.description}</small>
                </div>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="button button-outline">
            Voltar ao site
          </Link>
        </div>
      </aside>

      <div className="admin-main-shell">
        <header className="admin-topbar">
          <div>
            <p className="kicker">Area administrativa protegida</p>
            <h1 className="section-title">{currentItem.label}</h1>
            <p className="muted admin-topbar-copy">{currentItem.description}</p>
          </div>

          <button type="button" className="button button-secondary" onClick={signOut}>
            <LogOut size={16} />
            Sair
          </button>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
