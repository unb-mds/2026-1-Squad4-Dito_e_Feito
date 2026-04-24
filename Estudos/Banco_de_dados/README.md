# 🗄️ Banco de Dados — Dito e Feito

> Documentação de estudo e referência técnica sobre PostgreSQL aplicado ao projeto **Dito e Feito** — sistema de análise de coerência política com IA.

---

## 📁 Estrutura desta pasta

```
banco-de-dados/
├── README.md                        ← este arquivo (índice geral)
├── 01-introducao-postgresql.md      ← o que é, diferenças, vantagens
├── 02-tipos-de-dados.md             ← tipos relevantes para o projeto
├── 03-modelagem-entidades.md        ← esboço do diagrama ER do sistema
└── 04-queries-e-boas-praticas.md    ← SQL no Postgres, índices, transações
```

---

## 🎯 Objetivo

Esta pasta reúne o material de estudo e documentação produzido durante a **Sprint 03** do projeto, conforme responsabilidade assumida na divisão de tecnologias da equipe.

O foco é:
- Aprender PostgreSQL partindo de um conhecimento básico de SQL
- Documentar decisões e estruturas relevantes ao sistema
- Servir como referência para as próximas sprints (modelagem, migrations, queries)

---

## 🔗 Contexto do Projeto

O **Dito e Feito** é um sistema que cruza discursos e votações de parlamentares para gerar **indicadores de coerência política** usando IA/NLP.

O banco de dados é responsável por persistir:

| Entidade | Descrição |
|---|---|
| `parlamentar` | Dados do deputado (nome, partido, estado, mandato) |
| `discurso` | Pronunciamentos e ementas com data e texto |
| `votacao` | Resultado por parlamentar em cada votação |
| `score_coerencia` | Indicadores gerados pelo módulo de IA |

---

## 📚 Fontes e Referências

- [Documentação oficial do PostgreSQL](https://www.postgresql.org/docs/current/)
- [PostgreSQL Tutorial (em inglês)](https://www.postgresqltutorial.com/)
- [Tutorial em português — DevMedia](https://www.devmedia.com.br/postgresql/)
- [Artigo: PostgreSQL vs MySQL — DigitalOcean](https://www.digitalocean.com/community/tutorials/sqlite-vs-mysql-vs-postgresql-a-comparison-of-relational-database-management-systems)