# Dito e Feito: Documentação

**Análise de coerência política com Inteligência Artificial**

O **Dito e Feito** é um sistema que compara discursos de parlamentares com seus votos reais em plenário, promovendo transparência e apoiando a análise do comportamento legislativo brasileiro por meio de dados e IA.

---

## Sobre o Projeto

Em democracias modernas, discursos políticos e votações são públicos, mas dispersos e difíceis de analisar. Este projeto resolve esse problema ao cruzar essas informações e gerar **indicadores de coerência** acessíveis a pesquisadores, jornalistas e cidadãos.

O sistema analisa:

- **Discursos** — ementas, justificativas e pronunciamentos
- **Votações** — registros nominais de cada parlamentar

E responde à pergunta:

> _O parlamentar vota de acordo com o que defende?_

---

## Funcionalidades Previstas

| Funcionalidade | Descrição |
|---|---|
| Dashboard interativo | Indicadores de coerência por parlamentar |
| Análise temporal | Evolução do posicionamento ao longo do tempo |
| Ranking | Classificação de parlamentares por coerência |
| Filtros avançados | Por partido, estado e período |
| NLP / IA | Análise semântica de textos políticos |
| Comparação | Discurso vs. comportamento legislativo |

---

## Stack Tecnológica

| Área | Tecnologias |
|---|---|
| **Frontend** | Next.js + TypeScript |
| **Backend** | Python + FastAPI |
| **IA / NLP** | BERTimbau, HuggingFace, spaCy |
| **Banco de Dados** | PostgreSQL + pgvector |
| **Infraestrutura** | Docker, GitHub Actions |

---

## Equipe

Projeto desenvolvido pelo **Squad 4** — Métodos de Desenvolvimento de Software (2026/1), UnB.

<style>
  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 20px;
    margin-top: 30px;
  }
  .team-card {
    border: 1px solid var(--md-default-fg-color--pct-10, rgba(120, 120, 120, 0.2));
    border-radius: 12px;
    padding: 24px 16px;
    text-align: center;
    background: var(--md-default-bg-color, #ffffff);
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .team-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    border-color: var(--md-primary-fg-color, #009688);
  }
  .team-avatar {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    border: 3px solid var(--md-primary-fg-color, #009688);
    margin-bottom: 12px;
    transition: border-color 0.3s ease;
  }
  .team-card:hover .team-avatar {
    border-color: var(--md-accent-fg-color, #00796b);
  }
  .team-name {
    margin: 0 0 4px 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--md-typeset-color, #2e2e2e);
  }
  .team-role {
    margin: 0 0 16px 0;
    font-size: 0.8rem;
    color: var(--md-typeset-color, #6e6e6e);
    opacity: 0.7;
  }
  .team-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 16px;
    background-color: var(--md-primary-fg-color, #009688);
    color: #ffffff !important;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 500;
    font-size: 0.85rem;
    transition: background-color 0.2s ease;
  }
  .team-link:hover {
    background-color: var(--md-accent-fg-color, #00796b);
  }
</style>

<div class="team-grid">
  <!-- Card 1 -->
  <div class="team-card">
    <img src="https://github.com/CaioHabibe.png" class="team-avatar" alt="Caio Falcão Habibe Costa">
    <h3 class="team-name">Caio Falcão Habibe Costa</h3>
    <p class="team-role">Colaborador</p>
    <a class="team-link" href="https://github.com/CaioHabibe" target="_blank">
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
      GitHub
    </a>
  </div>

  <!-- Card 2 -->
  <div class="team-card">
    <img src="https://github.com/cvbmiranda.png" class="team-avatar" alt="cvbmiranda">
    <h3 class="team-name">cvbmiranda</h3>
    <p class="team-role">Colaboradora</p>
    <a class="team-link" href="https://github.com/cvbmiranda" target="_blank">
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
      GitHub
    </a>
  </div>

  <!-- Card 3 -->
  <div class="team-card">
    <img src="https://github.com/Szervinsk.png" class="team-avatar" alt="Matheus Szervinsk">
    <h3 class="team-name">Matheus Szervinsk</h3>
    <p class="team-role">Colaborador</p>
    <a class="team-link" href="https://github.com/Szervinsk" target="_blank">
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
      GitHub
    </a>
  </div>

  <!-- Card 4 -->
  <div class="team-card">
    <img src="https://github.com/arthurgomes1290.png" class="team-avatar" alt="Arthur Gomes Oliveira">
    <h3 class="team-name">Arthur Gomes Oliveira</h3>
    <p class="team-role">Colaborador</p>
    <a class="team-link" href="https://github.com/arthurgomes1290" target="_blank">
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
      GitHub
    </a>
  </div>

  <!-- Card 5 -->
  <div class="team-card">
    <img src="https://github.com/gus-ant.png" class="team-avatar" alt="Gustavo Antonio">
    <h3 class="team-name">Gustavo Antonio</h3>
    <p class="team-role">Colaborador</p>
    <a class="team-link" href="https://github.com/gus-ant" target="_blank">
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
      GitHub
    </a>
  </div>
</div>
