# -*- coding: utf-8 -*-
"""
scan_senators.py – CLI de varredura automatizada de senadores.

Objetivo:
    Iterar sobre 6 partidos, coletando até 6 senadores VÁLIDOS por partido
    (total de 36). Um senador é VÁLIDO se possuir >= 3 discursos com afinidade
    temática >= 0.6 em relação a alguma ementa de votação.

Uso:
    python scan_senators.py                  # varredura completa (36 senadores)
    python scan_senators.py --limit-per-party 1   # 1 senador por partido (teste rápido)
    python scan_senators.py --no-db          # não persiste no banco (dry-run)

Variáveis de ambiente requeridas (arquivo .env nesta pasta):
    GROQ_API_KEY  – chave da API Groq
    DATABASE_URL  – string de conexão PostgreSQL (Supabase)
"""

import argparse
import json
import os
import sys
import time
import traceback
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from typing import Dict, List, Optional

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# ─────────────────────────────────────────────────────────
# Configuração inicial
# ─────────────────────────────────────────────────────────
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
DATABASE_URL       = os.environ.get("DATABASE_URL", "")
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "");
BASE_SENADO = "https://legis.senado.leg.br/dadosabertos"

# Substitua os alvos antigos por estes (Todos são Senadores ativos)
PARTIDOS_ALVO = ["PL", "PT", "PP", "PSD", "MDB", "PODEMOS"]  # 6 partidos representativos

# Thresholds
THRESHOLD_AFINIDADE = 0.5      # Afinidade moderada/alta passa a validar
MIN_MATCHES         = 1        # Necessário pelo menos 1 par alinhado para validar o senador

# Pré-filtros (Fail Fast)
MIN_DISCURSOS_VOLUME = 1       # Camada 1: qtd mínima de discursos no período para nem tentar scraping
JACCARD_GATE         = 0.0      # Desativa o corte seco do Jaccard local
MAX_PARES_LLM        = 10      # Máximo de pares enviados à LLM após pré-filtragem

# Estado global mutável para controle da busca e fallback dinâmico (camada 1)
CONFIG_BUSCA = {
    "data_inicio": "2024-01-01",
    "data_fim": "2026-12-31",
    "min_discursos_volume": MIN_DISCURSOS_VOLUME,
    "consecutivos_sem_discursos": 0,
    "fallback_ativado": False
}

# Configurações OpenRouter
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# Modelos recomendados no OpenRouter (mantendo a equivalência de velocidade e capacidade)
# Modelos atualizados e oficiais do OpenRouter
OPENROUTER_MODELS = [
    "meta-llama/llama-3.3-70b-instruct",      # Primário
    "meta-llama/llama-3.1-8b-instruct",       # Secundário
]

# Exemplo de dicionário de cabeçalhos que você usará na sua requisição HTTP (requests.post)
# O OpenRouter exige o preenchimento desses metadados para identificar seu app
OPENROUTER_HEADERS = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json",
    "HTTP-Referer": "https://github.com/unb-mds/2026-1-Squad4-Dito_e_Feito", # URL do seu projeto MDS
    "X-Title": "Dito e Feito - Monitoramento Legislativo" # Nome do seu app
}
# ─────────────────────────────────────────────────────────
# Utilitários de log
# ─────────────────────────────────────────────────────────
def log(msg: str, level: str = "INFO"):
    ts = datetime.now().strftime("%H:%M:%S")
    labels = {"INFO": "INFO", "OK": " OK ", "WARN": "WARN", "ERR": "ERR ", "SKIP": "SKIP"}
    prefix = f"[{ts}] [{labels.get(level, 'INFO')}] "
    try:
        print(f"{prefix}{msg}", flush=True)
    except UnicodeEncodeError:
        # Substitui caracteres não suportados pela codificação cp1252 do Windows por "?"
        clean_msg = msg.encode("ascii", errors="replace").decode("ascii")
        print(f"{prefix}{clean_msg}", flush=True)


# ─────────────────────────────────────────────────────────
# Similaridade (fallback sem Groq)
# ─────────────────────────────────────────────────────────
def similaridade_jaccard(texto1: str, texto2: str) -> float:
    """Similaridade de Jaccard entre dois textos (fallback rápido)."""
    w1 = set(texto1.lower().split())
    w2 = set(texto2.lower().split())
    if not w1 or not w2:
        return 0.0
    return len(w1 & w2) / len(w1 | w2)


# ─────────────────────────────────────────────────────────
# Análise via Groq
# ─────────────────────────────────────────────────────────
# def analisar_afinidade_groq(pares: List[dict]) -> List[dict]:
#     """
#     Recebe lista de {idx, ementa, discurso} e retorna lista de
#     {idx, afinidade (0.0-1.0), status, justificativa}.
#     """
#     if not GROQ_API_KEY:
#         raise RuntimeError("GROQ_API_KEY não configurado.")

#     system_prompt = (
#         "Você é um analista político sênior especializado em monitoramento legislativo brasileiro.\n"
#         "Para cada item da lista, compare 'ementa' com 'discurso' e determine:\n"
#         "  1. afinidade: número de 0.0 a 1.0 indicando correlação temática\n"
#         "  2. status: 'Coerente', 'Parcialmente Alinhado', 'Divergente' ou 'Não Relacionado'\n"
#         "  3. justificativa: 1 frase em português\n"
#         "Regra crítica: se os temas forem distintos ou o discurso for vazio, "
#         "defina status='Não Relacionado' e afinidade < 0.6.\n"
#         "Retorne APENAS JSON com chave 'analises' contendo lista de objetos "
#         "{idx, afinidade, status, justificativa}."
#     )

#     payload_pares = [
#         {
#             "idx": p["idx"],
#             "ementa": p["ementa"][:300],
#             "discurso": p["discurso"][:400] if p.get("discurso") else "Sem discurso.",
#         }
#         for p in pares
#     ]

#     payload = {
#         "model": GROQ_MODELS[0],
#         "response_format": {"type": "json_object"},
#         "messages": [
#             {"role": "system", "content": system_prompt},
#             {"role": "user", "content": json.dumps(payload_pares, ensure_ascii=False)},
#         ],
#         "temperature": 0.1,
#     }
#     headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}

#     last_err = None
#     for model_name in GROQ_MODELS:
#         try:
#             payload["model"] = model_name
#             res = requests.post(GROQ_URL, json=payload, headers=headers, timeout=30)
#             if res.status_code == 404 or "model_not_found" in res.text:
#                 continue
#             if not res.ok:
#                 print(f"[DEBUG GROQ] Model: {model_name} | Status: {res.status_code} | Response: {res.text}", flush=True)
#             res.raise_for_status()
#             content = res.json()["choices"][0]["message"]["content"]
#             data = json.loads(content)
#             print(f"[DEBUG GROQ] Success! Model: {model_name} | Return length: {len(data.get('analises', []))}", flush=True)
#             return data.get("analises", [])
#         except Exception as e:
#             last_err = e
#             time.sleep(1)
#             continue

#     raise last_err or RuntimeError("Nenhum modelo Groq disponível.")


# def analisar_afinidade_local(pares: List[dict]) -> List[dict]:
#     """Cálculo de afinidade via Jaccard (sem Groq)."""
#     resultados = []
#     for p in pares:
#         af = similaridade_jaccard(p.get("discurso", ""), p["ementa"])
#         if af >= THRESHOLD_AFINIDADE:
#             status = "Coerente"
#         elif af >= 0.4:
#             status = "Parcialmente Alinhado"
#         else:
#             status = "Não Relacionado"
#         resultados.append({
#             "idx": p["idx"],
#             "afinidade": round(af, 4),
#             "status": status,
#             "justificativa": "Calculado via similaridade Jaccard (fallback local).",
#         })
#     return resultados


# def analisar_pares(pares: List[dict]) -> List[dict]:
#     """Tenta Groq; cai para Jaccard em caso de falha."""
#     if GROQ_API_KEY:
#         try:
#             return analisar_afinidade_groq(pares)
#         except Exception as e:
#             log(f"Groq falhou ({e}). Usando fallback Jaccard.", "WARN")
#     return analisar_afinidade_local(pares)

# ─────────────────────────────────────────────────────────
# Análise via OpenRouter (Substituindo o bloco antigo do Groq)
# ─────────────────────────────────────────────────────────
def analisar_afinidade_openrouter(pares: List[dict]) -> List[dict]:
    """
    Recebe lista de {idx, ementa, discurso} e envia para o OpenRouter
    avaliar a coerência temática real usando LLM.
    """
    if not OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY não configurado no ambiente.")

    system_prompt = (
        "Você é um analista político sênior especializado em monitoramento legislativo brasileiro.\n"
        "Sua tarefa é avaliar a COERÊNCIA POLÍTICA de um parlamentar. Você receberá um discurso, a ementa de uma votação e o VOTO real registrado por ele.\n"
        "Determine:\n"
        "  1. coerencia_score: número de 0.0 a 1.0 indicando se o discurso justifica ou se alinha com o voto registrado (1.0 para coerente, 0.0 para contraditório).\n"
        "  2. status: 'Coerente' (se o discurso apoia o voto), 'Incoerente' (se o discurso contradiz o voto), ou 'Não Relacionado' (se o discurso não trata da ementa de forma clara).\n"
        "  3. justificativa: 1 frase curta em português explicando se o voto registrado condiz com o posicionamento falado no discurso.\n"
        "Retorne APENAS um objeto JSON com a chave 'analises' contendo a lista de objetos "
        "{idx, coerencia_score, status, justificativa}. Não adicione nenhuma marcação extra."
    )

    payload_pares = [
        {
            "idx": p["idx"],
            "ementa": p["ementa"][:400],
            "voto": p.get("voto", "N/A"),
            "discurso": p["discurso"][:600] if p.get("discurso") else "Sem discurso.",
        }
        # Pegamos uma amostra maior (600 carac) para dar contexto à LLM
        for p in pares
    ]

    payload = {
        "model": OPENROUTER_MODELS[0],
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(payload_pares, ensure_ascii=False)},
        ],
        "temperature": 0.1,
    }

    last_err = None
    for model_name in OPENROUTER_MODELS:
        try:
            payload["model"] = model_name
            log(f"Enviando lote de {len(payload_pares)} pares para {model_name}...", "INFO")
            
            res = requests.post(OPENROUTER_URL, json=payload, headers=OPENROUTER_HEADERS, timeout=40)
            
            if not res.ok:
                print(f"[DEBUG OPENROUTER] Model: {model_name} | Status: {res.status_code} | Response: {res.text}", flush=True)
                continue
                
            content = res.json()["choices"][0]["message"]["content"]
            # Limpeza preventiva caso o modelo envie markdown block ```json
            if "```" in content:
                content = content.split("```json")[-1].split("```")[0].strip()
                
            data = json.loads(content)
            print(f"[DEBUG OPENROUTER] Sucesso via modelo: {model_name}", flush=True)
            return data.get("analises", [])
            
        except Exception as e:
            last_err = e
            time.sleep(1)
            continue

    raise last_err or RuntimeError("Nenhum modelo do OpenRouter respondeu adequadamente.")


def analisar_afinidade_local(pares: List[dict]) -> List[dict]:
    """Cálculo de afinidade via Jaccard (fallback local se a internet/API cair)."""
    resultados = []
    for p in pares:
        af = similaridade_jaccard(p.get("discurso", ""), p["ementa"])
        resultados.append({
            "idx": p["idx"],
            "coerencia_score": 0.0,
            "status": "Sem Avaliação da IA",
            "justificativa": f"Calculado via similaridade Jaccard (fallback local). Tem afinidade temática {round(af, 4)}, mas não é possível verificar a coerência do voto sem a IA.",
        })
    return resultados


def analisar_pares(pares: List[dict]) -> List[dict]:
    """Tenta via LLM do OpenRouter; se falhar ou não tiver chave, usa o Jaccard local."""
    if OPENROUTER_API_KEY:
        try:
            return analisar_afinidade_openrouter(pares)
        except Exception as e:
            log(f"OpenRouter falhou ({e}). Usando fallback Jaccard.", "WARN")
    return analisar_afinidade_local(pares)
# ─────────────────────────────────────────────────────────
# Coleta de dados do Senado Federal
# ─────────────────────────────────────────────────────────


def buscar_qtd_discursos(id_senador, data_inicio: str = None, data_fim: str = None) -> int:
    """
    Camada 1 – Pré-Filtro de Volume.

    Consulta a API de discursos do Senado para saber quantos discursos
    o parlamentar possui no período alvo. Retorna 0 em caso de erro ou ausência.
    Muito mais rápido que fazer scraping completo.
    """
    if not data_inicio:
        data_inicio = CONFIG_BUSCA["data_inicio"]
    if not data_fim:
        data_fim = CONFIG_BUSCA["data_fim"]

    url = (
        f"{BASE_SENADO}/senador/{id_senador}/discursos"
        f"?dataInicio={data_inicio}&dataFim={data_fim}"
    )
    headers = {"Accept": "application/json"}
    
    # Log de Debug da Requisição (Requisito 3)
    log(f"[DEBUG API] Contando discursos do senador {id_senador}. URL gerada: {url}", "INFO")

    try:
        res = requests.get(url, headers=headers, timeout=15)
        if not res.ok:
            log(f"[DEBUG API] Resposta não-OK da API (Status {res.status_code}) para o senador {id_senador}", "WARN")
            return 0
        data = res.json()
        
        # Correção crucial de chave raiz de "PronunciamentoParlamentar" para "DiscursosParlamentar"
        dp = data.get("DiscursosParlamentar", {})
        parlamentar = dp.get("Parlamentar", {})
        pronunciamentos_node = parlamentar.get("Pronunciamentos")
        
        if not pronunciamentos_node:
            return 0
            
        pronunciamentos = pronunciamentos_node.get("Pronunciamento", [])
        if isinstance(pronunciamentos, dict):
            pronunciamentos = [pronunciamentos]  # normaliza objeto único → lista
        return len(pronunciamentos)
    except Exception as e:
        log(f"[DEBUG API] Erro ao obter/processar API de discursos (id={id_senador}): {e}", "WARN")
        return 0
def buscar_todos_senadores() -> List[dict]:
    """Retorna lista completa de senadores em exercício com partido e id."""
    url = f"{BASE_SENADO}/senador/lista/atual"
    headers = {"Accept": "application/json"}
    try:
        res = requests.get(url, headers=headers, timeout=20)
        res.raise_for_status()
        lista = res.json()["ListaParlamentarEmExercicio"]["Parlamentares"]["Parlamentar"]
        senadores = []
        for s in lista:
            ident = s["IdentificacaoParlamentar"]
            senadores.append({
                "id": ident["CodigoParlamentar"],
                "nome": ident["NomeParlamentar"],
                "partido": ident.get("SiglaPartidoParlamentar", ""),
                "uf": ident.get("UfParlamentar", ""),
                "foto": ident.get("UrlFotoParlamentar", ""),
            })
        log(f"Total senadores em exercício: {len(senadores)}", "INFO")
        return senadores
    except Exception as e:
        log(f"Erro ao buscar lista de senadores: {e}", "ERR")
        return []


def buscar_discursos_senador(id_senador, qtd: int = 10, data_inicio: str = None, data_fim: str = None) -> List[str]:
    """Obtém a lista de discursos do senador via API filtrada por data e faz scraping dos textos."""
    if not data_inicio:
        data_inicio = CONFIG_BUSCA["data_inicio"]
    if not data_fim:
        data_fim = CONFIG_BUSCA["data_fim"]

    url = (
        f"{BASE_SENADO}/senador/{id_senador}/discursos"
        f"?dataInicio={data_inicio}&dataFim={data_fim}"
    )
    headers_api = {"Accept": "application/json"}
    headers_scraping = {"User-Agent": "Mozilla/5.0 (compatible; DitoeFeito/1.0)"}
    
    log(f"[DEBUG API] Buscando discursos do senador {id_senador} no período {data_inicio} a {data_fim}. URL: {url}", "INFO")
    
    try:
        res = requests.get(url, headers=headers_api, timeout=20)
        if not res.ok:
            log(f"Erro ao obter discursos da API (status {res.status_code}) para o senador {id_senador}", "WARN")
            return []
            
        data = res.json()
        dp = data.get("DiscursosParlamentar", {})
        parlamentar = dp.get("Parlamentar", {})
        pronunciamentos_node = parlamentar.get("Pronunciamentos")
        
        if not pronunciamentos_node:
            return []
            
        pronunciamentos = pronunciamentos_node.get("Pronunciamento", [])
        if isinstance(pronunciamentos, dict):
            pronunciamentos = [pronunciamentos]
            
        # Ordena do mais recente para o mais antigo e limita a 'qtd'
        pronunciamentos = sorted(pronunciamentos, key=lambda x: x.get("DataPronunciamento", ""), reverse=True)
        pronunciamentos = pronunciamentos[:qtd]
        
        links = []
        for p in pronunciamentos:
            link = p.get("UrlTexto") or p.get("UrlTextoHtml")
            if link:
                links.append(link)
                
        if not links:
            return []
            
        textos = [None] * len(links)

        def _fetch(args):
            idx, url_d = args
            try:
                if url_d.startswith("http://"):
                    url_d = url_d.replace("http://", "https://")
                r = requests.get(url_d, headers=headers_scraping, timeout=15)
                soup2 = BeautifulSoup(r.text, "html.parser")
                div = soup2.find("div", class_="texto-integral") or soup2.find(
                    "div", id="textoPronunciamento"
                ) or soup2.find("div", class_="publicacaoTexto")
                if div:
                    textos[idx] = div.get_text(separator=" ").strip()
            except Exception as ex:
                log(f"Erro ao buscar texto do discurso {url_d}: {ex}", "WARN")

        with ThreadPoolExecutor(max_workers=5) as ex:
            ex.map(_fetch, enumerate(links))

        return [t for t in textos if t]
    except Exception as e:
        log(f"Erro ao obter discursos por API/Scraping (id={id_senador}): {e}", "ERR")
        return []


def buscar_votos_senador(id_senador, data_inicio: str = None) -> List[dict]:
    """Retorna lista de votos (ementa, voto, data) do senador via API XML filtrada por data."""
    if not data_inicio:
        data_inicio = CONFIG_BUSCA["data_inicio"]
        
    url = f"{BASE_SENADO}/senador/{id_senador}/votacoes"
    headers = {"Accept": "application/xml"}
    try:
        res = requests.get(url, headers=headers, timeout=25)
        res.raise_for_status()
        root = ET.fromstring(res.content)
        todas = root.findall(".//Votacao")
        votos = []
        for v in todas:
            secreto = v.find("IndicadorVotacaoSecreta")
            if secreto is not None and secreto.text == "Sim":
                continue
            data_node = v.find(".//DataSessao")
            data_str = data_node.text if data_node is not None else "N/A"
            
            # Filtro incremental por data
            if data_str != "N/A" and data_inicio:
                if data_str < data_inicio:
                    continue
                    
            ementa_node = v.find(".//Ementa")
            voto_node   = v.find("SiglaDescricaoVoto")
            ementa = (ementa_node.text or "Sem ementa") if ementa_node is not None else "Sem ementa"
            if ementa == "Sem ementa":
                continue
                
            votos.append({
                "ementa": ementa,
                "voto": voto_node.text if voto_node is not None else "N/A",
                "data": data_str,
            })
        return votos
    except Exception as e:
        log(f"Erro votos (id={id_senador}): {e}", "ERR")
        return []


# ─────────────────────────────────────────────────────────
# Validação do senador (threshold)
# ─────────────────────────────────────────────────────────
def validar_senador(
    senador: dict,
    qtd_discursos: int = 10,
    min_discursos_volume: int = None,
    jaccard_gate: float = JACCARD_GATE,
    data_inicio: str = None,
) -> Optional[dict]:
    """
    Retorna um dict com métricas de coerência se o senador atingir o threshold,
    ou None se for descartado.

    Fluxo de pré-filtragem (Fail Fast):
      1. [Camada 1] Checa volume de discursos via API (sem scraping). Se < min_discursos_volume → descarta.
      2. Faz scraping de discursos e busca votos.
      3. [Camada 2] Para cada votação, encontra o discurso mais próximo (Jaccard).
         Pares com Jaccard < jaccard_gate são descartados antes da chamada LLM.
      4. Somente os pares que passam no Jaccard são enviados à LLM (OpenRouter).
    """
    global CONFIG_BUSCA
    sid = senador["id"]
    nome = senador["nome"]

    if min_discursos_volume is None:
        min_discursos_volume = CONFIG_BUSCA["min_discursos_volume"]
    if data_inicio is None:
        data_inicio = CONFIG_BUSCA["data_inicio"]

    # ── Camada 1: Pré-Filtro de Volume ──────────────────────────────
    qtd_real = buscar_qtd_discursos(sid)
    
    # Atualiza o contador de falhas consecutivas de volume (0 discursos)
    if qtd_real == 0:
        CONFIG_BUSCA["consecutivos_sem_discursos"] += 1
    else:
        # Reseta o contador se encontrarmos discursos
        CONFIG_BUSCA["consecutivos_sem_discursos"] = 0

    # Mecanismo de Fallback Dinâmico (Requisito 2)
    # Se os primeiros senadores vêm consecutivamente sem discursos (ex: 3 consecutivos)
    if CONFIG_BUSCA["consecutivos_sem_discursos"] >= 3 and not CONFIG_BUSCA["fallback_ativado"]:
        CONFIG_BUSCA["fallback_ativado"] = True
        # Alarga o período retroativamente (volta até 2022-01-01 para obter mais histórico)
        CONFIG_BUSCA["data_inicio"] = "2022-01-01"
        data_inicio = "2022-01-01"
        CONFIG_BUSCA["min_discursos_volume"] = 1
        min_discursos_volume = 1
        
        log(
            f"[FALLBACK] Detectados {CONFIG_BUSCA['consecutivos_sem_discursos']} senadores seguidos com zero discursos. "
            f"Alargando período de busca para '{CONFIG_BUSCA['data_inicio']}' e reduzindo threshold min_discursos para {min_discursos_volume}.",
            "WARN"
        )
        
        # Tenta novamente a contagem com os parâmetros alargados para o senador atual
        qtd_real = buscar_qtd_discursos(sid)

    if qtd_real < min_discursos_volume:
        log(
            f"  [Pre-Filter L1] {nome} – apenas {qtd_real} discurso(s) no período "
            f"(mínimo: {min_discursos_volume}). Descartado sem scraping.",
            "SKIP",
        )
        return None
    log(f"  [Pre-Filter L1] {nome} – {qtd_real} discursos encontrados. Prosseguindo...", "INFO")

    # ── Coleta completa ──────────────────────────────────────────────
    discursos = buscar_discursos_senador(sid, qtd=qtd_discursos, data_inicio=data_inicio)
    if not discursos:
        log(f"  ⤼ {nome} – nenhum discurso no período. Descartado.", "SKIP")
        return None

    votos = buscar_votos_senador(sid, data_inicio=data_inicio)
    if not votos:
        log(f"  ⤼ {nome} – nenhum voto encontrado no período. Descartado.", "SKIP")
        return None

    # ── Camada 2: Pré-Filtro Jaccard (antes da LLM) ─────────────────
    pares_candidatos = []
    descartados_jaccard = 0
    for idx, v in enumerate(votos):
        melhor_disc = max(discursos, key=lambda d: similaridade_jaccard(d, v["ementa"]))
        score_jac = similaridade_jaccard(melhor_disc, v["ementa"])
        
        # Confia no critério semântico macro da LLM e não descarta pelo Jaccard zerado
        pares_candidatos.append({
            "idx": len(pares_candidatos),  # reindexação contínua
            "ementa": v["ementa"],
            "discurso": melhor_disc,
            "jaccard": round(score_jac, 4),
            "voto": v["voto"],
            "voto_original_idx": idx,  # preserva idx original para lookup de votos
        })

    log(
        f"  [Pre-Filter L2] {nome} – {len(pares_candidatos)} pares passaram no Jaccard "
        f"({descartados_jaccard} descartados | gate={jaccard_gate}).",
        "INFO",
    )

    if not pares_candidatos:
        log(f"  ⤼ {nome} – 0 pares relevantes após filtro Jaccard. Descartado.", "SKIP")
        return None

    # Ordena pelos melhores Jaccard e limita a MAX_PARES_LLM para economizar tokens
    pares_candidatos.sort(key=lambda x: x["jaccard"], reverse=True)
    pares_amostra = pares_candidatos[:MAX_PARES_LLM]

    log(
        f"  [LLM] {nome} – enviando {len(pares_amostra)} pares ao OpenRouter "
        f"(Jaccard top-{MAX_PARES_LLM}).",
        "INFO",
    )

    # ── Análise via LLM ─────────────────────────────────────────────
    try:
        analises = analisar_pares(pares_amostra)
    except Exception as e:
        log(f"  ERR análise {nome}: {e}", "ERR")
        return None

    # Conta pares coerentes
    analises_by_idx = {a["idx"]: a for a in analises}
    matches_alinhados = sum(
        1 for idx in range(len(pares_amostra))
        if analises_by_idx.get(idx, {}).get("status", "") == "Coerente"
    )

    # ── Métricas consolidadas ────────────────────────────────────────
    # A porcentagem de coerência global agora é focada APENAS em votos válidos e relacionados.
    pares_relacionados = sum(
        1 for idx in range(len(pares_amostra))
        if analises_by_idx.get(idx, {}).get("status", "") != "Não Relacionado" and analises_by_idx.get(idx, {}).get("status", "") != "Sem Avaliação da IA"
    )

    if pares_relacionados > 0:
        score_coerencia = round((matches_alinhados / pares_relacionados) * 100, 2)
    else:
        # Se nenhum discurso tem relação com os votos, a coerência é 0 ou fallback.
        score_coerencia = 0.0

    contagem_status: Dict[str, int] = {}
    for a in analises:
        s = a.get("status", "Não Relacionado")
        contagem_status[s] = contagem_status.get(s, 0) + 1

    # Amostras dos discursos mais alinhados
    top_analises = sorted(analises, key=lambda x: x.get("coerencia_score", 0.0), reverse=True)[:5]
    detalhes = []
    for a in top_analises:
        a_idx = a.get("idx", 0)
        if a_idx < len(pares_amostra):
            par = pares_amostra[a_idx]
            orig_idx = par["voto_original_idx"]
            detalhes.append({
                "ementa": par["ementa"],
                "afinidade": a.get("coerencia_score", 0.0),
                "jaccard_pre_filtro": par["jaccard"],
                "status": a.get("status", ""),
                "justificativa": a.get("justificativa", ""),
                "voto": votos[orig_idx]["voto"] if orig_idx < len(votos) else "N/A",
                "data": votos[orig_idx]["data"] if orig_idx < len(votos) else "N/A",
                "discurso": par["discurso"],
            })

    log(
        f"  ✔ {nome} – {matches_alinhados} pares alinhados | score={score_coerencia:.1f} "
        f"| pares enviados à LLM: {len(pares_amostra)} (de {len(votos)} votos totais)",
        "OK",
    )

    return {
        "id": sid,
        "nome": nome,
        "partido": senador["partido"],
        "uf": senador["uf"],
        "foto": senador.get("foto", ""),
        "tipo_parlamentar": "senador",
        "score_coerencia": score_coerencia,
        "media_afinidade": score_coerencia / 100.0 if score_coerencia > 0 else 0.0,
        "total_pares_analisados": len(pares_amostra),
        "pares_alinhados": matches_alinhados,
        "contagem_status": contagem_status,
        "detalhes": detalhes,
        "analisado_em": datetime.utcnow().isoformat() + "Z",
    }


# ─────────────────────────────────────────────────────────
# Persistência no PostgreSQL
# ─────────────────────────────────────────────────────────
def conectar_banco():
    """Retorna conexão psycopg2 ou None se DATABASE_URL não estiver configurado."""
    if not DATABASE_URL:
        return None
    try:
        import psycopg2
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        log(f"Não foi possível conectar ao banco: {e}", "WARN")
        return None


def salvar_no_banco(conn, senador_data: dict):
    """Upsert do parlamentar e inserção dos scores de coerência."""
    try:
        cur = conn.cursor()

        # Upsert parlamentar
        cur.execute(
            """
            INSERT INTO parlamentar (id_externo, nome_civil, sigla_partido, sigla_uf, foto_url,
                                     tipo_parlamentar, situacao, atualizado_em)
            VALUES (%s, %s, %s, %s, %s, %s, 'Em exercício', NOW())
            ON CONFLICT (id_externo)
            DO UPDATE SET
                nome_civil       = EXCLUDED.nome_civil,
                sigla_partido    = EXCLUDED.sigla_partido,
                foto_url         = EXCLUDED.foto_url,
                tipo_parlamentar = EXCLUDED.tipo_parlamentar,
                atualizado_em    = NOW()
            RETURNING id
            """,
            (
                senador_data["id"],
                senador_data["nome"],
                senador_data["partido"],
                senador_data["uf"],
                senador_data.get("foto", ""),
                senador_data["tipo_parlamentar"],
            ),
        )
        row = cur.fetchone()
        parl_uuid = row[0] if row else None

        if parl_uuid:
            for detalhe in senador_data.get("detalhes", []):
                # Evita duplicar se a mesma justificativa e score já existem para este parlamentar
                cur.execute(
                    """
                    SELECT 1 FROM score_coerencia 
                    WHERE parlamentar_id = %s AND justificativa = %s AND score = %s
                    LIMIT 1
                    """,
                    (parl_uuid, detalhe.get("justificativa", ""), round(detalhe["afinidade"] * 100, 2))
                )
                if cur.fetchone():
                    log(f"  [DB] Score já existente para {senador_data['nome']} (justificativa repetida). Ignorando inserção redundante.", "INFO")
                    continue

                cur.execute(
                    """
                    INSERT INTO score_coerencia
                        (parlamentar_id, score, similaridade_coseno, status_coerencia,
                         justificativa, modelo_usado, calculado_em)
                    VALUES (%s, %s, %s, %s, %s, %s, NOW())
                    """,
                    (
                        parl_uuid,
                        round(detalhe["afinidade"] * 100, 2),
                        detalhe["afinidade"],
                        detalhe.get("status", "Não Relacionado"),
                        detalhe.get("justificativa", ""),
                        "Groq/Jaccard (backend2-scan)",
                    ),
                )

        conn.commit()
        cur.close()
        log(f"  💾 {senador_data['nome']} salvo no banco.", "OK")
    except Exception as e:
        conn.rollback()
        log(f"  Erro ao salvar {senador_data['nome']} no banco: {e}", "ERR")
        traceback.print_exc()


# ─────────────────────────────────────────────────────────
# Geração do dashboard_metrics.json
# ─────────────────────────────────────────────────────────
def gerar_metricas_json(validados: List[dict], output_path: str):
    """Gera arquivo JSON consolidado para o dashboard frontend."""
    if not validados:
        log("Nenhum senador validado para gerar métricas.", "WARN")
        return

    total = len(validados)
    media_global = round(sum(s["score_coerencia"] for s in validados) / total, 2)

    # Métricas por partido
    partidos: Dict[str, list] = {}
    for s in validados:
        p = s["partido"]
        partidos.setdefault(p, []).append(s["score_coerencia"])

    metricas_partido = [
        {
            "partido": p,
            "media_coerencia": round(sum(scores) / len(scores), 2),
            "total_senadores": len(scores),
        }
        for p, scores in sorted(partidos.items())
    ]

    partido_mais_coerente = max(metricas_partido, key=lambda x: x["media_coerencia"])

    metricas = {
        "gerado_em": datetime.utcnow().isoformat() + "Z",
        "total_analisados": total,
        "media_global_coerencia": media_global,
        "partido_mais_coerente": partido_mais_coerente,
        "metricas_por_partido": metricas_partido,
        "senadores": [
            {
                "id": s["id"],
                "nome": s["nome"],
                "partido": s["partido"],
                "uf": s["uf"],
                "foto": s.get("foto", ""),
                "score_coerencia": s["score_coerencia"],
                "pares_alinhados": s["pares_alinhados"],
                "total_pares": s["total_pares_analisados"],
                "contagem_status": s.get("contagem_status", {}),
                "detalhes": s.get("detalhes", []),
            }
            for s in sorted(validados, key=lambda x: x["score_coerencia"], reverse=True)
        ],
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(metricas, f, ensure_ascii=False, indent=2)

    log(f"dashboard_metrics.json gerado em: {output_path}", "OK")


# ─────────────────────────────────────────────────────────
# Orquestrador principal
# ─────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="Varredura automatizada de senadores para análise de coerência."
    )
    parser.add_argument(
        "--limit-per-party",
        type=int,
        default=100,
        help="Número máximo de senadores válidos por partido (padrão: 100 - sem limite real).",
    )
    parser.add_argument(
        "--no-db",
        action="store_true",
        help="Não persiste dados no banco (dry-run).",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "dashboard_metrics.json"),
        help="Caminho do arquivo JSON de saída (padrão: dashboard_metrics.json no mesmo diretório).",
    )
    parser.add_argument(
        "--min-discursos",
        type=int,
        default=MIN_DISCURSOS_VOLUME,
        help=f"Camada 1 – mínimo de discursos no período para processar o senador (padrão: {MIN_DISCURSOS_VOLUME}).",
    )
    parser.add_argument(
        "--jaccard-gate",
        type=float,
        default=JACCARD_GATE,
        help=f"Camada 2 – score Jaccard mínimo para enviar par à LLM (padrão: {JACCARD_GATE}).",
    )
    parser.add_argument(
        "--limit-total",
        type=int,
        default=None,
        help="Limite total de senadores a serem analisados na execução.",
    )
    args = parser.parse_args()

    # Inicializa estado de busca com os parâmetros da CLI
    CONFIG_BUSCA["min_discursos_volume"] = args.min_discursos

    # Carrega o checkpoint
    try:
        from utils.config import obter_checkpoint, atualizar_checkpoint
    except ImportError:
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from utils.config import obter_checkpoint, atualizar_checkpoint

    checkpoint_data = obter_checkpoint()
    CONFIG_BUSCA["data_inicio"] = checkpoint_data

    log("=" * 60)
    log("  Dito e Feito – Varredura de Coerência Parlamentar (backend2)")
    log("=" * 60)
    log(f"Partidos alvo: {', '.join(PARTIDOS_ALVO)}")
    log(f"Meta: {args.limit_per_party} senadores válidos por partido")
    log(f"Limite total de análise: {args.limit_total if args.limit_total else 'Sem limite'}")
    log(f"Período de busca: de {CONFIG_BUSCA['data_inicio']} até {CONFIG_BUSCA['data_fim']}")
    log(f"Threshold afinidade: >= {THRESHOLD_AFINIDADE} | Mínimo de pares: {MIN_MATCHES}")
    log(f"[L1] Min. discursos para processar: {args.min_discursos}")
    log(f"[L2] Jaccard gate (pré-LLM): {args.jaccard_gate}")
    log(f"[LLM] Max. pares enviados à LLM por senador: {MAX_PARES_LLM}")
    log(f"OpenRouter ativo: {'SIM' if OPENROUTER_API_KEY else 'NÃO (usando Jaccard)'}")
    log(f"Banco ativo: {'SIM' if (DATABASE_URL and not args.no_db) else 'NÃO'}")
    log("=" * 60)

    # Conecta ao banco (opcional)
    conn = None if args.no_db else conectar_banco()

    # Carrega todos os senadores
    todos_senadores = buscar_todos_senadores()
    if not todos_senadores:
        log("Nenhum senador encontrado. Abortando.", "ERR")
        sys.exit(1)

    # Agrupa por partido
    por_partido: Dict[str, list] = {}
    for s in todos_senadores:
        p = s["partido"].upper().strip()
        por_partido.setdefault(p, []).append(s)

    # Filtra apenas os partidos alvo (normaliza UNIÃO → UNIÃO ou UNIAO)
    fila_por_partido: Dict[str, list] = {}
    for alvo in PARTIDOS_ALVO:
        alvo_upper = alvo.upper()
        candidatos = (
            por_partido.get(alvo_upper, [])
            or por_partido.get(alvo_upper.replace("Ã", "A"), [])
            or []
        )
        # Tenta correspondência parcial se não achou exato
        if not candidatos:
            for k in por_partido:
                if alvo_upper in k or k in alvo_upper:
                    candidatos = por_partido[k]
                    break
        fila_por_partido[alvo_upper] = candidatos
        log(f"Partido {alvo_upper}: {len(candidatos)} senadores disponíveis na fila.")

    # Varredura principal
    todos_validados: List[dict] = []
    resumo: Dict[str, dict] = {}
    total_analisados = 0

    for partido, fila in fila_por_partido.items():
        if args.limit_total and total_analisados >= args.limit_total:
            log(f"Limite total de {args.limit_total} senadores analisados atingido. Encerrando loop de partidos.")
            break
        log(f"\n{'─'*50}")
        log(f"🔎 Analisando partido: {partido} ({len(fila)} candidatos)")
        log(f"{'─'*50}")

        validados_partido = []
        for senador in fila:
            if args.limit_total and total_analisados >= args.limit_total:
                log(f"Limite total de {args.limit_total} senadores analisados atingido. Encerrando loop de senadores.")
                break
            if len(validados_partido) >= args.limit_per_party:
                break

            log(f"▶ Analisando: {senador['nome']} ({senador['uf']}) [Total analisados: {total_analisados + 1}]")
            resultado = validar_senador(
                senador,
                min_discursos_volume=args.min_discursos,
                jaccard_gate=args.jaccard_gate,
            )
            total_analisados += 1

            if resultado is not None:
                validados_partido.append(resultado)
                todos_validados.append(resultado)

                if conn:
                    salvar_no_banco(conn, resultado)

            # Pausa respeitosa entre senadores para não sobrecarregar as APIs
            time.sleep(1.5)

        resumo[partido] = {
            "validados": len(validados_partido),
            "media_score": (
                round(sum(v["score_coerencia"] for v in validados_partido) / len(validados_partido), 2)
                if validados_partido
                else 0.0
            ),
        }
        log(
            f"✔ Partido {partido}: {len(validados_partido)}/{args.limit_per_party} senadores validados.",
            "OK",
        )

    # Fecha conexão
    if conn:
        conn.close()

    # Gera arquivo de métricas
    log(f"\n{'=' * 60}")
    log(f"Varredura concluída. Total validados: {len(todos_validados)}")
    log(f"{'=' * 60}")
    for partido, info in resumo.items():
        log(
            f"  {partido}: {info['validados']} validados | score médio: {info['media_score']:.1f}",
            "OK",
        )
    log(f"{'=' * 60}")

    gerar_metricas_json(todos_validados, args.output)

    # Salva o novo checkpoint
    hoje_str = datetime.now().strftime("%Y-%m-%d")
    atualizar_checkpoint(hoje_str)

    log("\n🏁 Processo finalizado com sucesso.", "OK")


if __name__ == "__main__":
    main()
