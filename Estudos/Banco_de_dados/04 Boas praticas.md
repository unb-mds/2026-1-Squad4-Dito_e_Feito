# 04 — Queries, Índices e Boas Práticas

Referência de SQL no PostgreSQL aplicada ao contexto do projeto **Dito e Feito**.

---

## Queries básicas (revisão com contexto do projeto)

### SELECT com filtros

```sql
-- Listar parlamentares de um partido
SELECT nome_civil, sigla_uf
FROM parlamentar
WHERE sigla_partido = 'PT'
ORDER BY nome_civil;

-- Buscar discursos de um parlamentar em um período
SELECT data_hora, sumario
FROM discurso
WHERE parlamentar_id = 'uuid-aqui'
  AND data_hora BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY data_hora DESC;

-- Contar votos por tipo de resultado em uma votação
SELECT resultado, COUNT(*) AS total
FROM voto
WHERE votacao_id = 'uuid-aqui'
GROUP BY resultado
ORDER BY total DESC;
```

### JOIN — cruzando dados

```sql
-- Listar votos com nome do parlamentar e descrição da votação
SELECT
    p.nome_civil,
    p.sigla_partido,
    v.resultado,
    vo.descricao AS votacao,
    vo.data_hora
FROM voto v
JOIN parlamentar p ON p.id = v.parlamentar_id
JOIN votacao vo    ON vo.id = v.votacao_id
WHERE p.sigla_uf = 'SP'
ORDER BY vo.data_hora DESC;
```

### Subquery e CTE (Common Table Expressions)

CTEs tornam queries complexas mais legíveis — muito útil para relatórios do sistema.

```sql
-- CTE: média de coerência por partido
WITH media_por_partido AS (
    SELECT
        p.sigla_partido,
        AVG(sc.score) AS media_score,
        COUNT(DISTINCT p.id) AS total_parlamentares
    FROM score_coerencia sc
    JOIN parlamentar p ON p.id = sc.parlamentar_id
    GROUP BY p.sigla_partido
)
SELECT *
FROM media_por_partido
WHERE total_parlamentares >= 5
ORDER BY media_score DESC;
```

---

## Índices

Índices aceleram consultas, mas têm custo em escrita. Crie apenas onde necessário.

### Quando criar um índice?
- Em colunas usadas frequentemente em `WHERE`, `JOIN`, `ORDER BY`
- Em chaves estrangeiras (o Postgres **não** cria automaticamente)
- Em colunas com alta cardinalidade (muitos valores distintos)

### Criando índices no projeto

```sql
-- Chaves estrangeiras (sempre indexar)
CREATE INDEX idx_discurso_parlamentar  ON discurso(parlamentar_id);
CREATE INDEX idx_voto_parlamentar      ON voto(parlamentar_id);
CREATE INDEX idx_voto_votacao          ON voto(votacao_id);
CREATE INDEX idx_score_parlamentar     ON score_coerencia(parlamentar_id);
CREATE INDEX idx_votacao_proposicao    ON votacao(proposicao_id);

-- Filtros comuns
CREATE INDEX idx_parlamentar_partido   ON parlamentar(sigla_partido);
CREATE INDEX idx_parlamentar_uf        ON parlamentar(sigla_uf);
CREATE INDEX idx_discurso_data         ON discurso(data_hora);
CREATE INDEX idx_votacao_data          ON votacao(data_hora);

-- Índice em JSONB (para campos consultados com frequência)
CREATE INDEX idx_parlamentar_api_nome  ON parlamentar USING gin(dados_api);
```

### Índice de texto completo (Full-Text Search)

Para buscas em discursos por palavras-chave:

```sql
-- Adicionar coluna de busca
ALTER TABLE discurso ADD COLUMN busca_tsv TSVECTOR;

-- Preencher com vetores de busca (português)
UPDATE discurso
SET busca_tsv = to_tsvector('portuguese', coalesce(sumario, '') || ' ' || coalesce(transcricao, ''));

-- Criar índice GIN (eficiente para full-text)
CREATE INDEX idx_discurso_busca ON discurso USING gin(busca_tsv);

-- Consultar
SELECT sumario FROM discurso
WHERE busca_tsv @@ to_tsquery('portuguese', 'saúde & reforma');
```

---

## Transações

Transações garantem que operações relacionadas sejam executadas juntas ou não sejam executadas.

### Estrutura básica

```sql
BEGIN;

    -- Inserir discurso
    INSERT INTO discurso (id, parlamentar_id, data_hora, sumario)
    VALUES (gen_random_uuid(), 'uuid-parlamentar', now(), 'Discurso sobre saúde');

    -- Inserir score calculado
    INSERT INTO score_coerencia (parlamentar_id, score, modelo_usado)
    VALUES ('uuid-parlamentar', 87.5, 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2');

COMMIT;  -- confirma tudo
-- ou ROLLBACK; para desfazer tudo em caso de erro
```

### Em Python com SQLAlchemy (FastAPI)

```python
from sqlalchemy.orm import Session

def salvar_analise(db: Session, discurso_data, score_data):
    try:
        discurso = Discurso(**discurso_data)
        db.add(discurso)
        db.flush()  # envia ao banco sem commitar (obtém o ID)

        score = ScoreCoerencia(discurso_id=discurso.id, **score_data)
        db.add(score)

        db.commit()  # confirma tudo
    except Exception as e:
        db.rollback()  # desfaz em caso de erro
        raise e
```

---

## Boas práticas gerais

### Nomenclatura

```sql
-- ✅ Recomendado: snake_case, nomes em português ou inglês (consistente)
CREATE TABLE score_coerencia (...)
CREATE INDEX idx_voto_parlamentar ON voto(parlamentar_id);

-- ❌ Evitar: camelCase, nomes genéricos
CREATE TABLE ScoreCoerencia (...)
CREATE TABLE tabela1 (...)
```

### Sempre use `NOT NULL` quando o campo for obrigatório

```sql
-- ✅
nome_civil TEXT NOT NULL,

-- ❌ Permite nulos acidentais
nome_civil TEXT,
```

### Use `DEFAULT now()` para timestamps de auditoria

```sql
criado_em    TIMESTAMPTZ DEFAULT now(),
atualizado_em TIMESTAMPTZ DEFAULT now()
```

### Evite `SELECT *` em produção

```sql
-- ❌ Seleciona tudo, pode trazer dados desnecessários
SELECT * FROM parlamentar;

-- ✅ Seleciona apenas o necessário
SELECT id, nome_civil, sigla_partido FROM parlamentar;
```

### Use `EXPLAIN ANALYZE` para diagnosticar performance

```sql
EXPLAIN ANALYZE
SELECT p.nome_civil, sc.score
FROM score_coerencia sc
JOIN parlamentar p ON p.id = sc.parlamentar_id
WHERE sc.score > 80;
```

Isso mostra o plano de execução da query e o tempo real gasto — útil para identificar quando um índice está faltando.

---

## Migrations com Alembic (FastAPI + SQLAlchemy)

O projeto usa FastAPI com SQLAlchemy. A ferramenta padrão para gerenciar mudanças no schema é o **Alembic**.

```bash
# Instalar
pip install alembic

# Inicializar na pasta do projeto
alembic init alembic

# Gerar migration automática após alterar os models
alembic revision --autogenerate -m "cria tabela parlamentar"

# Aplicar migrations
alembic upgrade head

# Ver histórico
alembic history

# Reverter última migration
alembic downgrade -1
```

> 💡 Nunca altere o banco manualmente em produção. Use sempre migrations para manter o histórico de mudanças no schema versionado junto ao código.

---

## Checklist de boas práticas para o projeto

- [ ] Todas as PKs usam UUID
- [ ] Todas as chaves estrangeiras têm índice
- [ ] Campos obrigatórios têm `NOT NULL`
- [ ] Timestamps usam `TIMESTAMPTZ`
- [ ] Mutations críticas usam transações
- [ ] Queries frequentes têm índices adequados
- [ ] Schema gerenciado via Alembic (migrations versionadas)
- [ ] `SELECT *` evitado em queries da aplicação
