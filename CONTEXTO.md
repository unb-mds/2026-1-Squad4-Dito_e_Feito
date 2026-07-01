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
│   ├── config_data.json       # Estado/Fallback local de checkpoints de coleta
│   ├── pipe.py                # Pipeline local com BERTimbau para embeddings
│   ├── scan_senators.py       # CLI de varredura em lote e análise LLM com checkpoints
│   ├── dashboard.html         # Dashboard alternativo em vanilla JS servido pela API
│   ├── dashboard_metrics.json # Cache/Fallback local das métricas analisadas
│   ├── requirements.txt       # Dependências do Python (Flask, BS4, psycopg2, etc.)
│   ├── database/
│   │   ├── schema.sql         # Estrutura DDL do banco PostgreSQL
│   │   ├── Migrations.sql     # Histórico de alterações estruturais (DDL corrido)
│   │   ├── Migrations.md      # Histórico de documentação das migrations
│   │   ├── 004_coerencia_booleana.sql # Script SQL da migration 004
│   │   ├── seed.sql           # Script de inserção de dados de seed no banco
│   │   └── Conexão.md         # Guia de conexão ao banco para desenvolvedores
│   ├── utils/
│   │   └── config.py          # Gerenciamento de checkpoints e configuração híbrida
│   └── tests/                 # Suíte de testes unitários do backend (Pytest)
├── docs/                      # Documentação técnica oficial (lida pelo MkDocs)
│   └── backend/
│       ├── pipeline_multicasa.md     # Documentação da expansão do pipeline Senado/Câmara
│       └── coerencia_e_incremental.md # Detalhamento do modelo booleano e carga incremental
├── frontend/                  # Código-fonte do Frontend (React 19)
│   ├── e2e/                   # Testes de ponta a ponta (Playwright)
│   ├── src/
│   │   ├── App.jsx            # Roteamento principal (React Router DOM v7)
│   │   ├── services/api.js    # Camada de comunicação Axios (aponta para :5001/api)
│   │   ├── pages/             # Páginas da SPA (VisaoGeral, Perfil, Partidos, Estados, etc.)
│   │   └── components/        # Componentes visuais (Sidebar, MapaBrasil, Gráficos, etc.)
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
2. **LLMs (Ollama, Groq & OpenRouter)**: O backend utiliza LLMs (como o modelo local `qwen2.5-coder:7b` via Ollama, ou Llama 3 via APIs do Groq e OpenRouter) para avaliar a **Coerência Política Real** (modelo booleano), baseando-se no trinômio `(Discurso, Ementa da Votação, Voto Oficial Registrado)` e gerando justificativas estruturadas em português.
3. **Fallback Jaccard**: Caso as chaves de API não estejam configuradas ou as requisições/servidores falhem, o sistema utiliza o cálculo de índice Jaccard sintático local para não interromper a execução.

### Mudança de Paradigma: Coerência Política Real (Modelo Booleano)
* **Antigo**: O modelo calculava apenas a afinidade temática (0.0 a 1.0) entre discurso e ementa, sem considerar o sentido do posicionamento do político em relação ao seu voto real.
* **Novo**: Avaliação baseada na postura inferida do discurso comparada ao voto real.
  * **Regras de Postura**: A LLM extrai a postura do parlamentar a partir do discurso em relação à pauta (`'A Favor'`, `'Contra'`, ou `'Neutro'`).
  * **Matriz de Coerência**:
    * Postura `'A Favor'` + Voto `'Sim'` $\rightarrow$ `coerente: true`
    * Postura `'Contra'` + Voto `'Não'` $\rightarrow$ `coerente: true`
    * Postura `'A Favor'` + Voto `'Não'` $\rightarrow$ `coerente: false`
    * Postura `'Contra'` + Voto `'Sim'` $\rightarrow$ `coerente: false`
    * Postura `'Neutro'` ou Voto irrelevante (`'Abstenção'`, `'Ausente'`, `'Obstrução'`, etc.) $\rightarrow$ `coerente: null` (desconsiderado do cálculo da média).
  * **Cálculo do Score Global**:
    $$\text{Score Global (\%)} = \left( \frac{\text{Qtd. de Votos Coerentes (true)}}{\text{Total de Votos Avaliados (true + false)}} \right) \times 100$$
    *No banco de dados, o campo `score` é salvo como `100.00` se for coerente (`true`) e `0.00` se for incoerente (`false`) para garantir retrocompatibilidade com views e médias.*

### Carga Histórica Inicial e Atualização Incremental (Checkpoints)
O script de varredura possui suporte a carregamento incremental usando checkpoints de datas:
* **Obtenção do Checkpoint**: A função `obter_checkpoint()` de `backend/utils/config.py` carrega a data da última coleta da tabela `parametro_coleta` (PostgreSQL) ou do arquivo fallback local `backend/config_data.json`.
* **Carga Incremental**: A busca por discursos e votações utiliza a data obtida como limite inferior (ex: `dataInicio` na API do Senado), reduzindo significativamente o número de requisições às APIs do governo e o volume de tokens enviados para a LLM.
* **Prevenção de Duplicados**: Antes de salvar um novo par no banco de dados, o sistema verifica se já existe uma entrada idêntica para evitar duplicações.
* **Atualização**: Ao finalizar com sucesso, a função `atualizar_checkpoint()` atualiza a data de controle no banco de dados e sincroniza localmente no JSON.

### Fluxo de Varredura (`scan_senators.py`):
* **Filtro L1 (Volume)**: Verifica a quantidade de discursos via API antes de fazer scraping (Fail Fast).
* **Mecanismo de Fallback Dinâmico**: Se 3 senadores seguidos retornarem zero discursos no período de busca (ex: 2024-2026), o script alarga automaticamente a busca retroativamente até 2022 para obter histórico suficiente.
* **Filtro L2 (Jaccard)**: Filtra os discursos e ementas mais próximos sintaticamente para enviar apenas uma amostra relevante (`MAX_PARES_LLM = 10`) para a LLM, economizando tokens.

### Pipeline Multi-Casa (Senado Federal & Câmara dos Deputados):
O pipeline foi expandido para suportar o monitoramento integrado de ambas as casas legislativas.
* **Heterogeneidade de Dados**: Integra a API do Senado (XML/JSON legados) com a API v2 da Câmara dos Deputados (REST JSON paginada) sob a classe `MonitoramentoLegislativo`.
* **Data Wrangling & Normalização (MDS)**: Utiliza `pd.json_normalize()` para tratar os dicionários da API da Câmara e gera uma ementa sintética (`df_final['ementa'] = f"Votação da proposição {sigla} {numero}/{ano}. Orientação de voto: " + df_final['Voto']`), garantindo buscas semânticas equivalentes.
* **Eficiência Computacional**: Limita o processamento de textos a 512 tokens e utiliza `with torch.no_grad():` no PyTorch, o que reduz o consumo de memória RAM em até 60% durante a extração de embeddings.
* **Documentação & Experimentos**: Para mais detalhes de modelagem e arquitetura, consulte a [Documentação de Pipeline Multi-Casa](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/docs/backend/pipeline_multicasa.md), a [Documentação de Coerência e Carga Incremental](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/docs/backend/coerencia_e_incremental.md) e o [Notebook Google Colab de Monitoramento Multi-Casa](https://colab.research.google.com/drive/1-9jCu3MbPG_Qr0O2RLV9TA5qVeYRxS3a#scrollTo=og-j5MS7H_J9).


---

## 6. Endpoints do Backend Flask (`backend/api.py`)

A API expõe as seguintes rotas na porta **5001**:
* `GET /api/health` — Status da API e chaves ativas.
* `GET /api/dashboard-metrics` — Dados consolidados para o dashboard (ranking, médias por partido). Lê do PostgreSQL com fallback automático para o JSON local (`dashboard_metrics.json`).
* `GET /api/senadores` — Proxy da API do Senado para buscar a lista de senadores atuais em exercício.
* `GET /api/deputados` — Proxy da API da Câmara para buscar a lista de deputados.
* `GET /api/politico/<id_externo>` — Detalhes básicos de um parlamentar. Busca em 3 camadas: banco → JSON local → APIs oficiais (Senado/Câmara).
* `POST /api/analisar` — Recebe `{ "id": <ID> }` e realiza a análise de coerência. Adota uma estratégia **Cache-First** (tenta ler do JSON local de varredura rápida) e, caso não encontre, realiza a análise em tempo real. O tipo (`senador`/`deputado`) é detectado automaticamente via banco ou lista de IDs hardcoded.

### Lógica de Fallback em Cascata (PR #96 — feat/coerencia-politica)

Todo endpoint que depende do banco segue esta cadeia:
1. **Banco de Dados (Supabase/PostgreSQL)** via `psycopg2.connect(DATABASE_URL)` → fonte primária.
2. **JSON local** (`backend/dashboard_metrics.json`) → fallback automático se o banco falhar (ex: IPv6 no Docker).
3. **APIs Governamentais** (Senado/Câmara) → fallback final apenas para o endpoint `/api/politico/<id>`.

> [!NOTE]
> **Detecção automática de tipo**: O endpoint `POST /api/analisar` detecta se o parlamentar é deputado ou senador consultando primeiro o banco (`tipo_parlamentar`). Se o banco falhar, usa uma lista de IDs de deputados conhecidos (`DEPUTADOS_IDS`) como fallback.

### Análise de Coerência (Arquitetura Cache-First e Tempo Real)

O pipeline de análise do endpoint `POST /api/analisar` foi otimizado para economizar chamadas às APIs de LLM e tempo de carregamento utilizando uma abordagem **Cache-First**:

1. **Consulta ao Cache (Batch Processing)**: Primeiro tenta localizar os dados do parlamentar no cache local consolidado (`backend/dashboard_metrics.json`).
   - Se os dados existirem e possuírem detalhes de análise, o sistema faz o mapeamento do campo booleano `coerente` para os campos legados `status` ("Coerente" ou "Divergente") e `afinidade` (1.0 ou 0.0) para garantir a compatibilidade com a interface do frontend sem quebras.
   - Retorna os dados mapeados imediatamente sob a propriedade `"modelo_usado": "Cache (Batch Processing)"`.
2. **Processamento em Tempo Real (Fallback)**: Caso o parlamentar não seja encontrado no cache, o pipeline prossegue com a execução em tempo real:
   - Busca os últimos **discursos** do parlamentar (via scraping do Senado ou API da Câmara — 90 dias).
   - Busca os últimos **votos** registrados (via API XML do Senado ou API REST da Câmara).
   - Para cada voto, encontra o discurso mais próximo usando **similaridade Jaccard**.
   - Envia os pares `(ementa, voto, discurso)` para a **LLM** (Groq → OpenRouter → Jaccard como fallback local).
   - A LLM avalia a coerência baseada no modelo booleano: extrai a postura do parlamentar (`'A Favor'`, `'Contra'`, `'Neutro'`), compara com o voto oficial registrado e retorna se é coerente (`true`, `false` ou `null`).
   - O `score_coerencia` final (0% a 100%) é calculado sobre os pares válidos, excluindo ausências/abstenções (mínimo de 3 pares válidos exigidos para calcular o score). Retorna a lista detalhada com justificativas.

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

## 9. Estado Atual das Conexões com o Banco de Dados (Supabase)

> [!IMPORTANT]
> **Problema atual em Docker**: O container do backend não consegue se conectar ao Supabase porque o DNS resolve para um endereço **IPv6** (`2600:1f16:...`) que o Docker Desktop no Windows/WSL2 não roteia. O sistema cai automaticamente para o fallback JSON.

### Tabelas que o backend já consulta via `psycopg2`:

| Tabela | Endpoint / Script que usa | Query principal |
|---|---|---|
| `parlamentar` | `/api/dashboard-metrics`, `/api/politico/<id>`, `/api/analisar` | `JOIN score_coerencia ON sc.parlamentar_id = p.id` |
| `score_coerencia` | `/api/dashboard-metrics`, `scan_senators.py` | `AVG(sc.score)`, `COUNT(sc.id)` agrupados por parlamentar, inserção de análises booleanas |
| `parametro_coleta` | `scan_senators.py` (via `utils/config.py`) | Consulta e atualização da data de checkpoint (`ultima_data_coleta`) |

### Tabelas definidas no schema mas ainda SEM endpoints dedicados:

| Tabela | Descrição |
|---|---|
| `discurso` | Armazena textos e embeddings dos discursos parlamentares |
| `proposicao` | Proposições legislativas (PL, PEC, etc.) |
| `votacao` | Sessões de votação vinculadas a proposições |
| `voto` | Voto individual de cada parlamentar por votação |

---

## 10. Prompt para Implementação de Conexões Backend ↔ Banco de Dados

Copie e use o prompt abaixo para orientar uma IA a implementar novas conexões:

```
Você é um engenheiro de backend Python sênior. Preciso implementar conexões entre o backend Flask do projeto "Dito e Feito" e o banco de dados PostgreSQL hospedado no Supabase.

## Contexto do Projeto
- Backend: Flask (Python 3.10), porta 5001, arquivo principal: `backend/api.py`
- Banco: PostgreSQL 15 no Supabase, acessado via `psycopg2`
- Variável de conexão: `DATABASE_URL` (lida do `backend/.env`)
- Biblioteca de conexão: `psycopg2-binary` (já instalada)
- Padrão de fallback: sempre que o banco falhar, usar o arquivo `backend/dashboard_metrics.json`

## Schema do Banco (tabelas principais)
- `parlamentar(id UUID PK, id_externo TEXT UK, nome_civil, nome_urna, sigla_partido, sigla_uf, tipo_parlamentar TEXT CHECK ('senador','deputado'), situacao, foto_url, created_at)`
- `score_coerencia(id UUID PK, parlamentar_id UUID FK → parlamentar.id, discurso_id UUID FK, votacao_id UUID FK, postura_extraida TEXT, voto_registrado TEXT, coerente BOOLEAN, score NUMERIC(5,2), modelo_usado TEXT, justificativa TEXT, status_coerencia TEXT, calculado_em TIMESTAMPTZ)`
- `discurso(id UUID PK, parlamentar_id FK, texto TEXT, embedding vector(768), data_discurso, source_url)`
- `proposicao(id UUID PK, id_externo TEXT UK, sigla_tipo, numero, ano, ementa, casa TEXT)`
- `votacao(id UUID PK, id_externo TEXT UK, proposicao_id FK, data_hora TIMESTAMPTZ, resultado TEXT)`
- `voto(id UUID PK, votacao_id FK, parlamentar_id FK, voto TEXT, data_registro)`
- `parametro_coleta(chave VARCHAR(100) PK, valor TEXT, atualizado_em TIMESTAMPTZ)`

## Views disponíveis (Migration 004)
- `evolucao_coerencia` — média mensal de score por parlamentar
- `comparacao_parlamentares` — ranking com média, máximo e mínimo de score
- `cobertura_banco` — percentual de parlamentares com score calculado por tipo

## Padrão de código existente (siga este modelo):
```python
if DATABASE_URL:
    try:
        import psycopg2
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute("SELECT ... FROM tabela WHERE ...")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        # processar rows e retornar jsonify({...})
    except Exception as e:
        print(f"[WARN] Banco indisponível, usando JSON: {e}")
# fallback para JSON local
```

## Tarefa
Implemente o(s) seguinte(s) endpoint(s) novo(s) no arquivo `backend/api.py`, seguindo rigorosamente o padrão acima:
[DESCREVA AQUI O ENDPOINT QUE VOCÊ QUER — ex: "GET /api/votos/<parlamentar_id> que retorna os últimos 20 votos de um parlamentar"]
```

---

## 11. Suíte de Testes e Automações

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

