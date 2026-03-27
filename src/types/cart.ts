export type ProductCategory =
  | 'camisetas'
  | 'moletons'
  | 'bones'
  | 'canecas'
  | 'acessorios'
  | 'kits';

export type Product = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  highlights: string[];
  price: number;
  category: ProductCategory;
  imageUrl: string;
  galleryImages: string[];
  availableSizes: string[];
  badge?: string;
  isActive: boolean;
  stock: number;
  featured: boolean;
  displayOrder: number;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  size: string;
  quantity: number;
};
