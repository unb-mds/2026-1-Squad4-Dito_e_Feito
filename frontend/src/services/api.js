import axios from 'axios';

// Em produção: VITE_API_URL deve apontar para o Render (ex: https://dito-e-feito-backend.onrender.com)
// Em desenvolvimento local: cai para localhost:5001 automaticamente
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:5001/api';

export const api = axios.create({
  baseURL: BASE_URL,
  
  // Timeout de 90 segundos (90000ms). O BERT pode ser lento sem GPU.
  timeout: 90000, 
  
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para padronizar os erros e não quebrar a tela
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      console.error("Timeout: O servidor demorou muito para responder.");
      return Promise.reject({ message: "O modelo de IA demorou muito para processar os dados. Tente novamente." });
    }
    if (error.message === 'Network Error') {
      return Promise.reject({ message: "Erro de rede. Verifique se o servidor Flask está rodando na porta 5001." });
    }
    return Promise.reject(error);
  }
);

export const getDeputados = async () => {
  const response = await api.get('/deputados');
  return response.data;
};

export const getSenadores = async () => {
  const response = await api.get('/senadores');
  return response.data;
};

export const analisarParlamentar = async (id, tipo) => {
  try {
    const response = await api.post('/analisar', { id, tipo });
    return response.data;
  } catch (error) {
    // Retorna no formato amigável para a nossa UI ler como "aviso"
    return {
      status: 'aviso',
      mensagem: error.message || "Erro desconhecido ao analisar o parlamentar."
    };
  }
};

export const getDashboardMetrics = async () => {
  try {
    const response = await api.get('/dashboard-metrics');
    return response.data;
  } catch (error) {
    console.error("Erro ao obter métricas do dashboard:", error);
    return null;
  }
};

export const getMetricsJson = async () => {
  try {
    const response = await api.get('/dashboard-metrics');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar JSON de métricas do banco:', error);
    return null;
  }
};

export const getPoliticoById = async (id) => {
  try {
    const response = await api.get(`/politico/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao obter político ${id}:`, error);
    return null;
  }
};