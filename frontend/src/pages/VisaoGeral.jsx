import React from 'react';
import { GraficoTendencias } from '../components/GraficoTendencias';
import { GraficoPartidos } from '../components/GraficoPartidos';
import { GraficoBarras } from '../components/GraficoBarras';

const politicosData = [
  {nome:'Alessandro Vieira',partido:'PSDB',uf:'SE',tipo:'Senador',coerencia:94},
  {nome:'Beatriz Farias',partido:'PT',uf:'BA',tipo:'Deputada',coerencia:88},
  {nome:'Carlos Portinho',partido:'PL',uf:'RJ',tipo:'Senador',coerencia:85},
  {nome:'Daniela Carneiro',partido:'UNIÃO',uf:'RJ',tipo:'Deputada',coerencia:79},
  {nome:'Efraim Filho',partido:'UNIÃO',uf:'PB',tipo:'Senador',coerencia:76},
  {nome:'Gabriel Nunes',partido:'PSD',uf:'MG',tipo:'Deputado',coerencia:73},
];

export function VisaoGeral() {
  const getInitials = (name) => name.split(' ').slice(0,2).map(n=>n[0]).join('');

  return (
    <div className="py-9 px-10 max-w-[1100px] w-full mx-auto animate-[fadeIn_0.2s_ease]">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-display text-[32px] text-texto leading-[1.2]">Visão Geral</h1>
        <p className="text-[14px] text-texto-sec mt-1.5">Panorama da coerência parlamentar — maio 2026</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-borda rounded-custom shadow-custom p-[22px_24px]">
          <div className="text-[12px] text-texto-sec font-medium uppercase tracking-[0.06em] mb-2.5">Votos Analisados</div>
          <div className="font-display text-[38px] text-texto leading-none mb-3">2.847</div>
          <span className="inline-flex items-center gap-[5px] text-[11px] font-semibold px-2.5 py-1 rounded-full font-mono bg-sucesso-dim text-sucesso">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            +124 este mês
          </span>
        </div>
        
        <div className="bg-surface border border-borda rounded-custom shadow-custom p-[22px_24px]">
          <div className="text-[12px] text-texto-sec font-medium uppercase tracking-[0.06em] mb-2.5">Coerência Global</div>
          <div className="font-display text-[38px] text-texto leading-none mb-3">73,2%</div>
          <span className="inline-flex items-center gap-[5px] text-[11px] font-semibold px-2.5 py-1 rounded-full font-mono bg-alerta-dim text-alerta">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
            −1,4% vs anterior
          </span>
        </div>

        <div className="bg-surface border border-borda rounded-custom shadow-custom p-[22px_24px]">
          <div className="text-[12px] text-texto-sec font-medium uppercase tracking-[0.06em] mb-2.5">Incoerências</div>
          <div className="font-display text-[38px] text-texto leading-none mb-3">142</div>
          <span className="inline-flex items-center gap-[5px] text-[11px] font-semibold px-2.5 py-1 rounded-full font-mono bg-amarelo-dim text-amarelo">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            +18 este mês
          </span>
        </div>
      </div>

      {/* Gráficos Linha 1 */}
      <div className="grid grid-cols-[2fr_1fr] gap-4 mt-5">
        <div className="bg-surface border border-borda rounded-custom shadow-custom flex flex-col">
          <div className="flex items-center justify-between p-[18px_24px] border-b border-borda">
            <div className="text-[14px] font-semibold text-texto flex items-center gap-2">
              <svg className="text-petroleo-light" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Tendências de Coerência
            </div>
            <span className="inline-flex items-center gap-[5px] text-[10px] font-semibold px-2.5 py-1 rounded-full font-mono bg-surface-hover text-texto-sec">12 meses</span>
          </div>
          <div className="p-6 h-[260px] relative w-full">
            <GraficoTendencias />
          </div>
        </div>

        <div className="bg-surface border border-borda rounded-custom shadow-custom flex flex-col">
          <div className="flex items-center justify-between p-[18px_24px] border-b border-borda">
            <div className="text-[14px] font-semibold text-texto flex items-center gap-2">
              <svg className="text-petroleo-light" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
              Distribuição
            </div>
          </div>
          <div className="p-6 h-[260px] flex items-center justify-center gap-5 relative w-full">
             <GraficoPartidos />
          </div>
        </div>
      </div>

      {/* Gráficos Linha 2 */}
      <div className="bg-surface border border-borda rounded-custom shadow-custom mt-5 flex flex-col">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-borda">
          <div className="text-[14px] font-semibold text-texto flex items-center gap-2">
            <svg className="text-petroleo-light" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="6" height="18" rx="1"/><rect x="9" y="8" width="6" height="13" rx="1"/><rect x="16" y="5" width="6" height="16" rx="1"/></svg>
            Coerência por Partido
          </div>
        </div>
        <div className="p-6 h-[240px] relative w-full">
           <GraficoBarras />
        </div>
      </div>

      {/* Parlamentares em Destaque */}
      <div className="bg-surface border border-borda rounded-custom shadow-custom mt-5">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-borda">
          <div className="text-[14px] font-semibold text-texto flex items-center gap-2">
            <svg className="text-petroleo-light" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            Parlamentares em Destaque
          </div>
          <span className="inline-flex items-center gap-[5px] text-[10px] font-semibold px-2.5 py-1 rounded-full font-mono bg-surface-hover text-texto-sec">Top 6 coerência</span>
        </div>
        
        <div className="flex flex-col">
          {politicosData.map((p, index) => (
            <div key={index} className="flex items-center gap-4 p-[14px_24px] border-b border-borda-light last:border-0 hover:bg-surface-hover transition-colors cursor-pointer">
              <div className="w-7 text-center text-[12px] font-mono text-texto-ter shrink-0">{index + 1}</div>
              <div className="w-[42px] h-[42px] rounded-full bg-fundo border border-borda flex items-center justify-center text-[13px] font-semibold text-texto-sec shrink-0 font-mono">
                {getInitials(p.nome)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium text-texto whitespace-nowrap overflow-hidden text-ellipsis">{p.nome}</div>
                <div className="text-[11px] text-texto-sec mt-0.5 font-mono">{p.partido} · {p.uf} · {p.tipo}</div>
              </div>
              <div className="flex flex-col items-end gap-1.5 w-[120px] shrink-0">
                <span className={`text-[15px] font-semibold font-mono ${p.coerencia >= 75 ? 'text-sucesso' : 'text-alerta'}`}>
                  {p.coerencia}%
                </span>
                <div className="h-1 w-full bg-borda rounded-sm overflow-hidden">
                  <div className={`h-full rounded-sm transition-all duration-600 ease-in-out ${p.coerencia >= 75 ? 'bg-sucesso' : 'bg-alerta'}`} style={{ width: `${p.coerencia}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}