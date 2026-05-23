# ⚖️ Dito e Feito  

### Análise política com IA

O **Dito e Feito** é um sistema de análise de coerência política que compara discursos de parlamentares com seus votos reais em plenário. O objetivo do projeto é promover transparência e apoiar a análise de comportamento legislativo por meio de dados e inteligência artificial.

# Dashboard de métricas

Link Dashboard de métricas de produtividade: https://unb-mds.github.io/2026-1-Squad4-Dito_e_Feito/analytics/

---

## Visão Geral

Em democracias modernas, discursos políticos e votações são públicos, mas dispersos e difíceis de analisar. Este projeto busca resolver esse problema ao cruzar essas informações e gerar indicadores de coerência.

O sistema analisa:

- Discursos (ementas, justificativas e pronunciamentos)
- Votações legislativas (favorável, contrário, abstenção)

E responde:

> O parlamentar vota de acordo com o que defende?

---

## Funcionalidades

- 📊 Dashboard interativo com indicadores de coerência
- 📈 Análise de tendência ao longo do tempo
- 🏅 Ranking de parlamentares por coerência
- 🔍 Filtros por partido, estado e período
- 🤖 Análise semântica de textos (NLP)
- ⚖️ Comparação entre discurso e comportamento legislativo

---

## Tecnologias Utilizadas

### Backend
- Python
- FastAPI

### IA / NLP
- Hugging Face Transformers
- Sentence Transformers

### Banco de Dados
- PostgreSQL

### Frontend
- React
- Chart.js / Recharts

---

## Estrutura do Repositório

O projeto está organizado seguindo uma estrutura limpa e padronizada que separa o código-fonte da aplicação da documentação gerada pela equipe:

* **[backend/](backend/)**: Contém a API REST em Python (FastAPI), scripts de processamento e a modelagem do banco de dados relacional.
* **[docs/](docs/)**: Centraliza todas as atas de reuniões, requisitos, estudos e guias que compõem a documentação oficial (MkDocs).
* **[analytics/](analytics/)**: Código-fonte do painel de métricas de produtividade do squad.
* **`index.html`**: Frontend principal da aplicação (Interface do Usuário).

Para compreender detalhadamente a finalidade de cada diretório e arquivo do projeto, acesse o guia completo de **[Estrutura de Pastas (ESTRUTURA.md)](ESTRUTURA.md)** na raiz do repositório.

