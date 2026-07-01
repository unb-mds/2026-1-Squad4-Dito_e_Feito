import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { VisaoGeral } from '../../pages/VisaoGeral';
import * as api from '../../services/api';

// Mock dos componentes que usam bibliotecas gráficas pesadas
vi.mock('../../components/GraficoTendencias', () => ({
  GraficoTendencias: () => <div data-testid="mock-grafico-tendencias" />
}));
vi.mock('../../components/GraficoPartidos', () => ({
  GraficoPartidos: () => <div data-testid="mock-grafico-partidos" />
}));
vi.mock('../../components/GraficoBarras', () => ({
  GraficoBarras: () => <div data-testid="mock-grafico-barras" />
}));
vi.mock('../../components/MapaBrasil', () => ({
  MapaBrasil: () => <div data-testid="mock-mapa-brasil" />
}));

describe('VisaoGeral Page', () => {
  it('renderiza o estado inicial de carregamento simulado pelas props com "--"', () => {
    // Retorna uma promise que nunca resolve
    vi.spyOn(api, 'getDashboardMetrics').mockReturnValue(new Promise(() => {}));
    
    render(
      <MemoryRouter>
        <VisaoGeral />
      </MemoryRouter>
    );

    expect(screen.getByText('Parlamentares Analisados')).toBeInTheDocument();
    // A string inicial de total analisados e outros é '--' ou '--%'
    expect(screen.getAllByText('--').length).toBeGreaterThan(0);
  });

  it('renderiza os cards e gráficos após carregar os dados da API', async () => {
    const mockMetrics = {
      total_analisados: 10,
      senadores: [
        { id: 1, nome: 'Senador A', partido: 'PT', uf: 'SP', score_coerencia: 85, foto: '', total_scores: 10, detalhes: [] },
      ],
      deputados: [
        { id: 2, nome: 'Deputado B', partido: 'PL', uf: 'RJ', score_coerencia: 40, foto: '', total_scores: 5, detalhes: [] },
      ]
    };
    
    vi.spyOn(api, 'getDashboardMetrics').mockResolvedValue(mockMetrics);

    render(
      <MemoryRouter>
        <VisaoGeral />
      </MemoryRouter>
    );

    // Aguarda o componente renderizar o número mockado '10' do total de analisados
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    // Verifica a presença dos blocos de ranking e cards
    expect(screen.getByText('Ranking de Partidos')).toBeInTheDocument();
    expect(screen.getByText('Ranking de Estados')).toBeInTheDocument();

    // Verifica se os componentes mockados foram renderizados
    expect(screen.getByTestId('mock-grafico-tendencias')).toBeInTheDocument();
    expect(screen.getByTestId('mock-grafico-partidos')).toBeInTheDocument();
    expect(screen.getByTestId('mock-mapa-brasil')).toBeInTheDocument();
  });
});
