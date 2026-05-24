export function Sobre() {
  const equipe = [
    { nome: "Gustavo Antonio Rodrigues e Silva", 
      email: "gus.ant.rod.10@gmail.com", 
      role: "Monitoramento de Coerência",
      github: "https://github.com/gus-ant",
      foto: "https://github.com/gus-ant.png" },

    { nome: "Sauhan Ferreira Melo", 
      email: "sauhanmello20@gmail.com", 
      role: "Monitoramento de Notícias",
      github: "https://github.com/SUDOTMOX",
      foto: "https://github.com/SUDOTMOX.png" },

    { nome: "Juan Costa Indiano", 
      email: "juan75indiano@gmail.com", 
      role: "Engenharia de Software",
      github: "https://github.com/IndianoDev",
      foto: "https://github.com/IndianoDev.png" },

    { nome: "Gabriel Velho de Souza", 
      email: "gabrielvelho08@gmail.com", 
      role: "Engenharia de Software",
      github: "https://github.com/Velho008",
      foto: "https://github.com/Velho008.png" },

    { nome: "Thomaz Marra Martins", 
      email: "N/A", 
      role: "N/A",
      github: "",
      foto: "" },
  ];

  return (
    <main className="p-8 max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-display font-bold text-texto-principal mb-6">
        Sobre o Projeto
      </h1>
      
      <section className="bg-surface p-8 rounded-lg border border-slate-800 shadow-sm mb-8">
        <h2 className="text-xl font-display font-bold mb-4 text-brand-petroleo">
          Dito e Feito: Análise Política com IA
        </h2>
        <p className="text-texto-secundario leading-relaxed mb-4">
          O Dito e Feito é uma plataforma de inteligência de dados focada em transparência governamental. 
          Utilizamos técnicas de Processamento de Linguagem Natural (NLP), especificamente modelos baseados em Transformers (como o BERTimbau), 
          para processar discursos e projetos de lei.
        </p>
        <p className="text-texto-secundario leading-relaxed">
          Nosso algoritmo de embeddings semânticos compara o conteúdo falado pelos parlamentares com seus votos nominais no plenário, 
          gerando um <strong>Score de Coerência</strong> auditável e transparente.
        </p>
      </section>

      <section>
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <img
              src="https://cdn-icons-png.flaticon.com/512/681/681494.png"
              className="w-8 h-8"
              style={{
                filter: "invert(40%) sepia(80%) saturate(500%) hue-rotate(160deg)"
              }}
            />

            <h2 className="text-2xl font-display font-bold text-texto-principal">
              Equipe de Desenvolvimento - Squad 4
            </h2>
          </div>

          <p className="text-sm text-texto-secundario mt-2 max-w-2xl">
            Projeto desenvolvido na <strong>Universidade de Brasilia (UnB)</strong>, vinculado à <strong>Faculdade do Gama (FCTE)</strong>, por alunos de Engenharia de software
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {equipe.map((membro, index) => (
            <a
              key={index}
              href={membro.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-4 bg-surface p-5 rounded-lg border border-slate-800 hover:border-brand-petroleo transition-colors"
            >
            <img
              src={membro.foto}
              alt={membro.nome}
              className="w-20 h-20 rounded-full object-cover border border-slate-700 flex-shrink-0"
            />

            <div className="flex flex-col justify-center">
              <h3 className="font-bold text-texto-principal">
                {membro.nome}
              </h3>

              <p className="text-sm text-brand-petroleo mt-1">
                {membro.role}
              </p>
              <p className="text-xs text-texto-secundario mt-2">
                {membro.email}
              </p>
            </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}