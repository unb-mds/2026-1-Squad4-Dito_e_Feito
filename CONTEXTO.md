# ⚖️ Dito e Feito — Contexto do Projeto (Guia para IAs e Desenvolvedores)

Este arquivo serve como ponto de entrada e mapa de contexto para outros agentes de Inteligência Artificial e desenvolvedores realizarem manutenção, depuração ou extensão do projeto **Dito e Feito**.

---

## 1. Visão Geral e Objetivo
O **Dito e Feito** é uma plataforma de auditoria cívica voltada ao monitoramento da coerência política no legislativo brasileiro (Senado Federal e Câmara dos Deputados). 
O sistema cruza discursos oficiais (pronunciados em tribuna) de parlamentares com seus votos reais registrados em sessões nominais no plenário. Utilizando algoritmos de Processamento de Linguagem Natural (PLN) e Modelos de Linguagem de Grande Porte (LLMs), a ferramenta avalia a afinidade e gera um **Score de Coerência**.

---

## 2. Arquitetura do Sistema

O ecossistema é dividido em três camadas principais:

```
[APIs Gov: Senado e Câmara]
          │ (Scraping & Requests)
          ▼
   [Módulo Backend] ──(psycopg2)──► [Banco de Dados (Supabase)]
 (Flask API & Scripts CLI)              (PostgreSQL + pgvector)
          │
          │ (JSON / REST API na porta 5001)
          ▼
  [Módulo Frontend] (React 19 + Tailwind v4 + Recharts)
```

1. **Backend (Python + Flask)**: Roda na porta **5001** em desenvolvimento. Responsável pelo scraping, consumo das APIs governamentais, execução dos scripts de varredura e exposição de endpoints REST.
2. **Frontend (React 19 + Vite 8 + Tailwind CSS v4)**: Localizado na pasta `/frontend`. Consome a API do backend para exibir gráficos, rankings e raio-x detalhado de parlamentares.
3. **Banco de Dados (PostgreSQL 15 no Supabase)**: Armazena dados de parlamentares, discursos, proposições, votações, votos e scores de coerência. Inclui suporte a buscas semânticas vetoriais através da extensão `pgvector`.

---

## 3. Estrutura de Diretórios e Arquivos Chave

```text
2026-1-Squad4-Dito_e_Feito/
├── .github/workflows/         # Automações de CI/CD (coleta de métricas e deploy MkDocs)
├── analytics/                 # Dashboard estático das métricas do repositório
├── backend/                   # Código-fonte do Backend (Python)
│   ├── api.py                 # CORE DA API REST (Flask, porta 5001)
│   ├── pipe.py                # Pipeline local com BERTimbau para embeddings
│   ├── scan_senators.py       # CLI de varredura em lote e análise LLM de Senadores
│   ├── dashboard.html         # Dashboard alternativo em vanilla JS servido pela API
│   ├── dashboard_metrics.json # Cache/Fallback local das métricas analisadas
│   ├── requirements.txt       # Dependências do Python (Flask, BS4, psycopg2, etc.)
│   ├── database/
│   │   ├── schema.sql         # Estrutura DDL do banco PostgreSQL
│   │   ├── Migrations.sql     # Histórico de alterações estruturais
│   │   └── Conexão.md         # Guia de conexão ao banco para desenvolvedores
│   └── tests/                 # Suíte de testes unitários do backend (Pytest)
├── docs/                      # Documentação técnica oficial (lida pelo MkDocs)
│   └── backend/
│       └── pipeline_multicasa.md # Documentação da expansão do pipeline Senado/Câmara
├── frontend/                  # Código-fonte do Frontend (React 19)
│   ├── e2e/                   # Testes de ponta a ponta (Playwright)
│   ├── src/
│   │   ├── App.jsx            # Roteamento principal (React Router DOM v7)
│   │   ├── services/api.js    # Camada de comunicação Axios (aponta para :5001/api)
│   │   ├── pages/             # Páginas da SPA (VisaoGeral, Perfil, Comparacao, etc.)
│   │   └── components/        # Componentes visuais (Sidebar, Gráficos Recharts, etc.)
│   ├── vitest.config.js       # Configuração do Vitest (testes unitários do frontend)
│   └── playwright.config.js   # Configuração do Playwright (testes E2E do frontend)
├── index.html                 # Página vanilla JS legada/alternativa na raiz (aponta para :5000)
├── mkdocs.yml                 # Configurações do site de documentação (GitHub Pages)
├── README.md                  # Apresentação geral do repositório
└── scripts/
    └── setup-git-hooks.js     # Script de automação do git hook de pré-commit
```


---

## 4. Variáveis de Ambiente (.env)

O backend requer um arquivo `.env` localizado na pasta `/backend` com as seguintes variáveis:

```env
DATABASE_URL=postgresql://postgres:[SENHA]@db.szjbimreoiehjitzatda.supabase.co:5432/postgres
GROQ_API_KEY=sua_chave_groq_aqui
OPENROUTER_API_KEY=sua_chave_openrouter_aqui
```

*Se o banco de dados estiver indisponível ou a variável `DATABASE_URL` não for fornecida, a API fará fallback automático para ler de `dashboard_metrics.json`.*

---

## 5. Lógica de Inteligência Artificial e PLN

O sistema combina três abordagens para mapear a coerência dos parlamentares:

1. **Embeddings Locais (BERTimbau)**: O modelo `neuralmind/bert-base-portuguese-cased` é utilizado no pipeline para gerar embeddings de discursos e ementas (vetores de 768 dimensões) persistidos com `pgvector` para buscas por similaridade de cosseno.
2. **LLMs (Groq & OpenRouter)**: O backend utiliza LLMs (principalmente Llama 3) para realizar a avaliação cognitiva de afinidade (Score de 0.0 a 1.0) e gerar justificativas em português para cada par (Discurso x Ementa).
3. **Fallback Jaccard**: Caso as chaves de API não estejam configuradas ou as requisições falhem, o sistema utiliza o cálculo de índice Jaccard sintático local para não interromper a execução.

### Fluxo de Varredura (`scan_senators.py`):
* **Filtro L1 (Volume)**: Verifica a quantidade de discursos via API antes de fazer scraping (Fail Fast).
* **Mecanismo de Fallback Dinâmico**: Se 3 senadores seguidos retornarem zero discursos no período de busca (ex: 2024-2026), o script alarga automaticamente a busca retroativamente até 2022 para obter histórico suficiente.
* **Filtro L2 (Jaccard)**: Filtra os discursos e ementas mais próximos sintaticamente para enviar apenas uma amostra relevante (`MAX_PARES_LLM = 10`) para a LLM, economizando tokens.

### Pipeline Multi-Casa (Senado Federal & Câmara dos Deputados):
O pipeline foi expandido para suportar o monitoramento integrado de ambas as casas legislativas.
* **Heterogeneidade de Dados**: Integra a API do Senado (XML/JSON legados) com a API v2 da Câmara dos Deputados (REST JSON paginada) sob a classe `MonitoramentoLegislativo`.
* **Data Wrangling & Normalização (MDS)**: Utiliza `pd.json_normalize()` para tratar os dicionários da API da Câmara e gera uma ementa sintética (`df_final['ementa'] = f"Votação da proposição {sigla} {numero}/{ano}. Orientação de voto: " + df_final['Voto']`), garantindo buscas semânticas equivalentes.
* **Eficiência Computacional**: Limita o processamento de textos a 512 tokens e utiliza `with torch.no_grad():` no PyTorch, o que reduz o consumo de memória RAM em até 60% durante a extração de embeddings.
* **Documentação & Experimentos**: Para mais detalhes de modelagem e arquitetura, consulte a [Documentação de Pipeline Multi-Casa](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/docs/backend/pipeline_multicasa.md) e o [Notebook Google Colab de Monitoramento Multi-Casa](https://colab.research.google.com/drive/1-9jCu3MbPG_Qr0O2RLV9TA5qVeYRxS3a#scrollTo=og-j5MS7H_J9).


---

## 6. Endpoints do Backend Flask (`backend/api.py`)

A API expõe as seguintes rotas na porta **5001**:
* `GET /api/health` — Status da API e chaves ativas.
* `GET /api/dashboard-metrics` — Dados consolidados para o dashboard (ranking, médias por partido). Lê do PostgreSQL com fallback automático para o JSON.
* `GET /api/senadores` — Proxy da API do Senado para buscar a lista de senadores atuais em exercício.
* `GET /api/deputados` — Proxy da API da Câmara para buscar a lista de deputados.
* `GET /api/politico/<id_externo>` — Detalhes básicos de um parlamentar.
* `POST /api/analisar` — Recebe `{ "id": <ID>, "tipo": <"senador"|"deputado"> }` e realiza a análise de coerência em tempo real combinando scraping de discursos, extração de votos e LLM.

---

## 7. Informações Importantes para Manutenção (Atenção, IAs!)

> [!WARNING]
> **Diferença de Portas (5000 vs 5001)**:
> O backend Flask principal (`backend/api.py`) roda na porta **5001**.
> * O frontend React (`frontend/src/services/api.js`) está configurado corretamente para a porta **5001**.
> * O arquivo legacy na raiz do repositório (`index.html`) está configurado para a porta **5000**. Tenha cuidado ao testar a aplicação a partir do index da raiz.

> [!NOTE]
> **Modelagem de Dados**:
> A tabela `parlamentar` armazena tanto senadores quanto deputados. A coluna `tipo_parlamentar` (adicionada na migration 003) discrimina entre `'senador'` e `'deputado'`. A busca por discursos e votos se comporta de forma diferente com base nesse tipo (API da Câmara para deputados vs. Web Scraping + API XML para senadores).

> [!IMPORTANT]
> **Segurança de Credenciais**:
> Nunca versione a senha do banco de dados do Supabase ou chaves de API nos arquivos do repositório. Use o `.env` no backend e o sistema de Secrets/variáveis de ambiente no CI/CD.

---

## 8. Comandos Úteis

### Backend:
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Ou venv/bin/activate no Linux
pip install -r requirements.txt
python api.py                 # Roda o servidor na porta 5001
python scan_senators.py       # Roda a varredura completa (36 senadores)
pytest                        # Executa toda a suíte de testes unitários do backend
```

### Frontend:
```bash
cd frontend
npm install
npm run dev                   # Inicia o servidor Vite local (geralmente http://localhost:5173)
npm run test                  # Executa testes unitários/componentes (Vitest)
npx playwright test           # Executa testes End-to-End (Playwright)
```

### Configurar Git Hook (Pré-Commit):
```bash
node scripts/setup-git-hooks.js # Configura a validação automática de testes no commit
```

---

## 9. Suíte de Testes e Automações

O projeto conta com testes automatizados integrados para garantir a estabilidade do sistema nas duas frentes (Frontend e Backend).

### Backend (Python)
* **Framework**: `pytest`.
* **Cobertura**: Mocks para requisições de APIs externas (Senado e Câmara), conexões de banco de dados (Supabase/PostgreSQL) e fallbacks do algoritmo de similaridade (Jaccard).
* **Localização**: `backend/tests/` (ver [test_api.py](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/backend/tests/test_api.py) e [conftest.py](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/backend/tests/conftest.py)).

### Frontend (React)
* **Testes Unitários / Componentes**:
  * **Framework**: `Vitest` + `jsdom`.
  * **Configuração**: [vitest.config.js](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/frontend/vitest.config.js) e [setupTests.js](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/frontend/src/setupTests.js).
* **Testes End-to-End (E2E)**:
  * **Framework**: `Playwright`.
  * **Configuração**: [playwright.config.js](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/frontend/playwright.config.js).
  * **Arquivo de Teste**: [dashboard.spec.js](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/frontend/e2e/dashboard.spec.js).

### Automação de Pré-Commit (Git Hooks)
* O script [setup-git-hooks.js](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/scripts/setup-git-hooks.js) configura um hook de `pre-commit` no Git.
* Sempre que um desenvolvedor executa `git commit`, os testes unitários do backend (`pytest`) e os testes do frontend (`npm run test`) são executados automaticamente. O commit é abortado se algum teste falhar.

