import '@testing-library/jest-dom';

// Mock do ResizeObserver que o Recharts precisa
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock do import.meta.env para o Vite
vi.stubEnv('VITE_API_URL', 'http://localhost:5001');
