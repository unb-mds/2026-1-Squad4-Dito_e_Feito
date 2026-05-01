# Banco de Dados — Estudo e Referência Técnica

> Material de estudo produzido durante a **Sprint 03**, sobre PostgreSQL aplicado ao projeto **Dito e Feito**.

---

## Objetivo

Esta seção reúne:

- Aprendizado sobre PostgreSQL partindo de um conhecimento básico de SQL
- Documentação de decisões e estruturas relevantes ao sistema
- Referência para as próximas sprints (modelagem, migrations, queries)

---

## Contexto no Projeto

O **Dito e Feito** cruza discursos e votações de parlamentares para gerar **indicadores de coerência política** usando IA/NLP.

O banco de dados é responsável por persistir:

| Entidade | Descrição |
|---|---|
| `parlamentar` | Dados do deputado (nome, partido, estado, mandato) |
| `discurso` | Pronunciamentos e ementas com data e texto |
| `votacao` | Resultado por parlamentar em cada votação |
| `score_coerencia` | Indicadores gerados pelo módulo de IA |

---

## Conteúdo

- [Introdução ao PostgreSQL](introducao_postgresql.md) — o que é, diferenças, vantagens

---

## Fontes e Referências

- [Documentação oficial do PostgreSQL](https://www.postgresql.org/docs/current/)
- [PostgreSQL Tutorial (em inglês)](https://www.postgresqltutorial.com/)
- [Tutorial em português — DevMedia](https://www.devmedia.com.br/postgresql/)
