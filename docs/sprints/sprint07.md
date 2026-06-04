# 📝 Ata de Reunião — Planejamento Inicial Release 2 (R2)

**Data:** 04 de Junho de 2026  
**Horário:** 13:00h  
**Local:** Discord (Online)  
**Objetivo Geral:** Alinhamento de próximos passos, divisão de tarefas da Sprint e planejamento macro para a Release 2.

---

## 👥 Participantes Presentes
*   **Juan Costa Indiano** (Scrum Master & Data Engineer)
*   **Gustavo** (Product Owner & Backend/IA)
*   **Gabriel Velho** (Frontend Developer)
*   **Sauhan Ferreira Melo** (Frontend Developer)

---

## 📌 Pautas Discutidas & Decisões

### 1. Contexto e Alinhamento para a R2
O time se reuniu para mapear os gargalos técnicos identificados no fechamento da Release 1 e traçar os objetivos iniciais para a evolução da plataforma **Dito e Feito**. Ficou definido que o ciclo atual de entregas terá como prazo limite de conclusão a próxima **quarta-feira**.

### 2. Divisão de Tarefas por Frente Técnica

#### 💻 Frontend (Gabriel Velho & Sauhan)
*   **Ajuste de Gráficos:** Refatorar e corrigir os componentes de visualização de dados (utilizando a biblioteca Recharts) para garantir a exibição correta das métricas de coerência parlamentar no dashboard.
*   **Avanço na Integração:** Iniciar o processo de amarração end-to-end com os endpoints do backend expostos na API Flask, tratando o fluxo de dados em tempo real.

#### ⚙️ Backend (Gustavo)
*   **Extração e Pesquisa de Dados:** Realizar o levantamento e implementar os mecanismos de busca de dados focados nos parlamentares da Câmara dos Deputados (votos nominais e proposições), expandindo o escopo que na R1 ficou concentrado majoritariamente no Senado.

#### 🗄️ Banco de Dados & Infraestrutura (Juan)
*   **Conteinerização (Docker):** Pesquisar e iniciar a implementação do ambiente conteinerizado via Docker para unificar a execução local do ecossistema do projeto.
*   **Otimização no Supabase:** Analisar o schema relacional criado e aplicar otimizações de índices (incluindo o pgvector) nas tabelas hospedadas na nuvem do Supabase para melhorar o tempo de resposta das queries.

---

## ⏱️ Cronograma de Controle
*   **Data da Reunião:** 04/06/2026
*   **Prazo Final das Issues:** Próxima quarta-feira (10/06/2026)
*   **Próximo Rito Ágil:** Review e Planning na conclusão do prazo.