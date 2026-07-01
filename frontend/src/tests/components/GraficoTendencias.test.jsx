import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GraficoTendencias } from '../../components/GraficoTendencias';

// Recharts ResponsiveContainer depende de largura/altura e pode ser complicado de testar em JSDOM
// Portanto, criamos um mock simples para o componente pai renderizar seus filhos
vi.mock('recharts', async () => {
  const OriginalModule = await vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => (
      <div data-testid="responsive-container" style={{ width: 800, height: 400 }}>
        {children}
      </div>
    ),
  };
});

describe('GraficoTendencias', () => {
  it('renderiza corretamente com dados default (quando data é null)', () => {
    const { container } = render(<GraficoTendencias data={null} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renderiza corretamente com dados passados por props', () => {
    const customData = [
      { name: 'Jan', value: 50 },
      { name: 'Fev', value: 100 }
    ];
    
    const { container } = render(<GraficoTendencias data={customData} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});
