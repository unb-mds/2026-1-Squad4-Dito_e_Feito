import React, { useState } from 'react';
import { politicosMock } from './VisaoGeral';
import { GraficoRadar } from '../components/GraficoRadar';

export function Comparacao() {
  const [slotA, setSlotA] = useState(null);
  const [slotB, setSlotB] = useState(null);
  const [modalOpen, setModalOpen] = useState(null); // 'A' or 'B'

  const availablePol = politicosMock.filter(p => modalOpen === 'A' ? p.id !== slotB?.id : p.id !== slotA?.id);

  const selectPolitico = (p) => {
    if (modalOpen === 'A') setSlotA(p);
    else setSlotB(p);
    setModalOpen(null);
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

  return (
    <div className="flex flex-col flex-1 animate-[fadeIn_0.2s_ease] relative">
      <div className="p-[16px_32px] border-b border-border shrink-0">
        <div className="text-[20px] font-bold text-text-main">Comparação (VS)</div>
        <div className="text-[13px] text-text2 mt-1">Selecione dois parlamentares para comparar seus dados de coerência.</div>
      </div>

      <div className="p-[28px_32px] flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {renderSlot(slotA, setSlotA, 'A')}
          {renderSlot(slotB, setSlotB, 'B')}
        </div>

        {slotA && slotB && (
          <div>
            <div className="bg-surface border border-border rounded-xl mb-4">
              <div className="p-[16px_20px] border-b border-border2"><div className="text-[16px] font-bold text-text-main">Comparação por Tema</div></div>
              <div className="p-5 h-[320px] w-full"><GraficoRadar /></div>
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
                    <div className="h-full bg-green rounded" style={{ width: `${s.coerencia}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setModalOpen(null)}>
          <div className="bg-surface border border-border rounded-[14px] w-[440px] max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-[16px_20px] border-b border-border flex justify-between items-center">
              <div className="text-[16px] font-bold text-text-main">Selecionar Político</div>
              <button onClick={() => setModalOpen(null)} className="text-text2 hover:text-white text-[18px]">✕</button>
            </div>
            <div>
              {availablePol.map((p, i) => (
                <div key={i} onClick={() => selectPolitico(p)} className="flex items-center gap-3 p-[12px_20px] border-b border-border2 hover:bg-surface2 cursor-pointer last:border-0">
                  <img src={p.foto || `https://ui-avatars.com/api/?name=${p.nome}&background=1c2128&color=14b8a6`} className="w-8 h-8 rounded-full" />
                  <div>
                    <div className="text-[14px] font-semibold text-text-main">{p.nome}</div>
                    <div className="text-[12px] text-teal">{p.partido} · {p.uf}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}