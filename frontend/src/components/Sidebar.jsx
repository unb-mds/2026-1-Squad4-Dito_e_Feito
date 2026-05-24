import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-[240px] shrink-0 bg-surface border-r border-borda flex flex-col h-screen relative z-10">
      <div className="p-[28px_24px_20px] border-b border-borda">
        <div className="font-display text-[22px] text-texto tracking-[-0.3px] leading-[1.2]">Dito e Feito</div>
        <div className="text-[11px] text-petroleo-light font-mono mt-1 tracking-[0.05em]">// análise política com IA</div>
      </div>
      
      <nav className="p-[16px_12px] flex-1">
        <div className="text-[10px] font-mono text-texto-ter tracking-[0.12em] uppercase p-[8px_12px_6px]">Dashboard</div>
        <Link to="/" className={`flex items-center gap-[10px] p-[10px_12px] rounded-custom-sm text-[13.5px] font-medium cursor-pointer transition-all mb-[2px] border border-transparent select-none ${isActive('/') ? 'bg-petroleo-dim text-petroleo-light border-petroleo/25' : 'text-texto-sec hover:text-texto hover:bg-surface-hover'}`}>
          <svg className={`w-[18px] h-[18px] shrink-0 ${isActive('/') ? 'opacity-100' : 'opacity-80'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Visão Geral
        </Link>

        <div className="text-[10px] font-mono text-texto-ter tracking-[0.12em] uppercase p-[8px_12px_6px] mt-[12px]">Módulos</div>
        <Link to="/politicos" className={`flex items-center gap-[10px] p-[10px_12px] rounded-custom-sm text-[13.5px] font-medium cursor-pointer transition-all mb-[2px] border border-transparent select-none ${isActive('/politicos') ? 'bg-petroleo-dim text-petroleo-light border-petroleo/25' : 'text-texto-sec hover:text-texto hover:bg-surface-hover'}`}>
          <svg className={`w-[18px] h-[18px] shrink-0 ${isActive('/politicos') ? 'opacity-100' : 'opacity-80'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Políticos
        </Link>
        <Link to="/comparacao" className={`flex items-center gap-[10px] p-[10px_12px] rounded-custom-sm text-[13.5px] font-medium cursor-pointer transition-all mb-[2px] border border-transparent select-none ${isActive('/comparacao') ? 'bg-petroleo-dim text-petroleo-light border-petroleo/25' : 'text-texto-sec hover:text-texto hover:bg-surface-hover'}`}>
          <svg className={`w-[18px] h-[18px] shrink-0 ${isActive('/comparacao') ? 'opacity-100' : 'opacity-80'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
          Comparação
        </Link>
        <Link to="/relatorios" className={`flex items-center gap-[10px] p-[10px_12px] rounded-custom-sm text-[13.5px] font-medium cursor-pointer transition-all mb-[2px] border border-transparent select-none ${isActive('/relatorios') ? 'bg-petroleo-dim text-petroleo-light border-petroleo/25' : 'text-texto-sec hover:text-texto hover:bg-surface-hover'}`}>
          <svg className={`w-[18px] h-[18px] shrink-0 ${isActive('/relatorios') ? 'opacity-100' : 'opacity-80'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Relatórios
        </Link>

        <div className="text-[10px] font-mono text-texto-ter tracking-[0.12em] uppercase p-[8px_12px_6px] mt-[12px]">Info</div>
        <Link to="/sobre" className={`flex items-center gap-[10px] p-[10px_12px] rounded-custom-sm text-[13.5px] font-medium cursor-pointer transition-all mb-[2px] border border-transparent select-none ${isActive('/sobre') ? 'bg-petroleo-dim text-petroleo-light border-petroleo/25' : 'text-texto-sec hover:text-texto hover:bg-surface-hover'}`}>
          <svg className={`w-[18px] h-[18px] shrink-0 ${isActive('/sobre') ? 'opacity-100' : 'opacity-80'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Sobre
        </Link>
      </nav>
      
      <div className="p-[16px_24px] border-t border-borda text-[11px] text-texto-ter font-mono">
        Squad 4 · UnB · 2026
      </div>
    </aside>
  );
}