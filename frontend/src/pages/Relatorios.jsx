import React, { useState, useEffect } from 'react';
import { getDashboardMetrics, getMetricsJson } from '../services/api';

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-lg bg-teal-bg border border-teal-border flex items-center justify-center shrink-0 text-teal">
        {icon}
      </div>
      <div>
        <div className="text-[22px] font-bold text-text-main leading-tight">{value}</div>
        <div className="text-[13px] text-text2">{label}</div>
      </div>
    </div>
  );
}

export function Relatorios() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);

  useEffect(() => {
    getDashboardMetrics()
      .then((data) => {
        if (data) {
          setMetrics(data);
        } else {
          setError('Servidor nao encontrado. Verifique se o backend esta rodando na porta 5001.');
        }
      })
      .catch(() => setError('Falha ao conectar com o backend.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadDone(false);
    try {
      const data = await getMetricsJson();
      if (!data) {
        alert('Nao foi possivel obter os dados do servidor.');
        return;
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `dito-e-feito-metricas-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadDone(true);
      setTimeout(() => setDownloadDone(false), 3000);
    } catch {
      alert('Erro ao gerar o arquivo de download.');
    } finally {
      setDownloading(false);
    }
  };

  const totalAnalisados = metrics?.total_analisados ?? '-';
  const mediaGlobal = metrics?.media_global_coerencia != null
    ? `${metrics.media_global_coerencia.toFixed(2)}%`
    : '-';
  const partidoTop = metrics?.partido_mais_coerente?.partido ?? '-';
  const totalPartidos = metrics?.metricas_por_partido?.length ?? '-';
  const fonte = metrics?.fonte ?? null;

  return (
    <div className="flex flex-col flex-1 animate-[fadeIn_0.2s_ease]">
      <div className="p-4 md:p-[16px_32px] border-b border-border shrink-0">
        <div className="text-[20px] font-bold text-text-main">Relatorios</div>
        <div className="text-[13px] text-text2 mt-0.5">Dados reais do backend — transparencia total</div>
      </div>

      <div className="p-4 md:p-[28px_32px] flex-1 overflow-y-auto flex flex-col gap-6">

        {!loading && (
          <div className={`flex items-center gap-2 text-[12px] px-3 py-2 rounded-lg border w-fit ${error ? 'bg-red-900/20 border-red-700/40 text-red-400' : 'bg-teal-bg border-teal-border text-teal'}`}>
            <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-400' : 'bg-teal'}`} />
            {error ? `Backend offline — ${error}` : `Backend conectado${fonte ? ` · fonte: ${fonte}` : ''}`}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-5 h-20 animate-pulse" />
            ))}
          </div>
        ) : !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
              label="Parlamentares analisados"
              value={totalAnalisados}
            />
            <StatCard
              icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}
              label="Coerencia media global"
              value={mediaGlobal}
            />
            <StatCard
              icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>}
              label="Partido mais coerente"
              value={partidoTop}
            />
            <StatCard
              icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>}
              label="Partidos com dados"
              value={totalPartidos}
            />
          </div>
        )}

        <div className="bg-surface border border-border rounded-xl">
          <div className="p-[16px_20px] border-b border-border2">
            <div className="text-[16px] font-bold text-text-main">Central de Relatorios</div>
            <div className="text-[12px] text-text2 mt-0.5">Baixe os dados brutos em formato aberto para sua propria analise</div>
          </div>

          <div className="flex items-center gap-4 p-[14px_20px] hover:bg-surface2 transition-colors">
            <div className="w-11 h-11 rounded-lg bg-teal-bg border border-teal-border flex items-center justify-center shrink-0 text-teal">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold text-text-main mb-1 truncate">Metricas de Coerencia — Todos os Parlamentares</div>
              <div className="text-[12px] text-text2 flex items-center gap-1.5 flex-wrap">
                <span>Dados em tempo real do backend</span>
                <div className="w-1 h-1 rounded-full bg-text3" />
                <span>JSON</span>
                {metrics && (<><div className="w-1 h-1 rounded-full bg-text3" /><span>{totalAnalisados} parlamentares</span></>)}
              </div>
            </div>
            <button
              id="btn-download-metricas-json"
              onClick={handleDownload}
              disabled={downloading || !!error}
              className={`flex items-center gap-1.5 border-none rounded-lg p-[8px_16px] text-[13px] font-semibold transition-all shrink-0 ${downloadDone ? 'bg-green-600 text-white cursor-pointer' : error ? 'bg-surface2 text-text3 cursor-not-allowed' : 'bg-teal text-white hover:opacity-85 cursor-pointer'} ${downloading ? 'opacity-60 cursor-wait' : ''}`}
            >
              {downloading ? (
                <><svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>Gerando...</>
              ) : downloadDone ? (
                <><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Baixado!</>
              ) : (
                <><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>Download JSON</>
              )}
            </button>
          </div>

          {!error && metrics?.metricas_por_partido?.length > 0 && (
            <div className="flex items-center gap-4 p-[14px_20px] border-t border-border2 hover:bg-surface2 transition-colors">
              <div className="w-11 h-11 rounded-lg bg-teal-bg border border-teal-border flex items-center justify-center shrink-0 text-teal">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-text-main mb-1">Ranking de Coerencia por Partido</div>
                <div className="text-[12px] text-text2 flex items-center gap-1.5 flex-wrap">
                  <span>Calculado a partir dos dados do backend</span>
                  <div className="w-1 h-1 rounded-full bg-text3" />
                  <span>JSON</span>
                  <div className="w-1 h-1 rounded-full bg-text3" />
                  <span>{metrics.metricas_por_partido.length} partidos</span>
                </div>
              </div>
              <button
                id="btn-download-ranking-partidos"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(metrics.metricas_por_partido, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `dito-e-feito-partidos-${new Date().toISOString().slice(0, 10)}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-1.5 bg-teal text-white border-none rounded-lg p-[8px_16px] text-[13px] font-semibold cursor-pointer hover:opacity-85 transition-opacity shrink-0"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Download JSON
              </button>
            </div>
          )}
        </div>

        {!loading && !error && metrics?.metricas_por_partido?.length > 0 && (
          <div className="bg-surface border border-border rounded-xl">
            <div className="p-[16px_20px] border-b border-border2">
              <div className="text-[15px] font-bold text-text-main">Previa — Coerencia por Partido</div>
              <div className="text-[12px] text-text2 mt-0.5">Top {Math.min(metrics.metricas_por_partido.length, 10)} partidos ordenados por coerencia</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border2">
                    <th className="text-left p-[10px_20px] text-text2 font-semibold">#</th>
                    <th className="text-left p-[10px_12px] text-text2 font-semibold">Partido</th>
                    <th className="text-left p-[10px_12px] text-text2 font-semibold">Coerencia Media</th>
                    <th className="text-left p-[10px_12px] text-text2 font-semibold">Parlamentares</th>
                  </tr>
                </thead>
                <tbody>
                  {[...metrics.metricas_por_partido]
                    .sort((a, b) => b.media_coerencia - a.media_coerencia)
                    .slice(0, 10)
                    .map((p, i) => (
                      <tr key={p.partido} className="border-b border-border2 last:border-0 hover:bg-surface2 transition-colors">
                        <td className="p-[10px_20px] text-text3">{i + 1}</td>
                        <td className="p-[10px_12px] font-semibold text-text-main">{p.partido}</td>
                        <td className="p-[10px_12px]">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 bg-border rounded-full overflow-hidden">
                              <div className="h-full bg-teal rounded-full" style={{ width: `${Math.min(p.media_coerencia, 100)}%` }} />
                            </div>
                            <span className="text-text2">{p.media_coerencia.toFixed(2)}%</span>
                          </div>
                        </td>
                        <td className="p-[10px_12px] text-text2">{p.total_senadores}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
