// src/components/Skeleton.jsx

export function SkeletonCard() {
  return (
    <div className="bg-surface p-4 rounded-lg border border-slate-800 shadow-sm flex items-center gap-4 animate-pulse">
      {/* Círculo da foto */}
      <div className="w-12 h-12 rounded-full bg-slate-700/50"></div>
      
      {/* Linhas de texto */}
      <div className="flex-1">
        <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-slate-700/50 rounded w-1/2"></div>
      </div>
    </div>
  );
}

export function SkeletonPerfil() {
  return (
    <div className="animate-pulse">
      {/* Header do Perfil */}
      <div className="flex items-center gap-6 bg-surface p-6 rounded-lg border border-slate-800 mb-8">
        <div className="w-24 h-24 rounded-full bg-slate-700/50"></div>
        <div className="flex-1">
          <div className="h-8 bg-slate-700/50 rounded w-1/3 mb-3"></div>
          <div className="h-4 bg-slate-700/50 rounded w-1/4"></div>
        </div>
      </div>

      {/* Caixa de Aviso de Auditoria */}
      <div className="bg-surface p-8 rounded-lg border border-slate-800 mb-8 flex flex-col items-center justify-center h-40">
        <div className="h-6 bg-brand-petroleo/40 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-slate-700/50 rounded w-2/3"></div>
      </div>
    </div>
  );
}