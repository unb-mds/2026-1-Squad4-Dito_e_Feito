# -*- coding: utf-8 -*-
"""Testa as APIs Groq e Gemini lendo as chaves do .env"""

import os
import requests
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

GROQ_API_KEY   = os.environ.get("GROQ_API_KEY", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

SEP = "-" * 60

def test_groq():
    print(SEP)
    print("[GROQ] Testando chave...")
    if not GROQ_API_KEY:
        print("[GROQ] ERRO: GROQ_API_KEY nao encontrado no .env")
        return False

    print(f"[GROQ] Chave: {GROQ_API_KEY[:12]}...")
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [{"role": "user", "content": "Responda apenas: OK"}],
        "max_tokens": 5,
    }
    try:
        res = requests.post(url, json=payload, headers=headers, timeout=15)
        if res.status_code == 200:
            resposta = res.json()["choices"][0]["message"]["content"].strip()
            print(f"[GROQ] SUCESSO! Resposta: '{resposta}'")
            return True
        else:
            print(f"[GROQ] FALHOU! Status {res.status_code}: {res.text[:200]}")
            return False
    except Exception as e:
        print(f"[GROQ] ERRO de conexao: {e}")
        return False


def test_gemini():
    print(SEP)
    print("[GEMINI] Testando chave...")
    if not GEMINI_API_KEY:
        print("[GEMINI] ERRO: GEMINI_API_KEY nao encontrado no .env")
        return False

    print(f"[GEMINI] Chave: {GEMINI_API_KEY[:16]}...")

    # Tenta varios modelos e versoes da API
    modelos_para_testar = [
        ("v1beta", "gemini-2.0-flash"),
        ("v1beta", "gemini-2.0-flash-exp"),
        ("v1beta", "gemini-1.5-flash-latest"),
        ("v1beta", "gemini-1.5-flash-8b"),
        ("v1",     "gemini-pro"),
        ("v1beta", "gemini-pro"),
    ]

    payload = {
        "contents": [{"parts": [{"text": "Responda apenas: OK"}]}]
    }

    for versao, modelo in modelos_para_testar:
        url = (
            f"https://generativelanguage.googleapis.com/{versao}/models/"
            f"{modelo}:generateContent?key={GEMINI_API_KEY}"
        )
        print(f"[GEMINI]   Tentando {versao}/{modelo}...")
        try:
            res = requests.post(url, json=payload, timeout=20)
            if res.status_code == 200:
                data = res.json()
                resposta = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                print(f"[GEMINI] SUCESSO com {versao}/{modelo}!")
                print(f"[GEMINI] Resposta: '{resposta}'")
                print(f"[GEMINI] >> Use este modelo no scan_senators.py: '{modelo}'")
                return True
            elif res.status_code == 429:
                print(f"[GEMINI]   {modelo} -> QUOTA EXCEDIDA (429)")
            elif res.status_code == 404:
                print(f"[GEMINI]   {modelo} -> Modelo nao encontrado (404)")
            elif res.status_code == 400:
                print(f"[GEMINI]   {modelo} -> Chave invalida (400): {res.text[:150]}")
            elif res.status_code == 403:
                print(f"[GEMINI]   {modelo} -> Acesso negado (403)")
            else:
                print(f"[GEMINI]   {modelo} -> Status {res.status_code}: {res.text[:100]}")
        except Exception as e:
            print(f"[GEMINI]   {modelo} -> Erro: {e}")

    print("[GEMINI] Nenhum modelo funcionou com a chave atual.")
    print("[GEMINI] Para gerar uma nova chave correta:")
    print("[GEMINI] 1. Acesse: https://aistudio.google.com/app/apikey")
    print("[GEMINI] 2. Clique em 'Create API key' -> selecione o projeto 'DitoeFeito'")
    print("[GEMINI] 3. Copie a chave (deve comecar com AIza...)")
    return False


if __name__ == "__main__":
    print(SEP)
    print("  VERIFICACAO DE APIs - Groq e Gemini")
    print(SEP)

    groq_ok   = test_groq()
    gemini_ok = test_gemini()

    print(SEP)
    print("  RESULTADO FINAL")
    print(SEP)
    print(f"  Groq   : {'✓ OK' if groq_ok   else '✗ FALHOU'}")
    print(f"  Gemini : {'✓ OK' if gemini_ok else '✗ FALHOU'}")
    print(SEP)
