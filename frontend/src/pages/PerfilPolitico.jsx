import { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, AlertTriangle, CheckCircle, FileQuestion } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { analisarParlamentar, getDashboardMetrics, getPoliticoById } from '../services/api';
import { SkeletonPerfil } from '../components/Skeleton';

export function PerfilPolitico() {
  const { id } = useParams();
  const { state } = useLocation(); 
  const navigate = useNavigate();
  const [dadosPolitico, setDadosPolitico] = useState(state?.politico || null);

  const [analise, setAnalise] = useState(null);
  const [dadosPizza, setDadosPizza] = useState([]);
  const [dadosLinha, setDadosLinha] = useState([]);
  const [mediaPartido, setMediaPartido] = useState(70);
  const [mediaGlobal, setMediaGlobal] = useState(73.2);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // ─ Gráfico de pizza: Coerente | Incoerente | Não Avaliável ─
  const gerarDadosPizza = (dadosApi) => {
    const contagem = { Coerente: 0, Incoerente: 0, 'Não Avaliável': 0 };

    dadosApi.forEach(item => {
      if (item.coerente === true)  contagem.Coerente++;
      else if (item.coerente === false) contagem.Incoerente++;
      else contagem['Não Avaliável']++;
    });

    const formatoPizza = [
      { name: 'Coerente',       value: contagem.Coerente,         color: '#10b981' },
      { name: 'Incoerente',     value: contagem.Incoerente,       color: '#ef4444' },
      { name: 'Não Avaliável',  value: contagem['Não Avaliável'], color: '#64748b' },
    ].filter(d => d.value > 0);

    setDadosPizza(formatoPizza);
  };

  // ─ Gráfico de linha: taxa de coerência booleana agrupada por mês ─
  const gerarHistorico = (dadosApi) => {
    const sortedVotes = [...dadosApi]
      .filter(v => v.coerente !== null && v.coerente !== undefined)
      .sort((a, b) => new Date(a.data) - new Date(b.data));

    const mesesAbreviados = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const mesesMap = {};

    sortedVotes.forEach(v => {
      if (!v.data || v.data === 'N/A') return;
      const dataObj = new Date(v.data);
      if (isNaN(dataObj)) return;
      const chave = `${dataObj.getFullYear()}-${String(dataObj.getMonth() + 1).padStart(2, '0')}`;
      if (!mesesMap[chave]) {
        mesesMap[chave] = {
          coerentes: 0,
          total: 0,
          nome: `${mesesAbreviados[dataObj.getMonth()]}/${String(dataObj.getFullYear()).slice(2)}`
        };
      }
      mesesMap[chave].total += 1;
      if (v.coerente === true) mesesMap[chave].coerentes += 1;
    });

    const formatoHistorico = Object.keys(mesesMap).sort().map(chave => ({
      mes: mesesMap[chave].nome,
      coerencia: mesesMap[chave].total > 0
        ? Math.round((mesesMap[chave].coerentes / mesesMap[chave].total) * 100)
        : 0
    }));

    // Fallback por voto individual se não houver dados mensais suficientes
    if (formatoHistorico.length < 2) {
      const fallbacks = sortedVotes.slice(-6).map((v, i) => {
        let label = `Voto ${i + 1}`;
        if (v.data && v.data !== 'N/A') {
          const pts = v.data.split('-');
          if (pts.length === 3) label = `${pts[2]}/${pts[1]}`;
        }
        return { mes: label, coerencia: v.coerente ? 100 : 0 };
      });
      setDadosLinha(fallbacks);
    } else {
      setDadosLinha(formatoHistorico);
    }
  };

  useEffect(() => {
    const processarAnalise = async () => {
      try {
        setLoading(true);
        setErro(null);

        let currentPolitico = dadosPolitico;
        // Se não temos dadosPolitico ou o ID mudou, busca da API
        if (!currentPolitico || String(currentPolitico.id) !== String(id)) {
          const res = await getPoliticoById(id);
          if (res && res.status === 'ok') {
            currentPolitico = {
              id: res.dados.id,
              nome: res.dados.nome,
              partido: res.dados.partido,
              uf: res.dados.uf,
              foto: res.dados.foto,
              tipo: res.dados.tipo,
              coerencia: res.dados.coerencia || 0
            };
            setDadosPolitico(currentPolitico);
          } else {
            setErro("Não foi possível carregar as informações básicas deste político.");
            setLoading(false);
            return;
          }
        }

        const tipoParlamentar = currentPolitico?.tipo?.toLowerCase() === 'senador' ? 'senador' : 'deputado';
        
        const [resposta, metricsData] = await Promise.allSettled([
          analisarParlamentar(id, tipoParlamentar),
          getDashboardMetrics()
        ]);
        
        let resData = null;
        if (resposta.status === 'fulfilled' && resposta.value.status === 'ok') {
          resData = resposta.value;
          setAnalise(resData);
          gerarDadosPizza(resData.dados);
          gerarHistorico(resData.dados);

          // Usa o score_coerencia retornado diretamente pela API (taxa booleana)
          if (resData.score_coerencia != null) {
            setDadosPolitico(prev => ({
              ...prev,
              coerencia: Math.round(resData.score_coerencia)
            }));
          }
        } else if (resposta.status === 'fulfilled' && resposta.value.status === 'aviso') {
          setErro(resposta.value.mensagem);
        } else {
          setErro("Falha ao processar os dados com o modelo de IA.");
        }

        if (metricsData.status === 'fulfilled' && metricsData.value) {
          const mData = metricsData.value;
          if (mData.media_global_coerencia) {
            setMediaGlobal(mData.media_global_coerencia);
          }
          const partidoInfo = mData.metricas_por_partido?.find(
            m => m.partido === currentPolitico?.partido
          );
          if (partidoInfo) {
            setMediaPartido(partidoInfo.media_coerencia);
          }
        }
      } catch (err) {
        console.error(err);
        setErro("Falha ao processar os dados com o modelo de IA.");
      } finally {
        setLoading(false);
      }
    };

    processarAnalise();
  }, [id]);

  // ─ Badge de coerência booleana ─
  const renderizarStatus = (item) => {
    if (item.coerente === true)
      return (
        <span className="bg-brand-sucesso/20 text-brand-sucesso px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit">
          <CheckCircle size={12}/> Coerente
        </span>
      );
    if (item.coerente === false)
      return (
        <span className="bg-brand-alerta/20 text-brand-alerta px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit">
          <AlertTriangle size={12}/> Incoerente
        </span>
      );
    // coerente === null → neutro, não avaliável
    return (
      <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded text-xs font-bold w-fit">
        Não Avaliável
      </span>
    );
  };

  const comparacaoData = [
    { name: 'Político', value: dadosPolitico ? dadosPolitico.coerencia : 0, fill: '#14b8a6' },
    { name: `Média ${dadosPolitico?.partido || 'Partido'}`, value: Math.round(mediaPartido), fill: '#3b82f6' },
    { name: 'Média Global', value: Math.round(mediaGlobal), fill: '#6b7280' }
  ];

  return (
    <main className="p-4 md:p-8 w-full max-w-5xl mx-auto">
      <Link to="/" className="flex items-center gap-2 text-brand-petroleo hover:text-white transition-colors mb-6 w-fit font-semibold">
        <ArrowLeft size={18} /> Voltar para Visão Geral
      </Link>

      {/* Cabeçalho do Político */}
      {dadosPolitico && (
        <div className="flex flex-col sm:flex-row items-center gap-6 bg-surface p-6 rounded-lg border border-slate-800 mb-8 relative overflow-hidden text-center sm:text-left">
          <span className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider text-brand-petroleo bg-brand-petroleo/10 px-2 py-1 rounded">
            {dadosPolitico.tipo}
          </span>
          <img src={dadosPolitico.foto} alt={dadosPolitico.nome} className="w-24 h-24 rounded-full border-2 border-brand-petroleo object-cover shrink-0" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-texto-principal">{dadosPolitico.nome}</h1>
            <p className="text-texto-secundario mt-1 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-2">
              <span onClick={() => navigate(`/partidos/${dadosPolitico.partido.toLowerCase()}`)} className="hover:text-white cursor-pointer hover:underline">{dadosPolitico.partido}</span>
              •
              <span onClick={() => navigate(`/estados/${dadosPolitico.uf.toLowerCase()}`)} className="hover:text-white cursor-pointer hover:underline">{dadosPolitico.uf}</span>
            </p>
          </div>
        </div>
      )}

      {loading && <SkeletonPerfil />}

      {/* COMPONENTE DE EMPTY STATE: Trata de forma amigável a resposta de aviso do Flask ou se não há dados de votação */}
      {((erro || (analise && (!analise.dados || analise.dados.length === 0))) && !loading) && (
        <div className="bg-surface border border-dashed border-slate-700 rounded-lg p-12 text-center flex flex-col items-center mt-8">
          <div className="bg-slate-800/50 p-4 rounded-full mb-4">
            <FileQuestion size={48} className="text-texto-secundario" />
          </div>
          <h3 className="text-xl font-display font-bold text-texto-principal mb-2">Dados Insuficientes</h3>
          <p className="text-texto-secundario max-w-md mx-auto mb-6">
            {erro || "Nenhum dado de votação ou discurso foi encontrado para este parlamentar."}
          </p>
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

      {/* Renderização do conteúdo se a IA retornar sucesso e possuir dados suficientes */}
      {!loading && !erro && analise && analise.dados && analise.dados.length > 0 && (
        <>
          {dadosPizza.length > 0 && (
            <section className="bg-surface p-6 rounded-lg border border-slate-800 mb-8 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h3 className="text-xl font-display font-bold text-texto-principal mb-2">Distribuição de Coerência</h3>
                <p className="text-texto-secundario text-sm">
                  Proporção de votos coerentes vs. incoerentes dos {analise.total_votos_analisados} votos auditados pela IA.
                  {analise.score_coerencia != null && (
                    <strong className="ml-1 text-white">Score: {Math.round(analise.score_coerencia)}%</strong>
                  )}
                </p>
              </div>
              <div className="w-full md:w-1/2 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosPizza}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {dadosPizza.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#94A3B8', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* Gráficos adicionais: Histórico de Coerência e Comparação com Média do Partido */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Histórico */}
            <div className="bg-surface border border-slate-800 rounded-xl flex flex-col p-5">
              <h3 className="text-base font-bold text-texto-principal mb-4 flex items-center gap-2">
                <svg width="18" height="18" className="text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                Histórico de Coerência
              </h3>
              <div className="h-[240px] w-full">
                {dadosLinha.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dadosLinha} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="0" stroke="#334155" vertical={false} />
                      <XAxis dataKey="mes" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[50, 100]} tickFormatter={(val) => `${val}%`} />
                      <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#14b8a6', fontWeight: 'bold' }} />
                      <Line type="monotone" dataKey="coerencia" name="Coerência" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4, fill: '#14b8a6', strokeWidth: 2, stroke: '#1e293b' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-texto-secundario">Dados insuficientes para histórico</div>
                )}
              </div>
            </div>

            {/* Comparação */}
            <div className="bg-surface border border-slate-800 rounded-xl flex flex-col p-5">
              <h3 className="text-base font-bold text-texto-principal mb-4 flex items-center gap-2">
                <svg width="18" height="18" className="text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="6" height="18" rx="1"/><rect x="9" y="8" width="6" height="13" rx="1"/><rect x="16" y="5" width="6" height="16" rx="1"/></svg>
                Comparação de Coerência
              </h3>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparacaoData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="0" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                    <Tooltip cursor={{ fill: '#334155', opacity: 0.3 }} contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="value" name="Coerência" radius={[4, 4, 0, 0]}>
                      {comparacaoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

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

                    {/* Linha: Postura no discurso → Voto oficial */}
                    <div className="flex flex-wrap items-center gap-2 text-sm mt-1">
                      <span className="text-texto-secundario">Postura no discurso:</span>
                      <span className={`px-2 py-0.5 rounded font-semibold text-xs ${
                        voto.postura_extraida === 'A Favor'
                          ? 'bg-emerald-900/40 text-emerald-400'
                          : voto.postura_extraida === 'Contra'
                          ? 'bg-red-900/40 text-red-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}>{voto.postura_extraida || 'Neutro'}</span>
                      <span className="text-texto-secundario">→ Voto:</span>
                      <strong className="text-white bg-slate-800 px-2 py-0.5 rounded">{voto.voto}</strong>
                    </div>

                    {voto.justificativa && (
                      <p className="text-sm mt-3 text-texto-secundario bg-slate-800/50 p-3 rounded italic border-l-2 border-brand-petroleo">
                        &ldquo;{voto.justificativa}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="md:w-40 w-full flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2 bg-fundo p-3 rounded border border-slate-800">
                    {renderizarStatus(voto)}
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