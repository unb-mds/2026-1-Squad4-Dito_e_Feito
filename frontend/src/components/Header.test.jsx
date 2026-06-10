import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from './Header';

// Mock lucide-react para evitar problemas de ícone nos testes
vi.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
}));

describe('Header Component', () => {
  it('deve renderizar o input de busca com o placeholder correto', () => {
    render(<Header onSearch={() => {}} />);
    
    const input = screen.getByPlaceholderText('Buscar político por nome...');
    expect(input).toBeInTheDocument();
  });

  it('deve chamar a função onSearch ao digitar no input', () => {
    const mockOnSearch = vi.fn();
    render(<Header onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Buscar político por nome...');
    fireEvent.change(input, { target: { value: 'Lula' } });
    
    expect(mockOnSearch).toHaveBeenCalledWith('Lula');
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });
});
