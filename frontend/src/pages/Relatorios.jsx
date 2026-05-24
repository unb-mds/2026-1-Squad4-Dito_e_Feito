import { FileText, Download } from 'lucide-react';

export function Relatorios() {
  const listaRelatorios = [
    {
      titulo: "Relatório de Coerência Global - Q4 2025",
      data: "15 Dez 2025",
      formato: "PDF",
      tamanho: "2.3 MB"
    },
    {
      titulo: "Análise de Divergências por Partido",
      data: "10 Dez 2025",
      formato: "CSV",
      tamanho: "845 KB"
    },
    {
      titulo: "Ranking de Políticos - Novembro",
      data: "30 Nov 2025",
      formato: "PDF",
      tamanho: "1.9 MB"
    }
  ];

  return (
    <main className="p-8 w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-texto-principal">Central de Relatórios</h1>
        <p className="text-texto-secundario mt-2">Acesse e baixe os relatórios consolidados de análise política gerados pela nossa inteligência artificial.</p>
      </div>

      <div className="flex flex-col gap-4">
        {listaRelatorios.map((relatorio, index) => (
          <div key={index} className="bg-surface p-5 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-600 transition-colors">
            
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-slate-800/80 rounded-lg flex items-center justify-center text-brand-petroleo border border-slate-700">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-bold text-texto-principal text-lg">{relatorio.titulo}</h3>
                <div className="flex items-center gap-3 text-sm text-texto-secundario mt-1">
                  <span>{relatorio.data}</span>
                  <span>&bull;</span>
                  <span className="font-mono uppercase">{relatorio.formato}</span>
                  <span>&bull;</span>
                  <span>{relatorio.tamanho}</span>
                </div>
              </div>
            </div>

            <button className="flex items-center gap-2 bg-brand-petroleo hover:bg-[#0d635c] text-white px-5 py-2.5 rounded-lg font-semibold transition-colors">
              <Download size={18} />
              Download
            </button>
            
          </div>
        ))}
      </div>
    </main>
  );
}