import React, { useState } from 'react';

const politicosData = [
  {nome:'Alessandro Vieira',partido:'PSDB',uf:'SE',tipo:'Senador',coerencia:94},
  {nome:'Beatriz Farias',partido:'PT',uf:'BA',tipo:'Deputada',coerencia:88},
  {nome:'Carlos Portinho',partido:'PL',uf:'RJ',tipo:'Senador',coerencia:85},
  {nome:'Daniela Carneiro',partido:'UNIÃO',uf:'RJ',tipo:'Deputada',coerencia:79},
  {nome:'Efraim Filho',partido:'UNIÃO',uf:'PB',tipo:'Senador',coerencia:76},
  {nome:'Gabriel Nunes',partido:'PSD',uf:'MG',tipo:'Deputado',coerencia:73},
  {nome:'Helena Borges',partido:'MDB',uf:'SP',tipo:'Deputada',coerencia:71},
  {nome:'Igor Queiroz',partido:'PP',uf:'CE',tipo:'Deputado',coerencia:69},
  {nome:'Juliana Castro',partido:'PSOL',uf:'RJ',tipo:'Deputada',coerencia:67},
  {nome:'Fabiana Davila',partido:'MDB',uf:'PE',tipo:'Deputada',coerencia:62},
];

export function Politicos() {
  const [sortAsc, setSortAsc] = useState(false);
  
  const getInitials = (name) => name.split(' ').slice(0,2).map(n=>n[0]).join('');
  
  const sortedData = [...politicosData].sort((a, b) => 
    sortAsc ? a.coerencia - b.coerencia : b.coerencia - a.coerencia
  );

  return (
    <div className="py-9 px-10 max-w-[1100px] w-full mx-auto animate-[fadeIn_0.2s_ease]">
      <div className="mb-7">
        <h1 className="font-display text-[32px] text-texto leading-[1.2]">Políticos</h1>
        <p className="text-[14px] text-texto-sec mt-1.5">Listagem completa de parlamentares com índice de coerência</p>
      </div>

      <div className="bg-surface border border-borda rounded-custom shadow-custom">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-borda">
          <div className="text-[14px] font-semibold text-texto flex items-center gap-2">
            <svg className="text-petroleo-light" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            Listagem Geral de Parlamentares
          </div>
          <button 
            onClick={() => setSortAsc(!sortAsc)}
            className="flex items-center gap-1.5 bg-petroleo-dim text-petroleo-light border border-petroleo/25 rounded-custom-sm p-[7px_14px] text-[12px] font-semibold font-body cursor-pointer hover:bg-petroleo/25 transition-colors"
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="5 12 12 19 19 12"/></svg>
            {sortAsc ? 'Menos Coerentes' : 'Mais Coerentes'}
          </button>
        </div>

        <div className="flex flex-col">
          {sortedData.map((p, index) => (
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