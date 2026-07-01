<div align="center">
  <img src="frontend/src/assets/dito_logo.png" alt="Dito e Feito Logo" width="250" />
</div>

# Dito e Feito

Auditoria e Monitoramento de Coerência Parlamentar por Inteligência Artificial

[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-7C3AED?style=for-the-badge)](https://openrouter.ai/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)

### 🔗 Links Importantes do Projeto
- **🚀 Deploy da Aplicação (Exemplo de Perfil):** [https://frontend-mu-lyart-68.vercel.app/politicos/220603](https://frontend-mu-lyart-68.vercel.app/politicos/220603)
- **📊 Analytics Dashboard:** [https://unb-mds.github.io/2026-1-Squad4-Dito_e_Feito/analytics/](https://unb-mds.github.io/2026-1-Squad4-Dito_e_Feito/analytics/)
- **📖 Documentação Completa (MKDocs):** [https://unb-mds.github.io/2026-1-Squad4-Dito_e_Feito/](https://unb-mds.github.io/2026-1-Squad4-Dito_e_Feito/)

---

## Visão Geral e Arquitetura

O Dito e Feito é uma plataforma de auditoria cívica voltada ao monitoramento da coerência política no legislativo brasileiro. O sistema cruza os discursos oficiais dos parlamentares (pronunciados em tribuna) com seus votos reais registrados em sessões nominais no plenário. Utilizando algoritmos de Processamento de Linguagem Natural (PLN) e Modelos de Linguagem de Grande Porte (LLMs), a ferramenta identifica se a postura verbal de um parlamentar é condizente com seu comportamento legislativo prático.

O ecossistema divide-se em dois módulos com responsabilidades e escopos distintos:

### Backend (Varredura e API)

O núcleo do processamento é responsável por:

- Consumir dados estruturados das APIs abertas da Câmara dos Deputados e do Senado Federal.
- Realizar a extração automatizada (web scraping) do conteúdo literal dos pronunciamentos.
- Executar a triagem rápida de similaridade sintática local (via índice Jaccard ou embeddings densos do BERTimbau).
- Submeter os dados filtrados para avaliação cognitiva de afinidade e geração de justificativas textuais por modelos de linguagem avançados (Gemini 2.0 e Llama-3 via APIs Google, Groq e OpenRouter).
- Disponibilizar os dados por meio de endpoints REST utilizando o framework Flask (conteinerizado via Docker) e persistir os resultados em um banco de dados PostgreSQL hospedado no Supabase.

### Frontend (Dashboard Interativo)

Uma Single Page Application construída com React 19, Vite e TailwindCSS v4, focada em democratizar o acesso à informação política para o cidadão. Ela oferece:

- Visualização de métricas e KPIs consolidados (como média global de coerência e total de incoerências mapeadas).
- Gráficos comparativos detalhados (via Recharts) por partidos políticos e parlamentares.
- Raio-X individual do político, exibindo o histórico cronológico de votos, transcrição resumida do discurso relacionado e justificativa de coerência gerada por IA.

---

### 🚀 Conquistas do Ciclo (Desafio Técnico)

- [X] **Pipeline Unificado Multi-Casa:** Conseguimos unificar a ingestão de dados das APIs do Senado Federal e da Câmara dos Deputados em um pipeline robusto com normalização de dados e IA local/nuvem. Detalhes completos disponíveis na [documentação da Expansão do Pipeline e Monitoramento Multi-Casa](docs/backend/pipeline_multicasa.md) ou para testes dinâmicos no [Notebook Google Colab de Monitoramento Multi-Casa](https://colab.research.google.com/drive/1-9jCu3MbPG_Qr0O2RLV9TA5qVeYRxS3a#scrollTo=og-j5MS7H_J9).

---

## Guia de Instalação e Execução

Siga os passos abaixo para configurar e executar os ambientes de desenvolvimento do projeto localmente.

### Pré-requisitos

- Python 3.10 ou superior
- Node.js 18 ou superior
- Instâncias do PostgreSQL (Supabase), Groq API e OpenRouter API configuradas

### 1. Clonar o Repositório

```bash
git clone https://github.com/unb-mds/2026-1-Squad4-Dito_e_Feito
cd 2026-1-Squad4-Dito_e_Feito
```

### 2. Configurar o Backend

Acesse a pasta do backend, configure o ambiente virtual e instale as dependências:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # No Windows use: venv\Scripts\activate
pip install -r requirements.txt
```

Crie um arquivo `.env` na raiz do diretório `backend` baseado no modelo disponível em `.env.example`:

```env
DATABASE_URL=postgresql://usuario:senha@host:porta/banco
GROQ_API_KEY=sua_chave_groq_aqui
OPENROUTER_API_KEY=sua_chave_openrouter_aqui
```

#### Executando a API do Backend

```bash
python api.py
```

O servidor da API iniciará por padrão na porta `5001`.

#### Executando a Varredura (Scanner CLI)

Para executar o processamento automatizado de dados em lote:

```bash
python scan_senators.py
python scan_deputados.py
```

#### Executando o Backend via Docker (Recomendado)

O backend também está conteinerizado. Na raiz do projeto, você pode executar o Flask através do Docker Compose:

```bash
cd ..
docker-compose up --build
```

---

### 3. Configurar o Frontend

Acesse a pasta do frontend e instale as dependências com o gerenciador de pacotes npm:

```bash
cd ../frontend
npm install
```

#### Executando o Frontend em Modo de Desenvolvimento

```bash
npm run dev
```

A aplicação web estará disponível por padrão no endereço `http://localhost:5173`.

---

## Core Team

Desenvolvedores responsáveis pela criação e manutenção do projeto:

| Foto de Perfil | Nome do Integrante | Link do GitHub |
|:---:|:---:|:---:|
| <img src="https://github.com/Velho008.png?size=100" width="80" height="80" style="border-radius: 50%;" alt="Gabriel Velho"/> | **Gabriel Velho de Souza**<br><small>Matrícula: 242015218</small> | [![GitHub](https://img.shields.io/badge/GitHub-Perfil-181717?style=flat-square&logo=github)](https://github.com/Velho008) |
| <img src="https://github.com/gus-ant.png?size=100" width="80" height="80" style="border-radius: 50%;" alt="Gustavo Antonio"/> | **Gustavo Antonio**<br><small>Matrícula: 242015380</small> | [![GitHub](https://img.shields.io/badge/GitHub-Perfil-181717?style=flat-square&logo=github)](https://github.com/gus-ant) |
| <img src="https://github.com/IndianoDev.png?size=100" width="80" height="80" style="border-radius: 50%;" alt="Juan Costa"/> | **Juan Costa**<br><small>Matrícula: 242015648</small> | [![GitHub](https://img.shields.io/badge/GitHub-Perfil-181717?style=flat-square&logo=github)](https://github.com/IndianoDev) |
| <img src="https://github.com/SUDOTMOX.png?size=100" width="80" height="80" style="border-radius: 50%;" alt="Sauhan Ferreira"/> | **Sauhan Ferreira**<br><small>Matrícula: 242024923</small> | [![GitHub](https://img.shields.io/badge/GitHub-Perfil-181717?style=flat-square&logo=github)](https://github.com/SUDOTMOX) |
