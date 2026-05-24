export function Sobre() {
  const equipe = [
    { nome: "Gustavo Antonio Rodrigues e Silva", email: "gus.ant.rod.10@gmail.com" },
    { nome: "Lucas Abdalla Nery", email: "nerylucas07@gmail.com" },
    { nome: "Sauhan Ferreira Melo", email: "sauhanmello20@gmail.com" },
    { nome: "Juan Costa Indiano", email: "juan75indiano@gmail.com" },
    { nome: "Gabriel Velho de Souza", email: "gabrielvelho08@gmail.com" },
    { nome: "Thomaz Marra Martins", email: "" },
  ];

  return (
    <div className="flex flex-col flex-1 animate-[fadeIn_0.2s_ease]">
      <div className="p-[28px_32px] flex-1 overflow-y-auto">
        <div className="bg-surface border border-border rounded-xl p-6 mb-4">
          <div className="text-[22px] font-bold text-text-main mb-3">Sobre o <strong className="text-teal">Dito e Feito</strong></div>
          <div className="text-[14px] text-text2 leading-[1.7]">O <strong className="text-teal">Dito e Feito</strong> é uma plataforma de análise política desenvolvida para monitorar a coerência entre o discurso público de parlamentares brasileiros e seus votos reais no Congresso Nacional, utilizando técnicas avançadas de Inteligência Artificial e Processamento de Linguagem Natural (NLP) com embeddings semânticos.</div>
        </div>

        <div className="mb-4">
          <div className="text-[18px] font-bold text-text-main mb-3.5">Metodologia</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: 'Coleta de Dados', desc: 'Utilizamos as APIs oficiais da Câmara e do Senado.' },
              { title: 'Análise de NLP', desc: 'Modelos de embeddings processam os discursos.' },
              { title: 'Comparação Automatizada', desc: 'Algoritmos comparam discursos com os votos.' },
              { title: 'Score de Coerência', desc: 'Calculamos um índice percentual de coerência.' }
            ].map((m, i) => (
              <div key={i} className="flex gap-3.5 p-4 bg-surface border border-border rounded-[10px]">
                <div className="w-10 h-10 rounded-lg bg-teal-bg border border-teal-border flex items-center justify-center shrink-0 text-teal text-[18px]">⚙️</div>
                <div>
                  <div className="text-[14px] font-bold text-text-main mb-1.5">{m.title}</div>
                  <div className="text-[13px] text-text2 leading-[1.5]">{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 mb-4">
          <div className="flex items-center gap-2.5 mb-2">
            <svg width="20" height="20" className="text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <div className="text-[18px] font-bold text-text-main">Equipe - Squad 4</div>
          </div>
          <div className="text-[13px] text-text2 mb-4">Projeto desenvolvido na <strong className="text-text-main">Universidade de Brasília (UnB)</strong>, vinculado à <strong className="text-text-main">Faculdade do Gama (FGA)</strong>, por alunos de Engenharia de Software.</div>
          <div className="grid grid-cols-2 gap-2.5">
            {equipe.map((m, i) => (
              <div key={i} className="p-[14px_16px] bg-surface2 border border-border2 rounded-lg">
                <div className="text-[14px] font-bold text-text-main mb-1">{m.nome}</div>
                <div className="flex items-center gap-1.5 text-[12px] text-text2">
                  {m.email && <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
                  {m.email}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}