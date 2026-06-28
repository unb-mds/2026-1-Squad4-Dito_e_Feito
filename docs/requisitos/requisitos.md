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

| ID | Título | Prioridade | Descrição / Finalidade de Interpretação |
|----|--------|------------|-----------|
| RF01 | Coleta de dados legislativos | 🔴 Alta | Importar discursos, ementas e justificativas via APIs (Câmara, Senado) ou scraping estruturado. |
| RF02 | Coleta de registros de votação | 🔴 Alta | Capturar votos nominais por parlamentar, sessão e projeto de lei, associados ao texto debatido. |
| RF03 | Análise de coerência discurso–voto | 🔴 Alta | Comparar semanticamente o texto de um discurso/justificativa com o sentido do voto. |
| RF04 | Score de coerência por parlamentar | 🔴 Alta | Calcular e exibir índice individual de alinhamento entre posição discursiva e votação. [Componentes: `Perfil.jsx` / `PerfilPolitico.jsx`] |
| RF05 | Filtro por partido | 🔴 Alta | Permitir filtrar políticos por partido na aba principal. [Páginas: `Politicos.jsx`, `Partidos.jsx`] |
| RF06 | Filtro por estado | 🔴 Alta | Permitir filtrar políticos por estado na aba principal. [Páginas: `Politicos.jsx`, `Estados.jsx`] |
| RF07 | Aba visão geral com busca | 🔴 Alta | Ferramenta de busca e visão geral na tela principal. [Página: `VisaoGeral.jsx`] |
| RF07.1 | Tema Dark | 🔴 Alta | Modo escuro (dark mode) obrigatório na interface. |
| **RF07.2** | **Mapeamento Geográfico de Coerência** | 🔴 Alta | **Descrição:** Mapa interativo do Brasil colorido dinamicamente com base na coerência média de cada estado.<br>*Finalidade:* Identificar de forma visual e regionalizada quais unidades federativas apresentam bancadas mais ou menos coerentes. [Componente: `MapaBrasil.jsx`] |
| **RF08** | **Gráfico de Evolução Temporal do Parlamentar** | 🟠 Média | **Descrição:** Linha do tempo interativa (LineChart) mapeando a flutuação do score de coerência do senador/deputado ao longo dos meses da legislatura.<br>*Finalidade:* Permitir que o usuário identifique se a consistência do político é estável ou se ele oscila e muda de postura em períodos específicos. [Componente: `GraficoTendencias.jsx`] |
| RF09 | Filtros e busca avançada | 🟠 Média | Filtrar por parlamentar, partido, tema, período, UF e tipo de votação. |
| RF10 | Comparação entre parlamentares | 🟠 Média | Comparação lado a lado de scores de coerência entre dois ou mais parlamentares. [Página: `Comparacao.jsx`] |
| RF11 | Painel de alertas de divergência | 🟠 Média | Destacar automaticamente casos de alta divergência entre discurso e voto. |
| **RF12** | **Gráfico de Desvio e Contexto Partidário** | 🟠 Média | **Descrição:** Gráfico de barras emparelhadas (BarChart) posicionando o score do parlamentar lado a lado com a média histórica do seu próprio partido e a média geral da casa.<br>*Finalidade:* Contextualizar o comportamento do político, revelando de forma imediata se ele atua como dissidente/independente. [Componente: `GraficoBarras.jsx`] |
| RF13 | Aba de comparação (VS) | 🟠 Média | Tela dedicada para selecionar 2 políticos e comparar estatísticas. [Página: `Comparacao.jsx`] |
| **RF13.1** | **Gráfico de Representatividade e Coerência das Legendas** | 🟠 Média | **Descrição:** Gráfico de rosca/pizza (PieChart) na Visão Geral demonstrando a distribuição volumétrica de parlamentares por partido associado aos seus pesos de coerência.<br>*Finalidade:* Mapear o panorama de integridade dos blocos partidários. [Componente: `GraficoPartidos.jsx`] |
| RF14 | Lista de todos os políticos | 🟠 Média | Grande lista com todos os políticos disponíveis em formato de cards. [Página: `Politicos.jsx`] |
| RF15 | Exportação de relatórios | 🟢 Baixa | Gerar relatórios em CSV/PDF por parlamentar, período ou tema. |
| RF16 | Histórico de legislaturas | 🟢 Baixa | Suporte a múltiplas legislaturas para análise longitudinal. |
| RF17 | Aba de geração de relatórios | 🟢 Baixa | Tela dedicada para o usuário baixar relatórios customizados. [Página: `Relatorios.jsx`] |

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

## Partes do Frontend e Gráficos

Esta seção descreve a estrutura do frontend (páginas e componentes) e detalha os gráficos implementados no painel, mapeando-os para os seus respectivos requisitos e objetivos.

### Páginas Principais
- **Visão Geral (`VisaoGeral.jsx`)**: Dashboard central contendo os KPIs principais, gráficos agregados e o mapeamento de coerência (RF07).
- **Políticos (`Politicos.jsx`)**: Listagem completa de parlamentares com filtros (RF14, RF05, RF06).
- **Perfil do Político (`PerfilPolitico.jsx` / `Perfil.jsx`)**: Raio-X individual de um parlamentar, exibindo histórico de votos e discursos (RF04).
- **Comparação (`Comparacao.jsx`)**: Tela para selecionar e comparar métricas lado a lado entre parlamentares (RF13, RF10).
- **Relatórios (`Relatorios.jsx`)**: Área dedicada para exportação de dados (RF17).
- **Sobre (`Sobre.jsx`)**: Página institucional do projeto.

### Gráficos e Objetivos (Conforme Requisitos)

- **Gráfico de Evolução Temporal do Parlamentar (RF08 - `GraficoTendencias.jsx`)**
  - **Descrição:** Linha do tempo interativa (LineChart) mapeando a flutuação do score de coerência do senador/deputado ao longo dos meses da legislatura.
  - **Objetivo / Finalidade:** Permitir que o usuário identifique se a consistência do político é estável ou se ele oscila e muda de postura em períodos específicos (ex: proximidade de votações críticas).

- **Gráfico de Desvio e Contexto Partidário (RF12 - `GraficoBarras.jsx`)**
  - **Descrição:** Gráfico de barras emparelhadas (BarChart) posicionando o score do parlamentar lado a lado com a média histórica do seu próprio partido e a média geral da casa.
  - **Objetivo / Finalidade:** Contextualizar o comportamento do político, revelando de forma imediata se ele segue a linha ideológica majoritária da sua legenda ou se atua como um dissidente/independente em relação à média.

- **Gráfico de Representatividade e Coerência das Legendas (RF13.1 - `GraficoPartidos.jsx` / PieChart)**
  - **Descrição:** Gráfico de rosca/pizza (PieChart) na Visão Geral demonstrando a distribuição volumétrica de parlamentares por partido associado aos seus respectivos pesos de coerência.
  - **Objetivo / Finalidade:** Mapear o panorama de integridade dos blocos partidários, ajudando a interpretar quais partidos mantêm maior fidelidade ideológica em bancada.

- **Mapeamento Geográfico de Coerência (`MapaBrasil.jsx`)**
  - **Descrição:** Mapa interativo do Brasil colorido dinamicamente com base na coerência média de cada estado.
  - **Objetivo / Finalidade:** Identificar de forma visual e regionalizada quais unidades federativas apresentam bancadas mais ou menos coerentes, em escala de cores verde.

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