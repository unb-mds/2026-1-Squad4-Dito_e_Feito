# Imagem base leve do Python
FROM python:3.10-slim

# Evita que o Python escreva arquivos .pyc no disco
ENV PYTHONDONTWRITEBYTECODE=1
# Evita que o Python faça buffer das saídas de log (mostra em tempo real no console)
ENV PYTHONUNBUFFERED=1

# Define o diretório de trabalho
WORKDIR /app

# Copia e instala as dependências do Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código-fonte do backend
COPY . .

# Expõe a porta da API Flask
EXPOSE 5001

# Comando de produção com Gunicorn (WSGI server)
# Para desenvolvimento local, o docker-compose.yml pode sobrescrever com: command: python api.py
CMD ["gunicorn", "-b", "0.0.0.0:5001", "--workers", "2", "--timeout", "120", "api:app"]