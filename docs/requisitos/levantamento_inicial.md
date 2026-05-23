# Levantamento Inicial de Requisitos

> Documento produzido na **Sprint 02** com o primeiro levantamento de requisitos do sistema.

---

## Requisitos Funcionais (RF)

Estes descrevem as funcionalidades diretas que o usuário final terá.

| ID | Descrição |
|----|-----------|
| **RF01** | **Integração de Dados (Data Ingestion):** O sistema deve consumir dados de fontes oficiais (API da Câmara e Senado) para obter ementas, justificativas de projetos e registros de votos nominais. |
| **RF02** | **Processamento de Linguagem Natural (NLP):** O sistema deve extrair o "sentimento" ou "vetor de opinião" de um texto, classificando-o em escala (ex: -1 Contrário, 0 Neutro, 1 Favorável). |
| **RF03** | **Categorização Temática:** O software deve agrupar automaticamente discursos e votos por temas (Saúde, Educação, Economia) para garantir que a comparação seja feita entre itens correlatos. |
| **RF04** | **Cálculo de Índice de Coerência:** O sistema deve calcular a distância matemática entre a intenção declarada (discurso) e a ação realizada (voto). |
| **RF05** | **Análise Temporal (Timeline):** O sistema deve gerar um histórico do parlamentar, permitindo identificar quando houve mudança de posicionamento sobre um mesmo tema. |
| **RF06** | **Dashboard de Visualização:** Interface para exibir gráficos de dispersão (discursos vs. votos) e alertas de "Alta Divergência". |

---

## Requisitos Não Funcionais (RNF)

Estes definem a qualidade e as limitações técnicas.

| ID | Descrição |
|----|-----------|
| **RNF01** | **Precisão do Modelo:** O modelo de NLP deve atingir precisão mínima > 80% em testes de validação com dados rotulados manualmente. |
| **RNF02** | **Escalabilidade:** O sistema deve processar o histórico de uma legislatura inteira (4 anos) em tempo aceitável. |
| **RNF03** | **Transparência (Explainability):** Para cada análise de divergência, o sistema deve exibir os trechos do texto que levaram àquela conclusão. |
| **RNF04** | **Tecnologias:** Backend em Python com `Pandas`, `spaCy/HuggingFace` e bancos de dados vetoriais (`ChromaDB` ou `Pinecone`). |
| **RNF05** | **Atualização de Dados:** O sistema deve buscar novos dados via API de forma agendada (ex: semanalmente). |

---

## Regras de Negócio (RN)

As "leis" que o software deve seguir para que o resultado faça sentido político.

| ID | Descrição |
|----|-----------|
| **RN01** | **Votos Irrelevantes:** Votos em questões de ordem ou ritos procedimentais **não** devem ser contabilizados para o índice de coerência ideológica. |
| **RN02** | **Peso das Ementas:** A justificativa escrita de um projeto de autoria do próprio parlamentar deve ter **peso maior** do que um discurso improvisado em plenário. |

---

!!! note "Próximo passo"
    Este levantamento foi refinado e evoluiu para o documento de [Requisitos Gerais Oficiais](requisitos.md), gerado na Sprint 03.
