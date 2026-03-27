import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  PencilLine,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import AdminImageGalleryField from '../../components/admin/AdminImageGalleryField';
import AdminImageUploadField from '../../components/admin/AdminImageUploadField';
import {
  getProductStockStatus,
  type ProductAdminStatusFilter,
  type ProductDraft,
  useProductCatalog,
} from '../../lib/ProductCatalogContext';
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS } from '../../lib/productConstants';
import { formatCurrency } from '../../lib/formatCurrency';
import type { Product, ProductCategory } from '../../types/cart';

type ProductFormState = {
  name: string;
  description: string;
  longDescription: string;
  price: string;
  category: ProductCategory;
  stock: string;
  imageUrl: string;
  galleryImages: string[];
  featured: boolean;
  isActive: boolean;
  displayOrder: string;
  badge: string;
  availableSizes: string;
  highlights: string;
};

type ProductCategoryFilter = (typeof PRODUCT_CATEGORIES)[number]['value'];
type ProductsTab = 'products' | 'ordering';
type ProductStatusTone = 'info' | 'success' | 'error';

type ProductStatus = {
  message: string;
  tone: ProductStatusTone;
};

const NEW_PRODUCT_ID = '__new_product__';
const DEFAULT_PRODUCT_IMAGE = 'https://picsum.photos/seed/magnatas-novo-produto/900/700';
const MAIN_IMAGE_UPLOAD_OPTIONS = { maxWidth: 1600, maxHeight: 1600, quality: 0.84 };
const GALLERY_IMAGE_UPLOAD_OPTIONS = { maxWidth: 1400, maxHeight: 1400, quality: 0.82 };

const PRODUCT_STATUS_FILTERS: Array<{ value: ProductAdminStatusFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
  { value: 'in_stock', label: 'Em estoque' },
  { value: 'low_stock', label: 'Estoque baixo' },
  { value: 'out_of_stock', label: 'Sem estoque' },
];

const STOCK_STATUS_LABELS = {
  in_stock: 'Em estoque',
  low_stock: 'Estoque baixo',
  out_of_stock: 'Sem estoque',
} as const;

function createEmptyForm(totalProducts: number): ProductFormState {
  return {
    name: '',
    description: '',
    longDescription: '',
    price: '0',
    category: 'camisetas',
    stock: '0',
    imageUrl: '',
    galleryImages: [],
    featured: false,
    isActive: true,
    displayOrder: String(totalProducts + 1),
    badge: '',
    availableSizes: 'UN',
    highlights: '',
  };
}

function createFormFromProduct(product: Product): ProductFormState {
  return {
    name: product.name,
    description: product.description,
    longDescription: product.longDescription,
    price: String(product.price),
    category: product.category,
    stock: String(product.stock),
    imageUrl: product.imageUrl,
    galleryImages: [...product.galleryImages],
    featured: product.featured,
    isActive: product.isActive,
    displayOrder: String(product.displayOrder),
    badge: product.badge || '',
    availableSizes: product.availableSizes.join(', '),
    highlights: product.highlights.join('\n'),
  };
}

function normalizeGalleryImages(imageUrls: string[], mainImageUrl: string) {
  return [...new Set(imageUrls.map((imageUrl) => imageUrl.trim()).filter(Boolean))].filter(
    (imageUrl) => imageUrl !== mainImageUrl
  );
}

function parseListByComma(value: string, fallback: string[]) {
  const parsedValues = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return parsedValues.length ? parsedValues : fallback;
}

function parseListByLine(value: string, fallback: string[]) {
  const parsedValues = value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  return parsedValues.length ? parsedValues : fallback;
}

function hasSearchMatch(product: Product, searchTerm: string) {
  if (!searchTerm) {
    return true;
  }

  const normalizedSearch = searchTerm.toLowerCase();
  return (
    product.name.toLowerCase().includes(normalizedSearch) ||
    product.description.toLowerCase().includes(normalizedSearch)
  );
}

function hasStatusMatch(product: Product, status: ProductAdminStatusFilter) {
  if (status === 'all') {
    return true;
  }

  if (status === 'active') {
    return product.isActive;
  }

  if (status === 'inactive') {
    return !product.isActive;
  }

  return getProductStockStatus(product.stock) === status;
}

function createDraftFromForm(formState: ProductFormState): ProductDraft {
  const mainImageUrl = formState.imageUrl.trim();

  return {
    name: formState.name.trim() || 'Novo produto',
    description: formState.description.trim(),
    longDescription: formState.longDescription.trim(),
    price: Number(formState.price),
    category: formState.category,
    stock: Number(formState.stock),
    imageUrl: mainImageUrl || DEFAULT_PRODUCT_IMAGE,
    galleryImages: normalizeGalleryImages(formState.galleryImages, mainImageUrl),
    featured: formState.featured,
    isActive: formState.isActive,
    displayOrder: Number(formState.displayOrder),
    badge: formState.badge.trim() || undefined,
    availableSizes: parseListByComma(formState.availableSizes, ['UN']),
    highlights: parseListByLine(formState.highlights, []),
  };
}

function createStatus(message: string, tone: ProductStatusTone = 'info'): ProductStatus {
  return { message, tone };
}

export default function AdminProductsPage() {
  const {
    products,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductActive,
    moveProduct,
    setProductDisplayOrder,
  } = useProductCatalog();

  const [activeTab, setActiveTab] = useState<ProductsTab>('products');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [formState, setFormState] = useState<ProductFormState>(() => createEmptyForm(products.length));
  const [activeCategory, setActiveCategory] = useState<ProductCategoryFilter>('all');
  const [activeStatus, setActiveStatus] = useState<ProductAdminStatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<ProductStatus | null>(null);

  const editingProduct = useMemo(
    () =>
      editingProductId && editingProductId !== NEW_PRODUCT_ID
        ? products.find((product) => product.id === editingProductId) ?? null
        : null,
    [editingProductId, products]
  );

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const categoryMatch = activeCategory === 'all' || product.category === activeCategory;
        return (
          categoryMatch &&
          hasStatusMatch(product, activeStatus) &&
          hasSearchMatch(product, searchTerm)
        );
      }),
    [activeCategory, activeStatus, products, searchTerm]
  );

  useEffect(() => {
    if (!isEditorOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsEditorOpen(false);
        setEditingProductId(null);
      }
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isEditorOpen]);

  useEffect(() => {
    if (!isEditorOpen) {
      return;
    }

    if (editingProductId && editingProductId !== NEW_PRODUCT_ID && !editingProduct) {
      setIsEditorOpen(false);
      setEditingProductId(null);
      setFormState(createEmptyForm(products.length));
    }
  }, [editingProduct, editingProductId, isEditorOpen, products.length]);

  function updateFormField<K extends keyof ProductFormState>(field: K, value: ProductFormState[K]) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function setMainImageUrl(imageUrl: string) {
    setFormState((current) => ({
      ...current,
      imageUrl,
      galleryImages: normalizeGalleryImages(current.galleryImages, imageUrl),
    }));
  }

  function handleUploadStatus(message: string, tone: ProductStatusTone = 'info') {
    setStatus(createStatus(message, tone));
  }

  function openNewProductEditor() {
    setEditingProductId(NEW_PRODUCT_ID);
    setFormState(createEmptyForm(products.length));
    setStatus(null);
    setIsEditorOpen(true);
  }

  function openExistingProductEditor(product: Product) {
    setEditingProductId(product.id);
    setFormState(createFormFromProduct(product));
    setStatus(null);
    setIsEditorOpen(true);
  }

  function closeEditor() {
    setIsEditorOpen(false);
    setEditingProductId(null);
  }

  function handleSaveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft = createDraftFromForm(formState);

    if (editingProductId === NEW_PRODUCT_ID || !editingProductId) {
      const createdProduct = createProduct(draft);
      setStatus(createStatus(`Produto "${createdProduct.name}" criado com sucesso.`, 'success'));
      closeEditor();
      return;
    }

    updateProduct(editingProductId, draft);
    setStatus(createStatus(`Produto "${draft.name}" atualizado com sucesso.`, 'success'));
    closeEditor();
  }

  function handleDeleteProduct(product: Product) {
    const confirmed = window.confirm(`Deseja excluir "${product.name}" do catalogo?`);

    if (!confirmed) {
      return;
    }

    deleteProduct(product.id);

    if (editingProductId === product.id) {
      closeEditor();
    }

    setStatus(createStatus(`Produto "${product.name}" removido.`, 'success'));
  }

  function handleToggleProduct(product: Product) {
    toggleProductActive(product.id);
    setStatus(
      createStatus(
        product.isActive
          ? `Produto "${product.name}" desativado na vitrine.`
          : `Produto "${product.name}" ativado na vitrine.`,
        'success'
      )
    );
  }

  function handleMoveProduct(product: Product, direction: 'up' | 'down') {
    moveProduct(product.id, direction);
    setStatus(
      createStatus(
        direction === 'up'
          ? `Produto "${product.name}" movido para cima.`
          : `Produto "${product.name}" movido para baixo.`,
        'success'
      )
    );
  }

  function handleDisplayOrderBlur(product: Product, nextValue: string) {
    const parsedValue = Number(nextValue);

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      setStatus(createStatus('Informe uma ordem valida maior que zero.', 'error'));
      return;
    }

    setProductDisplayOrder(product.id, parsedValue);
    setStatus(
      createStatus(`Ordem de exibicao de "${product.name}" atualizada.`, 'success')
    );
  }

  return (
    <>
      <section className="admin-page-grid">
        <article className="card admin-page-intro admin-products-page-head">
          <div className="admin-products-page-summary">
            <p className="kicker">Produtos</p>
            <h2 className="section-title">Gerenciar Produtos</h2>
            <p className="muted">
              Cadastre, edite e organize o catalogo da loja com uma visao mais direta.
            </p>
          </div>

          <div className="admin-products-page-actions">
            <span className="pill pill-accent">{products.length} cadastrados</span>
            <button type="button" className="button" onClick={openNewProductEditor}>
              <Plus size={16} />
              Novo produto
            </button>
          </div>
        </article>

        {status && !isEditorOpen && (
          <div className={`status-banner status-banner-${status.tone}`}>{status.message}</div>
        )}

        <article className="card admin-products-shell">
          <div className="admin-products-tabs" role="tablist" aria-label="Abas da area de produtos">
            <button
              type="button"
              role="tab"
              className={
                activeTab === 'products'
                  ? 'admin-products-tab admin-products-tab-active'
                  : 'admin-products-tab'
              }
              aria-selected={activeTab === 'products'}
              onClick={() => setActiveTab('products')}
            >
              Produtos
            </button>
            <button
              type="button"
              role="tab"
              className={
                activeTab === 'ordering'
                  ? 'admin-products-tab admin-products-tab-active'
                  : 'admin-products-tab'
              }
              aria-selected={activeTab === 'ordering'}
              onClick={() => setActiveTab('ordering')}
            >
              Ordem de exibicao
            </button>
          </div>
          {activeTab === 'products' ? (
            <>
              <header className="admin-products-header">
                <div className="admin-products-filters">
                  <label className="field">
                    <span className="field-label">Buscar produto</span>
                    <input
                      className="input"
                      type="search"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Nome ou descricao"
                    />
                  </label>

                  <label className="field">
                    <span className="field-label">Categoria</span>
                    <select
                      className="input"
                      value={activeCategory}
                      onChange={(event) =>
                        setActiveCategory(event.target.value as ProductCategoryFilter)
                      }
                    >
                      {PRODUCT_CATEGORIES.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span className="field-label">Status</span>
                    <select
                      className="input"
                      value={activeStatus}
                      onChange={(event) =>
                        setActiveStatus(event.target.value as ProductAdminStatusFilter)
                      }
                    >
                      {PRODUCT_STATUS_FILTERS.map((statusOption) => (
                        <option key={statusOption.value} value={statusOption.value}>
                          {statusOption.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </header>

              <div className="admin-table-wrap admin-products-table-wrap">
                <table className="admin-table admin-products-table">
                  <thead>
                    <tr>
                      <th>Foto</th>
                      <th>Produto</th>
                      <th>Categoria</th>
                      <th>Preco</th>
                      <th>Estoque</th>
                      <th>Status</th>
                      <th className="admin-products-actions-col">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7}>
                          <div className="admin-empty-state admin-table-empty">
                            <h3 className="section-title">Nenhum produto encontrado.</h3>
                            <p className="muted">
                              Ajuste os filtros ou cadastre um novo item no catalogo.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => {
                        const stockStatus = getProductStockStatus(product.stock);

                        return (
                          <tr key={product.id}>
                            <td>
                              <div className="admin-product-table-photo">
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="admin-product-thumb"
                                />
                              </div>
                            </td>
                            <td>
                              <div className="admin-product-table-main">
                                <strong>{product.name}</strong>
                                <span>{product.availableSizes.join(', ')}</span>
                                {product.badge ? <span>{product.badge}</span> : null}
                              </div>
                            </td>
                            <td>{PRODUCT_CATEGORY_LABELS[product.category]}</td>
                            <td>{formatCurrency(product.price)}</td>
                            <td>
                              <div className="admin-product-table-stock">
                                <strong>{product.stock}</strong>
                                <span className={`pill stock-pill stock-pill-${stockStatus}`}>
                                  {STOCK_STATUS_LABELS[stockStatus]}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="admin-product-table-status">
                                <span className={product.isActive ? 'pill pill-accent' : 'pill'}>
                                  {product.isActive ? 'Ativo' : 'Inativo'}
                                </span>
                                {product.featured ? (
                                  <span className="pill">Destaque</span>
                                ) : null}
                              </div>
                            </td>
                            <td className="admin-products-actions-col">
                              <div className="admin-product-row-actions">
                                <button
                                  type="button"
                                  className="icon-button admin-product-action-button admin-product-action-button-edit"
                                  onClick={() => openExistingProductEditor(product)}
                                  aria-label={`Editar ${product.name}`}
                                  title="Editar produto"
                                >
                                  <PencilLine size={16} />
                                </button>
                                <button
                                  type="button"
                                  className="icon-button admin-product-action-button"
                                  onClick={() => handleToggleProduct(product)}
                                  aria-label={
                                    product.isActive ? 'Desativar produto' : 'Ativar produto'
                                  }
                                  title={product.isActive ? 'Desativar produto' : 'Ativar produto'}
                                >
                                  {product.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                                <button
                                  type="button"
                                  className="icon-button admin-product-action-button admin-product-action-button-danger"
                                  onClick={() => handleDeleteProduct(product)}
                                  aria-label={`Excluir ${product.name}`}
                                  title="Excluir produto"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="admin-products-order-shell">
              <div className="page-header page-header-stack">
                <div>
                  <p className="kicker">Ordem de exibicao</p>
                  <h3 className="section-title">Reordene a vitrine sem misturar com o cadastro.</h3>
                  <p className="muted">
                    Ajuste a sequencia dos produtos aqui. O cadastro e a edicao continuam na aba
                    Produtos.
                  </p>
                </div>
              </div>

              <div className="admin-table-wrap admin-products-table-wrap">
                <table className="admin-table admin-products-table">
                  <thead>
                    <tr>
                      <th>Ordem</th>
                      <th>Produto</th>
                      <th>Categoria</th>
                      <th>Status</th>
                      <th className="admin-products-actions-col">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => (
                      <tr key={product.id}>
                        <td>
                          <input
                            key={`${product.id}-${product.displayOrder}`}
                            className="input admin-order-input"
                            type="number"
                            min="1"
                            defaultValue={product.displayOrder}
                            onBlur={(event) =>
                              handleDisplayOrderBlur(product, event.target.value)
                            }
                          />
                        </td>
                        <td>
                          <div className="admin-product-table-main">
                            <strong>{product.name}</strong>
                            <span>{formatCurrency(product.price)}</span>
                          </div>
                        </td>
                        <td>{PRODUCT_CATEGORY_LABELS[product.category]}</td>
                        <td>
                          <div className="admin-product-table-status">
                            <span className={product.isActive ? 'pill pill-accent' : 'pill'}>
                              {product.isActive ? 'Ativo' : 'Inativo'}
                            </span>
                            {product.featured ? <span className="pill">Destaque</span> : null}
                          </div>
                        </td>
                        <td className="admin-products-actions-col">
                          <div className="admin-product-row-actions">
                            <button
                              type="button"
                              className="icon-button admin-product-action-button"
                              onClick={() => handleMoveProduct(product, 'up')}
                              disabled={index === 0}
                              aria-label={`Mover ${product.name} para cima`}
                              title="Mover para cima"
                            >
                              <ArrowUp size={16} />
                            </button>
                            <button
                              type="button"
                              className="icon-button admin-product-action-button"
                              onClick={() => handleMoveProduct(product, 'down')}
                              disabled={index === products.length - 1}
                              aria-label={`Mover ${product.name} para baixo`}
                              title="Mover para baixo"
                            >
                              <ArrowDown size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </article>
      </section>

      {isEditorOpen && (
        <div className="admin-drawer-backdrop" onClick={closeEditor}>
          <aside
            className="admin-drawer admin-product-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={editingProduct ? 'Editar produto' : 'Novo produto'}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-drawer-head">
              <div>
                <p className="kicker">Produtos</p>
                <h3 className="section-title">
                  {editingProduct ? 'Editar produto' : 'Novo produto'}
                </h3>
                <p className="muted">
                  Edicao operacional para cadastro, estoque, imagens e publicacao na loja.
                </p>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={closeEditor}
                aria-label="Fechar editor de produto"
              >
                <X size={16} />
              </button>
            </div>

            {status && (
              <div className={`status-banner status-banner-${status.tone}`}>{status.message}</div>
            )}

            <form className="admin-product-drawer-form" onSubmit={handleSaveProduct}>
              <div className="admin-product-drawer-grid">
                <section className="card admin-subcard admin-product-form-card">
                  <div className="admin-section-header admin-product-section-head">
                    <div>
                      <p className="kicker">Dados principais</p>
                      <h4 className="section-title">Cadastro do produto</h4>
                    </div>
                  </div>

                  <div className="branding-grid admin-product-form-grid">
                    <label className="field field-full">
                      <span className="field-label">Nome (obrigatorio)</span>
                      <input
                        className="input"
                        type="text"
                        value={formState.name}
                        onChange={(event) => updateFormField('name', event.target.value)}
                        required
                      />
                    </label>

                    <label className="field admin-product-meta-field">
                      <span className="field-label">Categoria</span>
                      <select
                        className="input"
                        value={formState.category}
                        onChange={(event) =>
                          updateFormField('category', event.target.value as ProductCategory)
                        }
                      >
                        {PRODUCT_CATEGORIES.filter((category) => category.value !== 'all').map(
                          (category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          )
                        )}
                      </select>
                    </label>

                    <label className="field admin-product-meta-field">
                      <span className="field-label">Preco (R$)</span>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formState.price}
                        onChange={(event) => updateFormField('price', event.target.value)}
                      />
                    </label>

                    <label className="field admin-product-meta-field">
                      <span className="field-label">Estoque</span>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        step="1"
                        value={formState.stock}
                        onChange={(event) => updateFormField('stock', event.target.value)}
                      />
                    </label>

                    <label className="field admin-product-meta-field">
                      <span className="field-label">Tamanhos disponiveis</span>
                      <input
                        className="input"
                        type="text"
                        value={formState.availableSizes}
                        onChange={(event) =>
                          updateFormField('availableSizes', event.target.value)
                        }
                        placeholder="P, M, G, GG"
                      />
                    </label>

                    <div className="field field-full">
                      <span className="field-label">Status</span>
                      <div className="admin-checkbox-row admin-product-status-row">
                        <label className="admin-check">
                          <input
                            type="checkbox"
                            checked={formState.isActive}
                            onChange={(event) => updateFormField('isActive', event.target.checked)}
                          />
                          <span>Produto ativo na loja</span>
                        </label>

                        <label className="admin-check">
                          <input
                            type="checkbox"
                            checked={formState.featured}
                            onChange={(event) => updateFormField('featured', event.target.checked)}
                          />
                          <span>Produto em destaque</span>
                        </label>
                      </div>
                    </div>

                    <label className="field field-full">
                      <span className="field-label">Descricao curta</span>
                      <textarea
                        className="input textarea admin-product-textarea-short"
                        value={formState.description}
                        onChange={(event) => updateFormField('description', event.target.value)}
                      />
                    </label>

                    <label className="field field-full">
                      <span className="field-label">Descricao detalhada</span>
                      <textarea
                        className="input textarea admin-product-textarea-long"
                        value={formState.longDescription}
                        onChange={(event) =>
                          updateFormField('longDescription', event.target.value)
                        }
                      />
                    </label>
                  </div>
                </section>

                <section className="card admin-subcard admin-product-form-card">
                  <div className="admin-section-header admin-product-section-head">
                    <div>
                      <p className="kicker">Midia e status</p>
                      <h4 className="section-title">Imagens e detalhes</h4>
                    </div>
                  </div>

                  <div className="branding-grid admin-product-form-grid">
                    <AdminImageUploadField
                      label="Imagem principal"
                      value={formState.imageUrl}
                      onChange={setMainImageUrl}
                      previewAlt={formState.name || 'Imagem principal'}
                      helperText="Selecione a imagem principal do produto."
                      fallbackPreviewUrl={DEFAULT_PRODUCT_IMAGE}
                      previewClassName="admin-image-upload-main admin-product-main-upload-image"
                      previewWrapperClassName="admin-image-upload-preview admin-product-main-upload-preview"
                      uploadOptions={MAIN_IMAGE_UPLOAD_OPTIONS}
                      onUploadStatus={handleUploadStatus}
                    />

                    <label className="field">
                      <span className="field-label">Selo opcional</span>
                      <input
                        className="input"
                        type="text"
                        value={formState.badge}
                        onChange={(event) => updateFormField('badge', event.target.value)}
                        placeholder="Ex: Edicao limitada"
                      />
                    </label>

                    <label className="field field-full">
                      <span className="field-label">Destaques do produto (1 por linha)</span>
                      <textarea
                        className="input textarea admin-product-textarea-highlights"
                        value={formState.highlights}
                        onChange={(event) => updateFormField('highlights', event.target.value)}
                      />
                    </label>
                  </div>

                <AdminImageGalleryField
                  label="Fotos adicionais"
                  images={formState.galleryImages}
                  onChange={(images) =>
                    updateFormField(
                      'galleryImages',
                      normalizeGalleryImages(images, formState.imageUrl)
                    )
                  }
                  helperText="Adicione varias fotos e mantenha a ordem da galeria."
                  emptyText="Nenhuma foto adicional cadastrada."
                  addLabel="Adicionar fotos"
                  replaceLabel="Trocar foto"
                  removeLabel="Remover"
                  itemName="Foto adicional"
                  fieldClassName="field field-full admin-product-gallery-field"
                  previewClassName="admin-upload-thumb admin-product-gallery-thumb"
                  uploadOptions={GALLERY_IMAGE_UPLOAD_OPTIONS}
                  onUploadStatus={handleUploadStatus}
                />
                </section>
              </div>

              <div className="admin-drawer-actions">
                <button type="button" className="button button-outline" onClick={closeEditor}>
                  Cancelar
                </button>
                {editingProduct ? (
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => handleDeleteProduct(editingProduct)}
                  >
                    <Trash2 size={16} />
                    Excluir
                  </button>
                ) : null}
                <button type="submit" className="button">
                  {editingProduct ? 'Salvar alteracoes' : 'Criar produto'}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </>
  );
}
