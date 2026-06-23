import React, { useState, useEffect } from 'react';
import { politicosMock } from '../utils/mockData';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getDashboardMetrics } from '../services/api';

export function Comparacao() {
  const [slotA, setSlotA] = useState(null);
  const [slotB, setSlotB] = useState(null);
  const [modalOpen, setModalOpen] = useState(null); // 'A' or 'B'
  const [politicosList, setPoliticosList] = useState(politicosMock);
  const [metricsData, setMetricsData] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    const loadRealPoliticos = async () => {
      try {
        const data = await getDashboardMetrics();
        if (data) {
          setMetricsData(data);
          if (data.senadores && data.senadores.length > 0) {
            const mapped = data.senadores.map(s => ({
              id: s.id,
              nome: s.nome,
              partido: s.partido,
              uf: s.uf,
              foto: s.foto || '',
              coerencia: Math.round(s.score_coerencia || 0),
              tipo: s.tipo || 'Senador',
              detalhes: s.detalhes || []
            }));
            setPoliticosList(mapped);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar políticos para comparação:", err);
      }
    };
    loadRealPoliticos();
  }, []);

  const getPartyAverage = (partido) => {
    if (!metricsData || !metricsData.metricas_por_partido) return 70;
    const pInfo = metricsData.metricas_por_partido.find(p => p.partido === partido);
    return pInfo ? Math.round(pInfo.media_coerencia) : 70;
  };

  const getBarChartData = () => {
    if (!slotA || !slotB) return [];
    const avgA = getPartyAverage(slotA.partido);
    const avgB = getPartyAverage(slotB.partido);
    return [
      { name: slotA.nome, Coerencia: slotA.coerencia, label: slotA.nome, fill: '#14b8a6' },
      { name: `Média ${slotA.partido}`, Coerencia: avgA, label: `Média ${slotA.partido}`, fill: '#0d9488' },
      { name: slotB.nome, Coerencia: slotB.coerencia, label: slotB.nome, fill: '#ec4899' },
      { name: `Média ${slotB.partido}`, Coerencia: avgB, label: `Média ${slotB.partido}`, fill: '#db2777' }
    ];
  };

  const getLineChartData = () => {
    if (!slotA || !slotB) return [];
    
    const mesesMap = {};
    const mesesAbreviados = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    const processarVotos = (detalhes, key) => {
      if (!detalhes) return;
      detalhes.forEach(v => {
        if (!v.data || v.data === 'N/A') return;
        const dataObj = new Date(v.data);
        if (isNaN(dataObj)) return;
        const chave = `${dataObj.getFullYear()}-${String(dataObj.getMonth() + 1).padStart(2, '0')}`;
        if (!mesesMap[chave]) {
          mesesMap[chave] = {
            nome: `${mesesAbreviados[dataObj.getMonth()]}/${String(dataObj.getFullYear()).slice(2)}`,
            somaA: 0, countA: 0,
            somaB: 0, countB: 0
          };
        }
        if (key === 'A') {
          mesesMap[chave].somaA += (v.afinidade * 100);
          mesesMap[chave].countA += 1;
        } else {
          mesesMap[chave].somaB += (v.afinidade * 100);
          mesesMap[chave].countB += 1;
        }
      });
    };

    processarVotos(slotA.detalhes, 'A');
    processarVotos(slotB.detalhes, 'B');

    const formatoHistorico = Object.keys(mesesMap).sort().map(chave => {
      const item = { mes: mesesMap[chave].nome };
      if (mesesMap[chave].countA > 0) {
        item[slotA.nome] = Math.round(mesesMap[chave].somaA / mesesMap[chave].countA);
      }
      if (mesesMap[chave].countB > 0) {
        item[slotB.nome] = Math.round(mesesMap[chave].somaB / mesesMap[chave].countB);
      }
      return item;
    });

    if (formatoHistorico.length < 2) {
      const maxLen = Math.max(slotA.detalhes?.length || 0, slotB.detalhes?.length || 0);
      const limit = Math.min(6, maxLen);
      const fallbacks = [];
      for (let i = 0; i < limit; i++) {
        const item = { mes: `Voto ${i + 1}` };
        if (slotA.detalhes && slotA.detalhes[i]) {
          item[slotA.nome] = Math.round(slotA.detalhes[i].afinidade * 100);
        }
        if (slotB.detalhes && slotB.detalhes[i]) {
          item[slotB.nome] = Math.round(slotB.detalhes[i].afinidade * 100);
        }
        fallbacks.push(item);
      }
      return fallbacks;
    }

    return formatoHistorico;
  };

  const availablePol = politicosList.filter(p => modalOpen === 'A' ? p.id !== slotB?.id : p.id !== slotA?.id);

  const filteredAvailablePol = availablePol.filter(p => 
    p.nome.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.partido.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const selectPolitico = (p) => {
    if (modalOpen === 'A') setSlotA(p);
    else setSlotB(p);
    setModalOpen(null);
    setSearchFilter('');
  };

  const renderSlot = (slot, setSlot, slotName) => {
    if (!slot) {
      return (
        <div onClick={() => setModalOpen(slotName)} className="bg-surface border-2 border-dashed border-border rounded-xl p-[40px_20px] flex flex-col items-center gap-2.5 cursor-pointer hover:border-teal transition-colors min-h-[180px] justify-center">
          <div className="text-[28px] text-text3">+</div>
          <div className="text-[13px] text-text2 font-medium">Selecionar Político</div>
        </div>
      );
    }
    return (
      <div className="bg-surface border-2 border-solid border-border rounded-xl p-[40px_20px] flex flex-col items-center gap-2.5 min-h-[180px] justify-center relative">
        <button onClick={() => setSlot(null)} className="absolute top-2.5 right-2.5 w-6 h-6 bg-red rounded-full flex items-center justify-center text-white text-[14px] font-bold">✕</button>
        <img src={slot.foto || `https://ui-avatars.com/api/?name=${slot.nome}&background=1c2128&color=14b8a6`} alt={slot.nome} className="w-12 h-12 rounded-full border border-border object-cover" />
        <div className="text-[18px] font-bold text-text-main text-center">{slot.nome}</div>
        <div className="text-[13px] text-teal">{slot.partido} · {slot.uf}</div>
      </div>
    );
  };

  const slotAHasData = !!(slotA && slotA.coerencia !== null && slotA.coerencia !== undefined && slotA.detalhes && slotA.detalhes.length > 0);
  const slotBHasData = !!(slotB && slotB.coerencia !== null && slotB.coerencia !== undefined && slotB.detalhes && slotB.detalhes.length > 0);
  const bothHaveData = slotAHasData && slotBHasData;

  return (
    <div className="flex flex-col flex-1 animate-[fadeIn_0.2s_ease] relative">
      <div className="p-4 md:p-[16px_32px] border-b border-border shrink-0">
        <div className="text-[20px] font-bold text-text-main">Comparação (VS)</div>
        <div className="text-[13px] text-text2 mt-1">Selecione dois parlamentares para comparar seus dados de coerência.</div>
      </div>

      <div className="p-4 md:p-[28px_32px] flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {renderSlot(slotA, setSlotA, 'A')}
          {renderSlot(slotB, setSlotB, 'B')}
        </div>

        {slotA && slotB && (
          <div>
            <div className="bg-surface border border-border rounded-xl mb-4">
              <div className="p-[16px_20px] border-b border-border2"><div className="text-[16px] font-bold text-text-main">Coerência Geral Comparada</div></div>
              <div className="p-5 h-[320px] w-full flex items-center justify-center">
                {bothHaveData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getBarChartData()}
                      margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                      barSize={50}
                    >
                      <CartesianGrid strokeDasharray="0" stroke="#30363d" vertical={false} />
                      <XAxis dataKey="name" stroke="#8b949e" tickLine={false} axisLine={false} fontSize={11} />
                      <YAxis stroke="#8b949e" domain={[0, 100]} tickFormatter={(val) => `${val}%`} tickLine={false} axisLine={false} fontSize={11} />
                      <Tooltip
                        cursor={{ fill: '#1c2128', opacity: 0.3 }}
                        contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '6px', color: '#e6edf3' }}
                      />
                      <Bar dataKey="Coerencia" radius={[8, 8, 0, 0]}>
                        {getBarChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center flex flex-col items-center justify-center max-w-md px-4 py-8">
                    <svg className="w-12 h-12 text-text3 mb-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h4 className="text-[15px] font-semibold text-text-main mb-1">Dados Insuficientes para Comparação</h4>
                    <p className="text-[13px] text-text2">
                      {!slotAHasData && !slotBHasData 
                        ? `Ambos os parlamentares selecionados (${slotA.nome} e ${slotB.nome}) não possuem dados de votação suficientes.`
                        : !slotAHasData 
                          ? `O parlamentar ${slotA.nome} não possui dados de votação suficientes para gerar o gráfico.`
                          : `O parlamentar ${slotB.nome} não possui dados de votação suficientes para gerar o gráfico.`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Gráfico de Histórico de Coerência Comparado */}
            <div className="bg-surface border border-border rounded-xl mb-4">
              <div className="p-[16px_20px] border-b border-border2">
                <div className="text-[16px] font-bold text-text-main">Histórico de Coerência Comparado</div>
              </div>
              <div className="p-5 h-[320px] w-full flex items-center justify-center">
                {bothHaveData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getLineChartData()} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="0" stroke="#30363d" vertical={false} />
                      <XAxis dataKey="mes" stroke="#8b949e" tickLine={false} axisLine={false} fontSize={11} />
                      <YAxis stroke="#8b949e" domain={[50, 100]} tickFormatter={(val) => `${val}%`} tickLine={false} axisLine={false} fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '6px', color: '#e6edf3' }}
                      />
                      <Line type="monotone" dataKey={slotA.nome} stroke="#14b8a6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey={slotB.nome} stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center flex flex-col items-center justify-center max-w-md px-4 py-8">
                    <svg className="w-12 h-12 text-text3 mb-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h4 className="text-[15px] font-semibold text-text-main mb-1">Dados Insuficientes para Comparação</h4>
                    <p className="text-[13px] text-text2">
                      {!slotAHasData && !slotBHasData 
                        ? `Ambos os parlamentares selecionados (${slotA.nome} e ${slotB.nome}) não possuem dados de votação suficientes.`
                        : !slotAHasData 
                          ? `O parlamentar ${slotA.nome} não possui dados de votação suficientes para gerar o gráfico.`
                          : `O parlamentar ${slotB.nome} não possui dados de votação suficientes para gerar o gráfico.`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[slotA, slotB].map((s, i) => (
                <div key={i} className="bg-surface border border-border rounded-xl p-5">
                  <div className="text-[16px] font-bold text-text-main mb-4">Alinhamento Global de {s.nome}</div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] text-text2">Score</span>
                    <span className="text-[16px] font-bold text-teal">{s.coerencia !== null && s.coerencia !== undefined ? `${s.coerencia}%` : 'N/A'}</span>
                  </div>
                  <div className="h-[5px] bg-border rounded w-full overflow-hidden">
                    <div className="h-full bg-green rounded" style={{ width: `${s.coerencia || 0}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => { setModalOpen(null); setSearchFilter(''); }}>
          <div className="bg-surface border border-border rounded-[14px] w-[440px] max-h-[70vh] flex flex-col overflow-hidden animate-[fadeIn_0.15s_ease]" onClick={e => e.stopPropagation()}>
            <div className="p-[16px_20px] border-b border-border flex justify-between items-center shrink-0">
              <div className="text-[16px] font-bold text-text-main">Selecionar Político</div>
              <button onClick={() => { setModalOpen(null); setSearchFilter(''); }} className="text-text2 hover:text-white text-[18px]">✕</button>
            </div>
            <div className="p-3 border-b border-border shrink-0">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Buscar por nome ou partido..."
                className="w-full bg-surface2 border border-border rounded-lg p-2 text-sm text-text-main outline-none focus:border-teal"
              />
            </div>
            <div className="overflow-y-auto flex-1 max-h-[40vh]">
              {filteredAvailablePol.map((p, i) => (
                <div key={i} onClick={() => selectPolitico(p)} className="flex items-center gap-3 p-[12px_20px] border-b border-border2 hover:bg-surface2 cursor-pointer last:border-0">
                  <img 
                    src={p.foto || `https://ui-avatars.com/api/?name=${p.nome}&background=1c2128&color=14b8a6`} 
                    onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nome)}&background=1c2128&color=14b8a6`; }}
                    className="w-8 h-8 rounded-full object-cover" 
                  />
                  <div>
                    <div className="text-[14px] font-semibold text-text-main">{p.nome}</div>
                    <div className="text-[12px] text-teal">{p.partido} · {p.uf}</div>
                  </div>
                </div>
              ))}
              {filteredAvailablePol.length === 0 && (
                <div className="p-6 text-center text-text3 text-sm">Nenhum político encontrado.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}