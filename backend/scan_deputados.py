import os
import requests
import psycopg2
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
DATABASE_URL = os.environ.get("DATABASE_URL", "")

def conectar_banco():
    if not DATABASE_URL:
        return None
    try:
        return psycopg2.connect(DATABASE_URL)
    except Exception as e:
        print(f"Não foi possível conectar ao banco: {e}")
        return None

def salvar_deputado(conn, d):
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO parlamentar (id_externo, nome_civil, nome_urna, sigla_partido, sigla_uf, foto_url,
                                     tipo_parlamentar, situacao, atualizado_em)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'Em exercício', NOW())
            ON CONFLICT (id_externo)
            DO UPDATE SET
                nome_civil       = EXCLUDED.nome_civil,
                nome_urna        = EXCLUDED.nome_urna,
                sigla_partido    = EXCLUDED.sigla_partido,
                foto_url         = EXCLUDED.foto_url,
                tipo_parlamentar = EXCLUDED.tipo_parlamentar,
                atualizado_em    = NOW()
            """,
            (
                d["id"],
                d.get("nome", ""),
                d.get("nome", ""),
                d.get("siglaPartido", ""),
                d.get("siglaUf", ""),
                d.get("urlFoto", ""),
                "deputado",
            )
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Erro ao salvar {d.get('nome')}: {e}")

def run():
    print("Iniciando coleta de dados da Câmara (Deputados)...")
    conn = conectar_banco()
    if not conn:
        print("Abortando sem banco de dados (DATABASE_URL nao encontrada/invalida).")
        return

    url = "https://dadosabertos.camara.leg.br/api/v2/deputados?itens=100"
    total_salvos = 0

    while url:
        print(f"Buscando página: {url}")
        res = requests.get(url, timeout=30)
        if not res.ok:
            print(f"Falha ao consultar {url}")
            break
        
        data = res.json()
        deputados = data.get("dados", [])
        
        for dep in deputados:
            salvar_deputado(conn, dep)
            total_salvos += 1
            
        # Pegar proxima pagina
        links = data.get("links", [])
        proxima = next((link["href"] for link in links if link["rel"] == "next"), None)
        url = proxima

    print(f"Total de deputados inseridos/atualizados com sucesso no Dito e Feito: {total_salvos}")

if __name__ == "__main__":
    run()
