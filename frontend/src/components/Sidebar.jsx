import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Info, Users, FileText } from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const getLinkClass = (path) => 
    `flex items-center gap-2.5 p-[10px_12px] rounded-lg text-[14px] font-medium cursor-pointer transition-all select-none mb-0.5 ${isActive(path) ? 'bg-teal text-white' : 'text-text2 hover:text-text-main hover:bg-surface2'}`;

  return (
    <aside className="w-[260px] shrink-0 bg-surface border-r border-border flex flex-col h-screen">
      <div className="p-[20px_20px_16px] border-b border-border">
        <div className="text-[18px] font-bold text-text-main tracking-[-0.3px]">
          Dito e Feito
        </div>
        
        <div className="text-[12px] text-text2 mt-0.5">
          Análise Política com IA
        </div>
      </div>
      
      <nav className="p-[12px_10px] flex-1">
        <Link to="/" className={getLinkClass('/')}>
          <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Visão Geral
        </Link>
        <Link to="/politicos" className={getLinkClass('/politicos')}>
          <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Políticos
        </Link>
        <Link to="/comparacao" className={getLinkClass('/comparacao')}>
          <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="20" x2="4" y2="10"/>
            <line x1="10" y1="20" x2="10" y2="4"/>
            <line x1="16" y1="20" x2="16" y2="14"/>
            <line x1="22" y1="20" x2="22" y2="8"/>
          </svg>
          Comparação (VS)
        </Link>
        <Link to="/relatorios" className={getLinkClass('/relatorios')}>
          <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          Relatórios
        </Link>
        <Link to="/sobre" className={getLinkClass('/sobre')}>
          <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-5"/>
            <circle cx="12" cy="7" r=".5"/>
          </svg>
          Sobre
        </Link>
      </nav>
      
      <div className="p-[16px_20px] border-t border-border text-[11px] color-text3">
        Squad 4 · UnB · FGA · 2026
      </div>
    </aside>
  );
}