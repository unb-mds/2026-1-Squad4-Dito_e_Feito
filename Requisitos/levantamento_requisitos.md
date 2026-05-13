## Relatório de Requisitos Inicial: Monitor de Coerência Política

### 1. Requisitos Funcionais (RF)

Estes descrevem as funcionalidades diretas que o usuário final terá.

- **RF01 - Integração de Dados (Data Ingestion):** O sistema deve consumir dados de fontes oficiais (API da Câmara e Senado) para obter ementas, justificativas de projetos e o registro de votos nominais.
    
- **RF02 - Processamento de Linguagem Natural (NLP):** O sistema deve extrair o "sentimento" ou "vetor de opinião" de um texto (discurso/ementa), classificando-o em uma escala (ex: -1 para Contrário, 0 para Neutro, 1 para Favorável).
    
- **RF03 - Categorização Temática:** O software deve agrupar automaticamente discursos e votos por temas (Saúde, Educação, Economia) para garantir que a comparação seja feita entre itens correlatos.
    
- **RF04 - Cálculo de Índice de Coerência:** O sistema deve calcular a distância matemática entre a intenção declarada (discurso) e a ação realizada (voto).
    
- **RF05 - Análise Temporal (Timeline):** O sistema deve gerar um histórico do parlamentar, permitindo identificar em que momento houve mudança de posicionamento sobre um mesmo tema ao longo do tempo.
    
- **RF06 - Dashboard de Visualização:** Interface para exibir gráficos de dispersão (discursos vs. votos) e alertas de "Alta Divergência".
    

---

### 2. Requisitos Não Funcionais (RNF)

Estes definem a qualidade e as limitações técnicas.

- **RNF01 - Precisão do Modelo (Accuracy):** O modelo de NLP deve atingir uma precisão mínima de **X%** (recomendado > 80%) em testes de validação com dados rotulados manualmente.
    
- **RNF02 - Escalabilidade:** O sistema deve ser capaz de processar o histórico de uma legislatura inteira (4 anos) em menos de **Y** horas.
    
- **RNF03 - Transparência (Explainability):** Para cada análise de divergência, o sistema deve exibir os trechos do texto que levaram àquela conclusão (evitando o efeito "caixa preta" da IA).
    
- **RNF04 - Tecnologias Utilizadas:** O backend deve ser desenvolvido em **Python**, utilizando bibliotecas como `Pandas`, `Spacy/HuggingFace` e bancos de dados vetoriais ( `ChromaDB` ou `Pinecone`).
    
- **RNF05 - Atualização de Dados:** O sistema deve realizar buscas por novos dados via API de forma agendada (ex: semanalmente).
    

---

### 3. Regras de Negócio (RN)

As "leis" que o software deve seguir para que o resultado faça sentido político.

- **RN01 - Votos Irrelevantes:** Votos em questões de ordem ou ritos procedimentais não devem ser contabilizados para o índice de coerência ideológica.
    
- **RN02 - Peso das Ementas:** A justificativa escrita de um projeto de autoria do próprio parlamentar deve ter um peso maior na análise de discurso do que um discurso improvisado em plenário.
    
