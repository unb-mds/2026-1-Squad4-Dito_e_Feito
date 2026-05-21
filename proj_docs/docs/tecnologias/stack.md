# Stack Tecnológica — Dito e Feito

> Decisões técnicas e justificativas para a escolha das tecnologias do projeto.

---

## Visão Geral da Stack

| Área | Tecnologia | Justificativa |
|---|---|---|
| **Frontend** | Next.js + TypeScript | SSR para carregamento rápido, ecossistema React maduro para visualizações |
| **Backend / API** | Python + FastAPI | Naturalmente integrado à stack de IA/NLP; docs automáticas via Swagger |
| **NLP / IA** | BERTimbau + HuggingFace | Modelo treinado em português; preserva nuances do discurso legislativo brasileiro |
| **Banco de Dados** | PostgreSQL + pgvector | Resolve dados relacionais E buscas semânticas em um único sistema |
| **Infraestrutura** | Docker + GitHub Actions | Reprodutibilidade do ambiente; CI/CD automatizado |

---

## Justificativas Detalhadas

### Frontend: Next.js + TypeScript

Next.js é a escolha mais sólida para um painel navegável por jornalistas e pesquisadores.

- **SSR** melhora o carregamento inicial de páginas pesadas de dados
- O ecossistema React tem as melhores bibliotecas de visualização (`Recharts`, `Chart.js`, `D3`)
- TypeScript garante segurança de tipos em um sistema com muitos dados estruturados

> **Alternativa considerada:** Streamlit (Python puro) — entrega em 1/3 do tempo, mas sacrifica controle visual e escalabilidade.

---

### NLP: BERTimbau → HuggingFace → Classificador customizado

O pipeline natural é:

```
spaCy  →  HuggingFace (BERTimbau)  →  Classificador customizado
(pré-processamento)  (embeddings semânticos)  (apoio / oposição / neutro)
```

!!! important "Por que BERTimbau?"
    Modelos treinados em inglês **perdem nuances importantes** do discurso legislativo brasileiro — jargão, regionalismos e siglas políticas. BERTimbau é inegociável para português político.

---

### Banco de Dados: PostgreSQL + pgvector

PostgreSQL com extensão `pgvector` resolve **dois problemas ao mesmo tempo**:

- Armazena os dados **relacionais** (parlamentar → discurso → voto)
- Serve como **vector store** para buscas semânticas nos embeddings

Sem precisar manter dois sistemas separados (banco relacional + banco vetorial).

> **Para fase exploratória:** DuckDB é excelente para análise local antes de montar o banco de produção.

---

### API: FastAPI

- Naturalmente integrado porque toda a stack já é Python
- Documentação automática via **Swagger UI**
- Suporte nativo a `async` para não bloquear a API durante inferência NLP

---

## Alternativas de Tecnologias Levantadas

### Frontend
- **Linguagens:** JavaScript, TypeScript
- **Frameworks:** React, Angular, Vue.js, Next.js

### Backend
- **Linguagens:** Python, C#, JavaScript
- **Frameworks:** Node.js, SpringBoot, FastAPI

### Banco de Dados
- **Sistemas:** PostgreSQL, MySQL, MongoDB

### Infraestrutura
- **Ferramentas:** Kubernetes, Docker, GitHub Actions (CI/CD)

### Testes
- **Ferramentas:** Jest, Cypress, Selenium, JUnit, Pytest

---

*Por: Gustavo Antonio Rodrigues e Silva*
