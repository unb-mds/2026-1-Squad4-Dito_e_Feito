import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios', () => {
  const mockInstance = {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      response: { use: vi.fn() }
    }
  };
  return {
    default: {
      create: vi.fn(() => mockInstance)
    }
  };
});

// Importação tardia após o mock do axios estar registrado
import { 
  getDeputados, 
  getSenadores, 
  analisarParlamentar, 
  getDashboardMetrics, 
  getPoliticoById 
} from './api';

const mockAxiosInstance = axios.create();

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve buscar deputados com sucesso', async () => {
    mockAxiosInstance.get.mockResolvedValueOnce({ data: { dados: [{ id: 1, nome: 'Deputado Teste' }] } });
    
    const res = await getDeputados();
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/deputados');
    expect(res.dados[0].nome).toBe('Deputado Teste');
  });

  it('deve buscar senadores com sucesso', async () => {
    mockAxiosInstance.get.mockResolvedValueOnce({ data: { dados: [{ id: 2, nome: 'Senador Teste' }] } });
    
    const res = await getSenadores();
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/senadores');
    expect(res.dados[0].nome).toBe('Senador Teste');
  });

  it('deve enviar solicitação de análise parlamentar', async () => {
    mockAxiosInstance.post.mockResolvedValueOnce({ data: { status: 'ok', dados: [] } });
    
    const res = await analisarParlamentar('123', 'senador');
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/analisar', { id: '123', tipo: 'senador' });
    expect(res.status).toBe('ok');
  });

  it('deve buscar métricas do dashboard', async () => {
    mockAxiosInstance.get.mockResolvedValueOnce({ data: { media_global_coerencia: 80 } });
    
    const res = await getDashboardMetrics();
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/dashboard-metrics');
    expect(res.media_global_coerencia).toBe(80);
  });

  it('deve buscar político por ID', async () => {
    mockAxiosInstance.get.mockResolvedValueOnce({ data: { status: 'ok', dados: { nome: 'Político X' } } });
    
    const res = await getPoliticoById('123');
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/politico/123');
    expect(res.dados.nome).toBe('Político X');
  });
});

