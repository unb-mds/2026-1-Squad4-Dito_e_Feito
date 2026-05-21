# 01 — Introdução ao PostgreSQL

## O que é o PostgreSQL?

PostgreSQL (ou simplesmente "Postgres") é um sistema de gerenciamento de banco de dados relacional (SGBDR) **open source**, conhecido por ser robusto, extensível e altamente compatível com o padrão SQL. Ele existe desde 1986 e é amplamente utilizado em sistemas de produção no mundo todo.

Diferente de bancos mais simples como o SQLite, o PostgreSQL é projetado para ambientes **multiusuário**, **concorrentes** e com **grandes volumes de dados** — exatamente o que o projeto Dito e Feito pode exigir ao consumir APIs públicas de forma contínua.

---

## Postgres vs outros bancos relacionais

| Característica | PostgreSQL | MySQL | SQLite |
|---|---|---|---|
| Open source | ✅ | ✅ (parcial) | ✅ |
| Multiusuário | ✅ | ✅ | ❌ |
| Suporte a JSONB | ✅ nativo | Limitado | ❌ |
| Extensível (funções, tipos) | ✅ muito | Moderado | ❌ |
| Transações ACID | ✅ completo | ✅ | ✅ |
| Ideal para produção | ✅ | ✅ | ❌ (local/dev) |
| Curva de aprendizado | Média | Baixa | Muito baixa |

### Por que usamos PostgreSQL no Dito e Feito?

- **JSONB**: dados das APIs externas (Câmara dos Deputados, por ex.) chegam em JSON. O Postgres permite armazenar e **consultar campos dentro de JSON** nativamente.
- **Texto avançado**: suporte a `tsvector` e `tsquery` para buscas textuais — útil para buscar discursos.
- **Integridade referencial robusta**: chaves estrangeiras com `ON DELETE CASCADE`, `DEFERRABLE`, etc.
- **Compatibilidade com ORMs**: SQLAlchemy (usado com FastAPI) tem suporte excelente ao Postgres.
- **Confiabilidade**: amplamente adotado em sistemas de dados governamentais e acadêmicos.

---

## Conceitos fundamentais

### Banco de dados vs Schema vs Tabela

```
Servidor PostgreSQL
└── Banco de dados: dito_e_feito
    └── Schema: public  (padrão)
        ├── Tabela: parlamentar
        ├── Tabela: discurso
        ├── Tabela: votacao
        └── Tabela: score_coerencia
```

- **Banco de dados**: o container principal, isolado dos demais.
- **Schema**: uma camada lógica dentro do banco. O schema `public` é o padrão. Podemos criar schemas separados (ex: `api`, `nlp`, `relatorios`) para organizar melhor.
- **Tabela**: onde os dados ficam de fato.

### Transações e ACID

O Postgres garante as propriedades **ACID**:

| Propriedade | Significado |
|---|---|
| **A**tomicidade | Tudo ou nada — se uma parte falha, tudo é revertido |
| **C**onsistência | Os dados sempre ficam em estado válido |
| **I**solamento | Transações concorrentes não interferem entre si |
| **D**urabilidade | Dados confirmados (`COMMIT`) não são perdidos |

Exemplo prático no projeto: ao salvar um discurso junto com o score de coerência gerado pela IA, se o score falhar, o discurso também não é salvo — evitando dados inconsistentes.

### Chaves primárias e estrangeiras

```sql
-- Chave primária: identifica unicamente cada registro
CREATE TABLE parlamentar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL
);

-- Chave estrangeira: vincula discurso ao parlamentar
CREATE TABLE discurso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parlamentar_id UUID REFERENCES parlamentar(id) ON DELETE CASCADE,
    texto TEXT NOT NULL
);
```

- `ON DELETE CASCADE`: se o parlamentar for deletado, seus discursos também são.
- `ON DELETE RESTRICT`: impede deletar o parlamentar se ele tiver discursos.

---

## Instalação (referência rápida)

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### macOS (Homebrew)
```bash
brew install postgresql
brew services start postgresql
```

### Windows
Baixar o instalador em: https://www.postgresql.org/download/windows/

### Via Docker (recomendado para desenvolvimento)
```bash
docker run --name dito-e-feito-db \
  -e POSTGRES_PASSWORD=senha123 \
  -e POSTGRES_DB=dito_e_feito \
  -p 5432:5432 \
  -d postgres:15
```

> 💡 **Dica**: usar Docker evita conflitos de versão e facilita o setup para toda a equipe.

---

## Acessando o banco via terminal

```bash
# Entrar no cliente psql
psql -U postgres

# Conectar em um banco específico
psql -U postgres -d dito_e_feito

# Comandos úteis dentro do psql
\l          -- listar bancos de dados
\c nome_db  -- conectar em um banco
\dt         -- listar tabelas
\d tabela   -- descrever estrutura de uma tabela
\q          -- sair
```

---

## Ferramentas gráficas recomendadas

| Ferramenta | Descrição |
|---|---|
| **pgAdmin 4** | Interface web oficial, completa |
| **DBeaver** | Multi-banco, muito popular, gratuito |
| **TablePlus** | Interface limpa, macOS/Windows |
| **DataGrip** | JetBrains, pago (gratuito para estudantes) |