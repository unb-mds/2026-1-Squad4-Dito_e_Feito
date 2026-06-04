import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraficoTendencias } from '../components/GraficoTendencias';
import { GraficoPartidos } from '../components/GraficoPartidos';
import { GraficoBarras } from '../components/GraficoBarras';
import { getDashboardMetrics } from '../services/api';


export const politicosMock = [
  {
    id: 1,
    nome: 'Maria Silva Santos',
    partido: 'PT',
    uf: 'SP',
    tipo: 'Deputada',
    coerencia: 87,
    foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80',
  },
  {
    id: 2,
    nome: 'João Pedro Oliveira',
    partido: 'PL',
    uf: 'RJ',
    tipo: 'Deputado',
    coerencia: 84,
    foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
  },
  {
    id: 3,
    nome: 'Ana Costa Mendes',
    partido: 'UNIÃO',
    uf: 'MG',
    tipo: 'Deputada',
    coerencia: 79,
    foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80',
  },
  {
    id: 4,
    nome: 'Carlos Alberto Lima',
    partido: 'PP',
    uf: 'BA',
    tipo: 'Senador',
    coerencia: 76,
    foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80',
  },
  {
    id: 5,
    nome: 'Fernanda Rocha',
    partido: 'MDB',
    uf: 'SP',
    tipo: 'Deputada',
    coerencia: 72,
    foto: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300&q=80',
  },
  {
    id: 6,
    nome: 'Roberto Alves',
    partido: 'PSD',
    uf: 'RS',
    tipo: 'Senador',
    coerencia: 69,
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
  },
];

const alertas = [
  {nome:'João Pedro Oliveira',partido:'PL',tema:'Divergência em Educação',data:'10 Dez 2025', grave: false},
  {nome:'Ana Costa Mendes',partido:'UNIÃO',tema:'Divergência em Meio Ambiente',data:'8 Dez 2025', grave: false},
  {nome:'Carlos Alberto Lima',partido:'PP',tema:'Divergência em Saúde',data:'5 Dez 2025', grave: true},
];

export function VisaoGeral() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const [buscaFocus, setBuscaFocus] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        console.error("Erro ao carregar métricas:", err);
        setErro("Não foi possível conectar ao servidor backend.");
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const getPartyColor = (partido) => {
    const colors = {
      'PT': '#9b2335',
      'PL': '#14b8a6',
      'UNIÃO': '#166534',
      'PP': '#8b949e',
      'PSDB': '#b0bec5',
      'MDB': '#4f46e5',
      'PSD': '#22c55e',
      'REP': '#ef4444',
      'PODEMOS': '#0f766e'
    };
    return colors[(partido || '').toUpperCase()] || '#64748b';
  };

  const politicos = useMemo(() => {
    if (!metrics?.senadores) return [];
    return metrics.senadores.map(s => ({
      id: s.id,
      nome: s.nome,
      partido: s.partido,
      uf: s.uf,
      foto: s.foto,
      coerencia: Math.round(s.score_coerencia || 0),
      tipo: parseInt(s.id) < 10000 ? 'Senador' : 'Deputado'
    }));
  }, [metrics]);

  const politicosFiltrados = useMemo(() => {
    if (!busca.trim()) return [];
    return politicos.filter(p => 
      p.nome.toLowerCase().includes(busca.toLowerCase()) || 
      p.partido.toLowerCase().includes(busca.toLowerCase())
    ).slice(0, 6);
  }, [busca, politicos]);

  const top4 = useMemo(() => {
    return [...politicos].sort((a, b) => b.coerencia - a.coerencia).slice(0, 4);
  }, [politicos]);

  const stats = useMemo(() => {
    const totalVotos = metrics?.senadores?.reduce((acc, s) => acc + (s.total_pares || 0), 0) || 0;
    const mediaGlobal = metrics?.media_global_coerencia || 0;
    
    // Count alerts
    const dynamicAlerts = [];
    let totalDivergentes = 0;
    
    if (metrics?.senadores) {
      metrics.senadores.forEach(s => {
        totalDivergentes += (s.contagem_status?.Divergente || 0);
        if (s.detalhes) {
          s.detalhes.forEach(d => {
            if (d.status === 'Divergente') {
              dynamicAlerts.push({
                nome: s.nome,
                partido: s.partido,
                uf: s.uf,
                foto: s.foto,
                id: s.id,
                tipo: parseInt(s.id) < 10000 ? 'Senador' : 'Deputado',
                tema: d.ementa.length > 50 ? d.ementa.substring(0, 50) + '...' : d.ementa,
                data: d.data || 'N/A',
                grave: d.afinidade < 0.3,
                coerencia: Math.round(s.score_coerencia || 0)
              });
            }
          });
        }
      });
    }

    return {
      totalVotos,
      mediaGlobal,
      totalDivergentes,
      alertas: dynamicAlerts.slice(0, 3)
    };
  }, [metrics]);

  const chartBarrasData = useMemo(() => {
    if (!metrics?.metricas_por_partido) return [];
    return metrics.metricas_por_partido.map(m => ({
      name: m.partido,
      value: m.media_coerencia,
      color: getPartyColor(m.partido)
    }));
  }, [metrics]);

  const chartPartidosData = useMemo(() => {
    if (!metrics?.metricas_por_partido) return [];
    return metrics.metricas_por_partido.map(m => ({
      name: m.partido,
      value: m.total_senadores,
      color: getPartyColor(m.partido)
    }));
  }, [metrics]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 bg-bg animate-[fadeIn_0.2s_ease]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal mb-4"></div>
        <div className="text-text2 text-[14px] font-semibold">Carregando métricas do Dito e Feito...</div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 bg-bg animate-[fadeIn_0.2s_ease]">
        <div className="text-red text-[40px] mb-4">⚠️</div>
        <div className="text-text-main text-[16px] font-bold mb-2">{erro}</div>
        <div className="text-text2 text-[13px] text-center max-w-[400px] mb-6">
          Certifique-se de que a API Flask está sendo executada (na porta 5001) e o banco/cache está disponível.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 animate-[fadeIn_0.2s_ease]">
      <div className="p-[16px_32px] border-b border-border shrink-0 z-20">
        <div className="relative max-w-[600px] mx-auto">
          <svg className="absolute left-[15px] top-1/2 -translate-y-1/2 text-text3 pointer-events-none" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onFocus={() => setBuscaFocus(true)}
            onBlur={() => setTimeout(() => setBuscaFocus(false), 200)}
            className="w-full bg-surface2 border border-border rounded-full p-[10px_18px_10px_42px] text-[14px] text-text-main outline-none focus:border-teal transition-colors" 
            type="text" 
            placeholder="Buscar político por nome ou partido..." 
          />
          {buscaFocus && politicosFiltrados.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-surface border border-border rounded-lg shadow-xl z-50 max-h-[300px] overflow-y-auto">
              {politicosFiltrados.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/politicos/${p.id}`, { state: { politico: p } })}
                  className="flex items-center gap-3 p-3 hover:bg-surface2 cursor-pointer transition-colors border-b border-border2 last:border-0"
                >
                  <img 
                    src={p.foto} 
                    onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nome)}&background=1c2128&color=14b8a6`; }}
                    className="w-8 h-8 rounded-full object-cover" 
                    alt="" 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-text-main truncate">{p.nome}</div>
                    <div className="text-xs text-text2">{p.partido} · {p.uf} · {p.tipo}</div>
                  </div>
                  <div className="text-sm font-bold text-teal">{p.coerencia}%</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-[28px_32px] flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-surface border border-border rounded-xl p-[20px_24px]">
            <div className="text-[12px] font-semibold text-teal uppercase tracking-[0.06em] mb-2.5">Votos Analisados</div>
            <div className="text-[40px] font-bold text-text-main leading-none mb-3">{stats.totalVotos}</div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-green-bg text-green">↑ Ativos</span>
          </div>
          <div className="bg-surface border border-border rounded-xl p-[20px_24px]">
            <div className="text-[12px] font-semibold text-teal uppercase tracking-[0.06em] mb-2.5">Coerência Global</div>
            <div className="text-[40px] font-bold text-text-main leading-none mb-3">{stats.mediaGlobal.toFixed(1)}%</div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-teal-bg text-teal">Geral</span>
          </div>
          <div className="bg-surface border border-border rounded-xl p-[20px_24px]">
            <div className="text-[12px] font-semibold text-teal uppercase tracking-[0.06em] mb-2.5 flex justify-between items-center">
              Incoerências Detectadas
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-red"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div className="text-[40px] font-bold text-text-main leading-none mb-3">{stats.totalDivergentes}</div>
          </div>
        </div>

        <div className="grid grid-cols-[1.8fr_1fr] gap-4 mb-4">
          <div className="bg-surface border border-border rounded-xl flex flex-col">
            <div className="p-[16px_20px] border-b border-border2"><div className="text-[16px] font-bold text-text-main">Tendências de Coerência</div></div>
            <div className="p-5 h-[260px] w-full"><GraficoTendencias /></div>
          </div>
          <div className="bg-surface border border-border rounded-xl flex flex-col">
            <div className="p-[16px_20px] border-b border-border2"><div className="text-[16px] font-bold text-text-main">Comparação por Partido</div></div>
            <div className="p-5 h-[260px] w-full flex items-center justify-center">
              <GraficoPartidos data={chartPartidosData} />
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl mb-4 flex flex-col">
          <div className="p-[16px_20px] border-b border-border2"><div className="text-[16px] font-bold text-text-main">Coerência Média por Partido</div></div>
          <div className="p-5 h-[240px] w-full">
            <GraficoBarras data={chartBarrasData} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface border border-border rounded-xl">
            <div className="flex justify-between items-center p-[16px_20px] border-b border-border2">
              <div className="text-[16px] font-bold text-text-main flex items-center gap-2">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                Alertas de Divergência
              </div>
              <span className="text-[11px] font-semibold text-red bg-red-bg border border-red/25 px-2 py-1 rounded-md">Casos Recentes</span>
            </div>
            <div>
              {stats.alertas.map((a, i) => (
                <div 
                  key={i} 
                  onClick={() => navigate(`/politicos/${a.id}`, { state: { politico: a } })}
                  className="flex justify-between items-center p-[14px_20px] border-b border-border2 hover:bg-surface2 transition-colors cursor-pointer last:border-0"
                >
                  <div className={`border-l-3 pl-3 border-red`}>
                    <div className="text-[14px] font-semibold text-text-main flex items-center gap-2 mb-1">
                      {a.nome} <span className="text-[11px] text-teal bg-teal-bg px-1.5 py-0.5 rounded">{a.partido}</span>
                    </div>
                    <div className="text-[12px] text-text2 flex items-center gap-1.5">
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-red"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
                      {a.tema} · {a.data}
                    </div>
                  </div>
                </div>
              ))}
              {stats.alertas.length === 0 && (
                <div className="p-10 text-center text-text3 font-medium">Nenhum alerta recente detectado.</div>
              )}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl">
            <div className="flex justify-between items-center p-[16px_20px] border-b border-border2">
              <div className="text-[16px] font-bold text-text-main">Ranking de Políticos</div>
              <span onClick={() => navigate('/politicos')} className="text-[13px] font-medium text-teal cursor-pointer hover:underline">Ver Todos</span>
            </div>
            <div>
              {top4.map((p, i) => (
                <div 
                  key={i} 
                  onClick={() => navigate(`/politicos/${p.id}`, { state: { politico: p } })}
                  className="flex items-center gap-3.5 p-[14px_20px] border-b border-border2 hover:bg-surface2 transition-colors cursor-pointer last:border-0"
                >
                  <div className="text-[14px] font-bold text-teal w-7 shrink-0">#{i + 1}</div>
                  <img 
                    src={p.foto} 
                    onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nome)}&background=1c2128&color=14b8a6`; }}
                    alt={p.nome} 
                    className="w-9 h-9 rounded-full border border-border shrink-0 object-cover" 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-text-main truncate">{p.nome}</div>
                    <div className="text-[12px] text-teal mt-0.5">{p.partido} - {p.uf}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 min-w-[110px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-text2">Coerência</span>
                      <span className={`text-[14px] font-bold ${p.coerencia >= 70 ? 'text-green' : 'text-red'}`}>{p.coerencia}%</span>
                    </div>
                    <div className="h-[5px] bg-border rounded w-full overflow-hidden">
                      <div className={`h-full rounded transition-all duration-600 ${p.coerencia >= 70 ? 'bg-green' : 'bg-red'}`} style={{ width: `${p.coerencia}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
              {top4.length === 0 && (
                <div className="p-10 text-center text-text3 font-medium">Nenhum parlamentar analisado disponível.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}