import { describe, it, expect } from 'vitest';
import { formatTipoParlamentar, getPartidoLogo, getEstadoFlag } from '../../utils/formatters';

describe('formatters', () => {
  describe('formatTipoParlamentar', () => {
    it('deve retornar "Senador" se o valor for nulo ou vazio', () => {
      expect(formatTipoParlamentar(null)).toBe('Senador');
      expect(formatTipoParlamentar('')).toBe('Senador');
    });

    it('deve padronizar tipos contendo "senador" ou "senadora" para "Senador"', () => {
      expect(formatTipoParlamentar('Senador da República')).toBe('Senador');
      expect(formatTipoParlamentar('SENADORA')).toBe('Senador');
    });

    it('deve padronizar tipos contendo "deputado" ou "deputada" para "Deputado"', () => {
      expect(formatTipoParlamentar('Deputado Federal')).toBe('Deputado');
      expect(formatTipoParlamentar('DEPUTADA')).toBe('Deputado');
    });

    it('deve retornar o próprio tipo caso não encaixe nas regras', () => {
      expect(formatTipoParlamentar('Presidente')).toBe('Presidente');
    });
  });

  describe('getPartidoLogo', () => {
    it('deve retornar string vazia se sigla for falsa', () => {
      expect(getPartidoLogo(null)).toBe('');
      expect(getPartidoLogo('')).toBe('');
    });

    it('deve retornar a logo de partidos conhecidos ignorando espaços e cases', () => {
      expect(getPartidoLogo(' pt ')).toContain('PT_%28Brazil%29_logo_2021');
      expect(getPartidoLogo('Psol')).toContain('Logo_PSOL_roxo');
    });

    it('deve retornar um avatar gerado pela ui-avatars.com para partidos desconhecidos', () => {
      expect(getPartidoLogo('DESCONHECIDO')).toContain('ui-avatars.com');
      expect(getPartidoLogo('DESCONHECIDO')).toContain('DESCONHECIDO');
    });
  });

  describe('getEstadoFlag', () => {
    it('deve retornar string vazia se a sigla for falsa', () => {
      expect(getEstadoFlag(null)).toBe('');
      expect(getEstadoFlag('')).toBe('');
    });

    it('deve retornar a url formatada corretamente da bandeira', () => {
      expect(getEstadoFlag('SP')).toBe('https://assets.codante.io/codante-apis/bandeiras-dos-estados/sp-circle.svg');
      expect(getEstadoFlag('  mg ')).toBe('https://assets.codante.io/codante-apis/bandeiras-dos-estados/mg-circle.svg');
    });
  });
});
