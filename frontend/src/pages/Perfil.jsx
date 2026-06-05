import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { politicosMock } from '../utils/mockData';

export function Perfil() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const politico = useMemo(() => politicosMock.find(p => p.id === parseInt(id)), [id]);

  if (!politico) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 animate-[fadeIn_0.2s_ease]">
        <div className="text-[20px] font-bold text-text-main mb-4">Político não encontrado</div>
        <button onClick={() => navigate(-1)} className="bg-teal text-white rounded-lg p-[8px_16px] text-[13px] font-semibold hover:opacity-85 transition-opacity">
          Voltar
        </button>
      </div>
    );
  }

  // Dados Mockados para os gráficos
  const histData = [
    { mes: 'Jan', coerencia: politico.coerencia - 5 },
    { mes: 'Fev', coerencia: politico.coerencia - 2 },
    { mes: 'Mar', coerencia: politico.coerencia + 3 },
    { mes: 'Abr', coerencia: politico.coerencia - 1 },
    { mes: 'Mai', coerencia: politico.coerencia },
    { mes: 'Jun', coerencia: politico.coerencia + 2 },
  ];

  const comparacaoData = [
    { tema: 'Meio Ambiente', politico: politico.coerencia - 4, partido: 70 },
    { tema: 'Economia', politico: politico.coerencia + 2, partido: 75 },
    { tema: 'Saúde', politico: politico.coerencia, partido: 68 },
    { tema: 'Educação', politico: politico.coerencia - 6, partido: 72 },
  ];

  // Dados Mockados para o histórico recente de votações e discursos
  const ultimosEventos = [
    { 
      id: 1, data: '12 Jun 2026', tema: 'Educação', proposicao: 'PL 1234/26 - Piso Salarial dos Professores', 
      discurso: 'Favorável', voto: 'Favorável', coerencia: 'Coerente', status: 'green' 
    },
    { 
      id: 2, data: '28 Mai 2026', tema: 'Meio Ambiente', proposicao: 'PL 987/26 - Proteção de Mananciais', 
      discurso: 'Favorável', voto: 'Abstenção', coerencia: 'Divergente', status: 'red' 
    },
    { 
      id: 3, data: '15 Mai 2026', tema: 'Economia', proposicao: 'MP 456/26 - Isenção Fiscal', 
      discurso: 'Contrário', voto: 'Contrário', coerencia: 'Coerente', status: 'green' 
    },
    { 
      id: 4, data: '02 Mai 2026', tema: 'Saúde', proposicao: 'PL 555/26 - Fundo Nacional de Saúde', 
      discurso: 'Favorável', voto: 'Favorável', coerencia: 'Coerente', status: 'green' 
    },
  ];

  return (
    <div className="flex flex-col flex-1 animate-[fadeIn_0.2s_ease]">
      {/* Header do Perfil */}
      <div className="p-[20px_32px] border-b border-border shrink-0 bg-surface flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-surface2 border border-border flex items-center justify-center text-text2 hover:text-white hover:border-teal transition-colors">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <img 
          src={politico.foto} 
          onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(politico.nome)}&background=1c2128&color=14b8a6`; }}
          className="w-16 h-16 rounded-full border-2 border-border object-cover" 
          alt={politico.nome}
        />
        <div className="flex-1 min-w-0">
          <div className="text-[24px] font-bold text-text-main leading-tight truncate">{politico.nome}</div>
          <div className="text-[14px] text-teal mt-1 font-medium">{politico.partido} · {politico.uf} · {politico.tipo}</div>
        </div>
        <div className="bg-surface2 border border-border rounded-xl p-[12px_20px] text-center">
          <div className="text-[12px] text-text2 uppercase tracking-wider mb-1">Score Geral</div>
          <div className={`text-[28px] font-bold leading-none ${politico.coerencia >= 70 ? 'text-green' : 'text-red'}`}>{politico.coerencia}%</div>
        </div>
      </div>

      <div className="p-[28px_32px] flex-1 overflow-y-auto">
        
        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-surface border border-border rounded-xl flex flex-col">
            <div className="p-[16px_20px] border-b border-border2">
              <div className="text-[16px] font-bold text-text-main flex items-center gap-2">
                <svg width="18" height="18" className="text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                Histórico de Coerência
              </div>
            </div>
            <div className="p-5 h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={histData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="0" stroke="#30363d" vertical={false} />
                  <XAxis dataKey="mes" stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} domain={[50, 100]} tickFormatter={(val) => `${val}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '6px', color: '#e6edf3' }} itemStyle={{ color: '#14b8a6', fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="coerencia" name="Coerência" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4, fill: '#14b8a6', strokeWidth: 2, stroke: '#161b22' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl flex flex-col">
            <div className="p-[16px_20px] border-b border-border2">
              <div className="text-[16px] font-bold text-text-main flex items-center gap-2">
                <svg width="18" height="18" className="text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="6" height="18" rx="1"/><rect x="9" y="8" width="6" height="13" rx="1"/><rect x="16" y="5" width="6" height="16" rx="1"/></svg>
                Comparação com Média do {politico.partido}
              </div>
            </div>
            <div className="p-5 h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparacaoData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="0" stroke="#30363d" vertical={false} />
                  <XAxis dataKey="tema" stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                  <Tooltip cursor={{ fill: '#1c2128', opacity: 0.5 }} contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '6px', color: '#e6edf3' }} />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '13px', color: '#8b949e' }} />
                  <Bar dataKey="politico" name={politico.nome} fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="partido" name={`Média ${politico.partido}`} fill="#484f58" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* NOVA SEÇÃO: Histórico Recente de Discursos vs Votos */}
        <div className="bg-surface border border-border rounded-xl flex flex-col">
          <div className="p-[16px_20px] border-b border-border2 flex justify-between items-center">
            <div className="text-[16px] font-bold text-text-main flex items-center gap-2">
              <svg width="18" height="18" className="text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              Últimos Votos e Discursos Analisados
            </div>
            <span className="text-[12px] text-text2 bg-surface2 px-2 py-1 rounded">Via processamento NLP</span>
          </div>
          <div className="flex flex-col">
            {ultimosEventos.map((evento) => (
              <div key={evento.id} className="p-[16px_20px] border-b border-border2 hover:bg-surface2 transition-colors last:border-0 flex flex-col md:flex-row md:items-center gap-4">
                
                {/* Info da Proposição */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-semibold text-teal bg-teal-bg px-2 py-0.5 rounded border border-teal-border">
                      {evento.tema}
                    </span>
                    <span className="text-[12px] text-text2">{evento.data}</span>
                  </div>
                  <div className="text-[14px] font-semibold text-text-main leading-snug">
                    {evento.proposicao}
                  </div>
                </div>

                {/* Comparativo Discurso x Voto */}
                <div className="flex items-center gap-6 md:min-w-[300px]">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-text2 uppercase mb-0.5">Discurso (NLP)</span>
                    <span className="text-[13px] font-medium text-text-main">{evento.discurso}</span>
                  </div>
                  <svg width="16" height="16" className="text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-text2 uppercase mb-0.5">Voto Real</span>
                    <span className="text-[13px] font-medium text-text-main">{evento.voto}</span>
                  </div>
                </div>

                {/* Resultado da Coerência */}
                <div className="md:w-[120px] flex md:justify-end">
                  <div className={`flex items-center gap-1.5 text-[13px] font-bold px-2.5 py-1.5 rounded-lg border ${evento.status === 'green' ? 'text-green bg-green-bg border-green/20' : 'text-red bg-red-bg border-red/20'}`}>
                    {evento.status === 'green' ? (
                       <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                       <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    )}
                    {evento.coerencia}
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