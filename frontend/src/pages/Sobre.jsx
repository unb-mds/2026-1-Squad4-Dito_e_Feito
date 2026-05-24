export function Sobre() {
  const equipe = [
    {
      nome: "Gustavo Antonio Rodrigues e Silva",
      email: "gus.ant.rod.10@gmail.com",
      role: "Monitoramento de Coerência",
      github: "https://github.com/gus-ant",
      foto: "https://github.com/gus-ant.png"
    },
    {
      nome: "Sauhan Ferreira Melo",
      email: "sauhanmello20@gmail.com",
      role: "frontend completo",
      github: "https://github.com/SUDOTMOX",
      foto: "https://github.com/SUDOTMOX.png"
    },
    {
      nome: "Juan Costa Indiano",
      email: "juan75indiano@gmail.com",
      role: "Engenharia de Dados",
      github: "https://github.com/IndianoDev",
      foto: "https://github.com/IndianoDev.png"
    },
    {
      nome: "Gabriel Velho de Souza",
      email: "gabrielvelho08@gmail.com",
      role: "frontend completo",
      github: "https://github.com/Velho008",
      foto: "https://github.com/Velho008.png"
    },
    {
      nome: "Thomaz Marra Martins",
      email: "N/A",
      role: "N/A",
      github: "",
      foto: ""
    },
  ];

  return (
    <div className="flex flex-col flex-1 bg-bg text-text-main animate-[fadeIn_0.2s_ease]">
      <div className="p-[28px_32px] flex-1 overflow-y-auto">

        {/* INTRO */}
        <div className="bg-surface border border-border rounded-xl p-6 mb-4">
          <div className="text-[22px] font-bold text-text-main mb-3">
            Sobre o <strong className="text-teal">Dito e Feito</strong>
          </div>

          <div className="text-[14px] text-text2 leading-[1.7]">
            O <strong className="text-teal">Dito e Feito</strong> é uma plataforma de análise política desenvolvida para monitorar a 
            coerência entre o discurso público de parlamentares brasileiros e seus votos reais no Congresso Nacional, 
            utilizando técnicas avançadas de Inteligência Artificial e Processamento de Linguagem Natural (NLP) 
            com embeddings semânticos.
          </div>
        </div>

        {/* METODOLOGIA */}
        <div className="mb-4">
          <div className="text-[18px] font-bold text-text-main mb-3.5">
            Metodologia
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { title: "Coleta de Dados", desc: "Utilizamos as APIs oficiais da Câmara e do Senado." },
              { title: "Análise de NLP", desc: "Modelos de embeddings processam os discursos." },
              { title: "Comparação Automatizada", desc: "Algoritmos comparam discursos com os votos." },
              { title: "Score de Coerência", desc: "Calculamos um índice percentual de coerência." }
            ].map((m, i) => (
              <div key={i} className="flex gap-3.5 p-4 bg-surface border border-border rounded-[10px]">
                <div className="w-10 h-10 rounded-lg bg-teal-bg border border-teal-border flex items-center justify-center shrink-0 text-teal text-[18px]">
                  ⚙️
                </div>

                <div>
                  <div className="text-[14px] font-bold text-text-main mb-1.5">
                    {m.title}
                  </div>
                  <div className="text-[13px] text-text2 leading-[1.5]">
                    {m.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SQUAD */}
        <div className="bg-surface border border-border rounded-xl p-6 mb-4">

          <div className="flex items-center gap-2.5 mb-2">
            <svg
              width="20"
              height="20"
              className="text-teal"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>

            <div className="text-[18px] font-bold text-text-main">
              Equipe - Squad 4
            </div>
          </div>

          <div className="text-[13px] text-text2 mb-4">
            Projeto desenvolvido na <strong className="text-text-main">Universidade de Brasília (UnB)</strong>,
            vinculado à <strong className="text-text-main">Faculdade do Gama (FGA)</strong>, por alunos de Engenharia de Software.
          </div>

          {/* CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {equipe.map((membro, index) => {
              const Card = membro.github ? "a" : "div";

              return (
                <Card
                  key={index}
                  href={membro.github || undefined}
                  target={membro.github ? "_blank" : undefined}
                  rel={membro.github ? "noopener noreferrer" : undefined}
                  className="flex gap-4 bg-surface border border-border p-5 rounded-lg hover:border-teal transition-colors"
                >

                  <img
                    src={membro.foto || "https://via.placeholder.com/80"}
                    alt={membro.nome}
                    className="w-20 h-20 rounded-full object-cover border border-border flex-shrink-0"
                  />

                  <div className="flex flex-col justify-center">
                    <h3 className="font-bold text-text-main">
                      {membro.nome}
                    </h3>

                    <p className="text-sm text-teal mt-1">
                      {membro.role}
                    </p>

                    <p className="text-xs text-text2 mt-2">
                      {membro.email}
                    </p>
                  </div>

                </Card>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
}