# -*- coding: utf-8 -*-
"""Aplica a migration 007 diretamente no Supabase e verifica o resultado."""

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
DATABASE_URL = os.environ.get("DATABASE_URL", "")

SQL_FILE = os.path.join(os.path.dirname(__file__), "database", "009_drop_recreate_views.sql")
SEP = "-" * 60

def aplicar_migration():
    print(SEP)
    print("  APLICANDO MIGRATION 007 NO SUPABASE")
    print(SEP)

    if not DATABASE_URL:
        print("ERRO: DATABASE_URL nao encontrado no .env")
        return False

    with open(SQL_FILE, "r", encoding="utf-8") as f:
        sql_completo = f.read()

    # Divide em statements individuais por ";"
    # Ignora comentarios e linhas vazias
    statements = []
    bloco = []
    for linha in sql_completo.splitlines():
        stripped = linha.strip()
        if stripped.startswith("--") or stripped == "":
            continue
        bloco.append(linha)
        if stripped.endswith(";"):
            stmt = "\n".join(bloco).strip()
            if stmt and stmt != ";":
                statements.append(stmt)
            bloco = []

    print(f"[INFO] {len(statements)} statements encontrados no arquivo SQL.")

    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = False
        cur = conn.cursor()

        ok = 0
        erros = 0
        for i, stmt in enumerate(statements, 1):
            preview = stmt[:80].replace("\n", " ")
            try:
                cur.execute("SAVEPOINT sp_stmt")
                cur.execute(stmt)
                cur.execute("RELEASE SAVEPOINT sp_stmt")
                ok += 1
                print(f"  [{i:02d}] OK  | {preview}...")
            except Exception as e:
                cur.execute("ROLLBACK TO SAVEPOINT sp_stmt")
                erros += 1
                msg = str(e).strip().replace("\n", " ")[:100]
                print(f"  [{i:02d}] ERR | {preview}...")
                print(f"         Motivo: {msg}")

        conn.commit()
        cur.close()
        conn.close()

        print(SEP)
        print(f"  Migration concluida: {ok} OK | {erros} com aviso")
        print(SEP)
        return erros == 0

    except Exception as e:
        print(f"ERRO CRITICO ao conectar ou executar: {e}")
        return False


def verificar_resultado():
    print(SEP)
    print("  VERIFICACAO POS-MIGRATION")
    print(SEP)

    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        # 1. Lista tabelas e views
        cur.execute("""
            SELECT table_name, table_type
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_type DESC, table_name
        """)
        rows = cur.fetchall()
        print("\n[1] OBJETOS NO BANCO:")
        for r in rows:
            tipo_str = "VIEW " if r[1] == "VIEW" else "TABLE"
            print(f"    [{tipo_str}] {r[0]}")

        # 2. Amostra de parlamentares com nome e tipo
        cur.execute("""
            SELECT nome_civil, COALESCE(nome_urna, nome_civil), sigla_partido,
                   tipo_parlamentar, tipo
            FROM parlamentar LIMIT 5
        """)
        rows = cur.fetchall()
        print("\n[2] AMOSTRA PARLAMENTAR (nome_civil | nome_urna | partido | tipo_parlamentar | tipo):")
        for r in rows:
            print(f"    {r[0]:<30} | {r[1]:<30} | {r[2]:<8} | {r[3]:<10} | {r[4]}")

        # 3. Contagem da ranking_coerencia
        cur.execute("SELECT COUNT(*), COUNT(score_coerencia) FROM ranking_coerencia")
        total, com_score = cur.fetchone()
        print(f"\n[3] ranking_coerencia: {total} total, {com_score} com score calculado")

        # 4. alertas_divergencia
        cur.execute("SELECT COUNT(*) FROM alertas_divergencia")
        alertas = cur.fetchone()[0]
        print(f"[4] alertas_divergencia: {alertas} registros")

        # 5. parametro_coleta
        cur.execute("SELECT chave, valor FROM parametro_coleta ORDER BY chave")
        params = cur.fetchall()
        print(f"[5] parametro_coleta: {len(params)} parametros configurados")
        for p in params:
            print(f"    {p[0]:<30} = {p[1]}")

        cur.close()
        conn.close()
        print(SEP)
        print("  Banco alinhado com sucesso!")
        print(SEP)

    except Exception as e:
        print(f"ERRO na verificacao: {e}")


if __name__ == "__main__":
    sucesso = aplicar_migration()
    if sucesso:
        verificar_resultado()
    else:
        print("\n[AVISO] Alguns statements tiveram erros. Verificando mesmo assim...")
        verificar_resultado()
