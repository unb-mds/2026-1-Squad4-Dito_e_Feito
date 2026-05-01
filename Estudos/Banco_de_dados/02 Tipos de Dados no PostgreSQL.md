# 02 — Tipos de Dados no PostgreSQL

O PostgreSQL oferece um conjunto rico de tipos nativos. Aqui estão os mais relevantes para o projeto **Dito e Feito**, com exemplos práticos de uso.

---

## Tipos de texto

### `TEXT`
Armazena strings de tamanho ilimitado. Ideal para conteúdo de discursos.

```sql
texto_discurso TEXT NOT NULL,
ementa         TEXT,
justificativa  TEXT
```

> ✅ No Postgres, `TEXT` é tão eficiente quanto `VARCHAR(n)`. Prefira `TEXT` quando não há limite fixo de caracteres.

### `VARCHAR(n)`
Texto com limite máximo de `n` caracteres. Use quando o limite for uma regra de negócio.

```sql
sigla_partido  VARCHAR(10),  -- ex: "PT", "PL", "PSDB"
sigla_uf       VARCHAR(2)    -- ex: "SP", "RJ"
```

---

## Tipos numéricos

| Tipo | Uso | Exemplo |
|---|---|---|
| `INTEGER` | Números inteiros comuns | ano do mandato, número do PLV |
| `BIGINT` | Inteiros grandes | IDs vindos de APIs externas |
| `NUMERIC(p, s)` | Precisão exata (financeiro/scores) | score de coerência: `NUMERIC(5,2)` |
| `FLOAT` / `REAL` | Ponto flutuante | similaridade semântica do NLP |

```sql
-- Score gerado pela IA: valor entre 0.00 e 100.00
score NUMERIC(5, 2) CHECK (score >= 0 AND score <= 100),

-- Similaridade coseno retornada pelo modelo NLP: entre -1.0 e 1.0
similaridade FLOAT
```

---

## Tipos de data e hora

| Tipo | Descrição | Exemplo |
|---|---|---|
| `DATE` | Apenas data | `2024-03-15` |
| `TIMESTAMP` | Data + hora, sem fuso | `2024-03-15 14:30:00` |
| `TIMESTAMPTZ` | Data + hora **com fuso** (recomendado) | `2024-03-15 14:30:00-03` |

> 💡 **Sempre use `TIMESTAMPTZ`** em sistemas que podem ter usuários em fusos diferentes ou que consomem APIs com timestamps internacionais. O Postgres armazena internamente em UTC e converte para o fuso configurado na sessão.

```sql
data_discurso   TIMESTAMPTZ NOT NULL,
data_votacao    TIMESTAMPTZ NOT NULL,
criado_em       TIMESTAMPTZ DEFAULT now(),
atualizado_em   TIMESTAMPTZ DEFAULT now()
```

---

## UUID

Identificador único universal. Muito usado como chave primária em sistemas modernos.

**Vantagens sobre `SERIAL` (auto-increment):**
- Não expõe sequência de registros na URL/API
- Pode ser gerado no frontend antes de enviar ao banco
- Evita conflitos em sistemas distribuídos

```sql
-- Habilitar extensão (uma vez por banco)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Uso como chave primária
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

---

## JSONB

Tipo nativo do Postgres para armazenar JSON de forma **binária e indexável**. É diferente do tipo `JSON` simples:

| Tipo | Armazenamento | Indexável | Performance de leitura |
|---|---|---|---|
| `JSON` | Texto puro | ❌ | Mais lento (re-parseia) |
| `JSONB` | Binário | ✅ | Mais rápido |

> ✅ **Use sempre `JSONB`**, exceto quando precisar preservar a ordem das chaves ou espaços em branco do JSON original.

### Por que é útil no Dito e Feito?

As APIs públicas (como a da Câmara dos Deputados) retornam dados em JSON com estrutura variável. Com JSONB, podemos armazenar a resposta bruta e depois consultar campos específicos.

```sql
-- Armazenar resposta bruta da API
dados_api JSONB,

-- Consultar campo dentro do JSON
SELECT dados_api->>'nomeCivil' FROM parlamentar;

-- Filtrar por campo interno
SELECT * FROM votacao WHERE dados_api->>'resultado' = 'Sim';

-- Verificar se campo existe
SELECT * FROM discurso WHERE dados_api ? 'sumario';
```

---

## ENUM (tipos enumerados)

Para campos com conjunto fixo de valores, como o resultado de uma votação.

```sql
-- Criar o tipo enum
CREATE TYPE resultado_voto AS ENUM ('Sim', 'Não', 'Abstenção', 'Obstrução', 'Art. 17');

-- Usar na tabela
resultado resultado_voto NOT NULL
```

**Vantagem:** garante integridade dos dados no nível do banco, sem depender só da aplicação.

---

## BOOLEAN

```sql
ativo    BOOLEAN DEFAULT true,
validado BOOLEAN DEFAULT false
```

---

## ARRAY

O Postgres suporta colunas do tipo array nativamente.

```sql
-- Array de palavras-chave extraídas por NLP
palavras_chave TEXT[],

-- Inserir
INSERT INTO discurso (palavras_chave) VALUES (ARRAY['saúde', 'reforma', 'sus']);

-- Consultar discursos que contêm uma palavra-chave
SELECT * FROM discurso WHERE 'saúde' = ANY(palavras_chave);
```

---

## Resumo — Tipos usados no projeto

| Campo | Tipo recomendado | Motivo |
|---|---|---|
| IDs internos | `UUID` | Segurança e distribuição |
| IDs de APIs externas | `BIGINT` ou `TEXT` | APIs usam IDs numéricos grandes |
| Nome, partido, UF | `TEXT` / `VARCHAR` | Texto simples |
| Texto do discurso | `TEXT` | Sem limite fixo |
| Datas e horas | `TIMESTAMPTZ` | Com fuso horário |
| Score de coerência | `NUMERIC(5,2)` | Precisão necessária |
| Similaridade NLP | `FLOAT` | Valor contínuo |
| Resultado da votação | `ENUM` | Conjunto fixo de valores |
| Dados brutos da API | `JSONB` | Estrutura variável, indexável |
| Tags / palavras-chave | `TEXT[]` | Lista simples |