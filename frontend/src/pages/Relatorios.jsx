import React from 'react';

const relatorios = [
  { titulo: 'Relatório de Coerência Global - Q4 2025', data: '15 Dez 2025', formato: 'PDF', tamanho: '2.3 MB' },
  { titulo: 'Análise de Divergências por Partido', data: '10 Dez 2025', formato: 'CSV', tamanho: '845 KB' },
  { titulo: 'Ranking de Políticos - Novembro', data: '30 Nov 2025', formato: 'PDF', tamanho: '1.9 MB' },
];

export function Relatorios() {
  return (
    <div className="flex flex-col flex-1 animate-[fadeIn_0.2s_ease]">
      <div className="p-[16px_32px] border-b border-border shrink-0">
        <div className="text-[20px] font-bold text-text-main">Relatórios</div>
      </div>
      
      <div className="p-[28px_32px] flex-1 overflow-y-auto">
        <div className="bg-surface border border-border rounded-xl">
          <div className="p-[16px_20px] border-b border-border2">
            <div className="text-[16px] font-bold text-text-main">Central de Relatórios</div>
          </div>
          <div>
            {relatorios.map((r, i) => (
              <div key={i} className="flex items-center gap-4 p-[14px_20px] border-b border-border2 hover:bg-surface2 transition-colors cursor-pointer last:border-0">
                <div className="w-11 h-11 rounded-lg bg-teal-bg border border-teal-border flex items-center justify-center shrink-0 text-teal">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-text-main mb-1 truncate">{r.titulo}</div>
                  <div className="text-[12px] text-text2 flex items-center gap-1.5">
                    {r.data}
                    <div className="w-1 h-1 rounded-full bg-text3"></div>
                    {r.formato}
                    <div className="w-1 h-1 rounded-full bg-text3"></div>
                    {r.tamanho}
                  </div>
                </div>
                <button className="flex items-center gap-1.5 bg-teal text-white border-none rounded-lg p-[8px_16px] text-[13px] font-semibold cursor-pointer hover:opacity-85 transition-opacity shrink-0">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}