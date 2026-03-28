import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from 'react';
import { getSupabaseConfig, setSupabaseConfig } from './supabase';
import { PRODUCT_CATEGORIES } from './productConstants';
import { cloneProductList, sampleProducts } from './sampleProducts';
import type { Product, ProductCategory } from '../types/cart';

const PRODUCT_STORAGE_KEY = 'magnatas_product_catalog';
const LOW_STOCK_THRESHOLD = 5;

const PRODUCT_CATEGORY_VALUES = PRODUCT_CATEGORIES.filter(
  (category) => category.value !== 'all'
).map((category) => category.value as ProductCategory);

const PRODUCT_CATEGORY_SET = new Set<ProductCategory>(PRODUCT_CATEGORY_VALUES);
const PRODUCT_CATEGORY_ALIAS_MAP: Record<string, ProductCategory> = {
  camiseta: 'camisetas',
  camisetas: 'camisetas',
  regatas: 'camisetas',
  regata: 'camisetas',
  moletom: 'moletons',
  moletons: 'moletons',
  bone: 'bones',
  bones: 'bones',
  caneca: 'canecas',
  canecas: 'canecas',
  acessorio: 'acessorios',
  acessorios: 'acessorios',
  kit: 'kits',
  kits: 'kits',
};

export type ProductStockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export type ProductAdminStatusFilter =
  | 'all'
  | 'active'
  | 'inactive'
  | 'in_stock'
  | 'low_stock'
  | 'out_of_stock';

export type ProductDraft = {
  name: string;
  description: string;
  longDescription: string;
  price: number;
  category: ProductCategory;
  stock: number;
  imageUrl: string;
  galleryImages: string[];
  availableSizes: string[];
  badge?: string;
  featured: boolean;
  isActive: boolean;
  displayOrder: number;
  highlights: string[];
};

type ProductCatalogContextValue = {
  products: Product[];
  publicProducts: Product[];
  createProduct: (draft: ProductDraft) => Product;
  updateProduct: (productId: string, patch: Partial<ProductDraft>) => void;
  deleteProduct: (productId: string) => void;
  toggleProductActive: (productId: string) => void;
  moveProduct: (productId: string, direction: 'up' | 'down') => void;
  setProductDisplayOrder: (productId: string, displayOrder: number) => void;
  getProductById: (productId: string) => Product | null;
  resetProducts: () => void;
};

const ProductCatalogContext = createContext<ProductCatalogContextValue | null>(null);

function createSlug(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function sanitizeString(value: unknown, fallback: string, allowEmpty = false) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue && allowEmpty) {
    return '';
  }

  return trimmedValue || fallback;
}

function sanitizeOptionalString(value: unknown) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue || undefined;
}

function sanitizeBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function sanitizePrice(value: unknown, fallback: number) {
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.max(0, Math.round(parsedValue * 100) / 100);
}

function sanitizeInteger(value: unknown, fallback: number, min = 0) {
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.max(min, Math.floor(parsedValue));
}

function sanitizeCategory(value: unknown, fallback: ProductCategory) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalizedValue = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  const aliasedCategory = PRODUCT_CATEGORY_ALIAS_MAP[normalizedValue];
  if (aliasedCategory && PRODUCT_CATEGORY_SET.has(aliasedCategory)) {
    return aliasedCategory;
  }

  if (PRODUCT_CATEGORY_SET.has(normalizedValue as ProductCategory)) {
    return normalizedValue as ProductCategory;
  }

  return fallback;
}

function sanitizeStringList(
  value: unknown,
  fallback: string[],
  options: { allowEmpty?: boolean; minItems?: number; unique?: boolean } = {}
) {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  const result = value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);

  if (!result.length && options.allowEmpty) {
    return [];
  }

  if (!result.length) {
    return [...fallback];
  }

  const deduped = options.unique ? [...new Set(result)] : result;

  if (options.minItems && deduped.length < options.minItems) {
    return [...fallback];
  }

  return deduped;
}

function createFallbackProduct(index: number): Product {
  return {
    id: `produto-${index + 1}`,
    name: `Produto ${index + 1}`,
    description: 'Descricao do produto',
    longDescription: 'Descricao detalhada do produto',
    highlights: ['Detalhe principal do produto'],
    price: 0,
    category: 'acessorios',
    imageUrl: 'https://picsum.photos/seed/magnatas-default-product/900/700',
    galleryImages: [],
    availableSizes: ['UN'],
    isActive: true,
    stock: 0,
    featured: false,
    displayOrder: index + 1,
  };
}

function normalizeProduct(input: unknown, fallback: Product, index: number): Product {
  const raw = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const description = sanitizeString(raw.description, fallback.description, true);
  const longDescription = sanitizeString(
    raw.longDescription,
    fallback.longDescription || description,
    true
  );
  const imageUrl = sanitizeString(raw.imageUrl, fallback.imageUrl);
  const hasBadgeInput = Object.prototype.hasOwnProperty.call(raw, 'badge');
  const badge = hasBadgeInput ? sanitizeOptionalString(raw.badge) : fallback.badge;
  const galleryImages = sanitizeStringList(raw.galleryImages, fallback.galleryImages, {
    allowEmpty: true,
    unique: true,
  }).filter((url) => url !== imageUrl);

  const idSource = sanitizeString(raw.id, fallback.id || `produto-${index + 1}`);
  const safeId = createSlug(idSource) || fallback.id || `produto-${index + 1}`;

  return {
    id: safeId,
    name: sanitizeString(raw.name, fallback.name),
    description,
    longDescription,
    highlights: sanitizeStringList(raw.highlights, fallback.highlights, {
      allowEmpty: true,
      unique: true,
    }),
    price: sanitizePrice(raw.price, fallback.price),
    category: sanitizeCategory(raw.category, fallback.category),
    imageUrl,
    galleryImages,
    availableSizes: sanitizeStringList(raw.availableSizes, fallback.availableSizes, {
      unique: true,
      minItems: 1,
    }),
    badge,
    isActive: sanitizeBoolean(raw.isActive, fallback.isActive),
    stock: sanitizeInteger(raw.stock, fallback.stock, 0),
    featured: sanitizeBoolean(raw.featured, fallback.featured),
    displayOrder: sanitizeInteger(raw.displayOrder, fallback.displayOrder || index + 1, 1),
  };
}

export function sortProducts(products: Product[]) {
  return [...products].sort((a, b) => {
    if (a.displayOrder === b.displayOrder) {
      return a.name.localeCompare(b.name, 'pt-BR');
    }

    return a.displayOrder - b.displayOrder;
  });
}

function normalizeProductOrder(products: Product[]) {
  return sortProducts(products).map((product, index) => ({
    ...product,
    displayOrder: index + 1,
  }));
}

function getDefaultProducts() {
  return normalizeProductOrder(cloneProductList(sampleProducts));
}

function persistProducts(products: Product[]) {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
    } catch {
      return;
    }
  }
  setSupabaseConfig(PRODUCT_STORAGE_KEY, products);
}

function loadProducts() {
  const defaults = getDefaultProducts();

  if (typeof window === 'undefined') {
    return defaults;
  }

  try {
    const savedProducts = window.localStorage.getItem(PRODUCT_STORAGE_KEY);
    if (!savedProducts) {
      return defaults;
    }

    const parsedProducts = JSON.parse(savedProducts);
    if (!Array.isArray(parsedProducts)) {
      return defaults;
    }

    const normalized = parsedProducts.map((item, index) => {
      const fallback = defaults[index] || createFallbackProduct(index);
      return normalizeProduct(item, fallback, index);
    });

    return normalizeProductOrder(normalized);
  } catch {
    return defaults;
  }
}

function generateUniqueId(baseName: string, products: Product[]) {
  const slugBase = createSlug(baseName) || 'produto';
  const existingIds = new Set(products.map((product) => product.id));

  if (!existingIds.has(slugBase)) {
    return slugBase;
  }

  let counter = 2;
  let candidate = `${slugBase}-${counter}`;
  while (existingIds.has(candidate)) {
    counter += 1;
    candidate = `${slugBase}-${counter}`;
  }

  return candidate;
}

function createProductFromDraft(draft: ProductDraft, products: Product[]) {
  const displayOrder = sanitizeInteger(draft.displayOrder, products.length + 1, 1);
  const productId = generateUniqueId(draft.name, products);
  const fallback = createFallbackProduct(displayOrder - 1);

  return normalizeProduct(
    {
      ...draft,
      id: productId,
      displayOrder,
    },
    fallback,
    displayOrder - 1
  );
}

function patchProduct(product: Product, patch: Partial<ProductDraft>, index: number) {
  return normalizeProduct(
    {
      ...product,
      ...patch,
    },
    product,
    index
  );
}

function updateAndPersist(
  setter: Dispatch<SetStateAction<Product[]>>,
  updater: (current: Product[]) => Product[]
) {
  setter((currentProducts) => {
    const nextProducts = normalizeProductOrder(updater(currentProducts));
    persistProducts(nextProducts);
    return nextProducts;
  });
}

export function getProductStockStatus(stock: number): ProductStockStatus {
  if (stock <= 0) {
    return 'out_of_stock';
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return 'low_stock';
  }

  return 'in_stock';
}

export function ProductCatalogProvider({ children }: PropsWithChildren) {
  const [products, setProducts] = useState<Product[]>(loadProducts);

  useEffect(() => {
    getSupabaseConfig<Product[]>(PRODUCT_STORAGE_KEY).then((cloudData) => {
      if (!cloudData || !Array.isArray(cloudData)) return;
      const defaults = getDefaultProducts();
      const normalized = normalizeProductOrder(
        cloudData.map((item, index) => {
          const fallback = defaults[index] || createFallbackProduct(index);
          return normalizeProduct(item, fallback, index);
        })
      );
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(normalized));
        }
      } catch {}
      setProducts(normalized);
    });
  }, []);

  function createProduct(draft: ProductDraft) {
    const newProduct = createProductFromDraft(draft, products);

    updateAndPersist(setProducts, (currentProducts) => [...currentProducts, newProduct]);
    return newProduct;
  }

  function updateProduct(productId: string, patch: Partial<ProductDraft>) {
    updateAndPersist(setProducts, (currentProducts) =>
      currentProducts.map((product, index) =>
        product.id === productId ? patchProduct(product, patch, index) : product
      )
    );
  }

  function deleteProduct(productId: string) {
    updateAndPersist(setProducts, (currentProducts) =>
      currentProducts.filter((product) => product.id !== productId)
    );
  }

  function toggleProductActive(productId: string) {
    updateAndPersist(setProducts, (currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId ? { ...product, isActive: !product.isActive } : product
      )
    );
  }

  function moveProduct(productId: string, direction: 'up' | 'down') {
    updateAndPersist(setProducts, (currentProducts) => {
      const orderedProducts = sortProducts(currentProducts);
      const currentIndex = orderedProducts.findIndex((product) => product.id === productId);

      if (currentIndex === -1) {
        return currentProducts;
      }

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= orderedProducts.length) {
        return currentProducts;
      }

      const reordered = [...orderedProducts];
      const [movedProduct] = reordered.splice(currentIndex, 1);
      reordered.splice(targetIndex, 0, movedProduct);
      return reordered;
    });
  }

  function setProductDisplayOrder(productId: string, displayOrder: number) {
    updateAndPersist(setProducts, (currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              displayOrder: sanitizeInteger(displayOrder, product.displayOrder, 1),
            }
          : product
      )
    );
  }

  function getProductById(productId: string) {
    return products.find((product) => product.id === productId) ?? null;
  }

  function resetProducts() {
    const defaults = getDefaultProducts();
    setProducts(defaults);
    persistProducts(defaults);
  }

  const publicProducts = useMemo(
    () =>
      sortProducts(products).filter((product) => product.isActive),
    [products]
  );

  const value = useMemo(
    () => ({
      products: sortProducts(products),
      publicProducts,
      createProduct,
      updateProduct,
      deleteProduct,
      toggleProductActive,
      moveProduct,
      setProductDisplayOrder,
      getProductById,
      resetProducts,
    }),
    [products, publicProducts]
  );

  return <ProductCatalogContext.Provider value={value}>{children}</ProductCatalogContext.Provider>;
}

export function ProductCatalogPreviewProvider({
  products,
  children,
}: PropsWithChildren<{ products: Product[] }>) {
  const value = useMemo(() => {
    const orderedProducts = sortProducts(products);
    const publicProducts = orderedProducts.filter((product) => product.isActive);

    return {
      products: orderedProducts,
      publicProducts,
      createProduct: (draft: ProductDraft) => createProductFromDraft(draft, orderedProducts),
      updateProduct: () => undefined,
      deleteProduct: () => undefined,
      toggleProductActive: () => undefined,
      moveProduct: () => undefined,
      setProductDisplayOrder: () => undefined,
      getProductById: (productId: string) =>
        orderedProducts.find((product) => product.id === productId) ?? null,
      resetProducts: () => undefined,
    } satisfies ProductCatalogContextValue;
  }, [products]);

  return <ProductCatalogContext.Provider value={value}>{children}</ProductCatalogContext.Provider>;
}

export function useProductCatalog() {
  const context = useContext(ProductCatalogContext);

  if (!context) {
    throw new Error('useProductCatalog deve ser usado dentro de ProductCatalogProvider');
  }

  return context;
}
