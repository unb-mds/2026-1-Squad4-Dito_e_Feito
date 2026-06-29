# Documentação do Backend

Este documento descreve detalhadamente a arquitetura, o funcionamento, as tecnologias e os fluxos do backend do projeto Dito e Feito. O backend é responsável pela extração de dados parlamentares, processamento de inteligência artificial para análise de coerência entre discursos e votações, persistência no banco de dados e fornecimento dos endpoints para o dashboard.

---

## Arquitetura Geral do Sistema

O fluxo do sistema pode ser resumido em um modelo de processamento híbrido, contendo scripts de execução em lote (pipelines offline) e um servidor web Flask para atendimento às requisições do frontend (dashboard online).

### Componentes Principais
- **Servidor API (api.py):** Expõe as rotas REST para alimentação do painel e processamento sob demanda.
- **Pipeline de Varredura (scan_senators.py):** Script de execução agendada ou manual que analisa parlamentares em massa, valida-os sob critérios estritos e atualiza o repositório central de dados.
- **Pipeline BERTimbau (pipe.py):** Validador conceitual e local que executa análises semânticas utilizando vetores locais em vez de APIs de nuvem.
- **Banco de Dados (PostgreSQL):** Repositório relacional persistente hospedado no Supabase, responsável pelo armazenamento de parlamentares, discursos, proposições, votos e scores históricos de coerência.

---

## Tecnologias e Bibliotecas

Abaixo estão relacionadas as tecnologias e bibliotecas adotadas no backend, sem o uso de dependências externas desnecessárias:

### Núcleo de Desenvolvimento
- **Python:** Linguagem de programação padrão adotada em todo o processamento de dados e API.
- **Flask:** Framework web leve utilizado para criar o servidor HTTP e expor os endpoints na porta 5001.
- **Flask-CORS:** Extensão do Flask para habilitar o compartilhamento de recursos de origem cruzada (CORS), permitindo requisições provenientes da interface frontend.

### Extração e Manipulação de Dados
- **BeautifulSoup4:** Utilizado para realizar a raspagem de dados (web scraping) das páginas HTML de pronunciamentos do Senado Federal, capturando o teor literal dos discursos na tribuna.
- **Requests:** Biblioteca cliente HTTP para efetuar requisições externas para as APIs da Câmara dos Deputados, Senado Federal, Groq e OpenRouter.
- **Python-dotenv:** Mapeamento automático de variáveis de ambiente definidas em um arquivo .env para configuração segura de credenciais e chaves.
- **Psycopg2-binary:** Adaptador de banco de dados PostgreSQL para Python, permitindo consultas diretas e inserções eficientes no banco relacional.

### Inteligência Artificial e Processamento de Linguagem Natural (PLN)
- **PyTorch:** Framework de aprendizado de máquina utilizado para processar os tensores do modelo BERTimbau local.
- **Transformers (HuggingFace):** Utilizado para inicializar o tokenizador e o modelo BERTimbau (`neuralmind/bert-base-portuguese-cased`).
- **APIs Groq e OpenRouter:** Plataformas de inferência rápida que fornecem acesso a Modelos de Linguagem de Grande Porte (LLMs), tais como Llama-3.1-8b e Llama-3.3-70b, para processar correlações semânticas detalhadas e emitir relatórios textuais estruturados.

---

## Arquitetura e Modelagem do Banco de Dados

A persistência dos dados estruturados ocorre em uma base PostgreSQL. A modelagem de entidades foi desenhada para vincular as atividades parlamentares de forma eficiente:

### Principais Tabelas
- **parlamentar:** Salva os dados biográficos e cadastrais do senador ou deputado (nome_civil, sigla_partido, sigla_uf, foto_url, tipo_parlamentar).
- **discurso:** Armazena a transcrição completa dos pronunciamentos e, quando cabível, o vetor de embedding semântico correspondente ao texto.
- **proposicao:** Registra as proposições legislativas que foram ou serão pautadas (ementa, ano, número, sigla).
- **votacao:** Detalha as votações ocorridas, incluindo o resultado geral (aprovada ou não) e o vetor de embedding semântico da ementa.
- **voto:** Tabela de junção n-para-n que relaciona um parlamentar à sua decisão individual em uma votação específica (Sim, Não, Abstenção, Obstrução, Ausente).
- **score_coerencia:** Tabela principal de métricas gerada pela inteligência artificial. Contém a pontuação final (0 a 100), o status de classificação (Coerente, Parcialmente Alinhado ou Divergente) e a justificativa gerada pelo modelo.

---

## Fluxo de Processamento de Coerência

O cálculo da coerência de um parlamentar ocorre por meio de uma comparação sistemática entre o que o político discursa na tribuna e como ele vota nas sessões ordinárias.

```
+------------------+     +------------------+
| API do Senado /  |     | Scraping de      |
| API da Câmara    |     | Pronunciamentos  |
+--------+---------+     +--------+---------+
         |                        |
         | Votos Nominais         | Transcrições de Discursos
         +------------+-----------+
                      |
                      v
      +---------------+---------------+
      | Mapeador de Similaridade      |
      | (Jaccard ou Cosseno)          |
      +---------------+---------------+
                      |
                      | Melhores Pares Candidatos
                      v
      +---------------+---------------+
      | Avaliação Cognitiva por LLM   |
      | (Llama via Groq/OpenRouter)   |
      +---------------+---------------+
                      |
                      | Scores de Coerência + Justificativa
                      v
      +---------------+---------------+
      | Persistência no Banco /       |
      | Geração de dashboard_metrics  |
      +-------------------------------+
```

### Detalhamento das Etapas do Fluxo
1. **Coleta de Histórico:** O sistema busca os últimos votos nominais do parlamentar e as transcrições textuais mais recentes de seus pronunciamentos públicos na tribuna.
2. **Alinhamento e Cruzamento Prévio:** Para cada ementa de votação nominal, calcula-se a similaridade sintática (via Jaccard local) em relação a todas as falas do parlamentar. O discurso que apresentar a maior similaridade sintática em relação à ementa é selecionado como o par candidato.
3. **Avaliação Cognitiva via LLM:** Os melhores pares (ementa e discurso associado) são formatados e transmitidos para a API de linguagem de grande porte. A LLM avalia a afinidade ideológica/temática em uma escala contínua de 0.0 a 1.0 e categoriza o voto em relação ao discurso.
4. **Cálculo da Métrica Consolidada:** O score geral do parlamentar é obtido pela média aritmética das notas de afinidade dos pares individuais analisados.
5. **Persistência de Resultados:** Os dados consolidados são gravados no banco PostgreSQL e exportados para o arquivo estático `dashboard_metrics.json`.

---

## Estrutura dos Scripts e do Servidor

O backend é organizado em torno de três rotinas funcionais bem definidas:

### 1. Servidor HTTP (api.py)
Expõe os endpoints REST acessados diretamente pelo painel frontend na porta 5001. A api.py implementa um sistema adaptativo de tolerância a falhas (fallbacks):
- **`/api/dashboard-metrics` (GET):** Tenta consultar o banco de dados PostgreSQL do Supabase para montar as estatísticas agregadas por partido e o ranking geral dos parlamentares. Se o banco estiver fora do ar, o servidor lê automaticamente os dados armazenados em `dashboard_metrics.json`.
- **`/api/analisar` (POST):** Recebe o identificador externo do parlamentar e aplica uma arquitetura **Cache-First**. Primeiro, busca os dados previamente gerados pela rotina de varredura (no `dashboard_metrics.json`) para economizar tokens e tempo de resposta. Caso o parlamentar seja inédito, executa, em tempo real, a busca de votos, a extração de pronunciamentos de forma assíncrona usando `ThreadPoolExecutor`, o cruzamento e o envio para as LLMs para gerar o score imediato na aba de consulta do frontend.
- **`/api/senadores` (GET):** Rota que atua como proxy direto para obter a listagem em tempo real dos senadores atualmente ativos em exercício parlamentar.

### 2. Rotina de Varredura Automatizada (scan_senators.py)
Orquestra o rastreamento em segundo plano (batch processing) dos parlamentares ativos divididos por partidos políticos específicos. Possui arquitetura resiliente do tipo Fail Fast com os seguintes mecanismos:
- **Pré-Filtro de Volume (Camada 1):** Antes de consumir recursos de scraping intensivo, a rotina faz uma verificação rápida do número de discursos do parlamentar por meio de chamadas simplificadas de API. Parlamentares sem atividade de tribuna no período são pulados.
- **Fallback Dinâmico de Histórico:** Caso o script detecte três parlamentares consecutivos com zero discursos (indicando um período de recesso ou dados escassos), ele expande a janela de tempo de busca retroativamente até o ano de 2022 e diminui os thresholds para evitar descarte prematuro.
- **Pré-Filtro de Semelhança Jaccard (Camada 2):** Reduz custos e volume de tokens de processamento ao selecionar apenas as votações com maior indício de afinidade de conteúdo em relação às falas, enviando somente esta amostra para a análise da LLM.

### 3. Pipeline BERTimbau Local (pipe.py)
Script focado em processamento local e privado. Ele carrega a rede neural de representação bidirecional de transformadores para o português (BERTimbau) por meio do PyTorch.
- Gera embeddings vetoriais densos de 768 dimensões para as sentenças dos discursos e proposições legislativas.
- Compara a similaridade de cosseno diretamente na máquina de execução para classificar os níveis de coerência temática de forma offline e independente de redes externas de IA.

---

## Autores

| Nome | Matrícula | GitHub |
|------|------|------|
| GUSTAVO ANTONIO RODRIGUES E SILVA | 242015380 | gus-ant |
