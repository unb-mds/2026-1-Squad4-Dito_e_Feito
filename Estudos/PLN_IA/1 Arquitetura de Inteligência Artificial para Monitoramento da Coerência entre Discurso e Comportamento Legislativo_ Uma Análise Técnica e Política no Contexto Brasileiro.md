# Arquitetura de Inteligência Artificial para Monitoramento da Coerência entre Discurso e Comportamento Legislativo: Uma Análise Técnica e Política no Contexto Brasileiro

A transparência pública no Brasil evoluiu de um conceito jurídico abstrato para uma infraestrutura tecnológica complexa, permitindo que a sociedade civil monitore a atividade parlamentar com precisão inédita. No centro desta evolução está a necessidade de confrontar a retórica política com a prática legislativa efetiva. O desenvolvimento de um sistema de monitoramento de coerência entre discurso e votação exige a integração de repositórios de dados heterogêneos, a aplicação de modelos de Processamento de Linguagem Natural (NLP) e uma compreensão profunda das dinâmicas de poder que regem o Congresso Nacional. A discrepância entre o que é dito em plenário ou em justificativas de projetos e o que é registrado nos painéis de votação nominal constitui um dos principais pontos de atrito na representação democrática contemporânea.

## Infraestrutura de Dados e Fontes Governamentais

O alicerce de qualquer ferramenta de monitoramento parlamentar reside na qualidade e na acessibilidade dos dados fornecidos pelas casas legislativas. No Brasil, o Portal de Dados Abertos da Câmara dos Deputados e o portal equivalente do Senado Federal são as fontes primárias. A Câmara disponibiliza sua API v2, que segue a arquitetura REST e fornece dados puros em formatos JSON e XML. Esta interface permite a recuperação de informações detalhadas sobre deputados, proposições, votações e a presença em eventos. O Senado Federal, por sua vez, oferece a API de Dados Abertos Legislativos, que contempla não apenas os registros de votação e processos, mas também a íntegra de pronunciamentos e discursos, um componente vital para a análise semântica.

Para além das APIs oficiais, existem iniciativas de consolidação que facilitam o tratamento de grandes volumes de dados. A Base dos Dados (BD) organiza microdados de proposições, temas e votos parlamentares em tabelas tratadas, permitindo consultas via BigQuery. Essa estrutura reduz a carga cognitiva do desenvolvedor ao padronizar identificadores e tipologias que, nas APIs originais, podem apresentar inconsistências temporais. A cobertura temporal desses dados é vasta, permitindo análises que remontam ao início da República, embora o foco para ferramentas de monitoramento em tempo real se concentre nas legislaturas mais recentes.

### Comparativo de Endpoints e Acesso Técnico

A integração técnica entre as duas casas legislativas exige o mapeamento de endpoints específicos que, embora cumpram funções similares, possuem estruturas de retorno distintas. Enquanto a Câmara agrupa votos individuais em arquivos anuais para download massivo, o Senado permite a consulta granular por parlamentar e matéria de forma mais direta via API.

| Funcionalidade | Endpoint Câmara dos Deputados (v2) | Endpoint Senado Federal (v1/v3) |
|----------------|-------------------------------------|----------------------------------|
| Lista de Parlamentares | `/deputados?ordem=ASC&ordenarPor=nome` | `/senador/lista/atual` |
| Votos Individuais | `/votacoesVotos` | `/votacoesVotos-{ano}/senador/{id}/votacoes` |
| Pronunciamentos | `/deputados/{id}/discursos` | `/senador/{id}/pronunciamentos` |
| Detalhes de Matéria | `/proposicoes/{id}` | `/materia/{id}` |
| Votos por Votação | `/votacoes/{id}/votos` | `/votacao/{codigo}` |

A utilização desses endpoints permite capturar o ciclo completo de uma decisão política: da ementa inicial do projeto à orientação da bancada e, finalmente, ao voto individual depositado pelo parlamentar. A riqueza desses metadados possibilita identificar não apenas o "Sim" ou "Não", mas a ausência estratégica ou a abstenção em temas de alta voltagem política.

### A Dialética entre Raspagem de Dados e APIs de Transparência

Embora as APIs representem o caminho oficial e estruturado para a obtenção de dados, a prática do monitoramento legislativo frequentemente se depara com a necessidade de realizar web scraping (raspagem de rede). Essa necessidade surge quando certas informações, como a transcrição completa de sessões informais ou detalhes de reuniões de comissões específicas, não são disponibilizadas em tempo real ou com a granularidade necessária nas interfaces de dados abertos. Contudo, a raspagem de dados em portais governamentais brasileiros é um terreno marcado por tensões técnicas e regulatórias.

O Senado Federal, através do Projeto de Resolução (PRS 65/2019), estabeleceu restrições ao uso de robôs e sistemas automatizados, particularmente em canais de interação como o portal e-Cidadania, visando proteger a integridade das consultas públicas contra manipulações. Tecnicamente, os portais legislativos podem implementar bloqueios de CORS (Cross-Origin Resource Sharing) ou limitar o número de requisições por IP, o que gera timeouts e erros persistentes em ferramentas de monitoramento que não respeitam os intervalos de coleta. Repositórios no GitHub, como o raspador-discursos-camara, demonstram que a comunidade de desenvolvedores busca contornar essas limitações para extrair discursos de arquivos PDF e páginas HTML quando a API falha em fornecer o conteúdo textual completo.

Legalmente, o tratamento desses dados deve observar a Lei Geral de Proteção de Dados (LGPD) e o Marco Civil da Internet. O Senado Federal enfatiza que a coleta de dados pessoais no âmbito do portal atende à finalidade pública e à persecução do interesse público. Para o desenvolvedor de um painel de monitoramento, isso significa que, enquanto os dados de atividade parlamentar são de natureza pública e livre para reuso, a coleta de dados de usuários e a automação de interações (como votos em enquetes populares) podem sofrer sanções rigorosas. A tendência legislativa aponta para um modelo de "privacidade por padrão", o que reforça a importância de utilizar as APIs oficiais, que já passam por processos de filtragem e anonimização de dados sensíveis antes da exposição pública.

## Processamento de Linguagem Natural Aplicado ao Discurso Político

A análise da coerência parlamentar transcende a simples comparação de tabelas; ela exige a decodificação da semântica presente em milhares de páginas de discursos, notas técnicas e ementas. O Processamento de Linguagem Natural (NLP) fornece as ferramentas para transformar essa massa de texto não estruturado em métricas quantificáveis de posicionamento ideológico e consistência temática.

O estado da arte para o processamento de textos em português do Brasil é o modelo **BERTimbau**, uma implementação do BERT (Bidirectional Encoder Representations from Transformers) pré-treinada em um vasto corpus de textos em português. Modelos baseados em Transformers, como o BERTimbau, superam abordagens tradicionais de frequência de palavras (como o TF-IDF) por serem capazes de capturar o contexto bidirecional de uma frase, o que é fundamental para identificar ironias, negações e nuances típicas do debate político.

### Pipeline de Análise Semântica

A construção de um modelo de comparação entre discurso e voto segue um pipeline rigoroso de engenharia de dados e linguística computacional:

1. **Pré-processamento e Limpeza**: O texto bruto de pronunciamentos ou justificativas de projetos é submetido à tokenização, remoção de stopwords e lematização. Bibliotecas como spaCy são essenciais nesta fase para realizar a análise de dependência e a marcação de partes do discurso (Part-of-Speech tagging), permitindo que o modelo foque em substantivos e verbos que carregam a carga semântica principal.

2. **Vetorização e Embeddings**: O texto limpo é convertido em vetores de alta dimensão (embeddings). Ao utilizar o BERTimbau, cada frase ou parágrafo é mapeado para um espaço vetorial onde a proximidade geométrica indica similaridade semântica. Isso permite que o sistema identifique que um discurso sobre "ajuste fiscal" e uma justificativa de projeto sobre "responsabilidade orçamentária" tratam do mesmo tema, mesmo que não compartilhem as mesmas palavras exatas.

3. **Cálculo de Similaridade e Divergência**: A métrica fundamental utilizada é a **Similaridade de Cosseno**, que mede o cosseno do ângulo entre dois vetores. Um valor próximo a 1 indica alta paridade entre o discurso e a matéria votada, enquanto valores próximos a 0 ou negativos indicam dissonância.

4. **Ajuste Fino (Fine-Tuning)**: Para aumentar a precisão no domínio legislativo, o modelo pode passar por um ajuste fino utilizando datasets como o SQuAD-BR (versão brasileira do Stanford Question Answering Dataset) ou corpora específicos de documentos jurídicos. Técnicas de Parameter-Efficient Fine-Tuning (PEFT), como o LoRA (Low-Rank Adaptation), permitem que esse ajuste seja feito com baixo custo computacional, injetando matrizes de baixo posto no modelo original para adaptá-lo ao jargão parlamentar sem a necessidade de re-treinar bilhões de parâmetros.

## Análise de Coerência: Seleção de 10 Parlamentares de Influência

Para demonstrar a eficácia do monitoramento, selecionamos 10 parlamentares que ocupam posições centrais no Congresso Nacional, classificados como "Cabeças do Congresso" pelo DIAP em virtude de sua capacidade de articulação, formulação e liderança. A análise de coerência para esses perfis deve considerar que parlamentares em posições de presidência ou liderança de governo frequentemente subordinam seus discursos ideológicos ao pragmatismo da gestão da pauta.

| Parlamentar | Casa | Papel de Influência | Foco do Discurso | Comportamento de Voto Esperado |
|-------------|------|---------------------|------------------|--------------------------------|
| Arthur Lira | Câmara | Presidente da Câmara | Gestão da pauta, coalizão | Alinhado à governabilidade e centro |
| Rodrigo Pacheco | Senado | Presidente do Senado | Estabilidade institucional | Mediador, foco constitucional |
| Erika Hilton | Câmara | Liderança de Minoria | Direitos humanos, minorias | Ideológico, alta coerência social |
| Guilherme Boulos | Câmara | Influenciador/Liderança | Habitação, movimentos sociais | Oposição/Governo (depende do tema) |
| Bia Kicis | Câmara | Liderança Conservadora | Costumes, justiça, direita | Coerência com pauta conservadora |
| Tabata Amaral | Câmara | Formuladora Técnica | Educação, dados, economia | Voto técnico, baseado em evidências |
| Marcel van Hattem | Câmara | Liderança Liberal | Fiscalismo, livre mercado | Rigor fiscal, oposição ao executivo |
| Flávio Bolsonaro | Senado | Articulador de Oposição | Segurança, pauta familiar | Alinhamento com o bolsonarismo |
| Randolfe Rodrigues | Senado | Líder do Governo | Articulação governista | Alta fidelidade às pautas do Executivo |
| Tereza Cristina | Senado | Liderança Setorial | Agronegócio, infraestrutura | Defesa de interesses do agronegócio |

O monitoramento de Arthur Lira e Rodrigo Pacheco apresenta um desafio único: como presidentes das casas, seus discursos costumam ser institucionais, mas suas votações (quando ocorrem) e as orientações de pauta que definem revelam a coerência real com seus blocos de apoio. Já parlamentares como Marcel van Hattem e Erika Hilton tendem a apresentar uma coerência semântica muito alta entre o que proferem em tribuna e como votam, uma vez que suas bases eleitorais exigem fidelidade doutrinária explícita.

## Métricas de Divergência e Mudança de Posicionamento

O sistema de monitoramento deve detectar dois fenômenos principais: a **divergência pontual** (contradição imediata) e a **deriva semântica** (mudança ao longo do tempo). A divergência pontual ocorre, por exemplo, quando um parlamentar justifica um projeto defendendo a "redução da carga tributária" (ementa), mas vota favoravelmente a um destaque que aumenta impostos em um setor específico.

A análise de séries temporais de embeddings permite visualizar a mudança de posicionamento. Ao plotar os vetores de discursos de um senador ao longo de quatro anos, o sistema pode identificar o exato momento em que o vocabulário e a tônica ideológica mudam, correlacionando essa mudança com eventos externos como a troca de ministérios ou a aproximação com novas coligações. Estudos indicam que word embeddings são eficazes para capturar conceitos latentes de ideologia, permitindo posicionar parlamentares em um espectro esquerda-direita de forma automática e independente de rótulos partidários, que muitas vezes são fluidos no Brasil.

A fórmula para o **Escore de Coerência (EC)** pode ser modelada considerando a similaridade semântica (Sim) entre o conjunto de discursos (D) e o conjunto de votos (V) ponderada pela importância da matéria (W):

$$EC = \frac{\sum_{i=1}^{n} W_i \cdot Sim(D_i, V_i)}{\sum_{i=1}^{n} W_i}$$

Onde $W_i$ representa o peso da votação (votações de emendas constitucionais possuem peso maior do que moções de aplauso). Se o parlamentar não discursou sobre uma matéria específica, o sistema busca a ementa do projeto original ou a orientação de sua liderança de partido como proxy para a intenção de voto.

## Desenvolvimento do Painel de Monitoramento: Arquitetura e IA

A implementação prática do painel requer um ambiente Python robusto. A escolha de bibliotecas como pandas para manipulação de dados, scikit-learn para métricas de similaridade e Hugging Face Transformers para o carregamento do BERTimbau forma o núcleo técnico do projeto.

### Estrutura do Backend e Processamento

O backend deve ser capaz de realizar tarefas agendadas de ingestão de dados. Devido à natureza instável de alguns endpoints da Câmara, é recomendável a implementação de uma camada de persistência em banco de dados SQL (para dados estruturados de votos) e NoSQL (para a grande massa de textos de discursos).

- **Ingestão**: Scripts que consultam os endpoints `/votacoesVotos` e `/senador/{id}/pronunciamentos` diariamente.
- **Processamento de NLP**: Utilização de instâncias de GPU para rodar o modelo BERTimbau-Large. O uso de quantização (como o QLoRA) pode reduzir drasticamente o consumo de memória, permitindo que o modelo rode em hardware mais acessível sem perda significativa de precisão.
- **API do Painel**: Uma interface FastAPI que serve os escores de coerência calculados para o frontend.

O frontend deve apresentar visualizações como o "Gráfico de Dispersão Léxica", que mostra a evolução dos temas abordados por um parlamentar, e o "Mapa de Calor de Coerência", que destaca as matérias onde houve maior dissonância entre o discurso e o voto. A utilização de técnicas de Topic Modeling (LDA) permite que o painel categorize automaticamente as votações em grandes eixos (Economia, Direitos Humanos, Saúde), facilitando a navegação do usuário final.

## Desafios de Precisão e o Problema da Ambiguidade Política

Um dos maiores desafios para a IA aplicada ao monitoramento político é a **ambiguidade deliberada**. Parlamentares frequentemente utilizam discursos vagos para manter margem de manobra em negociações de bastidores. O modelo de NLP deve ser capaz de distinguir entre um discurso de apoio genérico e uma justificativa técnica detalhada. O uso de modelos encoder-decoder como o T5 ou o BART-PT pode ser empregado para gerar resumos abstratos de pronunciamentos longos, extraindo apenas os pontos de decisão (voto pretendido) para comparação com o voto real.

Além disso, a análise de sentimentos desempenha um papel crucial. Um parlamentar pode proferir um discurso com palavras-chave similares a um projeto, mas com uma polaridade negativa (criticando a forma como o projeto foi redigido). Modelos treinados em corpora de português brasileiro, como o BERTimbau, demonstram superioridade em capturar essa polaridade em relação a modelos genéricos ou traduzidos. A precisão relatada para esses modelos em tarefas de classificação de emoções chega a 0.87, o que confere alta confiabilidade estatística aos resultados do painel.

## O Futuro do Monitoramento Legislativo Digital

A convergência entre dados abertos e inteligência artificial está criando um novo paradigma de fiscalização cidadã. A capacidade de processar, em segundos, o que um parlamentar disse ao longo de uma década e confrontar com cada voto nominal desestimula o comportamento oportunista e a "falsa retórica". À medida que modelos mais eficientes (Green AI) se tornam disponíveis, o custo de manter tais sistemas de monitoramento diminui, permitindo que organizações da sociedade civil de pequeno porte possam implementar suas próprias ferramentas de análise.

O portal LexML e as iniciativas de integração de dados do Senado e da Câmara são fundamentais para garantir que a IA tenha acesso a uma base de conhecimento jurídico sólida, evitando interpretações errôneas de termos técnicos que possuem significados específicos no direito parlamentar. O monitoramento da coerência, portanto, não é apenas um desafio de programação, mas uma tarefa multidisciplinar que exige o rigor da ciência de dados aliado à sensibilidade da análise política.

A implementação deste projeto com foco em lideranças como Arthur Lira, Tabata Amaral ou Guilherme Boulos oferece um espelho da complexidade do poder no Brasil. Se a tecnologia for capaz de traduzir essa complexidade em dados claros e acessíveis, o fosso entre o representante e o representado poderá ser reduzido, fortalecendo a confiança nas instituições democráticas por meio da transparência radical e da inteligência aplicada.
