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

  const getInitials = (name) => name.split(' ').slice(0, 2).map(n => n[0]).join('');

  return (
    <div className="py-9 px-10 max-w-[1100px] w-full mx-auto animate-[fadeIn_0.2s_ease]">
      
      <div className="py-10 border-b border-borda mb-8">
        <div className="font-display text-[48px] font-bold text-texto leading-[1.1] mb-4">
          Dito e <em className="text-petroleo-light italic">Feito</em>
        </div>
        <div className="text-[16px] text-texto-sec leading-[1.8] max-w-[800px] space-y-4">
          <p>
            O Dito e Feito é uma plataforma de inteligência de dados focada em transparência governamental. 
            Utilizamos técnicas de Processamento de Linguagem Natural (NLP), especificamente modelos baseados em Transformers (como o <strong>BERTimbau</strong>), 
            para processar discursos e projetos de lei.
          </p>
        </div>
      </div>

      <div className="text-[13px] font-semibold text-texto-sec uppercase tracking-[0.08em] font-mono mb-3.5 mt-5">
        Equipe de Desenvolvimento — Squad 4
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipe.map((membro, index) => {
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
                {membro.foto ? (
                  <img src={membro.foto} alt={membro.nome} className="w-[50px] h-[50px] rounded-full object-cover border border-borda shrink-0" />
                ) : (
                  <div className="w-[50px] h-[50px] rounded-full shrink-0 bg-petroleo-dim border border-petroleo/30 flex items-center justify-center text-[15px] font-semibold text-petroleo-light font-mono">
                    {getInitials(membro.nome)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[14px] text-texto truncate">{membro.nome}</h3>
                  <p className="text-[12px] font-mono text-petroleo-light mt-0.5 truncate">{membro.role}</p>
                </div>
              </div>
            </CardWrapper>
          );
        })}
      </div>
    </div>
  );
}