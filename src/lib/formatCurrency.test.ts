import { describe, it, expect } from 'vitest';
import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  it('deve formatar valores em BRL', () => {
    const result = formatCurrency(49.9);
    expect(result).toContain('49');
    expect(result).toContain('90');
  });

  it('deve formatar zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('deve formatar valores grandes', () => {
    const result = formatCurrency(1000);
    expect(result).toContain('1');
    expect(result).toContain('000');
  });
});
