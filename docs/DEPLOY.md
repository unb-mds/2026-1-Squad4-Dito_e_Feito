# 🚀 Guia de Deploy — Dito e Feito

Este guia ensina como colocar o projeto **Dito e Feito** em produção usando **Render** (backend) e **Vercel** (frontend).

---

## Pré-requisitos

Antes de começar, você precisa ter acesso às seguintes chaves/credenciais:

| Serviço | Onde obter | Variável |
|---|---|---|
| **Supabase** | [supabase.com](https://supabase.com) → Seu projeto → Settings → Database | `DATABASE_URL` |
| **Groq** | [console.groq.com](https://console.groq.com) → API Keys | `GROQ_API_KEY` |
| **OpenRouter** | [openrouter.ai](https://openrouter.ai) → Keys | `OPENROUTER_API_KEY` |

---

## 1. Deploy do Backend no Render

### 1.1 Criar o serviço

1. Acesse [render.com](https://render.com) e faça login
2. Clique em **New → Web Service**
3. Conecte seu repositório GitHub (`unb-mds/2026-1-Squad4-Dito_e_Feito`)
4. Configure o serviço:

| Campo | Valor |
|---|---|
| **Name** | `dito-e-feito-backend` |
| **Region** | `Ohio (US East)` ou qualquer disponível |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Docker` |
| **Dockerfile Path** | `./Dockerfile` |

> O Render vai usar o `CMD` do Dockerfile (`gunicorn -b 0.0.0.0:5001 api:app`) automaticamente.

### 1.2 Configurar as Variáveis de Ambiente

No painel do Render, vá em **Environment → Add Environment Variable** e adicione:

```
DATABASE_URL   = postgresql://postgres:SUA_SENHA@db.SEU_PROJETO.supabase.co:5432/postgres
GROQ_API_KEY   = gsk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
OPENROUTER_API_KEY = sk-or-v1-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FRONTEND_URL   = https://dito-e-feito.vercel.app
```

> ⚠️ **NUNCA** coloque as chaves reais no código ou no repositório. Use sempre o painel de variáveis de ambiente do Render.
> 
> 💡 `FRONTEND_URL` é usada pelo backend para configurar o CORS. Adicione a URL exata da Vercel após o deploy do frontend.

### 1.3 Como obter a DATABASE_URL do Supabase

1. Acesse [supabase.com](https://supabase.com) e abra seu projeto
2. Vá em **Settings → Database**
3. Copie a **Connection String** no formato `postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJETO].supabase.co:5432/postgres`
4. Substitua `[SUA-SENHA]` pela senha do banco

### 1.4 Deploy

Clique em **Create Web Service**. O Render vai:
1. Fazer o build do Docker
2. Iniciar o Gunicorn na porta 5001
3. Fornecer uma URL pública como `https://dito-e-feito-backend.onrender.com`

**Guarde essa URL — você vai precisar dela para o frontend.**

---

## 2. Deploy do Frontend na Vercel

### 2.1 Criar o projeto

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **New Project**
3. Importe o repositório `unb-mds/2026-1-Squad4-Dito_e_Feito`
4. Configure o projeto:

| Campo | Valor |
|---|---|
| **Framework Preset** | `Vite` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 2.2 Configurar a URL do Backend

O frontend precisa saber onde está o backend em produção. Adicione a variável de ambiente na Vercel:

1. Vá em **Settings → Environment Variables**
2. Adicione:

```
VITE_API_URL = https://dito-e-feito-backend.onrender.com
```

> ⚠️ Em seguida, verifique se o arquivo `frontend/src/services/api.js` usa `import.meta.env.VITE_API_URL` como base URL. Se ainda estiver hardcoded para `localhost:5001`, será necessário ajustar.

### 2.3 Deploy

Clique em **Deploy**. A Vercel vai:
1. Instalar as dependências (`npm install`)
2. Gerar o build de produção (`npm run build`)
3. Publicar em uma URL como `https://dito-e-feito.vercel.app`

---

## 3. Desenvolvimento Local vs. Produção

| | Local (Docker) | Produção |
|---|---|---|
| **Servidor backend** | `python api.py` (Flask dev) | `gunicorn` (WSGI) |
| **Variáveis de ambiente** | `backend/.env` | Painel do Render |
| **URL do backend** | `http://localhost:5001` | `https://seu-app.onrender.com` |
| **URL do frontend** | `http://localhost:5173` | `https://seu-app.vercel.app` |

### Sobrescrever o CMD para desenvolvimento local

Como o Dockerfile agora usa `gunicorn` por padrão, para continuar usando o servidor de desenvolvimento Flask localmente, adicione a linha `command` no `docker-compose.yml`:

```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: python api.py  # Sobrescreve o CMD do Dockerfile para dev local
    ports:
      - "5001:5001"
    ...
```

---

## 4. Checklist de Deploy

- [ ] `DATABASE_URL` configurada no Render
- [ ] `GROQ_API_KEY` configurada no Render
- [ ] `OPENROUTER_API_KEY` configurada no Render
- [ ] `FRONTEND_URL` configurada no Render (URL da Vercel, ex: `https://dito-e-feito.vercel.app`)
- [ ] `VITE_API_URL` configurada na Vercel apontando para o backend do Render
- [ ] CORS configurado automaticamente via `FRONTEND_URL` (já implementado em `api.py`)
- [ ] Testar o endpoint `GET /api/health` após o deploy do backend
- [ ] Testar o frontend acessando a URL da Vercel

---

## 5. Verificar o CORS em produção

O CORS já está configurado dinamicamente em `backend/api.py` via variável de ambiente.
Basta adicionar a variável `FRONTEND_URL` no painel do Render com a URL exata do frontend na Vercel:

```
FRONTEND_URL = https://dito-e-feito.vercel.app
```

O código em `api.py` lê automaticamente essa variável e a adiciona às origens permitidas:

```python
_FRONTEND_URL = os.environ.get("FRONTEND_URL", "")
_CORS_ORIGINS = ["http://localhost:5173", "http://localhost:5174"]
if _FRONTEND_URL:
    _CORS_ORIGINS.append(_FRONTEND_URL)

CORS(app, origins=_CORS_ORIGINS)
```

> ⚠️ Se o frontend da Vercel tiver uma URL diferente (ex: com subdomínio de preview), adicione também como variável de ambiente separada ou use um wildcard.
