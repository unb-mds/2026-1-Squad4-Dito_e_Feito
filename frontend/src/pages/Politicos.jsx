import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardMetrics, getSenadores, getDeputados } from '../services/api';
import { formatTipoParlamentar } from '../utils/formatters';

export function Politicos() {
  const [busca, setBusca] = useState('');
  const [filtroPartido, setFiltroPartido] = useState('Todos');
  const [filtroUF, setFiltroUF] = useState('Todos');
  const [sortAsc, setSortAsc] = useState(false);
  const [politicosList, setPoliticosList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRealPoliticos = async () => {
      setLoading(true);
      try {
        // 1. Carrega scores do Supabase
        const metricsData = await getDashboardMetrics();
        const scoreMap = {};
        if (metricsData && metricsData.senadores) {
          metricsData.senadores.forEach(s => {
            scoreMap[String(s.id)] = {
              coerencia: Math.round(s.score_coerencia || 0),
              foto: s.foto || '',
              tipo: formatTipoParlamentar(s.tipo || s.tipo_parlamentar),
              analisado: true
            };
          });
        }

        // 2. Carrega todos os parlamentares em paralelo
        const [senadoresRes, deputadosRes] = await Promise.allSettled([
          getSenadores(),
          getDeputados()
        ]);

        const combined = [];
        const seen = new Set();

        const addPoliticos = (lista, tipoDefault) => {
          lista.forEach(p => {
            const idStr = String(p.id);
            if (seen.has(idStr)) return;
            seen.add(idStr);
            const extra = scoreMap[idStr] || {};
            combined.push({
              id: p.id,
              nome: p.nome,
              partido: p.partido,
              uf: p.uf,
              foto: extra.foto || p.foto || '',
              coerencia: extra.coerencia ?? 0,
              tipo: extra.tipo || tipoDefault,
              analisado: extra.analisado || false
            });
          });
        };

        if (senadoresRes.status === 'fulfilled' && senadoresRes.value?.status === 'ok') {
          addPoliticos(senadoresRes.value.dados, 'Senador');
        }
        if (deputadosRes.status === 'fulfilled' && deputadosRes.value?.status === 'ok') {
          addPoliticos(deputadosRes.value.dados, 'Deputado');
        }

        // Fallback: se nem senadores nem deputados carregaram, usa direto as métricas
        if (combined.length === 0 && metricsData && metricsData.senadores) {
          metricsData.senadores.forEach(s => {
            combined.push({
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

        setPoliticosList(combined);
      } catch (err) {
        console.error('Erro ao carregar políticos:', err);
      } finally {
        setLoading(false);
      }
    };
    loadRealPoliticos();
  }, []);

  const partidosUnicos = useMemo(() => {
    return ['Todos', ...new Set(politicosList.map(p => p.partido))].sort();
  }, [politicosList]);

  const ufsUnicas = useMemo(() => {
    return ['Todos', ...new Set(politicosList.map(p => p.uf))].sort();
  }, [politicosList]);

  const filtered = useMemo(() => {
    let result = politicosList.filter(p => {
      const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase()) || p.partido.toLowerCase().includes(busca.toLowerCase());
      const matchPartido = filtroPartido === 'Todos' || p.partido === filtroPartido;
      const matchUF = filtroUF === 'Todos' || p.uf === filtroUF;
      return matchBusca && matchPartido && matchUF;
    });

    return result.sort((a, b) => sortAsc ? a.coerencia - b.coerencia : b.coerencia - a.coerencia);
  }, [busca, filtroPartido, filtroUF, sortAsc, politicosList]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-text2">Carregando parlamentares...</div>;
  }

  return (
    <div className="flex flex-col flex-1 animate-[fadeIn_0.2s_ease]">
      <div className="p-4 md:p-[16px_32px] border-b border-border shrink-0">
        <div className="text-[20px] font-bold text-text-main">Busca Avançada</div>
        <div className="text-[13px] text-text2 mt-1">Filtre parlamentares por nome, partido ou estado.</div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-5">
          <div className="relative flex-1 min-w-[250px]">
            <svg className="absolute left-[15px] top-1/2 -translate-y-1/2 text-text3 pointer-events-none" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-surface2 border border-border rounded-lg p-[10px_18px_10px_42px] text-[14px] text-text-main outline-none focus:border-teal transition-colors" 
              type="text" 
              placeholder="Buscar político por nome ou partido..." 
            />
          </div>
          <select 
            value={filtroPartido} onChange={(e) => setFiltroPartido(e.target.value)}
            className="bg-surface2 border border-border rounded-lg p-[10px_16px] text-[14px] text-text-main outline-none focus:border-teal cursor-pointer min-w-[140px]"
          >
            {partidosUnicos.map(pt => <option key={pt} value={pt} className="bg-surface text-text-main">{pt === 'Todos' ? 'Qualquer Partido' : pt}</option>)}
          </select>
          <select 
            value={filtroUF} onChange={(e) => setFiltroUF(e.target.value)}
            className="bg-surface2 border border-border rounded-lg p-[10px_16px] text-[14px] text-text-main outline-none focus:border-teal cursor-pointer min-w-[140px]"
          >
            {ufsUnicas.map(uf => <option key={uf} value={uf} className="bg-surface text-text-main">{uf === 'Todos' ? 'Qualquer Estado' : uf}</option>)}
          </select>
        </div>
      </div>

      <div className="p-4 md:p-[28px_32px] flex-1 overflow-y-auto">
        <div className="bg-surface border border-border rounded-xl">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-4 md:p-[16px_20px] border-b border-border2">
            <div className="text-[16px] font-bold text-text-main flex items-center gap-2">
              Listagem Geral de Parlamentares <span className="bg-surface2 px-2 py-0.5 rounded text-[12px] text-teal">{filtered.length}</span>
            </div>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className={`
                flex items-center gap-1.5
                rounded-lg p-[8px_16px]
                text-[13px] font-semibold text-white
                transition-all duration-200 hover:opacity-85
                ${sortAsc ? 'bg-red' : 'bg-teal'}
              `}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`transition-transform duration-300 ${!sortAsc ? 'rotate-180' : ''}`}
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="5 12 12 19 19 12" />
              </svg>
              {sortAsc ? 'Menos Coerentes' : 'Mais Coerentes'}
            </button>
          </div>
          <div>
            {filtered.map((p, i) => (
              <Link to={`/politicos/${p.id}`} state={{ politico: p }} key={i} className="flex flex-col sm:flex-row sm:items-center gap-3.5 p-4 md:p-[14px_20px] border-b border-border2 hover:bg-surface2 transition-colors cursor-pointer last:border-0">
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <img
                    src={p.foto}
                    alt={p.nome}
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nome)}&background=1c2128&color=14b8a6`;
                    }}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-border shrink-0 object-cover"
                  />                
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-text-main hover:text-teal transition-colors flex items-center gap-2 flex-wrap">
                      {p.nome}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                        p.tipo && p.tipo.toLowerCase().includes('senad')
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {p.tipo && p.tipo.toLowerCase().includes('senad') ? 'Senador' : 'Deputado'}
                      </span>
                    </div>
                    <div className="text-[12px] text-text2 mt-0.5">
                      {p.partido} · {p.uf}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t border-border sm:border-t-0 pt-2 sm:pt-0 mt-1 sm:mt-0">
                  <svg className={`${p.coerencia >= 70 ? 'text-green' : 'text-red'}`} width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><polyline points={p.coerencia >= 70 ? '22 7 13.5 15.5 8.5 10.5 2 17' : '22 17 13.5 8.5 8.5 13.5 2 7'}/><polyline points={p.coerencia >= 70 ? '16 7 22 7 22 13' : '16 17 22 17 22 11'}/></svg>
                  <div className={`text-[22px] font-bold w-[62px] text-right ${p.coerencia >= 70 ? 'text-green' : 'text-red'}`}>
                    {p.coerencia}%
                  </div>
                  <div className="w-[90px]">
                    <div className="h-[5px] bg-border rounded w-full overflow-hidden">
                      <div className={`h-full rounded ${p.coerencia >= 70 ? 'bg-green' : 'bg-red'}`} style={{ width: `${p.coerencia}%` }}></div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {filtered.length === 0 && (
              <div className="p-10 text-center text-text3 font-medium">Nenhum parlamentar encontrado com esses filtros.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}