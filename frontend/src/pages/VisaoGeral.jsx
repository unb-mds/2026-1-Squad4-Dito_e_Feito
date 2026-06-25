import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraficoTendencias } from '../components/GraficoTendencias';
import { GraficoPartidos } from '../components/GraficoPartidos';
import { GraficoBarras } from '../components/GraficoBarras';
import { MapaBrasil } from '../components/MapaBrasil';
import { politicosMock, alertas } from '../utils/mockData';
import { getDashboardMetrics, getSenadores, getDeputados } from '../services/api';
import { formatTipoParlamentar } from '../utils/formatters';

export function VisaoGeral() {
  const navigate = useNavigate();
  const top4Mock = [...politicosMock].sort((a,b) => b.coerencia - a.coerencia).slice(0, 4);
  const [top4, setTop4] = useState(top4Mock);

  const [metrics, setMetrics] = useState({
    totalAnalisados: '2.847',
    mediaGlobalCoerencia: '73.2%',
    incoerenciasDetectadas: '142',
    partidoMaisCoerente: { partido: 'PSB', media_coerencia: 77.9 }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allPoliticos, setAllPoliticos] = useState(politicosMock);
  const [dataByState, setDataByState] = useState({});

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        let analyzedMap = {};
        let analyzedList = [];
        let totalDivergentes = 0;
        let totalAnalisados = '8';
        let mediaGlobalCoerencia = '69.8%';
        let partidoMaisCoerente = { partido: 'PSB', media_coerencia: 77.9 };
        let top4List = top4Mock;

        // 1. Carrega métricas consolidadas
        const data = await getDashboardMetrics();
        if (data) {
          totalAnalisados = data.total_analisados || 8;
          mediaGlobalCoerencia = `${data.media_global_coerencia ? data.media_global_coerencia.toFixed(1) : '69.8'}%`;
          partidoMaisCoerente = data.partido_mais_coerente || { partido: 'PSB', media_coerencia: 77.9 };

          if (data.senadores) {
            data.senadores.forEach(s => {
              if (s.contagem_status && s.contagem_status.Divergente) {
                totalDivergentes += s.contagem_status.Divergente;
              }
              analyzedMap[s.id] = Math.round(s.score_coerencia || 0);
              analyzedList.push({
                id: s.id,
                nome: s.nome,
                partido: s.partido,
                uf: s.uf,
                foto: s.foto || '',
                coerencia: Math.round(s.score_coerencia || 0),
                tipo: formatTipoParlamentar(s.tipo || s.tipo_parlamentar),
                analisado: true
              });
            });
          }
          
          if (data.deputados) {
            data.deputados.forEach(d => {
              if (d.contagem_status && d.contagem_status.Divergente) {
                totalDivergentes += d.contagem_status.Divergente;
              }
              analyzedMap[d.id] = Math.round(d.score_coerencia || 0);
              analyzedList.push({
                id: d.id,
                nome: d.nome,
                partido: d.partido,
                uf: d.uf,
                foto: d.foto || '',
                coerencia: Math.round(d.score_coerencia || 0),
                tipo: formatTipoParlamentar(d.tipo || d.tipo_parlamentar),
                analisado: true
              });
            });
          }
          
          if (analyzedList.length === 0) {
            analyzedList = politicosMock;
          }

          if (analyzedList.length > 0) {
            top4List = [...analyzedList].sort((a, b) => b.coerencia - a.coerencia).slice(0, 4);
          }
        } else {
            analyzedList = politicosMock;
        }

        // Group analyzed list by state to pass to Map
        const ufMap = {};
        analyzedList.forEach(p => {
          if (p.uf) {
            if (!ufMap[p.uf]) ufMap[p.uf] = { soma: 0, count: 0 };
            if (p.analisado !== false) {
                ufMap[p.uf].soma += p.coerencia;
                ufMap[p.uf].count += 1;
            }
          }
        });
        
        const finalMapData = {};
        for (const [uf, data] of Object.entries(ufMap)) {
            if (data.count > 0) {
                finalMapData[uf] = { coerencia: Math.round(data.soma / data.count), total: data.count };
            }
        }
        setDataByState(finalMapData);

        setMetrics({
          totalAnalisados,
          mediaGlobalCoerencia,
          incoerenciasDetectadas: totalDivergentes || 14,
          partidoMaisCoerente
        });
        setTop4(top4List);

        // 2. Carrega todos os senadores e deputados para a busca (em paralelo)
        const [senadoresRes, deputadosRes] = await Promise.allSettled([
          getSenadores(),
          getDeputados()
        ]);

        let combined = [...analyzedList];
        let combinedKeys = new Set(analyzedList.map(p => String(p.id)));

        if (senadoresRes.status === 'fulfilled' && senadoresRes.value?.status === 'ok') {
          senadoresRes.value.dados.forEach(s => {
            const idStr = String(s.id);
            if (!combinedKeys.has(idStr)) {
              combined.push({
                id: s.id,
                nome: s.nome,
                partido: s.partido,
                uf: s.uf,
                foto: s.foto || '',
                coerencia: null,
                tipo: 'Senador',
                analisado: false
              });
              combinedKeys.add(idStr);
            }
          });
        }

        if (deputadosRes.status === 'fulfilled' && deputadosRes.value?.status === 'ok') {
          deputadosRes.value.dados.forEach(d => {
            const idStr = String(d.id);
            if (!combinedKeys.has(idStr)) {
              combined.push({
                id: d.id,
                nome: d.nome,
                partido: d.partido,
                uf: d.uf,
                foto: d.foto || '',
                coerencia: null,
                tipo: 'Deputado',
                analisado: false
              });
              combinedKeys.add(idStr);
            }
          });
        }

        if (combined.length > 0) {
          setAllPoliticos(combined);
        }
      } catch (err) {
        console.error("Erro ao obter métricas da API:", err);
      }
    };
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = allPoliticos.filter(p =>
      p.nome.toLowerCase().includes(term) ||
      p.partido.toLowerCase().includes(term)
    );
    setSearchResults(filtered);
  }, [searchTerm, allPoliticos]);

  return (
    <div className="flex flex-col flex-1 animate-[fadeIn_0.2s_ease]">
      <div className="p-4 md:p-[16px_32px] border-b border-border shrink-0">
        <div className="relative max-w-[600px] mx-auto">
          <svg className="absolute left-[15px] top-1/2 -translate-y-1/2 text-text3 pointer-events-none" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input 
            className="w-full bg-surface2 border border-border rounded-full p-[10px_18px_10px_42px] text-[14px] text-text-main outline-none focus:border-teal transition-colors" 
            type="text" 
            placeholder="Buscar político por nome ou partido..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div className="absolute top-[48px] left-0 right-0 bg-surface border border-border rounded-xl shadow-2xl z-50 max-h-[300px] overflow-y-auto">
              {searchResults.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => navigate(`/politicos/${p.id}`, { state: { politico: p } })}
                  className="flex items-center gap-3 p-[12px_20px] border-b border-border2 hover:bg-surface2 cursor-pointer last:border-0"
                >
                  <img 
                    src={p.foto || `https://ui-avatars.com/api/?name=${p.nome}&background=1c2128&color=14b8a6`} 
                    onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nome)}&background=1c2128&color=14b8a6`; }}
                    className="w-8 h-8 rounded-full object-cover border border-border" 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-text-main truncate">{p.nome}</div>
                    <div className="text-[12px] text-teal flex gap-1 items-center">
                       <span onClick={(e) => { e.stopPropagation(); navigate(`/partidos/${p.partido.toLowerCase()}`); }} className="hover:underline hover:text-white cursor-pointer">{p.partido}</span> 
                       · 
                       <span onClick={(e) => { e.stopPropagation(); navigate(`/estados/${p.uf.toLowerCase()}`); }} className="hover:underline hover:text-white cursor-pointer">{p.uf}</span> 
                       · {p.tipo}
                    </div>
                  </div>
                  <div className="text-[13px] font-bold text-teal">
                    {p.analisado ? `${p.coerencia}%` : 'Não analisado'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 md:p-[28px_32px] flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
          <div className="bg-surface border border-border rounded-xl p-[20px_24px]">
            <div className="text-[12px] font-semibold text-teal uppercase tracking-[0.06em] mb-2.5">Votos Analisados</div>
            <div className="text-[40px] font-bold text-text-main leading-none mb-3">{metrics.totalAnalisados}</div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-green-bg text-green">↑ 12%</span>
          </div>
          <div className="bg-surface border border-border rounded-xl p-[20px_24px]">
            <div className="text-[12px] font-semibold text-teal uppercase tracking-[0.06em] mb-2.5">Coerência Global</div>
            <div className="text-[40px] font-bold text-text-main leading-none mb-3">{metrics.mediaGlobalCoerencia}</div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-red-bg text-red">↓ 3%</span>
          </div>
          <div className="bg-surface border border-border rounded-xl p-[20px_24px]">
            <div className="text-[12px] font-semibold text-teal uppercase tracking-[0.06em] mb-2.5 flex justify-between items-center">
              Incoerências Detectadas
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-red"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div className="text-[40px] font-bold text-text-main leading-none mb-3">{metrics.incoerenciasDetectadas}</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-[20px_24px]">
            <div className="text-[12px] font-semibold text-teal uppercase tracking-[0.06em] mb-2.5">Partido mais Coerente</div>
            <div className="text-[40px] font-bold text-text-main leading-none mb-3">{metrics.partidoMaisCoerente.partido}</div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-teal-bg text-teal">{metrics.partidoMaisCoerente.media_coerencia}% Coerência</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-4 mb-4">
          <div className="bg-surface border border-border rounded-xl flex flex-col min-h-[400px]">
            <div className="p-[16px_20px] border-b border-border2"><div className="text-[16px] font-bold text-text-main">Mapeamento de Coerência</div></div>
            <div className="p-5 flex-1 flex items-center justify-center relative"><MapaBrasil dataByState={dataByState} /></div>
          </div>
          <div className="bg-surface border border-border rounded-xl flex flex-col">
            <div className="p-[16px_20px] border-b border-border2"><div className="text-[16px] font-bold text-text-main">Comparação por Partido</div></div>
            <div className="p-5 h-[360px] w-full flex items-center justify-center"><GraficoPartidos /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 mb-4">
          <div className="bg-surface border border-border rounded-xl flex flex-col">
            <div className="p-[16px_20px] border-b border-border2"><div className="text-[16px] font-bold text-text-main">Tendências de Coerência</div></div>
            <div className="p-5 h-[260px] w-full"><GraficoTendencias /></div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl mb-4 flex flex-col">
          <div className="p-[16px_20px] border-b border-border2"><div className="text-[16px] font-bold text-text-main">Coerência Média por Partido</div></div>
          <div className="p-5 h-[240px] w-full"><GraficoBarras /></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-surface border border-border rounded-xl">
            <div className="flex justify-between items-center p-[16px_20px] border-b border-border2">
              <div className="text-[16px] font-bold text-text-main flex items-center gap-2">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                Alertas de Divergência
              </div>
              <span className="text-[11px] font-semibold text-red bg-red-bg border border-red/25 px-2 py-1 rounded-md">3 casos graves</span>
            </div>
            <div>
              {alertas.map((a, i) => (
                <div key={i} className="flex justify-between items-center p-[14px_20px] border-b border-border2 hover:bg-surface2 transition-colors cursor-pointer last:border-0">
                  <div className={`border-l-3 pl-3 ${a.grave ? 'border-teal' : 'border-red'}`}>
                    <div className="text-[14px] font-semibold text-text-main flex items-center gap-2 mb-1">
                      {a.nome} 
                      <span onClick={(e) => { e.stopPropagation(); navigate(`/partidos/${a.partido.toLowerCase()}`); }} className="text-[11px] text-teal bg-teal-bg px-1.5 py-0.5 rounded hover:bg-teal hover:text-white transition-colors">{a.partido}</span>
                    </div>
                    <div className="text-[12px] text-text2 flex items-center gap-1.5">
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-red"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
                      {a.tema} · {a.data}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl">
            <div className="flex justify-between items-center p-[16px_20px] border-b border-border2">
              <div className="text-[16px] font-bold text-text-main">Ranking de Políticos</div>
              <span onClick={() => navigate('/politicos')} className="text-[13px] font-medium text-teal cursor-pointer hover:underline">Ver Todos</span>
            </div>
            <div>
              {top4.map((p, i) => (
                <div key={i} onClick={() => navigate(`/politicos/${p.id}`, { state: { politico: p } })} className="flex items-center gap-3.5 p-[14px_20px] border-b border-border2 hover:bg-surface2 transition-colors cursor-pointer last:border-0">
                  <div className="text-[14px] font-bold text-teal w-7 shrink-0">#{i + 1}</div>
                  <img src={p.foto || `https://ui-avatars.com/api/?name=${p.nome}&background=1c2128&color=14b8a6`} alt={p.nome} className="w-9 h-9 rounded-full border border-border shrink-0 object-cover" />
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
                    <div className="text-[12px] text-teal mt-0.5 flex gap-1 items-center">
                       <span onClick={(e) => { e.stopPropagation(); navigate(`/partidos/${p.partido.toLowerCase()}`); }} className="hover:underline hover:text-white">{p.partido}</span>
                       -
                       <span onClick={(e) => { e.stopPropagation(); navigate(`/estados/${p.uf.toLowerCase()}`); }} className="hover:underline hover:text-white">{p.uf}</span>
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}