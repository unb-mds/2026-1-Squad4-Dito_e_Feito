# Requisitos do Projeto

## Visão Geral

Sistema para **análise de coerência entre discursos e votos de parlamentares**, utilizando técnicas de NLP e visualização de dados.

### Legenda de Prioridades

| Símbolo | Prioridade |
|---|---|
| 🔴 | Alta |
| 🟠 | Média |
| 🟢 | Baixa |

---

## Requisitos Funcionais (RF)

| ID | Título | Prioridade | Descrição |
|----|--------|------------|-----------|
| RF01 | Coleta de dados legislativos | 🔴 Alta | Importar discursos, ementas e justificativas via APIs (Câmara, Senado) ou scraping estruturado. |
| RF02 | Coleta de registros de votação | 🔴 Alta | Capturar votos nominais por parlamentar, sessão e projeto de lei, associados ao texto debatido. |
| RF03 | Análise de coerência discurso–voto | 🔴 Alta | Comparar semanticamente o texto de um discurso/justificativa com o sentido do voto. |
| RF04 | Score de coerência por parlamentar | 🔴 Alta | Calcular e exibir índice individual de alinhamento entre posição discursiva e votação. |
| RF05 | Filtro por partido | 🔴 Alta | Permitir filtrar políticos por partido na aba principal. |
| RF06 | Filtro por estado | 🔴 Alta | Permitir filtrar políticos por estado na aba principal. |
| RF07 | Aba visão geral com busca | 🔴 Alta | Ferramenta de busca e visão geral na tela principal. |
| RF07.1 | Tema Dark | 🔴 Alta | Modo escuro (dark mode) obrigatório na interface. |
| RF08 | Evolução do posicionamento no tempo | 🟠 Média | Linha do tempo com mudanças de posição detectadas. |
| RF09 | Filtros e busca avançada | 🟠 Média | Filtrar por parlamentar, partido, tema, período, UF e tipo de votação. |
| RF10 | Comparação entre parlamentares | 🟠 Média | Comparação lado a lado de scores de coerência entre dois ou mais parlamentares. |
| RF11 | Painel de alertas de divergência | 🟠 Média | Destacar automaticamente casos de alta divergência entre discurso e voto. |
| RF12 | Gráfico em relação à média e ao partido | 🟠 Média | Exibir posição do parlamentar frente à média geral e ao seu partido. |
| RF13 | Aba de comparação (VS) | 🟠 Média | Tela dedicada para selecionar 2 políticos e comparar estatísticas. |
| RF14 | Lista de todos os políticos | 🟠 Média | Grande lista com todos os políticos disponíveis em formato de cards. |
| RF15 | Exportação de relatórios | 🟢 Baixa | Gerar relatórios em CSV/PDF por parlamentar, período ou tema. |
| RF16 | Histórico de legislaturas | 🟢 Baixa | Suporte a múltiplas legislaturas para análise longitudinal. |
| RF17 | Aba de geração de relatórios | 🟢 Baixa | Tela dedicada para o usuário baixar relatórios customizados. |

---

## Requisitos de IA / NLP (RI)

| ID | Título | Prioridade | Descrição |
|----|--------|------------|-----------|
| RI01 | Embeddings semânticos de texto | 🔴 Alta | Vetorizar discursos com modelos como BERTimbau ou multilingual-e5. |
| RI02 | Classificação de posição no texto | 🔴 Alta | Detectar se o discurso expressa apoio, oposição ou neutralidade. |
| RI03 | Detecção de mudança de posição | 🔴 Alta | Identificar virada discursiva comparando embeddings ao longo do tempo. |
| RI04 | Rotulagem temática automática | 🟠 Média | Classificar textos por área temática (saúde, educação, segurança etc.). |
| RI05 | Sumarização de discursos | 🟠 Média | Gerar resumo curto de discursos longos para exibição no painel. |
| RI06 | Explicabilidade do score | 🟢 Baixa | Destacar trechos do discurso que mais contribuíram para a divergência. |

---

## Requisitos de Dados (RD)

| ID | Título | Prioridade | Descrição |
|----|--------|------------|-----------|
| RD01 | Normalização de entidades | 🔴 Alta | Resolver e unificar nomes de parlamentares, partidos e proposições. |
| RD02 | Versionamento e rastreabilidade | 🔴 Alta | Registrar data/hora e fonte de cada dado coletado. |
| RD03 | Atualização incremental | 🟠 Média | Coleta incremental sem reprocessar todo o histórico. |
| RD04 | Cobertura histórica | 🟢 Baixa | Definir escopo mínimo de cobertura (ex: últimas 2 legislaturas). |

---

## Requisitos Não Funcionais (RNF)

| ID | Título | Prioridade | Descrição |
|----|--------|------------|-----------|
| RNF01 | Desempenho de consultas | 🔴 Alta | Consultas devem retornar em menos de 3s para datasets de até 500 mil registros. |
| RNF02 | Reprodutibilidade do pipeline | 🔴 Alta | Todo o pipeline deve ser reprodutível via script documentado. |
| RNF03 | Transparência metodológica | 🔴 Alta | Cada score exibido deve ter documentação explicando como foi calculado. |
| RNF04 | Escalabilidade do NLP | 🟠 Média | Pipeline de inferência deve processar ≥ 10 mil textos/hora. |
| RNF05 | Usabilidade do painel | 🟠 Média | Interface navegável sem treinamento por jornalistas e pesquisadores. |
| RNF06 | Manutenibilidade do código | 🟠 Média | Código com testes unitários e documentação inline. |
| RNF07 | Conformidade com LGPD | 🟢 Baixa | Apenas dados públicos; sem dados pessoais sensíveis além do mandato. |
| RNF08 | Acessibilidade do painel | 🟢 Baixa | Visualizações com alternativas textuais e sem dependência exclusiva de cores. |

---

## Resumo Estatístico

| Tipo | Total | 🔴 Alta | 🟠 Média | 🟢 Baixa |
|------|-------|---------|---------|---------|
| RF (Funcionais) | 17 | 7 | 7 | 3 |
| RI (IA/NLP) | 6 | 3 | 2 | 1 |
| RD (Dados) | 4 | 2 | 1 | 1 |
| RNF (Não Funcionais) | 8 | 3 | 3 | 2 |
| **Total** | **35** | **15** | **13** | **7** |

---

## Entregáveis de Alta Prioridade

1. RF01 — Coleta de dados legislativos  
2. RF02 — Coleta de registros de votação  
3. RF03 — Análise de coerência discurso–voto  
4. RF04 — Score de coerência por parlamentar  
5. RI01 — Embeddings semânticos de texto  
6. RI02 — Classificação de posição no texto  
7. RI03 — Detecção de mudança de posição  
8. RD01 — Normalização de entidades  
9. RD02 — Versionamento e rastreabilidade  
10. RNF01 — Desempenho de consultas  
11. RNF02 — Reprodutibilidade do pipeline  
12. RNF03 — Transparência metodológica  
