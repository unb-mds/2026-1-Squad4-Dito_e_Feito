import React, { useState } from 'react';
import { politicosMock } from './VisaoGeral';

export function Politicos() {
  const [busca, setBusca] = useState('');
  const [sortAsc, setSortAsc] = useState(false);

  let filtered = politicosMock.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase()) || 
    p.partido.toLowerCase().includes(busca.toLowerCase())
  );

  filtered = filtered.sort((a, b) => sortAsc ? a.coerencia - b.coerencia : b.coerencia - a.coerencia);

  return (
    <div className="flex flex-col flex-1 animate-[fadeIn_0.2s_ease]">
      <div className="p-[16px_32px] border-b border-border shrink-0">
        <div className="relative max-w-[600px] mx-auto">
          <svg className="absolute left-[15px] top-1/2 -translate-y-1/2 text-text3 pointer-events-none" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-surface2 border border-border rounded-full p-[10px_18px_10px_42px] text-[14px] text-text-main outline-none focus:border-teal transition-colors" 
            type="text" 
            placeholder="Buscar político por nome ou partido..." 
          />
        </div>
      </div>

      <div className="p-[28px_32px] flex-1 overflow-y-auto">
        <div className="bg-surface border border-border rounded-xl">
          <div className="flex justify-between items-center p-[16px_20px] border-b border-border2">
            <div className="text-[16px] font-bold text-text-main">Listagem Geral de Parlamentares</div>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className={`
                flex items-center gap-1.5
                rounded-lg p-[8px_16px]
                text-[13px] font-semibold text-white
                transition-all duration-200 hover:opacity-85
                ${sortAsc ? 'bg-red' : 'bg-teal'}
              `}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`transition-transform duration-300 ${
                  !sortAsc ? 'rotate-180' : ''
                }`}
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="5 12 12 19 19 12" />
              </svg>

              {sortAsc ? 'Menos Coerentes' : 'Mais Coerentes'}
            </button>
          </div>
          <div>
            {filtered.map((p, i) => (
              <div key={i} className="flex items-center gap-3.5 p-[14px_20px] border-b border-border2 hover:bg-surface2 transition-colors cursor-pointer last:border-0">
                <img
                  src={p.foto}
                  alt={p.nome}
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://placehold.co/80x80/1c2128/14b8a6?text=?';
                  }}
                  className="w-16 h-16 rounded-full border border-border shrink-0 object-cover"
                />                
                  <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-text-main">
                    {p.nome}
                  </div>
                  <div className="text-[12px] text-text2 mt-0.5">
                    {p.partido} · {p.uf}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <svg className={`${p.coerencia >= 70 ? 'text-green' : 'text-red'}`} width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><polyline points={p.coerencia >= 70 ? '22 7 13.5 15.5 8.5 10.5 2 17' : '22 17 13.5 8.5 8.5 13.5 2 7'}/><polyline points={p.coerencia >= 70 ? '16 7 22 7 22 13' : '16 17 22 17 22 11'}/></svg>
                  <div className={`text-[22px] font-bold w-[62px] text-right ${p.coerencia >= 70 ? 'text-green' : 'text-red'}`}>
                    {p.coerencia}%
                  </div>
                  <div className="w-[90px]">
                    <div className="h-[5px] bg-border rounded w-full overflow-hidden">
                      <div className={`h-full rounded ${p.coerencia >= 70 ? 'bg-green' : 'bg-red'}`} style={{ width: `${p.coerencia}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}