# --- ESTÁGIO 1: Base de desenvolvimento ---
FROM node:22-alpine AS dev-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# Roda o Vite expondo a rede externa para aceitar conexões fora do container
CMD ["npm", "run", "dev", "--", "--host"]

# --- ESTÁGIO 2: Build de produção ---
FROM node:22-alpine AS build-stage
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