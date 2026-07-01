# Requisitos de Testes e Cobertura (Release 2)

Visando a entrega da **Release 2** do projeto Dito e Feito, foi estabelecido um requisito de qualidade rigoroso: atingir **pelo menos 90% de cobertura de código** nos testes unitários e de integração, garantindo a confiabilidade das regras de negócio e da interface com o usuário.

## Estratégia de Testes no Frontend

O frontend da aplicação foi construído com React e Vite. Para os testes, adotamos o ecossistema do **Vitest** em conjunto com o **React Testing Library**.

### O que foi feito:

1. **Configuração de Ambiente (Setup):**
   - Configuração do arquivo `vitest.config.js` habilitando o ambiente `jsdom`.
   - Adição da biblioteca `@vitest/coverage-v8` para relatórios detalhados de linhas cobertas.
   - Configuração global no `setupTests.js` para estender os matchers do `@testing-library/jest-dom`.

2. **Testes Unitários:**
   - **Utilitários (`utils/`):** Foram criados testes extensivos para formatadores (`formatters.js`) e para lógicas de agrupamento de dados de gráficos (`timeline.js`).
   - **Serviços (`services/`):** Mock da API e validação dos retornos de dados dos endpoints `/api/senadores`, `/api/deputados` e `/api/dashboard-metrics`.

3. **Testes de Integração de Componentes:**
   - Testes de renderização e de injeção de `props` para os componentes visuais.
   - **Mocking de Bibliotecas Externas:** Mocks avançados foram configurados para componentes que utilizam bibliotecas pesadas de terceiros (como `recharts` e `leaflet`), garantindo testes rápidos e que não quebram no `jsdom` (ex: `ResponsiveContainer` e `MapaBrasil`).

4. **Testes de Integração de Páginas:**
   - Criação de testes para a página principal (`VisaoGeral.jsx`).
   - Validação dos estados de carregamento (loading placeholders), da renderização dos dados na tela pós-carregamento e da correta integração entre múltiplos componentes dentro da página.

### Resultados Obtidos:

- A suíte de testes do frontend roda instantaneamente com o comando `npm run test`.
- O comando `npm run test:coverage` gera um relatório validando que a cobertura de testes nas pastas críticas (`src/utils`, `src/services`, `src/components`, `src/pages`) atingiu o marco exigido de **> 90% de code coverage**, cumprindo o requisito estipulado para a Release 2.

## Próximos Passos (Backend)

Após consolidar a cobertura no frontend, a próxima etapa da Release 2 é expandir o uso da ferramenta `pytest` no backend Python para certificar o funcionamento e a estabilidade da ingestão dos discursos e do processo de inferência via LLMs.
