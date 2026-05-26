# 🎬 Roteiro de Apresentação — Release 1 (R1)
**Projeto:** Dito e Feito · Auditoria Cívica Legislativa
**Squad:** Squad 4 · MDS 2026/1 · UnB
**Duração Máxima:** 5 minutos (300 segundos)

---

## ⏱️ Cronograma e Divisão de Falas

| Bloco | Tempo | Responsável | Foco Visual (Slide/Print) |
| :--- | :--- | :--- | :--- |
| **1. Abertura** | 30s | **Juan** (Scrum Master) | Identidade visual do projeto e equipe |
| **2. O Desafio Proposto** | 40s | **Gustavo** (Product Owner) | Story Map no Figma (Validação de Escopo) |
| **3.1 Backend & Banco** | 60s | **Gustavo** (Backend/IA) | Diagrama de Arquitetura e Schema PostgreSQL |
| **3.2 Frontend & Integração** | 60s | **Gabriel / Sauhan** (Frontend) | Telas em React (Visão Geral, Gráficos Recharts) |
| **4. Evidências de Viabilidade** | 60s | **Sauhan / Gabriel** (Frontend) | Pipeline GitHub Actions e Home do MkDocs |
| **5. Encerramento** | 30s | **Juan** (Scrum Master) | Resumo Executivo e Backlog da R2 |

---

## 💬 Scripts de Fala (Passo a Passo)

### 1. Abertura (30 segundos)
* **🗣️ Quem fala:** Juan
* **🖼️ Apoio Visual:** Slide com o logo do *Dito e Feito*, nome do Squad 4, listagem dos 4 integrantes e seus respectivos papéis.
* **Script:**
> "Boa noite a todos. Eu sou o Juan, Scrum Master e responsável pelo Banco de Dados do Squad 4. Hoje vamos apresentar a Release 1 do **Dito e Feito**. Nosso foco nesses primeiros dois meses de projeto foi validar a viabilidade de um escopo focado em transparência, consolidar a nossa arquitetura de dados e testar as tecnologias escolhidas. Vamos mostrar como, mesmo com uma equipe enxuta de 4 pessoas, conseguimos estabelecer uma infraestrutura full-stack real, integrada e funcional."

---

### 2. O Desafio Proposto (40 segundos)
* **🗣️ Quem fala:** Gustavo
* **🖼️ Apoio Visual:** Print em alta qualidade do **Story Map criado no Figma** focado na jornada do usuário.
* **Script:**
> "Como Product Owner, o meu desafio inicial junto com o time foi traduzir um problema complexo em um escopo viável: a falta de transparência no legislativo brasileiro. É extremamente difícil para o cidadão comum acompanhar de forma automatizada se o parlamentar realmente vota alinhado com o que ele discursa na tribuna. Para viabilizar a auditoria cívica, mapeamos detalhadamente essa jornada do usuário através do nosso **Story Map no Figma**. Nosso grande desafio nesta R1 foi converter essas incertezas de negócio e as barreiras iniciais de IA em entregas técnicas concretas."

---

### 3. Implementação Realizada (2 minutos)

#### Sub-bloco 3.1 — Backend e Banco de Dados (1 minuto)
* **🗣️ Quem fala:** Gustavo
* **🖼️ Apoio Visual:** Diagrama de fluxo de dados (APIs da Câmara/Senado ➔ Flask ➔ Supabase) e trecho do arquivo `schema.sql`.
* **Script:**
> "No backend, estruturamos nossa API em Python conectando diretamente com as APIs abertas da Câmara e do Senado. Desenvolvemos o pipeline de inteligência artificial com fallback em cascata, integrando os modelos Llama-3 via Groq API e o BERTimbau local para análise de similaridade. Na persistência, o Juan liderou a modelagem do nosso banco **PostgreSQL 15 no Supabase**. Ele implementou com sucesso o schema relacional de 6 tabelas e configurou a extensão **pgvector** com índices `ivfflat`, permitindo que o banco armazene e busque de forma otimizada os embeddings semânticos dos discursos. Já temos 5 endpoints funcionais no `api.py` alimentando o sistema."

#### Sub-bloco 3.2 — Frontend e Integração (1 minuto)
* **🗣️ Quem fala:** Gabriel Velho ou Sauhan
* **🖼️ Apoio Visual:** Prints das páginas reais do sistema rodando (`VisaoGeral.jsx` com os gráficos do Recharts e página de `Perfil`).
* **Script:**
> "No frontend, a equipe de interface desenvolveu uma SPA moderna utilizando **React 19, Vite e Tailwind CSS v4**. Criamos uma estrutura modular com 9 componentes reutilizáveis e 7 páginas completamente roteadas via React Router v7 — incluindo dashboards interativos com a biblioteca **Recharts**. O nosso maior marco na R1 foi provar a integração full-stack: implementamos a camada de serviços em `src/services/api.js` usando **Axios**, que se comunica em tempo real com o backend e o banco de dados, tratando erros e lidando com o tempo de resposta assíncrono das LLMs."

---

### 4. Evidências de Viabilidade (1 minuto)
* **🗣️ Quem fala:** Sauhan ou Gabriel Velho (O integrante do Front que não falou no bloco anterior)
* **🖼️ Apoio Visual:** Print do painel do GitHub Actions com os checks verdes e a página home do MkDocs Material publicada.
* **Script:**
> "A viabilidade do nosso processo de engenharia está totalmente documentada e automatizada. Configuramos **dois pipelines de CI/CD via GitHub Actions** no diretório `.github/workflows/`. A cada push na branch `main`, nossos workflows coletam métricas do repositório, executam scripts automáticos, geram o build da nossa documentação técnica no **MkDocs Material** e realizam o deploy imediato para o GitHub Pages. O resultado desse rigor ágil são 5 sprints completamente registradas com atas, matriz de competências, requisitos oficiais mapeados e nossos estudos de arquitetura publicados de forma transparente para qualquer auditoria."

---

### 5. Encerramento (30 segundos)
* **🗣️ Quem fala:** Juan
* **🖼️ Apoio Visual:** Tabela de Resumo Executivo (Critérios com check verde `✅`) e os tópicos para a Release 2.
* **Script:**
> "Com essa entrega, provamos categoricamente que a arquitetura do **Dito e Feito** é viável e que o nosso time estabeleceu uma base de engenharia sólida. Como Scrum Master, destaco que seguimos à risca as práticas ágeis. Já identificamos em nossa camada de serviço uma pequena inconsistência local de portas de ambiente (5000 vs 5001), que já está mapeada no backlog como nossa primeira issue resolvida na Sprint 6. Para a Release 2, focaremos na conteinerização com Docker e no refinamento fino do Score de Coerência. Muito obrigado a todos!"