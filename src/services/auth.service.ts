import { StorageService } from './storage.service';
import type { AuthStatus } from '../lib/AuthContext';

const STORAGE_KEY = 'magnatas_auth_status';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? 'diretoria@magnatas.local';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'Magnatas123';
const BLOCKED_EMAIL = import.meta.env.VITE_BLOCKED_EMAIL ?? 'semcadastro@magnatas.local';

export const AuthService = {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  BLOCKED_EMAIL,

  loadStatus(): AuthStatus {
    const saved = StorageService.get<AuthStatus>(STORAGE_KEY);
    if (saved === 'admin' || saved === 'guest' || saved === 'user_not_registered') {
      return saved;
    }
    return 'guest';
  },

  saveStatus(status: AuthStatus): boolean {
    return StorageService.set(STORAGE_KEY, status);
  },

  validate(
    email: string,
    password: string
  ): 'success' | 'user_not_registered' | 'invalid_credentials' {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (normalizedEmail === BLOCKED_EMAIL) return 'user_not_registered';
    if (normalizedEmail === ADMIN_EMAIL && trimmedPassword === ADMIN_PASSWORD) return 'success';
    return 'invalid_credentials';
  },
};
