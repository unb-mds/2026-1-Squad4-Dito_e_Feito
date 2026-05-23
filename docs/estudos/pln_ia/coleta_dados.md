# Especificação da Camada de Coleta e Ingestão de Dados

## 1. Justificativa de Transição Tecnológica

O planejamento inicial deste projeto previa o consumo exclusivo das APIs de Dados Abertos da Câmara dos Deputados (v2) e do Senado Federal (v1/v3). Entretanto, durante a fase de prototipagem e testes de integração, identificou-se que, embora os endpoints estejam operacionais e retornem metadados (IDs, datas e nomes), os campos destinados ao conteúdo textual (transcrições e íntegras de discursos) apresentam lacunas críticas de persistência.

### 1.1. Limitações Observadas nas APIs Oficiais

- **Latência de Indexação**: Existe um hiato temporal significativo entre a ocorrência do evento legislativo e a disponibilidade da transcrição textual nos campos `transcricao` (Câmara) e `TextoIntegral` (Senado).

- **Campos Nulos**: Verificou-se que, em aproximadamente 70% das requisições para discursos recentes, a API retorna o registro do evento, mas o conteúdo semântico necessário para o processamento de linguagem natural (NLP) permanece vazio ou aponta para links externos não estruturados.

- **Inconsistência de Formatos**: A entrega de documentos em formatos binários ou legados (PDF e RTF) por meio da API dificulta a automação de pipelines de dados em tempo real.

## 2. Implementação de Estratégia Híbrida (Web Scraping)

Dada a necessidade de alta fidelidade e disponibilidade dos dados para a análise de coerência parlamentar, a arquitetura foi reestruturada para priorizar o **Web Scraping** como método de extração primária do corpo textual.

### 2.1. Arquitetura do Coletor

O módulo de coleta opera em duas camadas de redundância:

| Camada | Função |
|--------|--------|
| **Camada de Identificação** | Utiliza a API oficial apenas para o mapeamento de IDs e descoberta de novos eventos legislativos |
| **Camada de Extração (Scraper)** | Realiza requisições diretas aos portais institucionais (Páginas de Perfil e Notas Taquigráficas), onde o conteúdo é disponibilizado para visualização humana antes da integração nos bancos de dados de desenvolvedores |

### 2.2. Fluxo de Processamento de Dados

O fluxo de ingestão de dados foi definido conforme as etapas abaixo:

1. **Requisição HTTP**: O sistema emula um agente de navegação para contornar restrições de acesso a scripts automatizados.

2. **Parsing de DOM**: Utilização de bibliotecas de análise de árvores HTML para localizar seletores específicos (ex: `div.texto-integral` no Senado e `div.secao-transcricao` na Câmara).

3. **Tratamento de Dados Não Estruturados**: Limpeza de ruídos textuais (interrupções da mesa, apartes e notas de rodapé) para isolar exclusivamente o discurso do parlamentar alvo.

## 3. Implicações para o Processamento de Linguagem Natural

A adoção do Web Scraping garante o volume de dados necessário para o ajuste fino (*fine-tuning*) dos modelos de linguagem. Sem a integridade textual garantida por este método, o cálculo de **Similaridade de Cosseno** entre o discurso (retórica) e a ementa da matéria (comportamento) seria inviabilizado por ausência de variáveis de entrada.

## 4. Considerações Éticas e Legais

A extração via scraping observa os princípios da **Lei de Acesso à Informação (Lei nº 12.527/2011)**. O sistema foi configurado com intervalos de requisição (política de *polite*) para evitar a sobrecarga dos servidores públicos, garantindo que a coleta de dados de interesse social ocorra sem prejuízo à infraestrutura governamental.



> **Resumo**: A estratégia híbrida combina APIs oficiais para identificação de eventos e Web Scraping para extração de conteúdo textual, garantindo a disponibilidade dos dados necessários para a análise de coerência parlamentar.