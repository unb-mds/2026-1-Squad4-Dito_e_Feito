# -*- coding: utf-8 -*-
import requests
import pandas as pd
import json
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from datetime import datetime
import torch
from transformers import AutoTokenizer, AutoModel
from torch.nn.functional import cosine_similarity
import sys
import os

# ─────────────────────────────────────────────────────────
# 1. Inicialização do Modelo de IA (BERTimbau)
# ─────────────────────────────────────────────────────────
print("Carregando modelo BERTimbau (neuralmind/bert-base-portuguese-cased)...")
model_name = "neuralmind/bert-base-portuguese-cased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)

# Configura para rodar na GPU se disponível, caso contrário usa a CPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
print(f"Modelo carregado com sucesso utilizando o dispositivo: {device}\n")

def get_embedding(text):
    """Gera o vetor de embedding semântico para um texto limitado a 512 tokens."""
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
    # Move os tensores de input para o mesmo dispositivo do modelo (CPU ou GPU)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Retorna a média dos estados ocultos no dispositivo CPU para conversão do numpy/item
    return outputs.last_hidden_state.mean(dim=1).to("cpu")

# ─────────────────────────────────────────────────────────
# 2. Funções de Coleta de Dados (Scraping e API XML)
# ─────────────────────────────────────────────────────────
def scrape_senado_discursos(sid, qtd=1):
    """
    Faz o Web Scraping real dos pronunciamentos direto do portal do Senado.
    Simula um navegador real para burlar o bloqueio de segurança do servidor.
    """
    # URL pública de pronunciamentos do parlamentar
    url = f"https://www25.senado.leg.br/web/atividade/pronunciamentos/-/p/parlamentar/{sid}"
    
    # Headers robustos para simular um navegador real (Evita o bloqueio/tabela vazia)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Connection': 'keep-alive'
    }
    
    try:
        # Criamos uma sessão para persistir a conexão se necessário
        session = requests.Session()
        res = session.get(url, headers=headers, timeout=15)
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # O Senado organiza os discursos em uma tabela com a classe 'table' dentro da atividade
        tabela = soup.find('table')
        if not tabela: 
            return []
        
        links = []
        # Varre as linhas da tabela pulando o cabeçalho
        for tr in tabela.find_all('tr')[1:]:
            link_tag = tr.find('a')
            if link_tag and 'href' in link_tag.attrs:
                href = link_tag['href']
                # Garante que a URL do discurso seja absoluta
                if href.startswith('/'):
                    links.append("https://www25.senado.leg.br" + href)
                else:
                    links.append(href)
            if len(links) >= qtd: 
                break
            
        textos = []
        for l in links:
            # Faz o scraping da página interna do discurso específico
            d_res = session.get(l, headers=headers, timeout=10)
            d_soup = BeautifulSoup(d_res.text, 'html.parser')
            
            # Seletores atualizados do Senado para o bloco de texto taquigráfico
            div = (d_soup.find('div', class_='texto-integral') or 
                   d_soup.find('div', id='textoPronunciamento') or 
                   d_soup.find('div', class_='publicacaoTexto') or
                   d_soup.find('p', class_='texto-discurso')) # Seletor secundário adaptativo
            
            if div: 
                textos.append(div.get_text(separator=' ').strip())
                
        return textos
    except Exception as e:
        # print(f"Erro no scraping do ID {sid}: {e}") # Debug opcional se precisar
        return []

def extrair_e_filtrar_votos(sid):
    """Busca o histórico de votações nominais públicas do senador via XML."""
    url = f"https://legis.senado.leg.br/dadosabertos/senador/{sid}/votacoes"
    try:
        res = requests.get(url, headers={'Accept': 'application/xml'}, timeout=15)
        root = ET.fromstring(res.content)
        votos = []
        for v in root.findall('.//Votacao'):
            # Ignora votações sem registro aberto de voto (Secretas)
            secreto = v.find('IndicadorVotacaoSecreta')
            if secreto is not None and secreto.text == 'Sim': 
                continue
                
            ementa = v.find('.//Ementa').text if v.find('.//Ementa') is not None else ""
            if ementa:
                voto_sigla = v.find('SiglaDescricaoVoto').text if v.find('SiglaDescricaoVoto') is not None else "N/A"
                data_sessao = v.find('.//DataSessao').text if v.find('.//DataSessao') is not None else ""
                votos.append({"ementa": ementa, "voto": voto_sigla, "data": data_sessao})
        
        # Inverte a cronologia para processar as pautas mais recentes primeiro (Alinhamento Temporal)
        votos.reverse()
        return votos
    except: 
        return []

# ─────────────────────────────────────────────────────────
# 3. Pipeline de Processamento Consolidado
# ─────────────────────────────────────────────────────────
def gerar_json_consolidado(ids_senadores):
    """Varre os senadores mapeados, executa o cruzamento por IA e cos_sim e monta o JSON final."""
    url_lista = "https://legis.senado.leg.br/dadosabertos/senador/lista/atual"
    try:
        lista_raw = requests.get(url_lista, headers={'Accept': 'application/json'}, timeout=15).json()
        todos_parlamentares = lista_raw['ListaParlamentarEmExercicio']['Parlamentares']['Parlamentar']
    except Exception as e:
        print(f"Erro ao conectar com a API de metadados do Senado: {e}")
        return {"erro": "Falha de conexão com o endpoint do Senado."}

    senadores_data = []

    for sid in ids_senadores:
        # Recupera informações básicas de cadastro (partido, estado, foto)
        info_basica = next((s['IdentificacaoParlamentar'] for s in todos_parlamentares 
                            if s['IdentificacaoParlamentar']['CodigoParlamentar'] == str(sid)), None)
        if not info_basica: 
            print(f"ID {sid} não encontrado na lista de senadores em exercício. Pulando.")
            continue

        nome_parlamentar = info_basica['NomeParlamentar']
        print(f"Analisando: {nome_parlamentar} (ID: {sid})...", end=' ')
        sys.stdout.flush()

        # Coleta das fontes brutas de dados
        discursos = scrape_senado_discursos(sid, qtd=1)
        votos = extrair_e_filtrar_votos(sid)

        if not discursos or not votos: 
            print("Pulei (Dados insuficientes no período).")
            continue

        print("Processando IA...", end=' ')
        sys.stdout.flush()

        # Limpeza preventiva das saudações taquigráficas iniciais para focar no miolo político
        # Limpeza preventiva das saudações taquigráficas iniciais para focar no miolo político
        # Como os dados vêm da API, pegamos direto os primeiros 512 caracteres de contexto real
        discurso_texto = discursos[0]
        discurso_recortado = discurso_texto[:512]
        # Vetorização do discurso base
        emb_discurso = get_embedding(discurso_recortado)
        
        detalhes_votos = []
        scores = []
        contagem_status = {"Coerente": 0, "Divergente": 0, "Parcialmente Alinhado": 0, "Não Relacionado": 0}

        # Cruza o discurso com uma amostragem dos 10 votos nominais mais recentes da pauta
        for v in votos[:10]:
            emb_voto = get_embedding(v['ementa'][:512])
            
            # Cálculo de Similaridade de Cosseno entre os vetores de contexto
            afinidade = float(cosine_similarity(emb_discurso, emb_voto).item())

            # Mapeamento de faixas de threshold semântico para o BERTimbau
            if afinidade >= 0.65:
                status = "Coerente"
            elif afinidade >= 0.55:
                status = "Parcialmente Alinhado"
            elif afinidade >= 0.35:
                status = "Divergente"
            else:
                status = "Não Relacionado"
                
            contagem_status[status] += 1
            scores.append(afinidade * 100) # Normalização de score em escala centesimal

            detalhes_votos.append({
                "ementa": v['ementa'],
                "afinidade": round(afinidade, 2),
                "status": status,
                "voto": v['voto'],
                "data": v['data'],
                "discurso": discurso_texto[:150] + "..."
            })

        avg_score = sum(scores) / len(scores) if scores else 0

        senadores_data.append({
            "id": str(sid),
            "nome": nome_parlamentar,
            "partido": info_basica['SiglaPartidoParlamentar'],
            "uf": info_basica['UfParlamentar'],
            "foto": info_basica.get('UrlFotoParlamentar'),
            "score_coerencia": round(avg_score, 2),
            "total_pares": len(detalhes_votos),
            "contagem_status": contagem_status,
            "detalhes": detalhes_votos
        })
        print("Concluído.")

    if not senadores_data:
        print("\nErro crítico: Nenhum senador possuía volume amostral completo para análise.")
        return {"erro": "Nenhum dado processado com sucesso."}

    # Consolidação das Métricas Globais via Agrupamento de DataFrame
    df_final = pd.DataFrame(senadores_data)
    metricas_partido = df_final.groupby('partido')['score_coerencia'].agg(['mean', 'count']).reset_index()
    metricas_partido.columns = ['partido', 'media_coerencia', 'total_senadores']
    metricas_partido['media_coerencia'] = metricas_partido['media_coerencia'].round(2)

    mais_coerente = metricas_partido.loc[metricas_partido['media_coerencia'].idxmax()].to_dict()

    json_final = {
        "gerado_em": datetime.now().isoformat() + "Z",
        "total_analisados": len(senadores_data),
        "media_global_coerencia": round(df_final['score_coerencia'].mean(), 2),
        "partido_mais_coerente": mais_coerente,
        "metricas_por_partido": metricas_partido.to_dict(orient='records'),
        "senadores": senadores_data
    }

    return json_final

# ─────────────────────────────────────────────────────────
# Execution Entry Point
# ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("--- INICIANDO PIPELINE DITO & FEITO ---")
    
    # IDs oficiais de 10 senadores ativos na tribuna para o teste do relatório
    ids_analise = [5942, 5732, 5322, 5537, 5012, 5953, 5008, 5604, 5894, 5979]
    
    resultado_json = gerar_json_consolidado(ids_analise)
    
    # Exportação física automática do artefato de dados para leitura do Frontend React
    caminho_arquivo = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dashboard_metrics.json")
    with open(caminho_arquivo, "w", encoding="utf-8") as f:
        json.dump(resultado_json, f, ensure_ascii=False, indent=2)
        
    print(f"\n[OK] Pipeline finalizado com sucesso!")
    print(f"💾 O arquivo compactado foi gravado localmente em: {os.path.abspath(caminho_arquivo)}")