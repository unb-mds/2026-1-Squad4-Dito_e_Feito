import React from 'react';

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
      role: "Monitoramento de Notícias",
      github: "https://github.com/SUDOTMOX",
      foto: "https://github.com/SUDOTMOX.png" 
    },
    { 
      nome: "Juan Costa Indiano", 
      email: "juan75indiano@gmail.com", 
      role: "Engenharia de Software",
      github: "https://github.com/IndianoDev",
      foto: "https://github.com/IndianoDev.png" 
    },
    { 
      nome: "Gabriel Velho de Souza", 
      email: "gabrielvelho08@gmail.com", 
      role: "Engenharia de Software",
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

  // Função para pegar as iniciais caso não tenha foto
  const getInitials = (name) => name.split(' ').slice(0, 2).map(n => n[0]).join('');

  return (
    <div className="py-9 px-10 max-w-[1100px] w-full mx-auto animate-[fadeIn_0.2s_ease]">
      
<<<<<<< HEAD
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
=======
      {/* Hero: Descrição do Projeto */}
      <div className="py-10 border-b border-borda mb-8">
        <div className="font-display text-[48px] font-bold text-texto leading-[1.1] mb-6">
          Dito e <em className="text-petroleo-light italic">Feito</em>
>>>>>>> 290aad4 (feat: prototipo versao 2)
        </div>
        <div className="text-[16px] text-texto-sec leading-[1.8] max-w-[800px] space-y-4">
          <p>
            O Dito e Feito é uma plataforma de inteligência de dados focada em transparência governamental. 
            Utilizamos técnicas de Processamento de Linguagem Natural (NLP), especificamente modelos baseados em Transformers (como o <strong>BERTimbau</strong>), 
            para processar discursos e projetos de lei.
          </p>
          <p>
            Nosso algoritmo de embeddings semânticos compara o conteúdo falado pelos parlamentares com seus votos nominais no plenário, 
            gerando um <strong className="text-texto">Score de Coerência</strong> auditável e transparente.
          </p>
        </div>
      </div>

      {/* Tech Stack (Mantido pois complementa sua descrição técnica) */}
      <div className="text-[13px] font-semibold text-texto-sec uppercase tracking-[0.08em] font-mono mb-3.5">Stack tecnológica</div>
      <div className="grid grid-cols-4 gap-3 mb-10">
        <div className="bg-surface border border-borda rounded-custom shadow-custom p-[16px_20px]">
          <div className="text-[20px] mb-2.5">⚛️</div>
          <div className="text-[13px] font-semibold text-texto mb-1">React + Vite</div>
          <div className="text-[12px] text-texto-sec leading-[1.5]">Interface reativa com build otimizado via Vite</div>
        </div>
        <div className="bg-surface border border-borda rounded-custom shadow-custom p-[16px_20px]">
          <div className="text-[20px] mb-2.5">🎨</div>
          <div className="text-[13px] font-semibold text-texto mb-1">Tailwind CSS v4</div>
          <div className="text-[12px] text-texto-sec leading-[1.5]">Estilização utility-first em alta performance</div>
        </div>
        <div className="bg-surface border border-borda rounded-custom shadow-custom p-[16px_20px]">
          <div className="text-[20px] mb-2.5">🧠</div>
          <div className="text-[13px] font-semibold text-texto mb-1">Python + BERT</div>
          <div className="text-[12px] text-texto-sec leading-[1.5]">Backend com modelo de NLP para análise semântica</div>
        </div>
        <div className="bg-surface border border-borda rounded-custom shadow-custom p-[16px_20px]">
          <div className="text-[20px] mb-2.5">🗄️</div>
          <div className="text-[13px] font-semibold text-texto mb-1">PostgreSQL</div>
          <div className="text-[12px] text-texto-sec leading-[1.5]">Banco de dados integrando Câmara e Senado</div>
        </div>
      </div>

      {/* Equipe de Desenvolvimento */}
      <div className="text-[13px] font-semibold text-texto-sec uppercase tracking-[0.08em] font-mono mb-3.5 mt-5">
        Equipe de Desenvolvimento — Squad 4
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipe.map((membro, index) => {
          // Define se o card será clicável ou não
          const CardWrapper = membro.github ? 'a' : 'div';
          
          return (
            <CardWrapper
              key={index}
              href={membro.github || undefined}
              target={membro.github ? "_blank" : undefined}
              rel={membro.github ? "noopener noreferrer" : undefined}
              className={`block bg-surface border border-borda rounded-custom shadow-custom p-5 transition-colors ${membro.github ? 'hover:border-petroleo hover:bg-surface-hover cursor-pointer' : ''}`}
            >
              <div className="flex items-center gap-4">
                
                {/* Renderiza a foto do GitHub se existir, ou as iniciais caso contrário */}
                {membro.foto ? (
                  <img
                    src={membro.foto}
                    alt={membro.nome}
                    className="w-[50px] h-[50px] rounded-full object-cover border border-borda shrink-0"
                  />
                ) : (
                  <div className="w-[50px] h-[50px] rounded-full shrink-0 bg-petroleo-dim border border-petroleo/30 flex items-center justify-center text-[15px] font-semibold text-petroleo-light font-mono">
                    {getInitials(membro.nome)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[14px] text-texto truncate" title={membro.nome}>
                    {membro.nome}
                  </h3>
                  <p className="text-[12px] font-mono text-petroleo-light mt-0.5 truncate" title={membro.role}>
                    {membro.role}
                  </p>
                  <p className="text-[11px] text-texto-sec mt-1.5 truncate">
                    {membro.email}
                  </p>
                </div>

              </div>
            </CardWrapper>
          );
        })}
      </div>

    </div>
  );
}