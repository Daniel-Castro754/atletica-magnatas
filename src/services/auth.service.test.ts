import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService.validate', () => {
  it('deve retornar success com credenciais corretas', () => {
    const result = AuthService.validate(AuthService.ADMIN_EMAIL, AuthService.DEV_ADMIN_PASSWORD);
    expect(result).toBe('success');
  });

  it('deve retornar invalid_credentials com senha errada', () => {
    const result = AuthService.validate(AuthService.ADMIN_EMAIL, 'senhaerrada');
    expect(result).toBe('invalid_credentials');
  });

  it('deve retornar invalid_credentials com email errado', () => {
    const result = AuthService.validate('outro@email.com', AuthService.DEV_ADMIN_PASSWORD);
    expect(result).toBe('invalid_credentials');
  });

  it('deve retornar user_not_registered para email bloqueado', () => {
    const result = AuthService.validate(AuthService.BLOCKED_EMAIL, 'qualquer');
    expect(result).toBe('user_not_registered');
  });

  it('deve normalizar email (case insensitive e trim)', () => {
    const result = AuthService.validate(
      `  ${AuthService.ADMIN_EMAIL.toUpperCase()}  `,
      AuthService.DEV_ADMIN_PASSWORD
    );
    expect(result).toBe('success');
  });
});

describe('AuthService.loadStatus / saveStatus', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve retornar guest por padrão', () => {
    expect(AuthService.loadStatus()).toBe('guest');
  });

  it('deve persistir e carregar status admin', () => {
    AuthService.saveStatus('admin');
    expect(AuthService.loadStatus()).toBe('admin');
  });
});
