# Documentação do Frontend

Este documento descreve detalhadamente a arquitetura, o funcionamento, as tecnologias e a estrutura de telas da interface frontend do projeto Dito e Feito. O frontend fornece um painel interativo e moderno para a visualização das análises de coerência de deputados e senadores brasileiros.

---

## Arquitetura Geral do Frontend

A interface foi projetada como uma Single Page Application (SPA) reativa e componentizada. Ela consome dados estruturados expostos pela API Flask de maneira assíncrona, exibindo gráficos estatísticos e painéis individuais para cada parlamentar.

### Principais Diretrizes do Projeto
- **Visual Moderno e Responsivo:** Desenvolvimento com foco em legibilidade e adaptabilidade em dispositivos móveis e desktops.
- **Gráficos Interativos:** Plotagem de dados de dispersão, barras e linhas temporais para identificar tendências políticas de coerência.
- **Tratamento de Falhas e Tolerância:** Implementação de interceptores de rede que lidam com lentidão do servidor de IA e aplicam fallbacks quando a API está indisponível.

---

## Tecnologias e Dependências

As principais ferramentas e bibliotecas que compõem o ecossistema do frontend são:

### Estrutura e Ferramental de Desenvolvimento
- **React (versão 19):** Biblioteca núcleo para criação de componentes de interface baseados em estados reativos.
- **Vite:** Ferramenta de build ultra-rápida utilizada como servidor de desenvolvimento local e empacotador de produção.
- **React Router DOM (versão 7):** Gerenciador de rotas para navegação interna entre as telas sem recarregamento de página.

### Visualização e Estilização
- **TailwindCSS (versão 4):** Framework CSS utilitário para design rápido e consistência de estilos com design tokens.
- **PostCSS e Autoprefixer:** Compiladores CSS integrados para otimização e retrocompatibilidade com diferentes navegadores.
- **Recharts:** Biblioteca de gráficos modular baseada em React e SVG para renderizar gráficos de tendências, barras e distribuição dos partidos.
- **Lucide React:** Coleção de ícones vetoriais leves e consistentes com o design system do projeto.

### Conexão e Comunicação
- **Axios:** Cliente HTTP para efetuar as requisições para a API Python na porta 5000/5001.

---

## Estrutura do Código e Diretórios

O diretório de código-fonte está estruturado de forma a separar componentes reutilizáveis, lógica de páginas, estilos globais e serviços de comunicação externa:

### pasta src/
- **components/:** Componentes de interface compartilhados e gráficos específicos.
  - `Sidebar.jsx`: Painel de navegação lateral fixa contendo links rápidos de telas.
  - `Header.jsx` e `Footer.jsx`: Cabeçalho informativo e rodapé da aplicação.
  - `PoliticoCard.jsx`: Card individual para renderizar resumo visual do parlamentar.
  - `GraficoBarras.jsx`, `GraficoPartidos.jsx`, `GraficoTendencias.jsx`, `GraficoRadar.jsx`: Componentes que encapsulam os gráficos do Recharts.
  - `Skeleton.jsx`: Efeito visual de carregamento (placeholder animado) exibido enquanto os dados da API são processados.
- **pages/:** Componentes que representam as visões (telas) completas da aplicação.
  - `VisaoGeral.jsx`: Painel inicial com os principais KPIs e rankings do sistema.
  - `Politicos.jsx`: Interface de busca avançada com filtros por estado e partido político.
  - `Perfil.jsx` / `PerfilPolitico.jsx`: Tela detalhada de auditoria individual do parlamentar, cruzando seus discursos e votações.
  - `Comparacao.jsx`: Ferramenta para comparar o score de dois parlamentares ou partidos diferentes.
  - `Relatorios.jsx`: Tela para consulta e geração de relatórios consolidados.
  - `Sobre.jsx`: Página institucional detalhando os objetivos do projeto Dito e Feito e o funcionamento dos modelos de IA.
- **services/:** Configurações de API.
  - `api.js`: Cliente Axios configurado para conexão com a API Flask do backend.
- **App.jsx e main.jsx:** Arquivos de inicialização global do React, definição de rotas e injeção do CSS.
- **index.css e App.css:** Arquivos de estilização geral, contendo variáveis de cores (design tokens) e fontes do sistema.

---

## Comunicação com o Servidor (Services)

O arquivo `src/services/api.js` centraliza as chamadas de rede do sistema. O cliente Axios foi configurado de forma a suportar o tempo de processamento necessário para os modelos de IA:

### Principais Características
- **Timeout de 90 segundos:** O processamento de PLN (especialmente com BERT local ou requisições complexas às LLMs) pode requerer tempo de processamento elevado. Por isso, o timeout de requisições foi definido em 90.000ms.
- **Interceptores de Resposta:** Padronizam respostas de erro amigáveis caso o servidor Flask esteja offline ou ocorra um tempo limite de processamento de dados (timeout), exibindo alertas apropriados na interface sem quebrar a renderização da página.

### Endpoints Consumidos
- **`GET /api/senadores`:** Retorna a listagem dos senadores ativos.
- **`GET /api/deputados`:** Retorna a listagem dos deputados ativos.
- **`POST /api/analisar`:** Envia as informações do parlamentar (ID e tipo) e aguarda o retorno da análise detalhada de coerência.

---

## Gráficos

O frontend utiliza a biblioteca **Recharts** para transformar as análises complexas do modelo de NLP em representações visuais interativas e de fácil compreensão. A seguir, detalham-se os objetivos de informação, funções e objetivos de cada gráfico utilizado na interface:

### 1. Distribuição de Alinhamento (Gráfico de Rosca / Donut Chart)
*   **Localização:** Tela de Perfil Individual do Político (`PerfilPolitico.jsx`).
*   **Função:** Agrupar e quantificar as análises das votações nominais mais recentes do parlamentar por classificação semântica.
*   **Objetivos de Informação:** Apresentar a proporção exata de votos classificados como *Coerente* (verde), *Parcialmente Alinhado* (amarelo), *Divergente* (vermelho) ou *Não Relacionado* (cinza). Permite ao cidadão julgar instantaneamente a estabilidade ideológica e o alinhamento de fala vs. voto do político.

### 2. Histórico de Coerência (Gráfico de Linha / Line Chart)
*   **Localização:** Tela de Perfil do Político (`PerfilPolitico.jsx`) e tela de Visão Geral (`GraficoTendencias.jsx`).
*   **Função:** Mapear a evolução do índice médio de coerência (score) do parlamentar ao longo dos meses ou de sessões cronológicas sucessivas.
*   **Objetivos de Informação:** Revelar tendências temporais de comportamento. Permite analisar se o parlamentar está se tornando mais ou menos fiel aos seus discursos no decorrer de seu mandato (por exemplo, avaliando mudanças de postura na proximidade de períodos eleitorais).

### 3. Comparação de Coerência (Gráfico de Barras / Bar Chart)
*   **Localização:** Tela de Perfil do Político (`PerfilPolitico.jsx`) e Tela de Comparação (`Comparacao.jsx`).
*   **Função:** Colocar em perspectiva comparativa o score de coerência do político selecionado contra a média do seu partido correspondente e a média global de toda a casa legislativa (Senado ou Câmara), ou comparar o score de dois parlamentares de forma direta.
*   **Objetivos de Informação:** Contextualização institucional do parlamentar. Ajuda o eleitor a entender se o parlamentar é um "outlier" (mais ou menos coerente que a média) dentro de sua própria bancada partidária e do Congresso em geral.

### 4. Coerência Média por Partido (Gráfico de Barras / Bar Chart)
*   **Localização:** Tela de Visão Geral (`VisaoGeral.jsx` / `GraficoBarras.jsx`).
*   **Função:** Rankear o score médio de coerência agregando todos os parlamentares pertencentes a cada sigla partidária.
*   **Objetivos de Informação:** Avaliação de fidelidade partidária. Permite comparar a disciplina e consistência programática de diferentes partidos políticos brasileiros frente às pautas legislativas.

### 5. Comparação por Partido (Gráfico de Rosca / Donut Chart)
*   **Localização:** Tela de Visão Geral (`VisaoGeral.jsx` / `GraficoPartidos.jsx`).
*   **Função:** Demonstrar o volume e a representatividade de parlamentares de cada partido político que foram auditados no banco de dados.
*   **Objetivos de Informação:** Transparência amostral. Mostra a distribuição do volume total de dados analisados pelo Dito e Feito, permitindo verificar em quais partidos a cobertura de auditoria do sistema está mais concentrada.

---

## Paleta de Cores e Tipografia (Design Tokens)

O frontend implementa uma identidade baseada em modo escuro, utilizando os seguintes tokens de estilo definidos no arquivo CSS principal:

### Cores Principais
- **Background (bg):** Tons escuros neutros para fundos e seções principais.
- **Surface (surface / surface2):** Fundos cinzas médios e escuros para cards, listas e campos de texto.
- **Teal (teal / teal-bg):** Cor primária de destaque (tons verdes-azulados) usada em links, foco de inputs, badges e botões de ação positiva.
- **Red (red / red-bg) e Green (green / green-bg):** Cores semânticas utilizadas para indicar taxas de coerência baixas (divergências ou incoerências) e taxas altas (coerência ideal), respectivamente.

### Tipografia
- **Família Tipográfica:** Utilização da fonte limpa e legível Inter para corpos de texto e títulos, configurada globalmente nas classes de estilo.
- **Hierarquização:** Estilos bem delimitados para títulos (H1, H2), legendas, badges e textos auxiliares de métricas.

---

## Autores

| Nome | Matrícula | GitHub |
|------|------|------|
| GABRIEL VELHO DE SOUZA | 242015218 | Velho008 |
| SAUHAN FERREIRA MELO | 242024923 | SUDOTMOX |
