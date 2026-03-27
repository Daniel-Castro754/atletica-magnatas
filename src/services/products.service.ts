import { StorageService } from './storage.service';
import type { Product } from '../types/cart';

const STORAGE_KEY = 'magnatas_products';

export const ProductsService = {
  getAll(): Product[] {
    return StorageService.get<Product[]>(STORAGE_KEY) ?? [];
  },

  save(products: Product[]): boolean {
    return StorageService.set(STORAGE_KEY, products);
  },

  getById(id: string): Product | null {
    const products = ProductsService.getAll();
    return products.find((p) => p.id === id) ?? null;
  },
};
