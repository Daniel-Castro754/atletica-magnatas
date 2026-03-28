/**
 * @dev-only
 *
 * Utilitário de autenticação para DESENVOLVIMENTO e TESTES.
 * NÃO é usado pelo fluxo de autenticação real (AuthContext) quando Supabase está configurado.
 *
 * Em produção:
 *   - O AuthContext usa supabase.auth.signInWithPassword() para autenticar usuários reais.
 *   - Este serviço não é importado nem executado em nenhuma rota de produção.
 *
 * Use apenas para:
 *   - Testes unitários de lógica de validação de credenciais locais
 *   - Prototipação em ambiente local sem Supabase configurado
 *
 * Não referencie AuthService.validate() em código de produção.
 * Não armazene ADMIN_PASSWORD em variáveis de ambiente de produção.
 */

import { StorageService } from './storage.service';
import type { AuthStatus } from '../lib/AuthContext';

const STORAGE_KEY = 'magnatas_auth_status';

/**
 * Credencial de e-mail administrativo (modo dev).
 * Em produção, o e-mail é gerenciado no painel do Supabase Auth.
 */
const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined) ?? 'diretoria@magnatas.local';

/**
 * Senha de dev (nunca definir em produção).
 * Em produção, a senha é gerenciada exclusivamente pelo Supabase Auth.
 */
const DEV_ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? 'Magnatas123';

const BLOCKED_EMAIL = (import.meta.env.VITE_BLOCKED_EMAIL as string | undefined) ?? 'semcadastro@magnatas.local';

export const AuthService = {
  /** E-mail admin do modo dev. Equivalente ao usuário criado no Supabase Auth em produção. */
  ADMIN_EMAIL,
  /**
   * Senha do modo dev — exposta aqui apenas para testes unitários.
   * Nunca use AuthService.DEV_ADMIN_PASSWORD em fluxos de autenticação de produção.
   */
  DEV_ADMIN_PASSWORD,
  BLOCKED_EMAIL,

  /**
   * Valida credenciais no modo dev (sem Supabase).
   * Em produção, a validação é feita pelo servidor Supabase Auth.
   */
  validate(
    email: string,
    password: string
  ): 'success' | 'user_not_registered' | 'invalid_credentials' {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (normalizedEmail === BLOCKED_EMAIL) return 'user_not_registered';
    if (normalizedEmail === ADMIN_EMAIL && trimmedPassword === DEV_ADMIN_PASSWORD) return 'success';
    return 'invalid_credentials';
  },

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
};
