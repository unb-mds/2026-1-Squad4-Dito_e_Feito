import { useState, useEffect } from 'react';
import { Search, X, Users, ShieldAlert, Loader2 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getDeputados, getSenadores, analisarParlamentar } from '../services/api';

export function Comparacao() {
  const [todosPoliticos, setTodosPoliticos] = useState([]);
  const [loadingBase, setLoadingBase] = useState(true);

  const [busca1, setBusca1] = useState('');
  const [politico1, setPolitico1] = useState(null);

  const [busca2, setBusca2] = useState('');
  const [politico2, setPolitico2] = useState(null);

  // Novos estados para a Análise Comparativa
  const [dadosRadar, setDadosRadar] = useState([]);
  const [loadingAnalise, setLoadingAnalise] = useState(false);
  const [erroAnalise, setErroAnalise] = useState(null);

  useEffect(() => {
    const buscarBase = async () => {
      try {
        setLoadingBase(true);
        const [respDep, respSen] = await Promise.all([getDeputados(), getSenadores()]); 
        
        let lista = [];
        if (respDep.status === 'ok') lista = [...lista, ...respDep.dados.map(p => ({ ...p, tipo: 'deputado' }))];
        if (respSen.status === 'ok') lista = [...lista, ...respSen.dados.map(p => ({ ...p, tipo: 'senador' }))];
        
        lista.sort((a, b) => a.nome.localeCompare(b.nome));
        setTodosPoliticos(lista);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBase(false);
      }
    };
    buscarBase();
  }, []);

  // O "Gatilho" da Inteligência: Roda sempre que politico1 E politico2 estiverem preenchidos
  useEffect(() => {
    if (!politico1 || !politico2) {
      setDadosRadar([]);
      return;
    }

    const cruzarDados = async () => {
      try {
        setLoadingAnalise(true);
        setErroAnalise(null);

        // Chama a IA do backend para ambos simultaneamente
        const [analise1, analise2] = await Promise.all([
          analisarParlamentar(politico1.id, politico1.tipo),
          analisarParlamentar(politico2.id, politico2.tipo)
        ]);

        if (analise1.status !== 'ok' || analise2.status !== 'ok') {
          setErroAnalise("Não há dados suficientes de discursos/votos para realizar a comparação destes parlamentares.");
          return;
        }

        // Função interna para classificar o tema da ementa (Bridge para o requisito RI04)
        const classificarTema = (texto) => {
          const t = texto.toLowerCase();
          if (t.includes('saúde') || t.includes('sus') || t.includes('hospital') || t.includes('médic')) return 'Saúde';
          if (t.includes('educação') || t.includes('escola') || t.includes('professor') || t.includes('ensino')) return 'Educação';
          if (t.includes('economia') || t.includes('fiscal') || t.includes('imposto') || t.includes('tribut')) return 'Economia';
          if (t.includes('segurança') || t.includes('polícia') || t.includes('penal') || t.includes('crime')) return 'Segurança';
          if (t.includes('ambiente') || t.includes('clima') || t.includes('desmatamento') || t.includes('ibama')) return 'Meio Ambiente';
          return 'Geral';
        };

        // Função para calcular a média de coerência por tema
        const processarEmentas = (dadosApi) => {
          const agrupado = {};
          dadosApi.forEach(item => {
            const tema = classificarTema(item.ementa);
            if (!agrupado[tema]) agrupado[tema] = { soma: 0, count: 0 };
            agrupado[tema].soma += (item.afinidade * 100);
            agrupado[tema].count += 1;
          });
          
          const medias = {};
          Object.keys(agrupado).forEach(tema => {
            medias[tema] = Math.round(agrupado[tema].soma / agrupado[tema].count);
          });
          return medias;
        };

        const mediasP1 = processarEmentas(analise1.dados);
        const mediasP2 = processarEmentas(analise2.dados);

        // Mescla os dados no formato que o Recharts exige
        const temasUnicos = Array.from(new Set([...Object.keys(mediasP1), ...Object.keys(mediasP2)]));
        
        const formatoRadar = temasUnicos.map(tema => ({
          tema: tema,
          [politico1.nome]: mediasP1[tema] || 0, // Se não tiver votos no tema, coerência 0 ou N/A
          [politico2.nome]: mediasP2[tema] || 0
        }));

        setDadosRadar(formatoRadar);

      } catch (err) {
        setErroAnalise("Falha ao comunicar com a API do modelo BERT.");
      } finally {
        setLoadingAnalise(false);
      }
    };

    cruzarDados();
  }, [politico1, politico2]); // Dependências do useEffect

  const filtrarLista = (termo) => {
    if (!termo) return [];
    return todosPoliticos
      .filter(p => p.nome.toLowerCase().includes(termo.toLowerCase()))
      .slice(0, 5);
  };

  const SeletorPolitico = ({ numero, busca, setBusca, politico, setPolitico }) => {
    const resultados = filtrarLista(busca);

    return (
      <div className="flex-1 bg-surface p-6 rounded-lg border border-slate-800 shadow-sm relative">
        <h3 className="text-sm font-medium text-texto-secundario mb-4 uppercase tracking-wider">Político {numero}</h3>
        
        {!politico ? (
          <div className="relative">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-texto-secundario" size={18} />
              <input 
                type="text" 
                placeholder="Digite o nome..." 
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-fundo border border-slate-700 rounded py-2 pl-10 pr-4 text-texto-principal focus:outline-none focus:border-brand-petroleo transition-all"
              />
            </div>
            
            {busca && resultados.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-fundo border border-slate-700 rounded shadow-lg max-h-60 overflow-y-auto">
                {resultados.map(p => (
                  <li 
                    key={p.id} 
                    onClick={() => { setPolitico(p); setBusca(''); }}
                    className="px-4 py-3 hover:bg-slate-800 cursor-pointer flex items-center gap-3 border-b border-slate-800/50 last:border-0"
                  >
                    <img src={p.foto} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="text-sm text-texto-principal font-medium">{p.nome}</p>
                      <p className="text-xs text-texto-secundario uppercase">{p.tipo} • {p.partido}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between bg-fundo p-4 rounded border border-slate-700">
            <div className="flex items-center gap-4">
              <img src={politico.foto} alt={politico.nome} className="w-12 h-12 rounded-full border-2 border-brand-petroleo object-cover" />
              <div>
                <h4 className="font-bold text-texto-principal">{politico.nome}</h4>
                <p className="text-xs text-texto-secundario uppercase">{politico.tipo} • {politico.partido}</p>
              </div>
            </div>
            <button 
              onClick={() => { setPolitico(null); setDadosRadar([]); }}
              className="text-texto-secundario hover:text-brand-alerta transition-colors p-2"
              title="Remover"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="p-8 w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-texto-principal">Comparação (VS)</h1>
        <p className="text-texto-secundario mt-2">
          Selecione dois parlamentares para analisar as divergências e alinhamentos temáticos reais capturados pelo modelo BERT.
        </p>
      </div>

      {loadingBase ? (
        <div className="flex items-center gap-2 text-brand-petroleo font-semibold animate-pulse">
          <ShieldAlert size={20} /> Preparando base de dados...
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <SeletorPolitico numero="1" busca={busca1} setBusca={setBusca1} politico={politico1} setPolitico={setPolitico1} />
            
            <div className="flex items-center justify-center -mx-3 z-10 hidden md:flex">
              <div className="bg-fundo border border-slate-800 rounded-full p-3 shadow-lg">
                <span className="font-display font-bold text-texto-secundario text-sm">VS</span>
              </div>
            </div>

            <SeletorPolitico numero="2" busca={busca2} setBusca={setBusca2} politico={politico2} setPolitico={setPolitico2} />
          </div>

          {/* Área de Processamento da Inteligência */}
          {politico1 && politico2 && (
            <section className="bg-surface p-8 rounded-lg border border-slate-800 shadow-sm flex flex-col items-center min-h-[400px] justify-center relative">
              
              {loadingAnalise && (
                <div className="absolute inset-0 bg-surface/90 flex flex-col items-center justify-center rounded-lg z-10">
                  <Loader2 className="animate-spin text-brand-petroleo mb-4" size={40} />
                  <p className="text-texto-principal font-bold">Iniciando comparativo cruzado...</p>
                  <p className="text-texto-secundario text-sm">Avaliando vetores de similaridade dos discursos.</p>
                </div>
              )}

              {erroAnalise && !loadingAnalise && (
                <div className="text-center">
                  <ShieldAlert className="text-brand-alerta mx-auto mb-2" size={40} />
                  <p className="text-brand-alerta font-semibold">{erroAnalise}</p>
                </div>
              )}

              {!loadingAnalise && !erroAnalise && dadosRadar.length > 0 && (
                <>
                  <h3 className="text-xl font-display font-bold text-texto-principal mb-2">Alinhamento Temático (%)</h3>
                  <p className="text-texto-secundario text-sm mb-6">Quanto mais próximo da borda, maior a coerência do discurso com os votos.</p>
                  
                  <div className="w-full h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dadosRadar}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="tema" tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569' }} />
                        
                        <Radar name={politico1.nome} dataKey={politico1.nome} stroke="#0F766E" fill="#0F766E" fillOpacity={0.5} />
                        <Radar name={politico2.nome} dataKey={politico2.nome} stroke="#166534" fill="#166534" fillOpacity={0.5} />
                        
                        <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', color: '#F8FAFC' }} itemStyle={{ fontWeight: 'bold' }} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </section>
          )}

          {!politico1 || !politico2 ? (
            <div className="bg-fundo border border-dashed border-slate-700 rounded-lg p-12 text-center flex flex-col items-center">
              <Users size={48} className="text-slate-700 mb-4" />
              <h3 className="text-lg font-display font-bold text-texto-principal">Aguardando Seleção</h3>
              <p className="text-texto-secundario max-w-md mx-auto mt-2">
                Selecione os dois políticos acima. O sistema processará os discursos em tempo real usando embeddings do BERT.
              </p>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}