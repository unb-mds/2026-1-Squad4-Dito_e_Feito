# -*- coding: utf-8 -*-
"""
API Flask para o Monitoramento Legislativo
Adapta a lógica do pesquisa_deputados.py para endpoints REST
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
import traceback

# Importação condicional do modelo BERT
try:
    from transformers import AutoTokenizer, AutoModel
    from torch.nn.functional import cosine_similarity
    import torch
    MODEL_NAME = "neuralmind/bert-base-portuguese-cased"
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModel.from_pretrained(MODEL_NAME)
    BERT_AVAILABLE = True
    print("[OK] Modelo BERT carregado com sucesso.")
except Exception as e:
    BERT_AVAILABLE = False
    print(f"[AVISO] BERT não disponível, usando similaridade simples: {e}")

app = Flask(__name__)
CORS(app)

BASE_CAMARA = "https://dadosabertos.camara.leg.br/api/v2"
BASE_SENADO = "https://legis.senado.leg.br/dadosabertos"


# ──────────────────────────────────────────────
# Funções auxiliares
# ──────────────────────────────────────────────

def get_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1)


def similaridade_simples(texto1, texto2):
    """Fallback: similaridade por palavras compartilhadas (Jaccard)"""
    words1 = set(texto1.lower().split())
    words2 = set(texto2.lower().split())
    if not words1 or not words2:
        return 0.0
    intersecao = words1 & words2
    uniao = words1 | words2
    return len(intersecao) / len(uniao)


def calcular_score(texto_discurso, texto_ementa):
    if BERT_AVAILABLE:
        emb1 = get_embedding(texto_discurso[:512])
        emb2 = get_embedding(texto_ementa[:512])
        return cosine_similarity(emb1, emb2).item()
    else:
        return similaridade_simples(texto_discurso, texto_ementa)


def classificar_coerencia(score, threshold=0.7):
    if score >= threshold:
        return "Coerente"
    elif score >= 0.6:
        return "Parcialmente Alinhado"
    else:
        return "Divergente"


def scrape_senado_discursos(id_senador, qtd=3):
    url = f"https://www25.senado.leg.br/web/atividade/pronunciamentos/-/p/parlamentar/{id_senador}"
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        response = requests.get(url, headers=headers, timeout=15)
        soup = BeautifulSoup(response.text, 'html.parser')
        tabela = soup.find('table')
        if not tabela:
            return []
        links_discursos = []
        for linha in tabela.find_all('tr')[1:qtd+1]:
            colunas = linha.find_all('td')
            if colunas:
                link = colunas[0].find('a')
                if link and 'href' in link.attrs:
                    url_d = link['href']
                    links_discursos.append(
                        "https://www25.senado.leg.br" + url_d if url_d.startswith('/') else url_d
                    )
        textos = []
        for url_discurso in links_discursos:
            res = requests.get(url_discurso, headers=headers, timeout=15)
            soup2 = BeautifulSoup(res.text, 'html.parser')
            div = soup2.find('div', class_='texto-integral') or soup2.find('div', id='textoPronunciamento')
            if div:
                textos.append(div.get_text(separator=' ').strip())
        return textos
    except Exception as e:
        print(f"Erro scrape discursos: {e}")
        return []


def extrair_votos_senador(id_senador):
    url = f"{BASE_SENADO}/senador/{id_senador}/votacoes"
    headers = {'Accept': 'application/xml'}
    try:
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        root = ET.fromstring(response.content)
        todas = root.findall('.//Votacao')
        limite = max(1, len(todas) // 4)
        votos = []
        for votacao in todas[:limite]:
            secreto = votacao.find('IndicadorVotacaoSecreta')
            if secreto is not None and secreto.text == 'Sim':
                continue
            ementa_node = votacao.find('.//Ementa')
            voto_node = votacao.find('SiglaDescricaoVoto')
            data_node = votacao.find('.//DataSessao')
            votos.append({
                "data": data_node.text if data_node is not None else "N/A",
                "ementa": ementa_node.text if ementa_node is not None else "Sem ementa",
                "voto": voto_node.text if voto_node is not None else "N/A"
            })
        return votos
    except Exception as e:
        print(f"Erro votos senador: {e}")
        return []


def extrair_votos_deputado(deputado_id):
    """Busca votações do deputado via API da Câmara"""
    url = f"{BASE_CAMARA}/deputados/{deputado_id}/votacoes"
    params = {'itens': 50, 'ordem': 'DESC', 'ordenarPor': 'dataHoraVoto'}
    headers = {'Accept': 'application/json'}
    try:
        response = requests.get(url, params=params, headers=headers, timeout=20)
        response.raise_for_status()
        dados = response.json().get('dados', [])
        votos = []
        for v in dados:
            votos.append({
                "data": (v.get('dataHoraVoto') or 'N/A')[:10],
                "ementa": v.get('descricao') or v.get('proposicaoObjeto') or "Sem ementa",
                "voto": v.get('voto') or "N/A"
            })
        return votos
    except Exception as e:
        print(f"Erro votos deputado: {e}")
        return []


def discursos_deputado(deputado_id, qtd=3):
    url = f"{BASE_CAMARA}/deputados/{deputado_id}/discursos"
    params = {'itens': qtd, 'ordem': 'DESC', 'ordenarPor': 'dataHoraInicio'}
    headers = {'Accept': 'application/json'}
    try:
        response = requests.get(url, params=params, headers=headers, timeout=15)
        dados = response.json().get('dados', [])
        textos = []
        for d in dados:
            texto = d.get('transcricao') or d.get('keywords') or ""
            if texto:
                textos.append(texto)
        return textos
    except Exception as e:
        print(f"Erro discursos deputado: {e}")
        return []


# ──────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────

@app.route('/api/deputados', methods=['GET'])
def listar_deputados():
    """Lista todos os deputados em exercício"""
    try:
        url = f"{BASE_CAMARA}/deputados"
        params = {'itens': 513, 'ordem': 'ASC', 'ordenarPor': 'nome'}
        response = requests.get(url, params=params, timeout=15)
        dados = response.json().get('dados', [])
        resultado = [
            {
                "id": d['id'],
                "nome": d['nome'],
                "partido": d.get('siglaPartido', ''),
                "uf": d.get('siglaUf', ''),
                "foto": d.get('urlFoto', '')
            }
            for d in dados
        ]
        return jsonify({"status": "ok", "dados": resultado})
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500


@app.route('/api/senadores', methods=['GET'])
def listar_senadores():
    """Lista todos os senadores em exercício"""
    try:
        url = f"{BASE_SENADO}/senador/lista/atual"
        headers = {'Accept': 'application/json'}
        response = requests.get(url, headers=headers, timeout=15)
        lista = response.json()['ListaParlamentarEmExercicio']['Parlamentares']['Parlamentar']
        resultado = []
        for s in lista:
            ident = s['IdentificacaoParlamentar']
            resultado.append({
                "id": ident['CodigoParlamentar'],
                "nome": ident['NomeParlamentar'],
                "partido": ident.get('SiglaPartidoParlamentar', ''),
                "uf": ident.get('UfParlamentar', ''),
                "foto": ident.get('UrlFotoParlamentar', '')
            })
        resultado.sort(key=lambda x: x['nome'])
        return jsonify({"status": "ok", "dados": resultado})
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500


@app.route('/api/analisar', methods=['POST'])
def analisar_parlamentar():
    """
    Analisa a coerência de um parlamentar.
    Body JSON: { "id": ..., "tipo": "deputado" | "senador" }
    """
    body = request.get_json()
    parl_id = body.get('id')
    tipo = body.get('tipo', 'senador')

    if not parl_id:
        return jsonify({"status": "erro", "mensagem": "ID não informado"}), 400

    try:
        # 1. Buscar discursos
        if tipo == 'deputado':
            discursos = discursos_deputado(parl_id, qtd=3)
            votos = extrair_votos_deputado(parl_id)
        else:
            discursos = scrape_senado_discursos(parl_id, qtd=3)
            votos = extrair_votos_senador(parl_id)

        if not discursos:
            return jsonify({
                "status": "aviso",
                "mensagem": "Nenhum discurso encontrado para este parlamentar.",
                "dados": []
            })

        if not votos:
            return jsonify({
                "status": "aviso",
                "mensagem": "Nenhum voto encontrado para este parlamentar.",
                "dados": []
            })

        # 2. Usar o primeiro discurso como referência
        texto_discurso = discursos[0]

        # 3. Calcular afinidade para cada voto
        resultados = []
        for v in votos:
            score = calcular_score(texto_discurso, v['ementa'])
            status = classificar_coerencia(score)
            resultados.append({
                "data": v['data'],
                "ementa": v['ementa'],
                "voto": v['voto'],
                "afinidade": round(score, 4),
                "status": status
            })

        # 4. Top 10 por afinidade
        resultados.sort(key=lambda x: x['afinidade'], reverse=True)
        top10 = resultados[:10]

        return jsonify({
            "status": "ok",
            "modelo_usado": "BERT" if BERT_AVAILABLE else "Similaridade Jaccard",
            "total_votos_analisados": len(resultados),
            "dados": top10
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"status": "erro", "mensagem": str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "online",
        "bert_disponivel": BERT_AVAILABLE
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
