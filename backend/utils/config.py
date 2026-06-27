# -*- coding: utf-8 -*-
import json
import os
from datetime import datetime

# Localizações dos arquivos
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(BASE_DIR, "config_data.json")
ENV_PATH = os.path.join(BASE_DIR, ".env")

# Carrega .env manualmente caso ainda não esteja carregado
if os.path.exists(ENV_PATH):
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=ENV_PATH)

DATABASE_URL = os.environ.get("DATABASE_URL", "")

DEFAULT_DATE = "2024-01-01"

def _obter_conexao_db():
    """Tenta conectar ao PostgreSQL usando psycopg2."""
    if not DATABASE_URL:
        return None
    try:
        import psycopg2
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"[config] Falha ao conectar ao banco de dados: {e}")
        return None

def obter_checkpoint() -> str:
    """
    Recupera a ultima_data_coleta do banco de dados ou do fallback local config_data.json.
    """
    # 1. Tenta obter do banco de dados
    conn = _obter_conexao_db()
    if conn:
        try:
            cur = conn.cursor()
            # Garante que a tabela exista
            cur.execute("""
                CREATE TABLE IF NOT EXISTS parametro_coleta (
                    chave VARCHAR(100) PRIMARY KEY,
                    valor TEXT NOT NULL,
                    atualizado_em TIMESTAMPTZ DEFAULT now()
                );
            """)
            conn.commit()
            
            cur.execute("SELECT valor FROM parametro_coleta WHERE chave = 'ultima_data_coleta';")
            row = cur.fetchone()
            cur.close()
            conn.close()
            if row:
                print(f"[config] Checkpoint carregado do banco de dados: {row[0]}")
                return row[0]
        except Exception as e:
            if conn:
                conn.rollback()
                conn.close()
            print(f"[config] Erro ao ler checkpoint do banco (usando fallback JSON): {e}")

    # 2. Fallback para JSON local
    if os.path.exists(JSON_PATH):
        try:
            with open(JSON_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                val = data.get("ultima_data_coleta", DEFAULT_DATE)
                print(f"[config] Checkpoint carregado do arquivo local: {val}")
                return val
        except Exception as e:
            print(f"[config] Erro ao ler arquivo config_data.json local: {e}")
            
    print(f"[config] Checkpoint não encontrado. Usando data padrão: {DEFAULT_DATE}")
    return DEFAULT_DATE

def atualizar_checkpoint(data_str: str):
    """
    Atualiza a ultima_data_coleta no banco de dados e sincroniza localmente no JSON.
    """
    # Valida formato da data (espera YYYY-MM-DD)
    try:
        datetime.strptime(data_str, "%Y-%m-%d")
    except ValueError:
        print(f"[config] Erro: formato de data inválido '{data_str}'. Esperado YYYY-MM-DD.")
        return

    # 1. Tenta atualizar o banco de dados
    conn = _obter_conexao_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                CREATE TABLE IF NOT EXISTS parametro_coleta (
                    chave VARCHAR(100) PRIMARY KEY,
                    valor TEXT NOT NULL,
                    atualizado_em TIMESTAMPTZ DEFAULT now()
                );
            """)
            cur.execute("""
                INSERT INTO parametro_coleta (chave, valor, atualizado_em)
                VALUES ('ultima_data_coleta', %s, NOW())
                ON CONFLICT (chave)
                DO UPDATE SET valor = EXCLUDED.valor, atualizado_em = NOW();
            """, (data_str,))
            conn.commit()
            cur.close()
            conn.close()
            print(f"[config] Checkpoint atualizado no banco de dados para: {data_str}")
        except Exception as e:
            if conn:
                conn.rollback()
                conn.close()
            print(f"[config] Erro ao salvar checkpoint no banco de dados: {e}")

    # 2. Sincroniza localmente no JSON
    try:
        config_data = {}
        if os.path.exists(JSON_PATH):
            with open(JSON_PATH, "r", encoding="utf-8") as f:
                try:
                    config_data = json.load(f)
                except Exception:
                    pass
        config_data["ultima_data_coleta"] = data_str
        config_data["atualizado_em"] = datetime.now().isoformat()
        
        with open(JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(config_data, f, ensure_ascii=False, indent=2)
        print(f"[config] Checkpoint atualizado no arquivo local para: {data_str}")
    except Exception as e:
        print(f"[config] Erro ao gravar checkpoint no JSON local: {e}")
