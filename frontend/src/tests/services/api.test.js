import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { api, getDeputados, analisarParlamentar, getDashboardMetrics } from '../../services/api';

// Mock do axios
vi.mock('axios', () => {
  const mAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  };
  return {
    default: {
      create: vi.fn(() => mAxiosInstance),
      get: vi.fn()
    },
  };
});

describe('API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDeputados', () => {
    it('deve fazer requisição GET para /deputados e retornar dados', async () => {
      const mockData = { dados: [{ id: 1, nome: 'Teste' }] };
      api.get.mockResolvedValueOnce({ data: mockData });

      const resultado = await getDeputados();
      
      expect(api.get).toHaveBeenCalledWith('/deputados');
      expect(resultado).toEqual(mockData);
    });
  });

  describe('analisarParlamentar', () => {
    it('deve retornar os dados em caso de sucesso', async () => {
      const mockResponse = { status: 'ok', dados: [] };
      api.post.mockResolvedValueOnce({ data: mockResponse });

      const resultado = await analisarParlamentar('123', 'deputado');
      
      expect(api.post).toHaveBeenCalledWith('/analisar', { id: '123', tipo: 'deputado' });
      expect(resultado).toEqual(mockResponse);
    });

    it('deve capturar erro e retornar formato de aviso da UI', async () => {
      api.post.mockRejectedValueOnce(new Error('Falha no servidor'));

      const resultado = await analisarParlamentar('123', 'deputado');
      
      expect(resultado).toEqual({
        status: 'aviso',
        mensagem: 'Falha no servidor'
      });
    });
  });

  describe('getDashboardMetrics', () => {
    it('deve retornar null em caso de erro na requisição', async () => {
      api.get.mockRejectedValueOnce(new Error('Network Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const resultado = await getDashboardMetrics();
      
      expect(resultado).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
