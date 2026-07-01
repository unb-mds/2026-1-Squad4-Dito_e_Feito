import { describe, it, expect } from 'vitest';
import { formatTipoParlamentar } from './formatters';

describe('formatTipoParlamentar', () => {
  it('deve formatar senadores corretamente', () => {
    expect(formatTipoParlamentar('senador')).toBe('Senador');
    expect(formatTipoParlamentar('Senador')).toBe('Senador');
    expect(formatTipoParlamentar('senadora')).toBe('Senador');
    expect(formatTipoParlamentar('Senadora')).toBe('Senador');
  });

  it('deve formatar deputados corretamente', () => {
    expect(formatTipoParlamentar('deputado')).toBe('Deputado');
    expect(formatTipoParlamentar('Deputado')).toBe('Deputado');
    expect(formatTipoParlamentar('deputada')).toBe('Deputado');
    expect(formatTipoParlamentar('Deputada')).toBe('Deputado');
  });

  it('deve retornar Senador por padrão se nenhum valor for fornecido', () => {
    expect(formatTipoParlamentar(null)).toBe('Senador');
    expect(formatTipoParlamentar(undefined)).toBe('Senador');
    expect(formatTipoParlamentar('')).toBe('Senador');
  });

  it('deve retornar o próprio valor caso não corresponda a nenhum padrão conhecido', () => {
    expect(formatTipoParlamentar('Presidente')).toBe('Presidente');
  });
});
