import json
import os
import pytest
from unittest.mock import MagicMock, patch

@pytest.fixture
def mock_metrics_json(tmp_path, monkeypatch):
    """Cria um arquivo mock de métricas do dashboard e altera a constante na API."""
    temp_json = tmp_path / "dashboard_metrics.json"
    data = {
        "senadores": [
            {
                "id": "12345",
                "nome": "Senador Mock",
                "partido": "PMOCK",
                "uf": "MK",
                "foto": "http://photo.url",
                "score_coerencia": 85.0,
                "total_scores": 10,
                "pares_alinhados": 8,
                "total_pares": 10,
                "contagem_status": {"Coerente": 8, "Divergente": 2},
                "detalhes": []
            }
        ]
    }
    temp_json.write_text(json.dumps(data), encoding="utf-8")
    
    # Faz o patch do caminho do json na API
    import api
    monkeypatch.setattr(api, "METRICS_JSON_PATH", str(temp_json))
    return data

def test_health(client):
    """Testa se o endpoint de health retorna online."""
    res = client.get('/api/health')
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] == 'online'
    assert data['backend'] == 'backend2'
    assert data['porta'] == 5001

@patch('api.requests.get')
def test_listar_senadores(mock_get, client):
    """Testa o endpoint de listagem de senadores mockando a API do Senado."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "ListaParlamentarEmExercicio": {
            "Parlamentares": {
                "Parlamentar": [
                    {
                        "IdentificacaoParlamentar": {
                            "CodigoParlamentar": "123",
                            "NomeParlamentar": "Senador de Teste",
                            "SiglaPartidoParlamentar": "PTST",
                            "UfParlamentar": "TS",
                            "UrlFotoParlamentar": "http://foto.jpg"
                        }
                    }
                ]
            }
        }
    }
    mock_get.return_value = mock_response

    res = client.get('/api/senadores')
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] == 'ok'
    assert len(data['dados']) == 1
    assert data['dados'][0]['nome'] == 'Senador de Teste'

@patch('api.requests.get')
def test_listar_deputados(mock_get, client):
    """Testa o endpoint de listagem de deputados mockando a API da Câmara."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.raise_for_status = MagicMock()
    mock_response.json.return_value = {
        "dados": [
            {
                "id": 456,
                "nome": "Deputado de Teste",
                "siglaPartido": "PTST",
                "siglaUf": "TS",
                "urlFoto": "http://foto.jpg"
            }
        ]
    }
    mock_get.return_value = mock_response

    res = client.get('/api/deputados')
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] == 'ok'
    assert len(data['dados']) == 1
    assert data['dados'][0]['nome'] == 'Deputado de Teste'

def test_dashboard_metrics_fallback_json(client, mock_metrics_json, monkeypatch):
    """Testa o endpoint de métricas carregando do arquivo JSON (quando banco falha)."""
    # Desativa a URL do banco temporariamente para forçar o fallback de arquivo
    import api
    monkeypatch.setattr(api, "DATABASE_URL", "")
    
    res = client.get('/api/dashboard-metrics')
    assert res.status_code == 200
    data = res.get_json()
    assert data['fonte'] == 'arquivo_json'
    assert len(data['senadores']) == 1
    assert data['senadores'][0]['nome'] == 'Senador Mock'

@patch('psycopg2.connect')
def test_dashboard_metrics_db(mock_connect, client, mock_metrics_json, monkeypatch):
    """Testa o endpoint de métricas buscando dados do banco PostgreSQL mockado."""
    # Configura a conexão e o cursor mock
    mock_conn = MagicMock()
    mock_cur = MagicMock()
    mock_connect.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cur
    
    # Mock dos dados retornados pela query do banco
    mock_cur.fetchall.return_value = [
        ("12345", "Senador Banco", "PBANK", "BK", "http://photo.bank", 92.5, 12, "senador")
    ]
    
    res = client.get('/api/dashboard-metrics')
    assert res.status_code == 200
    data = res.get_json()
    assert data['fonte'] == 'banco_de_dados'
    assert data['total_analisados'] == 1
    assert data['senadores'][0]['nome'] == 'Senador Banco'
    assert data['senadores'][0]['score_coerencia'] == 92.5

def test_obter_politico_json_fallback(client, mock_metrics_json, monkeypatch):
    """Testa obter_politico buscando no JSON local (com banco inativo)."""
    import api
    monkeypatch.setattr(api, "DATABASE_URL", "")
    
    # Busca pelo id "12345" que configuramos no mock_metrics_json
    res = client.get('/api/politico/12345')
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] == 'ok'
    assert data['dados']['nome'] == 'Senador Mock'

@patch('api.scrape_discursos_senador')
@patch('api.extrair_votos_senador')
def test_analisar_parlamentar_jaccard_fallback(mock_votos, mock_discursos, client):
    """Testa o fluxo do endpoint /api/analisar usando fallback Jaccard (sem chaves de API reais)."""
    mock_discursos.return_value = [
        "Discurso sobre a importância da reforma tributária e a redução de impostos."
    ]
    mock_votos.return_value = [
        {
            "ementa": "Reforma tributária nacional e alíquotas simplificadas.",
            "voto": "Sim",
            "data": "2026-06-01"
        }
    ]

    # Faremos a chamada com chaves desativadas ou inválidas
    # Note que a api.py usa similaridade_jaccard se a chamada de IA falhar
    payload = {
        "id": "12345",
        "tipo": "senador"
    }
    
    res = client.post('/api/analisar', json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] == 'ok'
    assert data['modelo_usado'] == 'Jaccard (fallback)'
    assert len(data['dados']) == 1
    assert data['dados'][0]['status'] in ['Coerente', 'Parcialmente Alinhado', 'Divergente', 'Não Relacionado']
