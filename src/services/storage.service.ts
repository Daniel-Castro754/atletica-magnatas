/**
 * Camada de serviço para acesso ao localStorage.
 * Centraliza todas as operações de persistência, facilitando
 * a futura migração para uma API real.
 */

export const StorageService = {
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined') return false;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      return;
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.clear();
    } catch {
      return;
    }
  },
};
