import { useState, useEffect } from 'react';
import { ArrowUpDown, User, TrendingUp, TrendingDown } from 'lucide-react';
import { getDeputados, getSenadores } from '../services/api';

export function Politicos() {
  const [politicos, setPoliticos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const [respDep, respSen] = await Promise.all([getDeputados(), getSenadores()]);
        
        let lista = [];
        if (respDep?.status === 'ok') lista.push(...respDep.dados.map(p => ({...p, tipo: 'Deputado'})));
        if (respSen?.status === 'ok') lista.push(...respSen.dados.map(p => ({...p, tipo: 'Senador'})));
        
        // Mockando um score de coerência aleatório para o visual bater com a imagem
        // (No futuro, substitua isso pelo dado real da sua IA)
        const listaComScore = lista.map(p => ({
          ...p,
          coerencia: Math.floor(Math.random() * (95 - 60 + 1)) + 60
        }));

        // Ordenar do maior para o menor por padrão
        listaComScore.sort((a, b) => b.coerencia - a.coerencia);
        setPoliticos(listaComScore);
      } catch (err) {
        console.error("Erro na API:", err);
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, []);

  return (
    <main className="p-8 w-full max-w-5xl mx-auto">
      <div className="bg-surface rounded-xl border border-slate-800 shadow-sm flex flex-col min-h-[600px]">
        
        {/* Cabeçalho da Lista */}
        <div className="flex justify-between items-center border-b border-slate-800 p-6">
          <h2 className="text-xl font-display font-bold text-texto-principal">Listagem Geral de Parlamentares</h2>
          <button className="flex items-center gap-2 bg-brand-petroleo/20 hover:bg-brand-petroleo/30 text-brand-petroleo transition-colors px-4 py-2 rounded-md font-semibold text-sm">
            <ArrowUpDown size={16} /> Mais Coerentes
          </button>
        </div>

        {/* Lista de Políticos */}
        <div className="flex flex-col p-2 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-texto-secundario">Carregando parlamentares...</div>
          ) : (
            politicos.map((politico, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-transparent border-b-slate-800 last:border-b-transparent hover:bg-slate-800/30 transition-colors mx-2 rounded-lg">
                <div className="flex items-center gap-4">
                  {politico.foto ? (
                    <img src={politico.foto} alt={politico.nome} className="w-12 h-12 rounded border border-slate-700 object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-slate-800 rounded flex items-center justify-center text-slate-400 border border-slate-700">
                      <User size={24} />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-texto-principal text-lg">{politico.nome}</h4>
                    <p className="text-xs text-texto-secundario uppercase tracking-wide">{politico.partido} &bull; {politico.uf}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end w-32">
                  <div className="flex items-center gap-3 mb-1">
                    {/* Seta verde ou vermelha baseada no score */}
                    {politico.coerencia >= 75 ? (
                      <TrendingUp size={16} className="text-brand-sucesso" />
                    ) : (
                      <TrendingDown size={16} className="text-alerta" />
                    )}
                    <span className={`text-xl font-bold ${politico.coerencia >= 75 ? 'text-brand-sucesso' : 'text-alerta'}`}>
                      {politico.coerencia}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full">
                    <div 
                      className={`h-full rounded-full ${politico.coerencia >= 75 ? 'bg-brand-sucesso' : 'bg-alerta'}`} 
                      style={{ width: `${politico.coerencia}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}