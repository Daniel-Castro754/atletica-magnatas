import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve salvar e recuperar um valor', () => {
    StorageService.set('test_key', { name: 'Magnatas', year: 2024 });
    const result = StorageService.get<{ name: string; year: number }>('test_key');
    expect(result).toEqual({ name: 'Magnatas', year: 2024 });
  });

  it('deve retornar null para chave inexistente', () => {
    const result = StorageService.get('chave_inexistente');
    expect(result).toBeNull();
  });

  it('deve remover um valor corretamente', () => {
    StorageService.set('remove_key', 'valor');
    StorageService.remove('remove_key');
    expect(StorageService.get('remove_key')).toBeNull();
  });

  it('deve limpar todos os valores', () => {
    StorageService.set('chave_a', 1);
    StorageService.set('chave_b', 2);
    StorageService.clear();
    expect(StorageService.get('chave_a')).toBeNull();
    expect(StorageService.get('chave_b')).toBeNull();
  });

  it('deve retornar false se JSON inválido está salvo', () => {
    localStorage.setItem('bad_key', '{invalid json}');
    const result = StorageService.get('bad_key');
    expect(result).toBeNull();
  });
});
