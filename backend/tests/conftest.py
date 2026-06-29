import os
import pytest
import sys

# Garante que a pasta backend está no path para os imports funcionarem
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

@pytest.fixture(autouse=True)
def mock_env(monkeypatch):
    """Define variáveis de ambiente fake para os testes."""
    monkeypatch.setenv("DATABASE_URL", "postgresql://mock_user:mock_password@localhost:5432/mock_db")
    monkeypatch.setenv("GROQ_API_KEY", "mock_groq_key")
    monkeypatch.setenv("OPENROUTER_API_KEY", "mock_openrouter_key")

@pytest.fixture
def client():
    """Retorna um cliente de teste do Flask."""
    # Importado aqui para garantir que monkeypatch de variáveis de ambiente aconteça antes
    from api import app
    app.config['TESTING'] = True
    with app.test_client() as test_client:
        yield test_client
