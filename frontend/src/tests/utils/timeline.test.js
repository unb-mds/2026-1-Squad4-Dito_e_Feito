import { describe, it, expect } from 'vitest';
import { obterLinhaDoTempoCoerencia } from '../../utils/timeline';

describe('obterLinhaDoTempoCoerencia', () => {
  it('deve retornar null se a lista de políticos for vazia', () => {
    const resultado = obterLinhaDoTempoCoerencia([]);
    expect(resultado).toBeNull();
  });

  it('deve retornar null se nenhum político possuir detalhes válidos', () => {
    const politicos = [
      { id: 1, detalhes: [] },
      { id: 2, detalhes: [{ data: 'N/A', coerente: true }] }
    ];
    const resultado = obterLinhaDoTempoCoerencia(politicos);
    expect(resultado).toBeNull();
  });

  it('deve calcular a média de coerência corretamente para meses com votos', () => {
    const politicos = [
      {
        id: 1,
        detalhes: [
          { data: '2024-01-15T10:00:00Z', coerente: true }, // Janeiro: 100%
          { data: '2024-01-20T10:00:00Z', coerente: false } // Janeiro: 0% -> Média Jan: 50%
        ]
      },
      {
        id: 2,
        detalhes: [
          { data: '2024-02-10T10:00:00Z', coerente: true }, // Fevereiro: 100%
          { data: '2024-03-05T10:00:00Z', coerente: true }, // Março: 100%
          { data: '2024-03-15T10:00:00Z', coerente: false } // Março: 0% -> Média Mar: 50%
        ]
      }
    ];

    const resultado = obterLinhaDoTempoCoerencia(politicos);
    expect(resultado).not.toBeNull();
    
    // Janeiro (idx 0)
    expect(resultado[0].name).toBe('Jan');
    expect(resultado[0].value).toBe(50); // (100 + 0) / 2
    
    // Fevereiro (idx 1)
    expect(resultado[1].name).toBe('Fev');
    expect(resultado[1].value).toBe(100);

    // Março (idx 2)
    expect(resultado[2].name).toBe('Mar');
    expect(resultado[2].value).toBe(50);

    // Abril (idx 3) deve ser null (sem dados)
    expect(resultado[3].name).toBe('Abr');
    expect(resultado[3].value).toBeNull();
  });

  it('deve ignorar datas inválidas ou campos mal formatados', () => {
    const politicos = [
      {
        id: 1,
        detalhes: [
          { data: 'data-invalida', coerente: true },
          { data: '2024-05-10', coerente: null },
          { data: undefined, coerente: false },
          { data: '2024-05-15T10:00:00Z', coerente: true } // Apenas este é válido
        ]
      }
    ];

    const resultado = obterLinhaDoTempoCoerencia(politicos);
    expect(resultado[4].name).toBe('Mai');
    expect(resultado[4].value).toBe(100); // 1 voto coerente
  });
});
