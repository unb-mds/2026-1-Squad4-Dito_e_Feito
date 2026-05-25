import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Users, AlertTriangle, CheckCircle, FileQuestion } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { analisarParlamentar } from '../services/api';
import { SkeletonPerfil } from '../components/Skeleton';

export function PerfilPolitico() {
  const { id } = useParams();
  const { state } = useLocation(); 
  const politico = state?.politico;

  const [analise, setAnalise] = useState(null);
  const [dadosRadar, setDadosRadar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const processarAnalise = async () => {
      try {
        setLoading(true);
        setErro(null);
        const tipoParlamentar = politico?.tipo || 'deputado';
        const resposta = await analisarParlamentar(id, tipoParlamentar); 
        
        if (resposta.status === 'ok') {
          setAnalise(resposta);
          gerarDadosDoRadar(resposta.dados);
        } else if (resposta.status === 'aviso') {
          // Captura o aviso de falta de dados do backend
          setErro(resposta.mensagem);
        }
      } catch (err) {
        setErro("Falha ao processar os dados com o modelo de IA.");
      } finally {
        setLoading(false);
      }
    };

    processarAnalise();
  }, [id, politico]);

  const gerarDadosDoRadar = (dadosApi) => {
    const classificarTema = (texto) => {
      const t = texto.toLowerCase();
      if (t.includes('saúde') || t.includes('sus') || t.includes('hospital')) return 'Saúde';
      if (t.includes('educação') || t.includes('escola') || t.includes('ensino')) return 'Educação';
      if (t.includes('economia') || t.includes('fiscal') || t.includes('imposto')) return 'Economia';
      if (t.includes('segurança') || t.includes('polícia') || t.includes('crime')) return 'Segurança';
      if (t.includes('ambiente') || t.includes('clima') || t.includes('desmatamento')) return 'Meio Ambi.';
      return 'Outros';
    };

    const agrupado = {};
    dadosApi.forEach(item => {
      const tema = classificarTema(item.ementa);
      if (!agrupado[tema]) agrupado[tema] = { soma: 0, count: 0 };
      agrupado[tema].soma += (item.afinidade * 100);
      agrupado[tema].count += 1;
    });
    
    const formatoRadar = Object.keys(agrupado).map(tema => ({
      tema: tema,
      Coerencia: Math.round(agrupado[tema].soma / agrupado[tema].count)
    }));

    if (formatoRadar.length >= 3) {
      setDadosRadar(formatoRadar);
    }
  };

  const renderizarStatus = (status) => {
    if (status === "Coerente") return <span className="bg-brand-sucesso/20 text-brand-sucesso px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Coerente</span>;
    if (status === "Divergente") return <span className="bg-brand-alerta/20 text-brand-alerta px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><AlertTriangle size={12}/> Divergente</span>;
    return <span className="bg-slate-700 text-texto-principal px-2 py-1 rounded text-xs font-bold w-fit">Parcialmente Alinhado</span>;
  };

  return (
    <main className="p-8 w-full max-w-5xl mx-auto">
      <Link to="/" className="flex items-center gap-2 text-brand-petroleo hover:text-white transition-colors mb-6 w-fit font-semibold">
        <ArrowLeft size={18} /> Voltar para Visão Geral
      </Link>

      {/* Cabeçalho do Político */}
      {politico && (
        <div className="flex items-center gap-6 bg-surface p-6 rounded-lg border border-slate-800 mb-8 relative overflow-hidden">
          <span className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider text-brand-petroleo bg-brand-petroleo/10 px-2 py-1 rounded">
            {politico.tipo}
          </span>
          <img src={politico.foto} alt={politico.nome} className="w-24 h-24 rounded-full border-2 border-brand-petroleo object-cover" />
          <div>
            <h1 className="text-3xl font-display font-bold text-texto-principal">{politico.nome}</h1>
            <p className="text-texto-secundario mt-1 uppercase tracking-wider">{politico.partido} • {politico.uf}</p>
          </div>
        </div>
      )}

      {loading && <SkeletonPerfil />}

      {/* COMPONENTE DE EMPTY STATE: Trata de forma amigável a resposta de aviso do Flask */}
      {erro && !loading && (
        <div className="bg-surface border border-dashed border-slate-700 rounded-lg p-12 text-center flex flex-col items-center mt-8">
          <div className="bg-slate-800/50 p-4 rounded-full mb-4">
            <FileQuestion size={48} className="text-texto-secundario" />
          </div>
          <h3 className="text-xl font-display font-bold text-texto-principal mb-2">Dados Insuficientes</h3>
          <p className="text-texto-secundario max-w-md mx-auto mb-6">{erro}</p>
          <div className="bg-fundo p-4 rounded text-sm text-texto-secundario text-left w-full max-w-lg border border-slate-800">
            <p className="font-bold text-texto-principal mb-1">Por que isso acontece?</p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>O parlamentar pode ter assumido o cargo recentemente como suplente.</li>
              <li>Ainda não há discursos extensos proferidos em plenário gravados no sistema.</li>
              <li>As votações recentes do parlamentar não foram nominais.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Renderização do conteúdo se a IA retornar sucesso */}
      {!loading && !erro && analise && (
        <>
          {dadosRadar.length > 0 && (
            <section className="bg-surface p-6 rounded-lg border border-slate-800 mb-8 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h3 className="text-xl font-display font-bold text-texto-principal mb-2">Visão Geral Temática</h3>
                <p className="text-texto-secundario text-sm">
                  Distribuição da coerência do parlamentar baseada nos {analise.total_votos_analisados} votos mais recentes cruzados com a IA.
                </p>
              </div>
              <div className="w-full md:w-1/2 h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dadosRadar}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="tema" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Coerência" dataKey="Coerencia" stroke="#0F766E" fill="#0F766E" fillOpacity={0.6} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px' }} itemStyle={{ color: '#0F766E', fontWeight: 'bold' }} formatter={(value) => [`${value}%`, 'Coerência']}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          <section>
            <div className="border-b border-slate-800 pb-4 mb-6">
              <h2 className="text-xl font-display font-bold text-texto-principal">Histórico de Votações Auditadas</h2>
            </div>

            <div className="space-y-4">
              {analise.dados.map((voto, index) => (
                <div key={index} className="bg-surface p-5 rounded-lg border border-slate-800 flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-1">
                    <span className="text-xs text-texto-secundario font-mono">{voto.data}</span>
                    <h3 className="text-texto-principal font-medium mt-1 mb-2 leading-relaxed">{voto.ementa}</h3>
                    <p className="text-sm">
                      <span className="text-texto-secundario">Voto: </span>
                      <strong className="text-white bg-slate-800 px-2 py-0.5 rounded">{voto.voto}</strong>
                    </p>
                  </div>
                  <div className="md:w-48 w-full flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2 bg-fundo p-3 rounded border border-slate-800">
                    <div className="text-right">
                      <p className="text-xs text-texto-secundario uppercase">Afinidade</p>
                      <p className="text-lg font-mono text-white font-bold">{(voto.afinidade * 100).toFixed(1)}%</p>
                    </div>
                    {renderizarStatus(voto.status)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}