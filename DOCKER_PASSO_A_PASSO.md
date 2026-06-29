# 🐳 Guia de Conteinerização com Docker — Dito e Feito

Sim, é **100% possível e altamente recomendado** conteinerizar o projeto **Dito e Feito**. A conteinerização garante paridade entre ambientes (desenvolvimento e produção), elimina problemas de "na minha máquina funciona" e simplifica o deploy.

Este guia fornece o passo a passo completo, com a estrutura de arquivos e configurações necessárias para rodar o **Backend Flask** e o **Frontend React** em containers integrados via **Docker Compose**.

---

## 🏗️ Como vai funcionar?

Teremos dois containers principais rodando simultaneamente:
1. **`backend`**: Container Python executando o Flask na porta `5001`. Consome as variáveis de ambiente do arquivo `.env` para se conectar ao banco de dados no Supabase e às APIs de LLM (Groq/OpenRouter).
2. **`frontend`**: Container Node.js servindo a aplicação React. Apresentamos duas configurações:
   * **Ambiente de Desenvolvimento (Dev)**: Roda o servidor Vite com *Hot Module Replacement* (HMR), refletindo alterações do código local no container instantaneamente.
   * **Ambiente de Produção (Prod)**: Compila o frontend e serve os arquivos estáticos usando uma imagem leve do **Nginx**.

---

## 📝 Passo a Passo da Implementação

Para implementar a conteinerização, você precisará criar **5 arquivos** no repositório. Siga as instruções abaixo para criá-los nas pastas corretas.

---

### Passo 1: Configurar o Backend

Crie o arquivo [backend/Dockerfile](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/backend/Dockerfile) para definir como a imagem do Flask será construída.

#### 1.1 Criar o arquivo `backend/Dockerfile`
```dockerfile
# Imagem base leve do Python
FROM python:3.10-slim

# Evita que o Python escreva arquivos .pyc no disco
ENV PYTHONDONTWRITEBYTECODE=1
# Evita que o Python faça buffer das saídas de log (mostra em tempo real no console)
ENV PYTHONUNBUFFERED=1

# Define o diretório de trabalho
WORKDIR /app

# Instala dependências de sistema necessárias para compilar bibliotecas C (como psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copia e instala as dependências do Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código-fonte do backend
COPY . .

# Expõe a porta da API Flask
EXPOSE 5001

# Comando para rodar a aplicação em desenvolvimento
CMD ["python", "api.py"]
```

#### 1.2 Criar o arquivo `backend/.dockerignore`
Crie o arquivo [backend/.dockerignore](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/backend/.dockerignore) para evitar copiar arquivos desnecessários ou sensíveis para dentro da imagem.
```text
venv/
.env
__pycache__/
*.pyc
*.pyo
*.pyd
.db
*.json
.git
.gitignore
```

---

### Passo 2: Configurar o Frontend

Crie o Dockerfile do frontend. Vamos utilizar uma estratégia **Multi-stage** (Múltiplas etapas) para suportar tanto o modo de desenvolvimento rápido quanto a geração de build de produção otimizada com Nginx.

#### 2.1 Criar o arquivo `frontend/Dockerfile`
Crie o arquivo [frontend/Dockerfile](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/frontend/Dockerfile).
```dockerfile
# --- ESTÁGIO 1: Base de desenvolvimento ---
FROM node:18-alpine AS dev-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# Roda o Vite expondo a rede externa para aceitar conexões fora do container
CMD ["npm", "run", "dev", "--", "--host"]

# --- ESTÁGIO 2: Build de produção ---
FROM node:18-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- ESTÁGIO 3: Servidor de produção com Nginx ---
FROM nginx:stable-alpine AS prod-stage
# Copia o build estático do Vite para a pasta de arquivos públicos do Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copia uma configuração customizada do Nginx se necessário (opcional)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2.2 Criar o arquivo `frontend/.dockerignore`
Crie o arquivo [frontend/.dockerignore](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/frontend/.dockerignore).
```text
node_modules/
dist/
.env
.git
.gitignore
README.md
```

---

### Passo 3: Criar o Orquestrador Docker Compose

Crie o arquivo [docker-compose.yml](file:///c:/Users/DELL/Desktop/Metodos%20de%20DS/2026-1-Squad4-Dito_e_Feito/docker-compose.yml) na **raiz do projeto** para unir e gerenciar a inicialização conjunta de ambos os serviços.

```yaml
version: '3.8'

services:
  # --- BACKEND (Flask API) ---
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: dito_efeito_backend
    ports:
      - "5001:5001"
    env_file:
      - ./backend/.env
    volumes:
      # Sincroniza o código local com o container para refletir alterações sem reconstruir
      - ./backend:/app
      # Protege a pasta de dependências do container contra sobreposição local
      - /app/venv
      # Cria um volume persistente para o cache de modelos do Hugging Face (BERTimbau)
      - hf_cache:/root/.cache/huggingface
    restart: always

  # --- FRONTEND (React Dev Server) ---
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: dev-stage # Executa no estágio de desenvolvimento
    container_name: dito_efeito_frontend
    ports:
      - "5173:5173"
    volumes:
      # Sincroniza o código do front para HMR (Hot Module Replacement)
      - ./frontend:/app
      # Evita que a node_modules local apague a node_modules do container
      - /app/node_modules
    depends_on:
      - backend
    restart: always

volumes:
  hf_cache:
```

---

## 🚀 Como Executar o Projeto Conteinerizado

Com os arquivos criados, siga estes comandos no seu terminal na raiz do repositório:

1. **Construir as imagens dos containers**:
   ```bash
   docker compose build
   ```

2. **Iniciar a aplicação**:
   ```bash
   docker compose up
   ```
   *Nota: Adicione a tag `-d` se preferir rodar em segundo plano (`docker compose up -d`).*

3. **Acessar as aplicações**:
   * **Frontend (React)**: acesse [http://localhost:5173](http://localhost:5173) no navegador.
   * **Backend (API)**: acesse [http://localhost:5001/api/health](http://localhost:5001/api/health) para validar a saúde da API.

4. **Verificar os logs de execução**:
   ```bash
   docker compose logs -f
   ```

5. **Parar a execução**:
   ```bash
   docker compose down
   ```

---

## 💡 Gotchas e Dicas de Manutenção para IAs

* **Vite Host**: No Docker, o servidor Vite precisa rodar com a flag `--host`. Caso contrário, ele escuta apenas em `localhost` dentro do container e o tráfego mapeado da sua máquina hospedeira não conseguirá alcançá-lo. Já incluímos isso no script de inicialização do Dockerfile do frontend.
* **Volume Cache Hugging Face**: O modelo BERTimbau local (`neuralmind/bert-base-portuguese-cased`) faz download de mais de 400MB de pesos de rede neural. O mapeamento do volume `hf_cache:/root/.cache/huggingface` impede que o download seja refeito a cada reconstrução ou reinicialização do container backend, acelerando o tempo de boot.
* **Carregamento de Variáveis de Ambiente**: O Docker Compose utiliza a diretiva `env_file: - ./backend/.env` para ler as variáveis de ambiente locais do seu backend e passá-las ao container de maneira transparente. Garanta que o arquivo `backend/.env` esteja configurado localmente.
