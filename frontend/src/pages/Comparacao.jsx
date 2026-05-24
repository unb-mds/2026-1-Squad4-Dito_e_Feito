import React from 'react';
import { GraficoRadar } from '../components/GraficoRadar';

export function Comparacao() {
  return (
    <div className="py-9 px-10 max-w-[1100px] w-full mx-auto animate-[fadeIn_0.2s_ease]">
      <div className="mb-7">
        <h1 className="font-display text-[32px] text-texto leading-[1.2]">Comparação</h1>
        <p className="text-[14px] text-texto-sec mt-1.5">Análise comparativa entre dois parlamentares via IA</p>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-5 items-start mb-5">
        {/* Parlamentar A */}
        <div className="bg-surface border border-borda rounded-custom shadow-custom p-6">
          <div className="text-[11px] font-mono text-petroleo-light uppercase tracking-[0.1em] mb-3.5">Parlamentar A</div>
          <div className="font-display text-[22px] text-texto mb-1">Alessandro Vieira</div>
          <div className="text-[12px] text-texto-sec font-mono mb-5">PSDB · SE · Senador</div>
          
          <div className="flex justify-between items-center py-2.5 border-b border-borda-light">
            <span className="text-[13px] text-texto-sec">Coerência geral</span>
            <span className="text-[14px] font-semibold font-mono text-sucesso">94%</span>
          </div>
          <div className="flex justify-between items-center py-2.5 border-b border-borda-light">
            <span className="text-[13px] text-texto-sec">Votos alinhados</span>
            <span className="text-[14px] font-semibold font-mono text-texto">312</span>
          </div>
          <div className="flex justify-between items-center py-2.5 border-b border-borda-light">
            <span className="text-[13px] text-texto-sec">Incoerências</span>
            <span className="text-[14px] font-semibold font-mono text-sucesso">19</span>
          </div>
          <div className="flex justify-between items-center py-2.5 border-b border-borda-light">
            <span className="text-[13px] text-texto-sec">Presença</span>
            <span className="text-[14px] font-semibold font-mono text-texto">98%</span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-[13px] text-texto-sec">Votos partido</span>
            <span className="text-[14px] font-semibold font-mono text-sucesso">91%</span>
          </div>
        </div>

        {/* VS */}
        <div className="flex items-center justify-center font-display text-[28px] text-texto-ter pt-[60px]">
          VS
        </div>

        {/* Parlamentar B */}
        <div className="bg-surface border border-borda rounded-custom shadow-custom p-6">
          <div className="text-[11px] font-mono text-petroleo-light uppercase tracking-[0.1em] mb-3.5">Parlamentar B</div>
          <div className="font-display text-[22px] text-texto mb-1">Fabiana Davila</div>
          <div className="text-[12px] text-texto-sec font-mono mb-5">MDB · PE · Deputada</div>
          
          <div className="flex justify-between items-center py-2.5 border-b border-borda-light">
            <span className="text-[13px] text-texto-sec">Coerência geral</span>
            <span className="text-[14px] font-semibold font-mono text-alerta">62%</span>
          </div>
          <div className="flex justify-between items-center py-2.5 border-b border-borda-light">
            <span className="text-[13px] text-texto-sec">Votos alinhados</span>
            <span className="text-[14px] font-semibold font-mono text-texto">198</span>
          </div>
          <div className="flex justify-between items-center py-2.5 border-b border-borda-light">
            <span className="text-[13px] text-texto-sec">Incoerências</span>
            <span className="text-[14px] font-semibold font-mono text-alerta">75</span>
          </div>
          <div className="flex justify-between items-center py-2.5 border-b border-borda-light">
            <span className="text-[13px] text-texto-sec">Presença</span>
            <span className="text-[14px] font-semibold font-mono text-texto">74%</span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-[13px] text-texto-sec">Votos partido</span>
            <span className="text-[14px] font-semibold font-mono text-alerta">58%</span>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-borda rounded-custom shadow-custom mt-5">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-borda">
          <div className="text-[14px] font-semibold text-texto flex items-center gap-2">
            <svg className="text-petroleo-light" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Radar Comparativo — IA
          </div>
        </div>
        <div className="p-[20px_0] h-[360px] flex items-center justify-center relative w-full">
          <GraficoRadar />
        </div>
      </div>
    </div>
  );
}