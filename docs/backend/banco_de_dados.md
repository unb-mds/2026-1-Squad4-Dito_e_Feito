# Documentação do Banco de Dados

Este documento descreve em detalhes a arquitetura de infraestrutura, a modelagem relacional, a estratégia de engenharia vetorial e o ecossistema de desenvolvimento do banco de dados do projeto **Dito e Feito**. A camada de persistência é o alicerce que viabiliza o armazenamento histórico de scores de coerência, discursos transcritos, votações nominais e os embeddings semânticos gerados pelos modelos de Processamento de Linguagem Natural.

---

## Arquitetura de Infraestrutura

### PostgreSQL 15 Gerenciado no Supabase

A decisão de infraestrutura adotada pelo time foi utilizar o **PostgreSQL 15** hospedado de forma gerenciada na plataforma **Supabase**. Essa escolha foi orientada por três fatores estratégicos para um projeto acadêmico de curto ciclo de desenvolvimento:

1. **Provisionamento Zero-Config:** O Supabase elimina o overhead operacional de configurar e manter instâncias de banco em servidores próprios, permitindo que a equipe foque exclusivamente na modelagem de dados e no desenvolvimento de funcionalidades.
2. **Suporte Nativo a Extensões Avançadas:** A plataforma permite a ativação da extensão **pgvector** com um único comando SQL (`CREATE EXTENSION IF NOT EXISTS vector`), habilitando o armazenamento e a busca por similaridade de vetores densos de alta dimensão — recurso essencial para o núcleo de PLN do projeto.
3. **Escalabilidade e Acesso Remoto:** A string de conexão padrão do Supabase (`postgresql://postgres:[SENHA]@db.szjbimreoiehjitzatda.supabase.co:5432/postgres`) possibilita acesso simultâneo e seguro de todos os membros do time, seja a partir do backend Flask em produção, dos notebooks de experimentação no Google Colab, ou de ferramentas de gestão como o pgAdmin 4.

### Integração com o Backend Flask via `psycopg2-binary`

A conexão entre o servidor de API (`backend/api.py`) e o banco de dados é estabelecida diretamente pelo driver **`psycopg2-binary`**, o adaptador Python mais robusto e amplamente adotado para PostgreSQL. Ao receber uma requisição no endpoint `/api/dashboard-metrics`, o servidor Flask instancia a conexão de forma programática:

```python
import psycopg2
import os

conn = psycopg2.connect(os.environ["DATABASE_URL"])
cur = conn.cursor()

cur.execute("""
    SELECT
        p.id_externo, p.nome_civil, p.sigla_partido, p.sigla_uf,
        p.foto_url,
        ROUND(AVG(sc.score)::numeric, 2) as avg_score,
        COUNT(sc.id) as total_scores
    FROM parlamentar p
    JOIN score_coerencia sc ON sc.parlamentar_id = p.id
    WHERE p.tipo_parlamentar IN ('senador', 'deputado')
    GROUP BY p.id
    ORDER BY avg_score DESC
""")
rows = cur.fetchall()
cur.close()
conn.close()
```

Este padrão garante que **a credencial nunca é exposta no código-fonte**. A `DATABASE_URL` é injetada em tempo de execução a partir de um arquivo `.env` local (em desenvolvimento) ou de variáveis de ambiente do servidor (em produção), seguindo as diretrizes do `.env.example` disponível no repositório.

A API também implementa uma **estratégia de resiliência em dois níveis**: se o banco estiver indisponível, o sistema faz fallback automático para a leitura do arquivo `dashboard_metrics.json` gerado pelos pipelines de varredura, garantindo que o frontend nunca receba uma resposta vazia.

---

## Modelagem Relacional

### Diagrama Entidade-Relacionamento

O schema foi modelado para representar fielmente o domínio do monitoramento legislativo, com entidades independentes para parlamentares, seus atos de fala e seus atos de voto, conectadas por uma tabela de junção e coroadas pela tabela analítica de scores.

```mermaid
erDiagram
    parlamentar {
        UUID id PK
        BIGINT id_externo UK
        TEXT nome_civil
        TEXT nome_urna
        VARCHAR sigla_partido
        VARCHAR sigla_uf
        TEXT foto_url
        TEXT situacao
        VARCHAR tipo_parlamentar
        TIMESTAMPTZ ultima_sincronizacao
        JSONB dados_api
        TIMESTAMPTZ criado_em
        TIMESTAMPTZ atualizado_em
    }

    discurso {
        UUID id PK
        BIGINT id_externo UK
        UUID parlamentar_id FK
        TIMESTAMPTZ data_hora
        TEXT sumario
        TEXT transcricao
        TEXT palavras_chave
        vector embedding
        TEXT modelo_embedding
        JSONB dados_api
        TIMESTAMPTZ criado_em
    }

    proposicao {
        UUID id PK
        BIGINT id_externo UK
        VARCHAR sigla_tipo
        INTEGER numero
        INTEGER ano
        TEXT ementa
        JSONB dados_api
        TIMESTAMPTZ criado_em
    }

    votacao {
        UUID id PK
        TEXT id_externo UK
        UUID proposicao_id FK
        TIMESTAMPTZ data_hora
        TEXT descricao
        BOOLEAN aprovada
        vector embedding_ementa
        JSONB dados_api
        TIMESTAMPTZ criado_em
    }

    voto {
        UUID id PK
        UUID parlamentar_id FK
        UUID votacao_id FK
        resultado_voto resultado
        TIMESTAMPTZ criado_em
    }

    score_coerencia {
        UUID id PK
        UUID parlamentar_id FK
        UUID discurso_id FK
        UUID votacao_id FK
        NUMERIC score
        FLOAT similaridade_coseno
        TEXT modelo_usado
        TEXT justificativa
        TEXT status_coerencia
        TIMESTAMPTZ calculado_em
    }

    cache_analise {
        UUID id PK
        BIGINT parlamentar_id
        TEXT tipo
        TEXT modelo_usado
        INTEGER total_votos
        JSONB resultado
        TIMESTAMPTZ criado_em
    }

    parlamentar ||--o{ discurso : "pronuncia"
    parlamentar ||--o{ voto : "registra"
    parlamentar ||--o{ score_coerencia : "recebe"
    votacao ||--o{ voto : "contém"
    votacao }o--o| proposicao : "afeta"
    score_coerencia }o--o| discurso : "referencia"
    score_coerencia }o--o| votacao : "referencia"
```

### Dicionário de Tabelas

| Tabela | Responsabilidade | Detalhe Técnico |
|---|---|---|
| **`parlamentar`** | Entidade central do sistema. Armazena os dados biográficos e cadastrais de deputados e senadores. | Chave `id_externo` como `BIGINT UNIQUE` para idempotência nos upserts vindos das APIs governamentais. Campo `tipo_parlamentar` adicionado na Migration 003. |
| **`discurso`** | Registra cada pronunciamento oficial de um parlamentar na tribuna. | Coluna `embedding vector(768)` para armazenar o vetor semântico gerado pelo BERTimbau. Campo `modelo_embedding` rastreia qual versão do modelo produziu o vetor. |
| **`proposicao`** | Cataloga as proposições legislativas (PL, PEC, MPV, etc.) que entram em pauta para votação. | Contém a `ementa` textual, ponto de partida para o cruzamento com discursos. |
| **`votacao`** | Representa cada sessão de votação nominal ocorrida. Vincula-se a uma proposição e armazena o resultado geral da votação (`aprovada`). | Coluna `embedding_ementa vector(768)` viabiliza a busca semântica inversa: dado um discurso, encontrar votações temáticamente relacionadas. |
| **`voto`** | Tabela de junção N:N entre `parlamentar` e `votacao`. Registra o posicionamento individual de cada parlamentar em cada votação. | O tipo `ENUM resultado_voto` (`Sim`, `Não`, `Abstenção`, `Obstrução`, `Art. 17`, `Ausente`) garante integridade referencial dos posicionamentos. Constraint `UNIQUE (parlamentar_id, votacao_id)` previne duplicatas. |
| **`score_coerencia`** | Tabela analítica principal. Materializa o resultado do cruzamento entre discurso e voto realizado pela IA. | `score NUMERIC(5,2)` em escala de 0 a 100. `similaridade_coseno FLOAT` expõe o valor bruto para auditoria. `status_coerencia` é uma das três categorias: `Coerente`, `Parcialmente Alinhado` ou `Tema Divergente`. |
| **`cache_analise`** | Tabela de cache criada na Migration 001 para armazenar análises consolidadas da IA. | Armazena o resultado completo da análise em `JSONB`, com constraint `UNIQUE (parlamentar_id, tipo)` para servir respostas em tempo real sem re-processar a LLM. |

---

## Engenharia Vetorial com pgvector

### O Problema que os Vetores Resolvem

A análise de coerência é, em sua essência, um problema de **busca por similaridade semântica** em espaços de alta dimensão. Palavras como "saúde pública", "sistema de saúde" e "política sanitária" possuem significados próximos, mas são sintaticamente distintas — a busca textual convencional (como `ILIKE` ou índices B-tree) falharia em conectá-las.

A solução adotada é a geração de **embeddings**: representações matemáticas densas de sentenças em um espaço vetorial de **768 dimensões**, produzidas pelo modelo **BERTimbau** (`neuralmind/bert-base-portuguese-cased`). Nesse espaço, textos semanticamente relacionados produzem vetores geometricamente próximos, e a distância entre eles pode ser quantificada pela **similaridade de cosseno**.

### Armazenamento de Embeddings no Schema

As colunas vetoriais estão declaradas em duas tabelas estratégicas do `schema.sql`:

```sql
-- Tabela discurso: embedding do texto do pronunciamento
CREATE TABLE discurso (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parlamentar_id    UUID NOT NULL REFERENCES parlamentar(id) ON DELETE CASCADE,
    transcricao       TEXT,
    embedding         vector(768),                                    -- ← vetor semântico do discurso
    modelo_embedding  TEXT DEFAULT 'neuralmind/bert-base-portuguese-cased',
    -- ... demais colunas
);

-- Tabela votacao: embedding semântico da ementa da votação
CREATE TABLE votacao (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposicao_id       UUID REFERENCES proposicao(id) ON DELETE SET NULL,
    descricao           TEXT,
    embedding_ementa    vector(768),                                  -- ← vetor semântico da ementa
    -- ... demais colunas
);
```

O tipo `vector(768)` é fornecido pela extensão **pgvector** e instrui o PostgreSQL a tratar a coluna como um array fixo de 768 números de ponto flutuante, ativando operadores de álgebra linear nativos (`<=>` para distância de cosseno, `<->` para distância euclidiana).

### Índices IVFFLAT e Busca por Similaridade de Cosseno

Com milhares de embeddings armazenados, uma busca exaustiva (comparação vetor-a-vetor) seria proibitivamente lenta. Para isso, foram criados **índices IVFFLAT** (*Inverted File with Flat compression*) — o algoritmo de busca aproximada de vizinhos mais próximos (*Approximate Nearest Neighbor*, ANN) nativo do pgvector:

```sql
-- Índice ANN para busca semântica nos discursos
CREATE INDEX idx_discurso_embedding
    ON discurso
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Índice ANN para busca semântica nas ementas das votações
CREATE INDEX idx_votacao_embedding
    ON votacao
    USING ivfflat (embedding_ementa vector_cosine_ops)
    WITH (lists = 100);
```

**Como funciona o IVFFLAT:**
O algoritmo divide o espaço vetorial em `lists = 100` **células de Voronoi** (partições do espaço). Ao executar uma consulta, o PostgreSQL identifica as células mais próximas do vetor de consulta e pesquisa exaustivamente apenas nessas regiões, ignorando o restante do espaço. Isso reduz a complexidade de busca de `O(n)` para aproximadamente `O(√n)`.

O parâmetro `vector_cosine_ops` instrui o índice a organizar as células utilizando a **distância de cosseno** como métrica de proximidade — a mesma métrica empregada nos cálculos de coerência entre discursos e ementas, garantindo consistência total entre a indexação e o critério de busca da aplicação.

**Impacto prático:** Uma query de busca dos 5 discursos mais semanticamente próximos de uma ementa de votação, que com busca sequencial percorreria todos os registros, com o índice IVFFLAT percorre apenas as células vizinhas — reduzindo o tempo de resposta em ordens de magnitude conforme o volume de dados cresce.

---

## Guias e Ecossistema de Desenvolvimento

### Conexão ao Banco em Múltiplos Contextos (`Conexão.md`)

O arquivo `backend/database/Conexão.md` centraliza os guias de acesso ao banco para todos os perfis de uso da equipe, contemplando quatro contextos distintos:

| Contexto | Tecnologia | Caso de Uso |
|---|---|---|
| **Integração com o Backend** | `psycopg2` direto | Execução de queries no `api.py` e nos pipelines de varredura |
| **Modelagem e ORM** | `SQLAlchemy` + `python-dotenv` | Abstração de entidades para projetos com modelos ORM declarativos |
| **Experimentos de PLN** | `psycopg2` no Google Colab | Salvar resultados de análises do BERTimbau e experimentos de NLP no banco sem configuração local |
| **Gestão e Inspeção Visual** | pgAdmin 4 | Visualização, execução de queries ad-hoc e auditoria da estrutura das tabelas |

A string de conexão canônica do projeto é:

```
postgresql://postgres:[SENHA]@db.szjbimreoiehjitzatda.supabase.co:5432/postgres
```

A senha nunca é versionada no repositório — é solicitada ao responsável pelo banco e injetada como variável de ambiente, em conformidade com as práticas de segurança documentadas no próprio guia.

### Histórico de Migrações (`Migrations.sql` e `Migrations.md`)

O versionamento evolutivo do schema é registrado no arquivo `backend/database/Migrations.sql`, com **3 migrations aplicadas** ao longo do ciclo de desenvolvimento da R1:

| Migration | Período | Alterações Realizadas |
|---|---|---|
| **`schema_inicial`** | Sprint 03 | Criação das 6 tabelas principais: `parlamentar`, `discurso`, `proposicao`, `votacao`, `voto`, `score_coerencia`. Definição do ENUM `resultado_voto`. Criação de todos os índices B-tree e os dois índices IVFFLAT. |
| **001 — Suporte a senadores e cache** | Sprint 05 | `ALTER TABLE parlamentar` para adicionar `tipo` e `ultima_sincronizacao`. Criação da tabela `cache_analise` (JSONB) com índice em `parlamentar_id`. Criação das views `ranking_coerencia` e `parlamentares_por_partido`. |
| **003 — Integração backend** | Sprint 05 | Adição da coluna `tipo_parlamentar VARCHAR(20)` com CHECK constraint, usada diretamente pelo `api.py` e pelo `scan_senators.py` para discriminar senadores de deputados em tempo de execução. Formalização da constraint `UNIQUE` em `id_externo` para garantir idempotência nos upserts. |

O `Migrations.md` complementa esse histórico com a documentação operacional do **Alembic** — a ferramenta de versionamento de schema para projetos SQLAlchemy — incluindo o fluxo de trabalho da equipe (`autogenerate → revision → upgrade head → commit`) e exemplos práticos de adição de campos, garantindo que nenhuma alteração estrutural seja aplicada manualmente sem registro formal.

---

## Autor

| Nome | Matrícula | GitHub | Papel |
|------|-----------|--------|-------|
| JUAN COSTA INDIANO | 232011578 | [IndianoDev](https://github.com/IndianoDev) | Scrum Master & Data Engineer |
