# 🔄 Migrations com Alembic

> Este documento explica como gerenciar as mudanças no schema do banco de dados do projeto **Dito e Feito** usando o Alembic — a ferramenta padrão de migrations para projetos FastAPI com SQLAlchemy.

---

## O que é o Alembic?

O Alembic é uma ferramenta de **versionamento de schema** para bancos de dados. Ele funciona como um "git para o banco" — registra cada mudança feita nas tabelas e permite aplicar ou reverter essas mudanças de forma controlada.

### Por que usar?

Sem Alembic:
- Cada membro do time altera o banco manualmente
- Ninguém sabe o que foi alterado e quando
- Impossível reverter uma mudança errada

Com Alembic:
- Toda mudança no banco é registrada como um arquivo versionado
- Qualquer membro do time aplica as mudanças com um único comando
- Dá para reverter qualquer alteração com segurança

---

## Instalação

```bash
pip install alembic sqlalchemy psycopg2-binary python-dotenv
```

---

## Configuração inicial (feita uma única vez)

### 1. Inicializar o Alembic na pasta do projeto

```bash
cd seu-projeto-backend
alembic init alembic
```

Isso cria a seguinte estrutura:

```
seu-projeto-backend/
├── alembic/
│   ├── versions/          ← arquivos de migration ficam aqui
│   ├── env.py             ← configuração do Alembic
│   └── script.py.mako     ← template de migration
└── alembic.ini            ← configuração geral
```

### 2. Configurar o arquivo `alembic.ini`

Abre o `alembic.ini` e deixa a linha de conexão assim:

```ini
sqlalchemy.url = postgresql://postgres:[SENHA]@db.szjbimreoiehjitzatda.supabase.co:5432/postgres
```

> 💡 Melhor ainda: use variável de ambiente para não expor a senha.

### 3. Configurar o `env.py` com variável de ambiente

Abre o arquivo `alembic/env.py` e substitui a linha da URL por:

```python
import os
from dotenv import load_dotenv

load_dotenv()

config.set_main_option("sqlalchemy.url", os.environ["DATABASE_URL"])
```

---

## Comandos do dia a dia

### Criar uma nova migration

Depois de alterar um model do SQLAlchemy:

```bash
# Geração automática (detecta as mudanças nos models)
alembic revision --autogenerate -m "descricao da mudanca"

# Exemplos de mensagens
alembic revision --autogenerate -m "cria tabela parlamentar"
alembic revision --autogenerate -m "adiciona campo embedding em discurso"
alembic revision --autogenerate -m "adiciona status_coerencia em score_coerencia"
```

### Aplicar migrations pendentes

```bash
# Aplica todas as migrations pendentes
alembic upgrade head

# Aplica apenas a próxima migration
alembic upgrade +1
```

### Reverter migrations

```bash
# Reverte a última migration
alembic downgrade -1

# Reverte todas as migrations
alembic downgrade base
```

### Ver histórico de migrations

```bash
alembic history
```

### Ver qual migration está aplicada atualmente

```bash
alembic current
```

---

## Fluxo de trabalho da equipe

Sempre que o schema do banco mudar, seguir esse fluxo:

```
1. Alterar o model no SQLAlchemy (arquivo models.py)
        ↓
2. Gerar a migration
   alembic revision --autogenerate -m "descricao"
        ↓
3. Revisar o arquivo gerado em alembic/versions/
        ↓
4. Aplicar no banco
   alembic upgrade head
        ↓
5. Commitar o arquivo de migration junto com o código
   git add alembic/versions/
   git commit -m "feat(db): adiciona migration para [descricao]"
```

> ⚠️ **Nunca altere o banco diretamente** pelo Supabase ou pgAdmin sem criar uma migration correspondente. Isso quebra o histórico de versões.

---

## Exemplo prático — adicionando um campo novo

Cenário: precisamos adicionar o campo `legislatura` na tabela `parlamentar`.

**Passo 1** — Alterar o model:

```python
# models.py
class Parlamentar(Base):
    __tablename__ = "parlamentar"

    id = Column(UUID, primary_key=True, default=uuid4)
    nome_civil = Column(Text, nullable=False)
    sigla_partido = Column(String(15))
    sigla_uf = Column(String(2))
    legislatura = Column(Integer)  # ← campo novo
```

**Passo 2** — Gerar a migration:

```bash
alembic revision --autogenerate -m "adiciona legislatura em parlamentar"
```

**Passo 3** — Arquivo gerado automaticamente em `alembic/versions/`:

```python
def upgrade() -> None:
    op.add_column('parlamentar', sa.Column('legislatura', sa.Integer(), nullable=True))

def downgrade() -> None:
    op.drop_column('parlamentar', 'legislatura')
```

**Passo 4** — Aplicar:

```bash
alembic upgrade head
```

---

## Migrations já aplicadas no projeto

| Migration | Descrição | Sprint |
|---|---|---|
| `schema_inicial` | Criação das 6 tabelas principais | Sprint 03 |
| `add_pgvector` | Suporte a embeddings com pgvector | Sprint 05 |
| `add_status_coerencia` | Campo de classificação da IA | Sprint 05 |

> 📝 Atualize esta tabela sempre que uma nova migration for aplicada.

---

## Responsável

Dúvidas sobre migrations? Fala com o responsável pelo banco de dados:

| Nome | GitHub | Função |
|---|---|---|
| Indiano | @seu-github | Banco de Dados / Scrum Master |