import React from 'react';

const relatoriosData = [
  {titulo:'Relatório de Coerência Global — Q4 2025',data:'15 Dez 2025',formato:'PDF',tamanho:'2,3 MB'},
  {titulo:'Análise de Divergências por Partido',data:'10 Dez 2025',formato:'CSV',tamanho:'845 KB'},
  {titulo:'Ranking de Políticos — Novembro 2025',data:'30 Nov 2025',formato:'PDF',tamanho:'1,9 MB'},
];

export function Relatorios() {
  const relIcons = { PDF: '📄', CSV: '📊' };

  return (
    <div className="py-9 px-10 max-w-[1100px] w-full mx-auto animate-[fadeIn_0.2s_ease]">
      <div className="mb-7">
        <h1 className="font-display text-[32px] text-texto leading-[1.2]">Relatórios</h1>
        <p className="text-[14px] text-texto-sec mt-1.5">Central de arquivos gerados pela inteligência artificial</p>
      </div>

      <div className="bg-surface border border-borda rounded-custom shadow-custom">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-borda">
          <div className="text-[14px] font-semibold text-texto flex items-center gap-2">
            <svg className="text-petroleo-light" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Arquivos Disponíveis
          </div>
          <span className="inline-flex items-center gap-[5px] text-[10px] font-semibold px-2.5 py-1 rounded-full font-mono bg-slate-800/50 text-texto-sec">3 documentos</span>
        </div>
        
        <div>
          {relatoriosData.map((r, index) => (
            <div key={index} className="flex items-center gap-5 p-[20px_24px] border-b border-borda-light hover:bg-surface-hover transition-colors cursor-pointer last:border-0">
              <div className="w-12 h-12 rounded-custom-sm bg-fundo border border-borda flex items-center justify-center shrink-0 text-petroleo text-[22px]">
                {relIcons[r.formato] || '📁'}
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-medium text-texto mb-1.5">{r.titulo}</div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono font-medium p-[3px_8px] rounded border border-borda text-texto-sec">{r.formato}</span>
                  <span className="text-[10px] font-mono font-medium p-[3px_8px] rounded border border-borda text-texto-sec">{r.tamanho}</span>
                  <span className="text-[12px] text-texto-ter">{r.data}</span>
                </div>
              </div>
              <button className="flex items-center gap-1.5 bg-petroleo text-white border-none rounded-custom-sm p-[9px_18px] text-[13px] font-semibold font-body cursor-pointer transition-colors shrink-0 hover:bg-[#0d635c]">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}