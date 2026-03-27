import type { ProductCategory } from '../types/cart';

export const PRODUCT_CATEGORIES = [
  { value: 'all', label: 'Todos' },
  { value: 'camisetas', label: 'Camisetas' },
  { value: 'moletons', label: 'Moletons' },
  { value: 'bones', label: 'Bones' },
  { value: 'canecas', label: 'Canecas' },
  { value: 'acessorios', label: 'Acessorios' },
  { value: 'kits', label: 'Kits' },
] as const;

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  camisetas: 'Camisetas',
  moletons: 'Moletons',
  bones: 'Bones',
  canecas: 'Canecas',
  acessorios: 'Acessorios',
  kits: 'Kits',
};
