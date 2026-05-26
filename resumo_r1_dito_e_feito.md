# Resumo Técnico — Release 1 (R1) | Dito e Feito
**Squad 4 · MDS 2026/1 · UnB**

---

## 1. ESCOPO E TECNOLOGIAS

### Objetivo Principal
O **Dito e Feito** é uma plataforma de **auditoria cívica legislativa** que cruza automaticamente os **discursos oficiais** (pronunciamentos em tribuna) de deputados e senadores brasileiros com seus **votos reais** registrados em sessões nominais. Utilizando PLN e LLMs (Inteligência Artificial), o sistema calcula um **Score de Coerência Parlamentar** — evidenciando se o que um parlamentar *diz* condiz com o que ele *vota*.

> **Problema resolvido:** Falta de transparência e dificuldade do cidadão em acompanhar a consistência do mandato legislativo de forma automatizada e acessível.

### Stack Tecnológica

| Camada | Tecnologia | Versão / Detalhe |
|---|---|---|
| **Backend — Framework** | Python + Flask | `flask`, `flask-cors` |
| **Backend — PLN (local)** | BERTimbau | `neuralmind/bert-base-portuguese-cased` via HuggingFace |
| **Backend — LLM (nuvem)** | Groq API (Llama-3) | `llama-3.1-8b-instant` / `llama-3.3-70b-versatile` |
| **Backend — LLM (fallback)** | OpenRouter API | `meta-llama/llama-3.1-8b-instruct:free` |
| **Backend — Web Scraping** | BeautifulSoup 4 | Pronunciamentos do Senado |
| **Backend — HTTP** | Requests | APIs abertas da Câmara e Senado |
| **Banco de Dados** | PostgreSQL 15 | Hospedado no **Supabase** |
| **Banco — Driver** | psycopg2-binary | Conexão direta via `DATABASE_URL` |
| **Banco — Semântica** | pgvector | Índice `ivfflat` para embeddings `vector(768)` |
| **Frontend — Framework** | React 19 + Vite 8 | SPA moderna |
| **Frontend — Roteamento** | React Router DOM v7 | Rotas declarativas |
| **Frontend — Gráficos** | Recharts 3 | Gráficos interativos |
| **Frontend — HTTP** | Axios 1 | Camada de serviço `src/services/api.js` |
| **Frontend — Ícones** | Lucide React | Biblioteca de ícones |
| **Frontend — CSS** | Tailwind CSS v4 | Utilitários de estilo |
| **Documentação** | MkDocs Material | Deploy automático via GitHub Pages |
| **CI/CD** | GitHub Actions | 2 workflows configurados |
| **Dados Externos** | API Dados Abertos — Senado | `legis.senado.leg.br/dadosabertos` |
| **Dados Externos** | API Dados Abertos — Câmara | `dadosabertos.camara.leg.br/api/v2` |

---

## 2. ARQUITETURA E INFRAESTRUTURA

### Estrutura de Pastas (Árvore Simplificada)

```
2026-1-Squad4-Dito_e_Feito/
├── .github/
│   └── workflows/
│       ├── main.yml          ← CI/CD: build, MkDocs, GitHub Pages
│       └── metrics.yml       ← CI/CD: coleta métricas do repositório
├── analytics/
│   └── index.html            ← Dashboard de métricas do repositório (GitHub)
├── backend/
│   ├── api.py                ← Servidor Flask (porta 5001) — CORE DA API
│   ├── pipe.py               ← Pipeline local com BERTimbau
│   ├── scan_senators.py      ← Orquestrador de varredura em lote (produção)
│   ├── dashboard.html        ← Dashboard Vanilla JS servido pela API
│   ├── dashboard_metrics.json ← Cache local dos dados analisados
│   ├── requirements.txt      ← Dependências Python
│   ├── .env.example          ← Template de variáveis de ambiente
│   └── database/
│       ├── schema.sql        ← DDL completo do banco de dados
│       ├── Migrations.sql    ← Histórico de migrações
│       ├── 001_add_tipo_parlamentar.sql ← Migration específica
│       └── Conexão.md        ← Guia de conexão ao Supabase
├── frontend/
│   ├── package.json          ← Dependências Node.js (React 19, Vite 8)
│   ├── vite.config.js        ← Configuração do bundler
│   └── src/
│       ├── App.jsx           ← Roteamento principal (React Router)
│       ├── main.jsx          ← Entry point da SPA
│       ├── pages/            ← 7 páginas implementadas
│       │   ├── VisaoGeral.jsx
│       │   ├── Politicos.jsx
│       │   ├── Perfil.jsx
│       │   ├── PerfilPolitico.jsx
│       │   ├── Comparacao.jsx
│       │   ├── Relatorios.jsx
│       │   └── Sobre.jsx
│       ├── components/       ← 9 componentes reutilizáveis
│       │   ├── Sidebar.jsx
│       │   ├── Header.jsx
│       │   ├── Footer.jsx
│       │   ├── PoliticoCard.jsx
│       │   ├── GraficoBarras.jsx
│       │   ├── GraficoPartidos.jsx
│       │   ├── GraficoRadar.jsx
│       │   ├── GraficoTendencias.jsx
│       │   └── Skeleton.jsx
│       └── services/
│           └── api.js        ← Camada Axios (endpoints do Flask)
├── docs/                     ← Fonte da documentação MkDocs
│   ├── sprints/              ← Registros das Sprints 01–05
│   ├── requisitos/           ← Levantamento e Requisitos Oficiais
│   ├── frontend/             ← Visão Geral + Protótipo Figma
│   ├── backend/              ← Documentação do backend
│   ├── tecnologias/          ← Stack e guias de conexão
│   └── estudos/              ← PLN/IA, Banco de Dados, Scrum, Git
├── scripts/
│   └── collect.js            ← Script de coleta de métricas do GitHub
├── mkdocs.yml                ← Configuração do site de documentação
└── README.md                 ← Documento de entrada do projeto
```

### Conteinerização
> ⚠️ **Não há Dockerfiles nem `docker-compose.yml`** no repositório até a R1. A infraestrutura é gerenciada via Supabase (BaaS gerenciado) e a execução local é feita com `venv` Python + `npm run dev`.

### CI/CD — GitHub Actions

**Arquivo:** [`.github/workflows/main.yml`](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/.github/workflows/main.yml)

Pipeline automatizado ativado em **push para `main`** e **agendado a cada 5 minutos** (cron). Executa as seguintes etapas em sequência no `ubuntu-latest`:

1. `actions/checkout@v4` — Checkout do repositório
2. `actions/setup-node@v4` (Node 24) + `npm install axios`
3. `node scripts/collect.js` — Coleta métricas do repositório via GitHub API
4. `actions/setup-python@v5` + `pip install mkdocs-material`
5. `mkdocs build -f mkdocs.yml -d dist` — **Build da documentação**
6. Copia `analytics/index.html` para `dist/analytics/`
7. `peaceiris/actions-gh-pages@v3` — **Deploy automático para GitHub Pages** (branch `gh-pages`)

**Site da documentação:** `https://unb-mds.github.io/2026-1-Squad4-Dito_e_Feito/`

---

## 3. IMPLEMENTAÇÃO REALIZADA

### Backend — Endpoints Flask Implementados (`backend/api.py`)

O servidor Flask roda na **porta 5001** com CORS habilitado. Todos os endpoints estão funcionais:

| Método | Rota | Função | Fonte de Dados |
|---|---|---|---|
| `GET` | `/` | Serve o `dashboard.html` | Arquivo local |
| `GET` | `/dashboard_metrics.json` | Serve o JSON de métricas | Arquivo local |
| `GET` | `/api/health` | Healthcheck da API | — |
| `GET` | `/api/dashboard-metrics` | Ranking de coerência consolidado | **PostgreSQL → fallback JSON** |
| `GET` | `/api/senadores` | Lista senadores em exercício | API do Senado (proxy) |
| `POST` | `/api/analisar` | Análise em tempo real de um parlamentar | APIs Gov + LLM (Groq/OpenRouter) |

**Destaques técnicos do `api.py`:**
- **Detecção automática de tipo parlamentar** (senador vs. deputado) via banco de dados ou mapeamento de IDs
- **Scraping paralelo** de pronunciamentos com `ThreadPoolExecutor(max_workers=5)`
- **Pipeline de análise com fallback em cascata:** Groq → OpenRouter → Jaccard local
- **Estratégia de resiliência dupla:** banco de dados → arquivo JSON local

### Backend — Pipelines de Processamento

**[`backend/pipe.py`](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/backend/pipe.py):** Pipeline local com BERTimbau — gera embeddings `vector(768)`, calcula similaridade de cosseno e grava `dashboard_metrics.json`.

**[`backend/scan_senators.py`](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/backend/scan_senators.py):** Orquestrador de produção com lógica *Fail Fast* em 2 camadas:
- **Camada 1 (Volume):** Verifica existência de discursos sem scraping
- **Camada 2 (Jaccard):** Filtra pares similares antes de acionar LLM

### Banco de Dados — Schema Implementado (`backend/database/schema.sql`)

6 tabelas relacionais definidas e indexadas no PostgreSQL 15 (Supabase):

| Tabela | Conteúdo |
|---|---|
| `parlamentar` | Dados de deputados e senadores (`id_externo`, partido, UF, foto) |
| `discurso` | Pronunciamentos com embedding `vector(768)` (pgvector) |
| `proposicao` | Propostas legislativas com ementa |
| `votacao` | Sessões de votação com embedding semântico da ementa |
| `voto` | Voto individual por parlamentar (ENUM: Sim/Não/Abstenção/Obstrução) |
| `score_coerencia` | Score (0–100), similaridade de cosseno, status e justificativa da IA |

**Índices de vetores ativos:**
```sql
CREATE INDEX idx_discurso_embedding ON discurso USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_votacao_embedding  ON votacao  USING ivfflat (embedding_ementa vector_cosine_ops) WITH (lists = 100);
```

### Frontend — Rotas SPA Implementadas (`frontend/src/App.jsx`)

React Router DOM com 5 rotas ativas:

| Rota | Componente | Descrição |
|---|---|---|
| `/` | `VisaoGeral.jsx` | Dashboard geral com KPIs e gráficos |
| `/politicos` | `Politicos.jsx` | Listagem de parlamentares |
| `/politicos/:id` | `Perfil.jsx` | Raio-X individual do político |
| `/comparacao` | `Comparacao.jsx` | Comparação entre parlamentares |
| `/relatorios` | `Relatorios.jsx` | Relatórios agregados |
| `/sobre` | `Sobre.jsx` | Página institucional do projeto |

### Frontend — Camada de Serviço (`frontend/src/services/api.js`)

Instância Axios configurada com:
- **`baseURL`:** `http://localhost:5000/api`
- **Timeout:** 90 segundos (comportamento assíncrono de IA)
- **Interceptors:** Tratamento padronizado de erros de rede e timeout
- **Funções exportadas:** `getDeputados()`, `getSenadores()`, `analisarParlamentar(id, tipo)`

### Evidência de Integração Full-Stack

O arquivo [`docs/fluxo_pipeline_dashboard.md`](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/docs/fluxo_pipeline_dashboard.md) documenta e comprova o fluxo end-to-end:

```
APIs Gov (Senado/Câmara + Scraping)
        ↓
  pipe.py / scan_senators.py   ← BERTimbau ou Groq/OpenRouter
        ↓
  dashboard_metrics.json  ←→  PostgreSQL (Supabase)
        ↓
      api.py (Flask :5001)
        ↓
  dashboard.html  ←→  frontend React (:5173)
        ↓
         Usuário / Cidadão
```

---

## 4. EVIDÊNCIAS DE PROCESSO E DOCUMENTAÇÃO

### MkDocs — Site de Documentação Técnica

Configurado em [`mkdocs.yml`](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/mkdocs.yml) com tema **Material** e deploy automático via CI.

**Seções documentadas:**

| Seção | Arquivos |
|---|---|
| **Sprints** | `sprint01.md` a `sprint05.md` — 5 sprints registradas |
| **Requisitos** | `levantamento_inicial.md` + `requisitos.md` (oficiais) |
| **Frontend** | Visão geral + protótipo Figma (`figma.md`) |
| **Backend** | Visão geral da API (`backend.md`) |
| **Tecnologias** | Stack completa + guia de conexão ao banco + fluxo pipeline |
| **Estudos** | PLN/IA (arquitetura, coleta, deploy), Banco de Dados (PostgreSQL, modelagem, queries), Scrum, Git cheatsheet, Manual de Marca |

### README.md

[README.md](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/README.md) completo com:
- Descrição da arquitetura em dois módulos (Backend + Frontend)
- Pré-requisitos e guia de instalação passo a passo
- Variáveis de ambiente documentadas via `.env.example`
- Comandos de execução (`python api.py`, `npm run dev`)
- Tabela do Core Team com links GitHub

### Documentação de Banco de Dados

- [`backend/database/schema.sql`](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/backend/database/schema.sql) — DDL completo com todas as tabelas e índices
- [`backend/database/Migrations.sql`](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/backend/database/Migrations.sql) — Histórico de migrações
- [`backend/database/Conexão.md`](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/backend/database/Conex%C3%A3o.md) — Guia com exemplos de conexão (psycopg2, SQLAlchemy, Google Colab, pgAdmin)

---

## Resumo Executivo para Apresentação

| Critério | Status |
|---|---|
| Problema definido | ✅ Coerência parlamentar (discurso × voto) |
| Backend funcional | ✅ Flask + 5 endpoints REST + análise com LLM |
| Banco de dados | ✅ PostgreSQL 15 no Supabase, 6 tabelas, pgvector |
| Frontend estruturado | ✅ React 19 + Vite + 7 páginas + 9 componentes |
| Integração front↔back | ✅ Axios → Flask, camada `api.js` implementada |
| Dados reais | ✅ Consumindo APIs abertas da Câmara e Senado |
| IA integrada | ✅ Groq (Llama-3) + OpenRouter + BERTimbau local |
| CI/CD | ✅ 2 GitHub Actions workflows ativos |
| Documentação | ✅ MkDocs com 5 sprints + requisitos + estudos técnicos |
