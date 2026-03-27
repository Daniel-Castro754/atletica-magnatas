import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { PageMeta } from '../components/PageMeta';
import { useCart } from '../components/layout/AppLayout';
import { useAnalytics } from '../lib/AnalyticsContext';
import { useBranding } from '../lib/BrandingContext';
import { formatCurrency } from '../lib/formatCurrency';
import { getProductStockStatus, useProductCatalog } from '../lib/ProductCatalogContext';
import { PRODUCT_CATEGORY_LABELS } from '../lib/productConstants';
import { hasVisibleText } from '../lib/siteContent';

const STOCK_STATUS_LABELS = {
  in_stock: 'Em estoque',
  low_stock: 'Estoque baixo',
  out_of_stock: 'Sem estoque',
} as const;

export default function ProductPage() {
  const { id } = useParams();
  const location = useLocation();
  const { getProductById, publicProducts } = useProductCatalog();
  const product = id ? getProductById(id) : null;
  const availableProduct = product?.isActive ? product : null;
  const { addToCart } = useCart();
  const { trackProductView } = useAnalytics();
  const { resolvedBranding } = useBranding();
  const [selectedSize, setSelectedSize] = useState('UN');
  const [selectedImage, setSelectedImage] = useState('');

  const productGallery = useMemo(() => {
    if (!availableProduct) {
      return [];
    }

    return [availableProduct.imageUrl, ...availableProduct.galleryImages].filter(
      (url, index, self) => Boolean(url) && self.indexOf(url) === index
    );
  }, [availableProduct]);

  useEffect(() => {
    setSelectedSize(availableProduct?.availableSizes[0] || 'UN');
    setSelectedImage(productGallery[0] || '');
  }, [availableProduct, productGallery]);

  useEffect(() => {
    if (!availableProduct) {
      return;
    }

    trackProductView(availableProduct, location.pathname);
  }, [availableProduct?.id, location.pathname]);

  if (!availableProduct) {
    return (
      <div className="page">
        <section className="container narrow">
          <div className="card empty-state">
            <p className="kicker">Produto nao encontrado</p>
            <h1 className="section-title">Esse item nao esta mais disponivel na loja.</h1>
            <p className="lead">
              Volte para a loja oficial da {resolvedBranding.siteName} para conferir os produtos ativos.
            </p>
            <Link to="/loja" className="button">
              Ir para a loja
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const relatedProducts = publicProducts
    .filter((item) => item.id !== availableProduct.id)
    .slice(0, 3);
  const stockStatus = getProductStockStatus(availableProduct.stock);
  const canBuy = availableProduct.stock > 0;

  return (
    <div className="page">
      <PageMeta
        title={availableProduct.name}
        description={availableProduct.description || `${availableProduct.name} — ${PRODUCT_CATEGORY_LABELS[availableProduct.category]} da loja oficial ${resolvedBranding.siteName}.`}
        imageUrl={availableProduct.imageUrl || undefined}
        path={`/produto/${availableProduct.id}`}
      />
      <section className="container">
        <Breadcrumb
          items={[
            { label: 'Loja', to: '/loja' },
            { label: availableProduct.name },
          ]}
        />
      </section>
      <section className="container product-detail">
        <div className="card product-gallery-card">
          <div className="product-gallery-stage">
            <div className="product-gallery-frame">
              <img
                className="product-gallery-main-image"
                src={selectedImage || availableProduct.imageUrl}
                alt={availableProduct.name}
                decoding="async"
              />
            </div>
          </div>

          {productGallery.length > 1 && (
            <div className="product-thumb-strip">
              {productGallery.map((imageUrl) => (
                <button
                  key={imageUrl}
                  type="button"
                  className={
                    selectedImage === imageUrl
                      ? 'product-thumb-button product-thumb-button-active'
                      : 'product-thumb-button'
                  }
                  onClick={() => setSelectedImage(imageUrl)}
                  aria-pressed={selectedImage === imageUrl}
                >
                  <img
                    className="product-thumb-image"
                    src={imageUrl}
                    alt={`${availableProduct.name} preview`}
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card product-summary">
          <div className="badge-row">
            <span className="pill">{PRODUCT_CATEGORY_LABELS[availableProduct.category]}</span>
            {availableProduct.featured && <span className="pill pill-accent">Destaque</span>}
            {availableProduct.badge && <span className="pill">{availableProduct.badge}</span>}
            <span className={`pill stock-pill stock-pill-${stockStatus}`}>
              {STOCK_STATUS_LABELS[stockStatus]}
            </span>
          </div>

          <div>
            <p className="kicker">Loja oficial {resolvedBranding.siteName}</p>
            <h1 className="section-title">{availableProduct.name}</h1>
          </div>

          {hasVisibleText(availableProduct.longDescription) && (
            <p className="lead">{availableProduct.longDescription}</p>
          )}
          <strong className="detail-price">{formatCurrency(availableProduct.price)}</strong>

          <div className="size-list" aria-label={`Escolha de tamanho para ${availableProduct.name}`}>
            {availableProduct.availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                className={
                  selectedSize === size ? 'size-chip size-chip-active' : 'size-chip'
                }
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>

          {availableProduct.highlights.length > 0 && (
            <ul className="feature-list">
              {availableProduct.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          )}

          <div className="button-row">
            <button
              type="button"
              className="button"
              disabled={!canBuy}
              onClick={() => addToCart(availableProduct, selectedSize)}
            >
              {canBuy ? 'Adicionar ao carrinho' : 'Sem estoque no momento'}
            </button>
            <Link to="/loja" className="button button-outline">
              Voltar para a loja
            </Link>
          </div>
        </div>
      </section>

      <section className="container page-section">
        <div className="page-header">
          <div>
            <p className="kicker">Mais da colecao</p>
            <h2 className="section-title">Outros produtos da identidade {resolvedBranding.siteName}.</h2>
          </div>
          <Link to="/loja" className="button button-outline">
            Ver catalogo completo
          </Link>
        </div>

        <div className="preview-grid">
          {relatedProducts.map((item) => (
            <article key={item.id} className="preview-card">
              <img
                className="product-media"
                src={item.imageUrl}
                alt={item.name}
                loading="lazy"
                decoding="async"
              />
              <div className="product-body">
                <div className="product-title-row">
                  <h3>{item.name}</h3>
                  <span className="pill">{PRODUCT_CATEGORY_LABELS[item.category]}</span>
                </div>
                {hasVisibleText(item.description) && (
                  <p className="muted">{item.description}</p>
                )}
                <strong className="price">{formatCurrency(item.price)}</strong>
                <div className="product-actions">
                  <Link to={`/produto/${item.id}`} className="button button-outline">
                    Ver produto
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
