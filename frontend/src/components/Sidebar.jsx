import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, GitCompare, Info, Users, FileText } from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  
  const baseClass = "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors font-semibold text-sm";
  const activeClass = "bg-brand-petroleo text-white shadow-md";
  const inactiveClass = "text-texto-secundario hover:text-texto-principal hover:bg-slate-800/50";

  return (
    <aside className="w-64 bg-surface border-r border-slate-800 flex flex-col h-full">
      <div className="p-6 mb-4">
        <h1 className="text-2xl font-bold font-display text-white">Dito e Feito</h1>
        <p className="text-xs text-texto-secundario mt-1">Análise Política com IA</p>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <Link to="/" className={`${baseClass} ${isActive('/') ? activeClass : inactiveClass}`}>
          <LayoutDashboard size={20} /> Visão Geral
        </Link>
        <Link to="/politicos" className={`${baseClass} ${isActive('/politicos') ? activeClass : inactiveClass}`}>
          <Users size={20} /> Políticos
        </Link>
        <Link to="/comparacao" className={`${baseClass} ${isActive('/comparacao') ? activeClass : inactiveClass}`}>
          <GitCompare size={20} /> Comparação (VS)
        </Link>
        <Link to="/relatorios" className={`${baseClass} ${isActive('/relatorios') ? activeClass : inactiveClass}`}>
          <FileText size={20} /> Relatórios
        </Link>
        <Link to="/sobre" className={`${baseClass} ${isActive('/sobre') ? activeClass : inactiveClass}`}>
          <Info size={20} /> Sobre
        </Link>
      </nav>
    </aside>
  );
}