import { StorageService } from './storage.service';
import type { SubmittedOrder } from '../types/order';

const STORAGE_KEY = 'magnatas_orders';

export const OrdersService = {
  getAll(): SubmittedOrder[] {
    return StorageService.get<SubmittedOrder[]>(STORAGE_KEY) ?? [];
  },

  save(orders: SubmittedOrder[]): boolean {
    return StorageService.set(STORAGE_KEY, orders);
  },

  getById(id: string): SubmittedOrder | null {
    const orders = OrdersService.getAll();
    return orders.find((o) => o.id === id) ?? null;
  },
};
