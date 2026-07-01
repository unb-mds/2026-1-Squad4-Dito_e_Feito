# Release 2 (R2) - Evolução, Conteinerização e Integração da Câmara

A Release 2 (R2) do projeto **Dito e Feito** consolida o amadurecimento técnico e funcional do sistema para a disciplina de Métodos de Desenvolvimento de Software (MDS 2026/1 - UnB). O foco principal desta release foi expandir a auditoria cívica para englobar a Câmara dos Deputados, otimizar o deploy utilizando Docker para o backend e aprimorar a confiabilidade e as visualizações do frontend.

---

## 1. Principais Entregas e Novas Funcionalidades

### Expansão da Análise Legislativa
- **Integração da Câmara dos Deputados:** Implementação do script de varredura automatizada (`scan_deputados.py`) para consumir dados da API de Dados Abertos da Câmara, injetando os votos mapeados e conectando-os aos LLMs para análise de coerência.
- **Endpoints Unificados:** A API agora lida de forma escalável tanto com Senadores (`/api/senadores`) quanto com Deputados (`/api/deputados`), integrando os dados perfeitamente ao banco Supabase.

### Visualizações Avançadas e UX
- **Mapeamento Geográfico por Estados:** Nova página e aba focadas nos Estados (`Estados.jsx`), integrando o componente interativo `MapaBrasil` colorido dinamicamente com base na coerência média da bancada de cada Unidade Federativa.
- **Análise Partidária:** Criação da aba de Partidos (`Partidos.jsx`) com gráficos de representatividade e coerência das legendas (ex: `GraficoPartidos.jsx`), revelando a integridade dos blocos partidários.
- **Polimento de Interface (UI/UX):** Refinamento final nos gráficos construídos com Recharts, suporte consistente ao Tema Dark e tratamento aprimorado de erros (graceful degradation) para dados não analisados.

### Engenharia, Testes e DevOps
- **Conteinerização do Backend (Docker):** Implementação de um `Dockerfile` enxuto e `docker-compose.yml` para empacotar e isolar o ambiente Python/Flask, garantindo um deploy previsível e resolvendo o problema do "na minha máquina funciona".
- **Hospedagem Frontend Serverless:** Adaptação da build estática com Vite/React para deploy em plataformas otimizadas para aplicações React (ex: Vercel/Netlify), simplificando a infraestrutura.
- **Testes e Qualidade (QA):**
  - **Backend:** Ampliação da cobertura de testes unitários com **Pytest** e validação de rotas e fallbacks.
  - **Frontend:** Estabilização dos testes unitários de formatação e serviços de API utilizando **Vitest**.
  - **Integração E2E:** Adoção do **Playwright** para testes de ponta-a-ponta (End-to-End), garantindo que as jornadas de usuário (dashboards, filtros, buscas) funcionam no navegador.
- **Integração Contínua (CI/CD):** Atualização do fluxo do GitHub Actions (`tests.yml`) para rodar automaticamente toda a bateria de testes (Pytest, Vitest e Playwright) a cada Pull Request e push na branch principal.

---

## 2. Tecnologias Adicionadas/Destacadas na R2

| Área | Tecnologia | Motivo/Uso |
|---|---|---|
| DevOps / Infraestrutura | **Docker** | Conteinerização do backend (Flask + Dependências Python). |
| Qualidade (Frontend) | **Vitest** | Testes unitários para utilitários, componentes e serviços (`api.test.js`). |
| Qualidade (Integração) | **Playwright** | Testes automatizados E2E validando a renderização dos dashboards. |
| Qualidade (Backend) | **Pytest** | Asserções robustas e mocks das APIs legislativas e do Supabase. |
| Visualização (Front) | **Recharts Avançado** | Gráficos emparelhados e de distribuição implementados e polidos. |

---

## 3. Considerações de Arquitetura e Segurança

Na R2, reforçamos também a **resiliência do sistema e boas práticas de segurança**:
- O tratamento de CORS foi padronizado na API Flask.
- As variáveis de ambiente (`.env`) foram consolidadas de modo que a conexão ao PostgreSQL (Supabase) e chaves sensíveis (OpenRouter, Groq, Gemini) nunca sejam expostas.
- O sistema mantém seu comportamento de _fallback em cascata_, processando fallback automático para Jaccard local ou cache JSON em disco caso falte conectividade externa.

---

## 4. Planejamento Cumprido vs Metas

Conforme estabelecido nas reuniões de Planning e Retrospectiva da **Sprint 08**:
- [x] Conteinerização do Backend via Docker.
- [x] Integração contínua rodando testes no GitHub Actions sem quebras de ambiente.
- [x] Frontend configurado para build otimizada.
- [x] Dados da Câmara injetados e listados na interface ao lado do Senado.
- [x] Dashboards adicionais de UF e Partidos.

Esta versão encerra o escopo de funcionalidades planejadas para o Produto Mínimo Viável Expandido, entregando um sistema auditável, performático e altamente documentado.
