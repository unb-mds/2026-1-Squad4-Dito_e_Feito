import React, { useState, useEffect, useMemo } from 'react';
import { getDashboardMetrics } from '../services/api';
import { GraficoRadar } from '../components/GraficoRadar';

export function Comparacao() {
  const [slotA, setSlotA] = useState(null);
  const [slotB, setSlotB] = useState(null);
  const [modalOpen, setModalOpen] = useState(null); // 'A' or 'B'
  const [politicos, setPoliticos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const fetchPoliticos = async () => {
      try {
        setLoading(true);
        const data = await getDashboardMetrics();
        if (data && data.senadores) {
          setPoliticos(data.senadores);
        }
      } catch (err) {
        console.error("Erro ao carregar políticos:", err);
        setErro("Não foi possível carregar os parlamentares para comparação.");
      } finally {
        setLoading(false);
      }
    };
    fetchPoliticos();
  }, []);

  const availablePol = useMemo(() => {
    return politicos.filter(p => modalOpen === 'A' ? p.id !== slotB?.id : p.id !== slotA?.id);
  }, [politicos, modalOpen, slotA, slotB]);

  const selectPolitico = (p) => {
    const pMapped = {
      ...p,
      coerencia: Math.round(p.score_coerencia || 0)
    };
    if (modalOpen === 'A') setSlotA(pMapped);
    else setSlotB(pMapped);
    setModalOpen(null);
  };

  const renderSlot = (slot, setSlot, slotName) => {
    if (!slot) {
      return (
        <div onClick={() => setModalOpen(slotName)} className="bg-surface border-2 border-dashed border-border rounded-xl p-[40px_20px] flex flex-col items-center gap-2.5 cursor-pointer hover:border-teal transition-colors min-h-[180px] justify-center animate-[fadeIn_0.2s_ease]">
          <div className="text-[28px] text-text3">+</div>
          <div className="text-[13px] text-text2 font-medium">Selecionar Político</div>
        </div>
      );
    }
    return (
      <div className="bg-surface border-2 border-solid border-border rounded-xl p-[40px_20px] flex flex-col items-center gap-2.5 min-h-[180px] justify-center relative animate-[fadeIn_0.2s_ease]">
        <button onClick={() => setSlot(null)} className="absolute top-2.5 right-2.5 w-6 h-6 bg-red rounded-full flex items-center justify-center text-white text-[14px] font-bold hover:opacity-85 transition-opacity">✕</button>
        <img 
          src={slot.foto} 
          onError={(e) => { slot.foto = `https://ui-avatars.com/api/?name=${encodeURIComponent(slot.nome)}&background=1c2128&color=14b8a6`; e.currentTarget.src = slot.foto; }}
          alt={slot.nome} 
          className="w-12 h-12 rounded-full border border-border object-cover" 
        />
        <div className="text-[18px] font-bold text-text-main text-center">{slot.nome}</div>
        <div className="text-[13px] text-teal">{slot.partido} · {slot.uf}</div>
      </div>
    );
  };

  const radarData = useMemo(() => {
    if (!slotA || !slotB) return [];

    const classificarTema = (texto) => {
      const t = (texto || '').toLowerCase();
      if (t.includes('saúde') || t.includes('sus') || t.includes('hospital')) return 'Saúde';
      if (t.includes('educação') || t.includes('escola') || t.includes('ensino')) return 'Educação';
      if (t.includes('economia') || t.includes('fiscal') || t.includes('imposto')) return 'Economia';
      if (t.includes('segurança') || t.includes('polícia') || t.includes('crime')) return 'Segurança';
      if (t.includes('ambiente') || t.includes('clima') || t.includes('desmatamento')) return 'Meio Ambiente';
      return 'Geral';
    };

    const agrupadoA = {};
    const agrupadoB = {};

    if (slotA.detalhes) {
      slotA.detalhes.forEach(item => {
        const tema = classificarTema(item.ementa);
        if (!agrupadoA[tema]) agrupadoA[tema] = { soma: 0, count: 0 };
        agrupadoA[tema].soma += (item.afinidade * 100);
        agrupadoA[tema].count += 1;
      });
    }

    if (slotB.detalhes) {
      slotB.detalhes.forEach(item => {
        const tema = classificarTema(item.ementa);
        if (!agrupadoB[tema]) agrupadoB[tema] = { soma: 0, count: 0 };
        agrupadoB[tema].soma += (item.afinidade * 100);
        agrupadoB[tema].count += 1;
      });
    }

    const todosTemas = new Set([...Object.keys(agrupadoA), ...Object.keys(agrupadoB)]);
    
    if (todosTemas.size === 0) {
      return [
        { subject: 'Educação', A: slotA.coerencia, B: slotB.coerencia },
        { subject: 'Saúde', A: slotA.coerencia, B: slotB.coerencia },
        { subject: 'Economia', A: slotA.coerencia, B: slotB.coerencia },
        { subject: 'Segurança', A: slotA.coerencia, B: slotB.coerencia },
        { subject: 'Meio Ambiente', A: slotA.coerencia, B: slotB.coerencia },
      ];
    }

    return Array.from(todosTemas).map(tema => {
      const valA = agrupadoA[tema] ? Math.round(agrupadoA[tema].soma / agrupadoA[tema].count) : slotA.coerencia;
      const valB = agrupadoB[tema] ? Math.round(agrupadoB[tema].soma / agrupadoB[tema].count) : slotB.coerencia;
      return {
        subject: tema,
        A: valA,
        B: valB
      };
    });
  }, [slotA, slotB]);

  return (
    <div className="flex flex-col flex-1 animate-[fadeIn_0.2s_ease] relative">
      <div className="p-[16px_32px] border-b border-border shrink-0">
        <div className="text-[20px] font-bold text-text-main">Comparação (VS)</div>
        <div className="text-[13px] text-text2 mt-1">Selecione dois parlamentares para comparar seus dados de coerência.</div>
      </div>

      <div className="p-[28px_32px] flex-1 overflow-y-auto">
        {erro && (
          <div className="bg-red-bg border border-red/20 text-red text-sm p-4 rounded-xl mb-4 text-center">
            {erro}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          {renderSlot(slotA, setSlotA, 'A')}
          {renderSlot(slotB, setSlotB, 'B')}
        </div>

        {loading && modalOpen && (
          <div className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal"></div>
          </div>
        )}

        {slotA && slotB && (
          <div>
            <div className="bg-surface border border-border rounded-xl mb-4">
              <div className="p-[16px_20px] border-b border-border2"><div className="text-[16px] font-bold text-text-main">Comparação por Tema</div></div>
              <div className="p-5 h-[320px] w-full">
                <GraficoRadar data={radarData} nameA={slotA.nome} nameB={slotB.nome} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[slotA, slotB].map((s, i) => (
                <div key={i} className="bg-surface border border-border rounded-xl p-5">
                  <div className="text-[16px] font-bold text-text-main mb-4">Alinhamento com {s.partido}</div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] text-text2">Score</span>
                    <span className="text-[16px] font-bold text-teal">{s.coerencia}%</span>
                  </div>
                  <div className="h-[5px] bg-border rounded w-full overflow-hidden">
                    <div className={`h-full rounded ${s.coerencia >= 70 ? 'bg-green' : 'bg-red'}`} style={{ width: `${s.coerencia}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setModalOpen(null)}>
          <div className="bg-surface border border-border rounded-[14px] w-[440px] max-h-[70vh] overflow-y-auto animate-[fadeIn_0.2s_ease]" onClick={e => e.stopPropagation()}>
            <div className="p-[16px_20px] border-b border-border flex justify-between items-center">
              <div className="text-[16px] font-bold text-text-main">Selecionar Político</div>
              <button onClick={() => setModalOpen(null)} className="text-text2 hover:text-white text-[18px]">✕</button>
            </div>
            <div>
              {availablePol.map((p, i) => (
                <div key={i} onClick={() => selectPolitico(p)} className="flex items-center gap-3 p-[12px_20px] border-b border-border2 hover:bg-surface2 cursor-pointer last:border-0">
                  <img 
                    src={p.foto} 
                    onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nome)}&background=1c2128&color=14b8a6`; }}
                    className="w-8 h-8 rounded-full object-cover" 
                    alt=""
                  />
                  <div>
                    <div className="text-[14px] font-semibold text-text-main">{p.nome}</div>
                    <div className="text-[12px] text-teal">{p.partido} · {p.uf} · {parseInt(p.id) < 10000 ? 'Senador' : 'Deputado'}</div>
                  </div>
                </div>
              ))}
              {availablePol.length === 0 && (
                <div className="p-8 text-center text-text3">Nenhum parlamentar disponível.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}