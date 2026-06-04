import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Lembre-se de mudar aqui quando subir o Python para um servidor real
  
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
      return Promise.reject({ message: "Erro de rede. Verifique se o servidor Flask está rodando na porta 5000." });
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