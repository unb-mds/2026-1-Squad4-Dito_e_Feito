# -*- coding: utf-8 -*-
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import requests, xml.etree.ElementTree as ET, traceback
from bs4 import BeautifulSoup
import os, json, time, threading, re

from transformers import AutoTokenizer, AutoModel
from torch.nn.functional import cosine_similarity
import torch

print("[OK] Carregando modelo BERT na memória (isso pode levar alguns segundos)...")
tokenizer = AutoTokenizer.from_pretrained("neuralmind/bert-base-portuguese-cased")
model = AutoModel.from_pretrained("neuralmind/bert-base-portuguese-cased")
print("[OK] Modelo BERT carregado com sucesso!")
BERT_AVAILABLE = True

app = Flask(__name__)
CORS(app)

BASE_CAMARA = "https://dadosabertos.camara.leg.br/api/v2"
BASE_SENADO = "https://legis.senado.leg.br/dadosabertos"
THRESHOLD   = 0.70
PREVIEW_DIR = os.path.dirname(os.path.abspath(__file__))
TOP10_FILE  = os.path.join(PREVIEW_DIR, "top10_coerentes.json")

top10_status = {"status": "aguardando", "progresso": 0, "total": 0, "dados": []}

# ── Similaridade ──────────────────────────────

def get_embedding(text):
    inp = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
    with torch.no_grad():
        out = model(**inp)
    return out.last_hidden_state.mean(dim=1)

def score(disc, ementa):
    return cosine_similarity(get_embedding(disc[:512]), get_embedding(ementa[:512])).item()

def classificar(s):
    if s >= THRESHOLD:       return "Coerente"
    elif s >= 0.60:          return "Parcialmente Alinhado"
    return "Divergente"

def trecho_relevante(speech, ementa, max_chars=300):
    """Retorna a frase do discurso mais parecida com a ementa usando o modelo BERT."""
    frases = [f.strip() for f in re.split(r'[.!?]+', speech) if len(f.strip()) > 20]
    if not frases: return speech[:max_chars]
    melhor = max(frases, key=lambda f: score(f, ementa))
    return melhor[:max_chars]

# ── Coleta ────────────────────────────────────

def scrape_senado_discursos(sid, qtd=3):
    url = f"https://www25.senado.leg.br/web/atividade/pronunciamentos/-/p/parlamentar/{sid}"
    headers = {'User-Agent': 'Mozilla/5.0'}
    resultado = []
    try:
        soup = BeautifulSoup(requests.get(url, headers=headers, timeout=15).text, 'html.parser')
        tabela = soup.find('table')
        if not tabela: return resultado
        for row in tabela.find_all('tr')[1:qtd+1]:
            cols = row.find_all('td')
            if not cols: continue
            a = cols[0].find('a')
            if not a or 'href' not in a.attrs: continue
            href = a['href']
            url_d = ("https://www25.senado.leg.br" + href) if href.startswith('/') else href
            data_d = cols[1].get_text(strip=True) if len(cols) > 1 else "N/A"
            soup2 = BeautifulSoup(requests.get(url_d, headers=headers, timeout=15).text, 'html.parser')
            div = soup2.find('div', class_='texto-integral') or soup2.find('div', id='textoPronunciamento')
            texto = div.get_text(separator=' ').strip() if div else ""
            if texto:
                resultado.append({"data": data_d, "texto": texto,
                                   "url": url_d, "preview": texto[:400] + ("..." if len(texto)>400 else "")})
    except Exception as e:
        print(f"Erro scrape senado {sid}: {e}")
    return resultado

def discursos_dep(dep_id, qtd=3):
    url = f"{BASE_CAMARA}/deputados/{dep_id}/discursos"
    resultado = []
    try:
        dados = requests.get(url, params={'itens': qtd, 'ordem': 'DESC', 'ordenarPor': 'dataHoraInicio'},
                             headers={'Accept':'application/json'}, timeout=15).json().get('dados', [])
        for d in dados:
            texto = d.get('transcricao') or d.get('keywords') or ""
            if texto:
                resultado.append({"data": (d.get('dataHoraInicio') or 'N/A')[:10], "texto": texto,
                                   "url": d.get('urlTexto') or "", "preview": texto[:400] + "..."})
    except Exception as e:
        print(f"Erro discursos dep {dep_id}: {e}")
    return resultado

def votos_senador(sid):
    try:
        resp = requests.get(f"{BASE_SENADO}/senador/{sid}/votacoes",
                            headers={'Accept':'application/xml'}, timeout=20)
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
        todas = root.findall('.//Votacao')
        votos = []
        for v in todas[:max(1, len(todas)//4)]:
            seg = v.find('IndicadorVotacaoSecreta')
            if seg is not None and seg.text == 'Sim': continue
            em = v.find('.//Ementa'); vt = v.find('SiglaDescricaoVoto'); dt = v.find('.//DataSessao')
            votos.append({"data": dt.text if dt is not None else "N/A",
                          "ementa": em.text if em is not None else "Sem ementa",
                          "voto":  vt.text if vt is not None else "N/A"})
        return votos
    except Exception as e:
        print(f"Erro votos senador {sid}: {e}"); return []

def votos_dep(dep_id):
    try:
        dados = requests.get(f"{BASE_CAMARA}/deputados/{dep_id}/votacoes",
                             params={'itens':50,'ordem':'DESC','ordenarPor':'dataHoraVoto'},
                             headers={'Accept':'application/json'}, timeout=20).json().get('dados', [])
        return [{"data": (v.get('dataHoraVoto') or 'N/A')[:10],
                 "ementa": v.get('descricao') or v.get('proposicaoObjeto') or "Sem ementa",
                 "voto":  v.get('voto') or "N/A"} for v in dados]
    except Exception as e:
        print(f"Erro votos dep {dep_id}: {e}"); return []

# ── Top 10 no startup ─────────────────────────

def computar_top10():
    global top10_status
    top10_status["status"] = "computing"
    try:
        lista = requests.get(f"{BASE_SENADO}/senador/lista/atual",
                             headers={'Accept':'application/json'}, timeout=15
                             ).json()['ListaParlamentarEmExercicio']['Parlamentares']['Parlamentar']
        sample = lista[:30]
        top10_status["total"] = len(sample)
        resultados = []
        for i, s in enumerate(sample):
            ident = s['IdentificacaoParlamentar']
            sid   = ident['CodigoParlamentar']
            nome  = ident['NomeParlamentar']
            top10_status["progresso"] = i + 1
            try:
                discs = scrape_senado_discursos(sid, qtd=2)
                votos = votos_senador(sid)
                if not discs or not votos: continue
                ref = discs[0]['texto']
                scores_v = [(v, score(ref, v['ementa'])) for v in votos]
                avg = sum(s2 for _, s2 in scores_v) / len(scores_v)
                melhor = max(scores_v, key=lambda x: x[1])
                resultados.append({
                    "id": sid, "nome": nome,
                    "partido": ident.get('SiglaPartidoParlamentar',''),
                    "uf": ident.get('UfParlamentar',''),
                    "score_medio": round(avg, 4),
                    "total_votos": len(votos),
                    "discurso_preview": discs[0]['preview'],
                    "melhor_ementa": melhor[0]['ementa'],
                    "melhor_score": round(melhor[1], 4),
                    "trecho_relevante": trecho_relevante(ref, melhor[0]['ementa']),
                    "data_analise": time.strftime('%Y-%m-%d %H:%M')
                })
            except Exception as e2:
                print(f"Erro analisando senador {sid}: {e2}")
        resultados.sort(key=lambda x: x['score_medio'], reverse=True)
        top10 = resultados[:10]
        top10_status.update({"status": "done", "dados": top10})
        with open(TOP10_FILE, 'w', encoding='utf-8') as f:
            json.dump({"gerado_em": time.strftime('%Y-%m-%d %H:%M'), "dados": top10},
                      f, ensure_ascii=False, indent=2)
        print(f"[OK] Top 10 computado e salvo em {TOP10_FILE}")
    except Exception as e:
        top10_status.update({"status": "erro", "erro": str(e)})
        print(f"[ERRO] computar_top10: {e}")

# ── Endpoints ─────────────────────────────────

@app.route('/')
def index():
    return send_from_directory(PREVIEW_DIR, 'index.html')

@app.route('/api/health')
def health():
    return jsonify({"status":"online","bert":BERT_AVAILABLE,"threshold":THRESHOLD,
                    "top10_status": top10_status["status"],
                    "top10_progresso": f"{top10_status['progresso']}/{top10_status['total']}"})

@app.route('/api/deputados')
def listar_dep():
    try:
        dados = requests.get(f"{BASE_CAMARA}/deputados",
                             params={'itens':513,'ordem':'ASC','ordenarPor':'nome'}, timeout=15
                             ).json().get('dados',[])
        return jsonify({"status":"ok","dados":[{"id":d['id'],"nome":d['nome'],
            "partido":d.get('siglaPartido',''),"uf":d.get('siglaUf',''),"foto":d.get('urlFoto','')} for d in dados]})
    except Exception as e: return jsonify({"status":"erro","mensagem":str(e)}), 500

@app.route('/api/senadores')
def listar_sen():
    try:
        lista = requests.get(f"{BASE_SENADO}/senador/lista/atual",
                             headers={'Accept':'application/json'}, timeout=15
                             ).json()['ListaParlamentarEmExercicio']['Parlamentares']['Parlamentar']
        res = sorted([{"id":ident['CodigoParlamentar'],"nome":ident['NomeParlamentar'],
                       "partido":ident.get('SiglaPartidoParlamentar',''),
                       "uf":ident.get('UfParlamentar',''),"foto":ident.get('UrlFotoParlamentar','')}
                      for s in lista for ident in [s['IdentificacaoParlamentar']]], key=lambda x:x['nome'])
        return jsonify({"status":"ok","dados":res})
    except Exception as e: return jsonify({"status":"erro","mensagem":str(e)}), 500

@app.route('/api/analisar', methods=['POST'])
def analisar():
    body  = request.get_json()
    pid   = body.get('id')
    tipo  = body.get('tipo','senador')
    if not pid: return jsonify({"status":"erro","mensagem":"ID não informado"}), 400
    try:
        discs = scrape_senado_discursos(pid, qtd=3) if tipo=='senador' else discursos_dep(pid, qtd=3)
        votos = votos_senador(pid)                  if tipo=='senador' else votos_dep(pid)
        if not discs: return jsonify({"status":"aviso","mensagem":"Sem discursos.","discursos":[],"dados":[]})
        if not votos: return jsonify({"status":"aviso","mensagem":"Sem votos.","discursos":discs,"dados":[]})
        ref   = discs[0]['texto']
        res   = []
        for v in votos:
            s2 = score(ref, v['ementa'])
            res.append({"data": v['data'], "ementa": v['ementa'], "voto": v['voto'],
                        "afinidade": round(s2,4), "status": classificar(s2),
                        "trecho_relevante": trecho_relevante(ref, v['ementa'])})
        res.sort(key=lambda x: x['afinidade'], reverse=True)
        return jsonify({"status":"ok","modelo_usado":"BERT" if BERT_AVAILABLE else "Jaccard",
                        "threshold":THRESHOLD,"total_votos_analisados":len(res),
                        "discursos":discs,"discurso_referencia":discs[0],"dados":res[:10]})
    except Exception as e:
        traceback.print_exc(); return jsonify({"status":"erro","mensagem":str(e)}), 500

@app.route('/api/top10')
def get_top10():
    if os.path.exists(TOP10_FILE):
        with open(TOP10_FILE, encoding='utf-8') as f:
            return jsonify({"status":"ok", **json.load(f)})
    return jsonify(top10_status)

@app.route('/api/top10/status')
def get_top10_status():
    return jsonify(top10_status)

if __name__ == '__main__':
    t = threading.Thread(target=computar_top10, daemon=True)
    t.start()
    app.run(debug=True, port=5001, use_reloader=False)
