# 📝 Planejamento da Sprint 08 — Deploy da Plataforma e Integração da Câmara dos Deputados

**Objetivo Geral:** Finalizar a integração da Câmara dos Deputados e focar esforços de DevOps para garantir o deploy da aplicação de forma otimizada: aplicando Docker exclusivamente no Backend (Flask) e hospedagem focada em estáticos para o Frontend, visando a estabilidade da versão final da R2.

---

## 🎯 Missão da Sprint
Consolidar as entregas do fluxo de dados legislativos (Senado + Câmara) e colocar a aplicação no ar de forma inteligente e com esforço bem direcionado. O objetivo central é superar o "na minha máquina funciona", isolando o Python via conteinerização e aproveitando hospedagens otimizadas para o ecossistema Javascript.

---

## 📌 Pautas e Divisão de Tarefas (Backlog da Sprint)

### 1. Infraestrutura e Deploy (DevOps)
*   **Conteinerização do Backend (Docker):** Estudar os conceitos básicos (imagem e container) para criar um `Dockerfile` enxuto para o servidor Flask. O objetivo é subir essa imagem empacotada em uma nuvem voltada a containers (ex: Render, Railway ou Fly.io).
*   **Hospedagem Ágil do Frontend:** Configurar a build de produção do React/Vite e subir a Interface (UI) em um serviço Serverless de alta performance (ex: Vercel ou Netlify) integrado diretamente ao repositório do Github. Sem necessidade de Docker no front.
*   **Gestão de Variáveis (Environments):** Configurar com segurança os `.env` em produção, garantindo acesso às chaves das LLMs (OpenRouter/Groq) e ao link remoto do Supabase (que continuará como o host do banco de dados).

### 2. Backend & Dados (Inteligência Artificial)
*   **Câmara dos Deputados no Ar:** Garantir o funcionamento contínuo e escalável da automação recém-criada (`scan_deputados.py`), injetando os votos mapeados da Câmara e conectando-os aos LLMs para a análise de coerência.
*   **Ranking Unificado Homologado:** Revisar os endpoints (como `/api/dashboard-metrics`) para garantir que dados de Deputados e Senadores sejam entregues de forma íntegra pela API conteinerizada.

### 3. Frontend e Integração Visual
*   **Ajustes do Novo Ranking:** Consumir a arquitetura atualizada da API, gerindo dinamicamente as exibições (ícones e nomenclaturas diferentes para "Senador" e "Deputado") nas páginas de listagem e dashboard.
*   **Polimento de Interface (UX/UI):** Refinamento final nos gráficos construídos com Recharts, correções de temas/cores e garantia de total responsividade para o deploy em nuvem.
*   **Tratativa de CORS:** Ajustar a configuração de requisições Axios do frontend para permitir comunicação segura (HTTPS) com o novo domínio do backend que estará na nuvem.

---

## ⏱️ Cronograma de Controle
*   **Foco Principal:** Aprender o básico vital de Docker para o Python e estabilizar a integração contínua (CI/CD).
