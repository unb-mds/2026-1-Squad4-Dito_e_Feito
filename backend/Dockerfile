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