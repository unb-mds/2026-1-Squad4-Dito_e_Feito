# -*- coding: utf-8 -*-
"""
api.py – Servidor Flask do backend2.
Expõe endpoints para o dashboard de coerência lendo do banco e/ou do JSON local.

Porta: 5001 (independente do backend original na porta 5000)
"""

import json
import os
import traceback

import requests
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
DATABASE_URL  = os.environ.get("DATABASE_URL", "")
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")

# Configurações OpenRouter
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODELS = [
    "meta-llama/llama-3.1-8b-instruct:free",
    "meta-llama/llama-3.3-70b-instruct",
]
OPENROUTER_HEADERS = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json",
    "HTTP-Referer": "https://github.com/unb-mds/2026-1-Squad4-Dito_e_Feito",
    "X-Title": "Dito e Feito - Monitoramento Legislativo"
}

# Localização do arquivo JSON gerado pelo scan_senators.py
METRICS_JSON_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "dashboard_metrics.json"
)

app = Flask(__name__)
CORS(app)

BASE_SENADO = "https://legis.senado.leg.br/dadosabertos"
BASE_CAMARA = "https://dadosabertos.camara.leg.br/api/v2"

# ─────────────────────────────────────────────────────────
# Helpers internos (reutilizados do backend original)
# ─────────────────────────────────────────────────────────

def similaridade_jaccard(t1: str, t2: str) -> float:
    w1, w2 = set(t1.lower().split()), set(t2.lower().split())
    if not w1 or not w2:
        return 0.0
    return len(w1 & w2) / len(w1 | w2)


def scrape_discursos_senador(id_senador, qtd: int = 10) -> list[str]:
    url = f"https://www25.senado.leg.br/web/atividade/pronunciamentos/-/p/parlamentar/{id_senador}"
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        res = requests.get(url, headers=headers, timeout=20)
        soup = BeautifulSoup(res.text, "html.parser")
        tabela = soup.find("table")
        if not tabela:
            return []
        links = []
        for linha in tabela.find_all("tr")[1 : qtd + 1]:
            cols = linha.find_all("td")
            if cols:
                a = cols[0].find("a")
                if a and "href" in a.attrs:
                    href = a["href"]
                    links.append(
                        "https://www25.senado.leg.br" + href if href.startswith("/") else href
                    )

        textos = [None] * len(links)

        def _fetch(args):
            i, u = args
            try:
                r = requests.get(u, headers=headers, timeout=15)
                s = BeautifulSoup(r.text, "html.parser")
                div = s.find("div", class_="texto-integral") or s.find("div", id="textoPronunciamento")
                if div:
                    textos[i] = div.get_text(separator=" ").strip()
            except Exception:
                pass

        with ThreadPoolExecutor(max_workers=5) as ex:
            ex.map(_fetch, enumerate(links))

        return [t for t in textos if t]
    except Exception:
        return []


def extrair_votos_senador(id_senador) -> list[dict]:
    url = f"{BASE_SENADO}/senador/{id_senador}/votacoes"
    headers = {"Accept": "application/xml"}
    try:
        res = requests.get(url, headers=headers, timeout=25)
        res.raise_for_status()
        root = ET.fromstring(res.content)
        todas = root.findall(".//Votacao")
        limite = max(1, len(todas) // 3)
        votos = []
        for v in todas[:limite]:
            s = v.find("IndicadorVotacaoSecreta")
            if s is not None and s.text == "Sim":
                continue
            em = v.find(".//Ementa")
            vt = v.find("SiglaDescricaoVoto")
            dt = v.find(".//DataSessao")
            ementa = (em.text or "Sem ementa") if em is not None else "Sem ementa"
            if ementa == "Sem ementa":
                continue
            votos.append(
                {
                    "ementa": ementa,
                    "voto": vt.text if vt is not None else "N/A",
                    "data": dt.text if dt is not None else "N/A",
                }
            )
        return votos
    except Exception:
        return []


def discursos_deputado(deputado_id, qtd: int = 10) -> list[str]:
    from datetime import datetime, timedelta
    data_inicio = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
    data_fim = datetime.now().strftime("%Y-%m-%d")
    url = f"https://dadosabertos.camara.leg.br/api/v2/deputados/{deputado_id}/discursos"
    params = {
        "ordem": "DESC",
        "ordenarPor": "dataHoraInicio",
        "dataInicio": data_inicio,
        "dataFim": data_fim,
        "itens": qtd
    }
    headers = {"Accept": "application/json"}
    try:
        res = requests.get(url, params=params, headers=headers, timeout=15)
        if not res.ok:
            return []
        dados = res.json().get("dados", [])
        textos = []
        for d in dados:
            texto = d.get("transcricao") or d.get("keywords") or ""
            texto = texto.strip()
            if texto:
                textos.append(texto)
        return textos
    except Exception as e:
        print(f"Erro ao buscar discursos do deputado {deputado_id}: {e}")
        return []


def extrair_votos_deputado(deputado_id) -> list[dict]:
    from datetime import datetime, timedelta
    data_inicio = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
    data_fim = datetime.now().strftime("%Y-%m-%d")
    base_camara = "https://dadosabertos.camara.leg.br/api/v2"
    url = f"{base_camara}/votacoes"
    params = {
        "idOrgao": 180,
        "ordem": "DESC",
        "ordenarPor": "dataHoraRegistro",
        "dataInicio": data_inicio,
        "dataFim": data_fim,
        "itens": 200
    }
    try:
        res = requests.get(url, params=params, timeout=15)
        if not res.ok:
            return []
        votacoes = res.json().get("dados", [])
        
        votos_deputado = []
        for v in votacoes:
            vid = v["id"]
            votes_url = f"{base_camara}/votacoes/{vid}/votos"
            votes_res = requests.get(votes_url, timeout=10)
            if not votes_res.ok:
                continue
            votos_lista = votes_res.json().get("dados", [])
            
            # Procura o voto do nosso deputado
            voto_dep = None
            for vt in votos_lista:
                if str(vt.get("deputado_", {}).get("id")) == str(deputado_id):
                    voto_dep = vt
                    break
            
            if voto_dep:
                ementa = v.get("descricao") or "Sem ementa"
                det_res = requests.get(f"{base_camara}/votacoes/{vid}", timeout=10)
                if det_res.ok:
                    det_dados = det_res.json().get("dados", {})
                    afetadas = det_dados.get("proposicoesAfetadas", [])
                    if afetadas and afetadas[0].get("ementa"):
                        ementa = afetadas[0]["ementa"]
                
                votos_deputado.append({
                    "data": (voto_dep.get("dataRegistroVoto") or v.get("dataHoraRegistro") or "N/A")[:10],
                    "ementa": ementa,
                    "voto": voto_dep.get("tipoVoto") or "N/A"
                })
                if len(votos_deputado) >= 10:
                    break
                    
        return votos_deputado
    except Exception as e:
        print(f"Erro ao extrair votos do deputado {deputado_id}: {e}")
        return []


def analisar_coerencia_groq(votos_com_discurso: list[dict]) -> list[dict]:
    """Envia pares (ementa, voto, discurso) ao Groq e retorna análises de coerência booleana."""
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY ausente")

    GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
    MODELS   = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"]

    system_prompt = (
        "Você é um analista político sênior especializado em monitoramento legislativo brasileiro.\n"
        "Sua tarefa é verificar a COERÊNCIA DE VOTO de um parlamentar.\n"
        "Para cada item você receberá: o texto de um discurso, a ementa de uma votação e o voto oficial registrado.\n\n"
        "Sua análise deve seguir EXATAMENTE estas etapas:\n"
        "  1. postura_extraida: leia o discurso e classifique a postura do parlamentar em relação ao tema da ementa.\n"
        "     Use APENAS um destes valores: 'A Favor', 'Contra', 'Neutro'.\n"
        "     Se o discurso não tratar do mesmo tema da ementa, use 'Neutro'.\n"
        "  2. coerente: compare a postura com o voto oficial:\n"
        "     - Se postura='A Favor' e voto='Sim' → coerente=true\n"
        "     - Se postura='Contra' e voto='Não' → coerente=true\n"
        "     - Se postura='A Favor' e voto='Não' → coerente=false\n"
        "     - Se postura='Contra' e voto='Sim' → coerente=false\n"
        "     - Se postura='Neutro' → coerente=null (não é possível avaliar)\n"
        "     - Se voto for 'Abstenção', 'Ausente', 'Obstrução' ou similar → coerente=null\n"
        "  3. justificativa: 1 frase curta em português explicando sua conclusão.\n\n"
        "Retorne APENAS um objeto JSON com a chave 'analises' contendo a lista de objetos:\n"
        "{idx, postura_extraida, voto_registrado, coerente, justificativa}\n"
        "Não adicione nenhuma marcação extra, apenas o JSON puro."
    )

    payload_items = [
        {
            "idx": i,
            "ementa": v["ementa"][:300],
            "voto_oficial": v.get("voto", "N/A"),
            "discurso": v.get("discurso", "")[:400],
        }
        for i, v in enumerate(votos_com_discurso)
    ]

    payload = {
        "model": MODELS[0],
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(payload_items, ensure_ascii=False)},
        ],
        "temperature": 0.1,
    }
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}

    import time
    last_err = None
    for model_name in MODELS:
        try:
            payload["model"] = model_name
            res = requests.post(GROQ_URL, json=payload, headers=headers, timeout=30)
            if res.status_code == 404 or "model_not_found" in res.text:
                continue
            res.raise_for_status()
            data = json.loads(res.json()["choices"][0]["message"]["content"])
            return data.get("analises", [])
        except Exception as e:
            last_err = e
            time.sleep(1)

    raise last_err or RuntimeError("Nenhum modelo Groq disponível")


def analisar_coerencia_openrouter(votos_com_discurso: list[dict]) -> list[dict]:
    """Envia pares (ementa, voto, discurso) ao OpenRouter e retorna análises de coerência booleana."""
    if not OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY ausente")

    system_prompt = (
        "Você é um analista político sênior especializado em monitoramento legislativo brasileiro.\n"
        "Sua tarefa é verificar a COERÊNCIA DE VOTO de um parlamentar.\n"
        "Para cada item você receberá: o texto de um discurso, a ementa de uma votação e o voto oficial registrado.\n\n"
        "Sua análise deve seguir EXATAMENTE estas etapas:\n"
        "  1. postura_extraida: leia o discurso e classifique a postura do parlamentar em relação ao tema da ementa.\n"
        "     Use APENAS um destes valores: 'A Favor', 'Contra', 'Neutro'.\n"
        "     Se o discurso não tratar do mesmo tema da ementa, use 'Neutro'.\n"
        "  2. coerente: compare a postura com o voto oficial:\n"
        "     - Se postura='A Favor' e voto='Sim' → coerente=true\n"
        "     - Se postura='Contra' e voto='Não' → coerente=true\n"
        "     - Se postura='A Favor' e voto='Não' → coerente=false\n"
        "     - Se postura='Contra' e voto='Sim' → coerente=false\n"
        "     - Se postura='Neutro' → coerente=null (não é possível avaliar)\n"
        "     - Se voto for 'Abstenção', 'Ausente', 'Obstrução' ou similar → coerente=null\n"
        "  3. justificativa: 1 frase curta em português explicando sua conclusão.\n\n"
        "Retorne APENAS um objeto JSON com a chave 'analises' contendo a lista de objetos:\n"
        "{idx, postura_extraida, voto_registrado, coerente, justificativa}\n"
        "Não adicione nenhuma marcação extra, apenas o JSON puro."
    )

    payload_items = [
        {
            "idx": i,
            "ementa": v["ementa"][:300],
            "voto_oficial": v.get("voto", "N/A"),
            "discurso": v.get("discurso", "")[:400],
        }
        for i, v in enumerate(votos_com_discurso)
    ]

    payload = {
        "model": OPENROUTER_MODELS[0],
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(payload_items, ensure_ascii=False)},
        ],
        "temperature": 0.1,
    }

    import time
    last_err = None
    for model_name in OPENROUTER_MODELS:
        try:
            payload["model"] = model_name
            res = requests.post(OPENROUTER_URL, json=payload, headers=OPENROUTER_HEADERS, timeout=30)
            res.raise_for_status()
            data = json.loads(res.json()["choices"][0]["message"]["content"])
            return data.get("analises", [])
        except Exception as e:
            last_err = e
            time.sleep(1)

    raise last_err or RuntimeError("Nenhum modelo OpenRouter disponível")


# ─────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify(
        {
            "status": "online",
            "backend": "backend2",
            "porta": 5001,
            "groq_ativo": bool(GROQ_API_KEY),
            "db_configurado": bool(DATABASE_URL),
        }
    )


@app.route("/api/dashboard-metrics", methods=["GET"])
def dashboard_metrics():
    """
    Retorna as métricas consolidadas geradas pelo scan_senators.py.
    Primeiro tenta ler do banco, fallback para o JSON local.
    """
    # Tenta banco de dados
    if DATABASE_URL:
        try:
            import psycopg2

            conn = psycopg2.connect(DATABASE_URL)
            cur = conn.cursor()

            cur.execute(
                """
                SELECT
                    p.id_externo, p.nome_civil, p.sigla_partido, p.sigla_uf,
                    p.foto_url,
                    ROUND(AVG(sc.score)::numeric, 2) as avg_score,
                    COUNT(sc.id) as total_scores,
                    p.tipo_parlamentar
                FROM parlamentar p
                JOIN score_coerencia sc ON sc.parlamentar_id = p.id
                WHERE p.tipo_parlamentar IN ('senador', 'deputado')
                GROUP BY p.id
                ORDER BY avg_score DESC
                """
            )
            rows = cur.fetchall()
            cur.close()
            conn.close()

            if rows:
                # Tenta mesclar informações de detalhes do JSON local se existir
                json_senadores_map = {}
                if os.path.exists(METRICS_JSON_PATH):
                    try:
                        with open(METRICS_JSON_PATH, "r", encoding="utf-8") as f:
                            local_data = json.load(f)
                            for s_local in local_data.get("senadores", []):
                                json_senadores_map[str(s_local["id"])] = s_local
                    except Exception as ex:
                        print(f"[WARN] Erro ao carregar JSON para mesclagem: {ex}")

                senadores = []
                for r in rows:
                    sid_str = str(r[0])
                    s_local = json_senadores_map.get(sid_str, {})
                    senadores.append(
                        {
                            "id": sid_str,
                            "nome": r[1],
                            "partido": r[2],
                            "uf": r[3],
                            "foto": r[4] or "",
                            "score_coerencia": float(r[5]) if r[5] else 0.0,
                            "total_scores": r[6],
                            "pares_alinhados": s_local.get("pares_alinhados", r[6]),
                            "total_pares": s_local.get("total_pares", r[6]),
                            "contagem_status": s_local.get("contagem_status", {}),
                            "detalhes": s_local.get("detalhes", []),
                            "tipo": r[7].capitalize() if r[7] else "Senador",
                        }
                    )

                por_partido: dict[str, list] = {}
                for s in senadores:
                    por_partido.setdefault(s["partido"], []).append(s["score_coerencia"])

                metricas_partido = [
                    {
                        "partido": p,
                        "media_coerencia": round(sum(v) / len(v), 2),
                        "total_senadores": len(v),
                    }
                    for p, v in sorted(por_partido.items())
                ]

                media_global = (
                    round(sum(s["score_coerencia"] for s in senadores) / len(senadores), 2)
                    if senadores
                    else 0.0
                )
                partido_top = max(metricas_partido, key=lambda x: x["media_coerencia"])

                return jsonify(
                    {
                        "fonte": "banco_de_dados",
                        "total_analisados": len(senadores),
                        "media_global_coerencia": media_global,
                        "partido_mais_coerente": partido_top,
                        "metricas_por_partido": metricas_partido,
                        "senadores": senadores,
                    }
                )
        except Exception as e:
            print(f"[WARN] Banco indisponível, usando JSON: {e}")

    # Fallback: lê do JSON gerado pelo scan_senators.py
    if os.path.exists(METRICS_JSON_PATH):
        try:
            with open(METRICS_JSON_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            data["fonte"] = "arquivo_json"
            return jsonify(data)
        except Exception as e:
            return jsonify({"status": "erro", "mensagem": f"Erro lendo JSON: {e}"}), 500

    return jsonify(
        {
            "status": "sem_dados",
            "mensagem": (
                "Nenhum dado disponível. Execute 'python backend2/scan_senators.py' primeiro."
            ),
        }
    ), 404


@app.route("/api/senadores", methods=["GET"])
def listar_senadores():
    """Lista senadores em exercício (proxy da API do Senado)."""
    try:
        url = f"{BASE_SENADO}/senador/lista/atual"
        headers = {"Accept": "application/json"}
        res = requests.get(url, headers=headers, timeout=15)
        lista = res.json()["ListaParlamentarEmExercicio"]["Parlamentares"]["Parlamentar"]
        resultado = []
        for s in lista:
            ident = s["IdentificacaoParlamentar"]
            resultado.append(
                {
                    "id": ident["CodigoParlamentar"],
                    "nome": ident["NomeParlamentar"],
                    "partido": ident.get("SiglaPartidoParlamentar", ""),
                    "uf": ident.get("UfParlamentar", ""),
                    "foto": ident.get("UrlFotoParlamentar", ""),
                }
            )
        return jsonify({"status": "ok", "dados": sorted(resultado, key=lambda x: x["nome"])})
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500


@app.route("/api/deputados", methods=["GET"])
def listar_deputados():
    """Lista deputados em exercício (proxy da API da Câmara)."""
    try:
        url = f"{BASE_CAMARA}/deputados"
        params = {"itens": 1000}
        headers = {"Accept": "application/json"}
        res = requests.get(url, params=params, headers=headers, timeout=15)
        res.raise_for_status()
        lista = res.json().get("dados", [])
        resultado = []
        for d in lista:
            resultado.append(
                {
                    "id": str(d["id"]),
                    "nome": d["nome"],
                    "partido": d.get("siglaPartido", ""),
                    "uf": d.get("siglaUf", ""),
                    "foto": d.get("urlFoto", ""),
                }
            )
        return jsonify({"status": "ok", "dados": sorted(resultado, key=lambda x: x["nome"])})
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500


@app.route("/api/politico/<id_externo>", methods=["GET"])
def obter_politico(id_externo):
    """Retorna os detalhes básicos de um parlamentar pelo seu ID externo."""
    # 1. Tentar encontrar no banco de dados
    if DATABASE_URL:
        try:
            import psycopg2
            conn = psycopg2.connect(DATABASE_URL)
            cur = conn.cursor()
            cur.execute(
                """
                SELECT id_externo, nome_civil, sigla_partido, sigla_uf, foto_url, tipo_parlamentar
                FROM parlamentar
                WHERE id_externo = %s
                """,
                (str(id_externo),)
            )
            row = cur.fetchone()
            cur.close()
            conn.close()
            if row:
                return jsonify({
                    "status": "ok",
                    "dados": {
                        "id": row[0],
                        "nome": row[1],
                        "partido": row[2],
                        "uf": row[3],
                        "foto": row[4] or "",
                        "tipo": row[5]
                    }
                })
        except Exception as e:
            print(f"[WARN] Erro ao buscar político no banco: {e}")

    # 2. Tentar encontrar no JSON local
    if os.path.exists(METRICS_JSON_PATH):
        try:
            with open(METRICS_JSON_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            for s in data.get("senadores", []):
                if str(s["id"]) == str(id_externo):
                    return jsonify({
                        "status": "ok",
                        "dados": {
                            "id": s["id"],
                            "nome": s["nome"],
                            "partido": s["partido"],
                            "uf": s["uf"],
                            "foto": s["foto"] or "",
                            "tipo": "Senador"
                        }
                    })
        except Exception as e:
            print(f"[WARN] Erro ao carregar JSON: {e}")

    # 3. Se não achou nos dados analisados, procurar nas APIs oficiais (Senado e Câmara)
    # Tenta Senado primeiro
    try:
        url = f"{BASE_SENADO}/senador/{id_externo}"
        headers = {"Accept": "application/json"}
        res = requests.get(url, headers=headers, timeout=10)
        if res.ok:
            data = res.json()
            if "DetalheParlamentar" in data:
                ident = data["DetalheParlamentar"]["Parlamentar"]["IdentificacaoParlamentar"]
                return jsonify({
                    "status": "ok",
                    "dados": {
                        "id": str(id_externo),
                        "nome": ident["NomeParlamentar"],
                        "partido": ident.get("SiglaPartidoParlamentar", ""),
                        "uf": ident.get("UfParlamentar", ""),
                        "foto": ident.get("UrlFotoParlamentar", ""),
                        "tipo": "Senador"
                    }
                })
    except Exception:
        pass

    # Tenta Câmara
    try:
        url = f"{BASE_CAMARA}/deputados/{id_externo}"
        headers = {"Accept": "application/json"}
        res = requests.get(url, headers=headers, timeout=10)
        if res.ok:
            data = res.json().get("dados", {})
            if data:
                return jsonify({
                    "status": "ok",
                    "dados": {
                        "id": str(id_externo),
                        "nome": data.get("nomeCivil") or data.get("ultimoStatus", {}).get("nome"),
                        "partido": data.get("ultimoStatus", {}).get("siglaPartido", ""),
                        "uf": data.get("ultimoStatus", {}).get("siglaUf", ""),
                        "foto": data.get("ultimoStatus", {}).get("urlFoto", ""),
                        "tipo": "Deputado"
                    }
                })
    except Exception:
        pass

    return jsonify({"status": "erro", "mensagem": "Político não encontrado"}), 404


@app.route("/api/analisar", methods=["POST"])
def analisar_parlamentar():
    """
    Analisa a coerência de um senador em tempo real.
    Body JSON: { "id": <id_senador> }
    """
    body = request.get_json()
    parl_id = body.get("id")
    if not parl_id:
        return jsonify({"status": "erro", "mensagem": "ID não informado"}), 400

    # 1. Tentar ler do cache do processamento em lotes para evitar gastar tokens e limites
    if os.path.exists(METRICS_JSON_PATH):
        try:
            with open(METRICS_JSON_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            for s in data.get("senadores", []):
                if str(s["id"]) == str(parl_id):
                    detalhes = s.get("detalhes", [])
                    if detalhes:
                        # Mapeia boolean coerente para status e afinidade numerica se necessário (compatibilidade frontend legado)
                        mapped_detalhes = []
                        for d in detalhes:
                            # Se for coerente booleano, mapeamos para as strings legadas
                            status = "Não Relacionado"
                            afinidade = d.get("jaccard_pre_filtro", 0.0)
                            
                            if "coerente" in d:
                                if d["coerente"] is True:
                                    status = "Coerente"
                                    afinidade = 1.0
                                elif d["coerente"] is False:
                                    status = "Divergente"
                                    afinidade = 0.0
                            elif "status" in d:
                                status = d["status"]
                                afinidade = d.get("afinidade", afinidade)

                            # Preserva as chaves para que o frontend não quebre independentemente do formato
                            mapped_detalhes.append({
                                **d,
                                "status": status,
                                "afinidade": afinidade,
                                "coerente": d.get("coerente")
                            })

                        return jsonify({
                            "status": "ok",
                            "modelo_usado": "Cache (Batch Processing)",
                            "score_coerencia": s.get("score_coerencia", 0.0),
                            "total_votos_analisados": len(mapped_detalhes),
                            "dados": mapped_detalhes
                        })
        except Exception as e:
            print(f"[WARN] Erro ao ler cache no /api/analisar: {e}")

    try:
        # Mapeamento para identificar se o parlamentar é deputado ou senador
        DEPUTADOS_IDS = {
            204528, 74646, 178937, 178882, 160541, 73701, 204374, 204369, 73441, 74171,
            220623, 220645, 107283, 74848, 204536, 156190, 74398, 220637, 209787, 220615,
            220633, 204535, 178946, 204534, 220598, 160592
        }
        
        tipo = "senador"
        try:
            if int(parl_id) in DEPUTADOS_IDS:
                tipo = "deputado"
        except Exception:
            pass
            
        if tipo == "senador" and DATABASE_URL:
            try:
                import psycopg2
                conn = psycopg2.connect(DATABASE_URL)
                cur = conn.cursor()
                cur.execute("SELECT tipo_parlamentar FROM parlamentar WHERE id_externo = %s", (str(parl_id),))
                row = cur.fetchone()
                if row:
                    tipo = row[0]
                cur.close()
                conn.close()
            except Exception as ex:
                print(f"[WARN] Erro ao buscar tipo no banco: {ex}")

        if tipo == "deputado":
            discursos = discursos_deputado(parl_id, qtd=10)
            votos = extrair_votos_deputado(parl_id)
        else:
            discursos = scrape_discursos_senador(parl_id, qtd=10)
            votos = extrair_votos_senador(parl_id)

        if not discursos:
            return jsonify({"status": "aviso", "mensagem": "Nenhum discurso encontrado.", "dados": []})
        if not votos:
            return jsonify({"status": "aviso", "mensagem": "Nenhum voto encontrado.", "dados": []})

        votos_com_disc = []
        for v in votos[:10]:
            melhor = max(discursos, key=lambda d: similaridade_jaccard(d, v["ementa"]))
            votos_com_disc.append({**v, "discurso": melhor})

        # ── Análise via LLM ────────────────────────────────────────
        analises_raw = []
        modelo_usado = ""

        # 1. Tentar Groq
        if GROQ_API_KEY:
            try:
                analises_raw = analisar_coerencia_groq(votos_com_disc)
                modelo_usado = "Groq (Llama-3)"
            except Exception as e:
                print(f"[WARN] Groq falhou: {e}")

        # 2. Tentar OpenRouter como Fallback
        if not analises_raw and OPENROUTER_API_KEY:
            try:
                analises_raw = analisar_coerencia_openrouter(votos_com_disc)
                modelo_usado = "OpenRouter"
            except Exception as e:
                print(f"[WARN] OpenRouter falhou: {e}")

        # ── Cálculo do score booleano ───────────────────────────────
        # Votos que não devem entrar no denominador
        VOTOS_INVALIDOS = {
            "abstenção", "abstencao", "ausente", "obstrução", "obstrucao",
            "art. 17", "art.17", "n/a", "none", "null", "não compareceu"
        }

        resultados = []
        votos_coerentes = 0
        total_validos = 0

        if analises_raw:
            # Monta dict por idx para lookup rápido
            analises_map = {a.get("idx", i): a for i, a in enumerate(analises_raw)}

            for i, v in enumerate(votos_com_disc):
                a = analises_map.get(i, {})
                coerente = a.get("coerente")   # True | False | None
                voto_str = str(v.get("voto", "")).strip().lower()

                # RF27: Abstenções e ausências não entram no denominador
                if voto_str in VOTOS_INVALIDOS:
                    coerente = None

                if coerente is True:
                    votos_coerentes += 1
                    total_validos += 1
                elif coerente is False:
                    total_validos += 1

                resultados.append({
                    "data": v["data"],
                    "ementa": v["ementa"],
                    "voto": v["voto"],
                    "postura_extraida": a.get("postura_extraida", "Neutro"),
                    "coerente": coerente,
                    "justificativa": a.get("justificativa", ""),
                    "discurso": v.get("discurso", ""),
                })
        else:
            # Fallback Jaccard: não temos avaliação real — marca coerente=null
            modelo_usado = "Jaccard (fallback — sem avaliação de coerência)"
            for v in votos_com_disc:
                resultados.append({
                    "data": v["data"],
                    "ementa": v["ementa"],
                    "voto": v["voto"],
                    "postura_extraida": "Neutro",
                    "coerente": None,
                    "justificativa": "LLM indisponível. Sem avaliação de coerência.",
                    "discurso": v.get("discurso", ""),
                })

        # RF15: score só é calculado com mínimo de 3 pares válidos
        VOLUME_MINIMO = 3
        if total_validos >= VOLUME_MINIMO:
            score_coerencia = round((votos_coerentes / total_validos) * 100, 1)
        else:
            score_coerencia = None  # dados insuficientes

        return jsonify({
            "status": "ok",
            "modelo_usado": modelo_usado,
            "score_coerencia": score_coerencia,
            "total_validos": total_validos,
            "votos_coerentes": votos_coerentes,
            "total_votos_analisados": len(resultados),
            "dados": resultados,
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"status": "erro", "mensagem": str(e)}), 500


@app.route("/", methods=["GET"])
def serve_dashboard():
    """Serve o dashboard HTML principal do Dito e Feito."""
    return send_file(os.path.join(os.path.dirname(os.path.abspath(__file__)), "dashboard.html"))


@app.route("/dashboard_metrics.json", methods=["GET"])
def serve_metrics_json():
    """Serve o arquivo dashboard_metrics.json estático para o frontend."""
    return send_file(METRICS_JSON_PATH)


if __name__ == "__main__":
    print("[backend] Iniciando na porta 5001...")
    app.run(debug=True, host="0.0.0.0", port=5001)

