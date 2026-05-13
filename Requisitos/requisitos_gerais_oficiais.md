# Painel de Coerência Política: Requisitos

## Visão Geral
Sistema para análise de coerência entre discursos e votos de parlamentares, utilizando técnicas de NLP e visualização de dados.

## Índice de Requisitos
- **RF**: Requisitos Funcionais (10 itens)
- **RI**: Requisitos de IA/NLP (6 itens)
- **RD**: Requisitos de Dados (4 itens)
- **RNF**: Requisitos Não Funcionais (8 itens)

### Legenda de Prioridades
- 🔴 **Alta prioridade**
- 🟠 **Média prioridade**
- 🟢 **Baixa prioridade**

---

## Requisitos Funcionais (RF)

| ID | Título | Prioridade | Descrição |
|----|--------|------------|-----------|
| RF01 | Coleta de dados legislativos | 🔴 Alta | Importar discursos, ementas e justificativas de projetos via APIs (Câmara, Senado) ou scraping estruturado. |
| RF02 | Coleta de registros de votação | 🔴 Alta | Capturar votos nominais por parlamentar, sessão e projeto de lei, associados ao texto debatido. |
| RF03 | Análise de coerência discurso–voto | 🔴 Alta | Comparar semanticamente o texto de um discurso/justificativa com o sentido do voto (sim/não/abstenção). |
| RF04 | Score de coerência por parlamentar | 🔴 Alta | Calcular e exibir índice individual de alinhamento entre posição discursiva e votação, por mandato ou período. |
| RF05 | filtro por partido | 🔴 Alta | ter na aba principal uma maneira de filtrar politicos por partido para selecionar |
| RF06 | filtro por estado | 🔴 Alta | ter na aba principal uma maneira de filtrar politicos por estado para selecionar |
| RF07 | aba visão geral com ferramenta de busca | 🔴 Alta | ter na aba principal uma maneira de filtrar politicos por estado para selecionar |
| RF07.1 | tema Dark | 🔴 Alta | colocar um modo Dark no site |
| RF08 | Evolução do posicionamento no tempo | 🟠 Média | Visualizar linha do tempo com mudanças de posição detectadas, destacando viradas significativas. |
| RF09 | Filtros e busca avançada | 🟠 Média | Filtrar por parlamentar, partido, tema/etiqueta, período, UF e tipo de votação. |
| RF10 | Comparação entre parlamentares | 🟠 Média | Permitir comparação lado a lado de scores de coerência e evolução entre dois ou mais parlamentares. |
| RF11 | Painel de alertas de divergência | 🟠 Média | Destacar automaticamente casos de alta divergência entre discurso e voto para análise prioritária. |
| RF12 | gráfico parlamentar em relação a media e o próprio partido | 🟠 Média | Destacar automaticamente casos de alta divergência entre discurso e voto para análise prioritária. |
| RF13 | aba de comparação (VS) | 🟠 Média | aba que permite selecionar 2 politicos e comparar as estatisticas |
| RF14 | aba com todos os políticos analisados | 🟠 Média | ter uma grande lista com todos os politicos disponiveis em card (barras) |
| RF15 | Exportação de relatórios | 🟢 Baixa | Gerar relatórios em CSV/PDF por parlamentar, período ou tema, com scores e trechos justificando a análise. |
| RF16 | Histórico de legislaturas | 🟢 Baixa | Suporte a múltiplas legislaturas para permitir análise longitudinal de mandatos anteriores. |
| RF17 | aba que gera relatórios | 🟢 Baixa | ter uma aba que permite o usuario baixar relatorios |


## Requisitos de IA / NLP (RI)

| ID | Título | Prioridade | Descrição |
|----|--------|------------|-----------|
| RI01 | Embeddings semânticos de texto | 🔴 Alta | Vetorizar discursos e justificativas com modelos como BERTimbau ou multilingual-e5 para capturar sentido contextual. |
| RI02 | Classificação de posição no texto | 🔴 Alta | Detectar se o discurso expressa apoio, oposição ou neutralidade a uma proposição usando classificador supervisionado. |
| RI03 | Detecção de mudança de posição | 🔴 Alta | Identificar virada discursiva ao longo do tempo comparando embeddings de discursos do mesmo parlamentar sobre tema similar. |
| RI04 | Rotulagem temática automática | 🟠 Média | Classificar automaticamente os textos por área temática (saúde, educação, segurança etc.) usando zero-shot ou fine-tuning. |
| RI05 | Sumarização de discursos | 🟠 Média | Gerar resumo curto de discursos longos para exibição no painel, preservando a posição principal detectada. |
| RI06 | Explicabilidade do score | 🟢 Baixa | Destacar trechos do discurso que mais contribuíram para a divergência detectada (ex.: LIME ou atenção do modelo). |

## Requisitos de Dados (RD)

| ID | Título | Prioridade | Descrição |
|----|--------|------------|-----------|
| RD01 | Normalização de entidades | 🔴 Alta | Resolver e unificar nomes de parlamentares, partidos e proposições nas diferentes fontes de dados coletadas. |
| RD02 | Versionamento e rastreabilidade | 🔴 Alta | Registrar data/hora e fonte de cada dado coletado para garantir reprodutibilidade das análises. |
| RD03 | Atualização incremental | 🟠 Média | Suporte a coleta incremental (apenas novos registros) sem reprocessar todo o histórico a cada execução. |
| RD04 | Cobertura histórica | 🟢 Baixa | Definir escopo mínimo de cobertura (ex.: últimas 2 legislaturas) e documentar lacunas de dados. |

## Requisitos Não Funcionais (RNF)

| ID | Título | Prioridade | Descrição |
|----|--------|------------|-----------|
| RNF01 | Desempenho de consultas | 🔴 Alta | Consultas ao painel devem retornar em menos de 3s para datasets de até 500 mil registros. |
| RNF02 | Reprodutibilidade do pipeline | 🔴 Alta | Todo o pipeline (coleta → NLP → score) deve ser reprodutível via script documentado e com dependências fixadas. |
| RNF03 | Transparência metodológica | 🔴 Alta | Cada score exibido deve ter documentação acessível explicando como foi calculado e suas limitações. |
| RNF04 | Escalabilidade do NLP | 🟠 Média | Pipeline de inferência deve processar pelo menos 10 mil textos por hora com hardware padrão (GPU T4 ou CPU). |
| RNF05 | Usabilidade do painel | 🟠 Média | Interface deve ser navegável sem treinamento por jornalistas e pesquisadores não técnicos. |
| RNF06 | Manutenibilidade do código | 🟠 Média | Código Python com testes unitários cobrindo ao menos funções de score e NLP, com documentação inline. |
| RNF07 | Conformidade com LGPD | 🟢 Baixa | Dados processados devem ser de caráter público. Nenhum dado pessoal sensível além do mandato político deve ser armazenado. |
| RNF08 | Acessibilidade do painel | 🟢 Baixa | Visualizações devem ter alternativas textuais e não depender exclusivamente de cores para transmitir informação. |

---

## Resumo Estatístico

| Tipo | Total | Alta | Média | Baixa |
|------|-------|------|-------|-------|
| RF (Funcionais) | 17 | 7 | 7 | 3 |
| RI (IA/NLP) | 6 | 3 | 2 | 1 |
| RD (Dados) | 4 | 2 | 1 | 1 |
| RNF (Não Funcionais) | 8 | 3 | 3 | 2 |
| **Total** | **35** | **15** | **13** | **7** |

## Principais Entregáveis Prioritários (Alta Prioridade)

1. **RF01** - Coleta de dados legislativos
2. **RF02** - Coleta de registros de votação
3. **RF03** - Análise de coerência discurso–voto
4. **RF04** - Score de coerência por parlamentar
5. **RI01** - Embeddings semânticos de texto
6. **RI02** - Classificação de posição no texto
7. **RI03** - Detecção de mudança de posição
8. **RD01** - Normalização de entidades
9. **RD02** - Versionamento e rastreabilidade
10. **RNF01** - Desempenho de consultas
11. **RNF02** - Reprodutibilidade do pipeline
12. **RNF03** - Transparência metodológica
