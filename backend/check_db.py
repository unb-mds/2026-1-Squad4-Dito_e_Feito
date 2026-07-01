# -*- coding: utf-8 -*-
"""Verifica o estado atual das tabelas no Supabase."""

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
DATABASE_URL = os.environ.get("DATABASE_URL", "")

SEP = "-" * 60

def conectar():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"ERRO ao conectar: {e}")
        return None

def verificar_banco():
    print(SEP)
    print("  VERIFICACAO DO SUPABASE")
    print(SEP)

    conn = conectar()
    if not conn:
        return

    cur = conn.cursor()

    # 1. Descobre as tabelas reais do schema public
    cur.execute("""
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' ORDER BY table_name
    """)
    tabelas_reais = [r[0] for r in cur.fetchall()]

    print("\n[1] CONTAGEM DE REGISTROS POR TABELA:")
    for tabela in tabelas_reais:
        try:
            cur.execute(f"SAVEPOINT sp_{tabela}")
            cur.execute(f"SELECT COUNT(*) FROM {tabela}")
            total = cur.fetchone()[0]
            cur.execute(f"RELEASE SAVEPOINT sp_{tabela}")
            status = "OK" if total > 0 else "VAZIA"
            print(f"    {tabela:<25} {total:>5} registros  [{status}]")
        except Exception as e:
            cur.execute(f"ROLLBACK TO SAVEPOINT sp_{tabela}")
            print(f"    {tabela:<25} ERRO: {e}")

    # 2. Detalhes dos parlamentares salvos
    print("\n[2] PARLAMENTARES SALVOS NO BANCO:")
    try:
        cur.execute("SAVEPOINT sp_lista")
        cur.execute("""
            SELECT p.nome_civil, p.sigla_partido, p.sigla_uf,
                   AVG(s.score) as media_score,
                   p.atualizado_em
            FROM parlamentar p
            LEFT JOIN score_coerencia s ON s.parlamentar_id = p.id
            GROUP BY p.id, p.nome_civil, p.sigla_partido, p.sigla_uf, p.atualizado_em
            ORDER BY media_score DESC NULLS LAST
        """)
        rows = cur.fetchall()
        cur.execute("RELEASE SAVEPOINT sp_lista")
        if rows:
            print(f"    {'Nome':<35} {'Partido':<10} {'UF':<5} {'Score':>7}  {'Atualizado'}")
            print(f"    {'-'*35} {'-'*10} {'-'*5} {'-'*7}  {'-'*19}")
            for r in rows:
                nome, partido, uf, score, atualizado = r
                score_str = f"{float(score):.1f}%" if score is not None else "N/A"
                atualizado_str = str(atualizado)[:19] if atualizado else "N/A"
                print(f"    {str(nome):<35} {str(partido):<10} {str(uf):<5} {score_str:>7}  {atualizado_str}")
        else:
            print("    Nenhum parlamentar encontrado.")
    except Exception as e:
        cur.execute("ROLLBACK TO SAVEPOINT sp_lista")
        print(f"    ERRO: {e}")

    # 3. Ultimo registro salvo
    print("\n[3] ULTIMO REGISTRO SALVO:")
    try:
        cur.execute("SAVEPOINT sp_ultimo")
        cur.execute("SELECT nome_civil, sigla_partido, atualizado_em FROM parlamentar ORDER BY atualizado_em DESC LIMIT 1")
        row = cur.fetchone()
        cur.execute("RELEASE SAVEPOINT sp_ultimo")
        if row:
            print(f"    Nome: {row[0]} | Partido: {row[1]} | Em: {str(row[2])[:19]}")
        else:
            print("    Nenhum registro encontrado.")
    except Exception as e:
        cur.execute("ROLLBACK TO SAVEPOINT sp_ultimo")
        print(f"    ERRO: {e}")

    cur.close()
    conn.close()
    print(SEP)
    print("  Conexao com Supabase: OK")
    print(SEP)

if __name__ == "__main__":
    verificar_banco()
