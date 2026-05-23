# 🔌 Guia de Conexão ao Banco de Dados

> Este documento explica como qualquer membro do time **Dito e Feito** pode se conectar ao banco de dados PostgreSQL hospedado no Supabase.

---

## Informações do Banco

| Campo | Valor |
|---|---|
| **Plataforma** | Supabase |
| **Banco** | PostgreSQL 15 |
| **Host** | `db.szjbimreoiehjitzatda.supabase.co` |
| **Porta** | `5432` |
| **Database** | `postgres` |
| **Usuário** | `postgres` |
| **Senha** | ⚠️ Solicitar ao responsável do banco |

> 🔒 **Nunca compartilhe a senha em arquivos commitados no repositório. Use sempre variáveis de ambiente.**

---

## String de Conexão

```
postgresql://postgres:[SENHA]@db.szjbimreoiehjitzatda.supabase.co:5432/postgres
```

Substitua `[SENHA]` pela senha fornecida pelo responsável do banco de dados.

---

## Como conectar por contexto

### 🐍 Python puro (psycopg2)

Usado pelo Gustavo no Colab para salvar resultados da IA.

```python
import psycopg2
import os

conn = psycopg2.connect(os.environ["DATABASE_URL"])
cursor = conn.cursor()

# Exemplo: inserir um parlamentar
cursor.execute("""
    INSERT INTO parlamentar (id_externo, nome_civil, sigla_partido, sigla_uf)
    VALUES (%s, %s, %s, %s)
    ON CONFLICT (id_externo) DO NOTHING
""", (12345, "Nome do Parlamentar", "PT", "SP"))

conn.commit()
cursor.close()
conn.close()
```

---

### ⚡ FastAPI com SQLAlchemy

Usado pelo Gustavo no backend.

**1. Instalar dependências:**
```bash
pip install sqlalchemy psycopg2-binary python-dotenv
```

**2. Criar arquivo `.env` na raiz do projeto:**
```
DATABASE_URL=postgresql://postgres:[SENHA]@db.szjbimreoiehjitzatda.supabase.co:5432/postgres
```

**3. Configurar a conexão no FastAPI:**
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

engine = create_engine(os.environ["DATABASE_URL"])
SessionLocal = sessionmaker(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

### 📓 Google Colab (IA/NLP)

Usado pelo Gustavo para conectar os experimentos de NLP ao banco.

```python
import psycopg2
from google.colab import userdata

# No Colab, salvar a senha em: Secrets (ícone de chave no menu lateral)
# Nome do secret: DATABASE_URL

DATABASE_URL = userdata.get('DATABASE_URL')
conn = psycopg2.connect(DATABASE_URL)
print("Conexão estabelecida com sucesso!")
```

> 💡 No Google Colab use a aba **Secrets** (ícone de chave 🔑 no menu esquerdo) para guardar a URL de conexão com segurança, sem expor no código.

---

### 🖥️ pgAdmin 4 (local)

Para visualizar e gerenciar o banco graficamente.

1. Abre o pgAdmin 4
2. Clica com botão direito em **Servers → Register → Server**
3. Preenche as informações:

| Campo | Valor |
|---|---|
| Name | `Dito e Feito - Supabase` |
| Host | `db.szjbimreoiehjitzatda.supabase.co` |
| Port | `5432` |
| Database | `postgres` |
| Username | `postgres` |
| Password | *(solicitar ao responsável)* |

4. Clica em **Save** e conecta.

---

## Tabelas disponíveis

| Tabela | Descrição |
|---|---|
| `parlamentar` | Dados dos deputados e senadores |
| `discurso` | Pronunciamentos com embeddings (pgvector) |
| `proposicao` | Projetos de lei e proposições |
| `votacao` | Sessões de votação com embeddings da ementa |
| `voto` | Voto individual de cada parlamentar |
| `score_coerencia` | Scores calculados pela IA/NLP |

---

## Boas práticas de segurança

- ✅ Sempre use variáveis de ambiente para a senha
- ✅ Adicione `.env` no `.gitignore` do projeto
- ✅ No Colab use a aba **Secrets** para guardar credenciais
- ❌ Nunca commite senha, token ou string de conexão no código
- ❌ Nunca compartilhe a string de conexão em canais públicos (issues, PRs, Discord)

---

## Responsável pelo banco

| Nome | GitHub | Função |
|---|---|---|
| Indiano | @seu-github | Banco de Dados / Scrum Master |

> Dúvidas sobre o schema ou acesso ao banco? Abre uma issue com a label `database` ou chama diretamente no grupo. 🐘