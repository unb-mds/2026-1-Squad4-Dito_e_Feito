import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSenadores, getDeputados, getDashboardMetrics } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GraficoTendencias } from '../components/GraficoTendencias';
import { GraficoPartidos } from '../components/GraficoPartidos';
import { getPartidoLogo, getEstadoFlag, formatTipoParlamentar } from '../utils/formatters';
import { obterLinhaDoTempoCoerencia } from '../utils/timeline';

const getPartyColor = (sigla) => {
  const colors = {
    'PT': '#9b2335', 'PL': '#14b8a6', 'UNIÃO': '#166534', 'PP': '#8b949e',
    'PSDB': '#b0bec5', 'MDB': '#4f46e5', 'PSD': '#22c55e', 'REP': '#ef4444',
    'PSB': '#d97706', 'PDT': '#0ea5e9', 'PODE': '#f59e0b', 'PSOL': '#f43f5e'
  };
  return colors[sigla] || `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
};

export function Estados() {
  const { uf } = useParams();
  const navigate = useNavigate();
  const [dataByUf, setDataByUf] = useState([]);
  const [loading, setLoading] = useState(true);

  const ESTADOS = [
    { sigla: 'AC', nome: 'Acre' }, { sigla: 'AL', nome: 'Alagoas' }, { sigla: 'AP', nome: 'Amapá' },
    { sigla: 'AM', nome: 'Amazonas' }, { sigla: 'BA', nome: 'Bahia' }, { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' }, { sigla: 'ES', nome: 'Espírito Santo' }, { sigla: 'GO', nome: 'Goiás' },
    { sigla: 'MA', nome: 'Maranhão' }, { sigla: 'MT', nome: 'Mato Grosso' }, { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' }, { sigla: 'PA', nome: 'Pará' }, { sigla: 'PB', nome: 'Paraíba' },
    { sigla: 'PR', nome: 'Paraná' }, { sigla: 'PE', nome: 'Pernambuco' }, { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' }, { sigla: 'RN', nome: 'Rio Grande do Norte' }, { sigla: 'RS', nome: 'Rio Grande do Sul' },
    { sigla: 'RO', nome: 'Rondônia' }, { sigla: 'RR', nome: 'Roraima' }, { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' }, { sigla: 'SE', nome: 'Sergipe' }, { sigla: 'TO', nome: 'Tocantins' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Carrega scores reais do Supabase
        const metricsData = await getDashboardMetrics();
        const scoreMap = {};
        if (metricsData && metricsData.senadores) {
          metricsData.senadores.forEach(s => {
            scoreMap[String(s.id)] = {
              coerencia: Math.round(s.score_coerencia || 0),
              foto: s.foto || '',
              tipo: formatTipoParlamentar(s.tipo || s.tipo_parlamentar),
              analisado: true,
              detalhes: s.detalhes || []
            };
          });
        }
        if (metricsData && metricsData.deputados) {
          metricsData.deputados.forEach(d => {
            scoreMap[String(d.id)] = {
              coerencia: Math.round(d.score_coerencia || 0),
              foto: d.foto || '',
              tipo: formatTipoParlamentar(d.tipo || d.tipo_parlamentar),
              analisado: true,
              detalhes: d.detalhes || []
            };
          });
        }

        // 2. Carrega lista completa de parlamentares
        const [senadoresRes, deputadosRes] = await Promise.allSettled([
          getSenadores(),
          getDeputados()
        ]);
        
        let politicos = [];

        const buildList = (lista, tipoDefault) =>
          lista.map(p => {
            const idStr = String(p.id);
            const extra = scoreMap[idStr] || {};
            return {
              ...p,
              foto: extra.foto || p.foto || '',
              coerencia: extra.coerencia ?? 0,
              tipo: extra.tipo || tipoDefault,
              analisado: extra.analisado || false,
              detalhes: extra.detalhes || []
            };
          });

        if (senadoresRes.status === 'fulfilled' && senadoresRes.value?.status === 'ok') {
          politicos = [...politicos, ...buildList(senadoresRes.value.dados, 'Senador')];
        }
        if (deputadosRes.status === 'fulfilled' && deputadosRes.value?.status === 'ok') {
          politicos = [...politicos, ...buildList(deputadosRes.value.dados, 'Deputado')];
        }

        // Fallback: usa as métricas direto se não carregou nada
        if (politicos.length === 0 && metricsData && metricsData.senadores) {
          politicos = metricsData.senadores.map(s => ({
            id: s.id,
            nome: s.nome,
            partido: s.partido,
            uf: s.uf,
            foto: s.foto || '',
            coerencia: Math.round(s.score_coerencia || 0),
            tipo: formatTipoParlamentar(s.tipo || s.tipo_parlamentar),
            analisado: true,
            detalhes: s.detalhes || []
          }));
        }

        const ufMap = {};
        ESTADOS.forEach(e => {
          ufMap[e.sigla] = { ...e, politicos: [], somaCoerencia: 0, countAnalisados: 0 };
        });

        politicos.forEach(p => {
          if (p.uf && ufMap[p.uf]) {
            ufMap[p.uf].politicos.push(p);
            if (p.analisado && p.coerencia) {
              ufMap[p.uf].somaCoerencia += p.coerencia;
              ufMap[p.uf].countAnalisados += 1;
            }
          }
        });

        const list = Object.values(ufMap).map(u => ({
          ...u,
          media: u.countAnalisados > 0 ? Math.round(u.somaCoerencia / u.countAnalisados) : 0
        })).sort((a, b) => b.media - a.media);

        setDataByUf(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border p-3 rounded-lg shadow-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <img 
              src={getEstadoFlag(payload[0].payload.sigla)} 
              alt={payload[0].payload.sigla} 
              className="w-5 h-5 rounded-full object-cover"
            />
            <p className="text-[14px] font-bold text-text-main">{payload[0].payload.nome} ({payload[0].payload.sigla})</p>
          </div>
          <p className="text-[13px] text-teal">Coerência: {payload[0].value}%</p>
          <p className="text-[12px] text-text2 mt-1">{payload[0].payload.countAnalisados} analisados</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-text2">Carregando dados dos estados...</div>;
  }

  if (uf) {
    const selectedUf = uf.toUpperCase();
    const estado = dataByUf.find(e => e.sigla === selectedUf);
    
    if (!estado) return <div className="p-8 text-text-main">Estado não encontrado.</div>;

    const topPoliticos = [...estado.politicos]
      .filter(p => p.analisado)
      .sort((a, b) => b.coerencia - a.coerencia);
      
    const timelineData = obterLinhaDoTempoCoerencia(estado.politicos);
      
    const partidoMap = {};
    topPoliticos.forEach(p => {
      if (p.partido) {
        if (!partidoMap[p.partido]) partidoMap[p.partido] = { soma: 0, count: 0 };
        partidoMap[p.partido].soma += p.coerencia;
        partidoMap[p.partido].count += 1;
      }
    });
    
    let mostCoherentParty = null;
    let maxPartyCoherence = -1;
    const chartPartidosData = [];
    
    for (const [sigla, data] of Object.entries(partidoMap)) {
      const coerencia = Math.round(data.soma / data.count);
      if (coerencia > maxPartyCoherence) {
        maxPartyCoherence = coerencia;
        mostCoherentParty = sigla;
      }
      chartPartidosData.push({
        name: sigla,
        value: data.count,
        color: getPartyColor(sigla)
      });
    }

    chartPartidosData.sort((a, b) => b.value - a.value);
    
    const mostCoherentPolitician = topPoliticos.length > 0 ? topPoliticos[0] : null;

    return (
      <div className="flex flex-col flex-1 animate-[fadeIn_0.2s_ease]">
        <div className="p-4 md:p-[28px_32px] border-b border-border shrink-0 bg-surface">
          <button onClick={() => navigate('/estados')} className="text-[13px] font-semibold text-teal mb-4 hover:underline flex items-center gap-1">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Voltar para todos os estados
          </button>
          <div className="flex items-center gap-4">
            <img 
              src={getEstadoFlag(estado.sigla)} 
              alt={estado.sigla} 
              className="w-16 h-16 rounded-full border border-border object-cover"
            />
            <div>
              <h1 className="text-[28px] font-bold text-text-main leading-tight">{estado.nome}</h1>
              <div className="text-[14px] text-text2 mt-1">
                {estado.politicos.length} representantes • {estado.countAnalisados} analisados
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-[28px_32px] flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
            <div className="bg-surface border border-border rounded-xl p-[20px_24px]">
              <div className="text-[12px] font-semibold text-teal uppercase tracking-[0.06em] mb-2.5">Média de Coerência</div>
              <div className="text-[40px] font-bold text-text-main leading-none mb-3">
                {estado.countAnalisados > 0 ? `${estado.media}%` : '--'}
              </div>
              {estado.countAnalisados > 0 && (
                <div className="mt-4 h-[5px] w-full bg-surface2 rounded-full overflow-hidden">
                  <div className="h-full bg-teal" style={{width: `${estado.media}%`}}></div>
                </div>
              )}
            </div>
            <div className="bg-surface border border-border rounded-xl p-[20px_24px]">
              <div className="text-[12px] font-semibold text-teal uppercase tracking-[0.06em] mb-2.5">Representantes Analisados</div>
              <div className="text-[40px] font-bold text-text-main leading-none mb-3">{estado.countAnalisados}</div>
              <div className="text-[12px] text-text2 mt-2">de {estado.politicos.length} membros do estado</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-[20px_24px]">
              <div className="text-[12px] font-semibold text-teal uppercase tracking-[0.06em] mb-2.5">Membro Mais Coerente</div>
              <div className="text-[20px] font-bold text-text-main leading-tight mb-2 truncate">
                {mostCoherentPolitician ? mostCoherentPolitician.nome : '--'}
              </div>
              {mostCoherentPolitician && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-teal-bg text-teal">
                  {mostCoherentPolitician.coerencia}% Coerência
                </span>
              )}
            </div>
            <div className="bg-surface border border-border rounded-xl p-[20px_24px]">
              <div className="text-[12px] font-semibold text-teal uppercase tracking-[0.06em] mb-2.5">Partido Mais Coerente</div>
              <div className="text-[40px] font-bold text-text-main leading-none mb-3 flex items-center gap-2">
                {mostCoherentParty && (
                  <img 
                    src={getPartidoLogo(mostCoherentParty)} 
                    alt={mostCoherentParty} 
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(mostCoherentParty)}&background=1c2128&color=14b8a6`;
                    }}
                  />
                )}
                {mostCoherentParty || '--'}
              </div>
              {mostCoherentParty && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-teal-bg text-teal">
                  {maxPartyCoherence}% Coerência Média
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-4 mb-4">
            <div className="bg-surface border border-border rounded-xl flex flex-col">
              <div className="p-[16px_20px] border-b border-border2">
                <div className="text-[16px] font-bold text-text-main">Distribuição Partidária</div>
              </div>
              <div className="p-5 flex-1 flex flex-col items-center justify-center relative min-h-[300px]">
                {chartPartidosData.length > 0 ? (
                  <GraficoPartidos data={chartPartidosData} />
                ) : (
                  <div className="text-[14px] text-text2 italic">Sem dados analisados</div>
                )}
              </div>
            </div>
            <div className="bg-surface border border-border rounded-xl flex flex-col">
              <div className="p-[16px_20px] border-b border-border2">
                <div className="text-[16px] font-bold text-text-main">Evolução da Coerência ({estado.sigla})</div>
              </div>
              <div className="p-5 flex-1 flex items-center justify-center relative min-h-[300px]">
                 <GraficoTendencias data={timelineData} />
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl">
            <div className="p-[16px_20px] border-b border-border2 flex justify-between items-center">
              <div className="text-[16px] font-bold text-text-main">Ranking de Políticos do Estado</div>
            </div>
            <div>
              {topPoliticos.length > 0 ? (
                topPoliticos.map((p, i) => (
                  <div key={p.id} onClick={() => navigate(`/politicos/${p.id}`, { state: { politico: p } })} className="flex items-center gap-3.5 p-[14px_20px] border-b border-border2 hover:bg-surface2 transition-colors cursor-pointer last:border-0">
                    <div className="text-[14px] font-bold text-teal w-7 shrink-0">#{i + 1}</div>
                    <img src={p.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nome)}&background=1c2128&color=14b8a6`} alt={p.nome} className="w-9 h-9 rounded-full border border-border shrink-0 object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-text-main truncate flex items-center gap-2">
                        {p.nome}
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border shrink-0 ${
                          p.tipo && p.tipo.toLowerCase().includes('senad')
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {p.tipo && p.tipo.toLowerCase().includes('senad') ? 'Senador' : 'Deputado'}
                        </span>
                      </div>
                      <div className="text-[12px] text-teal mt-0.5 flex gap-1.5 items-center">
                         <img 
                           src={getPartidoLogo(p.partido)} 
                           alt={p.partido} 
                           referrerPolicy="no-referrer"
                           className="w-4 h-4 object-contain"
                           onError={(e) => {
                             e.target.onerror = null;
                             e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.partido)}&background=1c2128&color=14b8a6`;
                           }}
                         />
                         <span onClick={(e) => { e.stopPropagation(); navigate(`/partidos/${p.partido.toLowerCase()}`); }} className="hover:underline hover:text-white cursor-pointer font-medium">{p.partido}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 min-w-[110px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-text2">Coerência</span>
                        <span className="text-[14px] font-bold text-text-main">{p.coerencia}%</span>
                      </div>
                      <div className="h-[5px] bg-border rounded w-full overflow-hidden">
                        <div className={`h-full rounded transition-all duration-600 ${p.coerencia >= 70 ? 'bg-green' : 'bg-red'}`} style={{ width: `${p.coerencia}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-text2 italic">Nenhum representante deste estado analisado ainda.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const chartData = [...dataByUf].filter(e => e.countAnalisados > 0).slice(0, 15);

  const totalAnalisados = dataByUf.reduce((acc, e) => acc + e.countAnalisados, 0);
  const totalSomaCoerencia = dataByUf.reduce((acc, e) => acc + (e.somaCoerencia || 0), 0);
  const mediaGeral = totalAnalisados > 0 ? Math.round(totalSomaCoerencia / totalAnalisados) : 0;
  
  const estadosComDados = dataByUf.filter(e => e.countAnalisados > 0);
  let estadoMaisCoerente = null;
  let estadoMenosCoerente = null;
  
  if (estadosComDados.length > 0) {
    const sorted = [...estadosComDados].sort((a, b) => b.media - a.media);
    estadoMaisCoerente = sorted[0];
    estadoMenosCoerente = sorted[sorted.length - 1];
  }

  const sortedAllStates = [...dataByUf].sort((a, b) => b.media - a.media);

  return (
    <div className="flex flex-col flex-1 animate-[fadeIn_0.2s_ease]">
      <div className="p-4 md:p-[28px_32px] border-b border-border shrink-0 bg-surface">
        <h1 className="text-[24px] font-bold text-text-main">Estados</h1>
        <p className="text-[14px] text-text2 mt-1">Dashboard consolidado de coerência por Unidade Federativa.</p>
      </div>

      <div className="p-4 md:p-[28px_32px] flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div className="bg-surface border border-border rounded-xl p-[20px_24px]">
            <div className="text-[12px] font-semibold text-teal uppercase tracking-[0.06em] mb-2.5">Média Nacional</div>
            <div className="text-[40px] font-bold text-text-main leading-none mb-3">
              {totalAnalisados > 0 ? `${mediaGeral}%` : '--'}
            </div>
            {totalAnalisados > 0 && (
              <div className="mt-4 h-[5px] w-full bg-surface2 rounded-full overflow-hidden">
                <div className="h-full bg-teal" style={{width: `${mediaGeral}%`}}></div>
              </div>
            )}
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-[20px_24px]">
            <div className="text-[12px] font-semibold text-teal uppercase tracking-[0.06em] mb-2.5">Políticos Analisados</div>
            <div className="text-[40px] font-bold text-text-main leading-none mb-3">{totalAnalisados}</div>
            <div className="text-[12px] text-text2 mt-2">em {dataByUf.length} estados</div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-[20px_24px]">
            <div className="text-[12px] font-semibold text-teal uppercase tracking-[0.06em] mb-2.5">Mais Coerente</div>
            <div className="text-[32px] font-bold text-text-main leading-none mb-3 flex items-center gap-2">
              {estadoMaisCoerente && (
                <img 
                  src={getEstadoFlag(estadoMaisCoerente.sigla)} 
                  alt={estadoMaisCoerente.sigla} 
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              {estadoMaisCoerente ? estadoMaisCoerente.sigla : '--'}
            </div>
            {estadoMaisCoerente && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-teal-bg text-teal">
                {estadoMaisCoerente.media}% Coerência
              </span>
            )}
          </div>

          <div className="bg-surface border border-border rounded-xl p-[20px_24px]">
            <div className="text-[12px] font-semibold text-teal uppercase tracking-[0.06em] mb-2.5">Menos Coerente</div>
            <div className="text-[32px] font-bold text-text-main leading-none mb-3 flex items-center gap-2">
              {estadoMenosCoerente && (
                <img 
                  src={getEstadoFlag(estadoMenosCoerente.sigla)} 
                  alt={estadoMenosCoerente.sigla} 
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              {estadoMenosCoerente ? estadoMenosCoerente.sigla : '--'}
            </div>
            {estadoMenosCoerente && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-red-500/10 text-red-500">
                {estadoMenosCoerente.media}% Coerência
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
          <div className="bg-surface border border-border rounded-xl flex flex-col max-h-[600px]">
            <div className="p-[16px_20px] border-b border-border2">
              <div className="text-[16px] font-bold text-text-main">Ranking de Todos os Estados</div>
            </div>
            <div className="overflow-y-auto flex-1">
              {sortedAllStates.map((e, i) => (
                <div 
                  key={e.sigla} 
                  onClick={() => navigate(`/estados/${e.sigla.toLowerCase()}`)} 
                  className="flex items-center gap-3.5 p-[14px_20px] border-b border-border2 hover:bg-surface2 transition-colors cursor-pointer last:border-0"
                >
                  <div className="text-[14px] font-bold text-teal w-7 shrink-0">#{i + 1}</div>
                  <img 
                    src={getEstadoFlag(e.sigla)} 
                    alt={e.sigla} 
                    className="w-10 h-10 rounded-full border border-border shrink-0 object-cover" 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-bold text-text-main truncate">{e.nome}</div>
                    <div className="text-[12px] text-text2 mt-0.5">{e.politicos.length} representantes ({e.countAnalisados} analisados)</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 min-w-[110px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-text2">Média</span>
                      <span className="text-[15px] font-bold text-text-main">{e.countAnalisados > 0 ? `${e.media}%` : '--'}</span>
                    </div>
                    {e.countAnalisados > 0 && (
                      <div className="h-[5px] bg-border rounded w-full overflow-hidden">
                        <div className={`h-full rounded transition-all duration-600 ${e.media >= 70 ? 'bg-green' : e.media >= 50 ? 'bg-amber-500' : 'bg-red'}`} style={{ width: `${e.media}%` }}></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {chartData.length > 0 && (
            <div className="bg-surface border border-border rounded-xl flex flex-col max-h-[600px]">
              <div className="p-[16px_20px] border-b border-border2"><div className="text-[16px] font-bold text-text-main">Top 15 Estados Analisados</div></div>
              <div className="p-5 flex-1 min-h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363d" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
                    <YAxis dataKey="sigla" type="category" stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} width={60} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#21262d' }} />
                    <Bar dataKey="media" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.media >= 70 ? '#2ea043' : entry.media >= 50 ? '#d29922' : '#f85149'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
