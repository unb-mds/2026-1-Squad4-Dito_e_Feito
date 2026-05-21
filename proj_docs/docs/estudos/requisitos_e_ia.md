# **O que são Requisitos de Software + Aplicação de IA em Requisitos**

## 1. O que são Requisitos de Software?

Requisitos são a base de qualquer projeto. Eles definem o que o sistema deve fazer e como ele deve se comportar. Sem requisitos claros, a equipe de desenvolvimento constrói "no escuro".

### Categorias Principais

- **Requisitos Funcionais (RF)**: O comportamento do sistema. O que ele faz.
    - Exemplo: "O sistema deve permitir a emissão de nota fiscal em PDF."

- **Requisitos Não Funcionais (RNF)**: As qualidades do sistema. Como ele é.
    - Exemplo: "O sistema deve ser compatível com a LGPD" ou "O sistema deve suportar 10.000 acessos simultâneos."

---

## 2. O Ciclo de Vida dos Requisitos (Engenharia de Requisitos)

Aplicar requisitos em um projeto segue um fluxo lógico para garantir que nada se perca:

1. **Elicitação**: Investigação das necessidades (Entrevistas, Questionários).
2. **Análise**: Priorização e negociação do que é viável.
3. **Especificação**: Escrita formal (Documentos ou User Stories).
4. **Validação**: Checkpoint com o cliente ("É isso mesmo que você quer?").
5. **Gestão**: Controle de mudanças ao longo do tempo.

---

## 3. Como a IA Revoluciona os Requisitos

A IA não substitui o Analista de Requisitos, mas atua como um **Co-piloto**. Veja como aplicar a IA em cada etapa:

### A. Na Elicitação (Simulação de Stakeholders)

Você pode usar a IA para prever necessidades que o cliente talvez esqueça de mencionar.

- **Como fazer**: Peça à IA para listar "Edge Cases" (casos de borda) ou riscos de um projeto específico.
- **Prompt Exemplo**: 
    > "Vou criar um app de entrega de comida. Liste 10 requisitos de segurança e privacidade que são essenciais para este nicho."

### B. Na Escrita e Refinamento (User Stories)

A IA é excelente para transformar ideias brutas em formatos padrão de mercado.

- **Como fazer**: Forneça a ideia e peça para formatar como User Story com Critérios de Aceite.
- **Prompt Exemplo**:
    > "Transforme a funcionalidade de 'carrinho de compras' em uma User Story com 3 critérios de aceite técnicos."

### C. Na Identificação de Conflitos

A IA pode ler grandes documentos e encontrar requisitos que se contradizem.

- **Como fazer**: Cole dois requisitos e pergunte se há inconsistência lógica entre eles.

### D. Na Geração de Casos de Teste

A partir de um requisito funcional, a IA pode gerar o roteiro de testes automaticamente.

- **Como fazer**: "Com base neste requisito [texto], gere um plano de testes unitários e de integração."

---

## 4. Tabela Comparativa: Tradicional vs. Com IA

| Atividade | Abordagem Tradicional | Abordagem com IA |
|-----------|-----------------------|-----------------|
| Escrita | Manual, lenta e sujeita a erros de gramática. | Instantânea, padronizada e multilingue. |
| Análise de Risco | Baseada apenas na experiência da equipe. | Baseada em vastos padrões de dados globais. |
| Prototipagem | Dias para desenhar fluxos básicos. | Segundos para gerar o código/texto do fluxo. |
| Documentação | Frequentemente desatualizada. | Resumos automáticos de reuniões e logs. |

---

## 5. Ferramentas de IA para Requisitos

Além de modelos de chat (como este que estamos usando), existem ferramentas focadas:

- **Visure Solutions**: IA para gestão de requisitos complexos.
- **Modern Requirements**: Integração de IA diretamente no Azure DevOps.
- **Miro Assist**: Ajuda a gerar mapas mentais de requisitos visualmente.

> **Dica Prática**: A IA é ótima para o "primeiro rascunho", mas sempre valide o resultado. Ela pode "alucinar" requisitos que não fazem sentido para o orçamento ou para a tecnologia que você está usando.
