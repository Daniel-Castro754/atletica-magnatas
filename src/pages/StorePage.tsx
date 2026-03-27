import { useDeferredValue, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { useCart } from '../components/layout/AppLayout';
import { useBranding } from '../lib/BrandingContext';
import { formatCurrency } from '../lib/formatCurrency';
import { useProductCatalog } from '../lib/ProductCatalogContext';
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS } from '../lib/productConstants';

type ProductFilter = (typeof PRODUCT_CATEGORIES)[number]['value'];

function normalizeSearchValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState<ProductFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const { publicProducts } = useProductCatalog();
  const { cartCount } = useCart();
  const { resolvedBranding } = useBranding();

  const visibleProducts = useMemo(() => {
    const normalizedSearchQuery = normalizeSearchValue(deferredSearchQuery);

    return publicProducts.filter((product) => {
      const matchesCategory =
        activeCategory === 'all' || product.category === activeCategory;
      if (!matchesCategory) {
        return false;
      }

      if (!normalizedSearchQuery) {
        return true;
      }

      const searchableText = normalizeSearchValue(
        `${product.name} ${product.description} ${PRODUCT_CATEGORY_LABELS[product.category]}`
      );
      return searchableText.includes(normalizedSearchQuery);
    });
  }, [activeCategory, deferredSearchQuery, publicProducts]);

  return (
    <div className="page">
      <PageMeta
        title="Loja"
        description={`Catálogo oficial da ${resolvedBranding.siteName} — camisetas, moletons, bones, canecas, acessórios e kits.`}
        path="/loja"
      />
      <section className="container">
        <div className="page-header store-header">
          <div>
            <p className="kicker">Loja oficial</p>
            <h1 className="section-title">Catalogo oficial da {resolvedBranding.siteName}.</h1>
            <p className="lead">
              Uma vitrine direta para explorar camisetas, moletons, bones, canecas,
              acessorios e kits antes de seguir para o detalhe de cada produto.
            </p>
          </div>
          <div className="cart-meta">
            <span className="pill">{cartCount} item(ns) no carrinho</span>
          </div>
        </div>

        <div className="store-toolbar">
          <div className="filters store-filters" aria-label="Filtrar produtos por categoria">
            {PRODUCT_CATEGORIES.map((category) => (
              <button
                key={category.value}
                type="button"
                className={activeCategory === category.value ? 'chip chip-active' : 'chip'}
                onClick={() => setActiveCategory(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <label className="store-search-field">
            <span className="sr-only">Buscar produto</span>
            <input
              type="search"
              className="store-search-input"
              placeholder="Buscar produto"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>
        </div>

        <div className="store-results-meta">
          <p className="muted">{visibleProducts.length} produto(s) encontrado(s)</p>
        </div>

        <div className="product-grid">
          {!visibleProducts.length && (
            <article className="card empty-state">
              <h2 className="section-title">Nenhum produto encontrado.</h2>
              <p className="muted">
                Ajuste os filtros ou a busca para visualizar os produtos ativos da loja.
              </p>
            </article>
          )}

          {visibleProducts.map((product) => (
            <article key={product.id} className="product-card">
              <Link
                to={`/produto/${product.id}`}
                className="product-card-link"
                aria-label={`Ver detalhes do produto ${product.name}`}
              >
                <div className="product-body store-product-body">
                  <div className="store-product-meta-top">
                    <span className="pill store-category-pill">
                      {PRODUCT_CATEGORY_LABELS[product.category]}
                    </span>
                    {product.stock <= 0 && (
                      <span className="pill store-stock-pill">Esgotado</span>
                    )}
                  </div>

                  <div className="store-product-media-shell">
                    <img
                      className="product-media"
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="product-title-row store-product-title-row">
                    <h2>{product.name}</h2>
                  </div>
                  <strong className="price">{formatCurrency(product.price)}</strong>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
