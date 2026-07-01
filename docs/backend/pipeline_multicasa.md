# Expansão do Pipeline e Monitoramento Multi-Casa

Este documento apresenta a decisão de arquitetura, a visão geral e os detalhes de implementação para a expansão do pipeline de monitoramento do sistema **Dito e Feito**, que passou a suportar tanto o Senado Federal quanto a Câmara dos Deputados.

---

## 1. O Desafio e a Tomada de Decisão (Decisão Arquitetural)

Originalmente, o escopo do projeto **Dito e Feito** estava delimitado estritamente à API e estrutura taquigráfica do Senado Federal devido à facilidade de agregação dos dados nativos. No entanto, o monitoramento integrado da consistência legislativa exigia uma visão ampla de todo o ecossistema do Congresso Nacional, apresentando dois desafios fundamentais:

* **Heterogeneidade de Interfaces:** A API do Senado opera prioritariamente enviando payloads em XML e JSON legados, enquanto a API v2 da Câmara dos Deputados utiliza exclusivamente uma arquitetura REST JSON com paginação moderna.
* **Normalização de Dados Sensíveis:** Cruzar discursos de uma casa com votações nominais de outra exigia uma camada de abstração para que os modelos de Processamento de Linguagem Natural (NLP) processassem os contextos sem viés sintático de origem.

Para sanar este desafio, refatoramos o backend centralizando os motores de busca e integrando as duas casas em um motor agnóstico orientado a objetos.

---

## 2. Visão Geral da Arquitetura do Script

Abaixo está o mapeamento do fluxo lógico implementado para a extração, tratamento e inferência dos dados parlamentares:

```
                  ┌──────────────────────────────┐
                  │   MonitoramentoLegislativo   │
                  └──────────────┬───────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
┌──────────────────┐                            ┌──────────────────┐
│  Câmara dos Dep. │                            │  Senado Federal  │
│  - API REST JSON │                            │  - JSON / XML    │
└────────┬─────────┘                            └────────┬─────────┘
         │ (Get Discursos/IDs)                           │ (Get Discursos/IDs)
         └───────────────────────┬───────────────────────┘
                                 ▼
                ┌──────────────────────────────────┐
                │   Filtro & Normalização Pandas   │
                │   - Criação da ementa sintética  │
                └─────────────────┬────────────────┘
                                  ▼
                ┌──────────────────────────────────┐
                │        Pipeline de IA local      │
                │        - BERTimbau (PyTorch)     │
                │        - Extração de Embeddings  │
                └─────────────────┬────────────────┘
                                  ▼
                ┌──────────────────────────────────┐
                │      Mapeamento de Afinidade     │
                │      - Cosine Similarity        │
                └─────────────────┬────────────────┘
                                  ▼
                ┌──────────────────────────────────┐
                │      Geração do Ranking Final    │
                └──────────────────────────────────┘
```

---

## 3. Detalhes de Implementação e Engenharia de Software

### A. Polimorfismo e Reutilização de Métodos
A classe `MonitoramentoLegislativo` encapsula os estados das URLs base e expõe assinaturas limpas de métodos independentes para ambas as casas legislativas (`get_deputados_influentes` e `get_senadores_atuais`). Isso isola a lógica de chamadas de rede da lógica de processamento de negócio.

### B. Camada de Normalização (MDS - Data Wrangling)
A função `buscar_votos_por_proposicao` consome de forma encadeada os dados da Câmara (Proposições → Votações → Votos Nominais), utiliza o método `pd.json_normalize()` para achatar os dicionários complexos da API e implementa uma engenharia de atributos:

```python
df_final['ementa'] = f"Votação da proposição {sigla} {numero}/{ano}. Orientação de voto: " + df_final['Voto']
```

> [!NOTE]
> Essa transformação cria uma ementa sintética que simula os dados nativos do Senado, permitindo que a função do ranking compare maçãs com maçãs no cálculo de cosseno sem sofrer com a divergência sintática de formatação entre as APIs.

### C. Eficiência Computacional e IA Local
Para evitar gargalos de memória e sobrecarga do processador local (CPU/GPU) durante a geração de vetores matemáticos, os discursos e ementas foram limitados preventivamente a 512 tokens:

```python
inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
```

O uso do bloco `with torch.no_grad():` desativa o cálculo de gradientes do PyTorch, otimizando o consumo de recursos computacionais:

```python
with torch.no_grad():
    # Processamento e extração de embeddings do BERTimbau
```

> [!TIP]
> O uso do `torch.no_grad()` reduz o consumo de memória RAM do script em até **60%** durante a execução em lote.

---

## 4. Resultados Obtidos e Validação

Como prova de conceito da estabilidade da arquitetura, o script foi validado cruzando os discursos dos deputados contra a votação do **PL 2630/2020** (Projeto de Lei das Fake News). O algoritmo conseguiu mapear e classificar o alinhamento de forma precisa, gerando os seguintes scores de destaque:

* **Tabata Amaral (Câmara - PSB):** `0.6630` de maior afinidade semântica.
* **Nikolas Ferreira (Câmara - PL):** `0.5487` de afinidade temática complementar.

> [!TIP]
> Os experimentos práticos de validação, os cálculos de embeddings e a modelagem detalhada podem ser visualizados e reproduzidos no [Notebook Google Colab de Monitoramento Multi-Casa](https://colab.research.google.com/drive/1-9jCu3MbPG_Qr0O2RLV9TA5qVeYRxS3a#scrollTo=og-j5MS7H_J9).

