import { Brain } from "lucide-react"
export function Sobre() {
  const equipe = [
    {
      nome: "Gustavo Antonio Rodrigues e Silva",
      email: "gus.ant.rod.10@gmail.com",
      role: "Project Owner, Desenvolvedor de IA e backend completo",
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
      role: "Scrum Master e Engenheiro de Dados",
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
  ];

  return (
    <div className="flex flex-col flex-1 bg-bg text-text-main animate-[fadeIn_0.2s_ease]">
      <div className="p-4 md:p-[28px_32px] flex-1 overflow-y-auto">

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
        <div className="bg-surface border border-border rounded-xl p-6 mb-4">

          <div className="text-[18px] font-bold text-text-main mb-4">
            Metodologia
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {[
              {
                title: "Coleta de Dados",
                desc: "Utilizamos as APIs oficiais da Câmara e do Senado.",
                icon: (
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <ellipse cx="12" cy="5" rx="7" ry="3"/>
                    <path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5"/>
                    <path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>
                  </svg>
                )
              },

              {
                title: "Análise de NLP",
                desc: "Modelos de embeddings processam os discursos.",
                icon: <Brain size={18} />
              },

              {
                title: "Comparação Automatizada",
                desc: "Algoritmos comparam discursos com os votos.",
                icon: (
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>
                  </svg>
                )
              },

              {
                title: "Score de Coerência",
                desc: "Calculamos um índice percentual de coerência.",
                icon: (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                    <circle cx="12" cy="12" r="8"/>
                    <circle cx="12" cy="12" r="4.5"/>
                    <circle cx="12" cy="12" r="1.5"/>
                  </svg>
                )
              }

            ].map((m, i) => (
              <div
                key={i}
                className="flex gap-3.5 p-4 bg-bg border border-border rounded-[10px]"
              >

                <div className="w-10 h-10 rounded-lg bg-teal-bg border border-teal-border flex items-center justify-center shrink-0 text-teal">
                  {m.icon}
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

        {/* FONTES DE DADOS */}
        <div className="bg-surface border border-border rounded-xl p-6 mb-4">

          <div className="text-[18px] font-bold text-text-main mb-4">
            Fontes de Dados
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {[
              {
                nome: "API da Câmara dos Deputados",
                link: "https://dadosabertos.camara.leg.br/"
              },
              {
                nome: "API do Senado Federal",
                link: "https://legis.senado.leg.br/dadosabertos/"
              }
            ].map((api, i) => (
              <a
                key={i}
                href={api.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3.5 p-4 bg-bg border border-border rounded-[10px] hover:border-teal transition-colors"
              >

                {/* ESCUDO */}
                <div className="w-10 h-10 rounded-lg bg-teal-bg border border-teal-border flex items-center justify-center shrink-0 text-teal">
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3z"/>
                  </svg>
                </div>

                <div className="min-w-0">
                  <div className="text-[14px] font-bold text-text-main mb-1">
                    {api.nome}
                  </div>

                  <div className="text-[13px] text-teal break-all">
                    {api.link}
                  </div>
                </div>

              </a>
            ))}

          </div>

          {/* AVISO */}
          <div className="mt-5 flex items-center justify-center gap-2 text-[13px] text-teal font-medium">

            {/* seta subindo estilo gráfico */}
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 16L10 10L14 14L20 8"/>
              <path d="M20 8H14"/>
              <path d="M20 8V14"/>
            </svg>

            <strong>Fontes de Dados Atualizadas:</strong>Atualizações feitas a cada 6 horas via API REST

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