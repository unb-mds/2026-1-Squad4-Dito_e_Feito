# Release 1 (R1) - MVP e Integracao Full-Stack

A Release 1 (R1) do projeto Dito e Feito consolida o primeiro marco principal de entrega do Squad 4 para a disciplina de Metodos de Desenvolvimento de Software (MDS 2026/1 - UnB). O objetivo principal desta release foi estabelecer uma arquitetura basica integrada e funcional (Minimal Viable Product - MVP), provando a viabilidade tecnica do cruzamento de discursos parlamentares com dados de votacao nominal por meio de Inteligencia Artificial.

---

## 1. Escopo e Tecnologias

O sistema propoe-se a auditar a coerencia parlamentar ao correlacionar discursos em plenaria de senadores e deputados com seus votos efetivos em sessoes nominais. 

A stack tecnologica adotada e distribuida da seguinte forma:

| Camada | Tecnologia | Versao / Detalhe |
|---|---|---|
| Backend - Framework | Python + Flask | flask, flask-cors |
| Backend - PLN (local) | BERTimbau | neuralmind/bert-base-portuguese-cased via HuggingFace |
| Backend - LLM (nuvem) | Groq API (Llama-3) | llama-3.1-8b-instant / llama-3.3-70b-versatile |
| Backend - LLM (fallback) | OpenRouter API | meta-llama/llama-3.1-8b-instruct:free |
| Backend - Web Scraping | BeautifulSoup 4 | Pronunciamentos do Senado |
| Backend - HTTP | Requests | APIs abertas da Camara e Senado |
| Banco de Dados | PostgreSQL 15 | Hospedado no Supabase |
| Banco - Driver | psycopg2-binary | Conexao direta via DATABASE_URL |
| Banco - Semantica | pgvector | Indice ivfflat para embeddings vector(768) |
| Frontend - Framework | React 19 + Vite 8 | SPA moderna |
| Frontend - Roteamento | React Router DOM v7 | Rotas declarativas |
| Frontend - Graficos | Recharts 3 | Graficos interativos |
| Frontend - HTTP | Axios 1 | Camada de servico em src/services/api.js |
| Frontend - Icones | Lucide React | Biblioteca de icones |
| Frontend - CSS | Tailwind CSS v4 | Utilitarios de estilo |
| Documentacao | MkDocs Material | Deploy automatico via GitHub Pages |
| CI/CD | GitHub Actions | 2 workflows configurados |

---

## 2. Arquitetura e Estrutura de Pastas

A organizacao do codigo-fonte esta dividida em duas areas principais de desenvolvimento (frontend e backend), apoiadas por uma camada de persistencia no Supabase e automacao via GitHub Actions.

A arvore simplificada do repositorio na R1 e:

```text
2026-1-Squad4-Dito_e_Feito/
├── .github/
│   └── workflows/
│       ├── main.yml          # CI/CD: build, MkDocs, GitHub Pages
│       └── metrics.yml       # CI/CD: coleta metricas do repositorio
├── analytics/
│   └── index.html            # Dashboard de metricas do repositorio
├── backend/
│   ├── api.py                # Servidor Flask (porta 5001) - Core da API
│   ├── pipe.py               # Pipeline local com BERTimbau
│   ├── scan_senators.py      # Orquestrador de varredura em lote
│   ├── dashboard.html        # Dashboard Vanilla JS servido pela API
│   ├── dashboard_metrics.json # Cache local dos dados analisados
│   ├── requirements.txt      # Dependencias Python
│   └── database/
│       ├── schema.sql        # DDL do banco de dados
│       ├── Migrations.sql    # Historico de migracoes
│       └── Conexao.md        # Guia de conexao ao Supabase
├── frontend/
│   ├── package.json          # Dependencias Node.js
│   ├── vite.config.js        # Configuracao do bundler
│   └── src/
│       ├── App.jsx           # Roteamento principal (React Router DOM)
│       ├── main.jsx          # Entry point da SPA
│       ├── pages/            # Paginas da aplicacao (7 paginas)
│       ├── components/       # Componentes reutilizaveis (9 componentes)
│       └── services/
│           └── api.js        # Camada de servico Axios
├── docs/                     # Fonte da documentacao MkDocs
├── scripts/
│   └── collect.js            # Script de coleta de metricas do GitHub
├── mkdocs.yml                # Configuracao do site de documentacao
└── README.md                 # Apresentacao geral do projeto
```

---

## 3. Detalhes de Implementacao

### Backend
- **Endpoints da API Flask:** Disponibilizacao de endpoints REST na porta 5001 (`/api/health`, `/api/dashboard-metrics`, `/api/senadores`, `/api/deputados`, `/api/politico/<id_externo>` e `/api/analisar`).
- **Scraping Concorrente:** O script de coleta de pronunciamentos do Senado usa pooling concorrente via `ThreadPoolExecutor` para otimizar o tempo de varredura.
- **Resiliencia e Fallback de IA:** Caso as chaves de API das LLMs externas (Groq ou OpenRouter) nao estejam disponiveis ou apresentem erro, o sistema utiliza o calculo local de indice Jaccard sintatico. Caso o banco de dados PostgreSQL esteja fora do ar, o backend le e serve dados a partir do cache JSON local (`dashboard_metrics.json`).

### Frontend
- **Interface SPA:** Estrutura responsiva com layout modular (Sidebar, Header, Footer) e 7 paginas roteadas (Visao Geral, Politicos, Perfil, Comparacao, Relatorios e Sobre).
- **Consumo de Endpoints:** Camada base de servico usando Axios configurada para se comunicar com a porta 5001 do Flask.

### Banco de Dados
- **PostgreSQL 15 no Supabase:** Schema completo contendo 6 tabelas relacionais (`parlamentar`, `discurso`, `proposicao`, `votacao`, `voto`, `score_coerencia`).
- **Indexacao pgvector:** Criacao de indices do tipo `ivfflat` nas colunas de embeddings para busca semantica de alta velocidade no cruzamento de discursos e ementas.

### CI/CD e Documentacao
- **Workflow Principal:** Pipeline no GitHub Actions responsavel por fazer a coleta periodica de metricas do GitHub, compilar os arquivos markdown de documentacao e realizar o deploy do site statico final para a branch `gh-pages`.
- **MkDocs Material:** Layout de navegacao moderno dividindo a documentacao em sprints, requisitos, frontend, backend, tecnologias e estudos.

---

## 4. Guia de Instalacao e Execucao Local

### Backend
1. Navegue ate a pasta do backend:
   ```bash
   cd backend
   ```
2. Crie e ative o ambiente virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate  # No Windows: venv\Scripts\activate
   ```
3. Instale as dependencias necessarias:
   ```bash
   pip install -r requirements.txt
   ```
4. Crie o arquivo `.env` com base no arquivo `.env.example` preenchendo as chaves do Supabase, Groq e OpenRouter.
5. Inicie a API Flask:
   ```bash
   python api.py
   ```

### Frontend
1. Navegue ate a pasta do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependencias do projeto:
   ```bash
   npm install
   ```
3. Execute a aplicacao em modo de desenvolvimento:
   ```bash
   npm run dev
   ```

---

## 5. Integrantes do Squad 4

- **Gabriel Velho de Souza**
- **Gustavo Antonio**
- **Juan Costa**
- **Sauhan Ferreira**
