/**
 * Agrega os detalhes de votações dos políticos informados para gerar a média de coerência por mês.
 * Retorna uma lista formatada para o Recharts (ex: [{ name: 'Jan', value: 72 }, ...])
 */
export const obterLinhaDoTempoCoerencia = (politicos) => {
  const mesesAbreviados = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  // Inicializa estrutura para armazenar a soma e a quantidade de análises por mês
  const acumuladoMensal = Array.from({ length: 12 }, (_, i) => ({
    name: mesesAbreviados[i],
    soma: 0,
    qtd: 0
  }));

  politicos.forEach(p => {
    if (p.detalhes && Array.isArray(p.detalhes)) {
      p.detalhes.forEach(d => {
        if (d.data && d.data !== 'N/A' && d.coerente !== null && d.coerente !== undefined) {
          const dataObj = new Date(d.data);
          if (!isNaN(dataObj)) {
            const mesIdx = dataObj.getMonth(); // 0 (Jan) a 11 (Dez)
            acumuladoMensal[mesIdx].soma += d.coerente ? 100 : 0;
            acumuladoMensal[mesIdx].qtd += 1;
          }
        }
      });
    }
  });

  // Mapeia para o formato do gráfico
  const resultado = acumuladoMensal.map(m => ({
    name: m.name,
    value: m.qtd > 0 ? Math.round(m.soma / m.qtd) : null
  }));

  // Se nenhum mês tiver dados, retorna null para o componente decidir se renderiza fallback ou vazio
  const temDados = resultado.some(m => m.value !== null);
  return temDados ? resultado : null;
};
