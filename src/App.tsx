import { Suspense, lazy, type ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { AnalyticsProvider } from './lib/AnalyticsContext';
import { AuthProvider } from './lib/AuthContext';
import { BrandingProvider } from './lib/BrandingContext';
import { EventsProvider } from './lib/EventsContext';
import { GovernanceProvider } from './lib/GovernanceContext';
import { OrdersProvider } from './lib/OrdersContext';
import { ProductCatalogProvider } from './lib/ProductCatalogContext';
import { SiteContentProvider } from './lib/SiteContentContext';
import HomePage from './pages/HomePage';
import ProtectedAdminRoute from './routes/ProtectedAdminRoute';

const AboutPage = lazy(() => import('./pages/AboutPage'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const GovernancePage = lazy(() => import('./pages/GovernancePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const StorePage = lazy(() => import('./pages/StorePage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminAppearancePage = lazy(() => import('./pages/admin/AdminAppearancePage'));
const AdminBrandingPreviewPage = lazy(() => import('./pages/admin/AdminBrandingPreviewPage'));
const AdminEventsPage = lazy(() => import('./pages/admin/AdminEventsPage'));
const AdminEventsPreviewPage = lazy(() => import('./pages/admin/AdminEventsPreviewPage'));
const AdminGovernancePage = lazy(() => import('./pages/admin/AdminGovernancePage'));
const AdminHomeContentPage = lazy(() => import('./pages/admin/AdminHomeContentPage'));
const AdminHomePreviewPage = lazy(() => import('./pages/admin/AdminHomePreviewPage'));
const AdminMagnatasContentPage = lazy(() => import('./pages/admin/AdminMagnatasContentPage'));
const AdminMagnatasPreviewPage = lazy(() => import('./pages/admin/AdminMagnatasPreviewPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));

function RouteLoadingFallback() {
  return (
    <div className="page">
      <section className="container narrow">
        <div className="card empty-state">
          <p className="kicker">Carregando</p>
          <p className="lead">Preparando o conteudo desta rota.</p>
        </div>
      </section>
    </div>
  );
}

function withRouteSuspense(content: ReactNode) {
  return <Suspense fallback={<RouteLoadingFallback />}>{content}</Suspense>;
}

export default function App() {
  return (
    <BrandingProvider>
      <SiteContentProvider>
        <GovernanceProvider>
          <EventsProvider>
            <ProductCatalogProvider>
              <AnalyticsProvider>
                <OrdersProvider>
                  <AuthProvider>
                    <Routes>
                      <Route element={<AppLayout />}>
                        <Route index element={<HomePage />} />
                        <Route path="/loja" element={withRouteSuspense(<StorePage />)} />
                        <Route path="/produto/:id" element={withRouteSuspense(<ProductPage />)} />
                        <Route path="/magnatas" element={withRouteSuspense(<AboutPage />)} />
                        <Route path="/diretoria" element={withRouteSuspense(<GovernancePage />)} />
                        <Route path="/eventos" element={withRouteSuspense(<EventsPage />)} />
                        <Route
                          path="/eventos/:id"
                          element={withRouteSuspense(<EventDetailPage />)}
                        />
                        <Route path="/carrinho" element={withRouteSuspense(<CartPage />)} />
                      </Route>

                      <Route path="/admin/login" element={withRouteSuspense(<LoginPage />)} />

                      <Route element={<ProtectedAdminRoute />}>
                        <Route
                          path="/admin/preview/home"
                          element={withRouteSuspense(<AdminHomePreviewPage />)}
                        />
                        <Route
                          path="/admin/preview/magnatas"
                          element={withRouteSuspense(<AdminMagnatasPreviewPage />)}
                        />
                        <Route
                          path="/admin/preview/branding"
                          element={withRouteSuspense(<AdminBrandingPreviewPage />)}
                        />
                        <Route
                          path="/admin/preview/eventos"
                          element={withRouteSuspense(<AdminEventsPreviewPage />)}
                        />

                        <Route path="/admin" element={withRouteSuspense(<AdminLayout />)}>
                          <Route index element={withRouteSuspense(<AdminPage />)} />
                          <Route
                            path="home"
                            element={withRouteSuspense(<AdminHomeContentPage />)}
                          />
                          <Route
                            path="produtos"
                            element={withRouteSuspense(<AdminProductsPage />)}
                          />
                          <Route path="eventos" element={withRouteSuspense(<AdminEventsPage />)} />
                          <Route
                            path="magnatas"
                            element={withRouteSuspense(<AdminMagnatasContentPage />)}
                          />
                          <Route
                            path="diretoria"
                            element={withRouteSuspense(<AdminGovernancePage />)}
                          />
                          <Route
                            path="aparencia"
                            element={withRouteSuspense(<AdminAppearancePage />)}
                          />
                          <Route
                            path="analytics"
                            element={withRouteSuspense(<AdminAnalyticsPage />)}
                          />
                          <Route path="pedidos" element={withRouteSuspense(<AdminOrdersPage />)} />
                          <Route
                            path="configuracoes"
                            element={withRouteSuspense(<AdminSettingsPage />)}
                          />
                        </Route>
                      </Route>

                      <Route path="*" element={withRouteSuspense(<NotFoundPage />)} />
                    </Routes>
                  </AuthProvider>
                </OrdersProvider>
              </AnalyticsProvider>
            </ProductCatalogProvider>
          </EventsProvider>
        </GovernanceProvider>
      </SiteContentProvider>
    </BrandingProvider>
  );
}
