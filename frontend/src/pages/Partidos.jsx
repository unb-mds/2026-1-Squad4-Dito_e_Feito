import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSenadores, getDeputados } from '../services/api';
import { politicosMock } from '../utils/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MapaBrasil } from '../components/MapaBrasil';
import { GraficoTendencias } from '../components/GraficoTendencias';
import { getPartidoLogo, getEstadoFlag } from '../utils/formatters';

export function Partidos() {
  const { sigla } = useParams();
  const navigate = useNavigate();
  const [dataByPartido, setDataByPartido] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [senadoresRes, deputadosRes] = await Promise.allSettled([
          getSenadores(),
          getDeputados()
        ]);
        
        let politicos = [];

        if (senadoresRes.status === 'fulfilled' && senadoresRes.value?.status === 'ok') {
          politicos = [...politicos, ...senadoresRes.value.dados.map(s => {
            const mock = politicosMock.find(m => String(m.id) === String(s.id));
            return { ...s, coerencia: mock ? mock.coerencia : null, analisado: !!mock };
          })];
        }
        if (deputadosRes.status === 'fulfilled' && deputadosRes.value?.status === 'ok') {
          politicos = [...politicos, ...deputadosRes.value.dados.map(d => {
            const mock = politicosMock.find(m => String(m.id) === String(d.id));
            return { ...d, coerencia: mock ? mock.coerencia : null, analisado: !!mock };
          })];
        }

        if (politicos.length === 0) {
          politicos = politicosMock.map(p => ({ ...p, analisado: true }));
        }

        const partidoMap = {};

        politicos.forEach(p => {
          if (p.partido) {
            if (!partidoMap[p.partido]) {
              partidoMap[p.partido] = { sigla: p.partido, politicos: [], somaCoerencia: 0, countAnalisados: 0 };
            }
            partidoMap[p.partido].politicos.push(p);
            if (p.analisado && p.coerencia) {
              partidoMap[p.partido].somaCoerencia += p.coerencia;
              partidoMap[p.partido].countAnalisados += 1;
            }
          }
        });

        const list = Object.values(partidoMap).map(p => ({
          ...p,
          media: p.countAnalisados > 0 ? Math.round(p.somaCoerencia / p.countAnalisados) : 0
        })).sort((a, b) => b.politicos.length - a.politicos.length);

        setDataByPartido(list);
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
              src={getPartidoLogo(payload[0].payload.sigla)} 
              alt={payload[0].payload.sigla} 
              referrerPolicy="no-referrer"
              className="w-5 h-5 object-contain"
            />
            <p className="text-[14px] font-bold text-text-main">{payload[0].payload.sigla}</p>
          </div>
          <p className="text-[13px] text-teal">Coerência: {payload[0].value}%</p>
          <p className="text-[12px] text-text2 mt-1">{payload[0].payload.countAnalisados} analisados</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-text2">Carregando dados dos partidos...</div>;
  }

  if (sigla) {
    const selectedSigla = sigla.toUpperCase();
    const partido = dataByPartido.find(p => p.sigla === selectedSigla);
    
    if (!partido) return <div className="p-8 text-text-main">Partido não encontrado.</div>;

    const topPoliticos = [...partido.politicos]
      .filter(p => p.analisado)
      .sort((a, b) => b.coerencia - a.coerencia);
      
    const ufMapForParty = {};
    topPoliticos.forEach(p => {
      if (p.uf) {
        if (!ufMapForParty[p.uf]) ufMapForParty[p.uf] = { soma: 0, count: 0 };
        ufMapForParty[p.uf].soma += p.coerencia;
        ufMapForParty[p.uf].count += 1;
      }
    });
    const mapDataForParty = {};
    for (const [uf, data] of Object.entries(ufMapForParty)) {
      if (data.count > 0) {
        mapDataForParty[uf] = { coerencia: Math.round(data.soma / data.count), total: data.count };
      }
    }

    let mostCoherentState = null;
    let maxStateCoherence = -1;
    for (const [uf, data] of Object.entries(mapDataForParty)) {
      if (data.coerencia > maxStateCoherence) {
        maxStateCoherence = data.coerencia;
        mostCoherentState = uf;
      }
    }

    const mostCoherentPolitician = topPoliticos.length > 0 ? topPoliticos[0] : null;

    return (
      <div className="flex flex-col flex-1 animate-[fadeIn_0.2s_ease]">
        <div className="p-4 md:p-[28px_32px] border-b border-border shrink-0 bg-surface">
          <button onClick={() => navigate('/partidos')} className="text-[13px] font-semibold text-teal mb-4 hover:underline flex items-center gap-1">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Voltar para todos os partidos
          </button>
          <div className="flex items-center gap-4">
            <img 
              src={getPartidoLogo(partido.sigla)} 
              alt={partido.sigla} 
              referrerPolicy="no-referrer"
              className="w-16 h-16 bg-surface2 border border-border rounded-xl object-contain p-2"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(partido.sigla)}&background=1c2128&color=14b8a6&size=128&bold=true`;
              }}
            />
            <div>
              <h1 className="text-[28px] font-bold text-text-main leading-tight">Partido {partido.sigla}</h1>
              <div className="text-[14px] text-text2 mt-1">
                Tamanho da bancada: {partido.politicos.length} representantes • {partido.countAnalisados} analisados
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-[28px_32px] flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
            <div className="bg-surface border border-border rounded-xl p-[20px_24px]">
              <div className="text-[12px] font-semibold text-teal uppercase tracking-[0.06em] mb-2.5">Média da Bancada</div>
              <div className="text-[40px] font-bold text-text-main leading-none mb-3">
                {partido.countAnalisados > 0 ? `${partido.media}%` : '--'}
              </div>
              {partido.countAnalisados > 0 && (
                <div className="mt-4 h-[5px] w-full bg-surface2 rounded-full overflow-hidden">
                  <div className="h-full bg-teal" style={{width: `${partido.media}%`}}></div>
                </div>
              )}
            </div>
            <div className="bg-surface border border-border rounded-xl p-[20px_24px]">
              <div className="text-[12px] font-semibold text-teal uppercase tracking-[0.06em] mb-2.5">Total de Analisados</div>
              <div className="text-[40px] font-bold text-text-main leading-none mb-3">{partido.countAnalisados}</div>
              <div className="text-[12px] text-text2 mt-2">de {partido.politicos.length} membros da bancada</div>
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
              <div className="text-[12px] font-semibold text-teal uppercase tracking-[0.06em] mb-2.5">Estado Mais Coerente</div>
              <div className="text-[40px] font-bold text-text-main leading-none mb-3 flex items-center gap-2">
                {mostCoherentState && (
                  <img src={getEstadoFlag(mostCoherentState)} alt={mostCoherentState} className="w-8 h-8 rounded-full object-cover" />
                )}
                {mostCoherentState || '--'}
              </div>
              {mostCoherentState && mapDataForParty[mostCoherentState] && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-teal-bg text-teal">
                  {mapDataForParty[mostCoherentState].coerencia}% Coerência Média
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-4 mb-4">
            <div className="bg-surface border border-border rounded-xl flex flex-col min-h-[400px]">
              <div className="p-[16px_20px] border-b border-border2"><div className="text-[16px] font-bold text-text-main">Mapeamento da Coerência do Partido</div></div>
              <div className="p-5 flex-1 flex items-center justify-center relative">
                <MapaBrasil dataByState={mapDataForParty} />
              </div>
            </div>
            <div className="bg-surface border border-border rounded-xl flex flex-col">
              <div className="p-[16px_20px] border-b border-border2">
                <div className="text-[16px] font-bold text-text-main">Evolução da Coerência</div>
              </div>
              <div className="p-5 flex-1 flex flex-col items-center justify-center relative min-h-[260px]">
                 <GraficoTendencias />
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl">
            <div className="p-[16px_20px] border-b border-border2 flex justify-between items-center">
              <div className="text-[16px] font-bold text-text-main">Ranking de Políticos do Partido</div>
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
                         <img src={getEstadoFlag(p.uf)} alt={p.uf} className="w-4 h-4 rounded-full object-cover" />
                         <span onClick={(e) => { e.stopPropagation(); navigate(`/estados/${p.uf.toLowerCase()}`); }} className="hover:underline hover:text-white cursor-pointer font-medium">{p.uf}</span>
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
                <div className="p-8 text-center text-text2 italic">Nenhum político deste partido analisado ainda.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const chartData = [...dataByPartido]
    .filter(p => p.countAnalisados > 0)
    .sort((a, b) => b.media - a.media)
    .slice(0, 15);
    
  const totalAnalisados = dataByPartido.reduce((acc, p) => acc + p.countAnalisados, 0);
  const totalSomaCoerencia = dataByPartido.reduce((acc, p) => acc + (p.somaCoerencia || 0), 0);
  const mediaGeral = totalAnalisados > 0 ? Math.round(totalSomaCoerencia / totalAnalisados) : 0;
  
  const partidosComDados = dataByPartido.filter(p => p.countAnalisados > 0);
  let partidoMaisCoerente = null;
  let partidoMenosCoerente = null;
  
  if (partidosComDados.length > 0) {
    const sorted = [...partidosComDados].sort((a, b) => b.media - a.media);
    partidoMaisCoerente = sorted[0];
    partidoMenosCoerente = sorted[sorted.length - 1];
  }

  const sortedAllParties = [...dataByPartido].sort((a, b) => b.media - a.media);

  return (
    <div className="flex flex-col flex-1 animate-[fadeIn_0.2s_ease]">
      <div className="p-4 md:p-[28px_32px] border-b border-border shrink-0 bg-surface">
        <h1 className="text-[24px] font-bold text-text-main">Partidos</h1>
        <p className="text-[14px] text-text2 mt-1">Dashboard geral de coerência e distribuição da bancada por partido.</p>
      </div>

      <div className="p-4 md:p-[28px_32px] flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div className="bg-surface border border-border rounded-xl p-[20px_24px]">
            <div className="text-[12px] font-semibold text-teal uppercase tracking-[0.06em] mb-2.5">Média Geral</div>
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
            <div className="text-[12px] text-text2 mt-2">em {dataByPartido.length} partidos</div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-[20px_24px]">
            <div className="text-[12px] font-semibold text-teal uppercase tracking-[0.06em] mb-2.5">Mais Coerente</div>
            <div className="text-[32px] font-bold text-text-main leading-none mb-3 flex items-center gap-2">
              {partidoMaisCoerente && (
                <img 
                  src={getPartidoLogo(partidoMaisCoerente.sigla)} 
                  alt={partidoMaisCoerente.sigla} 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 object-contain"
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${partidoMaisCoerente.sigla}&background=1c2128&color=14b8a6`; }}
                />
              )}
              {partidoMaisCoerente ? partidoMaisCoerente.sigla : '--'}
            </div>
            {partidoMaisCoerente && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-teal-bg text-teal">
                {partidoMaisCoerente.media}% Coerência
              </span>
            )}
          </div>

          <div className="bg-surface border border-border rounded-xl p-[20px_24px]">
            <div className="text-[12px] font-semibold text-teal uppercase tracking-[0.06em] mb-2.5">Menos Coerente</div>
            <div className="text-[32px] font-bold text-text-main leading-none mb-3 flex items-center gap-2">
              {partidoMenosCoerente && (
                <img 
                  src={getPartidoLogo(partidoMenosCoerente.sigla)} 
                  alt={partidoMenosCoerente.sigla}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 object-contain"
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${partidoMenosCoerente.sigla}&background=1c2128&color=14b8a6`; }}
                />
              )}
              {partidoMenosCoerente ? partidoMenosCoerente.sigla : '--'}
            </div>
            {partidoMenosCoerente && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-red-500/10 text-red-500">
                {partidoMenosCoerente.media}% Coerência
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
          <div className="bg-surface border border-border rounded-xl flex flex-col max-h-[600px]">
            <div className="p-[16px_20px] border-b border-border2">
              <div className="text-[16px] font-bold text-text-main">Ranking de Todos os Partidos</div>
            </div>
            <div className="overflow-y-auto flex-1">
              {sortedAllParties.map((p, i) => (
                <div 
                  key={p.sigla} 
                  onClick={() => navigate(`/partidos/${p.sigla.toLowerCase()}`)} 
                  className="flex items-center gap-3.5 p-[14px_20px] border-b border-border2 hover:bg-surface2 transition-colors cursor-pointer last:border-0"
                >
                  <div className="text-[14px] font-bold text-teal w-7 shrink-0">#{i + 1}</div>
                  <img 
                    src={getPartidoLogo(p.sigla)} 
                    alt={p.sigla} 
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full border border-border bg-surface2 shrink-0 object-contain p-1.5" 
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${p.sigla}&background=1c2128&color=14b8a6`; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-bold text-text-main truncate">{p.sigla}</div>
                    <div className="text-[12px] text-text2 mt-0.5">{p.politicos.length} membros ({p.countAnalisados} analisados)</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 min-w-[110px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-text2">Média</span>
                      <span className="text-[15px] font-bold text-text-main">{p.countAnalisados > 0 ? `${p.media}%` : '--'}</span>
                    </div>
                    {p.countAnalisados > 0 && (
                      <div className="h-[5px] bg-border rounded w-full overflow-hidden">
                        <div className={`h-full rounded transition-all duration-600 ${p.media >= 70 ? 'bg-green' : p.media >= 50 ? 'bg-amber-500' : 'bg-red'}`} style={{ width: `${p.media}%` }}></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {chartData.length > 0 && (
            <div className="bg-surface border border-border rounded-xl flex flex-col max-h-[600px]">
              <div className="p-[16px_20px] border-b border-border2"><div className="text-[16px] font-bold text-text-main">Top 15 Partidos Analisados</div></div>
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
