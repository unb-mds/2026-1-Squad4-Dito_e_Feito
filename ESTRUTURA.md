# 📁 Estrutura de Pastas do Repositório

Este documento explica como o repositório **Dito e Feito** está organizado e descreve a finalidade de cada um dos principais diretórios e arquivos do projeto. A reestruturação foi projetada para seguir as melhores práticas de MDS (Métodos de Desenvolvimento de Software) e Engenharia de Software, facilitando a navegação e evitando duplicações.

---

## 🗺️ Mapa do Repositório

```text
2026-1-Squad4-Dito_e_Feito/
├── .github/                  # Configurações de pipelines e workflows do GitHub Actions
│   └── workflows/            # Scripts YAML para automação (CI/CD e deploy)
├── .vscode/                  # Configurações do ambiente local de desenvolvimento no VS Code
├── analytics/                # Interface HTML/CSS/JS dedicada ao painel de métricas do repositório
├── backend/                  # Código-fonte do Backend (Python + FastAPI)
│   ├── database/             # Scripts e arquivos do Banco de Dados PostgreSQL (schema.sql)
│   ├── api.py                # Ponto de entrada da API REST
│   ├── pesquisa_deputados.py # Lógica de processamento e raspagem de dados
│   └── requirements.txt      # Dependências Python necessárias para rodar o backend
├── docs/                     # Fontes da documentação oficial do projeto (lidas pelo MkDocs)
│   ├── index.md              # Página inicial da documentação
│   ├── atas/                 # Registros e memórias de reuniões do time
│   ├── design/               # Links de Figma e especificações de interface e design tokens
│   ├── estudos/              # Artigos de estudos e guias (git, scrum, bancos, NLP)
│   ├── requisitos/           # Documento de requisitos funcionais, não funcionais e regras de negócio
│   └── tecnologias/          # Documentos sobre a stack tecnológica e guia de conexão ao banco
├── scripts/                  # Scripts utilitários (JS/Node) para extrair métricas do repositório
├── .gitignore                # Arquivo que define quais arquivos locais/temporários o Git deve ignorar
├── index.html                # Aplicação web principal (Interface do usuário do Dito e Feito)
├── LICENSE                   # Licença de uso público do projeto
├── metrics.json              # Dados de métricas gerados pelos scripts de coleta
├── mkdocs.yml                # Arquivo de configuração geral da documentação MkDocs
└── README.md                 # Página de apresentação do projeto no GitHub
```

---

## 🔍 Descrição das Principais Pastas

### 1. [backend/](file:///e:/MDS/2026-1-Squad4-Dito_e_Feito/backend/)
Contém o servidor e toda a lógica de inteligência artificial e processamento de dados do sistema. O backend é escrito em Python utilizando a biblioteca **FastAPI** para disponibilizar endpoints para o frontend.
* **[backend/database/](file:///e:/MDS/2026-1-Squad4-Dito_e_Feito/backend/database/)**: Guarda o script de schema do banco relacional (`schema.sql`), mantendo a modelagem das tabelas do banco junto do código que as consome.

### 2. [docs/](file:///e:/MDS/2026-1-Squad4-Dito_e_Feito/docs/)
Centraliza **toda a documentação oficial do projeto**. Esta pasta é consumida pelo **MkDocs** para gerar o site estático que é publicado no GitHub Pages.
* **[docs/atas/](file:///e:/MDS/2026-1-Squad4-Dito_e_Feito/docs/atas/)**: Histórico de reuniões de alinhamento e sprints.
* **[docs/estudos/](file:///e:/MDS/2026-1-Squad4-Dito_e_Feito/docs/estudos/)**: Pesquisas realizadas pelo time em temas fundamentais (Banco de Dados, Processamento de Linguagem Natural/BERT, ciclo de vida de software, manual de marca e boas práticas de git).
* **[docs/requisitos/](file:///e:/MDS/2026-1-Squad4-Dito_e_Feito/docs/requisitos/)**: Lista consolidada de requisitos e regras de negócio que guiam o escopo do produto.
* **[docs/tecnologias/](file:///e:/MDS/2026-1-Squad4-Dito_e_Feito/docs/tecnologias/)**: Stack e decisões técnicas do time, incluindo o guia prático de conexão ao banco de dados Supabase.

### 3. [.github/](file:///e:/MDS/2026-1-Squad4-Dito_e_Feito/.github/)
Contém os arquivos de automação do GitHub.
* **workflows**: Inclui pipelines do GitHub Actions para rodar scripts de extração de métricas de forma programada e fazer o deploy automático da documentação compilada no GitHub Pages a cada push na branch principal.

### 4. [analytics/](file:///e:/MDS/2026-1-Squad4-Dito_e_Feito/analytics/)
Pasta contendo o dashboard estático das métricas do repositório (commits, issues, PRs e velocidade de desenvolvimento), permitindo o monitoramento do desempenho da equipe.

---

## 📌 Arquivos de Configuração Importantes

* **`index.html`** (raiz): O frontend principal do sistema. Uma página interativa que se conecta à API local do backend para buscar parlamentares e calcular a coerência deles.
* **`mkdocs.yml`** (raiz): Define o tema, os plugins habilitados do site de documentação e o menu de navegação lateral (`nav:`).
* **`backend/requirements.txt`**: Lista as bibliotecas Python (Flask, BeautifulSoup4, PyTorch, Transformers) necessárias para que a API seja instalada e executada localmente de maneira padronizada.
* **`.gitignore`**: Essencial para manter o repositório limpo, bloqueando o envio de arquivos gerados localmente como pastas virtuais `.venv/`, arquivos de cache `.npm-cache/` e pastas compiladas `site/` ou `dist/`.
